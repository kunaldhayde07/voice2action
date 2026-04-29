import mongoose, { Schema, Document, Model } from "mongoose";
import { IssueStatus, IssueCategory } from "@/types";

export interface IssueDoc extends Document {
  title: string;
  description: string;
  category: IssueCategory;
  location: { lat: number; lng: number; address?: string };
  status: IssueStatus;
  voteCount: number;
  priorityScore: number;
  reporterName: string;
  reporterEmail?: string;
  images: string[];
  resolvedImage?: string;
  resolvedNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IssueDoc>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, enum: ["road","water","electricity","garbage","safety","parks","noise","other"], required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: "" },
    },
    status: { type: String, enum: ["pending","in_progress","resolved"], default: "pending" },
    voteCount: { type: Number, default: 0, min: 0 },
    priorityScore: { type: Number, default: 0 },
    reporterName: { type: String, required: true, trim: true, maxlength: 100 },
    reporterEmail: { type: String, trim: true, lowercase: true },
    images: { type: [String], default: [] },
    resolvedImage: { type: String, default: null },
    resolvedNote: { type: String, maxlength: 500 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

IssueSchema.index({ title: "text", description: "text" });
IssueSchema.index({ priorityScore: -1 });
IssueSchema.index({ status: 1 });
IssueSchema.index({ category: 1 });

const IssueModel: Model<IssueDoc> =
  mongoose.models.Issue || mongoose.model<IssueDoc>("Issue", IssueSchema);

export default IssueModel;
