/* MEPify · Air side, water side, equipment schedule, report and export screens
   by Mohamed Shafaf Karumannil */

/* ---------- AIR SIDE / WATER SIDE / SCHEDULE SCREENS ---------- */
const L2=x=>f(x,0),ductTxt=d=>d?(d.round?`Ø${d.round} or ${d.w}×${d.h}`:`${d.w}×${d.h}`):"—",pipeTxt=p=>p?`${p.dn} (${f(p.v,2)} m/s, ${f(p.R,0)} Pa/m)`:"over DN600";
const kv2=rows=>`<div class="sumg">${rows.map(r=>`<div><span>${r[0]}</span><strong>${r[1]}${r[2]?` <small>${r[2]}</small>`:""}</strong></div>`).join("")}</div>`;
const capLbl=t=>`<div class="lbl" style="font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">${t}</div>`;
function hlTermHTML(t,P){
  if(!t)return "";
  const head=t.kind==="FCU"?[["Unit",`${t.tag} · ${t.units>1?t.units+" × ":""}${t.size} CFM`],["Cooling needed",kW(t.kw),"kW"],["Chilled water",f(t.flow,2),"L/s"],["Pipe",t.pipe?t.pipe.dn:"—"]]
    :[["Box",`${t.tag} on ${esc(t.ahu)}`],["Inlet",t.inlet?`Ø${t.inlet} mm`:"over 400 mm"],["Max airflow",L2(t.q),"L/s"],["Min airflow",L2(t.qmin),"L/s"]];
  const warn=t.kind==="VAV"&&t.qmin>=t.q-0.5?`<p class="note" style="color:var(--bad)">This room needs so much fresh air that the VAV box cannot turn down. Consider a CAV box or more fresh air on the AHU.</p>`:"";
  return `${capLbl("Air side for this room")}${kv2(head.concat([["Supply diffusers",`${t.nd} × ${t.neck} mm neck`,`${L2(t.qd)} L/s each`],["Return grilles",`${t.ng} × ${t.grille}×${t.grille}`],["Branch duct",ductTxt(t.branch)]]))}${warn}`;
}
function hlAir(){
  const P=HL.norm(hlP()),A=P.air;
  return `<div class="thead hvac"><span class="ic">${svg("duct")}</span><div><h2>Air side</h2><p>Put rooms on an AHU (CAV or VAV). Every other room gets its own FCU. Sizes update from the room loads.</p></div></div>
  <div class="ans" id="hlres"></div>
  <div class="card">${hlChips("s.fahu","Fresh air for the FCU rooms",[[false,"Each FCU takes its own"],[true,"One fresh air unit (FAHU)"]])}<div id="fahures"></div></div>
  ${P.ahus.map((a,i)=>`<div class="card">
    <label class="field"><span class="lbl">AHU name</span><span class="inp"><input data-p="s.ahus.${i}.name" value="${esc(a.name)}" style="font-family:var(--f-body)"></span></label>
    ${hlChips(`s.ahus.${i}.type`,"Type",[["cav","CAV, constant volume"],["vav","VAV, variable volume"]])}
    <div class="field"><span class="lbl">Rooms it serves</span><span class="help">Tap to add or remove. A room can be on one AHU only.</span><div class="chips sm">${P.rooms.map(r=>`<button type="button" data-mem="${a.id}:${r.id}" aria-pressed="${r.sys===a.id}">${esc(r.name)}</button>`).join("")||`<span class="help">No rooms yet.</span>`}</div></div>
    ${hlNum(`s.ahus.${i}.esp`,"External static pressure","Pa",`Leave empty to use the default (${A.esp} Pa).`)}
    <div id="ahures-${a.id}"></div>
    <div class="hlbtns"><button class="golink del" data-act="delahu:${a.id}">Delete ${esc(a.name)}</button></div></div>`).join("")}
  <button class="hladd" data-act="addahu">+ Add AHU</button>
  <div class="group" style="margin-top:6px"><h2>Room terminals</h2><div id="termlist"></div></div>
  <details class="more card"><summary>Air side settings</summary><div class="in">
   ${row2(hlNum("s.air.esp","Default AHU external static","Pa"),hlNum("s.air.isp","AHU internal static","Pa","Filters, coil, casing."))}
   ${row2(hlNum("s.air.effF","Fan efficiency","%"),hlNum("s.air.effM","Motor efficiency","%"))}
   ${row2(hlNum("s.air.vMain","Main duct velocity","m/s"),hlNum("s.air.vBranch","Branch duct velocity","m/s"))}
   ${row2(hlNum("s.air.dh","Max duct height","mm"),hlNum("s.air.fcuEsp","FCU external static","Pa"))}
   ${row2(hlNum("s.air.nv","Diffuser neck velocity","m/s","About 3 m/s for quiet offices."),hlNum("s.air.darea","Floor area per diffuser","m²"))}
   ${row2(hlNum("s.air.gv","Return grille face velocity","m/s"),hlNum("s.air.boxV","VAV/CAV inlet velocity","m/s"))}
   ${hlNum("s.air.minVav","VAV minimum airflow","% of max")}
  </div></details>
  <p class="note">Generic sizes for checking and tendering. Confirm noise (NC), throw and capacity in the manufacturer's selection software.</p>`;
}
function hlWater(){
  return `<div class="thead hvac"><span class="ic">${svg("chw")}</span><div><h2>Water side</h2><p>Chillers, chilled water flow, pipe sizes and pump head, from the hour-by-hour load of every coil.</p></div></div>
  <div class="ans" id="hlres"></div>
  <div class="card">${capLbl("Chillers")}
   ${row2(hlNum("s.chw.sup","Chilled water supply","°C"),hlNum("s.chw.dt","Chilled water ΔT","K","Return minus supply, e.g. 12.5 − 7 = 5.5."))}
   ${row2(hlNum("s.chw.nCh","Duty chillers","no."),hlNum("s.chw.sbCh","Standby chillers","no."))}
   ${hlNum("s.chw.margin","Plant margin","%","Pump heat, pipe heat gain, future load.")}</div>
  <div class="card">${capLbl("Pump head (index circuit)")}
   ${row2(hlNum("s.chw.run","Longest pipe run, flow + return","m"),hlNum("s.chw.fit","Fittings allowance","% of run"))}
   ${row2(hlNum("s.chw.dpCh","Chiller evaporator","kPa"),hlNum("s.chw.dpCoil","Worst coil","kPa"))}
   ${row2(hlNum("s.chw.dpVal","Control valve","kPa"),hlNum("s.chw.dpOth","Strainer, check valve, other","kPa"))}
   ${hlNum("s.chw.effP","Pump efficiency","%")}</div>
  <div class="card">${capLbl("Pipe sizes")}<div id="pipelist"></div><p class="note">Steel pipe, sized for at most 300 Pa/m and 3 m/s.</p></div>
  <p class="note">One pump per duty chiller (constant primary). Friction uses the header size along the whole index run, which is slightly conservative.</p>`;
}
function hlSysLive(){
  const P=hlP(),S=HL.systems(P),el=document.getElementById("hlres");
  const fill=(id,h)=>{const x=document.getElementById(id);if(x)x.innerHTML=h;};
  if(S.bad){el.innerHTML=`<div class="cap">Check inputs</div><p class="hint">${esc(S.bad)}</p>`;["fahures","termlist","pipelist"].forEach(i=>fill(i,""));P.ahus.forEach(a=>fill("ahures-"+a.id,""));return;}
  if(HLS.screen==="air"){
    const real=S.ahus.filter(a=>!a.empty),fans=real.reduce((s,a)=>s+a.motor,0)+(S.fahu?S.fahu.motor:0);
    el.innerHTML=`<div class="cap">Air side</div><div class="hero"><b>${L2(S.terminals.reduce((s,t)=>s+t.q,0)*3.6)}</b><i>m³/h supply</i></div>
     <p class="say">${real.length} AHU${real.length===1?"":"s"}${S.fahu?" + 1 FAHU":""}, ${S.terminals.filter(t=>t.kind==="FCU").length} FCU${S.terminals.filter(t=>t.kind==="FCU").length===1?"":"s"} and ${S.terminals.filter(t=>t.kind!=="FCU").length} VAV/CAV box${S.terminals.filter(t=>t.kind!=="FCU").length===1?"":"es"}.</p>
     <div class="kv"><div><span>Fresh air</span><strong>${L2(S.J.oaL)} <small>L/s</small></strong></div><div><span>AHU fan motors</span><strong>${f(fans,2)} <small>kW installed</small></strong></div></div>`;
    fill("fahures",S.fahu?kv2([["Tag",S.fahu.tag],["Fresh air",L2(S.fahu.q),"L/s"],["Coil",`${kW(S.fahu.kw)} kW · ${TR(S.fahu.kw)}`,"TR"],["Peak",hh(S.fahu.pk)],["Fan motor",f(S.fahu.motor,2),"kW"],["Duct",ductTxt(S.fahu.duct)],["Chilled water",f(S.fahu.flow,2),"L/s"],["Pipe",pipeTxt(S.fahu.pipe)]])
      :`<p class="note">Fresh air is counted in each FCU's cooling.</p>`);
    S.ahus.forEach(x=>fill("ahures-"+x.a.id,x.empty?`<p class="note">Tap rooms above to put them on this AHU.</p>`
      :kv2([["Supply air",`${L2(x.q)} L/s · ${L2(x.q*3.6)}`,"m³/h"],["Fresh air",`${L2(x.oa)} L/s · ${f(x.oaf*100,0)}`,"%"],["Coil load",`${kW(x.kw)} kW · ${TR(x.kw)}`,"TR"],["Peak",hh(x.pk)],
        ["Air on coil (mixed)",f(x.tmix,1),"°C"],["Air off coil",f(x.toff,1),"°C"],["Total static",L2(x.tsp),"Pa"],["Fan power",f(x.shaft,2),"kW"],["Motor",f(x.motor,2),"kW"],
        ["Main duct",ductTxt(x.duct)],["Chilled water",f(x.flow,2),"L/s"],["Pipe",pipeTxt(x.pipe)]])));
    fill("termlist",S.terminals.map(t=>`<button class="hlrow" data-go-r="${t.r.id}"><span><b>${t.tag} · ${esc(t.r.name)}</b><small>${t.kind==="FCU"?`${t.units>1?t.units+" × ":""}${t.size} CFM · ${kW(t.kw)} kW`:`${esc(t.ahu)} · Ø${t.inlet||"—"} inlet · min ${L2(t.qmin)} L/s`} · ${t.nd} × ${t.neck} diffusers</small></span><span class="hlv">${L2(t.q)}<i>L/s</i></span></button>`).join(""));
    document.querySelectorAll("#termlist [data-go-r]").forEach(b=>b.onclick=()=>{HLS.room=b.dataset.goR;HLS.screen="room";hlRedraw(true);});
    return;
  }
  const C=S.chiller,U=S.pump,W=P.chw;
  el.innerHTML=`<div class="cap">Chiller plant · ${HL.MON[P.month-1]} ${hh(S.plantPk)}</div><div class="hero"><b>${TR(S.plant)}</b><i>TR</i></div>
   <p class="say">Plant load ${B(kW(S.plant),"kW")} including ${f(W.margin,0)} % margin. Use ${B(C.n+" × "+f(C.each/3517,1),"TR")} duty chillers${C.sb?` plus ${C.sb} standby`:""}.</p>
   <div class="kv"><div><span>Chilled water</span><strong>${f(S.flow,2)} <small>L/s · ${f(S.flow*3.6,1)} m³/h</small></strong></div><div><span>Header pipe</span><strong>${S.header?S.header.dn:"—"}</strong></div>
   <div><span>Pumps</span><strong>${U.n}${U.sb?" + "+U.sb:""} × ${f(U.flowEach,2)} <small>L/s</small></strong></div><div><span>Pump head</span><strong>${f(U.headM,1)} <small>m</small></strong></div>
   <div><span>Pump power each</span><strong>${f(U.shaft,2)} <small>kW</small></strong></div><div><span>Pump motor each</span><strong>${f(U.motor,2)} <small>kW</small></strong></div>
   <div><span>Supply / return</span><strong>${f(W.sup,1)} / ${f(W.sup+W.dt,1)} <small>°C</small></strong></div><div><span>Pipe friction part</span><strong>${f(U.fricPa/1000,0)} <small>kPa</small></strong></div></div>`;
  const coils=[...S.ahus.filter(a=>!a.empty).map(a=>[esc(a.a.name),a.kw,a.flow,a.pipe]),...(S.fahu?[[S.fahu.tag,S.fahu.kw,S.fahu.flow,S.fahu.pipe]]:[]),
    ...S.terminals.filter(t=>t.kind==="FCU").map(t=>[`${t.tag} · ${esc(t.r.name)}`,t.kw,t.flow,t.pipe]),["Chiller (each)",C.each,C.flowEach,U.pipeEach],["Main header",S.plant,S.flow,S.header]];
  fill("pipelist",`<div class="schtbl"><table><thead><tr><th>Unit</th><th>kW</th><th>L/s</th><th>Pipe</th><th>m/s</th><th>Pa/m</th></tr></thead><tbody>${coils.map(c=>`<tr><td>${c[0]}</td><td>${kW(c[1])}</td><td>${f(c[2],2)}</td><td>${c[3]?c[3].dn:"—"}</td><td>${c[3]?f(c[3].v,2):"—"}</td><td>${c[3]?f(c[3].R,0):"—"}</td></tr>`).join("")}</tbody></table></div>`);
}
function hlSchedData(S,P){
  const C=S.chiller,U=S.pump,W=P.chw,out=[],real=S.ahus.filter(a=>!a.empty);
  out.push({title:"Chillers",head:["Tag","Duty / standby","Capacity TR","Capacity kW","CHW flow L/s","Supply / return °C"],
    rows:[...Array(C.n+C.sb)].map((_,i)=>["CH-"+(i+1),i<C.n?"Duty":"Standby",f(C.each/3517,1),f(C.each/1000,1),f(C.flowEach,2),`${f(W.sup,1)} / ${f(W.sup+W.dt,1)}`])});
  out.push({title:"Chilled water pumps",head:["Tag","Duty / standby","Flow L/s","Head m","Absorbed kW","Motor kW"],
    rows:[...Array(U.n+U.sb)].map((_,i)=>["CHWP-"+(i+1),i<U.n?"Duty":"Standby",f(U.flowEach,2),f(U.headM,1),f(U.shaft,2),f(U.motor,2)])});
  const ahuRows=real.map(a=>[a.a.name,a.a.type.toUpperCase(),a.rs.map(x=>x.r.name).join("; "),L2(a.q),L2(a.q*3.6),L2(a.oa),f(a.tmix,1),f(a.toff,1),kW(a.kw),TR(a.kw),f(a.flow,2),a.pipe?a.pipe.dn:"—",L2(a.tsp),f(a.motor,2),ductTxt(a.duct)]);
  if(S.fahu)ahuRows.push([S.fahu.tag,"100 % fresh air","All FCU rooms",L2(S.fahu.q),L2(S.fahu.q*3.6),L2(S.fahu.q),f(P.db,1),"—",kW(S.fahu.kw),TR(S.fahu.kw),f(S.fahu.flow,2),S.fahu.pipe?S.fahu.pipe.dn:"—",L2(S.fahu.tsp),f(S.fahu.motor,2),ductTxt(S.fahu.duct)]);
  if(ahuRows.length)out.push({title:"Air handling units",head:["Tag","Type","Rooms served","Supply L/s","Supply m³/h","Fresh air L/s","Air on °C","Air off °C","Coil kW","Coil TR","CHW L/s","Pipe","Total static Pa","Motor kW","Main duct mm"],rows:ahuRows});
  const fcu=S.terminals.filter(t=>t.kind==="FCU");
  if(fcu.length)out.push({title:"Fan coil units",head:["Tag","Room","Airflow L/s","Airflow CFM","Size CFM","Qty","Cooling kW","CHW L/s","Pipe","ESP Pa"],
    rows:fcu.map(t=>[t.tag,t.r.name,L2(t.q),L2(t.cfm),t.size,t.units,kW(t.kw),f(t.flow,2),t.pipe?t.pipe.dn:"—",L2(t.esp)])});
  const box=S.terminals.filter(t=>t.kind!=="FCU");
  if(box.length)out.push({title:"VAV / CAV boxes",head:["Tag","Type","Room","AHU","Max L/s","Min L/s","Inlet mm","Inlet velocity m/s"],
    rows:box.map(t=>[t.tag,t.kind,t.r.name,t.ahu,L2(t.q),L2(t.qmin),t.inlet||"over 400",f(t.inV,1)])});
  out.push({title:"Diffusers, grilles and branch ducts",head:["Room","Supply L/s","Diffusers","Neck mm","L/s each","Return grilles","Grille mm","Branch duct mm"],
    rows:S.terminals.map(t=>[t.r.name,L2(t.q),t.nd,t.neck,L2(t.qd),t.ng,`${t.grille}×${t.grille}`,ductTxt(t.branch)])});
  return out;
}
function hlReportData(P,S){
  const J=HL.project(P),out=[],C=P.chw||HL.defChw();
  out.push({title:"Design basis",head:["Item","Value"],rows:[["Site",P.city||`${f(P.lat,2)}°, ${f(P.lon,2)}°`],["Latitude / longitude",`${f(P.lat,2)}° / ${f(P.lon,2)}°, UTC ${P.tz>=0?"+":""}${P.tz}`],
    ["Design month",HL.MON[P.month-1]],["Outdoor",`${f(P.db,1)} °C DB / ${f(P.wb,1)} °C WB, daily range ${f(P.dr,1)} K`],["Indoor",`${f(P.ti,1)} °C, ${f(P.rh,0)} % RH`],
    ["U-values (W/m²K)",`wall ${P.uw}, roof ${P.ur}, glass ${P.ug}`],["Glass",`SHGC ${P.shgc}, shading factor ${P.shade}`],["Construction",`${(HL.MASS[P.mass]||HL.MASS.medium).t}, ${(HL.COL[P.col]||HL.COL.medium)[1].toLowerCase()} colour`],
    ["Fresh air",`${P.rp} L/s per person + ${P.ra} L/s per m²`],["Occupied hours",`${hh(P.occS)} to ${hh(P.occE)}`],["Supply air ΔT / safety factor",`${P.dts} K / ${P.sf} %`],
    ["Chilled water",`${f(C.sup,1)} / ${f(C.sup+C.dt,1)} °C`]]});
  const rows=J.rs.map(({r,c})=>{const k=c.pk;return[r.name,f(c.area,1),r.sys&&r.sys!=="fcu"?((P.ahus||[]).find(a=>a.id===r.sys)||{name:"—"}).name:"FCU",hh(k),kW(c.sens[k]),kW(c.lat[k]),kW(c.oa[k]),kW(c.coil[k]),TR(c.coil[k]),f(c.area>0?c.coil[k]/c.area:0,0),L2(c.supply),L2(c.oaL)];});
  const tot=["Block load (all rooms together)",f(J.area,1),"",hh(J.bpk),"","","",kW(J.peak),TR(J.peak),f(J.area>0?J.peak/J.area:0,0),L2(J.supply),L2(J.oaL)];tot.total=true;rows.push(tot);
  out.push({title:"Room cooling loads",head:["Room","Area m²","Served by","Peak","Sensible kW","Latent kW","Fresh air kW","Total kW","TR","W/m²","Supply L/s","Fresh air L/s"],rows});
  if(S&&!S.bad)out.push(...hlSchedData(S,P));
  return out;
}
function hlPreview(){
  const P=hlP(),S=HL.systems(P),lb=HL.check(P)||(()=>{const r=P.rooms.find(x=>HL.checkRoom(x));return r?`${r.name}: ${HL.checkRoom(r)}`:(P.rooms.length?"":"Add a room first.");})();
  const top=`<div class="thead hvac"><span class="ic">${svg("chg")}</span><div><h2>${esc(P.name)}</h2><p>Heat load and equipment schedule · ${esc(P.city||`${f(P.lat,2)}°, ${f(P.lon,2)}°`)} · ${HL.MON[P.month-1]}${P.savedAt?" · saved "+hlWhen(P.savedAt):""}</p></div></div>`;
  if(lb)return top+`<div class="ans"><div class="cap">Check inputs</div><p class="hint">${esc(lb)}</p></div>`;
  return top+`<div class="hlbtns hlexp"><button class="golink" data-act="exp-csv">Export to Excel (CSV)</button><button class="golink" data-act="exp-pdf">Print or save PDF</button></div>
  ${S.bad?`<p class="note" style="color:var(--bad)">Equipment schedule not shown: ${esc(S.bad)}</p>`:""}
  ${hlReportData(P,S).map(s=>`<div class="card schcard"><div class="lbl">${s.title}</div><div class="schtbl"><table><thead><tr>${s.head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${s.rows.map(r=>`<tr${r.total?' class="tot"':""}>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`).join("")}
  <p class="note">${S.bad?"":`Plant ${TR(S.plant)} TR including ${f(P.chw.margin,0)} % margin. `}Prepared with MEPify by Mohamed Shafaf Karumannil. Generic sizes: confirm models, noise and capacity with the manufacturer.</p>`;
}
function hlToast(m){let el=document.getElementById("toast");if(!el){el=document.createElement("div");el.id="toast";el.setAttribute("role","status");document.body.appendChild(el);}
  el.textContent=m;el.className="show";clearTimeout(el._t);el._t=setTimeout(()=>{el.className="";},3500);}
function hlExportCSV(){
  const P=hlP(),S=HL.systems(P),lb=HL.check(P)||P.rooms.some(r=>HL.checkRoom(r))||!P.rooms.length;if(lb){hlToast("Fix the inputs before exporting.");return;}
  const q=v=>{const s=String(v==null?"":v);return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
  const lines=[q(P.name+" - Heat load and equipment schedule"),q("MEPify by Mohamed Shafaf Karumannil"),
    ["Site",P.city||`${P.lat}, ${P.lon}`,"Month",HL.MON[P.month-1],"Outdoor",`${P.db} C DB / ${P.wb} C WB`,"Indoor",`${P.ti} C / ${P.rh} %`].map(q).join(","),""];
  hlReportData(P,S).forEach(s=>{lines.push(q(s.title));lines.push(s.head.map(q).join(","));s.rows.forEach(r=>lines.push(r.map(q).join(",")));lines.push("");});
  const csv="﻿"+lines.join("\r\n"),name=(String(P.name).replace(/[^\w\- ]+/g,"").trim()||"Project")+" - report.csv";
  if(window.SiteCalcNative&&window.SiteCalcNative.save){hlToast(window.SiteCalcNative.save(name,"text/csv",csv));return;}
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);hlToast("Saved "+name);
}
function hlExportPDF(){const P=hlP();if(window.SiteCalcNative&&window.SiteCalcNative.print){window.SiteCalcNative.print(P.name+" - report");return;}window.print();}
