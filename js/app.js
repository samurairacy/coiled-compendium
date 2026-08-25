/* js/app.js — router, facet delegation, search, boot
   Load order: data-shared → data-mplus → data-raid → render → app.
   All five load with `defer`, which preserves this order. */

function route(){
  /* the hash may carry a query: facet state on the indexes, difficulty and
     role lens on boss/dungeon pages */
  const [pathStr,qs]=(location.hash||"#/").slice(2).split("?");
  const h=pathStr.split("/").filter(Boolean);
  const key=h[0]||"home";
  if(qs!==undefined&&key==="mechanics") facetsFromQS(qs);
  if(qs!==undefined&&key==="loot") lfacetsFromQS(qs);
  if(qs!==undefined&&(key==="r"||key==="d")){
    const rq=new URLSearchParams(qs).get("r");
    if(rq!==null){ROLEF=["tank","healer","mdps","rdps"].includes(rq)?rq:null;
      try{ROLEF?localStorage.setItem("cc-role",ROLEF):localStorage.removeItem("cc-role");}catch(e){}}
    /* which author's pull-by-pull, if the link carried one. Read but never
       stored: this is a per-run choice, not a preference. */
    const tq=new URLSearchParams(qs).get("rt");
    if(tq!==null)ROUTEF=/^[a-z]{2,8}$/.test(tq)?tq:null;
  }
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
    document.body.setAttribute("data-boss",h[1]);
    /* ?d=h deep-links a difficulty; otherwise the sticky choice stands */
    const dq=qs!==undefined&&new URLSearchParams(qs).get("d");
    if(dq&&RAID.difficulties.includes(dq)){DIFF=dq;try{localStorage.setItem("cc-diff",DIFF);}catch(e){}}
    html=pBoss(h[1],h[2]);}
  else if(key==="mechanics"){page="mechanics";html=pMechanics();}
  else if(key==="loot"){page="loot";html=pLoot();}
  /* wishlists: the index, a share-link import preview, or one list */
  else if(key==="wl"&&h[1]==="import"){page="wl";html=pWlImport(qs||"");}
  else if(key==="wl"&&h[1]){page="wl";html=pWlOne(h[1]);}
  else if(key==="wl"){page="wl";html=pWl();}
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
  /* The dungeon switcher already parks under the header; the tab bar has to
     park under BOTH, and its offset is whatever the switcher measures at this
     font size and zoom. Measured rather than guessed — a hard-coded number is
     a gap or an overlap the first time someone changes their browser's text
     size. Pages with no switcher get 0 and the bar parks straight under the
     header. */
  const sw=el.querySelector(".dswitch");
  document.documentElement.style.setProperty("--dsw",(sw?sw.offsetHeight:0)+"px");
  /* Fill any MDT version badges this paint created. Fire and forget: it
     must never block the paint, and silence is the right outcome if the
     undocumented endpoint it depends on is gone. */
  if(typeof wagoVersions==="function")wagoVersions();
  /* which nav entry owns this page: module pages roll up to their module */
  const navKey=(key==="d"||key==="dungeons"||key==="mplus"||key==="routes")?"mplus"
              :(key==="raid"||key==="r")?"raid":key;
  $$("#nav a").forEach(a=>{
    if(a.dataset.nav===navKey) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");});
  document.title=(page==="dungeon"?D[h[1]].name+" — "
    :page==="boss"?RB[h[1]].n+" — "
    :page==="raid"?RAID.name+" — "
    :page==="prep"?"Raid Prep — "
    :page==="wl"?((h[1]&&h[1]!=="import"&&wlGet(h[1])?wlGet(h[1]).name:"Wishlists")+" — ")
    :page!=="home"?key[0].toUpperCase()+key.slice(1)+" — ":"")+"The Coiled Compendium";
  window.scrollTo({top:0,behavior:"instant"});
}
addEventListener("hashchange",route);

/* ── facet state ⇄ URL ── a filtered view is a thing worth sharing, so the
   filters live in the hash query: #/mechanics?from=r&ctr=poison. Written with
   replaceState so painting never triggers a re-route; read only when a query
   is actually present, so plain #/mechanics keeps whatever you had. Sets are
   dot-joined — the values are slugs, and dots survive URLs unencoded. */
/* Commas and slashes are legal unescaped in a query component, and a facet URL
   is meant to be pasted into chat — spec=Hunter/Survival reads, %2F does not. */
const qsWrite=(base,p)=>{const q=p.toString().replace(/%2C/g,",").replace(/%2F/g,"/");
  history.replaceState(null,"","#/"+base+(q?"?"+q:""));};
function mechQS(){const p=new URLSearchParams();
  if(FACETS.mod)p.set("from",FACETS.mod);
  if(FACETS.dg)p.set("dg",FACETS.dg);
  if(FACETS.role)p.set("role",FACETS.role);
  if(FACETS.sev)p.set("sev",FACETS.sev);
  if(FACETS.tag.size)p.set("tag",[...FACETS.tag].join("."));
  if(FACETS.ctr.size)p.set("ctr",[...FACETS.ctr].join("."));
  qsWrite("mechanics",p);}
function facetsFromQS(qs){const p=new URLSearchParams(qs);
  const set=k=>new Set((p.get(k)||"").split(".").filter(Boolean));
  FACETS={tag:set("tag"),ctr:set("ctr"),role:p.get("role")||null,
    sev:p.get("sev")?+p.get("sev"):null,dg:p.get("dg")||null,mod:p.get("from")||null};}
function lootQS(){const p=new URLSearchParams();
  if(LFACETS.mod)p.set("from",LFACETS.mod);
  if(LFACETS.dg)p.set("dg",LFACETS.dg);
  if(LFACETS.big)p.set("big",LFACETS.big);
  if(LFACETS.fx)p.set("fx",LFACETS.fx);
  for(const k of ["sl","ty","p","x","ro"]) if(LFACETS[k].size)p.set(k,[...LFACETS[k]].join("."));
  if(LFACETS.spec)p.set("spec",LFACETS.spec);
  qsWrite("loot",p);}
function lfacetsFromQS(qs){const p=new URLSearchParams(qs);
  const set=k=>new Set((p.get(k)||"").split(".").filter(Boolean));
  LFACETS={sl:set("sl"),ty:set("ty"),p:set("p"),x:set("x"),ro:set("ro"),
    spec:p.get("spec")||null,
    big:p.get("big")||null,dg:p.get("dg")||null,fx:p.get("fx")||null,mod:p.get("from")||null};}



/* ' MDT ROUTE STRINGS ' Fetched from each author's own published source on
   demand, never stored here. Three providers, three formats:

     wago  one page per route, structured API, in Wago's published contract
     sha   one Google Sheet row per dungeon, with a Last Updated column
     yoda  a Google Doc heading followed by the string

   The last is the fragile one. Yoda types King's Rest with a CURLY apostrophe;
   matching it naively missed the heading and silently filed his King's Rest
   route under Temple of Sethraliss. Nobody would have seen an error, they
   would just have imported the wrong dungeon. Hence: normalise punctuation,
   bind each string to the heading that most recently matched, never overwrite
   a dungeon already found, and validate the result before it can reach a
   clipboard.

   Every failure is reported ON the button, and every card carries the author's
   own link, which is the thing that still works when none of this does. */
/* Which author's pull-by-pull is showing. URL state so a shared link keeps
   it, but deliberately NOT persisted: which route you want is a per-run
   choice, unlike the role lens or difficulty which describe who you are. */
let ROUTEF=null;
const WAGO="https://data.wago.io";
const RDOC={};                       /* provider key -> parsed {dungeonId:string} */

/* Curly quotes, collapsed whitespace, lower case. Anything that stops two
   humans typing the same dungeon name from being two different strings. */
const rnorm=s=>String(s||"").replace(/[\u2018\u2019\u02BC`']/g," ")
  .replace(/[^a-z0-9]+/gi," ").trim().toLowerCase();

const rmatch=label=>{const L=rnorm(label);
  if(!L||L.length>60)return null;
  for(const id in RALIAS)
    if(RALIAS[id].some(a=>L===rnorm(a)||L.startsWith(rnorm(a))))return id;
  return null;};

const isRoute=s=>/^!/.test(s)&&s.length>=40;

/* Sha's sheet. Only the EARLY SEASON block ' his cover sheet reserves the
   pushing routes for Patreon supporters, and an export exposing them is not
   the same as him publishing them here. */
function parseSha(csv){
  const out={}; let block=null, cur=null;
  csv.split(/\r?\n/).forEach(line=>{
    /* good-enough CSV: fields may be quoted and contain commas */
    const cells=(line.match(/("([^"]|"")*"|[^,]*)(,|$)/g)||[])
      .map(c=>c.replace(/,$/,"").replace(/^"|"$/g,"").replace(/""/g,'"').trim());
    const head=rnorm(cells[0]||"");
    if(head.startsWith("early season"))  {block="early"; return;}
    if(head.startsWith("updated")||head.startsWith("advanced routes")){block="other"; return;}
    if(block!=="early")return;
    const m=cells[0]?rmatch(cells[0]):null;
    if(m)cur=m;
    cells.forEach(c=>{if(cur&&isRoute(c)&&!out[cur])out[cur]=c;});
  });
  return out;
}

/* Yoda's doc: a heading line, then the string. A heading that matches nothing
   leaves cur alone, so his "MDT IS BUGGED" aside does not break the binding. */
function parseYoda(txt){
  const out={}; let cur=null;
  txt.split(/\r?\n/).map(l=>l.trim()).forEach(l=>{
    if(!l)return;
    if(isRoute(l)){ if(cur&&!out[cur])out[cur]=l; return; }
    const m=rmatch(l); if(m)cur=m;
  });
  return out;
}

async function routeString(kind,dungeonId,slug){
  const src=ROUTESRC[kind];
  if(kind==="wago"){
    const r=await fetch(src.data(slug),{cache:"no-store"});
    if(!r.ok)throw new Error("HTTP "+r.status);
    const s=(await r.text()).trim();
    if(!isRoute(s))throw new Error("not an import string");
    return s;
  }
  if(!RDOC[kind]){
    /* no-store like the Wago call: if the author edits their document we want
       the edit, not whatever the browser kept. RDOC still caches the PARSED
       result for this page session so eight dungeons cost one request. */
    const r=await fetch(src.data(),{cache:"no-store"});
    if(!r.ok)throw new Error("HTTP "+r.status);
    const body=await r.text();
    RDOC[kind]=(kind==="sha")?parseSha(body):parseYoda(body);
  }
  const s=RDOC[kind][dungeonId];
  if(!s)throw new Error("no route for this dungeon");
  return s;
}

/* Clipboard needs a secure context AND a user gesture, and may still be
   refused. Falling back to a selected textarea is uglier but never a dead end. */
async function toClipboard(text){
  try{
    if(navigator.clipboard&&window.isSecureContext){
      await navigator.clipboard.writeText(text); return "copied";
    }
  }catch(e){/* refused or unavailable */}
  try{
    const ta=document.createElement("textarea");
    ta.value=text; ta.setAttribute("readonly","");
    ta.style.cssText="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);"+
      "width:min(90vw,640px);height:8rem;z-index:200";
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok=document.execCommand&&document.execCommand("copy");
    if(ok){ta.remove(); return "copied";}
    ta.addEventListener("blur",()=>ta.remove(),{once:true});
    return "manual";
  }catch(e){ return "failed"; }
}

async function routeCopy(btn){
  if(btn.dataset.busy)return;
  const [kind,dungeonId,slug]=btn.dataset.route.split("|");
  const lab=btn.querySelector("span");
  btn.dataset.busy="1"; const was=lab.textContent;
  const done=(msg,cls)=>{lab.textContent=msg; btn.className="wbtn "+(cls||"");
    setTimeout(()=>{lab.textContent=was; btn.className="wbtn"; delete btn.dataset.busy;},3600);};
  lab.textContent="Fetching\u2026";
  try{
    const s=await routeString(kind,dungeonId,slug||"");
    const how=await toClipboard(s);
    if(how==="copied")done("Copied \u2014 paste into MDT","ok");
    else if(how==="manual")done("Select and copy the box","warn");
    else done("Could not copy \u2014 use the link","warn");
  }catch(err){
    const why=/no route/.test(err.message)?"Not in their document \u2014 use the link"
                                          :"Unreachable \u2014 use the link";
    done(why,"warn");
  }
}

/* Wago version badges. One request covers all eight routes. Fire and forget:
   never blocks paint, and total silence on failure ' an absent badge is the
   correct outcome, not an error worth reporting. This rides the UNDOCUMENTED
   /api/check, which is why nothing else may depend on it. */
let WAGOVER=null;
async function wagoVersions(){
  const slots=[...document.querySelectorAll("[data-wagover]")];
  if(!slots.length)return;
  if(!WAGOVER){
    const ids=[...new Set(DUNGEONS.flatMap(d=>(d.routes||[])
      .filter(r=>r.k==="wago"&&r.id).map(r=>r.id)))];
    if(!ids.length)return;
    try{
      const r=await fetch(WAGO+"/api/check?ids="+ids.join(","));
      if(!r.ok)return;
      WAGOVER={};
      (await r.json()).forEach(x=>{WAGOVER[x.slug]={v:x.versionString,m:x.modified};});
    }catch(e){ return; }
  }
  slots.forEach(el=>{
    const v=WAGOVER[el.dataset.wagover]; if(!v)return;
    /* versionString arrives as "1.0.1-2" ' the suffix is Wago's internal
       revision counter and means nothing to a reader. */
    const ver=String(v.v||"").split("-")[0];
    const d=v.m?new Date(v.m):null;
    const when=d&&!isNaN(d)?d.toLocaleDateString(undefined,{day:"numeric",month:"short"}):"";
    el.textContent="v"+ver+(when?" \u00b7 updated "+when:"");
  });
}

/* facet clicks — delegated, so re-renders never lose the handler */
document.addEventListener("click",e=>{
  /* In-page jumps. A bare href="#id" CANNOT work on this site: the hash is
     the route, so setting it sends route() looking for a page called "id",
     which lands you on home. Anything jumping within the current page uses
     data-goto and is scrolled here instead, leaving the hash alone. */
  const rs=e.target.closest("[data-rt]");
  if(rs){e.preventDefault();ROUTEF=rs.dataset.rt;
    const h=(location.hash||"").slice(2).split("?")[0].split("/").filter(Boolean);
    if(h[0]==="d"&&D[h[1]]){
      history.replaceState(null,"","#/d/"+h[1]+"/route?rt="+ROUTEF+(ROLEF?"&r="+ROLEF:""));
      $("#p-dungeon").innerHTML=pDungeon(h[1],"route");}
    return;}
  const wg=e.target.closest("[data-route]");
  if(wg){e.preventDefault();routeCopy(wg);return;}
  const gt=e.target.closest("[data-goto]");
  if(gt){const el=$("#"+gt.dataset.goto);
    if(el){e.preventDefault();
      const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({behavior:still?"auto":"smooth",block:"start"});
      /* focus follows the scroll or the keyboard user is left behind at
         the top of the page; -1 keeps it out of the tab order after. */
      el.setAttribute("tabindex","-1");el.focus({preventScroll:true});}
    return;}
  /* difficulty toggle and role lens — anywhere either renders. Persist,
     reflect both in the URL, repaint the current page in place. */
  const lensQS=()=>{const q=[];
    if(DIFF!=="n")q.push("d="+DIFF);
    if(ROLEF)q.push("r="+ROLEF);
    return q.length?"?"+q.join("&"):"";};
  const repaint=()=>{
    const h=(location.hash||"").slice(2).split("?")[0].split("/").filter(Boolean);
    if(h[0]==="r"&&RB[h[1]]){
      history.replaceState(null,"","#/r/"+h[1]+lensQS());
      $("#p-boss").innerHTML=pBoss(h[1],h[2]);
    }else if(h[0]==="d"&&D[h[1]]){
      const roleOnly=ROLEF?"?r="+ROLEF:"";
      history.replaceState(null,"","#/d/"+h[1]+"/"+(h[2]||"overview")+roleOnly);
      $("#p-dungeon").innerHTML=pDungeon(h[1],h[2]);
    }};
  const dseg=e.target.closest("[data-diff]");
  if(dseg){
    const d=dseg.dataset.diff;
    if(RAID.difficulties.includes(d)&&d!==DIFF){
      DIFF=d; try{localStorage.setItem("cc-diff",DIFF);}catch(err){}
      repaint();
    }
    return;
  }
  const rseg=e.target.closest("[data-role]");
  if(rseg){
    const rv=rseg.dataset.role||null;
    if(rv!==ROLEF){
      ROLEF=rv;
      try{ROLEF?localStorage.setItem("cc-role",ROLEF):localStorage.removeItem("cc-role");}catch(err){}
      repaint();
    }
    return;
  }
  /* Loot reuses .fopt for styling but keys off data-lf, so the mechanics branch
     must match on data-f or it swallows loot clicks and writes FACETS[undefined]. */
  const f=e.target.closest(".fopt[data-f]");
  if(f&&!f.disabled){
    const {f:key,v}=f.dataset;
    if(FACETS[key] instanceof Set){FACETS[key].has(v)?FACETS[key].delete(v):FACETS[key].add(v);}
    /* sev is stored as a NUMBER and the dataset hands back a STRING, so the
       old `FACETS[key]===v` was 3==="3" — never true, and the severity buttons
       could be swapped but never switched off. Coerce first, then compare. */
    else{const nv=key==="sev"?+v:v; FACETS[key]=FACETS[key]===nv?null:nv;}
    paintMech(); mechQS(); return;
  }
  if(e.target.closest("#clearf")){FACETS={tag:new Set(),ctr:new Set(),role:null,sev:null,dg:null,mod:null};
    paintMech(); mechQS(); return;}
  const l=e.target.closest("[data-lf]");
  if(l&&!l.disabled){
    const {lf:key,v}=l.dataset;
    if(LFACETS[key] instanceof Set){LFACETS[key].has(v)?LFACETS[key].delete(v):LFACETS[key].add(v);}
    else LFACETS[key]=LFACETS[key]===v?null:v;
    paintLoot(); lootQS(); return;
  }
  if(e.target.closest("#clearl")){LFACETS={sl:new Set(),ty:new Set(),p:new Set(),x:new Set(),ro:new Set(),big:null,spec:null,dg:null,fx:null,mod:null};
    paintLoot(); lootQS();}
});

/* ═══ SEARCH ═════════════════════════════════════════════════════════ */
const INDEX=[
 /* the code rides in the title so the matcher finds it: people search AOF */
 ...DUNGEONS.map(d=>({t:d.code?`${d.name} (${d.code})`:d.name,m:`Dungeon · ${d.origin} · ${d.bosses} bosses`,h:`#/d/${d.id}`})),
 /* ability rows carry their module: dungeon rows point into the dungeon,
    raid rows into the boss page */
 ...ALL.map(x=>x.mod==="r"
   ?{t:x.a.n,m:`${x.src} · ${x.kind} · ${RAID.name}`,h:`#/r/${x.b.id}`}
   :{t:x.a.n,m:`${x.a.alt?"also "+x.a.alt+" · ":""}${x.src} · ${x.kind} · ${x.d.name}`,h:`#/d/${x.d.id}/${x.kind==="Boss"?"bosses":"trash"}`}),
 ...DUNGEONS.flatMap(d=>d.loot?d.loot.i.map(x=>({t:x.n,m:`${x.ty} · ${x.sl} · ${d.name}`,h:`#/d/${d.id}/loot`})):[]),
 ...RAID.bosses.flatMap(b=>(b.loot||[]).map(x=>({t:x.n,m:`${x.ty} · ${x.sl} · ${b.n} · ${RAID.name}`,h:`#/r/${b.id}/loot`}))),
 ...DUNGEONS.flatMap(d=>[...d.areas.flatMap(a=>a.mobs),...d.encounters].flatMap(m=>{
   const e={t:m.n,m:`${KINDS[m.k]||"Boss"} · ${d.name}`,h:`#/d/${d.id}/${m.o?"bosses":"trash"}`};
   return m.alt?[e,{t:m.alt,m:`Alternate name for ${m.n} · ${d.name}`,h:e.h}]:[e];})),
 ...RAID.bosses.map(b=>({t:b.n,m:`Boss ${b.o} of ${RAID.bosses.length} · ${RAID.name}`,h:`#/r/${b.id}`})),
 {t:RAID.name,m:`Raid · ${RAID.bosses.length} bosses · Normal and Heroic`,h:"#/raid"},
 {t:"Raid prep",m:"Lockout, schedule, what to bring",h:"#/raid/prep"},
 ...DUNGEONS.flatMap(d=>d.buffs.map(b=>({t:b.n,m:`Interactable · ${d.name}`,h:`#/d/${d.id}`}))),
 {t:"Wishlists",m:"Your lists · keys to run · voidcore odds",h:"#/wl"},
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
/* Context orders, never filters: inside the raid module, raid results rise;
   elsewhere they sink. A raid ability is always findable from a dungeon page
   — it just doesn't outrank the dungeon's own. Sort is stable, so ties keep
   index order. (#/r/ not #/r — "#/routes" is not a raid context.) */
const isRaidHref=h=>h.startsWith("#/r/")||h.startsWith("#/raid");
function runSearch(){
  const q=$("#q").value.trim().toLowerCase();
  const r=q?INDEX.filter(i=>i.t.toLowerCase().includes(q)||i.m.toLowerCase().includes(q)).slice(0,40):INDEX.slice(0,10);
  const inRaid=isRaidHref(location.hash);
  r.sort((a,b)=>(isRaidHref(b.h)===inRaid)-(isRaidHref(a.h)===inRaid));
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
