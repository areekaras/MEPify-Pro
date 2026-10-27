/* MEPify · Kitchen hood exhaust rates and dew point helper
   by Mohamed Shafaf Karumannil */

/* ---------- v1.16 data ---------- */
// IMC 507.13 hood exhaust, cfm per linear ft (null = not permitted)
const HOOD={wall:{light:200,med:300,heavy:400,xh:550},isl:{light:400,med:500,heavy:600,xh:700},dbl:{light:250,med:300,heavy:400,xh:550},back:{light:250,med:300,heavy:400,xh:null}};
function dewC(t,rh){const a=17.625,b=243.04,g=Math.log(rh/100)+a*t/(b+t);return b*g/(a-g);}
