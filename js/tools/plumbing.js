/* MEPify · Plumbing tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
{id:"pflow",g:"plumb",icon:"pflow",name:"Pipe flow & velocity",short:"Q = A × V, both ways",
 intro:"Pick the pipe, then enter the velocity to get the flow, or the flow to get the velocity.",
 fields:[
  {id:"mode",label:"What do you know?",type:"chips",def:"q",options:[["q","The flow"],["v","The velocity"]]},
  ...pipeF(),
  {id:"Q",label:"Flow rate",type:"num",def:"0.8",units:uu("flow"),udef:"L/s",show:v=>v.mode==="q"},
  {id:"V",label:"Velocity",type:"num",def:"1.5",units:uu("vel"),udef:"m/s",show:v=>v.mode==="v"},
  {id:"Vt",label:"Target maximum velocity",help:"Used to suggest the smallest pipe that stays under it.",type:"num",def:"1.5",unit:"m/s",adv:true,presets:[["1.2","Hot copper 1.2"],["1.5","1.5"],["2.4","Cold supply 2.4"]]}
 ],
 calc(v){
  const D=pipeD(v);if(!(D>0))return{hint:"Enter the inside diameter of the pipe."};
  const A=Math.PI*D*D/4;
  if(v.mode==="v"){const V=si(v,"V","vel");if(!(V>0))return{hint:"Enter the velocity."};const Q=A*V;
   return{cap:"Flow rate",value:f(Q*1000,2),unit:"L/s",status:vState(V),
    say:`${pipeName(v)} at ${f(V,2)} m/s carries ${B(f(Q*1000,2),"L/s")} (${f(Q*60000,1)} L/min). ${vMsg(V)}`,
    rows:[["Flow",f(Q*60000,1),"L/min"],["Flow",f(Q*3600,2),"m³/h"],["Flow",f(Q/6.30902e-5,1),"US GPM"],["Flow area",f(A*1e6,0),"mm²"]]};}
  const Q=si(v,"Q","flow");if(!(Q>0))return{hint:"Enter the flow rate."};
  const V=Q/A,Vt=num(v.Vt)||1.5,Dm=Math.sqrt(4*Q/(Math.PI*Vt))*1000,r=pipeRef(v);
  const sug=r?PSETS[r.k].p.find(p=>p.id>=Dm):null;
  return{cap:"Velocity",value:f(V,2),unit:"m/s",status:vState(V),
   say:`${f(Q*1000,2)} L/s through ${pipeName(v)} runs at ${B(f(V,2),"m/s")} (${f(V/0.3048,1)} ft/s). ${vMsg(V)}`+(sug?` To stay under ${f(Vt,1)} m/s, the smallest ${PSETS[r.k].n} size is ${B(sug.s)}.`:""),
   rows:[["Velocity",f(V/0.3048,2),"ft/s"],["Minimum bore for target",f(Dm,1),"mm"],["Flow area",f(A*1e6,0),"mm²"]]};
 },
 note:"Q = A × V and V = Q ÷ A, where A = π D² ÷ 4 from the true inside diameter, not the nominal size."},

{id:"pfric",g:"plumb",icon:"pfric",name:"Friction loss",short:"Pressure drop along a pipe run",
 intro:"Enter the flow, pick the pipe and its length. You get the head and pressure lost to friction.",
 fields:[
  {id:"Q",label:"Flow rate",type:"num",def:"0.8",units:uu("flow"),udef:"L/s"},
  ...pipeF(),
  {id:"L",label:"Pipe length",type:"num",def:"30",units:uu("len"),udef:"m"},
  {id:"mat",label:"Pipe material",type:"chips",def:"cu",options:PMOPTS},
  {id:"T",label:"Water temperature",type:"chips",def:"20",options:[["20","20 °C"],["40","40 °C"],["60","60 °C"],["80","80 °C"]],adv:true}
 ],
 calc(v){
  const Q=si(v,"Q","flow"),D=pipeD(v),L=si(v,"L","len"),m=PMAT[v.mat]||PMAT.cu;
  if(!(Q>0))return{hint:"Enter the flow rate."};if(!(D>0))return{hint:"Enter the inside diameter."};if(!(L>0))return{hint:"Enter the pipe length."};
  const r=darcy(Q,D,L,m[1]/1000,NU[v.T]||NU["20"]),dp=RHO*G*r.hf,hw=hazen(Q,D,L,m[2])*RHO*G;
  return{cap:"Friction loss",value:f(dp/1000,1),unit:"kPa",status:vState(r.V),
   say:`${f(Q*1000,2)} L/s through ${f(L,1)} m of ${pipeName(v)} loses ${B(f(r.hf,2),"m")} of head, which is ${B(f(dp/1000,1),"kPa")} (${f(dp/6894.757,2)} psi). Velocity is ${f(r.V,2)} m/s.`,
   rows:[["Head loss",f(r.hf/0.3048,2),"ft"],["Pressure drop",f(dp/6894.757,2),"psi"],["Per 100 m",f(dp/L*100/1000,1),"kPa"],["Per 100 ft",f(dp/L*30.48/6894.757,2),"psi"],["Hazen–Williams check",f(hw/1000,1),"kPa"],["Velocity",f(r.V,2),"m/s"],["Reynolds number",f(r.Re,0),""],["Friction factor (Darcy)",f(r.fr,4),""]]};
 },
 note:"Darcy–Weisbach: h<sub>f</sub> = f (L/D) V² / 2g, with f from Swamee–Jain. The form 4fLV²/2gD uses the Fanning factor (a quarter of Darcy), so both give the same answer. Hazen–Williams suits water near room temperature."},

{id:"pfit",g:"plumb",icon:"pfit",name:"Pressure drop with fittings",short:"Pipe plus elbows, tees and valves",
 intro:"Enter the flow, the pipe and its straight length, then count the fittings. You get the total pressure drop.",
 fields:[
  {id:"Q",label:"Flow rate",type:"num",def:"0.8",units:uu("flow"),udef:"L/s"},
  ...pipeF(),
  {id:"L",label:"Straight pipe length",type:"num",def:"20",units:uu("len"),udef:"m"},
  ...FITS.map(([k,l,K,d])=>({id:k,label:l,help:`K = ${K}`,type:"num",def:d,unit:"no.",half:true})),
  {id:"mat",label:"Pipe material",type:"chips",def:"cu",options:PMOPTS,adv:true}
 ],
 calc(v){
  const Q=si(v,"Q","flow"),D=pipeD(v),L=si(v,"L","len")||0,m=PMAT[v.mat]||PMAT.cu;
  if(!(Q>0))return{hint:"Enter the flow rate."};if(!(D>0))return{hint:"Enter the inside diameter."};
  const r=darcy(Q,D,Math.max(L,1e-9),m[1]/1000,NU["20"]),K=FITS.reduce((a,x)=>a+x[2]*(num(v[x[0]])||0),0);
  const hk=K*r.V*r.V/(2*G),ht=r.hf+hk,rg=RHO*G,Leq=K*D/r.fr;
  return{cap:"Total pressure drop",value:f(ht*rg/1000,1),unit:"kPa",status:vState(r.V),
   say:`The run loses ${B(f(ht*rg/1000,1),"kPa")} in total (${f(ht*rg/6894.757,2)} psi): ${f(r.hf*rg/1000,1)} kPa in straight pipe and ${f(hk*rg/1000,1)} kPa in fittings. The fittings act like ${B(f(Leq,1),"m")} of extra pipe.`,
   rows:[["Total head loss",f(ht,2),"m"],["Straight pipe",f(r.hf*rg/1000,1),"kPa"],["Fittings and valves",f(hk*rg/1000,1),"kPa"],["Sum of K",f(K,2),""],["Velocity",f(r.V,2),"m/s"]]};
 },
 note:"ΔP = ρg [ f(L/D) + ΣK ] V² / 2g. K values are typical for screwed or soldered fittings; use the maker's figures for valves and strainers."},

{id:"ppump",g:"plumb",icon:"pump",name:"Total pump head",short:"Head and motor power for a pump",
 intro:"Add up the lift, the losses and the pressure you need at the outlet. You get the pump duty point.",
 fields:[
  {id:"Hs",label:"Static lift",help:"From the water level in the tank or sump up to the highest outlet.",type:"num",def:"18",units:uu("head"),udef:"m"},
  {id:"Hf",label:"Pipe friction head",type:"num",def:"4",units:uu("head"),udef:"m",half:true},
  {id:"Hk",label:"Fittings head",type:"num",def:"1.5",units:uu("head"),udef:"m",half:true},
  {id:"Pr",label:"Pressure needed at the outlet",type:"num",def:"100",units:uu("pres"),udef:"kPa",presets:[["50","Tap 50 kPa"],["100","Shower 100 kPa"],["200","Flush valve 200 kPa"]]},
  {id:"Q",label:"Design flow",type:"num",def:"2",units:uu("flow"),udef:"L/s"},
  {id:"eff",label:"Pump efficiency",type:"num",def:"65",unit:"%",adv:true}
 ],
 calc(v){
  const Hs=si(v,"Hs","head"),Hf=si(v,"Hf","head")||0,Hk=si(v,"Hk","head")||0,Pr=si(v,"Pr","pres")||0,Q=si(v,"Q","flow"),eff=num(v.eff)/100;
  if(!isFinite(Hs))return{hint:"Enter the static lift."};if(!(Q>0))return{hint:"Enter the design flow."};if(!(eff>0&&eff<=1))return{hint:"Pump efficiency must be between 1 and 100 %."};
  const rg=RHO*G,Hr=Pr/rg,H=Hs+Hf+Hk+Hr,Ph=rg*Q*H/1000,Ps=Ph/eff;
  return{cap:"Total pump head",value:f(H,1),unit:"m",
   say:`The pump must deliver ${f(Q*1000,2)} L/s at ${B(f(H,1),"m")} (${f(H/0.3048,0)} ft) of head. Shaft power is about ${B(f(Ps,2),"kW")} at ${f(eff*100,0)} % efficiency. Add 10 to 15 % margin and choose from the pump curve.`,
   rows:[["Total head",f(H/0.3048,1),"ft"],["Outlet pressure as head",f(Hr,1),"m"],["Discharge pressure",f(H*rg/1e5,2),"bar"],["Hydraulic power",f(Ph,2),"kW"],["Shaft power",f(Ps/0.7457,2),"HP"]]};
 },
 note:"H<sub>pump</sub> = H<sub>static</sub> + H<sub>friction</sub> + H<sub>fittings</sub> + P<sub>outlet</sub> ÷ ρg. Get the friction and fittings head from the two tools above."},

{id:"pvol",g:"plumb",icon:"pvol",name:"Pipe volume",short:"Water in a pipe run",
 intro:"Pick the pipe and enter its length. You get the water it holds, for flushing, filling or dosing.",
 fields:[
  ...pipeF(),
  {id:"L",label:"Pipe length",type:"num",def:"30",units:uu("len"),udef:"m"},
  {id:"dose",label:"Disinfection dose",help:"For example 50 mg/L of chlorine.",type:"num",def:"50",unit:"mg/L",adv:true}
 ],
 calc(v){
  const D=pipeD(v),L=si(v,"L","len");if(!(D>0))return{hint:"Enter the inside diameter."};if(!(L>0))return{hint:"Enter the pipe length."};
  const A=Math.PI*D*D/4,Vm=A*L,lit=Vm*1000,dose=num(v.dose)||0;
  return{cap:"Water volume",value:f(lit,1),unit:"L",
   say:`${f(L,1)} m of ${pipeName(v)} holds ${B(f(lit,1),"litres")} (${f(lit/3.78541,1)} US gal) of water, weighing ${f(Vm*RHO,1)} kg.${dose>0?` At ${f(dose)} mg/L you need ${B(f(lit*dose/1000,1),"g")} of active chlorine.`:""}`,
   rows:[["Volume",f(lit/3.78541,2),"US gal"],["Per metre",f(A*1000,3),"L/m"],["Per foot",f(A*1000*0.3048/3.78541,4),"gal/ft"],["Weight of water",f(Vm*RHO*2.20462,1),"lb"]]};
 },
 note:"Gallons = π r² L ÷ 231 with r and L in inches. Litres = π D² ÷ 4 × L × 1000 with D and L in metres."},

{id:"pelev",g:"plumb",icon:"pelev",name:"Pressure from height",short:"Water column ↔ pressure",
 intro:"Turn a height of water into pressure, or a gauge reading into head.",
 fields:[
  {id:"mode",label:"What do you have?",type:"chips",def:"h",options:[["h","A height"],["p","A gauge pressure"]]},
  {id:"H",label:"Height of water",type:"num",def:"10",units:uu("head"),udef:"m",show:v=>v.mode==="h"},
  {id:"P",label:"Gauge pressure",type:"num",def:"300",units:uu("pres"),udef:"kPa",show:v=>v.mode==="p"}
 ],
 calc(v){
  const rg=RHO*G;
  if(v.mode==="h"){const H=si(v,"H","head");if(!isFinite(H))return{hint:"Enter the height."};const P=H*rg;
   return{cap:"Static pressure",value:f(P/1000,1),unit:"kPa",say:`A ${f(H,2)} m column of water gives ${B(f(P/1000,1),"kPa")} (${B(f(P/6894.757,2),"psi")}) at the bottom with no flow.`,
    rows:[["Pressure",f(P/1e5,3),"bar"],["Pressure",f(P/6894.757,2),"psi"],["Height",f(H/0.3048,2),"ft"]]};}
  const P=si(v,"P","pres");if(!isFinite(P))return{hint:"Enter the gauge pressure."};const H=P/rg;
  return{cap:"Head",value:f(H,2),unit:"m",say:`${f(P/1000,1)} kPa can lift water ${B(f(H,2),"m")} (${f(H/0.3048,1)} ft) with no flow.`,
   rows:[["Head",f(H/0.3048,2),"ft"],["Pressure",f(P/1e5,3),"bar"],["Pressure",f(P/6894.757,2),"psi"]]};
 },
 note:"psi = head in ft × 0.433. kPa = head in m × 9.79."},

{id:"pdrain",g:"plumb",icon:"drain",name:"Drain slope",short:"Fall needed over a drain run",
 intro:"Enter the run length, the drain size and the slope. You get the total fall and a code check.",
 fields:[
  {id:"L",label:"Horizontal run",type:"num",def:"12",units:uu("len"),udef:"m"},
  {id:"sz",label:"Drain size",type:"chips",def:"s",options:[["s",'Up to 2-1/2" (65 mm)'],["m",'3" to 6" (75–150 mm)'],["l",'8" and up (200 mm+)']]},
  {id:"sl",label:"Slope",type:"chips",def:"0.0208333",options:[["0.0052083",'1/16" per ft'],["0.0104167",'1/8" per ft'],["0.0208333",'1/4" per ft'],["0.0416667",'1/2" per ft'],["0.01","1 %"],["0.02","2 %"],["0.025","2.5 %"]]}
 ],
 calc(v){
  const L=si(v,"L","len"),sl=num(v.sl);if(!(L>0))return{hint:"Enter the horizontal run."};
  const min={s:0.0208333,m:0.0104167,l:0.0052083}[v.sz],minT={s:'1/4" per ft (2 %)',m:'1/8" per ft (1 %)',l:'1/16" per ft (0.5 %)'}[v.sz];
  const fall=L*sl,low=sl+1e-9<min;
  return{cap:"Total fall",value:f(fall*1000,0),unit:"mm",
   status:low?{ok:false,text:"Below minimum slope"}:{ok:true,text:"Meets minimum slope"},
   say:`Over ${f(L,2)} m the pipe must drop ${B(f(fall*1000,0),"mm")} (${B(f(fall/0.0254,2),"in")}).`+(low?` That is flatter than the usual minimum of ${minT} for this size, so solids may settle. Check your local code.`:` The usual minimum for this size is ${minT}.`),
   rows:[["Total fall",f(fall/0.0254,2),"in"],["Slope",f(sl*100,2),"%"],["Gradient","1 in "+f(1/sl,0),""],["Angle",f(Math.atan(sl)*180/Math.PI,2),"°"]]};
 },
 note:"Fall = run × slope. Minimums follow common IPC and UPC practice. Always verify the code that applies to your job."},

{id:"pheat",g:"plumb",icon:"heater",name:"Water heater size",short:"Tank or tankless heater rating",
 intro:"Size a storage tank heater from its volume and recovery time, or a tankless heater from the hot water flow.",
 fields:[
  {id:"mode",label:"Heater type",type:"chips",def:"tank",options:[["tank","Storage tank"],["inst","Tankless / instant"]]},
  {id:"V",label:"Tank volume",type:"num",def:"200",units:uu("vol"),udef:"L",show:v=>v.mode==="tank"},
  {id:"Q",label:"Hot water flow",type:"num",def:"8",units:uu("flow"),udef:"L/min",show:v=>v.mode==="inst"},
  {id:"dT",label:"Temperature rise",help:"Hot water temperature minus incoming cold water temperature.",type:"num",def:"35",units:uu("dT"),udef:"°C"},
  {id:"t",label:"Recovery time",type:"num",def:"1",unit:"h",show:v=>v.mode==="tank"},
  {id:"eff",label:"Heater efficiency",help:"Electric 95–99 %, gas 70–95 %.",type:"num",def:"95",unit:"%",adv:true}
 ],
 calc(v){
  const dT=si(v,"dT","dT"),eff=num(v.eff)/100;
  if(!(dT>0))return{hint:"Enter the temperature rise."};if(!(eff>0&&eff<=1))return{hint:"Efficiency must be between 1 and 100 %."};
  if(v.mode==="tank"){const Vm=si(v,"V","vol"),t=num(v.t);if(!(Vm>0))return{hint:"Enter the tank volume."};if(!(t>0))return{hint:"Enter the recovery time."};
   const E=Vm*RHO*4186*dT,P=E/(t*3600)/eff;
   return{cap:"Heater rating",value:f(P/1000,2),unit:"kW",
    say:`Heating ${f(Vm*1000,0)} L by ${f(dT,1)} °C takes ${B(f(E/3.6e6,2),"kWh")}. To do it in ${f(t,1)} h you need a heater rated at ${B(f(P/1000,2),"kW")} (${f(P/0.29307107,0)} BTU/h).`,
    rows:[["Rating",f(P/0.29307107,0),"BTU/h"],["Heat to water",f(E/1055.056,0),"BTU"],["Heat to water",f(E/3.6e6,2),"kWh"],["Mass of water",f(Vm*RHO,0),"kg"]]};}
  const Q=si(v,"Q","flow");if(!(Q>0))return{hint:"Enter the hot water flow."};
  const P=Q*RHO*4186*dT/eff;
  return{cap:"Heater rating",value:f(P/1000,1),unit:"kW",
   say:`Raising ${f(Q*60000,1)} L/min by ${f(dT,1)} °C needs a tankless heater rated at ${B(f(P/1000,1),"kW")} (${f(P/0.29307107,0)} BTU/h). Size for the coldest incoming water you expect.`,
   rows:[["Rating",f(P/0.29307107,0),"BTU/h"],["Flow",f(Q/6.30902e-5,2),"US GPM"]]};
 },
 note:"Tank: BTU = gallons × 8.33 × ΔT (°F). Tankless: BTU/h = GPM × 500 × ΔT (°F). Metric: kW = L/min × 0.0698 × ΔT (°C)."},

{id:"poff",g:"plumb",icon:"offset",name:"Rolling offset",short:"Travel, run and true offset",
 intro:"Enter the rise and roll between the two pipe centrelines and pick the fitting angle. Set roll to 0 for a simple offset.",
 fields:[
  {id:"r",label:"Rise (vertical offset)",type:"num",def:"300",units:uu("sm"),udef:"mm",half:true},
  {id:"o",label:"Roll (side offset)",type:"num",def:"200",units:uu("sm"),udef:"mm",half:true},
  {id:"a",label:"Fitting angle",type:"chips",def:"45",options:[["60","60°"],["45","45°"],["30","30°"],["22.5","22-1/2°"],["11.25","11-1/4°"]]}
 ],
 calc(v){
  const R=si(v,"r","sm"),O=si(v,"o","sm")||0,a=num(v.a)*Math.PI/180;
  if(!(R>=0)||!(R+O>0))return{hint:"Enter the rise and roll."};
  const T=Math.hypot(R,O),tr=T/Math.sin(a),run=T/Math.tan(a);
  return{cap:"Travel (centre to centre)",value:f(tr*1000,0),unit:"mm",
   say:`With ${v.a}° fittings, the travel is ${B(f(tr*1000,0),"mm")} (${B(ftin(tr/0.0254*16))}) and the run along the pipe is ${f(run*1000,0)} mm. Subtract the fitting take-offs to get the cut length.`,
   rows:[["True offset",f(T*1000,0),"mm"],["Travel",f(tr/0.0254,3),"in"],["Run (setback)",f(run*1000,0),"mm"],["Run (setback)",ftin(run/0.0254*16),""],["Travel multiplier",f(1/Math.sin(a),3),"×"],["Run multiplier",f(1/Math.tan(a),3),"×"]]};
 },
 note:"True offset = √(rise² + roll²). Travel = true offset × multiplier (60° 1.155, 45° 1.414, 22-1/2° 2.613)."},

{id:"ptape",g:"plumb",icon:"tape",name:"Feet-inch math",short:"Add, subtract or split tape lengths",
 intro:"Work in feet, inches and sixteenths like a tape measure. You also get the metric value.",
 fields:[
  {id:"af",label:"Length A: feet",type:"num",def:"5",unit:"ft",half:true},
  {id:"ai",label:"Length A: inches",type:"num",def:"7",unit:"in",half:true},
  {id:"as",label:"Length A: fraction",type:"select",def:"6",options:SIXT},
  {id:"op",label:"What to do",type:"chips",def:"add",options:[["add","A + B"],["sub","A − B"],["div","Split A equally"]]},
  {id:"bf",label:"Length B: feet",type:"num",def:"2",unit:"ft",half:true,show:v=>v.op!=="div"},
  {id:"bi",label:"Length B: inches",type:"num",def:"3",unit:"in",half:true,show:v=>v.op!=="div"},
  {id:"bs",label:"Length B: fraction",type:"select",def:"8",options:SIXT,show:v=>v.op!=="div"},
  {id:"n",label:"Number of equal parts",type:"num",def:"4",unit:"parts",show:v=>v.op==="div"}
 ],
 calc(v){
  const L=(a,b,c)=>(num(v[a])||0)*192+(num(v[b])||0)*16+(num(v[c])||0);
  const A=L("af","ai","as"),Bv=L("bf","bi","bs");let R,cap,marks="";
  if(v.op==="add"){R=A+Bv;cap="A + B";}else if(v.op==="sub"){R=A-Bv;cap="A − B";}
  else{const n=Math.max(1,Math.round(num(v.n)||1));R=Math.round(A/n);cap=`Each of ${n} parts`;
   const m=[];for(let i=1;i<n&&i<=20;i++)m.push(ftin(A*i/n));if(m.length)marks=` Marks from the start: ${m.join(", ")}.`;}
  const inch=R/16;
  return{cap,value:ftin(R),unit:"",
   say:`The result is ${B(ftin(R))}, which is ${B(f(inch*25.4,1),"mm")}.${marks}`,
   rows:[["Decimal feet",f(inch/12,4),"ft"],["Total inches",f(inch,4),"in"],["Metres",f(inch*0.0254,4),"m"]]};
 },
 note:"Results round to the nearest 1/16″. 1 ft = 12 in = 304.8 mm."},

{id:"ppipe",g:"plumb",icon:"pipe",name:"Pipe data",short:"OD, wall, bore and water content",
 intro:"Pick a pipe type, then tap a size in the table to see its full data.",
 fields:[
  {id:"set",label:"Pipe type",type:"chips",def:"cuL",options:Object.keys(PSETS).map(k=>[k,PSETS[k].n])}
 ],
 calc(v){
  const S=PSETS[v.set]||PSETS.cuL,i=Math.min(Math.max(0,Math.round(num(v.sz)||2)),S.p.length-1),p=S.p[i],A=Math.PI*(p.id/1000)**2/4;
  const tbl=`<div class="card" style="padding:10px"><div class="ptab"><table><thead><tr><th>Size</th><th>OD mm</th><th>Wall mm</th><th>ID mm</th><th>ID in</th><th>Water L/m</th><th>L/s at 1.5 m/s</th></tr></thead><tbody>${S.p.map((q,j)=>{const a=Math.PI*(q.id/1000)**2/4;return `<tr class="${j===i?"sel":""}" data-i="${j}" role="button" tabindex="0"><td>${q.s}</td><td>${f(q.od,1)}</td><td>${f(q.w,2)}</td><td>${f(q.id,1)}</td><td>${f(q.id/25.4,3)}</td><td>${f(a*1000,3)}</td><td>${f(a*1500,2)}</td></tr>`;}).join("")}</tbody></table></div><p class="note" style="padding:6px 8px 2px">Tap a size to see its details above.</p></div>`;
  return{cap:`${S.n} ${p.s}`,value:f(p.id,2),unit:"mm bore",
   say:`Outside diameter ${B(f(p.od,2),"mm")}, wall ${B(f(p.w,2),"mm")}, inside diameter ${B(f(p.id,2),"mm")} (${f(p.id/25.4,3)} in). It holds ${f(A*1000,3)} litres of water per metre.`,
   rows:[["Outside diameter",f(p.od/25.4,3),"in"],["Wall",f(p.w/25.4,3),"in"],["Flow area",f(A*1e6,0),"mm²"],["Water per foot",f(A*1000*0.3048/3.78541,4),"US gal"],["Water weight",f(A*RHO,3),"kg/m"],["Flow at 1.5 m/s",f(A*1500,2),"L/s"]],after:tbl};
 },
 bind(el,st){el.querySelectorAll("tr[data-i]").forEach(r=>{const go=()=>{st.sz=r.dataset.i;save();show();};r.onclick=go;r.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}};});},
 note:"Copper to ASTM B88, steel and PVC to ASME B36.10 / ASTM D1785, PPR to DIN 8077 PN20."},

{id:"wdem",g:"plumb",icon:"wdem",name:"Water demand",short:"Peak flow and pipe size from fixtures",
 intro:"Enter the number of each fixture. You get the probable peak flow and the pipe size to use.",
 fields:[
  {id:"wb",label:"Wash basins",type:"num",def:"10",unit:"no.",half:true},
  {id:"wc",label:"WCs (cistern)",type:"num",def:"10",unit:"no.",half:true},
  {id:"sh",label:"Showers",type:"num",def:"6",unit:"no.",half:true},
  {id:"ks",label:"Kitchen sinks",type:"num",def:"2",unit:"no.",half:true},
  {id:"ur",label:"Urinals",type:"num",def:"4",unit:"no.",half:true},
  {id:"wm",label:"Washing machines",type:"num",def:"0",unit:"no.",half:true},
  {id:"ba",label:"Baths",type:"num",def:"0",unit:"no.",half:true},
  {id:"ht",label:"Hose taps",type:"num",def:"1",unit:"no.",half:true},
  {id:"vm",label:"Maximum velocity",type:"num",def:"1.5",unit:"m/s",adv:true}
 ],
 calc(v){
  const F=[["wb",0.1],["wc",0.1],["sh",0.2],["ks",0.2],["ur",0.15],["wm",0.2],["ba",0.3],["ht",0.3]];
  let n=0,sum=0;F.forEach(([k,q])=>{const c=Math.max(0,Math.round(num(v[k])||0));n+=c;sum+=c*q;});if(!(n>0))return{hint:"Enter at least one fixture."};
  const y=n<2?1:Math.max(0.2,1/Math.sqrt(n-1)),Q=sum*y,vm=num(v.vm)||1.5;
  const pick=k=>PSETS[k].p.find(p=>Q/1000/(Math.PI*(p.id/1000)**2/4)<=vm),c=pick("cuL"),pp=pick("ppr");
  return{cap:"Peak flow",value:f(Q,2),unit:"L/s",
   say:`${n} fixtures could draw ${f(sum,2)} L/s together, but they are rarely all open: the simultaneity factor ${f(y,2)} gives a design peak of ${B(f(Q,2),"L/s")} (${f(Q*60,0)} L/min).`+(c||pp?` Use ${c?B("copper "+c.s):""}${c&&pp?" or ":""}${pp?B("PPR "+pp.s):""} to stay under ${f(vm,1)} m/s.`:" That is more than the table sizes; use steel or split the supply."),
   rows:[["Fixtures",n,""],["Total if all open",f(sum,2),"L/s"],["Simultaneity factor",f(y,2),""],["Peak flow",f(Q*3.6,2),"m³/h"]]};
 },
 note:"Simultaneous demand y = 1 ÷ √(n − 1) (DTU 60.11 method), minimum 0.2, with typical fixture flows. EN 806-3 loading units or IPC fixture units give similar sizes; your local code governs. Check the pressure at the furthest outlet."},

{id:"dfu",g:"plumb",icon:"dfu",name:"Drainage fixture units",short:"Drain size from fixtures",
 intro:"Enter the number of each fixture on the branch. You get the drainage fixture units and the horizontal drain size.",
 fields:[
  {id:"wb",label:"Wash basins (1 DFU)",type:"num",def:"6",unit:"no.",half:true},
  {id:"wc",label:"WCs (4 DFU)",type:"num",def:"6",unit:"no.",half:true},
  {id:"sh",label:"Showers (2 DFU)",type:"num",def:"4",unit:"no.",half:true},
  {id:"ks",label:"Kitchen sinks (2 DFU)",type:"num",def:"2",unit:"no.",half:true},
  {id:"ur",label:"Urinals (2 DFU)",type:"num",def:"3",unit:"no.",half:true},
  {id:"fd",label:"Floor drains (2 DFU)",type:"num",def:"4",unit:"no.",half:true},
  {id:"wm",label:"Washing machines (3 DFU)",type:"num",def:"0",unit:"no.",half:true},
  {id:"oth",label:"Other DFU",type:"num",def:"0",unit:"DFU",half:true}
 ],
 calc(v){
  const W={wb:1,wc:4,sh:2,ks:2,ur:2,fd:2,wm:3};let d=Object.keys(W).reduce((a,k)=>a+Math.max(0,Math.round(num(v[k])||0))*W[k],0)+(num(v.oth)||0);
  if(!(d>0))return{hint:"Enter at least one fixture."};
  const T=[['1-1/2" (40 mm)',3],['2" (50 mm)',6],['2-1/2" (65 mm)',12],['3" (80 mm)',20],['4" (100 mm)',160],['5" (125 mm)',360],['6" (150 mm)',620],['8" (200 mm)',1400],['10" (250 mm)',2500],['12" (300 mm)',3900]];
  let r=T.find(x=>x[1]>=d);const wc=(num(v.wc)||0)>0;if(wc&&r&&T.indexOf(r)<3)r=T[4];
  return{cap:"Horizontal branch size",value:r?r[0]:"> 12\"",unit:"",
   say:`The fixtures add up to ${B(f(d,0),"DFU")}. A horizontal branch of ${B(r?r[0]:"more than 12\"")} carries this at about 2 % (1/4" per ft) fall.`+(wc?" Any drain taking a WC must be at least 3–4\" (80–100 mm).":"")+" Size stacks and building drains from the code tables too.",
   rows:[["Total DFU",f(d,0),""]],after:tbl(["Pipe","Max DFU (horizontal branch)"],T.map(x=>({cls:r&&x===r?"sel":"",c:[x[0],x[1]]})))};
 },
 note:"Fixture unit values and horizontal-branch capacities from the International Plumbing Code (Tables 709.1 and 710.1). Public WCs are 4 DFU; private 3. EN 12056-2 uses discharge units instead; your local code governs."},

{id:"tank",g:"plumb",icon:"tank",name:"Water tank sizing",short:"Storage for people and days",
 intro:"Pick the building use, the number of people and the days of storage. You get the tank volume and a suggested size.",
 fields:[
  {id:"use",label:"Building use",type:"chips",def:"100",onSet:v=>{v.lpd=v.use;},options:[["150","Residential 150"],["100","Labour camp 100"],["45","Office 45"],["250","Hotel guest 250"],["450","Hospital bed 450"],["20","School pupil 20"]]},
  {id:"lpd",label:"Litres per person per day",type:"num",def:"100",unit:"L"},
  {id:"n",label:"People",type:"num",def:"200",unit:"people",half:true},
  {id:"d",label:"Days of storage",type:"num",def:"2",unit:"days",half:true},
  {id:"fire",label:"Fire reserve (if shared)",type:"num",def:"0",unit:"m³",adv:true},
  {id:"h",label:"Water depth",type:"num",def:"2",unit:"m",adv:true}
 ],
 calc(v){
  const lpd=num(v.lpd)||num(v.use),n=num(v.n),d=num(v.d),fire=num(v.fire)||0,h=num(v.h)||2;if(!(n>0&&d>0))return{hint:"Enter the people and days of storage."};
  const V=lpd*n*d/1000+fire,side=Math.sqrt(V/h/2);
  return{cap:"Tank volume",value:f(V,1),unit:"m³",
   say:`${f(n)} people at ${f(lpd)} L per day for ${f(d)} days need ${B(f(V,1),"m³")}`+(fire?` including ${f(fire)} m³ fire reserve`:"")+`. Split it into two compartments so one can be cleaned while the other serves. At ${f(h,1)} m water depth, two compartments of about ${B(f(side,1)+" × "+f(side,1)+" m","")} each, plus 0.3–0.5 m freeboard.`,
   rows:[["Daily use",f(lpd*n/1000,1),"m³/day"],["Volume",f(V*1000,0),"L"],["Each compartment",f(V/2,1),"m³"]]};
 },
 note:"Typical consumption figures; local authority (for example Kahramaa) and project requirements govern. Keep tanks shaded or insulated in the Gulf to limit water temperature and Legionella risk."},

{id:"rain",g:"plumb",icon:"rain",name:"Rainwater downpipe sizing",short:"Roof drainage flow and downpipes",
 intro:"Enter the roof area and design rainfall. You get the rainwater flow and how many downpipes of each size you need.",
 fields:[
  {id:"A",label:"Roof area drained",type:"num",def:"600",unit:"m²"},
  {id:"i",label:"Design rainfall intensity",type:"num",def:"75",unit:"mm/h",presets:[["50","50"],["75","75"],["100","100"],["150","150"]]},
  {id:"C",label:"Runoff coefficient",type:"num",def:"1",unit:"",adv:true}
 ],
 calc(v){
  const A=num(v.A),i=num(v.i),C=num(v.C)||1;if(!(A>0&&i>0))return{hint:"Enter the roof area and rainfall intensity."};
  const Q=A*i*C/3600,cap=d=>2.5e-4*Math.pow(0.25,-0.167)*Math.pow(d,8/3)*Math.pow(0.33,5/3),D=[75,90,100,110,125,150,200];
  const rows=D.map(d=>({c:[d+" mm",f(cap(d),1),Math.ceil(Q/cap(d))]})),best=D.find(d=>Math.ceil(Q/cap(d))<=4)||200;
  rows.forEach(r=>{if(r.c[0]===best+" mm")r.cls="sel";});
  return{cap:"Rainwater flow",value:f(Q,1),unit:"L/s",
   say:`${f(A)} m² at ${f(i)} mm/h gives ${B(f(Q,1),"L/s")}. For example use ${B(Math.ceil(Q/cap(best))+" × "+best+" mm")} downpipes; spread them so each drains a similar area. Check gutter and outlet capacity too, and keep at least two outlets per roof area in case one blocks.`,
   rows:[["Flow",f(Q*3.6,1),"m³/h"]],after:tbl(["Downpipe","Capacity L/s","Number needed"],rows)};
 },
 note:"Q = A × i × C ÷ 3600. Downpipe capacity from EN 12056-3 (filling 0.33, roughness 0.25 mm). Use local design rainfall; Gulf storms can exceed 75 mm/h for short periods."},

{id:"pjob",g:"plumb",icon:"job",name:"Job estimate",short:"Labour, materials and quote total",
 intro:"Enter the hours, crew and materials. You get a quote total with markup and tax.",
 fields:[
  {id:"cur",label:"Currency",type:"chips",def:"QAR",options:[["QAR","QAR"],["AED","AED"],["SAR","SAR"],["INR","INR"],["USD","USD"]]},
  {id:"hrs",label:"Hours on site",type:"num",def:"16",unit:"h",half:true},
  {id:"crew",label:"Crew size",type:"num",def:"2",unit:"people",half:true},
  {id:"rate",label:"Rate per worker-hour",type:"num",def:"45",unitFrom:v=>v.cur+"/h"},
  {id:"mat",label:"Materials cost",type:"num",def:"2400",unitFrom:v=>v.cur},
  {id:"mk",label:"Markup on materials",type:"num",def:"15",unit:"%",adv:true},
  {id:"oh",label:"Overhead and profit on labour",type:"num",def:"20",unit:"%",adv:true},
  {id:"tax",label:"Tax / VAT",type:"num",def:"0",unit:"%",adv:true}
 ],
 calc(v){
  const h=num(v.hrs)||0,c=num(v.crew)||0,r=num(v.rate)||0,m=num(v.mat)||0,cu=v.cur;
  if(!(h*c*r+m>0))return{hint:"Enter the hours, crew and rate, or a materials cost."};
  const lab=h*c*r*(1+(num(v.oh)||0)/100),mt=m*(1+(num(v.mk)||0)/100),sub=lab+mt,tx=sub*(num(v.tax)||0)/100;
  return{cap:"Quote total",value:f(sub+tx,0),unit:cu,
   say:`Labour comes to ${B(f(lab,0),cu)} for ${f(h*c,0)} worker-hours and materials to ${B(f(mt,0),cu)} with markup. The quote total is ${B(f(sub+tx,0),cu)}.`,
   rows:[["Labour",f(lab,0),cu],["Materials",f(mt,0),cu],["Subtotal",f(sub,0),cu],["Tax",f(tx,0),cu]]};
 },
 note:"Set tax to 0 where none applies. Overhead and profit are added to labour only."}
);
