// VICE ATLAS — store.js: progress lives in this browser only. Saved
// progress (localStorage), export to a file, import back, and the
// spoiler setting (default ON). No network, no account, no cookie.

const PROGRESS_KEY = "vice-atlas-progress-v2";
const SPOILER_KEY = "vice-atlas-spoiler-v2";

// Progress is a Set of earned trophy ids, stored as a sorted JSON array.
export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids)) return new Set();
    return new Set(ids.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Storage full or unavailable: the checklist still works in memory.
  }
}

export function toggleEarned(earned, id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveProgress(earned);
  return earned;
}

// Export: a small JSON file the reader keeps. Import reads the same
// shape back and replaces progress only when the file parses and holds
// an array of trophy ids.
export function exportProgress(earned) {
  const payload = {
    app: "VICE ATLAS — GTA VI Trophy Guide & Tracker",
    version: 2,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vice-atlas-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImport(text) {
  const data = JSON.parse(text);
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) throw new Error("not a progress file");
  const clean = ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
  if (clean.length === 0 && ids.length > 0) throw new Error("no trophy ids");
  return new Set(clean);
}

// Spoiler setting: ON by default — story trophies stay masked until
// earned. The toggle is in the header and persists across visits.
export function loadSpoiler() {
  try {
    const raw = localStorage.getItem(SPOILER_KEY);
    return raw === null ? true : raw === "1";
  } catch {
    return true;
  }
}

export function saveSpoiler(on) {
  try {
    localStorage.setItem(SPOILER_KEY, on ? "1" : "0");
  } catch {
    // Ignore: the toggle still works for this visit.
  }
}
