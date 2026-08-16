/* js/app.js — router, facet delegation, search, boot
   Load order: data-shared → data-mplus → data-raid → render → app.
   All five load with `defer`, which preserves this order. */

let ROLE=null;
function route(){
  const h=(location.hash||"#/").slice(2).split("/").filter(Boolean);
  const key=h[0]||"home";
  $$(".page").forEach(p=>p.classList.remove("on"));
  document.body.removeAttribute("data-dungeon");
  document.body.removeAttribute("data-raid");
  document.body.removeAttribute("data-boss");
  let page="home",html="";
  if(key==="dungeons"||key==="mplus"){page="dungeons";html=pDungeons();}
  else if(key==="d"&&D[h[1]]){page="dungeon";document.body.setAttribute("data-dungeon",h[1]);html=pDungeon(h[1],h[2]);}
  else if(key==="raid"&&h[1]==="prep"){page="prep";document.body.setAttribute("data-raid","");html=pPrep();}
  else if(key==="raid"){page="raid";document.body.setAttribute("data-raid","");html=pRaid();}
  else if(key==="r"&&RB[h[1]]){page="boss";document.body.setAttribute("data-raid","");
    document.body.setAttribute("data-boss",h[1]);html=pBoss(h[1],h[2]);}
  else if(key==="mechanics"){page="mechanics";html=pMechanics();}
  else if(key==="loot"){page="loot";html=pLoot();}
  else if(key==="routes"){page="routes";html=pRoutes();}
  else if(key==="season"){page="season";html=pSeason();}
  else if(key==="sources"){page="sources";html=pSources();}
  else if(key==="glossary"){page="glossary";html=pGlossary();}
  else{page="home";html=pHome();}
  feedStop();
  const el=$(`#p-${page}`); el.innerHTML=html; el.classList.add("on");
  if(page==="mechanics") feedStart("#mfeed",MRES,mechRow,mechNote);
  else if(page==="loot") feedStart("#lfeed",LRES,lootIdxRow,lootNote);
  const cur=el.querySelector(".dswitch a[aria-current]");
  if(cur&&cur.parentElement.scrollWidth>cur.parentElement.clientWidth)
    cur.parentElement.scrollLeft=cur.offsetLeft-cur.parentElement.clientWidth/2+cur.offsetWidth/2;
  /* which nav entry owns this page: module pages roll up to their module */
  const navKey=(key==="d"||key==="dungeons"||key==="mplus"||key==="routes")?"mplus"
              :(key==="raid"||key==="r")?"raid":key;
  $$("#nav a").forEach(a=>{
    if(a.dataset.nav===navKey) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");});
  document.title=(page==="dungeon"?D[h[1]].name+" — "
    :page==="boss"?RB[h[1]].n+" — "
    :page==="raid"?RAID.name+" — "
    :page==="prep"?"Raid Prep — "
    :page!=="home"?key[0].toUpperCase()+key.slice(1)+" — ":"")+"The Coiled Compendium";
  window.scrollTo({top:0,behavior:"instant"});
}
addEventListener("hashchange",route);

/* facet clicks — delegated, so re-renders never lose the handler */
document.addEventListener("click",e=>{
  /* Loot reuses .fopt for styling but keys off data-lf, so the mechanics branch
     must match on data-f or it swallows loot clicks and writes FACETS[undefined]. */
  const f=e.target.closest(".fopt[data-f]");
  if(f&&!f.disabled){
    const {f:key,v}=f.dataset;
    if(FACETS[key] instanceof Set){FACETS[key].has(v)?FACETS[key].delete(v):FACETS[key].add(v);}
    else FACETS[key]=FACETS[key]===v?null:(key==="sev"?+v:v);
    paintMech(); return;
  }
  if(e.target.closest("#clearf")){FACETS={tag:new Set(),ctr:new Set(),role:null,sev:null,dg:null};
    paintMech(); return;}
  const l=e.target.closest("[data-lf]");
  if(l&&!l.disabled){
    const {lf:key,v}=l.dataset;
    if(LFACETS[key] instanceof Set){LFACETS[key].has(v)?LFACETS[key].delete(v):LFACETS[key].add(v);}
    else LFACETS[key]=LFACETS[key]===v?null:v;
    paintLoot(); return;
  }
  if(e.target.closest("#clearl")){LFACETS={sl:new Set(),ty:new Set(),p:new Set(),x:new Set(),ro:new Set(),big:null,dg:null,fx:null};
    paintLoot();}
});

/* ═══ SEARCH ═════════════════════════════════════════════════════════ */
const INDEX=[
 ...DUNGEONS.map(d=>({t:d.name,m:`Dungeon · ${d.origin} · ${d.bosses} bosses`,h:`#/d/${d.id}`})),
 ...ALL.map(x=>({t:x.a.n,m:`${x.a.alt?"also "+x.a.alt+" · ":""}${x.src} · ${x.kind} · ${x.d.name}`,h:`#/d/${x.d.id}/${x.kind==="Boss"?"bosses":"trash"}`})),
 ...DUNGEONS.flatMap(d=>d.loot?d.loot.i.map(x=>({t:x.n,m:`${x.ty} · ${x.sl} · ${d.name}`,h:`#/d/${d.id}/loot`})):[]),
 ...DUNGEONS.flatMap(d=>[...d.areas.flatMap(a=>a.mobs),...d.encounters].flatMap(m=>{
   const e={t:m.n,m:`${KINDS[m.k]||"Boss"} · ${d.name}`,h:`#/d/${d.id}/${m.o?"bosses":"trash"}`};
   return m.alt?[e,{t:m.alt,m:`Alternate name for ${m.n} · ${d.name}`,h:e.h}]:[e];})),
 ...DUNGEONS.flatMap(d=>d.buffs.map(b=>({t:b.n,m:`Interactable · ${d.name}`,h:`#/d/${d.id}`}))),
 {t:"Every poison in the season",m:"Mechanics index · filtered",h:"#/mechanics"},
 {t:"Source ledger",m:"Who said what, and when",h:"#/sources"},
 {t:"Caption decoder",m:"Glossary · names that are wrong everywhere",h:"#/glossary"}
];
/* The wrong names were the whole reason someone reaches for search: they heard
   "Luxay" in a video and it is spelled Lucsei here. That used to work because
   every entity carried its rival spelling in `alt` and the index read it. The
   alts are gone — settled against Wowhead — so the concordance has to carry
   the weight instead, or a wrong name silently finds nothing and the glossary's
   promise that search matches either form becomes untrue.
   Each alias borrows the href of the real entry rather than recomputing one,
   so an alias can never point somewhere the canonical name doesn't. */
CORRECTIONS.forEach(([right,wrong,d])=>{
  const hit=INDEX.find(i=>i.t===right);
  if(hit)INDEX.push({t:wrong,m:`Named ${right} here · ${d}`,h:hit.h});
});
let SEL=0;
function runSearch(){
  const q=$("#q").value.trim().toLowerCase();
  const r=q?INDEX.filter(i=>i.t.toLowerCase().includes(q)||i.m.toLowerCase().includes(q)).slice(0,40):INDEX.slice(0,10);
  SEL=0;
  $("#qr").innerHTML=r.length?r.map((i,n)=>`<a href="${i.h}" class="${n===0?"sel":""}"><div class="rt">${esc(i.t)}</div><div class="rm">${esc(i.m)}</div></a>`).join("")
    :`<div class="ovempty">Nothing matches "${esc(q)}". Try an ability name, a mob, or a dungeon.</div>`;
}
function openSearch(){$("#ov").classList.add("on");$("#q").value="";runSearch();$("#q").focus();}
function closeSearch(){$("#ov").classList.remove("on");}
$("#opensearch").addEventListener("click",openSearch);
$("#q").addEventListener("input",runSearch);
$("#ov").addEventListener("click",e=>{if(e.target.id==="ov")closeSearch();});
$("#qr").addEventListener("click",closeSearch);
addEventListener("keydown",e=>{
  const open=$("#ov").classList.contains("on");
  if(!open&&(e.key==="/"||(e.key==="k"&&(e.metaKey||e.ctrlKey)))&&!/input|textarea/i.test(e.target.tagName)){e.preventDefault();openSearch();return;}
  if(!open)return;
  if(e.key==="Escape"){closeSearch();return;}
  const items=$$("#qr a"); if(!items.length)return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();
    items[SEL]?.classList.remove("sel");
    SEL=(SEL+(e.key==="ArrowDown"?1:-1)+items.length)%items.length;
    items[SEL].classList.add("sel"); items[SEL].scrollIntoView({block:"nearest"});}
  if(e.key==="Enter"){e.preventDefault();items[SEL]?.click();closeSearch();}
});

route();
