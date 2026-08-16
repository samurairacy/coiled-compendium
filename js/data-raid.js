/* js/data-raid.js — the Raid module: The Venomous Abyss
   Load order: data-shared → data-mplus → data-raid → render → app.
   All five load with `defer`, which preserves this order. */

/* ═══ RAID · THE VENOMOUS ABYSS ═════════════════════════════════════════════
   Eight bosses inside the Vaults of Atal'Utek, patch 12.1. Scope: Normal
   and Heroic. Mythic and LFR are deliberately out of scope for now — the
   difficulty model already accommodates them (df takes a third value), so
   adding either later is data, not structure.

   Ability shape mirrors DUNGEONS: {n,t,c,r,sev,e,h,s} plus:
     df : difficulties the ability exists on — ["h"] for Heroic-only.
          Absent means both. Never write ["n","h"] explicitly; absence is
          the both-difficulties spelling and the checker enforces it.
     hh : Heroic-only addendum to the tactic note, rendered only on Heroic.
   Bosses may carry phases:[{n,trigger,a:[...]}] instead of a flat a:[].
   Boss order and names confirmed against Wowhead's raid overview,
   2026-08-17. Do not reorder without a source.
   ═══════════════════════════════════════════════════════════════════════ */
const RAID={id:"venomous-abyss",name:"The Venomous Abyss",short:"Abyss",
 patch:"12.1",loc:"The Coiled Isle — inside the Vaults of Atal'Utek",
 difficulties:["n","h"],
 opens:"2026-08-18",
 minIlvl:273,
 schedule:[
  ["Week of 18 Aug","Normal, Heroic and Mythic open; Raid Finder Wing 1"],
  ["Week of 25 Aug","Story Mode; Raid Finder Wing 2"],
  ["Week of 1 Sep","Raid Finder Wing 3"],
  ["Week of 8 Sep","Raid Finder Wing 4"]],
 bosses:[
  {id:"nekzali",o:1,n:"Nek'zali the Soulcoiler",short:"Nek'zali",a:[]},
  {id:"entombed-sentinels",o:2,n:"Entombed Sentinels",short:"Sentinels",a:[]},
  {id:"vashnik",o:3,n:"Vashnik the Malignant",short:"Vashnik",a:[]},
  {id:"lost-explorers",o:4,n:"The Lost Explorers",short:"Explorers",a:[]},
  {id:"sszorak",o:5,n:"Sszorak",short:"Sszorak",a:[]},
  {id:"twin-fangs",o:6,n:"The Twin Fangs",short:"Twin Fangs",a:[]},
  {id:"coiled-altar",o:7,n:"The Coiled Altar",short:"Altar",a:[]},
  {id:"ulatek",o:8,n:"Ula'tek",short:"Ula'tek",a:[]}]};
const RB=Object.fromEntries(RAID.bosses.map(b=>[b.id,b]));
