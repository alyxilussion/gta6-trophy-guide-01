// VICE ATLAS — main.js: boot, state, and event wiring. Loads the data,
// renders the header hero (progress ring, grade bars, audit strip is
// static in the HTML), switches views, and owns the checklist's
// delegated clicks (earn toggles, guide toggles, roadmap jumps).

import { brandMark, progressRing } from "./icons.js";
import { loadProgress, saveProgress, toggleEarned, exportProgress, parseImport, loadSpoiler, saveSpoiler } from "./store.js";
import { loadData, pointsFor, countByGrade, TOTAL_TROPHIES, GRADE_ORDER, GRADE_LABELS } from "./trophies.js";
import { defaultFilters, applyFilters } from "./filters.js";
import { renderChecklist, renderRoadmap, renderMissables, renderHundred, renderSources } from "./views.js";

const GRADE_BAR_COLORS = { platinum: "#d9e2ec", gold: "#e8a93d", silver: "#aeb6bf", bronze: "#c98b5e" };

const state = {
  trophies: [],
  roadmap: null,
  earned: loadProgress(),
  spoilerOn: loadSpoiler(),
  filters: defaultFilters(),
  view: "checklist",
  openGuides: new Set(),
};

const $ = (id) => document.getElementById(id);

function renderHero() {
  const earnedCount = state.earned.size;
  const pct = TOTAL_TROPHIES ? earnedCount / TOTAL_TROPHIES : 0;
  $("progress-ring").innerHTML = progressRing(pct, 120);
  $("earned-count").textContent = earnedCount;
  $("points-earned").textContent = pointsFor(state.trophies, state.earned).toLocaleString("en-US");
  const byGrade = countByGrade(state.trophies, state.earned);
  $("grade-bars").innerHTML = GRADE_ORDER.map((g) => {
    const { total, earned } = byGrade[g];
    const w = total ? Math.round((earned / total) * 100) : 0;
    return (
      '<div class="grade-bar"><span>' + GRADE_LABELS[g] + "</span>" +
      '<span class="bar-track"><span class="bar-fill" style="width:' + w + "%;background:" + GRADE_BAR_COLORS[g] + '"></span></span>' +
      "<span class=\"bar-count\">" + earned + "/" + total + "</span></div>"
    );
  }).join("");
}

function renderActiveView() {
  const views = ["checklist", "roadmap", "missables", "hundred", "sources"];
  for (const v of views) {
    $("view-" + v).hidden = v !== state.view;
  }
  document.querySelectorAll("#view-tabs .tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === state.view);
  });
  $("filter-bar").style.display = state.view === "checklist" ? "" : "none";
  if (state.view === "checklist") {
    const list = applyFilters(state.trophies, state.filters, state.spoilerOn, state.earned);
    renderChecklist($("view-checklist"), list, state);
    $("showing-count").textContent = "Showing " + list.length + " of " + TOTAL_TROPHIES + " trophies";
  } else if (state.view === "roadmap") {
    renderRoadmap($("view-roadmap"), state.trophies, state.roadmap, state.earned, state.spoilerOn);
  } else if (state.view === "missables") {
    renderMissables($("view-missables"), state.trophies, state.earned);
  } else if (state.view === "hundred") {
    renderHundred($("view-hundred"), state.roadmap);
  } else if (state.view === "sources") {
    renderSources($("view-sources"));
  }
}

function renderAll() {
  renderHero();
  renderActiveView();
}

function switchView(view) {
  state.view = view;
  renderActiveView();
}

function jumpToTrophy(id) {
  state.view = "checklist";
  state.filters = defaultFilters();
  $("search-box").value = "";
  $("kind-filter").value = "";
  $("grade-filter").value = "";
  $("missable-filter").checked = false;
  $("earned-filter").checked = false;
  state.openGuides.add(id);
  renderAll();
  const row = $("trophy-" + id);
  if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function boot() {
  $("brand-mark").innerHTML = brandMark();
  $("spoiler-toggle").checked = state.spoilerOn;
  $("spoiler-state").textContent = state.spoilerOn ? "ON" : "OFF";

  const data = await loadData();
  state.trophies = data.trophies;
  state.roadmap = data.roadmap;
  renderAll();

  // Tabs.
  document.querySelectorAll("#view-tabs .tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  // Spoiler toggle (header).
  $("spoiler-toggle").addEventListener("change", (e) => {
    state.spoilerOn = e.target.checked;
    saveSpoiler(state.spoilerOn);
    $("spoiler-state").textContent = state.spoilerOn ? "ON" : "OFF";
    renderAll();
  });

  // Filters.
  $("search-box").addEventListener("input", (e) => {
    state.filters.query = e.target.value;
    renderActiveView();
  });
  $("kind-filter").addEventListener("change", (e) => {
    state.filters.kind = e.target.value;
    renderActiveView();
  });
  $("grade-filter").addEventListener("change", (e) => {
    state.filters.grade = e.target.value;
    renderActiveView();
  });
  $("missable-filter").addEventListener("change", (e) => {
    state.filters.missableOnly = e.target.checked;
    renderActiveView();
  });
  $("earned-filter").addEventListener("change", (e) => {
    state.filters.hideEarned = e.target.checked;
    renderActiveView();
  });

  // Export / import.
  $("export-btn").addEventListener("click", () => exportProgress(state.earned));
  $("import-btn").addEventListener("click", () => $("import-file").click());
  $("import-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      state.earned = parseImport(text);
      saveProgress(state.earned);
      renderAll();
    } catch {
      alert("That file is not a VICE ATLAS progress export.");
    }
    e.target.value = "";
  });

  // Delegated clicks inside the views: earn toggles, guide toggles,
  // roadmap chips jumping to a trophy.
  $("main").addEventListener("click", (e) => {
    const earnBtn = e.target.closest("[data-earn]");
    if (earnBtn) {
      toggleEarned(state.earned, Number(earnBtn.dataset.earn));
      renderAll();
      return;
    }
    const guideBtn = e.target.closest("[data-guide]");
    if (guideBtn) {
      const id = Number(guideBtn.dataset.guide);
      if (state.openGuides.has(id)) state.openGuides.delete(id);
      else state.openGuides.add(id);
      renderActiveView();
      return;
    }
    const jumpBtn = e.target.closest("[data-jump]");
    if (jumpBtn) jumpToTrophy(Number(jumpBtn.dataset.jump));
  });
}

boot().catch((err) => {
  $("view-checklist").innerHTML =
    '<p class="empty-note">The guide failed to load its data (' + err.message + "). Reload the page; if it persists, the app folder is incomplete.</p>";
});
