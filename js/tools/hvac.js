/* MEPify · HVAC tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
{id:"cool",g:"hvac",icon:"cool",name:"Room cooling size",short:"How much AC does a room need?",
 intro:"Enter the floor area and pick the room type. You get the cooling load and the AC unit size to buy.",
 fields:[
  {id:"area",label:"Floor area",type:"num",def:"20",units:["m²","ft²"],udef:"m²"},
  {id:"type",label:"What kind of room?",type:"chips",def:"250",options:[["200","Bedroom"],["230","Living / hall"],["250","Office"],["280","Shop"],["320","Meeting room"],["380","Restaurant"],["500","Server / control room"]]},
  {id:"equip",label:"Extra equipment heat",help:"Only for big heat sources like ovens or servers. Leave 0 if unsure.",type:"num",def:"0",unit:"kW",adv:true},
  {id:"margin",label:"Safety margin",type:"num",def:"10",unit:"%",adv:true}
 ],
 calc(v){
  let a=num(v.area);if(!(a>0))return{hint:"Enter the floor area of the room."};
  if(v.area_u==="ft²")a*=0.092903;
  const kw=(a*num(v.type)/1000+(num(v.equip)||0))*(1+(num(v.margin)||0)/100),tr=kw/3.51685;
  const unit=AC.find(s=>s>=tr*0.98);
  const typ=this.fields[1].options.find(o=>o[0]===v.type)[1].toLowerCase();
  return{cap:"Cooling needed",value:f(tr,2),unit:"TR",
   say:unit?`A ${f(a,1)} m² ${typ} needs about ${B(f(kw,1),"kW")} of cooling. Buy a ${B(unit+" TR")} AC unit.`:`A ${f(a,1)} m² ${typ} needs about ${B(f(kw,1),"kW")} of cooling. That is more than one 5 TR split unit, so use ${B(Math.ceil(tr/5)+" × 5 TR")} units or a ducted system.`,
   rows:[["Cooling load",f(kw,2),"kW"],["Cooling load",f(kw*3412.14,0),"BTU/h"],["Area covered by 1 TR",f(a/tr,1),"m²"]]};
 },
 note:"<b>Quick estimate</b> for hot Gulf and Indian summers. Use it for budgets and site checks. Final design still needs a full heat load calculation."},

{id:"load",g:"hvac",icon:"load",name:"Heat load",short:"Room by room, saved projects",custom:true,fields:[],calc:()=>({hint:""})},

{id:"heat",g:"hvac",icon:"heat",name:"Quick heat load",short:"One room fast, with a breakdown",
 intro:"Enter one room at a time: size, walls, glass, people, lights and equipment. Add each room to the list to build up the total for the building.",
 fields:[
  {id:"rn",label:"Room name",type:"text",def:"Office 1"},
  {id:"L",label:"Length",type:"num",def:"6",unit:"m",half:true},
  {id:"W",label:"Width",type:"num",def:"5",unit:"m",half:true},
  {id:"H",label:"Ceiling height",type:"num",def:"3",unit:"m",half:true},
  {id:"xw",label:"Outside wall length",help:"0 for an inside room.",type:"num",def:"6",unit:"m",half:true},
  {id:"ga",label:"Window area",type:"num",def:"4",unit:"m²",half:true},
  {id:"gd",label:"Windows face",type:"chips",def:"550",options:[["120","North"],["500","East"],["300","South"],["550","West"],["0","No windows"]]},
  {id:"roof",label:"Roof exposed to sun?",type:"chips",def:"0",options:[["0","No, floor above"],["1","Yes, top floor"]]},
  {id:"np",label:"People",type:"num",def:"4",unit:"people",half:true},
  {id:"act",label:"Activity",type:"chips",def:"o",options:[["o","Office / seated"],["l","Light work"],["h","Heavy work"]]},
  {id:"lpd",label:"Lighting",type:"num",def:"12",unit:"W/m²",half:true},
  {id:"eq",label:"Equipment",help:"PCs, printers, panels and so on.",type:"num",def:"800",unit:"W",half:true},
  {id:"fa",label:"Fresh air per person",type:"num",def:"10",unit:"L/s",adv:true},
  {id:"to",label:"Outdoor design temperature",type:"num",def:"46",unit:"°C",adv:true,half:true},
  {id:"ro",label:"Outdoor RH",type:"num",def:"30",unit:"%",adv:true,half:true},
  {id:"ti",label:"Indoor temperature",type:"num",def:"24",unit:"°C",adv:true,half:true},
  {id:"ri",label:"Indoor RH",type:"num",def:"50",unit:"%",adv:true,half:true},
  {id:"uw",label:"Wall U-value",type:"num",def:"0.6",unit:"W/m²K",adv:true,half:true},
  {id:"ur",label:"Roof U-value",type:"num",def:"0.4",unit:"W/m²K",adv:true,half:true},
  {id:"ug",label:"Glass U-value",type:"num",def:"2.8",unit:"W/m²K",adv:true,half:true},
  {id:"sc",label:"Glass shading coefficient",type:"num",def:"0.5",unit:"",adv:true,half:true},
  {id:"sf",label:"Safety factor",type:"num",def:"10",unit:"%",adv:true,half:true},
  {id:"dts",label:"Supply air temperature difference",type:"num",def:"11",unit:"K",adv:true,half:true}
 ],
 calc(v){
  const L=num(v.L),W=num(v.W),H=num(v.H),xw=num(v.xw)||0,ga=num(v.ga)||0,np=num(v.np)||0,lpd=num(v.lpd)||0,eq=num(v.eq)||0;
  if(!(L>0&&W>0&&H>0))return{hint:"Enter the room length, width and height."};
  const to=num(v.to),ti=num(v.ti),ro=num(v.ro),ri=num(v.ri);if(!isFinite(to)||!isFinite(ti)||!(ro>0&&ri>0))return{hint:"Check the design conditions under More options."};
  const A=L*W,dT=to-ti,Wo=PSY.fromRH(to,ro,101.325).W,Wi=PSY.fromRH(ti,ri,101.325).W;
  const shgf=num(v.gd)||0,scf=num(v.sc)||0.5;
  const gS=ga*shgf*scf,gC=ga*(num(v.ug)||2.8)*dT;
  const wA=Math.max(xw*H-ga,0),wall=wA*(num(v.uw)||0.6)*(dT+8);
  const roof=v.roof==="1"?A*(num(v.ur)||0.4)*(dT+20):0;
  const act={o:[75,55],l:[80,140],h:[170,255]}[v.act]||[75,55];
  const pS=np*act[0],pL=np*act[1],lt=A*lpd;
  const q=np*(num(v.fa)||0),fS=1.2*q*dT,fL=3.01*q*Math.max(Wo-Wi,0)*1000;
  const sf=1+(num(v.sf)||0)/100;
  const roomS=(gS+gC+wall+roof+pS+lt+eq)*sf,roomL=pL*sf,S=roomS+fS*sf,Lt=roomL+fL*sf,tot=S+Lt,kw=tot/1000,tr=kw/3.51685;
  const sup=roomS/(1.2*(num(v.dts)||11));
  const parts=[["Glass, sun",gS],["Glass, conduction",gC],["Walls",wall],["Roof",roof],["People, sensible",pS],["People, latent",pL],["Lighting",lt],["Equipment",eq],["Fresh air, sensible",fS],["Fresh air, latent",fL]].map(p=>[p[0],p[1]*sf]);
  v._last={n:v.rn||"Room",A,kw,tr,S,L:Lt,sup};
  const rooms=Array.isArray(v.rooms)?v.rooms:[];
  const tk=rooms.reduce((a,r)=>a+r.kw,0),ta=rooms.reduce((a,r)=>a+r.A,0),ts=rooms.reduce((a,r)=>a+r.sup,0);
  const brk=`<div class="card" style="padding:10px"><div class="lbl" style="font-size:13px">Where the heat comes from</div><div class="ptab"><table class="fit"><thead><tr><th>Source</th><th>W</th><th>Share</th></tr></thead><tbody>${parts.filter(p=>p[1]>0).map(p=>`<tr><td>${p[0]}</td><td>${f(p[1],0)}</td><td>${f(p[1]/tot*100,0)} %</td></tr>`).join("")}</tbody></table></div></div>`;
  const list=`<div class="card" style="padding:12px;gap:10px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div class="lbl">Rooms in this project</div><button type="button" class="back" data-addroom>+ Add “${esc(v.rn||"Room")}” to the list</button></div>
   ${rooms.length?`<div class="ptab"><table><thead><tr><th>Room</th><th>m²</th><th>kW</th><th>TR</th><th>Supply L/s</th><th></th></tr></thead><tbody>${rooms.map((r,i)=>`<tr><td>${esc(r.n)}</td><td>${f(r.A,1)}</td><td>${f(r.kw,2)}</td><td>${f(r.tr,2)}</td><td>${f(r.sup,0)}</td><td><button type="button" class="reset" data-delroom="${i}" aria-label="Remove ${esc(r.n)}">Remove</button></td></tr>`).join("")}<tr><td><b>Total</b></td><td><b>${f(ta,1)}</b></td><td><b>${f(tk,2)}</b></td><td><b>${f(tk/3.51685,2)}</b></td><td><b>${f(ts,0)}</b></td><td></td></tr></tbody></table></div><p class="note">Building total: ${B(f(tk/3.51685,1),"TR")} (${f(tk,1)} kW) for ${f(ta,0)} m². Add a diversity factor before sizing a central plant.</p>`:`<p class="note">No rooms yet. Change the inputs for each room and tap Add.</p>`}</div>`;
  return{cap:"Room cooling load",value:f(tr,2),unit:"TR",
   say:`${esc(v.rn||"This room")} (${f(A,1)} m²) needs ${B(f(kw,2),"kW")} of cooling: ${f(S/1000,2)} kW sensible and ${f(Lt/1000,2)} kW latent. Supply about ${B(f(sup,0),"L/s")} (${f(sup*2.119,0)} CFM) of air at ${f(num(v.dts)||11,0)} K below room temperature.`,
   rows:[["Total load",f(kw*3412.14,0),"BTU/h"],["Sensible heat ratio",f(S/tot,2),""],["Load per area",f(tot/A,0),"W/m²"],["Area per TR",f(A/tr,1),"m²/TR"],["Fresh air",f(q,0),"L/s"],["Supply airflow",f(sup*3.6,0),"m³/h"]],
   after:brk+list};
 },
 bind(el,st){
  const a=el.querySelector("[data-addroom]");if(a)a.onclick=()=>{if(!st._last)return;if(!Array.isArray(st.rooms))st.rooms=[];st.rooms.push(st._last);save();show();};
  el.querySelectorAll("[data-delroom]").forEach(b=>b.onclick=()=>{st.rooms.splice(+b.dataset.delroom,1);save();show();});
 },
 note:"Peak-hour estimate using equivalent temperature differences and Gulf solar gains (west glass 550 W/m², east 500, south 300, north 120). Defaults are for Qatar summer design (46 °C). Good for checks and budgets; use HAP or a full CLTD/RTS method for final design."},

{id:"mflow",g:"hvac",icon:"mflow",name:"Mass flow and volume flow",short:"kg/s ↔ m³/s using density (kg/m³)",
 intro:"Mass flow (kg/s) and volume flow (m³/s) are linked by the fluid density (kg/m³). Pick the fluid and what you know. You get the other values in all common units.",
 fields:[
  {id:"mode",label:"What do you want to find?",type:"chips",def:"vol",options:[["vol","Volume flow"],["mass","Mass flow"],["rho","Density"]]},
  {id:"fl",label:"Fluid",type:"chips",def:"water",options:[["water","Water"],["air","Air"],["custom","Other (enter density)"]],show:v=>v.mode!=="rho"},
  {id:"t",label:"Fluid temperature",type:"num",def:"12",unit:"°C",half:true,show:v=>v.mode!=="rho"&&v.fl!=="custom"},
  {id:"alt",label:"Site altitude",help:"Air only. Ras Laffan is about 5 m.",type:"num",def:"0",unit:"m",half:true,show:v=>v.mode!=="rho"&&v.fl==="air"},
  {id:"rho",label:"Density",type:"num",def:"1000",unit:"kg/m³",show:v=>v.mode!=="rho"&&v.fl==="custom"},
  {id:"m",label:"Mass flow",type:"num",def:"25",units:["kg/s","kg/h","t/h","lb/h"],udef:"kg/s",show:v=>v.mode!=="mass"},
  {id:"q",label:"Volume flow",type:"num",def:"0.025",units:["m³/s","m³/h","L/s","CFM","US GPM"],udef:"m³/s",show:v=>v.mode!=="vol"}
 ],
 calc(v){
  const MU={"kg/s":1,"kg/h":1/3600,"t/h":1000/3600,"lb/h":0.45359237/3600},QU={"m³/s":1,"m³/h":1/3600,"L/s":0.001,"CFM":0.000471947,"US GPM":0.0000630902};
  const t=num(v.t),alt=num(v.alt)||0;let rho,src="";
  if(v.mode==="rho"){const m=num(v.m)*MU[v.m_u||"kg/s"],q=num(v.q)*QU[v.q_u||"m³/s"];
   if(!(m>0&&q>0))return{hint:"Enter the mass flow and the volume flow."};
   rho=m/q;
   return{cap:"Density",value:f(rho,rho<10?3:1),unit:"kg/m³",say:`${B(f(m,3),"kg/s")} ÷ ${B(f(q,4),"m³/s")} = ${B(f(rho,rho<10?3:1),"kg/m³")}. `+(rho>950&&rho<1010?"That is about water.":rho>1&&rho<1.4?"That is about air.":""),
    rows:[["Specific volume",f(1/rho,4),"m³/kg"],["Relative to water",f(rho/1000,3),""],["In lb/ft³",f(rho*0.062428,3),"lb/ft³"]]};}
  if(v.fl==="water"){if(!(t>=0&&t<=100))return{hint:"Water temperature must be 0 to 100 °C."};rho=1000*(1-(t+288.9414)/(508929.2*(t+68.12963))*(t-3.9863)**2);src=`water at ${f(t,1)} °C`;}
  else if(v.fl==="air"){if(!(t>-50&&t<200))return{hint:"Air temperature must be −50 to 200 °C."};if(!(alt>=-400&&alt<6000))return{hint:"Enter an altitude between 0 and 6000 m."};
   rho=PSY.p(alt)*1000/(287.05*(t+273.15));src=`dry air at ${f(t,1)} °C${alt?`, ${f(alt,0)} m altitude`:""}`;}
  else{rho=num(v.rho);if(!(rho>0))return{hint:"Enter the fluid density in kg/m³."};src=`density ${f(rho)} kg/m³`;}
  let m,q;
  if(v.mode==="vol"){m=num(v.m)*MU[v.m_u||"kg/s"];if(!(m>0))return{hint:"Enter the mass flow."};q=m/rho;}
  else{q=num(v.q)*QU[v.q_u||"m³/s"];if(!(q>0))return{hint:"Enter the volume flow."};m=q*rho;}
  const rq=[["Volume flow",f(q,4),"m³/s"],["Volume flow",f(q*3600,1),"m³/h"],["Volume flow",f(q*1000,2),"L/s"],[v.fl==="air"?"Airflow":"Flow",f(v.fl==="air"?q/0.000471947:q/0.0000630902,0),v.fl==="air"?"CFM":"US GPM"]];
  const rm=[["Mass flow",f(m,3),"kg/s"],["Mass flow",f(m*3600,0),"kg/h"],["Mass flow",f(m*3.6,2),"t/h"]];
  const rows=(v.mode==="vol"?rq.slice(1):rm.slice(1)).concat(v.mode==="vol"?rm.slice(0,1):rq.slice(0,2)).concat([["Density used",f(rho,rho<10?3:1),"kg/m³"]]);
  return v.mode==="vol"?{cap:"Volume flow",value:f(q*1000,2),unit:"L/s",say:`${B(f(m,3),"kg/s")} of ${src} (${f(rho,rho<10?3:1)} kg/m³) is ${B(f(q,4),"m³/s")}, which is ${B(f(q*3600,1),"m³/h")}.`,rows}
   :{cap:"Mass flow",value:f(m,3),unit:"kg/s",say:`${B(f(q*3600,1),"m³/h")} of ${src} (${f(rho,rho<10?3:1)} kg/m³) is ${B(f(m,3),"kg/s")}, which is ${B(f(m*3600,0),"kg/h")}.`,rows};
 },
 note:"Volume flow = mass flow ÷ density. kg/s and kg/m³ are different quantities and cannot be converted directly. Water density from the Kell equation; dry air from the ideal gas law at the altitude pressure. Humid air is about 1 % lighter."},

{id:"ach",g:"hvac",icon:"ach",name:"Air changes",short:"Airflow needed for a room",
 intro:"Enter the room size and how many times per hour the air must be replaced.",
 fields:[
  {id:"L",label:"Length",type:"num",def:"5",unit:"m",half:true},
  {id:"W",label:"Width",type:"num",def:"4",unit:"m",half:true},
  {id:"H",label:"Ceiling height",type:"num",def:"3",unit:"m"},
  {id:"n",label:"Air changes per hour",type:"num",def:"6",unit:"ACH",presets:[["4","Store 4"],["6","Office 6"],["10","Toilet 10"],["15","Kitchen 15"]]}
 ],
 calc(v){
  const L=num(v.L),W=num(v.W),H=num(v.H),n=num(v.n);
  if(!(L>0&&W>0&&H>0))return{hint:"Enter length, width and height of the room."};
  if(!(n>0))return{hint:"Enter how many air changes per hour you need."};
  const vol=L*W*H,q=vol*n;
  return{cap:"Airflow needed",value:f(q,0),unit:"m³/h",
   say:`This ${f(vol,1)} m³ room needs ${B(f(q,0),"m³/h")} of air (${B(f(q/1.699,0),"CFM")}) to change the air ${f(n)} times an hour.`,
   rows:[["Airflow",f(q/1.699,0),"CFM"],["Airflow",f(q/3.6,1),"L/s"],["Room volume",f(vol,1),"m³"]]};
 }},

{id:"duct",g:"hvac",icon:"duct",name:"Duct size",short:"Round and rectangular duct from airflow",
 intro:"Enter the airflow and pick where the duct is. You get the duct size to use.",
 fields:[
  {id:"q",label:"Airflow",type:"num",def:"1500",units:["m³/h","CFM","L/s"],udef:"m³/h"},
  {id:"v",label:"Where is the duct?",help:"Sets the air speed. Lower speed is quieter but needs a bigger duct.",type:"num",def:"5",unit:"m/s",presets:[["3","Quiet room 3"],["4","Branch 4"],["5","Main duct 5"],["7","Plant room 7"]]},
  {id:"h",label:"Maximum duct height",help:"For the rectangular size, from the ceiling space you have.",type:"num",def:"250",unit:"mm",adv:true}
 ],
 calc(v){
  const qv=num(v.q),vel=num(v.v),h=num(v.h)||250;
  if(!(qv>0))return{hint:"Enter the airflow."};if(!(vel>0))return{hint:"Pick or enter an air speed."};
  const Q=qv*(AIRF[v.q_u]||AIRF["m³/h"]),A=Q/vel,D=Math.sqrt(4*A/Math.PI)*1000;
  const Dr=ROUND.find(d=>d>=D)||Math.ceil(D/50)*50;
  const vr=Q/(Math.PI/4*(Dr/1000)**2);
  let hh=Math.max(100,Math.round(h/50)*50),w=100;
  while(DE(w,hh)<D&&w<6000)w+=50;
  if(w<hh){let s2=100;while(DE(s2,s2)<D)s2+=50;w=hh=s2;}
  const vrect=Q/(w/1000*hh/1000);
  return{cap:"Round duct",value:"Ø "+Dr,unit:"mm",
   say:`Use a ${B("Ø "+Dr,"mm")} round duct or a ${B(w+" × "+hh,"mm")} rectangular duct. Air speed will be about ${f(vr,1)} m/s.`,
   rows:[["Rectangular",w+" × "+hh,"mm"],["Speed in rectangular",f(vrect,1),"m/s"],["Exact round size",f(D,0),"mm"],["Airflow",f(Q*1000,0),"L/s"]]};
 },
 note:"Round size is set by air speed. The rectangular size has the same pressure loss as the exact round size, so it can carry the same air. For long runs, check pressure drop too (aim for about 1 Pa per metre)."},

{id:"chw",g:"hvac",icon:"chw",name:"Chilled water flow",short:"Water flow and pipe size",
 intro:"Enter the cooling load. You get the water flow and the pipe size to use.",
 fields:[
  {id:"load",label:"Cooling load",type:"num",def:"100",units:["kW","TR"],udef:"kW"},
  {id:"dt",label:"Water temperature difference",help:"Return minus supply, for example 12.5 − 7 = 5.5 °C.",type:"num",def:"5.5",unit:"°C",presets:[["5","5"],["5.5","5.5"],["6","6"],["8","8"]]},
  {id:"vmax",label:"Maximum water speed in pipe",type:"num",def:"1.5",unit:"m/s",adv:true}
 ],
 calc(v){
  let kw=num(v.load);const dt=num(v.dt),vmax=num(v.vmax)||1.5;
  if(!(kw>0))return{hint:"Enter the cooling load."};if(!(dt>0))return{hint:"Enter the water temperature difference."};
  if(v.load_u==="TR")kw*=3.51685;
  const ls=kw/(4.186*dt),q=ls/1000;
  const p=PIPE.find(p=>q/(Math.PI/4*(p[1]/1000)**2)<=vmax);
  const vp=p?q/(Math.PI/4*(p[1]/1000)**2):NaN;
  return{cap:"Water flow",value:f(ls,2),unit:"L/s",
   say:p?`Flow needed is ${B(f(ls,2),"L/s")} (${f(ls*3.6,1)} m³/h). Use ${B(p[0])} pipe. Water speed will be ${f(vp,2)} m/s.`:`Flow needed is ${B(f(ls,2),"L/s")} (${f(ls*3.6,1)} m³/h). That is bigger than DN400, so split it over two pipes.`,
   rows:[["Flow",f(ls*3.6,2),"m³/h"],["Flow",f(ls*15.8503,1),"US GPM"],["Cooling load",f(kw/3.51685,1),"TR"]]};
 },
 note:"Plain water, steel pipe sizes (schedule 40). For glycol mixes, add 10 to 15 % to the flow."},

{id:"air",g:"hvac",icon:"air",name:"Coil capacity check",short:"Cooling from airflow and temperatures",
 intro:"Use during testing and balancing. Measure the airflow and the air temperature before and after the coil.",
 fields:[
  {id:"q",label:"Measured airflow",type:"num",def:"3000",units:["m³/h","CFM","L/s"],udef:"m³/h"},
  {id:"t1",label:"Air temperature entering coil",type:"num",def:"26",unit:"°C",half:true},
  {id:"t2",label:"Air temperature leaving coil",type:"num",def:"14",unit:"°C",half:true}
 ],
 calc(v){
  const qv=num(v.q),t1=num(v.t1),t2=num(v.t2);
  if(!(qv>0))return{hint:"Enter the measured airflow."};if(!isFinite(t1)||!isFinite(t2))return{hint:"Enter both air temperatures."};
  const ls=qv*(AIRF[v.q_u]||AIRF["m³/h"])*1000,dt=Math.abs(t1-t2),kw=1.2*ls*dt/1000;
  if(dt===0)return{hint:"Both temperatures are the same, so the coil is not cooling or heating the air."};
  if(t2>t1)return{cap:"Sensible heating",value:f(kw,1),unit:"kW",
   say:`The leaving air is warmer, so this coil is heating. It is adding about ${B(f(kw,1),"kW")} of heat to the air, with a ${f(dt,1)} °C temperature rise.`,
   rows:[["Airflow",f(ls,0),"L/s"],["Temperature rise",f(dt,1),"°C"]]};
  return{cap:"Sensible cooling",value:f(kw,1),unit:"kW",
   say:`The coil is removing about ${B(f(kw,1),"kW")} (${f(kw/3.51685,2)} TR) of heat from the air, with a ${f(dt,1)} °C temperature drop.`,
   rows:[["Sensible cooling",f(kw/3.51685,2),"TR"],["Airflow",f(ls,0),"L/s"],["Temperature drop",f(dt,1),"°C"]]};
 },
 note:"This is <b>sensible</b> cooling only. Total cooling, including moisture removed, is usually 20 to 35 % higher in humid weather."},

{id:"grille",g:"hvac",icon:"grille",name:"Grille & diffuser size",short:"Neck size from airflow",
 intro:"Enter the airflow and pick the outlet type. You get the size to use and its velocity.",
 fields:[
  {id:"Q",label:"Airflow per outlet",type:"num",def:"500",units:["m³/h","CFM","L/s"],udef:"m³/h"},
  {id:"t",label:"Outlet type",type:"chips",def:"3",options:[["3","Ceiling diffuser (quiet)"],["3.5","Ceiling diffuser (office)"],["2.5","Supply grille"],["2","Return grille"],["1.5","Transfer / door grille"]]},
  {id:"fa",label:"Free area of the grille",type:"num",def:"75",unit:"%",adv:true}
 ],
 calc(v){
  const Q=airQ(v,"Q"),vm=num(v.t),fa=(num(v.fa)||75)/100;if(!(Q>0))return{hint:"Enter the airflow."};
  const neck=v.t==="3"||v.t==="3.5",Aneed=Q/vm/(neck?1:fa),SZ=[150,200,225,250,300,375,450,525,600,750,900];
  const s=SZ.find(x=>(x/1000)**2>=Aneed)||Math.ceil(Math.sqrt(Aneed)*1000/50)*50,va=Q/((s/1000)**2*(neck?1:fa));
  const rect=[[300,150],[400,150],[400,200],[500,200],[600,200],[500,300],[600,300],[800,300],[1000,300],[800,400],[1000,400],[1200,400]].find(([a,b])=>a*b/1e6*fa>=Q/vm);
  return{cap:neck?"Diffuser neck size":"Grille size",value:`${s} × ${s}`,unit:"mm",
   say:`Use a ${B(s+" × "+s,"mm")} ${neck?"neck":"grille"}. ${neck?"Neck":"Free-area"} velocity will be about ${f(va,2)} m/s, against a limit of ${f(vm,1)} m/s for quiet operation.`+(!neck&&rect?` A rectangular option is ${B(rect[0]+" × "+rect[1],"mm")}.`:""),
   rows:[["Area needed",f(Aneed,3),"m²"],["Velocity",f(va,2),"m/s"],["Airflow",f(Q*1000,0),"L/s"]]};
 },
 note:"Face or neck velocity limits keep noise down (about NC 30–35). Check throw and noise in the maker's catalogue for the final choice."},

{id:"oa621",g:"hvac",icon:"oa",name:"Fresh air (ASHRAE 62.1)",short:"Outdoor air from people and area",
 intro:"Pick the space type and enter the people and floor area. You get the outdoor air the room needs.",
 fields:[
  {id:"sp",label:"Space type",type:"select",def:"2.5|0.3",options:[["2.5|0.3","Office / control room"],["2.5|0.3|c","Meeting room"],["5|0.6","Classroom (age 9+)"],["3.8|0.6","Retail / sales"],["3.8|0.9","Restaurant dining"],["2.5|0.3|h","Hotel bedroom"],["10|0.3","Gym"],["3.8|0.3","Lobby / reception"],["0|0.3","Corridor"]]},
  {id:"Pz",label:"People",type:"num",def:"12",unit:"people",half:true},
  {id:"Az",label:"Floor area",type:"num",def:"120",unit:"m²",half:true},
  {id:"Ez",label:"Air distribution",type:"chips",def:"1",options:[["1","Ceiling supply, cool air"],["0.8","Ceiling supply, warm air"],["1.2","Floor supply (UFAD)"]],adv:true}
 ],
 calc(v){
  const[rp,ra]=String(v.sp).split("|").map(Number),P=num(v.Pz)||0,A=num(v.Az)||0,Ez=num(v.Ez)||1;if(!(P>0||A>0))return{hint:"Enter the people or the floor area."};
  const Vbz=rp*P+ra*A,Voz=Vbz/Ez;
  return{cap:"Outdoor air needed",value:f(Voz,0),unit:"L/s",
   say:`${f(P)} people × ${rp} L/s plus ${f(A)} m² × ${ra} L/s/m² gives ${B(f(Voz,0),"L/s")} (${f(Voz*3.6,0)} m³/h) of outdoor air.`+(P>0?` That is ${f(Voz/P,1)} L/s per person.`:""),
   rows:[["Outdoor air",f(Voz*3.6,0),"m³/h"],["Outdoor air",f(Voz*2.11888,0),"CFM"],["People part",f(rp*P/Ez,0),"L/s"],["Area part",f(ra*A/Ez,0),"L/s"]]};
 },
 note:"ASHRAE 62.1 ventilation rate procedure: Vbz = Rp·Pz + Ra·Az, Voz = Vbz ÷ Ez. Local codes and the project spec may need more."},

{id:"batt",g:"hvac",icon:"batt",name:"Battery room ventilation",short:"Hydrogen extract to IEC 62485-2",
 intro:"Enter the battery type, number of cells and capacity. You get the extract airflow needed to keep hydrogen below the safe limit.",
 fields:[
  {id:"bt",label:"Battery type",type:"chips",def:"vrla",options:[["vrla","VRLA (sealed lead-acid)"],["vla","Vented lead-acid"],["nicd","Vented NiCd"]]},
  {id:"ch",label:"Charging condition",type:"chips",def:"f",options:[["f","Float"],["b","Boost"]]},
  {id:"n",label:"Number of cells",help:"Lead-acid cells are 2 V, NiCd 1.2 V. A 110 V lead-acid bank has about 55 cells.",type:"num",def:"55",unit:"cells",half:true},
  {id:"C",label:"Capacity (C10 / C5)",type:"num",def:"300",unit:"Ah",half:true}
 ],
 calc(v){
  const n=num(v.n),C=num(v.C);if(!(n>0&&C>0))return{hint:"Enter the number of cells and the capacity."};
  const Ig={vrla:{f:1,b:8},vla:{f:5,b:20},nicd:{f:5,b:50}}[v.bt][v.ch],Q=0.05*n*Ig*C/1000,ls=Q/3.6;
  return{cap:"Extract airflow needed",value:f(Q,1),unit:"m³/h",
   say:`${f(n)} cells of ${f(C)} Ah on ${v.ch==="f"?"float":"boost"} charge give off hydrogen that needs ${B(f(Q,1),"m³/h")} (${f(ls,2)} L/s) of extract air. For natural ventilation, inlet and outlet openings of at least ${B(f(28*Q,0),"cm²")} each are needed.`,
   rows:[["Airflow",f(ls,2),"L/s"],["Airflow",f(Q*0.588578,1),"CFM"],["Gas current Igas",f(Ig,0),"mA/Ah"],["Natural vent area",f(28*Q,0),"cm²"]]};
 },
 note:"IEC 62485-2: Q = 0.05 × n × Igas × Crt × 10⁻³ m³/h. Natural ventilation area A = 28 × Q cm². Locate the extract at high level; hydrogen rises. Your project spec and C&E for the battery room govern."},

{id:"btemp",g:"hvac",icon:"btemp",name:"Battery temperature",short:"Life at temperature, charge voltage, room cooling",
 intro:"Batteries last longest at 20–25 °C. Check how heat shortens life, the charge voltage to set for the temperature, and the cooling a battery room needs.",
 fields:[
  {id:"mode",label:"What do you need?",type:"chips",def:"room",options:[["room","Room heat & cooling"],["life","Life at temperature"],["comp","Charge voltage"]]},
  {id:"bt",label:"Battery type",type:"chips",def:"vrla",options:[["vrla","VRLA (sealed lead-acid)"],["vla","Vented lead-acid"],["nicd","Vented NiCd"],["li","Lithium-ion"]],onSet:v=>{v.vf={vrla:"2.27",vla:"2.23",nicd:"1.42",li:"3.40"}[v.bt];}},
  {id:"n",label:"Number of cells",type:"num",def:"55",unit:"cells",half:true,show:v=>v.mode!=="life"},
  {id:"C",label:"Capacity",type:"num",def:"300",unit:"Ah",half:true,show:v=>v.mode==="room"},
  {id:"vf",label:"Float voltage per cell at reference temperature",help:"From the battery datasheet.",type:"num",def:"2.27",unit:"V/cell",show:v=>v.mode==="comp"},
  {id:"Tb",label:"Battery temperature",type:"num",def:"35",unit:"°C",show:v=>v.mode!=="room"},
  {id:"yrs",label:"Design life at 20–25 °C",type:"num",def:"10",unit:"years",show:v=>v.mode==="life"},
  {id:"ch",label:"Charging state",type:"chips",def:"f",options:[["f","Float"],["b","Boost / equalise"]],show:v=>v.mode==="room"},
  {id:"oth",label:"Charger, UPS and other heat in the room",help:"From the charger or UPS datasheet (losses), plus lights.",type:"num",def:"1.2",unit:"kW",show:v=>v.mode==="room"},
  {id:"A",label:"Wall and roof area exposed to outside",type:"num",def:"40",unit:"m²",half:true,show:v=>v.mode==="room"},
  {id:"U",label:"Average U-value",type:"num",def:"0.6",unit:"W/m²K",half:true,show:v=>v.mode==="room"},
  {id:"Q",label:"Extract airflow",help:"Use the Battery room ventilation tool. The same amount of outdoor air comes in.",type:"num",def:"150",unit:"m³/h",show:v=>v.mode==="room"},
  {id:"To",label:"Outdoor design temperature",type:"num",def:"46",unit:"°C",half:true,show:v=>v.mode==="room"},
  {id:"Tr",label:"Room target",type:"num",def:"25",unit:"°C",half:true,show:v=>v.mode==="room"}
 ],
 calc(v){
  const bt=v.bt,NM={vrla:"VRLA",vla:"vented lead-acid",nicd:"NiCd",li:"lithium-ion"}[bt];
  if(v.mode==="life"){
   const T=num(v.Tb),y=num(v.yrs);if(!isFinite(T))return{hint:"Enter the battery temperature."};
   const base=bt==="nicd"?20:25,halfK={vrla:8.3,vla:8.3,nicd:20,li:15}[bt],fac=T<=base?1:Math.pow(0.5,(T-base)/halfK);
   const rws=[20,25,30,35,40,45,50].map(t=>({cls:Math.abs(t-T)<2.5?"sel":"",c:[t+" °C",f((t<=base?1:Math.pow(0.5,(t-base)/halfK))*100,0)+" %",y>0?f(y*(t<=base?1:Math.pow(0.5,(t-base)/halfK)),1)+" yrs":"—"]}));
   return{cap:"Expected life",value:y>0?f(y*fac,1):f(fac*100,0),unit:y>0?"years":"% of rated",status:{ok:fac>=0.7,text:fac>=0.95?"Good temperature":fac>=0.7?"Some life lost":"Large life loss"},
    say:`A ${NM} battery kept at ${f(T,1)} °C lasts about ${B(f(fac*100,0),"%")} of its rated life`+(y>0?`, so ${B(f(y*fac,1),"years")} instead of ${f(y,0)}.`:".")+(T>base?` Every ${f(halfK,0)} K above ${base} °C roughly halves ${bt==="nicd"?"remaining ":""}life. Keep the room at 20–25 °C with air conditioning.`:" That is at or below the reference temperature, so no life is lost to heat."),
    rows:[["Life factor",f(fac,2),"×"],["Reference temperature",base,"°C"],["Halves every",f(halfK,1),"K"]],after:tbl(["Room temperature","Life","Years"],rws)};
  }
  if(v.mode==="comp"){
   const n=num(v.n),T=num(v.Tb),vf=num(v.vf);if(!(n>0&&vf>0))return{hint:"Enter the cells and float voltage."};if(!isFinite(T))return{hint:"Enter the battery temperature."};
   if(bt==="li")return{cap:"Charge voltage",value:f(n*vf,1),unit:"V",say:`Lithium-ion batteries are not temperature-compensated: the battery management system (BMS) controls charging. Keep the float at ${B(f(n*vf,1),"V")} and the room at 15–30 °C. Charging below 0 °C damages the cells.`,rows:[["Per cell",f(vf,3),"V"]]};
   const ref=bt==="nicd"?20:25,k={vrla:-0.003,vla:-0.0025,nicd:-0.0025}[bt],Tc=Math.min(Math.max(T,0),45),vc=vf+k*(Tc-ref);
   return{cap:"Float voltage to set",value:f(n*vc,1),unit:"V",
    say:`At ${f(T,1)} °C, set the charger to ${B(f(vc,3),"V per cell")}, which is ${B(f(n*vc,1),"V")} for ${f(n,0)} cells (${f(n*vf,1)} V at ${ref} °C). Too high in a hot room overcharges and dries out the battery; too low in a cold room undercharges it.`+(T!==Tc?" Compensation is usually limited to 0–45 °C, so that limit is applied.":""),
    rows:[["Per cell",f(vc,3),"V"],["Change",f((vc-vf)*n,2),"V"],["Compensation",f(k*1000,1),"mV/°C/cell"],["Reference",ref,"°C"]]};
  }
  const n=num(v.n),C=num(v.C),oth=(num(v.oth)||0)*1000,A=num(v.A)||0,U=num(v.U)||0,Qa=num(v.Q)||0,To=num(v.To),Tr=num(v.Tr);
  if(!(n>0&&C>0))return{hint:"Enter the cells and capacity."};if(!isFinite(To)||!isFinite(Tr))return{hint:"Enter the outdoor and room temperatures."};
  const vc={vrla:2.27,vla:2.23,nicd:1.42,li:3.4}[bt],mA={vrla:{f:1,b:8},vla:{f:1,b:4},nicd:{f:1,b:10},li:{f:0.05,b:0.05}}[bt][v.ch];
  const Pb=n*vc*mA*C/1000,Pw=U*A*(To-Tr),Pv=1.2*Qa/3600*1006*(To-Tr),tot=Pb+oth+Pw+Pv,tr=tot/3517;
  const Tfree=Qa>0?To+(Pb+oth)/(1.2*Qa/3600*1006):NaN;
  return{cap:"Cooling needed",value:f(tot/1000,2),unit:"kW",status:{ok:true,text:`${f(tr,2)} TR to hold ${f(Tr,0)} °C`},
   say:`The batteries give off about ${B(f(Pb,0),"W")} on ${v.ch==="f"?"float":"boost"} charge. With the charger and UPS (${f(oth/1000,1)} kW), wall gains and the hot outdoor air drawn in by the extract fan, the room needs ${B(f(tot/1000,2),"kW")} (${f(tr,2)} TR) of cooling to stay at ${f(Tr,0)} °C.`+(isFinite(Tfree)?` With ventilation only and no AC, the room would reach about ${B(f(Tfree,0),"°C")}.`:"")+" Use AC sized for this, with the extract fan still running for hydrogen.",
   rows:[["Battery heat",f(Pb,0),"W"],["Charger / UPS / lights",f(oth,0),"W"],["Walls and roof",f(Pw,0),"W"],["Ventilation air",f(Pv,0),"W"],["Total",f(tot,0),"W"],["Total",f(tot*3.412,0),"BTU/h"],["Room with ventilation only",isFinite(Tfree)?f(Tfree,0):"—","°C"]]};
 },
 note:"Life: lead-acid roughly halves for every 8–10 K above 25 °C (IEEE 1188 / Eurobat), NiCd about every 20 K above 20 °C, lithium about every 15 K. Charge compensation: VRLA −3, vented lead-acid and NiCd −2.5 mV/°C per cell. Battery heat uses the float or boost current per IEC 62485-2. Always follow the battery maker's data."},

{id:"ler",g:"hvac",icon:"ler",name:"LER / substation cooling",short:"Equipment losses into a room cooling load",
 intro:"Enter the electrical equipment in the room. The tool adds up its heat losses with the fabric and pressurisation air and gives the cooling needed.",
 fields:[
  {id:"vfd",label:"VFDs: total motor kW",type:"num",def:"450",unit:"kW",half:true},
  {id:"vfdl",label:"VFD losses",type:"num",def:"3",unit:"% of kW",half:true},
  {id:"tx",label:"Dry-type transformers in the room",type:"num",def:"0",unit:"kVA",half:true},
  {id:"txl",label:"Transformer losses at load",type:"num",def:"1.5",unit:"% of kVA",half:true},
  {id:"ups",label:"UPS rating",type:"num",def:"60",unit:"kVA",half:true},
  {id:"upse",label:"UPS efficiency",type:"num",def:"94",unit:"%",half:true},
  {id:"pnl",label:"Switchboard / MCC sections",type:"num",def:"12",unit:"sections",half:true},
  {id:"pw",label:"Heat per section",type:"num",def:"350",unit:"W",half:true},
  {id:"oth",label:"Other (PLC, F&G, telecom, batteries, lights)",type:"num",def:"3",unit:"kW"},
  {id:"Af",label:"External wall and roof area",type:"num",def:"220",unit:"m²",half:true,adv:true},
  {id:"U",label:"U-value",type:"num",def:"0.45",unit:"W/m²K",half:true,adv:true},
  {id:"fa",label:"Pressurisation fresh air",type:"num",def:"250",unit:"L/s",adv:true},
  {id:"To",label:"Outdoor",type:"num",def:"46",unit:"°C",half:true,adv:true},
  {id:"ro",label:"Outdoor RH",type:"num",def:"35",unit:"%",half:true,adv:true},
  {id:"Ti",label:"Room",type:"num",def:"25",unit:"°C",half:true,adv:true},
  {id:"ri",label:"Room RH",type:"num",def:"50",unit:"%",half:true,adv:true},
  {id:"mg",label:"Design margin",type:"num",def:"15",unit:"%",adv:true}
 ],
 calc(v){
  const n=x=>num(v[x])||0,To=num(v.To),Ti=num(v.Ti),ro=num(v.ro),ri=num(v.ri);if(!isFinite(To)||!isFinite(Ti)||!(ro>0&&ri>0))return{hint:"Check the design conditions under More options."};
  const eq=[["VFDs",n("vfd")*n("vfdl")/100*1000],["Transformers",n("tx")*n("txl")/100*1000],["UPS",n("ups")*0.9*(100/Math.max(n("upse"),1)-1)*1000],["Switchboards / MCC",n("pnl")*n("pw")],["Other",n("oth")*1000]];
  const So=PSY.fromRH(To,ro,101.325),Si=PSY.fromRH(Ti,ri,101.325),fa=n("fa")/1000,fab=n("Af")*n("U")*(To-Ti+5),faS=1.2*fa*1006*(To-Ti),faL=Math.max(0,1.2*fa*2501e3*(So.W-Si.W));
  const parts=eq.concat([["Walls and roof",fab],["Fresh air, sensible",faS],["Fresh air, latent",faL]]),sum=parts.reduce((a,p)=>a+p[1],0),tot=sum*(1+n("mg")/100),sens=(sum-faL)*(1+n("mg")/100);
  const eqs=eq.reduce((a,p)=>a+p[1],0);
  return{cap:"Cooling needed",value:f(tot/1000,1),unit:"kW",status:{ok:true,text:`${f(tot/3517,1)} TR · equipment ${f(eqs/sum*100,0)} % of load`},
   say:`Equipment gives off ${B(f(eqs/1000,1),"kW")}. With walls, roof and ${f(n("fa"))} L/s of pressurisation air at ${f(To)} °C, and ${f(n("mg"))} % margin, the room needs ${B(f(tot/1000,1),"kW")} (${f(tot/3517,1)} TR) to hold ${f(Ti)} °C. Electrical rooms are almost all sensible load: SHR ${f(sens/tot,2)}. Provide standby, for example 2 × 100 % or 3 × 50 % units, so a failure cannot overheat the switchgear.`,
   rows:[["Total",f(tot/3517,2),"TR"],["Sensible heat ratio",f(sens/tot,2),""],["Supply air at 11 K ΔT",f(sens/(1.2*1006*11),2),"m³/s"]],
   after:tbl(["Source","W","Share"],parts.filter(p=>p[1]>0).map(p=>[p[0],f(p[1],0),f(p[1]/sum*100,0)+" %"]))};
 },
 note:"Losses are typical values; use vendor heat-dissipation data from the VFD, UPS and switchgear datasheets when available. Fabric gain uses ΔT + 5 K for solar. Check the electrical room design temperature in the project spec (often 25 °C ± 2)."},

{id:"anah",g:"hvac",icon:"anah",name:"Analyser house ventilation",short:"Dilution, air changes, purge and pressure",
 intro:"Enter the room size and the gas the analysers handle. You get the ventilation needed to keep gas well below the lower flammable limit, the purge time and the pressurisation air.",
 fields:[
  {id:"L",label:"Length",type:"num",def:"6",unit:"m",half:true},
  {id:"W",label:"Width",type:"num",def:"3",unit:"m",half:true},
  {id:"H",label:"Height",type:"num",def:"3",unit:"m",half:true},
  {id:"ach",label:"Minimum air changes",help:"Many specs ask for 6–12 per hour for analyser houses.",type:"num",def:"6",unit:"per h",half:true},
  {id:"gas",label:"Gas",type:"chips",def:"5",options:[["5","Methane (LFL 5 %)"],["2.1","Propane (2.1 %)"],["4","Hydrogen (4 %)"],["1.4","Heavier HC (1.4 %)"]]},
  {id:"rel",label:"Possible gas release inside",help:"Sum of sample flows that could leak, or vendor data.",type:"num",def:"3",unit:"L/min"},
  {id:"k",label:"Safety factor (fraction of LFL)",type:"chips",def:"0.25",options:[["0.25","25 % LFL"],["0.1","10 % LFL"]]},
  {id:"dp",label:"Overpressure to hold",type:"num",def:"50",unit:"Pa",half:true},
  {id:"lk",label:"Leakage area (doors, transits)",type:"num",def:"0.02",unit:"m²",half:true}
 ],
 calc(v){
  const V=num(v.L)*num(v.W)*num(v.H),ach=num(v.ach)||0,lfl=num(v.gas)/100,rel=num(v.rel)||0,k=num(v.k),dp=num(v.dp)||0,lk=num(v.lk)||0;if(!(V>0))return{hint:"Enter the room size."};
  const Qd=rel/60000/(k*lfl),Qa=V*ach/3600,Qv=Math.max(Qd,Qa),Qp=0.827*lk*Math.sqrt(dp),purge=5*V/Math.max(Qv,1e-9)/60;
  return{cap:"Ventilation airflow",value:f(Qv*3600,0),unit:"m³/h",status:{ok:true,text:Qd>Qa?"Set by gas dilution":"Set by air changes"},
   say:`For ${f(V,0)} m³, ${f(ach)} air changes need ${f(Qa*3600,0)} m³/h and diluting ${f(rel,1)} L/min of gas to ${f(k*100,0)} % of its LFL needs ${f(Qd*3600,0)} m³/h. Use ${B(f(Qv*3600,0),"m³/h")}. To hold ${f(dp)} Pa you also need ${B(f(Qp*3600,0),"m³/h")} more supply than exhaust. Purge 5 room volumes (${B(f(purge,1),"minutes")}) before energising non-protected equipment.`,
   rows:[["Room volume",f(V,1),"m³"],["Air-change airflow",f(Qa*3600,0),"m³/h"],["Dilution airflow",f(Qd*3600,0),"m³/h"],["Pressurisation leakage air",f(Qp*3600,0),"m³/h"],["Purge time (5 volumes)",f(purge,1),"min"]]};
 },
 note:"Dilution Q = release ÷ (k × LFL). Purge of at least 5 enclosure volumes and loss-of-pressure / loss-of-flow alarms follow IEC 60079-13 / IEC 60079-2 practice. Intakes must be from a non-hazardous location and have gas detection. The project hazardous-area spec governs."},

{id:"kv",g:"hvac",icon:"kv",name:"Valve Kv / Cv",short:"Size a valve, or flow from ΔP",
 intro:"Size a control or balancing valve, or find the flow through a balancing valve from its ΔP reading.",
 fields:[
  {id:"mode",label:"What do you need?",type:"chips",def:"size",options:[["size","Size a valve"],["flow","Flow from ΔP"]]},
  {id:"Q",label:"Water flow",type:"num",def:"1.2",units:uu("flow"),udef:"L/s",show:v=>v.mode==="size"},
  {id:"dp",label:"Pressure drop across the valve",type:"num",def:"25",unit:"kPa"},
  {id:"kv",label:"Valve Kv at its current setting",type:"num",def:"6.3",unit:"",show:v=>v.mode==="flow"},
  {id:"dc",label:"Pressure drop of coil and branch",help:"For valve authority.",type:"num",def:"30",unit:"kPa",adv:true,show:v=>v.mode==="size"}
 ],
 calc(v){
  const dp=num(v.dp);if(!(dp>0))return{hint:"Enter the pressure drop across the valve."};
  if(v.mode==="flow"){const kv=num(v.kv);if(!(kv>0))return{hint:"Enter the valve Kv."};const q=kv*Math.sqrt(dp/100);
   return{cap:"Flow through valve",value:f(q/3.6,3),unit:"L/s",say:`With Kv ${f(kv)} and ${f(dp)} kPa across the test points, flow is ${B(f(q,2),"m³/h")} (${f(q/3.6,3)} L/s).`,rows:[["Flow",f(q,2),"m³/h"],["Flow",f(q*4.40287,1),"US GPM"]]};}
  const Q=si(v,"Q","flow");if(!(Q>0))return{hint:"Enter the flow."};const qh=Q*3600,kv=qh/Math.sqrt(dp/100);
  const STD=[0.25,0.4,0.63,1,1.6,2.5,4,6.3,10,16,25,40,63,100,160,250,400,630];const kvs=STD.find(x=>x>=kv)||kv,dpn=(qh/kvs)**2*100,dc=num(v.dc),auth=dc>0?dpn/(dpn+dc):NaN;
  return{cap:"Kv needed",value:f(kv,2),unit:"",status:isFinite(auth)?{ok:auth>=0.25,text:`Authority ${f(auth,2)}`}:null,
   say:`For ${f(qh,2)} m³/h at ${f(dp)} kPa you need Kv ${B(f(kv,2))} (Cv ${f(kv*1.156,2)}). The next standard size is ${B("Kvs "+kvs)}, giving ${f(dpn,1)} kPa at full flow.`+(isFinite(auth)?` Valve authority is ${f(auth,2)}${auth<0.25?", which is too low for good control: pick a smaller Kvs.":auth>=0.5?", which is good.":", which is acceptable."}`:""),
   rows:[["Cv",f(kv*1.156,2),""],["Standard Kvs",kvs,""],["ΔP at Kvs",f(dpn,1),"kPa"],["Flow",f(qh,2),"m³/h"]]};
 },
 note:"Kv = Q (m³/h) ÷ √ΔP (bar). Cv = 1.156 × Kv. Aim for control valve authority of 0.5 (valve ΔP equal to the coil and branch)."},

{id:"expv",g:"hvac",icon:"expv",name:"Expansion vessel",short:"Vessel size for a closed water system",
 intro:"Enter the system volume, temperatures and pressures. You get the expansion volume and the vessel size.",
 fields:[
  {id:"V",label:"System water volume",type:"num",def:"3000",units:["L","m³"],udef:"L"},
  {id:"fl",label:"Fluid",type:"chips",def:"1",options:[["1","Water"],["1.25","Glycol 25–30 %"]]},
  {id:"t1",label:"Fill (lowest) temperature",type:"num",def:"10",unit:"°C",half:true},
  {id:"t2",label:"Highest temperature",help:"For chilled water, the plant-off temperature in summer.",type:"num",def:"46",unit:"°C",half:true},
  {id:"h",label:"Static height above vessel",type:"num",def:"15",unit:"m",half:true},
  {id:"psv",label:"Safety valve setting",type:"num",def:"6",unit:"bar g",half:true}
 ],
 calc(v){
  let V=num(v.V);if(v.V_u==="m³")V*=1000;const t1=num(v.t1),t2=num(v.t2),h=num(v.h),psv=num(v.psv);
  if(!(V>0))return{hint:"Enter the system volume."};if(!(t2>t1))return{hint:"The highest temperature must be above the fill temperature."};if(!(psv>0))return{hint:"Enter the safety valve setting."};
  const e=(rhoW(t1)/rhoW(t2)-1)*(num(v.fl)||1),Ve=V*e,Vr=Math.max(3,0.005*V),pi=(h>0?h/10.2:0)+0.3,pf=psv*0.9;
  if(!(pf>pi))return{hint:"The safety valve setting is too close to the static pressure. Check the inputs."};
  const Vn=(Ve+Vr)*(pf+1)/(pf-pi),SZ=[8,12,18,25,35,50,80,100,150,200,250,300,400,500,600,800,1000,1500,2000,3000,5000],sz=SZ.find(x=>x>=Vn)||Math.ceil(Vn/500)*500;
  return{cap:"Vessel size",value:sz,unit:"L",
   say:`The water expands by ${B(f(Ve,0),"L")} (${f(e*100,2)} %) from ${f(t1)} to ${f(t2)} °C. With ${f(Vr,0)} L water reserve, pre-charge ${f(pi,1)} bar and maximum ${f(pf,1)} bar, the vessel needs ${f(Vn,0)} L, so use a ${B(sz+" L")} vessel.`,
   rows:[["Expansion volume",f(Ve,0),"L"],["Water reserve",f(Vr,0),"L"],["Pre-charge pressure",f(pi,2),"bar g"],["Final pressure",f(pf,2),"bar g"],["Calculated volume",f(Vn,0),"L"]]};
 },
 note:"EN 12828 method: Vn = (Ve + Vr) × (Pf + 1) ÷ (Pf − P0). Pre-charge = static head + 0.3 bar. Glycol factor is approximate; use the glycol maker's data."},

{id:"chperf",g:"hvac",icon:"chperf",name:"Chiller & tower performance",short:"kW/TR, COP, range and approach",
 intro:"Check a chiller's capacity and efficiency, or a cooling tower's range and approach, from site readings.",
 fields:[
  {id:"mode",label:"Equipment",type:"chips",def:"ch",options:[["ch","Chiller"],["ct","Cooling tower"]]},
  {id:"Q",label:"Water flow",type:"num",def:"25",units:uu("flow"),udef:"L/s"},
  {id:"ti",label:"Water in (return)",type:"num",def:"12.5",unit:"°C",half:true,show:v=>v.mode==="ch"},
  {id:"to",label:"Water out (supply)",type:"num",def:"7",unit:"°C",half:true,show:v=>v.mode==="ch"},
  {id:"kw",label:"Electrical power input",type:"num",def:"150",unit:"kW",show:v=>v.mode==="ch"},
  {id:"hi",label:"Hot water in",type:"num",def:"37",unit:"°C",half:true,show:v=>v.mode==="ct"},
  {id:"co",label:"Cold water out",type:"num",def:"32",unit:"°C",half:true,show:v=>v.mode==="ct"},
  {id:"wb",label:"Outdoor wet bulb",type:"num",def:"29",unit:"°C",show:v=>v.mode==="ct"}
 ],
 calc(v){
  const Q=si(v,"Q","flow")*1000;if(!(Q>0))return{hint:"Enter the water flow."};
  if(v.mode==="ct"){const hi=num(v.hi),co=num(v.co),wb=num(v.wb);if(![hi,co,wb].every(isFinite))return{hint:"Enter the water and wet-bulb temperatures."};
   const rg=hi-co,ap=co-wb,eff=rg/(rg+ap)*100,qk=4.186*Q*rg;
   return{cap:"Approach",value:f(ap,1),unit:"K",status:{ok:ap<=5,text:ap<=5?"Approach normal":"Approach high"},
    say:`Range is ${B(f(rg,1),"K")} and approach to wet bulb is ${B(f(ap,1),"K")}, so the tower is ${f(eff,0)} % effective. It rejects about ${B(f(qk,0),"kW")}.`+(ap>5?" A high approach usually means fouled fill, poor water distribution, a fan problem or recirculation of hot air.":""),
    rows:[["Range",f(rg,1),"K"],["Effectiveness",f(eff,0),"%"],["Heat rejected",f(qk/3.51685,0),"TR"]]};}
  const ti=num(v.ti),to=num(v.to),kw=num(v.kw);if(!isFinite(ti)||!isFinite(to))return{hint:"Enter the water in and out temperatures."};
  const cap=4.186*Q*(ti-to),tr=cap/3.51685,kwtr=kw/tr,cop=cap/kw;
  return{cap:"Cooling capacity",value:f(tr,1),unit:"TR",status:kw>0?{ok:kwtr<=1.3,text:`${f(kwtr,2)} kW/TR`}:null,
   say:`The chiller is producing ${B(f(cap,0),"kW")} (${f(tr,1)} TR) with a ${f(ti-to,1)} K water ΔT.`+(kw>0?` At ${f(kw)} kW input that is ${B(f(kwtr,2),"kW/TR")} (COP ${f(cop,2)}).`:""),
   rows:[["Capacity",f(cap,0),"kW"],["kW per TR",kw>0?f(kwtr,2):"—",""],["COP",kw>0?f(cop,2):"—",""],["EER",kw>0?f(cop*3.412,2):"—","Btu/Wh"]]};
 },
 note:"Capacity = 4.186 × L/s × ΔT. Range = hot in − cold out; approach = cold out − wet bulb. Typical air-cooled chillers run 1.0–1.3 kW/TR at full load in the Gulf, water-cooled 0.55–0.75."},

{id:"ctmake",g:"hvac",icon:"ctmake",name:"Cooling tower make-up water",short:"Evaporation, blowdown and drift",
 intro:"Enter the heat rejected (or flow and range) and the cycles of concentration. You get the make-up water per hour and per day.",
 fields:[
  {id:"Q",label:"Water flow",type:"num",def:"60",units:uu("flow"),udef:"L/s",half:true},
  {id:"R",label:"Range (hot in − cold out)",type:"num",def:"5.5",unit:"K",half:true},
  {id:"C",label:"Cycles of concentration",help:"Set by the water treatment company, often 3–6.",type:"num",def:"4",unit:"",half:true},
  {id:"dr",label:"Drift loss",type:"num",def:"0.005",unit:"% of flow",half:true,adv:true},
  {id:"h",label:"Running hours per day",type:"num",def:"20",unit:"h",adv:true}
 ],
 calc(v){
  const Q=si(v,"Q","flow")*1000,R=num(v.R),C=num(v.C),dr=num(v.dr)||0,h=num(v.h)||24;if(!(Q>0&&R>0))return{hint:"Enter the flow and range."};if(!(C>1))return{hint:"Cycles of concentration must be above 1."};
  const kw=4.186*Q*R,E=kw/2400,B_=E/(C-1),D=Q*dr/100,M=E+B_+D;
  return{cap:"Make-up water",value:f(M*3.6,2),unit:"m³/h",
   say:`The tower rejects ${f(kw,0)} kW. It evaporates ${B(f(E*3.6,2),"m³/h")}, bleeds off ${f(B_*3.6,2)} m³/h at ${f(C,1)} cycles and loses ${f(D*3.6,3)} m³/h as drift. Make-up is ${B(f(M*3.6,2),"m³/h")}, about ${B(f(M*3.6*h,0),"m³ per day")}.`,
   rows:[["Evaporation",f(E*3.6,2),"m³/h"],["Blowdown",f(B_*3.6,2),"m³/h"],["Drift",f(D*3.6,3),"m³/h"],["Make-up",f(M,2),"L/s"],["Heat rejected",f(kw/3.517,0),"TR"]]};
 },
 note:"Evaporation ≈ heat rejected ÷ 2400 kJ/kg (about 1 % of flow per 5.5 K range). Blowdown = evaporation ÷ (cycles − 1). Raising cycles saves water but needs good treatment."},

{id:"glycol",g:"hvac",icon:"glycol",name:"Glycol mix",short:"Freeze point and flow correction",
 intro:"Pick the glycol and concentration. You get the freeze point and how much more flow the coil or chiller needs than with water.",
 fields:[
  {id:"ty",label:"Glycol type",type:"chips",def:"eg",options:[["eg","Ethylene glycol"],["pg","Propylene glycol"]]},
  {id:"pc",label:"Concentration",type:"chips",def:"30",options:[["10","10 %"],["20","20 %"],["30","30 %"],["40","40 %"],["50","50 %"]]},
  {id:"kw",label:"Cooling load",type:"num",def:"300",unit:"kW",half:true},
  {id:"dt",label:"Temperature difference",type:"num",def:"5",unit:"K",half:true}
 ],
 calc(v){
  const T={eg:{10:[-3.4,4.05,1.013],20:[-7.9,3.87,1.027],30:[-14.0,3.69,1.042],40:[-22.3,3.51,1.056],50:[-33.8,3.32,1.071]},pg:{10:[-3.3,4.10,1.008],20:[-7.1,3.97,1.017],30:[-12.7,3.85,1.026],40:[-21.1,3.70,1.034],50:[-33.5,3.52,1.041]}}[v.ty][v.pc];
  const kw=num(v.kw),dt=num(v.dt);const fac=(4.19*1.0)/(T[1]*T[2]);
  const qw=kw>0&&dt>0?kw/(4.19*dt):NaN,qg=kw>0&&dt>0?kw/(T[1]*T[2]*dt):NaN;
  return{cap:"Freeze point",value:f(T[0],1),unit:"°C",
   say:`${v.pc} % ${v.ty==="eg"?"ethylene":"propylene"} glycol freezes at about ${B(f(T[0],1),"°C")}. Choose a mix that freezes at least 5 K below the lowest temperature expected. It carries less heat than water, so it needs ${B(f((fac-1)*100,0),"% more flow")}`+(isFinite(qg)?`: ${B(f(qg,2),"L/s")} instead of ${f(qw,2)} L/s for ${f(kw)} kW.`:".")+" Pump head also rises (thicker fluid), and chiller capacity drops a few percent.",
   rows:[["Specific heat",f(T[1],2),"kJ/kg·K"],["Density",f(T[2],3),"kg/L"],["Flow factor vs water",f(fac,3),"×"],["Glycol flow",isFinite(qg)?f(qg,2):"—","L/s"]]};
 },
 note:"Typical properties near 5 °C (ASHRAE Fundamentals). Use inhibited HVAC glycol, not automotive antifreeze, and the maker's data for final selection. Test concentration with a refractometer."},

{id:"minvol",g:"hvac",icon:"minvol",name:"Minimum system volume",short:"Water volume to stop chiller short-cycling",
 intro:"Enter the chiller size and its smallest capacity step. You get the minimum water in the system and whether a buffer tank is needed.",
 fields:[
  {id:"kw",label:"Chiller capacity",type:"num",def:"500",unit:"kW",half:true},
  {id:"st",label:"Smallest capacity step",type:"num",def:"25",unit:"%",half:true},
  {id:"t",label:"Minimum compressor run time",type:"num",def:"5",unit:"min",half:true},
  {id:"db",label:"Allowed temperature band",type:"num",def:"1.5",unit:"K",half:true},
  {id:"V",label:"Water volume in the system now",help:"Pipe volume plus coils and vessels.",type:"num",def:"1800",unit:"L"}
 ],
 calc(v){
  const kw=num(v.kw),st=num(v.st)/100,t=num(v.t),db=num(v.db),V=num(v.V);if(!(kw>0&&st>0&&t>0&&db>0))return{hint:"Enter the chiller size, step, run time and band."};
  const Vmin=kw*st*t*60/(4.186*db),ok=!(V>=0)||V>=Vmin;
  return{cap:"Minimum water volume",value:f(Vmin,0),unit:"L",status:V>=0?{ok,text:ok?"Enough volume":`Buffer tank ${f(Vmin-V,0)} L`}:null,
   say:`At the smallest step (${f(kw*st,0)} kW) the compressor must run ${f(t)} minutes before the water cools ${f(db,1)} K. That needs ${B(f(Vmin,0),"litres")} (${f(Vmin/kw,1)} L per kW).`+(V>=0?(ok?" Your system has enough.":` Your system has ${f(V,0)} L, so add a ${B(f(Vmin-V,0),"L")} buffer tank, or check the maker's minimum.`):""),
   rows:[["Per kW of chiller",f(Vmin/kw,1),"L/kW"],["Smallest step",f(kw*st,0),"kW"]]};
 },
 note:"V = load step × run time ÷ (ρ cp ΔT). Many makers give a rule of 3–6 L/kW for comfort and 6–10 L/kW for process; the chiller maker's figure governs."},

{id:"insul",g:"hvac",icon:"insul",name:"Insulation thickness",short:"Thickness to stop sweating",
 intro:"Enter the pipe or duct, the fluid temperature and the room air. You get the insulation thickness that keeps the surface above the dew point.",
 fields:[
  {id:"k",label:"Item",type:"chips",def:"p",options:[["p","Pipe"],["d","Duct (flat)"]]},
  {id:"od",label:"Pipe outside diameter",type:"num",def:"60.3",unit:"mm",show:v=>v.k==="p"},
  {id:"tf",label:"Fluid or air inside",type:"num",def:"7",unit:"°C",half:true},
  {id:"ta",label:"Surrounding air",type:"num",def:"35",unit:"°C",half:true},
  {id:"rh",label:"Surrounding RH",type:"num",def:"75",unit:"%",half:true},
  {id:"lam",label:"Insulation conductivity",help:"Elastomeric about 0.035, glass wool 0.04.",type:"num",def:"0.035",unit:"W/mK",half:true},
  {id:"hs",label:"Surface heat transfer coefficient",type:"num",def:"9",unit:"W/m²K",adv:true}
 ],
 calc(v){
  const tf=num(v.tf),ta=num(v.ta),rh=num(v.rh),lam=num(v.lam),hs=num(v.hs)||9;if(!isFinite(tf)||!isFinite(ta))return{hint:"Enter the inside and surrounding temperatures."};
  if(!(rh>0&&rh<100))return{hint:"RH must be between 0 and 100 %."};if(!(lam>0))return{hint:"Enter the insulation conductivity."};
  const td=PSY.fromRH(ta,rh,101.325).td,tsReq=td+1;if(tf>=tsReq)return{cap:"Insulation thickness",value:"None",unit:"",say:`The surface stays above the dew point of ${f(td,1)} °C without insulation, so it won't sweat. Insulate only to save energy.`,rows:[["Dew point",f(td,1),"°C"]]};
  const ro0=num(v.od)/2000,ts=t=>{if(v.k==="d"){const R=t/1000/lam+1/hs;return ta-(ta-tf)*(1/hs)/R;}const ro=ro0+t/1000,Ri=Math.log(ro/ro0)/(2*Math.PI*lam),Rs=1/(2*Math.PI*ro*hs);return ta-(ta-tf)*Rs/(Ri+Rs);};
  if(v.k==="p"&&!(ro0>0))return{hint:"Enter the pipe outside diameter."};
  let t=0;while(ts(t)<tsReq&&t<300)t+=0.5;const STD=[9,13,19,25,32,40,50,60,75,100],s=STD.find(x=>x>=t)||Math.ceil(t/10)*10;
  const q=v.k==="d"?(ta-tf)/(s/1000/lam+1/hs):(ta-tf)/(Math.log((ro0+s/1000)/ro0)/(2*Math.PI*lam)+1/(2*Math.PI*(ro0+s/1000)*hs));
  return{cap:"Minimum thickness",value:f(t,1),unit:"mm",
   say:`The air dew point is ${B(f(td,1),"°C")}. To keep the surface at least 1 K above it, you need ${f(t,1)} mm, so use ${B(s+" mm")} insulation with a vapour barrier.`,
   rows:[["Standard thickness",s,"mm"],["Surface temperature",f(ts(s),1),"°C"],["Dew point",f(td,1),"°C"],[v.k==="d"?"Heat gain per m²":"Heat gain per metre",f(q,1),v.k==="d"?"W/m²":"W/m"]]};
 },
 note:"Steady-state heat balance with 1 K margin above dew point. In humid Gulf plant rooms and outdoors, use a higher RH and add 25 % to the thickness. Keep the vapour barrier continuous."},

/* ===== Refrigeration additions ===== */
{id:"pexp",g:"hvac",icon:"pexp",name:"Pipe thermal expansion",short:"Expansion and loop or arm length",
 intro:"Enter the pipe material, run length and temperature change. You get the expansion and the loop or flexible arm length to absorb it.",
 fields:[
  {id:"m",label:"Material",type:"chips",def:"st",options:[["st","Carbon steel"],["ss","Stainless"],["cu","Copper"],["ppr","PPR"],["pvc","PVC / CPVC"],["pe","HDPE / PEX"]]},
  {id:"L",label:"Straight run between anchors",type:"num",def:"40",unit:"m",half:true},
  {id:"dT",label:"Temperature change",help:"Install temperature to the hottest (or coldest) operating temperature.",type:"num",def:"45",unit:"K",half:true},
  {id:"D",label:"Pipe outside diameter",type:"num",def:"60.3",unit:"mm"}
 ],
 calc(v){
  const M={st:[12e-6,"m"],ss:[16.5e-6,"m"],cu:[17e-6,"m"],ppr:[150e-6,"p"],pvc:[70e-6,"p"],pe:[200e-6,"p"]}[v.m],L=num(v.L),dT=num(v.dT),D=num(v.D);if(!(L>0&&dT>0))return{hint:"Enter the run length and temperature change."};
  const dL=M[0]*L*dT*1000,plast=M[1]==="p",arm=D>0?(plast?30*Math.sqrt(D*dL):Math.sqrt(3*(v.m==="cu"?110000:200000)*D*dL/(v.m==="cu"?40:100))):NaN;
  return{cap:"Expansion",value:f(dL,1),unit:"mm",
   say:`${f(L)} m of pipe grows ${B(f(dL,1),"mm")} over ${f(dT)} K.`+(isFinite(arm)?` Absorb it with a change of direction or loop leg of at least ${B(f(arm/1000,2),"m")}${plast?" (flexible arm, as plastic pipe makers recommend)":""}, with guides and anchors placed so the pipe can move.`:"")+(plast?" Plastic pipe expands about 10 times more than steel: support and anchor it carefully.":""),
   rows:[["Expansion per 10 m",f(M[0]*10*dT*1000,1),"mm"],["Loop / arm length",isFinite(arm)?f(arm,0):"—","mm"],["Coefficient",f(M[0]*1e6,1),"×10⁻⁶ /K"]]};
 },
 note:"ΔL = α × L × ΔT. Steel/copper loop leg ≈ √(3 E D ΔL ÷ allowable stress); plastics use the maker's flexible-arm formula LB ≈ 30 √(D × ΔL). Confirm with a stress check for large or high-temperature lines."},

{id:"psup",g:"hvac",icon:"psup",name:"Pipe support spacing",short:"Maximum span and rod size",
 intro:"Pick the pipe material and size. You get the maximum distance between supports, the hanger rod size and the number of supports for a run.",
 fields:[
  {id:"m",label:"Material",type:"chips",def:"st",options:[["st","Steel (water)"],["cu","Copper (water)"],["pc","PPR cold"],["ph","PPR hot"]]},
  {id:"sz",label:"Size",type:"select",def:"5",options:[["0",'1/2" / 20 mm'],["1",'3/4" / 25 mm'],["2",'1" / 32 mm'],["3",'1-1/4" / 40 mm'],["4",'1-1/2" / 50 mm'],["5",'2" / 63 mm'],["6",'2-1/2" / 75 mm'],["7",'3" / 90 mm'],["8",'4" / 110 mm'],["9",'6"'],["10",'8"'],["11",'10"'],["12",'12"']]},
  {id:"L",label:"Length of the run",type:"num",def:"30",unit:"m"}
 ],
 calc(v){
  const i=+v.sz,T={st:[2.1,2.1,2.1,2.1,2.7,3.0,3.4,3.7,4.3,5.2,5.8,6.7,7.0],cu:[1.5,1.8,1.8,2.1,2.4,2.4,2.7,3.0,3.7,null,null,null,null],pc:[0.75,0.85,1.0,1.1,1.25,1.4,1.5,1.65,1.9,null,null,null,null],ph:[0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2,1.4,null,null,null,null]}[v.m];
  const rod=["M10","M10","M10","M10","M10","M10","M12","M12","M16","M20","M20","M24","M24"][i],sp=T[i],L=num(v.L);if(sp==null)return{hint:"That size isn't in the table for this material."};
  const n=L>0?Math.ceil(L/sp)+1:NaN;
  return{cap:"Maximum support spacing",value:f(sp,1),unit:"m",
   say:`Support this pipe at least every ${B(f(sp,1),"m")} horizontally, with ${B(rod)} hanger rods.`+(isFinite(n)?` A ${f(L)} m run needs about ${B(n+" supports")}.`:"")+" Add a support within 0.6 m of every bend, valve and heavy fitting.",
   rows:[["Spacing",f(sp*3.281,1),"ft"],["Hanger rod",rod,""],["Supports for the run",isFinite(n)?n:"—",""]]};
 },
 note:"Steel and copper from MSS SP-58 / SP-69 (water-filled, horizontal). PPR from typical manufacturer tables; hot lines need closer spacing. Vertical risers: support at each floor. Project spec governs."},

{id:"radout",g:"hvac",icon:"rad",name:"Radiator output",short:"Output at your water temperatures (EN 442)",
 intro:"Catalogues quote radiator output at ΔT 50. Enter your flow, return and room temperatures to get the real output, or the size to buy.",
 fields:[
  {id:"mode",label:"What do you need?",type:"chips",def:"out",options:[["out","Output of a radiator"],["need","Radiator size for a room"]]},
  {id:"R",label:"Catalogue output at ΔT 50",type:"num",def:"1500",units:["W","BTU/h"],udef:"W",show:v=>v.mode==="out"},
  {id:"Q",label:"Room heat loss",type:"num",def:"1200",units:["W","BTU/h"],udef:"W",show:v=>v.mode==="need"},
  {id:"tf",label:"Flow temperature",type:"num",def:"70",unit:"°C",half:true},
  {id:"tr",label:"Return temperature",type:"num",def:"60",unit:"°C",half:true},
  {id:"ti",label:"Room temperature",type:"num",def:"20",unit:"°C"},
  {id:"n",label:"Radiator exponent n",help:"Panel radiators about 1.3. Check the catalogue.",type:"num",def:"1.3",adv:true}
 ],
 calc(v){
  const tf=num(v.tf),tr=num(v.tr),ti=num(v.ti),n=num(v.n);
  if(!(tf>tr))return{hint:"The flow temperature must be above the return."};if(!(tr>ti))return{hint:"The return temperature must be above the room temperature."};if(!(n>0))return{hint:"Enter the exponent n."};
  const dT=(tf+tr)/2-ti,fc=Math.pow(dT/50,n),bt=v=>v==="BTU/h"?0.29307107:1;
  if(v.mode==="out"){const R=num(v.R)*bt(v.R_u);if(!(R>0))return{hint:"Enter the catalogue output."};const O=R*fc,fl=O/(4186*(tf-tr))*3600;
   return{cap:"Actual output",value:f(O,0),unit:"W",
    say:`At ${f(tf,0)}/${f(tr,0)} °C water and ${f(ti,0)} °C room the mean ΔT is ${f(dT,1)} K, so the radiator gives ${B(f(fc*100,0),"%")} of its catalogue rating: ${B(f(O,0),"W")}.`,
    rows:[["Output",f(O/0.29307107,0),"BTU/h"],["Correction factor",f(fc,3),""],["Mean ΔT",f(dT,1),"K"],["Water flow",f(fl,1),"L/h"]]};}
  const Q=num(v.Q)*bt(v.Q_u);if(!(Q>0))return{hint:"Enter the room heat loss."};const R=Q/fc,fl=Q/(4186*(tf-tr))*3600;
  return{cap:"Buy a radiator rated",value:f(R,0),unit:"W at ΔT 50",
   say:`To give ${f(Q,0)} W at a mean ΔT of ${f(dT,1)} K, choose a radiator with a catalogue output of at least ${B(f(R,0),"W")} at ΔT 50.`,
   rows:[["Catalogue output",f(R/0.29307107,0),"BTU/h"],["Correction factor",f(fc,3),""],["Water flow",f(fl,1),"L/h"]]};
 },
 note:"EN 442: Φ = Φ<sub>50</sub> × (ΔT ÷ 50)<sup>n</sup>, with ΔT = mean water temperature − room temperature. Low-temperature systems (heat pumps) need much larger radiators."},

{id:"ufh",g:"hvac",icon:"ufh",name:"Underfloor heating check",short:"Floor temperature, limit and water flow",
 intro:"Enter the room heat loss and the floor area that will be heated. You get the floor surface temperature needed and a pass or fail against EN 1264 limits.",
 fields:[
  {id:"Q",label:"Room heat loss",type:"num",def:"1200",unit:"W"},
  {id:"A",label:"Heated floor area",help:"Leave out areas under kitchen units, baths and fixed furniture.",type:"num",def:"15",units:["m²","ft²"],udef:"m²"},
  {id:"ti",label:"Room temperature",type:"num",def:"20",unit:"°C"},
  {id:"z",label:"Zone",type:"chips",def:"29",options:[["29","Occupied area (29 °C max)"],["33","Bathroom (33 °C max)"],["35","Edge zone (35 °C max)"]]},
  {id:"dT",label:"Water ΔT (flow − return)",type:"num",def:"5",unit:"K",adv:true}
 ],
 calc(v){
  const Q=num(v.Q),ti=num(v.ti),lim=num(v.z),dT=num(v.dT);let A=num(v.A);if(v.A_u==="ft²")A*=0.092903;
  if(!(Q>0))return{hint:"Enter the room heat loss."};if(!(A>0))return{hint:"Enter the heated floor area."};if(!isFinite(ti))return{hint:"Enter the room temperature."};if(!(dT>0))return{hint:"Enter the water ΔT."};
  const q=Q/A,tf=ti+Math.pow(q/8.92,1/1.1),qmax=8.92*Math.pow(Math.max(lim-ti,0),1.1),ok=tf<=lim,fl=Q/(4186*dT)*3600;
  return{cap:"Floor temperature needed",value:f(tf,1),unit:"°C",status:{ok,text:ok?"Within the floor limit":"Floor too hot, add heat elsewhere"},
   say:`${f(Q,0)} W over ${f(A,1)} m² is ${f(q,1)} W/m². The floor surface must run at ${B(f(tf,1),"°C")}. The most this floor can give within ${f(lim,0)} °C is ${B(f(qmax,0),"W/m²")}.`+(ok?"":" Add a radiator or reduce the heat loss."),
   rows:[["Heat flux",f(q,1),"W/m²"],["Maximum flux",f(qmax,0),"W/m²"],["Maximum output",f(qmax*A,0),"W"],["Water flow",f(fl,1),"L/h"]]};
 },
 note:"EN 1264 basic characteristic: q = 8.92 × (θ<sub>floor</sub> − θ<sub>room</sub>)<sup>1.1</sup> W/m². The water temperature needed depends on pipe spacing and floor covering; use the manufacturer's tables."},

{id:"boiler",g:"hvac",icon:"boil",name:"Boiler size",short:"Boiler output, fuel and primary flow",
 intro:"Enter the space heating load and the hot water load. You get the boiler output, the fuel input and the primary water flow.",
 fields:[
  {id:"H",label:"Space heating load",type:"num",def:"40",units:["kW","BTU/h"],udef:"kW"},
  {id:"D",label:"Hot water load",type:"num",def:"10",units:["kW","BTU/h"],udef:"kW"},
  {id:"pri",label:"How is hot water handled?",type:"chips",def:"add",options:[["add","Add to heating"],["pri","Hot water priority"]]},
  {id:"m",label:"Pickup / margin",help:"Allowance for warm-up after night setback. 10 to 20 % is typical.",type:"num",def:"15",unit:"%"},
  {id:"eff",label:"Boiler efficiency",type:"num",def:"90",unit:"%",adv:true},
  {id:"dT",label:"Primary ΔT (flow − return)",type:"num",def:"20",unit:"K",adv:true}
 ],
 calc(v){
  const bt=u=>u==="BTU/h"?0.00029307107:1,H=num(v.H)*bt(v.H_u),D=(num(v.D)||0)*bt(v.D_u),m=(num(v.m)||0)/100,eff=num(v.eff)/100,dT=num(v.dT);
  if(!(H>0))return{hint:"Enter the space heating load."};if(!(eff>0&&eff<=1))return{hint:"Efficiency must be between 1 and 100 %."};if(!(dT>0))return{hint:"Enter the primary ΔT."};
  const out=(v.pri==="pri"?Math.max(H,D):H+D)*(1+m),inp=out/eff,fl=out/(4.186*dT);
  return{cap:"Boiler output",value:f(out,1),unit:"kW",
   say:`Choose a boiler of at least ${B(f(out,1),"kW")} output (${f(out/0.29307107*1000,0)} BTU/h). At ${f(eff*100,0)} % efficiency it burns ${B(f(inp,1),"kW")} of fuel, and the primary pump moves ${B(f(fl,2),"L/s")} at a ${f(dT,0)} K ΔT.`,
   rows:[["Output",f(out/0.29307107*1000,0),"BTU/h"],["Fuel input",f(inp,1),"kW"],["Natural gas",f(inp*3.6/38.7,2),"m³/h"],["Primary flow",f(fl*3.6,2),"m³/h"],["Primary flow",f(fl*15.8503,1),"US GPM"]]};
 },
 note:"Output = (heating + hot water) × (1 + margin), or the larger of the two with hot water priority. Two or more boilers in lead/lag give standby and better part-load efficiency."},

/* ---------- v1.16 additions: heat loss, smoke control, car park, kitchen hood, foam, pool ---------- */

{id:"hloss",g:"hvac",icon:"hloss",name:"Heat loss",short:"Winter heating load for a room",
 intro:"Enter the room size, its outside wall, windows and roof, and the design temperatures. You get the heating load for radiators, underfloor heating or the boiler.",
 fields:[
  {id:"L",label:"Length",type:"num",def:"5",units:uu("len"),udef:"m",half:true},
  {id:"W",label:"Width",type:"num",def:"4",units:uu("len"),udef:"m",half:true},
  {id:"H",label:"Ceiling height",type:"num",def:"2.7",units:uu("len"),udef:"m"},
  {id:"xw",label:"Outside wall length",help:"Total length of walls facing outdoors.",type:"num",def:"9",units:uu("len"),udef:"m"},
  {id:"ga",label:"Window area",type:"num",def:"3",units:["m²","ft²"],udef:"m²"},
  {id:"roof",label:"Roof above is outdoors?",type:"chips",def:"0",options:[["1","Yes"],["0","No, a floor above"]]},
  {id:"gf",label:"Floor on the ground?",type:"chips",def:"0",options:[["1","Yes"],["0","No, a room below"]]},
  {id:"ti",label:"Indoor temperature",type:"num",def:"21",unit:"°C",half:true},
  {id:"to",label:"Outdoor design temperature",type:"num",def:"0",unit:"°C",half:true},
  {id:"ach",label:"Air changes from infiltration and ventilation",help:"0.5 for a tight modern room, 1 to 1.5 for older buildings.",type:"num",def:"0.5",unit:"/h"},
  {id:"uw",label:"Wall U-value",type:"num",def:"0.35",unit:"W/m²K",adv:true,half:true},
  {id:"ug",label:"Window U-value",type:"num",def:"2.8",unit:"W/m²K",adv:true,half:true},
  {id:"ur",label:"Roof U-value",type:"num",def:"0.25",unit:"W/m²K",adv:true,half:true},
  {id:"uf",label:"Ground floor U-value",type:"num",def:"0.25",unit:"W/m²K",adv:true,half:true},
  {id:"mg",label:"Safety margin",type:"num",def:"10",unit:"%",adv:true}
 ],
 calc(v){
  const L=si(v,"L","len"),W=si(v,"W","len"),H=si(v,"H","len"),xw=si(v,"xw","len")||0,ti=num(v.ti),to=num(v.to),ach=num(v.ach)||0,mg=(num(v.mg)||0)/100;
  let ga=num(v.ga)||0;if(v.ga_u==="ft²")ga*=0.092903;
  if(!(L>0&&W>0&&H>0))return{hint:"Enter the room size."};if(!(ti>to))return{hint:"The indoor temperature must be above the outdoor design temperature."};
  const dT=ti-to,A=L*W,V=A*H,wall=Math.max(xw*H-ga,0);if(xw*H<ga)return{hint:"The window area is bigger than the outside wall."};
  const qW=num(v.uw)*wall*dT,qG=num(v.ug)*ga*dT,qR=v.roof==="1"?num(v.ur)*A*dT:0,qF=v.gf==="1"?num(v.uf)*A*dT:0,qV=0.33*ach*V*dT;
  const fab=qW+qG+qR+qF,tot=(fab+qV)*(1+mg);
  return{cap:"Heating load",value:f(tot,0),unit:"W",
   say:`At ${f(ti,0)} °C inside and ${f(to,0)} °C outside the room loses ${B(f(tot,0),"W")} (${f(tot*3.41214,0)} BTU/h), or ${f(tot/A,0)} W per m². ${f(fab/(fab+qV)*100,0)} % is through the walls, windows, roof and floor; the rest is air leakage and ventilation.`,
   rows:[["Walls",f(qW,0),"W"],["Windows",f(qG,0),"W"],["Roof",f(qR,0),"W"],["Floor",f(qF,0),"W"],["Air leakage / ventilation",f(qV,0),"W"],["Heating load",f(tot*3.41214,0),"BTU/h"],["Per floor area",f(tot/A,0),"W/m²"]]};
 },
 note:"Q = Σ U × A × ΔT + 0.33 × n × V × ΔT (CIBSE Guide A / EN 12831 simplified). Feed the result into Radiator output, Underfloor heating check or Boiler size."},

{id:"carpark",g:"hvac",icon:"car",name:"Car park ventilation",short:"Normal and smoke clearance airflow",
 intro:"Enter the car park floor area and height. You get the extract airflow for everyday use and for smoke clearance.",
 fields:[
  {id:"A",label:"Floor area",type:"num",def:"3000",units:["m²","ft²"],udef:"m²"},
  {id:"H",label:"Clear height",type:"num",def:"3",units:uu("len"),udef:"m"},
  {id:"m",label:"Method for normal ventilation",type:"chips",def:"ach",options:[["ach","6 air changes (BS 7346-7)"],["area","ASHRAE 62.1 (3.7 L/s per m²)"]]},
  {id:"sm",label:"Smoke clearance air changes",type:"num",def:"10",unit:"/h",adv:true}
 ],
 calc(v){
  let A=num(v.A);if(v.A_u==="ft²")A*=0.092903;const H=si(v,"H","len"),sm=num(v.sm);
  if(!(A>0))return{hint:"Enter the floor area."};if(!(H>0))return{hint:"Enter the clear height."};if(!(sm>0))return{hint:"Enter the smoke clearance air changes."};
  const V=A*H,qn=v.m==="area"?A*3.7/1000:V*6/3600,qs=V*sm/3600;
  return{cap:"Smoke clearance extract",value:f(qs,1),unit:"m³/s",
   say:`The car park holds ${f(V,0)} m³. Normal ventilation needs ${B(f(qn,1),"m³/s")} (${f(qn*3600,0)} m³/h), which CO sensors can turn down at quiet times. In a fire the fans must reach ${B(f(qs,1),"m³/s")} (${f(sm,0)} air changes).`,
   rows:[["Normal extract",f(qn*3600,0),"m³/h"],["Normal extract",f(qn*2118.88,0),"CFM"],["Smoke clearance",f(qs*3600,0),"m³/h"],["Smoke clearance",f(qs*2118.88,0),"CFM"],["Make-up air (≈ 75 %)",f(qs*0.75,1),"m³/s"]]};
 },
 note:"BS 7346-7: 6 ACH normal, 10 ACH smoke clearance. ASHRAE 62.1: 0.75 cfm/ft² (3.7 L/s·m²). Typical CO control: fans step up at 25 to 35 ppm. Jet fan systems need a CFD study."},

{id:"hood",g:"hvac",icon:"hood",name:"Kitchen hood exhaust",short:"Exhaust, make-up air and grease duct",
 intro:"Enter the hood length and pick the hood type and cooking duty. You get the exhaust airflow, make-up air and grease duct size.",
 fields:[
  {id:"L",label:"Hood length",type:"num",def:"3",units:uu("len"),udef:"m"},
  {id:"t",label:"Hood type",type:"chips",def:"wall",options:[["wall","Wall canopy"],["isl","Single island"],["dbl","Double island"],["back","Backshelf"]]},
  {id:"d",label:"Cooking duty",type:"chips",def:"med",options:[["light","Light (ovens, steamers)"],["med","Medium (ranges, fryers)"],["heavy","Heavy (grills, woks)"],["xh","Extra heavy (solid fuel)"]]},
  {id:"dv",label:"Grease duct velocity",help:"NFPA 96 minimum 2.5 m/s (500 fpm). 7.5 m/s (1500 fpm) is a common design value.",type:"num",def:"7.5",unit:"m/s",adv:true}
 ],
 calc(v){
  const L=si(v,"L","len"),dv=num(v.dv),r=HOOD[v.t]&&HOOD[v.t][v.d];
  if(!(L>0))return{hint:"Enter the hood length."};if(!(dv>=2.5))return{hint:"Grease duct velocity must be at least 2.5 m/s."};
  if(!r)return{hint:"This hood type is not allowed for extra-heavy duty. Use a wall canopy or island hood."};
  const ft=L/0.3048,cfm=r*ft*(v.t==="dbl"?2:1),q=cfm*0.471947/1000,A=q/dv,dr=Math.sqrt(4*A/Math.PI)*1000,side=Math.sqrt(A)*1000;
  return{cap:"Hood exhaust",value:f(q*3600,0),unit:"m³/h",
   say:`A ${f(L,1)} m ${({wall:"wall canopy",isl:"single island",dbl:"double island",back:"backshelf"})[v.t]} hood over ${({light:"light",med:"medium",heavy:"heavy",xh:"extra-heavy"})[v.d]} duty cooking needs ${B(f(q*3600,0),"m³/h")} (${f(cfm,0)} CFM) of exhaust. Supply about ${f(q*0.85*3600,0)} m³/h of make-up air so the kitchen stays slightly negative. At ${f(dv,1)} m/s the grease duct is about ${B(f(dr,0),"mm")} round.`,
   rows:[["Exhaust",f(q,3),"m³/s"],["Exhaust",f(cfm,0),"CFM"],["Rate",f(r,0)+(v.t==="dbl"?" per side":""),"CFM/ft"],["Make-up air (85 %)",f(q*0.85*3600,0),"m³/h"],["Grease duct, round",f(dr,0),"mm"],["Grease duct, square",f(side,0)+" × "+f(side,0),"mm"]]};
 },
 note:"Exhaust rates per IMC 507.13 (cfm per linear foot of hood). Listed hoods may be tested to lower rates; use the maker's figure when known. Grease ducts to NFPA 96: welded, fall back to the hood, with cleanouts."},

{id:"pool",g:"hvac",icon:"pool",name:"Pool dehumidification",short:"Evaporation, latent load and fresh air",
 intro:"Enter the pool area, water and air conditions and how busy the pool is. You get the water evaporated and the dehumidifier duty.",
 fields:[
  {id:"A",label:"Pool water area",type:"num",def:"250",units:["m²","ft²"],udef:"m²"},
  {id:"tw",label:"Water temperature",type:"num",def:"27",unit:"°C",half:true},
  {id:"ta",label:"Air temperature",type:"num",def:"29",unit:"°C",half:true},
  {id:"rh",label:"Air relative humidity",type:"num",def:"60",unit:"%"},
  {id:"F",label:"Pool use",type:"chips",def:"1",options:[["0.5","Residential 0.5"],["0.65","Condo 0.65"],["0.8","Hotel 0.8"],["1","Public / school 1.0"],["1.5","Wave pool 1.5"]]},
  {id:"V",label:"Air velocity over the water",type:"num",def:"0.1",unit:"m/s",adv:true},
  {id:"dk",label:"Deck area",help:"For outdoor air: ASHRAE 62.1 asks 2.4 L/s per m² of pool and deck.",type:"num",def:"150",unit:"m²",adv:true}
 ],
 calc(v){
  let A=num(v.A);if(v.A_u==="ft²")A*=0.092903;const tw=num(v.tw),ta=num(v.ta),rh=num(v.rh)/100,F=num(v.F),V=num(v.V)||0,dk=num(v.dk)||0;
  if(!(A>0))return{hint:"Enter the pool area."};if(!isFinite(tw)||!isFinite(ta))return{hint:"Enter the water and air temperatures."};if(!(rh>0&&rh<1))return{hint:"Relative humidity must be between 1 and 99 %."};
  const ps=t=>0.61094*Math.exp(17.625*t/(t+243.04)),pw=ps(tw),pa=rh*ps(ta);
  if(!(pw>pa))return{cap:"Evaporation",value:"0",unit:"kg/h",say:"The air is as humid as the water surface, so the pool is not evaporating. Lower the room humidity or raise the air temperature.",rows:[]};
  const wp=3600*A*(pw-pa)*(0.089+0.0782*V)/2400*F,lat=wp*2454/3600,oa=(A+dk)*2.4;
  return{cap:"Water evaporated",value:f(wp,1),unit:"kg/h",
   say:`The pool evaporates about ${B(f(wp,1),"kg/h")} of water (${f(wp/A,3)} kg/h per m²). Size the dehumidifier to remove at least this much, a latent load of ${B(f(lat,1),"kW")}. Keep the air 1 to 2 °C warmer than the water to limit evaporation.`,
   rows:[["Water removal",f(wp*24,0),"kg/day"],["Water removal",f(wp*2.20462,1),"lb/h"],["Latent load",f(lat/3.51685,2),"TR"],["Outdoor air (62.1)",f(oa,0),"L/s"],["Room dew point",f(dewC(ta,rh*100),1),"°C"]]};
 },
 note:"ASHRAE Applications Handbook: w<sub>p</sub> = A (p<sub>w</sub> − p<sub>a</sub>)(0.089 + 0.0782 V) ÷ Y × activity factor, with p in kPa and Y = 2400 kJ/kg. Keep pool halls at 50 to 60 % RH and slightly negative to the rest of the building."}
);
