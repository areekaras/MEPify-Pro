/* MEPify · Tool registry. Each section file adds its tools with TOOLS.push(...).
   by Mohamed Shafaf Karumannil */

/* How to add a tool: open the section file (for example js/tools/hvac.js) and add an object
   {id, g, icon, name, short, intro, fields:[...], calc(v){...}, note} inside its TOOLS.push(...).
   id must be unique, g must match a section id in js/config.js, icon a key in js/core/icons.js. */
const TOOLS=[];
