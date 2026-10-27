/* MEPify · Saved inputs for every tool and the start screen
   by Mohamed Shafaf Karumannil */

/* ---------- STATE ---------- */
const ST={};
let open={},view="home";
function defs(t){const o={};t.fields.forEach(fl=>{o[fl.id]=fl.def;if(fl.units)o[fl.id+"_u"]=fl.udef;if(fl.ukey)o[fl.ukey]=fl.udef;});return o;}
TOOLS.forEach(t=>ST[t.id]=defs(t));
try{const raw=localStorage.getItem("fieldvolt.v2");if(raw){const o=JSON.parse(raw);TOOLS.forEach(t=>Object.assign(ST[t.id],o[t.id]||{}));}}catch(e){}
const save=()=>{try{localStorage.setItem("fieldvolt.v2",JSON.stringify(ST))}catch(e){}};
const byId=id=>TOOLS.find(t=>t.id===id);
const h0=(location.hash||"").slice(1);
if(byId(h0))view=h0;
