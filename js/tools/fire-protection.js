/* MEPify · Fire protection tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
/* ---------- v1.15 additions: fire protection, steam, gas, compressed air, heating ---------- */

{id:"fsprk",g:"fire",icon:"sprk",name:"Sprinkler flow & pressure",short:"Q = K √P, both ways",
 intro:"Pick the sprinkler K-factor. Enter the pressure to get the flow, or the flow to get the pressure needed.",
 fields:[
  {id:"mode",label:"What do you need?",type:"chips",def:"q",options:[["q","Flow from pressure"],["p","Pressure for a flow"]]},
  {id:"K",label:"K-factor (metric, L/min·bar^½)",type:"chips",def:"80",options:SPK},
  {id:"P",label:"Pressure at the sprinkler",type:"num",def:"1",units:Object.keys(FPU),udef:"bar",show:v=>v.mode==="q"},
  {id:"Q",label:"Flow needed from the sprinkler",type:"num",def:"75",units:Object.keys(FQU),udef:"L/min",show:v=>v.mode==="p"}
 ],
 calc(v){
  const K=num(v.K),Ku=K/14.413;
  if(v.mode==="q"){const P=num(v.P)*(FPU[v.P_u]||1);if(!(P>0))return{hint:"Enter the pressure at the sprinkler."};
   const Q=K*Math.sqrt(P),low=P<0.5;
   return{cap:"Sprinkler flow",value:f(Q,1),unit:"L/min",status:low?{ok:false,text:"Below 0.5 bar (7 psi) minimum"}:null,
    say:`A K${K} sprinkler (K${f(Ku,1)} US) at ${f(P,2)} bar discharges ${B(f(Q,1),"L/min")} (${f(Q/3.78541,1)} US GPM).`+(low?" NFPA 13 needs at least 0.5 bar at every sprinkler.":""),
    rows:[["Flow",f(Q/3.78541,1),"US GPM"],["Flow",f(Q*0.06,2),"m³/h"],["Pressure",f(P*14.5038,1),"psi"],["K-factor (US)",f(Ku,1),"gpm/psi^½"]]};}
  const Q=num(v.Q)*(FQU[v.Q_u]||1);if(!(Q>0))return{hint:"Enter the flow needed."};
  let P=(Q/K)**2;const raised=P<0.5;if(raised)P=0.5;
  return{cap:"Pressure needed",value:f(P,2),unit:"bar",
   say:`To get ${f(Q,1)} L/min from a K${K} sprinkler you need ${B(f(P,2),"bar")} (${f(P*14.5038,1)} psi) at the sprinkler.`+(raised?` The flow alone needs less, but NFPA 13 sets a 0.5 bar minimum, so the sprinkler will give ${f(K*Math.sqrt(0.5),1)} L/min.`:""),
   rows:[["Pressure",f(P*14.5038,1),"psi"],["Pressure",f(P*100,0),"kPa"],["Flow",f(Q/3.78541,1),"US GPM"]]};
 },
 note:"Q = K √P with Q in L/min and P in bar (metric K), or Q in gpm and P in psi (US K). Metric K = US K × 14.4. Minimum operating pressure 0.5 bar (7 psi) per NFPA 13."},

{id:"fdem",g:"fire",icon:"fire",name:"Sprinkler design demand",short:"Density, area, heads, water and tank",
 intro:"Pick the hazard class and the sprinkler K-factor. You get the design heads, the water demand with hose allowance and the tank size.",
 fields:[
  {id:"hz",label:"Hazard class (NFPA 13)",type:"chips",def:"oh1",options:Object.keys(HZ).map(k=>[k,HZ[k][5]])},
  {id:"K",label:"Sprinkler K-factor",type:"chips",def:"80",options:SPK},
  {id:"hose",label:"Add hose stream allowance?",type:"chips",def:"1",options:[["1","Yes"],["0","No"]]},
  {id:"imb",label:"Hydraulic imbalance allowance",help:"Remote heads run above the minimum flow. 10 to 15 % is typical before the full hydraulic calculation.",type:"num",def:"10",unit:"%",adv:true}
 ],
 calc(v){
  const h=HZ[v.hz],K=num(v.K),imb=(num(v.imb)||0)/100;if(!h)return{hint:"Pick the hazard class."};
  const[dens,A,cov,hose,dur,nm]=h,n=Math.ceil(A/cov),qmin=dens*cov;
  const Pmin=Math.max((qmin/K)**2,0.5),qh=K*Math.sqrt(Pmin);
  const spr=n*qh*(1+imb),hs=v.hose==="1"?hose:0,tot=spr+hs,tank=tot*dur/1000;
  return{cap:"Total water demand",value:f(tot,0),unit:"L/min",
   say:`${nm}: ${f(dens,1)} mm/min over ${f(A,0)} m² means ${B(n,"sprinklers")} in the design area at up to ${f(cov,1)} m² each. With K${K} heads the most remote one needs ${B(f(Pmin,2),"bar")}. Sprinklers take ${f(spr,0)} L/min`+(hs?` plus ${f(hs,0)} L/min for hoses`:"")+`. For ${dur} minutes the fire tank needs ${B(f(tank,0),"m³")}.`,
   rows:[["Total demand",f(tot/3.78541,0),"US GPM"],["Sprinkler demand",f(spr,0),"L/min"],["Hose allowance",f(hs,0),"L/min"],["Flow per head (min)",f(qmin,1),"L/min"],["Pressure at remote head",f(Pmin*14.5038,1),"psi"],["Duration",dur,"min"],["Tank volume",f(tank*264.172,0),"US gal"]]};
 },
 note:"Densities and areas from the NFPA 13 density/area curves: LH 0.10, OH1 0.15, OH2 0.20 gpm/ft² over 1500 ft²; EH1 0.30, EH2 0.40 over 2500 ft². Durations are the low end of the NFPA 13 range. This is a pre-design estimate; the final system needs a full hydraulic calculation and AHJ approval."},

{id:"fpump",g:"fire",icon:"pump",name:"Fire pump sizing",short:"Rated flow, pressure and motor (NFPA 20)",
 intro:"Enter the fire water demand and the pressure needed at the system. You get the pump rating, the NFPA 20 curve limits and the motor size.",
 fields:[
  {id:"Q",label:"Fire water demand",type:"num",def:"2500",units:Object.keys(FQU),udef:"L/min"},
  {id:"Pr",label:"Pressure needed at the system",help:"From the hydraulic calculation, at the base of the riser or the system inlet.",type:"num",def:"6",units:Object.keys(FPU),udef:"bar"},
  {id:"H",label:"Height from pump to system inlet",type:"num",def:"5",units:uu("head"),udef:"m"},
  {id:"Pf",label:"Losses in the pump discharge pipework",type:"num",def:"0.3",units:Object.keys(FPU),udef:"bar",half:true},
  {id:"Ps",label:"Suction pressure",help:"Positive head from the tank. Use 0 if unsure.",type:"num",def:"0.2",units:Object.keys(FPU),udef:"bar",half:true},
  {id:"eff",label:"Pump efficiency",type:"num",def:"70",unit:"%",adv:true}
 ],
 calc(v){
  const Q=num(v.Q)*(FQU[v.Q_u]||1),Pr=num(v.Pr)*(FPU[v.Pr_u]||1),H=si(v,"H","head")||0,Pf=(num(v.Pf)||0)*(FPU[v.Pf_u]||1),Ps=(num(v.Ps)||0)*(FPU[v.Ps_u]||1),eff=num(v.eff)/100;
  if(!(Q>0))return{hint:"Enter the fire water demand."};if(!(Pr>0))return{hint:"Enter the pressure needed at the system."};if(!(eff>0&&eff<=1))return{hint:"Efficiency must be between 1 and 100 %."};
  const gpm=Q/3.78541,rg=gpm>FPR[FPR.length-1]?null:FPR.find(x=>x>=gpm*0.999);
  const Pn=Pr+RHO*G*H/1e5+Pf-Ps;if(!(Pn>0))return{hint:"The suction pressure already covers the need. No pump pressure is needed."};
  const Qr=rg?rg*3.78541:Q,Pw=Qr/60000*Pn*1e5/eff/1000,Pmax=Pw*1.2,mot=MOT.find(x=>x>=Pmax);
  return{cap:"Rated pressure at "+(rg?f(rg,0):f(gpm,0))+" gpm",value:f(Pn,2),unit:"bar",
   say:`Choose a listed fire pump rated ${B(rg?f(rg,0)+" gpm ("+f(Qr,0)+" L/min)":f(gpm,0)+" gpm")} at ${B(f(Pn,2),"bar")} (${f(Pn*14.5038,0)} psi). At 150 % flow it must still give at least ${f(Pn*0.65,2)} bar, and churn must not exceed ${f(Pn*1.4,2)} bar. Fit a motor of at least ${B(mot?mot+" kW":f(Pmax,0)+" kW")}.`+(rg?"":" The demand is above 5000 gpm, so split it across pumps."),
   rows:[["Rated pressure",f(Pn*14.5038,0),"psi"],["Rated head",f(Pn*1e5/(RHO*G),1),"m"],["150 % flow",f(Qr*1.5,0),"L/min"],["Min pressure at 150 %",f(Pn*0.65,2),"bar"],["Max churn pressure",f(Pn*1.4,2),"bar"],["Shaft power at rating",f(Pw,1),"kW"],["Motor (≥ 1.2 × shaft)",mot?mot:"—","kW"]]};
 },
 note:"NFPA 20: a pump must give at least 65 % of rated pressure at 150 % of rated flow, and churn (zero flow) pressure must not exceed 140 % of rated. Ratings are the standard NFPA 20 sizes. The driver must cover the peak power on the curve; 1.2 × rated shaft power is a planning figure, confirm on the pump curve."},

{id:"fhyd",g:"fire",icon:"hydr",name:"Hydrant flow test",short:"Measured flow and flow available at 20 psi",
 intro:"Enter the static, residual and pitot readings from the hydrant flow test. You get the flow and how much water the main can supply.",
 fields:[
  {id:"Ps",label:"Static pressure",type:"num",def:"5.5",units:Object.keys(FPU),udef:"bar"},
  {id:"Pr",label:"Residual pressure while flowing",type:"num",def:"4",units:Object.keys(FPU),udef:"bar"},
  {id:"Pp",label:"Pitot pressure at the outlet",type:"num",def:"1.2",units:Object.keys(FPU),udef:"bar"},
  {id:"d",label:"Outlet diameter",type:"num",def:"63.5",units:uu("sm"),udef:"mm",presets:[["63.5",'2-1/2"'],["101.6",'4"'],["114.3",'4-1/2"']]},
  {id:"c",label:"Outlet coefficient",type:"chips",def:"0.9",options:[["0.9","Smooth 0.90"],["0.8","Square edge 0.80"],["0.7","Projecting 0.70"]]},
  {id:"Pt",label:"Target residual pressure",help:"NFPA 291 rates hydrants at 20 psi (1.38 bar) residual.",type:"num",def:"1.38",units:Object.keys(FPU),udef:"bar",adv:true}
 ],
 calc(v){
  const c2=k=>num(v[k])*(FPU[v[k+"_u"]]||1),Ps=c2("Ps"),Pr=c2("Pr"),Pp=c2("Pp"),Pt=c2("Pt"),c=num(v.c),d=si(v,"d","sm")/0.0254;
  if(!(Ps>0))return{hint:"Enter the static pressure."};if(!(Pr>0&&Pr<Ps))return{hint:"The residual pressure must be below the static pressure."};
  if(!(Pp>0))return{hint:"Enter the pitot pressure."};if(!(d>0))return{hint:"Enter the outlet diameter."};if(!(Pt>=0&&Pt<Ps))return{hint:"The target residual must be below the static pressure."};
  const gpm=29.83*c*d*d*Math.sqrt(Pp*14.5038),Qa=gpm*Math.pow((Ps-Pt)/(Ps-Pr),0.54);
  return{cap:"Flow available",value:f(Qa*3.78541,0),unit:"L/min",
   say:`The test outlet flowed ${B(f(gpm*3.78541,0),"L/min")} (${f(gpm,0)} gpm). At ${f(Pt,2)} bar residual the main can supply about ${B(f(Qa*3.78541,0),"L/min")} (${f(Qa,0)} gpm).`,
   rows:[["Flow available",f(Qa,0),"US GPM"],["Flow available",f(Qa*0.227125,1),"m³/h"],["Test flow",f(gpm,0),"US GPM"],["Pressure drop in test",f((Ps-Pr)/Ps*100,0),"% of static"]]};
 },
 note:"NFPA 291: Q = 29.83 c d² √p (gpm, inches, psi) and Q<sub>R</sub> = Q<sub>F</sub> × (h<sub>r</sub> ÷ h<sub>f</sub>)<sup>0.54</sup>. For a reliable result the test should drop the static pressure by at least 10 %."},

{id:"fagent",g:"fire",icon:"agent",name:"Clean agent quantity",short:"FM-200 or Novec 1230 for a room (NFPA 2001)",
 intro:"Enter the protected room and the design concentration. You get the agent mass to fill the cylinders.",
 fields:[
  {id:"ag",label:"Agent",type:"chips",def:"fm",options:[["fm","FM-200 (HFC-227ea)"],["nv","Novec 1230 (FK-5-1-12)"]]},
  {id:"L",label:"Room length",type:"num",def:"10",units:uu("len"),udef:"m",half:true},
  {id:"W",label:"Room width",type:"num",def:"6",units:uu("len"),udef:"m",half:true},
  {id:"H",label:"Room height (incl. floor and ceiling voids)",type:"num",def:"4",units:uu("len"),udef:"m"},
  {id:"Cfm",label:"Design concentration",help:"FM-200 Class A typically 7.0 %. Check the system listing.",type:"num",def:"7",unit:"%",show:v=>v.ag==="fm"},
  {id:"Cnv",label:"Design concentration",help:"Novec 1230 Class A typically 4.5 to 5.3 %. Check the system listing.",type:"num",def:"4.5",unit:"%",show:v=>v.ag==="nv"},
  {id:"t",label:"Minimum room temperature",type:"num",def:"20",unit:"°C"},
  {id:"Vd",label:"Fixed volumes to deduct",help:"Solid items like columns or ducts that the gas cannot fill.",type:"num",def:"0",unit:"m³",adv:true},
  {id:"alt",label:"Site altitude",type:"num",def:"0",unit:"m",adv:true}
 ],
 calc(v){
  const fm=v.ag==="fm",C=num(fm?v.Cfm:v.Cnv),t=num(v.t),L=si(v,"L","len"),W=si(v,"W","len"),H=si(v,"H","len"),Vd=num(v.Vd)||0,alt=num(v.alt)||0;
  if(!(L>0&&W>0&&H>0))return{hint:"Enter the room size."};if(!(C>0&&C<20))return{hint:"Enter a design concentration between 1 and 20 %."};if(!isFinite(t))return{hint:"Enter the minimum room temperature."};
  const V=L*W*H-Vd;if(!(V>0))return{hint:"The deducted volume is bigger than the room."};
  const S=fm?0.1269+0.000513*t:0.0664+0.0002741*t,acf=interp(ACF,alt),Wkg=V/S*C/(100-C)*acf;
  return{cap:"Agent needed",value:f(Wkg,1),unit:"kg",
   say:`A ${f(V,1)} m³ room at ${f(t,0)} °C needs ${B(f(Wkg,1),"kg")} of ${fm?"FM-200":"Novec 1230"} for ${f(C,2)} % concentration. That is ${f(Wkg/V,3)} kg per m³.`+(acf<1?` The altitude factor ${f(acf,2)} is included.`:""),
   rows:[["Agent",f(Wkg*2.20462,1),"lb"],["Net volume",f(V,1),"m³"],["Flooding factor",f(Wkg/V,4),"kg/m³"],["Specific volume S",f(S,4),"m³/kg"],["Altitude factor",f(acf,2),""]]};
 },
 note:"NFPA 2001: W = V ÷ S × C ÷ (100 − C). FM-200 S = 0.1269 + 0.000513 t; Novec 1230 S = 0.0664 + 0.0002741 t (m³/kg, t in °C). Check the room holds the gas (door fan test) and fit pressure relief venting sized by the system supplier."},

{id:"smoke",g:"fire",icon:"smoke",name:"Smoke extract rate",short:"Plume smoke production (NFPA 92)",
 intro:"Enter the design fire size and the clear height you need to keep free of smoke. You get the smoke exhaust rate for an atrium, mall or large space.",
 fields:[
  {id:"Q",label:"Design fire size",help:"Typical: 1 MW sprinklered office, 2.5 MW sprinklered retail, 5 MW unsprinklered.",type:"num",def:"2500",unit:"kW",presets:[["1000","1 MW"],["2500","2.5 MW"],["5000","5 MW"]]},
  {id:"z",label:"Clear height above the fire",help:"Height from the fire base to the bottom of the smoke layer.",type:"num",def:"6",units:uu("len"),udef:"m"},
  {id:"ta",label:"Ambient temperature",type:"num",def:"25",unit:"°C"},
  {id:"cf",label:"Convective fraction",type:"num",def:"0.7",adv:true}
 ],
 calc(v){
  const Q=num(v.Q),z=si(v,"z","len"),ta=num(v.ta),cf=num(v.cf);
  if(!(Q>0))return{hint:"Enter the design fire size."};if(!(z>0))return{hint:"Enter the clear height."};if(!isFinite(ta))return{hint:"Enter the ambient temperature."};if(!(cf>0&&cf<=1))return{hint:"Convective fraction must be between 0 and 1."};
  const Qc=cf*Q,zl=0.166*Math.pow(Qc,0.4),m=z>zl?0.071*Math.pow(Qc,1/3)*Math.pow(z,5/3)+0.0018*Qc:0.032*Math.pow(Qc,0.6)*z;
  const Ts=ta+Qc/(m*1.005),rho=353/(Ts+273.15),V=m/rho;
  return{cap:"Smoke exhaust",value:f(V,1),unit:"m³/s",
   say:`A ${f(Q/1000,1)} MW fire produces ${B(f(m,1),"kg/s")} of smoke by the time the plume rises ${f(z,1)} m. At about ${f(Ts,0)} °C that is ${B(f(V,1),"m³/s")} (${f(V*3600,0)} m³/h) to extract. Provide make-up air at roughly 85 % of this, at low level and below 1 m/s.`,
   rows:[["Smoke exhaust",f(V*2118.88,0),"CFM"],["Smoke mass flow",f(m,2),"kg/s"],["Smoke layer temperature",f(Ts,0),"°C"],["Make-up air (≈ 85 %)",f(V*0.85,1),"m³/s"],["Flame height limit",f(zl,2),"m"]]};
 },
 note:"NFPA 92 axisymmetric plume: m = 0.071 Q<sub>c</sub><sup>⅓</sup> z<sup>5/3</sup> + 0.0018 Q<sub>c</sub> above the flame height z<sub>l</sub> = 0.166 Q<sub>c</sub><sup>⅖</sup>. Balcony spill and window plumes need different equations. Check plugholing with several exhaust points."},

{id:"foam",g:"fire",icon:"foam",name:"Foam concentrate quantity",short:"Tanks, rim seals and bunds (NFPA 11)",
 intro:"Pick what you are protecting and the fuel. You get the foam solution rate, the discharge time and the foam concentrate to store.",
 fields:[
  {id:"mode",label:"What are you protecting?",type:"chips",def:"cone",options:[["cone","Cone roof tank"],["rim","Floating roof rim seal"],["bund","Bund / dike"]]},
  {id:"D",label:"Tank diameter",type:"num",def:"30",units:uu("len"),udef:"m",show:v=>v.mode!=="bund"},
  {id:"w",label:"Foam dam distance from shell",type:"num",def:"0.6",units:uu("len"),udef:"m",show:v=>v.mode==="rim"},
  {id:"A",label:"Bund area (less tank footprints)",type:"num",def:"1500",units:["m²","ft²"],udef:"m²",show:v=>v.mode==="bund"},
  {id:"fuel",label:"Fuel",type:"chips",def:"1",options:[["1","Crude or flash point below 37.8 °C"],["2","Flash point 37.8 to 93 °C"]],show:v=>v.mode!=="rim"},
  {id:"pc",label:"Foam concentrate",type:"chips",def:"3",options:[["1","1 %"],["3","3 %"],["6","6 %"]]},
  {id:"hose",label:"Add supplementary hose streams?",type:"chips",def:"1",options:[["1","Yes"],["0","No"]],show:v=>v.mode!=="bund"}
 ],
 calc(v){
  const pc=num(v.pc)/100;let A,rate,dur,lbl;
  if(v.mode==="bund"){A=num(v.A);if(v.A_u==="ft²")A*=0.092903;if(!(A>0))return{hint:"Enter the bund area."};rate=4.1;dur=v.fuel==="1"?30:20;lbl="bund";}
  else{const D=si(v,"D","len");if(!(D>0))return{hint:"Enter the tank diameter."};
   if(v.mode==="rim"){const w=si(v,"w","len");if(!(w>0&&2*w<D))return{hint:"Enter the foam dam distance."};A=Math.PI/4*(D*D-(D-2*w)**2);rate=12.2;dur=20;lbl="rim seal area";}
   else{A=Math.PI/4*D*D;rate=4.1;dur=v.fuel==="1"?55:30;lbl="liquid surface";}}
  const qs=A*rate,Vs=qs*dur;let nh=0,ht=0,Vh=0;
  if(v.mode!=="bund"&&v.hose==="1"){const D=si(v,"D","len");nh=D<=19.8?1:D<=36.6?2:3;ht=D<=10.7?10:D<=28.9?20:30;Vh=nh*189*ht;}
  const Vt=Vs+Vh,conc=Vt*pc;
  return{cap:"Foam concentrate",value:f(conc,0),unit:"L",
   say:`The ${lbl} is ${f(A,0)} m². At ${f(rate,1)} L/min·m² for ${dur} min the fixed system needs ${B(f(qs,0),"L/min")} of foam solution.`+(nh?` Add ${nh} hose stream${nh>1?"s":""} at 189 L/min for ${ht} min.`:"")+` Store at least ${B(f(conc,0),"L")} of ${f(pc*100,0)} % concentrate, plus a full reserve if your code needs one.`,
   rows:[["Foam solution rate",f(qs,0),"L/min"],["Foam solution rate",f(qs/3.78541,0),"US GPM"],["Fixed system solution",f(Vs,0),"L"],["Hose stream solution",f(Vh,0),"L"],["Water needed",f(Vt*(1-pc)/1000,1),"m³"],["Concentrate",f(conc/3.78541,0),"US gal"]]};
 },
 note:"NFPA 11: Type II fixed outlets 4.1 L/min·m² for 55 min (crude, flash point < 37.8 °C) or 30 min; floating roof rim seal 12.2 L/min·m² for 20 min; bund 4.1 L/min·m² for 30 or 20 min. Hose streams 189 L/min each: 1 up to 19.8 m, 2 up to 36.6 m, 3 above; for 10, 20 or 30 min by tank size. LNG spills need high-expansion foam sized by test."}
);
