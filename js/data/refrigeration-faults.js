/* MEPify · Refrigeration fault finder data: [cause, what to check, how to fix]
   by Mohamed Shafaf Karumannil */

/* Troubleshooter: [cause, what to check, how to fix], most common first */
const FAULTS={
 lowsuc:{n:"Low suction pressure",d:"The evaporator is boiling colder than it should. Most often the coil is short of refrigerant or short of air.",go:["chg","Measure it with Charge check"],c:[
  ["Low charge from a leak","High superheat and low subcooling. Oil marks at joints, flare nuts or valve caps.","Find and repair the leak, pressure test, evacuate, then weigh in the charge."],
  ["Low airflow over the evaporator","Dirty filter or coil, fan slow or stopped, belt slipping, dampers shut. Large air temperature drop across the coil.","Clean the filter and coil, fix the fan, open dampers."],
  ["Restriction in the liquid line","More than 2 K drop across the filter drier, sweating or frost after it, high subcooling with high superheat.","Replace the filter drier. Check the service valves and solenoid are fully open."],
  ["Expansion valve underfeeding","High superheat but normal subcooling. Loose or uninsulated bulb, blocked inlet strainer, lost bulb charge.","Refit and insulate the bulb, clean the strainer, adjust or replace the valve."],
  ["Low load","Return air already cold, or set point too low.","Check the thermostat and controls, and the low-pressure cut-out setting."]]},
 hisuc:{n:"High suction pressure",d:"The evaporator is boiling warmer than it should. Either the load is high, the valve is overfeeding, or the compressor is not pumping.",go:["chg","Measure it with Charge check"],c:[
  ["High heat load","High return air temperature, doors left open, added equipment in the room.","Compare the real load against the unit capacity."],
  ["Expansion valve overfeeding","Low superheat, cold or sweating suction line back to the compressor.","Check bulb contact and insulation, raise the superheat setting, replace if stuck open."],
  ["Compressor not pumping","Suction high and discharge low at the same time, current below normal.","Do a valve or pump-down test. Replace the compressor if it cannot pull down."],
  ["Overcharge","High subcooling and high head pressure as well.","Recover refrigerant back to the nameplate charge or target subcooling."],
  ["Hot gas leaking into suction","Hot gas bypass valve set too high, or a heat pump reversing valve leaking across.","Reset the bypass valve. Check temperatures across the reversing valve and replace if leaking."]]},
 hihead:{n:"High head (discharge) pressure",d:"The condenser cannot reject heat fast enough. Start outside at the condenser before touching the charge.",go:["chg","Check condenser approach with Charge check"],c:[
  ["Dirty or blocked condenser coil","Approach (condensing minus air-on temperature) above about 15 K. Dust, leaves, bent fins.","Clean the coil with water or coil cleaner, comb the fins."],
  ["Condenser fan fault","Fan stopped, slow, wrong rotation, or a fan stage not coming on.","Check the motor, capacitor, rotation and the fan speed or pressure control."],
  ["Hot air recirculating","Discharge air re-entering the coil, units too close together, high ambient around the unit.","Fix the clearance or add a baffle so the condenser gets fresh air."],
  ["Overcharge","High subcooling with high head pressure.","Recover refrigerant back to the target subcooling."],
  ["Air or nitrogen in the system","Head pressure higher than the condensing temperature explains, with normal subcooling. Shut-down pressure higher than the P/T value at ambient.","Recover the charge, evacuate properly and recharge with new refrigerant."]]},
 lohead:{n:"Low head (discharge) pressure",d:"Condensing is too cold. Low head starves the expansion valve, so cooling drops too.",go:["chg","Measure it with Charge check"],c:[
  ["Low charge","Low subcooling and high superheat.","Find and repair the leak, then charge to target."],
  ["Low outdoor temperature without head pressure control","Cold weather, condenser fans all running.","Fit or repair fan speed control, fan cycling or a head pressure valve."],
  ["Compressor not pumping","Low head and high suction together, low amps, small pressure difference.","Do a valve test. Replace the compressor if it cannot build pressure."],
  ["Scroll running backwards (3-phase)","Loud, no pressure difference, suction and discharge almost equal.","Swap two supply phases and fit a phase monitor."]]},
 hish:{n:"High superheat",d:"The evaporator is starved. Not enough liquid reaches it, or the valve is holding it back.",go:["sh","Measure it with Superheat"],c:[
  ["Low charge","Subcooling low too, bubbles in the sight glass.","Leak test and repair before adding refrigerant."],
  ["Restriction before the valve","Temperature drop across the drier or a partly closed valve, subcooling high.","Replace the drier, open service valves fully."],
  ["Expansion valve underfeeding or set too high","Subcooling normal. Bulb loose, strainer blocked, power head lost charge.","Clean the strainer, refit the bulb, adjust or replace the valve."],
  ["Moisture freezing at the valve","Superheat swings, valve hunts, moisture indicator shows wet.","Replace the drier, evacuate deeply, recharge."]]},
 losh:{n:"Low superheat or liquid floodback",d:"Liquid may be reaching the compressor. This washes out oil and breaks valves, so fix it quickly.",go:["sh","Measure it with Superheat"],c:[
  ["Low airflow over the evaporator","Dirty filter or coil, fan fault, frosted coil.","Clean, fix the fan, defrost the coil."],
  ["Expansion valve overfeeding","Bulb loose or in the wrong place, valve oversized or stuck open.","Mount the bulb tight at 4 or 8 o'clock on the suction line and insulate it. Adjust or replace."],
  ["Overcharge on a fixed orifice or capillary system","High subcooling and low superheat.","Recover refrigerant to the manufacturer's charging chart."],
  ["Very low load","Space cold, coil running nearly empty of heat.","Check controls and the low-load protection."]]},
 nostart:{n:"Compressor will not start",d:"Work from the power supply inward. Do not reset a safety again and again without finding the cause.",c:[
  ["No power or control voltage","Breaker, fuses, isolator, thermostat call, control transformer.","Restore supply and find why it tripped."],
  ["Safety switch open","High or low pressure switch, thermal overload or motor protector tripped.","Find the cause behind the trip before resetting. A hot shell needs time to cool."],
  ["Failed capacitor (single-phase)","Compressor hums, draws high current then trips. Capacitor bulged or out of tolerance.","Test with a capacitance meter and replace with the same µF and voltage rating."],
  ["Contactor fault","Coil energised but contacts not closing, burnt or pitted contacts.","Replace the contactor."],
  ["Motor winding fault","Open, shorted or grounded winding on ohm and insulation tests.","Replace the compressor. Check the oil for acid after a burnout."],
  ["Mechanically seized","Draws locked-rotor current and does not turn even with good voltage and capacitor.","Replace the compressor."]]},
 short:{n:"Compressor short cycling",d:"Many starts per hour overheat the motor and starve it of oil. Find which control is stopping it.",c:[
  ["Low pressure switch tripping","Suction falls fast after start: low charge, restriction or low airflow.","Fix the root cause listed under Low suction pressure."],
  ["High pressure switch tripping","Head rises fast: condenser blocked, fan fault, overcharge.","Fix the root cause listed under High head pressure."],
  ["Thermostat or control fault","Differential too small, sensor in a supply air stream, loose wiring.","Move the sensor, widen the differential, add an anti-short-cycle timer."],
  ["Overload tripping","High current, hot compressor shell, low voltage.","Check voltage under load, current against RLA, and suction superheat."],
  ["Unit oversized for the load","Reaches set point in a few minutes.","Use capacity control, staging or a correctly sized unit."]]},
 nocool:{n:"Runs but poor cooling",d:"Everything is running but capacity is low. Measure before you guess.",go:["chg","Check the charge with Charge check"],c:[
  ["Low charge","High superheat, low subcooling, low suction pressure.","Leak test, repair, then charge to target."],
  ["Dirty coils or filters","Low airflow indoors, high approach outdoors.","Clean filters and both coils."],
  ["Compressor not pumping","Small pressure difference, low amps.","Valve test, replace if needed."],
  ["Scroll running backwards (3-phase)","Noisy, no pressure difference.","Swap two phases."],
  ["Unit too small or load increased","Runs non-stop at normal pressures and still cannot hold temperature.","Recheck the heat load with the Room cooling size tool."]]},
 ice:{n:"Evaporator coil icing",d:"Ice blocks the coil and makes things worse. Defrost fully before taking readings.",c:[
  ["Low airflow","Dirty filter or coil, fan slow, blocked return grille.","Clean and fix airflow first, then recheck."],
  ["Low charge","Ice starting near the expansion valve outlet, high superheat.","Leak test and repair."],
  ["Running at low load or low outdoor temperature","AC running at night or in cool weather with low suction.","Add freeze protection or low-ambient control."],
  ["Defrost not working (refrigeration)","Heater, timer, termination sensor or drain heater failed.","Test each defrost component and the drain line."]]},
 bubbles:{n:"Bubbles in the sight glass",d:"Bubbles mean vapour in the liquid line. Do not charge on bubbles alone: confirm with subcooling.",go:["sc","Measure it with Subcooling"],c:[
  ["Low charge","Low subcooling, high superheat.","Leak test and repair, then charge to target."],
  ["Restriction before the sight glass","Temperature drop across the drier.","Replace the drier."],
  ["Low head pressure","Cold weather, low condensing temperature.","Fix head pressure control."],
  ["Liquid line picking up heat or lifting high","Long vertical riser, line running through a hot space.","Insulate the line or increase subcooling."]]},
 hidisch:{n:"High discharge temperature",d:"Hot discharge gas breaks down oil. Above about 110 °C at the discharge line, act now.",c:[
  ["High suction superheat","Low charge or starving valve, so the gas arrives already hot.","Fix the cause of high superheat."],
  ["High compression ratio","Head pressure high and suction low together.","Clean the condenser and fix the low suction cause."],
  ["Air or nitrogen in the system","High head with normal subcooling.","Recover, evacuate and recharge."],
  ["Internal leak in the compressor","Hot gas leaking back to suction, low capacity.","Valve test, replace the compressor."]]},
 oil:{n:"Low oil or oil loss",d:"Oil leaves with the gas. If it does not come back, bearings fail.",c:[
  ["Poor oil return in the pipework","Suction risers without traps, horizontal lines not sloped toward the compressor, low gas speed.","Correct slopes, add traps or a double riser, check line sizes."],
  ["Short cycling","Compressor stops before oil returns.","Fix the cause of short cycling."],
  ["Floodback diluting the oil","Foaming in the crankcase sight glass, low superheat.","Fix the floodback cause and check the crankcase heater."],
  ["Oil trapped in the evaporator","Low load or low gas velocity in the coil.","Check minimum load and coil circuiting."]]}
};
