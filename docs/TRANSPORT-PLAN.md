# CareNow 1.1 — design and transport

Requested 5 September 2026. Scope: ambulances, accessible vans, trucks and buses, plus map tracking for care staff. All bookings remain exhibition simulations.

## Design direction

A care dispatch desk: crisp white panels, forest ink, restrained mint selection, slate labels. A road route joining two labelled stops is the signature; other screens use compact rows and consistent 20 px line icons. Retain Manrope headings and DM Sans body; reduce oversized headings, radii and unused card space. Palette: paper #F5F8F7, ink #173D35, forest #194E3E, mint #DFF0EA, slate #596F65, line #DFE8E3. Home puts care and transport within one tap. Avoid decorative badges, oversized brand watermarks and repeated diagonal arrows.

The map has a clear route, labelled endpoints, vehicle positions and a floating detail panel. A searchable destination picker offers real Dhaka landmarks. Transport is its own tab; activity remains accessible from Home and Profile. Separate doctors and care navigation remains intact.

## Milestones

- [x] M1: MapLibre native + web, OpenFreeMap street tiles and attribution; road-following route fixtures from OSRM / OSM.
- [x] M2: Shared validated transport models, server-priced bookings, D1 persistence, ordered status/cancel controls, meaningful domain tests.
- [x] M3: Map transport selection, route/location picker, ambulance/van/truck/bus quotes, booking and animated tracking. Demo controls labelled.
- [x] M4: Care worker tracking map tied to existing requests; shared design cleanup and redesigned Home, navigation, emergency entry.
- [x] M5: Native build and visual inspection, screenshots for every completed screen in README, API / type / unit / web verification.
- [ ] M6: Deploy updated web and Worker, publish updated Android APK, commit and push documentation and evidence.

## Boundaries and verification

- Native MapLibre requires a compiled Expo app (not Expo Go).
- OpenFreeMap street tiles with visible OpenStreetMap attribution. No API key. Network required for tiles.
- Exhibition service area is a set of Dhaka landmarks. Routes are real road geometry snapshots; ETAs and rates are demo estimates, not live traffic or commercial quotes. Truck/bus routes are illustrative, not height/weight-restricted navigation.
- Vehicles and care staff are fictional. No real dispatch, GPS tracking, calling or payment is implied. Movement follows the route and can be advanced through explicit simulation controls.
- Existing sessions must parse with an empty trip list. API owns fare calculation and validates transitions, locations and membership.
- Test distinct stops, fares, progression, terminal-state guards, session persistence and old-state migration. Inspect map rendering on Android and the web.
