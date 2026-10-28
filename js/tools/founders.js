/* MEPify · Meet the founders: profiles, expertise, skills and an inquiry form.
   by Mohamed Shafaf Karumannil
   Edit the founders' details in FOUNDERS below. Photos live in images/founders/.
   email: where that founder's inquiries go (blank = sent to FEEDBACK_EMAIL in js/config.js).
   linkedin: full profile link; the "View LinkedIn" button only shows when this is filled in. */

const FOUNDERS=[
 {id:"shafaf",name:"Mohamed Shafaf Karumannil",short:"Shafaf",role:"Founder & CEO",years:"11+",photo:"images/founders/shafaf.jpg",
  title:"Mechanical Engineer | HVAC Construction & Commissioning Professional",
  email:"shafafk92@gmail.com",linkedin:"",
  bio:"Mechanical engineer with 11+ years of international experience in HVAC construction, commissioning and system handover across industrial, offshore and energy projects. Experienced in project coordination, PMT/PMC support and working with multidisciplinary teams in EPC environments.",
  quote:"Focused on delivering HVAC systems from construction to commissioning and operational readiness.",
  services:[["f_gear","HVAC Expertise","HVAC systems, utilities, mechanical systems"],["f_hat","Construction","Construction coordination, site execution, punch-list closure"],
   ["f_clip","Commissioning","Pre-commissioning, testing, troubleshooting, performance verification"],["f_play","System Handover","Documentation, handover support, operations readiness"],
   ["f_team","Project Coordination","Coordination with contractors, vendors and multidisciplinary teams"],["f_chart","PMT / PMC Support","Project management support, progress tracking, reporting"],
   ["f_build","EPC Projects","Experience in EPC, offshore, industrial and energy projects"],["f_wrench","Operational Support","Post-commissioning support and troubleshooting"]],
  skills:["Mechanical Engineering","HVAC","Construction","Commissioning","System Handover","Operations Support","Project Coordination","PMT / PMC","EPC Projects"]},
 {id:"shibili",name:"Shibili Areekara",short:"Shibili",role:"Co-Founder & CTO",years:"9+",photo:"images/founders/shibili.jpg",
  title:"iOS Engineer & Software Technology Professional",
  email:"",linkedin:"",
  bio:"Lead iOS engineer and technology professional with 9+ years of experience building secure, scalable and user-focused digital products. Works with Swift, SwiftUI and modern software architecture, with a strong focus on building reliable and intuitive mobile applications.",
  quote:"Turn ideas into secure, reliable and user-focused digital experiences.",
  services:[["f_phone","iOS Development","Native iOS apps using Swift and SwiftUI"],["f_code","Software Architecture","Clean architecture, scalable and maintainable codebases"],
   ["f_shield","FinTech Security","Secure and compliant financial applications"],["f_monitor","Web & Mobile Development","Full-stack support with React and modern technologies"],
   ["f_gear","Technical Consultation","Architecture discussion, code reviews and technology guidance"],["f_team","Team Leadership","Mentoring and leading engineering teams"]],
  skills:["iOS","Swift","SwiftUI","UIKit","React","Software Architecture","FinTech Security","CI/CD","Testing","Mobile Development","Technical Leadership","Problem Solving"]}
];
const FD_INTEREST=[["job","Job Opportunity","f_brief"],["collab","Project Collaboration","f_team"],["tech","Technical Discussion","f_chat"],["contract","Contract Work","f_doc"],["consult","Consultation","f_gear"]];

TOOLS.push(
{id:"founders",g:"hidden",icon:"f_team",name:"Meet the founders",short:"Engineering experience. Technology expertise.",
 intro:"We're open to job opportunities, project collaboration and technical discussions in engineering and software development.",
 fields:[],render(el,st){fdUI(el,st);},
 note:"Inquiries open in your own email or share app. Nothing is sent until you press send there."}
);

function fdMail(st){
 const to=st.to==="both"?FOUNDERS:FOUNDERS.filter(p=>p.id===st.to),ints=FD_INTEREST.filter(x=>(st.ints||[]).includes(x[0])).map(x=>x[1]);
 const addr=[...new Set(to.map(p=>p.email||FEEDBACK_EMAIL))];
 const subject=`MEPify inquiry: ${ints.length?ints.join(", "):"General"}`;
 const L=[`To: ${to.map(p=>p.name).join(" and ")}`,"",String(st.msg||"").trim(),"","---"];
 if(ints.length)L.push(`Interested in: ${ints.join(", ")}`);
 [["Name",st.name],["Company",st.company],["Reply to",st.contact]].forEach(([k,v])=>{if(String(v||"").trim())L.push(`${k}: ${String(v).trim()}`);});
 L.push(`Sent from MEPify v${APPV}`);
 return{addr,subject,body:L.join("\n")};
}

function fdUI(el,st){
 if(!Array.isArray(st.ints))st.ints=[];
 if(!["both",...FOUNDERS.map(p=>p.id)].includes(st.to))st.to="both";
 ["msg","name","company","contact"].forEach(k=>{if(typeof st[k]!=="string")st[k]=k==="name"?(SET.name||""):"";});
 const card=p=>`<article class="fd-card">
   <div class="fd-top"><img class="fd-ph" src="${p.photo}" alt="${esc(p.name)}" width="104" height="104" loading="lazy">
    <div class="fd-id"><h3>${esc(p.name)}</h3><div class="fd-role">${esc(p.role)}</div><p class="fd-title">${esc(p.title)}</p></div>
    <div class="fd-yrs"><b>${esc(p.years)}</b><span>Years <br>experience</span></div></div>
   <p class="fd-bio">${esc(p.bio)}</p>
   <blockquote class="fd-q">${esc(p.quote)}</blockquote>
   <div class="fd-h">Expertise &amp; services</div>
   <div class="fd-svc">${p.services.map(([ic,t,d])=>`<div><span class="fd-ic">${svg(ic)}</span><span><b>${esc(t)}</b><small>${esc(d)}</small></span></div>`).join("")}</div>
   <div class="fd-h">Key skills</div>
   <div class="fd-sk">${p.skills.map(s=>`<span>${esc(s)}</span>`).join("")}</div>
   <div class="fd-btns">
    <button type="button" class="x-pri" data-fd-go="${p.id}" data-int="job">${svg("f_mail")}Discuss an opportunity</button>
    <button type="button" class="x-sec2" data-fd-go="${p.id}" data-int="collab">${svg("f_team")}Work with me</button>
    ${p.linkedin?`<a class="x-sec2" href="${esc(p.linkedin)}" target="_blank" rel="noopener">${svg("f_in")}View LinkedIn</a>`:""}
   </div></article>`;
 el.innerHTML=`<div class="fd">
  <div class="fd-hero"><h2>Engineering experience. Technology expertise.</h2></div>
  ${FOUNDERS.map(card).join("")}
  <section class="fd-inq" id="fd-inq">
   <div class="fd-tag">Let's work together</div>
   <h3>Have a project or opportunity in mind?</h3>
   <p class="fd-sub">We're open to job opportunities, project collaboration and technical discussions.</p>
   <div class="x-f"><span>I'm interested in</span><div class="fd-ints">${FD_INTEREST.map(([k,t,ic])=>`<button type="button" data-fd-int="${k}" aria-pressed="${st.ints.includes(k)}">${svg(ic)}${t}</button>`).join("")}</div></div>
   <div class="x-f"><span>Who would you like to talk to?</span><div class="x-seg" data-fd-to>${[["both","Both founders"],...FOUNDERS.map(p=>[p.id,p.short])].map(([k,t])=>`<button type="button" data-v="${k}" aria-pressed="${st.to===k}">${esc(t)}</button>`).join("")}</div></div>
   <label class="x-f"><span>Message</span><textarea data-k="msg" rows="5" placeholder="Tell us about the role, project or question">${esc(st.msg)}</textarea></label>
   <label class="x-f"><span>Your name</span><input data-k="name" type="text" value="${esc(st.name)}" autocomplete="name"></label>
   <label class="x-f"><span>Company (optional)</span><input data-k="company" type="text" value="${esc(st.company)}" autocomplete="organization"></label>
   <label class="x-f"><span>Email or phone for a reply</span><input data-k="contact" type="text" value="${esc(st.contact)}" autocomplete="email"></label>
   <p class="x-sug-msg" data-fd-msg aria-live="polite"></p>
   <a class="x-pri amb" data-fd-send href="#">${svg("f_send")}Send inquiry</a>
   <button type="button" class="x-sec2" data-fd-share>${svg("share")}Send another way (WhatsApp, copy…)</button>
   <div class="x-sug-share" data-fd-sharebox><p class="shmsg x-sug-small"></p></div>
  </section></div>`;
 const msgEl=el.querySelector("[data-fd-msg]"),send=el.querySelector("[data-fd-send]");
 const upd=()=>{const{addr,subject,body}=fdMail(st);send.href=`mailto:${addr.join(",")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g,"\r\n"))}`;};
 const ready=()=>{if(String(st.msg||"").trim().length<3){msgEl.className="x-sug-msg bad";msgEl.textContent="Please write a short message first.";el.querySelector('[data-k="msg"]').focus();return false;}return true;};
 const done=t=>{msgEl.className="x-sug-msg ok";msgEl.textContent=t;};
 const setInts=()=>el.querySelectorAll("[data-fd-int]").forEach(b=>b.setAttribute("aria-pressed",st.ints.includes(b.dataset.fdInt)));
 const setTo=()=>el.querySelectorAll("[data-fd-to] button").forEach(b=>b.setAttribute("aria-pressed",st.to===b.dataset.v));
 el.querySelectorAll("[data-k]").forEach(i=>i.addEventListener("input",()=>{st[i.dataset.k]=i.value;save();upd();if(i.dataset.k==="msg")msgEl.textContent="";}));
 el.querySelectorAll("[data-fd-int]").forEach(b=>b.onclick=()=>{const k=b.dataset.fdInt;st.ints=st.ints.includes(k)?st.ints.filter(x=>x!==k):[...st.ints,k];save();setInts();upd();});
 el.querySelectorAll("[data-fd-to] button").forEach(b=>b.onclick=()=>{st.to=b.dataset.v;save();setTo();upd();});
 el.querySelectorAll("[data-fd-go]").forEach(b=>b.onclick=()=>{st.to=b.dataset.fdGo;if(!st.ints.includes(b.dataset.int))st.ints=[...st.ints,b.dataset.int];save();setTo();setInts();upd();
  const s=document.getElementById("fd-inq");if(s)s.scrollIntoView({behavior:"smooth",block:"start"});setTimeout(()=>{const m=el.querySelector('[data-k="msg"]');if(m)m.focus({preventScroll:true});},400);});
 send.addEventListener("click",e=>{if(!ready()){e.preventDefault();return;}upd();done("Thank you! Press send in the email app that opened. If nothing opened, use “Send another way”.");});
 el.querySelector("[data-fd-share]").onclick=()=>{if(!ready())return;const{addr,subject,body}=fdMail(st);doShare(subject,`To: ${addr.join(", ")}\n${subject}\n\n${body}`,el.querySelector("[data-fd-sharebox]"));done("Thank you! Pick an app to send it, or copy the text and send it to "+addr.join(", ")+".");};
 upd();
}
