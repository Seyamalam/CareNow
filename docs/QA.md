# CareNow 1.2 verification — 5 September 2026

- Strict Expo and Worker TypeScript checks passed; 22 shared-domain tests passed, including role permissions, acceptance, ordered completion, per-role availability, presenter clocks, native UUID injection, truck pricing and passenger/schedule validation.
- Remote Hono/D1 smoke suite passed and cleaned up its isolated test sessions. Expo Doctor passed 21/21. Web export and Android ARM64 release build passed.
- Android release: account picker, provider assignment → caregiver acceptance → journey/map; driver acceptance and trip status progression; doctor acceptance/completion/history/earnings; empty-state and success Lottie; truck cargo/capacity/schedule; bus passenger options; booking-panel drag; cloud/offline separation.
- Airplane mode: account switching, consultation completion, group scenario loading and route playback worked. Local state survived force-stop/restart. Paused map captures six seconds apart were byte-identical; resuming at 3× visibly moved the marker and changed ETA. Returning online restored the earlier cloud caregiver session.
- Native route motion verified in paired screenshots eight seconds apart. Fixed Reanimated dependency capture by reading shared values directly inside animation mappers. Fixed overlapping Lottie shape fills with separate illustration layers. Reduced-motion paths are implemented; physical-device accessibility/performance checks remain advisable.
- Web: five-role account picker, provider operations, doctor completion and offline scenario persistence inspected. Main public URL now serves the new app, and HTML uses must-revalidate caching. Bundled SVG Lottie renderer avoids runtime animation/CDN dependencies.
- Performance evidence is mixed: route sample about 59 rendered frames/s; later sheet test under host graphics load had substantial jank. See [all measurements and limitations](PERFORMANCE.md). No universal 60 fps claim. iOS remains untested.
- APK SHA-256: `5fe8f5910710a44b577c8d844fad58e76bf33494c8649db5919b7941b02aed24`. Version 1.2.0, versionCode 3, ARM64, standalone, exhibition development signing key.
- All screenshots contain fictional exhibition data. The account switcher is an intentional demo persona selector, not production identity verification. No actual dispatch, GPS feed, payment or clinician connection was introduced.
- GitHub-hosted CI was previously blocked by account billing; local verification completed. No unrelated running emulator or user application was stopped.

## Earlier release verification

# CareNow 1.1 verification — 5 September 2026

- TypeScript checks passed for Expo and Worker; 14 domain tests passed.
- Remote D1 smoke tests passed, including server-derived trip fares, trip ownership, persistence, ordered transitions and rejection of updates to closed trips.
- Expo Doctor: 21/21. Web export and standalone Android ARM64 release build passed. MapLibre tested in the native app, not Expo Go. iOS remains untested.
- Android: inspected native street tiles, route geometry, original vehicle markers, location sheet, all four choices, ambulance booking/approach/trip/completion and persistence across APK reinstall. Reanimated marker positions visibly change along the route.
- Web: tested at desktop and 390 px phone width. Searched for Airport, selected minibus, booked, reloaded during the approach, advanced to the destination route and completed the trip. Native truck cancellation and care worker approach/arrival were also verified. Native/web screenshots are represented by the latest README gallery entries.
- Fixed issues found during visual QA: Card.Content top padding, vehicle button horizontal padding, sheet body collapsing in auto height, overlapping fleet markers, duplicate Fabric registration from mixed MapLibre exports, web worker/shared-module delivery, and Cloudflare skipping exported font files under node_modules. Fonts now live in app-owned assets and are served with font/ttf content type.
- Web startup uses Expo’s single-page export with Cloudflare route fallback. The earlier static export emitted an unfinished Suspense boundary and recovered through client rendering; single-page output removes that hydration error for this session-based app.
- Map data: OpenFreeMap Positron with visible attribution; 20 OSRM road snapshots between five Dhaka stops. Routing is illustrative and does not account for live traffic or vehicle restrictions. Positions, fare and ETA are simulations.
- Android APK SHA-256: `932220e9604f24bcad5a3ffebe37a57fce51c23410969393350124e9899d6133`. About 61 MiB, ARM64, development signing key, standalone JS/assets.
- Known inherited limit: GitHub Actions billing lock prevents hosted CI jobs; equivalent checks ran locally. npm audit reports 16 moderate findings in dependencies; no high/critical findings. No billing or account settings were changed.

- Release: [v1.1.0](https://github.com/Seyamalam/CareNow/releases/tag/v1.1.0), GitHub asset digest matches the local SHA-256. Final web deployment: https://ac14d787.carenow-demo.pages.dev. README contains 43 native captures.

## Earlier 1.0 verification

### Verification record

Verified 2026-09-05 on macOS, a dedicated Android 15 ARM64 emulator (Pixel 7 profile), Expo Go SDK 57, the standalone release APK, local Wrangler/D1 and deployed Cloudflare services.

## Automated results

| Check | Result |
|---|---|
| App + server strict TypeScript | Pass |
| Domain tests | 9 passed |
| Local Hono/D1 integration | Pass |
| Deployed Hono/D1 integration | Pass |
| Expo Doctor | 21/21 passed |
| Expo web static export | Pass |
| Android ARM64 release build | Pass |
| GitHub Actions | Workflow committed; GitHub account billing lock prevented job startup |

Integration tests create isolated sessions and verify authentication, duplicate bookings, foreign-member/appointment rejection, care pricing, status transitions, consultation completion, attachment upload/read/ownership/type checks, simultaneous writes without lost updates, persistence and token invalidation after session deletion. Test sessions are deleted during cleanup.

## Native interaction and visual review

- Doctor discovery, doctor profile, appointment booking, success and details.
- Saved chat note, simulated call start/end, consultation record creation and record detail.
- Service discovery, shift/duration price changes, complete care request and confirmation.
- Care progress advanced from Assigned to On the way and reflected in Activity.
- Demo session reset restores fixtures; existing unrelated sessions remain separate.
- Bangla navigation switch and switch back to English.
- Motherhood journal saved a new 63.1 kg entry; seeded historical entries remain visible.
- Child routine completed for Arham, preserving other family members' state.
- Family profile edited and saved.
- PDF selected from Android Downloads, uploaded to D1 and attached to the consultation; reopening returned the saved file to the Android share sheet.
- Network disabled on the final isolated emulator: a clear connection error and retry action appeared; connectivity restored, then the retry action successfully returned to the requested doctor profile.
- Cold launch through the animated splash succeeds; selected family member and saved D1 data survive release APK reinstall and restart.
- Family, profile, notification, record, emergency, postpartum and specialized care screens inspected.

PNG evidence is in `docs/screenshots/` and embedded in README. All records and people shown are fictional. All key route captures are refreshed from the standalone build; early success-state captures remain from the verified initial build. A second dedicated emulator on port 5580 was used for final isolation after unrelated activity appeared on the original emulator.

## Release limitations

The app requires internet for the real D1 API. Calls, dispatch, clinicians, clinical documents and prices are clearly labeled demo experiences; there is no payment processing. Navigation and selected primary labels support Bangla; the catalog remains English. Native iOS builds are not claimed as tested. The APK uses the generated Expo development signing key and targets ARM64 devices.

A safe `npm audit fix` removed all high-severity findings. npm still reports 15 moderate findings propagated from two upstream dependency families: `decode-uri-component` through Expo Router's CommonJS `query-string`, and `uuid` through the Xcode configuration tooling. npm's automatic force fix proposes incompatible Expo downgrades. These were not forced; re-evaluate after compatible upstream releases. The Worker stack has no audit findings. Do not treat this exhibition application as reviewed production health infrastructure.

GitHub Actions run 33915928563 failed before executing any steps. The check annotation states: “The job was not started because your account is locked due to a billing issue.” The same verification commands completed locally. No billing/account settings were changed.

## Published artifacts

- Web: https://carenow-demo.pages.dev
- API: https://carenow-api.seyamalam41.workers.dev/api/health
- Android release: https://github.com/Seyamalam/CareNow/releases/tag/v1.0.0
- APK SHA-256: `d56c239df95f3e1a953790ad7e9a3269dcf34420ca16e84be189bee785bb5452`
- Gallery: 29 inspected PNGs, including the animated splash and network error state.
