# VICE ATLAS — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/alyxilussion/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/alyxilussion/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, open-source guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI** — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01). Static files, no build step, no network: serve `app/` with any static HTTP server and open `index.html` in desktop Chrome.

## What it is

- **Checklist** — every trophy with its official name, description and grade, a code-drawn SVG icon per kind, a grade medallion, and a guide in our own words with named sources. Progress saves in the browser (localStorage), exports to a file and imports back.
- **Audit strip** — 55/55 names verified against the official list as Exophase and PSNProfiles published it on 18 Nov 2026: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden.
- **Filters** — by kind (story, side strands, activities, collectibles, combat, crime, money, secrets, completion), by grade, missable-watch-only, hide-earned, and full-text search.
- **Spoiler setting (ON by default)** — story trophies stay masked until earned.
- **Roadmap** — 7 stages to the platinum, every trophy assigned to exactly one stage, with per-stage progress, hours and tips.
- **Missable watch** — 2 precautionary flags (Positive Mental Attitude, Actions Speak Louder), each labelled as unconfirmed: no trophy is confirmed missable from the official descriptions alone.
- **100% Completion** — the ten counted categories behind the gold trophy A Long Road.
- **Sources & method** — a source matrix plus how the hidden flags, counts and roadmap were derived, and what was not verified.

## Honesty note

Nobody on this guide has played GTA VI to verify a location, a step or a missable flag. Where a guide gives route advice, it says so and labels it as our reading of the official description, not yet checked in-game. No guide text was copied from another guide, wiki, video or forum post — sources are cited, never copied. No Rockstar Games logo or official artwork is used anywhere.

## Layout

```
app/
  index.html          shell: header, progress hero, audit strip, tabs, filters
  css/theme.css       tokens, base, header, hero, tabs, filter bar
  css/components.css  trophy rows, medallions, roadmap, watch, sources
  js/icons.js         code-drawn SVG: kind glyphs, grade discs, progress ring
  js/store.js         localStorage progress, export/import, spoiler setting
  js/trophies.js       data loading, PSN points, grade/kind helpers
  js/filters.js       search / kind / grade / missable / hide-earned
  js/views.js         the five views' renderers
  js/main.js          boot, state, event wiring
  data/trophies.json   the 55 official trophies with guides and sources
  data/roadmap.json   the 7 stages and the 100% categories
screenshots/          four real browser renders of the app
main.ts               entrypoint: copies app/ + screenshots/ to /output,
                      writes dossier.json with vendor/makefun-frontend.ts
```

## Run it

```sh
cd app && python3 -m http.server 8080   # then open http://localhost:8080
```

Build the hand-in output:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
