# CareNow

A complete family-care exhibition demo for **Innovation Exhibitor · Bangladesh**. Expo React Native, Panel UI, Reanimated, and a typed Hono API backed by Cloudflare Workers and D1.

[Open live demo](https://carenow-demo.pages.dev) · [Download Android APK](https://github.com/Seyamalam/CareNow/releases/download/v1.0.0/CareNow-1.0.0-arm64.apk) · [Exhibition walkthrough](docs/DEMO.md) · [Setup & deployment](docs/SETUP.md)

## What works

- Eleven doctor specialties, search/filtering, profiles, booking, cancellation and consultation records.
- Private messages and PDF/photo uploads; simulated call controls and completion.
- Elderly, prenatal/postpartum, child development and emergency services with BDT pricing, complete request forms and tracking.
- Family profiles, pregnancy due date, journals, daily routines, medication check-offs, notifications and Bangla navigation.
- Seven-day isolated demo sessions with real D1 persistence, reset, input validation and session ownership checks.
- Native street maps, road polylines, ambulance/van/truck/minibus booking, fare estimates, trip history and animated demo driver/care worker tracking. [Transport walkthrough and map sources](docs/TRANSPORT.md).
- Original branding, animated splash, bundled fonts, tactile controls and reduced-motion support.

All people, credentials, clinical records, prices and availability are fictional exhibition data. **Calls, dispatch and payments are simulated.** No real clinician, emergency service or payment processor is connected. Internet is required for data operations.

## Run

```sh
npm ci
npm start
```

The app connects to the deployed demo API by default. Install the standalone ARM64 Android APK or use `npm run android` for a native build. MapLibre requires native code and does not run in Expo Go. See [setup](docs/SETUP.md) for local Wrangler/D1, native builds and your own Cloudflare deployment.

```sh
npm run typecheck
npm test
node scripts/smoke-api.mjs
npx expo-doctor
npx expo export --platform web
```

[Product scope](docs/PRODUCT.md) · [Milestones](docs/PLAN.md) · [Architecture](docs/ARCHITECTURE.md) · [Verification](docs/QA.md) · [Assets & sources](docs/ASSETS.md) · [Visual brief review](docs/BRIEF-REVIEW.md)

Verified: 9 domain tests, local/remote D1 integration, 21/21 Expo Doctor checks, Android release build and web export. GitHub-hosted CI is configured but could not start because of the account’s billing lock; details are in [QA](docs/QA.md).

## Screen gallery

Native Android captures are added here as each screen passes visual inspection. All visible people, records and bookings are fictional exhibition data.

<!-- SCREENSHOTS:START -->
<table>
<tr><td align="center"><img src="docs/screenshots/29-home-refined.png" width="230" alt="29 home refined" /><br/><sub>home refined</sub></td><td align="center"><img src="docs/screenshots/30-transport-map.png" width="230" alt="30 transport map" /><br/><sub>transport map</sub></td><td align="center"><img src="docs/screenshots/31-location-picker.png" width="230" alt="31 location picker" /><br/><sub>location picker</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/00-animated-splash.png" width="230" alt="00 animated splash" /><br/><sub>animated splash</sub></td><td align="center"><img src="docs/screenshots/01-home.png" width="230" alt="01 home" /><br/><sub>home</sub></td><td align="center"><img src="docs/screenshots/02-doctors.png" width="230" alt="02 doctors" /><br/><sub>doctors</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/03-doctor-profile.png" width="230" alt="03 doctor profile" /><br/><sub>doctor profile</sub></td><td align="center"><img src="docs/screenshots/04-booking.png" width="230" alt="04 booking" /><br/><sub>booking</sub></td><td align="center"><img src="docs/screenshots/05-booking-confirmed.png" width="230" alt="05 booking confirmed" /><br/><sub>booking confirmed</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/06-care-services.png" width="230" alt="06 care services" /><br/><sub>care services</sub></td><td align="center"><img src="docs/screenshots/07-elderly-care.png" width="230" alt="07 elderly care" /><br/><sub>elderly care</sub></td><td align="center"><img src="docs/screenshots/08-care-request.png" width="230" alt="08 care request" /><br/><sub>care request</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/09-request-confirmed.png" width="230" alt="09 request confirmed" /><br/><sub>request confirmed</sub></td><td align="center"><img src="docs/screenshots/10-appointment.png" width="230" alt="10 appointment" /><br/><sub>appointment</sub></td><td align="center"><img src="docs/screenshots/11-messages.png" width="230" alt="11 messages" /><br/><sub>messages</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/12-demo-call.png" width="230" alt="12 demo call" /><br/><sub>demo call</sub></td><td align="center"><img src="docs/screenshots/13-health-records.png" width="230" alt="13 health records" /><br/><sub>health records</sub></td><td align="center"><img src="docs/screenshots/14-consultation-summary.png" width="230" alt="14 consultation summary" /><br/><sub>consultation summary</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/15-profile.png" width="230" alt="15 profile" /><br/><sub>profile</sub></td><td align="center"><img src="docs/screenshots/16-bangla-navigation.png" width="230" alt="16 bangla navigation" /><br/><sub>bangla navigation</sub></td><td align="center"><img src="docs/screenshots/17-family.png" width="230" alt="17 family" /><br/><sub>family</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/18-motherhood.png" width="230" alt="18 motherhood" /><br/><sub>motherhood</sub></td><td align="center"><img src="docs/screenshots/19-care-tracking.png" width="230" alt="19 care tracking" /><br/><sub>care tracking</sub></td><td align="center"><img src="docs/screenshots/20-emergency-support.png" width="230" alt="20 emergency support" /><br/><sub>emergency support</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/21-activity.png" width="230" alt="21 activity" /><br/><sub>activity</sub></td><td align="center"><img src="docs/screenshots/22-notifications.png" width="230" alt="22 notifications" /><br/><sub>notifications</sub></td><td align="center"><img src="docs/screenshots/23-journal.png" width="230" alt="23 journal" /><br/><sub>journal</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/24-postpartum.png" width="230" alt="24 postpartum" /><br/><sub>postpartum</sub></td><td align="center"><img src="docs/screenshots/25-child-development.png" width="230" alt="25 child development" /><br/><sub>child development</sub></td><td align="center"><img src="docs/screenshots/26-family-profile-form.png" width="230" alt="26 family profile form" /><br/><sub>family profile form</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/27-attachment.png" width="230" alt="27 attachment" /><br/><sub>attachment</sub></td><td align="center"><img src="docs/screenshots/28-connection-retry.png" width="230" alt="28 connection retry" /><br/><sub>connection retry</sub></td></tr>
</table>
<!-- SCREENSHOTS:END -->
