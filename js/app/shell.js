/* MEPify · App shell: settings state, theme, tab bar, logo, home screen and section screens
   by Mohamed Shafaf Karumannil */

let SET=Object.assign({name:"",company:"",project:"",theme:"auto"},LS.get("sc.set",{})),LOG=LS.get("sc.log",[]),BACK="home",LQ="",LP="",LOPEN=null;
const saveSet=()=>LS.set("sc.set",SET),saveLog=()=>LS.set("sc.log",LOG);
const mq=window.matchMedia?matchMedia("(prefers-color-scheme: dark)"):null;
function applyTheme(){const r=document.documentElement;if(SET.theme==="light"||SET.theme==="dark")r.dataset.theme=SET.theme;else delete r.dataset.theme;
  const dk=SET.theme==="dark"||(SET.theme!=="light"&&mq&&mq.matches);r.classList.toggle("dk",!!dk);
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=dk?"#0B1620":"#F2F4F6";}
if(mq){try{mq.addEventListener("change",applyTheme);}catch(e){mq.addListener&&mq.addListener(applyTheme);}}
applyTheme();
const gIcon=(g,ic)=>`<span class="x-ic g-${g}">${svg(ic)}</span>`;
const isView=v=>typeof v==="string"&&v.indexOf("v:")===0;
function initials(){const p=String(SET.name||"").trim().split(/\s+/).filter(Boolean);return p.length?(p[0][0]+(p.length>1?p[p.length-1][0]:"")).toUpperCase():"";}
function go(v){view=v;render();window.scrollTo(0,0);}
function goBack(){const b=BACK;BACK="home";go(isView(b)&&b!==view?b:"home");}
function tabs(){
  let bar=document.querySelector(".x-tabs");
  const on=view==="home"||isView(view)||view==="trouble";
  document.body.classList.toggle("x-tabbed",on);
  if(!on){if(bar)bar.remove();return;}
  const cur=view==="trouble"?"t":view==="v:log"?"l":view==="v:set"?"s":"h";
  const B=(k,ic,l)=>`<button type="button" data-tab="${k}"${cur===k?' aria-current="page"':""}><i>${svg(ic)}</i>${l}</button>`;
  if(!bar){bar=document.createElement("nav");bar.className="x-tabs";bar.setAttribute("aria-label","Main");document.body.appendChild(bar);}
  bar.innerHTML=B("h","x_home","Home")+B("t","trbl","Troubleshoot")+B("l","x_log","Job log")+B("s","x_gear","Settings");
  bar.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{const k=b.dataset.tab;BACK="home";HQ="";
    if(k==="h")go("home");else if(k==="t"){view="trouble";noteRecent("trouble");render();window.scrollTo(0,0);}else go(k==="l"?"v:log":"v:set");});
}
const LOGO=`<svg class="x-logo" viewBox="0 0 256 256" aria-hidden="true"><path d="M128 24L218 76L128 128L38 76Z" fill="#1E7BE6" stroke="#1E7BE6" stroke-width="10" stroke-linejoin="round"/><path d="M38 76L128 128L128 232L38 180Z" fill="#1446B8" stroke="#1446B8" stroke-width="10" stroke-linejoin="round"/><path d="M128 128L218 76L218 180L128 232Z" fill="#12A39A" stroke="#12A39A" stroke-width="10" stroke-linejoin="round"/><path d="M128 128L38 76M128 128L218 76M128 128V232" fill="none" stroke="#FFFFFF" stroke-width="7"/><path d="M128 104V128 M110 168L128 178.4 M174 164V178L128 204.6" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="128" cy="178.4" r="6" fill="#FFFFFF"/><circle cx="128" cy="204.6" r="6" fill="#FFFFFF"/><circle cx="174" cy="164" r="6" fill="#FFFFFF"/><circle cx="174" cy="164" r="2.6" fill="#12A39A"/><circle cx="110" cy="168" r="6" fill="#FFFFFF"/><circle cx="110" cy="168" r="2.6" fill="#1446B8"/><g transform="translate(128 72) scale(0.62)"><path d="M4 -36H20L8 -6H22L-10 36L-2 4H-18Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(82 150) scale(1.15)"><path d="M0.0 0.0C-6.3 -3.4 -8.0 -14.3 -0.8 -19.7C4.6 -23.5 11.3 -18.5 8.4 -12.2C6.7 -8.4 3.8 -5.0 0.0 0.0Z" fill="#FFFFFF"/><path d="M0.0 0.0C3.4 -6.3 14.3 -8.0 19.7 -0.8C23.5 4.6 18.5 11.3 12.2 8.4C8.4 6.7 5.0 3.8 0.0 0.0Z" fill="#FFFFFF"/><path d="M-0.0 0.0C6.3 3.4 8.0 14.3 0.8 19.7C-4.6 23.5 -11.3 18.5 -8.4 12.2C-6.7 8.4 -3.8 5.0 -0.0 0.0Z" fill="#FFFFFF"/><path d="M0.0 -0.0C-3.4 6.3 -14.3 8.0 -19.7 0.8C-23.5 -4.6 -18.5 -11.3 -12.2 -8.4C-8.4 -6.7 -5.0 -3.8 0.0 -0.0Z" fill="#FFFFFF"/><circle cx="0" cy="0" r="5" fill="#1446B8"/><circle cx="0" cy="0" r="2.5" fill="#FFFFFF"/></g><g transform="translate(174 134) scale(0.58)"><path d="M0 -36L20.5 -2.5A24 24 0 1 1 -20.5 -2.5Z" fill="#FFFFFF"/></g><circle cx="128" cy="128" r="21" fill="#FFFFFF"/><g transform="translate(128 127) scale(0.42)"><path d="M0 -36C6 -22 24 -12 24 8C24 24 13 34 0 34C-13 34 -24 24 -24 10C-24 -2 -16 -10 -12 -18C-10 -10 -6 -6 -2 -6C-2 -16 -4 -26 0 -36Z" fill="#E5382B"/><path d="M0 6C6 13 10 17 10 22C10 28 5 32 0 32C-5 32 -10 28 -10 22C-10 17 -6 13 0 6Z" fill="#FFFFFF"/></g></svg>`;
const rowT=t=>`<div class="x-it" role="button" tabindex="0" data-go="${t.id}">${gIcon(t.g,t.icon)}<span class="tx"><b>${t.name}</b><small>${t.short}</small></span><button type="button" class="x-st" data-star="${t.id}" aria-label="Favourite ${esc(plain(t.name))}" aria-pressed="${FAV.includes(t.id)}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON.star}</svg></button></div>`;
function bindRows(box){
  box.querySelectorAll("[data-go]").forEach(b=>{const o=()=>{BACK=view;openTool(b.dataset.go);};b.onclick=e=>{if(e.target.closest("[data-star]"))return;o();};b.onkeydown=e=>{if((e.key==="Enter"||e.key===" ")&&e.target===b){e.preventDefault();o();}};});
  box.querySelectorAll("[data-star]").forEach(s=>s.onclick=e=>{e.stopPropagation();toggleFav(s.dataset.star);s.setAttribute("aria-pressed",FAV.includes(s.dataset.star));});
}
/* ---------- RENDER ---------- */
function home(){
  const nT=visTools().length-1,nF=Object.values(TSD).reduce((a,v)=>a+v.length,0),ini=initials();
  app.innerHTML=`<header class="x-hd">${LOGO}<div style="min-width:0"><h1>MEPify</h1><p>${SET.project?esc(SET.project):"by Mohamed Shafaf Karumannil"}</p></div><button type="button" class="x-av" data-set aria-label="Settings">${ini?esc(ini):svg("x_gear")}</button></header>
  <label class="srch"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON.srch}</svg><input id="hq" type="search" placeholder="Search ${nT} tools or a fault" aria-label="Search tools and faults" value="${esc(HQ)}"></label>
  ${hlResumeCard()}
  <button class="tile feat" data-go="trouble"><span class="ic">${svg("trbl")}</span><span class="ft"><b>Troubleshooter</b><span>Find the cause of ${nF} common faults</span></span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
  <div id="homegroups"></div>
  <p class="credit">MEPify v${APPV}<br>Designed by Mohamed Shafaf Karumannil</p>`;
  const box=document.getElementById("homegroups");
  const card=t=>`<button type="button" class="x-fv" data-go="${t.id}">${gIcon(t.g,t.icon)}<b>${t.name}</b></button>`;
  const fill=()=>{const q=HQ.trim().toLowerCase();
   if(!q){const fv=FAV.map(byId).filter(t=>t&&t.g!=="hidden"),rc=REC.map(byId).filter(t=>t&&t.g!=="hidden"&&!FAV.includes(t.id));
    box.innerHTML=(fv.length?`<div class="x-h"><b>Favourites</b><span>${fv.length}</span></div><div class="x-strip">${fv.map(card).join("")}</div>`:"")+
     (rc.length?`<div class="x-h"><b>Recent</b><button type="button" class="x-clr" data-clrrec aria-label="Clear recent tools">Clear</button></div><div class="x-strip">${rc.map(card).join("")}</div>`:"")+
     `<div class="x-h"><b>Sections</b><span>${nT} tools</span></div><div class="x-secs">${GROUPS.map(([g,n,ic])=>`<button type="button" class="x-sec" data-sec="${g}">${gIcon(g,ic)}<span><b>${n.replace("&","&amp;")}</b><small>${TOOLS.filter(t=>t.g===g).length} tools</small></span></button>`).join("")}</div>`+
     (!fv.length?`<p class="note" style="margin-top:16px">Tip: tap the star on any tool to pin it here.</p>`:"");}
   else{const words=q.split(/\s+/),hit=x=>words.every(w=>x.includes(w));
    const tl=visTools().filter(t=>t.id!=="trouble"&&hit((t.name+" "+t.short+" "+(GN[t.g]||"")+" "+(t.intro||"")).toLowerCase()));
    let nf=0;Object.keys(TSD).forEach(k=>TSD[k].forEach(F=>{if(hit((F.n+" "+F.d+" "+F.c.map(c=>c[0]+" "+c[1]).join(" ")).toLowerCase()))nf++;}));
    box.innerHTML=(nf?`<button class="tile feat sm" data-fq><span class="ic">${svg("trbl")}</span><span class="ft"><b>${nf} fault${nf>1?"s":""} in the Troubleshooter</b><span>Matching “${esc(HQ.trim())}”</span></span></button>`:"")+
     (tl.length?`<div class="x-h"><b>${tl.length} tool${tl.length>1?"s":""}</b></div><div class="x-lst">${tl.map(rowT).join("")}</div>`:"")+
     (!nf&&!tl.length?`<p class="note" style="margin-top:18px">Nothing matches “${esc(HQ.trim())}”. Try a shorter word, like “duct”, “trip” or “pump”.</p>`:"");}
   box.querySelectorAll("button[data-go]").forEach(b=>b.onclick=()=>openTool(b.dataset.go));
   bindRows(box);
   box.querySelectorAll("[data-sec]").forEach(b=>b.onclick=()=>go("v:sec:"+b.dataset.sec));
   const cr=box.querySelector("[data-clrrec]");if(cr)cr.onclick=()=>{REC=[];LS.set("sc.rec",REC);fill();};
   const fq=box.querySelector("[data-fq]");if(fq)fq.onclick=()=>{ST.trouble=ST.trouble||{};ST.trouble.q=HQ.trim();ST.trouble.sec="all";save();openTool("trouble");};
  };
  fill();
  const hq=document.getElementById("hq");hq.addEventListener("input",()=>{HQ=hq.value;fill();});
  app.querySelectorAll("header~[data-go]").forEach(b=>b.onclick=()=>openTool(b.dataset.go));
  app.querySelector("[data-set]").onclick=()=>go("v:set");
  app.querySelectorAll("[data-resume]").forEach(b=>b.onclick=hlResume);
}
function topBar(title,extra){return `<div class="x-top"><button type="button" class="x-btn" data-xback aria-label="Back">${svg("x_back")}</button><h2>${title}</h2>${extra||""}</div>`;}
function bindTop(){const b=app.querySelector("[data-xback]");if(b)b.onclick=()=>go("home");}
function secView(g){
  const G=GROUPS.find(x=>x[0]===g);if(!G){go("home");return;}
  const list=TOOLS.filter(t=>t.g===g);
  app.innerHTML=topBar(G[1].replace("&","&amp;"))+`<div class="x-band g-${g}"><b>${list.length} tools</b><p>${G[3]}</p></div><div class="x-lst">${list.map(rowT).join("")}</div>`;
  bindTop();bindRows(app);
}
