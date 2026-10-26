"""Shared pieces for report modules: formatting, and the standard charts and
tables built straight from a facts file. A report module writes the prose;
anything that is a straight read of the facts lives here, so two reports show
the same table the same way."""
import datetime, statistics

f1 = lambda v: '%.1f' % v
f0 = lambda v: '%.0f' % v
mean = statistics.mean


def when(date):
    """'10/21/2026' -> 'Wednesday 21 October 2026' (computed, never typed:
    a hand-typed weekday is how the first report shipped as a Tuesday)."""
    m, d, y = (int(x) for x in date.split('/'))
    dt = datetime.date(y, m, d)
    return '%s %d %s %d' % (dt.strftime('%A'), dt.day, dt.strftime('%B'), dt.year)


def iso(date):
    m, d, y = date.split('/')
    return '%s-%s-%s' % (y, m, d)


def names(xs):
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' and ' + xs[-1]


def rng(xs, fmt=f1, unit=''):
    lo, hi = min(xs), max(xs)
    return (fmt(lo) + unit) if fmt(lo) == fmt(hi) else '%s–%s%s' % (fmt(lo), fmt(hi), unit)


def pull(F, n):
    return next(x for x in F['pulls'] if x['n'] == n)


def stage(F, n, s):
    return next((e for e in pull(F, n)['stages'] if e['s'] == s), None)


SHORT = {'Stage 1': 'Stage 1', 'Stage 2': 'Stage 2', 'Intermission': 'Int.'}


def hp_chart(F, best, label="Ula'tek's health over every pull"):
    """Boss health per pull; the stage strip comes from the longest pull."""
    ref = max(F['pulls'], key=lambda x: x['dur'])
    stages, s3 = [], None
    for e in ref['stages']:
        nm = e['s']
        if nm.startswith('Heart'):
            stages.append([e['from'], e['to'], 'R' + nm.split()[1]])
        elif nm.startswith('S3'):
            s3 = s3 or e['from']
        elif nm in SHORT:
            stages.append([e['from'], e['to'], SHORT[nm]])
    if s3:
        stages.append([s3, max(ref['dur'], 540), 'Stage 3'])
    bands = [[e['from'], e['to']] for x in [ref] for e in x['stages'] if e['s'].startswith('Heart')]
    return {'k': 'chart', 'kind': 'hp', 'best': best, 'curves': F['summary']['curves'], 'bands': bands,
            'stages': stages, 'label': label}


def share_chart(F):
    return {'k': 'chart', 'kind': 'share', 'label': 'Share of targeted casts during the Heart windows',
            'keys': [['heart', 'Venomous Heart'], ['body', "Ula'tek's body"], ['adds', 'Adds']],
            'rows': F['summary']['heart']['share']}


def heat_chart(F):
    return {'k': 'chart', 'kind': 'heat', 'label': 'Personal avoidable hits per player per pull', **F['summary']['avoid']['heat']}


def snaps_chart(F, wiped):
    rows = [{'n': x['n'], 'chains': x['chains'], 'peak': x['bv_peak']} for x in F['pulls'] if x['snaps']]
    lo = min(c[0] for r in rows for c in r['chains'])
    hi = max(c[-1] for r in rows for c in r['chains'])
    return {'k': 'chart', 'kind': 'snaps', 'label': 'Grasping Fangs snaps in Stage Two', 'rows': rows, 'wiped': wiped,
            'x': [int(lo // 2 * 2) - 2, int(hi // 5 * 5) + 5]}


def rank_table(F, flag=3):
    rk = F['summary']['avoid']['rank']
    return {'k': 'table', 'head': ['Player', 'Role', 'Hits', 'Per 10 min alive', 'Per pull (mean ± sd)', 'Range', 'Damage'],
            'mono': [2, 3, 4, 5, 6], 'hl': list(range(flag)),
            'rows': [[r['p'], r['role'], str(r['tot']), f1(r['rate']), '%s ± %s' % (f1(r['mean']), f1(r['sd'])),
                      '%d–%d' % (r['lo'], r['hi']), '%sM' % f1(r['dmg'] / 1e6)] for r in rk]}


def mech_table(F):
    M = F['summary']['avoid']['mech']
    return {'k': 'table', 'head': ['Mechanic', 'Hits', 'Damage', 'Most hit'], 'mono': [1, 2],
            'rows': [[m + (' (soft)' if v['soft'] else ''), str(v['hits']), '%sM' % f1(v['dmg'] / 1e6),
                      ', '.join('%s %d' % (p, c) for p, c in v['who'] if c)] for m, v in M.items()]}


def whole_table(F):
    return {'k': 'table', 'head': ['Pull · window', 'Player', 'Casts at Heart', 'Casts at body'], 'mono': [0, 2, 3],
            'rows': [['#%d · window %d' % (n, w), '%s (%s)' % (p, rl), str(h), str(b)]
                     for n, w, p, rl, h, b in F['summary']['heart']['whole']]}


def share_of(F, who):
    r = next(s for s in F['summary']['heart']['share'] if s[0] == who)
    return round(100 * r[2] / sum(r[2:]))


def ninety(F):
    sh = F['summary']['heart']['share']
    return sum(1 for s in sh if s[2] / sum(s[2:]) >= 0.9), len(sh)


def win_cost(F):
    return [v for *_, v in F['summary']['heart']['win_cost']]


def rage(F, k):
    return [v for _, v in F['summary']['heart']['rage%d' % k]]


def circles(F):
    """Every Serpent's Bite circle: (pull, bite time, carrier, helper ticks, held?)."""
    out = []
    for x in F['pulls']:
        for b in x['bites']:
            failed = {p for _, p in b['calc']}
            for c, helpers in b['circles'].items():
                out.append((x['n'], b['t'], c, sum(helpers.values()), c not in failed, helpers))
    return out


def alive_at(x, t):
    """Players alive at time t in pull x, counting battle rezzes."""
    up = {p: True for p in x['roster']}
    ev = sorted([(d['t'], d['p'], False) for d in x['deaths']] + [(r[0], r[1], True) for r in x.get('rezzes', [])])
    for tt, p, alive in ev:
        if tt > t:
            break
        up[p] = alive
    return sum(up.values())


def hp_at(x, t):
    c = [v for tt, v in x['curve'] if tt <= t]
    return c[-1] if c else 100.0


def where(s):
    """A slice name from the analyser, in the encounter's own terms: the
    stage first (what Warcraft Logs calls the phase), then the slice."""
    if s.startswith('Heart'):
        k = int(s.split()[1])
        return {1: 'Stage 1 · Heart window', 2: 'Stage 2 · Heart window'}.get(k, 'Stage 3 · Heart window %d' % k)
    if s.startswith('S3 platform'):
        return 'Stage 3 · platform ' + s.split()[2].rstrip(',')
    if s == 'S3 final break':
        return 'Stage 3 · final break'
    return s


def attrition(x, until=560):
    """Stage Three deaths before the pull's own wipe: the bodies lost to the
    fight, not the ones lost to the final collapse."""
    ts = sorted(d['t'] for d in x['deaths'])
    wipe = ts[-5] if len(ts) >= 5 else float('inf')
    return sum(1 for t in ts if x['s3'] and x['s3'] < t < min(until, wipe - 2))
