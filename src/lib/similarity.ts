function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 2);
}

function buildTermFreq(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  return freq;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, magA = 0, magB = 0;
  for (const [term, freqA] of a) {
    magA += freqA * freqA;
    dot += freqA * (b.get(term) || 0);
  }
  for (const [, freqB] of b) magB += freqB * freqB;
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function isNearby(lat1: number, lng1: number, lat2: number, lng2: number): boolean {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a)) < 500;
}

export interface SimilarityResult {
  isDuplicate: boolean;
  similarity: number;
  matchedIssueId?: string;
}

export function checkDuplicate(
  newTitle: string,
  newDescription: string,
  newLat: number,
  newLng: number,
  existingIssues: Array<{ _id: string; title: string; description: string; location: { lat: number; lng: number } }>
): SimilarityResult {
  const newFreq = buildTermFreq(tokenize(`${newTitle} ${newDescription}`));
  let highestSim = 0;
  let matchedId: string | undefined;
  for (const issue of existingIssues) {
    if (!isNearby(newLat, newLng, issue.location.lat, issue.location.lng)) continue;
    const sim = cosineSimilarity(newFreq, buildTermFreq(tokenize(`${issue.title} ${issue.description}`)));
    if (sim > highestSim) { highestSim = sim; matchedId = issue._id; }
  }
  return { isDuplicate: highestSim > 0.65, similarity: highestSim, matchedIssueId: highestSim > 0.65 ? matchedId : undefined };
}
