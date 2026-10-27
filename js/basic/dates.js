/* MEPify · Date calculator helpers
   by Mohamed Shafaf Karumannil */

/* ---------- BASIC: dates ---------- */
const pad2=n=>String(n).padStart(2,"0");
const todayISO=(()=>{const d=new Date();return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());})();
const isoAdd=(iso,days)=>{const d=new Date(iso+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);};
const pDate=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");return m?Date.UTC(+m[1],+m[2]-1,+m[3]):NaN;};
const dFmt=t=>new Date(t).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"UTC"});
function ymd(a,b){const A=new Date(a),Bd=new Date(b);let y=Bd.getUTCFullYear()-A.getUTCFullYear(),m=Bd.getUTCMonth()-A.getUTCMonth(),d=Bd.getUTCDate()-A.getUTCDate();
 if(d<0){m--;d+=new Date(Date.UTC(Bd.getUTCFullYear(),Bd.getUTCMonth(),0)).getUTCDate();}if(m<0){y--;m+=12;}return[y,m,d];}
function addMonths(t,n){const d=new Date(t),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+n);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.getTime();}
const plural=(n,w)=>`${n} ${w}${n===1?"":"s"}`;
