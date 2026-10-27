/* MEPify · Site safety, hazardous area and piping data (WBGT, gases, zones, schedules, flanges)
   by Mohamed Shafaf Karumannil */

/* ---------- v1.17 data: site safety, hazardous areas, piping ---------- */
// ACGIH TLV WBGT (°C), acclimatised. Rows: work/rest regime; cols: light, moderate, heavy, very heavy
const TLV=[[31,28,null,null],[31,29,27.5,null],[32,30,29,28],[32.5,31.5,30.5,30]];
const TLVR=["75–100 % work","50–75 % work","25–50 % work","0–25 % work"];
// IEC 60079-20-1: [name, gas group, autoignition °C, LEL %vol, UEL %vol, density rel. air]
const EXG={methane:["Methane / natural gas / LNG","IIA",600,4.4,17,0.55],ethane:["Ethane","IIA",515,2.4,15.5,1.04],propane:["Propane / LPG","IIA",450,1.7,10.9,1.56],
 butane:["n-Butane","IIA",372,1.4,9.3,2.05],pentane:["n-Pentane","IIA",243,1.1,8.7,2.48],hydrogen:["Hydrogen","IIC",560,4.0,77,0.07],acetylene:["Acetylene","IIC",305,2.3,100,0.90],
 ethylene:["Ethylene","IIB",440,2.3,36,0.97],h2s:["Hydrogen sulphide","IIB",260,4.0,45.5,1.19],ammonia:["Ammonia","IIA",630,15,33.6,0.59],methanol:["Methanol","IIA",440,6.0,36,1.11],
 petrol:["Petrol / gasoline","IIA",280,1.4,7.6,3.0],diesel:["Diesel","IIA",220,0.6,6.5,4.0],kerosene:["Kerosene / jet fuel","IIA",210,0.7,5.0,4.5]};
const TCL={T1:450,T2:300,T3:200,T4:135,T5:100,T6:85};
// [EPL, ATEX category, protection types, definition, typical release, US equivalent]
const EXZ={"0":["Ga","1G","ia, ma, or two independent Gb types","Zone 0: explosive gas is present continuously or for long periods.","More than about 1000 h/year","Class I Div 1"],
 "1":["Gb","2G","d, e (eb), ib, mb, px, py, q, o, plus all Zone 0 types","Zone 1: explosive gas is likely in normal operation.","About 10 to 1000 h/year","Class I Div 1"],
 "2":["Gc","3G","ec / nA, nC, nR, ic, mc, pz, plus all Zone 0 and 1 types","Zone 2: explosive gas is not likely, and only for a short time.","Less than about 10 h/year","Class I Div 2"],
 "20":["Da","1D","ta, ia, ma","Zone 20: a combustible dust cloud is present continuously or often.","Continuous or frequent","Class II Div 1"],
 "21":["Db","2D","tb, ib, mb, pb, plus all Zone 20 types","Zone 21: a dust cloud is likely in normal operation.","Occasional","Class II Div 1"],
 "22":["Dc","3D","tc, ic, mc, pc, plus all Zone 20 and 21 types","Zone 22: a dust cloud is not likely, and only for short periods.","Rare and short","Class II Div 2"]};
// ASME B36.10/B36.19: [NPS, OD mm, wall mm for Sch 10S, 40, 80, 160]
const SCHN=["10S","40","80","160"];
const SCH=[['1/2"',21.3,2.11,2.77,3.73,4.78],['3/4"',26.7,2.11,2.87,3.91,5.56],['1"',33.4,2.77,3.38,4.55,6.35],['1-1/2"',48.3,2.77,3.68,5.08,7.14],['2"',60.3,2.77,3.91,5.54,8.74],
 ['3"',88.9,3.05,5.49,7.62,11.13],['4"',114.3,3.05,6.02,8.56,13.49],['6"',168.3,3.40,7.11,10.97,18.26],['8"',219.1,3.76,8.18,12.70,23.01],['10"',273.1,4.19,9.27,15.09,28.58],['12"',323.9,4.57,10.31,17.48,33.32]];
// ASME B16.5 Table 2-1.1, group 1.1 (A105/WCB): [°C, Class 150, 300, 600, 900, 1500, 2500] bar g
const FCL=[150,300,600,900,1500,2500];
const FPT=[[38,19.6,51.1,102.1,153.2,255.3,425.5],[50,19.2,50.1,100.2,150.4,250.6,417.7],[100,17.7,46.6,93.2,139.8,233.0,388.3],[150,15.8,45.1,90.2,135.2,225.4,375.6],
 [200,13.8,43.8,87.6,131.4,219.0,365.0],[250,12.1,41.9,83.9,125.8,209.7,349.5],[300,10.2,39.8,79.6,119.5,199.1,331.8],[325,9.3,38.7,77.4,116.1,193.6,322.6],
 [350,8.4,37.6,75.1,112.7,187.8,313.0],[375,7.4,36.4,72.7,109.1,181.8,303.1],[400,6.5,34.7,69.4,104.2,173.6,289.3]];
// Water vapour pressure, kPa abs (Antoine)
function pvap(t){const a=t<=100?[8.07131,1730.63,233.426]:[8.14019,1810.94,244.485];return Math.pow(10,a[0]-a[1]/(a[2]+t))*0.133322;}
