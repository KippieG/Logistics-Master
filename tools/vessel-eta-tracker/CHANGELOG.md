# Changelog

## [2.0.0] — 2026-05-28

### Added
- **Berth Arrival Timeline** — 24-hour Gantt view showing all vessels per berth with their calculated operations window, scheduled ETA marker, and live deviation colour coding
- **Vessel technical specs** — TEU capacity, LOA, draft, operations window duration, and shipping agent per vessel
- **Berth assignment** — each vessel assigned to a specific berth (B1–B4, A1)
- **Berth conflict detection** — automatic detection when two vessels have overlapping operations windows at the same berth; shown as alert, toast, and KPI
- **Operational impact panel** — vessel detail view flags active berth conflicts for that vessel
- **Shift handover print report** — 🖨 generates a printable shift summary with vessel table, alerts, and berth conflicts (CSS `@media print`)
- **Settings panel** — configurable warning and critical deviation thresholds, notification toggles
- **North Sea weather widget** — simulated Wandelaar buoy conditions (wind, wave height, visibility)
- **Wandelaar Pilot Station** marker on map
- **Outer anchorage zone** visualisation on map
- **Shipping agent** information in vessel detail panel

### Changed
- Header redesigned: cleaner branding, settings ⚙ and print 🖨 buttons alongside CSV export
- KPI bar now includes berth conflicts count and weather widget
- Vessel list rows show berth tag and conflict indicator (⚓)
- ETA colour scale refined: green / yellow / orange / red thresholds
- Demo vessels reset to starting position on arrival (continuous simulation)
- `window.onload` used for initialisation to guarantee external scripts are ready

## [1.0.0] — 2026-05-28

### Added
- Single-page AIS dashboard with live WebSocket feed (aisstream.io)
- Demo mode with 8 simulated vessels (no API key required)
- Interactive map (Leaflet + CartoDB dark tiles) with directional vessel markers
- KPI bar: vessels tracked, on-time %, average deviation, critical alerts
- Vessel detail panel with ETA deviation and approach line on map
- ETA deviation chart (Chart.js)
- Toast notifications for critical delays (>120 min)
- Search and filter by vessel, service line, voyage
- CSV export
