/* MEPify · Commissioning & TAB tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
/* ===== TAB & commissioning ===== */
{id:"trav",g:"tab",icon:"trav",name:"Pitot traverse",short:"Duct airflow from velocity pressure",
 intro:"Enter the duct size to get the test points, then type your readings in order. Airflow is worked out by the log-Tchebycheff method.",
 fields:[
  {id:"shape",label:"Duct shape",type:"chips",def:"rect",options:[["rect","Rectangular"],["round","Round"]]},
  {id:"W",label:"Width",type:"num",def:"600",unit:"mm",half:true,show:v=>v.shape==="rect"},
  {id:"H",label:"Height",type:"num",def:"400",unit:"mm",half:true,show:v=>v.shape==="rect"},
  {id:"D",label:"Diameter",type:"num",def:"400",unit:"mm",show:v=>v.shape==="round"},
  {id:"mode",label:"Readings are",type:"chips",def:"pv",options:[["pv","Velocity pressure (Pa)"],["v","Velocity (m/s)"]]},
  {id:"r",label:"Readings",help:"Type every point in order, separated by spaces or commas.",type:"text",def:"18 21 22 20 17 20 23 24 22 19 21 24 25 23 20 19 22 23 21 18 16 19 20 18 15"},
  {id:"T",label:"Air temperature in duct",type:"num",def:"14",unit:"°C",half:true},
  {id:"Qd",label:"Design airflow",type:"num",def:"5000",units:["m³/h","CFM","L/s"],udef:"m³/h"}
 ],
 calc(v){
  let A,rows,cols,depths,pos;
  if(v.shape==="round"){const D=num(v.D);if(!(D>0))return{hint:"Enter the duct diameter."};const n=nRoundP(D);A=Math.PI*D*D/4e6;rows=2;cols=n;depths=LRD[n].map(x=>x*D);}
  else{const W=num(v.W),H=num(v.H);if(!(W>0&&H>0))return{hint:"Enter the duct width and height."};cols=nRectP(W);rows=nRectP(H);A=W*H/1e6;pos=LTR[cols].map(x=>x*W);depths=LTR[rows].map(x=>x*H);}
  const N=rows*cols,T=num(v.T),rho=isFinite(T)?1.2041*293.15/(273.15+T):1.2,r=numsOf(v.r);
  const geo=v.shape==="round"?tbl(["Point","Depth from wall (mm)"],depths.map((d,i)=>[i+1,f(d,0)])):
   tbl(["","Position (mm)"],[...pos.map((p,i)=>["Hole "+(i+1)+" across width",f(p,0)]),...depths.map((d,i)=>["Depth "+(i+1)+" into duct",f(d,0)])]);
  const need=`${N} points: ${v.shape==="round"?`2 holes 90° apart × ${cols} depths`:`${cols} holes × ${rows} depths`}`;
  if(!r.length)return{hint:`Enter your readings. You need ${need}.`,after:geo};
  const vs=r.map(x=>v.mode==="pv"?(x>0?Math.sqrt(2*x/rho):0):Math.max(0,x)),neg=r.filter(x=>x<=0).length;
  const va=vs.reduce((a,b)=>a+b,0)/vs.length,Q=va*A,Qd=airQ(v,"Qd"),pct=Q/Qd*100;
  return{cap:"Measured airflow",value:f(Q*3600,0),unit:"m³/h",status:r.length===N?{ok:Math.abs(pct-100)<=10||!isFinite(pct),text:isFinite(pct)?`${f(pct,0)} % of design`:"Complete"}:{ok:false,text:`${r.length} of ${N} points entered`},
   say:`Average velocity ${B(f(va,2),"m/s")} over ${f(A,3)} m² gives ${B(f(Q*1000,0),"L/s")} (${f(Q*2118.88,0)} CFM).`+(isFinite(pct)?` That is ${B(f(pct,0),"%")} of design.`:"")+(neg?` ${neg} point(s) read zero or negative: swirl or reverse flow there, note it in the report.`:"")+(r.length!==N?` You need ${need}.`:""),
   rows:[["Airflow",f(Q*1000,0),"L/s"],["Airflow",f(Q*2118.88,0),"CFM"],["Average velocity",f(va,2),"m/s"],["Air density used",f(rho,3),"kg/m³"],["Points",`${r.length} / ${N}`,""]],after:geo};
 },
 note:"Average √Pv, not Pv. Choose a straight run about 7.5 diameters after and 3 before any fitting. Velocity = √(2 Pv ÷ ρ)."},

{id:"travpts",g:"tab",icon:"travpts",name:"Duct traverse points",short:"Log-Tchebycheff or equal-area points and airflow",
 intro:"Pick the method and enter the duct size. You get where to put every test point. Then type the velocity readings in order to get the airflow in L/s, m³/h and CFM.",
 fields:[
  {id:"meth",label:"Method",type:"chips",def:"lt",options:[["lt","Log-Tchebycheff"],["ea","Equal area"]]},
  {id:"shape",label:"Duct shape",type:"chips",def:"rect",options:[["rect","Rectangular"],["round","Round"]]},
  {id:"W",label:"Width",type:"num",def:"600",units:["mm","in"],udef:"mm",half:true,show:v=>v.shape==="rect"},
  {id:"H",label:"Height",type:"num",def:"400",units:["mm","in"],udef:"mm",half:true,show:v=>v.shape==="rect"},
  {id:"D",label:"Diameter",type:"num",def:"400",units:["mm","in"],udef:"mm",show:v=>v.shape==="round"},
  {id:"nlr",label:"Points per side",help:"Auto follows ASHRAE 111 for each side: 5 below 760 mm, 6 up to 915 mm, 7 above.",type:"chips",def:"a",options:[["a","Auto"],["5","5"],["6","6"],["7","7"]],adv:true,show:v=>v.meth!=="ea"&&v.shape==="rect"},
  {id:"nlc",label:"Points per diameter",help:"Auto: 6 up to 250 mm, 8 up to 600 mm, 10 above.",type:"chips",def:"a",options:[["a","Auto"],["6","6"],["8","8"],["10","10"]],adv:true,show:v=>v.meth!=="ea"&&v.shape==="round"},
  {id:"ner",label:"Points per side",help:"Auto keeps points no more than 150 mm apart, with 4 to 8 per side.",type:"chips",def:"a",options:[["a","Auto"],["4","4"],["5","5"],["6","6"],["7","7"],["8","8"]],adv:true,show:v=>v.meth==="ea"&&v.shape==="rect"},
  {id:"nec",label:"Equal-area rings",help:"Auto: 3 rings up to 300 mm, 4 up to 600 mm, 5 up to 1200 mm, 6 above. Each ring gives 2 points on every diameter.",type:"chips",def:"a",options:[["a","Auto"],["3","3"],["4","4"],["5","5"],["6","6"]],adv:true,show:v=>v.meth==="ea"&&v.shape==="round"},
  {id:"vu",label:"Velocity readings in",type:"chips",def:"ms",options:[["ms","m/s"],["fpm","fpm"]]},
  {id:"r",label:"Velocity readings",help:"Type every point in order, separated by spaces or commas. Rectangular: hole 1 from the top down, then hole 2, and so on. Round: the first diameter wall to wall, then the second.",type:"text",def:"4.6 5.1 5.3 5.0 4.4 4.9 5.5 5.7 5.4 4.8 5.0 5.6 5.8 5.5 4.9 4.8 5.4 5.6 5.3 4.7 4.3 4.9 5.1 4.8 4.2"},
  {id:"Qd",label:"Design airflow",help:"Optional. Leave blank to skip the % of design check.",type:"num",def:"4300",units:["m³/h","CFM","L/s"],udef:"m³/h",adv:true}
 ],
 calc(v){
  const mm=id=>{const x=num(v[id]);return v[id+"_u"]==="in"?x*25.4:x;},lt=v.meth!=="ea",round=v.shape==="round";
  const ins=x=>f(x/25.4,2);
  let A,cols,rows,dep,pos=[],need;
  if(round){
   const D=mm("D");if(!(D>0))return{hint:"Enter the duct diameter."};A=Math.PI*D*D/4e6;
   let fr;
   if(lt){fr=LRD[v.nlc==="a"?nRoundP(D):+v.nlc];}
   else{const k=v.nec==="a"?(D<=300?3:D<=600?4:D<=1200?5:6):+v.nec,rr=[];for(let i=1;i<=k;i++)rr.push(Math.sqrt((2*i-1)/(2*k)));
    fr=[...rr.slice().reverse().map(x=>(1-x)/2),...rr.map(x=>(1+x)/2)];}
   dep=fr.map(x=>x*D);rows=fr.length;cols=2;need=`${2*rows} points: 2 diameters 90° apart × ${rows} points each`;
  }else{
   const W=mm("W"),H=mm("H");if(!(W>0&&H>0))return{hint:"Enter the duct width and height."};A=W*H/1e6;
   let nw,nh,fw,fh;
   if(lt){nw=v.nlr==="a"?nRectP(W):+v.nlr;nh=v.nlr==="a"?nRectP(H):+v.nlr;fw=LTR[nw];fh=LTR[nh];}
   else{const ea=s=>Math.min(8,Math.max(4,Math.ceil(s/150))),g=n=>Array.from({length:n},(_,i)=>(2*i+1)/(2*n));
    nw=v.ner==="a"?ea(W):+v.ner;nh=v.ner==="a"?ea(H):+v.ner;fw=g(nw);fh=g(nh);}
   pos=fw.map(x=>x*W);dep=fh.map(x=>x*H);cols=nw;rows=nh;need=`${nw*nh} points: ${nw} holes across the width × ${nh} depths`;
  }
  const N=cols*rows,mth=lt?"log-Tchebycheff":"equal-area",fpm=v.vu==="fpm",r=numsOf(v.r);
  const layout=round
   ?tbl(["Point","From wall (mm)","(in)"],dep.map((d,i)=>[i+1,f(d,0),ins(d)]))
   :tbl(["","From edge (mm)","(in)"],[...pos.map((p,i)=>["Hole "+(i+1)+" across width",f(p,0),ins(p)]),...dep.map((d,i)=>["Depth "+(i+1)+" into duct",f(d,0),ins(d)])]);
  const grid=()=>{const hd=round?["From wall (mm)","Diameter 1","Diameter 2"]:["Depth (mm)",...pos.map((_,i)=>"H"+(i+1))];
   return tbl(hd,dep.map((d,j)=>[f(d,0),...Array.from({length:cols},(_,c)=>{const x=r[c*rows+j];return x==null?"—":f(x,fpm?0:2);})]));};
  if(!r.length)return{hint:`Enter your velocity readings. The ${mth} method needs ${need}.`,after:layout};
  const vs=r.map(x=>Math.max(0,fpm?x*0.00508:x)),neg=r.filter(x=>x<=0).length;
  const va=vs.reduce((a,b)=>a+b,0)/vs.length,mx=Math.max(...vs),mn=Math.min(...vs),Q=va*A;
  const good=vs.filter(x=>x>0.1*mx).length/vs.length,Qd=airQ(v,"Qd"),pct=Q/Qd*100,hasD=isFinite(pct)&&Qd>0;
  const done=r.length===N;
  const status=!done?{ok:false,text:`${r.length} of ${N} points entered`}:hasD?{ok:Math.abs(pct-100)<=10,text:`${f(pct,0)} % of design`}:{ok:true,text:`All ${N} points entered`};
  return{cap:"Measured airflow",value:f(Q*1000,0),unit:"L/s",status,
   say:`${mth[0].toUpperCase()+mth.slice(1)} traverse: average velocity ${B(f(va,2),"m/s")} over ${f(A,3)} m² gives ${B(f(Q*1000,0),"L/s")} = ${B(f(Q*3600,0),"m³/h")} = ${B(f(Q*2118.88,0),"CFM")}.`
    +(hasD?` That is ${B(f(pct,0),"%")} of design.`:"")
    +(done?"":` You need ${need}.`)
    +(neg?` ${neg} point(s) read zero or negative: swirl or reverse flow there, note it in the report.`:"")
    +(good<0.75?" Fewer than 75 % of points are above 10 % of the highest reading, so this plane is poor. Move to a straighter run if you can.":""),
   rows:[["Airflow",f(Q*3600,0),"m³/h"],["Airflow",f(Q*2118.88,0),"CFM"],["Average velocity",f(va,2),"m/s"],["Average velocity",f(va/0.00508,0),"fpm"],
    ["Duct area",f(A,4),"m²"],["Highest / lowest point",`${f(mx,2)} / ${f(mn,2)}`,"m/s"],["Points above 10 % of max",f(good*100,0),"%"],["Points",`${r.length} / ${N}`,""]],
   after:layout+grid()};
 },
 note:"Log-Tchebycheff (ASHRAE 111, ISO 3966) places points to allow for slower air near the walls, so a plain average gives the flow with fewer points. Equal area divides the duct into equal rectangles (centres no more than 150 mm apart) or equal-area rings in round ducts (EPA Method 1 positions) and averages all points. Traverse a straight run about 7.5 diameters after and 3 before any fitting. Q = V<sub>avg</sub> × A; 1 m³/s = 1000 L/s = 3600 m³/h = 2118.88 CFM. ASHRAE: at least 75 % of readings should be above 10 % of the highest one."},

{id:"bal",g:"tab",icon:"bal",name:"Terminal balancing",short:"Proportional method: % and targets",
 intro:"Enter design and measured airflow for each terminal in the same order. You get each terminal's % of design, the index terminal and the reading to set the others to.",
 fields:[
  {id:"d",label:"Design airflow for each terminal",help:"Same unit for both lists, separated by spaces or commas.",type:"text",def:"300 300 250 250 200 200"},
  {id:"m",label:"Measured airflow for each terminal",type:"text",def:"340 320 230 260 170 210"},
  {id:"tol",label:"Terminal tolerance",type:"num",def:"10",unit:"± %",adv:true}
 ],
 calc(v){
  const d=numsOf(v.d),m=numsOf(v.m),tol=num(v.tol)||10;
  if(!d.length)return{hint:"Enter the design airflow for each terminal."};if(m.length!==d.length)return{hint:`Enter ${d.length} measured readings, one for each design value. You have ${m.length}.`};
  const p=m.map((x,i)=>x/d[i]*100),ix=p.indexOf(Math.min(...p)),pi=p[ix],tD=d.reduce((a,b)=>a+b,0),tM=m.reduce((a,b)=>a+b,0),out=p.filter(x=>Math.abs(x-100)>tol).length;
  const rows=d.map((x,i)=>({cls:i===ix?"sel":"",c:[i+1,f(x,0),f(m[i],0),f(p[i],0)+" %",i===ix?"Index: leave open":f(x*pi/100,0),Math.abs(p[i]-100)<=tol?"OK":"Adjust"]}));
  return{cap:"Index terminal",value:"#"+(ix+1),unit:`${f(pi,0)} % of design`,status:{ok:out===0,text:out?`${out} terminal(s) outside ±${tol} %`:"All within tolerance"},
   say:`Total is ${B(f(tM/tD*100,0),"%")} of design. Terminal ${ix+1} is the index (lowest %), so leave its damper open and set each other terminal to the target in the table, so all read about ${f(pi,0)} %. Then raise the fan until they all reach 100 %.`+(tM/tD<1?" The fan total is below design, so fix the fan first.":""),
   rows:[["Total design",f(tD,0),""],["Total measured",f(tM,0),""],["Total % of design",f(tM/tD*100,1),"%"]],
   after:tbl(["#","Design","Measured","% design","Set to","Status"],rows)};
 },
 note:"Proportional balancing (NEBB / AABC): set every terminal to the same % as the index, then adjust the fan. Typical tolerance ±10 % per terminal, 0 to +10 % for the total."},

{id:"fanlaw",g:"tab",icon:"fanlaw",name:"Fan laws",short:"New flow, pressure and power with speed",
 intro:"Enter what the fan does now and the new speed, or the airflow you need. You get the new speed, pressure, power and pulley size.",
 fields:[
  {id:"mode",label:"What do you know?",type:"chips",def:"q",options:[["q","Airflow I need"],["n","The new speed"]]},
  {id:"Q1",label:"Airflow now",type:"num",def:"4200",units:["m³/h","CFM","L/s"],udef:"m³/h"},
  {id:"P1",label:"Static pressure now",type:"num",def:"350",unit:"Pa",half:true},
  {id:"W1",label:"Motor power now",type:"num",def:"3.2",unit:"kW",half:true},
  {id:"N1",label:"Fan speed now",type:"num",def:"950",unit:"rpm"},
  {id:"Q2",label:"Airflow needed",type:"num",def:"5000",units:["m³/h","CFM","L/s"],udef:"m³/h",show:v=>v.mode==="q"},
  {id:"N2",label:"New fan speed",type:"num",def:"1050",unit:"rpm",show:v=>v.mode==="n"},
  {id:"dm",label:"Motor pulley diameter",type:"num",def:"160",unit:"mm",adv:true,half:true},
  {id:"Wm",label:"Motor rated power",type:"num",def:"5.5",unit:"kW",adv:true,half:true}
 ],
 calc(v){
  const Q1=airQ(v,"Q1"),P1=num(v.P1),W1=num(v.W1),N1=num(v.N1);if(!(Q1>0&&N1>0))return{hint:"Enter the airflow and fan speed now."};
  let r;if(v.mode==="q"){const Q2=airQ(v,"Q2");if(!(Q2>0))return{hint:"Enter the airflow you need."};r=Q2/Q1;}else{const N2=num(v.N2);if(!(N2>0))return{hint:"Enter the new speed."};r=N2/N1;}
  const N2=N1*r,Q2=Q1*r,P2=P1*r*r,W2=W1*r**3,dm=num(v.dm),Wm=num(v.Wm),over=Wm>0&&W2>Wm;
  return{cap:"New fan speed",value:f(N2,0),unit:"rpm",status:Wm>0?{ok:!over,text:over?"Motor too small":"Motor OK"}:null,
   say:`At ${B(f(N2,0),"rpm")} the fan gives ${B(f(Q2*3600,0),"m³/h")} at ${f(P2,0)} Pa and needs about ${B(f(W2,2),"kW")}.`+(dm>0?` With the motor fixed, change the motor pulley from ${f(dm,0)} to ${B(f(dm*r,0),"mm")}.`:"")+(over?` That is more than the ${f(Wm,1)} kW motor, so a bigger motor is needed.`:""),
   rows:[["Speed change",f((r-1)*100,1),"%"],["New airflow",f(Q2*1000,0),"L/s"],["New static pressure",f(P2,0),"Pa"],["New power",f(W2,2),"kW"],["New motor pulley",dm>0?f(dm*r,0):"—","mm"]]};
 },
 note:"Q ∝ N, P ∝ N², power ∝ N³. Valid for the same fan and system. Check the motor current and belt after any speed change."},

{id:"leak",g:"tab",icon:"leak",name:"Duct leakage test",short:"Allowable leakage and pass / fail",
 intro:"Enter the duct surface area, test pressure, leakage class and the leakage you measured.",
 fields:[
  {id:"std",label:"Standard",type:"chips",def:"en",options:[["en","EN 1507 / DW 144"],["sm","SMACNA"]]},
  {id:"cls",label:"Air tightness class",type:"chips",def:"0.009",options:[["0.027","A"],["0.009","B"],["0.003","C"],["0.001","D"]],show:v=>v.std==="en"},
  {id:"cl",label:"SMACNA leakage class",type:"chips",def:"6",options:[["3","CL 3"],["6","CL 6"],["12","CL 12"],["24","CL 24"],["48","CL 48"]],show:v=>v.std==="sm"},
  {id:"A",label:"Duct surface area tested",type:"num",def:"120",units:["m²","ft²"],udef:"m²"},
  {id:"P",label:"Test pressure",type:"num",def:"400",unit:"Pa"},
  {id:"L",label:"Measured leakage",help:"Leave blank to see only the allowance.",type:"num",def:"55",units:["L/s","m³/h","CFM"],udef:"L/s"}
 ],
 calc(v){
  let A=num(v.A);const P=num(v.P);if(!(A>0))return{hint:"Enter the duct surface area."};if(!(P>0))return{hint:"Enter the test pressure."};if(v.A_u==="ft²")A*=0.092903;
  let allow;if(v.std==="sm"){const cl=num(v.cl);allow=cl*Math.pow(P/249.089,0.65)*(A/0.092903/100)*0.471947;}else allow=num(v.cls)*Math.pow(P,0.65)*A*1;
  const Lm=num(v.L)*({"L/s":1,"m³/h":1/3.6,"CFM":0.471947}[v.L_u]||1),has=isFinite(Lm),ok=Lm<=allow;
  return{cap:"Allowable leakage",value:f(allow,1),unit:"L/s",status:has?{ok,text:ok?"Pass":"Fail"}:null,
   say:`At ${f(P)} Pa, ${f(A,1)} m² of duct may leak up to ${B(f(allow,1),"L/s")} (${f(allow/A,3)} L/s per m²).`+(has?` You measured ${B(f(Lm,1),"L/s")}, which is ${f(Lm/allow*100,0)} % of the allowance.`:""),
   rows:[["Allowance",f(allow*3.6,1),"m³/h"],["Allowance",f(allow*2.11888,1),"CFM"],["Per m²",f(allow/A,4),"L/s·m²"],["Measured",has?f(Lm,1):"—","L/s"]]};
 },
 note:"EN 1507: f = c × p^0.65 L/s per m² (A 0.027, B 0.009, C 0.003, D 0.001). SMACNA: F = CL × P^0.65 CFM per 100 ft² with P in inWG. Test at the pressure in your spec."},

{id:"press",g:"tab",icon:"press",name:"Room pressurisation",short:"Air needed to hold +25 or +50 Pa",
 intro:"Work out the extra air needed to hold a room at a set pressure, from its leakage paths or from a pressure you measured.",
 fields:[
  {id:"mode",label:"Method",type:"chips",def:"leak",options:[["leak","From leakage paths"],["meas","Scale from a reading"]]},
  {id:"P",label:"Target pressure",type:"num",def:"50",unit:"Pa",presets:[["12.5","12.5"],["25","25"],["50","50 (LER / substation)"]]},
  {id:"sd",label:"Single doors",type:"num",def:"2",unit:"doors",half:true,show:v=>v.mode==="leak"},
  {id:"dd",label:"Double doors",type:"num",def:"1",unit:"doors",half:true,show:v=>v.mode==="leak"},
  {id:"ox",label:"Other leakage area",help:"Cable transits, ceiling, wall cracks. Typical 0.005–0.02 m² per room.",type:"num",def:"0.01",unit:"m²",show:v=>v.mode==="leak"},
  {id:"sf",label:"Safety margin",type:"num",def:"25",unit:"%",adv:true,show:v=>v.mode==="leak"},
  {id:"P1",label:"Pressure you measured",type:"num",def:"28",unit:"Pa",half:true,show:v=>v.mode==="meas"},
  {id:"Q1",label:"Net air at that time",help:"Supply minus return and exhaust.",type:"num",def:"180",units:["L/s","m³/h","CFM"],udef:"L/s",half:true,show:v=>v.mode==="meas"}
 ],
 calc(v){
  const P=num(v.P);if(!(P>0))return{hint:"Enter the target pressure."};
  if(v.mode==="meas"){const P1=num(v.P1),Q1=num(v.Q1)*({"L/s":1,"m³/h":1/3.6,"CFM":0.471947}[v.Q1_u]||1);if(!(P1>0&&Q1>0))return{hint:"Enter the pressure and net air you measured."};
   const Q2=Q1*Math.sqrt(P/P1);return{cap:"Net air needed",value:f(Q2,0),unit:"L/s",
    say:`Leakage flow rises with √pressure. To go from ${f(P1)} to ${f(P)} Pa, raise the net air from ${f(Q1,0)} to ${B(f(Q2,0),"L/s")}, an extra ${B(f(Q2-Q1,0),"L/s")}. Seal transits and check door seals first; that is cheaper than more air.`,
    rows:[["Net air needed",f(Q2*3.6,0),"m³/h"],["Extra air",f((Q2-Q1)*3.6,0),"m³/h"],["Equivalent leakage area",f(Q1/1000/(0.827*Math.sqrt(P1)),4),"m²"]]};}
  const A=(num(v.sd)||0)*0.01+(num(v.dd)||0)*0.03+(num(v.ox)||0),sf=1+(num(v.sf)||0)/100;if(!(A>0))return{hint:"Enter at least one door or leakage area."};
  const Q=0.827*A*Math.sqrt(P)*sf*1000;
  return{cap:"Net pressurisation air",value:f(Q,0),unit:"L/s",
   say:`A total leakage area of ${f(A,3)} m² needs about ${B(f(Q,0),"L/s")} (${f(Q*3.6,0)} m³/h) more supply than return and exhaust to hold ${f(P)} Pa, including ${f((sf-1)*100,0)} % margin.`,
   rows:[["Net air",f(Q*3.6,0),"m³/h"],["Net air",f(Q*2.11888,0),"CFM"],["Leakage area",f(A,3),"m²"]]};
 },
 note:"Q = 0.827 × A × √ΔP (m³/s, A in m²). Typical leakage per closed door: single 0.01 m², double 0.03 m² (EN 12101-6 / CIBSE). Measure and seal before adding air."},

{id:"esp",g:"tab",icon:"esp",name:"Static pressure (ESP)",short:"External static from duct losses or readings",
 intro:"Estimate the external static pressure a fan must give, or work it out from suction and discharge readings.",
 fields:[
  {id:"mode",label:"Method",type:"chips",def:"est",options:[["est","Estimate from ductwork"],["meas","From readings"]]},
  {id:"L",label:"Longest duct run",type:"num",def:"60",unit:"m",half:true,show:v=>v.mode==="est"},
  {id:"R",label:"Friction rate",type:"num",def:"1",unit:"Pa/m",half:true,show:v=>v.mode==="est"},
  {id:"fit",label:"Fittings allowance",help:"Bends, tees and transitions as % of straight duct.",type:"num",def:"50",unit:"%",show:v=>v.mode==="est"},
  {id:"term",label:"Diffuser / grille",type:"num",def:"25",unit:"Pa",half:true,show:v=>v.mode==="est"},
  {id:"dmp",label:"Dampers and fire dampers",type:"num",def:"20",unit:"Pa",half:true,show:v=>v.mode==="est"},
  {id:"oth",label:"Other external items",help:"Louvres, silencers, heaters outside the unit.",type:"num",def:"40",unit:"Pa",show:v=>v.mode==="est"},
  {id:"sf",label:"Safety margin",type:"num",def:"10",unit:"%",adv:true,show:v=>v.mode==="est"},
  {id:"ps",label:"Suction static (outside unit)",help:"Usually negative.",type:"num",def:"-120",unit:"Pa",half:true,show:v=>v.mode==="meas"},
  {id:"pd",label:"Discharge static (outside unit)",type:"num",def:"260",unit:"Pa",half:true,show:v=>v.mode==="meas"},
  {id:"des",label:"Design ESP",type:"num",def:"350",unit:"Pa",show:v=>v.mode==="meas"}
 ],
 calc(v){
  if(v.mode==="meas"){const ps=num(v.ps),pd=num(v.pd),d=num(v.des);if(!isFinite(ps)||!isFinite(pd))return{hint:"Enter suction and discharge static."};const e=pd-ps;
   return{cap:"External static pressure",value:f(e,0),unit:"Pa",status:d>0?{ok:Math.abs(e-d)/d<=0.1,text:`${f(e/d*100,0)} % of design`}:null,
    say:`ESP = ${f(pd,0)} − (${f(ps,0)}) = ${B(f(e,0),"Pa")}.`+(d>0?(e>d*1.1?" Higher than design: the ductwork has more resistance than designed, so airflow will be low. Check dampers, filters and fire dampers.":e<d*0.9?" Lower than design: check for open access doors, missing filters or duct leaks.":" Close to design."):""),
    rows:[["ESP",f(e/249.089,2),"inWG"],["ESP",f(e/9.80665,1),"mm WG"]]};}
  const L=num(v.L),R=num(v.R);if(!(L>0&&R>0))return{hint:"Enter the duct run length and friction rate."};
  const duct=L*R*(1+(num(v.fit)||0)/100),items=(num(v.term)||0)+(num(v.dmp)||0)+(num(v.oth)||0),esp=(duct+items)*(1+(num(v.sf)||0)/100);
  return{cap:"Estimated ESP",value:f(esp,0),unit:"Pa",say:`Duct and fittings ${f(duct,0)} Pa plus external items ${f(items,0)} Pa, with margin, gives about ${B(f(esp,0),"Pa")} (${f(esp/249.089,2)} inWG).`,
   rows:[["Ductwork",f(duct,0),"Pa"],["External items",f(items,0),"Pa"],["ESP",f(esp/249.089,2),"inWG"]]};
 },
 note:"ESP = discharge static − suction static, both measured outside the unit. Estimates use the index (longest) run; use a full duct calculation for design."},

{id:"vbelt",g:"tab",icon:"vbelt",name:"V-belt tension",short:"SKF force–deflection check",
 intro:"Pick the belt section, enter the pulleys and speed. You get the deflection and the force range. Add your tester readings to check each belt.",
 fields:[
  {id:"sec",label:"Belt section",type:"select",def:"SPB, XPB",options:Object.keys(VB).map(k=>[k,k])},
  {id:"cog",label:"Construction",type:"chips",def:"0",options:[["0","Un-cogged"],["1","Cogged (X in code)"]]},
  {id:"nw",label:"Belt condition",type:"chips",def:"1",options:[["1","New"],["0","Used"]]},
  {id:"d",label:"Small pulley diameter",type:"num",def:"180",unit:"mm",half:true},
  {id:"rpm",label:"Small pulley speed",type:"num",def:"1460",unit:"rpm",half:true},
  {id:"D",label:"Large pulley diameter",type:"num",def:"315",unit:"mm",half:true},
  {id:"C",label:"Centre distance",type:"num",def:"620",unit:"mm",half:true},
  {id:"r",label:"Tester readings, one per belt",help:"In kgf, separated by spaces. Leave blank to see the target only.",type:"text",def:"8.9 9.3 8.6"}
 ],
 calc(v){
  const S=VB[v.sec],d0=num(v.d),D0=num(v.D),C=num(v.C),rpm=num(v.rpm);if(!S)return{hint:"Pick a belt section."};
  if(!(d0>0&&D0>0&&C>0&&rpm>0))return{hint:"Enter both pulley diameters, the centre distance and the speed."};
  const d=Math.min(d0,D0),D=Math.max(d0,D0);if(C<=(d+D)/2)return{hint:"The centre distance is too short; the pulleys would overlap."};
  const span=Math.sqrt(C*C-((D-d)/2)**2),defl=span/64,wrap=180-2*Math.asin((D-d)/(2*C))*180/Math.PI;
  let bi=S.b.findIndex(b=>d<=b[1]);if(bi<0)bi=S.b.length-1;const rows=S.b[bi][3];let ri=rows.findIndex(r=>rpm>=r[0]&&rpm<=r[1]);if(ri<0)ri=rpm<rows[0][0]?0:rows.length-1;
  const vals=rows[ri][2],cog=v.cog==="1",u=cog?vals[2]:vals[0],n=cog?vals[3]:vals[1];
  if(u==null)return{hint:`SKF lists no ${cog?"cogged":"un-cogged"} value for ${v.sec} at this pulley size. Switch construction or check the pulley.`};
  const bs=Math.PI*d*rpm/60000,rd=numsOf(v.r),res=rd.map(x=>x<u?"Slack":x>n?"Too tight":"OK"),allOK=rd.length&&res.every(x=>x==="OK"),tgt=v.nw==="1"?n:u;
  const warn=[];if(d<S.b[0][0])warn.push(`Small pulley is below the smallest listed for ${v.sec} (${S.b[0][0]} mm).`);if(wrap<120)warn.push(`Arc of contact is only ${f(wrap,0)}°; slip is likely.`);if(bs>(S.cls==="wedge"?40:30))warn.push(`Belt speed ${f(bs,1)} m/s is above the usual limit.`);
  return{cap:"Set force to",value:f(tgt,1),unit:"kgf",status:rd.length?{ok:allOK,text:allOK?"All belts pass":`${res.filter(x=>x!=="OK").length} belt(s) fail`}:null,
   say:`Push at mid-span until it deflects ${B(f(defl,1),"mm")} (span ${f(span,0)} mm ÷ 64). The force must be between ${B(f(u,1)+" and "+f(n,1),"kgf")} (${f(u*9.80665,0)}–${f(n*9.80665,0)} N). ${v.nw==="1"?"New belts: set near the maximum.":"Used belts: keep at or above the minimum."}`+(warn.length?" "+warn.join(" "):""),
   rows:[["Span",f(span,0),"mm"],["Deflection",f(defl,1),"mm"],["Minimum (used)",f(u,1),"kgf"],["Maximum (new)",f(n,1),"kgf"],["Arc of contact",f(wrap,0),"°"],["Belt speed",f(bs,1),"m/s"]],
   after:rd.length?tbl(["Belt","Reading kgf","Result"],rd.map((x,i)=>({cls:res[i]==="OK"?"":"sel",c:[i+1,f(x,1),res[i]]}))):""};
 },
 note:"SKF Industrial V-Belt Tension Tester table (kgf). Isolate and lock out before checking. Re-check new belts after 24–48 hours of running."},

{id:"dheat",g:"tab",icon:"dheat",name:"Duct heater test",short:"Current, ΔT, resistance and site check",
 intro:"Enter the heater nameplate and duct size. Add site readings to check output, current balance and temperature rise.",
 fields:[
  {id:"kw",label:"Heater capacity",type:"num",def:"18",unit:"kW",half:true},
  {id:"V",label:"Voltage",type:"num",def:"415",unit:"V",half:true},
  {id:"ph",label:"Supply",type:"chips",def:"3",options:[["3","3-phase"],["1","1-phase"]]},
  {id:"Q",label:"Airflow",type:"num",def:"3600",units:["m³/h","CFM","L/s"],udef:"m³/h"},
  {id:"w",label:"Duct width",type:"num",def:"600",unit:"mm",half:true},
  {id:"h",label:"Duct height",type:"num",def:"400",unit:"mm",half:true},
  {id:"vmin",label:"Minimum face velocity",type:"num",def:"1.5",unit:"m/s",adv:true},
  {id:"mV",label:"Measured voltage",type:"num",def:"",unit:"V",half:true},
  {id:"I",label:"Measured currents",help:"One per phase, separated by spaces.",type:"text",def:""},
  {id:"ti",label:"Inlet air",type:"num",def:"",unit:"°C",half:true},
  {id:"to",label:"Outlet air",type:"num",def:"",unit:"°C",half:true}
 ],
 calc(v){
  const kw=num(v.kw),V=num(v.V),three=v.ph==="3",Q=airQ(v,"Q"),A=num(v.w)*num(v.h)/1e6,vmin=num(v.vmin)||1.5;
  if(!(kw>0&&V>0))return{hint:"Enter the heater kW and voltage."};if(!(Q>0))return{hint:"Enter the airflow."};
  const P=kw*1000,I=three?P/(SQ3*V):P/V,dT=kw/(1.207*Q),vel=A>0?Q/A:NaN,R=three?2*V*V/P:V*V/P;
  const mV=num(v.mV),Is=numsOf(v.I),ti=num(v.ti),to=num(v.to),rows=[["Full-load current",f(I,1),"A"],["Air temperature rise",f(dT,1),"°C"],["Face velocity",f(vel,2),"m/s"],[three?"Resistance line-to-line":"Element resistance",f(R,2),"Ω"],["Feeder rating (1.25 × I)",f(1.25*I,1),"A"]];
  let msg=[],ok=!(vel<vmin);if(vel<vmin)msg.push(`Face velocity ${f(vel,2)} m/s is below the ${f(vmin,1)} m/s minimum: risk of overheating and high-limit trips.`);
  if(mV>0&&Is.length===(three?3:1)){const Ia=Is.reduce((a,b)=>a+b,0)/Is.length,Pm=three?SQ3*mV*Ia:mV*Ia,Pe=P*(mV/V)**2,pc=Pm/Pe*100;
   rows.push(["Measured output",f(Pm/1000,2),"kW"],["Expected at this voltage",f(Pe/1000,2),"kW"]);
   if(Math.abs(pc-100)>10){ok=false;msg.push(`Output is ${f(pc,0)} % of expected: a stage or element may be off.`);}else msg.push(`Output is ${f(pc,0)} % of expected.`);
   if(three){const ub=Math.max(...Is.map(x=>Math.abs(x-Ia)))/Ia*100;rows.push(["Current unbalance",f(ub,1),"%"]);if(ub>10){ok=false;msg.push(`Current unbalance ${f(ub,1)} % suggests an open element.`);}}
   if(isFinite(ti)&&isFinite(to)){const dTm=to-ti,dTe=Pm/1000/(1.207*Q);rows.push(["Measured ΔT",f(dTm,1),"°C"],["Expected ΔT",f(dTe,1),"°C"]);if(dTm>0)rows.push(["Airflow from ΔT",f(Pm/1000/(1.207*dTm)*3600,0),"m³/h"]);}}
  return{cap:"Full-load current",value:f(I,1),unit:"A",status:{ok,text:ok?"OK":"Check"},
   say:`At full output the heater draws ${B(f(I,1),"A")} and raises the air ${B(f(dT,1),"°C")}. `+msg.join(" "),rows};
 },
 note:"I = P ÷ (√3 V) or P ÷ V. ΔT = kW ÷ (1.207 × m³/s). Output varies with V². Interlocks to test: no heat with fan off, trip on airflow loss, auto and manual-reset high limits, fan overrun."},

/* ===== HVAC additions ===== */
/* ===== Commissioning additions ===== */
{id:"hydro",g:"tab",icon:"hydro",name:"Hydrostatic test",short:"Test pressure and temperature correction",
 intro:"Work out the test pressure, then check whether a pressure change during the hold is a leak or just the water temperature changing.",
 fields:[
  {id:"Pd",label:"Design pressure",type:"num",def:"10",unit:"bar g",half:true},
  {id:"k",label:"Test factor",type:"chips",def:"1.5",options:[["1.5","1.5 × (ASME B31.3 / most specs)"],["1.43","1.43 × (EN 13480)"],["1.3","1.3 ×"],["1.25","1.25 ×"]]},
  {id:"OD",label:"Pipe outside diameter",type:"num",def:"168.3",unit:"mm",half:true},
  {id:"t",label:"Wall thickness",type:"num",def:"7.11",unit:"mm",half:true},
  {id:"mat",label:"Pipe material",type:"chips",def:"st",options:[["st","Carbon / stainless steel"],["cu","Copper"],["pp","Plastic (PPR / HDPE)"]]},
  {id:"P1",label:"Pressure at start of hold",type:"num",def:"15.2",unit:"bar g",half:true},
  {id:"T1",label:"Water temperature at start",type:"num",def:"31",unit:"°C",half:true},
  {id:"P2",label:"Pressure at end of hold",type:"num",def:"14.3",unit:"bar g",half:true},
  {id:"T2",label:"Water temperature at end",type:"num",def:"30.8",unit:"°C",half:true},
  {id:"tol",label:"Allowed unexplained drop",type:"num",def:"0.1",unit:"bar",adv:true}
 ],
 calc(v){
  const Pd=num(v.Pd),k=num(v.k),Pt=Pd*k;if(!(Pd>0))return{hint:"Enter the design pressure."};
  const OD=num(v.OD),t=num(v.t),P1=num(v.P1),P2=num(v.P2),T1=num(v.T1),T2=num(v.T2),tol=num(v.tol)||0.1;
  const base={cap:"Test pressure",value:f(Pt,2),unit:"bar g",say:`Test at ${B(f(Pt,2),"bar g")} (${f(k,2)} × ${f(Pd,1)} bar). Hold for the time in your spec, often 30 minutes to 2 hours after the pressure settles.`,rows:[["Test pressure",f(Pt*100,0),"kPa g"],["Test pressure",f(Pt*14.5038,0),"psig"]]};
  if(![P1,P2,T1,T2].every(isFinite)||!(OD>0&&t>0))return base;
  const BT=[[0,-0.68],[4,0],[5,0.16],[10,0.88],[15,1.51],[20,2.07],[25,2.57],[30,3.03],[40,3.85],[50,4.57],[60,5.22]],Tm=(T1+T2)/2;
  let beta=BT[BT.length-1][1];for(let i=1;i<BT.length;i++)if(Tm<=BT[i][0]){const[a,fa]=BT[i-1],[b,fb]=BT[i];beta=fa+(fb-fa)*(Tm-a)/(b-a);break;}
  const M={st:[1.2e-5,200000],cu:[1.7e-5,110000],pp:[1.5e-4,900]}[v.mat],dPdT=(beta*1e-4-3*M[0])/(4.6e-4+OD/(t*M[1]))*10;
  const exp=dPdT*(T2-T1),act=P2-P1,un=act-exp,ok=un>=-tol;
  return{cap:"Unexplained pressure change",value:(un>=0?"+":"")+f(un,2),unit:"bar",status:{ok,text:ok?"No leak indicated":"Leak likely"},
   say:`Test at ${B(f(Pt,2),"bar g")}. Trapped water in this pipe changes about ${B(f(Math.abs(dPdT),2),"bar per °C")}, so the ${f(T2-T1,1)} °C change explains ${f(exp,2)} bar. You saw ${f(act,2)} bar, leaving ${B(f(un,2),"bar")} unexplained.`+(ok?" The pressure change is from temperature, not a leak.":" Walk the line for leaks; check flanges, vents, drains and valve glands.")+" Do the hold out of direct sun and log temperature with the pressure.",
   rows:[["Test pressure",f(Pt,2),"bar g"],["Pressure change per °C",f(dPdT,2),"bar/°C"],["Expected from temperature",f(exp,2),"bar"],["Measured change",f(act,2),"bar"]]};
 },
 note:"ΔP/ΔT = (β − 3α) ÷ (κ + D/(t·E)) for trapped, air-free water (β water expansion, α pipe expansion, κ water compressibility). Air pockets make this much smaller, so vent fully. Follow the test pack and your code's test factor."},

{id:"flush",g:"tab",icon:"flush",name:"Flushing velocity",short:"Flow needed to flush each pipe size",
 intro:"Pick the pipe size and target flushing velocity. You get the flow needed, and the velocity your flushing pump actually gives.",
 fields:[
  {id:"dn",label:"Pipe size (steel Sch 40)",type:"select",def:"5",options:PIPE.map((p,i)=>[String(i),p[0]+" · ID "+p[1]+" mm"])},
  {id:"vt",label:"Target flushing velocity",help:"Usually at least the design velocity, often 1.0–1.5 m/s minimum (BSRIA BG 29). Use your flushing spec.",type:"num",def:"1.5",unit:"m/s",presets:[["1","1.0"],["1.5","1.5"],["2","2.0"]]},
  {id:"Qp",label:"Flushing pump flow available",type:"num",def:"5",units:uu("flow"),udef:"L/s"},
  {id:"Vs",label:"System volume (for turnover time)",type:"num",def:"2000",unit:"L",adv:true}
 ],
 calc(v){
  const p=PIPE[+v.dn],vt=num(v.vt),Qp=si(v,"Qp","flow");if(!p)return{hint:"Pick a pipe size."};if(!(vt>0))return{hint:"Enter the target velocity."};
  const A=Math.PI*(p[1]/1000)**2/4,Qn=A*vt,va=Qp>0?Qp/A:NaN,Vs=num(v.Vs),ok=va>=vt;
  const rows=PIPE.map(q=>{const a=Math.PI*(q[1]/1000)**2/4;return{cls:q===p?"sel":"",c:[q[0],f(a*vt*1000,2),Qp>0?f(Qp/a,2):"—"]};});
  return{cap:"Flow needed",value:f(Qn*1000,2),unit:"L/s",status:Qp>0?{ok,text:ok?"Pump reaches target":"Pump too small for this size"}:null,
   say:`To flush ${p[0]} at ${f(vt,1)} m/s you need ${B(f(Qn*1000,2),"L/s")} (${f(Qn*3600,1)} m³/h).`+(Qp>0?` Your pump gives ${B(f(va,2),"m/s")} in this size.`+(ok?"":" Flush the larger mains in sections, or use a bigger temporary pump."):"")+(Vs>0&&Qp>0?` One full system turnover takes about ${f(Vs/1000/Qp/60,1)} minutes.`:""),
   rows:[["Flow needed",f(Qn*3600,2),"m³/h"],["Flow needed",f(Qn*15850.3,1),"US GPM"],["Velocity achieved",f(va,2),"m/s"]],
   after:tbl(["Size","L/s needed","m/s with your pump"],rows)};
 },
 note:"Flush each branch separately with terminals bypassed and strainers fitted with fine flushing mesh. Flush until the water runs clear and samples meet the water-treatment spec."},

{id:"align",g:"tab",icon:"align",name:"Shaft alignment",short:"Tolerance check and shim / move at the feet",
 intro:"Enter the speed and your offset and angularity readings at the coupling. You get pass or fail and how much to move each motor foot.",
 fields:[
  {id:"rpm",label:"Speed",type:"num",def:"1480",unit:"rpm",half:true},
  {id:"pl",label:"Plane",type:"chips",def:"v",options:[["v","Vertical (shims)"],["h","Horizontal (side move)"]]},
  {id:"off",label:"Offset at coupling centre",help:"Motor shaft relative to pump shaft. + means motor high (or to the right).",type:"num",def:"0.18",unit:"mm",half:true},
  {id:"gap",label:"Angularity",help:"Gap difference across the coupling face. + means gap open at top (or right).",type:"num",def:"0.06",unit:"mm",half:true},
  {id:"D",label:"Coupling diameter (or reading span)",type:"num",def:"100",unit:"mm"},
  {id:"A",label:"Coupling centre to front foot",type:"num",def:"200",unit:"mm",half:true},
  {id:"Bf",label:"Front foot to rear foot",type:"num",def:"300",unit:"mm",half:true}
 ],
 calc(v){
  const rpm=num(v.rpm),off=num(v.off),gap=num(v.gap),D=num(v.D),A=num(v.A),Bf=num(v.Bf);if(!(rpm>0))return{hint:"Enter the speed."};if(!isFinite(off)||!isFinite(gap)||!(D>0))return{hint:"Enter the offset, angularity and diameter."};
  const T=rpm<=1000?[0.13,0.10]:rpm<=2000?[0.09,0.07]:rpm<=3000?[0.06,0.05]:[0.04,0.04],ang=gap/D*100,ok=Math.abs(off)<=T[0]&&Math.abs(ang)<=T[1];
  const slope=gap/D,fF=off+slope*A,fR=off+slope*(A+Bf),vert=v.pl==="v",act=x=>vert?(x>0?`remove ${f(x,2)} mm of shims`:x<0?`add ${f(-x,2)} mm of shims`:"no change"):(x>0?`move ${f(x,2)} mm left`:x<0?`move ${f(-x,2)} mm right`:"no change");
  return{cap:"Alignment",big:ok?"Within tolerance":"Correct it",status:{ok,text:`Limits ${T[0]} mm offset, ${T[1]} mm/100 mm angle`},
   say:`At ${f(rpm,0)} rpm the offset is ${f(Math.abs(off),2)} mm (limit ${T[0]}) and the angle is ${f(Math.abs(ang),3)} mm per 100 mm (limit ${T[1]}).`+(A>0&&Bf>0?` To correct the ${vert?"vertical":"horizontal"} plane: front feet ${B(act(fF))}, rear feet ${B(act(fR))}.`:"")+" Correct vertical first, then horizontal, then re-measure.",
   rows:[["Offset",f(off,3),"mm"],["Angularity",f(ang,3),"mm/100 mm"],["Front foot move",f(-fF,3),"mm"],["Rear foot move",f(-fR,3),"mm"]]};
 },
 note:"Typical acceptable tolerances for short flexible couplings (laser alignment practice). Your pump or coupling maker's values govern. Check soft foot (under 0.05 mm) before aligning, and re-check hot alignment where specified."},

{id:"torque",g:"tab",icon:"torque",name:"Flange bolt torque",short:"Torque for bolt size, grade and lubrication",
 intro:"Pick the bolt size, grade and lubrication. You get the tightening torque and the passes to use.",
 fields:[
  {id:"sz",label:"Bolt size",type:"select",def:"M20",options:[["M10","M10"],["M12","M12"],["M16","M16"],["M20","M20"],["M24","M24"],["M27","M27"],["M30","M30"],["M33","M33"],["M36","M36"]]},
  {id:"gr",label:"Bolt grade",type:"chips",def:"725",options:[["725","ASTM A193 B7"],["640","ISO 8.8"],["940","ISO 10.9"],["450","Stainless A2/A4-70"]]},
  {id:"K",label:"Lubrication",type:"chips",def:"0.16",options:[["0.12","Moly / anti-seize"],["0.16","Light oil"],["0.20","Dry / plated"]]},
  {id:"pc",label:"Target bolt stress",help:"% of yield. 50 % is common for spiral-wound gaskets.",type:"num",def:"50",unit:"% of yield"}
 ],
 calc(v){
  const AS={M10:[10,58],M12:[12,84.3],M16:[16,157],M20:[20,245],M24:[24,353],M27:[27,459],M30:[30,561],M33:[33,694],M36:[36,817]}[v.sz],Y=num(v.gr),K=num(v.K),pc=num(v.pc)/100;
  if(!AS||!(pc>0&&pc<=0.9))return{hint:"Enter a target between 10 and 90 % of yield."};
  const F=pc*Y*AS[1],T=K*F*AS[0]/1000;
  return{cap:"Tightening torque",value:f(T,0),unit:"N·m",
   say:`Tighten ${v.sz} bolts to ${B(f(T,0),"N·m")} (${f(T*0.7376,0)} ft·lb), giving about ${f(F/1000,1)} kN clamp per bolt. Use a star (cross) pattern: pass 1 at ${f(T*0.3,0)}, pass 2 at ${f(T*0.6,0)}, pass 3 at ${f(T,0)} N·m, then a final round pass at ${f(T,0)} N·m until no bolt turns.`,
   rows:[["Torque",f(T*0.7376,0),"ft·lb"],["Bolt load",f(F/1000,1),"kN"],["Pass 1 (30 %)",f(T*0.3,0),"N·m"],["Pass 2 (60 %)",f(T*0.6,0),"N·m"]]};
 },
 note:"T = K × F × d with F = target stress × yield × tensile stress area. The gasket maker's or the project's bolt torque table governs; this is a check. Use calibrated torque wrenches and new gaskets."},

{id:"vib",g:"tab",icon:"vib",name:"Vibration acceptance",short:"ISO 10816 zones A to D",
 intro:"Pick the machine size and mounting, then enter the highest vibration velocity you read on the bearings.",
 fields:[
  {id:"sz",label:"Machine size",type:"chips",def:"m",options:[["s","Under 15 kW"],["m","15–300 kW"],["l","Over 300 kW"]]},
  {id:"fd",label:"Foundation",type:"chips",def:"r",options:[["r","Rigid"],["f","Flexible (springs, steel frame)"]],show:v=>v.sz!=="s"},
  {id:"vr",label:"Highest reading",type:"num",def:"2.4",unit:"mm/s RMS"}
 ],
 calc(v){
  const vr=num(v.vr);if(!(vr>=0))return{hint:"Enter the vibration reading."};
  const Z=v.sz==="s"?[0.71,1.8,4.5]:v.sz==="m"?(v.fd==="f"?[2.3,4.5,7.1]:[1.4,2.8,4.5]):(v.fd==="f"?[3.5,7.1,11]:[2.3,4.5,7.1]);
  const zn=vr<=Z[0]?"A":vr<=Z[1]?"B":vr<=Z[2]?"C":"D",ok=zn==="A"||zn==="B";
  const txt={A:"Zone A: newly commissioned machines normally fall here.",B:"Zone B: acceptable for unrestricted long-term running.",C:"Zone C: not acceptable for long-term running. Find the cause (balance, alignment, looseness, bearings) before handover.",D:"Zone D: severe enough to cause damage. Stop and investigate."}[zn];
  return{cap:"ISO 10816 zone",value:zn,unit:"",status:{ok,text:ok?"Acceptable":"Not acceptable"},
   say:`${f(vr,2)} mm/s RMS is in ${B("zone "+zn)}. ${txt}`,
   rows:[["A / B boundary",Z[0],"mm/s"],["B / C boundary",Z[1],"mm/s"],["C / D boundary",Z[2],"mm/s"]]};
 },
 note:"ISO 10816-1 (small machines) and 10816-3 (15 kW to 50 MW), RMS velocity 10–1000 Hz. Measure horizontal, vertical and axial on each bearing. For fans, ISO 14694 categories may apply; the project spec governs."},

{id:"pumpt",g:"tab",icon:"pumpt",name:"Pump performance test",short:"Head, power and efficiency from site readings",
 intro:"Enter flow, suction and discharge gauge readings and the motor power. You get the real pump head and efficiency to compare with the curve.",
 fields:[
  {id:"Q",label:"Measured flow",type:"num",def:"25",units:uu("flow"),udef:"L/s"},
  {id:"ps",label:"Suction gauge",type:"num",def:"120",unit:"kPa g",half:true},
  {id:"pd",label:"Discharge gauge",type:"num",def:"420",unit:"kPa g",half:true},
  {id:"dz",label:"Discharge gauge height above suction gauge",type:"num",def:"0.4",unit:"m",adv:true},
  {id:"ds",label:"Suction pipe ID",type:"num",def:"154",unit:"mm",half:true,adv:true},
  {id:"dd",label:"Discharge pipe ID",type:"num",def:"128",unit:"mm",half:true,adv:true},
  {id:"kw",label:"Motor input power",help:"From a power meter, or √3 × V × I × PF.",type:"num",def:"11.5",unit:"kW",half:true},
  {id:"me",label:"Motor efficiency",type:"num",def:"92",unit:"%",half:true},
  {id:"Qd",label:"Design flow",type:"num",def:"25",units:uu("flow"),udef:"L/s",adv:true},
  {id:"Hd",label:"Design head",type:"num",def:"30",unit:"m",adv:true}
 ],
 calc(v){
  const Q=si(v,"Q","flow"),ps=num(v.ps),pd=num(v.pd);if(!(Q>0))return{hint:"Enter the measured flow."};if(!isFinite(ps)||!isFinite(pd))return{hint:"Enter both gauge readings."};
  const dz=num(v.dz)||0,ds=num(v.ds)/1000,dd=num(v.dd)/1000,vs=ds>0?Q/(Math.PI*ds*ds/4):0,vd=dd>0?Q/(Math.PI*dd*dd/4):0;
  const H=(pd-ps)*1000/(998*9.81)+dz+(vd*vd-vs*vs)/(2*9.81),Ph=998*9.81*Q*H/1000,kw=num(v.kw),me=num(v.me)/100,eff=kw>0&&me>0?Ph/(kw*me):NaN;
  const Qd=si(v,"Qd","flow"),Hd=num(v.Hd);
  return{cap:"Pump head",value:f(H,1),unit:"m",status:isFinite(eff)?{ok:eff>=0.5,text:`Pump efficiency ${f(eff*100,0)} %`}:null,
   say:`The pump is giving ${B(f(H,1),"m")} head at ${f(Q*1000,1)} L/s, which is ${f(Ph,2)} kW of hydraulic power.`+(isFinite(eff)?` With ${f(kw,1)} kW into a ${f(me*100,0)} % efficient motor, pump efficiency is ${B(f(eff*100,0),"%")}.`:"")+(Qd>0&&Hd>0?` Against design: flow ${f(Q/Qd*100,0)} %, head ${f(H/Hd*100,0)} %. Plot this point on the pump curve; a point well below the curve points to wrong rotation, a worn impeller, air, or a blocked strainer.`:""),
   rows:[["Head",f(H*9.81*0.998,0),"kPa"],["Velocity head correction",f((vd*vd-vs*vs)/(2*9.81),2),"m"],["Hydraulic power",f(Ph,2),"kW"],["Pump efficiency",isFinite(eff)?f(eff*100,1):"—","%"],["Wire-to-water efficiency",kw>0?f(Ph/kw*100,1):"—","%"]]};
 },
 note:"H = (Pd − Ps) ÷ ρg + gauge height difference + (vd² − vs²) ÷ 2g. Use calibrated gauges on the pump nozzles, not after valves or strainers."},

{id:"fanperf",g:"tab",icon:"fanperf",name:"Fan performance",short:"Air power, fan efficiency and SFP",
 intro:"Enter the measured airflow, fan pressure and motor input power. You get fan efficiency and specific fan power (SFP).",
 fields:[
  {id:"Q",label:"Measured airflow",type:"num",def:"12000",units:["m³/h","CFM","L/s"],udef:"m³/h"},
  {id:"P",label:"Fan total pressure",help:"Across the fan, or ESP plus internal losses.",type:"num",def:"650",unit:"Pa"},
  {id:"kw",label:"Motor input power",type:"num",def:"3.9",unit:"kW",half:true},
  {id:"me",label:"Motor efficiency",type:"num",def:"90",unit:"%",half:true},
  {id:"dr",label:"Drive",type:"chips",def:"0.95",options:[["1","Direct / plug fan"],["0.95","Belt drive"]]}
 ],
 calc(v){
  const Q=airQ(v,"Q"),P=num(v.P),kw=num(v.kw),me=num(v.me)/100,dr=num(v.dr)||1;if(!(Q>0&&P>0))return{hint:"Enter the airflow and fan pressure."};
  const Pa=Q*P/1000,eff=kw>0&&me>0?Pa/(kw*me*dr):NaN,sfp=kw>0?kw/Q:NaN;
  const cat=!isFinite(sfp)?"—":sfp<=0.5?"SFP 1":sfp<=0.75?"SFP 2":sfp<=1.25?"SFP 3":sfp<=2?"SFP 4":sfp<=3?"SFP 5":sfp<=4.5?"SFP 6":"SFP 7";
  return{cap:"Fan efficiency",value:isFinite(eff)?f(eff*100,0):"—",unit:"%",status:isFinite(sfp)?{ok:sfp<=2,text:`${f(sfp,2)} kW per m³/s (${cat})`}:null,
   say:`The fan moves ${f(Q*1000,0)} L/s at ${f(P,0)} Pa, which is ${B(f(Pa,2),"kW")} of air power.`+(isFinite(eff)?` Fan efficiency is ${B(f(eff*100,0),"%")} and specific fan power is ${B(f(sfp,2),"kW/(m³/s)")}, category ${cat}.`:"")+(eff<0.5?" Low efficiency points to the fan running far from its best point, wrong rotation, or inlet or outlet losses.":""),
   rows:[["Air power",f(Pa,2),"kW"],["SFP",isFinite(sfp)?f(sfp,2):"—","kW/(m³/s)"],["SFP category (EN 16798-3)",cat,""],["Shaft power",kw>0?f(kw*me,2):"—","kW"]]};
 },
 note:"Air power = Q × p. Fan efficiency = air power ÷ (input × motor × drive efficiency). SFP = electrical input ÷ airflow; lower is better."},

{id:"hrec",g:"tab",icon:"hrec",name:"Heat recovery effectiveness",short:"Thermal wheel or plate exchanger",
 intro:"Enter the outdoor air, supply air after recovery and extract air temperatures. You get the temperature effectiveness and the heat recovered.",
 fields:[
  {id:"t21",label:"Outdoor air entering",type:"num",def:"44",unit:"°C",half:true},
  {id:"t22",label:"Supply air after recovery",type:"num",def:"31.5",unit:"°C",half:true},
  {id:"t11",label:"Extract air entering",type:"num",def:"24",unit:"°C",half:true},
  {id:"Qs",label:"Supply airflow",type:"num",def:"5000",units:["m³/h","CFM","L/s"],udef:"m³/h",half:true},
  {id:"spec",label:"Datasheet effectiveness",type:"num",def:"65",unit:"%",adv:true}
 ],
 calc(v){
  const a=num(v.t21),b=num(v.t22),c=num(v.t11),Q=airQ(v,"Qs"),sp=num(v.spec);if(![a,b,c].every(isFinite))return{hint:"Enter all three temperatures."};
  if(Math.abs(a-c)<5)return{hint:"Outdoor and extract air need at least 5 K difference for a reliable result. Test on a hotter (or colder) day."};
  const e=(b-a)/(c-a),kw=Q>0?1.2*Q*1.006*Math.abs(b-a):NaN;
  return{cap:"Temperature effectiveness",value:f(e*100,0),unit:"%",status:sp>0?{ok:e*100>=sp*0.9,text:`${f(e*100/sp*100,0)} % of datasheet`}:null,
   say:`The recovery unit brings the outdoor air ${f(Math.abs(b-a),1)} K of the way toward extract air out of ${f(Math.abs(c-a),1)} K possible, an effectiveness of ${B(f(e*100,0),"%")}.`+(Q>0?` It recovers about ${B(f(kw,1),"kW")} (${f(kw/3.517,2)} TR).`:"")+(sp>0&&e*100<sp*0.9?" Below datasheet: check wheel speed and belt, bypass dampers, seals and that supply and extract flows are balanced.":""),
   rows:[["Recovered",f(kw,1),"kW"],["Temperature change",f(b-a,1),"K"],["Available difference",f(c-a,1),"K"]]};
 },
 note:"EN 308 supply-side temperature efficiency η = (t22 − t21) ÷ (t11 − t21), valid with balanced supply and extract airflow. Sensible only; enthalpy wheels also recover moisture."},

{id:"filt",g:"tab",icon:"filt",name:"Filter pressure drop",short:"How loaded is the filter?",
 intro:"Enter the clean, final and current pressure drop. You find how loaded the filter is and when to change it.",
 fields:[
  {id:"c",label:"Clean (initial) pressure drop",help:"From the filter label or datasheet at design airflow.",type:"num",def:"90",unit:"Pa",half:true},
  {id:"fn",label:"Final (change) pressure drop",type:"num",def:"250",unit:"Pa",half:true},
  {id:"m",label:"Reading now",type:"num",def:"185",unit:"Pa"},
  {id:"qp",label:"Airflow at time of reading",type:"num",def:"100",unit:"% of design",adv:true}
 ],
 calc(v){
  const c=num(v.c),fn=num(v.fn),qp=(num(v.qp)||100)/100;let m=num(v.m);if(!(c>0&&fn>c))return{hint:"Enter clean and final pressure drops (final higher than clean)."};if(!(m>=0))return{hint:"Enter the reading."};
  const mc=m/Math.pow(qp,1.3),load=(mc-c)/(fn-c)*100;
  return{cap:"Filter loading",value:f(Math.max(load,0),0),unit:"%",status:{ok:load<80,text:load>=100?"Change now":load>=80?"Change soon":"OK"},
   say:`At design airflow the filter reads about ${B(f(mc,0),"Pa")}, which is ${B(f(Math.max(load,0),0),"%")} of the way from clean to final.`+(load>=100?" It is at or past final pressure drop: change it.":load>=80?" Order replacements.":"")+(mc<c*0.8?" Lower than clean: the filter may be missing, bypassing or damaged, or the gauge tubes are swapped.":""),
   rows:[["Corrected reading",f(mc,0),"Pa"],["Clean",f(c,0),"Pa"],["Final",f(fn,0),"Pa"],["Margin left",f(fn-mc,0),"Pa"]]};
 },
 note:"Readings at reduced airflow are corrected with ΔP ∝ Q^1.3. During TAB, test with clean filters and design for the mid-life or final ΔP, as the spec requires."},

{id:"faceu",g:"tab",icon:"faceu",name:"Face velocity uniformity",short:"Spread across a coil or filter face",
 intro:"Enter the velocity grid readings across the coil or filter face. You get the average, the spread and pass or fail.",
 fields:[
  {id:"r",label:"Velocity readings",help:"Separated by spaces or commas.",type:"text",def:"2.1 2.3 2.2 2.0 2.4 2.5 2.3 2.1 1.9 2.2 2.4 2.3"},
  {id:"tol",label:"Allowed deviation from average",type:"num",def:"20",unit:"± %"},
  {id:"vmax",label:"Maximum face velocity",help:"Cooling coils about 2.5 m/s to avoid water carry-over.",type:"num",def:"2.5",unit:"m/s",adv:true},
  {id:"A",label:"Face area (optional)",type:"num",def:"",unit:"m²",adv:true}
 ],
 calc(v){
  const r=numsOf(v.r),tol=num(v.tol)||20,vm=num(v.vmax),A=num(v.A);if(r.length<3)return{hint:"Enter at least three readings."};
  const av=r.reduce((a,b)=>a+b,0)/r.length,dv=r.map(x=>(x-av)/av*100),mx=Math.max(...dv.map(Math.abs)),out=dv.filter(x=>Math.abs(x)>tol).length,hi=Math.max(...r);
  const ok=out===0&&!(vm>0&&hi>vm);
  return{cap:"Average face velocity",value:f(av,2),unit:"m/s",status:{ok,text:ok?"Uniform":"Not uniform"},
   say:`Average is ${B(f(av,2),"m/s")} and the worst point is ${B(f(mx,0),"%")} from it.`+(out?` ${out} point(s) are outside ±${tol} %: check for blocked fins, gaps, bypass, or a poor inlet.`:` All points are within ±${tol} %.`)+(vm>0&&hi>vm?` The highest reading ${f(hi,2)} m/s is above ${f(vm,1)} m/s.`:"")+(A>0?` Airflow is about ${f(av*A*3600,0)} m³/h.`:""),
   rows:[["Points",r.length,""],["Highest",f(hi,2),"m/s"],["Lowest",f(Math.min(...r),2),"m/s"],["Max deviation",f(mx,1),"%"],["Airflow",A>0?f(av*A*1000,0):"—","L/s"]],
   after:tbl(["Point","m/s","From average"],r.map((x,i)=>({cls:Math.abs(dv[i])>tol?"sel":"",c:[i+1,f(x,2),(dv[i]>=0?"+":"")+f(dv[i],0)+" %"]})))};
 },
 note:"Take an even grid (about one point per 0.1–0.2 m²) about 150 mm from the face. ±20 % of average is a common acceptance; HEPA and cleanroom specs may be tighter."},

{id:"sound",g:"tab",icon:"sound",name:"Sound level",short:"Add dB, background correction, NC rating",
 intro:"Add sound levels together, take off background noise, or rate a room from octave-band readings.",
 fields:[
  {id:"mode",label:"What do you need?",type:"chips",def:"nc",options:[["nc","NC rating"],["bg","Background correction"],["add","Add sources"]]},
  {id:"oct",label:"Octave-band levels 63 to 8000 Hz",help:"8 readings in dB, separated by spaces.",type:"text",def:"58 52 46 41 37 33 30 27",show:v=>v.mode==="nc"},
  {id:"tgt",label:"Room target",type:"num",def:"40",unit:"NC",show:v=>v.mode==="nc",presets:[["30","Office 30–35"],["40","Control room 40"],["45","Workshop 45"]]},
  {id:"Lt",label:"Level with the equipment running",type:"num",def:"48",unit:"dB",half:true,show:v=>v.mode==="bg"},
  {id:"Lb",label:"Background with it off",type:"num",def:"43",unit:"dB",half:true,show:v=>v.mode==="bg"},
  {id:"L",label:"Levels to add",help:"Separated by spaces.",type:"text",def:"45 45 42",show:v=>v.mode==="add"}
 ],
 calc(v){
  const lg=x=>10*Math.log10(x);
  if(v.mode==="add"){const L=numsOf(v.L);if(!L.length)return{hint:"Enter the levels to add."};const T=lg(L.reduce((a,b)=>a+Math.pow(10,b/10),0));
   return{cap:"Combined level",value:f(T,1),unit:"dB",say:`Together the ${L.length} sources give ${B(f(T,1),"dB")}. Two equal sources add 3 dB; a source 10 dB quieter adds almost nothing.`,rows:[["Loudest single source",f(Math.max(...L),1),"dB"]]};}
  if(v.mode==="bg"){const Lt=num(v.Lt),Lb=num(v.Lb);if(!isFinite(Lt)||!isFinite(Lb))return{hint:"Enter both readings."};const d=Lt-Lb;
   if(d<3)return{cap:"Equipment level",big:"Cannot separate",status:{ok:false,text:`Only ${f(d,1)} dB above background`},say:"The equipment is less than 3 dB above background, so its level can't be measured reliably. Measure when the background is quieter (night shift, other plant off)."};
   const Ls=lg(Math.pow(10,Lt/10)-Math.pow(10,Lb/10));
   return{cap:"Equipment alone",value:f(Ls,1),unit:"dB",say:`With ${f(d,1)} dB between running and background, the equipment alone is ${B(f(Ls,1),"dB")}.`+(d>=10?" Over 10 dB difference, background makes almost no difference.":""),rows:[["Correction",f(Lt-Ls,1),"dB"]]};}
  const o=numsOf(v.oct);if(o.length!==8)return{hint:`Enter 8 octave-band readings (63 to 8000 Hz). You have ${o.length}.`};
  const NC={15:[47,36,29,22,17,14,12,11],20:[51,40,33,26,22,19,17,16],25:[54,44,37,31,27,24,22,21],30:[57,48,41,35,31,29,28,27],35:[60,52,45,40,36,34,33,32],40:[64,56,50,45,41,39,38,37],45:[67,60,54,49,46,44,43,42],50:[71,64,58,54,51,49,48,47],55:[74,67,62,58,56,54,53,52],60:[77,71,67,63,61,59,58,57],65:[80,75,71,68,66,64,63,62]};
  const ks=Object.keys(NC).map(Number),band=[63,125,250,500,1000,2000,4000,8000];
  const per=o.map((L,i)=>{if(L<=NC[15][i])return 15;for(let j=1;j<ks.length;j++){const a=NC[ks[j-1]][i],b=NC[ks[j]][i];if(L<=b)return ks[j-1]+5*(L-a)/(b-a);}return 65+5*(L-NC[65][i])/(NC[65][i]-NC[60][i]);});
  const nc=Math.max(...per),bi=per.indexOf(nc),tg=num(v.tgt),ok=!(tg>0)||nc<=tg;
  return{cap:"Room rating",value:"NC "+f(Math.ceil(nc),0),unit:"",status:tg>0?{ok,text:ok?`Meets NC ${tg}`:`Above NC ${tg}`}:null,
   say:`The room rates ${B("NC "+f(Math.ceil(nc),0))}, set by the ${band[bi]} Hz band.`+(band[bi]<=250&&!ok?" Low-frequency noise usually comes from fans and duct rumble: check fan speed, flexible connections and duct velocity.":(!ok?" Mid and high-frequency noise usually comes from diffusers, dampers or high air velocity.":"")),
   after:tbl(["Band Hz","dB","NC in band"],band.map((b,i)=>({cls:i===bi?"sel":"",c:[b,f(o[i],0),f(Math.ceil(per[i]),0)]})))};
 },
 note:"Decibels add logarithmically: L = 10 log Σ10^(L/10). NC uses the tangency method on 63–8000 Hz octave bands. Measure at 1.2 m height, away from walls, per the project acoustic spec."},

{id:"door",g:"tab",icon:"door",name:"Door opening force",short:"Pressurised stair and lobby doors",
 intro:"Enter the door size, the pressure difference and the door closer force. You get the force needed at the handle and the maximum pressure the door can take.",
 fields:[
  {id:"W",label:"Door width",type:"num",def:"0.9",unit:"m",half:true},
  {id:"H",label:"Door height",type:"num",def:"2.1",unit:"m",half:true},
  {id:"dp",label:"Pressure difference across the door",type:"num",def:"50",unit:"Pa"},
  {id:"Fc",label:"Door closer force",help:"Measure with a force gauge with no pressure, or use the closer data.",type:"num",def:"40",unit:"N",half:true},
  {id:"d",label:"Handle to latch edge",type:"num",def:"0.075",unit:"m",half:true},
  {id:"lim",label:"Maximum force allowed",type:"chips",def:"100",options:[["100","100 N (EN 12101-6)"],["133","133 N (NFPA 101 / 92)"]]}
 ],
 calc(v){
  const W=num(v.W),H=num(v.H),dp=num(v.dp),Fc=num(v.Fc)||0,d=num(v.d)||0.075,lim=num(v.lim);if(!(W>d&&H>0))return{hint:"Enter the door width and height."};if(!(dp>=0))return{hint:"Enter the pressure difference."};
  const A=W*H,k=W*A/(2*(W-d)),F=Fc+k*dp,dpmax=(lim-Fc)/k,ok=F<=lim;
  return{cap:"Force at the handle",value:f(F,0),unit:"N",status:{ok,text:ok?`Within ${lim} N`:`Over ${lim} N`},
   say:`At ${f(dp,0)} Pa, opening this ${f(W,2)} × ${f(H,2)} m door takes about ${B(f(F,0),"N")} (${f(F/9.81,1)} kgf). The most pressure difference this door can take and stay within ${lim} N is ${B(f(dpmax,0),"Pa")}.`+(ok?"":" Reduce the pressure with a relief damper or VFD control, or use a lighter door closer."),
   rows:[["Force from pressure",f(k*dp,0),"N"],["Closer force",f(Fc,0),"N"],["Door area",f(A,2),"m²"],["Maximum pressure difference",f(dpmax,0),"Pa"]]};
 },
 note:"F = Fdc + W·A·ΔP ÷ (2(W − d)) (NFPA 92 / EN 12101-6). Test with all other doors in the stair closed and the system running in fire mode, then with the fire floor door open."},

{id:"gtd",g:"tab",icon:"gtd",name:"Damper leakage test",short:"Gas-tight or fire damper leakage per m²",
 intro:"Enter the leakage you measured, the damper size and test pressure. You get leakage per m² and pass or fail against the class.",
 fields:[
  {id:"Q",label:"Measured leakage",type:"num",def:"3.2",units:["L/s","m³/h","CFM"],udef:"L/s"},
  {id:"W",label:"Damper width",type:"num",def:"600",unit:"mm",half:true},
  {id:"H",label:"Damper height",type:"num",def:"400",unit:"mm",half:true},
  {id:"P",label:"Pressure during test",type:"num",def:"1000",unit:"Pa",half:true},
  {id:"cls",label:"Acceptance",type:"select",def:"spec",options:[["spec","Project spec (enter below)"],["15.2|250","AMCA 511 Class 1A (15.2 L/s·m² at 250 Pa)"],["20.3|250","AMCA 511 Class 1 (20.3 L/s·m² at 250 Pa)"],["50.8|250","AMCA 511 Class 2 (50.8 L/s·m² at 250 Pa)"]]},
  {id:"lim",label:"Spec limit",type:"num",def:"5",unit:"L/s per m²",half:true,show:v=>v.cls==="spec"},
  {id:"Pl",label:"at pressure",type:"num",def:"1000",unit:"Pa",half:true,show:v=>v.cls==="spec"}
 ],
 calc(v){
  const Q=num(v.Q)*({"L/s":1,"m³/h":1/3.6,"CFM":0.471947}[v.Q_u]||1),A=num(v.W)*num(v.H)/1e6,P=num(v.P);if(!(Q>=0&&A>0&&P>0))return{hint:"Enter the leakage, damper size and test pressure."};
  let lim,Pl;if(v.cls==="spec"){lim=num(v.lim);Pl=num(v.Pl);}else[lim,Pl]=String(v.cls).split("|").map(Number);if(!(lim>0&&Pl>0))return{hint:"Enter the spec limit and its pressure."};
  const q=Q/A,qc=q*Math.pow(Pl/P,0.65),ok=qc<=lim;
  return{cap:"Leakage per m²",value:f(q,2),unit:"L/s·m²",status:{ok,text:ok?"Pass":"Fail"},
   say:`${f(Q,2)} L/s through ${f(A,3)} m² is ${B(f(q,2),"L/s per m²")} at ${f(P,0)} Pa.`+(Pl!==P?` Corrected to ${f(Pl,0)} Pa that is ${f(qc,2)} L/s per m².`:"")+` The limit is ${f(lim,2)}, so it ${ok?"passes":"fails: check blade and jamb seals, linkage adjustment and actuator end position"}.`,
   rows:[["Leakage at limit pressure",f(qc,2),"L/s·m²"],["Limit",f(lim,2),"L/s·m²"],["Damper area",f(A,3),"m²"],["Allowed total",f(lim*A,2),"L/s"]]};
 },
 note:"Leakage scales with pressure^0.65 when correcting to a different test pressure. Gas-tight dampers on LER, substation and CCR intakes usually have a project-specific limit; use that."},

{id:"calib",g:"tab",icon:"calib",name:"Instrument calibration check",short:"5-point error against tolerance",
 intro:"Enter the instrument range, the reference values you applied and what the instrument read. You get the error at each point and pass or fail.",
 fields:[
  {id:"lo",label:"Range low",type:"num",def:"0",unit:"",half:true},
  {id:"hi",label:"Range high",type:"num",def:"500",unit:"",half:true},
  {id:"ref",label:"Reference values applied",type:"text",def:"0 125 250 375 500"},
  {id:"rd",label:"Instrument readings",type:"text",def:"0.8 126.1 250.9 376.2 501.4"},
  {id:"tol",label:"Tolerance",type:"num",def:"0.5",unit:"% of span"}
 ],
 calc(v){
  const lo=num(v.lo),hi=num(v.hi),R=numsOf(v.ref),M=numsOf(v.rd),tol=num(v.tol)||0.5,sp=hi-lo;if(!(sp>0))return{hint:"Enter a range with high above low."};
  if(!R.length||R.length!==M.length)return{hint:`Enter the same number of reference values and readings (${R.length} and ${M.length}).`};
  const e=M.map((m,i)=>(m-R[i])/sp*100),mx=Math.max(...e.map(Math.abs)),ok=mx<=tol;
  return{cap:"Largest error",value:f(mx,2),unit:"% of span",status:{ok,text:ok?"As found: pass":"As found: fail"},
   say:`The worst point is ${B(f(mx,2),"%")} of span against a tolerance of ±${f(tol,2)} %.`+(ok?"":" Adjust zero and span, then repeat the check and record as-left values.")+(e.every(x=>x>0)||e.every(x=>x<0)?" All errors are on one side, which points to a zero offset.":""),
   rows:[["Span",f(sp),""],["Tolerance",f(tol*sp/100,3),"units"]],
   after:tbl(["Point","Reference","Reading","Error % span","4–20 mA expected"],R.map((r,i)=>({cls:Math.abs(e[i])>tol?"sel":"",c:[i+1,f(r,3),f(M[i],3),(e[i]>=0?"+":"")+f(e[i],2),f(4+16*(r-lo)/sp,2)]})))};
 },
 note:"Check at 0, 25, 50, 75 and 100 % of range, rising then falling for hysteresis. The reference must be at least 3–4 times more accurate than the instrument. Record as-found and as-left."},

{id:"sling",g:"tab",icon:"sling",name:"Rigging sling angle",short:"Load in each sling leg",
 intro:"Enter the load, number of legs and the sling angle. You get the tension in each leg and the sling rating you need.",
 fields:[
  {id:"Wt",label:"Load",type:"num",def:"2500",unit:"kg"},
  {id:"n",label:"Sling legs",type:"chips",def:"2",options:[["1","1"],["2","2"],["3","3"],["4","4"]]},
  {id:"mode",label:"Angle from",type:"chips",def:"len",options:[["len","Sling length and spread"],["ang","Angle I measured"]]},
  {id:"SL",label:"Sling leg length",type:"num",def:"3",unit:"m",half:true,show:v=>v.mode==="len"},
  {id:"sp",label:"Distance between lifting points",type:"num",def:"2.5",unit:"m",half:true,show:v=>v.mode==="len"},
  {id:"a",label:"Angle from horizontal",type:"num",def:"60",unit:"°",show:v=>v.mode==="ang"}
 ],
 calc(v){
  const Wt=num(v.Wt),n=+v.n;if(!(Wt>0))return{hint:"Enter the load."};let a;
  if(n===1)a=90;else if(v.mode==="ang")a=num(v.a);else{const SL=num(v.SL),sp=num(v.sp);if(!(SL>0)||!(sp>=0))return{hint:"Enter the sling length and spread."};if(sp/2>=SL)return{hint:"The spread is too wide for this sling length."};a=Math.asin(Math.sqrt(SL*SL-(sp/2)**2)/SL)*180/Math.PI;}
  if(!(a>0&&a<=90))return{hint:"Enter an angle between 0 and 90°."};
  const ne=n>=3?2:n,T=Wt/(ne*Math.sin(a*Math.PI/180)),ok=a>=45;
  return{cap:"Load in each leg",value:f(T,0),unit:"kg",status:{ok:a>=30,text:a<30?"Angle too flat: do not lift":a<45?"Low angle: tension high":"Good angle"},
   say:`At ${f(a,0)}° from horizontal, each leg carries ${B(f(T,0),"kg")} (${f(T*9.81/1000,1)} kN), ${f(T/(Wt/ne)*100-100,0)} % more than straight.`+(n>=3?" For 3 and 4-leg slings assume only 2 legs carry the load unless they are equalised.":"")+` Use slings with a working load limit of at least ${B(f(Math.ceil(T/250)*250,0),"kg")} per leg.`+(a<45?" Below 45° tensions rise fast; below 30° do not lift. Use longer slings or a spreader beam.":""),
   rows:[["Angle from horizontal",f(a,1),"°"],["Leg tension",f(T*9.81/1000,2),"kN"],["Legs assumed carrying",ne,""],["Tension factor",f(1/Math.sin(a*Math.PI/180),2),"×"]]};
 },
 note:"Leg tension = load ÷ (legs × sin angle). Lifting must follow an approved lift plan by a competent person; include hook, shackles and rigging weight in the load."},

{id:"stairp",g:"tab",icon:"stair",name:"Stair pressurisation",short:"Fan airflow for a pressurised stair",
 intro:"Enter the doors on the stair, the pressure to hold and the open-door airflow rule. You get the supply fan duty for both the doors-closed and door-open cases.",
 fields:[
  {id:"n",label:"Number of doors into the stair",help:"Count every floor door and the final exit door.",type:"num",def:"10",unit:"no."},
  {id:"Ad",label:"Leakage area per closed door",type:"chips",def:"0.01",options:[["0.01","Single, opens in (0.01 m²)"],["0.02","Single, opens out (0.02 m²)"],["0.03","Double door (0.03 m²)"],["0.06","Lift landing door (0.06 m²)"]]},
  {id:"dp",label:"Pressure difference to hold",help:"EN 12101-6 Class A uses 50 Pa. NFPA 92 needs at least 12.5 Pa in sprinklered buildings.",type:"num",def:"50",unit:"Pa",presets:[["12.5","12.5 NFPA"],["25","25"],["45","45"],["50","50 EN"]]},
  {id:"no",label:"Doors open at the same time",help:"EN 12101-6 Class A: 1 door. Use 2 or 3 for firefighting stairs.",type:"num",def:"1",unit:"no."},
  {id:"dw",label:"Open door width",type:"num",def:"0.9",unit:"m",half:true},
  {id:"dh",label:"Open door height",type:"num",def:"2.1",unit:"m",half:true},
  {id:"vel",label:"Velocity through the open door",type:"num",def:"0.75",unit:"m/s",presets:[["0.75","0.75 Class A"],["1","1.0"],["2","2.0 firefighting"]]},
  {id:"sf",label:"Allowance for other leakage",help:"Walls, lift shafts and unknown gaps. EN 12101-6 adds 50 %.",type:"num",def:"50",unit:"%",adv:true}
 ],
 calc(v){
  const n=num(v.n),Ad=num(v.Ad),dp=num(v.dp),no=num(v.no)||0,dw=num(v.dw),dh=num(v.dh),vel=num(v.vel),k=1+(num(v.sf)||0)/100;
  if(!(n>=1))return{hint:"Enter the number of doors."};if(!(dp>0))return{hint:"Enter the pressure difference."};if(!(no>=0&&no<n))return{hint:"Open doors must be fewer than the total doors."};if(!(dw>0&&dh>0&&vel>0))return{hint:"Enter the open door size and velocity."};
  const Qc=k*0.83*n*Ad*Math.sqrt(dp),Qo=vel*dw*dh*no+k*0.83*(n-no)*Ad*Math.sqrt(10),Q=Math.max(Qc,Qo);
  return{cap:"Supply fan duty",value:f(Q,2),unit:"m³/s",
   say:`With all doors shut, holding ${f(dp,1)} Pa needs ${B(f(Qc,2),"m³/s")}. With ${f(no,0)} door${no===1?"":"s"} open at ${f(vel,2)} m/s it needs ${B(f(Qo,2),"m³/s")}. Size the fan for ${B(f(Q,2),"m³/s")} (${f(Q*3600,0)} m³/h) and fit a pressure relief damper so the doors-closed case does not over-pressurise.`,
   rows:[["Fan duty",f(Q*2118.88,0),"CFM"],["Doors closed",f(Qc*3600,0),"m³/h"],["Door open",f(Qo*3600,0),"m³/h"],["Relief needed when doors shut",f(Math.max(Q-Qc,0)*3600,0),"m³/h"]]};
 },
 note:"Leakage Q = 0.83 × A × ΔP<sup>½</sup> (m³/s, m², Pa). Open door: Q = v × door area, with the closed doors at about 10 Pa. Check the door opening force (≤ 100 N EN, ≤ 133 N NFPA) with the Door opening force tool."}
);
