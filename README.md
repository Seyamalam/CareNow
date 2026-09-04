# CareNow

A Bangladesh-focused family care demo for Innovation Fair BD, built with Expo React Native, Panel UI, Reanimated, and a typed Hono API on Cloudflare Workers with D1.

## Build status

Planning complete; implementation in progress. See [milestones and task checklist](docs/PLAN.md), [product scope](docs/PRODUCT.md), and [architecture](docs/ARCHITECTURE.md).

## Demo scope

Doctor discovery and consultation, elderly care, prenatal and postpartum care, neurodivergent children's support, emergency assistance, family profiles, appointments, medication tracking, secure session-scoped messages, and persistent care requests.

All seeded people and clinical records are fictional. Consultation calls, dispatch, payments, and clinical documents are demonstration experiences unless an explicit live integration is configured. The app does not contact real emergency services or make medical decisions.

## Stack

- Expo SDK 57 / React Native 0.86 / Expo Router
- Panel UI / Uniwind / Reanimated 4
- Hono / Zod / TypeScript / Cloudflare Workers / D1

Setup, testing, deployment, and presentation instructions will be added as each milestone is verified.

## Screen gallery

Native Android captures are added here as each screen passes visual inspection. All visible people, records and bookings are fictional exhibition data.

<!-- SCREENSHOTS:START -->
<table>
<tr><td align="center"><img src="docs/screenshots/01-home.png" width="230" alt="01 home" /><br/><sub>home</sub></td><td align="center"><img src="docs/screenshots/02-doctors.png" width="230" alt="02 doctors" /><br/><sub>doctors</sub></td><td align="center"><img src="docs/screenshots/03-doctor-profile.png" width="230" alt="03 doctor profile" /><br/><sub>doctor profile</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/04-booking.png" width="230" alt="04 booking" /><br/><sub>booking</sub></td><td align="center"><img src="docs/screenshots/06-care-services.png" width="230" alt="06 care services" /><br/><sub>care services</sub></td><td align="center"><img src="docs/screenshots/07-elderly-care.png" width="230" alt="07 elderly care" /><br/><sub>elderly care</sub></td></tr>
<tr><td align="center"><img src="docs/screenshots/08-care-request.png" width="230" alt="08 care request" /><br/><sub>care request</sub></td></tr>
</table>
<!-- SCREENSHOTS:END -->
