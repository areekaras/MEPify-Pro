/* MEPify · Psychrometrics tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
{id:"psy",g:"psy",icon:"psy",name:"Air properties",short:"RH, wet bulb, dew point, enthalpy",
 intro:"Enter the dry bulb temperature and one more reading. You get every property of the air, with its point on the chart.",
 fields:[
  {id:"t",label:"Dry bulb temperature",type:"num",def:"20",unit:"°C"},
  {id:"mode",label:"What else did you measure?",type:"chips",def:"rh",options:[["rh","Relative humidity"],["wb","Wet bulb"],["dp","Dew point"],["w","Moisture"]]},
  {id:"rh",label:"Relative humidity",type:"num",def:"50",unit:"%",show:v=>v.mode==="rh"},
  {id:"wb",label:"Wet bulb temperature",type:"num",def:"14",unit:"°C",show:v=>v.mode==="wb"},
  {id:"dp",label:"Dew point temperature",type:"num",def:"9",unit:"°C",show:v=>v.mode==="dp"},
  {id:"w",label:"Moisture content",type:"num",def:"7.3",unit:"g/kg",show:v=>v.mode==="w"},
  {id:"alt",label:"Site altitude",help:"Leave 0 for sites near sea level, like Ras Laffan or Kochi.",type:"num",def:"0",unit:"m",adv:true}
 ],
 calc(v){
  const t=num(v.t),p=PSY.p(num(v.alt)||0);
  if(!isFinite(t)||t<-40||t>90)return{hint:"Enter a dry bulb temperature between −40 and 90 °C."};
  let W;
  if(v.mode==="rh"){const rh=num(v.rh);if(!(rh>0&&rh<=100))return{hint:"Relative humidity must be between 0 and 100 %."};W=PSY.Wpw(PSY.pws(t)*rh/100,p);}
  else if(v.mode==="wb"){const tw=num(v.wb);if(!isFinite(tw))return{hint:"Enter the wet bulb temperature."};if(tw>t)return{hint:"Wet bulb can't be higher than dry bulb. Check the readings."};W=PSY.Wwb(t,tw,p);}
  else if(v.mode==="dp"){const td=num(v.dp);if(!isFinite(td))return{hint:"Enter the dew point temperature."};if(td>t)return{hint:"Dew point can't be higher than dry bulb. Check the readings."};W=PSY.Wpw(PSY.pws(td),p);}
  else{const g=num(v.w);if(!(g>=0))return{hint:"Enter the moisture content in grams per kg of dry air."};W=g/1000;}
  if(!(W>=0))return{hint:"This air is too dry for these readings. Check the numbers."};
  if(W>PSY.Wpw(PSY.pws(t),p)*1.0005)return{hint:"That is more moisture than air can hold at this temperature (over 100 % RH). Check the readings."};
  const S=PSY.state(t,W,p);
  return{cap:"Enthalpy",value:f(S.h,2),unit:"kJ/kg",
   say:`At ${f(t,1)} °C and ${f(S.rh,0)} % RH, each kg of air holds ${B(g1(W),"g")} of water. Any surface colder than ${B(f(S.td,1),"°C")} will sweat.`,
   rows:psyRows(S),after:psyChart([{S,label:"Air"}],[],p)};
 },
 note:"Calculated with ASHRAE psychrometric equations. Site altitude changes air pressure and is under More options."},

{id:"mix",g:"psy",icon:"mix",name:"Air mixing",short:"Fresh air + return air mix",
 intro:"Enter the two air streams that mix, for example return air and fresh air going into an AHU.",
 fields:[
  {id:"q1",label:"Return air flow",type:"num",def:"8000",units:["m³/h","CFM","L/s"],udef:"m³/h"},
  {id:"t1",label:"Return air temperature",type:"num",def:"24",unit:"°C",half:true},
  {id:"r1",label:"Return air RH",type:"num",def:"50",unit:"%",half:true},
  {id:"q2",label:"Fresh air flow",type:"num",def:"2000",units:["m³/h","CFM","L/s"],udef:"m³/h"},
  {id:"t2",label:"Fresh air temperature",type:"num",def:"46",unit:"°C",half:true},
  {id:"r2",label:"Fresh air RH",type:"num",def:"30",unit:"%",half:true},
  {id:"alt",label:"Site altitude",type:"num",def:"0",unit:"m",adv:true}
 ],
 calc(v){
  const p=PSY.p(num(v.alt)||0),Q1=num(v.q1)*(AIRF[v.q1_u]||AIRF["m³/h"]),Q2=num(v.q2)*(AIRF[v.q2_u]||AIRF["m³/h"]);
  const t1=num(v.t1),r1=num(v.r1),t2=num(v.t2),r2=num(v.r2);
  if(!(Q1>=0&&Q2>=0&&Q1+Q2>0))return{hint:"Enter the two airflows."};
  if(!isFinite(t1)||!isFinite(t2))return{hint:"Enter both air temperatures."};
  if(!(r1>0&&r1<=100&&r2>0&&r2<=100))return{hint:"Both RH values must be between 0 and 100 %."};
  const A=PSY.fromRH(t1,r1,p),C=PSY.fromRH(t2,r2,p),m1=Q1/A.v,m2=Q2/C.v,m=m1+m2;
  const W=(m1*A.W+m2*C.W)/m,h=(m1*A.h+m2*C.h)/m,M=PSY.state(PSY.tHW(h,W),W,p);
  const fresh=Q2/(Q1+Q2)*100;
  return{cap:"Mixed air temperature",value:f(M.t,1),unit:"°C",
   say:`The mixed air going to the coil is ${B(f(M.t,1),"°C")} at ${B(f(M.rh,0),"% RH")}. Fresh air is ${f(fresh,0)} % of the total airflow.`,
   rows:[["Mixed RH",f(M.rh,1),"%"],["Mixed wet bulb",f(M.tw,1),"°C"],["Mixed dew point",f(M.td,1),"°C"],["Mixed enthalpy",f(M.h,2),"kJ/kg"],["Moisture",g1(M.W),"g/kg"],["Total airflow",f(m*M.v*3600,0),"m³/h"]],
   after:psyChart([{S:A,label:"Return",pos:"l"},{S:C,label:"Fresh",pos:"l"},{S:M,label:"Mix",pos:"b"}],[[0,1]],p)};
 },
 note:"Mixed by mass of dry air, so the result is exact, not a simple average."},

{id:"proc",g:"psy",icon:"proc",name:"Coil load",short:"Total, sensible and latent kW",
 intro:"Enter the airflow and the air before and after a coil. You get the full cooling or heating load and the water condensed.",
 fields:[
  {id:"q",label:"Airflow through coil",type:"num",def:"3000",units:["m³/h","CFM","L/s"],udef:"m³/h"},
  {id:"t1",label:"Air in: temperature",type:"num",def:"26",unit:"°C",half:true},
  {id:"r1",label:"Air in: RH",type:"num",def:"55",unit:"%",half:true},
  {id:"t2",label:"Air out: temperature",type:"num",def:"13",unit:"°C",half:true},
  {id:"r2",label:"Air out: RH",type:"num",def:"95",unit:"%",half:true},
  {id:"alt",label:"Site altitude",type:"num",def:"0",unit:"m",adv:true}
 ],
 calc(v){
  const p=PSY.p(num(v.alt)||0),Q=num(v.q)*(AIRF[v.q_u]||AIRF["m³/h"]);
  const t1=num(v.t1),r1=num(v.r1),t2=num(v.t2),r2=num(v.r2);
  if(!(Q>0))return{hint:"Enter the airflow through the coil."};
  if(!isFinite(t1)||!isFinite(t2))return{hint:"Enter the air temperature in and out."};
  if(!(r1>0&&r1<=100&&r2>0&&r2<=100))return{hint:"Both RH values must be between 0 and 100 %."};
  const A=PSY.fromRH(t1,r1,p),C=PSY.fromRH(t2,r2,p),m=Q/A.v;
  const tot=m*(A.h-C.h),sen=m*(1.006+1.86*A.W)*(t1-t2),lat=tot-sen,water=m*(A.W-C.W)*3600;
  const chart=psyChart([{S:A,label:"In",pos:"l"},{S:C,label:"Out"}],[[0,1]],p);
  if(Math.abs(tot)<0.01)return{hint:"Air in and air out are the same, so there is no load."};
  if(tot>0){
   const wet=water>0.05;
   return{cap:"Total cooling load",value:f(tot,1),unit:"kW",
    say:`This coil removes ${B(f(tot,1),"kW")} (${f(tot/3.51685,2)} TR): ${f(sen,1)} kW sensible and ${f(lat,1)} kW latent.${wet?` It condenses about ${B(f(water,1),"litres")} of water per hour, so the drain pan must work.`:` No water is condensed.`}`,
    rows:[["Sensible",f(sen,1),"kW"],["Latent",f(lat,1),"kW"],["Sensible heat ratio",f(sen/tot,2),""],["Condensate",f(Math.max(water,0),1),"L/h"],["Air out dew point",f(C.td,1),"°C"],["Air in enthalpy",f(A.h,1),"kJ/kg"],["Air out enthalpy",f(C.h,1),"kJ/kg"]],after:chart};
  }
  const drier=water>0.05,wetter=water<-0.05;
  return{cap:"Total heating load",value:f(-tot,1),unit:"kW",
   status:drier?{ok:false,text:"Check the RH readings"}:null,
   say:`This coil adds ${B(f(-tot,1),"kW")} of heat to the air.`+(wetter?` Moisture is also added: about ${f(-water,1)} litres of water per hour.`:"")+(drier?` But the air out is drier than the air in. A heating coil alone can't remove moisture, so one of the RH readings is probably wrong. With no moisture change, the heat would be ${B(f(m*(1.006+1.86*A.W)*(t2-t1),1),"kW")}.`:""),
   rows:[["Air in enthalpy",f(A.h,1),"kJ/kg"],["Air out enthalpy",f(C.h,1),"kJ/kg"],["Moisture in",g1(A.W),"g/kg"],["Moisture out",g1(C.W),"g/kg"]],after:chart};
 },
 note:"Use the airflow measured at the coil inlet. Water condensed is in litres per hour (1 kg = 1 litre)."},

{id:"dew",g:"psy",icon:"dew",name:"Sweating check",short:"Will a pipe or duct condense?",
 intro:"Enter the room air and the surface temperature. Find out if a pipe, duct or wall will sweat.",
 fields:[
  {id:"t",label:"Air temperature",type:"num",def:"30",unit:"°C",half:true},
  {id:"rh",label:"Air RH",type:"num",def:"70",unit:"%",half:true},
  {id:"s",label:"Surface temperature",type:"num",def:"13",unit:"°C",presets:[["7","Chilled water pipe 7"],["13","Supply duct 13"],["18","Diffuser 18"],["24","Cooled wall 24"]]},
  {id:"alt",label:"Site altitude",type:"num",def:"0",unit:"m",adv:true}
 ],
 calc(v){
  const t=num(v.t),rh=num(v.rh),ts=num(v.s),p=PSY.p(num(v.alt)||0);
  if(!isFinite(t))return{hint:"Enter the air temperature."};
  if(!(rh>0&&rh<=100))return{hint:"RH must be between 0 and 100 %."};
  if(!isFinite(ts))return{hint:"Enter the surface temperature."};
  const S=PSY.fromRH(t,rh,p),mg=ts-S.td;
  const st=mg<=0?{ok:false,text:"Will sweat"}:mg<2?{ok:false,text:"High risk of sweating"}:{ok:true,text:"Safe, no sweating"};
  return{cap:"Dew point of the air",value:f(S.td,1),unit:"°C",status:st,
   say:mg<=0?`The surface at ${f(ts,1)} °C is ${B(f(-mg,1),"°C")} below the dew point, so water will form on it. Insulate it with a vapour barrier, or dry the air.`
     :mg<2?`The surface is only ${B(f(mg,1),"°C")} above the dew point. A small rise in humidity will make it sweat. Insulation is recommended.`
     :`The surface is ${B(f(mg,1),"°C")} above the dew point, so it will stay dry.`,
   rows:[["Safety margin",f(mg,1),"°C"],["Wet bulb",f(S.tw,1),"°C"],["Moisture",g1(S.W),"g/kg"]]};
 },

 note:"Keep at least 2 °C between surface and dew point. Humid sites like Ras Laffan in summer can reach dew points above 28 °C."}
);
