/* MEPify · Troubleshooter tile tools
   by Mohamed Shafaf Karumannil */

TOOLS.push(
{id:"trouble",g:"top",icon:"trbl",name:"Troubleshooter",short:"HVAC, electrical, refrigeration and plumbing faults",
 intro:"Search or pick what you see on site. You get the most likely causes in order and what to check for each.",
 fields:[],render(el,st){trUI(el,st);},
 note:"Field guide only. Follow the project spec and the manufacturer's manual."},

{id:"fix",g:"hidden",icon:"fix",name:"Troubleshooter",short:"Symptom to cause to fix",
 intro:"Pick what you see on the system. You get the likely causes, most common first, with what to check and how to fix each one.",
 fields:[
  {id:"s",label:"What is the symptom?",type:"select",def:"lowsuc",options:Object.keys(FAULTS).map(k=>[k,FAULTS[k].n])}
 ],
 calc(v){
  const F=FAULTS[v.s]||FAULTS.lowsuc;
  const list=`<div class="card"><div class="lbl">Likely causes, most common first</div><ol class="causes">${F.c.map(c=>`<li><b>${c[0]}</b><p><span>Check</span>${c[1]}</p><p><span>Fix</span>${c[2]}</p></li>`).join("")}</ol>${F.go?`<button type="button" class="golink" data-goto="${F.go[0]}">${F.go[1]} →</button>`:""}</div>`;
  return{cap:"Symptom",big:F.n,say:F.d,rows:[["Causes to check",String(F.c.length),""],["Start with",F.c[0][0],""]],after:list};
 },
 bind(af){af.querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>{view=b.dataset.goto;render();window.scrollTo(0,0);});},
 note:"Field guide only. Isolate power before electrical checks, recover refrigerant before opening the circuit, and follow the manufacturer's service data."}
);
