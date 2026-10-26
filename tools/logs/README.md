# tools/logs — the Log Analysis pipeline

How a raid night's combat log becomes a review on the site's **Log Analysis**
page (`#/logs`) and the matching PDF. Three steps, each a script:

```
WoWCombatLog-*.txt ──ulatek.py──▶ facts/<id>.json ──build.py──▶ js/data-logs.js
   (raw log,              (every number a        reports/<id>.py   assets/logs/<id>.pdf
    never committed)       review may quote)     (the prose)        (--pdf only)
```

## Adding a night

1. **List the log's encounters** to find the pulls you want:

   ```
   python tools/logs/combatlog.py "<path to WoWCombatLog.txt>"
   ```

2. **Analyse it.** For Ula'tek (encounter 3492):

   ```
   python tools/logs/ulatek.py "<path to log>" tools/logs/facts/ulatek-heroic-YYYY-MM-DD.json
   ```

   This reads the raw log directly (no pre-extraction; about 20 s for a 700 MB
   log) and writes the facts file. Commit the facts file and keep the log out
   of git: the log is hundreds of megabytes, and the facts are all a review
   needs.

3. **Write the report module** at `tools/logs/reports/<id>.py`, named the same
   as its facts file. It defines `ID`, `FACTS` and `report(F, facts)`, and
   returns the report as blocks. Copy the nearest existing module. The prose is
   yours to write; **every number in it should come from `F`**. `facts(name)`
   loads another night's facts, which is how a review compares itself with the
   last one. `blocks.py` holds the shared charts and tables, plus helpers such as
   `when()`, which computes the weekday rather than letting anyone type it.

4. **Build:**

   ```
   python tools/logs/build.py          # js/data-logs.js only (stdlib)
   python tools/logs/build.py --pdf    # and every PDF (needs reportlab, matplotlib)
   ```

5. **Check:** `python tools/check.py`. It fails if `js/data-logs.js` is not exactly
   what `build.py` produces, so a hand edit to the generated file cannot slip
   through, and it fails if a report module has no facts file.

## Conventions that cost a wrong number once

- **Pulls are `#n`, never `Pn`.** Warcraft Logs writes its *phases* as P1–P3,
  and a raider reading both read "P5" as a phase. Stages are "Stage One / Two /
  Three", which are WCL's P1 / P2 / P3.
- **The analyser's slices are not phases.** It cuts each stage at every Heart
  window and platform break because the damage rate changes there. The last
  Circling Prey leaves no platform, so that slice is the *final break*, not a
  fifth platform.
- **Boss health is read per pull.** It scales with raid size (874M at sixteen,
  930M at seventeen), and one value for the night understated every pull at the
  other size.
- **Alive counts include battle resurrections** (`blocks.alive_at`). A count of
  "roster minus deaths" was off by five in one pull.
- **Count each hit once.** The log writes every melee swing twice
  (`SWING_DAMAGE` and `SWING_DAMAGE_LANDED`) and writes absorbs as extra
  `SPELL_ABSORBED` rows. The first draft counted both and doubled Serpent's
  Bite tick counts. A fully absorbed hit is a `*_MISSED ABSORB`, and it still
  counts as a hit.
- **Targeting is measured from cast targets, not damage.** The log's own `ST` /
  `AOE` flag keeps cleave procs out of the mis-targeting cost.
- **A carrier who dies holding Serpent's Bite becomes the Calcified Corpse.**
  When the corpse appears the same instant the carrier dies, the circle did not
  fail; the carrier did.

## Files

| File | What it is |
| :--- | :--- |
| `combatlog.py` | Parsing primitives and the encounter lister. Stdlib. Realm names never leave it. |
| `ulatek.py` | The Ula'tek analyser: raw log in, facts out. Stdlib. Its docstring lists what it measures. |
| `blocks.py` | Shared formatting, charts and tables for report modules. |
| `build.py` | Report modules to `js/data-logs.js`, and to PDFs with `--pdf`. |
| `pdf.py` | The block-to-PDF renderer, in the site's theme. Needs reportlab and matplotlib. |
| `reports/*.py` | One module per review: the prose, with its numbers read from facts. |
| `facts/*.json` | One analysis per night, committed. |

A different boss needs its own analyser next to `ulatek.py`, with its spell IDs
and its own idea of a stage. The facts shape, `blocks.py`, `build.py`, `pdf.py`
and the site renderer (`js/logs.js`) stay as they are.
