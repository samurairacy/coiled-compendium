/* js/wishlist.js — wishlists over the loot data.
   Load order: data-shared → data-mplus → data-raid → render → wishlist → app.
   Uses render.js helpers at call time (route() runs after every script parses),
   and app.js routes into the three page functions at the bottom.

   The model, in one breath: a wishlist is a shopping list pinned to this
   browser, and the insights are where to shop. Items serialize on Wowhead ids
   (check.py asserts every loot row carries one, uniquely), which survive the
   renames that names don't. Sharing is SENDING A COPY — a snapshot in a URL,
   never a live link — so there is no sync to reason about and the link doubles
   as the way to move a list to your own phone. */

/* ── store ─────────────────────────────────────────────────────────────────
   One localStorage key, versioned, read lazily and behind try/catch: a corrupt
   blob degrades to an explained empty state on #/wl and can never brick the
   router. Nothing here runs at parse time except the id index. */
const WLKEY="cc-wl";
let WLS=null, WLBAD=false, WLUNDO=null, WLIMP=null, WLTMR=null;
function wlLoad(){
  if(WLS) return WLS;
  try{
    const raw=localStorage.getItem(WLKEY);
    if(raw){
      const p=JSON.parse(raw);
      if(p&&p.v===1&&Array.isArray(p.lists)){WLS=p; return WLS;}
      WLBAD=true;
    }
  }catch(e){WLBAD=true;}
  WLS={v:1,active:null,lists:[]};
  return WLS;
}
function wlSave(){try{localStorage.setItem(WLKEY,JSON.stringify(WLS));}catch(e){}}
const wlGet=k=>wlLoad().lists.find(l=>l.k===k);
const wlActive=()=>wlGet(wlLoad().active)||wlLoad().lists[0]||null;
function wlCreate(name,cls){
  const s=wlLoad();
  const l={k:"",name:name||"My wishlist",cls:cls||null,items:[]};
  do{l.k=Math.random().toString(36).slice(2,6);}while(s.lists.some(x=>x.k===l.k));
  s.lists.push(l); s.active=l.k; wlSave(); return l;
}
const wlHas=(l,id)=>l.items.some(x=>x.id===id);

/* id → LOOTALL entry. Built once; LOOTALL exists because render.js loads first. */
const WLIDX={};
LOOTALL.forEach(o=>{WLIDX[o.i.id]=o;});

/* Resolve a list against the data. An id that no longer resolves is a
   TOMBSTONE — kept, named, excluded from insights, never silently dropped. */
function wlResolve(l){
  const live=[],dead=[];
  l.items.forEach(e=>{const o=WLIDX[e.id]; o?live.push({id:e.id,star:!!e.star,o}):dead.push(e);});
  return {live,dead};
}

/* ── voidcore math ──────────────────────────────────────────────────────────
   Facts from in-game (owner, 2026-08-17): a roll draws uniformly from the
   dungeon's — or, in the raid, that boss's — loot table filtered to your LOOT
   SPEC; a rolled item leaves the pool (no duplicates) until the pool empties
   and resets. Without-replacement draws give closed forms: expected rolls to
   the first wished hit is (T+1)/(W+1), and a hit is guaranteed within T−W+1.
   All numbers assume a fresh pool — rolls already spent only improve them. */
function wlOdds(T,W){
  if(!T||!W) return null;
  const e=(T+1)/(W+1), max=T-W+1;
  let k=0,none=1;
  while(none>0.5&&k<max){none*=(T-W-k)/(T-k);k++;}
  return {p:W/T,e,max,even:k};
}
const wlFr=(T,W)=>{const r=T/W;return "1 in "+(Number.isInteger(r)?r:r.toFixed(1));};
const wlN=x=>Number.isInteger(Math.round(x*10)/10)?String(Math.round(x)):x.toFixed(1);

/* ── shared fragments ─────────────────────────────────────────────────────── */
const wlShareHash=l=>"#/wl/import?i="+l.items.map(e=>e.id+(e.star?"s":"")).join(".")
  +"&n="+encodeURIComponent(l.name)+(l.cls?"&c="+encodeURIComponent(l.cls):"");
const wlClsSel=(l,blank)=>`<select data-wlcls data-k="${l.k}">
  <option value="">${blank||"class: not set"}</option>
  ${Object.keys(WCLASS).map(c=>`<option value="${esc(c)}"${l.cls===c?" selected":""}>${esc(c)}</option>`).join("")}</select>`;

/* The loot-sack on every Loot index row: an open sack with a + to add, the
   same sack with a tick once it's in the bag. State updates in place on
   toggle; a full re-render (facet change, route) recomputes it from the
   store. Both symbols live in the index.html sprite (i-sack / i-sackin). */
const wlBtnFace=on=>ic(on?"i-sackin":"i-sack",15);
const wlBtnTip=(on,a)=>on?`On ${esc(a.name)} — click to remove`:`Add to ${a?esc(a.name):"a new wishlist"}`;
function wlBtn(i){
  const a=wlActive(), on=!!(a&&wlHas(a,i.id));
  return `<button class="wlbtn" data-wl="toggle" data-id="${i.id}" aria-pressed="${on}"
    title="${wlBtnTip(on,a)}">${wlBtnFace(on)}</button>`;
}
/* Context strip under the Loot facets: which list the + feeds. */
function wlLootBar(){
  const s=wlLoad(); if(!s.lists.length) return "";
  const a=wlActive();
  return `<div class="wlbar"><span class="n">Adding to</span>
    <select data-wlactive>${s.lists.map(l=>`<option value="${l.k}"${l===a?" selected":""}>${esc(l.name)}</option>`).join("")}</select>
    <a href="#/wl/${a.k}">open list</a>
    <span class="n">· + on any item adds it</span></div>`;
}

function wlToast(msg,undoable){
  let t=$("#wltoast");
  if(!t){t=document.createElement("div");t.id="wltoast";document.body.appendChild(t);}
  t.innerHTML=`<span>${msg}</span>${undoable?`<button data-wl="undo">Undo</button>`:""}`;
  t.classList.add("on");
  clearTimeout(WLTMR);
  WLTMR=setTimeout(()=>{t.classList.remove("on"); if(!undoable)return; WLUNDO=null;},6000);
}
/* Repaint the wishlist page in place — no route(), so no scroll jump. */
function wlRepaint(){
  const h=(location.hash||"").slice(2).split("?")[0].split("/").filter(Boolean);
  if(h[0]!=="wl") return;
  $("#p-wl").innerHTML=h[1]==="import"?pWlImport((location.hash.split("?")[1]||""))
    :h[1]?pWlOne(h[1]):pWl();
}

/* ── pages ────────────────────────────────────────────────────────────────── */
function pWl(extra){
  const s=wlLoad();
  const cards=s.lists.map(l=>{
    const {live,dead}=wlResolve(l);
    const nd=new Set(live.filter(x=>x.o.mod==="d").map(x=>x.o.d.id)).size;
    const nb=new Set(live.filter(x=>x.o.mod==="r").map(x=>x.o.b.id)).size;
    return `<div class="card wlcard"><h3>${l.cls?clsIcon(l.cls,20):""}<a href="#/wl/${l.k}">${esc(l.name)}</a></h3>
      <div class="meta">${live.length} item${live.length===1?"":"s"}${dead.length?` · ${dead.length} unresolved`:""}
        ${nd?` · ${nd} dungeon${nd===1?"":"s"}`:""}${nb?` · ${nb} raid boss${nb===1?"":"es"}`:""}</div>
      <div class="wlact">
        <a class="linklike" href="#/wl/${l.k}">Open</a>
        <button class="linklike" data-wl="share" data-k="${l.k}">Share</button>
        <button class="linklike" data-wl="export" data-k="${l.k}">Export</button>
        <button class="linklike" data-wl="dup" data-k="${l.k}">Copy as…</button>
        <button class="linklike wldanger" data-wl="del" data-k="${l.k}">Delete</button>
      </div></div>`;}).join("");
  return `<div class="crumb"><a href="#/">Compendium</a> › <em>Wishlists</em></div>
  <h1>Wishlists</h1>
  <p class="lede">A shopping list over the season's ${LOOTALL.length} items, and where to shop for it:
  which keys to run, which bosses are your weekly shots, and where a voidcore is best spent.
  Lists live <b>in this browser</b> — a share link carries a snapshot copy to anyone, including you on another device.</p>
  ${WLBAD?`<p class="note">Saved wishlists couldn't be read (the stored data didn't parse). It has been left
    untouched — nothing is overwritten until you act. <button class="linklike wldanger" data-wl="reset">Start fresh</button></p>`:""}
  ${extra||""}
  ${cards||`<p class="note">No lists yet. Start one here, or just press <b>+</b> on any item on the
    <a href="#/loot">Loot index</a> — that creates your first list on the spot.</p>`}
  <div class="wlact wlnewrow">
    <button data-wl="new" class="wlnew">New wishlist</button>
    <label class="linklike wlfile">Import from file<input type="file" accept=".json,application/json" data-wlfile hidden></label>
  </div>`;
}

function pWlOne(k){
  const l=wlGet(k);
  if(!l) return pWl(`<p class="note">No list "${esc(k)}" in this browser — a list link only works where the
    list was made. The portable form is a <em>share link</em>, made from the list's Share button.</p>`);
  const {live,dead}=wlResolve(l);
  const dg=DUNGEONS.map(d=>({d,rows:live.filter(x=>x.o.mod==="d"&&x.o.d.id===d.id)})).filter(g=>g.rows.length);
  const bs=RAID.bosses.map(b=>({b,rows:live.filter(x=>x.o.mod==="r"&&x.o.b.id===b.id)})).filter(g=>g.rows.length);
  const nM=dg.reduce((n,g)=>n+g.rows.length,0), nR=bs.reduce((n,g)=>n+g.rows.length,0);

  /* Class-scoped honesty: an item no spec of the list's class can loot wears a
     flag rather than being blocked or silently dropped — someone eligible can
     still trade it, so it stays a legitimate wish. It is excluded only from
     the voidcore arithmetic, where W=0 is forced anyway. */
  const reach=i=>!l.cls||SPECS.some(s=>s[0]===l.cls&&specCan(i,SPECKEY(s)));
  const row=x=>{const i=x.o.i;return `<div class="mres wlrow"><div class="mtop">
      <span class="mn">${itemIcon(i)}${esc(i.n)}</span>
      <span class="wlact">
        <button class="wlstar" data-wl="star" data-k="${l.k}" data-id="${i.id}" aria-pressed="${x.star}"
          title="${x.star?"Starred — a farm target":"Star as a farm target"}">${x.star?"★":"☆"}</button>
        <button class="wlx" data-wl="rm" data-k="${l.k}" data-id="${i.id}" title="Remove from list">×</button>
      </span></div>
    <div class="tags">${typeChip(i)}${slotChip(i)}${primChip(i.p)}${i.sl==="Trinket"?roleChips(i):""}
      ${reach(i)?"":`<span class="wlnope" title="It can still drop for an eligible groupmate and be traded to you.">no ${esc(l.cls)} spec can loot this</span>`}</div></div>`;};

  /* keys to run: farm targets (any starred item) first, then by breadth */
  const keys=dg.map(g=>({...g,stars:g.rows.filter(x=>x.star).length}))
    .sort((a,b)=>(b.stars?1:0)-(a.stars?1:0)||b.rows.length-a.rows.length||a.d.id.localeCompare(b.d.id));

  /* voidcore odds per dungeon and per raid boss, spec-scoped */
  let vc="";
  if(!live.length) vc="";
  else if(!l.cls) vc=`<p class="note">Pick the list's class to compute odds — a voidcore draws from
      <em>your loot spec's</em> table, so the numbers are per spec. ${wlClsSel(l,"pick a class")}</p>`;
  else{
    const specs=SPECS.filter(s=>s[0]===l.cls);
    const unreachable=live.filter(x=>!reach(x.o.i));
    const groups=[
      ...dg.map(g=>({label:g.d.name,short:g.d.short,href:`#/d/${g.d.id}/loot`,attr:`data-dungeon="${g.d.id}"`,
        pool:(g.d.loot?g.d.loot.i:[]),wish:g.rows.filter(x=>reach(x.o.i))})),
      ...bs.map(g=>({label:g.b.n,short:g.b.short,href:`#/r/${g.b.id}/loot`,attr:`data-boss="${g.b.id}"`,raid:true,
        pool:(g.b.loot||[]),wish:g.rows.filter(x=>reach(x.o.i))}))]
      .filter(g=>g.wish.length);
    let bestAny=null,bestStar=null;
    const cells=groups.map(g=>specs.map(sp=>{
      const key=SPECKEY(sp);
      const T=g.pool.filter(i=>specCan(i,key)).length;
      const hits=g.wish.filter(x=>specCan(x.o.i,key));
      const Ws=hits.filter(x=>x.star).length;
      const c={g,sp,T,W:hits.length,Ws,o:wlOdds(T,hits.length),os:wlOdds(T,Ws)};
      if(c.o&&(!bestAny||c.o.e<bestAny.o.e)) bestAny=c;
      if(c.os&&(!bestStar||c.os.e<bestStar.os.e)) bestStar=c;
      return c;}));
    const head=[];
    if(bestStar) head.push(`★ Best for your starred items: <b>${esc(bestStar.g.label)}</b> with loot spec
      <b>${esc(bestStar.sp[1])}</b> — ${wlFr(bestStar.T,bestStar.Ws)} per core,
      ~${wlN(bestStar.os.e)} cores on average, guaranteed within ${bestStar.os.max}.`);
    if(bestAny&&(!bestStar||bestAny!==bestStar)) head.push(`Best for anything on the list:
      <b>${esc(bestAny.g.label)}</b> as <b>${esc(bestAny.sp[1])}</b> — ${wlFr(bestAny.T,bestAny.W)} per core,
      ~${wlN(bestAny.o.e)} cores.`);
    vc=`${head.map(h=>`<p class="vchead">${h}</p>`).join("")}
    <div class="vcwrap"><table class="vct"><thead><tr><th>roll on</th>
      ${specs.map(sp=>`<th>${specIcon(SPECKEY(sp))}${esc(sp[1])}</th>`).join("")}</tr></thead><tbody>
      ${groups.map((g,gi)=>{
        const rowBest=Math.min(...cells[gi].filter(c=>c.o).map(c=>c.o.e));
        return `<tr><td class="vcg"><a class="mdg" href="${g.href}" ${g.attr}
            style="background:var(--d-accent);color:var(--d-ink);text-decoration:none">${esc(g.short)}</a>
            ${g.raid?`<span class="n">boss roll</span>`:""}
            <div class="n vcitems">${g.wish.map(x=>(x.star?"★ ":"")+esc(x.o.i.n)).join(" · ")}</div></td>
          ${cells[gi].map(c=>c.o?`<td class="${c.o.e===rowBest?"vcbest":""}"><b>${wlFr(c.T,c.W)}</b>
            <i>~${wlN(c.o.e)} · sure by ${c.o.max}</i></td>`
            :`<td class="n">—</td>`).join("")}</tr>`;}).join("")}
    </tbody></table></div>
    ${unreachable.length?`<p class="note">Not rollable by any ${esc(l.cls)} loot spec, so outside the table:
      ${unreachable.map(x=>(x.star?"★ ":"")+esc(x.o.i.n)).join(" · ")} — an eligible groupmate can still
      trade ${unreachable.length===1?"it":"them"} to you.</p>`:""}
    <p class="note vcnote">How to read it: set your <b>loot spec</b> to the column before rolling — no need to play it.
    A core draws uniformly from that spec's table for the dungeon (raid: for that boss, offered after the kill);
    what you receive leaves the pool, so odds improve every roll and a hit is <em>guaranteed</em> by the "sure by" number.
    Figures assume a fresh pool — rolls you've already spent only make them better — and that this table matches the
    game's. Cores are capped: 2 purchasable a week, plus 1 more via 6 Tokens of Merit from the Vault — call it 2–3 a week.</p>`;
  }

  return `<div class="crumb"><a href="#/">Compendium</a> › <a href="#/wl">Wishlists</a> › <em>${esc(l.name)}</em></div>
  <div class="wlhead">
    <input class="wlname" data-wlname data-k="${l.k}" value="${esc(l.name)}" aria-label="Wishlist name" maxlength="60">
    ${wlClsSel(l)}
    <span class="wlact">
      <button class="linklike" data-wl="share" data-k="${l.k}">Share</button>
      <button class="linklike" data-wl="export" data-k="${l.k}">Export</button>
      <button class="linklike" data-wl="dup" data-k="${l.k}">Copy as…</button>
      <button class="linklike wldanger" data-wl="del" data-k="${l.k}">Delete</button>
    </span></div>
  <p class="lede">${live.length?`${live.length} item${live.length===1?"":"s"} — ${nM} from the Mythic+ chest pool,
    ${nR} off raid bosses. Saved in this browser; Share carries a snapshot copy.`
    :`Empty so far. Open the <a href="#/loot">Loot index</a>, filter to your spec, and press <b>+</b> on anything
    you want — it lands here.`}</p>
  ${dg.map(g=>`<div class="area-h" data-dungeon="${g.d.id}"><a href="#/d/${g.d.id}/loot"
      style="color:inherit;text-decoration:none">${esc(g.d.name)}</a> <span class="n"
      style="text-transform:none;letter-spacing:0">· M+ chest</span></div>
    ${g.rows.sort((a,b)=>featRank(a.o.i)-featRank(b.o.i)).map(row).join("")}`).join("")}
  ${bs.map(g=>`<div class="area-h" data-boss="${g.b.id}"><a href="#/r/${g.b.id}"
      style="color:inherit;text-decoration:none">${esc(g.b.n)}</a> <span class="n"
      style="text-transform:none;letter-spacing:0">· raid · once a week per difficulty</span></div>
    ${g.rows.sort((a,b)=>featRank(a.o.i)-featRank(b.o.i)).map(row).join("")}`).join("")}
  ${dead.length?`<p class="note">${dead.length} item${dead.length===1?" is":"s are"} no longer in the compendium's
    data (id${dead.length===1?"":"s"} ${dead.map(e=>e.id).join(", ")}) — kept here, excluded from the numbers.
    ${dead.map(e=>`<button class="linklike" data-wl="rm" data-k="${l.k}" data-id="${e.id}">drop ${e.id}</button>`).join(" ")}</p>`:""}

  ${live.length?`<h2>Keys to run</h2>
  ${keys.length?`<div class="wlkeys">${keys.map(g=>`<div class="wlkey${g.stars?" farm":""}">
    <a class="mdg" href="#/d/${g.d.id}/loot" data-dungeon="${g.d.id}"
      style="background:var(--d-accent);color:var(--d-ink);text-decoration:none">${esc(g.d.short)}</a>
    <b>${g.rows.length}</b> of your ${nM} M+ item${nM===1?"":"s"}${g.stars?` · <span class="wlfarm">★ farm target</span>`:""}
    <span class="n">${g.rows.map(x=>(x.star?"★ ":"")+esc(x.o.i.n)).join(" · ")}</span></div>`).join("")}</div>`
    :`<p class="note">Nothing from the Mythic+ pool on this list yet.</p>`}

  <h2>Raid week</h2>
  ${bs.length?`<p class="n wlraidn">Your weekly shots: ${nR} item${nR===1?"":"s"} across ${bs.length}
    boss${bs.length===1?"":"es"}, once per difficulty.</p>
  <div class="wlkeys">${bs.map(g=>`<div class="wlkey">
    <a class="mdg" href="#/r/${g.b.id}" data-boss="${g.b.id}"
      style="background:var(--d-accent);color:var(--d-ink);text-decoration:none">${esc(g.b.short)}</a>
    <b>${g.rows.length}</b> item${g.rows.length===1?"":"s"}
    <span class="n">${g.rows.map(x=>(x.star?"★ ":"")+esc(x.o.i.n)).join(" · ")}</span></div>`).join("")}</div>`
    :`<p class="note">Nothing from the raid on this list.</p>`}

  <h2>Voidcore odds</h2>${vc}`:""}`;
}

function pWlImport(qs){
  const p=new URLSearchParams(qs||"");
  const items=(p.get("i")||"").split(".").filter(Boolean)
    .map(t=>{const m=t.match(/^(\d+)(s?)$/);return m?{id:+m[1],star:!!m[2]}:null;}).filter(Boolean);
  const name=(p.get("n")||"Shared wishlist").slice(0,60);
  const cls=WCLASS[p.get("c")]?p.get("c"):null;
  WLIMP={name,cls,items};
  const live=items.filter(e=>WLIDX[e.id]), dead=items.filter(e=>!WLIDX[e.id]);
  return `<div class="crumb"><a href="#/">Compendium</a> › <a href="#/wl">Wishlists</a> › <em>shared snapshot</em></div>
  <h1>${cls?clsIcon(cls,22):""}${esc(name)}</h1>
  <p class="lede">A shared wishlist snapshot — ${live.length} item${live.length===1?"":"s"}. Saving it makes
    <b>your own copy</b> in this browser; it doesn't stay linked to the sender's.</p>
  ${dead.length?`<p class="note">${dead.length} id${dead.length===1?"":"s"} in the link didn't resolve
    (${dead.map(e=>e.id).join(", ")}) — they'll be kept on the copy as unresolved.</p>`:""}
  ${live.map(e=>{const o=WLIDX[e.id],i=o.i;return `<div class="mres wlrow"><div class="mtop">
      <a class="mdg" href="${o.mod==="r"?`#/r/${o.b.id}/loot`:`#/d/${o.d.id}/loot`}"
        ${o.mod==="r"?`data-boss="${o.b.id}"`:`data-dungeon="${o.d.id}"`}
        style="background:var(--d-accent);color:var(--d-ink);text-decoration:none">${esc(o.mod==="r"?o.b.short:o.d.short)}</a>
      <span class="mn">${itemIcon(i)}${e.star?"★ ":""}${esc(i.n)}</span></div>
    <div class="tags">${typeChip(i)}${slotChip(i)}${primChip(i.p)}</div></div>`;}).join("")}
  <div class="wlact wlnewrow">
    <button class="wlnew" data-wl="importsave">Save a copy</button>
    <button class="linklike" data-wl="copylink">Copy this link</button>
  </div>`;
}

/* ── interaction — one delegated listener, all hooks on [data-wl] ─────────
   The mechanics/loot facet handler matches [data-f]/[data-lf]; this one
   matches only [data-wl], so neither can eat the other's clicks. */
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-wl]");
  if(!t) return;
  const v=t.dataset.wl;
  if(v==="new"){const l=wlCreate(); wlToast(`Made “${esc(l.name)}” — rename it on its page`); location.hash="#/wl/"+l.k; return;}
  if(v==="toggle"){
    let a=wlActive(), made=false;
    if(!a){a=wlCreate(); made=true;}
    const id=+t.dataset.id, o=WLIDX[id];
    if(wlHas(a,id)){
      const ix=a.items.findIndex(x=>x.id===id);
      WLUNDO={k:a.k,entry:a.items[ix],ix};
      a.items.splice(ix,1); wlSave();
      wlToast(`Removed ${o?esc(o.i.n):id} from ${esc(a.name)}`,true);
    }else{
      a.items.push({id,star:!!(o&&o.i.sl==="Trinket")}); wlSave();
      wlToast(`Added ${o?esc(o.i.n):id} to ${esc(a.name)}${o&&o.i.sl==="Trinket"?" · ★ starred (trinket)":""}
        · <a href="#/wl/${a.k}">view</a>`);
    }
    if(made) paintLoot();               /* first list: mount the context bar */
    else{const on=wlHas(a,id); t.setAttribute("aria-pressed",on);
      t.innerHTML=wlBtnFace(on); t.title=wlBtnTip(on,a);}
    return;
  }
  if(v==="undo"&&WLUNDO){
    const l=wlGet(WLUNDO.k);
    if(l){l.items.splice(Math.min(WLUNDO.ix,l.items.length),0,WLUNDO.entry); wlSave();
      const b=document.querySelector(`.wlbtn[data-id="${WLUNDO.entry.id}"]`);
      if(b){b.setAttribute("aria-pressed",true); b.innerHTML=wlBtnFace(true); b.title=wlBtnTip(true,l);}
      wlRepaint(); wlToast("Restored");}
    WLUNDO=null; return;
  }
  if(v==="star"){
    const l=wlGet(t.dataset.k), it=l&&l.items.find(x=>x.id===+t.dataset.id);
    if(it){it.star=!it.star; wlSave(); wlRepaint();}
    return;
  }
  if(v==="rm"){
    const l=wlGet(t.dataset.k), id=+t.dataset.id, ix=l?l.items.findIndex(x=>x.id===id):-1;
    if(ix<0) return;
    WLUNDO={k:l.k,entry:l.items[ix],ix};
    l.items.splice(ix,1); wlSave(); wlRepaint();
    const o=WLIDX[id];
    wlToast(`Removed ${o?esc(o.i.n):id}`,true);
    return;
  }
  if(v==="share"){const l=wlGet(t.dataset.k); if(l) location.hash=wlShareHash(l); return;}
  if(v==="copylink"){
    const url=location.href;
    (navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject())
      .then(()=>wlToast("Link copied"))
      .catch(()=>wlToast("Copy blocked here — the address bar has the link"));
    return;
  }
  if(v==="export"){
    const l=wlGet(t.dataset.k); if(!l) return;
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([JSON.stringify({v:1,lists:[l]},null,1)],{type:"application/json"}));
    a.download=(l.name.replace(/[^\w\- ]+/g,"").trim()||"wishlist")+".json";
    a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    wlToast("Exported — a file is your offline backup");
    return;
  }
  if(v==="dup"){
    const l=wlGet(t.dataset.k); if(!l) return;
    const c=wlCreate(l.name+" (copy)",l.cls);
    c.items=l.items.map(x=>({id:x.id,star:!!x.star})); wlSave();
    location.hash="#/wl/"+c.k; return;
  }
  if(v==="del"){
    const l=wlGet(t.dataset.k); if(!l) return;
    if(!confirm(`Delete "${l.name}" (${l.items.length} item${l.items.length===1?"":"s"})? This can't be undone — Export first if unsure.`)) return;
    const s=wlLoad();
    s.lists=s.lists.filter(x=>x.k!==l.k);
    if(s.active===l.k) s.active=s.lists.length?s.lists[0].k:null;
    wlSave();
    if(location.hash.startsWith("#/wl/")) location.hash="#/wl"; else wlRepaint();
    return;
  }
  if(v==="importsave"&&WLIMP){
    const l=wlCreate(WLIMP.name,WLIMP.cls);
    l.items=WLIMP.items.map(x=>({id:x.id,star:!!x.star})); wlSave();
    wlToast(`Saved a copy of “${esc(l.name)}”`);
    location.hash="#/wl/"+l.k; return;
  }
  if(v==="reset"){
    if(!confirm("Discard the unreadable saved data and start fresh?")) return;
    WLS={v:1,active:null,lists:[]}; WLBAD=false; wlSave(); wlRepaint(); return;
  }
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.matches("[data-wlname]")){
    const l=wlGet(t.dataset.k);
    if(l){l.name=t.value.trim()||"My wishlist"; wlSave();}
    return;
  }
  if(t.matches("[data-wlcls]")){
    const l=wlGet(t.dataset.k);
    if(l){l.cls=WCLASS[t.value]?t.value:null; wlSave(); wlRepaint();}
    return;
  }
  if(t.matches("[data-wlactive]")){
    wlLoad().active=t.value; wlSave(); paintLoot();
    return;
  }
  if(t.matches("[data-wlfile]")&&t.files&&t.files[0]){
    t.files[0].text().then(txt=>{
      let p=null;
      try{p=JSON.parse(txt);}catch(err){}
      if(!p||p.v!==1||!Array.isArray(p.lists)){wlToast("That file isn't a wishlist export"); return;}
      const s=wlLoad();
      p.lists.forEach(imp=>{
        const l=wlCreate(String(imp.name||"Imported list").slice(0,60),WCLASS[imp.cls]?imp.cls:null);
        l.items=(Array.isArray(imp.items)?imp.items:[]).filter(x=>x&&Number.isFinite(+x.id))
          .map(x=>({id:+x.id,star:!!x.star}));
      });
      wlSave(); wlRepaint();
      wlToast(`Imported ${p.lists.length} list${p.lists.length===1?"":"s"}`);
    });
    t.value="";
  }
});
