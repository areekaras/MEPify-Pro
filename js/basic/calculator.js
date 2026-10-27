/* MEPify · Basic and scientific keypad calculators
   by Mohamed Shafaf Karumannil */

/* ---------- BASIC: keypad calculators ---------- */
const FNS=["asin","acos","atan","sin","cos","tan","ln","log","√"];
function tokenize(s){const out=[];let i=0;
 while(i<s.length){const c=s[i];
  if(/[0-9.]/.test(c)){let j=i;while(j<s.length&&/[0-9.]/.test(s[j]))j++;const txt=s.slice(i,j);if(txt.split(".").length>2||txt===".")throw 0;out.push({t:"n",v:parseFloat(txt)});i=j;continue;}
  if(s.startsWith("Ans",i)){out.push({t:"ans"});i+=3;continue;}
  const fn=FNS.find(x=>s.startsWith(x+"(",i));if(fn){out.push({t:"f",v:fn});i+=fn.length+1;continue;}
  if(c==="π"||c==="e"){out.push({t:"c",v:c==="π"?Math.PI:Math.E});i++;continue;}
  if("+−×÷^()!%".includes(c)){out.push({t:c});i++;continue;}
  throw 0;}
 return out;}
function evalExpr(s,deg,ans){
 const tk=tokenize(s);let p=0;const pk=()=>tk[p],nx=()=>tk[p++];
 const toR=x=>deg?x*Math.PI/180:x,fromR=x=>deg?x*180/Math.PI:x,cl=x=>Math.abs(x)<1e-12?0:x;
 const opnd=k=>k&&(k.t==="n"||k.t==="c"||k.t==="ans"||k.t==="f"||k.t==="(");
 function expr(){let a=term().v;while(pk()&&(pk().t==="+"||pk().t==="−")){const op=nx().t,b=term(),bv=b.pct?a*b.v:b.v;a=op==="+"?a+bv:a-bv;}return a;}
 function term(){const r=unary();let a=r.v,pct=r.pct;
  for(;;){const k=pk();if(k&&(k.t==="×"||k.t==="÷")){nx();const b=unary().v;a=k.t==="×"?a*b:a/b;pct=false;}else if(opnd(k)){a*=unary().v;pct=false;}else break;}
  return{v:a,pct};}
 function unary(){const k=pk();if(k&&(k.t==="−"||k.t==="+")){nx();const r=unary();return{v:k.t==="−"?-r.v:r.v,pct:r.pct};}return power();}
 function power(){const b=postfix();if(pk()&&pk().t==="^"){nx();const e=unary();return{v:Math.pow(b.v,e.v),pct:false};}return b;}
 function postfix(){let v=primary(),pct=false;
  while(pk()&&(pk().t==="!"||pk().t==="%")){if(nx().t==="!"){if(v<0||v>170||v!==Math.floor(v))return{v:NaN,pct:false};let r=1;for(let i=2;i<=v;i++)r*=i;v=r;}else{v=v/100;pct=true;}}
  return{v,pct};}
 function primary(){const k=nx();if(!k)throw 0;
  if(k.t==="n"||k.t==="c")return k.v;if(k.t==="ans")return ans;
  if(k.t==="("||k.t==="f"){const v=expr();if(pk()&&pk().t===")")nx();if(k.t==="(")return v;
   switch(k.v){case"sin":return cl(Math.sin(toR(v)));case"cos":return cl(Math.cos(toR(v)));
    case"tan":{const r=toR(v);return Math.abs(Math.cos(r))<1e-12?NaN:cl(Math.tan(r));}
    case"asin":return fromR(Math.asin(v));case"acos":return fromR(Math.acos(v));case"atan":return fromR(Math.atan(v));
    case"ln":return Math.log(v);case"log":return Math.log10(v);case"√":return Math.sqrt(v);}}
  throw 0;}
 if(!tk.length)throw 0;const v=expr();if(p<tk.length)throw 0;return v;}
function cfmt(x){if(!isFinite(x))return "Error";if(x===0)return "0";const a=Math.abs(x);
 if(a>=1e15||a<1e-9)return x.toExponential(8).replace(/\.?0+e/,"e");
 return Number(x.toPrecision(12)).toLocaleString("en-US",{maximumFractionDigits:10});}
const KB=[["C","clr","fn"],["⌫","bk","fn"],["%","%","op"],["÷","÷","op"],["7","7"],["8","8"],["9","9"],["×","×","op"],["4","4"],["5","5"],["6","6"],["−","−","op"],["1","1"],["2","2"],["3","3"],["+","+","op"],["±","neg","fn"],["0","0"],[".","."],["=","eq","eq"]];
const KS=[["sin","sin("],["cos","cos("],["tan","tan("],["π","π"],["e","e"],["sin⁻¹","asin("],["cos⁻¹","acos("],["tan⁻¹","atan("],["ln","ln("],["log","log("],["x²","^2"],["xʸ","^"],["√","√("],["x!","!"],["1/x","inv"],["(","("],[")",")"],["Ans","Ans"],["×10ˣ","×10^"],["DEG","deg"]];
let calcPress=null;
function calcUI(el,st,sci){
 if(typeof st.x!=="string")st.x="";if(!Array.isArray(st.hist))st.hist=[];st.ans=num(st.ans)||0;if(st.deg===undefined)st.deg=true;
 const all=sci?KS.concat(KB):KB;
 el.innerHTML=`<div class="calc-disp"><span class="md" id="cmd"></span><div class="ex" id="cex"></div><div class="rs" id="crs" aria-live="polite"></div></div>
  ${sci?`<div class="keys sci">${KS.map((k,i)=>`<button type="button" data-i="${i}" class="fn">${k[0]}</button>`).join("")}</div>`:""}
  <div class="keys">${KB.map((k,i)=>`<button type="button" data-i="${(sci?KS.length:0)+i}" class="${k[2]||""}">${k[0]}</button>`).join("")}</div>
  <div class="hist" id="chist"></div>`;
 const ops=["+","−","×","÷","^","%","!","^2","×10^"];
 function upd(){
  el.querySelector("#cex").textContent=st.done?st.last+" =":(st.x||"0");
  let r="";if(st.done)r=cfmt(st.ans);else if(st.x){try{const v=evalExpr(st.x,st.deg,st.ans);r=isFinite(v)?cfmt(v):"";}catch(e){r="";}}
  el.querySelector("#crs").textContent=r||(st.x?"…":"0");
  el.querySelector("#cmd").textContent=sci?(st.deg?"DEG":"RAD"):"";
  const dk=el.querySelector('[data-i="'+(KS.length-1)+'"]');if(sci&&dk)dk.textContent=st.deg?"DEG":"RAD";
  el.querySelector("#chist").innerHTML=st.hist.length?`<div class="lbl" style="font-size:13px;color:var(--muted)">Recent</div>${st.hist.map((h,i)=>`<button type="button" data-h="${i}"><span>${esc(h.x)}</span><strong>${cfmt(h.v)}</strong></button>`).join("")}`:"";
  el.querySelectorAll("[data-h]").forEach(b=>b.onclick=()=>{const h=st.hist[+b.dataset.h];st.x=String(Number(h.v.toPrecision(12)));st.done=false;save();upd();});
 }
 function press(k){
  if(k==="clr"){st.x="";st.done=false;}
  else if(k==="bk"){if(st.done){st.done=false;st.x="";}else{const f=FNS.find(x=>st.x.endsWith(x+"("));st.x=f?st.x.slice(0,-(f.length+1)):st.x.endsWith("Ans")?st.x.slice(0,-3):st.x.endsWith("×10^")?st.x.slice(0,-4):st.x.slice(0,-1);}}
  else if(k==="deg"){st.deg=!st.deg;}
  else if(k==="neg"){const base=st.done?"Ans":st.x;st.done=false;st.x=!base?"−":/^−\(.*\)$/.test(base)?base.slice(2,-1):"−("+base+")";}
  else if(k==="inv"){const base=st.done?"Ans":st.x;st.done=false;st.x=base?"1÷("+base+")":"1÷";}
  else if(k==="eq"){if(!st.x)return;let v;try{v=evalExpr(st.x,st.deg,st.ans);}catch(e){v=NaN;}
   if(isFinite(v)){st.hist.unshift({x:st.x,v});st.hist=st.hist.slice(0,6);st.ans=v;st.last=st.x;st.done=true;st.x="";}
   else{st.last=st.x;st.done=false;el.querySelector("#crs").textContent="Error";return;}}
  else{if(st.done){st.x=ops.includes(k)?"Ans"+k:k;st.done=false;}else st.x+=k;}
  save();upd();
 }
 el.querySelectorAll(".keys button").forEach(b=>b.onclick=()=>press(all[+b.dataset.i][1]));
 calcPress=press;upd();
}
document.addEventListener("keydown",e=>{
 const t=byId(view);if(!t||!t.keypad||!calcPress||e.ctrlKey||e.metaKey||e.altKey)return;
 const tag=(e.target.tagName||"").toLowerCase();if(tag==="input"||tag==="select"||tag==="textarea")return;
 const m={"+":"+","-":"−","*":"×","x":"×","/":"÷","^":"^","(":"(",")":")","%":"%","!":"!",".":".",",":".","Enter":"eq","=":"eq","Backspace":"bk","Escape":"clr","Delete":"clr"};
 const k=/^[0-9]$/.test(e.key)?e.key:m[e.key];if(!k)return;e.preventDefault();calcPress(k);
});
