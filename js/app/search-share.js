/* MEPify · Storage, favourites, recent tools, sharing and openTool()
   by Mohamed Shafaf Karumannil */

/* ---------- Search, favourites, recent, share ---------- */
const LS={get(k,d){try{const x=JSON.parse(localStorage.getItem(k)||"null");return x==null?d:x;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
let FAV=LS.get("sc.fav",[]),REC=LS.get("sc.rec",[]),HQ="";
const visTools=()=>TOOLS.filter(t=>t.g!=="hidden");
function noteRecent(id){if(!byId(id))return;REC=[id].concat(REC.filter(x=>x!==id)).slice(0,6);LS.set("sc.rec",REC);}
function toggleFav(id){FAV=FAV.includes(id)?FAV.filter(x=>x!==id):[id].concat(FAV);LS.set("sc.fav",FAV);}
function plain(h){const d=document.createElement("div");d.innerHTML=String(h==null?"":h);return d.textContent.replace(/\s+/g," ").trim();}
function fieldText(fl,st){
  const v=st[fl.id];if(v==null||v==="")return "";
  if(fl.type==="chips"||fl.type==="select"){const o=(fl.options||[]).find(o=>String(o[0])===String(v));return o?plain(o[1]):String(v);}
  if(fl.type==="text"||fl.type==="date")return String(v);
  const u=fl.units||fl.unitsFrom?(st[fl.ukey||fl.id+"_u"]||fl.udef||""):(fl.unitFrom?fl.unitFrom(st):fl.unit||"");
  return `${v}${u?" "+u:""}`;
}
function shareText(t,st,r){
  const L=[`MEPify – ${t.name}`,""];
  (t.fields||[]).filter(fl=>!fl.show||fl.show(st)).forEach(fl=>{const x=fieldText(fl,st);if(x)L.push(`${plain(fl.label)}: ${x}`);});
  L.push("",`${plain(r.cap)}: ${r.big?plain(r.big):plain(r.value)+(r.unit?" "+plain(r.unit):"")}`);
  if(r.status)L.push(plain(r.status.text));
  if(r.say)L.push(plain(r.say));
  if(r.rows&&r.rows.length){L.push("");r.rows.forEach(x=>L.push(`${plain(x[0])}: ${plain(x[1])}${x[2]?" "+plain(x[2]):""}`));}
  L.push("");const _S=(typeof SET!=="undefined")?SET:{};if(_S.project)L.push("Project: "+_S.project);if(_S.name)L.push("Checked by: "+_S.name+(_S.company?", "+_S.company:""));
  L.push(new Date().toLocaleDateString("en-GB")+" · MEPify by Mohamed Shafaf Karumannil");
  return L.join("\n");
}
function doShare(title,text,box){
  const msg=box.querySelector(".shmsg"),fb=()=>{let ta=box.querySelector("textarea");if(!ta){ta=document.createElement("textarea");ta.className="shtxt";ta.readOnly=true;box.appendChild(ta);}ta.value=text;ta.focus();ta.select();msg.textContent="Copy this text and paste it where you need it.";};
  if(window.SiteCalcNative&&typeof window.SiteCalcNative.share==="function"){try{window.SiteCalcNative.share(title,text);msg.textContent="";return;}catch(e){}}
  if(navigator.share){navigator.share({title,text}).then(()=>{msg.textContent="";},e=>{if(!e||e.name!=="AbortError")fb();});return;}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>{msg.textContent="Copied. Paste it into WhatsApp or email.";},fb);return;}
  fb();
}
function openTool(id){view=id;HQ="";noteRecent(id);if(view==="load")HLS.screen="list";render();window.scrollTo(0,0);}
