/* MEPify · Job log: saved readings, CSV and PDF export
   by Mohamed Shafaf Karumannil */

/* ---------- job log ---------- */
function dayKey(ts){return new Date(ts).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});}
function hm(ts){return new Date(ts).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});}
function logList(){const q=LQ.trim().toLowerCase();return LOG.filter(e=>(!LP||e.project===LP)&&(!q||(e.tag+" "+e.name+" "+e.note+" "+e.val+" "+e.project).toLowerCase().includes(q)));}
function logView(){
  const projects=[...new Set(LOG.map(e=>e.project).filter(Boolean))];if(LP&&!projects.includes(LP))LP="";
  app.innerHTML=topBar("Job log",LOG.length?`<span style="font-size:13px;color:var(--muted)">${LOG.length} saved</span>`:"")+
   (LOG.length?`<label class="srch"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON.srch}</svg><input id="lq" type="search" placeholder="Search tag, tool or note" aria-label="Search job log" value="${esc(LQ)}"></label>
   ${projects.length?`<div class="x-seg" style="margin-top:12px" data-lp><button type="button" data-v="" aria-pressed="${!LP}">All</button>${projects.map(p=>`<button type="button" data-v="${esc(p)}" aria-pressed="${LP===p}">${esc(p)}</button>`).join("")}</div>`:""}
   <div id="lbox"></div>
   <div class="x-row" style="margin-top:16px"><button type="button" class="x-sec2" data-csv>${svg("x_table")}Excel (CSV)</button><button type="button" class="x-pri" data-pdf>${svg("x_print")}PDF sheet</button></div>`
   :`<div class="x-empty"><b>No readings saved yet</b>Open any tool and tap Save under the answer. Add a tag like AHU-101 and it is kept here, even offline.</div>`);
  bindTop();
  const box=document.getElementById("lbox");
  const fill=()=>{if(!box)return;const L=logList();let last="",h="";
    if(!L.length)h=`<p class="note" style="margin-top:18px">Nothing matches. Try another tag or project.</p>`;
    L.forEach(e=>{const d=dayKey(e.ts);if(d!==last){const n=L.filter(x=>dayKey(x.ts)===d).length;h+=`<div class="x-day">${d}<span>${n} reading${n>1?"s":""}</span></div>`;last=d;}
      const op=LOPEN===e.id;
      h+=`<div class="x-log"><button type="button" data-lid="${e.id}" aria-expanded="${op}"><span class="t">${e.tag?`<span class="x-tag">${esc(e.tag)}</span>`:""}<span class="n">${esc(e.name)}</span><span class="v">${esc(e.val)}</span></span>
       <span class="m" style="display:block">${e.res==="pass"?'<span class="pass">Pass</span>':e.res==="fail"?'<span class="fail">Fail</span>':"Info"}${e.project?" · "+esc(e.project):""} · ${hm(e.ts)}${e.note?" · "+esc(e.note):""}</span></button>
       ${op?`<div class="d"><pre>${esc(e.text)}</pre><div class="x-row"><button type="button" class="x-sec2" data-lshare>${svg("share")}Share</button><button type="button" class="x-sec2 del" data-ldel>${svg("x_trash")}Delete</button></div><span class="shr" style="border:0;padding:0"><span class="shmsg" role="status"></span></span></div>`:""}</div>`;});
    box.innerHTML=h;
    box.querySelectorAll("[data-lid]").forEach(b=>b.onclick=()=>{const id=+b.dataset.lid;LOPEN=LOPEN===id?null:id;fill();});
    const e=LOG.find(x=>x.id===LOPEN);
    if(e){const w=box.querySelector("[data-lid='"+e.id+"']").parentNode;
      w.querySelector("[data-lshare]").onclick=()=>doShare("MEPify – "+e.name,e.text,w.querySelector(".d"));
      const del=w.querySelector("[data-ldel]");del.onclick=()=>{if(!del.classList.contains("armed")){del.classList.add("armed");del.lastChild.textContent="Tap again to delete";return;}
        LOG=LOG.filter(x=>x.id!==e.id);saveLog();LOPEN=null;logView();};}
  };
  fill();
  const lq=document.getElementById("lq");if(lq)lq.addEventListener("input",()=>{LQ=lq.value;fill();});
  app.querySelectorAll("[data-lp] button").forEach(b=>b.onclick=()=>{LP=b.dataset.v;logView();});
  const c=app.querySelector("[data-csv]");if(c)c.onclick=logCSV;
  const p=app.querySelector("[data-pdf]");if(p)p.onclick=logPDF;
}
function csvQ(v){const s=String(v==null?"":v);return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function logCSV(){
  const L=logList();if(!L.length){hlToast("Nothing to export.");return;}
  const lines=[csvQ("MEPify job log"+(LP?" - "+LP:"")),csvQ("Prepared by "+(SET.name||"-")+(SET.company?", "+SET.company:"")),"",
    ["Date","Time","Project","Tag","Tool","Result","Value","Status","Note","Details"].map(csvQ).join(",")];
  L.forEach(e=>lines.push([new Date(e.ts).toLocaleDateString("en-GB"),hm(e.ts),e.project,e.tag,e.name,e.res,e.val,e.status,e.note,e.text.replace(/\n+/g," | ")].map(csvQ).join(",")));
  const csv="﻿"+lines.join("\r\n"),name="MEPify job log "+new Date().toISOString().slice(0,10)+".csv";
  if(window.SiteCalcNative&&window.SiteCalcNative.save){hlToast(window.SiteCalcNative.save(name,"text/csv",csv));return;}
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);hlToast("Saved "+name);
}
function logPDF(){
  const L=logList();if(!L.length){hlToast("Nothing to print.");return;}
  let el=document.getElementById("xprint");if(!el){el=document.createElement("div");el.id="xprint";document.body.appendChild(el);}
  el.innerHTML=`<h1>Test record${LP?": "+esc(LP):""}</h1><p>Prepared by ${esc(SET.name||"-")}${SET.company?", "+esc(SET.company):""} · Printed ${new Date().toLocaleString("en-GB")} · MEPify by Mohamed Shafaf Karumannil</p>
  <table><thead><tr><th>Date</th><th>Tag</th><th>Check</th><th>Reading</th><th>Result</th><th>Note</th></tr></thead><tbody>${L.map(e=>`<tr><td>${new Date(e.ts).toLocaleDateString("en-GB")} ${hm(e.ts)}</td><td>${esc(e.tag)}</td><td>${esc(e.name)}</td><td>${esc(e.val)}${e.status?"<br>"+esc(e.status):""}</td><td>${e.res==="pass"?"Pass":e.res==="fail"?"Fail":"Info"}</td><td>${esc(e.note)}</td></tr>`).join("")}</tbody></table>
  <p style="margin-top:24px">Signed: ______________________ &nbsp; Date: ____________</p>`;
  document.body.classList.add("x-printing");
  const done=()=>document.body.classList.remove("x-printing");window.addEventListener("afterprint",done,{once:true});
  if(window.SiteCalcNative&&window.SiteCalcNative.print){window.SiteCalcNative.print("MEPify job log");setTimeout(done,4000);return;}
  window.print();setTimeout(done,1500);
}
function saveSheet(t,st,r){
  const val=r.big?plain(r.big):(plain(r.value)+(r.unit?" "+plain(r.unit):"")),projects=[...new Set([SET.project].concat(LOG.map(e=>e.project)).filter(Boolean))];
  let res=r.status?(r.status.ok?"pass":"fail"):"info";
  const dim=document.createElement("div");dim.className="x-dim";
  dim.innerHTML=`<div class="x-sheet" role="dialog" aria-modal="true" aria-label="Save to job log"><h3>Save to job log</h3>
   <div class="x-res"><small>${esc(plain(r.cap))}</small><b>${esc(val)}</b>${r.status?`<small>${esc(plain(r.status.text))}</small>`:""}</div>
   <label class="x-f"><span>Tag or equipment</span><input id="xs-tag" type="text" placeholder="e.g. AHU-101" autocomplete="off"></label>
   <label class="x-f"><span>Project</span><input id="xs-prj" type="text" list="xs-pl" value="${esc(SET.project)}" placeholder="e.g. Substation 3" autocomplete="off"><datalist id="xs-pl">${projects.map(p=>`<option value="${esc(p)}">`).join("")}</datalist></label>
   <label class="x-f"><span>Note</span><textarea id="xs-note" placeholder="Optional"></textarea></label>
   <div class="x-seg res" data-res>${[["pass","Pass"],["fail","Fail"],["info","Info only"]].map(o=>`<button type="button" data-v="${o[0]}" aria-pressed="${res===o[0]}">${o[1]}</button>`).join("")}</div>
   <div class="x-row"><button type="button" class="x-sec2" data-cancel>Cancel</button><button type="button" class="x-pri amb" data-ok>${svg("x_save")}Save reading</button></div></div>`;
  document.body.appendChild(dim);
  const close=()=>{dim.remove();document.removeEventListener("keydown",esc_);};
  const esc_=e=>{if(e.key==="Escape")close();};document.addEventListener("keydown",esc_);
  dim.onclick=e=>{if(e.target===dim)close();};
  dim.querySelectorAll("[data-res] button").forEach(b=>b.onclick=()=>{res=b.dataset.v;dim.querySelectorAll("[data-res] button").forEach(x=>x.setAttribute("aria-pressed",x===b));});
  dim.querySelector("[data-cancel]").onclick=close;
  dim.querySelector("[data-ok]").onclick=()=>{
    const tag=dim.querySelector("#xs-tag").value.trim(),prj=dim.querySelector("#xs-prj").value.trim(),note=dim.querySelector("#xs-note").value.trim();
    LOG.unshift({id:Date.now(),ts:Date.now(),tool:t.id,name:plain(t.name),tag,project:prj,note,res,cap:plain(r.cap),val,status:r.status?plain(r.status.text):"",text:shareText(t,st,r)+(tag?"\nTag: "+tag:"")+(note?"\nNote: "+note:"")});
    if(LOG.length>2000)LOG.length=2000;saveLog();close();hlToast("Saved to job log"+(tag?": "+tag:""));};
  setTimeout(()=>{const i=dim.querySelector("#xs-tag");if(i)i.focus();},50);
  window.scSheetClose=close;
}
