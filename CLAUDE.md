# CLAUDE.md — orientation for a fresh instance

The Coiled Compendium: a sourced reference for World of Warcraft: Midnight,
patch 12.1, Season 2 — in two modules: **Mythic+** (eight dungeons) and
**Raid** (The Venomous Abyss, Normal and Heroic). Published as a static site
on GitHub Pages at **https://samurairacy.github.io/coiled-compendium/**.

Start with README.md for what the site is, how it's sourced, and the
licensing position the project depends on.

## Architecture

Since 2026-08-17 the site is a small `index.html` shell over split files.
**Load order is the contract** — six classic scripts with `defer`, which
preserves document order and keeps the site working from `file://`:

    index.html            shell: head, icon sprite, nav, page containers
    css/app.css           the stylesheet
    js/data-shared.js     SOURCES, TAGS/CTRS, SEASON, DISPUTES, IMG,
                          ICONS, CORRECTIONS — vocabulary both modules use
    js/data-mplus.js      DUNGEONS (+ D map, ROUTING)
    js/data-raid.js       RAID (+ RB map)
    js/render.js          helpers and every page function
    js/wishlist.js        wishlists: store, CRUD, insights, voidcore odds
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

**No ability object may name the same key twice**, and this one is worth
knowing about because it is invisible: JavaScript takes the last occurrence
and says nothing. Nineteen rows carried `t:` (one `c:`, one `h:`) twice, so
the first array had been dead code for months — harmless until the 2026-08-25
lethality sweep wrote a tag into the dead half and it never rendered. The
duplicates are merged and `check.py` now fails on any recurrence.

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
- **The spec facet models weapons per SPEC, not per class.** `SPECS` carries
  [class, spec, primary, weapon types, hand slots, loot role]; `WCLASS` now
  holds only
  armour. This is load-bearing: Beast Mastery and Marksmanship take ranged and
  no melee, Survival melee and no ranged; Assassination and Subtlety are
  daggers only, Outlaw anything but; Retribution is two-handed and shieldless,
  Protection the reverse; no Death Knight spec takes a shield. Axe, Mace and
  Sword all exist in both hands this season, so the hand gate is real. Some
  correct answers are emergent rather than stated — Fury sees no staff because
  every staff is Agi or Int — so **do not fix a spec by widening its list
  until you have checked whether the stat gate is doing the work.**
  `tools/check.py` asserts 40 specs, 13 classes, no duplicates, that
  every claimed weapon type exists in the data, and that the role split is
  6 tank / 7 healer / 15 mdps / 12 rdps. **Devourer is an Intellect ranged
  spec, not the Agility melee one it looks like** — it is the third Demon
  Hunter spec and shares Havoc's and Vengeance's proficiencies, so the only
  thing separating them is the stat. Every warglaive in the data is `Agi/Int`,
  which is the game making room for exactly this; the effect is that Devourer
  emergently sees 3 warglaives, 2 Int swords and 1 Int axe while every Fist
  weapon (all Agi) correctly vanishes. **Alone among the loot
  groups it is single-select** — "what can my spec use" is a question about
  one character, and two specs at once answers nobody. So `LFACETS.spec` is
  a plain string, not a Set, which is all the delegated handler needs to
  make it exclusive; the `%2F` in its key rides the hash unescaped so a
  shared link reads `?spec=Hunter/Survival`. Class and spec icons come from
  `CLASSICON`/`SPECICON` via `clsIcon()`/`specIcon()` — same missing-key
  contract as `abilIcon()`. Devourer, being new, has no published spec icon
  and carries a documented stand-in.
- **Trinket `ro` answers "whose loot table is this on", not "who benefits".**
  It is not decorative: since 2026-08-17 `specCan()` gates trinkets on it, so
  a wrong `ro` silently misfilters the spec facet. `rc:` is a source key for
  eligibility *seen in game*, and it **outranks every rule below** — the chips
  drop the unconfirmed tooltip and wear a tick, and `check.py` exempts those
  rows. **All 41 trinket roles are observed** as of 2026-08-17 — the owner
  walked both modules in game — so `ro` is *data*, not a reading, and the page
  no longer disclaims it: the "UNCONFIRMED: Role" facet heading and the
  per-option prefixes are gone, because a disclaimer that undersells the data
  misinforms just as surely as one that oversells it. The tick went too, being
  uniform across 41 rows; the dashed-vs-solid chip border still carries the
  distinction, so a row added later without a look wears the dashed default and
  says so in its tooltip. **The sweep found 13 of 41 wrong** — nine gained
  `tank`, one gained `healer`, one *lost* `mdps`, and four confirmed as
  genuinely DPS-only. Adding a new trinket means adding a guess: mark it
  without `rc:` and leave it dashed rather than quietly joining it to the
  verified set.
- **The rule "a purely offensive proc is DPS-only" is FALSIFIED. Do not
  restore it.** It was in this file for a day. Then Coiled Fangstone — `Str`,
  a pure damage Use, no stat grant, nothing defensive anywhere in it — turned
  out to be on the Strength *tank* table, observed in game, as did
  Blazebinder's Hoof (no primary stat at all, a Strength grant with a damage
  payload). Tanks share the Str/Agi gear pool, and the game appears to gate
  trinkets mostly on **stat**, narrowing by role only for genuinely
  role-specific effects. So an offensive effect is **no evidence at all**
  against tank eligibility, and the Str/Agi trinkets still marked DPS-only are
  therefore *unverified*, not settled.
- **But no replacement rule works either, and this is the important part.**
  The obvious repair — "Str/Agi trinkets are simply tank-eligible too" — is
  itself falsified: the **Tattered Amani War Banner is confirmed mdps-only in
  game**, and it is `Str/Agi` with a stat-granting Use, the same shape as
  Blazebinder's Hoof and Resonant Bellowstone, both of which *are* tank-
  eligible. Three items of one shape, two answers. **Trinket loot eligibility
  is per-item and is not derivable from the tooltip.** It is a table Blizzard
  authors item by item, so the only thing that settles a role is looking, and
  `rc:` is how the data records that it was looked at. Do not "tidy" the
  remaining inferred rows in either direction, and do not reason from one
  trinket to its shape-mates — the banner is the standing proof that the
  shape does not carry the answer. **Tiny Electromental in a Jar** is a second
  confirmed melee-DPS-only item, and **Tumor of the Swarm runs the other way
  entirely**: an attack-triggered damage proc with a self-heal, confirmed
  tank-**only**, with melee DPS ineligible. That one is unreachable from the
  tooltip by any rule in either direction, and it is why the M+ set was worth
  walking item by item instead of being reasoned about.
- **The tank direction of the rule still holds.** A defensive primary makes a
  tank trinket even when it also deals damage, because that damage is usually
  contingent on tanking (damage absorbed, health lost, dodge/parry/block).
  Manaheart's Binding Flame read `tank`+`mdps` and was wrong: it is an absorb
  shield whose stored damage erupts when the shield breaks, so the eruption is
  *paid for* by having been hit. DPS are **ineligible to loot** a tank trinket
  even in a season where the meta wants them to have one; a class with no tank
  spec of its own needs an uncontested greed roll or a gift. What no longer
  follows is the converse — an offensive primary does not mean "not a tank's".
  An ally heal or shield is still a healer's.
- **A trinket with no primary stat line can still be stat-gated by the stat it
  grants** — a Strength proc is not on a rogue's loot table. `es:` carries
  that, and only on the two rows where it changes an answer (Blazebinder's
  Hoof, Idol of the War Loa). Four more name a stat but would gate nothing
  their `ro` does not already: "Strength or Agility" spans every melee spec,
  and Intellect is implied by `rdps`/`healer`. Don't add `es` by analogy.
- `check.py` asserts no **inferred** tank+DPS straddle outside the
  all-three-primaries stat sticks. That is a heuristic tripwire against
  editorial guessing, not a law — `rc:` rows are exempt precisely because
  observation keeps breaking it. It has already lost its own counter-example:
  Sapling of the Dawnroot was cited here as all-three-primaries-but-damage-only
  and therefore DPS-only, and it is observed eligible for **everyone**, tanks
  and healers included. Every all-three-primaries trinket in the data is now
  confirmed or presumed universal.
  **Two axes wear the same words — check which field you are editing.**
  Loot `ro` is the *gear pool*: every hunter takes Agility, so all three
  specs read `mdps` there. Ability `r` is *positioning*: Beast Mastery and
  Marksmanship are `rdps`, and **Survival is a real melee spec — `mdps` on
  both axes.** So "hunter" is never a synonym for either label; only the
  spec settles it, and a mechanic that baits melee reaches Survival.
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
- **`play:` answers "what do I do", which is a different question from what
  the mechanics answer.** Every encounter and raid boss carries
  `play:{tank,healer,mdps,rdps}` — `dps` is shorthand accepted for both DPS
  lenses, and a missing role simply does not render. `playBlock()` filters on
  the role lens, so choosing Tank collapses a page to one paragraph plus the
  rows carrying `r:["tank"]`, which is the whole point: the owner could read a
  mechanic and still not know the job. The ability-level `h:` is the same idea
  at cast resolution and is labelled **PLAY**, not READ — the rename is load-
  bearing, because READ invited editorial commentary and PLAY demands an
  instruction. Trash carries a one-line `play:` and a **threat grade derived
  from its worst ability severity** (`th:` overrides only where volume makes a
  mob dangerous without any single scary cast), so filler reads quiet and the
  run-enders read loud.
- **"How bad is it" is TWO questions and they are kept apart.** *Severity*
  (`sev:1..3`) grades what one failure **costs**; *lethality* (`oneshot` /
  `wipe` in `t:`) says whether the mechanic **kills**. They are orthogonal —
  a Punishing mechanic can still one-shot, and most Run-enders never kill
  anyone outright. **Severity now prints the word, never the number.** The
  bare "Severity 3" told a reader nothing actionable and, because 1s and 2s
  were never rendered at all, the scale read as an in-joke with one member;
  `SEVS` in data-shared holds the names (Chip / Punishing / Run-ender), level
  1 renders nothing, and `sevLegend()` says so on every page that lists
  abilities. **The bar for the two skull badges is deliberately high and
  deliberately checkable: the row's own sourced text must say it kills a
  player outright or ends the group, and the failure the mechanic itself
  defines must produce that death with no second event required.** Compounds
  stay untagged at the severity they earn — "lethal if it overlaps anything
  else" (Blade Dance), "a string of avoids is what makes him lethal"
  (Punishing Might), "blocking a beam and THEN eating a melee" (Galvanized),
  "eating these is simply death" via a later buster (Sickening Bite). 21 rows
  carry a tag out of 417. **Do not widen this by analogy** — a badge that
  quietly meant "probably quite bad" is a badge nobody reads twice. Lethality
  rides in `t:` so the mechanics index filters it for free, but never renders
  as an ordinary chip: it is lifted out beside the name like Mythic-only.
  `lh:1` marks lethality that only exists on Heroic (raid-only; check.py
  enforces both that and that `lh` never appears without a tag).
- **Every phase and every trash area states an OBJECTIVE.** `brief:` on the 24
  raid phase objects and the 24 Mythic+ `areas` entries, rendered under the
  header by `objBlock()`. This is the rung that was missing: a boss page went
  from "what the whole fight is" straight to a list of casts, so anyone
  wanting the shape of a phase had to read six abilities and synthesise it —
  which is the guide's job, not the reader's. The register is what the section
  is *for* and what stops you. `check.py` fails if any of the 48 is absent.
- **The difficulty axis** exists only in the raid: `df:["h"]` marks
  Heroic-only abilities (absence means both — never write `["n","h"]`,
  the checker enforces it), `hh:` carries a Heroic addendum. The toggle
  persists in localStorage, rides the URL as `?d=h`, and **never hides
  silently**: on Normal, Heroic-only rows collapse to a counted line, and
  that count now includes `hh:` amendments to rows that *are* shown.
- **Heroic has to be visible without being read.** It used to be one sentence
  at the end of a brief paragraph — invisible to a skimmer. Four fields carry
  it now and all render through `heroLine()` behind a flag: `briefh:` on the
  boss, `bh:` on a phase, `playh:{tank,healer,mdps,rdps,dps}` beside the
  matching role row, and the existing ability `hh:`. **`hh` stays Heroic-gated
  (it is an in-fight instruction); the other three render on both difficulties
  (they describe the fight, and a Normal reader is entitled to know what
  changes).** The flag colour is `--heroic`, a warm rose, and it is
  load-bearing that it is **constant across all eight boss accents** — the
  raid palette runs green → cyan → blue → violet, so the one warm hue means
  "this line is about the other difficulty", never "this is Sszorak".
- **Ula'tek WAS the named gap and no longer is — note how it closed.** Two
  sources landed on 24–25 Aug: Blizzard's **Encounter Journal for the Heroic
  encounter** (`wh_ej`, tier 1) and **one** published Heroic strategy guide
  (`sq_ula`, Squishei, new to the ledger). They do different jobs and the page
  keeps them apart: **the journal owns every name, radius, duration and
  threshold; the guide owns the strategy and nothing else.** The journal also
  *explains* the guide rather than merely agreeing with it — Soul Constrictor
  is why you soak only every other Spectral Coil, Warden's Protection is why
  the warden dies before anyone touches an egg. Four stages now, journal-named:
  Fury of the Serpent Mother, Children of the Doomscale, The Shattering,
  Ula'tek's Ascension. **Strategy there is still single-sourced**, and the
  Stage Two tether skip may not survive a hotfix; the page says both. Most of
  her 20 abilities wear the red question mark because Wowhead's spell database
  has nothing for this raid yet — `/spells/name:` returns empty even for
  abilities we have had for weeks, so an icon pass waits on the database
  rather than on effort.
- **The ledger now has a POST-LAUNCH tier of one, and it outranks theory.**
  `tk_hero` (21 Aug 2026) is a guild describing what week one actually did;
  everything else in this repository was written before the raid opened.
  Where the two disagree, the live source wins **and the row says so out
  loud** — see Vashnik below. Do not quietly average them.
- **The Vashnik "never drink the same fountain twice" rule is FALSIFIED.**
  It was in the data as an iron rule. Week one walks a plain counter-clockwise
  circle that deliberately doubles Blood, because the never-repeat rotation
  loads three stacks onto Shadow and Flame instead and pays for it in raid
  damage and add health. The pre-launch rule was a reasonable inference from
  the tooltip; it is not what the fight rewards.
- **Sha is new to the ledger and is treated that way.** Tier 3, own footage,
  all 28 encounters from the tank's chair — but nothing in the project
  corroborates it yet. Where it is the only source for a claim the prose says
  so ("one tank guide reports"), and its two disagreements with Tactyks
  (Hoardmonger pile order, whether Void Cascade is a tank soak) are filed as
  open questions rather than resolved by whichever was read last.
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
- **Wishlists are local-first and id-keyed.** `js/wishlist.js` owns the
  feature: routes `#/wl`, `#/wl/<key>`, `#/wl/import?…`; one localStorage
  key `cc-wl` (`{v:1,active,lists:[{k,name,cls,items:[{id,star}]}]}`), read
  lazily behind try/catch so a corrupt blob degrades to an explained empty
  state and can never brick the router. Items serialize on **Wowhead ids**
  — `check.py` asserts all 312 loot rows carry one, uniquely — because 57
  names changed this season and ids didn't. **Sharing is sending a
  snapshot**, never a live link: `#/wl/import?i=<id[s]>.<id>…&n=…&c=…`
  (dot-joined, `s` marks a star) opens a preview whose one action is "Save
  a copy". An id that stops resolving renders as a tombstone, counted and
  named, never silently dropped; an item no spec of the list's class can
  loot wears a flag and is excluded only from the odds arithmetic (an
  eligible groupmate can still trade it). Trinkets auto-star on add. The
  module's delegated listener matches `[data-wl]` only — same qualifier
  discipline that keeps mechanics (`[data-f]`) and loot (`[data-lf]`)
  from eating each other's clicks.
- **Voidcore odds are exact, and the mechanics are owner-verified in game**
  (2026-08-17): a core draws uniformly from the dungeon's — in the raid,
  that boss's, offered after the kill — loot table filtered to your **loot
  spec** (not active spec); a received item leaves the pool (no
  duplicates) until the pool empties and resets. Without replacement the
  closed forms are: single roll `W/T`, expected rolls to first wished hit
  `(T+1)/(W+1)`, guaranteed within `T−W+1`. All rendered numbers assume a
  fresh pool and say so. Cores are capped at 2 purchasable a week plus 1
  via 6 Tokens of Merit from the Vault (≥3 slots filled) — "2–3 a week".
  `specCan()` is the denominator, which is why the spec-filter gates and
  the observed trinket `ro` are load-bearing arithmetic, not just filters.
- **Mobs carry a gravity tier in `k`** (`mini`→`lt`→`caster`/`trash`→
  `fodder`), and the trash card styles itself from it.
- **Two sticky bars, and the second one is measured, not guessed.** The
  dungeon/boss switcher parks at `top:var(--bar)`; the dungeon page's own tab
  bar (`.tabs.stick`) parks under both at `calc(var(--bar) + var(--dsw))`.
  `--dsw` is set by `route()` in app.js from the switcher's actual
  `offsetHeight` after every paint, and is 0 on pages with no switcher. **Do
  not hard-code it** — a literal pixel value becomes a gap or an overlap the
  first time someone changes their browser's text size.
- **Accents do the wayfinding.** `[data-dungeon]` sets `--d-accent` per
  dungeon; raid pages reuse the same `--d-*` names via `body[data-raid]`
  and `[data-boss]`, so every accent-driven component works on both
  modules without a second stylesheet. The raid palette is a descent
  measured in Lab — venom green (`--r-accent`, dE≥39 from all eight
  dungeon accents) down through drowned cyan into abyssal violet, L* 70→58.
- **Boss imagery comes in two kinds, and the caption must not lie about
  which.** In-game captures (owner screenshots, nameplate in frame, source
  `img`) cover 24 of 28 M+ encounters and always win over catalog art.
  **Dungeon-journal model portraits** (owner-captured from the Adventure
  Guide 2026-08-18, cropped to the parchment panel, keys `j-*`, source
  `wh_ej`, display names in `JNAMES`) fill the true gaps: all of Temple of
  Sethraliss plus seven raid bosses — member fights carry arrays rendered
  side by side (`jp:["j-vexhul","j-ithraz"]`), captioned with the member
  roll. `bossMedia()` in render.js branches caption and alt text on the
  `j-` prefix; `check.py` asserts every `img:`/`jp:` `j-` key resolves in
  `IMG`. **Entombed Sentinels is the one raid boss with no portrait** — no
  capture exists; leave it bare rather than substituting a guide site's
  image, which would break the README's position. `hban` stays reserved
  for future wide in-world captures (`b.img`), and 66 further processed
  portraits (adds, minis, alternate forms) sit git-ignored in
  `docs/filedrop-processed/` awaiting homes.
- **The homepage status line computes live** against the Season 2 start of
  18 Aug 2026 (the raid opens the same week). A stale-looking homepage is
  usually just the calendar.
- **Ability icons are keyed by name, not ID.** `ICONS` (380 entries) maps
  name → Blizzard slug; `abilIcon()` renders `assets/icons/<slug>.jpg`.
  **A name without an entry wears the classic red question mark**
  (`inv_misc_questionmark`, asserted on disk by `check.py`), never an empty
  spacer — so a rename that forgets `ICONS` is visible, not silent. The
  2026-08 audit closed most gaps by discovering they were **naming errors,
  not missing spells**: 22 abilities were renamed against Wowhead spells
  whose descriptions match our effect text and encounter (Hydro Strike →
  Hydrastrike, Cut Purse → Cutpurse, Awaken Welps → Awaken Whelps…), each
  feeding CORRECTIONS like every other rename. The 25 names still on the
  question mark are structural rows (Add Phase, Two-phase structure),
  council NPCs used as ability rows (King Akul, Queen Phat'ta), or
  mechanics Wowhead has no spell for — itemised with reasons in the
  git-ignored audit report. **Search variant spellings before declaring a
  name iconless**: word joins, singulars and the Whelps/Welps class of typo
  found 22 of 26; exact-match-only found none of them. The shared map also
  means cross-module name reuse pays: raid Axegrinder inherited the M+
  icon for free.

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
- **Pages serves JS/CSS with `max-age=600`**: after a push, index.html is
  fresh but scripts can stay stale for up to ten minutes. When live-checking
  a deploy, verify with `fetch(url, {cache:"no-store"})` before diagnosing —
  a "broken" deploy that is ten minutes old is usually just this.
- **The same trap bites the local dev loop, harder.** A browser will hold
  `js/*.js` across an ordinary reload even when the local server is already
  serving the new bytes, so you read the OLD globals and misdiagnose a
  correct edit as a code bug. Order of trust: `curl` the file off disk and
  off the server first, `tools/check.py` second, the browser last. When the
  browser must be believed, **restart the server on a new port** — a new
  origin gets a new cache, and it is faster than any amount of cache-busting.
  Cache-busting `index.html` does nothing here, and `document.write`ing the
  scripts into a live realm throws on `const` redeclaration, so the new code
  never runs at all. When a new port is unavailable (the in-app browser can
  policy-block fresh origins), the working substitute is a throwaway shell
  whose script URLs are busted — new URL, no cache entry:
  `sed 's|src="js/\([a-z-]*\)\.js"|src="js/\1.js?v='$(date +%s)'"|g'
  index.html > dev-bust.html` — navigate to that, verify, delete it.
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
7. Wishlists: `#/wl` renders; + on a Loot row adds (creating a first list
   if none); the list survives a reload; a share link opens its preview in
   a private window and "Save a copy" works; the voidcore table shows
   denominator-honest fractions.
8. No console errors.

## Corrections and issues

Issues are enabled on purpose — the site is explicitly about surfacing
where sources disagree, so corrections are the point. Wikis, Projects and
Discussions are off.
