# Leonida 55 — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/alyxilussion/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/alyxilussion/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI, built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01): 1 platinum, 2 gold, 6 silver, 46 bronze — 28 hidden, 0 online, roughly 200 hours to the platinum.

## What it is

- **Every trophy** with its official name, description and grade as PlayStation publishes them, and a guide in this entry's own words that cites its sources (Push Square, KeenGamer, PlanetGTA6, WikiGTAVI and more) beside each trophy.
- **A roadmap to the platinum** in four stages — story, side strands, the 100% haul, cleanup — with the one missable trophy (Positive Mental Attitude) flagged and the save/cheat rules spelled out.
- **A tracker**: a checklist saved in the browser (localStorage), export to a file and import back, filters by kind (story, missable, collectibles, activities, crime, quests, secrets, world, milestones, online), by grade, by earned/remaining, plus search.
- **A spoiler setting** that hides the names and descriptions of the story trophies until they are earned.
- **A 100% completion breakdown** for A Long Road, built from the cited guides.
- **Honest about what is unknown**: six guides carry an "unconfirmed" mark where the guide writers had not pinned down the trigger at launch — each gives the best current lead with its source instead of inventing one.

The app is static files under `app/` with no build step and no network request at run time. The sunset banner is original vector art drawn for this guide — no Rockstar logo, official artwork, box art or game screenshot anywhere.

## Run it

Serve `app/` with any static file server and open `index.html`:

```sh
cd app && python3 -m http.server 8080
# open http://localhost:8080
```

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `app/index.html` — the guide shell: hero, tabs, filters, checklist, detail panel, roadmap, 100% and sources views
- `app/app.js` — tracker logic: rendering, filters, spoiler masking, localStorage progress, export/import
- `app/style.css` — the Leonida look: bay-mist, ink, neon coral, sun gold
- `app/data/trophies.json` — the 55 trophies with official text, guides, steps and sources
- `app/data/roadmap.json` — the four roadmap stages, the four run rules, the 100% breakdown
- `screenshots/` — 4 real renders of the guide's own code
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
