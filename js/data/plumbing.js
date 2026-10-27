/* MEPify · Plumbing data: units, pipe materials, pipe tables and friction helpers
   by Mohamed Shafaf Karumannil */

/* ---------- PLUMBING ---------- */
const G=9.80665,RHO=998.2;
const PU={len:{"m":1,"ft":0.3048},sm:{"mm":0.001,"in":0.0254},flow:{"L/s":0.001,"L/min":1/60000,"m³/h":1/3600,"US GPM":6.30902e-5},vel:{"m/s":1,"ft/s":0.3048},head:{"m":1,"ft":0.3048},pres:{"kPa":1000,"bar":1e5,"psi":6894.757},vol:{"L":0.001,"US gal":0.00378541,"m³":1},dT:{"°C":1,"°F":5/9}};
const uu=k=>Object.keys(PU[k]);
const si=(v,id,k)=>num(v[id])*(PU[k][v[id+"_u"]]||1);
const NU={"20":1.004e-6,"40":0.658e-6,"60":0.474e-6,"80":0.365e-6};
const PMAT={cu:["Copper",0.0015,140],pvc:["PVC / CPVC",0.0015,150],ppr:["PPR / PEX / HDPE",0.007,150],st:["Steel",0.045,120],gi:["Galvanised",0.15,110],ci:["Cast iron",0.26,100]};
 // roughness mm, Hazen-Williams C
const PMOPTS=Object.keys(PMAT).map(k=>[k,PMAT[k][0]]);
const PSETS={};
(function(){
 const A=['1/2"','3/4"','1"','1-1/4"','1-1/2"','2"','2-1/2"','3"','4"','6"'];
 const SOD=[0.840,1.050,1.315,1.660,1.900,2.375,2.875,3.500,4.500,6.625],S40=[0.109,0.113,0.133,0.140,0.145,0.154,0.203,0.216,0.237,0.280],S80=[0.147,0.154,0.179,0.191,0.200,0.218,0.276,0.300,0.337,0.432];
 const COD=[0.625,0.875,1.125,1.375,1.625,2.125,2.625,3.125,4.125],CK=[0.049,0.065,0.065,0.065,0.072,0.083,0.095,0.109,0.134],CL=[0.040,0.045,0.050,0.055,0.060,0.070,0.080,0.090,0.110],CM=[0.028,0.032,0.035,0.042,0.049,0.058,0.065,0.072,0.095];
 const PR=[[20,3.4],[25,4.2],[32,5.4],[40,6.7],[50,8.3],[63,10.5],[75,12.5],[90,15.0],[110,18.3]];
 const add=(k,n,sz,od,w,inch)=>{const fc=inch?25.4:1;PSETS[k]={n,p:sz.map((s,i)=>{const o=od[i]*fc,t=w[i]*fc;return{s,od:o,w:t,id:o-2*t};})};};
 add("cuK","Copper K",A.slice(0,9),COD,CK,1);add("cuL","Copper L",A.slice(0,9),COD,CL,1);add("cuM","Copper M",A.slice(0,9),COD,CM,1);
 add("s40","Steel / PVC Sch 40",A,SOD,S40,1);add("s80","Steel / PVC Sch 80",A,SOD,S80,1);
 add("ppr","PPR PN20",PR.map(p=>p[0]+" mm"),PR.map(p=>p[0]),PR.map(p=>p[1]),0);
})();
const POPTS=Object.keys(PSETS).flatMap(k=>PSETS[k].p.map((p,i)=>[k+"|"+i,`${PSETS[k].n} ${p.s} · ID ${f(p.id,1)} mm`])).concat([["custom","Other: type the inside diameter"]]);
const pipeF=()=>[{id:"pipe",label:"Pipe",help:"Pick the pipe so the true inside diameter is used.",type:"select",def:"cuL|2",options:POPTS},
 {id:"pid",label:"Inside diameter",type:"num",def:"26",units:uu("sm"),udef:"mm",show:v=>v.pipe==="custom"}];
const pipeRef=v=>{if(v.pipe==="custom")return null;const[k,i]=String(v.pipe).split("|");return PSETS[k]&&PSETS[k].p[+i]?{k,i:+i,p:PSETS[k].p[+i]}:null;};
const pipeD=v=>{if(v.pipe==="custom")return si(v,"pid","sm");const r=pipeRef(v);return r?r.p.id/1000:NaN;};
const pipeName=v=>{const r=pipeRef(v);return r?`${PSETS[r.k].n} ${r.p.s} pipe`:`a ${f(pipeD(v)*1000,1)} mm bore pipe`;};
function darcy(Q,D,L,eps,nu){const A=Math.PI*D*D/4,V=Q/A,Re=V*D/nu,fr=Re<2300?64/Re:0.25/Math.pow(Math.log10(eps/(3.7*D)+5.74/Math.pow(Re,0.9)),2);return{A,V,Re,fr,hf:fr*(L/D)*V*V/(2*G)};}
const hazen=(Q,D,L,C)=>10.67*L*Math.pow(Q,1.852)/(Math.pow(C,1.852)*Math.pow(D,4.8704));
const vState=V=>V<0.6?{ok:false,text:"Low velocity"}:V<=2.4?{ok:true,text:"Velocity OK"}:V<=3?{ok:false,text:"High velocity"}:{ok:false,text:"Too fast"};
const vMsg=V=>V<0.6?"That is slow. Sediment and air can settle, so a smaller pipe may suit.":V<=2.4?"That is inside the usual 0.6 to 2.4 m/s (2 to 8 ft/s) range for water supply.":V<=3?"That is high. Expect noise and water hammer; keep hot copper lines under about 1.5 m/s.":"That is too fast. Erosion and noise are likely, so go up a pipe size.";
const FITS=[["e90","90° elbow",0.9,"6"],["e45","45° elbow",0.4,"2"],["tr","Tee, through run",0.6,"1"],["tb","Tee, through branch",1.8,"1"],["gv","Gate valve, open",0.2,"2"],["bv","Ball valve, open",0.05,"0"],["glv","Globe valve, open",10,"0"],["cv","Swing check valve",2.0,"1"]];
function ftin(n16){const neg=n16<0;n16=Math.abs(Math.round(n16));const ft=Math.floor(n16/192),r=n16-ft*192,inch=Math.floor(r/16),fr=r%16;let fs="";if(fr){let a=fr,b=16;while(a%2===0){a/=2;b/=2;}fs=`-${a}/${b}`;}return`${neg?"−":""}${ft}′ ${inch}${fs}″`;}
const SIXT=[...Array(16).keys()].map(i=>{if(!i)return["0","0"];let a=i,b=16;while(a%2===0){a/=2;b/=2;}return[String(i),`${a}/${b}`];});
