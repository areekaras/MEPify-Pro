/* MEPify · Troubleshooter faults: util. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first.
   by Mohamed Shafaf Karumannil */

TSD.util=[
{id:"hammer",n:"Water hammer in steam lines",d:"Banging when steam is turned on or running",c:[
  ["Condensate not drained from the main","Fit drip legs with traps at every low point and every 30 to 50 m on straight runs.","Steam consumption & trap load"],
  ["Main sloping the wrong way","Steam mains should fall about 1 in 100 in the direction of flow. Check sags at supports.",""],
  ["Steam valve opened too fast","Warm up mains slowly with the warm-up bypass and drains open.",""],
  ["Condensate lifted after a modulating valve","The coil stalls and floods. Fit a pump-trap or drain by gravity.",""],
  ["Flash steam meeting cold condensate","Separate high and low pressure returns or fit a flash vessel.","Flash steam"]]},

{id:"trappass",n:"Steam trap blowing through",d:"Live steam in the condensate return",c:[
  ["Worn trap valve or seat","Check with an ultrasonic tester or sight glass. Repair or replace the trap.",""],
  ["Wrong trap type for the duty","Thermodynamic traps on low loads or float traps on superheat fail early. Match the trap to the application.",""],
  ["Dirt holding the valve open","Clean the strainer before the trap and the trap internals.",""],
  ["Bypass valve left open","Check the trap bypass valve is fully shut.",""]]},

{id:"coilcold",n:"Steam coil or heat exchanger not heating",d:"Cold or waterlogged",c:[
  ["Trap failed closed or undersized","Coil floods with condensate. Check the trap with a temperature gun before and after.","Steam consumption & trap load"],
  ["Stall: steam pressure below back pressure","At part load the control valve lowers coil pressure below the return pressure. Fit a pump-trap.",""],
  ["Air binding","Fit an automatic air vent at the top of the coil or heat exchanger.",""],
  ["Strainer or control valve blocked","Clean the strainer and check the control valve strokes fully.",""]]},

{id:"svlift",n:"Steam safety valve lifting",d:"",c:[
  ["Pressure reducing valve set too high or drifted","Reset the PRV with a calibrated gauge downstream.",""],
  ["PRV not closing at low load","Dirt on the seat or a damaged diaphragm. Service the PRV.",""],
  ["Safety valve set too close to working pressure","Leave at least 10 % or 0.7 bar between working and set pressure.",""]]},

{id:"wetsteam",n:"Wet steam or boiler priming",d:"Water carried over with the steam",c:[
  ["Boiler water level too high","Check level controls and the feed pump setting.",""],
  ["High TDS in the boiler water","Check blowdown and the TDS controller. Foaming causes carryover.",""],
  ["Sudden steam demand","Large valves opening fast drop boiler pressure. Open slowly or fit a separator.",""]]},

{id:"lockout",n:"Gas burner locks out on start",d:"Fails to light or loses flame",c:[
  ["No gas or low gas pressure","Check isolating valves are open and the inlet pressure with a manometer.","Gas pipe sizing"],
  ["Air in the gas line after work","Purge the line to a safe place before restarting.",""],
  ["Ignition electrode fouled or gap wrong","Clean and set the gap to the maker's figure.",""],
  ["Flame sensor dirty or weak signal","Clean the ionisation rod or UV cell. Measure the flame signal.",""],
  ["Combustion air blocked","Check the air inlet, fan and air pressure switch.",""]]},

{id:"gaslow",n:"Low gas pressure at the appliance",d:"Poor flame or appliance alarms",c:[
  ["Pipe too small for the load","Check the pipe size against the total connected load.","Gas pipe sizing"],
  ["More appliances added since design","Add up the inputs of everything on the line.","Gas load & flow"],
  ["Regulator setting low or faulty","Measure inlet and outlet pressure at the regulator.",""],
  ["Gas filter or meter restricted","Check the pressure drop across the filter and meter at full load.",""]]},

{id:"creep",n:"Gas regulator pressure creeps up at no flow",d:"Lock-up pressure too high",c:[
  ["Dirty or damaged regulator seat","Strip and clean the seat or replace the regulator.",""],
  ["Diaphragm damaged","Replace the diaphragm or the regulator.",""],
  ["Thermal effect in a closed section","Gas warming in the sun raises pressure. Check with the maker's lock-up figure.",""]]},

{id:"gassmell",n:"Gas smell or suspected leak",d:"",c:[
  ["Leak at a joint or valve","Do not use switches, phones or flames. Ventilate, isolate at the emergency control valve and leave the area. Then trace with a gas detector or leak spray.",""],
  ["Pilot or burner not lit","Check appliances for an unlit pilot. Isolate and relight to the maker's procedure.",""],
  ["After the repair","Run a tightness test before restoring supply.",""]]},

{id:"airlow",n:"Low compressed air pressure at the end of the line",d:"",c:[
  ["Pipe undersized","Check the pressure drop along the main at full demand.","Compressed air pipe sizing"],
  ["Air leaks","Leaks commonly waste 20 to 30 % of output. Do a leak survey with ultrasound or at weekends.",""],
  ["Filter or dryer blocked","Check the differential pressure across filters and the dryer.",""],
  ["Demand above compressor output","Compare peak demand with FAD. Add receiver volume or capacity.","Air receiver sizing"]]},

{id:"wetair",n:"Water in the compressed air lines",d:"",c:[
  ["Dryer off, bypassed or failed","Check the dryer runs and its dew point reading.",""],
  ["Auto drains failed","Test drains on the receiver, filters and drop legs.",""],
  ["Take-offs from the bottom of the header","Branches must leave from the top of the main. Fit drop legs with drains at low points.",""]]},

{id:"comphot",n:"Air compressor high temperature trip",d:"",c:[
  ["Cooler dirty or blocked","Clean the oil and after-coolers. Check the cooling fan.",""],
  ["Low oil level or wrong oil","Top up with the specified oil and check for leaks.",""],
  ["Compressor room too hot","Check room ventilation. Inlet air above 40 to 45 °C trips most units.",""],
  ["Thermostatic valve stuck","Check the oil thermostatic valve opens to the cooler.",""]]},

{id:"compcyc",n:"Air compressor short-cycling",d:"Loads and unloads too often",c:[
  ["Receiver too small","Check the receiver volume for the compressor output.","Air receiver sizing"],
  ["Pressure band too narrow","Widen the load and unload band, usually 0.5 to 1 bar.",""],
  ["Leaks while the plant is idle","Leaks keep pulling the pressure down. Do a leak survey.",""]]}
];
