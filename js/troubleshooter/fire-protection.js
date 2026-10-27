/* MEPify · Troubleshooter faults: fire. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first.
   by Mohamed Shafaf Karumannil */

TSD.fire=[
{id:"sphead",n:"Sprinkler head leaking or weeping",d:"Drips or wet ceiling tile at a head",c:[
  ["Head damaged or knocked","Look for a bent deflector, cracked bulb or impact marks. Replace with an identical listed head. Never repair a sprinkler.",""],
  ["Thread joint leaking","Leak at the fitting, not the frame. Drain down, re-seal with listed compound or tape and refit. Do not over-tighten, it cracks the frame.",""],
  ["Corrosion or deposits on the seat","Green or white crust around the orifice. Replace the head and check other heads in the same area.",""],
  ["Pressure surges from the supply","Check the gauge history or watch during jockey pump starts. Static pressure should be steady.","Sprinkler flow & pressure"],
  ["Freezing or heat damage","Cold rooms or near heaters. Use the correct temperature rating or dry heads for cold areas.",""]]},

{id:"wetdrop",n:"Wet system pressure keeps dropping",d:"Gauge above the alarm valve falls over time",c:[
  ["Drain or inspector's test valve passing","Feel or listen at the main drain and test valve outlets. Re-seat or replace the valve.",""],
  ["Leak in the pipework","Walk the system. Look for wet tiles, stains and drips at joints and grooved couplings.",""],
  ["Alarm check valve clapper passing","Pressure above the valve falls to supply pressure. Clean the clapper seat and rubber facing.",""],
  ["Thermal effect","Pressure follows the room temperature. A relief valve (175 psi) handles expansion; small daily swings are normal.",""]]},

{id:"falsealm",n:"False water-flow alarm",d:"Flow alarm with no sprinkler open",c:[
  ["Pressure surge from the main or pumps","Alarms that match jockey or booster starts. Increase the flow switch retard (30–90 s) or add a surge check.",""],
  ["Flow switch retard set too short","Check the retard setting on the vane switch. NFPA 72 allows up to 90 s.",""],
  ["Trapped air in the system","Air compresses and the water surges past the switch. Vent the high points.",""],
  ["Wiring or switch fault","Check the switch contacts and the end-of-line resistor at the fire panel.",""],
  ["Small real leak","A steady small flow can lift the paddle. Check for leaks and passing drain valves.",""]]},

{id:"noflow",n:"No flow alarm on inspector's test",d:"Test valve open but no alarm",c:[
  ["Test valve not fully open or orifice blocked","Open fully. The test orifice must match the smallest sprinkler K-factor.","Sprinkler flow & pressure"],
  ["Retard set too long","Wait the full retard time, up to 90 s, before calling it a fail.",""],
  ["Flow switch paddle damaged or stuck","Remove and inspect the vane. Replace if bent or torn.",""],
  ["Panel zone disabled or wiring open","Check the zone status and the circuit at the fire alarm panel.",""],
  ["Isolating valve closed upstream","Check every control valve is open and supervised.",""]]},

{id:"gong",n:"Water motor gong not ringing",d:"Alarm valve trips but no bell",c:[
  ["Alarm line valve closed","Open the alarm line isolating valve at the alarm check valve trim.",""],
  ["Alarm line strainer blocked","Clean the strainer on the alarm line.",""],
  ["Retard chamber drain stuck open","Water drains away before filling the line. Clean the restriction orifice.",""],
  ["Water motor seized","Check the impeller and gong spindle turn freely. Clean or replace.",""]]},

{id:"drytrip",n:"Dry pipe valve trips by itself",d:"Valve trips with no fire",c:[
  ["Air leak in the pipework","Air pressure falls overnight. Soap test joints, valves and drains.",""],
  ["Air compressor or maintenance device failed","Check the compressor runs and the air maintenance device keeps the set pressure.",""],
  ["Low-air alarm not set or ignored","Set the low-air alarm about 10 psi above the trip point and check it reaches the panel.",""],
  ["Water above the clapper","Priming water too high. Drain to the correct level.",""],
  ["Clapper seat dirty or damaged","Strip, clean and inspect the seat and facing.",""]]},

{id:"comprun",n:"Dry system compressor runs constantly",d:"",c:[
  ["Air leaks in the pipework","Isolate the compressor and time the pressure fall. Soap test the system.",""],
  ["Pressure switch faulty or set wrong","Check cut-in and cut-out against the valve maker's air pressure.",""],
  ["Compressor too small or worn","Compare the pump-up time with NFPA 13: the system must fill in 30 minutes.",""],
  ["Auto drain or relief valve passing","Check the compressor tank drain and the air relief valve.",""]]},

{id:"drywater",n:"Water found in a dry system",d:"Water at low point drains",c:[
  ["Not drained after a trip test","Drain all low points and auxiliary drains after every trip.",""],
  ["Condensate from humid compressed air","Fit an air dryer or use nitrogen, and drain low points regularly.",""],
  ["Clapper passing water","Water above the clapper keeps rising. Service the dry pipe valve.",""]]},

{id:"jockey",n:"Jockey pump short-cycling",d:"Starts many times an hour",c:[
  ["Leak in the system","Count starts per hour. More than 1–2 starts per hour points to a leak or passing valve.",""],
  ["Pressure switch differential too tight","Set jockey stop at pump churn plus minimum static, start 10 psi lower (NFPA 20 Annex).",""],
  ["Sensing line restriction missing","Fit the restriction orifice or snubber on the jockey sensing line.",""],
  ["Check valve on the jockey discharge passing","Water flows back through the pump when it stops. Service the check valve.",""]]},

{id:"fpstart",n:"Fire pump starts with no fire",d:"Main pump runs unexpectedly",c:[
  ["Jockey pump failed or cannot keep up","Check the jockey pump runs and its pressure setting.",""],
  ["Start pressures set wrong","Main pump start must be below jockey start: typically 5 psi lower, lag pumps another 10 psi lower.","Fire pump sizing"],
  ["Large leak or open drain","Check drains, test headers and hydrant valves.",""],
  ["Pressure transducer drift","Compare the controller reading with a calibrated gauge.",""]]},

{id:"fpnostart",n:"Fire pump won't start on low pressure",d:"",c:[
  ["Sensing line valve closed or blocked","Sensing line valves must be open. Check the test drain on the sensing line.",""],
  ["Controller fault or in manual/off","Check the controller is on Auto and power available lamps are lit.",""],
  ["Pressure transducer failed","Compare with a test gauge. Replace if reading is wrong.",""],
  ["No power to the controller","Check supply, phase reversal and phase failure alarms.",""]]},

{id:"fplow",n:"Low pressure or flow on pump test",d:"Below the rated curve",c:[
  ["Suction valve partly closed or strainer blocked","Check the OS&Y valve is fully open and clean the suction strainer.",""],
  ["Air in the casing or suction","Vent the casing. Check the suction pipe for air pockets and eccentric reducer orientation.",""],
  ["Impeller worn or blocked","Compare with the factory curve. Inspect the impeller.","Fire pump sizing"],
  ["Wrong speed or rotation","Measure speed with a tachometer. Check the motor rotation direction.",""],
  ["Low tank level or NPSH problem","Check tank level and suction pressure while running.",""]]},

{id:"diesel",n:"Diesel fire pump fails to crank",d:"",c:[
  ["Batteries flat","Measure both battery sets. Each must crank the engine on its own.",""],
  ["Battery charger fault","Check charger output and alarms at the controller.",""],
  ["Fuel tank low or valve closed","Fuel for 1 L per kW plus 5 % (NFPA 20). Fuel valve must be locked open.",""],
  ["Starter or solenoid fault","Try the manual crank contactors at the controller.",""]]},

{id:"agentlow",n:"Clean agent cylinder pressure low",d:"Gauge in the yellow or red",c:[
  ["Temperature effect","Read the gauge against the maker's pressure-temperature chart before calling it a leak.",""],
  ["Agent leak at the valve","Weigh the cylinder. NFPA 2001: replace or refill if the loss is over 5 % agent or 10 % pressure.","Clean agent quantity"],
  ["Gauge fault","Compare with a calibrated gauge.",""]]},

{id:"doorfan",n:"Room fails door fan integrity test",d:"Hold time too short",c:[
  ["Unsealed cable and pipe penetrations","Seal penetrations in walls, floor void and ceiling void with fire-rated sealant.",""],
  ["Door gaps and missing seals","Fit drop seals and perimeter seals. Check door closers.",""],
  ["HVAC dampers not closing","Dampers must close on agent release. Test the interface.","Damper leakage test"],
  ["Leakage through the ceiling void","Seal the slab-to-slab partitions above the false ceiling.","Room pressurisation"]]},

{id:"hvacsd",n:"HVAC not shutting down on fire alarm",d:"Fans keep running",c:[
  ["Cause & effect logic wrong","Check the C&E matrix and the fire panel output programming.",""],
  ["Interface relay faulty","Test the relay coil and contacts at the MCC or BMS interface.",""],
  ["Wiring fault","Check the shutdown circuit continuity and fail-safe wiring.",""],
  ["Fan in hand or local mode","Check the starter selector is in Auto or Remote.",""]]},

{id:"fdamper",n:"Fire or gas-tight damper not closing",d:"",c:[
  ["Actuator failed or no signal","Check the 24 V or 230 V supply and the close signal from the panel.",""],
  ["Blades stuck or obstructed","Inspect for debris, bent blades or blocked access.","Damper leakage test"],
  ["Fusible link not released","Check the link rating and replace after every test drop.",""],
  ["Spring return weak","Manually cycle the damper and time the closure.",""]]}
];
