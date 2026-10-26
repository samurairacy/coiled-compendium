"""Ula'tek Heroic, Monday 26 October 2026: twelve wipes, best at 6.5%.

The second review of the same fight, five days after the first, and the first
night the raid reached the hard enrage. The same two questions (Heart
targeting, avoidable damage) are answered again and set against 21 October,
because the trend is what the raid asked for. The rest of the review follows
the wall to where it has moved: the last minute of Stage Three.

Numbers are read from the two facts files. The per-pull narratives were
checked against the log by hand when the report was written.
"""
import collections
from blocks import (f1, f0, when, iso, names, rng, pull, stage, hp_chart, share_chart, heat_chart, snaps_chart,
                    mech_table, share_of, ninety, win_cost, rage, circles, mean, alive_at, hp_at, where, attrition)

ID = 'ulatek-heroic-2026-10-26'
FACTS = 'ulatek-heroic-2026-10-26.json'
PREV = 'ulatek-heroic-2026-10-21.json'
UR = 'Unchecked Rage (boss untanked)'


def night(F):
    """The handful of numbers both nights are compared on."""
    P, S = F['pulls'], F['summary']
    s3 = [x for x in P if x['s3']]
    full = lambda k: [v for n, v in S['heart']['rage%d' % k] if pull(F, n)['dur'] > (156 if k == 1 else 305)]
    sh = S['heart']['share']
    circ = circles(F)
    return {
        'pulls': len(P), 'best': min(P, key=lambda x: x['end_hp']),
        's3': len(s3), 'p4': sum(1 for x in P if any(e['s'] == 'S3 platform 4' for e in x['stages'])),
        'enrage': sum(1 for x in P if x['enrage'] is not None),
        's3hp': min(hp_at(x, x['s3']) for x in s3) if s3 else None,
        'r1': mean(full(1)), 'r2': mean(full(2)) if full(2) else None,
        'heart': 100 * sum(r[2] for r in sh) / sum(sum(r[2:]) for r in sh),
        'bv': max(x['bv_peak'] for x in P),
        'slams': sum(1 for x in P for c in x['group'].get('Rattler Slam (tail untanked)', []) if c['start'] < 20),
        'ur': sum(len(x['group'].get(UR, [])) for x in P),
        'held': (sum(1 for c in circ if c[4]), len(circ)),
        'pots': sum(1 for x in P for ts in x['potions'].values() if any(125 <= t <= 156 for t in ts)),
        'avoid': S['avoid']['raid_rate'],
        'ph': {k: v['rate'] for k, v in S['avoid_by_phase'].items()},
        'vipers': sum(1 for x in P for a, _ in x['adds'].get('Viper', []) if a < 135),
    }


def report(F, facts):
    G = facts(PREV)
    A, B = night(G), night(F)
    S = F['summary']; H = S['heart']; AV = S['avoid']
    P = F['pulls']
    best = B['best']
    third = [x for x in P if len(x['rages']) >= 3]
    lastw = lambda x: x['rages'][2]
    w3share = {}
    for x in third:
        c = collections.Counter()
        for e in x['heart']:
            if e['w'] == 3:
                for k, v in e['casts'].items():
                    c[k if k in ('Heart', 'Body') else 'Adds'] += v
        w3share[x['n']] = round(100 * c['Heart'] / sum(c.values())) if c else None
    w3body = collections.Counter()
    for x in third:
        for e in x['heart']:
            if e['w'] == 3 and e['casts'].get('Body', 0) >= 3 and e['casts'].get('Body', 0) >= e['casts'].get('Heart', 0):
                w3body[e['p']] += 1
    w3d = [e['dist'] for x in third for e in x['heart'] if e['w'] == 3 and e['dist']]
    closer = sum(1 for d in w3d if d[0] < d[1])
    PW = {w: v for w, v in H['per_window'].items()}
    PWprev = G['summary']['heart']['per_window']
    whole = collections.Counter(w[2] for w in H['whole'])
    n90, nsh = ninety(F)
    sh = {r[0]: r for r in H['share']}
    pots_w3 = sum(1 for x in third for ts in x['potions'].values() if any(lastw(x) - 15 <= t <= lastw(x) + 20 for t in ts))
    never = sorted(set(S['players']) - {p for x in P for p in x['potions']})
    shr = [x for x in P if x['adds'].get('Shrieker')]
    life = lambda a: (a[1] - a[0]) if a[1] is not None else None
    fastest = min((x for x in shr if len(x['adds']['Shrieker']) >= 3 and all(a[1] for a in x['adds']['Shrieker'])),
                  key=lambda x: max(life(a) for a in x['adds']['Shrieker']))
    circ = circles(F)
    failed = [c for c in circ if not c[4]]
    held_min = min(c[3] for c in circ if c[4])
    urs = [(x['n'], c) for x in P for c in x['group'].get(UR, [])]
    at308 = [(n, c) for n, c in urs if 305 <= c['start'] <= 312]
    at40 = [(n, c) for n, c in urs if 36 <= c['start'] <= 44]
    rank = AV['rank']
    prevrate = {r['p']: r['rate'] for r in G['summary']['avoid']['rank']}
    cw = AV['mech']['Caustic Waves']
    cwk = len(AV['killing_blows'].get('Caustic Waves', []))
    dv = AV['mech']['Deadly Venom (pool)']
    s1 = dict((n, k) for n, k in AV['stage1_hits'])
    vip = {x['n']: sum(1 for a, _ in x['adds'].get('Viper', []) if a < 135) for x in P}
    putrid = {x['n']: sum(c['dmg'] for c in x['group'].get('Putrid Membrane (Viper hatched)', []) if c['start'] < 135) / 1e6 for x in P}
    w = names
    cnt = lambda v: '%d%s' % (v, '')
    return {
     'id': ID, 'mod': 'r', 'boss': 'ulatek', 'diff': 'h',
     'date': iso(F['date']), 'when': when(F['date']),
     'title': "Ula'tek, Heroic", 'kicker': 'The Venomous Abyss · Heroic · final boss',
     'pulls': len(P), 'kills': sum(1 for x in P if x['kill']), 'players': len(S['players']),
     'best': '%s%%' % f1(best['end_hp']), 'bestNote': 'Pull %d, reached the enrage' % best['n'],
     'span': '%s to %s' % (P[0]['clock'], P[-1]['end_clock']),
     'pdf': 'assets/logs/%s.pdf' % ID,
     'blurb': "Twelve wipes, best at %s%%, and two pulls into the enrage. The fixes from 21 October held. The wall has moved to the last "
              "minute: the third Heart window, Shrieker kill speed, and who is still alive to use it." % f1(best['end_hp']),
     'sections': [
      {'id': 'summary', 'h': 'The short version', 'blocks': [
        {'k': 'tiles', 'items': [
          [str(len(P)), 'pulls, %s to %s, all wipes' % (P[0]['clock'], P[-1]['end_clock']), ''],
          ['%s%%' % f1(best['end_hp']), 'best pull (#%d): into the enrage, %d s' % (best['n'], best['dur']), 'acc'],
          ['%d of %d' % (B['p4'], len(P)), 'pulls reached the fourth platform (none did on 21 Oct)', ''],
          ['%s pts' % f1(A['best']['end_hp'] - best['end_hp']), 'closer than 21 Oct: the best pull went from %s%% to %s%%'
           % (f1(A['best']['end_hp']), f1(best['end_hp'])), 'gold']]},
        {'k': 'ul', 'items': [
          "**You are at the last minute.** The fourth platform breaks at about 594 s and Fury Unleashed follows at 599 s, so the third Heart "
          "window, from 574 s to 594 s, is the kill window. Tonight’s best pull went into it at %s%% with %d alive. #5 went in at %s%% with "
          "%d alive. One had the health and the other had the bodies, and neither had both."
          % (f1(hp_at(best, lastw(best))), alive_at(best, lastw(best)), f1(hp_at(pull(F, 5), 574)), alive_at(pull(F, 5), lastw(pull(F, 5)))),
          "**The fixes from 21 October held.** Blight Vein never went past %d stacks (it reached %d and wiped two pulls last time). There were "
          "%d opening Rattler Slams (there were %d). %d Potions of Recklessness went into the first Heart window (there were %d). %d of %d "
          "Serpent’s Bite circles held." % (B['bv'], A['bv'], B['slams'], A['slams'], B['pots'], A['pots'], B['held'][0], B['held'][1]),
          "**Heart targeting got worse, and worst where it matters most.** %d%% of targeted casts in the first window went at the Heart (%d%% "
          "on 21 Oct), %d%% in the second (%d%%), and **%d%% in the third**, the only window that can end the fight."
          % (PW['1']['heart_share'], PWprev['1']['heart_share'], PW['2']['heart_share'], PWprev['2']['heart_share'], PW['3']['heart_share']),
          "**Avoidable damage rose, mostly because you lived longer.** Per 10 minutes alive, Stage One went from %s to %s hits (worse), "
          "Stage Two from %s to %s (better), and Stage Three from %s to %s, but you spent nearly four times as long in it. Caustic Waves was "
          "the killing blow %d times." % (f1(A['ph']['Stage 1']), f1(B['ph']['Stage 1']), f1(A['ph']['Stage 2']), f1(B['ph']['Stage 2']),
                                          f1(A['ph']['Stage 3']), f1(B['ph']['Stage 3']), cwk)]},
        {'k': 'callout', 'title': 'Fix these first', 'items': [
          'Everyone on the Heart in the third window: a focus or target macro, and no cleave-only rotations on the body.',
          'Kill Shriekers like #%d did. Its three died in %s s, and nobody died between the intermission and the fourth bite.'
          % (fastest['n'], rng([life(a) for a in fastest['adds']['Shrieker']], f0)),
          'At the end of the second window (304 s) Parmageddon taunts her from melee before Hyperxd moves. That is where %d of %d Unchecked '
          'Rages happened.' % (len(at308), len(urs)),
          'Bite carriers live: an external or a defensive on each mark, because a carrier who dies becomes the corpse.']},
      ]},
      {'id': 'night', 'kick': 'Section 1', 'h': 'How the night went', 'blocks': [
        {'k': 'lede', 't': "Same fight, same clock: the Heart opens at 135.5 s, 284.5 s and, new tonight because you got there, 573.7 s on the "
                           "fourth platform. %d of %d pulls reached Stage Three and %d reached the fourth platform. Two ran into the enrage."
                           % (B['s3'], len(P), B['p4'])},
        hp_chart(F, best['n'], "Ula'tek's health over twelve pulls"),
        {'k': 'cap', 't': "Ula'tek’s health over time; the best pull (#%d) is highlighted, and the shaded bands are the three Heart windows. "
                          "The third only exists for a raid that reaches the fourth platform." % best['n']},
        {'k': 'h3', 't': 'Two nights, side by side'},
        {'k': 'table', 'head': ['', '21 Oct', 'Tonight'], 'mono': [1, 2], 'rows': [
          ['Pulls', str(A['pulls']), str(B['pulls'])],
          ['Best pull', '%s%% (#%d)' % (f1(A['best']['end_hp']), A['best']['n']), '%s%% (#%d)' % (f1(best['end_hp']), best['n'])],
          ['Reached Stage Three', str(A['s3']), str(B['s3'])],
          ['Reached the fourth platform', str(A['p4']), str(B['p4'])],
          ['Reached the enrage', str(A['enrage']), str(B['enrage'])],
          ['Lowest boss health entering Stage Three', '%s%%' % f1(A['s3hp']), '%s%%' % f1(B['s3hp'])],
          ['First Heart window, average boss health removed', '%s%%' % f1(A['r1']), '%s%%' % f1(B['r1'])],
          ['Second Heart window, average', '%s%%' % f1(A['r2']), '%s%%' % f1(B['r2'])],
          ['Targeted casts on the Heart, all windows', '%d%%' % A['heart'], '%d%%' % B['heart']],
          ['Worst Blight Vein stack', str(A['bv']), str(B['bv'])],
          ['Opening Rattler Slams', str(A['slams']), str(B['slams'])],
          ['Unchecked Rage events', str(A['ur']), str(B['ur'])],
          ['Serpent’s Bite circles held', '%d of %d' % A['held'], '%d of %d' % B['held']],
          ['Potions in the first Heart window', str(A['pots']), str(B['pots'])],
          ['Vipers hatched in Stage One', str(A['vipers']), str(B['vipers'])],
          ['Avoidable hits per 10 min alive', f1(A['avoid']), f1(B['avoid'])]]},
        {'k': 'cap', 't': 'Heart-window averages leave out pulls that wiped inside the window. Tonight’s first four pulls were seventeen players, '
                          'which raises her health by about 6%; every percentage here is of the health she had in that pull.'},
        {'k': 'h3', 't': 'Every wipe, and what ended it'},
        {'k': 'table', 'head': ['Pull', 'Length', 'Wiped in', 'HP', 'What ended it'], 'mono': [0, 1, 3],
         'rows': [['#%d' % x['n'], '%d s' % x['dur'], where(x['wiped_in']), '%s%%' % f1(x['end_hp']), WIPES[x['n']]] for x in P]},
      ]},
      {'id': 'heart', 'kick': 'Section 2', 'h': 'Are people hitting the Heart?', 'blocks': [
        {'k': 'lede', 't': "**Less than on 21 October, and least in the window that matters.** The Heart still takes double damage (the same "
                           "player’s same spell hit it **%s×** harder than the body, over %d player-spell pairs), so every global on the body "
                           "in a window is half a global. Tonight there was a third window, and it decides the kill."
                           % ('%.2f' % H['ratio_median'], H['ratio_pairs'])},
        {'k': 'table', 'head': ['Window', 'Opens', 'Heart share, 21 Oct', 'Heart share, tonight', 'Boss health removed, tonight'], 'mono': [1, 2, 3, 4],
         'rows': [['First', '135.5 s', '%s%%' % f0(PWprev['1']['heart_share']), '%s%%' % f0(PW['1']['heart_share']), '%s%% average' % f1(B['r1'])],
                  ['Second', '284.5 s', '%s%%' % f0(PWprev['2']['heart_share']), '%s%%' % f0(PW['2']['heart_share']), '%s%% average' % f1(B['r2'])],
                  ['Third', '573.7 s', '—', '**%s%%**' % f0(PW['3']['heart_share']),
                   ', '.join('#%d %s%%' % (n, f1(h)) for n, b_, h in PW['3']['pulls'])]]},
        share_chart(F),
        {'k': 'cap', 't': 'Share of each player’s targeted casts, all three windows together. Measured from what each cast was aimed at, not '
                          'where the damage landed, so cleave onto the body is not counted as a mistake. Anyone with fewer than 20 targeted '
                          'casts in the windows is left out.'},
        {'k': 'h3', 't': 'The third window'},
        {'k': 'p', 't': 'Four pulls reached it. In %d of %d player-windows the player stood closer to the Heart than to her centre, so reach '
                        'was not the problem. Players who aimed at least as many casts at the body as at the Heart in a third window: %s.'
                        % (closer, len(w3d),
                           w(['**%s** (%d of %d)' % (p, k, len(third)) for p, k in w3body.most_common()]))},
        {'k': 'table', 'head': ['Pull', 'Boss health entering', 'Alive entering', 'Heart share in the window', 'Boss health at 594 s', 'How it ended'],
         'mono': [0, 1, 2, 3, 4],
         'rows': [['#%d' % x['n'], '%s%%' % f1(hp_at(x, lastw(x))), str(alive_at(x, lastw(x))),
                   '%d%%' % w3share[x['n']] if w3share[x['n']] is not None else '—', '%s%%' % f1(hp_at(x, 594)), THIRD[x['n']]] for x in third]},
        {'k': 'callout', 'title': 'What this is worth',
         't': 'In #5 the body took %s%% of her health in single-target hits during the third window. Moved onto the Heart, that is about %s%% '
              'more, which on its own does not close a 10%% gap. Targeting is one lever of three: arrive with more people (section 4), arrive '
              'lower, and then spend the window on the Heart. #7 arrived at %s%% and needed all of it from the window. With %d alive '
              'going in and %d at the end, it found %s%%.'
              % (f1(next(b_ for n, b_, h in PW['3']['pulls'] if n == 5)), f1(next(b_ for n, b_, h in PW['3']['pulls'] if n == 5)),
                 f1(hp_at(best, lastw(best))), alive_at(best, lastw(best)), alive_at(best, 594), f1(hp_at(best, lastw(best)) - hp_at(best, 594)))},
        {'k': 'h3', 't': 'Across the night'},
        {'k': 'ul', 'items': [
          '**%d of %d** players put 90%% or more of their targeted casts on the Heart (it was %d of %d). Lowest among DPS: %s.'
          % (n90, nsh, *ninety(G), w(['%s %d%%' % (p, share_of(F, p)) for p in sorted((r[0] for r in H['share'] if r[1] == 'dps'),
                                                                           key=lambda p: share_of(F, p))[:4]])),
          '**Windows spent mostly on the body**, tonight: %s.' % w(['%s %d' % kv for kv in whole.most_common(5)]),
          '**Nestle** (Beast Mastery, four pulls) aimed %d of %d targeted casts at the body. Hunter pets follow the hunter’s target, so the '
          'pet went too.' % (sh['Nestle'][3], sum(sh['Nestle'][2:])) if 'Nestle' in sh else '',
          '**Hyperxd at %d%%** is still the tank holding her through the windows. Parmageddon is at %d%%.'
          % (share_of(F, 'Hyperxd'), share_of(F, 'Parmageddon'))]},
        {'k': 'h3', 't': 'Potions: the advice landed'},
        {'k': 'p', 't': '%d Potions of Recklessness went into the first window tonight, against %d on 21 October, and %d more into the third '
                        'window. Still never drunk, in any pull: %s.' % (B['pots'], A['pots'], pots_w3, w(never))},
      ]},
      {'id': 'avoidable', 'kick': 'Section 3', 'h': 'Avoidable damage', 'blocks': [
        {'k': 'lede', 't': 'The same definition as on 21 October: **Caustic Waves**, **Virulent Spit**, **Falling Debris**, **Deadly Venom** '
                           'pools and **Desperate Thrash** on a non-tank, counted per hit (absorbed hits included), normalised by time alive. '
                           'The fair comparison between the nights is by stage, because tonight spent far longer in the hardest one.'},
        {'k': 'table', 'head': ['Stage', '21 Oct, per 10 min alive', 'Tonight', 'Time alive, 21 Oct', 'Tonight'], 'mono': [1, 2, 3, 4],
         'rows': [[ph, f1(G['summary']['avoid_by_phase'][ph]['rate']), f1(S['avoid_by_phase'][ph]['rate']),
                   '%s player-min' % f0(G['summary']['avoid_by_phase'][ph]['alive_min']), '%s player-min' % f0(S['avoid_by_phase'][ph]['alive_min'])]
                  for ph in ('Stage 1', 'Stage 2', 'Stage 3')]},
        heat_chart(F),
        {'k': 'cap', 't': 'Personal avoidable hits per player per pull. A dot means none; a dash means the player was not in the raid for that '
                          'pull.'},
        {'k': 'h3', 't': 'Top offenders, and the trend'},
        {'k': 'table', 'head': ['Player', 'Role', 'Hits', 'Per 10 min alive', '21 Oct', 'Change', 'Per pull (mean ± sd)'],
         'mono': [2, 3, 4, 5, 6], 'hl': [0, 1, 2],
         'rows': [[r['p'], r['role'], str(r['tot']), f1(r['rate']),
                   f1(prevrate[r['p']]) if r['p'] in prevrate else 'new',
                   ('%+.1f' % (r['rate'] - prevrate[r['p']])) if r['p'] in prevrate else '—',
                   '%s ± %s' % (f1(r['mean']), f1(r['sd']))] for r in rank]},
        {'k': 'h3', 't': 'How to read it'},
        {'k': 'ul', 'items': [
          '**Caustic Waves is the problem now.** %d hits and %sM of damage, against %d on 21 October, and the killing blow %d times. By '
          'Stage Three a wave is close to lethal on its own. Most hit: %s.'
          % (cw['hits'], f0(cw['dmg'] / 1e6), G['summary']['avoid']['mech']['Caustic Waves']['hits'], cwk,
             w(['%s %d' % (p, c) for p, c in cw['who']])),
          '**Deadly Venom pools** went from %d exposures to %d, nearly all of them in Stage Three, where platforms fill with venom and Volatile '
          'Purge raises the damage it does. Most exposed: %s.'
          % (G['summary']['avoid']['mech']['Deadly Venom (pool)']['hits'], dv['hits'], w(['%s %d' % (p, c) for p, c in dv['who']])),
          '**Stage One got worse**, and it is the stage you play twelve times a night. Two pulls stand out: %s.'
          % w(['#%d (%d hits)' % (n, k) for n, k in sorted(s1.items(), key=lambda kv: -kv[1])[:2]]),
          '**The tanks still top the table**, for the same positional reason as last time. Among everyone else the biggest risers since 21 '
          'October are %s.' % w(['%s (%s → %s)' % (r['p'], f1(prevrate[r['p']]), f1(r['rate']))
                                 for r in sorted((r for r in rank if r['role'] != 'tank' and r['p'] in prevrate),
                                                 key=lambda r: prevrate[r['p']] - r['rate'])[:3]])]},
        {'k': 'h3', 't': 'By mechanic'},
        mech_table(F),
      ]},
      {'id': 'killers', 'kick': 'Section 4', 'h': 'What is ending pulls now', 'blocks': [
        {'k': 'lede', 't': 'Last time it was Blight Vein chains, short bite circles and tank hand-offs. The first is gone, the second has a new '
                           'cause, and the third has moved to a new time. Stage Three attrition is the new wall.'},
        {'k': 'h3', 't': 'Stage Three attrition: the Shriekers'},
        {'k': 'p', 't': 'One Blightscale Shrieker arrives at about 450 s and two more at about 512 s. Their Acidic Expulsion cannot be '
                        'interrupted and hits everyone, so the only lever is how long they live. The fastest kill of the night was also the '
                        'only pull that lost nobody in Stage Three before the wipe:'},
        {'k': 'table', 'head': ['Pull', 'First Shrieker lived', 'Second pair lived', 'Acidic Expulsion damage', 'Stage Three deaths before the wipe', 'Vicious Echoes through'],
         'mono': [0, 1, 2, 3, 4, 5],
         'rows': [['#%d' % x['n'], ('%d s' % life(x['adds']['Shrieker'][0])) if life(x['adds']['Shrieker'][0]) else 'never died',
                   ', '.join(('%d s' % life(a)) if life(a) else 'never died' for a in x['adds']['Shrieker'][1:3]) or '—',
                   '%sM' % f0(sum(c['dmg'] for c in x['group'].get('Acidic Expulsion (Shrieker alive)', [])) / 1e6),
                   str(attrition(x)),
                   ', '.join('%s s' % f0(t) for t in x['kicks'].get('Vicious Echoes', {}).get('through', [])) or '—']
                  for x in shr if x['s3']]},
        {'k': 'cap', 't': 'Vicious Echoes is the Shrieker cast that CAN be kicked; it stuns for 6 s. In #4 the one that went through at 527.5 s '
                          'was followed by nine deaths in two seconds.'},
        {'k': 'h3', 't': 'Serpent’s Bite: carriers who die'},
        {'k': 'p', 't': '%d of %d circles held tonight, and every one that held collected %d or more helper ticks. The failures changed '
                        'character from 21 October: most were not short circles, they were **carriers who died**. A carrier who '
                        'dies holding the venom becomes the Calcified Corpse, and on Heroic that ends the pull.'
                        % (B['held'][0], B['held'][1], held_min)},
        {'k': 'table', 'head': ['Pull · bite', 'Carrier', 'Helper ticks', 'What happened'], 'mono': [0, 2], 'rows': [
          ['#%d · %s' % (c[0], ['1st', '2nd', '3rd', '4th'][[b['t'] for b in pull(F, c[0])['bites']].index(c[1])]), c[2], str(c[3]),
           BITES.get((c[0], c[2]), '')] for c in sorted(failed)]},
        {'k': 'callout', 'title': 'The fix',
         't': 'Treat the three marks as the three most important players alive for fifteen seconds: an external on each, personals ready, and '
              'nobody carrying a mark into a wave. The reserve rule from last time still stands for circles short of helpers.'},
        {'k': 'h3', 't': 'Unchecked Rage moved to 308 seconds'},
        {'k': 'p', 't': '%d Unchecked Rages tonight against %d on 21 October, but they cluster in two places. **%d came at 305–312 s**, right '
                        'after the second Heart window closes: Hyperxd still held her from %s yd away while Parmageddon stood in reach (%s '
                        'yd) without aggro. **%d came at 36–44 s**, the first hand-off, with Hyperxd %s yd out.'
                        % (len(urs), A['ur'], len(at308), rng([c['ctx']['tank_dist'].get('Hyperxd', 0) for _, c in at308], f0),
                           rng([c['ctx']['tank_dist'].get('Parmageddon', 0) for _, c in at308], f0), len(at40),
                           rng([c['ctx']['tank_dist'].get('Hyperxd', 0) for _, c in at40], f0))},
        {'k': 'table', 'head': ['Pull', 'When', 'Her target', 'Hyperxd from her', 'Parmageddon from her'], 'mono': [0, 1, 3, 4],
         'rows': [['#%d' % n, '%s s' % f1(c['start']), (c['ctx'].get('boss_melee') or [None, '?'])[1],
                   '%s yd' % c['ctx']['tank_dist'].get('Hyperxd', '?'), '%s yd' % c['ctx']['tank_dist'].get('Parmageddon', '?')]
                  for n, c in urs]},
        {'k': 'cap', 't': 'Distances are measured from her centre; the tank holding her in melee reads about 15 yd. Positions come from the log '
                          'and can lag a moving player by a second.'},
        {'k': 'callout', 'title': 'The fix',
         't': 'The rule from last time, applied at two named moments. **When the second window closes, Parmageddon taunts her from melee before '
              'Hyperxd moves.** At the first hand-off (about 38 s), the same order: the incoming tank is in reach and taunting before the '
              'outgoing one leaves.'},
        {'k': 'h3', 't': 'Stage One: Vipers'},
        {'k': 'p', 't': 'An egg that touches venom hatches a Viper, and every Viper hatched sprays Putrid Membrane over the whole raid. %d Vipers '
                        'hatched in Stage One tonight (%d on 21 October). The two short pulls that died in the first Heart window, #8 and #9, '
                        'each lost two, and #11 lost eight.' % (B['vipers'], A['vipers'])},
        {'k': 'table', 'head': ['Pull', 'Vipers in Stage One', 'Putrid Membrane damage'], 'mono': [0, 1, 2],
         'rows': [['#%d' % n, str(k), '%sM' % f1(putrid[n])] for n, k in vip.items() if k]},
      ]},
      {'id': 'next', 'h': 'Next raid night, in order', 'blocks': [
        {'k': 'ul', 'ordered': True, 'items': [
          '**The third window is the kill.** Everyone on the Heart, potions and cooldowns held for it, and %s specifically checking their '
          'target when it opens.' % w([p for p, _ in w3body.most_common(4)]),
          '**Shriekers die in about 35 seconds or less.** #%d did it and lost nobody before the fourth bite. Kick every Vicious Echoes.' % fastest['n'],
          '**Parmageddon taunts at 304 s**, from melee, as the second window closes; the same order at the 38 s hand-off.',
          '**Bite carriers get an external and stay out of waves.** A carrier who dies is a wipe.',
          '**Caustic Waves.** %d hits and %d deaths. The back set on Heroic is the one that catches people.' % (cw['hits'], cwk),
          '**Stage One eggs.** No egg into venom; #11 died to eight Vipers before the first window.']},
      ]},
      {'id': 'method', 'h': 'Method and caveats', 'blocks': [
        {'k': 'p', 'small': True, 't': 'Source: the in-game combat log (advanced logging, build 12.1.5), %d encounters of Ula’tek (encounter %d), '
          'Heroic, %d players across the night (seventeen for the first four pulls, then sixteen). Parsed by tools/logs/ulatek.py in this '
          'repository, the same script that now produces the 21 October review, so the two nights are measured identically.'
          % (len(P), F['encounter'], len(S['players']))},
        {'k': 'p', 'small': True, 't': 'Pulls are written #1–#12. Warcraft Logs writes its phases as P1–P3, and they are the stages here: Stage '
          'One (P1), Stage Two (P2), Stage Three (P3). The intermission between the last two belongs to neither. Inside a stage the review '
          'slices time further, at each Heart window and each platform break, because the damage rate changes at every one of them.'},
        {'k': 'p', 'small': True, 't': 'Boss health is read per pull, because it scales with raid size (874M at sixteen, 930M at seventeen). '
          'Alive counts include battle resurrections. Serpent’s Bite helper ticks are assigned to the nearest carrier by position. Shrieker '
          'lifetimes run from the first event naming the add to its death.'},
      ]},
     ],
    }


WIPES = {
 1: 'One of the two Doomscale Eggs was never delivered. Its 90-second clock ran out at 254 s, the Ravenous Doomscale hatched, and Dread '
    'Roar stunned and killed the raid at 266 s. Four Vipers had already hatched in Stage One.',
 2: 'Lili, carrying the second Serpent’s Bite, died to a Caustic Wave at 475 s. The carrier became the Calcified Corpse and the raid '
    'died within three seconds.',
 3: 'The three Shriekers lived 34–41 s and Acidic Expulsion did 79M; eight died between 480 and 529 s. The fourth bite’s Elladale circle '
    'had two helpers and failed inside the third window.',
 4: 'A Vicious Echoes went through at 527.5 s and stunned the raid under Acidic Expulsion: nine deaths at 527–529 s. The second pair of '
    'Shriekers never died.',
 5: 'The cleanest pull: Shriekers dead in 26–36 s and nobody lost until the third window. In at 18.7%, out at 10.4%; the final platform '
    'break killed ten at 594 s and Fury Unleashed took the rest.',
 6: 'Nine died between 418 and 528 s (Volatile Purge, Caustic Waves, the second Shrieker pair). Then Pawsey was killed outright by the '
    'fourth bite’s own hit at 562 s, and each Calcified Corpse took the next carrier with it: the raid was gone by 564 s.',
 7: 'Best pull. In to the third window at 12.8% but with eleven alive, then more deaths inside it. Out at 6.9%, then the final break and '
    'Fury Unleashed.',
 8: 'Two Vipers hatched at 106–110 s. Hyperxd died holding her at 129 s, which fired Unchecked Rage, and Rage of the Shackled finished a '
    'low raid inside the first Heart window.',
 9: 'Rattler Slam at 77 s after the tail lost Hyperxd, two Vipers at 106–108 s, and Rage of the Shackled finished a low raid at 144 s.',
 10: 'Into the third window at 11.2% with ten alive. Predz, carrying the fourth bite, died to Acidic Expulsion at 574 s; the corpse ended '
     'it a second later.',
 11: 'Eight Vipers hatched at 109–118 s. Mother’s Wrath then marked Hyperxd 26 yd from her, out of reach, and every bite went '
     'raid-wide at 119 s.',
 12: 'Unchecked Rage at 501 and 507 s, Hyperxd 43 yd away and Parmageddon in reach without aggro, for 14M. The second Shrieker pair '
     'never died and the raid fell at 550–554 s.',
}
THIRD = {
 3: 'Raid collapsing; fourth bite failed inside the window',
 5: 'Survived the window, killed by the final break',
 7: 'Survived the window with six, enrage',
 10: 'Fourth-bite carrier died; corpse wipe',
}
BITES = {
 (2, 'Lili'): 'Died to a Caustic Wave mid-bite.',
 (3, 'Elladale'): 'Two helpers. Genuinely short.',
 (6, 'Pawsey'): 'Killed outright by the bite’s own hit, one second in.',
 (6, 'Littlemel'): 'Killed by Pawsey’s corpse, two seconds in.',
 (6, 'Mishamigo'): 'Killed by the corpse chain, three seconds in.',
 (10, 'Predz'): 'Died to Acidic Expulsion mid-bite.',
}
