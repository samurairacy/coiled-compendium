"""Render one Log Analysis report (the block dict build.py makes) as a PDF.

Called by `build.py --pdf`; needs reportlab and matplotlib, which the site
itself never does. The PDF uses the site's dark ground and accents, and draws
the same four chart kinds the page draws, from the same block data, so a
reader with the PDF and a reader on the site are looking at one report.

Fonts are the closest Windows faces to the site's (Palatino for Eczar, Segoe UI
for IBM Plex Sans); anywhere else it falls back to the PDF base fonts.
"""
import os, re, tempfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.patches import Patch
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
                                Image, PageBreak, KeepTogether, NextPageTemplate, CondPageBreak)

WINF = 'C:/Windows/Fonts/'
FONTS = {'Disp': 'pala.ttf', 'Disp-B': 'palab.ttf', 'Disp-I': 'palai.ttf', 'Body': 'segoeui.ttf',
         'Body-B': 'segoeuib.ttf', 'Body-I': 'segoeuii.ttf', 'Body-SB': 'seguisb.ttf'}
if all(os.path.exists(WINF + f) for f in FONTS.values()):
    for k, f in FONTS.items():
        pdfmetrics.registerFont(TTFont(k, WINF + f))
    registerFontFamily('Body', normal='Body', bold='Body-B', italic='Body-I', boldItalic='Body-B')
    registerFontFamily('Disp', normal='Disp', bold='Disp-B', italic='Disp-I', boldItalic='Disp-B')
    for f in ('segoeui.ttf', 'segoeuib.ttf'):
        fm.fontManager.addfont(WINF + f)
    MPL_FONT = 'Segoe UI'
else:
    FB = {'Disp': 'Times-Roman', 'Disp-B': 'Times-Bold', 'Disp-I': 'Times-Italic', 'Body': 'Helvetica',
          'Body-B': 'Helvetica-Bold', 'Body-I': 'Helvetica-Oblique', 'Body-SB': 'Helvetica-Bold'}
    FONTS = FB
    MPL_FONT = 'DejaVu Sans'
F_ = lambda k: k if FONTS.get(k, '').endswith('.ttf') else FONTS[k]

# the site's tokens (css/app.css)
GROUND, RAISED, PANEL, SUNK = HexColor('#14120E'), HexColor('#1D1A14'), HexColor('#242018'), HexColor('#0E0C09')
INK, MUTED, FAINT, RULE = HexColor('#EDE5D4'), HexColor('#A99D84'), HexColor('#756B57'), HexColor('#3A342A')
VENOM, GOLD, URGENT = HexColor('#2CC966'), HexColor('#C89434'), HexColor('#F0503C')
C = dict(ink='#EDE5D4', muted='#A99D84', faint='#756B57', grid='#2E2920', surf='#1D1A14',
         heart='#23A853', body='#5A8CF2', adds='#B8862C', urgent='#F0503C', venom='#2CC966', line='#6B6253')

st = {
    'h1': ParagraphStyle('h1', fontName=F_('Disp-B'), fontSize=21, leading=25, textColor=INK, spaceBefore=4, spaceAfter=4),
    'kick': ParagraphStyle('kick', fontName=F_('Body-SB'), fontSize=7.5, leading=10, textColor=VENOM, spaceAfter=2),
    'h2': ParagraphStyle('h2', fontName=F_('Disp-B'), fontSize=13, leading=17, textColor=INK, spaceBefore=10, spaceAfter=4),
    'body': ParagraphStyle('body', fontName=F_('Body'), fontSize=9.2, leading=13.6, textColor=INK, spaceAfter=6),
    'lede': ParagraphStyle('lede', fontName=F_('Disp'), fontSize=11.5, leading=16, textColor=INK, spaceAfter=8),
    'small': ParagraphStyle('small', fontName=F_('Body'), fontSize=7.8, leading=10.6, textColor=MUTED, spaceAfter=4),
    'cap': ParagraphStyle('cap', fontName=F_('Body-I'), fontSize=7.8, leading=10.6, textColor=MUTED, spaceBefore=2, spaceAfter=10),
    'cell': ParagraphStyle('cell', fontName=F_('Body'), fontSize=7.9, leading=10.4, textColor=INK),
    'th': ParagraphStyle('th', fontName=F_('Body-SB'), fontSize=6.8, leading=9, textColor=MUTED),
    'bullet': ParagraphStyle('bullet', fontName=F_('Body'), fontSize=9.2, leading=13.4, textColor=INK, leftIndent=12,
                             bulletIndent=0, spaceAfter=4, bulletColor=VENOM, bulletFontName=F_('Body-B')),
}
W = 6.9 * inch


def md(s):
    """The report's only markup, **bold** and *italic*, after escaping."""
    s = str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    return re.sub(r'(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)', r'\1<i>\2</i>', s)


def P(t, s='body'):
    return Paragraph(md(t), st[s])


# ── charts (matplotlib), one per chart kind ──────────────────────────────
def _mpl():
    plt.rcParams.update({'font.family': MPL_FONT, 'font.size': 9, 'figure.facecolor': C['surf'], 'axes.facecolor': C['surf'],
                         'savefig.facecolor': C['surf'], 'axes.edgecolor': '#3A342A', 'axes.labelcolor': C['muted'],
                         'xtick.color': C['muted'], 'ytick.color': C['muted'], 'text.color': C['ink'],
                         'axes.spines.top': False, 'axes.spines.right': False})


def ch_hp(b, ax):
    for a, z, lab in b['stages']:
        if lab.startswith('R') or lab.startswith('H'):
            ax.axvspan(a, z, color=C['venom'], alpha=0.13, lw=0)
        ax.text((a + min(z, 640)) / 2, 101.5, lab, ha='center', va='bottom', fontsize=7.5,
                color=C['venom'] if re.match(r'^(R|H)\d', lab) else C['faint'])
    xmax = max(k['dur'] for k in b['curves']) + 30
    for k in sorted(b['curves'], key=lambda k: k['n'] == b['best']):
        xs = [t for t, _ in k['pts']]; ys = [v for _, v in k['pts']]
        best = k['n'] == b['best']
        ax.plot(xs, ys, color=C['venom'] if best else C['line'], lw=2 if best else 1.1, zorder=3 if best else 2)
    # end labels pushed apart only among lines that end near each other
    ends = sorted([[k['pts'][-1][0], k['pts'][-1][1], k['n']] for k in b['curves'] if k['dur'] > 360], key=lambda e: e[1])
    span = (100 - min(v for k in b['curves'] for _, v in k['pts'])) / 21
    for i, e in enumerate(ends):
        for o in ends[:i]:
            if abs(o[0] - e[0]) < 25 and e[1] - o[1] < span:
                e[1] = o[1] + span
    for x, y, n in ends:
        ax.text(x + 5, y, '#%d' % n, fontsize=7.5, va='center', color=C['ink'] if n == b['best'] else C['muted'])
    ax.set_xlim(0, max(560, xmax)); ax.set_ylim(min(30, min(v for k in b['curves'] for _, v in k['pts']) - 3), 100)
    ax.set_xlabel('seconds into pull'); ax.set_ylabel('boss health %')
    ax.yaxis.grid(True, color=C['grid'], lw=0.6); ax.set_axisbelow(True)


def ch_share(b, ax):
    rows = b['rows']
    for i, (p, role, h, bo, a) in enumerate(rows):
        t = h + bo + a; left = 0
        for v, c in ((h, C['heart']), (bo, C['body']), (a, C['adds'])):
            if v:
                ax.barh(i, 100 * v / t, left=left, color=c, height=0.66, edgecolor=C['surf'], linewidth=1.2)
            left += 100 * v / t
        ax.text(101.5, i, '%d%% Heart' % round(100 * h / t), va='center', fontsize=7.5, color=C['ink'])
    ax.set_yticks(range(len(rows)), ['%s  (%s)' % (r[0], r[1]) for r in rows])
    ax.invert_yaxis(); ax.set_xlim(0, 118); ax.set_xticks([0, 25, 50, 75, 100], ['0', '25', '50', '75', '100%'])
    ax.tick_params(axis='y', length=0)
    ax.legend(handles=[Patch(color=C['heart'], label=b['keys'][0][1]), Patch(color=C['body'], label=b['keys'][1][1]),
                       Patch(color=C['adds'], label=b['keys'][2][1])],
              loc='lower left', bbox_to_anchor=(0, 1.0), ncol=3, frameon=False, fontsize=8, handlelength=1.2)


def ch_heat(b, ax):
    M = [[(v if v is not None else 0) for v in r[1]] for r in b['rows']]
    vmax = max(max(r) for r in M) or 1
    cmap = LinearSegmentedColormap.from_list('gold', ['#241F17', '#5C4519', '#9A7224', '#D9A846', '#F6DC9A'])
    ax.imshow(M, cmap=cmap, vmin=0, vmax=vmax, aspect='auto')
    for i, r in enumerate(b['rows']):
        for j, v in enumerate(r[1]):
            txt = '–' if v is None else (str(v) if v else '·')
            ax.text(j, i, txt, ha='center', va='center', fontsize=7.5,
                    color='#14120E' if v and v > vmax * 0.55 else (C['ink'] if v else C['faint']))
    ax.set_xticks(range(len(b['cols'])), ['%s\n%s' % tuple(c) for c in b['cols']], fontsize=7.5)
    ax.set_yticks(range(len(b['rows'])), [r[0] for r in b['rows']])
    ax.tick_params(length=0)
    for s in ax.spines.values():
        s.set_visible(False)
    ax.set_xticks([j - 0.5 for j in range(1, len(b['cols']))], minor=True)
    ax.set_yticks([i - 0.5 for i in range(1, len(b['rows']))], minor=True)
    ax.grid(which='minor', color=C['surf'], lw=1.6); ax.tick_params(which='minor', length=0)


def ch_snaps(b, ax):
    rows = b['rows']
    for i, x in enumerate(rows):
        y = len(rows) - 1 - i
        bad = x['n'] in b['wiped']
        for ch in x['chains']:
            if len(ch) > 1:
                ax.plot([ch[0], ch[-1]], [y, y], color=C['urgent'] if len(ch) >= 5 else C['muted'], lw=2.4, solid_capstyle='round', zorder=1)
            ax.scatter(ch, [y] * len(ch), s=26, color=C['ink'], edgecolor=C['surf'], linewidth=1.5, zorder=3)
        ax.text(b['x'][1] + 0.5, y, 'peak %d stack%s' % (x['peak'], '' if x['peak'] == 1 else 's'), va='center',
                fontsize=7.5, color=C['urgent'] if bad else C['muted'])
    ax.set_yticks(range(len(rows)), ['#%d' % x['n'] for x in reversed(rows)])
    ax.set_xlim(b['x'][0], b['x'][1] + 11); ax.tick_params(axis='y', length=0)
    ax.set_xlabel('seconds into pull')
    ax.xaxis.grid(True, color=C['grid'], lw=0.6); ax.set_axisbelow(True)


CHARTS = {'hp': (ch_hp, 3.1), 'share': (ch_share, None), 'heat': (ch_heat, None), 'snaps': (ch_snaps, None)}


def chart(b, tmp):
    _mpl()
    fn, h = CHARTS[b['kind']]
    if h is None:
        n = len(b.get('rows', []))
        h = {'share': 0.22 * n + 0.6, 'heat': 0.24 * n + 0.6, 'snaps': 0.34 * n + 0.6}[b['kind']]
    fig, ax = plt.subplots(figsize=(7.2, h))
    fn(b, ax)
    path = os.path.join(tmp, 'c%d.png' % id(b))
    fig.savefig(path, dpi=220, bbox_inches='tight', pad_inches=0.08)
    plt.close(fig)
    iw, ih = ImageReader(path).getSize()
    return Image(path, width=W, height=W * ih / iw)


# ── blocks ───────────────────────────────────────────────────────────────
def table(b):
    head, rows = b['head'], b['rows']
    # a column is as wide as its content wants, but never narrower than its
    # longest header word (upper-cased headers wrap letter by letter otherwise)
    body = [max(len(re.sub(r'\*', '', str(r[i]))) for r in rows) if rows else 0 for i in range(len(head))]
    word = [max((len(w) for w in str(h).split()), default=0) * 1.5 + 2 for h in head]
    lens = [min(max(b, wd, 7), 70) for b, wd in zip(body, word)]
    # short columns (numbers, names) get exactly what they need; columns of
    # prose share whatever is left, so a long sentence never squeezes a "66.7%"
    short = [l <= 26 for l in lens]
    fixed = [(l + 2) * 4.7 if s else 0 for l, s in zip(lens, short)]
    rest = max(W - sum(fixed), W * 0.3)
    long_total = sum(l for l, s in zip(lens, short) if not s) or 1
    widths = [f if s else rest * l / long_total for f, l, s in zip(fixed, lens, short)]
    if all(short):
        widths = [W * f / sum(fixed) for f in fixed]
    data = [[Paragraph(md(h).upper(), st['th']) for h in head]] + [[Paragraph(md(c), st['cell']) for c in r] for r in rows]
    t = Table(data, colWidths=widths, repeatRows=1)
    cmd = [('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
           ('TOPPADDING', (0, 0), (-1, -1), 3.2), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.2),
           ('LINEBELOW', (0, 0), (-1, -1), 0.4, RULE), ('BACKGROUND', (0, 0), (-1, -1), RAISED),
           ('LINEBELOW', (0, 0), (-1, 0), 0.9, VENOM), ('BACKGROUND', (0, 0), (-1, 0), PANEL)]
    for i in range(2, len(data), 2):
        cmd.append(('BACKGROUND', (0, i), (-1, i), PANEL))
    for r in b.get('hl', []):
        cmd.append(('LINEBEFORE', (0, r + 1), (0, r + 1), 2.2, URGENT))
    t.setStyle(TableStyle(cmd))
    return t


def tiles(items):
    cells = []
    for big, label, tone in items:
        color = VENOM if tone == 'acc' else GOLD if tone == 'gold' else INK
        cells.append(Table([[Paragraph(md(big), ParagraphStyle('tb', fontName=F_('Disp-B'), fontSize=20, leading=23, textColor=color))],
                            [Paragraph(md(label), st['small'])]], colWidths=[W / len(items) - 0.12 * inch]))
    t = Table([cells], colWidths=[W / len(items)] * len(items))
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), RAISED), ('LINEBEFORE', (1, 0), (-1, 0), 0.5, RULE),
                           ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 6)]))
    return t


def callout(b):
    rows = [[Paragraph(md(b['title']).upper(), ParagraphStyle('ct', parent=st['kick'], textColor=VENOM))]]
    if b.get('items'):
        rows.append([Paragraph(' '.join('<b>%d.</b> %s ' % (i + 1, md(x)) for i, x in enumerate(b['items'])), st['body'])])
    else:
        rows.append([Paragraph(md(b['t']), st['body'])])
    t = Table(rows, colWidths=[W])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), PANEL), ('LINEBEFORE', (0, 0), (0, -1), 2.5, VENOM),
                           ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                           ('TOPPADDING', (0, 0), (-1, 0), 7), ('BOTTOMPADDING', (0, -1), (-1, -1), 4)]))
    return KeepTogether([t, Spacer(1, 8)])


def block(b, tmp):
    k = b['k']
    if k in ('lede', 'cap'):
        return [P(b['t'], k)]
    if k == 'p':
        return [P(b['t'], 'small' if b.get('small') else 'body')]
    if k == 'h3':
        return [CondPageBreak(1.2 * inch), P(b['t'], 'h2')]
    if k == 'ul':
        if b.get('ordered'):
            return [Paragraph(md(x), st['bullet'], bulletText='%d.' % (i + 1)) for i, x in enumerate(b['items'])]
        return [Paragraph(md(x), st['bullet'], bulletText='\u2022') for x in b['items']]
    if k == 'tiles':
        return [tiles(b['items']), Spacer(1, 10)]
    if k == 'callout':
        return [callout(b)]
    if k == 'table':
        return [table(b), Spacer(1, 6)]
    if k == 'chart':
        return [chart(b, tmp)]
    return []


# ── document ─────────────────────────────────────────────────────────────
def build(L, out):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='cc-logpdf-')
    hdr = '\u00b7  %s  \u00b7  pull review, %s' % (L['title'], L['when'])

    def bg(c, doc):
        c.saveState()
        c.setFillColor(GROUND); c.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)
        c.setStrokeColor(RULE); c.setLineWidth(0.5)
        c.line(0.8 * inch, letter[1] - 0.55 * inch, letter[0] - 0.8 * inch, letter[1] - 0.55 * inch)
        c.setFont(F_('Body-SB'), 6.8); c.setFillColor(VENOM)
        c.drawString(0.8 * inch, letter[1] - 0.45 * inch, 'THE COILED COMPENDIUM')
        c.setFillColor(FAINT); c.setFont(F_('Body'), 6.8)
        c.drawString(0.8 * inch + 98, letter[1] - 0.45 * inch, hdr)
        c.drawRightString(letter[0] - 0.8 * inch, 0.45 * inch, str(doc.page))
        c.restoreState()

    def cover_bg(c, doc):
        c.saveState()
        c.setFillColor(SUNK); c.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)
        c.setFillColor(GROUND); c.rect(0, 0, letter[0], letter[1] - 2.8 * inch, fill=1, stroke=0)
        c.setStrokeColor(VENOM); c.setLineWidth(1.4)
        c.line(0.8 * inch, letter[1] - 2.8 * inch, 2.6 * inch, letter[1] - 2.8 * inch)
        cx, cy = letter[0] - 1.55 * inch, letter[1] - 1.55 * inch
        for i, r in enumerate((34, 26, 18, 10)):
            c.setStrokeAlpha(1 - i * 0.2)
            c.arc(cx - r, cy - r, cx + r, cy + r, startAng=40 + i * 50, extent=280)
        c.setStrokeAlpha(1)
        c.setFillColor(FAINT); c.setFont(F_('Body'), 6.8)
        c.drawRightString(letter[0] - 0.8 * inch, 0.45 * inch, 'samurairacy.github.io/coiled-compendium  \u00b7  #/logs/' + L['id'])
        c.restoreState()

    doc = BaseDocTemplate(out, pagesize=letter, leftMargin=0.8 * inch, rightMargin=0.8 * inch, topMargin=0.8 * inch,
                          bottomMargin=0.7 * inch, title='%s - pull review, %s' % (L['title'], L['when']),
                          author='The Coiled Compendium')
    fr = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='f', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate('cover', [fr], onPage=cover_bg), PageTemplate('body', [fr], onPage=bg)])
    E = [Spacer(1, 0.25 * inch), Paragraph(md(L['kicker']).upper(), st['kick']),
         Paragraph(md(L['title']), ParagraphStyle('t', fontName=F_('Disp-B'), fontSize=40, leading=44, textColor=INK)),
         Paragraph('Pull review: ' + md(L['when']), ParagraphStyle('t2', fontName=F_('Disp-I'), fontSize=15, leading=20, textColor=MUTED)),
         Spacer(1, 0.72 * inch)]
    first, rest = L['sections'][0], L['sections'][1:]
    for b in first['blocks']:
        if b['k'] != 'tiles':
            E += [P(first['h'], 'h2')] if b is first['blocks'][1] else []
        E += block(b, tmp)
    E += [NextPageTemplate('body'), PageBreak()]
    for i, s in enumerate(rest):
        if i:
            E.append(CondPageBreak(3.4 * inch))
        if s.get('kick'):
            E.append(P(s['kick'].upper(), 'kick'))
            E.append(P(s['h'], 'h1'))
        else:
            E.append(P(s['h'], 'h2'))
        for b in s['blocks']:
            E += block(b, tmp)
    doc.build(E)
