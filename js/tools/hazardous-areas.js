/* MEPify · Hazardous areas tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
{id:"exgas",g:"haz",icon:"ex",name:"Gas group & T-class",short:"Ex equipment check for a gas",
 intro:"Pick the gas in the area. You get its gas group, ignition temperature and the Ex equipment rating it needs. Add the equipment marking to check it.",
 fields:[
  {id:"gas",label:"Gas or vapour",type:"select",def:"methane",options:Object.keys(EXG).map(k=>[k,EXG[k][0]])},
  {id:"eg",label:"Equipment gas group (from the Ex label)",type:"chips",def:"IIB",options:[["IIA","IIA"],["IIB","IIB"],["IIC","IIC"]]},
  {id:"et",label:"Equipment T-class",type:"chips",def:"T4",options:Object.keys(TCL).map(k=>[k,k])}
 ],
 calc(v){
  const g=EXG[v.gas];if(!g)return{hint:"Pick a gas."};
  const[nm,grp,ait,lel,uel,rd]=g,tc=Object.keys(TCL).find(k=>TCL[k]<=ait),ok=v.eg>=grp&&TCL[v.et]<=ait;
  return{cap:"Needs at least",value:grp+" "+tc,unit:"",status:{ok,text:ok?`${v.eg} ${v.et} equipment is suitable`:`${v.eg} ${v.et} equipment is not suitable`},
   say:`${nm} is gas group ${B(grp)} with an ignition temperature of ${f(ait,0)} °C, so equipment must be ${B(grp+" or higher")} and ${B(tc+" or cooler")}. It is ${rd<1?"lighter than air: it rises, so mount detectors high":"heavier than air: it collects low, so mount detectors low and keep drains and pits clear"}.`,
   rows:[["Autoignition temperature",f(ait,0),"°C"],["LEL",f(lel,1),"% vol"],["UEL",f(uel,1),"% vol"],["Density relative to air",f(rd,2),""],["Equipment max surface",f(TCL[v.et],0),"°C"]]};
 },
 note:"IIC equipment covers IIB and IIA; IIB covers IIA. T-class maximum surface temperatures: T1 450, T2 300, T3 200, T4 135, T5 100, T6 85 °C, which must be below the gas autoignition temperature. Values from IEC 60079-20-1; mixtures take the worst component."},

{id:"exzone",g:"haz",icon:"zone",name:"Zone & Ex protection",short:"EPL, ATEX category and allowed Ex types",
 intro:"Pick the hazardous area zone. You get the equipment protection level, ATEX category and the Ex protection types you can install.",
 fields:[
  {id:"z",label:"Zone",type:"chips",def:"1",options:[["0","Zone 0"],["1","Zone 1"],["2","Zone 2"],["20","Zone 20"],["21","Zone 21"],["22","Zone 22"]]}
 ],
 calc(v){
  const z=EXZ[v.z];if(!z)return{hint:"Pick a zone."};
  return{cap:"Equipment protection level",value:z[0],unit:"",
   say:`${z[3]} Equipment must be ${B("EPL "+z[0])} (ATEX category ${z[1]}). Allowed protection types: ${B(z[2])}.`,
   rows:[["ATEX category",z[1],""],["Typical release",z[4],""],["Class/Division (US) equivalent",z[5],""]]};
 },
 note:"IEC 60079-10-1 (gas) and 60079-10-2 (dust) for area classification, IEC 60079-14 for selection. Equipment for a higher-risk zone may always be used in a lower-risk one. The hour figures are common guidance, not code limits."},

{id:"lelconv",g:"haz",icon:"lel",name:"LEL ↔ % volume ↔ ppm",short:"Convert gas detector readings",
 intro:"Pick the gas and enter a reading in any unit. You get it in % LEL, % by volume and ppm.",
 fields:[
  {id:"gas",label:"Gas",type:"select",def:"methane",options:Object.keys(EXG).map(k=>[k,EXG[k][0]])},
  {id:"u",label:"Reading is in",type:"chips",def:"lel",options:[["lel","% LEL"],["vol","% volume"],["ppm","ppm"]]},
  {id:"x",label:"Reading",type:"num",def:"10"}
 ],
 calc(v){
  const g=EXG[v.gas],x=num(v.x);if(!g)return{hint:"Pick a gas."};if(!(x>=0))return{hint:"Enter the reading."};
  const lel=g[3],vol=v.u==="lel"?x*lel/100:v.u==="vol"?x:x/10000,pl=vol/lel*100,ppm=vol*10000;
  return{cap:"Gas level",value:f(pl,1),unit:"% LEL",status:pl>=100?{ok:false,text:"Above the LEL: explosive mixture"}:pl>=20?{ok:false,text:"High alarm level (≥ 20 % LEL)"}:pl>=10?{ok:false,text:"Low alarm level (≥ 10 % LEL)"}:null,
   say:`For ${g[0]} (LEL ${f(lel,1)} % vol), the reading is ${B(f(pl,1),"% LEL")} = ${B(f(vol,3),"% volume")} = ${B(f(ppm,0),"ppm")}.`,
   rows:[["% LEL",f(pl,2),""],["% volume",f(vol,4),""],["ppm",f(ppm,0),""],["LEL of this gas",f(lel,1),"% vol"]]};
 },
 note:"100 % LEL = the LEL concentration; 1 % volume = 10 000 ppm. A detector calibrated on methane reads other gases differently: use the maker's cross-sensitivity factor. Typical alarms 10 % and 20 % LEL; check your F&G cause & effect."},

{id:"expurge",g:"haz",icon:"press",name:"Purge & pressurisation",short:"Purge time and overpressure (IEC 60079-2/13)",
 intro:"Enter the room or enclosure volume and the purge airflow. You get the purge time before power is switched on, and a check of the measured overpressure.",
 fields:[
  {id:"V",label:"Internal volume",type:"num",def:"60",units:["m³","ft³"],udef:"m³"},
  {id:"Q",label:"Purge airflow",type:"num",def:"1200",units:["m³/h","CFM"],udef:"m³/h"},
  {id:"t",label:"Pressurisation type",type:"chips",def:"px",options:[["px","px / py (50 Pa)"],["pz","pz (25 Pa)"]]},
  {id:"n",label:"Volume changes for purge",help:"IEC 60079-2 default is 5 volumes unless the maker's tested figure is higher.",type:"num",def:"5",adv:true},
  {id:"dp",label:"Measured overpressure",help:"Leave blank to see only the purge time.",type:"num",def:"",unit:"Pa"}
 ],
 calc(v){
  let V=num(v.V),Q=num(v.Q);const n=num(v.n),dp=num(v.dp),mn=v.t==="pz"?25:50;if(v.V_u==="ft³")V*=0.0283168;if(v.Q_u==="CFM")Q*=1.69901;
  if(!(V>0))return{hint:"Enter the volume."};if(!(Q>0))return{hint:"Enter the purge airflow."};if(!(n>=1))return{hint:"Enter the volume changes for purge."};
  const tp=n*V/Q*60,has=isFinite(dp);
  return{cap:"Purge time",value:f(Math.ceil(tp),0),unit:"min",status:has?{ok:dp>=mn,text:dp>=mn?`${f(dp)} Pa: above the ${mn} Pa minimum`:`${f(dp)} Pa: below the ${mn} Pa minimum`}:null,
   say:`Purge ${f(n,0)} volumes (${f(n*V,0)} m³) at ${f(Q,0)} m³/h: keep the power isolated for at least ${B(f(Math.ceil(tp),0),"minutes")} with purge flow proven. Then hold at least ${B(mn+" Pa")} overpressure, with an alarm${v.t==="px"?" and automatic trip":""} on loss of pressure.`,
   rows:[["Purge time",f(tp/60,2),"h"],["Air changes",f(Q/V,1),"/h"],["Minimum overpressure",mn,"Pa"]]};
 },
 note:"IEC 60079-2 (enclosures) and 60079-13 (rooms such as analyser houses and LERs): px and py need 50 Pa minimum, pz 25 Pa. Air intakes must be from a non-hazardous location. Check door opening forces at the design overpressure."}
);
