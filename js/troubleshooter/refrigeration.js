/* MEPify · Troubleshooter faults: ref. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first.
   by Mohamed Shafaf Karumannil */

TSD.ref=[
{id:"warm",n:"Not cooling enough / warm air",d:"",c:[
  ["Dirty filter or coil, or low airflow","Check filters, indoor coil, blower speed and belt. Measure the air temperature drop across the coil: 8–12 K is normal.",""],
  ["Low refrigerant charge (leak)","High superheat with low subcooling. Use the Charge check tool, then leak test with nitrogen or a detector before recharging.","Charge check"],
  ["Dirty condenser or high ambient","Clean the condenser coil and check the condenser fan. Compare condensing temperature to outdoor air: 10–20 K above is normal.",""],
  ["Undersized for the load","Run the Heat load tool. Check for open doors, extra equipment or too much fresh air.",""],
  ["Compressor not pumping","Suction too high and discharge too low at the same time. Check compressor current against RLA and valve condition.",""]]},

{id:"nostart",n:"Unit does not start",d:"",c:[
  ["No power or tripped breaker","Check supply voltage at the unit and the isolator, breaker and fuses.",""],
  ["Thermostat or controller","Check set point, mode, batteries and the control signal (24 V or communication) to the outdoor unit.",""],
  ["Safety lockout","Read the fault code. Check the high / low pressure switches and the overload, and reset only after finding the cause.",""],
  ["Failed capacitor or contactor","Measure the capacitor µF against its label (±6 %) and check the contactor coil voltage and contacts.",""],
  ["Compressor winding fault","Measure winding resistance (C–S, C–R, S–R) and insulation resistance to earth.",""]]},

{id:"iceevap",n:"Ice on the indoor coil or suction line",d:"",c:[
  ["Low airflow","Dirty filter, blocked return, slow or failed blower, or closed dampers. Fix airflow before touching the charge.",""],
  ["Low charge","Suction saturation below 0 °C with high superheat. Find and fix the leak.","Charge check"],
  ["Restriction or TXV problem","Temperature drop across the filter drier, or a TXV bulb that is loose or lost its charge.",""],
  ["Running at very low load or low ambient","Check the low ambient control and night set points.",""]]},

{id:"hihead",n:"High head (discharge) pressure",d:"",c:[
  ["Dirty or blocked condenser","Clean the coil and remove obstructions. Check for hot air recirculation around the unit.",""],
  ["Condenser fan fault","Check fan rotation, speed, motor current and the fan capacitor.",""],
  ["Overcharge","High subcooling with high head. Recover charge and recheck subcooling.","Charge check"],
  ["Non-condensable gas (air) in the system","Head pressure above the saturation pressure at the liquid temperature when the system is off and equalised. Recover, evacuate and recharge.",""],
  ["Water flow on water-cooled units","Check condenser water flow, ΔT and tube fouling.",""]]},

{id:"losuct",n:"Low suction pressure",d:"",c:[
  ["Low charge","High superheat with low subcooling. Leak test before charging.","Charge check"],
  ["Low indoor airflow","Dirty filter or coil, or a blower problem. Superheat will be low.",""],
  ["Restriction (filter drier, TXV, strainer)","Temperature drop across the drier, high subcooling with high superheat.",""],
  ["TXV underfeeding","Check the bulb mounting and insulation, the superheat setting and the power head.",""]]},

{id:"hisuct",n:"High suction pressure",d:"",c:[
  ["Overcharge","Low superheat and high subcooling. Recover some charge.","Charge check"],
  ["TXV overfeeding or stuck open","Low superheat. Check bulb position, contact and insulation.",""],
  ["Compressor valves or scroll worn","High suction and low head together, with low current. Do a compressor efficiency check.",""],
  ["High heat load","Very high return air temperature or too much fresh air.",""]]},

{id:"short",n:"Compressor short cycling",d:"",c:[
  ["Thermostat location or differential","Thermostat near a supply grille or in sunlight, or differential set too low.",""],
  ["Oversized unit","Unit reaches set point too fast. Check the capacity against the Heat load result.",""],
  ["Low charge tripping the low-pressure switch","Watch suction pressure at cut-out. Leak test.","Charge check"],
  ["High head tripping the high-pressure switch","See High head pressure. Check the condenser and its fan.",""],
  ["Overload tripping","Measure current and voltage, and check the motor and its capacitor.",""]]},

{id:"trip",n:"Compressor trips on overload / high current",d:"",c:[
  ["Low or unbalanced voltage","Measure all phases under load. Use the Unbalance tool: over 2 % voltage unbalance overheats motors.",""],
  ["High head pressure","A dirty condenser or failed fan raises compressor current.",""],
  ["Failed run capacitor","Measure µF. A weak capacitor raises current on single-phase compressors.",""],
  ["Mechanical tightness or a winding fault","Check winding resistance balance and insulation resistance. Locked rotor current at start means a seized compressor.",""],
  ["Wrong overload setting","Set to the nameplate RLA / FLA, not above.",""]]},

{id:"ofan",n:"Outdoor fan not running",d:"",c:[
  ["Fan capacitor failed","Measure µF against the label.",""],
  ["Fan motor failed or seized","Spin by hand with power isolated. Check winding resistance and bearings.",""],
  ["Control board or fan speed controller","Check output voltage to the fan, and the head pressure control setting.",""],
  ["Contactor or relay","Check coil voltage and contacts.",""]]},

{id:"water",n:"Water leaking from the indoor unit",d:"",c:[
  ["Blocked condensate drain","Flush the drain line and trap. Check the drain pan for sludge.",""],
  ["Unit not level or drain slope wrong","Unit must fall toward the drain. Drain line slope at least 1 %.",""],
  ["Frozen coil melting","See Ice on the indoor coil.",""],
  ["Missing trap on a draw-through unit","Negative pressure holds water in the pan. Fit a trap of the right depth.",""],
  ["Sweating pipes or ducts","Use the Sweating check tool and repair insulation.",""]]},

{id:"noise",n:"Noisy compressor or unit",d:"",c:[
  ["Loose panels, mounts or pipes","Tighten fixings and check pipe clamps and anti-vibration mounts.",""],
  ["Liquid floodback to compressor","Very low superheat with knocking noise. Check charge, TXV and airflow.","Superheat"],
  ["Fan blade or bearing","Check blade balance, clearance and bearings.",""],
  ["Compressor internal wear","Noise with low pumping performance. Check current and pressures.",""],
  ["Wrong rotation (3-phase scroll)","Loud noise, no pressure difference. Swap two phases.",""]]},

{id:"bubbles",n:"Bubbles in the sight glass",d:"",c:[
  ["Low charge","Bubbles with low subcooling and high superheat. Find the leak.","Charge check"],
  ["Restriction before the sight glass","Temperature drop across the filter drier or a kinked liquid line.",""],
  ["Normal for some blends at low load","Check subcooling before acting. Bubbles alone are not proof of low charge with R-407C or on start-up.",""],
  ["Low head pressure","Low ambient or fan cycling. Check head pressure control.",""]]},

{id:"hotcomp",n:"Compressor running very hot",d:"",c:[
  ["High superheat (starved evaporator)","Suction gas cools the compressor. Check charge and TXV.","Superheat"],
  ["High head pressure","Clean the condenser and check its fan.",""],
  ["Low voltage or unbalance","Measure all phases under load.",""],
  ["Short cycling","Repeated starts heat the motor. See Short cycling.",""],
  ["Low oil or wrong oil","Check the oil level in the sight glass where fitted.",""]]},

{id:"oil",n:"Low oil or oil not returning",d:"Low oil level, oil pressure trips",c:[
  ["Low refrigerant velocity in risers","Oil is not carried back up suction risers. Check riser sizing and traps.",""],
  ["Long run time at low load","Oil stays in the evaporator. Check for oil return cycles on VRF.",""],
  ["Floodback diluting oil","Low superheat washes oil out. Check superheat.","Superheat"],
  ["Leak with oil loss","Look for oil stains at joints.",""]]},

{id:"defrost",n:"Heat pump defrost problems",d:"Outdoor coil iced in heating",c:[
  ["Defrost sensor faulty or loose","Check the sensor resistance and mounting on the coil.",""],
  ["Reversing valve sticking","Check the coil voltage and listen for the valve shifting.",""],
  ["Low charge","Low suction in heating mode. Leak test.","Charge check"],
  ["Drain blocked under outdoor unit","Meltwater refreezes. Clear the base pan drain.",""]]}
];
