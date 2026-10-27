/* MEPify · Troubleshooter faults: plumb. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first.
   by Mohamed Shafaf Karumannil */

TSD.plumb=[
{id:"lowp",n:"Low water pressure",d:"Weak flow at taps or showers",c:[
  ["Supply pressure low","Measure pressure at the incoming main or booster outlet.","Pressure from height"],
  ["Partly closed valve or blocked strainer","Check isolating valves, the meter and inline strainers.",""],
  ["Pipe undersized or scaled","Check velocity and friction loss for the actual flow.","Friction loss"],
  ["Aerator or shower head blocked","Clean or replace.",""],
  ["PRV set too low or faulty","Check the pressure reducing valve setting and outlet pressure.",""]]},

{id:"upper",n:"No water on upper floors",d:"",c:[
  ["Not enough head or booster not running","Each 10 m of height needs about 98 kPa. Check the booster set.","Pressure from height"],
  ["Booster set fault","Check pump status, pressure switch or transducer and the vessel pre-charge.","Total pump head"],
  ["Air lock in the riser","Vent the high points.",""],
  ["Roof tank empty","Check the float valve and the transfer pump.",""]]},

{id:"hammer",n:"Water hammer",d:"Banging when taps or valves close",c:[
  ["Fast-closing valves","Solenoid and quarter-turn valves close too quickly. Fit arrestors near them.",""],
  ["High velocity","Velocity above about 2 m/s makes hammer worse.","Pipe flow & velocity"],
  ["High static pressure","Fit or adjust a PRV.",""],
  ["Loose pipe clips","Add or tighten supports.",""]]},

{id:"nohot",n:"No hot water or not hot enough",d:"",c:[
  ["Heater has no power or thermostat set low","Check the breaker, isolator, thermostat and the element or burner.",""],
  ["Element or thermostat failed","Measure element resistance and check the cut-out has not tripped.",""],
  ["Heater too small for demand","Check the heater rating against the draw-off.","Water heater size"],
  ["Mixing valve faulty or cold crossover","Check the TMV and any mixer that lets cold into the hot line.",""],
  ["Long dead leg or no return circulation","Water cools in long pipes. Check the return pump.",""]]},

{id:"scald",n:"Hot water too hot",d:"Scalding risk",c:[
  ["Thermostat set too high or stuck","Check the setting and measure outlet temperature.",""],
  ["No or faulty thermostatic mixing valve","Fit or service the TMV at outlets, typically 41–43 °C for showers.",""],
  ["Solar or heat pump overheating","Check the limit settings.",""]]},

{id:"boost",n:"Booster pump short cycling",d:"Starts and stops often",c:[
  ["Pressure vessel pre-charge wrong","Pre-charge should be about 10 % below cut-in pressure with the system drained.",""],
  ["Leak or dripping outlet","A small leak drops pressure and restarts the pump.",""],
  ["Pressure switch band too narrow","Widen the cut-in to cut-out difference.",""],
  ["Non-return valve passing","Water flows back and pressure falls.",""]]},

{id:"leak",n:"Leaking joints",d:"",c:[
  ["Fitting not fully inserted or tightened","Check insertion depth marks and compression nuts.",""],
  ["Wrong fitting for the pipe","PPR, PEX and copper need their own fittings and tools.",""],
  ["Pressure above rating","Check working pressure and do a hydro test to spec.",""],
  ["Expansion stress","Long hot lines need expansion loops or joints.",""]]},

{id:"block",n:"Drain blocked or slow",d:"",c:[
  ["Blockage","Rod or jet the line. Check grease traps on kitchen drains.",""],
  ["Slope too flat or back-fall","Check the fall along the run.","Drain slope"],
  ["Poor venting","Gurgling and slow draining point to a blocked or missing vent.",""],
  ["Pipe undersized","Check the size against fixture units.",""]]},

{id:"smell",n:"Sewer smell",d:"",c:[
  ["Dry trap","Unused floor drains lose their water seal. Refill or fit trap primers.",""],
  ["Vent blocked or missing","Siphoning pulls traps dry. Check the vent stack.",""],
  ["Loose joint or cracked pipe","Smoke test the drainage.",""],
  ["Air admittance valve stuck","Replace the AAV.",""]]},

{id:"cistern",n:"Toilet keeps running",d:"",c:[
  ["Flush valve seal worn","Replace the seal or washer.",""],
  ["Fill valve set too high","Water runs into the overflow. Lower the float.",""],
  ["Fill valve not closing","Clean or replace the valve.",""]]},

{id:"dirty",n:"Dirty or discoloured water",d:"",c:[
  ["Rust from steel pipes or tanks","Check for galvanised pipe or corroded tanks.",""],
  ["Disturbed sediment","After shutdowns or high flow. Flush the system.","Pipe volume"],
  ["Tank not cleaned","Clean and disinfect storage tanks.",""]]},

{id:"prv",n:"Relief valve dripping on water heater",d:"T&P or pressure relief valve",c:[
  ["Supply pressure too high","Fit or adjust a PRV on the cold inlet.",""],
  ["No expansion vessel or vessel flat","Hot water expands. Check the vessel pre-charge.",""],
  ["Thermostat overheating","Check the water temperature.",""],
  ["Valve seat dirty or worn","Operate the lever to flush, or replace the valve.",""]]},

{id:"overflow",n:"Water tank overflowing",d:"",c:[
  ["Float valve not closing","Clean or replace the float valve or washer.",""],
  ["Float set too high","Adjust the float arm.",""],
  ["Level switch fault on pumped fill","Check the level controls and pump control.",""]]}
];
