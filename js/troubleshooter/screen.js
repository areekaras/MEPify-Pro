/* MEPify · Troubleshooter screen
   by Mohamed Shafaf Karumannil */

function trUI(el,st){
 if(!TSEC.some(s=>s[0]===st.sec))st.sec="all";if(typeof st.q!=="string")st.q="";
 el.innerHTML=`<div class="card">
   <div class="field"><span class="lbl">Section</span><div class="chips" id="tr-sec">${TSEC.map(s=>`<button type="button" data-v="${s[0]}" aria-pressed="${st.sec===s[0]}">${s[1]}</button>`).join("")}</div></div>
   <label class="field"><span class="lbl">Search</span><span class="inp"><input id="tr-q" type="search" value="${esc(st.q)}" placeholder="tripping, noise, leak…" style="font-family:var(--f-body);font-size:17px"></span></label>
   <label class="field"><span class="lbl">What is the problem?</span><span class="help" id="tr-count"></span><span class="inp"><select id="tr-sel"></select></span></label>
  </div><div class="ans" id="tr-ans" aria-live="polite"></div><div id="tr-after"></div>`;
 const match=()=>{const q=st.q.trim().toLowerCase();const out=[];
  Object.keys(TSD).forEach(k=>{if(st.sec!=="all"&&st.sec!==k)return;TSD[k].forEach(f=>{if(!q||(f.n+" "+f.d+" "+f.c.map(c=>c[0]+" "+c[1]).join(" ")).toLowerCase().includes(q))out.push([k,f]);});});return out;};
 const fill=()=>{const m=match(),sel=el.querySelector("#tr-sel");
  if(m.length&&!m.some(([k,f])=>k+"/"+f.id===st.sel))st.sel=m[0][0]+"/"+m[0][1].id;
  const grp={};m.forEach(([k,f])=>(grp[k]=grp[k]||[]).push(f));
  sel.innerHTML=Object.keys(grp).map(k=>`<optgroup label="${TSN[k]}">${grp[k].map(f=>`<option value="${k}/${f.id}"${st.sel===k+"/"+f.id?" selected":""}>${f.n}</option>`).join("")}</optgroup>`).join("");
  sel.disabled=!m.length;
  el.querySelector("#tr-count").textContent=m.length?`${m.length} fault${m.length===1?"":"s"}${st.q.trim()?` match “${st.q.trim()}”`:""}`:"";
  show2(m.length);};
 const show2=(n)=>{const A=el.querySelector("#tr-ans"),F=el.querySelector("#tr-after");
  if(!n){A.innerHTML=`<div class="cap">Answer</div><p class="hint">No fault matches “${esc(st.q.trim())}”. Try another word, or pick All.</p>`;F.innerHTML="";return;}
  const[k,id]=st.sel.split("/"),f=TSD[k].find(x=>x.id===id);
  A.innerHTML=`<div class="cap">${TSN[k]} · most likely cause</div><div class="verdict">${f.c[0][0]}</div><p class="say">${f.n}${f.d?` (${f.d.toLowerCase()})`:""}: work through these ${f.c.length} causes in order, starting with the most likely.</p>`;
  F.innerHTML=`<div class="ts-safety"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg><span>${TSAFE[k]}</span></div>
   <div class="card" style="margin-top:14px"><ol class="steps">${f.c.map(c=>`<li><b>${c[0]}</b><span>${c[1]}</span>${c[2]?`<br><span class="ts-tool">MEPify: ${c[2]}</span>`:""}</li>`).join("")}</ol></div>`;};
 el.querySelectorAll("#tr-sec button").forEach(b=>b.onclick=()=>{st.sec=b.dataset.v;el.querySelectorAll("#tr-sec button").forEach(x=>x.setAttribute("aria-pressed",x===b));save();fill();});
 el.querySelector("#tr-q").addEventListener("input",e=>{st.q=e.target.value;save();fill();});
 el.querySelector("#tr-sel").addEventListener("change",e=>{st.sel=e.target.value;save();show2(1);});
 fill();
}
