// VICE ATLAS — trophies.js: loads the guide's data (two JSON files under
// app/data, fetched from the app's own server — no network) and the
// small helpers every view uses: labels, PSN points, counts per grade.

export const TOTAL_TROPHIES = 55;

// PSN points: platinum 180, gold 90, silver 30, bronze 15. The full
// list is worth 1,230 points.
export const GRADE_POINTS = { platinum: 180, gold: 90, silver: 30, bronze: 15 };

export const KIND_LABELS = {
  story: "Story",
  side: "Side strands",
  activity: "Activities",
  collectible: "Collectibles",
  combat: "Combat",
  crime: "Crime",
  money: "Money",
  misc: "Secrets & oddities",
  completion: "Completion",
};

export const GRADE_LABELS = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

export const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];

export async function loadData() {
  const [trophiesRes, roadmapRes] = await Promise.all([
    fetch("data/trophies.json"),
    fetch("data/roadmap.json"),
  ]);
  if (!trophiesRes.ok) throw new Error("trophies.json failed to load");
  if (!roadmapRes.ok) throw new Error("roadmap.json failed to load");
  const trophiesDoc = await trophiesRes.json();
  const roadmapDoc = await roadmapRes.json();
  const trophies = Array.isArray(trophiesDoc) ? trophiesDoc : trophiesDoc.trophies;
  return { trophies, roadmap: roadmapDoc };
}

export function pointsFor(trophies, earned) {
  let points = 0;
  for (const t of trophies) {
    if (earned.has(t.id)) points += GRADE_POINTS[t.grade] || 0;
  }
  return points;
}

export function countByGrade(trophies, earned) {
  const out = {};
  for (const g of GRADE_ORDER) {
    const all = trophies.filter((t) => t.grade === g);
    out[g] = { total: all.length, earned: all.filter((t) => earned.has(t.id)).length };
  }
  return out;
}

// A trophy is spoiler-masked when the spoiler setting is on, the
// trophy is a story trophy, and it is not earned yet. Hidden non-story
// trophies keep their names (their descriptions give nothing away);
// story names are the spoilers.
export function isMasked(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.kind === "story" && !earned.has(trophy.id);
}

export function trophiesInStage(trophies, stage) {
  return trophies.filter((t) => t.stage === stage);
}

export function missableTrophies(trophies) {
  return trophies.filter((t) => t.missable);
}
