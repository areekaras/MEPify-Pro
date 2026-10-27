/* MEPify · Electrical tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
{id:"motor",g:"elec",icon:"motor",name:"Motor current",short:"Amps from kW, or kW from amps",
 intro:"Find the full-load current of a motor or load, or work out power from a clamp meter reading.",
 fields:[
  {id:"mode",label:"What do you know?",type:"chips",def:"kw",options:[["kw","The power (kW / HP)"],["amp","The measured amps"]]},
  {id:"P",label:"Motor power",type:"num",def:"15",units:["kW","HP"],udef:"kW",show:v=>v.mode==="kw"},
  {id:"I",label:"Measured current",type:"num",def:"26",unit:"A",show:v=>v.mode==="amp"},
  {id:"ph",label:"Supply",type:"chips",def:"3",options:[["3","3-phase"],["1","1-phase"]],onSet:v=>{v.V=v.ph==="3"?"415":"230";}},
  {id:"V",label:"Voltage",type:"num",def:"415",unit:"V",presets:[["400","400"],["415","415"],["230","230"],["240","240"]]},
  {id:"pf",label:"Power factor",help:"Use 1 for heaters.",type:"num",def:"0.85",unit:"cos φ",adv:true},
  {id:"eff",label:"Motor efficiency",help:"Use 100 for heaters.",type:"num",def:"90",unit:"%",adv:true}
 ],
 calc(v){
  const k=v.ph==="3"?SQ3:1,V=num(v.V),pf=num(v.pf),eff=num(v.eff)/100,phs=v.ph==="3"?"3-phase":"1-phase";
  if(!(V>0))return{hint:"Enter the supply voltage."};
  if(!(pf>0&&pf<=1&&eff>0&&eff<=1))return{hint:"Check More options: power factor must be 0 to 1 and efficiency 1 to 100 %."};
  if(v.mode==="kw"){
   let P=num(v.P);if(!(P>0))return{hint:"Enter the motor power."};if(v.P_u==="HP")P*=0.7457;
   const Pin=P/eff,I=Pin*1000/(k*V*pf);
   return{cap:"Full-load current",value:f(I,1),unit:"A",
    say:`A ${f(P,1)} kW motor on ${f(V)} V ${phs} draws about ${B(f(I,1),"A")} at full load. Starting direct-on-line, expect ${f(I*6,0)} to ${f(I*8,0)} A for a few seconds.`,
    rows:[["Power taken from supply",f(Pin,2),"kW"],["Apparent power",f(Pin/pf,2),"kVA"],["Star-delta start, approx",f(I*2,0)+"–"+f(I*2.7,0),"A"]]};
  }
  const I=num(v.I);if(!(I>0))return{hint:"Enter the measured current."};
  const kva=k*V*I/1000,Pin=kva*pf;
  return{cap:"Power drawn",value:f(Pin,2),unit:"kW",
   say:`At ${f(I,1)} A on ${f(V)} V ${phs}, the load is using about ${B(f(Pin,2),"kW")}. A motor at this current is giving about ${f(Pin*eff,2)} kW at the shaft.`,
   rows:[["Apparent power",f(kva,2),"kVA"],["Shaft output",f(Pin*eff,2),"kW"],["Shaft output",f(Pin*eff/0.7457,1),"HP"]]};
 },
 note:"Always check against the motor nameplate FLA."},

{id:"cable",g:"elec",icon:"cable",name:"Cable size",short:"Voltage drop and the right cable",
 intro:"Enter the current and cable length. You get the smallest cable that is safe and keeps voltage drop in limits.",
 fields:[
  {id:"I",label:"Load current",type:"num",def:"30",unit:"A",half:true},
  {id:"L",label:"Cable length",help:"One way, from panel to load.",type:"num",def:"80",unit:"m",half:true},
  {id:"ph",label:"Supply",type:"chips",def:"3",options:[["3","3-phase"],["1","1-phase"]],onSet:v=>{v.V=v.ph==="3"?"415":"230";}},
  {id:"mat",label:"Conductor",type:"chips",def:"cu",options:[["cu","Copper"],["al","Aluminium"]]},
  {id:"amb",label:"Air temperature around the cable",help:"The hottest it will see in service. The base table is for 30 °C.",type:"num",def:"40",unit:"°C",presets:[["30","30"],["40","40"],["45","45"],["50","50"]]},
  {id:"grp",label:"Circuits running together",help:"Count this circuit plus any others touching it in the same tray, trunking or bunch.",type:"num",def:"1",unit:"circuits",presets:[["1","Alone"],["2","2"],["3","3"],["4","4"],["6","6"],["9","9"]]},
  {id:"arr",label:"How are they laid?",type:"chips",def:"bunch",options:[["bunch","Bunched or in trunking / conduit"],["layer","Single layer on tray or wall"]],show:v=>num(v.grp)>1},
  {id:"V",label:"Voltage",type:"num",def:"415",unit:"V",adv:true},
  {id:"pf",label:"Power factor",type:"num",def:"0.85",unit:"cos φ",adv:true},
  {id:"lim",label:"Maximum voltage drop allowed",type:"num",def:"4",unit:"%",adv:true,presets:[["3","3 % lighting"],["4","4 %"],["5","5 % power"]]},
  {id:"size",label:"Check a specific size",type:"select",def:"auto",options:[["auto","Use the recommended size"]].concat(SIZES.map(s=>[String(s),s+" mm²"])),adv:true}
 ],
 calc(v){
  const k=v.ph==="3"?SQ3:2,rho=v.mat==="al"?0.036:0.0225,I=num(v.I),L=num(v.L),V=num(v.V),pf=num(v.pf),lim=num(v.lim),af=v.mat==="al"?0.78:1;
  if(!(I>0))return{hint:"Enter the load current."};if(!(L>0))return{hint:"Enter the cable length."};
  if(!(V>0&&pf>0&&pf<=1&&lim>0))return{hint:"Check More options: voltage, power factor and drop limit."};
  const amb=num(v.amb),grp=Math.round(num(v.grp));
  if(!isFinite(amb))return{hint:"Enter the air temperature around the cable."};
  if(amb>=60)return{hint:"PVC cable cannot be used at 60 °C or above. Use XLPE or heat-resistant cable and the manufacturer's ratings."};
  if(!(grp>=1))return{hint:"Enter how many circuits run together (1 if it runs alone)."};
  const Ct=derT(amb),Cg=derG(grp,v.arr),Cd=Ct*Cg;
  const sn=Math.sqrt(1-pf*pf),X=0.00008;
  const rows=SIZES.map((a,i)=>{const d=k*L*I*(rho/a*pf+X*sn);return{a,d,pct:d/V*100,amp:AMP_CU[i]*af*Cd};}).map(r=>Object.assign(r,{okA:r.amp>=I,okV:r.pct<=lim}));
  const rec=rows.find(r=>r.okA&&r.okV);
  const cur=(v.size!=="auto"&&rows.find(r=>String(r.a)===v.size))||rec||rows[rows.length-1];
  const pass=cur.okA&&cur.okV;
  const maxP=lim*2;
  const tbl=`<div class="card" style="padding:10px"><div class="tbl"><div class="tr head"><span>Size mm²</span><span class="r">Rating</span><span>Voltage drop</span><span class="r">%</span></div>${rows.map(r=>`<div class="tr${r===cur?" sel":""}" data-a="${r.a}" role="button" tabindex="0"><span class="${r===rec?"rec":""}">${r.a}${r===rec?" ✓":""}</span><span class="r ${r.okA?"":"x"}">${f(r.amp,0)} A</span><span class="b"><i class="${r.okV?"":"over"}" style="width:${Math.min(100,r.pct/maxP*100)}%"></i></span><span class="r ${r.okV?"":"x"}">${f(r.pct,1)}</span></div>`).join("")}</div><p class="note" style="padding:6px 8px 2px">Tap any size to check it. Red means too small.</p></div>`;
  const mat=v.mat==="al"?"aluminium":"copper";
  return{cap:v.size==="auto"?"Recommended cable":"Checking cable",value:cur.a,unit:"mm²",
   status:{ok:pass,text:pass?"Safe and within voltage drop":!cur.okA?"Too small for this current":"Voltage drop too high"},
   say:(rec?`For ${f(I)} A over ${f(L)} m, use at least ${B(rec.a,"mm²")} ${mat} cable. Voltage drop at ${cur.a} mm² is ${f(cur.pct,1)} % (${f(cur.d,1)} V).`:`No size up to 300 mm² works for ${f(I)} A over ${f(L)} m. Use parallel cables or a higher voltage.`)
    +(Cd<0.995?` Ratings are reduced to ${B(f(Cd*100,0),"%")} for ${f(amb,0)} °C${grp>1?` and ${grp} grouped circuits`:""}.`:""),
   rows:[["Voltage drop",f(cur.d,1),"V"],["Voltage at load",f(V-cur.d,0),"V"],["Derated cable rating",f(cur.amp,0),"A"],["Temperature factor",f(Ct,2),"Ca"],["Grouping factor",f(Cg,2),"Cg"]],after:tbl};
 },
 bind(el,st){el.querySelectorAll(".tr[data-a]").forEach(r=>{const go=()=>{st.size=r.dataset.a;show();};r.onclick=go;r.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}};});},
 note:"Base ratings: multicore PVC (70 °C) cable in air, IEC 60364-5-52 method C, derated for air temperature (Table B.52.14) and grouping (Table B.52.17). Not covered: buried cables, thermal insulation, direct sun, XLPE cables (these carry more: use the manufacturer's table). Voltage drop includes typical reactance (0.08 Ω/km)."},

{id:"ohm",g:"elec",icon:"ohm",name:"Ohm's law",short:"Volts, amps, ohms, watts",
 intro:"Type any two values. The other two are worked out. Clear a box to swap which ones you use.",
 fields:[
  {id:"V",label:"Voltage",type:"num",def:"230",unit:"V",half:true},
  {id:"I",label:"Current",type:"num",def:"10",unit:"A",half:true},
  {id:"R",label:"Resistance",type:"num",def:"",unit:"Ω",half:true},
  {id:"P",label:"Power",type:"num",def:"",unit:"W",half:true}
 ],
 calc(v){
  const ks=["V","I","R","P"].filter(k=>num(v[k])>0);
  if(ks.length<2)return{hint:"Type any two of voltage, current, resistance and power."};
  if(ks.length>2)return{hint:"You have filled in more than two boxes. Clear one so only two are left."};
  let V,I,R,P;const g={};ks.forEach(k=>g[k]=num(v[k]));({V,I,R,P}=g);const h=x=>x!==undefined;
  if(h(V)&&h(I)){R=V/I;P=V*I}else if(h(V)&&h(R)){I=V/R;P=V*V/R}else if(h(V)&&h(P)){I=P/V;R=V*V/P}
  else if(h(I)&&h(R)){V=I*R;P=I*I*R}else if(h(I)&&h(P)){V=P/I;R=P/(I*I)}else{V=Math.sqrt(P*R);I=Math.sqrt(P/R)}
  const all={V:["Voltage",V,"V"],I:["Current",I,"A"],R:["Resistance",R,"Ω"],P:["Power",P,"W"]};
  const un=["V","I","R","P"].filter(k=>!ks.includes(k));
  return{cap:all[un[0]][0],value:f(all[un[0]][1]),unit:all[un[0]][2],
   say:`${all[un[0]][0]} is ${B(f(all[un[0]][1]),all[un[0]][2])} and ${all[un[1]][0].toLowerCase()} is ${B(f(all[un[1]][1]),all[un[1]][2])}.`,
   rows:ks.map(k=>[all[k][0]+" (you entered)",f(all[k][1]),all[k][2]])};
 }},

{id:"pf",g:"elec",icon:"pf",name:"Power factor fix",short:"Capacitor kVAr to improve PF",
 intro:"Enter the load and its power factor now. You get the capacitor size to reach your target.",
 fields:[
  {id:"kw",label:"Load power",type:"num",def:"100",unit:"kW"},
  {id:"p1",label:"Power factor now",type:"num",def:"0.78",unit:"cos φ",half:true},
  {id:"p2",label:"Target power factor",type:"num",def:"0.95",unit:"cos φ",half:true,presets:[["0.9","0.90"],["0.95","0.95"],["0.98","0.98"]]},
  {id:"V",label:"Voltage (3-phase)",type:"num",def:"415",unit:"V",adv:true}
 ],
 calc(v){
  const P=num(v.kw),p1=num(v.p1),p2=num(v.p2),V=num(v.V);
  if(!(P>0))return{hint:"Enter the load power."};
  if(!(p1>0&&p1<1&&p2>0&&p2<=1))return{hint:"Power factors must be between 0 and 1, for example 0.8."};
  if(p2<=p1)return{hint:"The target power factor must be higher than the one you have now."};
  const Q=P*(Math.tan(Math.acos(p1))-Math.tan(Math.acos(p2))),s1=P/p1,s2=P/p2,I1=s1*1000/(SQ3*V),I2=s2*1000/(SQ3*V);
  return{cap:"Capacitor needed",value:f(Q,1),unit:"kVAr",
   say:`Add about ${B(f(Q,1),"kVAr")} of capacitors. Line current drops from ${f(I1,0)} A to ${f(I2,0)} A, which is ${f((1-I2/I1)*100,0)} % less.`,
   rows:[["kVA before",f(s1,1),"kVA"],["kVA after",f(s2,1),"kVA"]]};
 },

 note:"Round up to the next standard capacitor bank size."},

{id:"ir",g:"elec",icon:"ir",name:"Insulation resistance",short:"Megger test: IR, temperature correction, PI",
 intro:"Enter the equipment and your megger readings. You get the test voltage to use, the IR corrected for temperature, the polarisation index and a pass or fail.",
 fields:[
  {id:"eq",label:"Equipment",type:"chips",def:"lvm",options:[["lvm","LV motor / random-wound"],["hvm","HV motor / form-wound"],["cab","LV cable or switchgear"],["hvc","HV cable"]]},
  {id:"V",label:"Rated voltage",type:"num",def:"415",unit:"V"},
  {id:"r1",label:"IR reading at 1 minute",type:"num",def:"850",unit:"MΩ"},
  {id:"r10",label:"IR reading at 10 minutes",help:"Leave blank if you only took the 1-minute reading.",type:"num",def:"2400",unit:"MΩ"},
  {id:"r30",label:"IR reading at 30 seconds (for DAR)",help:"Optional. DAR = 1 min ÷ 30 s, a quick check when a 10-minute test is not practical.",type:"num",def:"",unit:"MΩ",adv:true},
  {id:"T",label:"Winding or cable temperature",type:"num",def:"35",unit:"°C"},
  {id:"tb",label:"Correct to",type:"chips",def:"40",options:[["40","40 °C (IEEE 43)"],["20","20 °C"]],adv:true},
  {id:"min",label:"Project minimum (optional)",help:"Overrides the default minimum below.",type:"num",def:"",unit:"MΩ",adv:true}
 ],
 calc(v){
  const V=num(v.V),r1=num(v.r1),r10=num(v.r10),T=num(v.T),tb=num(v.tb);
  if(!(V>0))return{hint:"Enter the rated voltage."};if(!(r1>0))return{hint:"Enter the 1-minute IR reading."};if(!isFinite(T))return{hint:"Enter the temperature at the time of the test."};
  const kV=V/1000,tv=V<1000?"500 V DC (1000 V DC for 690–1000 V)":V<=2500?"500–1000 V DC":V<=5000?"1000–2500 V DC":V<=12000?"2500–5000 V DC":"5000–10000 V DC";
  const kt=Math.pow(0.5,(tb-T)/10),rc=r1*kt;
  const defMin={lvm:5,hvm:100,cab:Math.max(1,kV+1),hvc:Math.max(100,(kV+1)*10)}[v.eq],mn=num(v.min)>0?num(v.min):defMin;
  const pi=r10>0?r10/r1:NaN,r30=num(v.r30),dar=r30>0?r1/r30:NaN,darTxt=!isFinite(dar)?"":` DAR is ${B(f(dar,2))}: ${dar<1?"poor, likely wet":dar<1.25?"questionable":dar<1.6?"good":"excellent"}.`;
  const piTxt=!isFinite(pi)?"":r1>5000?" PI is not needed because the 1-minute reading is above 5000 MΩ.":pi<1?` PI is ${B(f(pi,2))}, which is poor: the insulation is likely wet or contaminated.`:pi<2?` PI is ${B(f(pi,2))}, which is questionable. Most specs need 2.0 or more for class B, F and H insulation.`:pi<4?` PI is ${B(f(pi,2))}, which is good.`:` PI is ${B(f(pi,2))}, which is very good.`;
  const piBad=isFinite(pi)&&r1<=5000&&pi<2&&(v.eq==="lvm"||v.eq==="hvm");
  const ok=rc>=mn&&!piBad;
  return{cap:`IR corrected to ${tb} °C`,value:f(rc,rc<10?2:0),unit:"MΩ",status:{ok,text:ok?"Pass":rc<mn?"Below minimum":"PI too low"},
   say:`Test at ${B(tv)}. Your ${f(r1)} MΩ reading at ${f(T,1)} °C is ${B(f(rc,rc<10?2:0),"MΩ")} at ${tb} °C, against a minimum of ${f(mn,1)} MΩ.`+piTxt+darTxt,
   rows:[["Temperature factor",f(kt,3),"×"],["Minimum used",f(mn,1),"MΩ"],["Polarisation index",isFinite(pi)?f(pi,2):"—",""],["DAR (60 s ÷ 30 s)",isFinite(dar)?f(dar,2):"—",""]]};
 },
 note:"IR halves for every 10 °C rise, so readings are corrected to a base temperature. Minimums follow IEEE 43 for machines (5 MΩ random-wound, 100 MΩ form-wound) and a common (kV + 1) MΩ rule for cables. Your project spec governs."},

{id:"ct",g:"elec",icon:"ct",name:"CT ratio",short:"Primary current, CT selection, burden, ratio test",
 intro:"Work out the real current from a CT secondary reading, choose a CT for a load, check the burden, or check a ratio test result.",
 fields:[
  {id:"mode",label:"What do you need?",type:"chips",def:"read",options:[["read","Secondary to primary"],["sel","Choose a CT"],["burd","Burden check"],["test","Ratio test"]]},
  {id:"pri",label:"CT primary rating",type:"num",def:"400",unit:"A",half:true,show:v=>v.mode!=="sel"},
  {id:"sec",label:"CT secondary rating",type:"chips",def:"5",options:[["5","5 A"],["1","1 A"]]},
  {id:"Is",label:"Secondary current measured",type:"num",def:"3.6",unit:"A",show:v=>v.mode==="read"},
  {id:"vt",label:"VT ratio (optional)",help:"For energy meters, for example 11000/110 = 100. Leave 1 for LV.",type:"num",def:"1",unit:"",adv:true,show:v=>v.mode==="read"},
  {id:"fla",label:"Full-load current of the feeder",type:"num",def:"280",unit:"A",show:v=>v.mode==="sel"},
  {id:"use",label:"Used for",type:"chips",def:"m",options:[["m","Metering"],["p","Protection"]],show:v=>v.mode==="sel"||v.mode==="test"},
  {id:"va",label:"CT rated burden",type:"num",def:"15",unit:"VA",half:true,show:v=>v.mode==="burd"},
  {id:"dev",label:"Meters and relays burden",help:"Add the VA of every device on the CT circuit.",type:"num",def:"2.5",unit:"VA",half:true,show:v=>v.mode==="burd"},
  {id:"L",label:"Cable length, one way",type:"num",def:"40",unit:"m",half:true,show:v=>v.mode==="burd"},
  {id:"mm",label:"Cable size",type:"chips",def:"2.5",options:[["1.5","1.5 mm²"],["2.5","2.5 mm²"],["4","4 mm²"],["6","6 mm²"]],show:v=>v.mode==="burd"},
  {id:"Ip",label:"Primary current injected",type:"num",def:"200",unit:"A",half:true,show:v=>v.mode==="test"},
  {id:"Im",label:"Secondary current measured",type:"num",def:"2.49",unit:"A",half:true,show:v=>v.mode==="test"},
  {id:"cls",label:"Accuracy class",type:"chips",def:"0.5",options:[["0.2","0.2"],["0.5","0.5"],["1","1"],["3","3"],["1p","5P / 10P (±1 %)"]],show:v=>v.mode==="test"}
 ],
 calc(v){
  const sec=num(v.sec)||5,pri=num(v.pri);
  if(v.mode==="sel"){const fla=num(v.fla);if(!(fla>0))return{hint:"Enter the full-load current."};
   const STD=[5,10,15,20,25,30,40,50,60,75,100,150,200,250,300,400,500,600,750,800,1000,1200,1250,1500,1600,2000,2500,3000,4000,5000];
   const need=fla*(v.use==="m"?1.25:1.0),p=STD.find(x=>x>=need)||Math.ceil(need/500)*500,load=fla/p*100;
   return{cap:"CT ratio",value:`${p}/${sec}`,unit:"A",status:{ok:load>=40&&load<=100,text:`Full load at ${f(load,0)} % of CT rating`},
    say:`For ${f(fla)} A full load, use a ${B(p+"/"+sec+" A")} CT. At full load the secondary carries ${B(f(fla/p*sec,2),"A")}.`+(v.use==="m"?" For metering, keep normal load between about 40 and 100 % of the CT rating so the meter stays accurate.":" For protection, also check the accuracy limit factor (for example 5P20) covers the fault current, and that the relay settings fit the ratio."),
    rows:[["CT ratio",f(p/sec,0),": 1"],["Secondary at full load",f(fla/p*sec,2),"A"],["Load on CT",f(load,0),"%"]]};}
  if(!(pri>0))return{hint:"Enter the CT primary rating."};const K=pri/sec;
  if(v.mode==="read"){const Is=num(v.Is),vt=num(v.vt)||1;if(!(Is>=0))return{hint:"Enter the secondary current."};const Ip=Is*K;
   return{cap:"Primary current",value:f(Ip,1),unit:"A",status:{ok:Is<=sec*1.2,text:Is>sec?"Above CT rating":`${f(Is/sec*100,0)} % of CT rating`},
    say:`${f(Is,2)} A on a ${f(pri)}/${sec} A CT means ${B(f(Ip,1),"A")} is flowing in the primary (ratio ${f(K,0)}).`+(vt!==1?` Meter multiplier with the VT is ${B(f(K*vt,0))}: multiply the meter reading by this.`:` Multiply meter readings by ${B(f(K,0))}.`),
    rows:[["CT ratio",f(K,0),": 1"],["Meter multiplier",f(K*vt,0),"×"],["Secondary loading",f(Is/sec*100,0),"%"]]};}
  if(v.mode==="burd"){const va=num(v.va),dev=num(v.dev)||0,L=num(v.L)||0,A=num(v.mm);if(!(va>0))return{hint:"Enter the CT rated burden."};
   const R=2*L*0.0216/A,lead=sec*sec*R,tot=dev+lead,ok=tot<=va;
   return{cap:"Total burden",value:f(tot,2),unit:"VA",status:{ok,text:ok?`Within ${f(va)} VA rating`:"Over the CT rating"},
    say:`The ${f(L)} m cable loop (${f(2*L)} m of ${A} mm²) adds ${B(f(lead,2),"VA")} at ${sec} A. With ${f(dev,1)} VA of devices, the total is ${B(f(tot,2),"VA")} against the CT's ${f(va)} VA.`+(ok?"":` Over-burdened CTs lose accuracy and may saturate. Use bigger cable, a 1 A CT, or a CT with a higher VA.`)+(sec===5&&lead>dev?" Most of the burden is the cable; a 1 A CT would cut it by 25 times.":""),
    rows:[["Cable resistance (loop)",f(R,3),"Ω"],["Cable burden",f(lead,2),"VA"],["Devices",f(dev,2),"VA"],["Spare",f(va-tot,2),"VA"]]};}
  const Ip=num(v.Ip),Im=num(v.Im);if(!(Ip>0&&Im>0))return{hint:"Enter the injected and measured currents."};
  const err=(K*Im-Ip)/Ip*100,lim=v.cls==="1p"?1:num(v.cls),ok=Math.abs(err)<=lim;
  return{cap:"Ratio error",value:(err>=0?"+":"")+f(err,2),unit:"%",status:{ok,text:ok?`Within class ${v.cls==="1p"?"5P/10P":v.cls}`:"Outside class limit"},
   say:`Injecting ${f(Ip)} A should give ${B(f(Ip/K,3),"A")} on the secondary. You measured ${f(Im,3)} A, a ratio error of ${B((err>=0?"+":"")+f(err,2),"%")} against a limit of ±${lim} %.`+(ok?"":" Check the CT tap or ratio setting, the test set, open or shorted turns, and that the secondary is not shorted elsewhere."),
   rows:[["Measured ratio",f(Ip/Im,1),": 1"],["Nameplate ratio",f(K,1),": 1"],["Expected secondary",f(Ip/K,3),"A"]]};
 },
 note:"Never open-circuit a live CT secondary: it produces dangerous high voltage. Short the secondary before disconnecting a meter or relay. Ratio limits shown are at rated current (IEC 61869-2); lower currents allow a wider limit."},

{id:"wind",g:"elec",icon:"wind",name:"Winding resistance",short:"Phase balance and 20 °C correction",
 intro:"Enter the three winding or phase-to-phase resistances and the winding temperature. You get the balance and the values corrected to 20 °C.",
 fields:[
  {id:"r",label:"Three resistance readings",help:"U-V, V-W, W-U (or U1-U2, V1-V2, W1-W2), separated by spaces.",type:"text",def:"0.412 0.415 0.409"},
  {id:"un",label:"Unit",type:"chips",def:"Ω",options:[["Ω","Ω"],["mΩ","mΩ"]]},
  {id:"T",label:"Winding temperature",help:"Use ambient if the motor has been off for many hours.",type:"num",def:"34",unit:"°C"},
  {id:"mat",label:"Conductor",type:"chips",def:"234.5",options:[["234.5","Copper"],["225","Aluminium"]]},
  {id:"lim",label:"Allowed imbalance",type:"num",def:"2",unit:"%",adv:true},
  {id:"fac",label:"Factory value at 20 °C (optional)",type:"num",def:"",unitFrom:v=>v.un,adv:true}
 ],
 calc(v){
  const r=numsOf(v.r),T=num(v.T),k=num(v.mat),lim=num(v.lim)||2,fac=num(v.fac);if(r.length!==3)return{hint:`Enter three readings. You have ${r.length}.`};if(!isFinite(T))return{hint:"Enter the winding temperature."};
  const av=(r[0]+r[1]+r[2])/3,ub=Math.max(...r.map(x=>Math.abs(x-av)))/av*100,c=(k+20)/(k+T),r20=r.map(x=>x*c),a20=av*c,ok=ub<=lim,u=v.un;
  return{cap:"Imbalance",value:f(ub,2),unit:"%",status:{ok,text:ok?"Balanced":"Imbalance too high"},
   say:`The readings are within ${B(f(ub,2),"%")} of their average (limit ${f(lim,1)} %). Corrected to 20 °C the average is ${B(f(a20,4),u)}.`+(fac>0?` That is ${f((a20-fac)/fac*100,1)} % from the factory value.`:"")+(ok?"":" Look for a loose or high-resistance connection, a wrong tap, or shorted turns before energising."),
   rows:[["Average",f(av,4),u],["Average at 20 °C",f(a20,4),u],["Correction factor",f(c,4),""]],
   after:tbl(["Phase","Measured","At 20 °C"],r.map((x,i)=>[["1","2","3"][i],f(x,4),f(r20[i],4)]))};
 },
 note:"R20 = R × (k + 20) ÷ (k + T), k = 234.5 for copper and 225 for aluminium. Use a 4-wire micro-ohmmeter or low-resistance bridge. 2 % imbalance is a common limit for motors; transformers use the maker's figures."},

{id:"zs",g:"elec",icon:"zs",name:"Earth loop impedance",short:"Maximum Zs for a breaker, pass or fail",
 intro:"Pick the breaker and enter the measured earth fault loop impedance. You find out if the breaker will trip fast enough on an earth fault.",
 fields:[
  {id:"ty",label:"Breaker curve",type:"chips",def:"C",options:[["B","Type B"],["C","Type C"],["D","Type D"]]},
  {id:"In",label:"Breaker rating",type:"chips",def:"32",options:[6,10,16,20,25,32,40,50,63,80,100,125].map(x=>[String(x),x+" A"])},
  {id:"U0",label:"Voltage to earth",type:"num",def:"240",unit:"V"},
  {id:"Zs",label:"Measured Zs",type:"num",def:"0.62",unit:"Ω"},
  {id:"hot",label:"Allow for conductor heating",help:"Readings are taken cold. Comparing with 80 % of the limit allows for cables at full temperature.",type:"chips",def:"1",options:[["1","Yes (80 % rule)"],["0","No"]],adv:true}
 ],
 calc(v){
  const In=num(v.In),U0=num(v.U0),Zs=num(v.Zs),m={B:5,C:10,D:20}[v.ty],Ia=m*In;if(!(U0>0))return{hint:"Enter the voltage to earth."};
  const Zmax=0.95*U0/Ia,Zchk=v.hot==="1"?0.8*Zmax:Zmax,ok=Zs>=0&&Zs<=Zchk,If=Zs>0?U0/Zs:NaN;
  return{cap:"Maximum Zs",value:f(Zchk,3),unit:"Ω",status:Zs>=0?{ok,text:ok?"Pass":"Fail"}:null,
   say:`A ${In} A type ${v.ty} breaker needs at least ${f(Ia,0)} A to trip instantly, so Zs must not exceed ${B(f(Zmax,3),"Ω")}${v.hot==="1"?`, or ${B(f(Zchk,3),"Ω")} for a cold reading`:""}.`+(Zs>0?` Your ${f(Zs,3)} Ω gives a fault current of about ${f(If,0)} A, so it ${ok?"passes":"fails: use a larger protective conductor, shorten the run, change to a type B or lower-rated breaker, or add an RCD"}.`:""),
   rows:[["Instant trip current",f(Ia,0),"A"],["Limit (hot)",f(Zmax,3),"Ω"],["Limit for cold reading",f(Zchk,3),"Ω"],["Prospective fault current",isFinite(If)?f(If,0):"—","A"]]};
 },
 note:"Zs ≤ Cmin × U0 ÷ Ia with Cmin 0.95 (IEC 60364-4-41 / BS 7671), Ia = 5, 10 or 20 × In for type B, C, D (0.4 s and 5 s disconnection). For fuses and adjustable breakers, use the maker's time-current curve."},

{id:"vdip",g:"elec",icon:"vdip",name:"Voltage dip at motor start",short:"Will a big motor start dip the supply too much?",
 intro:"Enter the supply (transformer or generator) and the motor. You get the voltage dip when the motor starts.",
 fields:[
  {id:"src",label:"Supply",type:"chips",def:"tx",options:[["tx","Transformer"],["gen","Generator"]]},
  {id:"kva",label:"Supply rating",type:"num",def:"1000",unit:"kVA",half:true},
  {id:"z",label:"Impedance %Z (or generator X″d)",help:"Transformers 4–6 %, generators often 12–20 %.",type:"num",def:"5",unit:"%",half:true},
  {id:"kw",label:"Motor rating",type:"num",def:"75",unit:"kW",half:true},
  {id:"st",label:"Starting method",type:"chips",def:"6.5",options:[["6.5","DOL"],["2.2","Star-delta"],["3","Soft starter"],["1.2","VFD"]]},
  {id:"base",label:"Load already on the supply",type:"num",def:"400",unit:"kVA",adv:true},
  {id:"lim",label:"Allowed dip",type:"num",def:"15",unit:"%",adv:true}
 ],
 calc(v){
  const kva=num(v.kva),z=num(v.z)/100,kw=num(v.kw),m=num(v.st),base=num(v.base)||0,lim=num(v.lim)||15;if(!(kva>0&&z>0))return{hint:"Enter the supply rating and impedance."};if(!(kw>0))return{hint:"Enter the motor rating."};
  const Ssc=kva/z,Sm=kw/(0.9*0.86),Ss=Sm*m,dip=Ss/(Ssc+Ss)*100,ok=dip<=lim;
  return{cap:"Voltage dip",value:f(dip,1),unit:"%",status:{ok,text:ok?`Within ${lim} %`:`Over ${lim} %`},
   say:`Starting the ${f(kw)} kW motor ${({"6.5":"direct-on-line","2.2":"star-delta","3":"on a soft starter","1.2":"on a VFD"})[v.st]} draws about ${B(f(Ss,0),"kVA")}. On a supply with ${f(Ssc/1000,1)} MVA fault level this dips the voltage by about ${B(f(dip,1),"%")}.`+(ok?"":" Contactors may drop out and lights flicker. Use a soft starter or VFD, or a larger supply.")+(v.src==="gen"&&base>0?` With ${f(base,0)} kVA already running, also check the generator's motor-starting curve.`:""),
   rows:[["Supply fault level",f(Ssc,0),"kVA"],["Motor running",f(Sm,0),"kVA"],["Motor starting",f(Ss,0),"kVA"],["Starting current",f(Ss*1000/(SQ3*415),0),"A at 415 V"]]};
 },
 note:"Dip ≈ S_start ÷ (S_sc + S_start), where S_sc = kVA ÷ %Z. Ignores cable impedance and upstream source, so the real dip is a little larger. Limits: 15 % at the motor and 10 % at sensitive loads are common."},

{id:"unbal",g:"elec",icon:"unbal",name:"Voltage & current unbalance",short:"% unbalance and motor derating",
 intro:"Enter the three line-to-line voltages or the three phase currents.",
 fields:[
  {id:"mode",label:"What did you measure?",type:"chips",def:"v",options:[["v","Voltages"],["i","Currents"]]},
  {id:"a",label:"L1–L2 / L1",type:"num",def:"412",unitFrom:v=>v.mode==="v"?"V":"A",half:true},
  {id:"b",label:"L2–L3 / L2",type:"num",def:"418",unitFrom:v=>v.mode==="v"?"V":"A",half:true},
  {id:"c",label:"L3–L1 / L3",type:"num",def:"405",unitFrom:v=>v.mode==="v"?"V":"A"}
 ],
 calc(v){
  const x=[num(v.a),num(v.b),num(v.c)];if(!x.every(n=>n>0))return{hint:"Enter all three readings."};
  const avg=(x[0]+x[1]+x[2])/3,dev=Math.max(...x.map(n=>Math.abs(n-avg))),u=dev/avg*100,un=v.mode==="v"?"V":"A";
  if(v.mode==="i"){const ok=u<=10;
   return{cap:"Current unbalance",value:f(u,1),unit:"%",status:{ok,text:ok?"Within 10 %":"Too high"},
    say:`Average current is ${f(avg,1)} A and the largest deviation is ${f(dev,1)} A, so unbalance is ${B(f(u,1),"%")}. `+(ok?"That is acceptable for most motors.":"Check the supply voltage balance first, then loose connections, the starter contacts and the winding resistance."),
    rows:[["Average",f(avg,2),"A"],["Max deviation",f(dev,2),"A"]]};}
  const tab=[[0,1],[1,1],[2,0.95],[3,0.88],[4,0.82],[5,0.75]];let dr=NaN;
  if(u<=5){for(let i=0;i<tab.length-1;i++)if(u>=tab[i][0]&&u<=tab[i+1][0]){dr=tab[i][1]+(tab[i+1][1]-tab[i][1])*(u-tab[i][0]);break;}}
  const st=u<=1?{ok:true,text:"Good"}:u<=2?{ok:true,text:"Acceptable"}:{ok:false,text:u<=5?"Derate motors":"Do not run motors"};
  return{cap:"Voltage unbalance",value:f(u,2),unit:"%",status:st,
   say:`Average voltage is ${f(avg,1)} V and the largest deviation is ${f(dev,1)} V, so unbalance is ${B(f(u,2),"%")}. `+(u<=1?"Motors can run at full rating.":u<=5?`Motors should be derated to about ${B(f(dr*100,0),"%")} of their rating. Expect current unbalance of roughly ${f(u*6,0)} to ${f(u*10,0)} %.`:"Above 5 %, NEMA advises not to run motors. Find the cause in the supply."),
   rows:[["Average",f(avg,1),un],["Max deviation",f(dev,1),un],["Motor derating factor",isFinite(dr)?f(dr,2):"—","×"]]};
 },
 note:"NEMA MG 1 method: % unbalance = maximum deviation from average ÷ average × 100. Derating follows the NEMA MG 1 curve. Most commissioning specs allow 1 % voltage and 10 % current unbalance."},

{id:"ma",g:"elec",icon:"ma",name:"4–20 mA scaling",short:"Loop current ↔ process value",
 intro:"Set the transmitter range, then convert a loop current to a reading or a reading to the current you should see.",
 fields:[
  {id:"mode",label:"What do you have?",type:"chips",def:"ma",options:[["ma","A current (mA)"],["pv","A process value"]]},
  {id:"lo",label:"Range low (at 4 mA)",type:"num",def:"0",unit:"",half:true},
  {id:"hi",label:"Range high (at 20 mA)",type:"num",def:"500",unit:"",half:true},
  {id:"I",label:"Loop current",type:"num",def:"12",unit:"mA",show:v=>v.mode==="ma",presets:[["4","4"],["8","8"],["12","12"],["16","16"],["20","20"]]},
  {id:"pv",label:"Process value",type:"num",def:"250",unit:"",show:v=>v.mode==="pv"},
  {id:"sq",label:"Output type",type:"chips",def:"lin",options:[["lin","Linear"],["sqrt","Square root (DP flow)"]],adv:true}
 ],
 calc(v){
  const lo=num(v.lo),hi=num(v.hi),sq=v.sq==="sqrt";if(!isFinite(lo)||!isFinite(hi)||hi===lo)return{hint:"Enter a range with different low and high values."};
  const span=hi-lo,tbl=[0,25,50,75,100].map(p=>[`${p} %`,f(4+p*0.16,2)+" mA",f(lo+span*(sq?Math.sqrt(p/100):p/100),3)]);
  const after=`<div class="card" style="padding:10px"><div class="ptab"><table class="fit"><thead><tr><th>% signal</th><th>Current</th><th>Value</th></tr></thead><tbody>${tbl.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div><p class="note" style="padding:6px 8px 2px">Five-point check for loop calibration.</p></div>`;
  if(v.mode==="ma"){const I=num(v.I);if(!isFinite(I))return{hint:"Enter the loop current."};
   const p=(I-4)/16,pv=lo+span*(sq?Math.sqrt(Math.max(p,0)):p);
   const fault=I<3.8?{ok:false,text:"Below range: fault or open loop"}:I>20.5?{ok:false,text:"Above range: fault"}:{ok:true,text:"Signal in range"};
   return{cap:"Process value",value:f(pv,3),unit:"",status:fault,
    say:`${f(I,2)} mA is ${B(f(p*100,1),"%")} of the signal, which reads ${B(f(pv,3))} on a ${f(lo)} to ${f(hi)} range.`+(I<3.8||I>20.5?" NAMUR NE 43 treats currents below 3.8 mA or above 20.5 mA as a fault.":""),
    rows:[["Signal",f(p*100,2),"%"],["Span",f(span),""]],after};}
  const pv=num(v.pv);if(!isFinite(pv))return{hint:"Enter the process value."};
  const r=(pv-lo)/span,p=sq?r*r:r,I=4+16*p;
  return{cap:"Expected current",value:f(I,3),unit:"mA",
   say:`A reading of ${f(pv)} should give ${B(f(I,3),"mA")} (${f(p*100,1)} % of the signal).`,rows:[["Signal",f(p*100,2),"%"],["Span",f(span),""]],after};
 },
 note:"Linear: value = low + (mA − 4) ÷ 16 × span. Square root output is used on DP flow transmitters, where flow ∝ √(signal)."},

{id:"rtd",g:"elec",icon:"rtd",name:"RTD (PT100)",short:"Resistance ↔ temperature",
 intro:"Convert an RTD resistance to temperature, or find the resistance to simulate a temperature.",
 fields:[
  {id:"type",label:"Sensor",type:"chips",def:"100",options:[["100","PT100"],["1000","PT1000"]]},
  {id:"mode",label:"What do you have?",type:"chips",def:"r",options:[["r","A resistance"],["t","A temperature"]]},
  {id:"R",label:"Measured resistance",type:"num",def:"113.61",unit:"Ω",show:v=>v.mode==="r"},
  {id:"T",label:"Temperature",type:"num",def:"35",unit:"°C",show:v=>v.mode==="t"}
 ],
 calc(v){
  const R0=num(v.type)||100,A=3.9083e-3,Bc=-5.775e-7,C=-4.183e-12;
  const RofT=t=>R0*(1+A*t+Bc*t*t+(t<0?C*(t-100)*t*t*t:0));
  if(v.mode==="t"){const t=num(v.T);if(!(t>=-200&&t<=850))return{hint:"Enter a temperature between −200 and 850 °C."};const r=RofT(t);
   return{cap:"Resistance",value:f(r,3),unit:"Ω",say:`A PT${R0} at ${f(t,1)} °C reads ${B(f(r,3),"Ω")}. Set this on a decade box to simulate the temperature.`,rows:[["Change per °C here",f((RofT(t+0.5)-RofT(t-0.5)),4),"Ω/°C"],["Temperature",f(t*9/5+32,1),"°F"]]};}
  const r=num(v.R);if(!(r>0))return{hint:"Enter the measured resistance."};
  let t=r>=R0?(-A+Math.sqrt(A*A-4*Bc*(1-r/R0)))/(2*Bc):(r/R0-1)/A;
  for(let i=0;i<30;i++){const d=(RofT(t+0.001)-RofT(t-0.001))/0.002;t-=(RofT(t)-r)/d;}
  if(!(t>=-200&&t<=850))return{hint:"That resistance is outside the PT"+R0+" range. Check the sensor type and the wiring."};
  return{cap:"Temperature",value:f(t,2),unit:"°C",say:`${f(r,3)} Ω on a PT${R0} is ${B(f(t,2),"°C")} (${f(t*9/5+32,1)} °F).`+(r<R0*0.18||r>R0*3.9?"":""),
   rows:[["Temperature",f(t*9/5+32,2),"°F"],["Resistance at 0 °C",f(R0,0),"Ω"]]};
 },
 note:"IEC 60751 (α = 0.00385) Callendar–Van Dusen equation. On 2-wire RTDs, subtract the lead resistance before converting. An open circuit reads very high, a short reads near 0 Ω."},

{id:"brk",g:"elec",icon:"brk",name:"Breaker size",short:"MCB / MCCB rating and curve",
 intro:"Enter the design current and the cable rating. You get the breaker size and trip curve to use.",
 fields:[
  {id:"Ib",label:"Design (load) current",type:"num",def:"28",unit:"A"},
  {id:"load",label:"Type of load",type:"chips",def:"gen",options:[["res","Heaters / lighting"],["gen","General / sockets"],["mot","Motors / transformers"]]},
  {id:"Iz",label:"Cable current rating",help:"After derating. Leave blank to skip the cable check.",type:"num",def:"41",unit:"A"},
  {id:"cont",label:"Continuous load (NEC 125 % rule)",type:"chips",def:"0",options:[["0","No (IEC)"],["1","Yes"]],adv:true}
 ],
 calc(v){
  const Ib=num(v.Ib),Iz=num(v.Iz),fac=v.cont==="1"?1.25:1;if(!(Ib>0))return{hint:"Enter the design current."};
  const STD=[6,10,13,16,20,25,32,40,50,63,80,100,125,160,200,250,315,400,500,630,800,1000,1250,1600,2000,2500,3200];
  const need=Ib*fac,In=STD.find(s=>s>=need);if(!In)return{hint:"That current is above 3200 A. Use an ACB sized from the manufacturer's data."};
  const curve={res:"B",gen:"C",mot:"D"}[v.load],type=In<=63?"MCB":In<=1600?"MCCB":"ACB";
  const cOK=!(Iz>0)||In<=Iz;
  return{cap:"Breaker rating",value:In,unit:"A",status:Iz>0?{ok:cOK,text:cOK?"Cable is protected":"Cable too small for this breaker"}:null,
   say:`Use a ${B(In+" A")} ${type}${In<=125?` with a ${B("type "+curve)} curve`:""}.`+(Iz>0?(cOK?` It protects the ${f(Iz)} A cable (I<sub>b</sub> ≤ I<sub>n</sub> ≤ I<sub>z</sub>).`:` The cable is rated only ${f(Iz)} A, so increase the cable size or reduce the load.`):"")+(v.load==="mot"?" For motors, an MPCB or MCCB with a motor trip unit set to FLA is usually better.":""),
   rows:[["Design current",f(need,1),"A"],["Trip curve",In<=125?curve:"Adjustable",""],["Instantaneous trip, approx",In<=125?f(In*{B:4,C:8,D:15}[curve],0):"—","A"]]};
 },
 note:"IEC 60364: design current ≤ breaker rating ≤ cable rating. Curve B trips at 3–5 × I<sub>n</sub>, C at 5–10 ×, D at 10–20 ×. Check breaking capacity against the fault level."},

{id:"tx",g:"elec",icon:"tx",name:"Transformer",short:"Full-load and short-circuit current",
 intro:"Enter the transformer rating, voltages and impedance.",
 fields:[
  {id:"kva",label:"Rating",type:"num",def:"1000",unit:"kVA"},
  {id:"Vs",label:"Secondary voltage",type:"num",def:"415",unit:"V",half:true},
  {id:"Vp",label:"Primary voltage",type:"num",def:"11000",unit:"V",half:true},
  {id:"z",label:"Impedance",type:"num",def:"5",unit:"%",presets:[["4","4 %"],["5","5 %"],["6","6 %"],["8","8 %"]]},
  {id:"ph",label:"Phases",type:"chips",def:"3",options:[["3","3-phase"],["1","1-phase"]],adv:true}
 ],
 calc(v){
  const S=num(v.kva)*1000,Vs=num(v.Vs),Vp=num(v.Vp),z=num(v.z),k=v.ph==="1"?1:SQ3;
  if(!(S>0&&Vs>0))return{hint:"Enter the rating and secondary voltage."};if(!(z>0))return{hint:"Enter the impedance in %."};
  const Is=S/(k*Vs),Ip=Vp>0?S/(k*Vp):NaN,Isc=Is*100/z;
  return{cap:"Secondary full-load current",value:f(Is,0),unit:"A",
   say:`A ${f(S/1000)} kVA transformer at ${f(Vs)} V gives ${B(f(Is,0),"A")} at full load. With ${f(z,1)} % impedance, a bolted fault at the terminals is about ${B(f(Isc/1000,1),"kA")}, so the main breaker needs at least that breaking capacity.`,
   rows:[["Primary current",f(Ip,1),"A"],["Short-circuit current",f(Isc/1000,2),"kA"],["Fault level",f(S/(z/100)/1e6,1),"MVA"]]};
 },
 note:"I<sub>sc</sub> = I<sub>FL</sub> × 100 ÷ %Z, assuming an infinite upstream source. The real fault current is a little lower once source and cable impedance are included."},

{id:"gen",g:"elec",icon:"gen",name:"Generator size",short:"Running load plus motor starting",
 intro:"Enter the total running load and the largest motor that starts on the generator.",
 fields:[
  {id:"kw",label:"Total running load",type:"num",def:"120",unit:"kW"},
  {id:"pf",label:"Load power factor",type:"num",def:"0.8",unit:"cos φ"},
  {id:"mk",label:"Largest motor",type:"num",def:"30",unit:"kW"},
  {id:"st",label:"How it starts",type:"chips",def:"6",options:[["6","Direct-on-line"],["2.5","Star-delta"],["3","Soft starter"],["1.5","VFD"]]},
  {id:"mg",label:"Spare margin",type:"num",def:"20",unit:"%",adv:true}
 ],
 calc(v){
  const kw=num(v.kw),pf=num(v.pf),mk=num(v.mk)||0,m=num(v.st),mg=(num(v.mg)||0)/100;
  if(!(kw>0))return{hint:"Enter the running load."};if(!(pf>0&&pf<=1))return{hint:"Power factor must be between 0 and 1."};
  const run=kw/pf,need=run*(1+mg),mRun=mk/(0.9*0.85),start=mRun*m,step=(kw-mk)/pf+start;
  const SZ=[20,30,45,60,80,100,125,150,200,250,300,350,400,500,630,750,800,1000,1250,1500,1750,2000,2500];
  const g=SZ.find(s=>s>=need)||Math.ceil(need/100)*100;
  return{cap:"Generator rating",value:g,unit:"kVA",status:{ok:start<=g*1.5,text:start<=g*1.5?"Motor start looks manageable":"Check the motor-starting capacity"},
   say:`The running load is ${f(run,0)} kVA, or ${f(need,0)} kVA with margin, so choose a ${B(g+" kVA")} set. Starting the ${f(mk)} kW motor ${ {"6":"direct-on-line","2.5":"star-delta","3":"on a soft starter","1.5":"on a VFD"}[v.st]} draws about ${B(f(start,0),"kVA")}. Confirm on the generator's motor-starting (SkVA) curve that it can supply this with no more than 15–20 % voltage dip.`,
   rows:[["Running load",f(run,0),"kVA"],["Motor starting demand",f(start,0),"kVA"],["Load at motor start",f(step,0),"kVA"]]};
 },
 note:"Starting multipliers are typical: DOL 6 ×, star-delta 2.5 ×, soft starter 3 ×, VFD 1.5 × running kVA. Final selection needs the manufacturer's sizing software."},

{id:"ups",g:"elec",icon:"ups",name:"UPS / battery backup",short:"Backup time or battery Ah needed",
 intro:"Enter the load and the battery bank. You get the backup time, and the Ah needed for your target time.",
 fields:[
  {id:"W",label:"Load",type:"num",def:"2000",unit:"W"},
  {id:"V",label:"Battery bank voltage",type:"num",def:"48",unit:"V DC",half:true},
  {id:"Ah",label:"Battery capacity",type:"num",def:"100",unit:"Ah",half:true},
  {id:"n",label:"Parallel strings",type:"num",def:"1",unit:"strings"},
  {id:"chem",label:"Battery type",type:"chips",def:"0.5",options:[["0.5","Lead-acid (50 % depth)"],["0.8","Lead-acid deep cycle (80 %)"],["0.9","Lithium (90 %)"]]},
  {id:"eff",label:"Inverter efficiency",type:"num",def:"90",unit:"%",adv:true},
  {id:"tt",label:"Target backup time",type:"num",def:"2",unit:"h",adv:true}
 ],
 calc(v){
  const W=num(v.W),V=num(v.V),Ah=num(v.Ah),n=num(v.n)||1,d=num(v.chem),e=num(v.eff)/100,tt=num(v.tt);
  if(!(W>0))return{hint:"Enter the load."};if(!(V>0&&Ah>0))return{hint:"Enter the battery voltage and capacity."};if(!(e>0&&e<=1))return{hint:"Efficiency must be between 1 and 100 %."};
  const Wh=V*Ah*n*d*e,h=Wh/W,need=tt>0?W*tt/(V*d*e):NaN;
  return{cap:"Backup time",value:h>=1?f(h,1):f(h*60,0),unit:h>=1?"hours":"minutes",
   say:`The bank stores ${f(V*Ah*n/1000,2)} kWh, of which about ${f(Wh/1000,2)} kWh is usable. At ${f(W)} W that lasts ${B(h>=1?f(h,1)+" h":f(h*60,0)+" min")}.`+(tt>0?` For ${f(tt)} h you need about ${B(f(need,0),"Ah")} at ${f(V)} V.`:""),
   rows:[["Usable energy",f(Wh/1000,2),"kWh"],["Battery current",f(W/e/V,1),"A"],["Ah for target time",f(need,0),"Ah"]]};
 },
 note:"Time = V × Ah × depth of discharge × efficiency ÷ load. Lead-acid gives less than this at high discharge rates (Peukert effect), so add 20–25 % for loads drawn over less than an hour."},

{id:"lux",g:"elec",icon:"lux",name:"Lighting (lumen method)",short:"Number of light fittings for a room",
 intro:"Enter the room size, the light level you need and the fitting output.",
 fields:[
  {id:"L",label:"Length",type:"num",def:"10",unit:"m",half:true},
  {id:"W",label:"Width",type:"num",def:"6",unit:"m",half:true},
  {id:"E",label:"Light level needed",type:"num",def:"500",unit:"lux",presets:[["100","Corridor 100"],["200","Plant room 200"],["300","Workshop 300"],["500","Office / control room 500"]]},
  {id:"lm",label:"Lumens per fitting",type:"num",def:"3600",unit:"lm",half:true},
  {id:"w",label:"Watts per fitting",type:"num",def:"36",unit:"W",half:true},
  {id:"uf",label:"Utilisation factor",type:"num",def:"0.6",unit:"",adv:true},
  {id:"mf",label:"Maintenance factor",type:"num",def:"0.8",unit:"",adv:true}
 ],
 calc(v){
  const L=num(v.L),W=num(v.W),E=num(v.E),lm=num(v.lm),w=num(v.w)||0,uf=num(v.uf),mf=num(v.mf);
  if(!(L>0&&W>0))return{hint:"Enter the room length and width."};if(!(E>0&&lm>0))return{hint:"Enter the lux level and lumens per fitting."};if(!(uf>0&&mf>0))return{hint:"Check the utilisation and maintenance factors under More options."};
  const A=L*W,n=E*A/(lm*uf*mf),N=Math.ceil(n),Ea=N*lm*uf*mf/A;
  const cols=Math.max(1,Math.round(Math.sqrt(N*L/W))),rows=Math.ceil(N/cols);
  return{cap:"Fittings needed",value:N,unit:"fittings",
   say:`A ${f(L)} × ${f(W)} m room at ${f(E)} lux needs ${B(N+" fittings")} of ${f(lm)} lm. A grid of about ${cols} × ${rows} works, giving ${f(Ea,0)} lux.`,
   rows:[["Exact number",f(n,2),""],["Lux achieved",f(Ea,0),"lux"],["Lighting power",f(N*w,0),"W"],["Power density",f(N*w/A,1),"W/m²"]]};
 },
 note:"N = E × A ÷ (lumens × UF × MF). A UF of 0.5–0.7 suits most rooms with light ceilings. Use a lighting design program for final layouts."},

{id:"fill",g:"elec",icon:"fill",name:"Conduit & tray fill",short:"Cable fill % against the limit",
 intro:"Enter the cables and the conduit or tray size.",
 fields:[
  {id:"mode",label:"Containment",type:"chips",def:"c",options:[["c","Conduit"],["t","Cable tray / trunking"]]},
  {id:"d",label:"Cable outside diameter",type:"num",def:"12",unit:"mm",half:true},
  {id:"n",label:"Number of cables",type:"num",def:"5",unit:"cables",half:true},
  {id:"id",label:"Conduit inside diameter",type:"num",def:"50",unit:"mm",show:v=>v.mode==="c"},
  {id:"tw",label:"Tray width",type:"num",def:"300",unit:"mm",half:true,show:v=>v.mode==="t"},
  {id:"td",label:"Usable depth",type:"num",def:"50",unit:"mm",half:true,show:v=>v.mode==="t"},
  {id:"lim",label:"Fill limit for tray",type:"num",def:"40",unit:"%",adv:true,show:v=>v.mode==="t"}
 ],
 calc(v){
  const d=num(v.d),n=Math.round(num(v.n));if(!(d>0&&n>0))return{hint:"Enter the cable diameter and number of cables."};
  const ca=n*Math.PI*d*d/4;let area,lim;
  if(v.mode==="c"){const id=num(v.id);if(!(id>0))return{hint:"Enter the conduit inside diameter."};area=Math.PI*id*id/4;lim=n===1?53:n===2?31:40;}
  else{const tw=num(v.tw),td=num(v.td);if(!(tw>0&&td>0))return{hint:"Enter the tray width and depth."};area=tw*td;lim=num(v.lim)||40;}
  const fill=ca/area*100,ok=fill<=lim;
  const maxN=Math.floor(area*lim/100/(Math.PI*d*d/4));
  return{cap:"Fill",value:f(fill,1),unit:"%",status:{ok,text:ok?`Within ${lim} % limit`:`Over ${lim} % limit`},
   say:`${n} cables of ${f(d)} mm fill ${B(f(fill,1),"%")} of the ${v.mode==="c"?"conduit":"tray"}. The limit is ${lim} %, so it can take up to ${B(maxN+" cables")} of this size.`,
   rows:[["Cable area",f(ca,0),"mm²"],["Space area",f(area,0),"mm²"],["Spare area",f(area*lim/100-ca,0),"mm²"]]};
 },
 note:"Conduit limits follow NEC Chapter 9: 53 % for 1 cable, 31 % for 2 and 40 % for 3 or more. Tray limits vary by project spec, so set yours under More options."},

{id:"tray",g:"elec",icon:"tray",name:"Cable tray sizing",short:"Trefoil, flat or multicore power cables",
 intro:"Enter the cable size, how the cables are laid and how many circuits. You get the tray width, side height, bend radius and load to choose the tray.",
 fields:[
  {id:"arr",label:"Arrangement",type:"chips",def:"tre",options:[["tre","Single-core trefoil"],["flat","Single-core flat"],["mc","Multicore"]]},
  {id:"D",label:"Cable outside diameter",help:"From the cable datasheet. For example 1C 240 mm² XLPE/SWA about 32 mm.",type:"num",def:"32",unit:"mm",half:true},
  {id:"n",label:"Number of circuits",type:"num",def:"4",unitFrom:v=>v.arr==="mc"?"cables":"circuits",half:true},
  {id:"sp",label:"Gap between groups",help:"2 × D apart keeps grouping derating small (IEC 60364-5-52, method F/G). Touching needs a bigger cable.",type:"chips",def:"2",options:[["0","Touching"],["1","1 × D"],["2","2 × D"]]},
  {id:"spare",label:"Spare space for future cables",type:"num",def:"25",unit:"%"},
  {id:"ne",label:"Earth / other cables on the same tray",type:"num",def:"1",unit:"cables",half:true,adv:true},
  {id:"De",label:"Their outside diameter",type:"num",def:"20",unit:"mm",half:true,adv:true},
  {id:"edge",label:"Clearance to each side rail",type:"num",def:"25",unit:"mm",adv:true},
  {id:"kg",label:"Weight per cable",help:"From the cable datasheet.",type:"num",def:"3.1",unit:"kg/m",half:true,adv:true},
  {id:"rate",label:"Tray safe working load",help:"At your support span, from the tray catalogue.",type:"num",def:"",unit:"kg/m",half:true,adv:true}
 ],
 calc(v){
  const D=num(v.D),n=Math.round(num(v.n)),k=num(v.sp),spare=(num(v.spare)||0)/100,ne=Math.max(0,Math.round(num(v.ne)||0)),De=num(v.De)||0,edge=num(v.edge)||0,kg=num(v.kg)||0,rate=num(v.rate);
  if(!(D>0))return{hint:"Enter the cable outside diameter."};if(!(n>0))return{hint:"Enter the number of circuits."};
  const tre=v.arr==="tre",mc=v.arr==="mc",wg=tre?2*D:v.arr==="flat"?3*D:D,s=k*D,hg=tre?(1+Math.sqrt(3)/2)*D:D;
  const used=n*wg+(n-1)*s+(ne>0?ne*De+ne*Math.max(s,De*0.5):0),need=used*(1+spare)+2*edge;
  const STD=[100,150,200,300,400,450,500,600,750,900,1000,1200];
  const W=STD.find(x=>x>=need),fit=x=>Math.max(0,Math.floor((x-2*edge+s)/(wg+s)));
  const side=[50,75,100,125,150].find(x=>x>=hg+10)||150,bend=(mc?12:15)*D,cores=tre||v.arr==="flat"?3:1,load=(n*cores+ne)*kg;
  const der=k>=2?"small (about 0.94–1.0)":k>=1?"moderate":"large",tiers=W?1:Math.ceil(need/1200);
  const ew=ne>0?ne*De+ne*Math.max(s,De*0.5):0,fitS=x=>Math.max(0,Math.floor(((x-2*edge)/(1+spare)-ew+s)/(wg+s)));
  const rows=STD.filter(x=>x>=150&&x<=1200).map(x=>({cls:x===W?"sel":"",c:[x+" mm",Math.max(0,Math.floor((x-2*edge-ew+s)/(wg+s))),fitS(x)]}));
  return{cap:"Tray width",value:W?W:"> 1200",unit:"mm",status:isFinite(rate)&&rate>0?{ok:load<=rate,text:load<=rate?`Load ${f(load,0)} of ${f(rate,0)} kg/m`:"Tray overloaded"}:{ok:!!W,text:W?`${n} ${mc?"cables":"circuits"} fit`:"Use two trays or two tiers"},
   say:`${n} ${tre?"trefoil groups":v.arr==="flat"?"flat groups":"cables"} of ${f(D,0)} mm cable, ${k?f(k,0)+" × D apart":"touching"}, take ${B(f(used,0),"mm")} of width. With ${f(spare*100,0)} % spare and side clearance you need ${f(need,0)} mm, so use a ${B(W?W+" mm":"wider")} tray`+(W?` with side rails at least ${B(side+" mm")} high.`:`: split over ${tiers} tiers or trays.`)+` Grouping derating at this spacing is ${der}; check the cable rating with the Cable size tool.`+(tre?" Cleat each trefoil group to resist short-circuit forces (spacing per the cleat maker, often 1–1.5 m).":""),
   rows:[["Width used",f(used,0),"mm"],["Width needed with spare",f(need,0),"mm"],["Group width",f(wg,0),"mm"],["Layer height",f(hg,0),"mm"],["Minimum bend radius",f(bend,0),"mm"],["Cable load",f(load,1),"kg/m"]],
   after:tbl(["Tray width",mc?"Cables that fit":"Circuits that fit",`With ${f(spare*100,0)} % spare`],rows)};
 },
 note:"Trefoil group width 2D, height 1.87D; flat group 3D. Single layer only: do not stack power cables. Bend radius 15 × D for single-core and 12 × D for multicore XLPE (check the cable maker). Single-core cables need non-magnetic cleats and tray where the spec requires it."},

{id:"scend",g:"elec",icon:"scend",name:"Short circuit at cable end",short:"Fault current downstream and cable withstand",
 intro:"Enter the fault level at the board and the cable to the load. You get the fault current at the far end and check the cable can survive it until the breaker trips.",
 fields:[
  {id:"Isc",label:"Fault level at the board",type:"num",def:"25",unit:"kA",half:true},
  {id:"V",label:"System voltage (line-to-line)",type:"num",def:"415",unit:"V",half:true},
  {id:"S",label:"Cable size (phase conductor)",type:"chips",def:"35",options:SIZES.map(s=>[String(s),s+" mm²"])},
  {id:"L",label:"Cable length",type:"num",def:"60",unit:"m",half:true},
  {id:"ins",label:"Conductor and insulation",type:"chips",def:"143",options:[["143","Copper XLPE"],["115","Copper PVC"],["94","Aluminium XLPE"],["76","Aluminium PVC"]]},
  {id:"t",label:"Breaker clearing time",help:"About 0.01–0.02 s for MCB/MCCB instantaneous trip; use the time from the curve for delayed trips.",type:"num",def:"0.1",unit:"s",half:true},
  {id:"kA",label:"Breaker breaking capacity",type:"num",def:"36",unit:"kA",half:true,adv:true}
 ],
 calc(v){
  const Isc=num(v.Isc)*1000,V=num(v.V),S=num(v.S),L=num(v.L),k=num(v.ins),t=num(v.t),kA=num(v.kA);
  if(!(Isc>0&&V>0))return{hint:"Enter the fault level and voltage."};if(!(L>=0&&S>0))return{hint:"Enter the cable length and size."};
  const al=k<100,rho=al?0.0286:0.0178,Zs=V/(SQ3*Isc),R=rho*L/S,X=0.08e-3*L,Z3=Math.hypot(R,Zs+X),I3=V/(SQ3*Z3),U0=V/SQ3,I1=U0/Math.hypot(Zs+2*R,Zs+2*X);
  const Smin=t>0?Isc*Math.sqrt(t)/k:NaN,okW=S>=Smin,okB=!(kA>0)||kA*1000>=Isc;
  return{cap:"Fault current at cable end",value:f(I3/1000,2),unit:"kA",status:{ok:okW&&okB,text:!okB?"Breaker breaking capacity too low":okW?"Cable withstands the fault":"Cable too small for this fault"},
   say:`At the board the fault is ${f(Isc/1000,1)} kA. After ${f(L)} m of ${S} mm² it drops to ${B(f(I3/1000,2),"kA")} (three-phase) and about ${f(I1/1000,2)} kA line-to-neutral. To survive ${f(Isc/1000,1)} kA for ${f(t,2)} s the cable needs at least ${B(f(Smin,1),"mm²")}, so ${S} mm² ${okW?"is enough":"is too small: use a faster breaker or a bigger cable"}.`+(okB?"":` The ${f(kA)} kA breaker cannot safely break ${f(Isc/1000,1)} kA.`),
   rows:[["Three-phase at far end",f(I3/1000,2),"kA"],["Line-to-neutral at far end",f(I1/1000,2),"kA"],["Minimum cable size (k²S² ≥ I²t)",f(Smin,1),"mm²"],["Source impedance",f(Zs*1000,2),"mΩ"],["Cable resistance",f(R*1000,1),"mΩ"]]};
 },
 note:"Cable withstand from the adiabatic equation S ≥ I√t ÷ k (IEC 60364-4-43), k = 143 Cu XLPE, 115 Cu PVC, 94 Al XLPE, 76 Al PVC. Far-end current uses 20 °C resistance and 0.08 mΩ/m reactance; the minimum earth-fault current is lower when cables are hot."},

{id:"cpc",g:"elec",icon:"cpc",name:"Earth conductor (CPC) size",short:"Protective conductor from fault current",
 intro:"Enter the earth fault current and how fast the breaker clears it. You get the smallest earth conductor allowed, and the simple-rule size from the phase conductor.",
 fields:[
  {id:"If",label:"Earth fault current",help:"From the Earth loop impedance or Short circuit tools.",type:"num",def:"1200",unit:"A",half:true},
  {id:"t",label:"Disconnection time",type:"num",def:"0.4",unit:"s",half:true},
  {id:"k",label:"Earth conductor type",type:"chips",def:"143",options:[["143","Core in XLPE cable (Cu)"],["115","Core in PVC cable (Cu)"],["176","Separate Cu, XLPE insulated"],["143s","Separate Cu, PVC insulated"],["159","Bare copper"]]},
  {id:"Sp",label:"Phase conductor size",type:"chips",def:"35",options:SIZES.map(s=>[String(s),s+" mm²"])}
 ],
 calc(v){
  const If=num(v.If),t=num(v.t),k=v.k==="143s"?143:num(v.k),Sp=num(v.Sp);if(!(If>0&&t>0))return{hint:"Enter the fault current and disconnection time."};
  const S=If*Math.sqrt(t)/k,std=SIZES.find(x=>x>=S)||Math.ceil(S),rule=Sp<=16?Sp:Sp<=35?16:Sp/2,ruleStd=SIZES.find(x=>x>=rule)||rule;
  return{cap:"Minimum earth conductor",value:f(S,2),unit:"mm²",
   say:`${f(If)} A for ${f(t,2)} s needs at least ${B(f(S,2),"mm²")}, so use ${B(std+" mm²")}. The simple rule for a ${Sp} mm² phase conductor gives ${B(ruleStd+" mm²")}; either is acceptable, the calculated one is usually smaller.`,
   rows:[["Calculated",f(S,2),"mm²"],["Next standard size",std,"mm²"],["Simple rule (Table 54.2)",ruleStd,"mm²"],["k used",k,""]]};
 },
 note:"S = √(I²t) ÷ k (IEC 60364-5-54). Simple rule: phase ≤ 16 mm² → same size; 16–35 → 16 mm²; over 35 → half the phase size. Armour can act as the earth conductor if it meets the same check."},

{id:"erod",g:"elec",icon:"erod",name:"Earth electrode resistance",short:"Rod resistance and number of rods",
 intro:"Enter the soil resistivity and rod size. You get one rod's resistance and how many rods in a line you need for your target.",
 fields:[
  {id:"rho",label:"Soil resistivity",help:"Measure with a 4-pole (Wenner) test. Wet clay 20–100, sand 100–1000, dry desert sand 1000+ Ω·m.",type:"num",def:"150",unit:"Ω·m"},
  {id:"L",label:"Rod length",type:"num",def:"3",unit:"m",half:true},
  {id:"d",label:"Rod diameter",type:"num",def:"16",unit:"mm",half:true},
  {id:"s",label:"Spacing between rods",help:"At least the rod length.",type:"num",def:"6",unit:"m",half:true},
  {id:"tgt",label:"Target resistance",type:"num",def:"1",unit:"Ω",half:true,presets:[["1","1 Ω substation"],["5","5 Ω"],["10","10 Ω"]]}
 ],
 calc(v){
  const rho=num(v.rho),L=num(v.L),d=num(v.d)/1000,s=num(v.s),tgt=num(v.tgt);if(!(rho>0&&L>0&&d>0))return{hint:"Enter soil resistivity and rod size."};
  const R1=rho/(2*Math.PI*L)*(Math.log(8*L/d)-1),LAM=[0,0,1,1.66,2.15,2.54,2.87,3.15,3.39,3.61,3.81],Rn=n=>{if(n<=1)return R1;const a=rho/(2*Math.PI*Math.max(s,L)*R1),l=n<=10?LAM[n]:3.81+0.17*(n-10);return R1*(1+l*a)/n;};
  let n=1;if(tgt>0)while(Rn(n)>tgt&&n<60)n++;const ok=tgt>0&&Rn(n)<=tgt;
  return{cap:"One rod",value:f(R1,1),unit:"Ω",status:tgt>0?{ok,text:ok?`${n} rods reach ${f(tgt)} Ω`:"Rods alone cannot reach target"}:null,
   say:`One ${f(L)} m rod in ${f(rho)} Ω·m soil gives about ${B(f(R1,1),"Ω")}.`+(tgt>0?(ok?` To reach ${f(tgt)} Ω you need ${B(n+" rods")} in a line ${f(s)} m apart (${f(Rn(n),2)} Ω).`:" Even 60 rods do not reach the target: use longer rods, a buried grid or mat, or treat the soil."):""),
   rows:[["1 rod",f(R1,2),"Ω"],["2 rods",f(Rn(2),2),"Ω"],["4 rods",f(Rn(4),2),"Ω"],["6 rods",f(Rn(6),2),"Ω"],["10 rods",f(Rn(10),2),"Ω"]]};
 },
 note:"Single rod (Dwight): R = ρ ÷ 2πL × (ln(8L/d) − 1). Rods in a line use the BS 7430 / IEEE 142 coupling factor. Measure the finished system with a fall-of-potential test."},

{id:"panel",g:"elec",icon:"panel",name:"Panel cooling",short:"Heat in an enclosure, fan or panel AC size",
 intro:"Enter the heat lost by the equipment in the panel and the panel size. You find out how hot it gets, and the fan or panel air conditioner needed.",
 fields:[
  {id:"Q",label:"Heat losses inside",help:"VFDs about 2–3 % of motor kW, PLC/power supplies from datasheets.",type:"num",def:"650",unit:"W"},
  {id:"H",label:"Height",type:"num",def:"2000",unit:"mm",half:true},
  {id:"W",label:"Width",type:"num",def:"800",unit:"mm",half:true},
  {id:"D",label:"Depth",type:"num",def:"600",unit:"mm",half:true},
  {id:"mt",label:"Installation",type:"chips",def:"wall",options:[["free","Free-standing"],["wall","Against a wall"],["row","In a row, against wall"]]},
  {id:"Ta",label:"Room temperature (max)",type:"num",def:"35",unit:"°C",half:true},
  {id:"Ti",label:"Max inside panel",type:"num",def:"40",unit:"°C",half:true},
  {id:"k",label:"Panel material",type:"chips",def:"5.5",options:[["5.5","Painted steel"],["4.5","Stainless"],["3.5","Plastic"]],adv:true}
 ],
 calc(v){
  const Q=num(v.Q),H=num(v.H)/1000,W=num(v.W)/1000,D=num(v.D)/1000,Ta=num(v.Ta),Ti=num(v.Ti),k=num(v.k)||5.5;
  if(!(Q>=0&&H>0&&W>0&&D>0))return{hint:"Enter the heat and panel size."};if(!isFinite(Ta)||!isFinite(Ti))return{hint:"Enter both temperatures."};
  const A={free:1.8*H*(W+D)+1.4*W*D,wall:1.4*W*(H+D)+1.8*D*H,row:1.4*W*(H+D)+0.7*D*H}[v.mt],dTn=Q/(k*A),tin=Ta+dTn,need=Q-k*A*(Ti-Ta);
  const fan=need>0&&Ti>Ta?3.1*need/(Ti-Ta):NaN,ac=need>0?need:0;
  return{cap:"Temperature inside, sealed",value:f(tin,1),unit:"°C",status:{ok:tin<=Ti,text:tin<=Ti?"No cooling needed":"Cooling needed"},
   say:`With ${f(Q)} W inside and ${f(A,2)} m² of effective surface, the sealed panel rises ${f(dTn,1)} K to ${B(f(tin,1),"°C")}.`+(tin<=Ti?" The walls get rid of the heat on their own.":Ti>Ta?` To hold ${f(Ti)} °C, a filter fan of about ${B(f(fan,0),"m³/h")} works, or a ${B(f(ac,0),"W")} panel air conditioner if the room air is dusty or the panel must stay sealed.`:` The room is hotter than the panel limit, so a fan cannot help: use a ${B(f(ac,0),"W")} panel air conditioner.`),
   rows:[["Effective surface (IEC 60890)",f(A,2),"m²"],["Heat through walls at limit",f(k*A*(Ti-Ta),0),"W"],["Extra heat to remove",f(Math.max(need,0),0),"W"],["Fan airflow",isFinite(fan)?f(fan,0):"—","m³/h"],["Panel AC",f(ac,0),"W"]]};
 },
 note:"ΔT = Q ÷ (k × A); fan V = 3.1 × Q ÷ ΔT m³/h (sea level). Effective surface per IEC 60890 / IEC TR 60890. Size panel AC with 10–20 % margin and check its ambient rating for Gulf summers."},

{id:"pconv",g:"elec",icon:"pconv",name:"Power converter",short:"kW ↔ kVA ↔ amps",
 intro:"Enter one value and the supply. You get the others.",
 fields:[
  {id:"k",label:"What do you know?",type:"chips",def:"kw",options:[["kw","kW"],["kva","kVA"],["a","Amps"]]},
  {id:"x",label:"Value",type:"num",def:"15",unitFrom:v=>({kw:"kW",kva:"kVA",a:"A"})[v.k]},
  {id:"ph",label:"Supply",type:"chips",def:"3",options:[["3","3-phase AC"],["1","1-phase AC"],["dc","DC"]],onSet:v=>{v.V=v.ph==="3"?"415":v.ph==="1"?"230":"24";}},
  {id:"V",label:"Voltage",type:"num",def:"415",unit:"V"},
  {id:"pf",label:"Power factor",type:"num",def:"0.85",unit:"cos φ",show:v=>v.ph!=="dc"}
 ],
 calc(v){
  const x=num(v.x),V=num(v.V),pf=v.ph==="dc"?1:num(v.pf),k=v.ph==="3"?SQ3:1;
  if(!(x>0))return{hint:"Enter the value."};if(!(V>0))return{hint:"Enter the voltage."};if(!(pf>0&&pf<=1))return{hint:"Power factor must be between 0 and 1."};
  let kva=v.k==="kw"?x/pf:v.k==="kva"?x:k*V*x/1000;const kw=kva*pf,I=kva*1000/(k*V),kvar=Math.sqrt(Math.max(kva*kva-kw*kw,0));
  return{cap:v.k==="a"?"Real power":"Current",value:v.k==="a"?f(kw,2):f(I,1),unit:v.k==="a"?"kW":"A",
   say:`On ${f(V)} V ${v.ph==="dc"?"DC":v.ph+"-phase"}${v.ph==="dc"?"":` at ${f(pf,2)} power factor`}: ${B(f(kw,2),"kW")}, ${B(f(kva,2),"kVA")} and ${B(f(I,1),"A")}.`,
   rows:[["Real power",f(kw,2),"kW"],["Apparent power",f(kva,2),"kVA"],["Reactive power",f(kvar,2),"kVAr"],["Current",f(I,1),"A"],["Real power",f(kw/0.7457,2),"HP"]]};
 },
 note:"3-phase: kVA = √3 × V × I ÷ 1000. 1-phase: kVA = V × I ÷ 1000. kW = kVA × power factor."},

{id:"cost",g:"elec",icon:"cost",name:"Energy cost",short:"kWh and running cost",
 intro:"Enter the power, running hours and your tariff.",
 fields:[
  {id:"kw",label:"Power",type:"num",def:"5",unit:"kW"},
  {id:"h",label:"Hours per day",type:"num",def:"10",unit:"h",half:true},
  {id:"d",label:"Days per month",type:"num",def:"30",unit:"days",half:true},
  {id:"cur",label:"Currency",type:"chips",def:"QAR",options:[["QAR","QAR"],["AED","AED"],["SAR","SAR"],["INR","INR"],["USD","USD"]]},
  {id:"t",label:"Tariff",help:"From your electricity bill.",type:"num",def:"0.3",unitFrom:v=>v.cur+"/kWh"},
  {id:"lf",label:"Average loading",help:"Below 100 % if it cycles or runs part-loaded.",type:"num",def:"100",unit:"%",adv:true}
 ],
 calc(v){
  const kw=num(v.kw),h=num(v.h),d=num(v.d),t=num(v.t),lf=(num(v.lf)||100)/100,c=v.cur;
  if(!(kw>0&&h>0&&d>0))return{hint:"Enter the power, hours and days."};if(!(t>=0))return{hint:"Enter your tariff."};
  const day=kw*h*lf,mon=day*d,yr=mon*12;
  return{cap:"Cost per month",value:f(mon*t,0),unit:c,
   say:`It uses ${B(f(mon,0),"kWh")} a month, which costs ${B(f(mon*t,0),c)} a month and ${B(f(yr*t,0),c)} a year.`,
   rows:[["Per day",f(day,1),"kWh"],["Per year",f(yr,0),"kWh"],["Cost per day",f(day*t,2),c],["Cost per year",f(yr*t,0),c]]};
 },
 note:"Energy = kW × hours × loading. Demand charges and slab tariffs are not included."}
);
