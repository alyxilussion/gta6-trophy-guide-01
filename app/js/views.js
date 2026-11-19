// VICE ATLAS — views.js: the five views. Checklist (rows with kind
// icons, grade medallions, guides and sources), Roadmap (7 stages,
// every trophy assigned), Missables (the watch list), 100% Completion
// (the ten counted categories) and Sources & method (the source matrix
// and how every derived fact was derived).

import { kindGlyph, gradeDisc } from "./icons.js";
import { isMasked, missableTrophies, trophiesInStage, KIND_LABELS, GRADE_LABELS } from "./trophies.js";

export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gradeDotColor(grade) {
  return { platinum: "#d9e2ec", gold: "#e8a93d", silver: "#aeb6bf", bronze: "#c98b5e" }[grade] || "#aeb6bf";
}

function badgesFor(t) {
  const out = [];
  out.push('<span class="badge badge-kind">' + esc(KIND_LABELS[t.kind] || t.kind) + "</span>");
  out.push('<span class="badge badge-grade-' + t.grade + '">' + esc(GRADE_LABELS[t.grade] || t.grade) + "</span>");
  if (t.hidden) out.push('<span class="badge badge-hidden">Hidden on PSN</span>');
  if (t.missable) out.push('<span class="badge badge-missable">⚠ Missable watch</span>');
  if (t.countLabel) out.push('<span class="badge badge-count">PSN target: ' + esc(t.countLabel) + "</span>");
  out.push('<span class="badge badge-stage">Roadmap stage ' + t.stage + "</span>");
  return out.join("");
}

function guidePane(t) {
  const sources = t.sources.map((s) => "<li>" + esc(s) + "</li>").join("");
  return (
    '<div class="guide-pane" id="guide-' + t.id + '">' +
    "<p>" + esc(t.guide) + "</p>" +
    '<div class="guide-sources"><strong>Sources:</strong><ul>' + sources + "</ul></div>" +
    "</div>"
  );
}

// One checklist row. Masked story trophies show blurred names and no
// guide until earned — the guide would name the mission.
export function trophyRow(t, state) {
  const earned = state.earned.has(t.id);
  const masked = isMasked(t, state.spoilerOn, state.earned);
  const open = state.openGuides.has(t.id);
  const classes = ["trophy-row"];
  if (earned) classes.push("earned");
  if (masked) classes.push("masked");
  let body = "";
  body += '<div class="kind-icon">' + kindGlyph(t.kind) + "</div>";
  body += '<div class="trophy-main">';
  body += '<div class="trophy-head"><h3 class="trophy-name">' + esc(t.name) + "</h3></div>";
  body += '<p class="trophy-desc">' + esc(t.description) + "</p>";
  if (masked) {
    body += '<p class="spoiler-note">Hidden story trophy — earn it to reveal its name and guide.</p>';
  }
  body += '<div class="trophy-meta">' + badgesFor(t) + "</div>";
  if (!masked) {
    body += '<button type="button" class="guide-toggle" data-guide="' + t.id + '" aria-expanded="' + open + '">' +
      (open ? "Hide guide ▲" : "Read the guide ▼") + "</button>";
    if (open) body += guidePane(t);
  }
  body += "</div>";
  body += '<div class="trophy-side"><div class="grade-disc">' + gradeDisc(t.grade) + "</div>" +
    '<button type="button" class="earn-toggle" data-earn="' + t.id + '" aria-pressed="' + earned + '">' +
    '<span class="tick">' + (earned ? "✓" : "") + "</span>" + (earned ? "Earned" : "Mark earned") + "</button></div>";
  return '<li class="' + classes.join(" ") + '" id="trophy-' + t.id + '">' + body + "</li>";
}

export function renderChecklist(container, list, state) {
  if (list.length === 0) {
    container.innerHTML = '<p class="empty-note">No trophies match these filters. Clear the search or widen the filters.</p>';
    return;
  }
  container.innerHTML =
    '<ul class="trophy-list">' + list.map((t) => trophyRow(t, state)).join("") + "</ul>";
}

// Roadmap: one card per stage — its trophies as chips, its progress,
// its hours and its tip. Every trophy appears in exactly one stage.
// Story trophies stay masked here too while the spoiler setting is on:
// a chip that named them would spoil the checklist's masking.
export function renderRoadmap(container, trophies, roadmap, earned, spoilerOn) {
  const cards = roadmap.stages.map((stage) => {
    const members = trophiesInStage(trophies, stage.stage);
    const done = members.filter((t) => earned.has(t.id)).length;
    const pct = members.length ? Math.round((done / members.length) * 100) : 0;
    const chips = members
      .map((t) => {
        const isDone = earned.has(t.id);
        const masked = isMasked(t, spoilerOn, earned);
        const label = masked ? "Hidden story trophy" : esc(t.name);
        return (
          '<button type="button" class="stage-chip' + (isDone ? " done" : "") + '" data-jump="' + t.id + '">' +
          '<span class="dot" style="background:' + gradeDotColor(t.grade) + '"></span>' +
          label + "</button>"
        );
      })
      .join("");
    return (
      '<article class="stage-card">' +
      '<div class="stage-top"><span class="stage-num">STAGE ' + stage.stage + "</span><h3>" + esc(stage.name) + "</h3>" +
      '<span class="stage-hours">' + esc(stage.hours) + "</span></div>" +
      '<p class="stage-tagline">' + esc(stage.tagline) + "</p>" +
      '<p class="stage-tip">Tip: ' + esc(stage.tip) + "</p>" +
      '<div class="stage-progress"><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="bar-count">' + done + " / " + members.length + "</span></div>" +
      '<div class="stage-trophies">' + chips + "</div>" +
      "</article>"
    );
  }).join("");
  container.innerHTML =
    '<div class="section-head"><h2>' + esc(roadmap.title) + "</h2><p>" + esc(roadmap.note) + "</p></div>" +
    '<div class="stage-list">' + cards + "</div>";
}

// Missables: the watch list, with the honest statement up front —
// nothing is confirmed missable from the official descriptions alone.
export function renderMissables(container, trophies, earned) {
  const watch = missableTrophies(trophies);
  const cards = watch.map((t) => {
    const isDone = earned.has(t.id);
    return (
      '<article class="watch-card">' +
      '<div class="trophy-meta">' + badgesFor(t) + "</div>" +
      "<h3>" + esc(t.name) + "</h3>" +
      '<p class="trophy-desc">' + esc(t.description) + "</p>" +
      '<p class="watch-why">' + esc(t.guide) + "</p>" +
      '<span class="watch-verdict">Precautionary watch — not confirmed missable in-game</span>' +
      (isDone ? ' <span class="watch-verdict" style="background:#e7f3e2;color:#2e7d32">Earned ✓</span>' : "") +
      "</article>"
    );
  }).join("");
  container.innerHTML =
    '<div class="section-head"><h2>Missable watch</h2>' +
    "<p>Two trophies are on the watch. Everything else can be earned after the story, as far as the official descriptions show.</p></div>" +
    '<div class="watch-intro"><strong>Read this first:</strong> no trophy is confirmed missable from the official descriptions alone — GTA games keep the world open after the story, and nothing in this list says otherwise. The two below are flagged because their wording implies choice or timing. Treat the watch as a precaution, not a verdict: do these as you go, and the question never arises.</div>' +
    cards;
}

// 100% Completion: the ten categories behind A Long Road (gold).
export function renderHundred(container, roadmap) {
  const rows = roadmap.completion100.items.map((item) =>
    '<div class="hundred-row"><div class="hundred-count">' + esc(item.count) + "</div>" +
    "<div><p><strong>" + esc(item.label) + "</strong></p>" +
    '<p class="detail">' + esc(item.detail) + "</p></div></div>"
  ).join("");
  container.innerHTML =
    '<div class="section-head"><h2>' + esc(roadmap.completion100.title) + "</h2><p>" +
    esc(roadmap.completion100.note) + "</p></div>" +
    '<div class="hundred-list">' + rows + "</div>";
}

// Sources & method: the source matrix and how each derived fact was
// derived. Nothing here claims a check that was not made.
export function renderSources(container) {
  container.innerHTML =
    '<div class="section-head"><h2>Sources &amp; method</h2>' +
    "<p>What each fact rests on — and what we did not verify. A guide that cites its sources beats a detailed one that cites none.</p></div>" +
    '<table class="source-matrix"><thead><tr><th>Source</th><th>What it verified</th><th>Date / notes</th></tr></thead><tbody>' +
    "<tr><td>Exophase — GTA VI trophy list</td><td>All 55 names, descriptions and grades</td><td>18 Nov 2026; agrees with PSNProfiles on every name, description and grade</td></tr>" +
    "<tr><td>PSNProfiles — GTA VI trophies</td><td>Grades and PSN progress targets (counts) where the list publishes them</td><td>18 Nov 2026</td></tr>" +
    "<tr><td>PlayStation (official list)</td><td>The list's make-up: 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden</td><td>As published on PSN</td></tr>" +
    "<tr><td>Our own reading</td><td>Roadmap stages, kind labels, missable watch, hidden-flag derivation, and every guide's route advice</td><td>Written for this entry; labelled where it is not yet checked in-game</td></tr>" +
    "</tbody></table>" +
    '<div class="method-block"><h3>How the list was verified</h3><p>Every name, description and grade in this guide was matched against the official list as Exophase and PSNProfiles published it on 18 Nov 2026, with case, curly quotes, dashes and the ellipsis set aside. The audit strip in the header shows the result: 55 of 55 names match. One name carries asterisks as PlayStation publishes it: “T**s Ass Drug Money”.</p></div>' +
    '<div class="method-block"><h3>How hidden flags were derived</h3><p>28 trophies are hidden on PlayStation until earned. We mark hidden the trophies whose names or descriptions would spoil the story or a secret: the 12 story trophies, the 6 side-strand trophies, and 10 cryptic ones (Fair Game, Catch Me If You Can, Challenging Tank, In The Beginning…, Capital Offense, Personal Best, Actions Speak Louder, Bad Luck I Guess, The Truth Is Out There, Ten Pin). 12 + 6 + 10 = 28, the official hidden count.</p></div>' +
    '<div class="method-block"><h3>How counts were derived</h3><p>Where the official list publishes a PSN progress target — 250 stunts, 42 Shooting Range challenges, 14 Top Fun locations, 100 WAiNK locations, 52 areas, 9 gangs, 500 choices and the rest — the guide shows it as a “PSN target” badge. Where no count is published, the guide shows none and invents none.</p></div>' +
    '<div class="method-block"><h3>How the roadmap was built</h3><p>Seven stages, built from the official descriptions alone: story first, then side strands, activities, collectibles, crime and combat, grinds and money, then cleanup and secrets. Every trophy sits in exactly one stage; stage hours are our estimates for a first playthrough, not measured times.</p></div>' +
    '<div class="method-block"><h3>What we did not do</h3><p>Nobody on this guide has played GTA VI to verify a location, a step or a missable flag — the game is days old and the guides were written from the official descriptions. Where a guide gives route advice, it says so and labels it as our reading, not yet checked in-game. No guide text was copied from another guide, wiki, video or forum post; sources are cited, never copied. No Rockstar Games logo or official artwork appears anywhere in this guide.</p></div>';
}
