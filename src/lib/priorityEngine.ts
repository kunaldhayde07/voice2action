const STATUS_WEIGHTS: Record<string, number> = {
  pending: 1.0,
  in_progress: 0.5,
  resolved: 0.1,
};

const CATEGORY_URGENCY: Record<string, number> = {
  safety: 1.5,
  water: 1.3,
  electricity: 1.2,
  road: 1.1,
  garbage: 1.0,
  noise: 0.9,
  parks: 0.8,
  other: 0.7,
};

export function calculatePriorityScore(
  voteCount: number,
  createdAt: Date,
  status: string,
  category: string
): number {
  const now = Date.now();
  const ageInHours = (now - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const voteScore = Math.log1p(voteCount) * 10;
  const recencyScore = Math.max(0, 30 - ageInHours / 24) * 2;
  const urgencyMultiplier = CATEGORY_URGENCY[category] || 1.0;
  const statusWeight = STATUS_WEIGHTS[status] || 1.0;
  const rawScore = (voteScore + recencyScore) * urgencyMultiplier * statusWeight;
  return Math.round(rawScore * 100) / 100;
}
