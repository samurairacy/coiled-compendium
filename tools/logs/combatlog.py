#!/usr/bin/env python3
"""Combat-log primitives for the Log Analysis pipeline. Stdlib only.

    python tools/logs/combatlog.py <WoWCombatLog.txt>     # list encounters

The advanced log (COMBAT_LOG_VERSION 22, build 12.1.x) as this pipeline reads
it. Every quirk below cost a wrong number once, which is why each is written
down:

  - every event row is "<date> <time>  <csv>"; names are quoted and may hold
    commas, so rows go through csv rather than split(",")
  - the 19-field "advanced" unit block describes the DESTINATION on damage and
    heal events and the SOURCE on SPELL_CAST_SUCCESS; positions and current HP
    come from whichever unit it describes
  - a melee swing is written twice, as SWING_DAMAGE and SWING_DAMAGE_LANDED;
    count only SWING_DAMAGE or melee doubles
  - a hit fully eaten by an absorb is a *_MISSED with ABSORB, not a damage
    event; it is still a hit for "did you stand in it"
  - damage rows end with "ST" or "AOE": the game's own single-target flag,
    which is what separates a mis-targeted cast from a cleave proc
"""
import csv, sys

ADV = 19  # advanced unit-block length in this build

SPEC = {62: 'Arcane', 63: 'Fire', 64: 'Frost', 65: 'HolyPal', 66: 'ProtPal', 70: 'Ret', 71: 'Arms', 72: 'Fury', 73: 'ProtWar',
        102: 'Balance', 103: 'Feral', 104: 'Guardian', 105: 'RestoDru', 250: 'Blood', 251: 'FrostDK', 252: 'Unholy',
        253: 'BM', 254: 'MM', 255: 'Surv', 256: 'Disc', 257: 'HolyPri', 258: 'Shadow', 259: 'Assa', 260: 'Outlaw', 261: 'Sub',
        262: 'Ele', 263: 'Enh', 264: 'RestoSha', 265: 'Affli', 266: 'Demo', 267: 'Destro', 268: 'Brew', 269: 'WW', 270: 'MW',
        577: 'Havoc', 581: 'Veng', 1480: 'Devourer', 1467: 'Dev', 1468: 'Pres', 1473: 'Aug'}
TANK = {66, 73, 104, 250, 268, 581}
HEAL = {65, 105, 256, 257, 264, 270, 1468}


def role_of(spec):
    return 'tank' if spec in TANK else 'healer' if spec in HEAL else 'dps'


def ts(stamp):
    """Seconds since local midnight; '10/21/2026 21:12:40.90911'."""
    t = stamp.split(' ')[1]
    h, mi, s = t.split(':')
    return (int(h) * 60 + int(mi)) * 60 + float(s)


def is_player(guid):
    return guid.startswith('Player-')


def npc_id(guid):
    """Creature-0-x-x-x-NPCID-spawn -> NPCID, else None."""
    p = guid.split('-')
    if p[0] in ('Creature', 'Vehicle', 'Pet') and len(p) >= 7:
        return p[5]
    return None


def short(name):
    """'Hyperxd-Khaz'goroth-US' -> 'Hyperxd'. Realms never leave this module."""
    return name.split('-')[0]


def dmg(row):
    """(spellId, spellName, amount, absorbed, overkill) for a damage row, else None."""
    ev = row[0]
    if ev == 'SWING_DAMAGE':
        base, sid, sname = 9 + ADV, '1', 'Melee'
    elif ev.startswith('ENVIRONMENTAL') and ev.endswith('_DAMAGE'):
        base, sid, sname = 9 + ADV + 1, 'env', row[9 + ADV]
    elif ev.endswith('_DAMAGE') and (ev.startswith('SPELL') or ev.startswith('RANGE')):
        base, sid, sname = 12 + ADV, row[9], row[10]
    else:
        return None
    try:
        amt = int(row[base]); over = int(row[base + 2])
        absorbed = int(row[base + 6]) if row[base + 6] not in ('nil', '') else 0
    except (ValueError, IndexError):
        return None
    return sid, sname, amt, absorbed, over


def absorbed_miss(row):
    """(spellId, spellName, amountAbsorbed) for a fully absorbed hit, else None."""
    ev = row[0]
    try:
        if ev in ('SPELL_MISSED', 'SPELL_PERIODIC_MISSED', 'RANGE_MISSED') and row[12] == 'ABSORB':
            return row[9], row[10], int(row[14])
        if ev == 'SWING_MISSED' and row[9] == 'ABSORB':
            return '1', 'Melee', int(row[11])
    except (ValueError, IndexError):
        pass
    return None


def unit_pos(row):
    """(guid, x, y) of whichever unit the advanced block describes, else None."""
    ev = row[0]
    try:
        if ev in ('SPELL_DAMAGE', 'SPELL_PERIODIC_DAMAGE', 'SPELL_HEAL', 'SPELL_PERIODIC_HEAL', 'RANGE_DAMAGE'):
            return row[5], float(row[26]), float(row[27])
        if ev == 'SWING_DAMAGE_LANDED':
            return row[5], float(row[23]), float(row[24])
        if ev == 'SPELL_CAST_SUCCESS' and row[12] == row[1]:
            return row[1], float(row[26]), float(row[27])
    except (ValueError, IndexError):
        pass
    return None


def unit_hp(row):
    """(guid, current, max) from the advanced block of a damage row, else None."""
    try:
        if row[0] in ('SPELL_DAMAGE', 'SPELL_PERIODIC_DAMAGE', 'RANGE_DAMAGE'):
            return row[5], int(row[14]), int(row[15])
    except (ValueError, IndexError):
        pass
    return None


def pulls(path, encounter_id):
    """Yield one dict per pull of `encounter_id`:
    {n, date, start, end, dur, kill, size, rows:[(t, row)]} with t in seconds.

    Lines outside an encounter are skipped on a substring test before any csv
    work, so a 700 MB raw log reads in well under a minute."""
    cur, n = None, 0
    tag = 'ENCOUNTER_START,%s,' % encounter_id
    with open(path, encoding='utf-8', errors='replace') as f:
        for raw in f:
            if cur is None and tag not in raw:
                continue
            i = raw.find('  ')
            if i < 0:
                continue
            stamp, body = raw[:i], raw[i + 2:].rstrip('\n')
            row = next(csv.reader([body]))
            t = ts(stamp)
            if row[0] == 'ENCOUNTER_START' and row[1] == str(encounter_id):
                n += 1
                cur = {'n': n, 'date': stamp.split(' ')[0], 'start': t, 'size': int(row[4]), 'rows': []}
            if cur is None:
                continue
            cur['rows'].append((t, row))
            if row[0] == 'ENCOUNTER_END' and row[1] == str(encounter_id):
                cur.update(end=t, dur=t - cur['start'], kill=row[5] == '1')
                yield cur
                cur = None


def encounters(path):
    """[(date, clock, event, id, name, difficulty, size, result)] for every boundary."""
    out = []
    with open(path, encoding='utf-8', errors='replace') as f:
        for raw in f:
            if 'ENCOUNTER_' not in raw:
                continue
            i = raw.find('  ')
            row = next(csv.reader([raw[i + 2:].rstrip('\n')]))
            if row[0] in ('ENCOUNTER_START', 'ENCOUNTER_END'):
                d, c = raw[:i].split(' ')
                out.append((d, c[:8], row[0][10:], row[1], row[2], row[3], row[4], row[5] if row[0] == 'ENCOUNTER_END' else ''))
    return out


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__.split('\n\n')[1])
    for d, c, ev, eid, name, diff, size, res in encounters(sys.argv[1]):
        print('%s %s  %-5s %s %-28s diff %s size %s%s' % (d, c, ev, eid, name, diff, size,
              ('  ' + ('KILL' if res == '1' else 'wipe')) if ev == 'END' else ''))
