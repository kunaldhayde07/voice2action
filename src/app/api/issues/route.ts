import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import IssueModel from "@/lib/models/Issue";
import { categorizeIssue } from "@/lib/categorizer";
import { checkDuplicate } from "@/lib/similarity";
import { calculatePriorityScore } from "@/lib/priorityEngine";
import { broadcast } from "@/lib/websocket";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "priority";
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = {
      // only return documents that have a valid location
      "location.lat": { $exists: true, $ne: null },
      "location.lng": { $exists: true, $ne: null },
    };

    if (category && category !== "all") query.category = category;
    if (status && status !== "all") query.status = status;
    if (search && search.trim()) query.$text = { $search: search };

    const sortMap: Record<string, Record<string, number>> = {
      priority: { priorityScore: -1 },
      votes: { voteCount: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };

    const sort = sortMap[sortBy] || sortMap.priority;
    const skip = (page - 1) * limit;

    const [issues, total] = await Promise.all([
      IssueModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      IssueModel.countDocuments(query),
    ]);

    // sanitize each issue so location is always a valid object
    const sanitized = issues.map((issue) => ({
      ...issue,
      location: {
        lat: issue.location?.lat ?? 0,
        lng: issue.location?.lng ?? 0,
        address: issue.location?.address ?? "",
      },
      images: issue.images ?? [],
      voteCount: issue.voteCount ?? 0,
      priorityScore: issue.priorityScore ?? 0,
    }));

    return NextResponse.json({
      issues: sanitized,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[GET /api/issues]", err);
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      title,
      description,
      category: providedCategory,
      location,
      reporterName,
      reporterEmail,
      images = [],
      skipDuplicateCheck = false,
    } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    if (title.trim().length < 10) {
      return NextResponse.json({ error: "Title must be at least 10 characters" }, { status: 400 });
    }

    if (!location?.lat || !location?.lng) {
      return NextResponse.json({ error: "Valid location is required" }, { status: 400 });
    }

    if (!reporterName?.trim()) {
      return NextResponse.json({ error: "Reporter name is required" }, { status: 400 });
    }

    const category = providedCategory || categorizeIssue(title, description);

    if (!skipDuplicateCheck) {
      const nearbyIssues = await IssueModel.find({
        "location.lat": { $gte: location.lat - 0.01, $lte: location.lat + 0.01 },
        "location.lng": { $gte: location.lng - 0.01, $lte: location.lng + 0.01 },
        status: { $ne: "resolved" },
      })
        .select("_id title description location")
        .lean();

      const duplicateCheck = checkDuplicate(
        title,
        description,
        location.lat,
        location.lng,
        nearbyIssues as any
      );

      if (duplicateCheck.isDuplicate) {
        return NextResponse.json(
          {
            error: "Similar issue already exists nearby",
            isDuplicate: true,
            matchedIssueId: duplicateCheck.matchedIssueId,
            similarity: duplicateCheck.similarity,
          },
          { status: 409 }
        );
      }
    }

    const priorityScore = calculatePriorityScore(0, new Date(), "pending", category);

    const issue = new IssueModel({
      title: title.trim(),
      description: description.trim(),
      category,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address ?? "",
      },
      reporterName: reporterName.trim(),
      reporterEmail: reporterEmail?.trim() || undefined,
      images: images.slice(0, 3),
      priorityScore,
    });

    await issue.save();

    broadcast({
      type: "new_issue",
      issue: issue.toJSON() as any,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(issue.toJSON(), { status: 201 });
  } catch (err) {
    console.error("[POST /api/issues]", err);
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
  }
}
