/* MEPify · Troubleshooter faults: elec. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first.
   by Mohamed Shafaf Karumannil */

TSD.elec=[
{id:"mcb",n:"Breaker trips",d:"MCB or MCCB",c:[
  ["Overload (trips after some time)","Measure the load current and compare with the breaker rating.","Breaker size"],
  ["Short circuit (trips instantly)","Isolate and IR test the cable and the load. Look for damaged cable or terminals.","Insulation resistance"],
  ["Wrong curve for the inrush","Motors, transformers and LED drivers trip B-curve breakers. Use C or D.","Breaker size"],
  ["Loose connection heating the breaker","Check torque on terminals and look for discolouration. Use thermography under load.",""],
  ["Faulty breaker","Swap with a known good breaker of the same rating.",""]]},

{id:"rcd",n:"RCD or earth leakage trips",d:"ELCB, RCBO",c:[
  ["Earth fault on the circuit","With the load disconnected, IR test L–E and N–E.","Insulation resistance"],
  ["Neutral touching earth or shared neutral","Check N–E insulation and that neutrals are not mixed between circuits.",""],
  ["Moisture in outdoor equipment","Check sockets, junction boxes, heaters and gland sealing.",""],
  ["Too much normal leakage","Many PCs or VFD filters add up. Measure leakage with a clamp meter, split circuits, use Type B or F RCDs for VFDs.",""],
  ["Faulty RCD","Check trip time and trip current with an RCD tester.",""]]},

{id:"mstart",n:"Motor does not start",d:"No movement on start command",c:[
  ["No supply or control circuit open","Check voltage at the starter, control fuse, stop and E-stop circuits, interlocks and MCC ready signal.",""],
  ["Overload tripped","Reset only after finding the cause.",""],
  ["Contactor not pulling in","Measure the coil voltage when the start command is given.",""],
  ["Single phasing","Measure all three phases at the motor terminals.",""],
  ["Seized or load too heavy","Isolate and turn by hand.",""],
  ["Winding fault","Check winding resistance balance and IR to earth.","Insulation resistance"]]},

{id:"mhot",n:"Motor overheating",d:"Hot frame, winding RTD alarm",c:[
  ["Overloaded","Measure current against nameplate FLA.","Motor current"],
  ["Low or unbalanced voltage","Measure all phases under load.","Voltage & current unbalance"],
  ["Poor cooling","Blocked fan cowl, dirt on the frame, high ambient or long running at low VFD speed.",""],
  ["Too many starts per hour","Compare with the maker's limit.",""],
  ["Bearing failure or misalignment","Check vibration, noise and bearing temperature.",""],
  ["Wrong star or delta connection","Check the terminal links against the supply voltage.",""]]},

{id:"rot",n:"Motor runs the wrong way",d:"Reverse rotation",c:[
  ["Phase sequence at the supply","Check with a phase rotation meter.",""],
  ["Connections at the motor","Isolate and swap any two phases at one end only.",""],
  ["VFD direction setting","Check the direction and reverse parameters.",""]]},

{id:"ol",n:"Overload relay trips",d:"Thermal or electronic overload",c:[
  ["Setting wrong","Set to nameplate FLA. In a star-delta starter with the overload in the phase circuit, set to 0.58 × FLA.",""],
  ["Real overload","Measure current. Check the driven load for binding.","Motor current"],
  ["Single phasing or unbalance","Measure all three currents.","Voltage & current unbalance"],
  ["Long starting time","High-inertia fans need a class 20 or 30 overload.",""],
  ["Loose terminals at the relay","Check torque.",""]]},

{id:"irlow",n:"Low insulation resistance",d:"Megger reading below minimum",c:[
  ["Moisture","Dry out with space heaters or low-voltage current, then re-test and check PI.","Insulation resistance"],
  ["Dirt in the terminal box","Clean, dry and re-test.",""],
  ["Electronics left connected","Disconnect VFDs, surge protectors and instruments before testing.",""],
  ["Cable damage","Test sections separately to find it.",""],
  ["Winding insulation failure","Confirm with PI and winding resistance. Rewind or replace.",""]]},

{id:"vdrop",n:"Low voltage at the load",d:"Voltage drop",c:[
  ["Cable too small or too long","Recalculate voltage drop.","Cable size"],
  ["Loose or high-resistance joints","Measure volt drop across each joint under load. Use thermography.",""],
  ["Supply low at source","Check at the transformer and its tap position.","Transformer"],
  ["Dips when large motors start","DOL starting causes voltage dips. Consider soft start or VFD.","Generator size"]]},

{id:"flick",n:"Lights flickering",d:"",c:[
  ["Loose neutral or connection","Check the neutral at the board and joints.",""],
  ["Large motor starting on the same supply","See if flicker matches motor starts.",""],
  ["Failing LED driver","Swap the driver.",""],
  ["Dimmer not compatible","Check driver and dimmer compatibility.",""],
  ["Generator supply unstable","Check governor and AVR settings.",""]]},

{id:"chat",n:"Contactor chattering or humming",d:"",c:[
  ["Low coil voltage","Measure at the coil while it pulls in. Long control cables cause drop.",""],
  ["Dirty or worn pole faces, broken shading ring","Clean or replace the contactor.",""],
  ["Bouncing control contact","Check thermostats, pressure switches and loose control wiring.",""],
  ["Wrong coil voltage","Check the coil rating against the control supply, AC or DC.",""]]},

{id:"vfd",n:"VFD tripping",d:"Overcurrent, overvoltage, earth fault",c:[
  ["Overcurrent: ramp too fast or overload","Increase the acceleration time. Check motor current and the load.","Motor current"],
  ["Overvoltage: deceleration too fast","Increase the deceleration time or add a braking resistor.",""],
  ["Earth fault in motor or cable","With the drive disconnected, IR test the motor and cable.","Insulation resistance"],
  ["Motor data parameters wrong","Enter nameplate kW, V, A, rpm and Hz, then run auto-tune.",""],
  ["Drive overheating","Check panel ventilation, drive fans and filters.",""],
  ["Long motor cable","Use an output reactor or dV/dt filter and screened cable earthed at both ends.",""]]},

{id:"shock",n:"Tingling from metal frames",d:"Touch voltage",c:[
  ["Missing or loose earth","Test earth continuity and check bonding connections.",""],
  ["Earth fault with no RCD","Isolate and IR test.","Insulation resistance"],
  ["Polarity reversed","Check live and neutral are not swapped.",""],
  ["High earth electrode resistance","Test with an earth tester.",""],
  ["Induced or ghost voltage","Confirm with a low-impedance tester before chasing it.",""]]},

{id:"phase",n:"Single phasing or phase failure",d:"",c:[
  ["Blown fuse","Check each fuse.",""],
  ["Loose or burnt terminal or contactor pole","Inspect and measure across each pole.",""],
  ["Supply-side fault","Check the incoming supply.",""],
  ["Phase failure relay","Check its settings and wiring.",""]]},

{id:"hot",n:"Burning smell or hot terminals",d:"",c:[
  ["Loose termination","Isolate, re-torque to the maker's value, replace discoloured lugs.",""],
  ["Cable or lug undersized, wrong crimp","Use the correct lug and die size.","Cable size"],
  ["Overloaded circuit","Measure current against rating.",""],
  ["Copper on aluminium without a bimetal lug","Replace with bimetal lugs.",""],
  ["Harmonics heating the neutral","Measure neutral current on boards with many IT or LED loads.",""]]},

{id:"ma",n:"4–20 mA signal wrong or missing",d:"Transmitter to BMS or PLC",c:[
  ["Open loop (0 mA)","Check wiring continuity, fuses and the 24 V loop supply.",""],
  ["Range mismatch","Check LRV and URV at the transmitter and in the BMS or PLC.","4–20 mA scaling"],
  ["Polarity or 2-wire / 4-wire mismatch","Check the wiring against the loop drawing.",""],
  ["Loop load too high","Check total loop resistance against the transmitter's maximum.",""],
  ["Earth loop or screen problem","Earth the screen at one end only.",""],
  ["Transmitter in alarm","3.6 mA or 21 mA usually means a sensor fault (NAMUR NE 43).",""]]},

{id:"pf",n:"Low power factor or capacitor bank faults",d:"",c:[
  ["Capacitor steps failed or fuses blown","Measure current or kVAr per step.",""],
  ["Controller CT in the wrong place","The CT must see total load current on the correct phase.",""],
  ["Harmonics damaging capacitors","On sites with many VFDs, use detuned reactors.",""],
  ["Bank too small for the load","Recalculate kVAr.","Power factor fix"]]},

{id:"gen",n:"Generator won't start or take load",d:"",c:[
  ["Battery or starter","Check battery voltage while cranking (should stay above about 9.6 V on a 12 V system) and the charger.",""],
  ["Fuel","Check fuel level, valves open, air in the fuel line and fuel filter.",""],
  ["Control in wrong mode or alarm active","Check AUTO mode, emergency stop and alarms on the controller.",""],
  ["ATS not transferring","Check ATS mode, timers and the generator voltage and frequency are in range.",""],
  ["Load step too big","Large motors starting at once. Stage the loads.","Generator size"]]},

{id:"ups",n:"UPS alarm or on battery",d:"",c:[
  ["Input supply out of range","Measure input voltage and frequency. Generator supply may be unstable.",""],
  ["Battery fault or end of life","Check battery voltage, temperature and the last battery test result.","UPS / battery backup"],
  ["Overload","Compare load % with the UPS rating.",""],
  ["Bypass or fan alarm","Check the event log and the cooling fans.",""]]},

{id:"earth",n:"Earth resistance too high",d:"Earth pit test fails",c:[
  ["Dry soil","Readings rise in dry season. Water the pit and re-test, or add rods.",""],
  ["Corroded or loose connection","Check the clamp at the rod and the test link.",""],
  ["Too few rods or rods too short","Add rods spaced at least their own length apart, or drive deeper.",""],
  ["Wrong test method","Use the 3-point (fall of potential) method with the test spikes far enough away.",""]]},

{id:"harm",n:"High neutral current or harmonics",d:"Hot neutral, transformer overheating",c:[
  ["Non-linear loads","PCs, LED drivers and VFDs create triple harmonics that add up in the neutral.",""],
  ["Unbalanced single-phase loads","Rebalance loads across the three phases.","Voltage & current unbalance"],
  ["Neutral undersized","Size the neutral for harmonic current, often 1.5–2 × phase on IT boards.","Cable size"],
  ["No filtering","Fit harmonic filters or use low-harmonic drives.",""]]}
];
