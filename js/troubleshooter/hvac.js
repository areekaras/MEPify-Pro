/* MEPify · Troubleshooter faults: hvac. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first.
   by Mohamed Shafaf Karumannil */

TSD.hvac=[
{id:"warm",n:"Room too warm",d:"Not reaching set point",c:[
  ["Supply air too warm","Measure supply air at the diffuser. 12–15 °C is normal. If it is higher, the problem is at the coil or the chiller.","Coil capacity check"],
  ["Low airflow","Dirty filters, closed or wrongly set dampers, a slipping belt or low fan speed. Measure airflow and compare with design.","Duct size"],
  ["Chilled water not reaching the coil","Check CHW supply temperature, control valve stroke (command against actual position), strainer and isolating valves. Vent air from the coil.","Chilled water flow"],
  ["Room sensor or set point wrong","Compare the sensor with a calibrated thermometer. Make sure it is not near a supply grille, in sunlight or by equipment. Check the BMS set point and schedule.",""],
  ["Load higher than design","Extra people, equipment, open doors or more glass than drawn. Recalculate the room.","Heat load"]]},

{id:"cold",n:"Room too cold",d:"Overcooling",c:[
  ["Set point or control mode wrong","Check the BMS set point and schedule, and that the unit is not left in manual or forced full cooling.",""],
  ["Control valve passing or stuck open","Command the valve to 0 % and watch the leaving air and water temperatures. A passing valve still cools.",""],
  ["Sensor reading high","Sensor in sunlight or near a heat source reads warm and keeps the unit cooling. Check calibration and location.",""],
  ["Too much airflow or an oversized unit","Compare airflow with design. At low load the unit cannot turn down far enough.","Air changes"],
  ["Reheat not working (where fitted)","Check the heater contactor, high-limit thermostat and airflow switch.","Duct heater"]]},

{id:"humid",n:"High humidity in the room",d:"Sticky air, sweating surfaces",c:[
  ["Coil not removing moisture","Leaving air must be below the room dew point. Check the off-coil temperature (12–13 °C) and the CHW supply temperature.","Coil load"],
  ["Too much untreated fresh air or infiltration","Check the fresh air damper position, door seals and whether the room is negative, drawing in humid outdoor air.","Air mixing"],
  ["Oversized unit short cycling","The unit meets the temperature quickly and stops before it removes moisture. Check run time per cycle.","Heat load"],
  ["Fan running on with the coil off","On splits and FCUs, a fan set to ON blows moisture back off the wet coil. Set it to AUTO.",""],
  ["Water carried off the coil","Wet duct or pan overflow. Coil face velocity should be below 2.5 m/s.",""]]},

{id:"lowair",n:"Low airflow",d:"AHU or diffusers below design",c:[
  ["Dirty filters","Read filter differential pressure against the clean and final values marked on the gauge. Replace if at or above final.",""],
  ["Fan speed, belt or rotation","Check rpm against design, belt tension and wear, rotation arrow and VFD frequency.","V-belt tension"],
  ["Dampers closed or wrongly set","Check volume dampers, fire dampers and motorised dampers are fully open or set as balanced.",""],
  ["Duct leakage or disconnected flex","Check joints, access doors and flexible connections. Do a duct leakage test on suspect sections.",""],
  ["System resistance above design","Measure external static pressure and plot it on the fan curve.","Duct size"]]},

{id:"press",n:"Room not holding pressure",d:"For example +50 Pa in a substation or LER",c:[
  ["Leaks in the room envelope","Doors, cable and pipe transits, ceiling tiles and unsealed penetrations. Smoke test while the room is pressurised.",""],
  ["Supply and exhaust not balanced","Measure supply, return and exhaust. For positive pressure, supply must exceed return plus exhaust by the leakage allowance, often 10–20 %.",""],
  ["Pressure relief damper set too low or stuck open","Check the relief damper setting and blade movement.",""],
  ["Doors not closing or door undercut too big","Check door closers, seals and drop seals.",""],
  ["Pressure sensor or tubing","Check the transmitter zero, kinked or split tubing, and that the outdoor reference port is sheltered from wind.","4–20 mA scaling"]]},

{id:"vib",n:"AHU or fan vibration high",d:"Readings above the limit",c:[
  ["Impeller dirty or out of balance","Clean the impeller and balance it. Check for damaged or bent blades.",""],
  ["Pulley or coupling misalignment","Check alignment with a straight edge or laser.",""],
  ["Belt tension wrong or belts worn","Set the tension to the maker's figure and replace belts as a matched set.","V-belt tension"],
  ["Bearing wear","Listen for noise, check bearing temperature and the vibration spectrum.",""],
  ["Anti-vibration mounts or flexible connections","Check transit locks are removed, springs are not bottomed out and flexible connections are not pulled tight.",""],
  ["Running near resonance","If vibration peaks at one VFD speed, set a skip frequency.",""]]},

{id:"ftrip",n:"Fan motor tripping or high current",d:"Overload trips, amps above FLA",c:[
  ["Fan moving more air than design","Forward-curved fans draw more current at low resistance: filters missing, access doors open, dampers wide open. Check ESP.",""],
  ["Wrong rotation","Check against the arrow. A backward-running centrifugal fan still moves some air.",""],
  ["Supply voltage low or unbalanced","Measure all three phases under load.","Voltage & current unbalance"],
  ["Mechanical binding or bearings","Isolate and turn by hand.",""],
  ["Motor too small after a pulley change","Fan power rises with the cube of speed. Check motor kW against the new duty.","Motor current"]]},

{id:"noise",n:"Noisy ducts or diffusers",d:"Whistling, rumble, rattling",c:[
  ["Air velocity too high","Check the diffuser neck velocity and duct velocity against design.","Duct size"],
  ["Damper throttled close to the outlet","Balance from the branch damper further back instead.",""],
  ["Loose duct, turning vanes or access doors","Tighten and seal.",""],
  ["Fan noise carried along the duct","Check the attenuator and flexible connections at the fan.",""]]},

{id:"coil",n:"Chilled water coil not cooling",d:"Low ΔT or warm off-coil air",c:[
  ["Air trapped in the coil","Vent at the coil high point until water runs clear.",""],
  ["Strainer blocked or valve not opening","Measure pressure drop across the strainer, and stroke the control valve.",""],
  ["Coil fouled on air or water side","Clean the fins. Compare water-side pressure drop with design.",""],
  ["Too much water flow (low ΔT)","Balance with the PICV or DRV and check flow against design.","Chilled water flow"],
  ["CHW supply temperature high","Check the chiller set point and loading.",""]]},

{id:"chfrz",n:"Chiller trips on low evaporator temperature",d:"Freeze protection alarm",c:[
  ["Low chilled water flow","Check the flow switch, pump, strainers and valves. Measure evaporator pressure drop against design.",""],
  ["Set point too low or no glycol","Check leaving water set point and freeze protection setting.",""],
  ["Low refrigerant charge","Suction pressure low. Use the refrigeration Troubleshooter and Charge check.","Charge check"],
  ["Sensor fault","Compare the leaving water sensor with a calibrated thermometer.",""]]},

{id:"cond",n:"Condensate overflow or water carry-over",d:"Water in duct or ceiling",c:[
  ["Drain blocked or no trap","A draw-through AHU needs a trap deeper than the fan negative pressure. Flush the line.",""],
  ["Coil face velocity too high","Above about 2.5 m/s water is carried off the coil. Reduce airflow or add an eliminator.",""],
  ["Drain pan not falling to the outlet","Check the unit is level and the pan drains fully.",""],
  ["Drain line too small or flat","Minimum 1 % fall.","Drain slope"]]},

{id:"damp",n:"Fire or gas-tight damper not closing",d:"Or no open / closed feedback",c:[
  ["Actuator power or command","Check the 24 V or 230 V supply and the command from F&G or BMS.",""],
  ["Limit switches out of adjustment","Open and closed feedback must match the blade position.",""],
  ["Mechanical obstruction","Debris, a frame installed out of square or a damaged blade seal.",""],
  ["Spring return slow or weak","Time the close against the spec and check the spring.",""],
  ["Cause & effect mismatch","Check the C&E matrix, the signal mapping and the interlock with F&G.",""]]},

{id:"iaq",n:"Stuffy air, high CO₂ or odour",d:"Complaints of poor air",c:[
  ["Fresh air too low","Measure fresh air and compare with design, often about 10 L/s per person.","Air mixing"],
  ["Fresh air damper closed or minimum set too low","Check the actuator and its minimum position.",""],
  ["Exhaust fans not running","Check fans, belts and controls.",""],
  ["Dirty filters or wet drain pan","Microbial growth causes odour. Clean and make sure the pan drains.",""],
  ["Exhaust re-entering the intake","Intake too close to exhaust, generator or vehicle fumes.",""]]},

{id:"pump",n:"Pump low flow or cavitating",d:"Gravel noise, low ΔP",c:[
  ["Air in the system","Vent the high points and check the expansion vessel pressure.",""],
  ["Strainer blocked","Measure pressure drop across the strainer.",""],
  ["Wrong rotation","Check against the arrow. On 3-phase, swap two phases.",""],
  ["Low suction pressure (cavitation)","Not enough NPSH. Raise the system fill pressure or reduce suction losses.",""],
  ["System resistance above design","Measure pump differential pressure and read the flow off the pump curve.","Total pump head"]]},

{id:"heater",n:"Duct heater not heating or tripping",d:"High-limit trips, no heat",c:[
  ["Airflow switch not proving","The heater must only run with airflow. Check the switch and that airflow is above the minimum on the heater label.",""],
  ["High-limit thermostat tripped","Usually caused by low airflow. Find the cause before resetting the manual-reset limit.",""],
  ["Contactor, fuse or SSR fault","Measure current on each stage.",""],
  ["Element open circuit","Measure resistance per element and compare with V² ÷ P.","Duct heater"],
  ["Stage controller or control signal","Check the controller output against the demand.",""]]},

{id:"fcu",n:"FCU not working",d:"No air or no cooling from a fan coil",c:[
  ["No power or thermostat off","Check the FCU isolator, fuse and the thermostat mode, fan speed and set point.",""],
  ["Fan motor or capacitor failed","Measure motor current and capacitor µF. Spin the fan by hand with power isolated.",""],
  ["Control valve not opening","Check the actuator signal and that the valve opens. Feel the coil pipes: both should be cold when cooling.",""],
  ["Air lock or isolating valves closed","Vent the coil and check both isolating valves are open.",""],
  ["Filter blocked or condensate float switch tripped","Clean the filter. A full drain pan trips the float switch and stops the unit.",""]]},

{id:"stair",n:"Stair pressurisation not working",d:"Low pressure or doors too hard to open",c:[
  ["Fan not starting on fire signal","Check the fire alarm interface, cause & effect, fan starter and fire-rated supply.",""],
  ["Pressure too low with doors closed","Leaks in the shaft, open vents, or fan speed too low. Measure pressure across each door, often 50 Pa.",""],
  ["Door opening force too high","Pressure relief or the VFD control is not working. Force at the handle is usually limited to about 100 N.",""],
  ["Air velocity through open door too low","Measure velocity across the open fire floor door against the design figure, often about 0.75–2 m/s.",""],
  ["Pressure sensor or controller","Check sensor tubing, zero and the controller's set point.","4–20 mA scaling"]]},

{id:"ctower",n:"Cooling tower water too warm",d:"High condenser water temperature",c:[
  ["Fan not running or belt slipping","Check fan, motor current, belt tension and VFD speed.","V-belt tension"],
  ["Poor water distribution","Blocked nozzles or distribution basin. Fill must be wetted evenly.",""],
  ["Fill fouled or damaged","Scale, algae or broken fill packs reduce cooling.",""],
  ["Wet bulb higher than design or recirculation","Hot humid exhaust air re-entering the intake. Check the wet bulb against design.","Air properties"],
  ["Water flow wrong","Check condenser water flow and the range (in minus out) against design.",""]]},

{id:"hood",n:"Kitchen hood not capturing smoke",d:"Smoke or heat escaping into the kitchen",c:[
  ["Exhaust airflow too low","Grease filters blocked, fan belt slipping or damper partly closed. Measure face velocity.",""],
  ["Make-up air too high or blowing across the hood","Supply air jets disturb the capture zone. Adjust diffuser throw.",""],
  ["Hood too small or set too high","Hood should overhang the cooking line on all open sides.",""],
  ["Exhaust duct leaking or grease build-up","Check duct joints and cleanliness. Grease build-up is also a fire risk.",""]]},

{id:"tab",n:"Can't reach design airflow in balancing",d:"TAB results below design",c:[
  ["Total airflow low at the fan","Fix the fan first: speed, rotation, filters, ESP. Branches can't add air the fan isn't making.","Duct size"],
  ["Index run starved","Start balancing at the index (most remote) outlet with its damper fully open, then throttle the others.",""],
  ["Wrong K-factor or measuring method","Use the diffuser maker's K-factor or a hood. Check the instrument calibration.",""],
  ["Duct leakage","Compare fan airflow with the sum of all outlets. A big gap means leakage.",""],
  ["Design or drawings changed","Check the outlet schedule against the latest drawings.",""]]}
];
