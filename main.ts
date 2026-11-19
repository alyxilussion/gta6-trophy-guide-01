// Leonida 55 — hand-in program (Node 22, standard library only).
//
// The guide itself is app/: plain static files a browser opens at
// app/index.html, offline, with its trophy data in app/data/trophies.json.
// This program copies app/ and screenshots/ beside this file into the
// output directory and writes dossier.json there — the summary the judge
// reads (screenshots, first-load files and bytes, and the source outline) —
// using the kit's vendored library, vendor/makefun-frontend.ts, unchanged.
//
// It runs twice in the grader and both runs must write the same bytes, so
// everything here is deterministic: no timestamps, no random ids, and the
// output directory's old contents are cleared before the copy (the
// directory itself is never removed — the platform owns it).
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The scorer's own caps for this bounty (reference/gate.json): at most 4
// screenshots of 256 KiB each, at most 993 files and directories in app/
// totalling 48 MiB, and the dossier text capped at 160 KiB.
const DOSSIER_OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message: string): never {
  throw new Error(`leonida55: ${message}`);
}

// Clear what an earlier run left inside the output directory, without
// removing the directory itself.
function clearOutputContents(dir: string): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function checkGuidePresent(): void {
  const index = join(repoRoot, 'app', 'index.html');
  if (!existsSync(index) || !statSync(index).isFile()) {
    fail('app/index.html is missing — the guide cannot be handed in without it.');
  }
  const data = join(repoRoot, 'app', 'data', 'trophies.json');
  if (!existsSync(data) || !statSync(data).isFile()) {
    fail('app/data/trophies.json is missing — the trophy list cannot be handed in without it.');
  }
}

function checkScreenshotsPresent(): void {
  const shots = join(repoRoot, 'screenshots');
  if (!existsSync(shots)) fail('screenshots/ is missing — the guide needs 3 or 4 screenshots.');
  const files = readdirSync(shots).filter((name) => !name.startsWith('.'));
  if (files.length < 3 || files.length > 4) {
    fail(`screenshots/ holds ${files.length} images — the gate wants 3 or 4.`);
  }
}

function handInGuide(): void {
  checkGuidePresent();
  checkScreenshotsPresent();
  mkdirSync(outputDir, { recursive: true });
  clearOutputContents(outputDir);
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
  writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, DOSSIER_OPTIONS));
}

handInGuide();
