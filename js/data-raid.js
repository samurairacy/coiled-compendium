/* js/data-raid.js — the Raid module: The Venomous Abyss
   Load order: data-shared → data-mplus → data-raid → render → app.
   All five load with `defer`, which preserves this order. */

/* ═══ RAID · THE VENOMOUS ABYSS ═════════════════════════════════════════
   Eight bosses inside the Vaults of Atal'Utek, patch 12.1. Scope: Normal
   and Heroic. Mythic and LFR are deliberately out of scope for now — the
   difficulty model already accommodates them (df takes a third value), so
   adding either later is data, not structure.

   Ability shape mirrors DUNGEONS: {n,t,c,r,sev,e,h,s} plus:
     df : difficulties the ability exists on — ["n","h"] or ["h"].
          Absent means both. Never write ["n","h"] explicitly; absence is
          the both-difficulties spelling and the checker enforces it.
     hh : Heroic-only addendum to the tactic note, rendered only on Heroic.
   Bosses may carry phases:[{n,trigger,a:[...]}] instead of a flat a:[].
   ═════════════════════════════════════════════════════════════════════ */
const RAID={id:"venomous-abyss",name:"The Venomous Abyss",short:"Abyss",
 patch:"12.1",loc:"The Coiled Isle — inside the Vaults of Atal'Utek",
 difficulties:["n","h"],
 opens:"2026-08-18",
 bosses:[]};
const RB=Object.fromEntries(RAID.bosses.map(b=>[b.id,b]));
