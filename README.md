# MEPify

Offline MEP calculators, commissioning tools and a troubleshooter for HVAC, electrical, refrigeration,
plumbing, fire protection, steam, gas and air, site safety, hazardous areas and piping.
Designed by Mohamed Shafaf Karumannil.

## How the app is organised

`index.html` is a small page that links the styles in `css/` and loads the scripts in `js/`.
The scripts load **in the order listed in `index.html`** and share one scope, so a file can use anything
defined in a file loaded before it. Keep that order when you add files.

| Task | Where |
|---|---|
| Change the app version or a section name | `js/config.js` |
| Add or change a calculator | the section file in `js/tools/` (for example `js/tools/hvac.js`) |
| Add a troubleshooter fault | the section file in `js/troubleshooter/` |
| Add an icon | `js/core/icons.js` |
| Change colours or dark mode | `css/theme.css` |

Adding a new file: put the `<script src=...>` line in `index.html` in the right place, and add the same
path to the `FILES` list in `sw.js` so it works offline.

## File map

### Styles

| File | What it holds |
|---|---|
| `css/fonts.css` | Inter font (SIL Open Font License 1.1). Font data only: do not edit. |
| `css/base.css` | Base layout and form controls |
| `css/home.css` | Home screen grid and tiles |
| `css/tool.css` | Tool screens, P/T slider and troubleshooter |
| `css/heat-load.css` | Heat load, air side / water side and schedule screens |
| `css/theme.css` | Colours, section colours and dark theme |
| `css/shell.css` | App shell: header, sections, tab bar, readout, job log, settings |

### Settings and shared code

| File | What it holds |
|---|---|
| `js/config.js` | App version, section list and section names. Add a new section here. |
| `js/core/icons.js` | Line icons (SVG paths) used by tools, sections and the app shell |
| `js/core/helpers.js` | Shared helpers: app root, svg(), num(), number format f(), bold B() |
| `js/core/units.js` | Unit tables, cable sizing and derating tables, duct and pipe sizes, unit converter data |

### Calculation engines

| File | What it holds |
|---|---|
| `js/engines/psychrometrics.js` | Psychrometrics engine (ASHRAE Fundamentals, SI) and chart |
| `js/engines/refrigerants.js` | Refrigerant saturation data, P/T helpers and P/T slider |
| `js/engines/heat-load.js` | Heat load engine: room by room, 24 h design day |
| `js/engines/air-water-side.js` | Air side and water side sizing from the room loads |
| `js/basic/calculator.js` | Basic and scientific keypad calculators |
| `js/basic/dates.js` | Date calculator helpers |

### Data tables

| File | What it holds |
|---|---|
| `js/data/plumbing.js` | Plumbing data: units, pipe materials, pipe tables and friction helpers |
| `js/data/commissioning.js` | TAB, HVAC and refrigeration data: V-belts, charge limits, GWP and more |
| `js/data/refrigeration-faults.js` | Refrigeration fault finder data: [cause, what to check, how to fix] |
| `js/data/fire-steam-gas-air.js` | Fire protection, steam, gas and compressed air data |
| `js/data/kitchen-pool.js` | Kitchen hood exhaust rates and dew point helper |
| `js/data/safety-hazard-piping.js` | Site safety, hazardous area and piping data (WBGT, gases, zones, schedules, flanges) |

### Troubleshooter

| File | What it holds |
|---|---|
| `js/troubleshooter/sections.js` | Troubleshooter sections and safety notes. Faults live in one file per section. |
| `js/troubleshooter/hvac.js` | Troubleshooter faults: hvac. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first. |
| `js/troubleshooter/electrical.js` | Troubleshooter faults: elec. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first. |
| `js/troubleshooter/refrigeration.js` | Troubleshooter faults: ref. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first. |
| `js/troubleshooter/plumbing.js` | Troubleshooter faults: plumb. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first. |
| `js/troubleshooter/fire-protection.js` | Troubleshooter faults: fire. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first. |
| `js/troubleshooter/steam-gas-air.js` | Troubleshooter faults: util. Each fault: id, n (name), d (description), c ([cause, what to check, linked tool]) most likely first. |
| `js/troubleshooter/additions.js` | Troubleshooter additions merged into the sections at start-up |
| `js/troubleshooter/screen.js` | Troubleshooter screen |

### Tools (one file per section)

| File | What it holds |
|---|---|
| `js/tools/registry.js` | Tool registry. Each section file adds its tools with TOOLS.push(...). |
| `js/tools/troubleshooter.js` | Troubleshooter tile tools |
| `js/tools/basic.js` | Basic calculators tools |
| `js/tools/hvac.js` | HVAC tools |
| `js/tools/electrical.js` | Electrical tools |
| `js/tools/psychrometrics.js` | Psychrometrics tools |
| `js/tools/refrigeration.js` | Refrigeration tools |
| `js/tools/commissioning-tab.js` | Commissioning & TAB tools |
| `js/tools/plumbing.js` | Plumbing tools |
| `js/tools/fire-protection.js` | Fire protection tools |
| `js/tools/steam-gas-air.js` | Steam, gas & air tools |
| `js/tools/site-safety.js` | Site safety tools |
| `js/tools/hazardous-areas.js` | Hazardous areas tools |
| `js/tools/piping-mechanical.js` | Piping & mechanical tools |

### Screens

| File | What it holds |
|---|---|
| `js/app/state.js` | Saved inputs for every tool and the start screen |
| `js/app/heat-load-screens.js` | Heat load screens: projects, rooms, settings and live results |
| `js/app/heat-load-systems.js` | Air side, water side, equipment schedule, report and export screens |
| `js/app/search-share.js` | Storage, favourites, recent tools, sharing and openTool() |
| `js/app/shell.js` | App shell: settings state, theme, tab bar, logo, home screen and section screens |
| `js/app/job-log.js` | Job log: saved readings, CSV and PDF export |
| `js/app/settings.js` | Settings screen |
| `js/app/tool-screen.js` | Tool screen: fields, steppers, results readout and rendering |
| `js/main.js` | Start-up: Android back button hook and first render. Loads last. |

## Builds

- **Android APK**: `.github/workflows/build.yml` runs on every push and copies `index.html`, `css/` and `js/`
  into the app. Download it from Actions → Build APK → Artifacts → MEPify-apk.
- **Web / offline**: `sw.js` caches every file listed in `FILES` so the app works without internet.
