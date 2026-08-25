/* js/render.js — helpers and every page function
   Load order: data-shared → data-mplus → data-raid → render → app.
   All five load with `defer`, which preserves this order. */

/* ═══════════════════════════════════════════════════════════════════════
   ENGINE — domain-agnostic. Router · renderers · facets · search.
   Content never appears in markup above; it is all rendered from DATA.
   ═══════════════════════════════════════════════════════════════════════ */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ic=(id,sz)=>`<svg width="${sz||12}" height="${sz||12}" aria-hidden="true"><use href="#${id}"/></svg>`;
/* Decorative only — the ability name always sits next to it, so alt is empty.
   No icon still emits an empty box of the same size: 42 of the 329 names have
   no Wowhead entry (none of them is a spell — see the ICONS block), and without the spacer their titles would hang a glyph's
   width left of every other row in the column. */
/* Never an empty spacer, and never one placeholder for two different facts.
   A row in NOSPELL is iconless by design — a phase marker, an NPC standing as
   an ability row — and wears WoW's own no-art cog. Anything else missing from
   ICONS wears the red question mark, which means "this should have an icon and
   we have not found it": an unresolved gap, or a rename that forgot to move
   its ICONS entry. Same glyph for both would hide the distinction the audit
   exists to record. */
const NOSPELLSET=new Set(NOSPELL);
const abilIcon=n=>{
  const s=ICONS[n]||(NOSPELLSET.has(n)?"trade_engineering":"inv_misc_questionmark");
  const t=ICONS[n]?"":NOSPELLSET.has(n)
    ?' title="Not a spell — a phase, a structure note, or an NPC that owns these tactics."'
    :' title="No icon found for this name yet."';
  return `<img class="aicon" src="assets/icons/${s}.jpg" alt=""${t} loading="lazy" decoding="async" width="44" height="44">`;};

/* ── source marks ── every factual claim carries one ── */
function srcMark(ids){
  if(!ids||!ids.length) return `<span class="src t4" title="No source recorded. Treat as unverified.">?</span>`;
  return ids.map(id=>{const s=SOURCES[id];if(!s)return"";
    const lbl=s.l||s.a.toUpperCase();
    /* The tier still sets the colour via t${s.t}, but is not spelled out: the
       Sources page no longer explains what a tier is, so a bare "Tier 3" in a
       tooltip would be a number the reader has no way to interpret. */
    return `<span class="src t${s.t}" title="${esc(s.a)} — ${esc(s.b)} (${s.d})">${lbl}</span>`;
  }).join("");
}
/* Kept, and kept harmless. Every alt in the data was settled against Wowhead
   and removed, so this renders nothing today — but the concordance is the
   place wrong names live now, and a future import that carries an alt should
   still display rather than silently drop it. */
const alt=o=>o&&o.alt?`<span class="alt" title="A name some sources use for this. The heading is the one Wowhead lists.">also: ${esc(o.alt)}</span>`:"";
/* The id rides along as a class so a single vocabulary entry can be themed
   without touching any of the four places chips are rendered. */
const chip=(id,map,cls)=>{const t=(map||TAGS)[id];if(!t)return"";
  return `<span class="chip ${cls||""} x-${id}">${ic(t.i)}${esc(t.l)}</span>`;};
const mythBadge=a=>(a.t||[]).includes("myth")
  ? `<span class="mythonly" title="Only appears on Mythic difficulty — including every Mythic+ key.">${ic("i-warn",10)}Mythic only</span>` : "";
/* ── lethality ── the loudest thing on a row, and the rarest ──────────────
   One-shot and Wipe live in t: so the mechanics index filters them for free,
   but they never render as ordinary chips: a fact about whether the mechanic
   KILLS does not belong in the same visual family as "Frontal". They are
   lifted out of the chip row and worn beside the name, the same treatment
   Mythic-only already gets, because that is where a skimmer's eye lands.
   lh:1 means the lethality only applies on Heroic — the ability exists on
   both difficulties, but only the Heroic version kills outright, and saying
   so is cheaper than a second tag nobody would maintain. */
const LETHALKEYS=Object.keys(LETHAL);
const isLethal=a=>(a.t||[]).some(t=>LETHAL[t]);
const lethalBadge=a=>(a.t||[]).filter(t=>LETHAL[t]).map(t=>
  `<span class="lethal l-${t}" title="${esc(LETHAL[t][1])}${a.lh?" On Heroic only — Normal is survivable.":""}">${ic("i-skull",11)}${LETHAL[t][0]}${a.lh?" · Heroic":""}</span>`).join("");
/* Severity says the WORD, never the number. Level 1 renders nothing: a chip
   on every single row is noise, and the legend states that unmarked means
   chip damage, which is the fact the old bare "3" left a reader to guess. */
const sevChip=a=>{const s=SEVS[a.sev]; return a.sev>=2&&s
  ? `<span class="sevc s${a.sev}" title="Severity — ${esc(s[1])}">${esc(s[0])}</span>`:"";};
/* Printed once above any list of abilities. Krug: don't hide the key to a
   scale the reader is being asked to act on. */
const sevLegend=()=>`<p class="sevkey">${ic("i-info",13)}
  <b>Severity</b> is what one failure costs:
  <span class="sevc s3">Run-ender</span> one mistake routinely ends the pull ·
  <span class="sevc s2">Punishing</span> kills a careless player or spends a cooldown ·
  unmarked is chip damage. Separately,
  <span class="lethal l-oneshot">${ic("i-skull",11)}One-shot</span> and
  <span class="lethal l-wipe">${ic("i-skull",11)}Wipe</span> mark mechanics that kill outright —
  those are facts about the mechanic, not opinions about how hard it is.</p>`;
/* Heroic used to be one sentence at the end of a paragraph, or a bolded run-in
   nobody's eye stopped at. It gets a flag and a rule of its own now: the raid
   is two games and the reader has to be able to see which one a line is about
   without reading it. */
const heroLine=(txt,cls)=>txt
  ?`<p class="heroicline ${cls||""}"><span class="hflag">${ic("i-warn",10)}Heroic</span>${esc(txt)}</p>`:"";
/* Blizzard's own dungeon shorthand, read off the in-game Best Runs panel.
   Worth carrying because it is what people type in group finder and what a
   pug leader shouts — the site should answer to the name a player
   uses, not only the one the loading screen prints. */
const dcode=d=>d.code?`<span class="dcode" title="In-game code for ${esc(d.name)} — what group finder calls it">${esc(d.code)}</span>`:"";
const roleChip=r=>({tank:`<span class="chip c-tank">${ic("i-tank")}Tank</span>`,
  healer:`<span class="chip c-heal">${ic("i-heal")}Healer</span>`,
  dps:`<span class="chip c-dps">${ic("i-dps")}DPS</span>`,
  mdps:`<span class="chip c-dps">${ic("i-dagger")}Melee</span>`,
  rdps:`<span class="chip c-dps">${ic("i-dps")}Ranged</span>`}[r]||"");

/* ── ability row ── fact and opinion render differently ── */
/* ── the role lens ── "I tank; show me my night." Persists like the
   difficulty choice and rides the URL as ?r=. Four lenses over a three-role
   data vocabulary: Melee and Ranged each include the generic dps mechanics,
   plus rows refined to mdps/rdps where a source names the role. An ability
   with no r: at all concerns everyone and always renders. Hiding is never
   silent — callers count what the lens removed and say so. */
let ROLEF=(function(){try{return localStorage.getItem("cc-role")||null;}catch(e){return null;}})();
const ROLES=[["tank","Tank","i-tank"],["healer","Healer","i-heal"],["mdps","Melee","i-dagger"],["rdps","Ranged","i-dps"]];
const roleMatch=(a,rf)=>{
  if(!rf||!a.r||!a.r.length) return true;
  const want=rf==="mdps"?["mdps","dps"]:rf==="rdps"?["rdps","dps"]:[rf];
  return a.r.some(r=>want.includes(r));
};
const roleBar=()=>`<div class="dtoggle rlens" role="group" aria-label="Role lens">
  <button class="dseg" data-role="" aria-pressed="${!ROLEF}">Everyone</button>
  ${ROLES.map(([k,l,i])=>`<button class="dseg" data-role="${k}" aria-pressed="${ROLEF===k}">${ic(i,11)}${l}</button>`).join("")}
  </div>`;
const roleNote=()=>ROLEF?`<p class="note">${ic("i-info",13)} Viewing as
  <b>${({tank:"Tank",healer:"Healer",mdps:"Melee DPS",rdps:"Ranged DPS"})[ROLEF]}</b> — abilities that never
  concern the role are hidden, and mobs with nothing left to say don't render.
  <button class="linklike" data-role="">Show everyone's view</button>.</p>`:"";

/* Raid abilities carry a difficulty dimension the dungeons never had:
   df:["h"] marks Heroic-only, hh: is a Heroic addendum to the tactic. The
   third argument is the viewer's difficulty — undefined on every Mythic+
   call site, which changes nothing there. On "n", Heroic-only rows are the
   CALLER's job to collapse into a visible count (never silently hide); this
   function just renders what it is given. */
const diffBadge=a=>a.df&&a.df.length===1&&a.df[0]==="h"
  ? `<span class="mythonly hb" title="Only cast on Heroic difficulty.">${ic("i-warn",10)}Heroic only</span>` : "";
function abilityRow(a,roleFilter,diff){
  if(!roleMatch(a,roleFilter)) return "";
  const em=t=>t==="noarmor"?"c-noarmor":"";
  /* Mythic-only is lifted out of the chip row and worn as a badge. In a
     Mythic+ guide it is not a counter or a shape — it is a note about where
     you will ever meet the thing, which belongs beside the name. It stays in
     TAGS so the mechanics index can still filter on it. */
  const tags=(a.t||[]).filter(t=>t!=="myth"&&!LETHAL[t]).map(t=>chip(t,TAGS,em(t))).join("");
  const ctrs=(a.c||[]).map(c=>chip(c,CTRS,"c-counter")).join("");
  const roles=(a.r||[]).map(roleChip).join("");
  return `<div class="abil ${a.sev===3?"sev3":a.sev===2?"sev2":""}${isLethal(a)?" lethalrow":""}">
    <div><div class="an">${abilIcon(a.n)}${esc(a.n)}${lethalBadge(a)}${mythBadge(a)}${diffBadge(a)}${alt(a)}</div>
      <div class="tags">${sevChip(a)}${tags}${roles}</div></div>
    <div><p class="effect">${esc(a.e)}${srcMark(a.s)}</p>
      ${ctrs?`<div class="tags">${ctrs}</div>`:""}
      ${a.h?`<p class="read play">${esc(a.h)}</p>`:""}
      ${a.hh&&diff==="h"?heroLine(a.hh,"inrow"):""}</div></div>`;
}
/* Every trash block carries a gravity tier taken straight from the mob's own
   k, so nothing is styled by hand: mini-bosses read loudest, lieutenants sit a
   step below, ordinary trash and casters stay quiet. sub/shape/brief are
   optional — a mini-boss promoted out of encounters keeps its summary, an
   ordinary one simply renders without. */
const MOBICON={mini:"i-boss",lt:"i-shield",caster:"i-channel"};
function mobBlock(m,roleFilter){
  const rows=(m.a||[]).map(a=>abilityRow(a,roleFilter)).join("");
  if(!rows.trim()) return "";
  const k=m.k||"trash", gi=MOBICON[k];
  /* Threat is DERIVED from the worst ability the mob actually has, so it can
     never drift out of sync with the rows beneath it. th: overrides only where
     volume makes a mob dangerous without any single scary cast. */
  const th=(m.a||[]).some(isLethal)?3:(m.th||Math.max(1,...(m.a||[]).map(a=>a.sev||1)));
  const TH=["","Minor","Dangerous","Deadly"];
  return `<div class="card mob k-${k} th${th}">
    <div class="mobtop"><h3>${esc(m.n)}</h3>
      <span class="kindtag k-${k}">${gi?ic(gi,11):""}${esc(KINDS[k]||k)}</span>
      <span class="threat t${th}" title="How much this mob can cost you, taken from its worst ability.">${esc(TH[th])}</span>
      ${m.alt?`<span class="alt">also: ${esc(m.alt)}</span>`:""}</div>
    ${m.shape?`<div class="bshape lv${m.lv}"><span>${esc(m.shape)}</span><em>${["","Straightforward","Moderate","Demanding"][m.lv]}</em></div>`:""}
    ${m.sub?`<p class="mobsub">${esc(m.sub)}</p>`:""}
    ${briefBlock(m.brief)}
    ${typeof m.play==="object"?playBlock(m.play,roleFilter)
      :m.play?`<p class="mobplay"><b>Play</b> ${esc(m.play)}</p>`:""}
    ${rows}</div>`;
}

/* ── shared bits ── */
const covBox=d=>`<div class="cov ok">${ic("i-info",16)}<div><b>Source coverage.</b>
  <b style="color:var(--tier1)">Bosses: Blizzard-checked.</b> Every encounter on this page is verified against Blizzard's own
  Encounter Journal, which outranks any guide on names, numbers and mechanics.
  <b style="color:${d.cov2?"var(--tier2)":"var(--signal-warn)"}">Trash and routing: ${d.cov2?"two sources":"single source"}.</b>
  ${esc(d.cov)}
  Everything here still predates the live season; no post-launch data exists yet, for anyone.
  ${d.encounters.some(e=>e.o&&!e.img)?`<br><b style="color:var(--signal-warn)">No boss imagery for this dungeon.</b> Every other dungeon has a portrait for each encounter.`:""}</div></div>`;
const dispelStrip=dis=>{const names={poison:"Poison",magic:"Magic",curse:"Curse",disease:"Disease",enrage:"Enrage",bleed:"Bleed"};
  return Object.entries(dis).map(([k,v])=>`<span class="pill ${v>=3?"acc":""}" title="${v===0?"Not relevant here":v===1?"Minor":v===2?"Useful":"Matters a lot"}">${ic("i-dispel")}${names[k]} ${"●".repeat(v)||"—"}</span>`).join("");};
const DGMAP={"va-":"raid","rlp-":"ruby-life-pools","aof-":"altar-of-fangs","kr-":"kings-rest","vsa-":"voidscar-arena","bv-":"blinding-vale"};
const dgOf=id=>{for(const k in DGMAP) if(id.startsWith(k)) return DGMAP[k]; return null;};
function resolvedBlock(dg){
  const rs=RESOLVED.filter(x=>dgOf(x.id)===dg);
  if(!rs.length) return "";
  return `<div class="sec"><h2>Settled since the last edition</h2><span class="n">${rs.length}</span></div>`+
    rs.map(x=>`<div class="card" style="border-left:3px solid var(--tier1)"><h3>${esc(x.q)}</h3>
      <div class="meta" style="color:var(--tier1)">Answer: ${esc(x.won)} ${srcMark(x.by)}</div>
      <p>${esc(x.p)}</p></div>`).join("");
}
const LOUD=["interrupt","magic","poison","curse","disease","bleedcl","purge","soothe",
            "freedom","immune","topoff","drop","soak","cc","los","kite"];
function bossStats(d,e){
  const a=e.a||[];
  const cf={}; a.forEach(x=>(x.c||[]).forEach(c=>cf[c]=(cf[c]||0)+1));
  const loud=LOUD.filter(c=>cf[c]);
  const quiet=Object.keys(cf).filter(c=>!LOUD.includes(c)).sort((p,q)=>cf[q]-cf[p]);
  return {n:a.length,
    sev3:a.filter(x=>x.sev===3).length,
    kills:a.filter(isLethal).map(x=>x.n),
    myth:a.filter(x=>(x.t||[]).includes("myth")).length,
    roles:["tank","healer","dps"].filter(r=>a.some(x=>(x.r||[]).includes(r))),
    demands:[...loud,...quiet].slice(0,7),
    srcs:[...new Set(a.flatMap(x=>x.s||[]))],
    loot:d.loot?d.loot.i.filter(x=>x.b===e.n):null};
}
/* Boss imagery comes in two kinds and the caption must not lie about which:
   an in-game capture (key without the j- prefix, nameplate in frame, source
   "img") or a dungeon-journal model portrait (j- keys, owner-captured from
   the Adventure Guide, source wh_ej). Member fights carry an array of
   portraits — the Trinity, the Council, the two duos — rendered side by
   side inside the same media slot. */
const bossMedia=(imgKeys,fallbackName)=>{
  const ks=(Array.isArray(imgKeys)?imgKeys:[imgKeys]).filter(k=>k&&IMG[k]);
  if(!ks.length) return "";
  const journal=ks[0].startsWith("j-");
  const caption=journal
    ?`Dungeon-journal model${ks.length>1?"s":""} · click for full size${srcMark(["wh_ej"])}`
    :`Nameplate visible in frame${srcMark(["img"])}`;
  /* Journal plates carry their own parchment ground and arrive in every
     aspect, so they render as PLATES: no slab behind them, the image's own
     ratio sets the box, and a click opens the file at native size. The
     legacy capture treatment (fixed-height on the sunken ground) stays for
     photos, which are uniform and landscape. */
  return `<figure class="bossmedia${journal?" plate":""}${ks.length>1?" members":""}">
    <div class="bmrow">${ks.map(k=>{
      const img=`<img src="${IMG[k]}" alt="${esc(JNAMES[k]||fallbackName)}${journal?" — dungeon-journal model":" in game"}" loading="lazy" decoding="async" title="${esc(JNAMES[k]||"")}">`;
      return journal?`<a href="${IMG[k]}" target="_blank" rel="noopener">${img}</a>`:img;}).join("")}</div>
    <figcaption>${ks.length>1?ks.map(k=>esc(JNAMES[k]||"")).filter(Boolean).join(" · ")+" — ":""}${caption}</figcaption></figure>`;};
/* ── THE PLAY ───────────────────────────────────────────────────────────
   Mechanics tell you what happens; this tells you what you do about it. One
   statement per role, written so a tank can filter to Tank and read exactly
   one thing that covers most of the encounter. Keys are tank/healer/mdps/rdps
   with `dps` as shorthand for both DPS lenses; a missing role simply does not
   render, so partial coverage degrades quietly instead of showing a blank.
   The lens governs: Everyone shows all of them, a role shows only its own. */
/* The brief used to open the card, so it needed no header. Now that the play
   block sits above it, an unlabelled paragraph reads orphaned — and naming it
   makes the pairing legible: this is what happens, that is what you do. */
const briefBlock=(txt,cls,hero)=>txt
  ?`<div class="brieflabel">What happens</div><p class="${cls||"bossbrief"}">${esc(txt)}</p>`+heroLine(hero,"inbrief"):"";
/* ── the phase brief ── the missing rung on the ladder ─────────────────────
   A boss page went straight from "what the whole fight is" to a list of casts,
   so anyone wanting "what is this phase FOR" had to read six abilities and
   synthesise it themselves. That synthesis is the guide's job. OBJECTIVE is
   the label because that is the register: a phase has a thing you are trying
   to achieve and a thing that stops you, and the sentence should name both.
   Mythic+ has no boss phases, but its trash areas are the same rung — a
   header with a pile of mobs under it — so they carry the same field. */
const objBlock=(txt,hero)=>txt
  ?`<div class="objective"><span class="objlabel">Objective</span><p>${esc(txt)}</p>${heroLine(hero,"inobj")}</div>`:"";
const PLAYROLE={tank:["Tank","i-tank"],healer:["Healer","i-heal"],
  mdps:["Melee","i-dps"],rdps:["Ranged","i-dps"],dps:["DPS","i-dps"]};
function playBlock(p,roleFilter,ph){
  if(!p) return "";
  /* dps is shorthand: a melee or ranged lens falls back to it, and with no
     lens it prints once as DPS rather than twice. */
  const pick=k=>p[k]||((k==="mdps"||k==="rdps")?p.dps:null);
  /* The Heroic layer is a second object with the same keys, carried only where
     the difficulty actually changes that role's job. It renders inside the
     role's own row, so a tank reading their one paragraph sees the Heroic
     amendment attached to it rather than somewhere further down the page. */
  const pickH=k=>ph?(ph[k]||((k==="mdps"||k==="rdps")?ph.dps:null)):null;
  const keys=roleFilter?[roleFilter]:["tank","healer",...(p.mdps||p.rdps?["mdps","rdps"]:["dps"])];
  const rows=keys.map(k=>{const txt=pick(k); if(!txt) return "";
    const [label,icon]=PLAYROLE[k]||[k,"i-dps"];
    return `<div class="playrow r-${k}"><span class="playrole">${ic(icon,12)}${esc(label)}</span>
      <div><p>${esc(txt)}</p>${heroLine(pickH(k),"inplay")}</div></div>`;}).join("");
  if(!rows.trim()) return roleFilter
    ? `<div class="playbox none"><p class="note">No role-specific play recorded for this one yet.</p></div>`:"";
  /* Collapsed by default, but it must not read as decoration: the bar carries
     the accent, a chevron, a hover state and a preview of which roles are
     inside, so a skimmer can see there is something worth opening and that
     opening is the thing to do. Native <details> keeps it keyboard-reachable
     without script. */
  const peek=keys.filter(k=>pick(k)).map(k=>(PLAYROLE[k]||[k])[0]).join(" · ");
  /* Collapsed while browsing everything, OPEN the moment a role lens is on:
     choosing Tank is the user saying what they came for, and making them
     click again for it would be the friction this feature exists to remove. */
  return `<details class="playbox"${roleFilter?" open":""}>
    <summary class="playsum"><span class="playtw" aria-hidden="true"></span>
      <span class="playhead">How to play it</span>
      <span class="playpeek">${esc(peek)}</span></summary>
    <div class="playrows">${rows}</div></details>`;
}
function encounterCard(d,e,roleFilter){
  const s=bossStats(d,e), img=e.img&&bossMedia(e.img,e.n);
  const trinkets=(s.loot||[]).filter(x=>x.sl==="Trinket");
  const stat=(k,v,cls)=>`<div class="bstat ${cls||""}"><b>${k}</b><span>${v}</span></div>`;
  return `<article class="bosscard" id="boss-${e.o}">
    <header class="bosstop">
      <span class="bossid">${e.o}</span>
      <div class="bossname"><h3>${esc(e.n)}</h3>${e.alt?`<span class="alt">also: ${esc(e.alt)}</span>`:""}
        ${e.shape?`<div class="bshape lv${e.lv}"><span>${esc(e.shape)}</span><em>${["","Straightforward","Moderate","Demanding"][e.lv]}</em></div>`:""}
        <p class="bosssub">${esc(e.sub)}</p></div>
    </header>
    <div class="bossbody">
      ${img||`<figure class="bossmedia none"><div class="noimg">${ic("i-boss",26)}<span>No capture</span></div>
        <figcaption>Imagery missing for this encounter</figcaption></figure>`}
      <div class="bossright">
      ${playBlock(e.play,roleFilter)}
      ${briefBlock(e.brief)}
      <div class="bossstats">
        ${stat("Abilities",s.n)}
        ${stat("Run-enders",s.sev3||"—",s.sev3?"hot":"")}
        ${s.kills.length?stat("Kills outright",s.kills.map(esc).join(", "),"hot wide"):""}
        ${s.myth?stat("Mythic only",s.myth,"myth"):""}
        ${stat("Whose problem",s.roles.map(roleChip).join("")||"—","wide")}
        ${stat("What it demands",s.demands.map(c=>chip(c,CTRS,"c-counter")).join("")||"—","wide")}
        ${s.loot&&s.loot.length?stat("Drops",`${s.loot.length} items${trinkets.length?` · <b style="color:var(--d-accent)">${esc(trinkets[0].n)}</b>`:""}`,"wide"):""}
        ${stat("Sourced from",srcMark(s.srcs),"wide")}
      </div></div>
    </div>
    <div class="bossabils">${(e.a||[]).map(a=>abilityRow(a,roleFilter)).join("")}</div>
  </article>`;
}
/* ═══ LOOT ═══ Mythic+ pays out from one chest at the end of the run, so the
   boss an item hangs off is trivia. What decides whether you can use a drop is
   its slot and its armour or weapon type, which is how this is grouped. ═══ */
const WEAPONRY=new Set(["Dagger","Sword","Mace","Axe","Polearm","Staff","Warglaive",
  "Fist","Bow","Crossbow","Gun","Wand","Shield","Off-hand"]);
const ARMOURS=["Cloth","Leather","Mail","Plate"];
const SLOTORDER=["Head","Shoulder","Back","Chest","Wrist","Hands","Waist","Legs","Feet",
  "Neck","Ring","One-hand","Two-hand","Off-hand","Ranged","Trinket"];
const slotRank=x=>{const i=SLOTORDER.indexOf(x);return i<0?99:i;};

const itemIcon=x=>x.ic?`<img class="aicon" src="assets/icons/${x.ic}.jpg" alt="" loading="lazy" decoding="async" width="44" height="44">`:`<span class="aicon none"></span>`;
const primChip=p=>(p||[]).map(v=>`<span class="chip pstat p-${v.toLowerCase()}">${esc(v)}</span>`).join("");
/* Secondaries are spoken as "big mastery, little haste", never in points — and
   the points move with item level anyway, so only the lean is worth printing.
   Inside 55:45 there is no meaningful lean, so it is called even. */
/* ── the five loot chip families ───────────────────────────────────────────
   Each answers a different question, so each gets its own treatment rather
   than another hue in an already crowded palette:
     type      what it is        · square, tinted fill
     slot      where it goes     · pill, outline only
     primary   who can use it    · square, stat-coloured (unchanged)
     secondary what it leans     · paired, big solid + little dotted
     role      who it's for      · square, dashed = our inference (unchanged)
   Fill, shape, weight and border-style do the separating; the label always
   states the fact, so colour is never carrying meaning alone. */
/* Class and spec icons. Same contract as abilIcon: a missing key renders
   nothing rather than a broken image. */
const clsIcon=(cn,sz)=>CLASSICON[cn]
  ?`<img class="cicon" src="assets/icons/${CLASSICON[cn]}.jpg" alt="" loading="lazy" decoding="async" width="${sz||18}" height="${sz||18}">`:"";
const specIcon=key=>SPECICON[key]
  ?`<img class="cicon" src="assets/icons/${SPECICON[key]}.jpg" alt="" loading="lazy" decoding="async" width="16" height="16">`:"";
const slotChip=x=>x.sl?`<span class="chip slotc">${esc(x.sl)}</span>`:"";
const typeChip=x=>x.ty&&x.ty!==x.sl
  ?`<span class="chip tyc">${esc(x.ty)}${x.tc?` · ${esc(x.tc)}`:""}</span>`:"";
/* Secondaries keep the house idiom — "big Mastery little Haste" — but as a
   weighted pair, so the lean is visible before the words are read. Equal
   stats render as two equal chips, which says "even" without saying it. */
const secChip=x=>{
  if(!x||!x.length) return "";
  if(x.length===1) return `<span class="chip slean">${esc(x[0][0])}</span>`;
  const [a,b]=x, tot=a[1]+b[1];
  if(!tot||a[1]/tot<0.55)
    return `<span class="chip slean">${esc(a[0])}</span><span class="chip slean">${esc(b[0])}</span>`;
  return `<span class="chip slean hi"><i>big</i>${esc(a[0])}</span>`
        +`<span class="chip slean lo"><i>little</i>${esc(b[0])}</span>`;
};
/* One definition, because the badge and the Cantrips facet must agree. A
   trinket is not a cantrip: every one of the 27 has an effect, that is what a
   trinket is, and they already have their own slot in the filter above. */
const isCantrip=i=>i.sl!=="Trinket"&&!!(i.u||i.e);
/* Role is the one field on this page nobody published. It began as our reading
   of the stat line and the effect, shipped marked UNCONFIRMED; as of
   2026-08-17 all 41 trinkets carry rc:, meaning the eligibility was seen in
   game, so the marks are data and the page no longer disclaims them. That
   sweep found 13 of the 41 wrong, in three different directions — items that
   gained tank, one that LOST melee DPS (Tumor of the Swarm), and four that
   really were DPS-only — which is why no rule here infers a role any more.
   A row without rc: is still rendered dashed and still says so in its tooltip,
   so anything added later without a look stands out on its own.
   Note what "Melee DPS" means HERE: this axis is the gear pool, not where you
   stand. Every hunter takes Agility, so all three specs read as melee for loot
   — and Survival genuinely is melee anyway. The ability role lens (r:) asks
   the other question, positioning, where Beast Mastery and Marksmanship are
   ranged and Survival stays melee. Same words, different axes. */
const LROLE={tank:"Tank",healer:"Healer",rdps:"Ranged DPS",mdps:"Melee DPS"};
const roleChips=i=>(i.ro||[]).map(r=>i.rc
  ?`<span class="rochip r-${r} rc" title="Loot eligibility seen in game (${esc(SOURCES[i.rc]?SOURCES[i.rc].l:i.rc)}).">${esc(LROLE[r]||r)}</span>`
  :`<span class="rochip r-${r}" title="Unconfirmed — inferred from the primary stat and the effect, not from a published source.">${esc(LROLE[r]||r)}</span>`).join("");
const cantrip=x=>isCantrip(x)?`<span class="cantrip" title="Carries an effect, not just stats.">Cantrip</span>`:"";
const lootRow=x=>`<tr><td class="li">${itemIcon(x)}<b>${esc(x.n)}</b>${cantrip(x)}</td>
  <td class="mono">${esc(x.sl)}</td><td>${primChip(x.p)||`<span class="n">—</span>`}</td>
  <td>${x.x&&x.x.length?secChip(x.x):`<span class="n">—</span>`}</td></tr>
  ${x.sl!=="Trinket"&&(x.u||x.e)?`<tr class="fxrow"><td colspan="4">
    ${x.u?`<p class="fx use"><b>Use</b> ${esc(x.u)}</p>`:""}
    ${x.e?`<p class="fx equip"><b>Equip</b> ${esc(x.e)}</p>`:""}</td></tr>`:""}`;
const lootTable=d=>{
  const I=d.loot.i, n=I.length;
  const trink=I.filter(x=>x.sl==="Trinket");
  const weap=I.filter(x=>WEAPONRY.has(x.ty)).sort((a,b)=>a.ty.localeCompare(b.ty));
  const jewel=I.filter(x=>["Ring","Neck","Cloak"].includes(x.ty));
  const table=rows=>`<table><thead><tr><th>Item</th><th>Slot</th><th>Primary</th><th>Secondaries</th></tr></thead>
    <tbody>${rows.map(lootRow).join("")}</tbody></table>`;
  /* This page used to open with four paragraphs explaining how Mythic+ loot
     works and how trinket roles were inferred. Both were true and both were
     onboarding — noise on a page people open mid-run already knowing what a
     chest is. The chest rule now rides the section heading; the inference
     caveat lives where it applies, on the chips themselves (they read
     UNCONFIRMED and carry the full reasoning in their tooltip). The long
     version survives on the Loot index, which is where someone asking the
     question would actually be. */
  return `<div class="sec"><h2>The end-of-run chest</h2><span class="n">${n} items · two drop per run</span></div>

  ${trink.length?`<div class="sec"><h2>Trinkets</h2><span class="n">${trink.length}</span></div>
  <div class="trinkets">${trink.map(x=>`<div class="card trink">
    <div class="tihead">${itemIcon(x)}<h3>${esc(x.n)}</h3></div>
    <div class="tags tichips">${primChip(x.p)}${roleChips(x)}${x.x&&x.x.length?secChip(x.x):""}</div>
    ${x.u?`<p class="fx use"><b>Use</b> ${esc(x.u)}</p>`:""}
    ${x.e?`<p class="fx equip"><b>Equip</b> ${esc(x.e)}</p>`:""}</div>`).join("")}</div>`:""}

  ${ARMOURS.map(a=>{const l=I.filter(x=>x.ty===a).sort((p,q)=>slotRank(p.sl)-slotRank(q.sl));
    return l.length?`<div class="sec"><h2>${a}</h2><span class="n">${l.length}</span></div>${table(l)}`:"";}).join("")}

  ${jewel.length?`<div class="sec"><h2>Rings, necks and cloaks</h2><span class="n">${jewel.length}</span>
    </div><p class="note">No armour type, so every specialisation is eligible.</p>${table(jewel)}`:""}

  ${weap.length?`<div class="sec"><h2>Weapons and off-hands</h2><span class="n">${weap.length}</span></div>
    <table><thead><tr><th>Item</th><th>Type</th><th>Primary</th><th>Secondaries</th></tr></thead><tbody>
    ${weap.map(x=>`<tr><td class="li">${itemIcon(x)}<b>${esc(x.n)}</b>${cantrip(x)}</td><td class="mono">${esc(x.ty)}</td>
      <td>${primChip(x.p)||`<span class="n">—</span>`}</td><td>${x.x&&x.x.length?secChip(x.x):`<span class="n">—</span>`}</td></tr>
      ${x.u||x.e?`<tr class="fxrow"><td colspan="4">${x.u?`<p class="fx use"><b>Use</b> ${esc(x.u)}</p>`:""}${x.e?`<p class="fx equip"><b>Equip</b> ${esc(x.e)}</p>`:""}</td></tr>`:""}`).join("")}
    </tbody></table>`:""}`;
};
function callsBlock(d){
  if(!d.calls) return "";
  const col=(rows,label,icon,cls)=>rows.length?`<div><h4>${ic(icon,12)} ${label} <span style="color:var(--ink-faint)">${rows.length}</span></h4>
    ${rows.map(([ab,mob,where])=>`<div class="call ${cls}"><span class="ca">${esc(ab)}</span>
      <span class="cm">${esc(mob)}</span><span class="cw">${esc(where)}</span></div>`).join("")}</div>`
    :`<div><h4>${ic(icon,12)} ${label}</h4><p class="none">None recorded.</p></div>`;
  return `<div class="sec"><h2>Call sheet</h2><span class="n">Assign before you pull${srcMark(d.calls.s)}</span></div>
  <p class="note">T1–T4 is the trash before that boss; B1–B4 is the boss itself. Print this, or keep it on the second monitor.</p>
  <div class="calls">${col(d.calls.i,"Interrupt","i-kick","ci")}${col(d.calls.d,"Dispel","i-dispel","cd")}${col(d.calls.p,"Purge or soothe","i-shield","cp")}</div>`;
}
function locBlock(d){
  if(!d.loc) return "";
  return `<div class="sec"><h2>Getting there</h2><span class="n">Level ${d.loc.lvl} · Heroic, Mythic, Mythic+</span></div>
  <div class="split">
    <div class="card"><h3>Where</h3><p>${esc(d.loc.zone)}${srcMark(["wh_dg"])}</p>
      <p class="mono" style="font-size:.82rem;color:var(--ink-muted)">${esc(d.loc.way)}</p>
      ${d.loc.note?`<p class="read">${esc(d.loc.note)}</p>`:""}</div>
    <div class="card"><h3>Teleport</h3><p><b>${esc(d.loc.tp)}</b></p>
      <p style="font-size:.9rem;color:var(--ink-muted)">Earned by timing this dungeon at +10 or higher. Lives in your general spellbook.</p></div>
  </div>`;
}
function rewardBlock(d){
  if(!d.rewards||!d.rewards.length) return "";
  return `<div class="sec"><h2>Beyond gear</h2><span class="n">${d.rewards.length}</span></div>
  <table><thead><tr><th>Reward</th><th>Kind</th><th>From</th></tr></thead><tbody>
  ${d.rewards.map(([n,k,b])=>`<tr><td><b>${esc(n)}</b></td><td class="mono">${esc(k)}</td><td>${esc(b)}</td></tr>`).join("")}
  </tbody></table>`;
}
function disputeBlock(dg){
  const ds=DISPUTES.filter(x=>x.dg===dg); if(!ds.length) return "";
  return `<div class="sec"><h2>Contested</h2><span class="n">${ds.length} open</span></div>`+
    ds.map(x=>`<div class="card acc"><h3>${esc(x.q)}</h3><div class="meta">Both positions shown. Neither is settled.</div>
      <p><b>Position A.</b> ${esc(x.a.p)}${srcMark(x.a.s)}</p>
      <p><b>Position B.</b> ${esc(x.b.p)}${srcMark(x.b.s)}</p>
      <p class="read">${esc(x.r)}</p></div>`).join("");
}


/* ═══ PAGES ═══════════════════════════════════════════════════════════ */
/* The homepage is the module chooser. Two large cards carry the real choice;
   the indexes get a thin row beneath so "I just have a question" still has a
   door. The dungeon grid lives on the Mythic+ landing now — it stopped being
   the whole site the day the raid arrived. */
function pHome(){
  const now=new Date(), open=new Date(SEASON.opens+"T15:00:00Z");
  const days=Math.ceil((open-now)/864e5), wk=Math.floor((now-open)/6048e5)+1;
  const nAb=ALL.length, nB=RAID.bosses.length;
  return `<div class="hero">
    <div class="kicker">Patch 12.1 · The Curse of Ula'tek</div>
    <h1>Eight dungeons. Eight bosses. Every claim sourced.</h1>
    <p class="lede">A working reference for Midnight Season 2 — the Mythic+ pool and The Venomous Abyss. Built from
    creator testing, cross-checked against Blizzard's own notes, and honest about which is which — because the
    fastest way to be wrong about a new season is to read one confident guide.</p>
    <div class="status">${ic("i-clock",15)}<div>${now<open
      ? `<b>Season 2 opens in ${days} day${days>1?"s":""}.</b> ${esc(SEASON.opensLocal)}. The raid opens the same week. Everything here is pre-launch material until it isn't.`
      : `<b>Season 2 is live — week ${wk}.</b> Opened ${esc(SEASON.opensLocal)}. Anything still marked PTR predates launch and should be checked against the live game.`}</div></div>
  </div>

  <div class="sec"><h2>Choose your poison</h2><span class="n">Two modules</span></div>
  <div class="modgrid">
    <a class="modcard mc-mplus notch" href="#/dungeons">
      <div class="mk">Module 01 · five players, one timer</div>
      <h3>Mythic+</h3>
      <p>The Season 2 pool: ${DUNGEONS.length} dungeons with the three things that kill groups up front,
      then bosses, trash, loot and a pug route for each.</p>
      <div class="tile-foot"><span class="pill">${DUNGEONS.length} dungeons</span>
        <span class="pill">${nAb} abilities</span><span class="pill">${ic("i-clock")}timed</span></div></a>
    <a class="modcard mc-raid notch" href="#/raid">
      <div class="mk">Module 02 · the other half of the week</div>
      <h3>The Venomous Abyss</h3>
      <p>${nB} bosses inside the Vaults of Atal'Utek, ending at Ula'tek — the serpent the patch is named
      for. Covered on Normal and Heroic.</p>
      <div class="tile-foot"><span class="pill new" style="background:var(--r-accent);color:var(--r-ink)">Opens with the season</span>
        <span class="pill">${nB} bosses</span><span class="pill">Normal · Heroic</span></div></a>
  </div>

  <div class="sec"><h2>Or go straight to a question</h2><span class="n">The indexes span both</span></div>
  <div class="split">
    <a class="card acc" href="#/mechanics" style="text-decoration:none;display:block"><h3>I need one answer</h3>
      <p style="color:var(--ink-muted);font-size:.92rem;margin:.5rem 0 0">Every ability in the season, filterable by
      what stops it — and by where it comes from. "Everything a poison dispel solves" is one click.</p></a>
    <a class="card acc" href="#/loot" style="text-decoration:none;display:block"><h3>I need gear</h3>
      <p style="color:var(--ink-muted);font-size:.92rem;margin:.5rem 0 0">Every item, filterable by slot, armour,
      stats and who it's for.</p></a>
    <a class="card acc" href="#/sources" style="text-decoration:none;display:block"><h3>Why should I believe this?</h3>
      <p style="color:var(--ink-muted);font-size:.92rem;margin:.5rem 0 0">The source ledger, how the sources are weighed, and the
      ${DISPUTES.length} places the sources still disagree.</p></a>
  </div>`;
}
function tile(d){
  return `<a class="tile" href="#/d/${d.id}" data-dungeon="${d.id}">
    ${d.banner&&IMG[d.banner]?`<span class="tban"><img src="${IMG[d.banner]}" alt="" loading="lazy"></span>`:""}
    <div class="tile-top"><div><h3>${esc(d.name)}${dcode(d)}</h3><div class="sub">${esc(d.origin)} · ${d.bosses} bosses</div></div>
      <svg class="sig" aria-hidden="true"><use href="#${d.sigil}"/></svg></div>
    <p>${esc(d.blurb)}</p>
    <div class="tile-foot">${d.isNew?`<span class="pill new">New</span>`:""}
      <span class="pill">${ic("i-clock")}${esc(d.timer.v)}</span>
      <span class="pill">${ic("i-boss")}${countAb(d)} abilities</span></div></a>`;
}
const countAb=d=>[...d.areas.flatMap(a=>a.mobs),...d.encounters].reduce((n,m)=>n+(m.a||[]).length,0);

/* Inside a module, a second-level bar carries that module's own pages.
   Same .tabs component the dungeon detail already uses — one vocabulary. */
const modbar=(mod,cur)=>{
  const T=mod==="mplus"
    ?[["dungeons","Dungeons","#/dungeons"],["routes","Routes","#/routes"]]
    :[["raid","Bosses","#/raid"],["prep","Prep","#/raid/prep"]];
  return `<div class="tabs modtabs">${T.map(([k,l,h])=>
    `<a href="${h}" ${k===cur?'aria-current="page"':""}>${l}</a>`).join("")}</div>`;};

function pDungeons(){
  return `<div class="crumb"><a href="#/">Compendium</a> › <em>Mythic+</em></div>
  <h1>The Season 2 pool</h1>
  ${modbar("mplus","dungeons")}
  <p class="lede">Five Midnight dungeons, two returning from Battle for Azeroth and one from Dragonflight. The two
  BfA returns are the ones most groups have stale knowledge of — both were changed substantially.</p>
  <div class="sec"><h2>All eight</h2><span class="n">Sorted by origin</span></div>
  <div class="grid">${DUNGEONS.map(tile).join("")}</div>
  <div class="sec"><h2>Routing character</h2><span class="n">How much choice you get</span></div>
  <table><thead><tr><th>Dungeon</th><th>Routing</th><th>Bosses</th><th>Timer</th><th>Heaviest dispel</th></tr></thead><tbody>
  ${DUNGEONS.map(d=>{const top=Object.entries(d.dispels).sort((a,b)=>b[1]-a[1])[0];
    return `<tr><td><a href="#/d/${d.id}">${esc(d.name)}</a></td><td>${esc(ROUTING[d.routing])}</td>
    <td class="mono">${d.bosses}</td><td class="mono">${esc(d.timer.v)}${srcMark(d.timer.s)}</td>
    <td>${top[1]>0?esc(top[0][0].toUpperCase()+top[0].slice(1)):"—"}</td></tr>`;}).join("")}
  </tbody></table>
  <div class="sec"><h2>Timers</h2><span class="n">All eight, sourced</span></div>
  <p class="note">Previously the compendium's largest gap — six of eight were unknown. Now every dungeon has a figure
  from a written guide, and Altar of Fangs is confirmed twice over: Blizzard's own data and the written overview give
  29 minutes independently.${srcMark(["wh_dg","bz_game"])}</p>
  <div class="tchart">${[...DUNGEONS].sort((a,b)=>parseInt(a.timer.v)-parseInt(b.timer.v)).map(d=>{
    const m=parseInt(d.timer.v), pct=Math.round((m-26)/(35-26)*100);
    return `<a class="trow" href="#/d/${d.id}" data-dungeon="${d.id}"><span class="tname">${esc(d.short)}</span>
      <span class="ttrack"><i style="width:${pct}%"></i></span><span class="tval">${esc(d.timer.v)}</span></a>`;}).join("")}</div>
  <p class="note">${ic("i-info",13)} Worth noting against the community read: Voidscar Arena is widely described as
  having the most lenient timer, yet at 30 minutes only Ruby Life Pools is shorter. Leniency is timer measured against
  how much you must kill, not raw minutes — but the two claims sit oddly together and the first week will settle it.</p>`;
}

/* ── dungeon page ── five tabs, identical across all eight ── */
function pDungeon(id,tab){
  const d=D[id]; if(!d) return `<p>Unknown dungeon.</p>`;
  tab=tab||"overview";
  const T=[["overview","Overview",""],["bosses","Bosses",d.encounters.length],
           ["trash","Trash",d.areas.reduce((n,a)=>n+a.mobs.length,0)],
           ["route","Route",d.route.length],
           ["loot","Loot",d.loot?d.loot.i.length:0],
           ["sources","Sources",""]];
  const head=`<div class="crumb"><a href="#/">Compendium</a> › <a href="#/dungeons">Dungeons</a> › <em>${esc(d.name)}</em></div>
  <nav class="dswitch" id="dswitch" aria-label="Switch dungeon">${DUNGEONS.map(x=>
    `<a href="#/d/${x.id}/${tab}" data-dungeon="${x.id}" ${x.id===d.id?'aria-current="page"':""}
      title="${esc(x.name)}${x.code?" ("+esc(x.code)+")":""} · ${esc(x.timer.v)}"><svg aria-hidden="true"><use href="#${x.sigil}"/></svg>${esc(x.short)}</a>`).join("")}</nav>
  ${d.banner&&IMG[d.banner]?`<div class="hban"><img src="${IMG[d.banner]}" alt="Entrance to ${esc(d.name)}" decoding="async"></div>`:""}
  <h1>${esc(d.name)}${dcode(d)}</h1>
  <div class="tile-foot" style="border:none;padding:.8rem 0 0">
    ${d.isNew?`<span class="pill new">New this season</span>`:`<span class="pill">${esc(d.origin)} return</span>`}
    <span class="pill">${ic("i-clock")}${esc(d.timer.v)}</span>
    <span class="pill">${ic("i-boss")}${d.bosses} bosses</span>
    <span class="pill">${esc(ROUTING[d.routing].split(" — ")[0])} routing</span>
    <span class="pill warn">${ic("i-warn")}PTR data</span></div>
  <p class="lede">${esc(d.blurb)}</p>
  <div class="tabs stick">${T.map(([k,l,c])=>`<a href="#/d/${d.id}/${k}" ${k===tab?'aria-current="page"':""}>${l}${c?`<span class="c">${c}</span>`:""}</a>`).join("")}</div>`;

  let body="";
  if(tab==="overview"){
    body=covBox(d)+
    `<div class="sec"><h2>Three things that kill groups here</h2><span class="n">Read this if you read nothing else</span></div>
    ${d.killers.map(k=>`<div class="killer"><div class="kn">${esc(k.n)}<span>RUN-ENDER</span></div><p>${esc(k.w)}${srcMark(k.s)}</p></div>`).join("")}
    <div class="sec"><h2>What blocks progress</h2><span class="n">Gates</span></div>
    ${d.gates.map(g=>`<p class="note">${ic("i-gate",13)} ${esc(g.t)}${srcMark(g.s)}</p>`).join("")}
    ${d.map&&IMG[d.map]?`<div class="sec"><h2>Map</h2><span class="n">Every pack marked</span></div>
    <figure class="dmap"><a href="${IMG[d.map]}" target="_blank" rel="noopener">
      <img src="${IMG[d.map]}" alt="${esc(d.name)} — Mythic Dungeon Tools map with enemy positions" loading="lazy" decoding="async"></a>
      <figcaption>Mythic Dungeon Tools · boss and pack positions · click to open full size${srcMark(["img"])}</figcaption></figure>`:""}
    <div class="sec"><h2>Dispel demand</h2><span class="n">How much each matters here</span></div>
    <div class="tile-foot" style="border:none;padding:0">${dispelStrip(d.dispels)}</div>`
    +callsBlock(d)
    +(d.buffs.length?`<div class="sec"><h2>Interactables</h2><span class="n">${d.buffs.length}</span></div>
      ${d.buffs.map(b=>`<div class="card acc"><h3>${esc(b.n)}</h3><div class="meta">${esc(b.loc)}</div>
        <p>${esc(b.e)}${srcMark(b.s)}</p><p class="read">Usable by: ${esc(b.w)}</p></div>`).join("")}`
      :`<div class="sec"><h2>Interactables</h2><span class="n">None recorded</span></div>
        <p class="note">No party buff objects recorded in this dungeon.</p>`)
    +locBlock(d)+rewardBlock(d)+disputeBlock(d.id)+resolvedBlock(d.id)
    +(d.reads.length?`<div class="sec"><h2>Reads</h2><span class="n">Opinion, attributed</span></div>
      ${d.reads.map(r=>`<div class="card"><p>${esc(r.t)}</p><div class="meta">— ${esc(r.by)}, ${esc(r.d)}${srcMark(r.s)}</div></div>`).join("")}`:"");
  }
  else if(tab==="bosses"){
    body=`<div class="sec"><h2>Encounters</h2><span class="n">In order</span></div>`+
      roleBar()+roleNote()+sevLegend()+
      d.encounters.map(e=>encounterCard(d,e,ROLEF)).join("");
  }
  else if(tab==="trash"){
    body=`<div class="sec"><h2>Trash by area</h2><span class="n">In the order you meet it</span></div>`+
      roleBar()+roleNote()+sevLegend()+
      d.areas.map(ar=>{const blocks=ar.mobs.map(m=>mobBlock(m,ROLEF)).join("");
        return blocks.trim()?`<div class="area-h">${esc(ar.n)}</div>`+objBlock(ar.brief)+blocks:"";}).join("");
  }
  else if(tab==="route"){
    body=`<div class="sec"><h2>Pug route</h2><span class="n">${d.route.length} pulls</span></div>
    <p class="note">Deliberately conservative: no skips, minimised interrupts, minimised danger. Faster groups
    combine several of these. Numbers in accent are lust windows; red outlines are the pulls that wiped groups on the PTR.</p>
    ${d.route.map(p=>`<div class="pull ${p.lust?"lust":""} ${p.d===3?"d3":""}"><div class="num">${p.n}</div>
      <div><div class="pn">${esc(p.t)}</div><div class="tags" style="margin-top:.3rem">
        <span class="chip">${esc(p.m)}</span>${p.lust?`<span class="chip c-counter">${ic("i-enrage")}Lust</span>`:""}
        ${p.d===3?`<span class="chip" style="border-color:var(--signal-urgent);color:var(--signal-urgent)">${ic("i-warn")}High risk</span>`:""}</div>
      <p>${esc(p.p)}${srcMark(p.s)}</p></div></div>`).join("")}`;
  }
  else if(tab==="loot"){
    if(!d.loot){ body=`<div class="sec"><h2>Loot</h2><span class="n">Not recorded</span></div>
      <p class="note">${ic("i-warn",13)} ${esc(d.noLoot||"No loot data yet.")}</p>`; }
    else body=lootTable(d);
  }
  else{
    const used=new Set(); const walk=o=>{(o.s||[]).forEach(x=>used.add(x));};
    d.gates.forEach(walk); d.buffs.forEach(walk); d.killers.forEach(walk); d.reads.forEach(walk); d.route.forEach(walk);
    if(d.loot) walk(d.loot);
    if(d.calls) walk(d.calls); used.add("wh_dg");
    [...d.areas.flatMap(a=>a.mobs),...d.encounters].forEach(m=>(m.a||[]).forEach(walk));
    d.timer.s.forEach(x=>used.add(x));
    body=`<div class="sec"><h2>Everything on this page came from</h2><span class="n">${used.size} sources</span></div>
    <table><thead><tr><th>Source</th><th>Date</th><th>What it is</th></tr></thead><tbody>
    ${[...used].map(x=>{const s=SOURCES[x];return `<tr><td>${s.u?`<a href="${s.u}" target="_blank" rel="noopener">${esc(s.a)}</a>`:esc(s.a)}</td>
      <td class="mono">${s.d}</td><td>${esc(s.b)}</td></tr>`;}).join("")}
    </tbody></table>
    <p class="note">Sources are listed most-trusted first: Blizzard directly, then the written guides, then creator
    coverage. A page resting on one creator video is a starting point, not a settled fact — which is what the coverage
    badge on the overview tab is telling you.</p>
    <p class="note">Source material is paraphrased throughout. Links go to the originals; read them.</p>`;
  }
  return head+body;
}

/* ── the mechanics index — the reason to build this at all ── */
/* ═══ FEED ═══ Both indexes used to stop dead at a cap and tell the reader to
   go and filter. They now stream: a chunk renders, and the next arrives as the
   sentinel comes near the viewport. Every chunk closes with a milestone, which
   is what keeps a long scroll legible — it says where you are, and what you
   just scrolled past, so the list reads as sections rather than as one slab.
   A single FEED at a time is enough: only one index is ever on screen. ══════ */
const CHUNK=40;
let FEED=null;
function feedStop(){ if(FEED&&FEED.obs) FEED.obs.disconnect(); FEED=null; }
function feedMore(){
  if(!FEED||FEED.shown>=FEED.items.length) return;
  const from=FEED.shown, to=Math.min(from+CHUNK,FEED.items.length);
  const slice=FEED.items.slice(from,to);
  FEED.shown=to;
  FEED.host.insertAdjacentHTML("beforeend",
    slice.map(FEED.row).join("")+FEED.note(to,FEED.items.length,slice));
  if(FEED.shown>=FEED.items.length){ if(FEED.obs) FEED.obs.disconnect(); }
  else FEED.host.appendChild(FEED.sentinel);   /* appendChild MOVES it to the end */
}
function feedStart(sel,items,row,note){
  feedStop();
  const host=$(sel); if(!host||!items.length) return;
  const sentinel=document.createElement("div"); sentinel.className="feedsent";
  FEED={items,row,note,host,shown:0,sentinel,obs:null};
  feedMore();
  if(FEED.shown<items.length){
    host.appendChild(sentinel);
    /* generous rootMargin so the next chunk lands before the reader hits the gap */
    FEED.obs=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))feedMore();},{rootMargin:"900px"});
    FEED.obs.observe(sentinel);
  }
}
const milestone=(shown,total,bits)=>shown>=total
  ? `<div class="milestone end"><span class="mspos">all ${total} shown</span>
      <span class="msbits">${bits.filter(Boolean).join(" &nbsp;·&nbsp; ")}</span></div>`
  : `<div class="milestone"><span class="mspos">${shown} <i>of</i> ${total}</span>
      <span class="msbits">${bits.filter(Boolean).join(" &nbsp;·&nbsp; ")}</span></div>`;

/* ── how a group of options behaves, said out loud ─────────────────────────
   Three modes, and they were previously indistinguishable from each other:
     one   pick one; choosing another replaces it. Options are PILLS.
     any   pick any; a row matching ANY of them qualifies. Options are SQUARE.
     all   pick any; a row must match ALL of them. Options are SQUARE.
   Shape carries the exclusive/multiple distinction and the label carries the
   OR/AND distinction, so neither depends on colour and neither needs a hover.
   The mode also names its own set: the heading IS the set the options are
   mutual with, which is the question "mutual with what?" answered in place. */
const FMODE={one:["pick one","Choosing another replaces this one."],
             any:["any of","A row matching any one of these qualifies."],
             all:["all of","A row must match every one you pick."]};
const fmode=m=>FMODE[m]?`<span class="fany m-${m}" title="${esc(FMODE[m][1])}">${FMODE[m][0]}</span>`:"";
const fgroup=(label,mode,inner)=>`<div class="fgroup m-${mode}">
  <h4>${esc(label)} ${fmode(mode)}</h4><div class="fopts">${inner}</div></div>`;
const fsub=(label,mode,inner)=>`<div class="fsub m-${mode}">
  <h5>${esc(label)} ${fmode(mode)}</h5><div class="fopts">${inner}</div></div>`;

let FACETS={tag:new Set(),ctr:new Set(),role:null,sev:null,dg:null,mod:null};
/* One index, both modules. Every row carries mod:"d"|"r"; dungeon rows have
   x.d, raid rows have x.b. The dungeon facet only ever matches dungeon rows,
   so "this dungeon" and "the raid" cannot both be claimed at once. */
const ALL=[
  ...DUNGEONS.flatMap(d=>[
    ...d.areas.flatMap(ar=>ar.mobs.flatMap(m=>(m.a||[]).map(a=>({mod:"d",d,src:m.n,kind:KINDS[m.k],a})))),
    ...d.encounters.flatMap(e=>(e.a||[]).map(a=>({mod:"d",d,src:e.n,kind:"Boss",a})))]),
  ...RAID.bosses.flatMap(b=>(b.phases?b.phases.flatMap(p=>(p.a||[]).map(a=>({mod:"r",b,src:b.n,kind:"Boss",ph:p.n,a})))
    :(b.a||[]).map(a=>({mod:"r",b,src:b.n,kind:"Boss",a}))))
];
function matches(x){
  const a=x.a;
  if(FACETS.mod&&x.mod!==FACETS.mod) return false;
  if(FACETS.dg&&(x.mod!=="d"||x.d.id!==FACETS.dg)) return false;
  if(FACETS.role&&!(a.r||[]).includes(FACETS.role)) return false;
  if(FACETS.sev&&a.sev<FACETS.sev) return false;
  for(const t of FACETS.tag) if(!(a.t||[]).includes(t)) return false;
  for(const c of FACETS.ctr) if(!(a.c||[]).includes(c)) return false;
  return true;
}
/* The origin chip: a dungeon's short in its accent, or the boss's short in its
   depth colour. Either way it links to where the ability lives. */
const mechChip=x=>x.mod==="r"
  ?`<a class="mdg" href="#/r/${x.b.id}" data-boss="${x.b.id}" style="background:var(--d-accent);color:var(--d-ink);text-decoration:none">${esc(x.b.short)}</a>`
  :`<a class="mdg" href="#/d/${x.d.id}" data-dungeon="${x.d.id}" style="background:var(--d-accent);color:var(--d-ink);text-decoration:none">${esc(x.d.short)}</a>`;
const mechRow=x=>`<div class="mres"><div class="mtop">
      ${mechChip(x)}
      <span class="mn">${abilIcon(x.a.n)}${esc(x.a.n)}${lethalBadge(x.a)}${mythBadge(x.a)}</span><span class="mm">${esc(x.src)} · ${esc(x.kind)}${x.ph?` · ${esc(x.ph)}`:""}</span></div>
    <div class="tags" style="margin-top:.35rem">${sevChip(x.a)}${(x.a.t||[]).filter(t=>t!=="myth"&&!LETHAL[t]).map(t=>chip(t,TAGS,t==="noarmor"?"c-noarmor":"")).join("")}${(x.a.c||[]).map(c=>chip(c,CTRS,"c-counter")).join("")}</div>
    <p>${esc(x.a.e)}${srcMark(x.a.s)}</p></div>`;
/* What a reader wants at a chunk boundary: how far in they are, which dungeons
   that stretch covered, and whether any of it will end a run. */
const mechNote=(shown,total,slice)=>{
  const dg=[...new Set(slice.map(x=>x.mod==="r"?RAID.short:x.d.short))];
  const s3=slice.filter(x=>x.a.sev===3).length;
  const kl=slice.filter(x=>isLethal(x.a)).length;
  return milestone(shown,total,[dg.join(", "),s3?`${s3} run-ender${s3>1?"s":""}`:"",kl?`${kl} kill${kl>1?"":"s"} outright`:""]);
};
let MRES=[];
function pMechanics(){
  const res=ALL.filter(matches); MRES=res;
  const live=new Set(res.flatMap(x=>x.a.t||[])), liveC=new Set(res.flatMap(x=>x.a.c||[]));
  const n=Object.values(FACETS).reduce((k,v)=>k+(v instanceof Set?v.size:(v?1:0)),0);
  /* Lethality lives in TAGS so it filters for free, but it is not a shape —
     it gets its own group below rather than a slot between Frontal and Line. */
  const opts=(map,key,liveSet)=>Object.entries(map).filter(([k])=>!(map===TAGS&&LETHAL[k])).map(([k,v])=>{
    const on=FACETS[key] instanceof Set?FACETS[key].has(k):FACETS[key]===k;
    const dis=!on&&!liveSet.has(k);
    return `<button class="fopt" data-f="${key}" data-v="${k}" aria-pressed="${on}" ${dis?"disabled":""}>${ic(v.i)}${esc(v.l)}</button>`;}).join("");
  const nR=ALL.filter(x=>x.mod==="r").length;
  return `<div class="crumb"><a href="#/">Compendium</a> › <em>Mechanics</em></div>
  <h1>Every mechanic in the season</h1>
  <p class="lede">${ALL.length} abilities across ${DUNGEONS.length} dungeons${nR?` and ${RAID.bosses.length} raid bosses`:" — raid abilities land as the boss guides are written"}, tagged by
  what they are and by what stops them. This is the view no published guide gives you: filter by a counter you
  actually have, and see the whole season through it.</p>
  <div class="facets">
    ${fgroup("From","one",`
      <button class="fopt" data-f="mod" data-v="d" aria-pressed="${FACETS.mod==="d"}">${ic("i-gate")}Dungeons</button>
      <button class="fopt" data-f="mod" data-v="r" aria-pressed="${FACETS.mod==="r"}">${ic("i-serpent")}Raid</button>`)}
    ${fgroup("What stops it","all",opts(CTRS,"ctr",liveC))}
    ${fgroup("What it is","all",opts(TAGS,"tag",live))}
    ${fgroup("Whose problem","one",
      ["tank","healer","dps"].map(r=>`<button class="fopt" data-f="role" data-v="${r}" aria-pressed="${FACETS.role===r}">${ic(r==="tank"?"i-tank":r==="healer"?"i-heal":"i-dps")}${r[0].toUpperCase()+r.slice(1)}</button>`).join(""))}
    <div class="fgroup"><h4>How bad</h4>
      ${fsub("Kills outright","all",`
        <button class="fopt" data-f="tag" data-v="oneshot" aria-pressed="${FACETS.tag.has("oneshot")}">${ic("i-skull")}One-shot</button>
        <button class="fopt" data-f="tag" data-v="wipe" aria-pressed="${FACETS.tag.has("wipe")}">${ic("i-skull")}Wipe</button>`)}
      ${fsub("Severity","one",`
        <button class="fopt" data-f="sev" data-v="3" aria-pressed="${FACETS.sev===3}">${ic("i-warn")}Run-enders</button>
        <button class="fopt" data-f="sev" data-v="2" aria-pressed="${FACETS.sev===2}">${ic("i-warn")}Punishing or worse</button>`)}
      <p class="fhint">One-shot kills the player; Wipe ends the group. Severity is what one failure costs.
      Nothing is both a One-shot and a Wipe, so picking both returns nothing.</p></div>
    ${fgroup("Dungeon","one",
      DUNGEONS.map(d=>`<button class="fopt" data-f="dg" data-v="${d.id}" aria-pressed="${FACETS.dg===d.id}" title="${esc(d.name)}">${dcode(d)}${esc(d.short)}</button>`).join(""))}
  </div>
  <div class="fstate"><b>${res.length}</b> match${res.length===1?"":"es"} · ${ALL.length} abilities indexed${n?` · ${n} filter${n>1?"s":""} active`:""}
    ${n?`<button class="clear" id="clearf">Clear all</button>`:""}</div>
  ${res.length?`<div id="mfeed"></div>`
    :`<p class="note">Nothing matches that combination. Filters stack, so two counters means abilities answered by
      <em>both</em>. Clear one and try again.</p>`}`;
}

/* ═══ LOOT INDEX ═══ the Mechanics treatment applied to gear. One chest per
   run means the whole season's table is one pool, and the questions a player
   actually has are cross-dungeon: what Mail exists with mastery on it, which
   Agility trinkets are worth setting loot spec for. ═══════════════════════ */
/* Which slots that stretch covered, and how much of it actually does something
   beyond its stat line — the two things worth knowing mid-scroll. */
const lootNote=(shown,total,slice)=>{
  const ty=[...new Set(slice.map(o=>o.i.ty))];
  const fx=slice.filter(o=>o.i.u||o.i.e).length;
  return milestone(shown,total,[ty.slice(0,6).join(", ")+(ty.length>6?"…":""),fx?`${fx} with an effect`:""]);
};
let LRES=[];
const lootIdxRow=o=>`${o.hdr?`<div class="area-h" data-boss="${o.hdr.id}"><a href="#/r/${o.hdr.id}" style="color:inherit;text-decoration:none">${esc(o.hdr.n)}</a> <span class="n" style="text-transform:none;letter-spacing:0">· ${esc(o.hdr.pos)}</span></div>`:""}<div class="mres"><div class="mtop">
      ${o.mod==="r"
        ?`<a class="mdg" href="#/r/${o.b.id}/loot" data-boss="${o.b.id}" style="background:var(--d-accent);color:var(--d-ink);text-decoration:none">${esc(o.b.short)}</a>`
        :`<a class="mdg" href="#/d/${o.d.id}/loot" data-dungeon="${o.d.id}" style="background:var(--d-accent);color:var(--d-ink);text-decoration:none">${esc(o.d.short)}</a>`}
      <span class="mn">${itemIcon(o.i)}${esc(o.i.n)}${cantrip(o.i)}${wlBtn(o.i)}</span></div>
    <div class="tags" style="margin-top:.35rem">${typeChip(o.i)}${slotChip(o.i)}${primChip(o.i.p)}${secChip(o.i.x)}${roleChips(o.i)}</div>
    ${o.i.u?`<p class="fx use"><b>Use</b> ${esc(o.i.u)}</p>`:""}
    ${o.i.e?`<p class="fx equip"><b>Equip</b> ${esc(o.i.e)}</p>`:""}
    ${o.mod==="r"&&o.i.sl==="Trinket"&&!o.i.u&&!o.i.e?`<p class="fx pending">Effect not yet published —
      Wowhead's tooltip for this item carries no Use or Equip text yet. Every raid trinket will do something;
      the text lands here the day the database has it.</p>`:""}</div>`;
/* Within a group the options are OR, across groups AND — "Mail or Plate, with
   crit" is the query people mean. Secondaries are the exception and stack as
   AND, because every item carries exactly two and picking both is how you ask
   for a specific pairing. Each group says which it is. */
let LFACETS={sl:new Set(),ty:new Set(),p:new Set(),x:new Set(),ro:new Set(),big:null,spec:null,dg:null,fx:null,mod:null};
const LOOTALL=[
  ...DUNGEONS.flatMap(d=>(d.loot?d.loot.i:[]).map(i=>({mod:"d",d,i}))),
  ...RAID.bosses.flatMap(b=>(b.loot||[]).map(i=>({mod:"r",b,i})))];
const LSLOT=["Head","Shoulder","Back","Chest","Wrist","Hands","Waist","Legs","Feet",
  "Neck","Ring","Trinket","One-hand","Two-hand","Off-hand","Ranged"];
const LARM=["Cloth","Leather","Mail","Plate"];
const LGEAR=["Cloak","Neck","Ring","Shield","Off-hand"];
const LWEP=["Dagger","Sword","Mace","Axe","Fist","Warglaive","Polearm","Staff","Bow","Crossbow","Gun","Wand"];
const LPRIM=["Str","Agi","Int"], LSEC=["Crit","Haste","Mastery","Vers"];
const inData=(arr,f)=>arr.filter(v=>LOOTALL.some(o=>f(o.i,v)));

/* ═══ SPECIALISATION FILTER ═══════════════════════════════════════════════
   "Show me what my Fury Warrior can actually wear." Four gates:

     armour class   a class property. Plate item, Plate class, or nothing.
     primary stat   a SPEC property — Holy Paladin wants Int off a Plate
                    item, Retribution wants Str off the same one. Every
                    weapon in the season carries a primary, so this does
                    most of the work on weapons too. A trinket that grants
                    a stat gates on it via es: even with no stat line.
     proficiency    a SPEC property too, with a hand gate — Beast Mastery
                    takes bows and no melee, Survival the reverse.
     trinket ro     whose loot table the trinket is on. This began as our
                    inference and was deliberately not used; since
                    2026-08-17 every one of the 41 is OBSERVED in game
                    (rc: marks the looking), so the gate is data.

   specCan() is also the voidcore engine: js/wishlist.js divides wished
   items by table size per spec, so a wrong gate here is no longer just a
   misfiltered list — it is wrong arithmetic shown to the user.
   ═══════════════════════════════════════════════════════════════════════ */
const WCLASS={
 "Mage":{a:"Cloth"},        "Priest":{a:"Cloth"},   "Warlock":{a:"Cloth"},
 "Demon Hunter":{a:"Leather"},"Druid":{a:"Leather"},"Monk":{a:"Leather"},"Rogue":{a:"Leather"},
 "Hunter":{a:"Mail"},       "Shaman":{a:"Mail"},    "Evoker":{a:"Mail"},
 "Death Knight":{a:"Plate"},"Paladin":{a:"Plate"},  "Warrior":{a:"Plate"}
};
/* Hand sets. Axe, Mace and Sword all exist in both one- and two-handed form
   this season, so the hand gate is not cosmetic: Retribution wants the
   two-handed axe and Protection wants the one-handed one. */
const H1=["One-hand"], H2=["Two-hand"], H12=["One-hand","Two-hand"],
      H1O=["One-hand","Off-hand"], H12O=["One-hand","Two-hand","Off-hand"],
      HR=["Ranged"], HC=["One-hand","Two-hand","Off-hand","Ranged"];
/* [class, spec, primary, weapon types, hand slots] — weapons and hands sit on
   the SPEC because that is where the game puts them. Beast Mastery and
   Marksmanship take a ranged weapon and no melee; Survival takes melee and no
   ranged. Assassination and Subtlety are daggers only where Outlaw is anything
   but. Retribution is two-handed and carries no shield where Protection is the
   reverse. None of that is derivable from the class. */
const SPECS=[
 ["Mage","Arcane","Int",["Staff","Dagger","Sword","Wand","Off-hand"],HC,"rdps"],
 ["Mage","Fire","Int",["Staff","Dagger","Sword","Wand","Off-hand"],HC,"rdps"],
 ["Mage","Frost","Int",["Staff","Dagger","Sword","Wand","Off-hand"],HC,"rdps"],
 ["Priest","Discipline","Int",["Staff","Dagger","Mace","Wand","Off-hand"],HC,"healer"],
 ["Priest","Holy","Int",["Staff","Dagger","Mace","Wand","Off-hand"],HC,"healer"],
 ["Priest","Shadow","Int",["Staff","Dagger","Mace","Wand","Off-hand"],HC,"rdps"],
 ["Warlock","Affliction","Int",["Staff","Dagger","Sword","Wand","Off-hand"],HC,"rdps"],
 ["Warlock","Demonology","Int",["Staff","Dagger","Sword","Wand","Off-hand"],HC,"rdps"],
 ["Warlock","Destruction","Int",["Staff","Dagger","Sword","Wand","Off-hand"],HC,"rdps"],
 ["Demon Hunter","Havoc","Agi",["Warglaive","Sword","Axe","Fist"],H1,"mdps"],
 ["Demon Hunter","Vengeance","Agi",["Warglaive","Sword","Axe","Fist"],H1,"tank"],
 ["Demon Hunter","Devourer","Int",["Warglaive","Sword","Axe","Fist"],H1,"rdps"],
 ["Druid","Balance","Int",["Staff","Dagger","Mace","Off-hand"],H12O,"rdps"],
 ["Druid","Feral","Agi",["Staff","Polearm","Dagger","Fist","Mace"],H12,"mdps"],
 ["Druid","Guardian","Agi",["Staff","Polearm","Dagger","Fist","Mace"],H12,"tank"],
 ["Druid","Restoration","Int",["Staff","Dagger","Mace","Off-hand"],H12O,"healer"],
 ["Monk","Brewmaster","Agi",["Staff","Polearm","Axe","Mace","Sword","Fist"],H12,"tank"],
 ["Monk","Mistweaver","Int",["Staff","Mace","Sword","Fist","Off-hand"],H12O,"healer"],
 ["Monk","Windwalker","Agi",["Axe","Mace","Sword","Fist","Staff","Polearm"],H12,"mdps"],
 ["Rogue","Assassination","Agi",["Dagger"],H1,"mdps"],
 ["Rogue","Outlaw","Agi",["Sword","Axe","Mace","Fist"],H1,"mdps"],
 ["Rogue","Subtlety","Agi",["Dagger"],H1,"mdps"],
 ["Hunter","Beast Mastery","Agi",["Bow","Crossbow","Gun"],HR,"mdps"],
 ["Hunter","Marksmanship","Agi",["Bow","Crossbow","Gun"],HR,"mdps"],
 ["Hunter","Survival","Agi",["Polearm","Staff","Axe","Sword","Mace","Dagger","Fist"],H12,"mdps"],
 ["Shaman","Elemental","Int",["Staff","Dagger","Mace","Axe","Fist","Shield","Off-hand"],H12O,"rdps"],
 ["Shaman","Enhancement","Agi",["Axe","Mace","Fist","Dagger"],H1,"mdps"],
 ["Shaman","Restoration","Int",["Staff","Dagger","Mace","Axe","Fist","Shield","Off-hand"],H12O,"healer"],
 ["Evoker","Devastation","Int",["Staff","Dagger","Mace","Sword","Axe","Fist","Off-hand"],H12O,"rdps"],
 ["Evoker","Preservation","Int",["Staff","Dagger","Mace","Sword","Axe","Fist","Off-hand"],H12O,"healer"],
 ["Evoker","Augmentation","Int",["Staff","Dagger","Mace","Sword","Axe","Fist","Off-hand"],H12O,"rdps"],
 ["Death Knight","Blood","Str",["Axe","Mace","Sword","Polearm"],H2,"tank"],
 ["Death Knight","Frost","Str",["Axe","Mace","Sword","Polearm"],H12,"mdps"],
 ["Death Knight","Unholy","Str",["Axe","Mace","Sword","Polearm"],H2,"mdps"],
 ["Paladin","Holy","Int",["Mace","Sword","Axe","Shield","Off-hand"],H1O,"healer"],
 ["Paladin","Protection","Str",["Mace","Sword","Axe","Shield"],H1O,"tank"],
 ["Paladin","Retribution","Str",["Mace","Sword","Axe","Polearm"],H2,"mdps"],
 ["Warrior","Arms","Str",["Axe","Mace","Sword","Polearm","Staff"],H2,"mdps"],
 ["Warrior","Fury","Str",["Axe","Mace","Sword","Polearm","Staff","Dagger","Fist"],H12,"mdps"],
 ["Warrior","Protection","Str",["Axe","Mace","Sword","Shield"],H1O,"tank"]
];
const SPECKEY=s=>s[0]+"/"+s[1];
const SPECMAP=Object.fromEntries(SPECS.map(s=>
  [SPECKEY(s),{c:s[0],s:s[1],p:s[2],w:s[3],h:s[4],ro:s[5],a:WCLASS[s[0]].a}]));
/* No primary at all means the item does not gate on stat \u2014 trinkets and
   tokens mostly \u2014 so it stays eligible. */
const specStatOK=(i,sp)=>!i.p||!i.p.length||i.p.includes(sp.p);
function specCan(i,key){
  const sp=SPECMAP[key]; if(!sp) return true;
  /* Trinkets are the one slot the game gates by loot specialisation, and ro is
     that gate — so a Protection Warrior never sees a melee-DPS trinket on its
     own loot table, however well it could use one in the fight. Only trinkets
     carry ro, so nothing else narrows here. */
  if(i.ro&&i.ro.length&&!i.ro.includes(sp.ro)) return false;
  /* A trinket with no primary stat line can still be stat-gated by the stat it
     grants: a Strength proc is not on a rogue's loot table. es: carries that
     where the item's own text names a stat, and only where it changes an
     answer — see the note in CLAUDE.md before adding one by analogy. */
  if(i.es&&i.es.length&&!i.es.includes(sp.p)) return false;
  const ty=i.ty;
  if(ARMOURS.includes(ty)) return ty===sp.a;              // armour: class gate only
  if(ty==="Token") return i.tc===sp.a||i.tc==="All";      // tier token carries its armour
  if(ty&&(WEAPONRY.has(ty)||ty==="Shield"||ty==="Off-hand"))
    return sp.w.includes(ty)&&sp.h.includes(i.sl)&&specStatOK(i,sp);
  return specStatOK(i,sp);                                // trinkets, rings, necks, cloaks
}

/* skip lets a group ask "what would still be reachable if I were not applied",
   which is what keeps an OR group from disabling its own siblings. */
function lmatch(o,skip){
  const i=o.i, F=LFACETS;
  if(skip!=="mod"&&F.mod&&o.mod!==F.mod) return false;
  if(skip!=="dg"&&F.dg&&(o.mod!=="d"||o.d.id!==F.dg)) return false;
  if(skip!=="sl"&&F.sl.size&&!F.sl.has(i.sl)) return false;
  if(skip!=="ty"&&F.ty.size&&!F.ty.has(i.ty)) return false;
  if(skip!=="p"&&F.p.size&&!(i.p||[]).some(v=>F.p.has(v))) return false;
  if(skip!=="x"&&F.x.size){const have=(i.x||[]).map(v=>v[0]);
    for(const v of F.x) if(!have.includes(v)) return false;}
  if(skip!=="big"&&F.big&&!((i.x||[]).length&&i.x[0][0]===F.big)) return false;
  if(skip!=="fx"&&F.fx==="1"&&!isCantrip(i)) return false;
  if(skip!=="ro"&&F.ro.size&&!(i.ro||[]).some(r=>F.ro.has(r))) return false;
  /* Single-select, unlike the other loot groups: "what can my spec use" is a
     question about one character, and two specs at once answers nobody's. */
  if(skip!=="spec"&&F.spec&&!specCan(i,F.spec)) return false;
  return true;
}
function pLoot(){
  const res=LOOTALL.filter(o=>lmatch(o)); LRES=res;
  const F=LFACETS;
  /* Raid loot is per boss — that is the whole point of it — so with the raid
     filter on, the feed groups by boss in kill order, chased items first
     within each. M+ keeps its flat pool: the chest doesn't care. */
  if(F.mod==="r"){
    const ord=Object.fromEntries(RAID.bosses.map((b,i)=>[b.id,i]));
    res.sort((a,b)=>(ord[a.b.id]-ord[b.b.id])||(featRank(a.i)-featRank(b.i)));
    let last=null;
    res.forEach(o=>{o.hdr=o.b.id!==last?o.b:null; last=o.b.id;});
  } else res.forEach(o=>{o.hdr=null;});
  const n=Object.values(F).reduce((k,v)=>k+(v instanceof Set?v.size:(v?1:0)),0);
  const reach=(key,get)=>{const live=new Set();
    LOOTALL.filter(o=>lmatch(o,key)).forEach(o=>get(o.i).forEach(v=>live.add(v)));return live;};
  const liveSl=reach("sl",i=>[i.sl]), liveTy=reach("ty",i=>[i.ty]);
  const liveP=reach("p",i=>i.p||[]), liveX=reach("x",i=>(i.x||[]).map(v=>v[0]));
  const liveBig=reach("big",i=>(i.x||[]).length?[i.x[0][0]]:[]);
  const liveRo=reach("ro",i=>i.ro||[]);
  /* reach() collects values off items, but a spec is not an item property —
     so ask the question the other way round: which specs could equip anything
     still reachable once their own selection is set aside. */
  const specPool=LOOTALL.filter(o=>lmatch(o,"spec"));
  const liveSpec=new Set(SPECS.map(SPECKEY).filter(k=>specPool.some(o=>specCan(o.i,k))));
  const opt=(key,v,label,live)=>{
    const on=F[key] instanceof Set?F[key].has(v):F[key]===v;
    const dis=!on&&live&&!live.has(v);
    /* labels may carry an icon element, so they arrive pre-escaped */
    return `<button class="fopt" data-lf="${key}" data-v="${esc(v)}" aria-pressed="${on}" ${dis?"disabled":""}>${label||esc(v)}</button>`;};
  const nR=LOOTALL.filter(o=>o.mod==="r").length;
  return `<div class="crumb"><a href="#/">Compendium</a> › <em>Loot</em></div>
  <h1>Every item in the season</h1>
  <p class="lede">${LOOTALL.length} items${nR?` — the Mythic+ chest pool and the raid's per-boss tables`:" across the dungeon pool; raid tables land as the boss guides are written"}.
  Mythic+ pays out from one chest at the end of a run, so a dungeon's whole table is a single pool and the useful
  questions cross dungeons: what Mail exists with mastery on it, which Agility trinkets are worth setting loot
  specialisation for. The raid is the opposite — the boss is the loot table, once a week.</p>
  <div class="facets">
    ${fgroup("From","one",`${opt("mod","d","Dungeons",null)}${opt("mod","r","Raid",null)}`)}
    <div class="fgroup m-any"><h4>Slot ${fmode("any")}</h4><div class="fopts">
      ${inData(LSLOT,(i,v)=>i.sl===v).map(v=>opt("sl",v,esc(v),liveSl)).join("")}</div></div>
    <div class="fgroup m-any"><h4>Armour ${fmode("any")}</h4><div class="fopts">
      ${inData(LARM,(i,v)=>i.ty===v).map(v=>opt("ty",v,esc(v),liveTy)).join("")}
      ${inData(LGEAR,(i,v)=>i.ty===v).map(v=>opt("ty",v,esc(v),liveTy)).join("")}</div></div>
    <div class="fgroup m-any"><h4>Weapon ${fmode("any")}</h4><div class="fopts">
      ${inData(LWEP,(i,v)=>i.ty===v).map(v=>opt("ty",v,esc(v),liveTy)).join("")}</div></div>
    <div class="fgroup m-any"><h4>Primary stat ${fmode("any")}</h4><div class="fopts">
      ${LPRIM.map(v=>opt("p",v,esc({Str:"Strength",Agi:"Agility",Int:"Intellect"}[v]),liveP)).join("")}</div></div>
    <div class="fgroup m-all"><h4>Secondaries ${fmode("all")}</h4><div class="fopts">
      ${LSEC.map(v=>opt("x",v,esc(v),liveX)).join("")}</div></div>
    <div class="fgroup m-one"><h4>Big stat ${fmode("one")} <span class="fany">the heavier of the two</span></h4><div class="fopts">
      ${LSEC.map(v=>opt("big",v,esc(v),liveBig)).join("")}</div></div>
    <div class="fgroup m-any"><h4>Role ${fmode("any")} <span class="fany">whose loot table it is, seen in game</span></h4><div class="fopts">
      ${["tank","healer","rdps","mdps"].map(r=>opt("ro",r,esc(LROLE[r]),liveRo)).join("")}</div></div>
    <details class="fgroup specfg m-one"${F.spec?" open":""}>
      <summary><h4><span class="spectw" aria-hidden="true"></span>Specialisation
        ${fmode("one")} <span class="fany">${SPECS.length} specs · from armour, primary stat, the weapons the spec actually uses, and loot role on trinkets</span></h4></summary>
      ${ARMOURS.map(a=>`<div class="specarm"><span class="specarm-h">${a}</span>
        ${Object.keys(WCLASS).filter(c=>WCLASS[c].a===a).map(c=>`<div class="specrow">
          <span class="speccls">${clsIcon(c)}${esc(c)}</span>
          <div class="fopts">${SPECS.filter(s=>s[0]===c).map(s=>
            opt("spec",SPECKEY(s),specIcon(SPECKEY(s))+esc(s[1]),liveSpec)).join("")}</div></div>`).join("")}
        </div>`).join("")}
    </details>
    ${fgroup("Cantrips","one",opt("fx","1","Cantrips",null))}
    ${fgroup("Dungeon","one",DUNGEONS.map(d=>opt("dg",d.id,dcode(d)+esc(d.short),null)).join(""))}
  </div>
  <div class="fstate"><b>${res.length}</b> match${res.length===1?"":"es"} · ${LOOTALL.length} items indexed${n?` · ${n} filter${n>1?"s":""} active`:""}
    ${n?`<button class="clear" id="clearl">Clear all</button>`:""}</div>
  ${wlLootBar()}
  ${res.length?`<div id="lfeed"></div>`
    :`<p class="note">Nothing matches that combination. Slot, armour and primary stack as <em>any of</em>;
      secondaries stack as <em>all of</em>, so picking three of the four can never match — every item has two.</p>`}`;
}

/* Paint helpers exist so no call site can render an index and forget to mount
   its feed — that would show one chunk and never load another. */
function paintMech(){ $("#p-mechanics").innerHTML=pMechanics(); feedStart("#mfeed",MRES,mechRow,mechNote); }
function paintLoot(){ $("#p-loot").innerHTML=pLoot(); feedStart("#lfeed",LRES,lootIdxRow,lootNote); }

/* ═══ RAID PAGES ═══ The Venomous Abyss — landing, boss detail, prep ═══ */

/* The descent strip: each boss wears its depth colour — the palette walks
   venom green down into abyssal violet, the literal shape of the raid. The
   layout is the fork itself: the raid is not linear, and the page should
   not pretend it is. */
const bossTile=b=>`<a class="rboss" href="#/r/${b.id}" data-boss="${b.id}">
  <span class="rnum">${b.o}</span>
  <span class="rname">${esc(b.n)}</span>
  ${b.sub?`<span class="rsub">${esc(b.sub)}</span>`:""}
  <span class="rabil">${abilCount(b)||"—"} abilities</span></a>`;

function pRaid(){
  const nAb=RAID.bosses.reduce((n,b)=>n+abilCount(b),0);
  const F=RAID.fork, tile=id=>bossTile(RB[id]);
  return `<div class="crumb"><a href="#/">Compendium</a> › <em>Raid</em></div>
  <h1>${esc(RAID.name)}</h1>
  ${modbar("raid","raid")}
  <div class="tile-foot" style="border:none;padding:.8rem 0 0">
    <span class="pill new" style="background:var(--r-accent);color:var(--r-ink)">Patch ${RAID.patch}</span>
    <span class="pill">${ic("i-boss")}${RAID.bosses.length} bosses</span>
    <span class="pill">Normal · Heroic</span>
    ${nAb?`<span class="pill">${nAb} abilities</span>`:""}
    <span class="pill warn">${ic("i-warn")}Pre-launch data</span></div>
  <p class="lede">${esc(RAID.loc)} — beneath the same vaults Altar of Fangs digs under. Eight bosses ending at
  Ula'tek, the serpent the patch is named for — and the order is not a line.</p>
  <p class="note">${ic("i-info",13)} Covered here: <b>Normal and Heroic</b>. Mythic and Raid Finder are out of
  scope for now — a decision, not an oversight. The structure accommodates both if that changes.</p>

  <div class="sec"><h2>The descent</h2><span class="n">Forks after the first boss</span></div>
  <p class="note">After Nek'zali the raid splits: two wings, each two bosses, taken in either order — different
  guides list the middle four differently because both orders are real. The wings converge at the Twin Fangs.</p>
  <div class="rlist">${tile(F.after)}</div>
  <div class="rfork">
    ${F.wings.map(w=>`<div class="rwing"><div class="rwing-h">${esc(w.n)}</div>${w.ids.map(tile).join("")}</div>`).join("")}
  </div>
  <div class="rlist">${[F.converge,...RAID.bosses.filter(b=>b.o>=7).map(b=>b.id)].map(tile).join("")}</div>

  ${disputeBlock("raid")}
  ${resolvedBlock("raid")}

  <div class="sec"><h2>When it opens</h2><span class="n">Staggered</span></div>
  <table><thead><tr><th>Week</th><th>What opens</th></tr></thead><tbody>
  ${RAID.schedule.map(([w,x])=>`<tr><td class="mono">${esc(w)}</td><td>${esc(x)}${srcMark(["wh_va"])}</td></tr>`).join("")}
  </tbody></table>
  <p class="note">Raid Finder wants item level ${RAID.minIlvl} to queue.${srcMark(["wh_va"])}</p>
  <div class="sec"><h2>Getting there</h2><span class="n">Two waypoints, one door</span></div>
  <p class="note">${esc(RAID.entrance.way)}${srcMark(RAID.entrance.s)} — inside the Vaults of Atal'Utek on the
  Coiled Isle. The two written guides give waypoints seven map-points apart; see the contested list above.</p>`;
}

function pPrep(){
  const il=RAID.ilvl;
  return `<div class="crumb"><a href="#/">Compendium</a> › <a href="#/raid">Raid</a> › <em>Prep</em></div>
  <h1>Before you zone in</h1>
  ${modbar("raid","prep")}
  <p class="lede">Lockout, loot rules, item levels and the vault. The parts of raid night that are decided
  before the first pull.</p>

  <div class="sec"><h2>The lockout</h2><span class="n">Once a week, per difficulty</span></div>
  <p class="note">Each boss awards loot once per character per week on Normal and again on Heroic. Unlike
  Mythic+, there is no end-of-run chest and no repeatable farm — the boss is the loot table, once. Gear drops
  use Group Loot; after a kill, a Nebulous Voidcore buys a bonus roll from a separate per-class table, and a
  piece already won that way stops appearing on it.${srcMark(["wh_vr"])}</p>

  <div class="sec"><h2>Item level by boss</h2><span class="n">The deeper, the higher</span></div>
  <p class="note">The bracket belongs to the boss, not to when you kill it — both wings pay the same.</p>
  <table><thead><tr><th>Bosses</th><th>Normal</th><th>Heroic</th></tr></thead><tbody>
  ${il.brackets.map((b,i)=>`<tr><td>${esc(b)}</td><td class="mono">${il.n[i]}</td><td class="mono">${il.h[i]}</td></tr>`).join("")}
  </tbody></table>
  <p class="note">Every boss also drops ten crests: ${esc(il.crests.n)}; on Heroic, ${esc(il.crests.h)}.${srcMark(["iv_va"])}</p>

  <div class="sec"><h2>Tier sets</h2><span class="n">Bosses 2–6, plus the Curio</span></div>
  <p class="note">Set tokens drop from the four wing bosses and the Twin Fangs — Vashnik holds chests, the
  Sentinels gloves, the Explorers shoulders, Sszorak legs, the Twins helms — and never from Nek'zali or the
  Coiled Altar. Tokens have a small chance to arrive Warbound-Until-Equipped on a lower upgrade track. Ula'tek
  drops the Slumbering Coil Curio on every difficulty: any class rolls it, you can hold only one, and Kirana
  near the Catalyst in Silvermoon trades it for the set piece of your choice.${srcMark(["wh_vr","wg_va","iv_ts"])}</p>
  <p class="note">The Catalyst also converts eligible season gear into set pieces — and new this season, a
  converted piece keeps its original secondary and tertiary stats.${srcMark(["iv_ts"])}</p>
  <div class="sec"><h2>What the bonuses do</h2><span class="n">${SETBONUS.reduce((a,c)=>a+c.specs.length,0)} spec bonuses · exact, because they don't scale</span></div>
  ${["Cloth","Leather","Mail","Plate"].map(arm=>{
    const cs=SETBONUS.filter(x=>x.a===arm);
    return `<div class="area-h">${arm} — shared tokens</div>`+cs.map(x=>`
    <div class="card"><h3>${clsIcon(x.c,22)}${esc(x.c)}</h3><div class="meta">${esc(x.set)}${srcMark(["iv_ts"])}</div>
    <table><thead><tr><th>Spec</th><th>2-piece</th><th>4-piece</th></tr></thead><tbody>
    ${x.specs.map(v=>`<tr><td class="mono">${esc(v.s)}</td><td>${esc(v.p2)}</td><td>${esc(v.p4)}</td></tr>`).join("")}
    </tbody></table></div>`).join("");}).join("")}

  <div class="sec"><h2>The Great Vault</h2><span class="n">Six bosses fills it</span></div>
  <p class="note">Raid kills fill the vault's raid row; defeating six bosses in a week maxes the choices, drawn
  from the loot tables of bosses you actually killed. Vault rewards land a difficulty ahead of the kill —
  Normal kills produce Heroic-track vault gear, Heroic kills produce Mythic-track.${srcMark(["wh_vr"])}</p>

  <div class="sec"><h2>Release schedule</h2><span class="n">${RAID.schedule.length} weeks</span></div>
  <table><thead><tr><th>Week</th><th>What opens</th></tr></thead><tbody>
  ${RAID.schedule.map(([w,x])=>`<tr><td class="mono">${esc(w)}</td><td>${esc(x)}${srcMark(["wh_va"])}</td></tr>`).join("")}
  </tbody></table>

  <div class="sec"><h2>Consumables and composition</h2><span class="n">Lands with live data</span></div>
  <p class="note">${ic("i-warn",13)} Not yet written — the boss pages carry per-fight utility notes (dispel
  load, immunities, movement), and a proper consumables section will be built from live-season sources rather
  than guessed at now.</p>`;
}

/* Featured-loot ranking, shared by boss pages and the loot index: trinkets,
   jewellery, cantrip-carriers, tier tokens — the chased stuff first,
   everything else in listing order. */
const featRank=x=>x.sl==="Trinket"?0:(x.ty==="Neck"||x.ty==="Ring")?1:(x.u||x.e)?2:x.ty==="Token"?3:5;
/* who a token is for: these are armour-typed tokens, so the share is the
   armour class roster; the Curio is everyone by design */
/* Which classes share a token. Rendered with their icons, so a reader spots
   their own class before reading a word. */
const TOKSHARE={Cloth:["Mage","Priest","Warlock"],Leather:["Druid","Rogue","Monk","Demon Hunter"],
  Mail:["Hunter","Shaman","Evoker"],Plate:["Warrior","Paladin","Death Knight"]};
const tokenShare=tc=>tc==="All"
  ?`<span class="n">Every class — trade for any set piece</span>`
  :(TOKSHARE[tc]||[]).map(c=>`<span class="tokcls" title="${esc(c)}">${clsIcon(c,16)}${esc(c)}</span>`).join("")||`<span class="n">—</span>`;

/* The difficulty the reader is on. Persists — a Heroic raider stays on
   Heroic all night — and rides the URL as ?d=h so a link carries it. Built
   as a segmented control so a third segment is a data change, not a rebuild. */
let DIFF=(function(){try{return localStorage.getItem("cc-diff")||"n";}catch(e){return "n";}})();
const DIFFL={n:"Normal",h:"Heroic",m:"Mythic"};
const diffToggle=()=>`<div class="dtoggle" role="group" aria-label="Difficulty">
  ${RAID.difficulties.map(d=>`<button class="dseg" data-diff="${d}" aria-pressed="${DIFF===d}">${DIFFL[d]}</button>`).join("")}
  </div>`;
const abilCount=b=>(b.phases?b.phases.flatMap(p=>p.a||[]):(b.a||[])).length;

function pBoss(id,tab){
  const b=RB[id]; if(!b) return `<p>Unknown boss.</p>`;
  const wing=RAID.fork.wings.find(w=>w.ids.includes(b.id));
  const phases=b.phases||[{n:"The fight",trigger:"",a:b.a||[]}];
  /* On Normal, Heroic-only rows collapse to a counted line rather than
     vanishing — silent filtering is how a reader forms a wrong picture and
     blames the site. */
  const renderPhase=p=>{
    const onDiff=(p.a||[]).filter(a=>DIFF==="h"||!(a.df&&a.df.length===1&&a.df[0]==="h"));
    const hidden=(p.a||[]).length-onDiff.length;
    const visible=onDiff.filter(a=>roleMatch(a,ROLEF));
    const roleHid=onDiff.length-visible.length;
    /* Heroic addenda are Heroic-only by the same contract the rows are, but
       hiding them without saying so would let a Normal reader form a wrong
       picture of the fight — so they are counted into the same note. */
    const addenda=DIFF==="h"?0:onDiff.filter(a=>a.hh).length;
    if(!visible.length&&!hidden&&!roleHid) return "";
    return `<div class="area-h">${esc(p.n)}${p.trigger?` <span class="n" style="text-transform:none;letter-spacing:0">· ${esc(p.trigger)}</span>`:""}</div>
    ${objBlock(p.brief,p.bh)}
    <div class="bossabils">${visible.map(a=>abilityRow(a,null,DIFF)).join("")}</div>
    ${hidden||addenda?`<p class="note hnote">${ic("i-info",13)} On Heroic: ${[
      hidden?`${hidden} further abilit${hidden>1?"ies":"y"}`:"",
      addenda?`${addenda} of the above change${addenda>1?"":"s"}`:""].filter(Boolean).join(", and ")} —
      <button class="linklike" data-diff="h">switch difficulty</button> to see ${hidden+addenda>1?"them":"it"}.</p>`:""}
    ${roleHid?`<p class="note hnote">${ic("i-info",13)} ${roleHid} abilit${roleHid>1?"ies":"y"} hidden by the role
      lens — <button class="linklike" data-role="">show everyone's view</button>.</p>`:""}`;};
  /* Featured first: trinkets, jewellery, cantrip-carriers, then tier tokens —
     the pieces people chase all season lead the table instead of trailing it.
     Everything else keeps its listing order. */
  const loot=(b.loot||[]).slice().sort((a,c)=>featRank(a)-featRank(c));
  const lootRows=loot.length?`
  <div class="sec"><h2>Loot</h2><span class="n">${loot.length} items · the chased stuff first</span></div>
  ${loot.some(x=>x.ty==="Token")?`<p class="note">The <b>Token</b> rows are tier-set pieces: they drop as class tokens and trade for the set piece of that slot.</p>`:""}
  <table><thead><tr><th>Item</th><th>Slot</th><th>Type</th><th>Stats</th></tr></thead><tbody>
  ${loot.map(x=>`<tr><td class="li">${itemIcon(x)}<b>${esc(x.n)}</b>${cantrip(x)}</td>
    <td class="mono">${esc(x.sl)}</td><td class="mono">${x.ty&&x.ty!==x.sl?esc(x.ty):`<span class="n">—</span>`}${x.tc?` · ${esc(x.tc)}`:""}</td>
    <td class="statcell">${x.ty==="Token"?tokenShare(x.tc)
      :`${primChip(x.p)||""}${x.x&&x.x.length?secChip(x.x):`<span class="n">—</span>`}${x.sl==="Trinket"?roleChips(x):""}`}</td></tr>
    ${x.u||x.e?`<tr class="fxrow"><td colspan="4">${x.u?`<p class="fx use"><b>Use</b> ${esc(x.u)}</p>`:""}${x.e?`<p class="fx equip"><b>Equip</b> ${esc(x.e)}</p>`:""}</td></tr>`
      :x.sl==="Trinket"?`<tr class="fxrow"><td colspan="4"><p class="fx pending">Effect not yet published —
      the tooltip carries no Use or Equip text yet; it lands here when the database has it.</p></td></tr>`:""}`).join("")}
  </tbody></table>`:"";
  return `<div class="crumb"><a href="#/">Compendium</a> › <a href="#/raid">Raid</a> › <em>${esc(b.n)}</em></div>
  <p class="printmeta">The Coiled Compendium — ${esc(b.n)} · ${DIFFL[DIFF]}${ROLEF?` · viewing as ${({tank:"Tank",healer:"Healer",mdps:"Melee DPS",rdps:"Ranged DPS"})[ROLEF]}`:""} · samurairacy.github.io/coiled-compendium</p>
  <nav class="dswitch" id="dswitch" aria-label="Switch boss">${RAID.bosses.map(x=>
    `<a href="#/r/${x.id}" data-boss="${x.id}" ${x.id===b.id?'aria-current="page"':""}
      title="${esc(x.pos)} — ${esc(x.n)}"><span class="rnum">${x.o}</span>${esc(x.short)}</a>`).join("")}</nav>
  <h1>${esc(b.n)}</h1>
  <div class="tile-foot" style="border:none;padding:.8rem 0 0">
    <span class="pill">${esc(b.pos)}</span>
    ${wing?`<span class="pill">${esc(wing.n)}</span>`:""}
    ${abilCount(b)?`<span class="pill">${ic("i-boss")}${abilCount(b)} abilities</span>`:""}
    <span class="pill warn">${ic("i-warn")}Pre-launch data</span></div>
  ${b.img&&IMG[b.img]?`<div class="hban"><img src="${IMG[b.img]}" alt="${esc(b.n)} in game" decoding="async"></div>`:""}
  ${b.jp?bossMedia(b.jp,b.n):""}
  ${b.sub?`<p class="lede">${esc(b.sub)}</p>`:""}
  ${b.gap?`<div class="cov warn" style="margin-bottom:1rem">${ic("i-warn",16)}<div><b>Untested territory.</b> ${esc(b.gap)}</div></div>`:""}
  ${briefBlock(b.brief,"raidbrief",b.briefh)}
  ${abilCount(b)?`<div class="lenses">${diffToggle()}${roleBar()}</div>${roleNote()}${sevLegend()}`:""}
  ${playBlock(b.play,ROLEF,b.playh)}
  ${abilCount(b)?phases.map(renderPhase).join(""):`
  <p class="note">${ic("i-warn",13)} The order and name are confirmed against Wowhead; the encounter guide has
  not been written yet. Bosses are being sourced and added one at a time — the same way the dungeons were.</p>`}
  ${lootRows}
  ${(b.reads||[]).length?`<div class="sec"><h2>Reads</h2><span class="n">Opinion, attributed</span></div>
    ${b.reads.map(x=>`<div class="card"><div class="meta">${esc(x.by)}</div><p class="read">${esc(x.t)}${srcMark(x.s)}</p></div>`).join("")}`:""}`;
}

function pRoutes(){
  return `<div class="crumb"><a href="#/">Compendium</a> › <a href="#/dungeons">Mythic+</a> › <em>Routes</em></div>
  <h1>Pug routes, all ${DUNGEONS.length===8?"eight":DUNGEONS.length}</h1>
  ${modbar("mplus","routes")}
  <p class="lede">Conservative by design — no skips, minimised interrupts per pull, minimised danger. These are
  week-one routes for groups that have not played the dungeons, not title-push routes.</p>
  <p class="note">${ic("i-warn",13)} All routing below is from PTR testing. Enemy Forces counts, pack composition and
  even abilities can change at launch. Expect the MDT strings to need an early-season correction — Blinding Vale
  especially, where the source flags the addon data as likely wrong.</p>
  ${DUNGEONS.map(d=>`<div class="area-h" data-dungeon="${d.id}">${esc(d.name)} · ${d.route.length} pulls</div>
    <div data-dungeon="${d.id}">${d.route.map(p=>`<div class="pull ${p.lust?"lust":""} ${p.d===3?"d3":""}">
      <div class="num">${p.n}</div><div><div class="pn">${esc(p.t)}</div>
      <p>${esc(p.p)}${srcMark(p.s)}</p></div></div>`).join("")}
    <p style="margin-top:.7rem"><a href="#/d/${d.id}/route">Full route detail →</a></p></div>`).join("")}`;
}

function pSeason(){
  return `<div class="crumb"><a href="#/">Compendium</a> › <em>Season</em></div>
  <h1>Season 2 at a glance</h1>
  <p class="lede">Everything below comes from Blizzard — patch notes, hotfixes, or values read directly from the
  live client — corroborated by a second source where one exists. Where nothing reliable covers a question, this
  page says so rather than guessing.</p>
  <div class="sec"><h2>Affixes</h2><span class="n">By key range</span></div>
  <table><thead><tr><th>Key range</th><th>Affix</th><th>What it does</th></tr></thead><tbody>
  ${SEASON.affixes.map(a=>`<tr><td class="mono">${esc(a.k)}</td><td><b>${esc(a.a)}</b></td><td>${esc(a.d)}${srcMark(a.s)}</td></tr>`).join("")}
  </tbody></table>
  <div class="sec"><h2>Rewards</h2><span class="n">Item level by key</span></div>
  <table><thead><tr><th>Key</th><th>End of run</th><th>Great Vault</th></tr></thead><tbody>
  ${SEASON.rewards.map(r=>`<tr><td class="mono">${esc(r.k)}</td><td class="mono">${r.e}</td><td class="mono">${r.v}</td></tr>`).join("")}
  </tbody></table>
  <p class="note">${esc(SEASON.rewardNote)}${srcMark(["bz_game","iv_ov"])}</p>
  <p class="note">${ic("i-info",13)} Blizzard's own figures and an independent written guide agree here line for
  line. Treat it as settled.</p>
  <div class="sec"><h2>The raid</h2><span class="n">Opens with the season</span></div>
  <p class="note"><a href="#/raid">${esc(RAID.name)}</a> opens the same week — Normal and Heroic from day one,
  Raid Finder in four staggered wings. Item levels, tier tokens, the vault and the lockout live on
  <a href="#/raid/prep">Raid → Prep</a>.${srcMark(["wh_va"])}</p>
  <table><thead><tr><th>Week</th><th>What opens</th></tr></thead><tbody>
  ${RAID.schedule.map(([w,x])=>`<tr><td class="mono">${esc(w)}</td><td>${esc(x)}${srcMark(["wh_va"])}</td></tr>`).join("")}
  </tbody></table>
  <p class="note">${esc(SEASON.mounts)}${srcMark(["bz_game"])}</p>
  <div class="sec"><h2>Where things are</h2><span class="n">${SEASON.where.length}</span></div>
  <p class="note">Every dungeon also has its own location, waypoint and teleport spell on its Getting There section.
  The three legacy dungeons — King's Rest, Ruby Life Pools and Temple of Sethraliss — are reached through the
  Timeways portal room: King's Rest left-most, Ruby Life Pools centre, Temple of Sethraliss right-most.${srcMark(["wh_dg"])}</p>
  ${SEASON.where.map(w=>`<div class="card"><h3>${esc(w.n)}</h3><p>${esc(w.d)}${srcMark(w.s)}</p></div>`).join("")}
  <div class="sec"><h2>What this page does not cover</h2><span class="n">Named gaps</span></div>
  <ul>
    <li><b>Enemy Forces counts</b> per pack — the last big routing unknown, and what MDT exists for.</li>
    <li><b>Affix-specific interactions</b> — which packs get materially worse under which Bargain.</li>
    <li><b>Cast times and cooldowns.</b> The journal gives damage numbers but not timings.</li>
    <li><b>Anything from the live season.</b> It has not started.</li>
  </ul>`;
}

function pSources(){
  /* Publishers, most-trusted first. This page deliberately does NOT print the
     tier numbers — ordering carries the same information without turning a
     reader-facing page into a description of our own methodology. The tiers
     still exist in SOURCES.t and still drive the source marks. A publisher
     with no entry here falls back to its own author name, so adding one to
     SOURCES cannot silently drop it off this page. */
  const GROUPS=[["blizzard","Blizzard"],["journal","Blizzard Encounter Journal"],
                ["capture","In-game capture"],["wowhead","Wowhead"],
                ["icyveins","Icy Veins"]];
  /* The five above are publishers and group by kind. EVERYONE ELSE groups by
     AUTHOR, which is the only key that holds: the creator kind used to be
     labelled "Tactyks" wholesale — fine while he was the only creator cited,
     and quietly wrong from the moment Method, Ready Check Pull, BrettStefani,
     JFunkGaming and WoW So Zesty arrived, all filed under his name. Grouping
     by author also reunites Method's written guides (k:"method") with its
     videos (k:"creator"), which a kind-based split had put in two sections
     with the same heading. Order is trust order: best tier first, Tactyks
     ahead of the rest of his tier because he is the creator this project
     trusts most, and wow.gg last by virtue of being tier 4. */
  const pubKinds=new Set(GROUPS.map(([k])=>k));
  const rest=Object.values(SOURCES).filter(s=>!pubKinds.has(s.k));
  const tierOf=a=>Math.min(...rest.filter(s=>s.a===a).map(s=>s.t||9));
  const LEAD=["Tactyks","Method"];
  const byAuthor=[...new Set(rest.map(s=>s.a))].sort((a,b)=>
    tierOf(a)-tierOf(b)||(LEAD.indexOf(a)<0?99:LEAD.indexOf(a))-(LEAD.indexOf(b)<0?99:LEAD.indexOf(b))
    ||a.localeCompare(b));
  const groups=[
    ...GROUPS.map(([k,label])=>[label,Object.values(SOURCES).filter(s=>s.k===k)]),
    ...byAuthor.map(a=>[a,rest.filter(s=>s.a===a)])
  ].filter(([,l])=>l.length);
  return `<div class="crumb"><a href="#/">Compendium</a> › <em>Sources</em></div>
  <h1>Where all of this came from</h1>
  <p class="lede">Every factual claim in this compendium carries a source mark. Hover one anywhere on the
  site to see who said it and when. The sources are listed here in the order they are trusted.</p>
  ${groups.map(([label,l])=>`<div class="sec"><h2>${esc(label)}</h2><span class="n">${l.length} item${l.length>1?"s":""}</span></div>
    <table><thead><tr><th>Item</th><th>Date</th></tr></thead><tbody>
    ${l.map(s=>`<tr><td>${s.u?`<a href="${s.u}" target="_blank" rel="noopener">${esc(s.b)}</a>`:esc(s.b)}${s.a&&s.a!==label?` <span class="n">${esc(s.a)}</span>`:""}</td><td class="mono">${esc(s.d||"—")}</td></tr>`).join("")}
    </tbody></table>`).join("")}
  <div class="sec"><h2>Settled</h2><span class="n">${RESOLVED.length}</span></div>
  ${RESOLVED.map(x=>`<div class="card" style="border-left:3px solid var(--tier1)"><h3>${esc(x.q)}</h3>
    <div class="meta" style="color:var(--tier1)">Answer: ${esc(x.won)} ${srcMark(x.by)} · ${esc(x.d)}</div>
    <p>${esc(x.p)}</p></div>`).join("")}
  <div class="sec"><h2>Open disputes</h2><span class="n">${DISPUTES.length}</span></div>
  ${DISPUTES.map(x=>`<div class="card acc"><h3>${esc(x.q)}</h3>
    <div class="meta"><a href="${x.dg==="raid"?"#/raid":`#/d/${x.dg}`}">${esc(x.dg==="raid"?RAID.name:D[x.dg].name)}</a></div>
    <p><b>Position A.</b> ${esc(x.a.p)}${srcMark(x.a.s)}</p>
    <p><b>Position B.</b> ${esc(x.b.p)}${srcMark(x.b.s)}</p>
    ${x.extra?`<p>${esc(x.extra)}</p>`:""}
    <p class="read">${esc(x.r)}</p></div>`).join("")}`;
}


function pGlossary(){
  /* Was derived from the alt fields, which have now been settled against
     Wowhead and removed from the cards. The wrong names still belong here —
     this is the page someone lands on having heard one in a video — so they
     are recorded explicitly, with the real name first. Every pair below was
     verified: the left column exists in Wowhead's database, the right one
     does not. */
  const conc=CORRECTIONS.slice();
  DUNGEONS.forEach(d=>{
    d.encounters.forEach(e=>{if(e.alt)conc.push([e.n,e.alt,d.short,"Boss"]);});
    d.areas.forEach(ar=>ar.mobs.forEach(m=>{if(m.alt)conc.push([m.n,m.alt,d.short,KINDS[m.k]]);}));
  });
  const decoder=[
   ["San'layn","Sand Lane, Sand Lion","Blood Death Knight hero tree"],
   ["Brutok","Brew talk","Voidscar Arena mini-boss — spelling confirmed by Blizzard hotfix"],
   ["Aegyra the Unyielding","Agyira","Voidscar Arena left-path mini-boss — confirmed by Blizzard hotfix"],
   ["Uncoil","uncoiled rides","The Writhing Coil's split adds — confirmed by Blizzard hotfix"],
   ["Mchimba the Embalmer","Machimbra","King's Rest second boss — confirmed by Blizzard hotfix"],
   ["Den of Nalorakk","Den of Neltharion, Dana Nalarak","The dungeon. Neltharion is a real, different place."],
   ["Zul'jan","Zul'jin","Altar of Fangs final boss. Zul'jin is his dead father — a real, different character."],
   ["Zul'jarra","Zandalari Forces","Zul'jan's sister and the Season 2 renown faction. Zandalari is a real, different troll faction."],
   ["Atal'Utek","Atal'Dazar","The 12.1 subzone. Atal'Dazar is an unrelated Battle for Azeroth dungeon."],
   ["Kystia Manaheart","Xy'exa Manahar, Kith'ix Manahar","Murder Row first boss. Manaheart is exactly what a captioner turns into Manahar."],
   ["Atroxus","Ataraxis, Ataraxus","Voidscar Arena second boss. The creator transcript uses several spellings within one video; the journal settles it."],
   ["Taz'Rah","Taz'grah, Ta'agra","Voidscar Arena first boss."],
   ["Geti'ikku, Cut of Death","Gatiku","The King's Rest two-hand sword. Confirmed by the published loot table."],
   ["Ikuzz the Light Hunter","Aku'mai the Light Hunter","Blinding Vale, right path. Aku'mai is a real Blackfathom Deeps name, which is exactly the substitution auto-captioning makes — but the in-game nameplate reads Ikuzz, which settles it."],
   ["Sszorak","Sorak, Sister Rag, Sisters of Elune, Coven","Auto-captions, raid guide videos"],
   ["Nek'zali the Soulcoiler","Nexxus-Asol, Exzolar the Soul Coiler","Auto-captions, raid guide videos"],
   ["Mor'zahi","Morzaki, Mor'oes, Ursoc","Auto-captions, raid guide videos"],
   ["Vashnik","Vashj'nir","Auto-captions, raid guide videos"],
   ["Scrollsage Iku","Ik'kris, Ik'kinu","Auto-captions, raid guide videos"],
   ["First Mate Nama","Na'masu, Namha, Namu","Auto-captions, raid guide videos"],
   ["Trader Gebbo","Gabbro, Gebo, GBO, Rider Gabbro","Auto-captions, raid guide videos"],
   ["Vexhul","Vexil, Vexoul, Vex Soul, Vex Hoole","Auto-captions, raid guide videos"],
   ["Ithraz","Itra's, Ithis, Itherael's","Auto-captions, raid guide videos"],
   ["Restless Amani","Restless Ammani, ammoniads","Auto-captions, raid guide videos"],
   ["Coalesced Venom","Collapsed Venoms, Toxic Telyu orbs","Auto-captions, raid guide videos"],
   ["Dreadmarch","Death March, Dread March","Auto-captions, raid guide videos"],
   ["Ula'tek's Presence","Mulatek's presence","Auto-captions, raid guide videos"]
  ];
  return `<div class="crumb"><a href="#/">Compendium</a> › <em>Glossary</em></div>
  <h1>Names, and the ones that are wrong everywhere</h1>
  <p class="lede">Most creator dungeon coverage is transcribed by automatic captioning, which mangles proper nouns —
  and the dangerous cases are the ones that land on a <em>different real thing</em>. If you have read a guide that
  sent you looking for Atal'Dazar or Zul'jin, this is why.</p>
  <div class="sec"><h2>Name concordance</h2><span class="n">${conc.length} entities named two ways</span></div>
  <p class="note">${ic("i-info",13)} <b>The boss portraits double as a spelling check.</b> Most carry a legible
  in-game nameplate, which is the game's own rendering of the name — and every one of them agrees with the Encounter
  Journal. <b>Ikuzz the Light Hunter</b> and <b>Charonus</b> are both readable on their own nameplates, which puts
  two of the noisiest naming questions beyond argument.</p>
  <p class="note"><b>Primary names now follow Blizzard's Encounter Journal.</b> Where a guide disagreed, the journal
  won — and it won almost every time against the auto-captioned spellings. The old forms are kept as aliases rather
  than deleted, because a reader arriving from any guide should still land on the right page, and because the record
  of what was wrong is itself useful. Search matches either form.</p>
  <table><thead><tr><th>Used here</th><th>Also written as</th><th>Where</th><th>Kind</th></tr></thead><tbody>
  ${conc.map(([a,b,d,k,u])=>`<tr><td class="mono"><b>${esc(a)}</b></td><td class="mono" style="color:var(--ink-muted)">${esc(b)}</td><td>${esc(d)}</td><td style="color:var(--ink-faint)">${esc(KINDS[k]||k.charAt(0).toUpperCase()+k.slice(1))}${u?` <span class="unv" title="Neither spelling appears in Wowhead\u2019s database yet, so this pair is recorded but not settled.">unverified</span>`:""}</td></tr>`).join("")}
  </tbody></table>
  <div class="sec"><h2>Caption decoder</h2><span class="n">${decoder.length} known manglings</span></div>
  <table><thead><tr><th>Correct</th><th>Seen as</th><th>Note</th></tr></thead><tbody>
  ${decoder.map(([a,b,c])=>`<tr><td class="mono"><b>${esc(a)}</b></td><td class="mono" style="color:var(--ink-faint)">${esc(b)}</td><td>${esc(c)}</td></tr>`).join("")}
  </tbody></table>
  <div class="sec"><h2>How damage is described</h2><span class="n">Why there are no numbers</span></div>
  <p class="note">Blizzard's Encounter Journal publishes exact damage figures, and this compendium deliberately does
  not repeat them. Those numbers are pinned to a single difficulty. In Mythic+ everything scales with key level and
  affixes, so quoting "533,403 Physical" would be precise and wrong the moment you leave the key it was measured in.</p>
  <p class="note">What <em>is</em> fixed: percentages, durations, radii, stack thresholds, energy costs and health
  thresholds. Those are quoted exactly throughout — an 80% healing reduction is 80% at every key level. Raw damage,
  healing and absorb values are translated to a consistent six-step scale instead. The journal's figures are still
  doing work, because they are internally comparable: the ranking between abilities is real even when the absolute
  numbers are not.</p>
  <table><thead><tr><th>Word</th><th>Means</th></tr></thead><tbody>
  <tr><td class="mono"><b>Light</b></td><td>Chip damage. Dangerous only in volume or stacked with something else.</td></tr>
  <tr><td class="mono"><b>Moderate</b></td><td>Noticeable. A healer absorbs it without changing plan.</td></tr>
  <tr><td class="mono"><b>Significant</b></td><td>Worth a cooldown if it lands on someone already hurt.</td></tr>
  <tr><td class="mono"><b>Heavy</b></td><td>Plan for it. A defensive, a pre-heal, or a dodge.</td></tr>
  <tr><td class="mono"><b>Very heavy</b></td><td>Among the biggest hits in the pool. Do not eat it unprepared.</td></tr>
  <tr><td class="mono"><b>Massive</b></td><td>The top band. Untanked or unmitigated, this is how runs end.</td></tr>
  </tbody></table>
  <div class="sec"><h2>How bad is it</h2><span class="n">Two questions, kept apart</span></div>
  <p class="note">These used to be one number and it said nothing. <b>Severity</b> grades what a single failure
  <em>costs</em>; <b>One-shot</b> and <b>Wipe</b> say whether the mechanic <em>kills</em>. They are independent — a
  Punishing mechanic can still one-shot you, and plenty of Run-enders never kill anybody outright.</p>
  <table><thead><tr><th>Mark</th><th>Means</th></tr></thead><tbody>
  ${[3,2,1].map(k=>`<tr><td>${k>=2?`<span class="sevc s${k}">${esc(SEVS[k][0])}</span>`
    :`<span class="n">unmarked</span>`}</td><td>${esc(SEVS[k][1])}</td></tr>`).join("")}
  ${Object.keys(LETHAL).map(k=>`<tr><td><span class="lethal l-${k}">${ic("i-skull",11)}${esc(LETHAL[k][0])}</span></td>
    <td>${esc(LETHAL[k][1])}</td></tr>`).join("")}
  </tbody></table>
  <p class="note">${ic("i-info",13)} Given a high enough key or a bad enough pull almost anything can kill somebody,
  so the bar for the two skull marks is deliberately high and deliberately checkable: the ability's own sourced text
  has to say it kills a player outright or ends the group. Compounds — <em>lethal if it overlaps something else</em>,
  <em>a string of avoids is what makes him lethal</em> — stay unmarked at the severity they earn. A mark that quietly
  meant "probably quite bad" would be a mark nobody reads twice. Where the lethality only exists on Heroic, the badge
  says so.</p>
  <div class="sec"><h2>Tag vocabulary</h2><span class="n">What the chips mean</span></div>
  <p class="note">Every ability carries chips describing what it is and what stops it. Both vocabularies are closed
  sets, which is what makes the <a href="#/mechanics">mechanics index</a> possible.</p>
  <div class="split"><div class="card"><h3>What it is</h3><div class="tags" style="margin-top:.6rem">
    ${Object.keys(TAGS).filter(k=>!LETHAL[k]).map(k=>chip(k,TAGS)).join("")}</div></div>
  <div class="card"><h3>What stops it</h3><div class="tags" style="margin-top:.6rem">
    ${Object.keys(CTRS).map(k=>chip(k,CTRS,"c-counter")).join("")}</div></div></div>`;
}

/* ═══ ROUTER ═════════════════════════════════════════════════════════ */
