/* MEPify · Heat load screens: projects, rooms, settings and live results
   by Mohamed Shafaf Karumannil */

/* ---------- HEAT LOAD SCREENS ---------- */
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const HLS={projects:[],cur:null,room:null,screen:"list",armed:null,resume:null};
try{const o=JSON.parse(localStorage.getItem("sitecalc.load.v1")||"null");if(o&&Array.isArray(o.projects))HLS.projects=o.projects;if(o&&o.resume)HLS.resume=o.resume;}catch(e){}
if(!HLS.projects.length){const p=HL.defProject();p.name="Example office";HLS.projects.push(p);}
HLS.projects.forEach(HL.norm);
const hlSave=(touch=true)=>{const P=HLS.cur&&HLS.projects.find(p=>p.id===HLS.cur);if(P&&touch)P.edited=Date.now();
  if(HLS.resume&&!HLS.projects.some(p=>p.id===HLS.resume.cur))HLS.resume=null;
  try{localStorage.setItem("sitecalc.load.v1",JSON.stringify({projects:HLS.projects,resume:HLS.resume}))}catch(e){}};
const hlWhen=ms=>ms?new Date(ms).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"";
function hlResumeCard(){const R=HLS.resume,p=R&&HLS.projects.find(x=>x.id===R.cur);if(!p)return "";const r=R.room&&p.rooms.find(x=>x.id===R.room);
  const where={proj:"Project overview",set:"Design conditions",room:r?"Room: "+r.name:"Rooms",air:"Air side",water:"Water side",preview:"Preview"}[R.screen]||"Project";
  return `<button class="hlcont" data-resume><span class="ic">${svg("load")}</span><span><b>Continue heat load</b><small>${esc(p.name)} · ${esc(where)} · saved ${hlWhen(R.t)}</small></span><span class="hlgo">›</span></button>`;}
function hlResume(){const R=HLS.resume,p=R&&HLS.projects.find(x=>x.id===R.cur);if(!p)return;HLS.cur=p.id;
  HLS.room=R.room&&p.rooms.some(x=>x.id===R.room)?R.room:null;HLS.screen=R.screen==="room"&&!HLS.room?"proj":R.screen||"proj";view="load";render();window.scrollTo(0,0);}
const hlP=()=>HLS.projects.find(p=>p.id===HLS.cur);
const hlR=()=>{const p=hlP();return p&&p.rooms.find(r=>r.id===HLS.room);};
const kW=w=>f(w/1000,2),TR=w=>f(w/3517,2),hh=h=>String(h).padStart(2,"0")+":00";
function hlGet(path){const[o,...ks]=path.split(".");let x=o==="s"?hlP():hlR();for(const k of ks){if(x==null)return"";x=x[k];}return x==null?"":x;}
function hlSet(path,val){const[o,...ks]=path.split(".");let x=o==="s"?hlP():hlR();ks.slice(0,-1).forEach(k=>{if(x[k]==null)x[k]={};x=x[k];});
  const n=num(val);x[ks[ks.length-1]]=o==="s"&&ks[ks.length-1]!=="name"&&isFinite(n)?n:val;}
function hlNum(path,label,unit,help,half){return `<label class="field" data-half="${half?1:0}"><span class="lbl">${label}</span>${help?`<span class="help">${help}</span>`:""}<span class="inp"><input data-p="${path}" type="text" inputmode="decimal" autocomplete="off" value="${esc(hlGet(path))}" placeholder="0">${unit?`<em>${unit}</em>`:""}</span></label>`;}
function hlChips(path,label,opts){const v=String(hlGet(path));return `<div class="field"><span class="lbl">${label}</span><div class="chips">${opts.map(o=>`<button type="button" data-c="${path}" data-v="${o[0]}" aria-pressed="${v===String(o[0])}">${o[1]}</button>`).join("")}</div></div>`;}
const row2=(a,b)=>`<div class="row2">${a}${b}</div>`;
function hlChart(arr,pk){const mx=Math.max(1,...arr),W=240,H=64;
  return `<svg viewBox="0 0 ${W} ${H+12}" class="hlchart" role="img" aria-label="Hourly load, peak at ${hh(pk)}">${arr.map((v,i)=>{const bh=Math.max(0,v)/mx*H;return `<rect x="${i*10+1}" y="${H-bh}" width="8" height="${bh}" rx="1.5" fill="${i===pk?"var(--accent)":"var(--cool)"}" opacity="${i===pk?1:0.55}"/>`;}).join("")}${[0,6,12,18].map(h=>`<text x="${h*10+5}" y="${H+10}" text-anchor="middle">${h}</text>`).join("")}</svg>`;}
function hlRender(){
  const P=hlP(),R=hlR();
  if(HLS.screen!=="list"&&!P)HLS.screen="list";
  if(HLS.screen==="room"&&!R)HLS.screen="proj";
  const backTo=HLS.screen==="list"?"All tools":HLS.screen==="proj"?"Projects":esc(P&&P.name);
  let body="";
  body={list:hlList,proj:hlProj,set:hlSettings,room:hlRoom,air:hlAir,water:hlWater,sched:hlPreview,preview:hlPreview}[HLS.screen]();
  if(["proj","set","room","air","water"].includes(HLS.screen))body+=`<div class="hlact"><span class="hlstat" id="hlstat">${P.savedAt?"Saved "+hlWhen(P.savedAt):"Changes are kept as you type"}${P.status==="draft"?" · draft":""}</span>
    <div class="hlactb"><button class="golink" data-act="preview">Preview</button><button class="golink" data-act="save">Save</button><button class="golink pri" data-act="later">Save &amp; continue later</button></div></div>`;
  app.innerHTML=`<div class="bar"><button class="back" data-hlback><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>${backTo}</button></div><div class="tool">${body}</div>`;
  app.querySelector("[data-hlback]").onclick=()=>{hlBack()||(view="home",render());window.scrollTo(0,0);};
  app.querySelectorAll("input[data-p]").forEach(el=>el.addEventListener("input",()=>{hlSet(el.dataset.p,el.value);if(/^s\.(lat|lon|tz)$/.test(el.dataset.p))hlP().city="";hlSave();hlLive();}));
  const cs=app.querySelector("[data-city]");if(cs)cs.onchange=()=>{const c=HL.CITIES.flatMap(g=>g[1]).find(x=>x[0]===cs.value);if(c){const P=hlP();P.city=c[0];P.lat=c[1];P.lon=c[2];P.tz=c[3];hlSave();hlRedraw();}};
  app.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{const v=b.dataset.v;hlSet(b.dataset.c,v==="true"?true:v==="false"?false:v);hlSave();hlRedraw();});
  app.querySelectorAll("[data-go-p]").forEach(b=>b.onclick=()=>{HLS.cur=b.dataset.goP;HLS.screen="proj";hlRedraw(true);});
  app.querySelectorAll("[data-go-r]").forEach(b=>b.onclick=()=>{HLS.room=b.dataset.goR;HLS.screen="room";hlRedraw(true);});
  app.querySelectorAll("[data-act]").forEach(b=>b.onclick=()=>hlAction(b.dataset.act,b));
  app.querySelectorAll("[data-resume]").forEach(b=>b.onclick=hlResume);
  app.querySelectorAll("[data-mem]").forEach(b=>b.onclick=()=>{const[aid,rid]=b.dataset.mem.split(":"),r=hlP().rooms.find(x=>x.id===rid);r.sys=r.sys===aid?"fcu":aid;hlSave();hlRedraw();});
  hlLive();
}
function hlRedraw(top){const y=window.scrollY;HLS.armed=null;hlRender();window.scrollTo(0,top?0:y);}
function hlBack(){if(["room","set","air","water","sched","preview"].includes(HLS.screen)){HLS.screen="proj";hlRedraw(true);return true;}if(HLS.screen==="proj"){HLS.screen="list";hlRedraw(true);return true;}return false;}
function hlAction(a,btn){
  const P=hlP();
  if(a==="air"||a==="water"||a==="sched"||a==="preview"){HLS.screen=a==="sched"?"preview":a;hlRedraw(true);return;}
  if(a==="save"){P.savedAt=Date.now();P.status="saved";if(HLS.resume&&HLS.resume.cur===P.id)HLS.resume=null;hlSave(false);
    const s=document.getElementById("hlstat");if(s)s.textContent="Saved "+hlWhen(P.savedAt);hlToast("Saved "+P.name);return;}
  if(a==="later"){P.savedAt=Date.now();P.status="draft";HLS.resume={cur:P.id,room:HLS.room,screen:HLS.screen,t:P.savedAt};hlSave(false);
    view="home";render();window.scrollTo(0,0);hlToast("Saved as a draft. Tap Continue to pick up here.");return;}
  if(a==="exp-csv"){hlExportCSV();return;}
  if(a==="exp-pdf"){hlExportPDF();return;}
  if(a==="addahu"){HL.norm(P);P.ahus.push({id:"a"+Date.now().toString(36),name:"AHU-"+(P.ahus.length+1),type:"vav"});hlSave();hlRedraw();return;}
  if(a.startsWith("delahu:")){const id=a.slice(7);if(HLS.armed!==a){HLS.armed=a;btn.textContent="Tap again to delete";btn.classList.add("armed");return;}
    P.ahus=P.ahus.filter(x=>x.id!==id);P.rooms.forEach(r=>{if(r.sys===id)r.sys="fcu";});hlSave();hlRedraw();return;}
  if(a==="newp"){const p=HL.norm(HL.defProject());p.name="Project "+(HLS.projects.length+1);HLS.projects.push(p);HLS.cur=p.id;HLS.screen="set";}
  else if(a==="set")HLS.screen="set";
  else if(a==="addr"){const r=HL.defRoom("Room "+(P.rooms.length+1));r.sys="fcu";P.rooms.push(r);HLS.room=r.id;HLS.screen="room";}
  else if(a==="dupr"){const r=JSON.parse(JSON.stringify(hlR()));r.id=HL.defRoom("").id;r.name+=" copy";P.rooms.push(r);HLS.room=r.id;}
  else if(a==="dupp"){const p=JSON.parse(JSON.stringify(P));p.id=HL.defProject().id;p.name+=" copy";p.rooms.forEach(r=>r.id=HL.defRoom("").id);HLS.projects.push(p);HLS.cur=p.id;}
  else if(a==="delr"||a==="delp"){
    if(HLS.armed!==a){HLS.armed=a;btn.textContent="Tap again to delete";btn.classList.add("armed");return;}
    if(a==="delr"){P.rooms=P.rooms.filter(r=>r.id!==HLS.room);HLS.screen="proj";}
    else{if(HLS.resume&&HLS.resume.cur===HLS.cur)HLS.resume=null;HLS.projects=HLS.projects.filter(p=>p.id!==HLS.cur);HLS.cur=null;HLS.screen="list";}
  }
  hlSave();hlRedraw(true);
}
function hlList(){
  return `<div class="thead hvac"><span class="ic">${svg("load")}</span><div><h2>Heat load</h2><p>Room-by-room cooling load for a whole project, worked out hour by hour for the design day. Projects are saved on this phone.</p></div></div>
  ${hlResumeCard()}
  ${HLS.projects.map(p=>{const r=HL.project(p);return `<button class="hlrow" data-go-p="${p.id}"><span><b>${esc(p.name)}${p.status==="draft"?' <em class="badge">Draft</em>':""}</b><small>${p.rooms.length} room${p.rooms.length===1?"":"s"} · ${f(r.area,0)} m²${p.edited?" · edited "+hlWhen(p.edited):""}</small></span><span class="hlv">${TR(r.peak)}<i>TR</i></span></button>`;}).join("")}
  <button class="hladd" data-act="newp">+ New project</button>
  <p class="note">Method: sun position and clear-sky solar for your site and month, wall and roof heat delayed by construction mass, and stored radiant heat. Results are peak design loads for sizing. They are not an annual energy model.</p>`;
}
function hlProj(){
  const P=hlP();
  return `<label class="field"><span class="lbl">Project name</span><span class="inp"><input data-p="s.name" value="${esc(P.name)}" style="font-family:var(--f-body)"></span></label>
  <div class="ans" id="hlres"></div>
  <button class="hlrow" data-act="set"><span><b>Design conditions and building</b><small>${esc(P.city||`${f(P.lat,2)}°, ${f(P.lon,2)}°`)} · ${HL.MON[P.month-1]} · ${f(P.db,1)} °C DB / ${f(P.wb,1)} °C WB · inside ${f(P.ti,1)} °C, ${f(P.rh,0)} %</small></span><span class="hlgo">›</span></button>
  <button class="hlrow" data-act="air"><span><b>Air side</b><small>AHUs, FCUs, fresh air, ducts, diffusers, VAV/CAV boxes, fans</small></span><span class="hlgo">›</span></button>
  <button class="hlrow" data-act="water"><span><b>Water side</b><small>Chillers, chilled water flow, pipes, pumps</small></span><span class="hlgo">›</span></button>
  <button class="hlrow" data-act="preview"><span><b>Preview report</b><small>Design basis, room loads and equipment schedule · export to Excel or PDF</small></span><span class="hlgo">›</span></button>
  <div class="group" style="margin-top:6px"><h2>Rooms</h2><div id="hlrooms"></div><button class="hladd" data-act="addr">+ Add room</button></div>
  <div class="hlbtns"><button class="golink" data-act="dupp">Duplicate project</button><button class="golink del" data-act="delp">Delete project</button></div>`;
}
function hlSettings(){
  const P=hlP();
  return `<div class="thead hvac"><span class="ic">${svg("load")}</span><div><h2>Design conditions</h2><p>These apply to every room in the project. Use the values from your project's basis of design.</p></div></div>
  <div class="card">
   <div class="lbl" style="font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">Outdoor</div>
   ${row2(hlNum("s.db","Dry bulb","°C"),hlNum("s.wb","Coincident wet bulb","°C"))}
   ${row2(hlNum("s.dr","Daily range","K","Max minus min on the design day."),hlNum("s.clr","Sky clearness","×","1 = clear sky. 0.85 for dusty haze."))}
   ${hlChips("s.month","Design month",HL.MON.map((m,i)=>[i+1,m]))}
   <p class="note" style="margin-top:-8px">North of the equator the peak is usually Jun–Sep, but sun-facing (south) glass can peak in Sep–Oct. South of the equator, check Dec–Mar.</p>
  </div>
  <div class="card">
   <div class="lbl" style="font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">Site location</div>
   <label class="field"><span class="lbl">Pick a city</span><span class="help">Fills latitude, longitude and time zone. For anywhere else, type them in below.</span><span class="inp"><select data-city style="font-family:var(--f-body);font-size:17px"><option value="">${P.city?"":"Custom location"}</option>${HL.CITIES.map(([g,cs])=>`<optgroup label="${g}">${cs.map(c=>`<option value="${c[0]}"${P.city===c[0]?" selected":""}>${c[0]}</option>`).join("")}</optgroup>`).join("")}</select></span></label>
   ${row2(hlNum("s.lat","Latitude","°","Minus for south."),hlNum("s.lon","Longitude","°","Minus for west."))}
   ${row2(hlNum("s.tz","Time zone","h from UTC","Standard time, e.g. India 5.5, London 0, Houston −6."),hlNum("s.alt","Altitude","m"))}
   <p class="note" style="margin-top:-6px">Times shown are standard time. Daylight saving is not applied.</p>
  </div>
  <div class="card">
   <div class="lbl" style="font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">Indoor and system</div>
   ${row2(hlNum("s.ti","Room temperature","°C"),hlNum("s.rh","Room RH","%"))}
   ${row2(hlNum("s.occS","Occupied from","h"),hlNum("s.occE","Occupied until","h"))}
   ${row2(hlNum("s.dts","Supply air ΔT","K","Room minus supply air."),hlNum("s.sf","Safety factor","%"))}
   ${row2(hlNum("s.rp","Fresh air per person","L/s"),hlNum("s.ra","Fresh air per m²","L/s"))}
  </div>
  <div class="card">
   <div class="lbl" style="font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">Building fabric</div>
   ${row2(hlNum("s.uw","Wall U-value","W/m²K"),hlNum("s.ur","Roof U-value","W/m²K"))}
   ${row2(hlNum("s.ug","Glass U-value","W/m²K"),hlNum("s.shgc","Glass SHGC","—"))}
   ${hlNum("s.shade","Shading factor","×","1 = no shading. 0.7 for blinds or a deep overhang.")}
   ${hlChips("s.col","Outside wall and roof colour",Object.keys(HL.COL).map(k=>[k,HL.COL[k][1]]))}
   ${hlChips("s.mass","Construction weight",Object.keys(HL.MASS).map(k=>[k,HL.MASS[k].t]))}
  </div>
  <p class="note">Defaults are typical for Qatar but are not a basis of design. Fresh air defaults follow the ASHRAE 62.1 office rate.</p>`;
}
function hlRoom(){
  const R=hlR();
  return `<label class="field"><span class="lbl">Room name</span><span class="inp"><input data-p="r.name" value="${esc(R.name)}" style="font-family:var(--f-body)"></span></label>
  <div class="ans" id="hlres"></div>
  <div class="card">
   ${row2(hlNum("r.area","Floor area","m²"),hlNum("r.ht","Ceiling height","m"))}
   ${hlChips("r.h24","When is it used?",[[false,"Occupied hours only"],[true,"24 hours (control room, server)"]])}
  </div>
  <div class="card">
   <div class="lbl">Outside walls and glass</div><span class="help" style="margin-top:-10px">Wall area without the windows. Leave 0 where there is no outside wall.</span>
   <div class="hlgrid"><span></span><span>Wall m²</span><span>Glass m²</span>
   ${HL.ORI.map(([o])=>`<b>${o}</b><span class="inp"><input data-p="r.walls.${o}" type="text" inputmode="decimal" autocomplete="off" value="${esc(hlGet("r.walls."+o))}" placeholder="0" aria-label="${o} wall area"></span><span class="inp"><input data-p="r.wins.${o}" type="text" inputmode="decimal" autocomplete="off" value="${esc(hlGet("r.wins."+o))}" placeholder="0" aria-label="${o} glass area"></span>`).join("")}</div>
   ${hlChips("r.roof","Roof above is exposed to sun?",[[false,"No, floor above"],[true,"Yes, roof"]])}
   ${R.roof?hlNum("r.roofA","Roof area","m²","Leave empty to use the floor area."):""}
   ${row2(hlNum("r.part","Wall to unconditioned space","m²","Store, stair, plant room."),hlNum("r.pdt","Temperature difference","K"))}
  </div>
  <div class="card">
   ${row2(hlNum("r.people","People","persons"),hlNum("r.ach","Air leakage","ACH","0.3 typical sealed building."))}
   ${hlChips("r.act","Activity",Object.keys(HL.ACT).map(k=>[k,HL.ACT[k][2]]))}
   ${row2(hlNum("r.lights","Lighting","W/m²"),hlNum("r.equip","Equipment","W/m²","PCs ≈ 15, control panels 50 or more."))}
  </div>
  <div class="card">${hlChips("r.sys","Served by",[["fcu","Its own FCU"]].concat((hlP().ahus||[]).map(a=>[a.id,esc(a.name)])))}<div id="hlairroom"></div></div>
  <div class="card" id="hlbreak"></div>
  <div class="hlbtns"><button class="golink" data-act="dupr">Duplicate room</button><button class="golink del" data-act="delr">Delete room</button></div>`;
}
function hlLive(){
  const P=hlP(),el=document.getElementById("hlres");if(!el||!P)return;
  const M=HL.MON[P.month-1];
  if(HLS.screen==="proj"){
    const J=HL.project(P),list=document.getElementById("hlrooms");
    if(list)list.innerHTML=J.rs.map(({r,c})=>`<button class="hlrow" data-go-r="${r.id}"><span><b>${esc(r.name)}</b><small>${f(num(r.area)||0,0)} m² · peak ${hh(c.pk)} · ${f(c.supply*3.6,0)} m³/h</small></span><span class="hlv">${!HL.check(P)&&!HL.checkRoom(r)&&isFinite(c.coil[c.pk])?TR(c.coil[c.pk]):"—"}<i>TR</i></span></button>`).join("")||`<p class="note">No rooms yet.</p>`;
    if(list)list.querySelectorAll("[data-go-r]").forEach(b=>b.onclick=()=>{HLS.room=b.dataset.goR;HLS.screen="room";hlRedraw(true);});
    if(!P.rooms.length){el.innerHTML=`<div class="cap">Block load</div><p class="hint">Add a room to start.</p>`;return;}
    const bad=HL.check(P)||(()=>{const r=P.rooms.find(x=>HL.checkRoom(x));return r?`${esc(r.name)}: ${HL.checkRoom(r)}`:"";})();
    if(bad||!isFinite(J.peak)){el.innerHTML=`<div class="cap">Block load</div><p class="hint">${bad||"Check the design conditions."}</p>`;return;}
    el.innerHTML=`<div class="cap">Block load · ${M} ${hh(J.bpk)}</div><div class="hero"><b>${TR(J.peak)}</b><i>TR</i></div>
     <p class="say">The whole project peaks at ${B(kW(J.peak),"kW")} at ${hh(J.bpk)}. Size the chiller or main plant on this. Size each room's unit on its own peak below.</p>
     ${hlChart(J.block,J.bpk)}
     <div class="kv"><div><span>Sum of room peaks</span><strong>${TR(J.sumPk)} <small>TR</small></strong></div><div><span>Diversity</span><strong>${f(J.sumPk>0?J.peak/J.sumPk*100:0,0)} <small>%</small></strong></div>
     <div><span>Load density</span><strong>${f(J.area>0?J.peak/J.area:0,0)} <small>W/m²</small></strong></div><div><span>Area per TR</span><strong>${f(J.peak>0?J.area/(J.peak/3517):0,1)} <small>m²/TR</small></strong></div>
     <div><span>Supply air (sum)</span><strong>${f(J.supply*3.6,0)} <small>m³/h</small></strong></div><div><span>Fresh air</span><strong>${f(J.oaL,0)} <small>L/s</small></strong></div></div>`;
    return;
  }
  if(HLS.screen==="air"||HLS.screen==="water"){hlSysLive();return;}
  if(HLS.screen!=="room")return;
  const R=hlR(),c=HL.room(P,R),k=c.pk,tot=c.coil[k];
  {const S=HL.systems(P),box=document.getElementById("hlairroom");if(box)box.innerHTML=S.bad?"":hlTermHTML(S.terminals.find(x=>x.r.id===R.id),P);}
  const bad=HL.check(P)||HL.checkRoom(R);
  if(bad||!isFinite(tot)){el.innerHTML=`<div class="cap">Room load</div><p class="hint">${bad||"Check the inputs."}</p>`;document.getElementById("hlbreak").innerHTML="";return;}
  el.innerHTML=`<div class="cap">Room peak · ${M} ${hh(k)}</div><div class="hero"><b>${TR(tot)}</b><i>TR</i></div>
   <p class="say">${esc(R.name)} needs ${B(kW(tot),"kW")} of cooling at the coil, including ${f(c.oaL,0)} L/s of fresh air. Supply ${B(f(c.supply*3.6,0),"m³/h")} (${f(c.supply,0)} L/s) at ${f(P.dts,0)} K below room temperature.</p>
   ${hlChart(c.coil,k)}
   <div class="kv"><div><span>Room sensible</span><strong>${kW(c.sens[k])} <small>kW</small></strong></div><div><span>Room latent</span><strong>${kW(c.lat[k])} <small>kW</small></strong></div>
   <div><span>Fresh air load</span><strong>${kW(c.oa[k])} <small>kW</small></strong></div><div><span>Sensible heat ratio</span><strong>${f(c.sens[k]/(c.sens[k]+c.lat[k]),2)}</strong></div>
   <div><span>Load density</span><strong>${f(c.area>0?tot/c.area:0,0)} <small>W/m²</small></strong></div><div><span>Area per TR</span><strong>${f(tot>0?c.area/(tot/3517):0,1)} <small>m²/TR</small></strong></div></div>`;
  const parts=[["Walls",c.walls],["Roof",c.roof],["Glass, solar",c.gsol],["Glass, conduction",c.gcond],["Partitions",c.part],["People, sensible",c.people],["People, latent",c.peopleL],["Lighting",c.lights],["Equipment",c.equip],["Air leakage, sensible",c.infS],["Air leakage, latent",c.infLat],["Fresh air, sensible",c.oaS],["Fresh air, latent",c.oaLat]]
    .map(([n,a])=>[n,a[k]*c.sf]).filter(x=>Math.abs(x[1])>0.5);
  const mx=Math.max(1,...parts.map(x=>Math.abs(x[1])));
  document.getElementById("hlbreak").innerHTML=`<div class="lbl">Where the load comes from at ${hh(k)}</div><div class="hlbk">${parts.map(([n,w])=>`<span>${n}</span><span class="b"><i style="width:${Math.abs(w)/mx*100}%"${w<0?' class="neg"':""}></i></span><span class="r">${kW(w)}</span>`).join("")}</div><p class="note">kW, including the ${f(P.sf,0)} % safety factor.</p>`;
}
