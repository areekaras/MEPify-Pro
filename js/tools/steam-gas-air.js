/* MEPify · Steam, gas & air tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
{id:"stpipe",g:"util",icon:"steam",name:"Steam pipe sizing",short:"Pipe size from steam flow and velocity",
 intro:"Enter the steam flow and pressure. You get the pipe bore and the schedule 40 size to use.",
 fields:[
  {id:"m",label:"Steam flow",type:"num",def:"1000",units:Object.keys(MU),udef:"kg/h"},
  {id:"P",label:"Steam pressure (gauge)",type:"num",def:"7",units:Object.keys(FPU),udef:"bar"},
  {id:"V",label:"Design velocity",help:"Saturated steam mains 25 to 35 m/s. Use the lower end near equipment or for quiet runs.",type:"num",def:"30",unit:"m/s",presets:[["20","20 quiet"],["25","25"],["30","30"],["35","35 mains"]]}
 ],
 calc(v){
  const m=num(v.m)*(MU[v.m_u]||1),Pg=num(v.P)*(FPU[v.P_u]||1),V=num(v.V);
  if(!(m>0))return{hint:"Enter the steam flow."};if(!(Pg>=0&&Pg<=29))return{hint:"Enter a gauge pressure from 0 to 29 bar."};if(!(V>0))return{hint:"Enter the design velocity."};
  const s=sat(Pg+1.01325),Qv=m/3600*s.vg,d=Math.sqrt(4*Qv/(Math.PI*V))*1000,p=stlPick(d),va=p?Qv/(Math.PI*(p[2]/1000)**2/4):NaN;
  return{cap:"Pipe size",value:p?p[0]:"> 400",unit:p?"mm ("+p[1]+")":"mm",
   say:`${f(m,0)} kg/h of steam at ${f(Pg,1)} bar g (${f(s.T,1)} °C) is ${f(Qv*3600,0)} m³/h. At ${f(V,0)} m/s it needs a ${f(d,1)} mm bore, so use ${B(p?"DN"+p[0]+" ("+p[1]+") Sch 40":"more than DN400")}`+(p?`, giving ${f(va,1)} m/s.`:"."),
   rows:[["Bore needed",f(d,1),"mm"],["Actual velocity",f(va,1),"m/s"],["Saturation temperature",f(s.T,1),"°C"],["Specific volume",f(s.vg,4),"m³/kg"],["Volume flow",f(Qv*3600,0),"m³/h"]]};
 },
 note:"d = √(4 ṁ v<sub>g</sub> ÷ (π V)). Saturated steam properties from IAPWS-IF97 steam tables. Check the pressure drop on long runs; superheated steam can run 40 to 60 m/s."},

{id:"stuse",g:"util",icon:"flash",name:"Steam consumption & trap load",short:"Steam and condensate from a heat load",
 intro:"Enter the heat load, or the water or air you are heating. You get the steam flow, the condensate and the trap capacity to select.",
 fields:[
  {id:"mode",label:"What are you heating?",type:"chips",def:"kw",options:[["kw","Known heat load"],["w","Water"],["a","Air (coil)"]]},
  {id:"Q",label:"Heat load",type:"num",def:"200",units:["kW","BTU/h"],udef:"kW",show:v=>v.mode==="kw"},
  {id:"F",label:"Water flow",type:"num",def:"50",units:uu("flow"),udef:"L/min",show:v=>v.mode==="w"},
  {id:"A",label:"Air flow",type:"num",def:"5000",units:Object.keys(AIRF),udef:"m³/h",show:v=>v.mode==="a"},
  {id:"dT",label:"Temperature rise",type:"num",def:"30",units:uu("dT"),udef:"°C",show:v=>v.mode!=="kw"},
  {id:"P",label:"Steam pressure at the equipment (gauge)",type:"num",def:"3",units:Object.keys(FPU),udef:"bar"},
  {id:"sf",label:"Trap safety factor",type:"chips",def:"2",options:[["1.5","1.5× steady load"],["2","2× process / HX"],["3","3× drip legs, warm-up"]]}
 ],
 calc(v){
  const Pg=num(v.P)*(FPU[v.P_u]||1),sf=num(v.sf);if(!(Pg>=0&&Pg<=29))return{hint:"Enter a gauge pressure from 0 to 29 bar."};
  let kw;
  if(v.mode==="kw"){kw=num(v.Q)*(v.Q_u==="BTU/h"?0.00029307107:1);if(!(kw>0))return{hint:"Enter the heat load."};}
  else{const dT=si(v,"dT","dT");if(!(dT>0))return{hint:"Enter the temperature rise."};
   if(v.mode==="w"){const F=si(v,"F","flow");if(!(F>0))return{hint:"Enter the water flow."};kw=F*RHO*4.186*dT;}
   else{const A=num(v.A)*(AIRF[v.A_u]||1);if(!(A>0))return{hint:"Enter the air flow."};kw=A*1.2*1.005*dT;}}
  const s=sat(Pg+1.01325),m=kw*3600/s.hfg;
  return{cap:"Steam flow",value:f(m,0),unit:"kg/h",
   say:`${f(kw,1)} kW at ${f(Pg,1)} bar g uses ${B(f(m,0),"kg/h")} of steam (latent heat ${f(s.hfg,0)} kJ/kg). Select a trap for at least ${B(f(m*sf,0),"kg/h")} at the actual pressure difference across it.`,
   rows:[["Steam flow",f(m*2.20462,0),"lb/h"],["Condensate",f(m,0),"kg/h"],["Trap capacity",f(m*sf,0),"kg/h"],["Heat load",f(kw,1),"kW"],["Steam temperature",f(s.T,1),"°C"]]};
 },
 note:"ṁ = Q ÷ h<sub>fg</sub>. Size the trap on the pressure difference across it, not the boiler pressure. Modulating control valves lower the steam pressure in the coil at part load, so check the trap at minimum pressure too."},

{id:"stflash",g:"util",icon:"steam",name:"Flash steam",short:"Flash from condensate at lower pressure",
 intro:"Enter the condensate pressure, the lower pressure it drops to and the condensate flow. You get the flash steam made.",
 fields:[
  {id:"P1",label:"Condensate pressure (gauge)",help:"The steam pressure at the trap inlet.",type:"num",def:"7",units:Object.keys(FPU),udef:"bar"},
  {id:"P2",label:"Lower pressure (gauge)",help:"Flash vessel or condensate return. 0 for an open vented return.",type:"num",def:"0",units:Object.keys(FPU),udef:"bar"},
  {id:"m",label:"Condensate flow",type:"num",def:"1000",units:Object.keys(MU),udef:"kg/h"}
 ],
 calc(v){
  const P1=num(v.P1)*(FPU[v.P1_u]||1),P2=num(v.P2)*(FPU[v.P2_u]||1),m=num(v.m)*(MU[v.m_u]||1);
  if(!(P1>=0&&P1<=29))return{hint:"Enter a condensate pressure from 0 to 29 bar g."};if(!(P2>=0&&P2<P1))return{hint:"The lower pressure must be below the condensate pressure."};if(!(m>0))return{hint:"Enter the condensate flow."};
  const a=sat(P1+1.01325),b=sat(P2+1.01325),x=(a.hf-b.hf)/b.hfg,fl=m*x;
  return{cap:"Flash steam",value:f(x*100,1),unit:"%",
   say:`Condensate at ${f(P1,1)} bar g dropping to ${f(P2,1)} bar g flashes ${B(f(x*100,1),"%")}. From ${f(m,0)} kg/h that is ${B(f(fl,0),"kg/h")} of flash steam, about ${f(fl*b.vg,0)} m³/h of vapour.`,
   rows:[["Flash steam",f(fl,0),"kg/h"],["Condensate left",f(m-fl,0),"kg/h"],["Flash vapour volume",f(fl*b.vg,0),"m³/h"],["Heat in flash steam",f(fl*b.hfg/3600,1),"kW"]]};
 },
 note:"Flash % = (h<sub>f1</sub> − h<sub>f2</sub>) ÷ h<sub>fg2</sub>. The vapour volume is large, so size condensate return lines for the flash steam, not the water."},

{id:"gasload",g:"util",icon:"gasf",name:"Gas load & flow",short:"Appliance kW to m³/h, cfh and kg/h",
 intro:"Enter the total appliance input and pick the gas. You get the gas flow to size the pipe and meter.",
 fields:[
  {id:"gas",label:"Gas",type:"chips",def:"ng",options:[["ng","Natural gas"],["lpg","LPG (propane)"]]},
  {id:"Q",label:"Total appliance input",help:"Add the nameplate input ratings of all appliances on the line.",type:"num",def:"150",units:["kW","BTU/h","MJ/h"],udef:"kW"},
  {id:"div",label:"Diversity factor",help:"100 % if all appliances can run together. Lower only where your code allows.",type:"num",def:"100",unit:"%",adv:true}
 ],
 calc(v){
  const g=GAS[v.gas],dv=num(v.div)/100;let kw=num(v.Q)*({"kW":1,"BTU/h":0.00029307107,"MJ/h":1/3.6}[v.Q_u]||1);
  if(!(kw>0))return{hint:"Enter the appliance input."};if(!(dv>0&&dv<=1))return{hint:"Diversity must be between 1 and 100 %."};
  kw*=dv;const q=kw*3.6/g.cv;
  return{cap:"Gas flow",value:f(q,2),unit:"m³/h",
   say:`${f(kw,1)} kW of ${g.n} needs ${B(f(q,2),"m³/h")} (${f(q*35.3147,0)} cfh) of gas.`+(g.kg?` That is ${B(f(kw*3.6/g.kg,2),"kg/h")} of LPG.`:""),
   rows:[["Gas flow",f(q*35.3147,0),"ft³/h (cfh)"],["Input",f(kw/0.00029307107,0),"BTU/h"],["Gas per day (24 h)",f(q*24,1),"m³"]].concat(g.kg?[["LPG mass",f(kw*3.6/g.kg,2),"kg/h"]]:[])};
 },
 note:"Gross calorific values: natural gas 38.7 MJ/m³ (≈ 1040 BTU/ft³), propane vapour 93.2 MJ/m³ (≈ 2500 BTU/ft³), propane 50 MJ/kg. Use your gas supplier's figure if it differs."},

{id:"gaspipe",g:"util",icon:"pipe",name:"Gas pipe sizing",short:"Pipe size for natural gas or LPG",
 intro:"Enter the gas flow, the pipe length and the pressure drop allowed. You get the pipe bore and the schedule 40 size.",
 fields:[
  {id:"gas",label:"Gas",type:"chips",def:"ng",options:[["ng","Natural gas"],["lpg","LPG (propane)"]]},
  {id:"pr",label:"System pressure",type:"chips",def:"lp",options:[["lp","Low (under 1.5 psi / 100 mbar)"],["hp","Medium (1.5 psi and over)"]]},
  {id:"Q",label:"Gas flow",help:"Get it from the Gas load & flow tool.",type:"num",def:"10",units:["m³/h","cfh"],udef:"m³/h"},
  {id:"L",label:"Pipe length to the furthest appliance",help:"Add equivalent length for fittings, or add 20 to 30 %.",type:"num",def:"30",units:uu("len"),udef:"m"},
  {id:"dP",label:"Pressure drop allowed",type:"num",def:"1.25",units:Object.keys(LPU),udef:"mbar",show:v=>v.pr==="lp"},
  {id:"P1",label:"Inlet pressure (gauge)",type:"num",def:"2",units:Object.keys(FPU),udef:"psi",show:v=>v.pr==="hp"},
  {id:"dH",label:"Pressure drop allowed",type:"num",def:"1",units:Object.keys(FPU),udef:"psi",show:v=>v.pr==="hp"}
 ],
 calc(v){
  const g=GAS[v.gas],Q=num(v.Q)*(v.Q_u==="cfh"?1:35.3147),L=si(v,"L","len")/0.3048;
  if(!(Q>0))return{hint:"Enter the gas flow."};if(!(L>0))return{hint:"Enter the pipe length."};
  let D,pa;
  if(v.pr==="lp"){const dP=num(v.dP)*(LPU[v.dP_u]||1)/249.0889;if(!(dP>0))return{hint:"Enter the pressure drop allowed."};
   D=Math.pow(Q,0.381)/(19.17*Math.pow(dP/(g.cr*L),0.206));pa=101325;}
  else{const P1=num(v.P1)*(FPU[v.P1_u]||1)*14.5038,dH=num(v.dH)*(FPU[v.dH_u]||1)*14.5038;
   if(!(P1>0))return{hint:"Enter the inlet pressure."};if(!(dH>0&&dH<P1))return{hint:"The drop must be more than 0 and less than the inlet pressure."};
   const a=P1+14.696,b=P1-dH+14.696;D=Math.pow(Q,0.381)/(18.93*Math.pow((a*a-b*b)*g.y/(g.cr*L),0.206));pa=(P1-dH+14.696)*6894.757;}
  const dmm=D*25.4,p=stlPick(dmm),qa=Q/35.3147/3600*101325/pa,vel=p?qa/(Math.PI*(p[2]/1000)**2/4):NaN;
  return{cap:"Pipe size",value:p?p[0]:"> 400",unit:p?"mm ("+p[1]+")":"mm",
   say:`${f(Q/35.3147,2)} m³/h (${f(Q,0)} cfh) of ${g.n} over ${f(L*0.3048,0)} m needs a ${f(dmm,1)} mm bore. Use ${B(p?"DN"+p[0]+" ("+p[1]+") Sch 40 steel":"more than DN400")}.`,
   rows:[["Bore needed",f(D,3),"in"],["Bore needed",f(dmm,1),"mm"],["Velocity in chosen pipe",f(vel,1),"m/s"],["Length",f(L,0),"ft"]]};
 },
 note:"IFGC / NFPA 54 sizing equations. Low pressure: D = Q<sup>0.381</sup> ÷ [19.17 (ΔH ÷ C<sub>r</sub>L)<sup>0.206</sup>]. Medium: D = Q<sup>0.381</sup> ÷ [18.93 ((P₁² − P₂²) Y ÷ C<sub>r</sub>L)<sup>0.206</sup>]. C<sub>r</sub> 0.6094 natural gas, 1.2462 propane. Matches the IFGC schedule 40 tables. Your local gas code governs."},

{id:"airpipe",g:"util",icon:"cgauge",name:"Compressed air pipe sizing",short:"Pipe size and pressure drop",
 intro:"Enter the air flow, the pipe length and the working pressure. You get the pipe size that keeps the pressure drop within your limit.",
 fields:[
  {id:"q",label:"Air flow (FAD)",help:"Free air delivered, as on the compressor data sheet.",type:"num",def:"100",units:Object.keys(CAU),udef:"L/s"},
  {id:"L",label:"Pipe length (incl. fittings)",type:"num",def:"100",units:uu("len"),udef:"m"},
  {id:"P",label:"Working pressure (gauge)",type:"num",def:"7",units:Object.keys(FPU),udef:"bar"},
  {id:"dp",label:"Pressure drop allowed",type:"num",def:"0.1",units:Object.keys(FPU),udef:"bar"}
 ],
 calc(v){
  const q=num(v.q)*(CAU[v.q_u]||1),L=si(v,"L","len"),P=num(v.P)*(FPU[v.P_u]||1),dp=num(v.dp)*(FPU[v.dp_u]||1);
  if(!(q>0))return{hint:"Enter the air flow."};if(!(L>0))return{hint:"Enter the pipe length."};if(!(P>0))return{hint:"Enter the working pressure."};if(!(dp>0&&dp<P))return{hint:"Enter a pressure drop smaller than the working pressure."};
  const pa=P+1.01325,d=Math.pow(450*Math.pow(q,1.85)*L/(dp*pa),0.2),p=stlPick(d);
  const da=p?450*Math.pow(q,1.85)*L/(Math.pow(p[2],5)*pa):NaN,vel=p?q/1000*1.01325/pa/(Math.PI*(p[2]/1000)**2/4):NaN;
  return{cap:"Pipe size",value:p?p[0]:"> 400",unit:p?"mm ("+p[1]+")":"mm",
   say:`${f(q,0)} L/s FAD at ${f(P,1)} bar g over ${f(L,0)} m needs a ${f(d,1)} mm bore. Use ${B(p?"DN"+p[0]+" ("+p[1]+")":"more than DN400")}`+(p?`, which drops ${B(f(da,3),"bar")} at ${f(vel,1)} m/s.`:"."),
   rows:[["Bore needed",f(d,1),"mm"],["Actual pressure drop",f(da,3),"bar"],["Actual pressure drop",f(da*14.5038,2),"psi"],["Air velocity",f(vel,1),"m/s"],["Flow",f(q*2.11888,0),"CFM"]]};
 },
 note:"Atlas Copco: Δp = 450 × q<sub>c</sub><sup>1.85</sup> × L ÷ (d⁵ × p) with Δp in bar, q<sub>c</sub> in L/s FAD, L in m, d in mm and p in bar absolute. Aim for under 0.1 bar from compressor to the furthest user and 6 to 10 m/s in mains."},

{id:"airrecv",g:"util",icon:"recv",name:"Air receiver sizing",short:"Receiver volume for peaks or cycling",
 intro:"Size an air receiver to cover a short peak demand, or to stop the compressor loading and unloading too often.",
 fields:[
  {id:"mode",label:"Size the receiver for",type:"chips",def:"peak",options:[["peak","A peak demand"],["cyc","Compressor cycling"]]},
  {id:"C",label:"Peak air demand (FAD)",type:"num",def:"8",units:Object.keys(CMU),udef:"m³/min",show:v=>v.mode==="peak"},
  {id:"S",label:"Compressor output (FAD)",type:"num",def:"6",units:Object.keys(CMU),udef:"m³/min",show:v=>v.mode==="peak"},
  {id:"t",label:"Duration of the peak",type:"num",def:"2",unit:"min",show:v=>v.mode==="peak"},
  {id:"P1",label:"Pressure at start (gauge)",type:"num",def:"8",units:Object.keys(FPU),udef:"bar",show:v=>v.mode==="peak",half:true},
  {id:"P2",label:"Lowest pressure allowed",type:"num",def:"6.5",units:Object.keys(FPU),udef:"bar",show:v=>v.mode==="peak",half:true},
  {id:"qc",label:"Compressor output (FAD)",type:"num",def:"100",units:Object.keys(CAU),udef:"L/s",show:v=>v.mode==="cyc"},
  {id:"band",label:"Load / unload pressure band",type:"num",def:"1",units:Object.keys(FPU),udef:"bar",show:v=>v.mode==="cyc"},
  {id:"fx",label:"Maximum load cycles per hour",help:"Check the compressor manual. 120 per hour (one every 30 s) is a common limit.",type:"num",def:"120",unit:"/h",show:v=>v.mode==="cyc"}
 ],
 calc(v){
  let V;
  if(v.mode==="peak"){const C=num(v.C)*(CMU[v.C_u]||1),S=num(v.S)*(CMU[v.S_u]||1),t=num(v.t),P1=num(v.P1)*(FPU[v.P1_u]||1),P2=num(v.P2)*(FPU[v.P2_u]||1);
   if(!(C>0))return{hint:"Enter the peak demand."};if(!(S>=0))return{hint:"Enter the compressor output."};if(!(t>0))return{hint:"Enter the peak duration."};if(!(P1>P2&&P2>=0))return{hint:"The start pressure must be above the lowest pressure."};
   if(S>=C)return{cap:"Receiver volume",value:"0",unit:"L",say:"The compressor already covers the peak. A receiver is only needed for pressure stability and condensate settling.",rows:[]};
   V=t*(C-S)*1.01325/(P1-P2)*1000;}
  else{const qc=num(v.qc)*(CAU[v.qc_u]||1),dp=num(v.band)*(FPU[v.band_u]||1),fx=num(v.fx)/3600;
   if(!(qc>0))return{hint:"Enter the compressor output."};if(!(dp>0))return{hint:"Enter the pressure band."};if(!(fx>0))return{hint:"Enter the maximum cycles per hour."};
   V=0.25*qc/(fx*dp);}
  const std=RCV.find(x=>x>=V);
  return{cap:"Receiver volume",value:f(V,0),unit:"L",
   say:`You need at least ${B(f(V,0),"L")} (${f(V/3.78541,0)} US gal) of receiver. The next standard size is ${B(std?f(std,0)+" L":"over 10 000 L, use two receivers")}.`,
   rows:[["Volume",f(V/1000,2),"m³"],["Volume",f(V/28.3168,1),"ft³"],["Standard size",std?f(std,0):"—","L"]]};
 },
 note:"Peak: V = t (C − S) p<sub>atm</sub> ÷ (P₁ − P₂). Cycling (Atlas Copco): V = 0.25 q<sub>c</sub> ÷ (f<sub>max</sub> Δp), V in L, q<sub>c</sub> in L/s, f in cycles per second, Δp in bar. Receivers must carry a pressure vessel certificate and safety valve."}
);
