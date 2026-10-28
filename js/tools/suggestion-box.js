/* MEPify · Suggestion box: customers send ideas, wrong results or improvements to the developer.
   by Mohamed Shafaf Karumannil
   The app works offline with no server, so the message is sent through the phone's own email app
   (mailto link) or any share app. The address is FEEDBACK_EMAIL in js/config.js. */

TOOLS.push(
{id:"suggest",g:"hidden",icon:"idea",name:"Suggestion box",short:"Send an idea or report a problem",
 intro:"Tell us what to add or fix. Your message opens ready to send in your email app.",
 fields:[],render(el,st){sugUI(el,st);},
 note:"Your message goes only to the MEPify developer. Nothing is sent until you press send in your email or share app."}
);

const SUG_TYPES=[["idea","New tool idea"],["wrong","Wrong result or bug"],["improve","Improve a tool"],["other","Something else"]];

function sugText(st){
  const type=(SUG_TYPES.find(x=>x[0]===st.type)||SUG_TYPES[0])[1],tool=st.tool?byId(st.tool):null;
  const subject=`MEPify suggestion: ${type}${tool?" – "+plain(tool.name):""}`;
  const lines=[String(st.msg||"").trim(),"","---",`Type: ${type}`];
  if(tool)lines.push(`Tool: ${plain(tool.name)}`);
  if(String(st.name||"").trim())lines.push(`Name: ${String(st.name).trim()}`);
  if(String(st.contact||"").trim())lines.push(`Reply to: ${String(st.contact).trim()}`);
  lines.push(`App: MEPify v${APPV} (${window.SiteCalcNative?"Android app":"web"})`,`Date: ${new Date().toLocaleDateString("en-GB")}`);
  return{subject,body:lines.join("\n")};
}

function sugUI(el,st){
  if(!SUG_TYPES.some(x=>x[0]===st.type))st.type="idea";
  if(typeof st.name!=="string")st.name=SET.name||"";
  ["msg","contact","tool"].forEach(k=>{if(typeof st[k]!=="string")st[k]="";});
  const tools=visTools().filter(t=>t.id!=="trouble").slice().sort((a,b)=>(GN[a.g]||"").localeCompare(GN[b.g]||"")||plain(a.name).localeCompare(plain(b.name)));
  el.innerHTML=`<div class="card x-sug">
    <div class="x-f"><span>What is it about?</span><div class="x-seg" data-sug-type>${SUG_TYPES.map(o=>`<button type="button" data-v="${o[0]}" aria-pressed="${st.type===o[0]}">${o[1]}</button>`).join("")}</div></div>
    <label class="x-f"><span>Which tool? (optional)</span><select data-k="tool"><option value="">Not about one tool</option>${tools.map(t=>`<option value="${t.id}"${st.tool===t.id?" selected":""}>${esc(GN[t.g]||"")} · ${esc(plain(t.name))}</option>`).join("")}</select></label>
    <label class="x-f"><span>Your suggestion</span><textarea data-k="msg" rows="6" placeholder="e.g. Add a chiller COP calculator, or the duct size result looks wrong for 1200 × 600">${esc(st.msg)}</textarea></label>
    <label class="x-f"><span>Your name (optional)</span><input data-k="name" type="text" value="${esc(st.name)}" autocomplete="name"></label>
    <label class="x-f"><span>Email or phone for a reply (optional)</span><input data-k="contact" type="text" value="${esc(st.contact)}" autocomplete="email"></label>
    <p class="x-sug-msg" data-sug-msg aria-live="polite"></p>
    <a class="x-pri amb" data-sug-send href="#">${svg("idea")}Send by email</a>
    <button type="button" class="x-sec2" data-sug-share>${svg("share")}Send another way (WhatsApp, copy…)</button>
    <div class="x-sug-share" data-sug-sharebox><p class="shmsg x-sug-small"></p></div>
    <p class="x-sug-small">Sent to ${esc(FEEDBACK_EMAIL)}</p>
  </div>`;
  const msgEl=el.querySelector("[data-sug-msg]"),send=el.querySelector("[data-sug-send]"),box=el.querySelector("[data-sug-sharebox]");
  const upd=()=>{const{subject,body}=sugText(st);send.href=`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g,"\r\n"))}`;};
  const ready=()=>{if(String(st.msg||"").trim().length<3){msgEl.className="x-sug-msg bad";msgEl.textContent="Please write your suggestion first.";el.querySelector('[data-k="msg"]').focus();return false;}return true;};
  const thanks=t=>{msgEl.className="x-sug-msg ok";msgEl.textContent=t||"Thank you! Press send in the email app that opened. If nothing opened, use “Send another way”.";};
  el.querySelectorAll("[data-k]").forEach(i=>i.addEventListener("input",()=>{st[i.dataset.k]=i.value;save();upd();if(i.dataset.k==="msg")msgEl.textContent="";}));
  el.querySelectorAll("[data-sug-type] button").forEach(b=>b.onclick=()=>{st.type=b.dataset.v;save();el.querySelectorAll("[data-sug-type] button").forEach(x=>x.setAttribute("aria-pressed",x===b));upd();});
  send.addEventListener("click",e=>{if(!ready()){e.preventDefault();return;}upd();thanks();});
  el.querySelector("[data-sug-share]").onclick=()=>{if(!ready())return;const{subject,body}=sugText(st);doShare(subject,`To: ${FEEDBACK_EMAIL}\n${subject}\n\n${body}`,box);thanks("Thank you! Pick an app to send it, or copy the text and send it to "+FEEDBACK_EMAIL+".");};
  upd();
}
