// VICE ATLAS — gta6-trophy-guide-01 entrypoint (Node 22, stdlib only).
//
// The guide is this repository's app/ folder: plain static files a
// browser opens at app/index.html (ES modules, CSS, no build step),
// offline — it loads nothing over the network, and its trophy list and
// guides are app/data/trophies.json. screenshots/ holds four real
// renders of the app in a browser.
//
// This program hands the guide in: it copies app/ and screenshots/
// from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads (the screenshots, the first load's files
// and bytes, and the source), with the vendored make.fun library.
// Leave vendor/makefun-frontend.ts as it is: the scorer requires
// dossier.json to be byte for byte what its own copy writes.
//
// The program runs twice and both runs must write the same bytes, so
// it copies files in a fixed order and never touches the output
// directory itself — it only writes inside it.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Copy one directory of the repository into /output, creating the
// destination first. Missing screenshots/ is tolerated (the gate then
// refuses the entry for having none) but app/ must exist.
function copyDir(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outDir, name);
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyDir("app");
copyDir("screenshots");

// The scorer's own caps (reference/gate.json): only text_max_bytes
// shapes the bytes; the others refuse an entry the scorer would refuse
// (more than 4 screenshots or one over 256 KiB; more than 993 files
// and directories in app/ or 48 MiB of app files).
writeFileSync(
  join(outDir, "dossier.json"),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
