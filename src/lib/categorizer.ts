import { IssueCategory } from "@/types";

const categoryKeywords: Record<IssueCategory, string[]> = {
  road: ["pothole", "road", "street", "pavement", "crack", "asphalt", "traffic", "signal", "sidewalk", "bridge", "manhole", "drainage", "construction"],
  water: ["water", "pipe", "leak", "flood", "sewage", "sewer", "drain", "tap", "supply", "contamination", "overflow", "waterlogging"],
  electricity: ["electricity", "power", "light", "streetlight", "blackout", "outage", "wire", "cable", "transformer", "electric", "voltage", "spark"],
  garbage: ["garbage", "trash", "waste", "litter", "dump", "rubbish", "bin", "smell", "stink", "dirty", "collection", "overflowing"],
  safety: ["safety", "crime", "theft", "robbery", "assault", "dangerous", "unsafe", "accident", "cctv", "police", "security", "violence"],
  parks: ["park", "garden", "playground", "tree", "grass", "bench", "recreation", "greenery", "plants", "maintenance", "mowing"],
  noise: ["noise", "loud", "sound", "music", "horn", "barking", "disturbance", "nuisance", "blaring", "party", "speaker"],
  other: [],
};

export function categorizeIssue(title: string, description: string): IssueCategory {
  const text = `${title} ${description}`.toLowerCase();
  const scores: Record<IssueCategory, number> = {
    road: 0, water: 0, electricity: 0, garbage: 0,
    safety: 0, parks: 0, noise: 0, other: 0,
  };
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[category as IssueCategory] += keyword.split(" ").length;
      }
    }
  }
  const top = (Object.entries(scores) as [IssueCategory, number][])
    .filter(([cat]) => cat !== "other")
    .reduce((best, cur) => (cur[1] > best[1] ? cur : best), ["other", 0] as [IssueCategory, number]);
  return top[1] > 0 ? top[0] : "other";
}
