# CareNow milestones and todo plan

## M0 — Foundation and publication

- [x] Read the supplied project brief and inspect Innovation Fair BD.
- [x] Initialize an isolated Git repository in CareNow.
- [x] Document product scope, architecture, milestones and acceptance criteria.
- [x] Create public GitHub repository with gh; commit and push this plan before implementation.

## M1 — Runtime and visual foundation

- [x] Install and pin compatible Expo 57, Panel UI and server dependencies; commit lockfile.
- [x] Establish shared contracts, strict TypeScript, API client and query provider.
- [x] Define semantic theme, bundled typography, reusable Panel UI compositions, and responsive layouts.
- [x] Generate original branding and app icon; implement animated splash and reduced-motion behavior.
- [x] Build navigation, safe areas, session startup and global error/loading states.

## M2 — Persistent Hono / Workers / D1 backend

- [x] Add migrations, realistic fictional seed catalog and private demo sessions.
- [x] Implement family member CRUD with validation and ownership checks.
- [x] Implement doctor discovery, availability, appointment create/read/cancel and consultation completion.
- [x] Implement care-service catalog, price calculation and care requests.
- [x] Implement emergency requests with explicit simulated progress.
- [x] Implement records, messages, notifications, medications and motherhood/child tracking.
- [x] Verify API integration tests, rejected inputs and cross-session isolation.

## M3 — Main app journeys

- [x] Home: family switcher, upcoming care, services, doctors and daily medication actions.
- [x] Doctors: specialties, search, filtering, profile, availability and booking confirmation.
- [x] Consultations: chat, attachments, simulated call, summary and appointment cancellation.
- [x] Care: all brief categories, service inclusions, pricing and complete request flow.
- [x] Emergency: all support categories, request confirmation and simulated tracking.
- [x] Activity: appointments and care requests, detail, timeline, filters and actions.

## M4 — Family and specialized care

- [x] Family profiles: list, create, edit and switch active patient.
- [x] Health records: browse and open fictional reports and prescriptions.
- [x] Motherhood: pregnancy timeline, reminders, journal, weight and movement tracking; postpartum/nanny routes.
- [x] Child support: routine completion and therapy request flows.
- [x] Profile: preferences, notifications, language, session reset and demo information.

## M5 — Polish and verification

- [x] Add motion across navigation and key state changes; verify reduced motion.
- [x] Inspect typography, spacing, contrast, keyboard handling, touch targets and safe areas.
- [x] Verify empty/loading/error/success states and every exposed primary action.
- [x] Run typechecks, API tests, Expo diagnostics and production bundle/export checks.
- [x] Boot Android emulator, launch app and complete key journeys with persisted data.
- [x] Capture and review screenshots; fix visible defects and runtime failures.
- [x] Verify restart persistence and session isolation.

## M6 — Deployment and handoff

- [x] Deploy Worker and D1 using available Cloudflare access; smoke-test remote API.
- [x] Produce runnable native demo instructions and Expo web preview if supported.
- [x] Add CI, setup/deployment guide, demo script, architecture notes, asset attribution and QA report.
- [x] Commit and push completed implementation and verification evidence.
- [x] Deliver public repository, preview/build access, screenshot highlights and honest integration limits.

## Definition of done

All planned demo journeys are implemented and validated. The demo uses Expo React Native + Panel UI and a real Hono/Workers/D1 backend with shared types. It starts with an animated splash, remains usable on an Android emulator, persists session-specific data, and has no unresolved blocking bugs. A remote URL depends on existing account authorization; any externally blocked integration must be explicitly documented, never claimed as completed.

## Progress log

- 2026-09-05: Requirements extracted; existing Expo/Panel UI starter found. Initialized project-local Git because the parent directory had an unrelated repository. CLI access to GitHub, Android ADB and Argent is available.

- 2026-09-05: Public repository created and planning commit pushed before implementation. Hono/D1 deployed; typed Expo/Panel UI journeys implemented. Android release builds and Expo web export pass. Nine domain tests and local/remote D1 integration pass, including concurrency and attachment ownership. Native screenshot gallery now covers core routes, family care and specialized hubs. Final release packaging and handoff in progress.

- 2026-09-05: Released v1.0.0 with a standalone 49 MB ARM64 APK, deployed Expo web preview and Hono/D1 API. 29 inspected native captures are in README. Cold launch, persistent session data, file upload/reopen and network-error recovery verified. Hosted CI could not start due to a GitHub account billing lock; equivalent checks passed locally. See QA.md for exact results and upstream dependency advisories.

## 1.1 follow-up: transport and design

See [TRANSPORT-PLAN.md](TRANSPORT-PLAN.md) for the user-requested expansion to ambulances, vans, trucks and buses, native maps and care worker tracking.
