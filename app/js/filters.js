// VICE ATLAS — filters.js: the checklist's filters. Search, kind, grade,
// missable-watch-only and hide-earned combine; a masked story trophy
// never leaks through text search (its name is hidden until earned).

import { isMasked } from "./trophies.js";

export function defaultFilters() {
  return { query: "", kind: "", grade: "", missableOnly: false, hideEarned: false };
}

export function applyFilters(trophies, filters, spoilerOn, earned) {
  const q = filters.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.kind && t.kind !== filters.kind) return false;
    if (filters.grade && t.grade !== filters.grade) return false;
    if (filters.missableOnly && !t.missable) return false;
    if (filters.hideEarned && earned.has(t.id)) return false;
    if (q) {
      // Masked trophies match on kind and grade only — their names and
      // descriptions stay hidden while the spoiler setting is on.
      const haystack = isMasked(t, spoilerOn, earned)
        ? (t.kind + " " + t.grade).toLowerCase()
        : (t.name + " " + t.description + " " + t.guide + " " + t.kind + " " + t.grade).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
