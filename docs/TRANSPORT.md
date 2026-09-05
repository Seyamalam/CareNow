# Transport and care tracking

CareNow 1.1 adds native MapLibre maps on Android/iOS and MapLibre GL JS inside the same Expo web app. Panel UI supplies the controls and location sheet. Reanimated interpolates native tracking samples on the UI thread.

## Exhibition flow

1. Home → Transport. Select ambulance, accessible van, pickup truck or minibus.
2. Change pickup or destination; search the five Dhaka landmarks. Swap stops if needed. All four vehicles are visible at once.
3. Review the route distance, approximate journey time, capacity and fare. Book the demo ride.
4. The assigned driver's identity and vehicle appear. Use the labelled demo controls to start tracking, arrive at pickup, start the trip and complete it. The map changes from the approach route to the passenger/cargo route.
5. Reopen from Home or Activity. Trip identity, fare and stage remain in D1. Moving stages use the stored update timestamp, so reopening preserves simulation progress.
6. Cancel an active trip through the confirmation dialog. Closed trips remain in Activity; another ride can then be booked.
7. Home → Your care team, or care request → See care team on map. The fictional care professional moves along a Dhaka preview route. Existing request stages persist. This preview does not geocode a user's address or read GPS.

## Map sources

- Street style and tiles: [OpenFreeMap Positron](https://openfreemap.org/quick_start/), with the native attribution control and the web attribution links preserved.
- Route geometry: [OSRM Route API](https://project-osrm.org/docs/v5.24.0/api/#route-service), using OpenStreetMap road data, retrieved 2026-09-05. © OpenStreetMap contributors, ODbL. Twenty directed routes connect five landmarks. `scripts/fetch-demo-routes.mjs` deliberately refreshes these snapshots; there is no routing-server dependency while demonstrating.
- OpenStreetMap [copyright and licence](https://www.openstreetmap.org/copyright). Geometry snapshots live in `shared/transport/routes.json` with location labels in `stops.json`.
- Vehicle illustrations are original SVGs in `components/vehicle-art.tsx`, reused on web markers through React portals.

## Data and limits

Bookings use shared Zod contracts, Hono's typed client and the existing authenticated D1 session aggregate. The Worker derives fares, enforces distinct supported stops and valid members, permits one active trip per session, and enforces ordered/terminal transitions. Older sessions parse with an empty trip collection.

All vehicles, staff, availability and fares are fictional. Driver positions and ETA are simulations; no background GPS, real dispatch, calling, payment or live traffic is connected. Truck/bus geometry illustrates booking and tracking; it is not height/weight-aware navigation. This release supports the listed Dhaka stops for transport. Care service forms still support Dhaka and Chattogram; care maps are explicitly labelled Dhaka previews.

Native maps require a rebuilt Expo app, not Expo Go. Web MapLibre v6 needs its worker **and shared module** served outside Metro; `postinstall` and `export:web` copy both from the installed package into `public/`. Metro resolves the native MapLibre package through one source entry to avoid ESM/CommonJS duplicate Fabric registration. Cache lanes isolate Android, web and development bundlers.
