/* MEPify · Troubleshooter additions merged into the sections at start-up
   by Mohamed Shafaf Karumannil */

/* ---------- TOOLS ---------- */
(function(){const NM={chg:"Charge check",sh:"Superheat",sc:"Subcooling"},keep=new Set(["trip","ofan","water","noise","defrost"]);
 const fr=Object.keys(FAULTS).map(k=>{const F=FAULTS[k];return{id:k,n:F.n,d:"",c:F.c.map((c,i)=>[c[0],c[1]+(c[2]?` <strong>Fix:</strong> ${c[2]}`:""),i===0&&F.go?NM[F.go[0]]||"":""])};});
 TSD.ref=fr.concat(TSD.ref.filter(f=>keep.has(f.id)));})();
/* ---------- Troubleshooter additions (v1.13) ---------- */
(function(){const X={
hvac:[
 {id:"sens",n:"Sensor reading wrong or drifting",d:"Temperature, RH, ΔP or CO₂ does not match reality",c:[
  ["Sensor out of calibration","Compare with a calibrated reference at the sensor. Note the offset; drift grows over time.","Instrument calibration check"],
  ["Wrong location","Sensor in sun, near a supply grille, lamp, equipment or an outside wall reads wrong. Move it.",""],
  ["Wiring or scaling error","Check the signal type (NTC type, PT1000, 0–10 V, 4–20 mA) and the range set in the BMS matches the sensor.","4–20 mA scaling"],
  ["ΔP tubing problem","Kinked, split or swapped + and − tubes; outdoor reference port exposed to wind.",""],
  ["Failed sensor","Open or shorted element shows a fixed extreme value. Replace it.","RTD (PT100)"]]},
 {id:"hunt",n:"Temperature hunting",d:"Valve or damper keeps swinging, temperature cycles up and down",c:[
  ["Control loop tuned too fast","Proportional band too narrow or integral too short. Widen the band, lengthen integral time.",""],
  ["Valve oversized (low authority)","A small movement gives a big change. Check valve authority.","Valve Kv / Cv"],
  ["Sensor too far or too slow","Long delay between valve and sensor makes the loop overshoot. Move the sensor or slow the loop.",""],
  ["Two loops fighting","For example the AHU off-coil and the room loop, or two units on one space with different set points.",""],
  ["Mechanical backlash","Loose actuator linkage or worn valve stem gives a dead band. Tighten or replace.",""]]},
 {id:"act",n:"Damper or valve not following the BMS command",d:"BMS shows open, the damper or valve is not",c:[
  ["No power or no signal at the actuator","Measure 24 V supply and the 0–10 V or 4–20 mA command at the actuator terminals.",""],
  ["Linkage slipping or not fixed","Actuator moves but the shaft does not. Tighten the clamp and set end stops.",""],
  ["Damper blades seized","Disconnect the actuator and move the blades by hand. Free, clean and lubricate.",""],
  ["Wrong direction or range setting","Direct/reverse switch on the actuator, or 2–10 V vs 0–10 V mismatch.",""],
  ["Feedback not wired or wrong","BMS shows command, not real position. Check the feedback signal.",""]]},
 {id:"simul",n:"Heating and cooling fighting",d:"Reheat or heating coil on while cooling coil is on",c:[
  ["Set points overlap","Cooling set point below heating set point, or dead band too small. Give at least 1–2 K dead band.",""],
  ["Off-coil temperature too low","AHU over-cools to dehumidify and reheat brings it back. Check if it is really needed.",""],
  ["Valve passing","A heating or cooling valve not shutting fully. Command closed and check temperatures across the coil.",""],
  ["Sequence error","Check the control sequence in the BMS against the design narrative.",""]]},
 {id:"sched",n:"Unit not following its schedule",d:"Running at night, or not starting in the morning",c:[
  ["Schedule or holiday calendar wrong","Check times, time zone and the holiday calendar in the BMS.",""],
  ["Hand / override left on","Unit left in hand at the starter or VFD, or a BMS override not released.",""],
  ["BMS clock wrong","Controller time not synchronised; check after power cuts.",""],
  ["Start interlock missing","Run permissive (fire, damper end switch, airflow) not made, so it can't start.",""]]},
 {id:"bms",n:"BMS points offline",d:"Communication fault, BACnet / Modbus",c:[
  ["Network cable or termination","Check the RS-485 bus: polarity, shield earthed at one end, 120 Ω terminators at both ends only.",""],
  ["Address or baud rate clash","Two devices with the same address, or baud rate / parity mismatch.",""],
  ["Controller or gateway power","Check supply to the controller, router or gateway and its status LEDs.",""],
  ["IP network problem","For BACnet/IP check IP address, subnet, switch port and any firewall.",""],
  ["Too many devices or long bus","RS-485 limits: about 32 devices and 1200 m per segment without a repeater.",""]]},
 {id:"fire",n:"Fire alarm or F&G shutdown not working",d:"HVAC does not stop or dampers do not close, or HVAC will not restart after reset",c:[
  ["Interface relay or wiring","Check the fire panel output relay and its wiring to the MCC or BMS. Volt-free contacts NO/NC as per the C&E.",""],
  ["Wrong logic in the C&E","Compare what happened with the cause and effect matrix line by line.",""],
  ["Damper end switches","Dampers closed but no feedback, so the system shows a fault or will not restart.",""],
  ["Latched alarm not reset","Restart needs reset at the fire panel and at the MCC or BMS. Check the restart sequence.",""],
  ["Override left in","Test overrides or isolations left in place after earlier testing.",""]]},
 {id:"hazp",n:"Pressurised room loss-of-pressure alarm",d:"Analyser house, LER or substation (IEC 60079-13)",c:[
  ["Door left open or door closer weak","Most common cause. Check closers, seals and door alarms.",""],
  ["Supply fan or damper problem","Pressurisation fan tripped, filter blocked, intake damper not open.",""],
  ["Too much exhaust","Exhaust or local extract running higher than design.","Room pressurisation"],
  ["Pressure switch or tubing fault","Switch set too high, tube blocked or outdoor reference exposed to wind.",""],
  ["New openings","Cable transits or penetrations left unsealed after recent work.",""]]},
 {id:"sand",n:"Intake blocked by sand or dust",d:"Sand-trap louvre or fresh-air filters loading fast (Gulf)",c:[
  ["Sand-trap louvre full","Clean out the louvre chambers; check drain holes are clear.",""],
  ["Intake velocity too high","Above about 1 m/s through a sand-trap louvre, sand is carried in. Check airflow against the louvre rating.","Face velocity uniformity"],
  ["Pre-filter missing or wrong grade","Fit coarse pre-filters (G4 / ISO Coarse) ahead of fine filters.","Filter pressure drop"],
  ["After a sandstorm","Plan filter checks after every storm; fresh-air ΔP rises fast.",""]]},
 {id:"belt",n:"Belt squeal or belt wear",d:"Squeal at start, glazed or cracked belts",c:[
  ["Belt too slack","Check tension with a tester and set to the table value.","V-belt tension"],
  ["Pulleys misaligned","Check with a straight edge across both pulley faces.","Shaft alignment"],
  ["Worn pulley grooves","Shiny groove sides or belt bottoming in the groove. Replace pulleys.",""],
  ["Mixed old and new belts","Always replace multi-belt drives as a matched set.",""],
  ["Fan speed raised too much","Motor overloaded after a pulley change.","Fan laws"]]},
 {id:"hcoil",n:"Heating coil low output",d:"Hot-water coil not heating enough",c:[
  ["Air in the coil","Vent at the top of the coil.",""],
  ["Low water flow or temperature","Check flow at the balancing valve and the boiler or heat pump supply temperature.","Valve Kv / Cv"],
  ["Control valve not opening","Check the actuator and command.",""],
  ["Coil fouled","Dirty fins or scaled tubes.",""],
  ["Frost protection or bypass","Frost thermostat or face-and-bypass damper set wrong.",""]]},
 {id:"chstart",n:"Chiller won't start",d:"Controls lockout or alarm",c:[
  ["No chilled-water flow proven","Flow switch open: pump off, valves shut or strainer blocked.",""],
  ["Alarm latched","Read the alarm history. Fix the cause before resetting.",""],
  ["No enable or set point satisfied","BMS enable off, or water already below set point.",""],
  ["Anti-recycle timer","Compressor start delay after a stop; wait the set time.",""],
  ["Power or starter fault","Phase loss, phase reversal, starter or VFD fault.","Voltage & current unbalance"]]},
 {id:"surge",n:"Centrifugal chiller surge",d:"Loud noise, current swings",c:[
  ["High condenser water temperature","Tower not cooling enough raises lift. Check tower and condenser water.","Chiller & tower performance"],
  ["Low load","Running at very low load near the surge line. Check hot-gas bypass or VFD settings.",""],
  ["Fouled condenser tubes","High approach. Clean tubes.",""],
  ["Non-condensables","Air in the system raises head pressure. Purge unit check.",""]]},
 {id:"choil",n:"Chiller low oil pressure or oil foaming",d:"",c:[
  ["Low oil level","Check the oil sight glass and add the correct oil.",""],
  ["Oil heater off","Refrigerant mixes in the oil when the heater is off, then foams at start. Heater on 24 h before start.",""],
  ["Blocked oil filter","Check pressure drop across the filter.",""],
  ["Liquid floodback","Low superheat washes oil out.","Superheat"]]},
 {id:"foul",n:"Fouled condenser or evaporator tubes",d:"High approach temperature",c:[
  ["Scale or biofilm","Approach rising over time. Clean tubes and review water treatment.",""],
  ["Low water flow","Check ΔP across the barrel against design.","Pump performance test"],
  ["Debris in tubes","Strainer missing upstream; open the water box and inspect.",""]]},
 {id:"chsp",n:"Chilled water not reaching set point",d:"",c:[
  ["Load higher than chiller capacity","Compare measured load to capacity.","Chiller & tower performance"],
  ["Too much flow or low ΔT","Bypass open, three-way valves, unbalanced system.",""],
  ["Chiller limiting","Current, head pressure or demand limit active. Check the controller.",""],
  ["Low refrigerant charge","See refrigeration faults.","Charge check"]]},
 {id:"legion",n:"Cooling tower water treatment / Legionella risk",d:"",c:[
  ["Biocide dosing stopped","Check dosing pumps, chemical stock and controller.",""],
  ["Bleed-off not working","High conductivity: check the bleed valve and controller.","Cooling tower make-up water"],
  ["Dead legs or stagnant water","Remove dead legs; run standby cells regularly.",""],
  ["Drift eliminators damaged","Replace; spray carries bacteria.",""],
  ["Sampling","Test for Legionella per the water safety plan.",""]]},
 {id:"vrfcom",n:"VRF / split communication error",d:"Indoor and outdoor units not talking",c:[
  ["Wiring polarity or loose terminal","Check the communication cable at every unit; it is often polarity-sensitive.",""],
  ["Duplicate or missing address","Re-run auto-addressing or set addresses manually.",""],
  ["Communication cable near power cable","Separate from power cables; use screened cable.",""],
  ["Indoor unit has no power","Every indoor unit must be powered for the system to communicate.",""],
  ["Failed board","Swap the PCB after checking wiring.",""]]},
 {id:"inv",n:"Inverter fault: compressor won't start",d:"Outdoor unit powers on but compressor does not run",c:[
  ["Supply voltage problem","Check voltage and balance under load.","Voltage & current unbalance"],
  ["Inverter module or DC bus fault","Read the error code. Check the DC bus voltage and module with power off and capacitors discharged.",""],
  ["Inverter cooling fan or heat sink","Blocked fins or failed fan overheat the module.",""],
  ["Compressor winding fault","Check winding resistance and insulation.","Winding resistance"]]},
 {id:"therm",n:"Thermistor or sensor error code",d:"",c:[
  ["Sensor open or shorted","Measure resistance and compare with the maker's temperature–resistance table.",""],
  ["Connector loose or corroded","Reseat and clean the plug on the PCB.",""],
  ["Sensor loose on the pipe","Clip and insulate it back in place.",""],
  ["PCB input fault","If the sensor is good, the board input may be faulty.",""]]},
 {id:"hpheat",n:"Heat pump not heating",d:"",c:[
  ["Reversing valve not switching","Check coil voltage and temperatures across the valve.",""],
  ["Mode or set point","Unit in cool or auto mode with the wrong set point.",""],
  ["Defrost problem","Outdoor coil iced up and not clearing; see the defrost fault in Refrigeration.",""],
  ["Low charge","Low suction in heating mode.","Charge check"]]},
 {id:"eev",n:"Electronic expansion valve (EEV) fault",d:"Hunting, or not opening",c:[
  ["Coil or connector fault","Check coil resistance and the plug on the PCB.",""],
  ["Valve stuck","Listen for clicking at power-up. Check temperatures before and after.",""],
  ["Wrong superheat readings","Suction pressure or temperature sensor faulty.","Superheat"]]},
 {id:"leakal",n:"Refrigerant leak sensor alarm",d:"R32 or VRF leak detection",c:[
  ["Real leak","Confirm with a hand-held detector; check flare joints and coils first.",""],
  ["Sensor contaminated or expired","Cleaning chemicals and paint fumes trigger sensors. Sensors have a service life.",""],
  ["Sensor near a drain","Drain traps can release gases. Check the location.",""],
  ["Charge too big for the room","Check the charge limit for the room size.","Refrigerant charge limit"]]},
 {id:"cpump",n:"Cassette condensate pump failure",d:"Water dripping from a ceiling cassette",c:[
  ["Float switch stuck","Clean the pump reservoir and float.",""],
  ["Pump failed","Check supply to the pump and that it runs when the float lifts.",""],
  ["Discharge line blocked or too high","Lift above the pump rating, or a kink.",""],
  ["Unit not level","Water collects at the wrong end.",""]]}
],
elec:[
 {id:"txhot",n:"Transformer overheating or buzzing",d:"",c:[
  ["Overloaded","Measure load current on each phase against the rating.","Transformer"],
  ["Harmonics","VFD and IT loads add heat. Measure THD.",""],
  ["Poor ventilation","Blocked louvres, room too hot. Check the room temperature and airflow.","LER / substation cooling"],
  ["Loose core or tap setting","Loud hum from loose clamps; wrong tap gives high voltage.",""],
  ["Oil level or cooling fans","Oil-filled: check level, oil temperature and radiator fans.",""]]},
 {id:"ats",n:"ATS not transferring or not returning",d:"",c:[
  ["Generator out of range","Voltage or frequency not within the ATS limits.",""],
  ["Timers","Transfer, retransfer and cool-down timers set longer than expected.",""],
  ["ATS in manual or inhibit","Check mode switch and inhibit inputs.",""],
  ["Mains sensing","Mains not seen as healthy due to phase loss or a sensing fuse.",""],
  ["Mechanism fault","Motor operator or breaker spring not charged.",""]]},
 {id:"elr",n:"Earth fault relay tripping",d:"ELR / EFR on a feeder",c:[
  ["Real earth fault","IR test the cable and loads, section by section.","Insulation resistance"],
  ["Setting too sensitive","Check pickup and time delay against the study.",""],
  ["Core-balance CT installed wrong","Cable screen or earth passing through the CT must be routed back through it.",""],
  ["Leakage from filters","VFD and EMC filters leak current. Measure leakage.",""]]},
 {id:"spd",n:"Surge protection device failed",d:"SPD window red, or equipment damaged after storm",c:[
  ["SPD end of life","Replace the cartridge; check the backup fuse.",""],
  ["Poor earthing","High earth resistance stops the SPD working.","Earth electrode resistance"],
  ["Long SPD leads","Keep leads under 0.5 m total.",""],
  ["Overvoltage on supply","Check supply voltage and neutral integrity.",""]]},
 {id:"dcef",n:"DC system earth fault",d:"Battery charger earth fault alarm (substations)",c:[
  ["Cable insulation damage","Locate by switching off DC circuits one at a time with the alarm watched.",""],
  ["Moisture in a junction box","Check outdoor boxes and glands.",""],
  ["Device with internal fault","Relays, trip coils or indicators with damaged insulation.",""],
  ["Measure","Measure positive and negative to earth; the low side shows the faulted pole.",""]]},
 {id:"brg",n:"Motor bearing noise or overheating",d:"",c:[
  ["Over or under greasing","Use the right grease, quantity and interval from the motor plate.",""],
  ["Misalignment or belt too tight","Check alignment and belt tension.","Shaft alignment"],
  ["VFD bearing currents","Fluting marks. Use insulated bearings or a shaft earthing ring.",""],
  ["Vibration","Check the vibration level.","Vibration acceptance"]]},
 {id:"trace",n:"Trace heating not working or tripping",d:"",c:[
  ["Earth leakage trip","IR test the cable. Moisture in the end seal or junction box is common.","Insulation resistance"],
  ["Thermostat or controller","Check set point and sensor location.",""],
  ["Cable damaged","Damage under insulation from other trades.",""],
  ["Breaker too small for start-up current","Self-regulating cable takes high current when cold.",""]]},
 {id:"emerg",n:"Emergency lighting not working on test",d:"",c:[
  ["Battery not charged or failed","Check the charge LED and battery voltage; batteries usually last 3–5 years.",""],
  ["No permanent supply","Charging circuit switched off at the board.",""],
  ["Lamp or driver failed","Replace the lamp or LED driver.",""],
  ["Central system fault","Check the central battery and its alarms.",""]]}
],
ref:[
 {id:"txvh",n:"Expansion valve hunting",d:"Superheat swinging",c:[
  ["Bulb poorly mounted","Bulb must be tight on clean pipe at 4 or 8 o'clock and insulated.",""],
  ["Valve oversized","Very low load on a large valve. Check selection.",""],
  ["Low subcooling or flash gas","Bubbles at the valve make it hunt.","Subcooling"],
  ["External equaliser blocked","Check the equaliser line.",""]]},
 {id:"burn",n:"Compressor burnout: acid in oil",d:"Clean-up after a motor burnout",c:[
  ["Confirm acid","Use an acid test kit on the oil; burnt smell when opened.",""],
  ["Recover and flush","Recover the charge. Fit a suction-line filter drier for clean-up.",""],
  ["Replace filter driers","Replace the liquid drier and recheck acid after running.",""],
  ["Find the cause","Low voltage, floodback, overheating, moisture. Fix it before restarting.","Voltage & current unbalance"]]}
],
plumb:[
 {id:"nowater",n:"No water at all",d:"",c:[
  ["Supply off or tank empty","Check the main valve, meter and tank level.","Water tank sizing"],
  ["Pump not running or running dry","Check the pump, dry-run protection and suction valve.",""],
  ["Air lock in the suction","Prime the pump and vent the suction line.",""],
  ["Burst pipe","Look for water or a running meter with all taps closed.",""]]},
 {id:"airlock",n:"Air lock in pipes",d:"Spluttering taps, no flow at high points",c:[
  ["High points not vented","Fit and open air vents at high points.",""],
  ["After maintenance","Refill slowly from the lowest point and open the highest outlets first.",""],
  ["Suction leak at pump","Air drawn in through a joint on the suction side.",""]]},
 {id:"noisy",n:"Noisy pipes or whistling",d:"",c:[
  ["High pressure or velocity","Check pressure and velocity.","Pipe flow & velocity"],
  ["Partly closed valve","Whistling at a throttled valve. Open it or use a PRV.",""],
  ["Loose supports","Pipes knocking on structure. Add clips.","Pipe support spacing"],
  ["Thermal expansion","Ticking on hot lines as they heat. Allow for expansion.","Pipe thermal expansion"]]},
 {id:"shower",n:"Shower temperature swinging",d:"",c:[
  ["Pressure changes","Other outlets opening change the balance. Use a thermostatic mixing valve.",""],
  ["TMV dirty","Clean or replace the cartridge and strainers.",""],
  ["Water heater cycling","Heater too small for the demand.","Water heater size"],
  ["Unequal hot and cold pressure","Balance the supplies or fit a PRV on both.",""]]},
 {id:"grease",n:"Grease trap problems",d:"Slow kitchen drains, smell",c:[
  ["Trap full","Empty and clean on schedule.",""],
  ["Undersized","Check flow against the trap rating.","Drainage fixture units"],
  ["Hot water or detergent","Very hot water or detergents carry grease past the trap.",""],
  ["Vent blocked","Blocked vent causes slow drainage and smell.",""]]},
 {id:"backflow",n:"Floor drain backflow in heavy rain",d:"",c:[
  ["Storm and foul drains connected","Rainwater overloading the foul drain. Check connections.",""],
  ["Downpipes undersized","Check against roof area and rainfall.","Rainwater downpipe sizing"],
  ["No non-return valve","Fit an anti-flood valve on low drains.",""],
  ["Blocked sump or pump","Check the stormwater sump pump and its float.",""]]}
]};
Object.keys(X).forEach(k=>{TSD[k]=(TSD[k]||[]).concat(X[k].filter(f=>!TSD[k].some(g=>g.id===f.id)));});
})();
