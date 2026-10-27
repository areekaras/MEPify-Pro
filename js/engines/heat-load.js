/* MEPify · Heat load engine: room by room, 24 h design day
   by Mohamed Shafaf Karumannil */

/* ---------- HEAT LOAD ENGINE (room by room, 24 h, design day) ----------
   Method (own implementation, public physics):
   - Sun position from latitude, longitude, time zone and month (declination, equation of time).
   - Clear-sky beam irradiance (Meinel air-mass model) x clearness; diffuse = 12 % of beam; ground reflectance 0.3.
   - Outdoor temperature: cosine daily swing, maximum 15:00, minimum 05:00.
   - Walls / roof: sol-air temperature, then decrement factor and time lag by construction mass.
   - Radiant gains (glass solar, part of people, lights, equipment) released over time by room mass.
   - Fresh air counted at the coil, infiltration in the room. */
const HL={
  ORI:[["N",0],["NE",45],["E",90],["SE",135],["S",180],["SW",225],["W",270],["NW",315]],
  ACT:{office:[75,55,"Seated office work"],light:[90,95,"Standing, light work"],walk:[100,130,"Walking, retail"],heavy:[170,255,"Heavy work"]},
  MASS:{light:{lam:0.9,lag:1,r:0.25,t:"Light (metal panel, sandwich)"},medium:{lam:0.45,lag:6,r:0.45,t:"Medium (block + insulation)"},heavy:{lam:0.25,lag:9,r:0.6,t:"Heavy (thick concrete)"}},
  COL:{light:[0.45,"Light"],medium:[0.7,"Medium"],dark:[0.9,"Dark"]},
  DAY:[17,47,75,105,135,162,198,228,258,288,318,344],
  MON:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  RADF:{people:0.6,lights:0.6,equip:0.3}
};
HL.CITIES=[["Qatar",[["Doha",25.29,51.53,3],["Ras Laffan",25.91,51.55,3],["Mesaieed",24.99,51.55,3],["Dukhan",25.43,50.78,3],["Al Khor",25.68,51.5,3]]],
 ["UAE",[["Dubai",25.2,55.27,4],["Abu Dhabi",24.45,54.38,4],["Ruwais",24.11,52.73,4],["Fujairah",25.12,56.33,4]]],
 ["Saudi Arabia",[["Riyadh",24.71,46.68,3],["Jeddah",21.49,39.19,3],["Dammam",26.43,50.1,3],["Jubail",27.0,49.66,3]]],
 ["Gulf, other",[["Kuwait City",29.38,47.99,3],["Manama",26.23,50.59,3],["Muscat",23.59,58.41,4],["Sohar",24.35,56.7,4]]],
 ["India",[["Kochi",9.93,76.27,5.5],["Kozhikode",11.26,75.78,5.5],["Malappuram",11.07,76.07,5.5],["Thiruvananthapuram",8.52,76.94,5.5],["Chennai",13.08,80.27,5.5],["Mumbai",19.08,72.88,5.5],["Bengaluru",12.97,77.59,5.5],["Delhi",28.61,77.21,5.5]]],
 ["Africa",[["Cairo",30.04,31.24,2],["Lagos",6.52,3.38,1],["Port Harcourt",4.82,7.03,1],["Douala",4.05,9.7,1],["Libreville",0.42,9.47,1]]],
 ["Europe",[["London",51.51,-0.13,0],["Madrid",40.42,-3.7,1],["Stavanger",58.97,5.73,1],["Oslo",59.91,10.75,1]]],
 ["Asia-Pacific & Americas",[["Singapore",1.35,103.82,8],["Kuala Lumpur",3.14,101.69,8],["Perth",-31.95,115.86,8],["Sydney",-33.87,151.21,10],["Houston",29.76,-95.37,-6]]]];
HL.defProject=()=>({city:"Doha",id:"p"+Date.now().toString(36),name:"New project",lat:25.3,lon:51.5,tz:3,month:7,db:46,wb:29,dr:11,alt:0,clr:1,
  ti:23,rh:50,uw:0.5,ur:0.3,ug:2.1,shgc:0.3,shade:1,col:"medium",mass:"medium",rp:2.5,ra:0.3,dts:11,sf:10,occS:8,occE:18,
  rooms:[HL.defRoom("Office 1",{walls:{S:12,W:15},wins:{S:3,W:4},roof:true,people:4})]});
HL.defRoom=(name,o)=>Object.assign({id:"r"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name,area:30,ht:3,h24:false,
  walls:{},wins:{},roof:false,part:0,pdt:5,people:2,act:"office",lights:10,equip:15,ach:0.3},o||{});
/* input checks: return a plain-English problem, or "" when fine */
HL.NAMES={db:"outdoor dry bulb",wb:"wet bulb",dr:"daily range",clr:"sky clearness",lat:"latitude",lon:"longitude",tz:"time zone",alt:"altitude",
  ti:"room temperature",rh:"room RH",occS:"occupied from",occE:"occupied until",dts:"supply air ΔT",sf:"safety factor",rp:"fresh air per person",
  ra:"fresh air per m²",uw:"wall U-value",ur:"roof U-value",ug:"glass U-value",shgc:"glass SHGC",shade:"shading factor"};
HL.check=P=>{
  for(const k in HL.NAMES){const v=P[k];if(typeof v!=="number"||!isFinite(v))return `Fill in the ${HL.NAMES[k]} (tap Design conditions and building).`;}
  if(P.wb>P.db)return "Wet bulb cannot be higher than dry bulb. Check the outdoor design conditions.";
  if(P.dts<=0)return "Supply air ΔT must be more than 0 K (typically 8 to 12 K).";
  if(P.rh<=0||P.rh>=100)return "Room RH must be between 0 and 100 %.";
  if(P.ti>=P.db)return "Room temperature must be below the outdoor dry bulb for a cooling load.";
  if(P.shgc<0||P.shgc>1||P.shade<0||P.shade>1)return "Glass SHGC and shading factor must be between 0 and 1.";
  if(P.clr<=0||P.clr>1.2)return "Sky clearness should be between 0.5 and 1.";
  for(const k of ["dr","uw","ur","ug","rp","ra","sf","alt"])if(P[k]<0)return `The ${HL.NAMES[k]} cannot be negative.`;
  if(P.lat<-90||P.lat>90)return "Latitude must be between −90 and 90 (minus for south).";
  if(P.lon<-180||P.lon>180)return "Longitude must be between −180 and 180 (minus for west).";
  if(P.tz<-12||P.tz>14)return "Time zone must be between −12 and +14 hours from UTC.";
  if(P.occS<0||P.occE>24||P.occS>=P.occE)return "Occupied hours must run between 0 and 24, start before end.";
  return "";
};
HL.checkRoom=R=>{
  const v=k=>num(R[k]);
  if(!(v("area")>0))return "Fill in the floor area.";
  const neg=[["area","floor area"],["ht","ceiling height"],["people","people"],["lights","lighting"],["equip","equipment"],["ach","air leakage"],["part","partition area"],["roofA","roof area"]].find(([k])=>v(k)<0);
  if(neg)return `The ${neg[1]} cannot be negative.`;
  const o=HL.ORI.find(([d])=>num(R.walls[d])<0||num(R.wins[d])<0);
  if(o)return `Wall and glass areas cannot be negative (${o[0]}).`;
  return "";
};
HL.sun=(P,hr)=>{
  const R=Math.PI/180,n=HL.DAY[(P.month||7)-1],Bq=2*Math.PI*(n-81)/364;
  const eot=9.87*Math.sin(2*Bq)-7.53*Math.cos(Bq)-1.5*Math.sin(Bq);
  const lst=hr+(4*(P.lon-15*P.tz)+eot)/60,H=15*(lst-12)*R,L=P.lat*R;
  const d=23.45*Math.sin(2*Math.PI*(284+n)/365)*R;
  const sb=Math.cos(L)*Math.cos(d)*Math.cos(H)+Math.sin(L)*Math.sin(d);
  if(sb<=0.01)return{up:false,sb:0,az:0,dni:0,dh:0};
  const cb=Math.sqrt(1-sb*sb);
  let az=Math.acos(Math.max(-1,Math.min(1,(Math.sin(d)-sb*Math.sin(L))/(cb*Math.cos(L)))));
  if(H>0)az=2*Math.PI-az;
  const I0=1361*(1+0.033*Math.cos(2*Math.PI*n/365));
  const dni=I0*Math.pow(0.7,Math.pow(1/sb,0.678))*(P.clr||1);
  return{up:true,sb,cb,az,dni,dh:0.12*dni};
};
// irradiance on a vertical surface facing azimuth deg (from north), or on the roof (deg=null)
HL.irr=(S,deg)=>{
  if(!S.up)return{b:0,d:0};
  if(deg==null)return{b:S.dni*S.sb,d:S.dh};
  const ct=S.cb*Math.cos(S.az-deg*Math.PI/180);
  return{b:S.dni*Math.max(0,ct),d:0.5*S.dh+0.3*0.5*(S.dni*S.sb+S.dh)};
};
HL.tout=(P,h)=>{const hh=h<5?h+24:h;const x=h>=5&&h<=15?0.5*(1+Math.cos(Math.PI*(h-5)/10)):0.5*(1-Math.cos(Math.PI*(hh-15)/14));return P.db-P.dr*x;};
HL.on=(P,R,h)=>R.h24||(h>=P.occS&&h<P.occE);
HL.delay=(q,r)=>{const out=new Array(24).fill(0),norm=(1-r)/(1-Math.pow(r,24));
  for(let t=0;t<24;t++){let s=0;for(let k=0;k<24;k++)s+=Math.pow(r,k)*q[(t-k+24)%24];out[t]=s*norm;}return out;};
// one room, 24 hourly values for each component (W)
HL.room=(P,R)=>{
  const M=HL.MASS[P.mass]||HL.MASS.medium,alpha=(HL.COL[P.col]||HL.COL.medium)[0],p=PSY.p(P.alt||0);
  const Wo=PSY.Wwb(P.db,Math.min(P.wb,P.db),p),Wi=PSY.Wpw(PSY.pws(P.ti)*P.rh/100,p),dW=Wo-Wi;
  const hrs=[...Array(24).keys()],To=hrs.map(h=>HL.tout(P,h)),SUN=hrs.map(h=>HL.sun(P,h+0.5));
  const lagged=(Te,U,A)=>{const m=Te.reduce((a,b)=>a+b,0)/24;return hrs.map(h=>U*A*(m+M.lam*(Te[(h-M.lag+24)%24]-m)-P.ti));};
  const zero=()=>new Array(24).fill(0),add=(a,b)=>a.map((x,i)=>x+b[i]);
  let walls=zero(),gcond=zero(),gsolRad=zero(),roof=zero(),glassA=0;
  HL.ORI.forEach(([o,deg])=>{
    const aw=num(R.walls[o])||0,ag=num(R.wins[o])||0;glassA+=ag;
    if(aw>0){const Te=hrs.map(h=>{const I=HL.irr(SUN[h],deg);return To[h]+alpha*(I.b+I.d)/17;});walls=add(walls,lagged(Te,P.uw,aw));}
    if(ag>0){gcond=add(gcond,To.map(t=>P.ug*ag*(t-P.ti)));
      gsolRad=add(gsolRad,hrs.map(h=>{const I=HL.irr(SUN[h],deg);return ag*P.shgc*P.shade*(I.b+I.d);}));}
  });
  if(R.roof){const ra=num(R.roofA)>0?num(R.roofA):num(R.area);
    const Te=hrs.map(h=>{const I=HL.irr(SUN[h],null);return To[h]+alpha*(I.b+I.d)/17-3.9;});roof=lagged(Te,P.ur,ra);}
  const part=new Array(24).fill((num(R.part)||0)*P.uw*(num(R.pdt)||0));
  const act=HL.ACT[R.act]||HL.ACT.office,occ=hrs.map(h=>HL.on(P,R,h)?1:0),n=num(R.people)||0,A=num(R.area)||0,V=A*(num(R.ht)||0);
  const pS=occ.map(o=>o*n*act[0]),pL=occ.map(o=>o*n*act[1]),lt=occ.map(o=>o*A*(num(R.lights)||0)),eq=occ.map(o=>o*A*(num(R.equip)||0));
  const F=HL.RADF,rad=hrs.map(h=>gsolRad[h]+F.people*pS[h]+F.lights*lt[h]+F.equip*eq[h]),radCool=HL.delay(rad,M.r);
  // split delayed radiant back to its sources for the breakdown (proportional to daily totals)
  const tot=a=>a.reduce((x,y)=>x+y,0),RT=tot(rad)||1,share=a=>radCool.map(x=>x*tot(a)/RT);
  const gsol=share(gsolRad),people=add(pS.map(x=>x*(1-F.people)),share(pS.map(x=>x*F.people))),
        lights=add(lt.map(x=>x*(1-F.lights)),share(lt.map(x=>x*F.lights))),equip=add(eq.map(x=>x*(1-F.equip)),share(eq.map(x=>x*F.equip)));
  const infL=(num(R.ach)||0)*V/3.6,infS=To.map(t=>1.23*infL*(t-P.ti)),infLat=new Array(24).fill(3010*infL*dW);
  const oaL=n*P.rp+A*P.ra,oaS=hrs.map(h=>occ[h]*1.23*oaL*(To[h]-P.ti)),oaLat=occ.map(o=>o*3010*oaL*dW);
  const sf=1+(P.sf||0)/100;
  const sens=hrs.map(h=>(walls[h]+roof[h]+gcond[h]+gsol[h]+part[h]+people[h]+lights[h]+equip[h]+infS[h])*sf);
  const lat=hrs.map(h=>(pL[h]+infLat[h])*sf);
  const oa=hrs.map(h=>(oaS[h]+oaLat[h])*sf),coil=hrs.map(h=>sens[h]+lat[h]+oa[h]);
  const pk=coil.indexOf(Math.max(...coil)),pkS=sens.indexOf(Math.max(...sens));
  return{walls,roof,gcond,gsol,part,people,peopleL:pL,lights,equip,infS,infLat,oaS,oaLat,sens,lat,oa,coil,pk,pkS,sf,
    area:A,oaL,supply:Math.max(0,sens[pkS])/(1.23*P.dts),glassA};
};
HL.project=P=>{const rs=P.rooms.map(r=>({r,c:HL.room(P,r)}));
  if(HL.check(P)||P.rooms.some(r=>HL.checkRoom(r)))return{rs,block:[],bpk:0,peak:NaN,sumPk:NaN,area:NaN,supply:NaN,oaL:NaN};
  const block=[...Array(24).keys()].map(h=>rs.reduce((s,x)=>s+x.c.coil[h],0));
  const bpk=block.indexOf(Math.max(...block)),sumPk=rs.reduce((s,x)=>s+x.c.coil[x.c.pk],0);
  const area=rs.reduce((s,x)=>s+x.c.area,0),supply=rs.reduce((s,x)=>s+x.c.supply,0),oaL=rs.reduce((s,x)=>s+x.c.oaL,0);
  return{rs,block,bpk,peak:block[bpk]||0,sumPk,area,supply,oaL};
};
