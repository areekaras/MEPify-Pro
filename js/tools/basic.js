/* MEPify · Basic calculators tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
{id:"calc",g:"basic",icon:"calc",name:"Calculator",short:"Everyday sums with % and memory of recent answers",
 intro:"Tap the keys or type on a keyboard. Tap a recent answer to use it again.",
 fields:[],keypad:true,render(el,st){calcUI(el,st,false);},
 note:"200 + 10 % gives 220, the way a shop calculator works. Results show up to 12 significant digits."},

{id:"sci",g:"basic",icon:"sci",name:"Scientific calculator",short:"Trig, logs, powers, roots and factorials",
 intro:"Type a full expression with brackets. The answer updates as you type. Tap DEG to switch to radians.",
 fields:[],keypad:true,render(el,st){calcUI(el,st,true);},
 note:"Ans is the last answer. Brackets close themselves at the end. ln is base e and log is base 10."},

{id:"date",g:"basic",icon:"date",name:"Date calculator",short:"Days between dates, or add days to a date",
 intro:"Count the days between two dates, including working days, or find the date a number of days, weeks or months away.",
 fields:[
  {id:"mode",label:"What do you need?",type:"chips",def:"diff",options:[["diff","Time between two dates"],["add","Add or subtract time"]]},
  {id:"d1",label:"Start date",type:"date",def:todayISO},
  {id:"d2",label:"End date",type:"date",def:isoAdd(todayISO,90),show:v=>v.mode==="diff"},
  {id:"wk",label:"Weekend days",help:"Used for the working-day count.",type:"chips",def:"fs",options:[["fs","Fri + Sat"],["ss","Sat + Sun"],["s","Sunday only"],["f","Friday only"],["n","None"]],show:v=>v.mode==="diff"},
  {id:"incl",label:"Count the end date as a day",type:"chips",def:"0",options:[["0","No"],["1","Yes"]],adv:true,show:v=>v.mode==="diff"},
  {id:"op",label:"Add or subtract?",type:"chips",def:"+",options:[["+","Add"],["-","Subtract"]],show:v=>v.mode==="add"},
  {id:"n",label:"How much time",type:"num",def:"28",units:["days","weeks","months","years"],udef:"days",show:v=>v.mode==="add"}
 ],
 calc(v){
  const a=pDate(v.d1);if(!isFinite(a))return{hint:"Pick the start date."};
  if(v.mode==="add"){const n=num(v.n);if(!isFinite(n))return{hint:"Enter how many days, weeks, months or years."};
   const s=v.op==="-"?-1:1,u=v.n_u;let t;
   if(u==="months")t=addMonths(a,s*Math.round(n));else if(u==="years")t=addMonths(a,s*Math.round(n)*12);else t=a+s*Math.round(n*(u==="weeks"?7:1))*864e5;
   if(!isFinite(t)||Math.abs(t)>8.64e15)return{hint:"That is too far from the start date. Enter a smaller number."};
   const days=Math.round((t-a)/864e5);
   return{cap:"Result date",value:new Date(t).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}),unit:"",
    say:`${v.op==="-"?"Going back":"Going forward"} ${n===1?"1 "+u.slice(0,-1):f(n)+" "+u} from ${dFmt(a)} lands on ${B(dFmt(t))}.`,
    rows:[["Day of week",new Date(t).toLocaleDateString("en-GB",{weekday:"long",timeZone:"UTC"}),""],["Days moved",f(days,0),"days"],["ISO date",new Date(t).toISOString().slice(0,10),""]]};}
  const b=pDate(v.d2);if(!isFinite(b))return{hint:"Pick the end date."};
  const lo=Math.min(a,b),hi=Math.max(a,b),inc=v.incl==="1"?1:0,days=Math.round((hi-lo)/864e5)+inc;
  const off={fs:[5,6],ss:[6,0],s:[0],f:[5],n:[]}[v.wk]||[];let work=0;
  if(days<=40000)for(let i=0;i<days;i++){const wd=new Date(lo+i*864e5).getUTCDay();if(!off.includes(wd))work++;}
  const[y,m,d]=ymd(lo,hi+inc*864e5),parts=[y&&plural(y,"year"),m&&plural(m,"month"),(d||!(y||m))&&plural(d,"day")].filter(Boolean).join(", ");
  return{cap:b<a?"Time between (end is before start)":"Time between",value:f(days,0),unit:days===1?"day":"days",
   say:`From ${dFmt(lo)} to ${dFmt(hi)} is ${B(parts)}. That includes ${B(f(work,0),"working days")} ${ {fs:"with a Friday and Saturday weekend",ss:"with a Saturday and Sunday weekend",s:"with Sunday off",f:"with Friday off",n:"with no days off"}[v.wk]||""}.`,
   rows:[["Weeks",f(days/7,2),"weeks"],["Working days",f(work,0),"days"],["Weekend days",f(days-work,0),"days"],["Hours",f(days*24,0),"h"]]};
 },
 note:"By default the start date counts and the end date does not, so 1 to 2 January is 1 day. Turn on “Count the end date” under More options for an inclusive count. Public holidays are not removed."},

{id:"conv",g:"basic",icon:"conv",name:"Unit converter",short:"Length, area, weight, temperature and more",
 intro:"Pick what you are converting, type the value, and see it in every unit.",
 fields:[
  {id:"cat",label:"What are you converting?",type:"chips",def:"length",options:Object.keys(CONV).map(k=>[k,CONV[k].label]),onSet:(v)=>{v.unit=CONV[v.cat].u[0][0];}},
  {id:"val",label:"Value",type:"num",def:"1",unitsFrom:v=>CONV[v.cat].u.map(u=>u[0]),ukey:"unit",udef:"m"}
 ],
 calc(v){
  const c=CONV[v.cat]||CONV.length;if(!c.u.some(u=>u[0]===v.unit))v.unit=c.u[0][0];const x=num(v.val);if(!isFinite(x))return{hint:"Type a value to convert."};
  let list;
  if(v.cat==="temp"){const C=toC[v.unit](x);list=c.u.map(u=>[u[0],fromC[u[0]](C)]);}
  else{const fac=(c.u.find(u=>u[0]===v.unit)||c.u[0])[1],base=x*fac;list=c.u.map(u=>[u[0],base/u[1]]);}
  return{extra:`<div class="cap">${f(x)} ${v.unit} equals</div><div class="conv">${list.map(r=>`<div class="${r[0]===v.unit?"me":""}"><span>${r[0]}</span><strong>${f(r[1])}</strong></div>`).join("")}</div>`};
 },
 note:"1 cent = 40.47 m² (435.6 ft²), as used for land in Kerala. TR is the refrigeration ton (12,000 BTU/h = 3.517 kW). HP is mechanical horsepower. Data uses 1 KB = 1024 B."}
);
