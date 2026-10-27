/* MEPify · Troubleshooter sections and safety notes. Faults live in one file per section.
   by Mohamed Shafaf Karumannil */

const TSD={};
const TSAFE={"hvac":"Isolate and lock out before opening fans, heaters or panels. Let duct heaters cool before touching elements.","elec":"Isolate, lock out and prove dead before working. Only qualified persons should test live circuits, with the right PPE and a CAT-rated meter.","ref":"Recover refrigerant, never vent it. Isolate power before opening panels, and wear gloves and goggles when connecting gauges.","plumb":"Isolate water and power before work. Let hot water cool and relieve pressure before opening pipes or heaters.","fire":"Tell the fire alarm monitoring company and site control before any test. Isolate only with a permit, post a fire watch while systems are impaired, and restore every valve to open.","util":"Steam and air: isolate, vent the pressure and let lines cool before opening anything. Gas: if you smell gas, no switches or flames; ventilate and shut the emergency control valve."};
const TSEC=[["all","All"],["hvac","HVAC"],["elec","Electrical"],["ref","Refrigeration"],["plumb","Plumbing"],["fire","Fire protection"],["util","Steam, gas & air"]];
const TSN={hvac:"HVAC",elec:"Electrical",ref:"Refrigeration",plumb:"Plumbing",fire:"Fire protection",util:"Steam, gas & air"};
