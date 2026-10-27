/* MEPify · Shared helpers: app root, svg(), num(), number format f(), bold B()
   by Mohamed Shafaf Karumannil */

const app=document.getElementById("app");
const SQ3=Math.sqrt(3);
const svg=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
const num=v=>{const n=parseFloat(v);return isFinite(n)?n:NaN};
function f(x,d){if(!isFinite(x))return "—";const a=Math.abs(x);const dec=d!=null?d:a>=1000?0:a>=100?1:a>=1?2:a>=0.01?3:5;return x.toLocaleString("en-US",{maximumFractionDigits:dec})}
const B=(x,u)=>`<strong>${x}${u?" "+u:""}</strong>`;
