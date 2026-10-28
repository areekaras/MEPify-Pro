/* MEPify · Shared helpers: app root, svg(), num(), number format f(), bold B()
   by Mohamed Shafaf Karumannil */

const app=document.getElementById("app");
const SQ3=Math.sqrt(3);
const svg=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
/* number from user text. Accepts a decimal comma ("8,5"), thousands separators ("1,500" "1.234,5") and plain numbers. */
const num=v=>{if(typeof v==="number")return isFinite(v)?v:NaN;let s=String(v==null?"":v).trim();const c=s.lastIndexOf(","),d=s.lastIndexOf(".");
  if(c>-1){if(d>-1)s=c>d?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"");
   else s=(s.split(",").length===2&&!/^-?\d{1,3},\d{3}$/.test(s))?s.replace(",","."):s.replace(/,/g,"");}
  const n=parseFloat(s);return isFinite(n)?n:NaN};
function f(x,d){if(!isFinite(x))return "—";const a=Math.abs(x);const dec=d!=null?d:a>=1000?0:a>=100?1:a>=1?2:a>=0.01?3:5;return x.toLocaleString("en-US",{maximumFractionDigits:dec})}
const B=(x,u)=>`<strong>${x}${u?" "+u:""}</strong>`;
