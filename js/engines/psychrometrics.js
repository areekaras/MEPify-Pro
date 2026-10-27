/* MEPify · Psychrometrics engine (ASHRAE Fundamentals, SI) and chart
   by Mohamed Shafaf Karumannil */

/* ---------- PSYCHROMETRICS (ASHRAE Fundamentals, SI) ---------- */
const PSY={
  p:alt=>101.325*Math.pow(1-2.25577e-5*(alt||0),5.2559), // kPa
  pws:t=>{const T=t+273.15;let l;
    if(t<0)l=-5.6745359e3/T+6.3925247-9.677843e-3*T+6.2215701e-7*T*T+2.0747825e-9*T**3-9.484024e-13*T**4+4.1635019*Math.log(T);
    else l=-5.8002206e3/T+1.3914993-4.8640239e-2*T+4.1764768e-5*T*T-1.4452093e-8*T**3+6.5459673*Math.log(T);
    return Math.exp(l)/1000;},
  Wpw:(pw,p)=>0.621945*pw/(p-pw),
  pwW:(W,p)=>W*p/(0.621945+W),
  h:(t,W)=>1.006*t+W*(2501+1.86*t),
  tHW:(h,W)=>(h-2501*W)/(1.006+1.86*W),
  v:(t,W,p)=>0.287042*(t+273.15)*(1+1.607858*W)/p,
  Wwb:(t,tw,p)=>{const Ws=PSY.Wpw(PSY.pws(tw),p);
    return tw>=0?((2501-2.326*tw)*Ws-1.006*(t-tw))/(2501+1.86*t-4.186*tw):((2830-0.24*tw)*Ws-1.006*(t-tw))/(2830+1.86*t-2.1*tw);},
  bis:(f,a,b)=>{let fa=f(a);for(let i=0;i<80;i++){const m=(a+b)/2,fm=f(m);if((fm>0)===(fa>0)){a=m;fa=fm}else b=m;}return (a+b)/2;},
  dew:(pw)=>PSY.bis(x=>PSY.pws(x)-pw,-80,100),
  wb:(t,W,p)=>PSY.bis(x=>PSY.Wwb(t,x,p)-W,-60,t),
  state(t,W,p){const pw=PSY.pwW(W,p),ps=PSY.pws(t),v=PSY.v(t,W,p);
    return{t,W,p,pw,rh:pw/ps*100,h:PSY.h(t,W),v,rho:(1+W)/v,td:PSY.dew(pw),tw:PSY.wb(t,W,p),Wsat:PSY.Wpw(ps,p)};},
  fromRH(t,rh,p){return PSY.state(t,PSY.Wpw(PSY.pws(t)*rh/100,p),p);}
};
const g1=x=>f(x*1000,2);
function psyRows(S){return[["Relative humidity",f(S.rh,1),"%"],["Wet bulb",f(S.tw,1),"°C"],["Dew point",f(S.td,1),"°C"],["Moisture",g1(S.W),"g/kg"],["Enthalpy",f(S.h,2),"kJ/kg"],["Specific volume",f(S.v,3),"m³/kg"],["Air density",f(S.rho,3),"kg/m³"],["Vapour pressure",f(S.pw,3),"kPa"]];}
/* mini psychrometric chart: pts=[{S,label}], lines=[[i,j]] */
function psyChart(pts,lines,p){
  const W=340,H=240,L=34,R=W-30,T=22,B=H-30;
  let tmin=0,tmax=50,wmax=30;
  pts.forEach(o=>{tmin=Math.min(tmin,Math.floor(o.S.t/5)*5-5);tmax=Math.max(tmax,Math.ceil(o.S.t/5)*5+5);wmax=Math.max(wmax,Math.ceil(o.S.W*1000/5)*5+5);});
  const X=t=>L+(t-tmin)/(tmax-tmin)*(R-L),Y=w=>B-w/wmax*(B-T);
  const curve=rh=>{let d="";for(let t=tmin;t<=tmax+0.01;t+=0.5){const w=PSY.Wpw(PSY.pws(t)*rh/100,p)*1000;if(w>wmax){break}d+=(d?"L":"M")+X(t).toFixed(1)+" "+Y(w).toFixed(1);}return d;};
  let g="";
  for(let t=tmin;t<=tmax;t+=10)g+=`<line x1="${X(t)}" y1="${T}" x2="${X(t)}" y2="${B}" stroke="var(--line)"/><text x="${X(t)}" y="${B+14}" text-anchor="middle" font-size="10" fill="var(--muted)">${t}</text>`;
  for(let w=0;w<=wmax;w+=10)g+=`<line x1="${L}" y1="${Y(w)}" x2="${R}" y2="${Y(w)}" stroke="var(--line)"/><text x="${R+4}" y="${Y(w)+3}" font-size="10" fill="var(--muted)">${w}</text>`;
  [20,40,60,80].forEach(rh=>{g+=`<path d="${curve(rh)}" fill="none" stroke="var(--cool)" stroke-opacity=".35" stroke-width="1"/>`;});
  g+=`<path d="${curve(100)}" fill="none" stroke="var(--cool)" stroke-width="2"/>`;
  lines.forEach(([i,j])=>{const a=pts[i].S,b=pts[j].S;g+=`<line x1="${X(a.t)}" y1="${Y(a.W*1000)}" x2="${X(b.t)}" y2="${Y(b.W*1000)}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 3"/>`;});
  pts.forEach(o=>{const x=X(o.S.t),y=Y(o.S.W*1000);let left=o.pos==="l"||(o.pos!=="b"&&x>R-40),ly=o.pos==="b"?y+17:y-9,lx=left?x-8:x+8;
    g+=`<circle cx="${x}" cy="${y}" r="5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/><text x="${lx}" y="${ly}" font-size="11" font-weight="600" fill="var(--ink)" text-anchor="${left?"end":"start"}">${o.label}</text>`;});
  g+=`<text x="${(L+R)/2}" y="${H-2}" text-anchor="middle" font-size="10" fill="var(--muted)">Dry bulb °C</text><text x="${R+4}" y="${T-10}" font-size="10" fill="var(--muted)">g/kg</text>`;
  return `<div class="card" style="padding:12px"><div class="lbl" style="font-size:13px">Psychrometric chart</div><svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="Psychrometric chart with the state points">${g}</svg><p class="note">Dark curve is saturation (100 % RH). Faint curves are 20, 40, 60 and 80 % RH.</p></div>`;
}
