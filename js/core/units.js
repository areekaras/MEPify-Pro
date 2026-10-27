/* MEPify · Unit tables, cable sizing and derating tables, duct and pipe sizes, unit converter data
   by Mohamed Shafaf Karumannil */

/* unit tables */
const AIRF={"m³/h":1/3600,"CFM":0.000471947,"L/s":0.001};
 // to m³/s
const SIZES=[1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300];
const AMP_CU=[17.5,24,32,41,57,76,96,119,144,184,223,259,299,341,403,464];
/* Cable derating, IEC 60364-5-52. Air temperature, PVC 70 °C (Table B.52.14) */
const DER_T=[[10,1.22],[15,1.17],[20,1.12],[25,1.06],[30,1.00],[35,0.94],[40,0.87],[45,0.79],[50,0.71],[55,0.61],[60,0.50]];
function derT(t){if(t<=10)return 1.22;for(let i=1;i<DER_T.length;i++){const[a,fa]=DER_T[i-1],[b,fb]=DER_T[i];if(t<=b)return fa+(fb-fa)*(t-a)/(b-a);}return 0.5;}
/* Grouping (Table B.52.17): bunched/enclosed, or single layer on wall/tray. Between listed counts the larger group is used. */
const DER_G={bunch:[[1,1],[2,.80],[3,.70],[4,.65],[5,.60],[6,.57],[7,.54],[8,.52],[9,.50],[12,.45],[16,.41],[20,.38]],
             layer:[[1,1],[2,.85],[3,.79],[4,.75],[5,.73],[6,.72],[7,.72],[8,.71],[9,.70]]};
function derG(n,arr){const t=DER_G[arr]||DER_G.bunch;if(n<=1)return 1;for(const[c,fc]of t)if(n<=c)return fc;return t[t.length-1][1];}
const ROUND=[100,125,160,200,250,315,355,400,450,500,560,630,710,800,900,1000,1120,1250];
const DE=(a,b)=>1.30*Math.pow(a*b,0.625)/Math.pow(a+b,0.25);
 // equal-friction equivalent diameter
const PIPE=[["DN15",15.8],["DN20",20.9],["DN25",26.6],["DN32",35.1],["DN40",40.9],["DN50",52.5],["DN65",62.7],["DN80",77.9],["DN100",102.3],["DN125",128.2],["DN150",154.1],["DN200",202.7],["DN250",254.5],["DN300",303.2],["DN350",333.4],["DN400",381]];
const AC=[0.75,1,1.5,2,2.5,3,4,5];
const CONV={
  length:{label:"Length",u:[["m",1],["mm",0.001],["cm",0.01],["km",1000],["in",0.0254],["ft",0.3048],["yd",0.9144],["mile",1609.344]]},
  area:{label:"Area",u:[["m²",1],["ft²",0.092903],["cm²",1e-4],["km²",1e6],["yd²",0.83612736],["acre",4046.8564],["hectare",10000],["cent",40.468564]]},
  volume:{label:"Volume",u:[["L",0.001],["mL",1e-6],["m³",1],["US gal",0.00378541],["UK gal",0.00454609],["ft³",0.0283168],["in³",1.6387064e-5]]},
  mass:{label:"Weight",u:[["kg",1],["g",0.001],["tonne",1000],["lb",0.45359237],["oz",0.028349523],["US ton",907.18474]]},
  temp:{label:"Temperature",u:[["°C"],["°F"],["K"]]},
  speed:{label:"Speed",u:[["m/s",1],["km/h",1/3.6],["mph",0.44704],["ft/s",0.3048],["ft/min",0.00508],["knot",0.514444]]},
  pressure:{label:"Pressure",u:[["Pa",1],["kPa",1000],["bar",100000],["psi",6894.76],["in WG",249.089],["mm WG",9.80665],["mmHg",133.322],["atm",101325]]},
  energy:{label:"Energy",u:[["kWh",3.6e6],["kJ",1000],["J",1],["BTU",1055.056],["kcal",4186.8],["therm",105505585]]},
  power:{label:"Cooling / power",u:[["kW",1000],["TR",3516.85],["BTU/h",0.29307107],["W",1],["HP",745.7],["kcal/h",1.163]]},
  airflow:{label:"Airflow",u:[["m³/h",1/3600],["CFM",0.000471947],["L/s",0.001],["m³/s",1]]},
  water:{label:"Water flow",u:[["L/s",1],["m³/h",1/3.6],["US GPM",0.0630902],["L/min",1/60]]},
  time:{label:"Time",u:[["s",1],["min",60],["h",3600],["day",86400],["week",604800],["year",31536000]]},
  data:{label:"Data",u:[["MB",1048576],["KB",1024],["B",1],["GB",1073741824],["TB",1099511627776]]}
};
const toC={"°C":x=>x,"°F":x=>(x-32)*5/9,"K":x=>x-273.15}, fromC={"°C":x=>x,"°F":x=>x*9/5+32,"K":x=>x+273.15};
