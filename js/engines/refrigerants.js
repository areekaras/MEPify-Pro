/* MEPify · Refrigerant saturation data, P/T helpers and P/T slider
   by Mohamed Shafaf Karumannil */

/* ---------- REFRIGERANTS: saturation pressure, bar absolute, -40..65 °C every 5 °C ----------
   Pure fluids: NIST Chemistry WebBook. Blends (bubble b / dew d): manufacturer property tables. */
const REF={
 R410A:{n:"R-410A",b:[175.5,218.9,270.3,330.6,400.7,481.7,574.6,680.6,800.7,936.2,1088.4,1258.4,1447.6,1657.4,1889.3,2144.9,2425.6,2733.5,3070.6,3439.1,3841.8,4282.4].map(x=>x/100),
        d:[174.9,218.1,269.4,329.4,399.3,480.0,572.7,678.3,798.1,933.2,1084.8,1254.3,1443.0,1652.2,1883.5,2138.5,2418.7,2726.1,3062.8,3431.3,3834.4,4276.0].map(x=>x/100)},
 R32:{n:"R-32",b:[1.7741,2.2138,2.7344,3.3456,4.0575,4.8807,5.8263,6.9058,8.1310,9.5145,11.069,12.808,14.746,16.896,19.275,21.898,24.783,27.948,31.412,35.199,39.332,43.843]},
 R22:{n:"R-22",b:[1.0523,1.3203,1.6389,2.0143,2.4531,2.9620,3.5478,4.2180,4.9798,5.8411,6.8094,7.8931,9.1001,10.439,11.919,13.548,15.336,17.292,19.427,21.751,24.275,27.011]},
 R134a:{n:"R-134a",b:[0.51209,0.66144,0.84378,1.0640,1.3273,1.6394,2.0060,2.4334,2.9280,3.4966,4.1461,4.8837,5.7171,6.6538,7.7020,8.8698,10.166,11.599,13.179,14.915,16.818,18.898]},
 R407C:{n:"R-407C",b:[120.3,150.8,187.1,229.9,279.9,337.9,404.7,481.1,567.9,666.0,776.4,900.0,1037.6,1190.3,1359.1,1545.0,1749.0,1972.3,2216.0,2481.2,2769.2,3081.4].map(x=>x/100),
        d:[85.7,109.7,138.7,173.5,214.7,263.2,319.8,385.3,460.7,546.9,644.9,755.7,880.3,1020.0,1175.9,1349.2,1541.3,1753.6,1987.8,2245.4,2528.7,2840.0].map(x=>x/100)},
 R404A:{n:"R-404A",b:[136.7,170.1,209.5,255.4,308.7,370.1,440.4,520.5,611.1,713.3,827.8,955.6,1097.7,1255.0,1428.7,1619.7,1829.2,2058.3,2308.2,2580.0,2875.1,3194.6].map(x=>x/100),
        d:[132.5,165.3,204.1,249.3,301.8,362.5,432.1,511.4,601.3,702.7,816.5,943.6,1085.1,1241.8,1415.0,1605.6,1814.8,2043.9,2294.0,2566.4,2862.6,3184.0].map(x=>x/100)},
 R290:{n:"R-290",b:[1.1112,1.3723,1.6783,2.0343,2.4452,2.9162,3.4528,4.0604,4.7446,5.5112,6.3660,7.3151,8.3646,9.5207,10.790,12.179,13.694,15.343,17.133,19.072,21.167,23.429]},
 R600a:{n:"R-600a",b:[0.28702,0.36797,0.46622,0.58427,0.72477,0.89053,1.0845,1.3098,1.5696,1.8672,2.2061,2.5899,3.0222,3.5067,4.0472,4.6477,5.3121,6.0444,6.8490,7.7299,8.6916,9.7385]},
 R717:{n:"R-717",b:[0.71633,0.93042,1.1938,1.5142,1.9003,2.3611,2.9064,3.5466,4.2925,5.1556,6.1479,7.2819,8.5704,10.027,11.665,13.500,15.545,17.817,20.330,23.100,26.145,29.481]}
};
const RT0=-40,RDT=5,PATM=1.01325;
const GAUGE={"bar g":1,"psig":0.0689476,"kPa g":0.01};
const REFOPTS=Object.keys(REF).map(k=>[k,REF[k].n]);
const refCurve=(k,kind)=>{const r=REF[k];return kind==="d"&&r.d?r.d:r.b;};
function refP(k,t,kind){const c=refCurve(k,kind),x=(t-RT0)/RDT,i=Math.floor(x);if(x<0||x>c.length-1)return NaN;const j=Math.min(i,c.length-2),fr=x-j;return Math.exp(Math.log(c[j])+(Math.log(c[j+1])-Math.log(c[j]))*fr);}
function refT(k,P,kind){const c=refCurve(k,kind);if(!(P>=c[0]&&P<=c[c.length-1]))return NaN;let i=0;while(i<c.length-2&&P>c[i+1])i++;const a=Math.log(c[i]),b=Math.log(c[i+1]);return RT0+RDT*(i+(Math.log(P)-a)/(b-a));}
const isBlend=k=>!!REF[k].d;
const toAbs=(v,u)=>v*(GAUGE[u]||1)+PATM;
function ptTable(k,u){const r=REF[k],bl=isBlend(k),fac=GAUGE[u]||1;let h=`<div class="card" style="padding:12px"><div class="lbl" style="font-size:13px">${r.n} pressure–temperature chart (${u})</div><div class="ptt"><div class="pr head"><span>°C</span>${bl?"<span>Liquid (bubble)</span><span>Vapour (dew)</span>":"<span>Pressure</span>"}</div>`;
  for(let i=0;i<r.b.length;i++){const t=RT0+i*RDT;const g=x=>f((x-PATM)/fac,fac<0.05?0:2);h+=`<div class="pr"><span>${t}</span><span>${g(r.b[i])}</span>${bl?`<span>${g(r.d[i])}</span>`:""}</div>`;}
  return h+`</div><p class="note">Gauge pressure at sea level. Negative values are vacuum.</p></div>`;}
const shState=x=>x<2?{ok:false,text:"Too low"}:x<4?{ok:false,text:"Low"}:x<=12?{ok:true,text:"Normal range"}:x<=20?{ok:false,text:"High"}:{ok:false,text:"Very high"};
const scState=x=>x<1?{ok:false,text:"No subcooling"}:x<3?{ok:false,text:"Low"}:x<=10?{ok:true,text:"Normal range"}:x<=15?{ok:false,text:"High"}:{ok:false,text:"Very high"};
/* P/T slider */
const slideT=v=>{const t=num(v.ts);return isFinite(t)?Math.min(65,Math.max(-40,t)):5;};
function slideHTML(k,pu,T){
  const fac=GAUGE[pu],kind=isBlend(k)?"d":"b",ticks=[-40,-20,0,20,40,60];
  const pos=t=>((t+40)/105*100).toFixed(2);
  const g=t=>f((refP(k,t,kind)-PATM)/fac,fac<0.05?0:1);
  return `<div class="card slide"><div class="sl-top"><button type="button" class="sl-b" data-step="-0.5" aria-label="Down 0.5 °C">−</button>
   <div class="sl-t"><b id="slT">${f(T,1)}</b><span>°C saturation</span></div>
   <button type="button" class="sl-b" data-step="0.5" aria-label="Up 0.5 °C">+</button></div>
   <input type="range" id="slR" class="sl-r" min="-40" max="65" step="0.5" value="${T}" aria-label="Saturation temperature">
   <div class="sl-sc" aria-hidden="true">${ticks.map(t=>`<span style="left:${pos(t)}%"><i></i>${t}°<em>${g(t)}</em></span>`).join("")}</div>
   <p class="note">Top row °C, bottom row ${pu}${isBlend(k)?" (dew)":""}.</p></div>`;
}
