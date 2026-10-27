/* MEPify · Site safety tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
/* ---------- v1.17 additions: site safety, hazardous areas, piping & mechanical ---------- */

{id:"wbgt",g:"hse",icon:"wbgt",name:"Heat stress (WBGT)",short:"Work / rest cycle for hot weather",
 intro:"Enter the WBGT from the site meter, or estimate it from temperature and humidity. Pick the work load. You get the safe work / rest cycle.",
 fields:[
  {id:"mode",label:"What do you have?",type:"chips",def:"m",options:[["m","WBGT reading"],["e","Temperature and RH"]]},
  {id:"W",label:"WBGT",type:"num",def:"30",unit:"°C",show:v=>v.mode==="m"},
  {id:"T",label:"Air temperature (shade)",type:"num",def:"38",unit:"°C",show:v=>v.mode==="e",half:true},
  {id:"rh",label:"Relative humidity",type:"num",def:"40",unit:"%",show:v=>v.mode==="e",half:true},
  {id:"wl",label:"Work load",type:"chips",def:"1",options:[["0","Light (inspection, panel work)"],["1","Moderate (pipe fitting, walking)"],["2","Heavy (digging, carrying)"],["3","Very heavy (shovelling, hauling)"]]},
  {id:"ac",label:"Workers acclimatised?",help:"Acclimatised means working in the heat for at least 7 to 14 days.",type:"chips",def:"1",options:[["1","Yes"],["0","No, new to the heat"]]}
 ],
 calc(v){
  let W;
  if(v.mode==="m"){W=num(v.W);if(!isFinite(W))return{hint:"Enter the WBGT reading."};}
  else{const T=num(v.T),rh=num(v.rh);if(!isFinite(T))return{hint:"Enter the air temperature."};if(!(rh>0&&rh<=100))return{hint:"Enter the relative humidity."};
   const e=rh/100*6.105*Math.exp(17.27*T/(237.7+T));W=0.567*T+0.393*e+3.94;}
  const wl=+v.wl,adj=v.ac==="1"?0:-2.5,lim=TLV.map(r=>r[wl]==null?null:r[wl]+adj);
  let k=lim.findIndex(x=>x!=null&&W<=x);const qa=W>32.1;
  const reg=k<0?"Stop work":TLVR[k];
  return{cap:"Safe work / rest cycle",value:reg,unit:"",status:{ok:k>=0&&!qa,text:qa?"Above Qatar 32.1 °C limit: stop outdoor work":k<0?"Too hot for this work load":"Work allowed with this cycle"},
   say:`WBGT ${B(f(W,1),"°C")} with ${["light","moderate","heavy","very heavy"][wl]} work${v.ac==="1"?"":" by workers new to the heat"}: `+(k<0?`${B("stop work")} or move to lighter tasks, shade and cooling.`:`work for ${B(reg.replace(" work",""))} of each hour and rest the remainder in shade.`)+(qa?" In Qatar, outdoor work must stop above WBGT 32.1 °C.":"")+" Give cool water, about one cup every 15 to 20 minutes.",
   rows:[["WBGT",f(W,1),"°C"],["Limit, 75–100 % work",lim[0]==null?"—":f(lim[0],1),"°C"],["Limit, 50–75 % work",lim[1]==null?"—":f(lim[1],1),"°C"],["Limit, 25–50 % work",lim[2]==null?"—":f(lim[2],1),"°C"],["Limit, 0–25 % work",lim[3]==null?"—":f(lim[3],1),"°C"]]};
 },
 note:"Limits: ACGIH TLV for acclimatised workers; the action limit for unacclimatised workers is about 2.5 °C lower. The temperature/RH estimate (Australian BoM formula) assumes shade and light wind; in direct sun the real WBGT is higher, so use a WBGT meter. Qatar Ministerial Decision 17/2021: no outdoor work 10:00–15:30 from 1 June to 15 September, and all outdoor work stops when WBGT exceeds 32.1 °C."},

{id:"noise",g:"hse",icon:"noise",name:"Noise exposure",short:"Daily dose and LEX,8h",
 intro:"Enter up to three noise levels and how long the worker spends at each. You get the daily exposure and whether hearing protection is needed.",
 fields:[
  {id:"L1",label:"Noise level 1",type:"num",def:"92",unit:"dB(A)",half:true},
  {id:"t1",label:"Time at level 1",type:"num",def:"3",unit:"h",half:true},
  {id:"L2",label:"Noise level 2",type:"num",def:"85",unit:"dB(A)",half:true},
  {id:"t2",label:"Time at level 2",type:"num",def:"4",unit:"h",half:true},
  {id:"L3",label:"Noise level 3 (optional)",type:"num",def:"",unit:"dB(A)",half:true,adv:true},
  {id:"t3",label:"Time at level 3",type:"num",def:"",unit:"h",half:true,adv:true}
 ],
 calc(v){
  const P=[[v.L1,v.t1],[v.L2,v.t2],[v.L3,v.t3]].map(([a,b])=>[num(a),num(b)]).filter(([a,b])=>isFinite(a)&&b>0);
  if(!P.length)return{hint:"Enter at least one noise level and time."};if(P.some(([a])=>a<0||a>150))return{hint:"Noise levels must be between 0 and 150 dB(A)."};
  const T=P.reduce((s,[,t])=>s+t,0);if(T>24)return{hint:"Total time cannot be more than 24 hours."};
  const E=P.reduce((s,[L,t])=>s+t*Math.pow(10,L/10),0),lex=10*Math.log10(E/8),dose=P.reduce((s,[L,t])=>s+t/(8*Math.pow(2,(85-L)/3)),0)*100;
  const ok=lex<=85,lo=lex<=80;
  return{cap:"Daily exposure LEX,8h",value:f(lex,1),unit:"dB(A)",status:{ok,text:lo?"Below 80 dB(A): no action needed":ok?"80–85 dB(A): offer hearing protection":"Above 85 dB(A): hearing protection must be worn"},
   say:`Over ${f(T,1)} h the worker gets a daily exposure of ${B(f(lex,1),"dB(A)")}, which is ${B(f(dose,0),"%")} of the 85 dB(A) daily dose.`+(ok?"":" Make hearing protection mandatory, mark the area and reduce the noise at source where possible."),
   rows:[["Noise dose",f(dose,0),"%"],["Total time",f(T,1),"h"]].concat(P.map(([L,t],i)=>[`Allowed time at ${f(L,0)} dB(A)`,f(8*Math.pow(2,(85-L)/3),2),"h"]))};
 },
 note:"LEX,8h = 10 log₁₀[Σ tᵢ 10^(Lᵢ/10) ÷ 8]. 85 dB(A) with a 3 dB exchange rate (ISO 9612, EU 2003/10/EC): every 3 dB more halves the allowed time. OSHA in the US uses 90 dB(A) with a 5 dB rate."},

{id:"gastest",g:"hse",icon:"gasdet",name:"Gas test for entry",short:"O₂, LEL, H₂S and CO pass / fail",
 intro:"Enter the gas detector readings before confined space entry or hot work. You get a pass or fail for each gas.",
 fields:[
  {id:"o2",label:"Oxygen",type:"num",def:"20.9",unit:"%",half:true},
  {id:"lel",label:"Flammable gas",type:"num",def:"0",unit:"% LEL",half:true},
  {id:"h2s",label:"Hydrogen sulphide",type:"num",def:"0",unit:"ppm",half:true},
  {id:"co",label:"Carbon monoxide",type:"num",def:"0",unit:"ppm",half:true},
  {id:"job",label:"Work type",type:"chips",def:"cs",options:[["cs","Confined space entry"],["hw","Hot work"]]},
  {id:"lh",label:"H₂S limit",help:"ACGIH TLV is 1 ppm. Many permits use 5 or 10 ppm. Use your site permit value.",type:"num",def:"5",unit:"ppm",adv:true,half:true},
  {id:"lc",label:"CO limit",type:"num",def:"25",unit:"ppm",adv:true,half:true}
 ],
 calc(v){
  const o2=num(v.o2),lel=num(v.lel),h2s=num(v.h2s),co=num(v.co),lh=num(v.lh),lc=num(v.lc),lL=v.job==="hw"?0:10;
  if(![o2,lel,h2s,co].every(isFinite))return{hint:"Enter all four readings. Use 0 if the gas is not detected."};
  const r=[["Oxygen",o2>=19.5&&o2<=23.5,"19.5–23.5 %",o2<19.5?"Too low: ventilate and find the cause.":o2>23.5?"Too high: fire risk, find the oxygen source.":""],
   ["Flammable",lel<=lL,(lL?"≤ 10":"0")+" % LEL",lel>lL?"Purge and ventilate, then retest.":""],
   ["H₂S",h2s<=lh,"≤ "+f(lh,0)+" ppm",h2s>lh?"Do not enter without breathing apparatus.":""],
   ["CO",co<=lc,"≤ "+f(lc,0)+" ppm",co>lc?"Find the source, ventilate and retest.":""]];
  const ok=r.every(x=>x[1]),bad=r.filter(x=>!x[1]);
  return{cap:"Gas test",value:ok?"PASS":"FAIL",unit:"",status:{ok,text:ok?"Atmosphere acceptable":bad.map(x=>x[0]).join(", ")+" out of limit"},
   say:ok?`All readings are within limits for ${v.job==="hw"?"hot work":"entry"}. Keep monitoring continuously and retest after any break.`:B("Do not start.")+" "+bad.map(x=>x[0]+": "+x[3]).join(" "),
   rows:r.map(x=>[x[0]+" ("+x[2]+")",x[1]?"OK":"FAIL",""])};
 },
 note:"Test in this order: oxygen, flammables, then toxics, at the top, middle and bottom of the space. Hot work normally needs 0 % LEL. Your site permit-to-work limits govern."},

{id:"purgecs",g:"hse",icon:"fanlaw",name:"Confined space purge time",short:"Blower time to clear a gas",
 intro:"Enter the space volume, the blower airflow and the gas readings. You get how long to ventilate before retesting.",
 fields:[
  {id:"V",label:"Space volume",type:"num",def:"40",units:["m³","ft³"],udef:"m³"},
  {id:"Q",label:"Blower airflow",type:"num",def:"1500",units:["m³/h","CFM"],udef:"m³/h"},
  {id:"C0",label:"Gas level now",type:"num",def:"50",unit:"ppm or %LEL",half:true},
  {id:"C1",label:"Target level",type:"num",def:"5",unit:"ppm or %LEL",half:true},
  {id:"K",label:"Mixing factor",help:"1 = perfect mixing. Use 3 for a typical blower and duct, 5 to 10 for poorly ventilated or baffled spaces.",type:"num",def:"3",adv:true}
 ],
 calc(v){
  let V=num(v.V),Q=num(v.Q);const C0=num(v.C0),C1=num(v.C1),K=num(v.K);if(v.V_u==="ft³")V*=0.0283168;if(v.Q_u==="CFM")Q*=1.69901;
  if(!(V>0))return{hint:"Enter the space volume."};if(!(Q>0))return{hint:"Enter the blower airflow."};if(!(C0>C1&&C1>0))return{hint:"The target must be above 0 and below the current level."};if(!(K>=1))return{hint:"Mixing factor must be 1 or more."};
  const t=K*V/Q*Math.log(C0/C1)*60,ach=Q/V;
  return{cap:"Ventilate for at least",value:f(Math.ceil(t),0),unit:"min",
   say:`At ${f(ach,0)} air changes per hour it takes about ${B(f(Math.ceil(t),0),"minutes")} to bring the gas from ${f(C0)} to ${f(C1)}. Then retest before entry, and keep the blower running while people are inside.`,
   rows:[["Air changes",f(ach,1),"/h"],["Volume changes needed",f(t/60*ach,1),""],["Time",f(t/60,2),"h"]]};
 },
 note:"Dilution: t = K × V ÷ Q × ln(C₀ ÷ C₁). Place the blower so fresh air reaches the far end and the exhaust leaves away from the entry and from any air intakes. Never ventilate with oxygen."},

{id:"ladder",g:"hse",icon:"ladder",name:"Ladder set-up",short:"4-to-1 rule: base distance and length",
 intro:"Enter the height to the top support. You get how far out to put the base and the ladder length to use.",
 fields:[
  {id:"H",label:"Height to the top support point",type:"num",def:"4",units:uu("len"),udef:"m"},
  {id:"use",label:"Getting off at the top?",type:"chips",def:"1",options:[["1","Yes, stepping onto a landing"],["0","No, working from the ladder"]]}
 ],
 calc(v){
  const H=si(v,"H","len");if(!(H>0))return{hint:"Enter the height."};
  const b=H/4,Ls=Math.sqrt(H*H+b*b),ext=v.use==="1"?1:0,L=Ls+ext;
  return{cap:"Base distance from the wall",value:f(b,2),unit:"m",
   say:`Put the base ${B(f(b,2),"m")} (${f(b/0.3048,1)} ft) out from the wall. You need a ladder at least ${B(f(L,1),"m")} long${ext?", including 1 m above the landing to hold on to":""}. Tie it at the top or have it footed.`,
   rows:[["Base distance",f(b/0.3048,2),"ft"],["Ladder length needed",f(L/0.3048,1),"ft"],["Angle",f(75.5,1),"°"]]};
 },
 note:"1 out for every 4 up gives a 75° angle. The ladder must extend 1 m (3 ft) above the landing if used for access. Use ladders only for short-duration light work; use a platform or scaffold otherwise."}
);
