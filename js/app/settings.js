/* MEPify · Settings screen
   by Mohamed Shafaf Karumannil */

/* ---------- settings ---------- */
function setView(){
  const nT=visTools().length-1,nF=Object.values(TSD).reduce((a,v)=>a+v.length,0);
  app.innerHTML=topBar("Settings")+`
  <div class="x-set"><h3>Report details</h3><p>Added to shared results, the job log and PDF sheets.</p>
   <label class="r"><span>Name</span><input data-s="name" type="text" value="${esc(SET.name)}" placeholder="Your name" autocomplete="name"></label>
   <label class="r"><span>Company</span><input data-s="company" type="text" value="${esc(SET.company)}" placeholder="Company"></label>
   <label class="r"><span>Project</span><input data-s="project" type="text" value="${esc(SET.project)}" placeholder="Current project"></label></div>
  <div class="x-set"><h3>Display</h3>
   <div class="r"><span>Theme</span><div class="x-seg" data-theme-seg>${[["auto","Auto"],["light","Light"],["dark","Dark"]].map(o=>`<button type="button" data-v="${o[0]}" aria-pressed="${SET.theme===o[0]}">${o[1]}</button>`).join("")}</div></div></div>
  <div class="x-set"><h3>Job log</h3><div class="r"><span>Saved readings</span><span style="margin-left:auto">${LOG.length}</span></div>
   ${LOG.length?`<div class="r"><button type="button" class="x-sec2 del" data-wipe style="width:100%">${svg("x_trash")}Delete all readings</button></div>`:""}</div>
  <div class="x-set"><h3>Suggestion box</h3><p>An idea for a new tool, a result that looks wrong, or anything to improve? Send it straight to the developer.</p>
   <div class="r"><button type="button" class="x-pri" data-sug style="width:100%">${svg("idea")}Send a suggestion</button></div></div>
  <div class="x-set"><h3>About</h3><p><b>MEPify v${APPV}</b><br>Designed by Mohamed Shafaf Karumannil.<br>${nT} tools and ${nF} troubleshooting faults. Works fully offline.</p>
   <div class="r"><button type="button" class="x-sec2" data-fdl style="width:100%">${svg("f_team")}Meet the founders</button></div>
   <p>Results are for site checks and quick estimates. Confirm final designs against the project specification, the manufacturer's data and the applicable code.</p></div>`;
  bindTop();
  app.querySelectorAll("[data-s]").forEach(i=>i.addEventListener("input",()=>{SET[i.dataset.s]=i.value;saveSet();}));
  app.querySelectorAll("[data-theme-seg] button").forEach(b=>b.onclick=()=>{SET.theme=b.dataset.v;saveSet();applyTheme();setView();});
  app.querySelector("[data-fdl]").onclick=()=>{BACK="v:set";openTool("founders");};
  app.querySelector("[data-sug]").onclick=()=>{BACK="v:set";openTool("suggest");};
  const w=app.querySelector("[data-wipe]");if(w)w.onclick=()=>{if(!w.classList.contains("armed")){w.classList.add("armed");w.lastChild.textContent="Tap again to delete all";return;}LOG=[];saveLog();setView();};
}
