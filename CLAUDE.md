# CLAUDE.md — orientation for a fresh instance

The Coiled Compendium: a sourced reference for World of Warcraft: Midnight,
patch 12.1, Season 2 — in two modules: **Mythic+** (eight dungeons) and
**Raid** (The Venomous Abyss, Normal and Heroic). Published as a static site
on GitHub Pages at **https://samurairacy.github.io/coiled-compendium/**.

Start with README.md for what the site is, how it's sourced, and the
licensing position the project depends on.

## Architecture

Since 2026-08-17 the site is a small `index.html` shell over split files.
**Load order is the contract** — five classic scripts with `defer`, which
preserves document order and keeps the site working from `file://`:

    index.html            shell: head, icon sprite, nav, page containers
    css/app.css           the stylesheet
    js/data-shared.js     SOURCES, TAGS/CTRS, SEASON, DISPUTES, IMG,
                          ICONS, CORRECTIONS — vocabulary both modules use
    js/data-mplus.js      DUNGEONS (+ D map, ROUTING)
    js/data-raid.js       RAID (+ RB map)
    js/render.js          helpers and every page function
    js/app.js             router, facet/difficulty delegation, search, boot

**No build step, deliberately.** Data files are JS object literals, not
JSON-behind-fetch, precisely so `file://` works and deploy stays
push-to-main. A bundler buys minification and little else here; revisit only
if that changes. There is **no Node on the dev machine** — the validation
script is stdlib Python and the browser is the JS syntax truth.

**Run `python tools/check.py` before committing data changes.** Every
assertion in it is a defect class that actually shipped once: the strict
blocks (ICONS/IMG/CORRECTIONS) are JSON-parsed because a missing comma once
broke the whole site; `bosses:` must equal `encounters.length` because it
silently didn't for months; correction canonicals must appear in the data
because a rename sweep once orphaned search aliases; icon slugs and image
paths must exist on disk; raid `df` discipline is enforced from day one.

Images: `assets/img/` holds 32 banners/captures (once 703 KB of inline
base64 — never inline images again), `assets/icons/` holds ~540 ability and
item icons keyed by Blizzard slug.

## How the site works, to the extent this repository needs to know

- **Hash routing.** `#/dungeons`, `#/d/kings-rest/bosses`, `#/raid`,
  `#/r/sszorak`, `#/raid/prep`. `route()` runs once at script end and again
  on every `hashchange`, reading `location.hash` each time — which is why a
  deep link survives a reload on a static host with no rewrite rules.
  Nothing about the deploy may break this. The hash may carry a query:
  facet state (`#/mechanics?from=r&ctr=poison`, `#/loot?ty=Mail.Plate`) and
  boss difficulty (`#/r/nekzali?d=h`) are URL state, written with
  `replaceState` so painting never re-routes.
- **Two modules, one brand.** The nav is two module entries (accent dots),
  a divider, then the shared indexes: Mechanics, Loot, Season, Sources,
  Glossary. Mechanics and Loot are single indexes spanning both modules
  with a **From** facet (Dungeons | Raid) — a deliberate decision after
  going back and forth; do not split them per module. Module sub-pages ride
  a second-level bar: Dungeons·Routes under Mythic+, Bosses·Prep under Raid.
- **Mythic+ module.** Eight dungeons, 28 boss encounters, 16 mini-bosses,
  336 abilities. Every dungeon's `bosses:` equals `encounters.length`; if
  they ever diverge, treat it as a misfiled encounter, not intent (that
  defect shipped once, and an earlier CLAUDE.md wrongly blessed it).
- **Raid module: The Venomous Abyss is a fork, not a line.** After
  Nek'zali it splits into two wings — Entombed Sentinels → Vashnik, and
  The Lost Explorers → Sszorak — converging at the Twin Fangs, then the
  Coiled Altar and Ula'tek. Sources list the middle four in different
  orders because each describes one walk of the same graph; **that is not
  a naming dispute**. `o` is a listing index for the switcher; `pos` is
  the only order claim a page may render for a fork boss.
- **The role lens** rides every boss and dungeon page: Everyone / Tank /
  Healer / Melee / Ranged, persisted (`cc-role`) and URL-carried (`?r=tank`).
  Ability `r:` vocabulary is tank/healer/dps plus **mdps/rdps refinements**
  where a source names the role — the Melee and Ranged lenses each include
  generic `dps` rows, an ability with no `r:` concerns everyone and always
  shows, and a mechanic that pointedly concerns both kinds carries both
  (`["mdps","rdps"]`). Hiding is never silent: pages say what the lens
  removed. **The full melee/ranged discernment pass over all 412 abilities
  is an open editorial task** (owner-flagged): refine only on evidence —
  prose, transcripts, or live logs — some abilities programmatically target
  ranged players, and guessing which is worse than staying coarse.
- **The difficulty axis** exists only in the raid: `df:["h"]` marks
  Heroic-only abilities (absence means both — never write `["n","h"]`,
  the checker enforces it), `hh:` carries a Heroic addendum. The toggle
  persists in localStorage, rides the URL as `?d=h`, and **never hides
  silently**: on Normal, Heroic-only rows collapse to a counted line. It
  is a segmented control so Mythic later is a data change, not a rebuild.
- **Ula'tek is a named gap.** No source has tested her (Icy Veins says so
  outright); her page carries journal-derived structure behind an explicit
  warning. Don't fill the gap with confidence; fill it with live data.
- **wow.gg is quarantined.** Its fight descriptions are Mythic-based by
  its own admission and its names read like translation (13 of them are in
  the concordance as wrong spellings). Cite it for structure, loot and
  Ula'tek; never for Normal/Heroic specifics against IV/Method.
- **Loot points opposite ways per module and the Loot index knows.** M+
  pays once from an end-of-run chest, so slot/type matter and `b` is
  reference-only. Raid loot is per boss, once a week per difficulty —
  the boss is the point. Raid items carry `tc` on tier tokens (bosses 2–6
  plus Ula'tek's Curio). **Secondary values are never printed** — the lean
  renders as "big Mastery little Haste". As of 2026-08-17 no raid item has
  Use/Equip text on Wowhead; none is displayed, none was invented.
- **Names are Wowhead's, and there is no second opinion in the data.**
  All 103 M+ double-names were adjudicated 2026-08-17 (57 renamed; the
  wrong names moved to `CORRECTIONS`, a flat
  `[right, wrong, where, kind, unverified]` table feeding the glossary
  concordance and the search aliases). The raid added 13 more pairs, each
  adjudicated against Wowhead's database — including one where wow.gg was
  right and Icy Veins wrong (Final Ascension, not Empowered Ascension).
  **Add new names against Wowhead, not against any guide's prose.**
- **Two filtered indexes share a stylesheet but not a state.** Mechanics
  runs on `FACETS/ALL/matches`, Loot on `LFACETS/LOOTALL/lmatch`. The
  delegated click handler distinguishes them by attribute — mechanics
  matches `.fopt[data-f]`, loot uses `data-lf`. **Drop that `[data-f]`
  qualifier and mechanics silently eats every loot click.** Mechanics
  stacks multi-select as AND; loot stacks OR within a group, AND across
  groups; loot's secondaries are the one AND group. Raid rows carry the
  boss (`x.b`) where dungeon rows carry `x.d` — renderers branch on `mod`.
- **Mobs carry a gravity tier in `k`** (`mini`→`lt`→`caster`/`trash`→
  `fodder`), and the trash card styles itself from it.
- **Accents do the wayfinding.** `[data-dungeon]` sets `--d-accent` per
  dungeon; raid pages reuse the same `--d-*` names via `body[data-raid]`
  and `[data-boss]`, so every accent-driven component works on both
  modules without a second stylesheet. The raid palette is a descent
  measured in Lab — venom green (`--r-accent`, dE≥39 from all eight
  dungeon accents) down through drowned cyan into abyssal violet, L* 70→58.
- **The homepage status line computes live** against the Season 2 start of
  18 Aug 2026 (the raid opens the same week). A stale-looking homepage is
  usually just the calendar.
- **Ability icons are keyed by name, not ID.** `ICONS` (356 entries) maps
  name → Blizzard slug; `abilIcon()` renders `assets/icons/<slug>.jpg`.
  287/329 M+ names resolved; the other 42 were each queried and none is a
  spell. 71/76 raid abilities resolved the same way. **A missing name
  renders an empty spacer box, never nothing** — and renaming an ability
  silently costs it its icon, so update `ICONS` with any rename. The
  shared map also means cross-module name reuse pays: raid Axegrinder
  inherited the M+ icon for free.

## Repository conventions

- **`docs/` is git-ignored.** This repository is public. Working notes,
  briefs, YouTube transcripts and anything not meant for publication live
  there and are never committed.
- **Nothing personal in tracked files.** No real names, no email addresses,
  no local filesystem paths. Commits are authored under the GitHub noreply
  address.
- **Stage explicit paths; never `git add -A`.**
- **Source tiering** (see the SOURCES ledger): 1 Blizzard, 2 Wowhead/Icy
  Veins, 3 established creators (Method, Tactyks — the transcripts the
  project owner most trusts), 4 SEO/derivative sites (wow.gg).

## Deployment

GitHub Pages, **deploy from a branch**: `main`, folder `/ (root)`. Pushing
to `main` publishes. No CI, no Actions — and `tools/check.py` locally is
the gate that replaces them.

- `.nojekyll` stays.
- `.gitattributes` pins html/js/css/py to LF.
- No `CNAME`; no bare `LICENSE` file, deliberately — the README's
  *Licensing and attribution* section is the licence position. Don't "fix"
  this by adding one.

## After any change that reaches the live site

Load the published URL and check, in order:

1. It renders: dark theme, serif headings, serpent mark top-left.
2. Boss banners and ability icons appear.
3. **Deep links survive a reload** — both modules:
   `…/#/d/kings-rest/bosses` and `…/#/r/sszorak?d=h` must land where they
   say after a refresh.
4. The dungeon switcher and the boss switcher both move and keep context.
5. The homepage shows both module cards; the Raid nav entry lights on raid
   pages.
6. Search opens with `/`; "Luxay" and "Entombed Wardens" both find their
   right-named entities.
7. No console errors.

## Corrections and issues

Issues are enabled on purpose — the site is explicitly about surfacing
where sources disagree, so corrections are the point. Wikis, Projects and
Discussions are off.
