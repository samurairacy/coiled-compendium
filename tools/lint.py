#!/usr/bin/env python3
"""Editorial linter for the compendium's prose. Stdlib only.

    python tools/lint.py            # report; exit 1 only on ERROR
    python tools/lint.py --strict   # exit 1 on WARN too
    python tools/lint.py --quiet    # only print findings

`check.py` guards STRUCTURE — does the file parse, do the counts agree, do the
icons exist on disk. This guards the WRITING, because that is where the defects
actually came from once the data got big enough to be edited by sweep rather
than by hand. Every rule below is a defect class that shipped:

  dup-sentence   an append-instead-of-replace sweep left eight sentences
                 repeated back-to-back inside one field (2026-08-25)
  stale-name     five dungeon killer entries and four glossary decoder rows
                 still named bosses by names this project had renamed away
  clone          Sszorak's tank and DPS play were the Coiled Altar's ghost
                 text verbatim — a copy-paste that told a tank to freeze
                 Manifestations on a boss that has none
  orphan-source  tk_tank sat in SOURCES for nine days cited by nothing, so a
                 whole transcript looked incorporated and was not
  attribution    prose naming a creator ("Tactyks opens at Flame+Blood") in a
                 row that does not cite them
  leak-heroic    Heroic-only content sitting in a both-difficulties field
                 instead of briefh/bh/hh, where a skimmer never sees it
  unevidenced    a one-shot or wipe badge on a row whose own text never says
                 it kills — the bar those badges exist to hold
  raid-only      hh/df/lh/bh/briefh/playh on a Mythic+ row, where there is no
                 difficulty axis for them to mean anything
  unknown-key    a typo'd field name is silently ignored by JavaScript

Findings are ERROR (this is wrong) or WARN (this is suspicious and may be
deliberate). Anything deliberate gets an entry in ALLOW below, which is a
record of the decision rather than a suppression.
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = lambda *p: os.path.join(ROOT, *p)
read = lambda *p: io.open(R(*p), encoding="utf-8").read()

STRICT = "--strict" in sys.argv
QUIET = "--quiet" in sys.argv

# ── deliberate exceptions ─────────────────────────────────────────────────
# A wrong name that appears ON PURPOSE. Each entry is a decision, not a mute:
# say why, so the next person can tell a kept one from a missed one.
ALLOW = {
    "Zul'jin": "Zul'jan's dead father, a real and different character",
    "Atal'Dazar": "a real, different BfA dungeon — named to warn readers off it",
    "Neltharion": "a real, different place — named to warn readers off it",
    "Aku'mai": "a real Blackfathom Deeps name — the point of the decoder row",
    "Corrupted Guardian": "the MOB; CORRECTIONS files it against the ability "
                          "Unstable Corruption, but prose naming the caster is right",
}

FINDINGS = []
def bad(level, rule, where, msg):
    FINDINGS.append((level, rule, where, msg))

# ── field extraction ──────────────────────────────────────────────────────
STRFIELD = re.compile(r'(?<![A-Za-z0-9_])([a-z][a-zA-Z]{0,6}):"((?:[^"\\]|\\.)*)"')
ARRFIELD = re.compile(r'(?<![A-Za-z0-9_])([a-z][a-zA-Z]{0,6}):\[([^\]]*)\]')

# Keys the data is allowed to use. A typo outside this set is dead weight that
# JavaScript will never complain about.
KNOWN = set("""
 id n o k a t c r s e h hh d p x u b w q lv sub shape brief briefh bh play playh
 alt img jp map sl ty tc ic ro rc es lh th sev df gap pos short blurb bosses
 cov cov2 loc timer routing dispels killers gates buffs reads route loot areas
 tank healer mdps rdps dps
 mobs encounters calls rewards noLoot isNew origin sigil banner name i l
 patch opens minIlvl entrance fork wings ids after converge difficulties
 schedule ilvl brackets crests way trigger m won by extra dg v zone tp note
""".split())

# creator display name -> source-key prefix that would justify naming them
ATTRIB = [("Tactyks", "tk_"), ("Method", "me_"), ("Icy Veins", "iv_"),
          ("Sha", "sha_"), ("wow.gg", "wg_"), ("Wowhead", "wh_"),
          ("Ready Check", "rcp_"), ("BrettStefani", "bs_"), ("JFunk", "jf_")]

LETHAL_WORDS = re.compile(
    r"kill|lethal|fatal|death|dies|die\b|wipe|obituary|does not survive|"
    r"does not outlive|stops existing|raid-end|run-end|is over|"
    r"ends the (raid|group|run|pull|encounter)", re.I)


def logical(src):
    """Fold an object's continuation lines onto the line that opened it.

    Mythic+ writes one ability per physical line; the raid wraps e:, h: and hh:
    onto their own lines. A line-based reader that does not fold sees a raid
    ability as a bare t: with no prose, which is how the first draft of this
    file cleared every raid row of a check it should have failed.
    """
    out, start, buf = [], 0, ""
    for i, ln in enumerate(src.split("\n"), 1):
        if re.match(r"\s*\{", ln):
            if buf:
                out.append((start, buf))
            start, buf = i, ln
        elif buf:
            buf += " " + ln.strip()
    if buf:
        out.append((start, buf))
    return out


def objects(src, fname):
    """Yield (line-number, string-fields, array-fields, raw)."""
    for i, ln in logical(src):
        if '{n:"' not in ln and '{id:"' not in ln:
            continue
        strs = {}
        for m in STRFIELD.finditer(ln):
            strs.setdefault(m.group(1), []).append(m.group(2))
        arrs = {k: re.findall(r'"([^"]*)"', v) for k, v in
                ((m.group(1), m.group(2)) for m in ARRFIELD.finditer(ln))}
        yield i, strs, arrs, ln


# ── load ──────────────────────────────────────────────────────────────────
FILES = {f: read("js", f) for f in ("data-shared.js", "data-mplus.js", "data-raid.js")}
DATA = {f: s for f, s in FILES.items() if f != "data-shared.js"}
shared = FILES["data-shared.js"]

# ── 1 · a sentence repeated immediately after itself ──────────────────────
for fname, src in FILES.items():
    for i, strs, _, _ in objects(src, fname):
        for key, vals in strs.items():
            for v in vals:
                parts = [p.strip() for p in re.split(r"(?<=[.!?]) ", v)]
                for a, b in zip(parts, parts[1:]):
                    if a == b and len(a) > 25:
                        bad("ERROR", "dup-sentence", "%s:%d %s:" % (fname, i, key),
                            "sentence repeated back to back: %s..." % a[:60])

# ── 2 · names this project renamed away, still in prose ───────────────────
corr = re.search(r"const CORRECTIONS=\[(.*?)\n\];", shared, re.S)
WRONG = {}
if corr:
    for row in re.finditer(r'\["([^"]*)","([^"]*)"', corr.group(1)):
        for w in [x.strip() for x in row.group(2).split(",")]:
            right = row.group(1)
            if re.sub(r"^(A|The) ", "", right).lower() == w.lower():
                continue                  # "A Knot of Snakes" vs "Knot of Snakes"
            if len(w) > 4 and w not in ALLOW:
                WRONG.setdefault(w, right)
for fname, src in DATA.items():
    for i, strs, _, raw in objects(src, fname):
        if re.search(r"(?<![A-Za-z])(id|sl):", raw):
            continue          # loot row: the tooltip quotes Blizzard, not us
        for key, vals in strs.items():
            for v in vals:
                for w, right in WRONG.items():
                    if re.search(r"(?<![A-Za-z'])%s(?![A-Za-z'])" % re.escape(w), v):
                        bad("ERROR", "stale-name", "%s:%d %s:" % (fname, i, key),
                            '"%s" is the WRONG name; canonical is "%s" '
                            "(add to ALLOW if deliberate)" % (w, right))

# ── 3 · the same paragraph on two different entities ──────────────────────
seen = {}
for fname, src in DATA.items():
    for i, strs, arrs, raw in objects(src, fname):
        if "id" in strs or re.search(r"(?<![A-Za-z])(id|sl):", raw):
            continue          # a loot row: two items sharing tooltip text is real
        owner = (strs.get("n") or ["?"])[0]
        for key in ("tank", "healer", "mdps", "rdps", "dps", "brief", "sub", "e", "h"):
            for v in strs.get(key, []):
                if len(v) < 60:
                    continue
                if v in seen and seen[v][1] != owner:
                    bad("ERROR", "clone", "%s:%d %s:" % (fname, i, key),
                        'identical text already used by "%s" at %s — copy-paste?'
                        % (seen[v][1], seen[v][0]))
                seen[v] = ("%s:%d" % (fname, i), owner)

# ── 4 · sources registered and never cited ────────────────────────────────
declared = set(re.findall(r'^\s*(\w+)\s*:\{l:"',
               re.search(r"const SOURCES=\{(.*?)\n\};", shared, re.S).group(1), re.M))
body = "".join(DATA.values()) + shared
used = set()
for m in re.finditer(r'\b(?:s|rc)\s*:\s*(?:\[([^\]]*)\]|"(\w+)")', body):
    used |= set(re.findall(r'"(\w+)"', m.group(1) or '"%s"' % m.group(2)))
for k in sorted(declared - used - {"img"}):
    bad("WARN", "orphan-source", "SOURCES", '"%s" is declared and cited nowhere '
        "— a transcript that looks incorporated and is not" % k)

# ── 5 · prose that names a creator the row does not cite ──────────────────
for fname, src in DATA.items():
    for i, strs, arrs, _ in objects(src, fname):
        keys = set(arrs.get("s", []))
        if not keys:
            continue   # unsourced by design (briefs, play blocks) — nothing to check
        for key in ("e", "h", "hh", "brief", "briefh", "bh"):
            for v in strs.get(key, []):
                for name, prefix in ATTRIB:
                    named = re.search(r"(?<![A-Za-z])%s(?![A-Za-z])"
                                      % re.escape(name), v)
                    if named and not any(k.startswith(prefix) for k in keys):
                        bad("WARN", "attribution", "%s:%d %s:" % (fname, i, key),
                            'names "%s" but cites no %s* source' % (name, prefix))

# ── 6 · Heroic content in a field both difficulties read ──────────────────
for i, strs, _, _ in objects(DATA["data-raid.js"], "data-raid.js"):
    for key in ("e", "h", "brief"):
        for v in strs.get(key, []):
            if re.search(r"\bon Heroic\b|\bHeroic (adds|only|gains|makes)", v) \
               and "On Normal" not in v and "on Normal" not in v:
                bad("WARN", "leak-heroic", "data-raid.js:%d %s:" % (i, key),
                    "Heroic-specific text in a field both difficulties render "
                    "— belongs in briefh/bh/hh")

# ── 7 · a skull badge the row's own text does not evidence ────────────────
for fname, src in DATA.items():
    for i, strs, arrs, _ in objects(src, fname):
        tags = set(arrs.get("t", []))
        if not tags & {"oneshot", "wipe"}:
            continue
        blob = " ".join(sum((strs.get(k, []) for k in ("e", "h", "hh")), []))
        if not LETHAL_WORDS.search(blob):
            bad("WARN", "unevidenced", "%s:%d" % (fname, i),
                "%s tagged but the row's own text never says it kills — the bar "
                "is that it does" % "/".join(sorted(tags & {"oneshot", "wipe"})))

# ── 8 · raid-only fields on a Mythic+ row ─────────────────────────────────
for i, strs, arrs, ln in objects(DATA["data-mplus.js"], "data-mplus.js"):
    for k in ("hh", "bh", "briefh", "playh", "df", "lh"):
        if re.search(r'(?<![A-Za-z]){k}\s*:'.replace("{k}", k), ln):
            bad("ERROR", "raid-only", "data-mplus.js:%d" % i,
                "%s: has no meaning in Mythic+ — there is no difficulty axis" % k)

# ── 9 · a field name JavaScript will silently ignore ──────────────────────
for fname, src in DATA.items():
    for i, strs, arrs, _ in objects(src, fname):
        for k in set(strs) | set(arrs):
            if k not in KNOWN:
                bad("ERROR", "unknown-key", "%s:%d" % (fname, i),
                    '"%s:" is not a field this project reads — typo? '
                    "(add to KNOWN if new)" % k)

# ── 10 · empty strings, stray whitespace, duplicate names in one parent ───
for fname, src in DATA.items():
    for i, strs, _, _ in objects(src, fname):
        for k, vals in strs.items():
            for v in vals:
                if not v.strip():
                    bad("ERROR", "empty", "%s:%d %s:" % (fname, i, k), "empty string")
                elif v != v.strip() or "  " in v:
                    bad("WARN", "whitespace", "%s:%d %s:" % (fname, i, k),
                        "leading/trailing space or a double space")

for fname, src in DATA.items():
    parent, names = None, {}
    for i, strs, _, ln in objects(src, fname):
        if re.match(r'\s{1,4}\{n:"', ln) or "mobs:[" in ln or "trigger:" in ln:
            parent, names = (strs.get("n") or ["?"])[0], {}
        for v in strs.get("n", []):
            if v in names and parent:
                bad("ERROR", "dup-ability", "%s:%d" % (fname, i),
                    'two rows named "%s" under "%s"' % (v, parent))
            names[v] = i

# ── 11 · play blocks with a role key nobody renders ───────────────────────
ROLES = {"tank", "healer", "mdps", "rdps", "dps"}
for fname, src in DATA.items():
    for i, _, _, ln in objects(src, fname):
        for m in re.finditer(r'play h?:\{|play:\{|playh:\{', ln.replace("playh:{", "playh:{")):
            seg = ln[m.end():ln.find("}", m.end())]
            for k in re.findall(r'(?<![A-Za-z])([a-z]+):"', seg):
                if k not in ROLES:
                    bad("ERROR", "play-role", "%s:%d" % (fname, i),
                        '"%s" is not a role the play block renders' % k)

# ── report ────────────────────────────────────────────────────────────────
errs = [f for f in FINDINGS if f[0] == "ERROR"]
warns = [f for f in FINDINGS if f[0] == "WARN"]
for level, rule, where, msg in errs + warns:
    print("  %-5s %-14s %-28s %s" % (level, rule, where, msg))
if not FINDINGS and not QUIET:
    print("  ok   editorial lint clean")
print("\nlint: %d error%s, %d warning%s"
      % (len(errs), "" if len(errs) == 1 else "s",
         len(warns), "" if len(warns) == 1 else "s"))
sys.exit(1 if errs or (STRICT and warns) else 0)
