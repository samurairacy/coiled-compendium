#!/usr/bin/env python3
"""Pre-push sanity for the compendium. Stdlib only; run from anywhere.

    python tools/check.py

Every check here is a defect class that has actually occurred:
  - a missing comma between ICONS lines broke the whole script (2026-08-17)
  - bosses: disagreed with encounters.length for months (fixed 2026-08-16)
  - CORRECTIONS aliases silently fell out of search when alt was retired
  - renaming an ability costs it its icon unless ICONS moves with it

This is not a JS parser. Blocks with strict shapes (ICONS, IMG, CORRECTIONS)
are JSON-parsed, which catches the comma class outright; DUNGEONS and RAID are
checked by targeted extraction. Browser smoke remains the syntax truth for
render/app (no Node on the dev machine).
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = lambda *p: os.path.join(ROOT, *p)
read = lambda *p: io.open(R(*p), encoding="utf-8").read()

FAIL = []
def check(ok, msg):
    print(("  ok   " if ok else "  FAIL ") + msg)
    if not ok: FAIL.append(msg)

shared = read("js", "data-shared.js")
mplus  = read("js", "data-mplus.js")
raid   = read("js", "data-raid.js")
render = read("js", "render.js")
app    = read("js", "app.js")
html   = read("index.html")

# ── 1. strict blocks must parse — this is the missing-comma tripwire ───────
def strict(name, src, wrap):
    m = re.search(r"const %s=(\{|\[)" % name, src)
    if not m:
        check(False, "%s: block not found" % name); return None
    open_c, close_c = wrap
    i = src.index(open_c, m.start())
    j = src.index("\n" + close_c + ";", i)
    body = src[i + 1:j]
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)          # comments out
    try:
        return json.loads(open_c + body + close_c)
    except Exception as e:
        check(False, "%s does not parse as a literal: %s" % (name, e)); return None

CLSI = strict("CLASSICON", shared, "{}")
SPCI = strict("SPECICON", shared, "{}")
check(CLSI is not None and len(CLSI) == 13, "CLASSICON has 13 classes (%s)" % (CLSI and len(CLSI)))
check(SPCI is not None and len(SPCI) == 40, "SPECICON has 40 specs (%s)" % (SPCI and len(SPCI)))
for nm, mp in (("CLASSICON", CLSI), ("SPECICON", SPCI)):
    if mp:
        gone = [s for s in set(mp.values())
                if not os.path.exists(R("assets", "icons", s + ".jpg"))]
        check(not gone, "%s slugs resolve to files (%d missing%s)" %
              (nm, len(gone), ": " + ", ".join(gone[:3]) if gone else ""))
ICONS = strict("ICONS", shared, "{}")
IMG   = strict("IMG",   shared, "{}")
CORR  = strict("CORRECTIONS", shared, "[]")
# NOSPELL asserts "no spell exists for this row", which only stays true if the
# name is real and has no icon: an overlap with ICONS would mean one of the two
# is a lie, and a stale entry would quietly keep a cog on a renamed row.
NOSP = strict("NOSPELL", shared, "[]")
check(NOSP is not None, "NOSPELL parses (%s rows)" % (NOSP and len(NOSP)))
if NOSP and ICONS:
    both = sorted(set(NOSP) & set(ICONS))
    check(not both, "no name is both iconless-by-design and in ICONS (%s)" %
          (", ".join(both) or "clean"))
    gone = [n for n in NOSP if '"%s"' % n.replace('"', '\\"') not in mplus + raid]
    check(not gone, "NOSPELL names still exist in the data (%d stale%s)" %
          (len(gone), ": " + ", ".join(gone[:4]) if gone else ""))
check(ICONS is not None, "ICONS parses (%s entries)" % (ICONS and len(ICONS)))
check(IMG   is not None, "IMG parses (%s entries)"   % (IMG and len(IMG)))
check(CORR  is not None, "CORRECTIONS parses (%s rows)" % (CORR and len(CORR)))

# ── 2. every referenced file exists on disk ────────────────────────────────
if ICONS:
    missing = [s for s in set(ICONS.values()) if not os.path.exists(R("assets", "icons", s + ".jpg"))]
    check(not missing, "ICONS slugs resolve to files (%d missing%s)" %
          (len(missing), ": " + ", ".join(missing[:4]) if missing else ""))
if IMG:
    missing = [v for v in IMG.values() if not os.path.exists(R(*v.split("/")))]
    check(not missing, "IMG paths exist on disk (%d missing)" % len(missing))
item_slugs = set(re.findall(r'ic:"([a-z0-9_\-]+)"', mplus + raid))
missing = [s for s in item_slugs if not os.path.exists(R("assets", "icons", s + ".jpg"))]
check(not missing, "item icon slugs resolve to files (%d of %d missing)" % (len(missing), len(item_slugs)))
# abilIcon has two fallbacks and neither is named by any map entry, so both
# files are load-bearing and invisible to the slug checks above
for slug, what in (("inv_misc_questionmark", "question-mark (icon not found)"),
                   ("trade_engineering", "cog (not a spell by design)")):
    check(os.path.exists(R("assets", "icons", slug + ".jpg")),
          "%s placeholder exists on disk" % what)

# ── 2b. journal portraits: every img:/jp: key must resolve through IMG ─────
# encounterCard and pBoss render whatever key the data names; a typo'd key
# renders nothing silently, so the checker holds the line instead.
jkeys = set(re.findall(r'\b(?:img|jp):"(j-[a-z0-9\-]+)"', mplus + raid))
for m in re.finditer(r'\b(?:img|jp):\[([^\]]*)\]', mplus + raid):
    jkeys |= set(re.findall(r'"(j-[a-z0-9\-]+)"', m.group(1)))
jkeys |= set(re.findall(r'\bmap:"(mdt-[a-z0-9\-]+)"', mplus))
if IMG is not None:
    orphan = sorted(k for k in jkeys if k not in IMG)
    check(not orphan, "boss portrait keys resolve in IMG (%d orphaned%s)" %
          (len(orphan), ": " + ", ".join(orphan[:4]) if orphan else ""))
    check(len(jkeys) > 0, "journal portrait keys present (%d referenced)" % len(jkeys))

# ── 3. bosses: equals encounters.length, per dungeon ─────────────────
# Dungeon headers are SCANNED, not matched. The old regex was widened five
# times \u2014 for code:, for wago:{...}, for routes:[...], for routes holding
# nested pull arrays \u2014 and each widening was followed by another field shape
# it had not anticipated. A regex cannot express "this object's fields but not
# its children's", because that needs bracket counting.
#
# Each time it went stale the checks found ZERO dungeons rather than failing on
# substance, which is the worst way for a checker to break. This ends that: any
# nested structure is skipped wholesale, so no future field shape can blind it.
def dungeon_headers(src):
    """Yield (position, {key: value}) for each top-level dungeon object.

    Walks forward from {id:" collecting key:"value" pairs at depth zero and
    stepping over anything nested, whatever shape it takes."""
    out = []
    for m in re.finditer(r'\{id:"([\w\-]+)"', src):
        i, depth, fields = m.end(), 0, {"id": m.group(1)}
        while i < len(src):
            c = src[i]
            if c in "{[":
                depth += 1; i += 1; continue
            if c in "}]":
                if depth == 0:
                    break
                depth -= 1; i += 1; continue
            if depth == 0:
                f = re.match(r',([a-zA-Z]+):"((?:[^"\\]|\\.)*)"', src[i:])
                if f:
                    fields[f.group(1)] = f.group(2)
                    i += f.end(); continue
            i += 1
        out.append((m.start(), fields))
    return out


heads = dungeon_headers(mplus)
ids = [h["id"] for _, h in heads if "code" in h and "short" in h]
declared = re.findall(r'bosses:(\d+)', mplus)
bounds = [pos for pos, h in heads if "code" in h and "short" in h] + [len(mplus)]
enc_counts = [len(re.findall(r'\{n:"(?:[^"\\]|\\.)*",o:\d+,', mplus[bounds[k]:bounds[k + 1]]))
              for k in range(len(bounds) - 1)]

# \u2500\u2500 3b. Blizzard's in-game dungeon codes \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
# Eight, unique, uppercase. They are a second NAME and the search index leans
# on them, so a typo would quietly make a dungeon unfindable by the exact
# string most players type into group finder.
codes = [h["code"] for _, h in heads if "code" in h and "short" in h]
check(len(codes) == 8 and len(set(codes)) == 8,
      "8 unique in-game dungeon codes (%d found, %d unique)" % (len(codes), len(set(codes))))
ok = len(ids) == 8 and len(declared) == 8 and all(int(d) == c for d, c in zip(declared, enc_counts))
check(ok, "bosses: equals encounters.length for all 8 dungeons" +
      ("" if ok else " (%s vs %s)" % (declared, enc_counts)))

# ── 4. names: loot hangs off real encounters; corrections resolve ──────────
# M+ encounters open {n:...,o:...}; raid bosses open {id:...,o:...,n:...}
enc_names = set(re.findall(r'\{n:"((?:[^"\\]|\\.)*)",o:\d+,', mplus + raid))
enc_names |= set(re.findall(r'\{id:"[\w\-]+",o:\d+,n:"((?:[^"\\]|\\.)*)"', raid))
mob_names = set(re.findall(r'\{n:"((?:[^"\\]|\\.)*)",k:"', mplus))
abil_names = set(re.findall(r'\{n:"((?:[^"\\]|\\.)*)",t:\[', mplus + raid))
loot_b = set(re.findall(r',b:"((?:[^"\\]|\\.)*)"', mplus + raid))
bad = [b for b in loot_b if b not in enc_names and b not in mob_names]
check(not bad, "loot b: resolves to an encounter or mob (%d unresolved%s)" %
      (len(bad), ": " + ", ".join(sorted(bad)[:4]) if bad else ""))
if CORR:
    # canonicals may be entity names, phase units, or mechanics that live in
    # ability prose (Grab Fish, Veil of Twilight) — the whole data text is
    # the universe. A typo'd canonical still appears nowhere and still fails.
    blob = mplus + raid
    bad = [r[0] for r in CORR if r[0] not in blob]
    check(not bad, "CORRECTIONS canonical names appear in data (%d orphaned%s)" %
          (len(bad), ": " + ", ".join(bad[:4]) if bad else ""))

# ── 5. vocabulary: tags, counters and source keys all defined ──────────────
tag_vocab = set(re.findall(r'(\w+):\{l:"', re.search(r"const TAGS=\{(.*?)\n\};", shared, re.S).group(1)))
ctr_vocab = set(re.findall(r'(\w+):\{l:"', re.search(r"const CTRS=\{(.*?)\n\};", shared, re.S).group(1)))
used_t = set(t for m in re.finditer(r'\bt:\[((?:"\w+",?)+)\]', mplus + raid) for t in re.findall(r'"(\w+)"', m.group(1)))
used_c = set(c for m in re.finditer(r'\bc:\[((?:"\w+",?)+)\]', mplus + raid) for c in re.findall(r'"(\w+)"', m.group(1)))
check(used_t <= tag_vocab, "ability tags all in TAGS (%s)" % (", ".join(sorted(used_t - tag_vocab)) or "clean"))
check(used_c <= ctr_vocab, "counters all in CTRS (%s)" % (", ".join(sorted(used_c - ctr_vocab)) or "clean"))
src_vocab = set(re.findall(r'(\w+)\s*:\{l:"', re.search(r"const SOURCES=\{(.*?)\n\};", shared, re.S).group(1)))
# \b keeps difficulties:["n","h"] and phases from reading as s:[...]
used_s = set(k for m in re.finditer(r'\bs:\[((?:"\w+",?)+)\]', mplus + raid) for k in re.findall(r'"(\w+)"', m.group(1)))
used_s.discard("img")   # the capture pseudo-source, rendered specially
check(used_s <= src_vocab, "source keys all in SOURCES (%s)" % (", ".join(sorted(used_s - src_vocab)) or "clean"))

# ── 5a. every data line must actually parse as JavaScript strings ─────────
# A straight " inside a double-quoted string silently ends it, and the rest of
# the line becomes garbage JavaScript. That shipped on 2026-08-25 and took the
# whole raid module down; only the browser noticed. Walk the quotes.
# Narrow on purpose: a double-quoted FIELD value must be followed by a
# delimiter. Anything else means the value ended early on a straight quote the
# author meant as punctuation. Comments and single-quoted strings never match
# the key:"..." shape, so they cannot produce false alarms.
FIELDQ = re.compile(r'(?<![A-Za-z0-9_])[a-z][a-zA-Z]{0,7}:"(?:[^"\\]|\\.)*"')
badq = []
for fname, src in (("mplus", mplus), ("raid", raid), ("shared", shared)):
    for i, ln in enumerate(src.splitlines(), 1):
        for m in FIELDQ.finditer(ln):
            rest = ln[m.end():].lstrip()
            if rest and rest[0] not in ",}])":
                badq.append("%s:%d %s<<HERE" % (fname, i, ln[max(0, m.end() - 34):m.end()]))
check(not badq, "field strings close at a delimiter (%s)"
      % ("; ".join(badq[:3]) if badq else "clean"))

# ── 5b. no ability object may name the same key twice ──────────────────────
# JavaScript takes the LAST occurrence and says nothing. Eighteen rows carried
# t: twice, so the first array was dead code — invisible until the 2026-08-25
# lethality sweep wrote a tag into the dead half and it never rendered.
dupkey = []
for fname, src in (("mplus", mplus), ("raid", raid)):
    for i, ln in enumerate(src.split("\n"), 1):
        if '{n:"' not in ln:
            continue
        # A NESTED object's keys are not this object's keys. hf:{d,t} and
        # play:{tank,...} both live inline, so mask them out before counting or
        # every hotfix note reads as a second t:.
        ln = re.sub(r'\w+:\{[^{}]*\}', "", ln)
        for key in ("t", "c", "r", "s", "e", "h"):
            n = len(re.findall(r'(?<=[,{])%s:[\["]' % key, ln))
            if n > 1:
                dupkey.append("%s:%d %s: x%d" % (fname, i, key, n))
check(not dupkey, "no ability object names a key twice (%s)"
      % ("; ".join(dupkey[:4]) if dupkey else "clean"))

# ── 5c. lethality: the two loudest badges on the site ──────────────────────
# oneshot and wipe ride in t: so the index filters them for free, but they are
# an editorial claim of the strongest kind — the bar is that the row's own
# sourced text says it kills. lh:1 marks lethality that only applies on Heroic,
# so it is meaningless without one of the two tags and only legal in the raid.
leth = re.findall(r'\{n:"([^"]+)",t:\[[^\]]*"(oneshot|wipe)"', mplus + raid)
check(len(leth) >= 10, "lethality tags present (%d rows)" % len(leth))
orphan_lh = [m.group(1) for m in re.finditer(r'\{n:"([^"]+)",t:\[([^\]]*)\](?:,lh:1)', mplus + raid)
             if not re.search(r'"(oneshot|wipe)"', m.group(2))]
check(not orphan_lh, "lh:1 only on a row that carries a lethality tag (%s)"
      % (", ".join(orphan_lh) or "clean"))
check("lh:1" not in mplus, "lh:1 is raid-only — Mythic+ has no difficulty axis (%s)"
      % ("clean" if "lh:1" not in mplus else "found in data-mplus"))

# ── 5d. every phase and every trash area states its objective ──────────────
# The rung between "what the fight is" and a list of casts. A phase header with
# no brief under it sends the reader back to synthesising it themselves, which
# is the job this guide exists to have already done.
ph = re.findall(r'\{n:"[^"]+",trigger:"[^"]*",(brief:)?', raid)
check(all(ph), "every raid phase carries a brief (%d of %d)" % (sum(1 for x in ph if x), len(ph)))
ar = re.findall(r'\{n:"[^"]+",(brief:)?"?[^,]*mobs:\[', mplus)
ar2 = re.findall(r'\{n:"[^"]+",brief:"[^"]*",mobs:\[', mplus)
n_areas = len(re.findall(r'\{n:"[^"]+",[^\n]*?mobs:\[', mplus))
check(len(ar2) == n_areas, "every trash area carries a brief (%d of %d)" % (len(ar2), n_areas))

# ── 6. raid discipline: df values, and absence means both ──────────────────
bad_df = [m.group(1) for m in re.finditer(r'df:\[([^\]]*)\]', raid)
          if not set(re.findall(r'"(\w+)"', m.group(1))) <= {"n", "h", "m"}]
check(not bad_df, "raid df values within {n,h,m} (%d bad)" % len(bad_df))
both = len(re.findall(r'df:\["n","h"\]', raid))
check(both == 0, 'no explicit df:["n","h"] — absence is the both spelling (%d found)' % both)

# ── 7. the spec filter: 40 specs, real weapon types, nothing stranded ──────
spec_blk = re.search(r"const SPECS=\[\n(.*?)\n\];", render, re.S)
if not spec_blk:
    check(False, "SPECS block not found")
else:
    rows = re.findall(r'\["([A-Za-z \']+)","([A-Za-z \']+)","(Str|Agi|Int)",\[([^\]]*)\],(\w+),"(\w+)"\]',
                      spec_blk.group(1))
    check(len(rows) == 40, "SPECS has 40 specialisations (%d found)" % len(rows))
    # the role is what gates trinkets, so a typo here silently misfilters loot
    roles = [r[5] for r in rows]
    bad = sorted(set(roles) - {"tank", "healer", "mdps", "rdps"})
    check(not bad, "spec roles within {tank,healer,mdps,rdps} (%s)" % (", ".join(bad) or "clean"))
    dist = __import__("collections").Counter(roles)
    want = {"tank": 6, "healer": 7, "mdps": 15, "rdps": 12}
    check(dict(dist) == want, "role split is 6 tank / 7 healer / 15 mdps / 12 rdps (%s)" % dict(dist))
    classes = {r[0] for r in rows}
    check(len(classes) == 13, "SPECS covers 13 classes (%d found)" % len(classes))
    dupes = [k for k, v in __import__("collections").Counter((r[0], r[1]) for r in rows).items() if v > 1]
    check(not dupes, "no duplicated spec (%s)" % (dupes or "clean"))
    # every weapon type a spec claims must actually exist as a ty in the data
    real_ty = set(re.findall(r'ty:"([A-Za-z\- ]+)"', mplus + raid))
    claimed = set()
    for r in rows: claimed |= set(re.findall(r'"([A-Za-z\- ]+)"', r[3]))
    unknown = sorted(claimed - real_ty)
    check(not unknown, "spec weapon types all exist in the data (%s)" % (", ".join(unknown) or "clean"))
    # hand-set identifiers must be defined
    hands = {r[4] for r in rows}
    defined = set(re.findall(r'\b(H1|H2|H12|H1O|H12O|HR|HC)=\[', render))
    check(hands <= defined, "spec hand sets all defined (%s)" % (", ".join(sorted(hands - defined)) or "clean"))

# ── 7b. loot ids: wishlists serialize on them ──────────────────────────────
# js/wishlist.js stores {id, star} and share links carry dot-joined ids, so a
# loot row without an id can never be wished, and a duplicated id would make
# two items one. Names won't do — 57 were renamed this season; ids survived.
loot_rows = [m.group(0) for m in re.finditer(r'\{n:"(?:[^"\\]|\\.)*"[^{}]*?\}', mplus + raid)
             if 'sl:"' in m.group(0)]
check(len(loot_rows) == 312, "312 loot rows found (%d)" % len(loot_rows))
lids = [re.search(r'\bid:(\d+)', b) for b in loot_rows]
check(all(lids), "every loot row carries a Wowhead id (%d without)" % sum(1 for m in lids if not m))
lidv = [m.group(1) for m in lids if m]
ldup = [k for k, v in __import__("collections").Counter(lidv).items() if v > 1]
check(not ldup, "loot ids unique (%s)" % (", ".join(ldup[:4]) or "clean"))

# ── 8. trinket loot roles: the one axis the spec filter narrows on ─────────
# ro answers "whose loot table is this on", so it is now load-bearing rather
# than decorative. Manaheart's Binding Flame read tank+mdps for a while: its
# primary effect is a self-absorb, and the damage rider does not make a tank
# trinket lootable by DPS.
#
# The straddle rule below is a HEURISTIC over unobserved items, not a law, and
# it has already been falsified once: Blazebinder's Hoof carries no primary
# stat and is on both the tank and the melee table, seen in game. So rows
# carrying rc: (a source key for observed eligibility) are exempt — observation
# outranks the rule. What the assertion still catches is an *inferred* straddle,
# which is the editorial mistake that actually happened.
trinkets = [b.group(0) for b in re.finditer(r'\{n:"(?:[^"\\]|\\.)*"[^{}]*?\}', mplus + raid)
            if 'sl:"Trinket"' in b.group(0)]
check(len(trinkets) == 41, "41 trinkets found (%d)" % len(trinkets))
name_of = lambda t: re.search(r'\{n:"((?:[^"\\]|\\.)*)"', t).group(1)
arr = lambda t, k: re.findall(r'"(\w+)"', (re.search(r'\b%s:\[([^\]]*)\]' % k, t) or [None, ""])[1])
noro = [name_of(t) for t in trinkets if not arr(t, "ro")]
check(not noro, "every trinket carries a role (%d without%s)" %
      (len(noro), ": " + ", ".join(noro[:3]) if noro else ""))
badro = sorted({r for t in trinkets for r in arr(t, "ro")} - {"tank", "healer", "mdps", "rdps"})
check(not badro, "trinket ro within {tank,healer,mdps,rdps} (%s)" % (", ".join(badro) or "clean"))
confirmed = lambda t: re.search(r'\brc:"(\w+)"', t)
straddle = [name_of(t) for t in trinkets
            if "tank" in arr(t, "ro") and ({"mdps", "rdps"} & set(arr(t, "ro")))
            and set(arr(t, "p")) != {"Str", "Agi", "Int"} and not confirmed(t)]
check(not straddle, "no *inferred* tank+DPS straddle outside all-three-stat sticks (%d%s)" %
      (len(straddle), ": " + ", ".join(straddle) if straddle else ""))
# a confirmation is only worth anything if it names a source that exists
badrc = [name_of(t) for t in trinkets
         if confirmed(t) and confirmed(t).group(1) not in src_vocab]
check(not badrc, "role confirmations cite a real source (%d bad%s)" %
      (len(badrc), ": " + ", ".join(badrc) if badrc else ""))
nrc = sum(1 for t in trinkets if confirmed(t))
print("  note   %d of %d trinket roles seen in game%s"
      % (nrc, len(trinkets), "" if nrc == len(trinkets) else " — the rest are inferred"))

# ── 9. the shell: every script and stylesheet it names exists ──────────────
refs = re.findall(r'(?:src|href)="((?:js|css)/[\w\-.]+)"', html)
missing = [r_ for r_ in refs if not os.path.exists(R(*r_.split("/")))]
check(len(refs) >= 6 and not missing, "index.html references resolve (%d refs, %d missing)" % (len(refs), len(missing)))

# ── 8c. published route providers ────────────────────────────────
# Route strings are fetched from each author's own page at click time and never
# stored here, so all the data holds is which authors publish for which dungeon
# and, for Wago, a nine-character slug.
#
# Four ways this goes wrong quietly:
#   a provider key ROUTESRC does not define renders no card at all
#   a wago entry with no id fetches nothing
#   a malformed slug fails as "Unreachable", blaming Wago for our typo
#   a dungeon with no routes loses its Published routes block silently
#
# Not checked: whether a slug or document still RESOLVES. That needs a network
# call, check.py is offline by design, and an author deleting a route is not a
# defect in this repository \u2014 every card carries their link for that.
provkeys = set(re.findall(r'^ (\w+):\{by:"', shared, re.M))
rblocks = re.findall(r'routes:\[(.*?)\],code:', mplus)
rprob = []
for i, blk in enumerate(rblocks):
    ents = re.findall(r'\{k:"(\w+)"(.*?)\}', blk)
    if not ents:
        rprob.append("dungeon %d has an empty routes list" % i)
    for k, rest in ents:
        if k not in provkeys:
            rprob.append("unknown provider %r" % k)
        if k == "wago":
            m = re.search(r'id:"([^"]*)"', rest)
            if not m:
                rprob.append("wago entry with no id")
            elif not re.fullmatch(r'[A-Za-z0-9_-]{9}', m.group(1)):
                rprob.append("malformed slug %r" % m.group(1))
slugs = re.findall(r'\{k:"wago",id:"([^"]+)"\}', mplus)
if len(set(slugs)) != len(slugs):
    rprob.append("duplicate Wago slug")
check(len(rblocks) == 8 and len(slugs) == 8 and not rprob,
      "8 dungeons carry published routes, providers all known (%d dungeons, %d Wago slugs%s)"
      % (len(rblocks), len(slugs), "" if not rprob else " \u2014 " + "; ".join(sorted(set(rprob)))))

# ── 9b. no anchor may carry a bare fragment href ─────────────────────
# The hash IS the route. <a href="#sourcing-ulatek"> sets location.hash, and
# route() slices the first two characters off expecting "#/", so it looks up a
# page called "ourcing-ulatek", finds nothing, and shows home. This shipped
# twice: on the sourcing footnote, and on the skip-to-content link, which had
# been silently sending keyboard users to the home page for the whole life of
# the site. In-page jumps use data-goto and are scrolled by app.js instead.
#
# <use href="#i-warn"> is a different thing entirely and stays legal — an SVG
# sprite reference never touches location.
ANCHOR = re.compile(r'<a\b[^>]*?href="#(?!/)([^"]*)"')
badanchor = []
for f in ("index.html", "js/render.js", "js/wishlist.js", "js/app.js"):
    body = io.open(R(*f.split("/")), encoding="utf-8").read()
    for m in ANCHOR.finditer(body):
        # data-goto may sit either side of href, so judge the whole tag, not
        # the match — which stops at href's closing quote.
        tag = body[m.start():body.find(">", m.start()) + 1]
        if "data-goto" not in tag:
            badanchor.append("%s: #%s" % (f, m.group(1)))
check(not badanchor, "no bare fragment hrefs (the hash is the router)%s"
      % ("" if not badanchor else " — " + "; ".join(badanchor)))

print()
if FAIL:
    print("%d CHECK%s FAILED" % (len(FAIL), "S" if len(FAIL) > 1 else ""))
    sys.exit(1)
print("all structural checks passed")

# ── the editorial pass ─────────────────────────────────────────────────────
# check.py guards the shape of the data; lint.py guards the writing. One
# command runs both, because a second command is a command that gets skipped.
import subprocess
print("\n-- editorial lint --")
# stdout block-buffers into a pipe, so flush before handing that pipe to a
# child — otherwise the child's output lands ahead of ours and looks lost.
sys.stdout.flush()
rc = subprocess.call([sys.executable, R("tools", "lint.py")])
sys.exit(rc)
