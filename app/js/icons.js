// VICE ATLAS — icons.js: every glyph in the guide is drawn here in code
// (inline SVG). No image files, no network: the art is source, so the
// dossier's outline shows it and the app stays offline and tiny.

export const KIND_COLORS = {
  story: "#ff5a3c",
  side: "#2bb3a3",
  activity: "#e8a93d",
  collectible: "#7c6bd9",
  combat: "#c0392b",
  crime: "#34495e",
  money: "#2e7d32",
  misc: "#d63384",
  completion: "#a67c00",
};

// White glyphs on a 48x48 tile, one per trophy kind. Each is a few
// geometric shapes — a book for story, a star for side strands, a bolt
// for activities, a gem for collectibles, a crosshair for combat, a
// badge star for crime, a coin for money, a "?" for secrets, a cup
// for completion.
const GLYPHS = {
  story:
    '<rect x="10" y="9" width="28" height="30" rx="3" fill="none" stroke="#fff" stroke-width="3"/>' +
    '<path d="M24 9v30M14 17h6M14 23h6M28 17h6M28 23h6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>',
  side:
    '<circle cx="24" cy="24" r="15" fill="none" stroke="#fff" stroke-width="3"/>' +
    '<path d="M24 15l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="#fff"/>',
  activity:
    '<path d="M27 6L13 27h8l-3 15 15-21h-9l5-15z" fill="#fff"/>',
  collectible:
    '<path d="M24 7l11 9-11 25L13 16z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M13 16h22M24 7l-5 9 5 25 5-25z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>',
  combat:
    '<circle cx="24" cy="24" r="12" fill="none" stroke="#fff" stroke-width="3"/>' +
    '<circle cx="24" cy="24" r="4" fill="#fff"/>' +
    '<path d="M24 4v8M24 36v8M4 24h8M36 24h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
  crime:
    '<path d="M24 7l3.4 6.6 7.3 1-5.3 5.2 1.3 7.2-6.7-3.5-6.7 3.5 1.3-7.2-5.3-5.2 7.3-1z" fill="#fff"/>' +
    '<circle cx="24" cy="38" r="3.4" fill="#fff"/>',
  money:
    '<circle cx="24" cy="24" r="16" fill="none" stroke="#fff" stroke-width="3"/>' +
    '<path d="M24 14v20M28.5 19.5c-.8-2-2.6-3-4.5-3-2.6 0-4.5 1.5-4.5 3.7 0 5.4 9 2.6 9 8 0 2.2-1.9 3.8-4.5 3.8-2.2 0-4-1.2-4.7-3.2" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
  misc:
    '<circle cx="24" cy="24" r="16" fill="none" stroke="#fff" stroke-width="3"/>' +
    '<path d="M20 19.5c0-3 2-4.5 4-4.5 2.5 0 4 1.7 4 3.8 0 2.9-4 3.4-4 6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="24" cy="32.5" r="2.2" fill="#fff"/>',
  completion:
    '<path d="M14 8h20v7a10 10 0 0 1-20 0z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M14 11H9v2a5 5 0 0 0 5 5M34 11h5v2a5 5 0 0 1-5 5M24 25v7M17 36h14M21 32h6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
};

// A 46px kind tile: rounded square in the kind's colour, white glyph.
export function kindGlyph(kind) {
  const color = KIND_COLORS[kind] || "#5b6b82";
  const glyph = GLYPHS[kind] || GLYPHS.misc;
  return (
    '<svg viewBox="0 0 48 48" role="img" aria-label="' + kind + ' icon">' +
    '<rect x="1" y="1" width="46" height="46" rx="11" fill="' + color + '"/>' +
    glyph +
    "</svg>"
  );
}

// Grade medallion: a radial-gradient disc with the grade's initial.
// Platinum shines palest, bronze darkest — the disc reads at a glance
// even when the contact sheet shrinks it.
const GRADE_FILL = {
  platinum: ["#f4f8fc", "#b9c6d4", "P"],
  gold: ["#fbeec2", "#d9a93f", "G"],
  silver: ["#f2f4f6", "#9aa5af", "S"],
  bronze: ["#f3d9bd", "#b0703a", "B"],
};

export function gradeDisc(grade) {
  const [light, dark, letter] = GRADE_FILL[grade] || GRADE_FILL.bronze;
  const id = "g-" + grade;
  return (
    '<svg viewBox="0 0 48 48" role="img" aria-label="' + grade + ' trophy">' +
    "<defs><radialGradient id=\"" + id + '" cx="38%" cy="32%" r="75%">' +
    '<stop offset="0%" stop-color="' + light + '"/>' +
    '<stop offset="100%" stop-color="' + dark + '"/>' +
    "</radialGradient></defs>" +
    '<circle cx="24" cy="24" r="21" fill="url(#' + id + ')" stroke="#8a8f98" stroke-opacity="0.45"/>' +
    '<circle cx="24" cy="24" r="15.5" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="1.4"/>' +
    '<text x="24" y="30.5" text-anchor="middle" font-family="Georgia, serif" font-size="19" font-weight="bold" fill="#2b2f36">' +
    letter +
    "</text></svg>"
  );
}

// Overall-progress ring: a track circle plus a coral arc sized by pct,
// with the percentage in the middle. Pure SVG, no library.
export function progressRing(pct, size) {
  const s = size || 120;
  const r = 46;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, pct)) * c;
  return (
    '<svg viewBox="0 0 120 120" width="' + s + '" height="' + s + '" role="img" aria-label="' +
    Math.round(pct * 100) + '% complete">' +
    '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="#2a3854" stroke-width="11"/>' +
    '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="#ff5a3c" stroke-width="11" stroke-linecap="round" ' +
    'stroke-dasharray="' + filled.toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 60 60)"/>' +
    '<text x="60" y="57" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#fff">' +
    Math.round(pct * 100) + "%</text>" +
    '<text x="60" y="76" text-anchor="middle" font-family="inherit" font-size="10.5" letter-spacing="2" fill="#9fb0c8">COMPLETE</text>' +
    "</svg>"
  );
}

// The header's brand mark: a compass rose — the atlas, drawn in code.
export function brandMark() {
  return (
    '<svg viewBox="0 0 56 56" role="img" aria-label="Vice Atlas compass rose">' +
    '<circle cx="28" cy="28" r="26" fill="none" stroke="#e8a93d" stroke-width="2"/>' +
    '<circle cx="28" cy="28" r="20.5" fill="none" stroke="#e8a93d" stroke-opacity="0.4" stroke-width="1"/>' +
    '<path d="M28 8l4.5 15.5L48 28 32.5 32.5 28 48 23.5 32.5 8 28l15.5-4.5z" fill="#ff5a3c"/>' +
    '<path d="M28 15l2.2 10.8L41 28l-10.8 2.2L28 41l-2.2-10.8L15 28l10.8-2.2z" fill="#f8f4ec"/>' +
    '<circle cx="28" cy="28" r="3" fill="#0e1524"/>' +
    "</svg>"
  );
}
