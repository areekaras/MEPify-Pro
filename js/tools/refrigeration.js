/* MEPify · Refrigeration tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
{id:"pt",g:"ref",icon:"pt",name:"Pressure–temperature",short:"Gauge reading to saturation temp",
 intro:"Pick the refrigerant and enter a gauge pressure or a temperature. A full pressure–temperature chart is shown below.",
 fields:[
  {id:"ref",label:"Refrigerant",type:"chips",def:"R410A",options:REFOPTS},
  {id:"mode",label:"What do you have?",type:"chips",def:"p",options:[["p","A gauge pressure"],["t","A temperature"]]},
  {id:"pu",label:"Pressure unit",type:"chips",def:"bar g",options:Object.keys(GAUGE).map(u=>[u,u])},
  {id:"P",label:"Gauge pressure",type:"num",def:"8.5",unitFrom:v=>v.pu,show:v=>v.mode==="p"},
  {id:"T",label:"Saturation temperature",type:"num",def:"5",unit:"°C",show:v=>v.mode==="t"}
 ],
 calc(v){
  const k=v.ref,r=REF[k],bl=isBlend(k),pu=GAUGE[v.pu]?v.pu:"bar g",tbl=ptTable(k,pu);
  if(v.mode==="p"){
   const pv=num(v.P);if(!isFinite(pv))return{hint:"Enter the gauge pressure.",after:tbl};
   const P=toAbs(pv,pu),tb=refT(k,P,"b"),td=refT(k,P,"d");
   if(!isFinite(tb)||!isFinite(td))return{hint:`That pressure is outside the −40 to 65 °C range for ${r.n}. Check the gauge and the unit.`,after:tbl};
   const lbl=`${f(pv,2)} ${pu}`;
   if(!bl)return{cap:"Saturation temperature",value:f(td,1),unit:"°C",say:`At ${lbl}, ${r.n} boils and condenses at ${B(f(td,1),"°C")}.`,rows:[["Absolute pressure",f(P,2),"bar a"],["In psig",f((P-PATM)/0.0689476,1),"psig"]],after:tbl};
   return{cap:"Dew temperature (vapour)",value:f(td,1),unit:"°C",
    say:`At ${lbl}, ${r.n} starts to boil at ${B(f(tb,1),"°C")} (bubble) and is all vapour at ${B(f(td,1),"°C")} (dew). Use the dew value for superheat and the bubble value for subcooling.`,
    rows:[["Bubble temperature (liquid)",f(tb,1),"°C"],["Temperature glide",f(td-tb,1),"K"],["Absolute pressure",f(P,2),"bar a"]],after:tbl};
  }
  const T=num(v.T);if(!isFinite(T))return{hint:"Enter the temperature.",after:tbl};
  const pb=refP(k,T,"b"),pd=refP(k,T,"d");
  if(!isFinite(pb))return{hint:`Enter a temperature between −40 and 65 °C for ${r.n}.`,after:tbl};
  const fac=GAUGE[pu],g=x=>f((x-PATM)/fac,2);
  if(!bl)return{cap:"Gauge pressure",value:g(pb),unit:pu,say:`To boil or condense at ${f(T,1)} °C, ${r.n} must be at ${B(g(pb),pu)}.`,rows:[["Absolute pressure",f(pb,2),"bar a"],["In psig",f((pb-PATM)/0.0689476,1),"psig"]],after:tbl};
  return{cap:"Dew pressure (vapour)",value:g(pd),unit:pu,
   say:`At ${f(T,1)} °C, ${r.n} reads ${B(g(pd),pu)} on the vapour side (dew) and ${B(g(pb),pu)} on the liquid side (bubble).`,
   rows:[["Bubble pressure (liquid)",g(pb),pu],["Dew pressure",f(pd,2),"bar a"]],after:tbl};
 },
 note:"Data: NIST for pure refrigerants and manufacturer property tables for R-410A, R-407C and R-404A. Gauge readings assume sea-level air pressure."},

{id:"slide",g:"ref",icon:"slide",name:"P/T slider",short:"Drag temperature, read pressure",
 intro:"Drag the slider to any saturation temperature and the gauge pressure follows. Use − and + for 0.5 °C steps.",
 fields:[
  {id:"ref",label:"Refrigerant",type:"chips",def:"R410A",options:REFOPTS},
  {id:"pu",label:"Pressure unit",type:"chips",def:"bar g",options:Object.keys(GAUGE).map(u=>[u,u])}
 ],
 calc(v){
  const k=v.ref,r=REF[k],bl=isBlend(k),pu=GAUGE[v.pu]?v.pu:"bar g",fac=GAUGE[pu];
  const T=slideT(v),pb=refP(k,T,"b"),pd=bl?refP(k,T,"d"):pb,g=x=>f((x-PATM)/fac,fac<0.05?0:2);
  const vac=pd<PATM?" That is below atmospheric pressure, so the gauge shows vacuum.":"";
  const after=slideHTML(k,pu,T);
  if(!bl)return{cap:`${r.n} at ${f(T,1)} °C`,value:g(pb),unit:pu,
   say:`At ${B(f(T,1),"°C")}, ${r.n} boils and condenses at ${B(g(pb),pu)}.${vac}`,
   rows:[["Absolute",f(pb,2),"bar a"],["psig",f((pb-PATM)/0.0689476,1),"psig"],["kPa g",f((pb-PATM)*100,0),"kPa g"]],after};
  return{cap:`${r.n} at ${f(T,1)} °C`,value:g(pd),unit:pu,
   say:`At ${B(f(T,1),"°C")}, ${r.n} reads ${B(g(pd),pu)} as vapour (dew) and ${B(g(pb),pu)} as liquid (bubble). Use dew for superheat and bubble for subcooling.${vac}`,
   rows:[["Dew (vapour)",g(pd),pu],["Bubble (liquid)",g(pb),pu],["Glide at dew pressure",f(T-refT(k,pd,"b"),1),"K"]],after};
 },
 bind(af,st){
  const R=af.querySelector("#slR"),lab=af.querySelector("#slT");if(!R)return;
  const upd=x=>{const T=Math.min(65,Math.max(-40,Math.round(x*2)/2));st.ts=String(T);save();R.value=T;lab.textContent=f(T,1);
   document.getElementById("ans").innerHTML=ansHTML(byId("slide").calc(st));};
  R.addEventListener("input",()=>upd(+R.value));
  af.querySelectorAll("[data-step]").forEach(b=>b.onclick=()=>upd(slideT(st)+ +b.dataset.step));
 },
 note:"Range −40 to 65 °C. Same property data as the Pressure–temperature tool. Gauge readings assume sea-level air pressure."},

{id:"sh",g:"ref",icon:"sh",name:"Superheat",short:"Suction pressure + line temp",
 intro:"Measure suction pressure at the service port and the suction line temperature near the evaporator outlet or compressor.",
 fields:[
  {id:"ref",label:"Refrigerant",type:"chips",def:"R410A",options:REFOPTS},
  {id:"P",label:"Suction pressure",type:"num",def:"8.5",units:Object.keys(GAUGE),udef:"bar g"},
  {id:"T",label:"Suction line temperature",help:"Clamp the probe on bare pipe and insulate over it.",type:"num",def:"12",unit:"°C"}
 ],
 calc(v){
  const k=v.ref,pv=num(v.P),Tl=num(v.T);
  if(!isFinite(pv))return{hint:"Enter the suction pressure."};if(!isFinite(Tl))return{hint:"Enter the suction line temperature."};
  const P=toAbs(pv,v.P_u),Te=refT(k,P,"d");
  if(!isFinite(Te))return{hint:`That suction pressure is outside the −40 to 65 °C range for ${REF[k].n}. Check the gauge and unit.`};
  const SH=Tl-Te,st=shState(SH);
  if(SH<-1)return{hint:`The line is ${f(-SH,1)} K colder than the boiling temperature (${f(Te,1)} °C), which is not possible. Check the probe position, the pressure reading and the refrigerant type.`};
  const msg=SH<2?"Liquid refrigerant may be reaching the compressor. Check for overcharge, TXV overfeeding or low evaporator airflow."
   :SH<4?"On the low side. Watch for liquid floodback, especially on fixed-orifice systems."
   :SH<=12?"This is a normal range for most systems. TXV systems usually run 5 to 8 K at the evaporator outlet."
   :"The evaporator is starved of refrigerant. Common causes are low charge, a restriction or a TXV that is underfeeding.";
  return{cap:"Superheat",value:f(Math.max(SH,0),1),unit:"K",status:st,
   say:`Refrigerant boils at ${B(f(Te,1),"°C")} and the suction line is ${f(Tl,1)} °C, so superheat is ${B(f(Math.max(SH,0),1),"K")}. ${msg}`,
   rows:[["Evaporating temperature",f(Te,1),"°C"],["Suction pressure",f(P,2),"bar a"]]};
 },
 note:"For R-407C and other blends, the dew temperature is used, which is correct for superheat. 1 K = 1 °C difference."},

{id:"sc",g:"ref",icon:"sc",name:"Subcooling",short:"Liquid pressure + liquid line temp",
 intro:"Measure the liquid line pressure (or discharge pressure) and the liquid line temperature near the condenser outlet.",
 fields:[
  {id:"ref",label:"Refrigerant",type:"chips",def:"R410A",options:REFOPTS},
  {id:"P",label:"Liquid line pressure",type:"num",def:"26",units:Object.keys(GAUGE),udef:"bar g"},
  {id:"T",label:"Liquid line temperature",type:"num",def:"40",unit:"°C"}
 ],
 calc(v){
  const k=v.ref,pv=num(v.P),Tl=num(v.T);
  if(!isFinite(pv))return{hint:"Enter the liquid line pressure."};if(!isFinite(Tl))return{hint:"Enter the liquid line temperature."};
  const P=toAbs(pv,v.P_u),Tc=refT(k,P,"b");
  if(!isFinite(Tc))return{hint:`That pressure is outside the −40 to 65 °C range for ${REF[k].n}. Check the gauge and unit.`};
  const SC=Tc-Tl,st=scState(SC);
  if(SC<-1)return{hint:`The liquid line is ${f(-SC,1)} K hotter than the condensing temperature (${f(Tc,1)} °C), which is not possible. Check the probe, the gauge and the refrigerant type.`};
  const msg=SC<1?"There is no liquid seal, so flash gas may reach the expansion valve. This usually means low charge."
   :SC<3?"On the low side. This may point to a slight undercharge."
   :SC<=10?"This is a normal range for most systems. Many TXV units target 4 to 6 K, but check the unit's label."
   :"Too much liquid is backing up in the condenser. Common causes are overcharge or a restriction after the measuring point.";
  return{cap:"Subcooling",value:f(Math.max(SC,0),1),unit:"K",status:st,
   say:`Refrigerant condenses at ${B(f(Tc,1),"°C")} and the liquid line is ${f(Tl,1)} °C, so subcooling is ${B(f(Math.max(SC,0),1),"K")}. ${msg}`,
   rows:[["Condensing temperature",f(Tc,1),"°C"],["Liquid pressure",f(P,2),"bar a"]]};
 },
 note:"For blends, the bubble temperature is used, which is correct for subcooling."},

{id:"chg",g:"ref",icon:"chg",name:"Charge check",short:"Diagnose charge from 4 readings",
 intro:"Enter suction and liquid readings and the outdoor temperature. You get superheat, subcooling and the most likely problem.",
 fields:[
  {id:"ref",label:"Refrigerant",type:"chips",def:"R410A",options:REFOPTS},
  {id:"meter",label:"Expansion device",type:"chips",def:"txv",options:[["txv","TXV / EEV"],["fixed","Fixed orifice / capillary"]]},
  {id:"Ps",label:"Suction pressure",type:"num",def:"8.5",units:Object.keys(GAUGE),udef:"bar g"},
  {id:"Ts",label:"Suction line temperature",type:"num",def:"12",unit:"°C"},
  {id:"Pl",label:"Liquid line pressure",type:"num",def:"26",units:Object.keys(GAUGE),udef:"bar g"},
  {id:"Tl",label:"Liquid line temperature",type:"num",def:"40",unit:"°C"},
  {id:"amb",label:"Outdoor air temperature",help:"Air entering the condenser.",type:"num",def:"35",unit:"°C"},
  {id:"tsc",label:"Target subcooling",help:"From the unit's label or charging chart.",type:"num",def:"5",unit:"K",adv:true,show:v=>v.meter==="txv"},
  {id:"tsh",label:"Target superheat",help:"From the unit's charging chart (depends on indoor wet bulb and outdoor temperature).",type:"num",def:"10",unit:"K",adv:true,show:v=>v.meter==="fixed"}
 ],
 calc(v){
  const k=v.ref,ps=num(v.Ps),ts=num(v.Ts),pl=num(v.Pl),tl=num(v.Tl),amb=num(v.amb);
  if(![ps,ts,pl,tl].every(isFinite))return{hint:"Enter all four readings: suction pressure and temperature, liquid pressure and temperature."};
  const Te=refT(k,toAbs(ps,v.Ps_u),"d"),Tc=refT(k,toAbs(pl,v.Pl_u),"b");
  if(!isFinite(Te)||!isFinite(Tc))return{hint:`A pressure is outside the −40 to 65 °C range for ${REF[k].n}. Check the gauges, units and refrigerant type.`};
  const SH=ts-Te,SC=Tc-tl;
  if(SH<-1||SC<-1)return{hint:"A temperature reading is impossible for these pressures. Check probe positions, gauge units and the refrigerant type."};
  if(Tc<=Te)return{hint:"The liquid pressure must be higher than the suction pressure. Check which gauge is which."};
  let dx,ok=false,more=[];
  if(v.meter==="txv"){const t=num(v.tsc)||5;
   if(SC<t-2&&SH>10)dx="Low charge, probably a leak";
   else if(SC>t+4&&SH>10)dx="Liquid line restriction or TXV starving";
   else if(SC>t+4)dx="Overcharged";
   else if(SH<3)dx="TXV overfeeding or low indoor airflow";
   else if(SH>12)dx="TXV underfeeding";
   else{dx="Charge looks correct";ok=true;}
  }else{const t=num(v.tsh)||10;
   if(SH>t+5&&SC<4)dx="Low charge, probably a leak";
   else if(SH>t+5)dx="Underfeeding: low charge or a restriction";
   else if(SH<t-5&&SC>8)dx="Overcharged";
   else if(SH<t-5)dx="Low indoor airflow or overcharge";
   else{dx="Charge looks correct";ok=true;}
  }
  const why={"Low charge, probably a leak":"High superheat with low subcooling means not enough refrigerant. Find and fix the leak before adding any refrigerant.",
   "Liquid line restriction or TXV starving":"Liquid is backing up and the evaporator is starved. Check the filter drier (temperature drop across it), the sight glass and the TXV bulb.",
   "Overcharged":"High subcooling with normal or low superheat means too much refrigerant. Recover some charge and recheck.",
   "TXV overfeeding or low indoor airflow":"Very low superheat risks liquid reaching the compressor. Check the indoor filter, fan and coil first, then the TXV bulb mounting and setting.",
   "TXV underfeeding":"Superheat is high but subcooling is fine, so the charge is OK. Check the TXV bulb, the setting, or a blocked TXV strainer.",
   "Underfeeding: low charge or a restriction":"Superheat is high. If subcooling is normal, look for a restriction at the orifice or strainer.",
   "Low indoor airflow or overcharge":"Superheat is low. Check the indoor filter, fan speed and coil before removing any refrigerant.",
   "Charge looks correct":"Superheat and subcooling are both in range for this type of system."}[dx];
  if(isFinite(amb)){const ap=Tc-amb;
   if(ap>20)more.push(`Condensing temperature is ${f(ap,0)} K above outdoor air, which is high. Check the condenser coil, condenser fan, overcharge or non-condensable gas.`);
   else if(ap<5)more.push(`Condensing temperature is only ${f(ap,0)} K above outdoor air. That usually means low charge or a compressor that is not pumping.`);}
  if(Te<0&&["R410A","R32","R22","R407C"].includes(k))more.push(`Evaporating temperature is ${f(Te,1)} °C. On an air-conditioning coil this will freeze it. Check airflow and charge.`);
  if(more.length)ok=false;
  return{cap:"Most likely",big:dx,status:{ok,text:ok?"No problem found":"Needs attention"},
   say:why+(more.length?`<ul class="more-list">${more.map(m=>`<li>${m}</li>`).join("")}</ul>`:""),
   rows:[["Superheat",f(Math.max(SH,0),1),"K"],["Subcooling",f(Math.max(SC,0),1),"K"],["Evaporating",f(Te,1),"°C"],["Condensing",f(Tc,1),"°C"],...(isFinite(amb)?[["Condenser approach",f(Tc-amb,1),"K"]]:[])]};
 },
 note:"Field guide only. Always confirm with the manufacturer's charging chart, and repair leaks before adding refrigerant."},

{id:"addchg",g:"ref",icon:"addchg",name:"Additional charge",short:"Extra refrigerant for pipe length",
 intro:"Enter the liquid line size and length. You get the extra refrigerant to add for pipe beyond the pre-charged length.",
 fields:[
  {id:"ref",label:"Refrigerant",type:"chips",def:"R410A",options:Object.keys(RLP).map(k=>[k,REF[k]?REF[k].n:k])},
  {id:"sz",label:"Liquid line size",type:"chips",def:"1",options:ACR.slice(0,6).map((a,i)=>[String(i),a[0]])},
  {id:"L",label:"Liquid line length",help:"One way, actual length.",type:"num",def:"25",unit:"m",half:true},
  {id:"L0",label:"Pre-charged length",help:"From the outdoor unit label. 0 for VRF.",type:"num",def:"7.5",unit:"m",half:true},
  {id:"sz2",label:"Second liquid line size (VRF branches)",type:"select",def:"-",options:[["-","None"]].concat(ACR.slice(0,6).map((a,i)=>[String(i),a[0]])),adv:true},
  {id:"L2",label:"Second size length",type:"num",def:"0",unit:"m",adv:true}
 ],
 calc(v){
  const p=RLP[v.ref],a=ACR[+v.sz],L=num(v.L),L0=num(v.L0)||0;if(!(L>0))return{hint:"Enter the liquid line length."};
  const gpm=x=>{const id=(x[1]-2*x[2])/1000;return Math.PI*id*id/4*p.rl*1000;};
  const g1=gpm(a),ex=Math.max(L-L0,0)*g1,b=v.sz2!=="-"?ACR[+v.sz2]:null,L2=num(v.L2)||0,ex2=b?L2*gpm(b):0,tot=ex+ex2;
  return{cap:"Additional charge",value:f(tot/1000,2),unit:"kg",
   say:`${a[0]} liquid line holds about ${f(g1,0)} g/m of ${REF[v.ref].n}. For ${f(Math.max(L-L0,0),1)} m beyond the pre-charged length, add ${B(f(tot/1000,2),"kg")} (${f(tot,0)} g).`+(L>L0?"":" No extra charge: the pipe is within the pre-charged length."),
   rows:[["Main line",f(ex,0),"g"],["Second size",f(ex2,0),"g"],["g per metre",f(g1,0),"g/m"]]};
 },
 note:"Estimate from liquid-line volume × liquid density. The outdoor unit's label or installation manual (g/m per size) always governs. Charge by weight with liquid for blends."},

{id:"lsize",g:"ref",icon:"lsize",name:"Refrigerant line sizing",short:"Suction, liquid and discharge by velocity",
 intro:"Enter the refrigerant, capacity and line. You get the velocity in each copper size and the one to use.",
 fields:[
  {id:"ref",label:"Refrigerant",type:"chips",def:"R410A",options:Object.keys(RLP).map(k=>[k,REF[k]?REF[k].n:k])},
  {id:"kw",label:"Cooling capacity",type:"num",def:"28",units:["kW","TR"],udef:"kW"},
  {id:"ln",label:"Line",type:"chips",def:"s",options:[["s","Suction"],["l","Liquid"],["d","Discharge"]]},
  {id:"riser",label:"Vertical riser?",type:"chips",def:"0",options:[["0","No"],["1","Yes, suction up"]],show:v=>v.ln==="s"}
 ],
 calc(v){
  let kw=num(v.kw);if(!(kw>0))return{hint:"Enter the capacity."};if(v.kw_u==="TR")kw*=3.51685;const p=RLP[v.ref],m=kw/p.dh,rho={s:p.rs,l:p.rl,d:p.rd}[v.ln];
  const lim={s:v.riser==="1"?[7.5,15]:[4,15],l:[0.5,1.5],d:[10,18]}[v.ln];
  const rows=ACR.map(a=>{const id=(a[1]-2*a[2])/1000,vel=m/rho/(Math.PI*id*id/4);return{a,vel};});
  const pick=rows.find(r=>r.vel>=lim[0]&&r.vel<=lim[1])||rows.find(r=>r.vel<=lim[1]);
  return{cap:"Use copper size",value:pick?pick.a[0]:"—",unit:"OD",
   say:`Mass flow is about ${f(m*3600,0)} kg/h. ${pick?`In ${B(pick.a[0])} the velocity is ${B(f(pick.vel,1),"m/s")}, inside the ${lim[0]}–${lim[1]} m/s range for ${({s:"suction",l:"liquid",d:"discharge"})[v.ln]} lines.`:"No standard size fits the velocity range."}`+(v.ln==="s"&&v.riser==="1"?" Suction risers need enough velocity to carry oil up; use a double riser if the load varies a lot.":""),
   rows:[["Mass flow",f(m*1000,1),"g/s"],["Velocity range",lim.join("–"),"m/s"]],
   after:tbl(["Size","Velocity m/s",""],rows.map(r=>({cls:r===pick?"sel":"",c:[r.a[0],f(r.vel,2),r.vel<lim[0]?"Too slow":r.vel>lim[1]?"Too fast":"OK"]})))};
 },
 note:"Approximate properties at 5 °C evaporating and 45 °C condensing. Also check pressure drop (about 1 K saturation loss on suction). The equipment installation manual governs pipe sizes."},

{id:"n2",g:"ref",icon:"n2",name:"Nitrogen pressure test",short:"Correct the reading for temperature",
 intro:"Enter the test pressure and temperature at the start and now. You find out if a pressure change is a leak or just temperature.",
 fields:[
  {id:"p1",label:"Pressure at start",type:"num",def:"41.5",unit:"bar g",half:true},
  {id:"t1",label:"Temperature at start",type:"num",def:"28",unit:"°C",half:true},
  {id:"p2",label:"Pressure now",type:"num",def:"40.9",unit:"bar g",half:true},
  {id:"t2",label:"Temperature now",type:"num",def:"23",unit:"°C",half:true},
  {id:"tol",label:"Allowed change",type:"num",def:"0.1",unit:"bar",adv:true}
 ],
 calc(v){
  const p1=num(v.p1),t1=num(v.t1),p2=num(v.p2),t2=num(v.t2),tol=num(v.tol)||0.1;if(![p1,t1,p2,t2].every(isFinite))return{hint:"Enter both pressures and temperatures."};
  const pe=(p1+PATM)*(t2+273.15)/(t1+273.15)-PATM,d=p2-pe,ok=d>=-tol;
  return{cap:"Expected pressure now",value:f(pe,2),unit:"bar g",status:{ok,text:ok?"No leak":"Leak likely"},
   say:`From ${f(t1,1)} to ${f(t2,1)} °C, the pressure should change from ${f(p1,2)} to ${B(f(pe,2),"bar g")} with no leak. You read ${f(p2,2)} bar g, ${B(f(Math.abs(d),2),"bar")} ${d<0?"below":"above"} that.`+(ok?" The change is due to temperature.":" That is more than the allowed change, so look for a leak with soapy water or an electronic detector."),
   rows:[["Corrected difference",f(d,2),"bar"],["Change from temperature",f(pe-p1,2),"bar"]]};
 },
 note:"Gas law: P₂ = P₁ × T₂ ÷ T₁ in absolute pressure and kelvin. Read temperature on the pipe, out of the sun. Test pressure to the equipment maker's value."},

{id:"vac",g:"ref",icon:"vac",name:"Vacuum decay test",short:"Leak or moisture from micron readings",
 intro:"Pull down, isolate the pump, then record the gauge at the start, halfway and at the end of the hold.",
 fields:[
  {id:"a",label:"Vacuum when isolated",type:"num",def:"400",unit:"microns",half:true},
  {id:"b",label:"Halfway reading",type:"num",def:"700",unit:"microns",half:true},
  {id:"c",label:"End of hold",type:"num",def:"820",unit:"microns",half:true},
  {id:"t",label:"Hold time",type:"num",def:"10",unit:"min",half:true},
  {id:"lim",label:"Maximum allowed at end",type:"num",def:"1000",unit:"microns",adv:true}
 ],
 calc(v){
  const a=num(v.a),b=num(v.b),c=num(v.c),lim=num(v.lim)||1000;if(![a,c].every(isFinite))return{hint:"Enter the start and end readings."};
  const r1=isFinite(b)?b-a:NaN,r2=isFinite(b)?c-b:NaN,ok=a<=500&&c<=lim;
  const why=!isFinite(b)?"":c<=lim?"":r2<r1*0.5?" The rise slowed down, which points to moisture: keep evacuating, warm the pipes, and use a triple evacuation with nitrogen.":" The rise stayed steady, which points to a leak: pressure test with nitrogen and find it before evacuating again.";
  return{cap:"Result",big:ok?"Pass: dry and tight":a>500?"Not deep enough":"Fail",status:{ok,text:ok?"Pass":"Fail"},
   say:`The gauge rose from ${f(a,0)} to ${f(c,0)} microns (${f(c-a,0)} microns) in ${f(num(v.t)||10,0)} minutes.`+(a>500?" Pull down to 500 microns or less before starting the hold.":"")+(c>lim?` It finished above ${f(lim,0)} microns.`:"")+why,
   rows:[["Rise",f(c-a,0),"microns"],["End reading",f(c*0.13332,0),"Pa"],["End reading",f(c*0.0013332,2),"mbar"]]};
 },
 note:"Common practice: evacuate to 500 microns or below, isolate, and hold 10 minutes; it should stay below about 1000 microns. Follow the equipment maker's procedure."},

{id:"cop",g:"ref",icon:"cop",name:"Compression ratio & COP",short:"System efficiency from gauge pressures",
 intro:"Enter the refrigerant and gauge pressures. You get the compression ratio, saturation temperatures and ideal COP. Add capacity and power for the real COP.",
 fields:[
  {id:"ref",label:"Refrigerant",type:"chips",def:"R410A",options:REFOPTS},
  {id:"ps",label:"Suction pressure",type:"num",def:"8.5",units:Object.keys(GAUGE),udef:"bar g"},
  {id:"pd",label:"Discharge pressure",type:"num",def:"27",units:Object.keys(GAUGE),udef:"bar g"},
  {id:"cap",label:"Measured cooling capacity",type:"num",def:"",unit:"kW",half:true,adv:true},
  {id:"pw",label:"Measured power input",type:"num",def:"",unit:"kW",half:true,adv:true}
 ],
 calc(v){
  const ps=num(v.ps),pd=num(v.pd);if(!isFinite(ps)||!isFinite(pd))return{hint:"Enter suction and discharge pressure."};
  const Ps=toAbs(ps,v.ps_u),Pd=toAbs(pd,v.pd_u),cr=Pd/Ps,Te=refT(v.ref,Ps,"d"),Tc=refT(v.ref,Pd,"b");
  if(!isFinite(Te)||!isFinite(Tc))return{hint:`A pressure is outside the −40 to 65 °C range for ${REF[v.ref].n}. Check the gauges and unit.`};
  const carnot=(Te+273.15)/(Tc-Te),cap=num(v.cap),pw=num(v.pw),real=cap>0&&pw>0?cap/pw:NaN;
  return{cap:"Compression ratio",value:f(cr,2),unit:"",status:{ok:cr<=6,text:cr<=4?"Normal for AC":cr<=6?"High-ish":"Very high"},
   say:`Evaporating at ${B(f(Te,1),"°C")} and condensing at ${B(f(Tc,1),"°C")} gives a compression ratio of ${B(f(cr,2))}. The ideal (Carnot) COP is ${f(carnot,1)}; real systems reach about 40–55 % of that.`+(isFinite(real)?` Your measured COP is ${B(f(real,2))}, which is ${f(real/carnot*100,0)} % of ideal.`:"")+(cr>6?" A high ratio means hot running and lower capacity: check the condenser, charge and airflow.":""),
   rows:[["Evaporating",f(Te,1),"°C"],["Condensing",f(Tc,1),"°C"],["Lift (Tc − Te)",f(Tc-Te,1),"K"],["Carnot COP",f(carnot,2),""],["Measured COP",isFinite(real)?f(real,2):"—",""]]};
 },
 note:"Compression ratio = absolute discharge ÷ absolute suction. Air-conditioning scroll compressors usually run 2.5–4. Every 1 K less lift saves about 2–3 % energy."},

{id:"chglim",g:"ref",icon:"chglim",name:"Refrigerant charge limit",short:"Maximum safe charge for the room size",
 intro:"Enter the refrigerant, the smallest room the system serves and how the indoor unit is mounted. You get the maximum charge allowed without extra safety measures.",
 fields:[
  {id:"r",label:"Refrigerant",type:"chips",def:"R32",options:[["R410A","R-410A"],["R32","R-32"],["R407C","R-407C"],["R134a","R-134a"],["R22","R-22"],["R290","R-290"]]},
  {id:"A",label:"Floor area of the smallest room",type:"num",def:"20",unit:"m²",half:true},
  {id:"H",label:"Room height",type:"num",def:"2.7",unit:"m",half:true},
  {id:"h0",label:"Indoor unit mounting",type:"chips",def:"2.2",options:[["0.6","Floor"],["1","Window"],["1.8","Wall"],["2.2","Ceiling"]]},
  {id:"m",label:"System charge",type:"num",def:"4.5",unit:"kg"}
 ],
 calc(v){
  const P={R410A:[0.44,null],R32:[0.061,0.307],R407C:[0.31,null],R134a:[0.25,null],R22:[0.3,null],R290:[0.008,0.038]}[v.r],A=num(v.A),H=num(v.H),h0=num(v.h0),m=num(v.m);if(!(A>0&&H>0))return{hint:"Enter the room area and height."};
  const V=A*H,mPL=P[0]*V,mF=P[1]?2.5*Math.pow(P[1],1.25)*h0*Math.sqrt(A):Infinity,mx=Math.min(mPL,mF),ok=!(m>0)||m<=mx;
  return{cap:"Maximum charge",value:f(mx,2),unit:"kg",status:m>0?{ok,text:ok?"Within the limit":"Over the limit"}:null,
   say:`For a ${f(A)} m² room (${f(V,0)} m³), the practical limit of ${f(P[0],3)} kg/m³ allows ${f(mPL,2)} kg.`+(P[1]?` Because ${v.r.replace("R","R-")} is flammable, the room-size formula for a ${({"0.6":"floor","1":"window","1.8":"wall","2.2":"ceiling"})[v.h0]} unit allows ${f(mF,2)} kg.`:"")+` The limit is ${B(f(mx,2),"kg")}.`+(m>0?(ok?` Your ${f(m,1)} kg is within it.`:` Your ${f(m,1)} kg is over it: add leak detection with ventilation or shut-off valves, use a larger room, or split the system.`):""),
   rows:[["Room volume",f(V,1),"m³"],["Practical limit",f(P[0],3),"kg/m³"],["Limit by toxicity / practical limit",f(mPL,2),"kg"],["Limit by flammability",P[1]?f(mF,2):"—","kg"]]};
 },
 note:"EN 378-1 / ISO 5149 practical limits; flammable (A2L, A3) charge formula m = 2.5 × LFL^1.25 × h0 × √A from IEC 60335-2-40. Newer editions allow more with safety measures. Local regulation governs."},

{id:"cold",g:"ref",icon:"cold",name:"Cold room load",short:"Refrigeration load for a chiller or freezer room",
 intro:"Enter the room size, temperatures and product. You get the refrigeration capacity needed.",
 fields:[
  {id:"L",label:"Length",type:"num",def:"5",unit:"m",half:true},
  {id:"W",label:"Width",type:"num",def:"4",unit:"m",half:true},
  {id:"H",label:"Height",type:"num",def:"3",unit:"m",half:true},
  {id:"Ti",label:"Room temperature",type:"num",def:"2",unit:"°C",half:true,presets:[["2","Chiller 2"],["-18","Freezer −18"],["-25","Freezer −25"]]},
  {id:"To",label:"Outside the room",type:"num",def:"35",unit:"°C",half:true},
  {id:"U",label:"Panel U-value",help:"PU panel: 100 mm about 0.22, 150 mm about 0.15.",type:"num",def:"0.22",unit:"W/m²K",half:true},
  {id:"pm",label:"Product in per day",type:"num",def:"1500",unit:"kg",half:true},
  {id:"pt",label:"Product temperature in",type:"num",def:"15",unit:"°C",half:true},
  {id:"cp",label:"Product specific heat (above freezing)",type:"num",def:"3.6",unit:"kJ/kg·K",adv:true},
  {id:"ac",label:"Door air changes per day",help:"Leave blank for a typical value from room size.",type:"num",def:"",unit:"per day",adv:true},
  {id:"run",label:"Compressor running hours",type:"num",def:"18",unit:"h/day",adv:true}
 ],
 calc(v){
  const L=num(v.L),W=num(v.W),H=num(v.H),Ti=num(v.Ti),To=num(v.To),U=num(v.U),pm=num(v.pm)||0,pt=num(v.pt),cp=num(v.cp)||3.6,run=num(v.run)||18;
  if(!(L>0&&W>0&&H>0))return{hint:"Enter the room size."};if(!isFinite(Ti)||!isFinite(To))return{hint:"Enter the room and outside temperatures."};
  const V=L*W*H,A=2*(L*W+L*H+W*H),frz=Ti<-1,ac=num(v.ac)>0?num(v.ac):Math.max(3,Math.min(40,70/Math.sqrt(V)));
  const wall=U*A*(To-Ti)*24*3.6,dh=PSY.fromRH(To,50,101.325).h-PSY.fromRH(Math.max(Ti,-20),90,101.325).h,inf=V*ac*1.2*Math.max(dh,1);
  const prod=pm*(frz?(cp*Math.max(pt-(-1),0)+250+1.9*Math.max(-1-Ti,0)):cp*Math.max(pt-Ti,0));
  const misc=(L*W*10*8+270*4+V*15*24)*3.6;
  const day=wall+inf+prod+misc,kW=day*1.1/(run*3600);
  return{cap:"Refrigeration capacity",value:f(kW,2),unit:"kW",
   say:`A ${f(V,0)} m³ ${frz?"freezer":"chiller"} room at ${f(Ti)} °C gains ${f(day/1000,0)} MJ per day. Running ${f(run)} hours a day with 10 % margin, it needs ${B(f(kW,2),"kW")} (${f(kW/3.517,2)} TR) of refrigeration at about ${f(Ti-8,0)} °C evaporating.`+(frz?" Freezers need heated door frames, pressure-relief ports and defrost.":""),
   rows:[["Walls, roof, floor",f(wall/86400,2),"kW avg"],["Door air",f(inf/86400,2),"kW avg"],["Product",f(prod/86400,2),"kW avg"],["Lights, people, fans",f(misc/86400,2),"kW avg"],["Daily load",f(day/1000,0),"MJ"]]};
 },
 note:"Simplified daily heat balance (ASHRAE Refrigeration method). Freezing uses about 250 kJ/kg latent heat; check product data. Size the condensing unit for Gulf ambient (46–52 °C)."},

{id:"gwp",g:"ref",icon:"gwp",name:"Refrigerant GWP / CO₂e",short:"tCO₂e and leak-check frequency",
 intro:"Enter the refrigerant and its charge. You get the CO₂-equivalent and how often leak checks are needed.",
 fields:[
  {id:"r",label:"Refrigerant",type:"select",def:"R410A",options:Object.keys(GWP).map(k=>[k,k.replace("R","R-")])},
  {id:"kg",label:"Charge in the system",type:"num",def:"12",unit:"kg",half:true},
  {id:"lk",label:"Refrigerant added this year",help:"For leak rate. Leave 0 if none.",type:"num",def:"0",unit:"kg",half:true},
  {id:"ld",label:"Automatic leak detection fitted?",type:"chips",def:"0",options:[["0","No"],["1","Yes"]],adv:true}
 ],
 calc(v){
  const g=GWP[v.r],kg=num(v.kg),lk=num(v.lk)||0;if(!(kg>0))return{hint:"Enter the charge."};const t=kg*g/1000,ld=v.ld==="1";
  const freq=t<5?"No periodic leak check required":t<50?(ld?"Every 24 months":"Every 12 months"):t<500?(ld?"Every 12 months":"Every 6 months"):(ld?"Every 6 months":"Every 3 months, and leak detection is mandatory");
  return{cap:"CO₂-equivalent",value:f(t,1),unit:"tCO₂e",
   say:`${f(kg,1)} kg of ${v.r.replace("R","R-")} (GWP ${g}) equals ${B(f(t,1),"tonnes CO₂e")}. Leak checks: ${B(freq.toLowerCase())}.`+(lk>0?` Adding ${f(lk,1)} kg this year is a ${B(f(lk/kg*100,1),"%")} leak rate.`:""),
   rows:[["GWP (AR4)",g,""],["Leak rate",lk>0?f(lk/kg*100,1):"—","%"],["CO₂e of top-up",f(lk*g/1000,2),"t"]]};
 },
 note:"GWP values from IPCC AR4 as used in EU F-gas rules. Check intervals follow the EU F-gas thresholds (5, 50, 500 tCO₂e). Your country's regulations may differ."}
);
