#!/usr/bin/env python3
"""Ula'tek (encounter 3492) analysis: a raw combat log in, a facts file out.

    python tools/logs/ulatek.py <WoWCombatLog.txt> tools/logs/facts/<report-id>.json

Stdlib only. Reads the raw log directly (no pre-extraction) and writes every
number a report is allowed to quote. A report module (tools/logs/reports/)
turns these facts into prose; it should never need the log again, which is why
the facts are committed and the multi-hundred-megabyte log is not.

What it measures, and how each was validated on the 21 Oct 2026 log:
  stages     boss damage per stage, its rate, and how much raid damage went to
             adds. Stage edges come from the log (Rage of the Shackled casts,
             the intermission fall, Circling Prey), never from a fixed clock.
  heart      every Rage of the Shackled window: what each player's casts were
             aimed at (cast targets, not damage, so cleave is not a mistake),
             single-target damage on the body (the game's own ST flag), and
             the Heart/body damage ratio per player-spell (1.96 on 21 Oct).
  avoidable  personal hits per player per pull, by mechanic, normalised by
             time alive. Fully absorbed hits count. Ticking pools count one
             exposure per continuous stand-in.
  group      raid-wide failures (Unchecked Rage, Rattler Slam, Mother's Wrath
             out of reach, Viper hatches, missed kicks, unsoaked bites),
             clustered, with who was tanking and how far away they were.
  fangs      Grasping Fangs snaps, the chains they form (a snap within 4.0 s
             of the last refreshes and grows Blight Vein), and peak stacks.
  bites      Serpent's Bite: carriers, helper ticks per circle (nearest
             carrier by position), when Volatile Purge landed, who calcified.
  tanks      first engagement of the tail, and the context of every untanked
             event: the last melee target and any taunt with its distance.
  consum     Bloodlust-type casts and Potion of Recklessness timings.
  deaths     every death with its last three hits and killing blow.
"""
import collections, json, math, statistics, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from combatlog import (pulls, is_player, npc_id, dmg, absorbed_miss, unit_pos, unit_hp, short, SPEC, role_of)

ENC = 3492
BOSS, HEART, TAIL = '257758', '267460', '259555'
ADDS = {'261874': 'Rawling', '261915': 'Viper', '263535': 'Clutch', '273577': 'Shrieker',
        '264045': 'Warden', '269200': 'WeakDoomscale', '263900': 'RavenousDoomscale'}
CAT = {BOSS: 'Body', HEART: 'Heart', TAIL: 'Tail', **ADDS}
RAGE = '1286860'               # Rage of the Shackled cast: the Heart opens for 20 s
FALL = 'Falling'
CIRCLING_PREY = '1301510'
ENRAGE = '1286905'             # Fury Unleashed: the hard enrage after the last platform
PLATFORMS = 4                  # Stage Three's platforms, per the encounter page
# personal: the hit belongs to the person hit
PERSONAL = {'1292403': 'Caustic Waves', '1302982': 'Virulent Spit', '1286885': 'Falling Debris',
            '1297338': 'Deadly Venom (pool)', '1305709': 'Desperate Thrash (non-tank)',
            '1290409': 'Call of the Serpent (landing)', '1306858': "Warden's Protection"}
HARD = ['Caustic Waves', 'Virulent Spit', 'Falling Debris', 'Deadly Venom (pool)', 'Desperate Thrash (non-tank)']
SOFT = ['Call of the Serpent (landing)', "Warden's Protection"]
TICKY = {'1297338', '1306858'}
GROUP = {'1299206': 'Rattler Slam (tail untanked)', '1301007': 'Unchecked Rage (boss untanked)',
         '1301122': "Mother's Wrath (tank out of reach)", '1308275': 'Putrid Membrane (Viper hatched)',
         '1301800': 'Acidic Burst (Viper alive)', '1290991': 'Malice (kick missed)',
         '1318329': 'Calcified Corpse (bite unsoaked)', '1313531': 'Acidic Expulsion (Shrieker alive)',
         '1305775': 'Dread Roar (Doomscale egg hatched)'}
KICKABLE = {'1290779': 'Malice', '1310764': 'Vicious Echoes', '1305650': 'Anguished Cry'}
HATCH = '1306862'              # Hatching Doom: a Doomscale Egg's 90 s clock; success means it hatched
FANG_AURA, BV_AURA, BV_HIT = '1311611', '1311609', '1317955'
BITE_HIT, BITE_TICK = '1295838', '1293146'
PURGE_AURA, PURGE_HIT = '1312967', '1305878'
CALC = {'1318329', '1306119'}
MARK = '1298367'               # Mother's Wrath mark on the tank
TAUNTS = {'Growl', 'Hand of Reckoning', 'Taunt', 'Dark Command', 'Provoke', 'Torment'}
LUST = {'2825', '32182', '80353', '390386', '264667', '466904'}
POTION = 'Potion of Recklessness'
r1_ = lambda v: round(v, 1)


def boss_max_hp(rows):
    """Ula'tek's maximum health in this pull. It scales with raid size (930M
    at 17, 874M at 16), so it is read per pull: one value for the night
    understated every pull at the other size."""
    for t, r in rows:
        if len(r) > 15 and npc_id(r[5]) == BOSS:
            hp = unit_hp(r)
            if hp:
                return hp[2]


def analyse_pull(P):
    rows, t0 = P['rows'], P['start']
    hpmax = boss_max_hp(rows)
    spec, names, owner = {}, {}, {}
    for t, r in rows:
        if r[0] == 'COMBATANT_INFO':
            spec[r[1]] = int(r[25])
        elif len(r) > 6:
            if is_player(r[1]):
                names[r[1]] = short(r[2])
            if is_player(r[5]):
                names[r[5]] = short(r[6])
            if r[0] == 'SPELL_SUMMON' and is_player(r[1]):
                owner[r[5]] = r[1]
            if r[0] == 'SPELL_CAST_SUCCESS' and len(r) > 13 and r[12] == r[1] and is_player(r[13]):
                owner[r[1]] = r[13]
    roster = {g: {'name': names.get(g, g), 'spec': SPEC.get(s, str(s)), 'role': role_of(s)} for g, s in spec.items()}
    nm = lambda g: roster[g]['name'] if g in roster else names.get(g, g)
    role = lambda g: roster[g]['role'] if g in roster else '?'

    rages = sorted(t - t0 for t, r in rows if r[0] == 'SPELL_CAST_SUCCESS' and len(r) > 9 and r[9] == RAGE)
    wins = [(a, a + 20.0) for a in rages]
    win_of = lambda rt: next((i for i, (a, b) in enumerate(wins) if a <= rt <= b), None)

    # stage edges, from the log
    falls = collections.Counter(int(t - t0) for t, r in rows if r[0] == 'ENVIRONMENTAL_DAMAGE' and len(r) > 28 and r[28] == FALL)
    after = rages[1] + 20 if len(rages) > 1 else None
    s3 = next((s for s, c in sorted(falls.items()) if c >= 5 and after and s > after), None)
    cp = []
    for t, r in rows:
        if r[0] == 'SPELL_DAMAGE' and len(r) > 9 and r[9] == CIRCLING_PREY:
            rt = t - t0
            if not cp or rt - cp[-1] > 5:
                cp.append(rt)
    edges = [('Stage 1', 0)]
    if rages:
        edges += [('Heart 1', rages[0]), ('Stage 2', rages[0] + 20)]
    if len(rages) > 1:
        edges += [('Heart 2', rages[1]), ('Intermission', rages[1] + 20)]
    # These are measurement slices, not encounter phases. The journal has three
    # stages and an intermission; the slices split those where the damage rate
    # changes (each Heart window, each platform), so pulls compare like for like.
    # Stage Three stands on PLATFORMS platforms and each Circling Prey destroys
    # the one underfoot, so the last break leaves no platform at all: that
    # slice is the final break, never a fifth platform.
    if s3:
        edges.append(('S3 platform 1', s3))
        for i, c in enumerate(cp):
            edges.append(('S3 platform %d' % (i + 2) if i + 2 <= PLATFORMS else 'S3 final break', c))
    edges.sort(key=lambda e: e[1])
    stage_of = lambda rt: [e for e in edges if e[1] <= rt][-1][0]
    # Later Rages (the fourth platform opens the Heart once more) interrupt a
    # platform rather than ending it, so the platform resumes, as its own row,
    # when the window closes.
    for i, a in enumerate(rages[2:]):
        before = stage_of(a)
        edges += [('Heart %d' % (i + 3), a), ('%s, after Heart %d' % (before, i + 3), a + 20)]
    enrage = next((t - t0 for t, r in rows if len(r) > 9 and r[9] == ENRAGE), None)
    if enrage is not None:
        edges.append(('Enrage', enrage))
    edges.sort(key=lambda e: e[1])

    pos, bossp, heartp = {}, None, None
    hpcurve, stage_dmg = {}, collections.Counter()
    stage_adds = collections.Counter()
    heart_agg = collections.defaultdict(lambda: collections.defaultdict(collections.Counter))
    heart_cast = collections.defaultdict(collections.Counter)
    heart_first = {}
    heart_dist = collections.defaultdict(list)
    ratio = collections.defaultdict(lambda: {'H': [], 'B': []})
    hits = collections.defaultdict(lambda: collections.defaultdict(list))
    pdmg = collections.defaultdict(collections.Counter)
    lasttick = {}
    group = collections.defaultdict(list)
    deaths, recent = [], collections.defaultdict(lambda: collections.deque(maxlen=3))
    alive_since = {g: 0.0 for g in roster}
    alive = collections.Counter()
    boss_melee = tail_melee = None
    tail_first_cast = tail_first_swing = tail_tank_swing = None
    taunts = []
    snaps, stacks, bv_peak = [], {}, 0
    bv_last, bv_exp, bv_tick = {}, collections.Counter(), []
    bites, cur = [], None
    purge_hits = collections.defaultdict(list)
    marks = []
    lust, potions = [], collections.defaultdict(list)
    rezzes = []
    kicks = {k: {'casts': 0, 'kicked': 0, 'through': [], 'kickers': collections.Counter()} for k in KICKABLE.values()}
    hatch = {}
    adds_seen, adds_died = {}, {}

    for t, r in rows:
        ev = r[0]
        rt = t - t0
        if len(r) < 9:
            continue
        src, dst = r[1], r[5]
        p = unit_pos(r)
        if p:
            g, x, y = p
            if is_player(g):
                pos[g] = (x, y)
            elif npc_id(g) == BOSS:
                bossp = (x, y)
            elif npc_id(g) == HEART:
                heartp = (x, y)
        for g in (src, dst):
            if npc_id(g) in ADDS and g not in adds_seen:
                adds_seen[g] = rt
        if ev == 'UNIT_DIED' and npc_id(dst) in ADDS:
            adds_died[dst] = rt
        if ev == 'UNIT_DIED' and is_player(dst):
            d = {'t': r1_(rt), 'p': nm(dst), 'role': role(dst), 'stage': stage_of(rt),
                 'last': [list(x) for x in recent[dst]]}
            kb = next((x for x in reversed(recent[dst]) if x[3] > 0), recent[dst][-1] if recent[dst] else None)
            d['kb'] = kb[1] if kb else None
            deaths.append(d)
            if alive_since.get(dst) is not None:
                alive[dst] += rt - alive_since[dst]
                alive_since[dst] = None
            if cur and rt - cur['t'] < 20:
                cur['died'].append([r1_(rt), nm(dst)])
            continue
        if ev == 'SPELL_RESURRECT' and is_player(dst):
            alive_since[dst] = rt
            rezzes.append([r1_(rt), nm(dst)])
        if len(r) < 12:
            continue
        sid = r[9]

        # ── interrupts and egg clocks ──
        if sid in KICKABLE and ev == 'SPELL_CAST_START':
            kicks[KICKABLE[sid]]['casts'] += 1
        if sid in KICKABLE and ev == 'SPELL_CAST_SUCCESS':
            kicks[KICKABLE[sid]]['through'].append(r1_(rt))
        if ev == 'SPELL_INTERRUPT' and len(r) > 12 and r[12] in KICKABLE:
            kicks[KICKABLE[r[12]]]['kicked'] += 1
            kicks[KICKABLE[r[12]]]['kickers'][nm(src) if is_player(src) else nm(owner.get(src, src))] += 1
        if sid == HATCH and ev == 'SPELL_CAST_START':
            hatch[src] = [r1_(rt), None]
        if sid == HATCH and ev == 'SPELL_CAST_SUCCESS' and src in hatch:
            hatch[src][1] = r1_(rt)
        # ── casts ──
        if ev == 'SPELL_CAST_SUCCESS':
            if is_player(src):
                if sid in LUST:
                    lust.append([r1_(rt), nm(src), r[10]])
                if r[10] == POTION:
                    potions[nm(src)].append(r1_(rt))
                w = win_of(rt)
                if w is not None and dst != '0000000000000000' and not is_player(dst):
                    heart_cast[(w, src)][CAT.get(npc_id(dst), 'Other') if npc_id(dst) in (BOSS, HEART, TAIL) else 'Adds'] += 1
                if role(src) == 'tank' and npc_id(dst) == TAIL and tail_first_cast is None:
                    tail_first_cast = [r1_(rt), nm(src), r[10]]
                if r[10] in TAUNTS and npc_id(dst) in (BOSS, TAIL):
                    d_ = None
                    tgt = bossp if npc_id(dst) == BOSS else None
                    if tgt and src in pos:
                        d_ = round(math.dist(pos[src], tgt))
                    taunts.append([r1_(rt), nm(src), 'boss' if npc_id(dst) == BOSS else 'tail', d_])
        if ev == 'SWING_DAMAGE' and is_player(dst):
            if npc_id(src) == BOSS:
                boss_melee = [r1_(rt), nm(dst)]
            elif npc_id(src) == TAIL:
                tail_melee = [r1_(rt), nm(dst)]
                if tail_first_swing is None:
                    tail_first_swing = [r1_(rt), nm(dst)]
                if tail_tank_swing is None and role(dst) == 'tank':
                    tail_tank_swing = [r1_(rt), nm(dst)]

        # ── auras ──
        if sid == FANG_AURA and ev == 'SPELL_AURA_REMOVED':
            snaps.append([r1_(rt), nm(dst)])
        if sid == BV_AURA:
            if ev == 'SPELL_AURA_APPLIED':
                stacks[dst] = 1
            elif ev == 'SPELL_AURA_APPLIED_DOSE':
                stacks[dst] = int(r[13])
            elif ev == 'SPELL_AURA_REMOVED':
                stacks[dst] = 0
                if dst in bv_last:
                    bv_exp[round(t - bv_last[dst], 1)] += 1
            if ev in ('SPELL_AURA_APPLIED', 'SPELL_AURA_APPLIED_DOSE', 'SPELL_AURA_REFRESH'):
                bv_last[dst] = t
            if stacks:
                bv_peak = max(bv_peak, max(stacks.values()))
        if sid == MARK and ev == 'SPELL_AURA_APPLIED' and is_player(dst):
            d_ = round(math.dist(pos[dst], bossp)) if dst in pos and bossp else None
            marks.append([r1_(rt), nm(dst), d_])
        if cur and sid == PURGE_AURA and ev == 'SPELL_AURA_APPLIED':
            cur['purge'].append(r1_(rt - cur['t']))
        if cur and sid in CALC and ev == 'SPELL_AURA_APPLIED' and is_player(dst):
            cur['calc'].append([r1_(rt - cur['t']), nm(dst)])

        # ── damage to enemies (players and their pets) ──
        d = dmg(r)
        if d and not is_player(dst) and dst not in owner:
            s_ = src if is_player(src) else owner.get(src)
            if s_:
                amt = d[2] + d[3]
                nid = npc_id(dst)
                st_ = stage_of(rt)
                if nid in (BOSS, HEART, TAIL):
                    stage_dmg[st_] += amt
                else:
                    stage_adds[st_] += amt
                w = win_of(rt)
                if w is not None:
                    cat = CAT.get(nid, 'Other')
                    kind = ('pet' if s_ != src else 'dot' if 'PERIODIC' in ev
                            else 'aoe' if r[-1] == 'AOE' else 'st')
                    heart_agg[(w, s_)][cat][kind] += amt
                    if cat == 'Heart' and s_ == src and (w, s_) not in heart_first:
                        heart_first[(w, s_)] = r1_(rt - wins[w][0])
                    if ev in ('SPELL_DAMAGE', 'RANGE_DAMAGE') and r[-1] == 'ST' and s_ == src and nid in (BOSS, HEART):
                        ratio[(src, d[1])]['H' if nid == HEART else 'B'].append(amt)
        if d and npc_id(dst) == BOSS:
            hp = unit_hp(r)
            if hp:
                hpcurve[int(rt // 4) * 4] = round(100 * hp[1] / hp[2], 2)

        # ── damage to players from the encounter ──
        if not is_player(dst) or is_player(src) or src in owner:
            continue
        if not d:
            m_ = absorbed_miss(r)
            if not m_:
                continue
            dsid, dname, total, over = m_[0], m_[1], m_[2], -1
            periodic = 'PERIODIC' in ev
        else:
            dsid, dname, total, over = d[0], d[1], d[2] + d[3], d[4]
            periodic = 'PERIODIC' in ev
        recent[dst].append((r1_(rt), dname, total, over))
        if dsid == BV_HIT and stacks.get(dst):
            bv_tick.append(total / stacks[dst])
        if dsid == PURGE_HIT:
            purge_hits[dst].append(rt)
        if dsid in PERSONAL and not (dsid == '1305709' and role(dst) == 'tank'):
            mech = PERSONAL[dsid]
            pdmg[nm(dst)][mech] += total
            if dsid in TICKY:
                if rt - lasttick.get((dst, dsid), -99) > 3:
                    hits[nm(dst)][mech].append([r1_(rt), total])
                lasttick[(dst, dsid)] = rt
            elif not periodic:
                hits[nm(dst)][mech].append([r1_(rt), total])
        if dsid in GROUP:
            mech = GROUP[dsid]
            cl = group[mech]
            if not cl or rt - cl[-1]['end'] > 4:
                ctx = {}
                if dsid == '1301007':
                    ctx['boss_melee'] = boss_melee
                    ctx['tank_dist'] = {nm(g): round(math.dist(pos[g], bossp)) for g in roster
                                        if role(g) == 'tank' and g in pos and bossp}
                    ctx['taunts'] = [x for x in taunts if x[2] == 'boss' and rt - 3 <= x[0] <= rt + 1]
                if dsid == '1299206':
                    ctx['tail_melee'] = tail_melee
                if dsid == '1301122':
                    ctx['mark'] = marks[-1] if marks else None
                cl.append({'start': r1_(rt), 'end': rt, 'hits': 0, 'dmg': 0, 'ctx': ctx})
            cl[-1]['end'] = rt
            cl[-1]['hits'] += 1
            cl[-1]['dmg'] += total
        # bites
        if dsid == BITE_HIT:
            if not cur or rt - cur['t'] > 3:
                cur = {'t': rt, 'carriers': [], 'ticks': collections.defaultdict(collections.Counter),
                       'purge': [], 'calc': [], 'died': []}
                bites.append(cur)
            cur['carriers'].append(dst)
        if cur and dsid == BITE_TICK and rt - cur['t'] < 16 and dst in pos and all(c in pos for c in cur['carriers']):
            near = min(cur['carriers'], key=lambda c: math.dist(pos[dst], pos[c]))
            cur['ticks'][near][dst] += 1

        # heart-window distances, sampled when a player is hit (positions are fresh then)
        w = win_of(rt)
        if w is not None and heartp and bossp and dst in pos:
            heart_dist[(w, dst)].append((math.dist(pos[dst], heartp), math.dist(pos[dst], bossp)))

    for g, s in alive_since.items():
        if s is not None:
            alive[g] += P['dur'] - s
    # chains: a snap within 4.0 s of the previous one adds a stack
    chains, ch = [], []
    for s in sorted(x[0] for x in snaps):
        if ch and s - ch[-1] > 4.0:
            chains.append(ch); ch = []
        ch.append(s)
    if ch:
        chains.append(ch)
    dbl = {nm(g): sum(1 for a, b in zip(sorted(v), sorted(v)[1:]) if b - a < 2) for g, v in purge_hits.items()}
    stages = []
    for i, (name, a) in enumerate(edges):
        b = edges[i + 1][1] if i + 1 < len(edges) else P['dur']
        if b - a < 2:
            continue          # a sliver between two events (Heart 3 closes 0.6 s before the final break)
        tot = stage_dmg[name] + stage_adds[name]
        # the encounter phase this slice belongs to, numbered the way Warcraft
        # Logs labels them (its P1/P2/P3 are PHASES; reviews write pulls as #n so
        # the two never collide)
        wcl = 1 if name in ('Stage 1', 'Heart 1') else 2 if name in ('Stage 2', 'Heart 2') else 3
        stages.append({'s': name, 'phase': wcl, 'from': r1_(a), 'to': r1_(b), 'boss_pct': round(100 * stage_dmg[name] / hpmax, 2),
                       'rate': round(100 * stage_dmg[name] / hpmax / (b - a), 3),
                       'adds_share': round(100 * stage_adds[name] / tot, 1) if tot else 0})
    return {
        'n': P['n'], 'clock': '%02d:%02d' % (int(P['start'] // 3600), int(P['start'] % 3600 // 60)),
        'start_s': round(P['start'], 1), 'end_clock': '%02d:%02d' % (int(P['end'] // 3600), int(P['end'] % 3600 // 60)),
        'dur': r1_(P['dur']), 'kill': P['kill'], 'size': P['size'], 'boss_hp': hpmax,
        'roster': {v['name']: [v['spec'], v['role']] for v in roster.values()},
        'end_hp': round(hpcurve[max(hpcurve)], 1) if hpcurve else None,
        'curve': sorted([k, v] for k, v in hpcurve.items()),
        'reached': stages[-1]['s'] if stages else 'Stage 1',
        # where the raid actually fell: the stage of the median death, because a
        # platform can break mid-wipe and "reached" would credit the corpses
        'wiped_in': stage_of(statistics.median(d['t'] for d in deaths)) if deaths else None,
        'stages': stages, 'rages': [r1_(x) for x in rages], 'platform_breaks': [r1_(x) for x in cp], 's3': s3,
        'enrage': r1_(enrage) if enrage is not None else None,
        'heart': [{'w': w + 1, 'p': nm(g),
                   'cats': {c: dict(v) for c, v in heart_agg.get((w, g), {}).items()},
                   'casts': dict(heart_cast.get((w, g), {})), 'first': heart_first.get((w, g)),
                   'dist': ([round(statistics.median(x[0] for x in heart_dist[(w, g)]), 1),
                             round(statistics.median(x[1] for x in heart_dist[(w, g)]), 1)] if heart_dist.get((w, g)) else None)}
                  for (w, g) in sorted(set(heart_agg) | set(heart_cast), key=lambda k: (k[0], nm(k[1])))
                  if is_player(g)],
        'ratio_pairs': [[nm(k[0]), k[1], statistics.median(v['H']), statistics.median(v['B'])]
                        for k, v in ratio.items() if len(v['H']) >= 5 and len(v['B']) >= 5],
        'hits': {p: dict(v) for p, v in hits.items()},
        'pdmg': {p: dict(v) for p, v in pdmg.items()},
        'alive': {nm(g): r1_(v) for g, v in alive.items()},
        'group': {m: [{**c, 'end': r1_(c['end'])} for c in cl] for m, cl in group.items()},
        'deaths': deaths,
        'snaps': snaps, 'chains': chains, 'bv_peak': bv_peak, 'bv_expiry': dict(bv_exp),
        'bv_tick_per_stack': round(statistics.median(bv_tick)) if bv_tick else None,
        'bites': [{'t': r1_(b['t']), 'carriers': [nm(c) for c in b['carriers']],
                   'circles': {nm(c): {nm(g): k for g, k in b['ticks'][c].items() if g != c} for c in b['carriers']},
                   'self': {nm(c): b['ticks'][c].get(c, 0) for c in b['carriers']},
                   'purge_at': min(b['purge']) if b['purge'] else None, 'purged': len(b['purge']),
                   'calc': b['calc'], 'died': b['died']} for b in bites],
        'double_purge': {k: v for k, v in dbl.items() if v},
        'tail': {'first_tank_cast': tail_first_cast, 'first_swing': tail_first_swing, 'first_tank_swing': tail_tank_swing},
        'taunts': taunts, 'marks': marks,
        'lust': lust, 'potions': dict(potions), 'rezzes': rezzes,
        'kicks': {k: {**v, 'kickers': v['kickers'].most_common()} for k, v in kicks.items() if v['casts']},
        'eggs': sorted(hatch.values(), key=lambda e: e[0]),
        'adds': {name: sorted(([r1_(adds_seen[g]), r1_(adds_died[g]) if g in adds_died else None]
                               for g in adds_seen if ADDS[npc_id(g)] == name), key=lambda e: e[0])
                 for name in sorted({ADDS[npc_id(g)] for g in adds_seen})},
    }


def summarise(pulls_):
    """The derived numbers a report quotes. Kept here, next to the raw facts,
    so two reports can never compute the same figure two ways."""
    players = sorted({p for x in pulls_ for p in x['roster']})
    roleof = {}
    for x in pulls_:
        roleof.update({p: v[1] for p, v in x['roster'].items()})
    H = lambda x, p, ms: sum(len(v) for m, v in x['hits'].get(p, {}).items() if m in ms)
    rank = []
    for p in players:
        here = [x for x in pulls_ if p in x['roster']]
        c = [H(x, p, HARD) for x in here]
        alive_ = sum(x['alive'].get(p, 0) for x in here)
        rank.append({'p': p, 'role': roleof[p], 'tot': sum(c), 'pulls': len(here),
                     'rate': round(sum(c) / (alive_ / 600), 2) if alive_ else 0,
                     'mean': round(statistics.mean(c), 2), 'sd': round(statistics.pstdev(c), 2),
                     'lo': min(c), 'hi': max(c), 'alive_min': round(alive_ / 60, 1),
                     'dmg': sum(v for x in here for m, v in x['pdmg'].get(p, {}).items() if m in HARD)})
    rank.sort(key=lambda r: -r['rate'])
    rate = lambda rs: round(sum(r['tot'] for r in rs) / (sum(r['alive_min'] for r in rs) / 10), 2)
    mech = {}
    for m in HARD + SOFT:
        who = collections.Counter()
        tot = dm = 0
        for x in pulls_:
            for p, hh in x['hits'].items():
                who[p] += len(hh.get(m, []))
                tot += len(hh.get(m, []))
            for p, dd in x['pdmg'].items():
                dm += dd.get(m, 0)
        if tot:
            mech[m] = {'hits': tot, 'dmg': dm, 'who': who.most_common(4), 'soft': m in SOFT}
    kb = collections.defaultdict(list)
    for x in pulls_:
        for d in x['deaths']:
            if d['kb'] in ('Caustic Waves', 'Virulent Spit', 'Falling Debris', 'Deadly Venom'):
                kb[d['kb']].append([d['p'], x['n']])
    # heart
    share = collections.defaultdict(collections.Counter)
    hrole = {}
    whole, win_cost, ratios = [], [], []
    for x in pulls_:
        wins = collections.defaultdict(int)
        for e in x['heart']:
            hrole[e['p']] = x['roster'].get(e['p'], ['', '?'])[1]
            for k, v in e['casts'].items():
                share[e['p']][k if k in ('Heart', 'Body') else 'Adds'] += v
            c = e['casts']
            if c.get('Body', 0) >= 5 and c.get('Body', 0) >= c.get('Heart', 0):
                whole.append([x['n'], e['w'], e['p'], hrole[e['p']], c.get('Heart', 0), c.get('Body', 0)])
            wins[e['w']] += e['cats'].get('Body', {}).get('st', 0)
        for w in sorted(wins):
            win_cost.append([x['n'], w, round(100 * wins[w] / x['boss_hp'], 2)])
        ratios += [h / b for _, _, h, b in x['ratio_pairs'] if b]
    shares = [[p, hrole[p], share[p]['Heart'], share[p]['Body'], share[p]['Adds']]
              for p in share if sum(share[p].values()) >= 20]
    shares.sort(key=lambda r: ({'dps': 0, 'tank': 1, 'healer': 2}.get(r[1], 3), -r[2] / sum(r[2:])))
    stg = lambda x, s: next((e for e in x['stages'] if e['s'] == s), None)
    # avoidable by phase, per 10 player-minutes ALIVE in that phase: the fair
    # comparison between nights that spent different amounts of time in each
    phase = lambda s: 'Stage 1' if s == 'Stage 1' else 'Stage 2' if s == 'Stage 2' else 'Stage 3' if s.startswith('S3') else None
    by_ph = collections.defaultdict(lambda: [0, 0.0, collections.Counter()])
    for x in pulls_:
        spans = [(e['from'], e['to'], phase(e['s'])) for e in x['stages'] if phase(e['s'])]
        ev = sorted([(d['t'], d['p'], -1) for d in x['deaths']] + [(t, p, 1) for t, p in x['rezzes']])
        for p in x['roster']:
            up, t_ = True, 0.0
            ivs = []
            for t, q, k in ev:
                if q != p:
                    continue
                if k < 0 and up:
                    ivs.append((t_, t)); up = False
                elif k > 0 and not up:
                    t_, up = t, True
            if up:
                ivs.append((t_, x['dur']))
            for a_, b_, ph in spans:
                by_ph[ph][1] += sum(max(0, min(b_, v) - max(a_, u)) for u, v in ivs) / 60
        for p, hh in x['hits'].items():
            for m, v in hh.items():
                if m not in HARD:
                    continue
                for t, _ in v:
                    ph = next((s for a_, b_, s in spans if a_ <= t < b_), None)
                    if ph:
                        by_ph[ph][0] += 1; by_ph[ph][2][m] += 1
    by_phase = {ph: {'hits': v[0], 'alive_min': round(v[1], 1), 'rate': round(v[0] / (v[1] / 10), 2) if v[1] else None,
                     'mech': dict(v[2])} for ph, v in by_ph.items()}
    # heart, per window index
    per_win = {}
    for w in (1, 2, 3):
        c = collections.Counter()
        cost = []
        for x in pulls_:
            es = [e for e in x['heart'] if e['w'] == w]
            if not es:
                continue
            for e in es:
                for k, v in e['casts'].items():
                    c[k if k in ('Heart', 'Body') else 'Adds'] += v
            cost.append([x['n'], round(100 * sum(e['cats'].get('Body', {}).get('st', 0) for e in es) / x['boss_hp'], 2),
                         round(100 * sum(sum(e['cats'].get('Heart', {}).values()) for e in es) / x['boss_hp'], 2)])
        if c:
            per_win[w] = {'heart_share': round(100 * c['Heart'] / sum(c.values()), 1), 'casts': dict(c),
                          'pulls': cost}
    return {
        'players': players,
        'avoid': {'rank': rank, 'raid_rate': rate(rank), 'nontank_rate': rate([r for r in rank if r['role'] != 'tank']),
                  'tank_hits': sum(r['tot'] for r in rank if r['role'] == 'tank'), 'total_hits': sum(r['tot'] for r in rank),
                  'mech': mech, 'killing_blows': dict(kb),
                  'stage1_hits': [[x['n'], sum(1 for hh in x['hits'].values() for m, v in hh.items() if m in HARD for t, _ in v if t < 108)]
                                  for x in pulls_],
                  'heat': {'cols': [['#%d' % x['n'], '%ds' % round(x['dur'])] for x in pulls_],
                           'rows': [[p, [H(x, p, HARD) if p in x['roster'] else None for x in pulls_]]
                                    for p in sorted(players, key=lambda p: -next(r['tot'] for r in rank if r['p'] == p))]}},
        'avoid_by_phase': by_phase,
        'heart': {'per_window': per_win, 'share': shares, 'whole': sorted(whole), 'win_cost': win_cost,
                  'ratio_median': round(statistics.median(ratios), 2) if ratios else None, 'ratio_pairs': len(ratios),
                  'rage1': [[x['n'], stg(x, 'Heart 1')['boss_pct']] for x in pulls_ if stg(x, 'Heart 1')],
                  'rage2': [[x['n'], stg(x, 'Heart 2')['boss_pct']] for x in pulls_ if stg(x, 'Heart 2')]},
        'fangs': {'peaks': [[x['n'], x['bv_peak'], [len(c) for c in x['chains']]] for x in pulls_ if x['snaps']],
                  'bv_expiry_mode': max(((k, v) for x in pulls_ for k, v in x['bv_expiry'].items()), key=lambda kv: kv[1])[0]
                  if any(x['bv_expiry'] for x in pulls_) else None,
                  'bv_expiry_clean': sum(v for x in pulls_ for k, v in x['bv_expiry'].items() if k == 4.0)},
        'curves': [{'n': x['n'], 'dur': round(x['dur']), 'pts': [[t, round(v, 1)] for t, v in x['curve']]} for x in pulls_],
    }


def main(log, out):
    res = []
    for P in pulls(log, ENC):
        res.append(analyse_pull(P))
        x = res[-1]
        print('pull %2d %s %5.0fs  reached %-14s end %5s%%  deaths %d' % (x['n'], x['clock'], x['dur'], x['reached'],
              x['end_hp'], len(x['deaths'])), file=sys.stderr)
    facts = {'encounter': ENC, 'boss_hp': sorted({x['boss_hp'] for x in res}), 'date': P['date'] if res else None,
             'summary': summarise(res), 'pulls': res}
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(facts, f, ensure_ascii=False, separators=(',', ':'))
    print('wrote %s (%d pulls, %.0f KB)' % (out, len(res), os.path.getsize(out) / 1024), file=sys.stderr)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__.split('\n\n')[1])
    main(sys.argv[1], sys.argv[2])
