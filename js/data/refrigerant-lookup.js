/* MEPify · Refrigerant list helpers: search, safety-group text and GWP list.
   by Mohamed Shafaf Karumannil. Data is in js/data/refrigerant-list.js. */

const REFS=REFDB.map(a=>Object.fromEntries(REFDB_COLS.map((c,i)=>[c,a[i]||""])));
const REF_TYPES={CFC:"Chlorofluorocarbon (banned)",HCFC:"Hydrochlorofluorocarbon (being phased out)",HFC:"Hydrofluorocarbon",HFO:"Hydrofluoroolefin (low GWP)",
 HCFO:"Hydrochlorofluoroolefin (low GWP)",HC:"Hydrocarbon (natural, flammable)",HO:"Hydrocarbon olefin",PFC:"Perfluorocarbon",PFO:"Perfluoroolefin",PCC:"Perchlorocarbon",
 HCC:"Hydrochlorocarbon",HCO:"Hydrochloroolefin",CFO:"Chlorofluoroolefin",H:"Halon (bromine)","HFC/H":"HFC / halon blend","HFC / HFO":"HFC / HFO blend",
 Inorganic:"Inorganic (natural)",Organic:"Organic compound"};
const REF_SG={A1:"Lower toxicity, no flame spread",A2L:"Lower toxicity, mildly flammable",A2:"Lower toxicity, flammable",A3:"Lower toxicity, highly flammable",
 B1:"Higher toxicity, no flame spread",B2L:"Higher toxicity, mildly flammable",B2:"Higher toxicity, flammable",B3:"Higher toxicity, highly flammable"};
/* "a hydrofluoroolefin (low GWP)" style text for a type */
const refTypeText=t=>{const d=REF_TYPES[t];if(!d)return "a "+t;const s=d.charAt(0).toLowerCase()+d.slice(1);return (/^[aeiou]/.test(s)?"an ":"a ")+s;};
/* key used by the P/T tools, e.g. "R-1234ze(E)" -> "R1234ze" */
const refKeyOf=num=>{const k=String(num).replace(/^R-/,"R").replace(/\((E|Z)\)$/,"").replace(/\s.*$/,"");return REF[k]?k:null;};
const refNorm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]/g,"");
function refFind(q,sg){
 const n=refNorm(q),ql=String(q||"").toLowerCase().trim(),num=n.replace(/^r(?=\d)/,"");
 const okSg=r=>!sg||sg==="all"||(sg==="B"?/^B/.test(r.sg):r.sg.replace("?","")===sg);
 const score=r=>{const rn=refNorm(r.num).replace(/^r(?=\d)/,"");
  if(!n)return 3;if(rn===num)return 0;if(rn.startsWith(num))return 1;
  const nm=r.name.toLowerCase();if(nm===ql||nm.split(/[\s()/,]+/).includes(ql))return 1.5;
  if(nm.includes(ql)||refNorm(r.alias).includes(n)||refNorm(r.formula)===n)return 2;if(rn.includes(num))return 2.5;return 9;};
 return REFS.filter(okSg).map(r=>[score(r),r]).filter(x=>x[0]<9).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
}
/* GWP tool: the AR4 refrigerants first, then every other refrigerant that has a GWP in the list */
const GWPX={};
REFS.forEach(r=>{const k=r.num.replace(/^R-/,"R").replace(/\s.*$/,""),m=String(r.gwp).replace(/,/g,"").match(/^[<>~≈]?\s*(\d+(?:\.\d+)?)/);
 if(m&&!(k in GWP)&&!(k in GWPX))GWPX[k]={n:r.num,g:parseFloat(m[1])};});
const GWPOPTS=[...Object.keys(GWP).map(k=>[k,k.replace("R","R-")+" (AR4)"]),...Object.keys(GWPX).map(k=>[k,GWPX[k].n])];
