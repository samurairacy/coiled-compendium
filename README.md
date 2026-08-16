# The Coiled Compendium

A sourced reference for **World of Warcraft: Midnight — patch 12.1, Season 2**,
in two modules: the **Mythic+** dungeon pool and **The Venomous Abyss** raid
(Normal and Heroic).

**→ [Read it here](https://samurairacy.github.io/coiled-compendium/)**

Eight dungeons and eight raid bosses; 28 dungeon boss encounters, 16 mini-bosses,
and every mechanic in the season tagged by what it is and by what stops it. Every
factual claim carries a source mark and a reliability tier, so you can see where a
statement came from and how much weight it deserves.

## Why it exists

Most dungeon guides tell you what to do. Very few tell you how confident to be, and
almost none show you where their sources disagree with each other. This one does
both — the disagreements are the interesting part, and hiding them is how guides
quietly go stale.

## What's in it

- **Per-dungeon pages** — the three things that actually kill groups, progress
  gates, dispel demand, interactable buffs, a full interrupt/dispel/purge call
  sheet, encounter cards, trash by area, a pug route, loot, and the sources behind
  each page.
- **Per-boss raid pages** — the Venomous Abyss drawn as it actually is (a fork,
  not a line), phase by phase, with a Normal/Heroic toggle that never hides
  content silently, per-boss loot with tier tokens marked, and an honest gap where
  no source has tested the final boss yet.
- **Cross-cutting mechanics and loot indexes** spanning both modules, filterable
  by what counters an ability or what a piece is — and by where it comes from.
  Filters live in the URL, so a filtered view is a link you can send someone.
- **Open disputes** — where sources contradict each other, both positions are shown
  with dates, tiers, and what would settle it. Nothing is quietly picked.

## How it's sourced

| Tier | Sources | Treatment |
| :--- | :--- | :--- |
| 1 | Blizzard directly — patch notes, hotfixes, the in-game Encounter Journal | Settles a question outright |
| 2 | Wowhead, Icy Veins | Reliable, not infallible |
| 3 | Established creators | Strong on synthesis, weak on citation; numbers drift with hotfixes |
| 4 | SEO and boosting sites | Corroboration only, never load-bearing |

Hover any source mark in the site to see who said it, when, and at what tier.

**Damage numbers are deliberately qualitative.** Blizzard's Encounter Journal
publishes exact figures, but those are measured at one difficulty and scale with key
level and affixes — quoting them would be precise and wrong. Percentages, durations,
radii and stack thresholds don't move, so those are quoted exactly.

## Corrections

Open an issue. Say what's wrong, and where you saw otherwise — a source beats an
assertion. Contradictions are especially welcome; they usually mean something moved.

## Technical

A static site: an HTML shell, one stylesheet, five plain scripts (two of them
data), and folders of images and icons. No build step, no dependencies, no
tracking, no analytics. Images load lazily per page; the only external request
is a Google Fonts stylesheet. It works offline from a local checkout.

## Licensing and attribution

This is a non-commercial fan project and is not affiliated with, endorsed by, or
sponsored by Blizzard Entertainment.

World of Warcraft and all associated names, imagery and game data are the property
of Blizzard Entertainment, Inc. Screenshots, ability icons and game data are used
here under Blizzard's fan content policy. The ability icons in `assets/icons/` are
Blizzard's own art, identified by matching ability names against Wowhead's spell
database and served from this repository so the page makes no third-party
requests for them.

Source material from third-party guides is **paraphrased, never reproduced**, and
attributed with links back to the originals in the site's source ledger. If you
publish one of those sources and want something changed or removed, open an issue
and it will be.

The original writing, structure and code are free to reference and learn from.
Please don't republish the compendium wholesale.
