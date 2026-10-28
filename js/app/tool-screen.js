/* MEPify · Tool screen: fields, steppers, results readout and rendering
   by Mohamed Shafaf Karumannil */

/* ---------- steppers and readout ---------- */
function stepVal(s,dir){
  const v=num(s);if(!isFinite(v))return dir>0?"1":"0";
  const dec=(String(v).split(".")[1]||"").length;
  let st=v===0?1:Math.pow(10,Math.floor(Math.log10(Math.abs(v)))-1);if(!dec)st=Math.max(1,st);else st=Math.max(st,Math.pow(10,-dec));
  let n=v+dir*st;if(v>=0&&n<0)n=0;
  const d=Math.max(0,-Math.floor(Math.log10(st)+1e-9));return String(parseFloat(n.toFixed(d)));
}
function bindSteppers(){
  app.querySelectorAll("[data-stp]").forEach(b=>b.onclick=e=>{e.preventDefault();const i=document.getElementById(b.dataset.stp);if(!i)return;
    i.value=stepVal(i.value,+b.dataset.d);i.dispatchEvent(new Event("input",{bubbles:true}));});
}
let rdoObs=null;
function readout(t,r){
  let el=document.getElementById("rdo");
  if(!el){el=document.createElement("button");el.type="button";el.id="rdo";el.className="x-rdo";el.hidden=true;document.body.appendChild(el);
    el.onclick=()=>{const a=document.getElementById("ans");if(a)a.scrollIntoView({behavior:"smooth",block:"center"});};}
  if(!r||r.hint||r.extra){el.dataset.has="0";el.hidden=true;return;}
  el.dataset.has="1";
  el.innerHTML=`<span class="tx"><small>${esc(plain(r.cap))}</small><b>${r.big?esc(plain(r.big)):esc(plain(r.value))+(r.unit?`<i>${esc(plain(r.unit))}</i>`:"")}</b></span>${r.status?`<span class="pill ${r.status.ok?"ok":"bad"}">${r.status.ok?"OK":"Check"}</span>`:""}${svg("x_down")}`;
  const a=document.getElementById("ans");if(!a)return;
  if(rdoObs)rdoObs.disconnect();
  if("IntersectionObserver" in window){rdoObs=new IntersectionObserver(es=>{es.forEach(x=>{el.hidden=x.isIntersecting||el.dataset.has!=="1";});},{threshold:0.15});rdoObs.observe(a);}
}
function clearReadout(){const el=document.getElementById("rdo");if(el)el.remove();if(rdoObs){rdoObs.disconnect();rdoObs=null;}document.body.classList.remove("x-tool");}
window.scOpen=id=>{BACK="home";openTool(id);};
window.scGroups=()=>GROUPS.map(([g,n])=>[n,TOOLS.filter(t=>t.g===g).map(t=>[t.id,plain(t.name)])]);
function fieldHTML(t,fl,st){
  if(fl.show&&!fl.show(st))return "";
  const lab=`<span class="lbl">${fl.label}</span>${fl.help?`<span class="help">${fl.help}</span>`:""}`;
  if(fl.type==="chips")return `<div class="field">${lab}<div class="chips" data-chips="${fl.id}">${fl.options.map(o=>`<button type="button" data-v="${o[0]}" aria-pressed="${st[fl.id]===o[0]}">${o[1]}</button>`).join("")}</div></div>`;
  if(fl.type==="text")return `<label class="field">${lab}<span class="inp"><input id="f-${t.id}-${fl.id}" data-k="${fl.id}" type="text" value="${esc(st[fl.id]==null?"":st[fl.id])}" style="font-family:var(--f-body);font-size:18px"></span></label>`;
  if(fl.type==="date")return `<label class="field">${lab}<span class="inp"><input id="f-${t.id}-${fl.id}" data-k="${fl.id}" type="date" value="${st[fl.id]}"></span></label>`;
  if(fl.type==="select")return `<label class="field">${lab}<span class="inp"><select id="f-${t.id}-${fl.id}" data-k="${fl.id}">${fl.options.map(o=>`<option value="${o[0]}"${st[fl.id]===o[0]?" selected":""}>${o[1]}</option>`).join("")}</select></span></label>`;
  const us=fl.units||(fl.unitsFrom&&fl.unitsFrom(st)),uk=fl.ukey||fl.id+"_u";
  const unit=us?`<select class="u" aria-label="Unit" id="f-${t.id}-${uk}" data-k="${uk}">${us.map(u=>`<option${st[uk]===u?" selected":""}>${u}</option>`).join("")}</select>`:(fl.unitFrom||fl.unit)?`<em>${fl.unitFrom?fl.unitFrom(st):fl.unit}</em>`:"";
  const pre=fl.presets?`<div class="chips sm" data-pre="${fl.id}">${fl.presets.map(p=>`<button type="button" data-v="${p[0]}" aria-pressed="${st[fl.id]===p[0]}">${p[1]}</button>`).join("")}</div>`:"";
  return `<label class="field" data-half="${fl.half?1:0}">${lab}<span class="inp"><input id="f-${t.id}-${fl.id}" data-k="${fl.id}" type="text" inputmode="decimal" autocomplete="off" value="${st[fl.id]}" placeholder="0">${unit}<span class="x-stp"><button type="button" data-stp="f-${t.id}-${fl.id}" data-d="-1" aria-label="Decrease" tabindex="-1">−</button><button type="button" data-stp="f-${t.id}-${fl.id}" data-d="1" aria-label="Increase" tabindex="-1">+</button></span></span></label>${pre?`<div style="margin-top:-8px">${pre}</div>`:""}`;
}
function group(t,list,st){
  let out="",buf=[];
  const flush=()=>{if(buf.length){out+=buf.length===2?`<div class="row2">${buf.join("")}</div>`:buf.join("");buf=[];}};
  list.forEach(fl=>{const hh=fieldHTML(t,fl,st);if(!hh)return;if(fl.half&&!fl.presets){buf.push(hh);if(buf.length===2)flush();}else{flush();out+=hh;}});
  flush();return out;
}
function tool(){
  const t=byId(view),st=ST[t.id];
  if(t.custom){hlRender();return;}
  if(t.render){
   app.innerHTML=`<div class="bar"><button class="back" data-home aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>Back</button><button type="button" class="fav" data-fav aria-label="Favourite" aria-pressed="${FAV.includes(t.id)}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON.star}</svg></button><button class="reset" data-reset>Clear</button></div>
   <div class="tool"><div class="thead ${t.g}"><span class="ic">${svg(t.icon)}</span><div><h2>${t.name}</h2><p>${t.intro}</p></div></div><div id="custom" class="tool"></div>${t.note?`<p class="note">${t.note}</p>`:""}</div>`;
   app.querySelector("[data-home]").onclick=goBack;
   app.querySelector("[data-reset]").onclick=()=>{ST[t.id]={};save();render();};
   bindFav(t);clearReadout();
   t.render(document.getElementById("custom"),st);return;
  }
  const main=t.fields.filter(x=>!x.adv),adv=t.fields.filter(x=>x.adv);
  app.innerHTML=`<div class="bar"><button class="back" data-home aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>Back</button><button type="button" class="fav" data-fav aria-label="Favourite" aria-pressed="${FAV.includes(t.id)}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON.star}</svg></button><button class="reset" data-reset>Reset example</button></div>
  <div class="tool">
   <div class="thead ${t.g}"><span class="ic">${svg(t.icon)}</span><div><h2>${t.name}</h2><p>${t.intro}</p></div></div>
   <div class="card">${group(t,main,st)}${adv.length?`<details class="more"${open[t.id]?" open":""}><summary>More options (defaults are fine for most jobs)</summary><div class="in">${group(t,adv,st)}</div></details>`:""}</div>
   <div class="ans" id="ans" aria-live="polite"></div>
   <div id="after"></div>
   ${t.note?`<p class="note">${t.note}</p>`:""}
  </div>`;
  app.querySelector("[data-home]").onclick=goBack;
  app.querySelector("[data-reset]").onclick=()=>{ST[t.id]=defs(t);save();render();};
  bindFav(t);bindSteppers();document.body.classList.add("x-tool");
  const det=app.querySelector("details.more");if(det)det.ontoggle=()=>{open[t.id]=det.open;};
  const vis=()=>t.fields.map(x=>!x.show||x.show(st)?1:0).join("");
  app.querySelectorAll("input[data-k],select[data-k]").forEach(el=>{el.addEventListener("input",()=>{const b4=vis();st[el.dataset.k]=el.value;save();if(vis()!==b4)show();else answer();});});
  app.querySelectorAll("[data-chips]").forEach(c=>{const fl=t.fields.find(x=>x.id===c.dataset.chips);c.querySelectorAll("button").forEach(b=>b.onclick=()=>{st[fl.id]=b.dataset.v;if(fl.onSet)fl.onSet(st);save();show();});});
  app.querySelectorAll("[data-pre]").forEach(c=>{const id=c.dataset.pre;c.querySelectorAll("button").forEach(b=>b.onclick=()=>{st[id]=b.dataset.v;save();show();});});
  answer();
}
function answer(){
  const t=byId(view),st=ST[t.id],r=t.calc(st),el=document.getElementById("ans"),af=document.getElementById("after");
  if(r.hint){el.innerHTML=`<div class="cap">Answer</div><p class="hint">${r.hint}</p>`;af.innerHTML=r.after||"";readout(t,null);return}
  if(r.extra){el.innerHTML=r.extra;af.innerHTML="";readout(t,null);return}
  el.innerHTML=ansHTML(r)+`<div class="shr"><button type="button" class="shbtn" data-share><svg viewBox="0 0 24 24" aria-hidden="true">${ICON.share}</svg>Share</button><button type="button" class="shbtn pri" data-savelog><svg viewBox="0 0 24 24" aria-hidden="true">${ICON.x_save}</svg>Save to job log</button><span class="shmsg" role="status"></span></div>`;
  const sb=el.querySelector("[data-share]");sb.onclick=()=>doShare("MEPify – "+t.name,shareText(t,st,r),el.querySelector(".shr"));
  el.querySelector("[data-savelog]").onclick=()=>saveSheet(t,st,r);readout(t,r);
  af.innerHTML=r.after||"";if(t.bind)t.bind(af,st);
}
function bindFav(t){const b=app.querySelector("[data-fav]");if(b)b.onclick=()=>{toggleFav(t.id);b.setAttribute("aria-pressed",FAV.includes(t.id));};}
function ansHTML(r){
  if(r.hint)return `<div class="cap">Answer</div><p class="hint">${r.hint}</p>`;
  return `<div class="cap">${r.cap}</div>${r.big?`<div class="verdict">${r.big}</div>`:`<div class="hero"><b>${r.value}</b><i>${r.unit}</i></div>`}
   ${r.status?`<span class="pill ${r.status.ok?"ok":"bad"}">${r.status.text}</span>`:""}
   <p class="say">${r.say}</p>
   ${r.rows&&r.rows.length?`<div class="kv">${r.rows.map(x=>`<div><span>${x[0]}</span><strong>${x[1]} <small>${x[2]}</small></strong></div>`).join("")}</div>`:""}`;
}
function show(){const y=window.scrollY;const a=document.activeElement&&document.activeElement.id;tool();window.scrollTo(0,y);if(a&&document.getElementById(a))document.getElementById(a).focus({preventScroll:true});}
function render(){
  if(view!=="home"&&!isView(view)&&!byId(view))view="home";
  if(window.scSheetClose){try{window.scSheetClose();}catch(e){}window.scSheetClose=null;}
  clearReadout();
  if(view==="home")home();else if(view==="v:log")logView();else if(view==="v:set")setView();else if(view.indexOf("v:sec:")===0)secView(view.slice(6));else tool();
  tabs();
}
