/* js/logs.js — Log Analysis: the index of analysed logs and one report each
   Load order: data-shared → data-mplus → data-raid → data-logs → render →
   wishlist → logs → app. Pure renderers; routing stays in app.js.

   A report is data (LOGS, in data-logs.js) written as blocks. Everything here
   turns blocks into markup, so a second report is a data change, not code.
   The charts are drawn here rather than shipped as images: they take the
   page's own type and colours, stay sharp at any zoom, and every mark carries
   a native tooltip. */

/* The only markup a report may carry: **bold** and *italic*. Escaped first,
   so a stray < in a log name can never become a tag. */
const lmd=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g,"$1<i>$2</i>");
const lnum=v=>Number(v).toLocaleString("en-US");

/* ── charts ── */
/* Boss health across every pull. One highlighted line (the best pull), the
   rest recessive; the Heart windows shaded, because that is where the curve
   falls fastest. Lines that reach Stage Three are labelled at their ends and
   pushed apart when they would collide; shorter pulls are named in groups. */
function chHp(c){
  /* the axes follow the data: a night that reaches the enrage runs past 600 s
     and far below 30%, and a fixed frame would clip exactly the best pulls */
  const lo=Math.min(...c.curves.flatMap(k=>k.pts.map(p=>p[1]))), long=Math.max(...c.curves.map(k=>k.dur));
  const W=720,H=300,L=44,R=40,T=24,B=36,x0=0,x1=Math.max(560,Math.ceil((long+30)/50)*50),y0=lo<30?0:30,y1=100;
  const X=t=>L+(t-x0)/(x1-x0)*(W-L-R), Y=v=>T+(y1-v)/(y1-y0)*(H-T-B);
  const grid=[0,10,20,30,40,50,60,70,80,90,100].filter(v=>v>=y0).map(v=>`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" class="lg-grid"/>
    <text x="${L-8}" y="${Y(v)+4}" text-anchor="end" class="lg-tick">${v}</text>`).join("");
  const xt=[0,100,200,300,400,500,600].filter(t=>t<=x1).map(t=>`<text x="${X(t)}" y="${H-B+18}" text-anchor="middle" class="lg-tick">${t}</text>`).join("");
  const bands=c.bands.map(([a,b])=>`<rect x="${X(a)}" y="${T}" width="${X(b)-X(a)}" height="${H-T-B}" class="lg-band"/>`).join("");
  const stg=c.stages.map(([a,b,l])=>`<text x="${(X(a)+X(Math.min(b,x1)))/2}" y="${T-8}" text-anchor="middle" class="lg-stage${/^R\d/.test(l)?" on":""}">${esc(l)}</text>`).join("");
  const line=k=>{const last=k.pts[k.pts.length-1];
    return `<polyline points="${k.pts.map(([t,v])=>X(t).toFixed(1)+","+Y(v).toFixed(1)).join(" ")}" class="lg-line${k.n===c.best?" best":""}">
      <title>Pull ${k.n}: ${k.dur} s, last boss reading ${last[1]}%</title></polyline>`;};
  const order=[...c.curves].sort((a,b)=>(a.n===c.best)-(b.n===c.best));
  /* end labels for the long pulls, nudged apart vertically */
  /* labels only collide when their lines end near each other, so they are
     pushed apart within a neighbourhood rather than stacked globally */
  const ends=c.curves.filter(k=>k.dur>360).map(k=>{const p=k.pts[k.pts.length-1];return {n:k.n,x:X(p[0]),y:Y(p[1])};})
    .sort((a,b)=>a.y-b.y);
  ends.forEach((e,i)=>{for(let j=0;j<i;j++){const o=ends[j];
    if(Math.abs(o.x-e.x)<28&&e.y-o.y<12) e.y=o.y+12;}});
  const endl=ends.map(e=>`<text x="${e.x+6}" y="${e.y+4}" class="lg-end${e.n===c.best?" best":""}">#${e.n}</text>`).join("");
  const early=c.curves.filter(k=>k.dur<=360).map(k=>"#"+k.n);
  /* bottom-left is the one corner no curve can reach: every pull starts at
     100% and nothing falls below half before the first Heart window */
  const glab=early.length?`<text x="${X(12)}" y="${Y(y0+(y1-y0)*.16)}" class="lg-note">${early.join(", ")}</text>
    <text x="${X(12)}" y="${Y(y0+(y1-y0)*.16)+14}" class="lg-note">wiped before Stage 3</text>`:"";
  return `<figure class="lgfig lgscroll"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.label)}" class="lgsvg" style="min-width:560px">
    ${bands}${grid}${xt}${stg}${order.map(line).join("")}${endl}
    ${glab}
    <text x="${(L+W-R)/2}" y="${H-4}" text-anchor="middle" class="lg-axis">seconds into pull</text>
    <text transform="translate(12 ${(T+H-B)/2}) rotate(-90)" text-anchor="middle" class="lg-axis">boss health %</text>
  </svg></figure>`;
}

/* Where each player's targeted casts went. A stacked bar per player with a
   surface gap between segments, the Heart share printed as text, and the raw
   counts in the tooltip. Identity is never colour alone: the legend names
   each colour and the label names the one number that matters. */
function chShare(c){
  const lab={heart:c.keys[0][1],body:c.keys[1][1],adds:c.keys[2][1]};
  return `<figure class="lgfig"><div class="lglegend">${c.keys.map(([k,l])=>`<span><i class="sw ${k}"></i>${esc(l)}</span>`).join("")}</div>
  <div class="lgbars" role="list" aria-label="${esc(c.label)}">${c.rows.map(([p,role,h,b,a])=>{const t=h+b+a, pc=v=>(100*v/t).toFixed(1);
    return `<div class="lgbar" role="listitem" title="${esc(p)}: ${h} casts at the Heart, ${b} at the body, ${a} at adds">
      <span class="who">${esc(p)} <em>${esc(role)}</em></span>
      <span class="track">${[["heart",h],["body",b],["adds",a]].filter(x=>x[1]).map(([k,v])=>`<i class="${k}" style="width:${pc(v)}%" title="${esc(lab[k])}: ${v}"></i>`).join("")}</span>
      <span class="val">${Math.round(100*h/t)}% Heart</span></div>`;}).join("")}</div></figure>`;
}

/* Hits per player per pull. Sequential, one hue: the cell darkens with the
   count and the number is always printed, so the colour is a reading aid
   rather than the only way in. */
function chHeat(c){
  /* null means the player was not in the raid for that pull, which is not
     the same fact as zero hits, so it gets a dash rather than a dot */
  const max=Math.max(...c.rows.flatMap(r=>r[1].filter(n=>n!==null)));
  return `<figure class="lgfig lgscroll"><table class="lgheat" aria-label="${esc(c.label)}">
    <thead><tr><th>Player</th>${c.cols.map(([p,d])=>`<th>${esc(p)}<span>${esc(d)}</span></th>`).join("")}</tr></thead>
    <tbody>${c.rows.map(([p,v])=>`<tr><th scope="row">${esc(p)}</th>${v.map((n,i)=>{
      if(n===null)return `<td class="out" title="${esc(p)} was not in the raid for ${esc(c.cols[i][0])}">–</td>`;
      const a=n?(.16+.78*n/max):0;
      return `<td style="${n?`background:rgba(214,160,62,${a.toFixed(2)});`:""}${a>.6?"color:var(--ground)":""}" title="${esc(p)}, ${esc(c.cols[i][0])}: ${n} hit${n===1?"":"s"}">${n||"·"}</td>`;}).join("")}</tr>`).join("")}</tbody>
  </table></figure>`;
}

/* Tether snaps on a time axis, one row per pull. Joined dots are a chain:
   each snap inside the window that refreshes the stack. A chain long enough
   to have wiped the raid wears the urgent signal, with its stack count in
   words beside it. */
function chSnaps(c){
  const [a,b]=c.x, W=720,L=48,R=110,T=10,row=28,H=T+c.rows.length*row+30;
  const X=t=>L+(t-a)/(b-a)*(W-L-R);
  const ticks=[];for(let t=Math.ceil(a/10)*10;t<=b;t+=10)ticks.push(t);
  const grid=ticks.map(t=>`<line x1="${X(t)}" x2="${X(t)}" y1="${T}" y2="${H-30}" class="lg-grid"/><text x="${X(t)}" y="${H-12}" text-anchor="middle" class="lg-tick">${t}</text>`).join("");
  const rows=c.rows.map((r,i)=>{const y=T+i*row+row/2, bad=c.wiped.includes(r.n);
    return `<text x="${L-10}" y="${y+4}" text-anchor="end" class="lg-tick">#${r.n}</text>
    ${r.chains.filter(ch=>ch.length>1).map(ch=>`<line x1="${X(ch[0])}" x2="${X(ch[ch.length-1])}" y1="${y}" y2="${y}" class="lg-chain${ch.length>=5?" bad":""}"/>`).join("")}
    ${r.chains.flat().map(t=>`<circle cx="${X(t)}" cy="${y}" r="4.5" class="lg-dot"><title>Pull ${r.n}: tether snapped at ${t} s</title></circle>`).join("")}
    <text x="${W-R+12}" y="${y+4}" class="lg-peak${bad?" bad":""}">peak ${r.peak} stack${r.peak===1?"":"s"}</text>`;}).join("");
  return `<figure class="lgfig lgscroll"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.label)}" class="lgsvg" style="min-width:560px">
    ${grid}${rows}</svg></figure>`;
}
const LOGCHART={hp:chHp,share:chShare,heat:chHeat,snaps:chSnaps};

/* ── blocks ── */
function logBlock(b){
  const tbl=b=>{const mono=new Set(b.mono||[]), hl=new Set(b.hl||[]);
    return `<div class="lgscroll"><table class="lgtable"><thead><tr>${b.head.map((h,i)=>`<th${mono.has(i)?' class="num"':""}>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${b.rows.map((r,ri)=>`<tr${hl.has(ri)?' class="flag"':""}>${r.map((c,i)=>`<td${mono.has(i)?' class="mono num"':""}>${lmd(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;};
  switch(b.k){
    case "lede": return `<p class="lede lglede">${lmd(b.t)}</p>`;
    case "p":    return `<p class="${b.small?"lgsmall":"lgp"}">${lmd(b.t)}</p>`;
    case "cap":  return `<p class="lgcap">${lmd(b.t)}</p>`;
    case "h3":   return `<h3 class="lgh3">${esc(b.t)}</h3>`;
    case "ul":   {const tag=b.ordered?"ol":"ul"; return `<${tag} class="lglist">${b.items.map(i=>`<li>${lmd(i)}</li>`).join("")}</${tag}>`;}
    case "tiles":return `<div class="lgtiles">${b.items.map(([big,l,tone])=>`<div class="lgtile ${tone||""}"><b>${esc(big)}</b><span>${esc(l)}</span></div>`).join("")}</div>`;
    case "callout": return `<div class="lgcall"><div class="lgcall-h">${esc(b.title)}</div>
      ${b.items?`<ol>${b.items.map(i=>`<li>${lmd(i)}</li>`).join("")}</ol>`:`<p>${lmd(b.t)}</p>`}</div>`;
    case "table": return tbl(b);
    case "chart": return (LOGCHART[b.kind]||(()=>""))(b);
  }
  return "";
}

const logPills=L=>`<span class="pill">${esc(DIFFL[L.diff]||L.diff)}</span>
  <span class="pill">${L.pulls} pulls</span>
  <span class="pill">${L.kills?L.kills+" kill"+(L.kills>1?"s":""):"No kill"}</span>
  <span class="pill">Best ${esc(L.best)}</span>`;

function pLogs(){
  return `<div class="crumb"><a href="#/">Compendium</a> › <em>Log Analysis</em></div>
  <h1>Log Analysis</h1>
  <p class="lede">Pull reviews built from real combat logs, read against this compendium's encounter pages. Each one
  starts from the questions a raid actually asked after a night of wipes, answers them with the numbers, and then says
  what really ended the pulls.</p>
  <p class="note">${ic("i-info",13)} These describe one group on one night. The encounter pages hold what the fight
  <i>is</i>; a log review holds what happened, and every number in it was computed from the log rather than typed.</p>
  <div class="sec"><h2>Analysed logs</h2><span class="n">${LOGS.length} so far · newest first</span></div>
  <div class="lglist-cards">${LOGS.map(L=>{const b=L.mod==="r"&&RB[L.boss];
    return `<a class="card acc lgcard" href="#/logs/${L.id}"${b?` data-boss="${b.id}"`:""}>
      <div class="meta">${esc(L.when)}${b?" · "+esc(RAID.name):""}</div>
      <h3>${esc(L.title)}</h3>
      <p>${esc(L.blurb)}</p>
      <div class="tile-foot">${logPills(L)}</div></a>`;}).join("")}</div>`;
}

function pLog(id){
  const L=LOGI[id]; if(!L) return `<p>Unknown log.</p>`;
  const b=L.mod==="r"?RB[L.boss]:null;
  const toc=L.sections.filter(s=>s.kick);
  /* the other reviews of this same fight, in date order, so a raid reading
     one night can step to the next and see what changed */
  const same=LOGS.filter(x=>x.mod===L.mod&&x.boss===L.boss&&x.diff===L.diff).sort((a,c)=>a.date<c.date?-1:1);
  const at=same.indexOf(L), prev=same[at-1], next=same[at+1];
  const seq=prev||next?`<p class="note lgseq">${ic("i-info",13)} ${[
    prev?`Previous review of this fight: <a href="#/logs/${prev.id}">${esc(prev.when)}</a> (best ${esc(prev.best)})`:"",
    next?`Next: <a href="#/logs/${next.id}">${esc(next.when)}</a> (best ${esc(next.best)})`:""].filter(Boolean).join(" · ")}.</p>`:"";
  return `<div class="crumb"><a href="#/">Compendium</a> › <a href="#/logs">Log Analysis</a> › <em>${esc(L.title)}</em></div>
  <p class="printmeta">The Coiled Compendium — Log Analysis · ${esc(L.title)} · ${esc(L.when)} · samurairacy.github.io/coiled-compendium</p>
  <div class="lgkick">${esc(L.kicker)}</div>
  <h1>${esc(L.title)}</h1>
  <p class="lgwhen">Pull review: ${esc(L.when)}</p>
  <div class="tile-foot" style="border:none;padding:.8rem 0 0">${logPills(L)}
    ${b?`<a class="pill acc" href="#/r/${b.id}?d=${L.diff}">${ic("i-boss")}Encounter page</a>`:""}
    ${L.pdf?`<a class="pill" href="${esc(L.pdf)}" download>PDF version</a>`:""}</div>
  ${seq}
  <nav class="lgtoc" aria-label="On this page">${toc.map(s=>
    `<button class="linklike" data-goto="lg-${s.id}">${esc(s.kick)} · ${esc(s.h)}</button>`).join("")}</nav>
  ${L.sections.map(s=>`<section class="lgsec" id="lg-${s.id}">
    ${s.kick?`<div class="lgkick">${esc(s.kick)}</div>`:""}
    <div class="sec"><h2>${esc(s.h)}</h2></div>
    ${s.blocks.map(logBlock).join("")}</section>`).join("")}`;
}

/* A boss page names the reviews that exist for it, so someone reading the
   fight can find what it looked like in practice. Empty when there are none. */
const logNote=bossId=>{const ls=LOGS.filter(L=>L.mod==="r"&&L.boss===bossId);
  return ls.length?`<p class="note">${ic("i-info",13)} Log analysis: ${ls.map(L=>
    `<a href="#/logs/${L.id}">${esc(L.when)}, ${esc(DIFFL[L.diff]||L.diff)}</a>`).join(" · ")} — a real raid night on this fight, read pull by pull.</p>`:"";};
