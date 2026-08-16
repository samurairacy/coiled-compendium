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

ICONS = strict("ICONS", shared, "{}")
IMG   = strict("IMG",   shared, "{}")
CORR  = strict("CORRECTIONS", shared, "[]")
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

# ── 3. bosses: equals encounters.length, per dungeon ───────────────────────
ids = re.findall(r'\{id:"([\w\-]+)",name:"(?:[^"\\]|\\.)*",short:', mplus)
declared = re.findall(r'bosses:(\d+)', mplus)
enc_counts = [len(re.findall(r'\{n:"(?:[^"\\]|\\.)*",o:\d+,', seg)) for seg in
              re.split(r'\{id:"[\w\-]+",name:"(?:[^"\\]|\\.)*",short:', mplus)[1:]]
ok = len(ids) == 8 and len(declared) == 8 and all(int(d) == c for d, c in zip(declared, enc_counts))
check(ok, "bosses: equals encounters.length for all 8 dungeons" +
      ("" if ok else " (%s vs %s)" % (declared, enc_counts)))

# ── 4. names: loot hangs off real encounters; corrections resolve ──────────
enc_names = set(re.findall(r'\{n:"((?:[^"\\]|\\.)*)",o:\d+,', mplus + raid))
mob_names = set(re.findall(r'\{n:"((?:[^"\\]|\\.)*)",k:"', mplus))
abil_names = set(re.findall(r'\{n:"((?:[^"\\]|\\.)*)",t:\[', mplus + raid))
loot_b = set(re.findall(r',b:"((?:[^"\\]|\\.)*)"', mplus + raid))
bad = [b for b in loot_b if b not in enc_names and b not in mob_names]
check(not bad, "loot b: resolves to an encounter or mob (%d unresolved%s)" %
      (len(bad), ": " + ", ".join(sorted(bad)[:4]) if bad else ""))
if CORR:
    every = enc_names | mob_names | abil_names
    bad = [r[0] for r in CORR if r[0] not in every]
    check(not bad, "CORRECTIONS canonical names exist in data (%d orphaned%s)" %
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

# ── 6. raid discipline: df values, and absence means both ──────────────────
bad_df = [m.group(1) for m in re.finditer(r'df:\[([^\]]*)\]', raid)
          if not set(re.findall(r'"(\w+)"', m.group(1))) <= {"n", "h", "m"}]
check(not bad_df, "raid df values within {n,h,m} (%d bad)" % len(bad_df))
both = len(re.findall(r'df:\["n","h"\]', raid))
check(both == 0, 'no explicit df:["n","h"] — absence is the both spelling (%d found)' % both)

# ── 7. the shell: every script and stylesheet it names exists ──────────────
refs = re.findall(r'(?:src|href)="((?:js|css)/[\w\-.]+)"', html)
missing = [r_ for r_ in refs if not os.path.exists(R(*r_.split("/")))]
check(len(refs) >= 6 and not missing, "index.html references resolve (%d refs, %d missing)" % (len(refs), len(missing)))

print()
if FAIL:
    print("%d CHECK%s FAILED" % (len(FAIL), "S" if len(FAIL) > 1 else ""))
    sys.exit(1)
print("all checks passed")
