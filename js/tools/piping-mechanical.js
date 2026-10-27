/* MEPify · Piping & mechanical tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
{id:"wallt",g:"mech",icon:"thick",name:"Pipe wall thickness",short:"ASME B31.3 pressure design and schedule",
 intro:"Pick the pipe size and enter the design pressure and material stress. You get the minimum wall thickness and the schedule to use.",
 fields:[
  {id:"nps",label:"Pipe size",type:"select",def:'4"',options:SCH.map(r=>[r[0],r[0]+" (OD "+r[1]+" mm)"])},
  {id:"mat",label:"Material",type:"chips",def:"cs",options:[["cs","Carbon steel"],["ss","Stainless steel"]]},
  {id:"P",label:"Design pressure (gauge)",type:"num",def:"20",units:Object.keys(FPU),udef:"bar"},
  {id:"S",label:"Allowable stress at design temperature",help:"From ASME B31.3 Table A-1. A106 Gr B 138 MPa up to about 200 °C; A312 TP316L about 115 MPa.",type:"num",def:"138",unit:"MPa",presets:[["138","A106 B"],["115","316L"]]},
  {id:"E",label:"Weld quality factor",type:"chips",def:"1",options:[["1","Seamless 1.0"],["0.85","ERW 0.85"],["0.8","EFW 0.80"]]},
  {id:"c",label:"Corrosion allowance",type:"num",def:"1.5",unit:"mm",adv:true,half:true},
  {id:"mt",label:"Mill tolerance",type:"num",def:"12.5",unit:"%",adv:true,half:true}
 ],
 calc(v){
  const r=SCH.find(x=>x[0]===v.nps),P=num(v.P)*(FPU[v.P_u]||1)*0.1,S=num(v.S),E=num(v.E),c=num(v.c)||0,mt=(num(v.mt)||0)/100;
  if(!r)return{hint:"Pick the pipe size."};if(!(P>0))return{hint:"Enter the design pressure."};if(!(S>0))return{hint:"Enter the allowable stress."};if(!(mt<0.5))return{hint:"Mill tolerance must be below 50 %."};
  const D=r[1],t=P*D/(2*(S*E+P*0.4)),tm=t+c,tn=tm/(1-mt);
  if(t>=D/6)return{hint:"The thickness is more than D/6. B31.3 needs a special design for this case."};
  const opts=SCHN.map((n,i)=>[n,r[i+2]]).filter(x=>x[1]&&(v.mat==="ss"||x[0]!=="10S")).sort((a,b)=>a[1]-b[1]),pick=opts.find(x=>x[1]>=tn);
  return{cap:"Minimum wall",value:f(tn,2),unit:"mm",status:pick?null:{ok:false,text:"Thicker than Sch 160: use heavier wall or a special design"},
   say:`At ${f(P*10,1)} bar g a ${v.nps} pipe needs ${f(t,2)} mm for pressure, ${f(tm,2)} mm with corrosion allowance, and ${B(f(tn,2),"mm")} nominal after mill tolerance. `+(pick?`Use ${B("Sch "+pick[0])} (${f(pick[1],2)} mm).`:""),
   rows:[["Pressure thickness t",f(t,2),"mm"],["With corrosion allowance",f(tm,2),"mm"],["Nominal needed",f(tn,2),"mm"]].concat(opts.map(x=>["Sch "+x[0],f(x[1],2),"mm"]))};
 },
 note:"ASME B31.3: t = P D ÷ [2 (S E W + P Y)] with Y = 0.4 and W = 1 (below 510 °C), plus corrosion allowance and 12.5 % mill tolerance. Also check external loads, vacuum and branch reinforcement. Schedules to ASME B36.10/B36.19."},

{id:"flange",g:"mech",icon:"flange",name:"Flange pressure rating",short:"ASME B16.5 class for carbon steel",
 intro:"Find the maximum pressure a flange class can take at your temperature, or the lowest class for your design pressure.",
 fields:[
  {id:"mode",label:"What do you need?",type:"chips",def:"p",options:[["p","Rating of a class"],["c","Class for my design"]]},
  {id:"cl",label:"Flange class",type:"chips",def:"300",options:FCL.map(c=>[String(c),String(c)]),show:v=>v.mode==="p"},
  {id:"P",label:"Design pressure (gauge)",type:"num",def:"40",units:Object.keys(FPU),udef:"bar",show:v=>v.mode==="c"},
  {id:"T",label:"Design temperature",type:"num",def:"120",unit:"°C"}
 ],
 calc(v){
  const T=num(v.T);if(!isFinite(T))return{hint:"Enter the design temperature."};if(T<-29||T>400)return{hint:"This table covers −29 to 400 °C for carbon steel group 1.1."};
  const rat=c=>{const i=FCL.indexOf(c),tt=Math.max(T,38);let k=1;while(k<FPT.length-1&&FPT[k][0]<tt)k++;const a=FPT[k-1],b=FPT[k];return a[i+1]+(b[i+1]-a[i+1])*(tt-a[0])/(b[0]-a[0]);};
  if(v.mode==="p"){const c=+v.cl,p=rat(c);
   return{cap:"Class "+c+" at "+f(T,0)+" °C",value:f(p,1),unit:"bar g",say:`A Class ${c} carbon steel flange (A105 / WCB) is rated ${B(f(p,1),"bar g")} (${f(p*14.5038,0)} psig) at ${f(T,0)} °C. Shell hydrotest is 1.5 × the 38 °C rating: ${f(FPT[0][FCL.indexOf(c)+1]*1.5,1)} bar g.`,
    rows:FCL.map(x=>["Class "+x,f(rat(x),1),"bar g"])};}
  const P=num(v.P)*(FPU[v.P_u]||1);if(!(P>0))return{hint:"Enter the design pressure."};
  const c=FCL.find(x=>rat(x)>=P);
  return{cap:"Lowest class",value:c?String(c):"> 2500",unit:"",status:c?null:{ok:false,text:"Above Class 2500: special design"},
   say:c?`For ${f(P,1)} bar g at ${f(T,0)} °C use ${B("Class "+c)}, rated ${f(rat(c),1)} bar g.`:"No B16.5 class covers this.",rows:FCL.map(x=>["Class "+x,f(rat(x),1),"bar g"])};
 },
 note:"ASME B16.5 Table 2-1.1, material group 1.1 (A105 forgings, A216 WCB castings); linear interpolation between temperatures is allowed. Stainless and alloy flanges have different ratings, so check the table for their group."},

{id:"pweight",g:"mech",icon:"weight",name:"Pipe weight",short:"Steel, contents and insulation per metre",
 intro:"Pick the pipe size and schedule and enter the length. You get the weight empty, full and insulated, for supports and lifting.",
 fields:[
  {id:"nps",label:"Pipe size",type:"select",def:'6"',options:SCH.map(r=>[r[0],r[0]])},
  {id:"sch",label:"Schedule",type:"chips",def:"40",options:SCHN.map(n=>[n,"Sch "+n])},
  {id:"L",label:"Length",type:"num",def:"6",units:uu("len"),udef:"m"},
  {id:"fl",label:"Contents",type:"chips",def:"1000",options:[["0","Empty / gas"],["1000","Water"],["850","Oil / diesel"],["450","LNG"]]},
  {id:"ins",label:"Insulation thickness",type:"num",def:"0",unit:"mm",adv:true,half:true},
  {id:"id",label:"Insulation density",type:"num",def:"130",unit:"kg/m³",adv:true,half:true}
 ],
 calc(v){
  const r=SCH.find(x=>x[0]===v.nps),i=SCHN.indexOf(v.sch),L=si(v,"L","len"),rho=num(v.fl),ti=num(v.ins)||0,di=num(v.id)||0;
  if(!r)return{hint:"Pick the pipe size."};if(!(L>0))return{hint:"Enter the length."};const t=r[i+2];if(!t)return{hint:"This schedule is not listed for this size."};
  const OD=r[1]/1000,ID=OD-2*t/1000,ws=Math.PI*(OD-t/1000)*(t/1000)*7850,wf=Math.PI*ID*ID/4*rho,wi=ti>0?Math.PI/4*((OD+2*ti/1000)**2-OD*OD)*di:0,wt=ws+wf+wi;
  return{cap:"Total weight",value:f(wt*L,0),unit:"kg",
   say:`${f(L,1)} m of ${v.nps} Sch ${v.sch} weighs ${B(f(ws*L,0),"kg")} empty and ${B(f(wt*L,0),"kg")} with contents${ti>0?" and insulation":""} (${f(wt,1)} kg/m).`,
   rows:[["Steel",f(ws,2),"kg/m"],["Contents",f(wf,2),"kg/m"],["Insulation",f(wi,2),"kg/m"],["Total",f(wt,2),"kg/m"],["Total",f(wt*L*2.20462,0),"lb"],["Wall thickness",f(t,2),"mm"],["Bore",f(ID*1000,1),"mm"]]};
 },
 note:"Carbon steel 7850 kg/m³. Add valves, flanges and cladding separately. For lifting, add the rigging weight and use the Rigging sling angle tool."},

{id:"npsh",g:"mech",icon:"pump",name:"Pump NPSH available",short:"Cavitation check on the suction side",
 intro:"Enter the suction conditions and the pump's NPSH required. You get the NPSH available and whether the margin is safe.",
 fields:[
  {id:"Ps",label:"Pressure on the liquid surface (gauge)",help:"0 for an open tank. Use the vessel gauge pressure for a closed tank.",type:"num",def:"0",units:Object.keys(FPU),udef:"bar"},
  {id:"z",label:"Liquid level above pump centreline",help:"Negative if the pump lifts from below.",type:"num",def:"2",units:uu("head"),udef:"m"},
  {id:"hf",label:"Suction pipe and fitting losses",type:"num",def:"0.5",units:uu("head"),udef:"m"},
  {id:"t",label:"Water temperature",type:"num",def:"40",unit:"°C"},
  {id:"nr",label:"NPSH required (pump curve)",type:"num",def:"3",units:uu("head"),udef:"m"},
  {id:"alt",label:"Site altitude",type:"num",def:"0",unit:"m",adv:true,half:true},
  {id:"pv",label:"Vapour pressure override",help:"For liquids other than water. Leave blank for water.",type:"num",def:"",unit:"kPa abs",adv:true,half:true}
 ],
 calc(v){
  const Ps=num(v.Ps)*(FPU[v.Ps_u]||1)*100,z=si(v,"z","head"),hf=si(v,"hf","head")||0,t=num(v.t),nr=si(v,"nr","head"),alt=num(v.alt)||0;
  if(!isFinite(Ps))return{hint:"Enter the surface pressure (0 for an open tank)."};if(!isFinite(z))return{hint:"Enter the liquid level."};if(!(t>0&&t<300))return{hint:"Enter a temperature between 0 and 300 °C."};if(!(nr>0))return{hint:"Enter the NPSH required."};
  const pa=101.325*Math.pow(1-2.25577e-5*alt,5.25588),pv=isFinite(num(v.pv))?num(v.pv):pvap(t),rho=1000*(1-(t+288.9414)/(508929.2*(t+68.12963))*(t-3.9863)**2);
  const na=(pa+Ps-pv)*1000/(rho*G)+z-hf,mg=na-nr,ok=na>=nr+1&&na>=1.1*nr;
  return{cap:"NPSH available",value:f(na,2),unit:"m",status:{ok,text:ok?"Safe margin":na>=nr?"Margin too small: cavitation risk":"Below NPSH required: the pump will cavitate"},
   say:`The suction gives ${B(f(na,2),"m")} NPSH available against ${f(nr,2)} m required, a margin of ${B(f(mg,2),"m")}.`+(ok?"":" Raise the liquid level, cut suction losses (bigger pipe, fewer fittings, clean strainer) or cool the liquid."),
   rows:[["Atmospheric pressure",f(pa,1),"kPa"],["Vapour pressure",f(pv,2),"kPa abs"],["Liquid density",f(rho,1),"kg/m³"],["Margin",f(mg,2),"m"],["Ratio NPSHa ÷ NPSHr",f(na/nr,2),""]]};
 },
 note:"NPSHa = (P<sub>atm</sub> + P<sub>surface</sub> − P<sub>vapour</sub>) ÷ ρg + z − h<sub>f</sub>. Aim for at least 1 m and 1.1 × NPSHr (ANSI/HI 9.6.1 suggests more for high-energy pumps). Water vapour pressure from the Antoine equation."},

{id:"bearing",g:"mech",icon:"bearing",name:"Bearing life (L10)",short:"Rated life in hours",
 intro:"Enter the bearing dynamic load rating, the equivalent load and the speed. You get the L10 life: the hours 90 % of bearings will reach.",
 fields:[
  {id:"C",label:"Dynamic load rating C",help:"From the bearing catalogue.",type:"num",def:"35",unit:"kN",half:true},
  {id:"P",label:"Equivalent load P",type:"num",def:"4",unit:"kN",half:true},
  {id:"n",label:"Speed",type:"num",def:"1480",unit:"rpm"},
  {id:"k",label:"Bearing type",type:"chips",def:"3",options:[["3","Ball"],["3.333","Roller"]]}
 ],
 calc(v){
  const C=num(v.C),P=num(v.P),n=num(v.n),p=num(v.k);if(!(C>0&&P>0))return{hint:"Enter C and P."};if(!(n>0))return{hint:"Enter the speed."};
  const L10=Math.pow(C/P,p),h=L10*1e6/(60*n),yr=h/8760,ok=h>=20000;
  return{cap:"L10 life",value:f(h,0),unit:"h",status:{ok,text:ok?"Meets 20 000 h continuous-duty target":"Below 20 000 h for continuous duty"},
   say:`At ${f(n,0)} rpm and C/P = ${f(C/P,2)} the ${p===3?"ball":"roller"} bearing has an L10 life of ${B(f(h,0),"hours")}, about ${B(f(yr,1),"years")} running 24/7.`,
   rows:[["L10",f(L10,1),"million revolutions"],["Life running 24/7",f(yr,1),"years"],["Life at 8 h/day",f(h/2920,1),"years"],["C / P",f(C/P,2),""]]};
 },
 note:"ISO 281: L10 = (C ÷ P)<sup>p</sup> million revolutions, p = 3 ball, 10/3 roller. Typical targets: 20 000–40 000 h for fans and pumps on continuous duty (API 610 asks 25 000 h). Lubrication and contamination factors can shorten or lengthen this."}
);
