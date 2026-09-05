# CareNow 1.2 — one app, every role

Requested 5 September 2026. Preserve Expo React Native, Panel UI, Hono/Workers/D1 and the existing care features.

## Design

Keep forest ink, mint selection, white panels, Manrope headings and DM Sans body. A compact account chip opens the account-type sheet. Customer navigation stays familiar; professional workspaces put the current job and next valid action first. Driver, care professional, doctor and service provider have distinct work queues within the same isolated demo session. The signature is the same journey shown from either side of the service. Labels describe actions; no marketing paragraphs.

## Milestones

- [ ] M1 — Record release-build Android performance baseline; domain plan and tests.
- [ ] M2 — Persist account roles, acceptance/assignment and authorized job progression; add truck cargo/size, bus passenger count and scheduled departures with server validation.
- [ ] M3 — Account switcher and customer/provider/driver/caregiver/doctor workspaces. Complete a booking by changing accounts in the same app; show history and session persistence.
- [ ] M4 — Presenter panel with ambulance, care and group-transport scenarios, reset/replay/pause/speed controls. Explicit offline rehearsal uses local fixtures and map geometry, with no writes replayed to the cloud.
- [ ] M5 — Remove fixed startup delay, add skeletons and content reveals, scope refresh/mutation feedback, reduce broad store rerenders. Add bundled original Lottie logo/success/empty illustrations with reduced-motion and visibility handling.
- [ ] M6 — Draggable map booking panel, follow mode, road heading, arrival feedback and efficient tracking/ETA updates.
- [ ] M7 — Test shared contracts and remote API, inspect every new screen on Android and web, add demo screenshots to README as screens finish. Compare release-build frame timing against baseline; report device limitations honestly.
- [ ] M8 — Deploy Worker/web, publish Android 1.2, commit and push all work and verification evidence.

## Performance acceptance

Use release APK, isolated Android emulator and repeatable scroll/map/sheet interactions. Record Android frame statistics and jank rather than infer FPS from appearance. Target 60 Hz frame budget (16.67 ms); avoid new JS animation loops and pause hidden/background motion. Emulator measurements are comparative evidence; physical midrange Android verification remains necessary before a universal 60 fps claim.

## Demo boundaries

Role switching deliberately grants exhibition personas within the current session; it is not production identity verification. Server validates role-appropriate operations, job ownership, capacity/schedule inputs and ordered/terminal transitions. All people/fleet/prices remain fictional. Offline rehearsal is explicitly selected and isolated from D1. Normal sessions remain cloud backed. No real GPS dispatch or payment is added.
