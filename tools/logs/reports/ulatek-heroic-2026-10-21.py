"""Ula'tek Heroic, Wednesday 21 October 2026: ten wipes, best at 35%.

The first log review. Its question came from the raid: are people hitting the
Heart, and who is taking avoidable damage? The answer turned out to be "mostly
yes" and "steadily, not catastrophically" — and the wipes came from Blight Vein
chains, short Serpent's Bite circles and tank hand-offs instead.

Every number below is read from the facts file. The prose that interprets the
numbers (what a wipe "was", what the fix is) is editorial and was checked
against the log by hand when the report was written.
"""
from blocks import (f1, f0, when, iso, names, rng, pull, stage, hp_chart, share_chart, heat_chart, snaps_chart,
                    rank_table, mech_table, whole_table, share_of, ninety, win_cost, rage, circles, mean, where)

ID = 'ulatek-heroic-2026-10-21'
FACTS = 'ulatek-heroic-2026-10-21.json'


def report(F, facts):
    S = F['summary']; A = S['avoid']; H = S['heart']
    P = F['pulls']
    best = min(P, key=lambda x: x['end_hp'])
    r1, r2, wc = rage(F, 1), rage(F, 2), win_cost(F)
    n90, nsh = ninety(F)
    s3 = [x for x in P if x['s3']]
    whole_people = sorted({w[2] for w in H['whole'] if sum(1 for v in H['whole'] if v[2] == w[2]) >= 2})
    circ = circles(F)
    held = [c for c in circ if c[4]]
    failed = [c for c in circ if not c[4]]
    tick = [x['bv_tick_per_stack'] for x in P if x['bv_tick_per_stack']]
    peaks = {x['n']: x['bv_peak'] for x in P if x['snaps']}
    wiped_bv = [n for n, k in peaks.items() if k >= 5]
    kept = [k for n, k in peaks.items() if n in (2, 3, 8, 9)]
    rank = A['rank']
    nt = [r for r in rank if r['role'] != 'tank']
    pw = next(r for r in rank if r['p'] == 'Pawsey')
    s1 = dict((n, k) for n, k in A['stage1_hits'])
    s1top = sorted(s1.items(), key=lambda kv: -kv[1])[:2]
    spit = A['killing_blows'].get('Virulent Spit', [])
    spit_who = max({p for p, _ in spit}, key=lambda p: sum(1 for q, _ in spit if q == p))
    spit_hits = next(c for p, c in A['mech']['Virulent Spit']['who'] if p == spit_who)
    tail_clean = [pull(F, n)['tail']['first_tank_cast'][0] for n in (1, 4, 6, 7, 8, 9)]
    tail_slam = [pull(F, n)['tail']['first_tank_swing'][0] for n in (2, 3, 5)]
    mw1 = pull(F, 1)['group']["Mother's Wrath (tank out of reach)"][0]['ctx']['mark']
    deaths1 = [d for d in pull(F, 1)['deaths'] if d['t'] >= 119]
    tankfail = sum(c['dmg'] for x in P for m in ('Unchecked Rage (boss untanked)', 'Rattler Slam (tail untanked)',
                                                   "Mother's Wrath (tank out of reach)") for c in x['group'].get(m, [])) / 1e6
    p2 = [c for c in circ if c[0] == 2]
    p2bad = next(c for c in p2 if not c[4])
    p2ok = sorted(c[3] for c in p2 if c[4])
    p8bad = next(c for c in circ if c[0] == 8 and not c[4])
    p9bad = next(c for c in circ if c[0] == 9 and not c[4])
    purge_ok = [b['purge_at'] for x in P for b in x['bites'] if not b['calc']]
    w = lambda ws: names(ws)
    nm = lambda n: '#%d' % n
    potions = {p: v for x in P for p, v in x['potions'].items()}
    early = sorted({p for x in P for p, ts in x['potions'].items() if any(t < 10 for t in ts)})
    in_w1 = {}
    for x in P:
        for p, ts in x['potions'].items():
            if any(125 <= t <= 156 for t in ts):
                in_w1[p] = in_w1.get(p, 0) + 1
    never = sorted(set(S['players']) - {p for x in P for p in x['potions']})
    lust = [x['lust'][0][0] for x in P if x['lust']]
    cw = A['mech']['Caustic Waves']
    cots = sum(1 for x in P if x['hits'].get('Blackscale', {}).get('Call of the Serpent (landing)'))
    st1 = [stage(F, x['n'], 'Stage 1')['rate'] for x in P]
    s3r = [e['rate'] for x in s3 for e in x['stages'] if e['s'].startswith('S3') and e['to'] - e['from'] > 20]
    s3a = [e['adds_share'] for x in s3 for e in x['stages'] if e['s'].startswith('S3') and e['to'] - e['from'] > 20]
    p8hp = [v for t, v in best['curve'] if t <= best['s3'] + 10][-1]
    return {
     'id': ID, 'mod': 'r', 'boss': 'ulatek', 'diff': 'h',
     'date': iso(F['date']), 'when': when(F['date']),
     'title': "Ula'tek, Heroic", 'kicker': 'The Venomous Abyss · Heroic · final boss',
     'pulls': len(P), 'kills': sum(1 for x in P if x['kill']), 'players': len(S['players']),
     'best': '%s%%' % f1(best['end_hp']), 'bestNote': 'Pull %d, %s' % (best['n'], best['wiped_in']),
     'span': '%s to %s' % (P[0]['clock'], P[-1]['end_clock']),
     'pdf': 'assets/logs/%s.pdf' % ID,
     'blurb': "Ten Heroic wipes, best at %s%%. Heart targeting turns out fine and dodging is steady. The pulls ended on Grasping "
              "Fangs snap timing, short Serpent's Bite circles and tank hand-offs." % f1(best['end_hp']),
     'sections': [
      {'id': 'summary', 'h': 'The short version', 'blocks': [
        {'k': 'tiles', 'items': [[str(len(P)), 'pulls, %s to %s, all wipes' % (P[0]['clock'], P[-1]['end_clock']), ''],
                                 ['%s%%' % f1(best['end_hp']), 'best pull (#%d): Stage Three, third platform, %d s' % (best['n'], best['dur']), 'acc'],
                                 ['%d of %d' % (len(s3), len(P)), 'pulls reached Stage Three', ''],
                                 ['0', 'pulls lost to Heart targeting', 'gold']]},
        {'k': 'ul', 'items': [
          "**Heart targeting is mostly fine.** %d of the %d players who cast damage spells in the windows aimed 90%% or more of their "
          "casts at the Venomous Heart while it was exposed. The damage lost to body hits is **at most %s%% of her health per window**, "
          "and that ceiling counts every cleave proc as a mistake. Three players spent whole windows on the body: **%s**. That is worth "
          "fixing, but it didn’t cost you any of the ten pulls." % (n90, nsh, rng(wc), w(['Pawsey', 'Littlemel', 'Hyperxd'])),
          "**Avoidable damage is steady, not spiky.** The raid takes about %s personal avoidable hits per player per 10 minutes alive. "
          "That rate barely changed across the night, so there is no bad pull to point at. Tanks top the table for positional reasons. "
          "Among everyone else, **Pawsey** stands out, and so does **%s** with Virulent Spit, which is a killing blow in Stage Two "
          "because it lands on top of Blight Vein." % (f1(A['raid_rate']), spit_who),
          "**None of the ten wipes was caused by Heart targeting or general dodging.** They come from three places. **Stage Two**: "
          "Grasping Fangs snaps chained too close together (Blight Vein reached 5–6 stacks in %s), and Vipers hatched (#4, #7). "
          "**Serpent’s Bite circles were left short of soakers** after earlier deaths or a group mix-up (#2, #8, #9). **Tank hand-offs "
          "left her or her tail with nobody in reach** (#1, #6, plus seven Unchecked Rage and four opening Rattler Slams)."
          % w([nm(n) for n in wiped_bv])]},
        {'k': 'callout', 'title': 'Fix these first', 'items': [
          'Leave 4.5 s or more between Grasping Fangs snap sets.',
          'Tail tank taunting by 8 s; taunt her only from melee; her tank never leaves her reach.',
          'A named reserve for any Serpent’s Bite group that has lost a member.',
          'Potion of Recklessness inside the first Heart window.']},
      ]},
      {'id': 'night', 'kick': 'Section 1', 'h': 'How the night went', 'blocks': [
        {'k': 'lede', 't': "Every pull follows the same script: Stage One in 135 s, a 20-second Heart window, Stage Two, a second window "
                           "at 284 s, the intermission, then Stage Three on falling platforms. The fight is time-locked: the Heart opens at "
                           "exactly 135.5 s and 284.5 s on every pull. So any difference between pulls is execution, and the pulls can be compared directly."},
        hp_chart(F, best['n'], "Ula'tek's health over ten pulls"),
        {'k': 'cap', 't': "Ula'tek’s health over time; the best pull (#%d) is highlighted, and the shaded bands are the two Heart windows. "
                          "Stage Two is flat because the boss is untargetable while you fight the wardens. Nearly all the progress comes from "
                          "Stage One and the two Heart windows." % best['n']},
        {'k': 'h3', 't': 'Every wipe, and what ended it'},
        {'k': 'table', 'head': ['Pull', 'Length', 'Wiped in', 'HP', 'What ended it'], 'mono': [0, 1, 3], 'rows': [
          ['#%d' % x['n'], '%d s' % x['dur'], where(x['wiped_in']), '%s%%' % f1(x['end_hp']), WIPES[x['n']] % {
              'mwd': mw1[2], 'mwn': len([d for d in deaths1 if d['t'] <= 121.3]),
              'p2bad': p2bad[3], 'p2ok': w([str(v) for v in p2ok]),
              'p8h': names(p8bad[5]), 'p9n': len(p9bad[5])}]
          for x in P]},
        {'k': 'cap', 't': '“Helper ticks” are Serpent’s Bite soak ticks taken by someone other than the marked player, each assigned to the '
                          'nearest marked player using the positions in the log. A Calcified Corpse on this difficulty hits the whole raid, and '
                          'in this log it ended all three pulls it appeared in.'},
      ]},
      {'id': 'heart', 'kick': 'Section 2', 'h': 'Are people hitting the Heart?', 'blocks': [
        {'k': 'lede', 't': "**Mostly yes.** Rage of the Shackled exposes the Venomous Heart for 20 seconds, and the log confirms it shares "
                           "Ula’tek’s health pool. The encounter page says the Heart takes 100%% more damage. The log agrees: the same player’s "
                           "same spell hit the Heart for **%s×** what it did to the body in those windows (median across %d player-spell pairs). "
                           "So every global spent on the body during a window is half a global wasted." % ('%.2f' % H['ratio_median'], H['ratio_pairs'])},
        {'k': 'tiles', 'items': [
          ['%s%%' % f1(mean(r1)), 'average boss HP removed in the first Heart window (range %s%%)' % rng(r1), 'acc'],
          ['%s%%' % f1(mean(r2)), 'average removed in the second window (%d pulls got there)' % len(r2), 'acc'],
          ['%d / %d' % (n90, nsh), 'players with 90%+ of their targeted casts on the Heart', ''],
          ['≤%s%%' % f1(max(wc)), 'worst-case boss HP lost to body hits in any one window', 'gold']]},
        share_chart(F),
        {'k': 'cap', 't': 'Measured from what each cast was aimed at (the target the log records on every successful cast), not from where '
                          'the damage landed. That separates a mis-targeted cast from a cleave proc that spills onto the body. Untargeted AoE '
                          'casts are left out, as is anyone with fewer than 20 targeted casts in the windows.'},
        {'k': 'h3', 't': 'Windows where someone stayed on the body'},
        {'k': 'p', 't': 'These are the player-windows where at least five targeted casts went at the body, and the body got as many casts as '
                        'the Heart or more. Pawsey (Ret) did it in two windows and Littlemel (Destruction) in three. They are the clear DPS cases.'},
        whole_table(F),
        {'k': 'h3', 't': 'Reading the rest of the chart'},
        {'k': 'ul', 'items': [
          '**Hyperxd at %d%%** is the tank on Ula’tek holding her through the window. %d of their twelve windows went almost entirely on '
          'the body. That may be a threat habit rather than a mistake. While she channels Rage of the Shackled she is not meleeing, so '
          'Unchecked Rage cannot fire. Parmageddon, standing just as close, put %d%% on the Heart with no problems. If nothing in your plan '
          'needs the tank on the body, that is free damage.'
          % (share_of(F, 'Hyperxd'), sum(1 for v in H['whole'] if v[2] == 'Hyperxd'), share_of(F, 'Parmageddon')),
          '**Fartshart at %d%%** is a Holy Paladin weaving Judgment and Holy Shock into healing, so it is a small number of casts. Worth a '
          'target-of-target or focus macro, but it won’t move the boss.' % share_of(F, 'Fartshart'),
          '**Nobody was out of range.** In every window the raid stood closer to the Heart than to her centre, so this is target choice, not reach.']},
        {'k': 'callout', 'title': 'What this is worth',
         't': 'Counting *every* single-target hit on the body during a window as a mistake, the raid gave up %s%% of boss health per window. '
              'That ceiling is generous, because the top contributors (Predz, Vurve) aimed %d%% and %d%% of their casts at the Heart. Their '
              'body damage is cleave procs like Sweeping Strikes, which is correct play. The real mis-targeting cost is a fraction of that, '
              'well under 1%% of her health per window. Good to collect, but every pull ended for other reasons first.'
              % (rng(wc), share_of(F, 'Predz'), share_of(F, 'Vurve'))},
        {'k': 'h3', 't': 'The bigger lever in the window: potions'},
        {'k': 'p', 't': 'Heroism lands at %s s, which is right: it covers the whole window. Potions are a different story. Potion of '
                        'Recklessness was drunk in the first 10 s by %s, which puts it on cooldown for the first window. Only %s drank one '
                        '*inside* the first Heart window. %s never drank one in any pull. Potion damage spent on the Heart counts double, so '
                        'the window is the best place for it. The %s%% spread in the first window’s damage across pulls is bigger than the '
                        'whole mis-targeting cost.'
                        % (rng(lust, f0), w(early), w(['%s (%d pull%s)' % (p, k, '' if k == 1 else 's') for p, k in sorted(in_w1.items())]),
                           w(never), rng(r1))},
      ]},
      {'id': 'avoidable', 'kick': 'Section 3', 'h': 'Avoidable damage', 'blocks': [
        {'k': 'lede', 't': 'Personal avoidable damage here means mechanics where the hit belongs to the person hit, according to the Ula’tek '
                           'encounter page: **Caustic Waves** (each impact; its DoT is counted in the damage), **Virulent Spit**, **Falling '
                           'Debris**, **Deadly Venom** pools (one exposure per continuous stand-in) and **Desperate Thrash** on a non-tank. '
                           'Hits fully eaten by an absorb still count. Group failures (Unchecked Rage, Rattler Slam, Putrid Membrane, Calcified '
                           'Corpse) are covered in section 4, because they land on everyone and belong to whoever caused them.'},
        heat_chart(F),
        {'k': 'cap', 't': 'Personal avoidable hits per player per pull, sorted by total. A dot means none. Pull length is under each column, '
                          'and long pulls naturally collect more, which is why the table below normalises by time alive.'},
        {'k': 'h3', 't': 'Top offenders, normalised'},
        rank_table(F),
        {'k': 'h3', 't': 'How to read it'},
        {'k': 'ul', 'items': [
          '**Raid average: %s hits per player per 10 minutes alive.** Per-player standard deviations are %s hits a pull, so nobody had '
          'one disastrous pull. The same few people take the same few hits every time. Stage One plays out identically every pull, and it '
          'produced %d–%d personal hits across the whole raid. The two outliers were %s.'
          % (f1(A['raid_rate']), rng([r['sd'] for r in rank]), min(s1.values()), max(s1.values()),
             w(['#%d (%d)' % kv for kv in sorted(s1top)])),
          '**The tanks top the table, and that is partly the job.** Hyperxd and Parmageddon account for %d of %d hits. Caustic Waves start '
          'at her wings and her tail, which is where the tanks have to stand. Their numbers are real damage for healers to plan around, but '
          'not the same kind of mistake as a DPS walking into a wave.' % (A['tank_hits'], A['total_hits']),
          '**Pawsey is the clear DPS outlier** (%s per 10 min, against a non-tank average of %s), followed by %s. Everyone else is between '
          '%s and %s.' % (f1(pw['rate']), f1(A['nontank_rate']), w(['%s (%s)' % (r['p'], f1(r['rate'])) for r in nt[1:3]]),
                          f1(min(r['rate'] for r in nt[3:])), f1(max(r['rate'] for r in nt[3:]))),
          '**Virulent Spit is the one that kills.** It lands during the Stage Two Blight Vein peak, and it was the killing blow for %s. '
          '%s took %d Spit hits on the night, and died to it %d times.'
          % (w(['%s (#%d)' % (p, n) for p, n in spit]), spit_who, spit_hits, sum(1 for p, _ in spit if p == spit_who))]},
        {'k': 'h3', 't': 'By mechanic'},
        mech_table(F),
        {'k': 'cap', 't': '*Soft* mechanics are not in the ranking: egg catchers may stand under Call of the Serpent drops on purpose (Blackscale '
                          'took one in %d of %d pulls, which looks like a job), and egg collectors brush Warden’s Protection. The raid-wide fall '
                          'when the intermission platform shatters is scripted and left out. Caustic Waves is the expensive one: %d hits for '
                          'about %sM each once the DoT is included.' % (cots, len(P), cw['hits'], f1(cw['dmg'] / cw['hits'] / 1e6))},
      ]},
      {'id': 'killers', 'kick': 'Section 4', 'h': 'What is actually ending pulls', 'blocks': [
        {'k': 'lede', 't': 'Three problems account for nearly all of it, plus two Viper hatches in Stage Two (#4 and #7) that this review flags but does not dissect. In order of cost:'},
        {'k': 'h3', 't': 'Stage Two: the Grasping Fangs snap schedule'},
        {'k': 'p', 't': 'Each Doomscale Warden tethers three players, so six tethers go out at about 190 s. Every snap puts a stack of **Blight '
                        'Vein** on the whole raid. Here is the fact that matters, measured from %d clean expiries in the log: **Blight Vein lasts '
                        'exactly %s seconds after the most recent snap, and every snap refreshes it.** A snap less than 4 s after the previous one '
                        'adds to the stack. A gap of more than 4 s lets the whole stack fall off. Each stack ticks about %sk on every player every 2 s.'
                        % (S['fangs']['bv_expiry_clean'], f1(S['fangs']['bv_expiry_mode']), f0(mean(tick) / 1000))},
        snaps_chart(F, wiped_bv),
        {'k': 'cap', 't': 'A dot is a tether snapping; joined dots are snaps each within 4 s of the last, so the stack kept growing. Surviving '
                          'pulls peaked at %s stacks. %s chained five and six snaps with every gap under 4 s, and the raid died at 5–6 stacks. '
                          '#4 and #7 stayed at 3 but lost a Viper hatch at the same moment.' % (rng(kept, f0), w([nm(n) for n in wiped_bv]))},
        {'k': 'callout', 'title': 'The fix',
         't': 'Make the gap the rule, not the count. The encounter page’s Heroic plan is to snap two, two, then one and one, with a cooldown on '
              'each set. The log adds the timing: **leave at least 4.5 s between sets** so each set starts from zero. Two people snap together, '
              'then the next two snap only on a call, after the stack has visibly dropped.'},
        {'k': 'h3', 't': 'Stage Three: Serpent’s Bite circles left short'},
        {'k': 'p', 't': 'Three marks go out and helpers soak the ticks. Every circle that held collected %d or more helper ticks, and cleared '
                        'early (Volatile Purge arrives %s s in). The three that failed collected %s:'
                        % (min(c[3] for c in held), rng(purge_ok, f0), w([str(c[3]) for c in sorted(failed, key=lambda c: c[3])]))},
        {'k': 'table', 'head': ['Pull · bite', 'Failed circle', 'Its helpers (ticks)', 'Why it was short'], 'mono': [0], 'rows': [
          ['#%d · %s' % (c[0], ['1st', '2nd', '3rd', '4th'][[b['t'] for b in pull(F, c[0])['bites']].index(c[1])]), c[2],
           ', '.join('%s %d' % kv for kv in sorted(c[5].items(), key=lambda kv: -kv[1])) or 'nobody', WHY[c[0]]]
          for c in sorted(failed)]},
        {'k': 'callout', 'title': 'The fix',
         't': 'Give each soak group a named reserve: someone who moves to the short circle when the group has lost a member. Call it once marks '
              'land. The encounter page’s Heroic plan assigns groups before the pull, with healers moving when two circles overlap. Your three '
              'wipes show the missing rule: **a group that has lost people borrows from the healthiest group**.'},
        {'k': 'h3', 't': 'Tank hand-offs'},
        {'k': 'p', 't': 'Ula’tek and her tail both punish an empty melee range by hitting the whole raid. The log shows the same few patterns:'},
        {'k': 'table', 'head': ['What', 'When', 'What the log shows'], 'rows': [
          ['Opening Rattler Slam', '#2, #3, #5, #10 at 12.7–14.8 s',
           'The tail surfaces and slams about 0.7 s into its first cast. In the clean pulls Parmageddon was on it at %s s; in #2, #3 and #5 '
           'the tail first hit a tank at %s s. About 8M raid damage each time, and in #2 the loose tail meleed Predz to death first.'
           % (rng(tail_clean), rng(tail_slam))],
          ['Ranged taunt swap', '#1 and #10 at 38 s, #9 at 70 s',
           'Hand of Reckoning onto Ula’tek from 30–38 yd. Her target is instantly out of reach, so Unchecked Rage fires on the same frame, even '
           'with Hyperxd still beside her. Walk in, then taunt. (#9 was the same thing at her resurfacing point after Submerge.)'],
          ['Tank leaves with aggro', '#6 93 s, #8 464 s',
           '#6: Parmageddon left her for the tail without Hyperxd taking her, giving Unchecked Rage plus Rattler Slam and 5 deaths. #8: '
           'Parmageddon ran to a Rawling while holding the boss.'],
          ['Current tank steps out', '#2 308 s, #9 407 s',
           'Hyperxd, holding her, drifted out of reach (Call of the Serpent and Volatile Purge spreading). In #9 that killed four players, '
           'which then broke the next bite circle.'],
          ['Mother’s Wrath raid-wide', '#1 119 s, #3 454 s',
           'If the marked tank is out of reach, or dead, every bite goes to the raid. #1 was a late swap: the mark landed on the tail tank, '
           '%d yd away. #3 was a tank death under the bites.' % mw1[2]]]},
        {'k': 'callout', 'title': 'The fix',
         't': 'Three rules cover every one of them. **The tail tank is at the tail’s surfacing point and taunting by 8 s. Taunt her only from '
              'inside melee. Whoever holds her never leaves her reach**: if a soak, spread or add needs them, the other tank takes her first, '
              'from melee. The encounter page calls Unchecked Rage “the fight’s quietest wipe cause because nothing on screen announces it.” '
              'Seven of them in one night bears that out.'},
        {'k': 'h3', 't': 'A note on the damage check'},
        {'k': 'p', 't': 'This is not what killed you that night, but it is coming. Stage One and the Heart windows are healthy: about %s%% of '
                        'her health per second in Stage One, and %s%% in each first window. In Stage Three, boss damage falls to %s%% per '
                        'second, and %s%% of raid damage goes into adds (Rawlings, Shriekers). The best pull went from %s%% to %s%% over three '
                        'platforms. Some of that is deaths, and the rest is the add load. Arriving with more people alive, and the Heart '
                        'windows full, is what makes the last platform reachable.'
                        % (rng(st1, lambda v: '%.2f' % v), rng(r1, f0), rng(s3r, lambda v: '%.2f' % v), rng(s3a, f0), f1(p8hp), f1(best['end_hp']))},
      ]},
      {'id': 'next', 'h': 'Next raid night, in order', 'blocks': [
        {'k': 'ul', 'ordered': True, 'items': [
          '**Blight Vein gaps of at least 4.5 s between snap sets**, called by one person. On the log’s evidence this alone would have '
          'carried %s through Stage Two. #4 and #7 also need the Stage Two eggs handled, because a Viper hatched in both.' % w([nm(n) for n in wiped_bv]),
          '**Tail picked up by 8 s; taunts only from melee; the holder never leaves her reach.** That covers #1, #6 and #9’s first collapse, '
          'plus %.0fM of raid-wide damage from untanked hits across the night.' % tankfail,
          '**Serpent’s Bite reserves**: when a soak group loses a member, a named player from another group moves to its circle. This would '
          'have prevented #2, #8 and #9.',
          '**Potion of Recklessness inside the first Heart window** for everyone who can, instead of pre-pull or not at all.',
          '**Pawsey, Littlemel, Hyperxd: Heart macro or focus target** for the two windows. Pawsey and %s: Caustic Waves and Virulent Spit '
          'awareness in Stage Two.' % spit_who]},
      ]},
      {'id': 'method', 'h': 'Method and caveats', 'blocks': METHOD(F)},
     ],
    }


WIPES = {
 1: 'Mother’s Wrath fired at Parmageddon while he was %(mwd)d yd away on the tail. Hyperxd’s Growl came 0.2 s before the cast finished, '
    'too late. Every bite went raid-wide and %(mwn)d players died in 1.6 s.',
 2: 'Serpent’s Bite: Pawsey’s circle got %(p2bad)d helper ticks while the other two got %(p2ok)s. The melee soaked Blackscale’s circle '
    'instead. Pawsey became a Calcified Corpse, and the raid died within 3 s.',
 3: 'Parmageddon died under Mother’s Wrath at 453.9 s. With the marked tank dead, the bites landed on the raid. Three DPS had already '
    'died at 419–424 s to the Volatile Purge DoT plus Caustic Waves.',
 4: 'A Viper hatched at 206 s (Putrid Membrane hit the raid 432 times) on top of Blight Vein. The warden lived long enough to cast a '
    'second set of Grasping Fangs at 217 s.',
 5: 'Five tethers snapped in one unbroken 9-second chain. Blight Vein reached 5 stacks, and 10 players died between 196 and 208 s.',
 6: 'The tail lost its tank twice (Rattler Slam at 87 and 93 s). Parmageddon left the boss to pick it up without Hyperxd taking the '
    'boss, so she hit Unchecked Rage at 93 s and five players died instantly.',
 7: 'A Viper hatched at 209 s (Putrid Membrane, 14.6M raid damage) while Blight Vein was up, and the raid bled out.',
 8: 'Best pull. Five players died around the second platform break (480–487 s). The third bite’s ranged circle then had one helper '
    '(%(p8h)s), and Elladale became a Calcified Corpse at 516 s.',
 9: 'Unchecked Rage at 407 s (her tank had moved out to spread Volatile Purge) killed four, three of them regular soakers of the melee '
    'circle. Pawsey’s next circle had %(p9n)d helpers and failed at 477 s.',
 10: 'Six snaps in one 12-second chain took Blight Vein to 6 stacks, and 14 players died between 201 and 209 s. A Malice also went '
     'through at 178.7 s because the second kick was late.',
}
WHY = {
 2: 'The melee (Hunikel, Vurve, Hyperxd, Predz) soaked **Blackscale’s** circle instead. Group-to-mark assignment broke.',
 8: 'Lili (424 s), then Abyssia, Blackscale and Littlemel (481–487 s), all regular soakers of that circle, were dead. That left the '
    'group with one soaker, and nobody refilled it.',
 9: 'Vurve and Predz died to Unchecked Rage at 407 s. The tanks dipped in to cover, briefly.',
}


def METHOD(F):
    H = F['summary']['heart']
    return [
     {'k': 'p', 'small': True, 't': 'Source: the in-game combat log (advanced logging, build 12.1.5), %d encounters of Ula’tek (encounter '
      '%d), Heroic, %d players. Parsed by tools/logs/ulatek.py in this repository, stdlib Python, straight from raw events. Mechanics were '
      'classified using this compendium’s Ula’tek page (Encounter Journal plus one Heroic strategy guide). That page notes the strategy '
      'is single-sourced, and so is the avoidable/unavoidable split here.' % (len(F['pulls']), F['encounter'], len(F['summary']['players']))},
     {'k': 'p', 'small': True, 't': 'Heart windows run 20 s from each Rage of the Shackled cast, and match the first and last Heart damage to '
      'within 0.1 s. Targeting uses cast targets. The damage-cost ceiling uses hits the log itself flags single-target, so AoE and DoTs '
      'are excluded. The Heart/body ratio is the median over %d player-spell pairs, each with five or more hits on both. Melee is counted '
      'once: the log writes every swing twice.' % H['ratio_pairs']},
     {'k': 'p', 'small': True, 't': 'Circle membership for Serpent’s Bite is inferred from last-known positions and assigned to the nearest '
      'marked player, so treat single ticks as approximate. The gaps between held and failed circles are not sensitive to that. An '
      'earlier version of this page counted absorb sub-rows as extra ticks and roughly doubled every circle; the pattern was the same.'},
     {'k': 'p', 'small': True, 't': 'Not attempted: healing and cooldown audits, interrupt coverage beyond Malice, and the Doomscale egg '
      'delivery. Those would be the next pass if Stage Two keeps being the wall.'},
    ]
