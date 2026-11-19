// Leonida 55 — offline GTA VI trophy guide and tracker.
// Loads its own data files (trophies.json, roadmap.json), renders the checklist,
// the roadmap, the 100% breakdown and the sources, and keeps the reader's
// progress in localStorage. No network request leaves the browser.

const EARNED_KEY = 'leonida55-earned-v1';
const SPOILER_KEY = 'leonida55-spoiler-v1';

const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectibles',
  activity: 'Activities',
  crime: 'Crime',
  quest: 'Quests',
  secret: 'Secrets',
  world: 'World',
  meta: 'Milestones',
  online: 'Online',
};
const KIND_ORDER = ['all', 'story', 'missable', 'collectible', 'activity', 'crime', 'quest', 'secret', 'world', 'meta', 'online'];
const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const GRADE_LETTERS = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

let trophyDoc = null;
let roadmapDoc = null;
let earned = new Set();
let spoilerOn = true;
let kindFilter = 'all';
let gradeFilter = 'all';
let earnedFilter = 'all';
let searchQuery = '';
let selectedId = null;

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPanel');

function readStoredEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    if (Array.isArray(raw)) return new Set(raw.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55));
  } catch { /* a corrupt store starts empty */ }
  return new Set();
}

function readStoredSpoiler() {
  const raw = localStorage.getItem(SPOILER_KEY);
  return raw === null ? true : raw === '1';
}

function saveProgress() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}

function trophyById(id) {
  return trophyDoc.trophies.find((t) => t.id === id) ?? null;
}

function isMasked(trophy) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

function matchesKind(trophy) {
  if (kindFilter === 'all') return true;
  if (kindFilter === 'missable') return trophy.missable;
  if (kindFilter === 'online') return false;
  return trophy.kind === kindFilter;
}

function matchesSearch(trophy) {
  if (!searchQuery) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, ...(trophy.steps ?? [])]
    .join(' ').toLowerCase();
  return haystack.includes(searchQuery);
}

function visibleTrophies() {
  return trophyDoc.trophies.filter((t) => {
    if (!matchesKind(t)) return false;
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
    if (earnedFilter === 'earned' && !earned.has(t.id)) return false;
    if (earnedFilter === 'remaining' && earned.has(t.id)) return false;
    if (!matchesSearch(t)) return false;
    return true;
  });
}

function formatCount(trophy) {
  if (trophy.count === null || trophy.count === undefined) return '';
  return `${trophy.count.toLocaleString('en-US')} ${trophy.countLabel}`;
}

function tagHtml(text, extraClass = '') {
  return `<span class="tag ${extraClass}">${text}</span>`;
}

function trophyTags(trophy) {
  const tags = [tagHtml(GRADE_LABELS[trophy.grade], `grade-tag ${trophy.grade}`)];
  tags.push(tagHtml(KIND_LABELS[trophy.kind] ?? trophy.kind));
  if (trophy.hidden) tags.push(tagHtml('Hidden', 'hidden-tag'));
  if (trophy.missable) tags.push(tagHtml('Missable', 'missable'));
  if (trophy.status === 'unconfirmed') tags.push(tagHtml('Unconfirmed', 'unconfirmed'));
  return tags.join('');
}

function renderKindChips() {
  const box = document.getElementById('kindChips');
  box.replaceChildren();
  for (const kind of KIND_ORDER) {
    const count = kind === 'all'
      ? trophyDoc.trophies.length
      : kind === 'missable'
        ? trophyDoc.trophies.filter((t) => t.missable).length
        : kind === 'online'
          ? 0
          : trophyDoc.trophies.filter((t) => t.kind === kind).length;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip${kind === kindFilter ? ' active' : ''}`;
    button.dataset.kind = kind;
    button.innerHTML = `${KIND_LABELS[kind]} <span class="n">${count}</span>`;
    button.addEventListener('click', () => {
      kindFilter = kind;
      renderKindChips();
      renderTrophyList();
    });
    box.append(button);
  }
}

function renderProgress() {
  const total = trophyDoc.trophies.length;
  const done = earned.size;
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const all = trophyDoc.trophies.filter((t) => t.grade === grade).length;
    const got = trophyDoc.trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
    return `${GRADE_LABELS[grade]} ${got}/${all}`;
  }).join(' · ');
  document.getElementById('gradeCounts').textContent = byGrade;
  const fill = document.getElementById('progressFill');
  fill.style.width = `${(done / total) * 100}%`;
  fill.parentElement.setAttribute('aria-valuenow', String(done));
  document.getElementById('progressNote').textContent = done === total
    ? 'All 55 earned — Vice Got a Price! is yours.'
    : 'Progress saves in this browser automatically. Export it to keep a backup.';
}

function renderSidebarStats() {
  const box = document.getElementById('sidebarStats');
  const rows = [
    ['Story', trophyDoc.trophies.filter((t) => t.kind === 'story' && earned.has(t.id)).length, 12],
    ['Quests', trophyDoc.trophies.filter((t) => t.kind === 'quest' && earned.has(t.id)).length, 7],
    ['Collectibles', trophyDoc.trophies.filter((t) => t.kind === 'collectible' && earned.has(t.id)).length, 4],
    ['Activities', trophyDoc.trophies.filter((t) => t.kind === 'activity' && earned.has(t.id)).length, 9],
    ['Crime', trophyDoc.trophies.filter((t) => t.kind === 'crime' && earned.has(t.id)).length, 8],
    ['Secrets', trophyDoc.trophies.filter((t) => t.kind === 'secret' && earned.has(t.id)).length, 9],
  ];
  box.innerHTML = rows.map(([label, got, all]) => `<p><span>${label}</span><b>${got}/${all}</b></p>`).join('')
    + `<p><span>Hidden trophies</span><b>28</b></p><p><span>Unconfirmed guides</span><b>6</b></p>`;
}

function trophyRowElement(trophy) {
  const li = document.createElement('li');
  const masked = isMasked(trophy);
  const row = document.createElement('div');
  row.className = `trophy-row${earned.has(trophy.id) ? ' earned' : ''}${selectedId === trophy.id ? ' selected' : ''}`;
  row.setAttribute('role', 'button');
  row.tabIndex = 0;
  row.dataset.trophyId = String(trophy.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', `Mark ${masked ? 'hidden story trophy' : trophy.name} as earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => {
    toggleEarned(trophy.id);
  });

  const disc = document.createElement('span');
  disc.className = `grade-disc ${trophy.grade}`;
  disc.textContent = GRADE_LETTERS[trophy.grade];

  const text = document.createElement('div');
  if (masked) {
    text.innerHTML = `<div class="trophy-name redacted">Hidden story trophy</div>`
      + `<div class="trophy-desc redacted">Earn it in the story to reveal its name and description.</div>`
      + `<div class="trophy-tags">${trophyTags(trophy)}</div>`;
  } else {
    text.innerHTML = `<div class="trophy-name"></div><div class="trophy-desc"></div><div class="trophy-tags">${trophyTags(trophy)}</div>`;
    text.querySelector('.trophy-name').textContent = trophy.name;
    text.querySelector('.trophy-desc').textContent = trophy.description;
  }

  const count = document.createElement('span');
  count.className = 'row-count';
  count.textContent = formatCount(trophy);

  row.append(box, disc, text, count);
  row.addEventListener('click', () => selectTrophy(trophy.id));
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectTrophy(trophy.id);
    }
  });
  li.append(row);
  return li;
}

function renderTrophyList() {
  const shown = visibleTrophies();
  document.getElementById('resultCount').textContent =
    `Showing ${shown.length} of ${trophyDoc.trophies.length} trophies${kindFilter === 'online' ? ' — the game lists no online trophies' : ''}.`;
  listEl.replaceChildren();
  if (shown.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.innerHTML = kindFilter === 'online'
      ? '<strong>No online trophies.</strong><br>All 55 trophies are single-player — nothing on this list needs a server, another player or DLC. (Exophase / PSNProfiles.)'
      : '<strong>Nothing matches these filters.</strong><br>Try another kind, grade or search term.';
    listEl.append(empty);
    return;
  }
  for (const trophy of shown) listEl.append(trophyRowElement(trophy));
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveProgress();
  renderProgress();
  renderSidebarStats();
  renderTrophyList();
  renderDetailPanel();
  renderRoadmapStages();
}

function selectTrophy(id) {
  selectedId = id;
  history.replaceState(null, '', `#${id}`);
  renderTrophyList();
  renderDetailPanel();
  detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderDetailPanel() {
  const trophy = selectedId === null ? null : trophyById(selectedId);
  if (!trophy) {
    detailEl.innerHTML = `<div class="detail-empty"><h3>Pick a trophy to see its guide</h3>`
      + `<p>Every trophy has its official name, description and grade, a guide in this entry's own words, and the sources each fact comes from.</p>`
      + `<p><strong>Start with the missable one:</strong> Positive Mental Attitude has a Chapter 1 meditation you can lose. Its guide tells you exactly when.</p>`
      + `<p>Tick a trophy off and it stays ticked — progress saves in this browser.</p></div>`;
    return;
  }
  if (isMasked(trophy)) {
    detailEl.innerHTML = `<div class="detail-tags">${trophyTags(trophy)}</div>`
      + `<h2>Hidden story trophy</h2>`
      + `<p class="official">This story trophy stays hidden until you earn it — its name, description and guide name chapters and missions. Turn <strong>Hide story spoilers</strong> off to reveal it, or tick it off once it pops.</p>`
      + `<button type="button" class="earn-btn" id="earnBtn">Mark as earned</button>`;
    document.getElementById('earnBtn').addEventListener('click', () => toggleEarned(trophy.id));
    return;
  }
  const stage = roadmapDoc.stages.find((s) => s.trophies.includes(trophy.id));
  const unconfirmedNote = trophy.status === 'unconfirmed'
    ? `<p class="status-note"><strong>Unconfirmed at launch.</strong> The guide writers had not pinned down this trigger when the list went public. The guide gives the best current lead and its source — check the cited guide for the latest word.</p>`
    : '';
  const countLine = formatCount(trophy)
    ? `<p class="meta-line"><strong>Target:</strong> ${formatCount(trophy)}</p>`
    : '';
  detailEl.innerHTML = `<div class="detail-tags">${trophyTags(trophy)}</div>`
    + `<h2></h2>`
    + `<p class="official"><span>Official description:</span> <em></em></p>`
    + unconfirmedNote
    + `<p class="guide-text"></p>`
    + `<h3>How to get it</h3><ol class="steps"></ol>`
    + `<h3>Sources</h3><ul class="sources"></ul>`
    + countLine
    + `<p class="meta-line"><strong>Roadmap:</strong> stage ${stage ? stage.stage : '—'} — ${stage ? stage.title : ''}</p>`
    + `<button type="button" class="earn-btn${earned.has(trophy.id) ? ' earned' : ''}" id="earnBtn">${earned.has(trophy.id) ? 'Earned — tap to undo' : 'Mark as earned'}</button>`;
  detailEl.querySelector('h2').textContent = trophy.name;
  detailEl.querySelector('.official em').textContent = trophy.description;
  detailEl.querySelector('.guide-text').textContent = trophy.guide;
  const stepsEl = detailEl.querySelector('.steps');
  for (const step of trophy.steps ?? []) {
    const li = document.createElement('li');
    li.textContent = step;
    stepsEl.append(li);
  }
  const sourcesEl = detailEl.querySelector('.sources');
  for (const source of trophy.sources ?? []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = source.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = source.name;
    li.append(a);
    sourcesEl.append(li);
  }
  document.getElementById('earnBtn').addEventListener('click', () => toggleEarned(trophy.id));
}

function renderRoadmapStages() {
  const box = document.getElementById('roadmapStages');
  box.replaceChildren();
  for (const stage of roadmapDoc.stages) {
    const done = stage.trophies.filter((id) => earned.has(id)).length;
    const card = document.createElement('article');
    card.className = 'stage';
    card.innerHTML = `<div class="stage-head"><h3><span class="stage-num">Stage ${stage.stage}</span><span></span></h3><span class="stage-time"></span></div>`
      + `<p></p>`
      + (stage.warnings.length ? `<p class="stage-warn">Watch out: ${stage.warnings.join(' · ')}</p>` : '')
      + `<p><strong>${done}/${stage.trophies.length} trophies earned in this stage</strong></p>`
      + `<div class="stage-trophies"></div>`;
    card.querySelector('h3 span:last-child').textContent = stage.title;
    card.querySelector('.stage-time').textContent = stage.time;
    card.querySelector('p').textContent = stage.text;
    const chips = card.querySelector('.stage-trophies');
    for (const id of stage.trophies) {
      const trophy = trophyById(id);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `stage-trophy${earned.has(id) ? ' done' : ''}`;
      chip.textContent = isMasked(trophy) ? 'Hidden story trophy' : trophy.name;
      chip.addEventListener('click', () => {
        switchView('checklist');
        selectTrophy(id);
      });
      chips.append(chip);
    }
    box.append(card);
  }
}

function renderRoadmapView() {
  document.getElementById('roadmapTitle').textContent = roadmapDoc.title;
  document.getElementById('roadmapSummary').textContent = roadmapDoc.summary;
  const rulesBox = document.getElementById('roadmapRules');
  rulesBox.replaceChildren();
  for (const rule of roadmapDoc.rules) {
    const card = document.createElement('article');
    card.className = `rule${/missable|cheat/i.test(rule.title) ? ' warn' : ''}`;
    const h = document.createElement('h3');
    h.textContent = rule.title;
    const p = document.createElement('p');
    p.textContent = rule.text;
    card.append(h, p);
    rulesBox.append(card);
  }
  renderRoadmapStages();
}

function renderCompletionView() {
  document.getElementById('completionTitle').textContent = roadmapDoc.completion.title;
  document.getElementById('completionNote').textContent = roadmapDoc.completion.note;
  const body = document.getElementById('completionRows');
  body.replaceChildren();
  for (const item of roadmapDoc.completion.items) {
    const tr = document.createElement('tr');
    const cells = [item.item, item.needed, item.source];
    for (const value of cells) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    }
    body.append(tr);
  }
}

function renderSourcesView() {
  const seen = new Map();
  for (const trophy of trophyDoc.trophies) {
    for (const source of trophy.sources ?? []) {
      if (!seen.has(source.url)) seen.set(source.url, source.name);
    }
  }
  const list = document.getElementById('sourceList');
  list.replaceChildren();
  for (const [url, name] of [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = name;
    li.append(a);
    list.append(li);
  }
}

function switchView(view) {
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('active', section.id === `view-${view}`);
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
}

function exportProgress() {
  const payload = {
    app: 'leonida55',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida55-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  try {
    const payload = JSON.parse(await file.text());
    const ids = Array.isArray(payload) ? payload : payload.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    const valid = ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55);
    earned = new Set(valid);
    saveProgress();
    renderProgress();
    renderSidebarStats();
    renderTrophyList();
    renderDetailPanel();
    renderRoadmapStages();
    document.getElementById('progressNote').textContent = `Imported ${valid.length} earned trophies.`;
  } catch {
    document.getElementById('progressNote').textContent = 'That file is not a Leonida 55 progress export — nothing was imported.';
  }
}

function wireControls() {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  }
  const spoiler = document.getElementById('spoilerToggle');
  spoiler.checked = spoilerOn;
  spoiler.addEventListener('change', () => {
    spoilerOn = spoiler.checked;
    saveSpoiler();
    renderTrophyList();
    renderDetailPanel();
    renderRoadmapStages();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) importProgress(file);
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies? This cannot be undone (export first if you want a backup).')) {
      earned = new Set();
      saveProgress();
      renderProgress();
      renderSidebarStats();
      renderTrophyList();
      renderDetailPanel();
      renderRoadmapStages();
    }
  });
  document.getElementById('searchInput').addEventListener('input', (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    renderTrophyList();
  });
  document.getElementById('gradeSelect').addEventListener('change', (event) => {
    gradeFilter = event.target.value;
    renderTrophyList();
  });
  document.getElementById('earnedSelect').addEventListener('change', (event) => {
    earnedFilter = event.target.value;
    renderTrophyList();
  });
  // Same-document hash navigation (a link to #17 from elsewhere) must
  // select the trophy without a reload; selectTrophy uses replaceState,
  // so this never loops back on itself.
  window.addEventListener('hashchange', () => {
    const before = selectedId;
    selectFromHash();
    if (selectedId !== before) {
      renderTrophyList();
      renderDetailPanel();
    }
  });
}

async function loadTrophyData() {
  const [trophies, roadmap] = await Promise.all([
    fetch('data/trophies.json').then((response) => response.json()),
    fetch('data/roadmap.json').then((response) => response.json()),
  ]);
  trophyDoc = trophies;
  roadmapDoc = roadmap;
}

function selectFromHash() {
  const match = /^#(\d+)$/.exec(window.location.hash);
  if (match) {
    const id = Number(match[1]);
    if (trophyById(id)) selectedId = id;
  }
}

async function initLeonidaGuide() {
  earned = readStoredEarned();
  spoilerOn = readStoredSpoiler();
  try {
    await loadTrophyData();
  } catch {
    listEl.innerHTML = '<li class="empty-state"><strong>The guide data did not load.</strong><br>Serve this folder with a static file server (for example <code>node serve.ts</code>) and open it over http:// — browsers block data files on file:// pages.</li>';
    return;
  }
  selectFromHash();
  wireControls();
  renderKindChips();
  renderProgress();
  renderSidebarStats();
  renderTrophyList();
  renderDetailPanel();
  renderRoadmapView();
  renderCompletionView();
  renderSourcesView();
}

initLeonidaGuide();
