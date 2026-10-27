/* MEPify · Air side and water side sizing from the room loads
   by Mohamed Shafaf Karumannil */

/* ---------- AIR SIDE + WATER SIDE (sizing from the room loads) ---------- */
HL.defAir=()=>({esp:250,isp:350,effF:65,effM:90,vMain:7,vBranch:4.5,dh:300,nv:3,darea:12,gv:2,boxV:10,minVav:30,fcuEsp:50});
HL.defChw=()=>({sup:7,dt:5.5,nCh:2,sbCh:1,margin:5,run:150,fit:50,dpCh:60,dpCoil:50,dpVal:40,dpOth:30,effP:70});
HL.norm=P=>{P.air=Object.assign(HL.defAir(),P.air||{});P.chw=Object.assign(HL.defChw(),P.chw||{});if(!Array.isArray(P.ahus))P.ahus=[];if(P.fahu==null)P.fahu=false;
  P.rooms.forEach(r=>{if(!r.sys||(r.sys!=="fcu"&&!P.ahus.some(a=>a.id===r.sys)))r.sys="fcu";});return P;};
HL.MOTOR=[0.18,0.25,0.37,0.55,0.75,1.1,1.5,2.2,3,4,5.5,7.5,11,15,18.5,22,30,37,45,55,75,90,110,132,160,200,250,315,355,400];
HL.motor=kw=>HL.MOTOR.find(m=>m>=kw)||NaN;
HL.NECK=[150,200,250,300,350,400,450];
HL.GRILLE=[200,250,300,400,500,600];
HL.BOX=[100,125,150,200,250,300,350,400];
HL.FCU=[200,300,400,500,600,800,1000,1200,1400];
HL.PIPEX=PIPE.concat([["DN450",431.8],["DN500",482.6],["DN600",584.2]]);
/* round + rectangular duct for an airflow at a target velocity (equal-friction equivalent diameter) */
HL.duct=(Lps,v,hmax)=>{const D=Math.sqrt(4*Lps/1000/(Math.PI*v))*1000;const rd=ROUND.find(d=>d>=D);
  let h=Math.min(hmax,Math.max(150,Math.ceil(D/50)*50)),w=h;while(DE(w,h)<D&&w<4000)w+=50;if(w<h){const t=w;w=h;h=t;}
  return{D,round:rd||null,w,h};};
/* water pipe: Darcy-Weisbach + Swamee-Jain, steel 0.045 mm, water ~10 °C */
HL.fric=(Lps,idmm)=>{const D=idmm/1000,Q=Lps/1000,v=Q/(Math.PI*D*D/4),Re=v*D/1.31e-6,
  fd=Re<2300?64/Math.max(Re,1):0.25/Math.pow(Math.log10(0.045e-3/(3.7*D)+5.74/Math.pow(Re,0.9)),2);return{v,R:fd*1000*v*v/2/D};};
HL.pipe=Lps=>{for(const[dn,id]of HL.PIPEX){const r=HL.fric(Lps,id);if(r.R<=300&&r.v<=3)return Object.assign({dn,id},r);}return null;};
HL.checkSys=P=>{const a=P.air,w=P.chw,bad=(x,lo,hi)=>typeof x!=="number"||!isFinite(x)||x<lo||x>hi;
  if(bad(a.esp,0,3000)||bad(a.isp,0,3000))return "Check the fan static pressures (Air side settings).";
  if(bad(a.effF,10,100)||bad(a.effM,10,100)||bad(w.effP,10,100))return "Fan, motor and pump efficiencies must be 10 to 100 %.";
  if(bad(a.vMain,1,20)||bad(a.vBranch,1,20)||bad(a.nv,0.5,10)||bad(a.gv,0.5,10)||bad(a.boxV,2,25))return "Air velocities must be sensible values (Air side settings).";
  if(bad(a.dh,100,2000)||bad(a.darea,1,200)||bad(a.minVav,0,100)||bad(a.fcuEsp,0,500))return "Check the duct height, diffuser coverage, VAV minimum and FCU static (Air side settings).";
  if(bad(w.dt,1,20))return "Chilled water ΔT must be 1 to 20 K.";
  if(bad(w.nCh,1,20)||bad(w.sbCh,0,10)||w.nCh%1||w.sbCh%1)return "Number of chillers must be whole numbers (at least 1 duty).";
  if(bad(w.margin,0,100)||bad(w.run,0,10000)||bad(w.fit,0,500))return "Check the plant margin, pipe run and fittings allowance (Water side).";
  if([w.dpCh,w.dpCoil,w.dpVal,w.dpOth].some(x=>bad(x,0,1000)))return "Check the component pressure drops (Water side).";
  return "";};
HL.systems=P=>{
  HL.norm(P);
  const bad=HL.check(P)||(P.rooms.find(r=>HL.checkRoom(r))&&`${P.rooms.find(r=>HL.checkRoom(r)).name}: ${HL.checkRoom(P.rooms.find(r=>HL.checkRoom(r)))}`)||HL.checkSys(P);
  if(bad)return{bad};
  if(!P.rooms.length)return{bad:"Add rooms in the heat load first."};
  const A=P.air,W=P.chw,J=HL.project(P),hrs=[...Array(24).keys()],peakOf=a=>{const k=a.indexOf(Math.max(...a));return{k,v:a[k]};};
  const pad=n=>String(n).padStart(2,"0"),Wcoil=kw=>kw/(4.186*W.dt);
  const terminals=[];let fcuN=0,boxN=0;
  // fresh air unit for FCU rooms
  const fcuRooms=J.rs.filter(x=>x.r.sys==="fcu");
  let fahu=null;
  if(P.fahu&&fcuRooms.length){const h=hrs.map(t=>fcuRooms.reduce((s,x)=>s+x.c.oa[t],0)),pk=peakOf(h),q=fcuRooms.reduce((s,x)=>s+x.c.oaL,0);
    const tsp=A.esp+A.isp,shaft=q/1000*tsp/(A.effF/100)/1000;
    fahu={tag:"FAHU-1",q,kw:pk.v,pk:pk.k,hourly:h,tsp,shaft,motor:HL.motor(shaft*1.15),flow:Wcoil(pk.v/1000),pipe:HL.pipe(Wcoil(pk.v/1000)),duct:HL.duct(q,A.vMain,A.dh)};}
  // AHUs
  const ahus=P.ahus.map(a=>{
    const rs=J.rs.filter(x=>x.r.sys===a.id),tsp=(num(a.esp)>=0?num(a.esp):A.esp)+A.isp;
    if(!rs.length)return{a,rs,empty:true};
    const h=hrs.map(t=>rs.reduce((s,x)=>s+x.c.coil[t],0)),pk=peakOf(h),oa=rs.reduce((s,x)=>s+x.c.oaL,0);
    const q=a.type==="vav"?Math.max(...hrs.map(t=>rs.reduce((s,x)=>s+Math.max(0,x.c.sens[t]),0)))/(1.23*P.dts):rs.reduce((s,x)=>s+x.c.supply,0);
    const oaf=q>0?Math.min(1,oa/q):0,shaft=q/1000*tsp/(A.effF/100)/1000;
    return{a,rs,q,oa,oaf,kw:pk.v,pk:pk.k,hourly:h,tmix:P.ti+oaf*(P.db-P.ti),toff:P.ti-P.dts,tsp,shaft,motor:HL.motor(shaft*1.15),
      flow:Wcoil(pk.v/1000),pipe:HL.pipe(Wcoil(pk.v/1000)),duct:HL.duct(q,A.vMain,A.dh)};});
  // room terminals: FCU or box, diffusers, return grilles, branch duct
  J.rs.forEach(({r,c},i)=>{
    const q=c.supply,t={r,c,q,branch:HL.duct(q,A.vBranch,A.dh)};
    const qmax=(HL.NECK[HL.NECK.length-1]/1000)**2*A.nv*1000;
    t.nd=Math.max(1,Math.ceil(c.area/A.darea),Math.ceil(q/qmax));t.qd=q/t.nd;
    t.neck=HL.NECK.find(n=>t.qd<=(n/1000)**2*A.nv*1000)||HL.NECK[HL.NECK.length-1];
    const gmax=(HL.GRILLE[HL.GRILLE.length-1]/1000)**2*A.gv*1000;t.ng=Math.max(1,Math.ceil(q/gmax));t.qg=q/t.ng;
    t.grille=HL.GRILLE.find(g=>t.qg<=(g/1000)**2*A.gv*1000)||HL.GRILLE[HL.GRILLE.length-1];
    if(r.sys==="fcu"){fcuN++;const load=P.fahu?hrs.map(h=>c.sens[h]+c.lat[h]):c.coil,pk=peakOf(load),cfm=q*2.119;
      t.kind="FCU";t.tag="FCU-"+pad(fcuN);t.kw=pk.v;t.pk=pk.k;t.cfm=cfm;t.size=HL.FCU.find(s=>s>=cfm);t.units=t.size?1:Math.ceil(cfm/HL.FCU[HL.FCU.length-1]);
      if(!t.size)t.size=HL.FCU.find(s=>s>=cfm/t.units);t.flow=Wcoil(pk.v/1000);t.pipe=HL.pipe(t.flow/t.units);t.esp=A.fcuEsp;}
    else{boxN++;const ah=ahus.find(x=>x.a.id===r.sys);t.kind=ah.a.type==="vav"?"VAV":"CAV";t.tag=t.kind+"-"+pad(boxN);t.ahu=ah.a.name;
      t.inlet=HL.BOX.find(d=>q/1000/(Math.PI*(d/1000)**2/4)<=A.boxV);t.inV=t.inlet?q/1000/(Math.PI*(t.inlet/1000)**2/4):NaN;
      t.qmin=t.kind==="VAV"?Math.min(q,Math.max(A.minVav/100*q,ah.oaf>0?c.oaL/ah.oaf:0)):q;}
    terminals.push(t);});
  // plant: every coil, hour by hour (FAHU + FCUs + AHUs = the project block)
  const plantH=hrs.map(t=>J.block[t]),ppk=peakOf(plantH),plant=ppk.v*(1+W.margin/100),flow=Wcoil(plant/1000);
  const nC=W.nCh,chiller={each:plant/nC,n:nC,sb:W.sbCh,flowEach:flow/nC};
  const header=HL.pipe(flow),fr=header?header.R*W.run*(1+W.fit/100):NaN;
  const headPa=fr+(W.dpCh+W.dpCoil+W.dpVal+W.dpOth)*1000,headM=headPa/9810;
  const pumpShaft=chiller.flowEach/1000*headPa/(W.effP/100)/1000;
  const pump={n:nC,sb:W.sbCh,flowEach:chiller.flowEach,headM,headPa,fricPa:fr,shaft:pumpShaft,motor:HL.motor(pumpShaft*1.15),pipeEach:HL.pipe(chiller.flowEach)};
  return{J,ahus,fahu,terminals,plant,plantPk:ppk.k,plantH,flow,header,chiller,pump};
};
