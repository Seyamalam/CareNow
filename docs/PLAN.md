# CareNow milestones and todo plan

## M0 — Foundation and publication

- [x] Read the supplied project brief and inspect Innovation Fair BD.
- [x] Initialize an isolated Git repository in CareNow.
- [x] Document product scope, architecture, milestones and acceptance criteria.
- [ ] Create public GitHub repository with gh; commit and push this plan before implementation.

## M1 — Runtime and visual foundation

- [ ] Install and pin compatible Expo 57, Panel UI and server dependencies; commit lockfile.
- [ ] Establish shared contracts, strict TypeScript, API client and query provider.
- [ ] Define semantic theme, bundled typography, reusable Panel UI compositions, and responsive layouts.
- [ ] Generate original branding and app icon; implement animated splash and reduced-motion behavior.
- [ ] Build navigation, safe areas, session startup and global error/loading states.

## M2 — Persistent Hono / Workers / D1 backend

- [ ] Add migrations, realistic fictional seed catalog and private demo sessions.
- [ ] Implement family member CRUD with validation and ownership checks.
- [ ] Implement doctor discovery, availability, appointment create/read/cancel and consultation completion.
- [ ] Implement care-service catalog, price calculation and care requests.
- [ ] Implement emergency requests with explicit simulated progress.
- [ ] Implement records, messages, notifications, medications and motherhood/child tracking.
- [ ] Verify API integration tests, rejected inputs and cross-session isolation.

## M3 — Main app journeys

- [ ] Home: family switcher, upcoming care, services, doctors and daily medication actions.
- [ ] Doctors: specialties, search, filtering, profile, availability and booking confirmation.
- [ ] Consultations: chat, attachments, simulated call, summary and appointment cancellation.
- [ ] Care: all brief categories, service inclusions, pricing and complete request flow.
- [ ] Emergency: all support categories, request confirmation and simulated tracking.
- [ ] Activity: appointments and care requests, detail, timeline, filters and actions.

## M4 — Family and specialized care

- [ ] Family profiles: list, create, edit and switch active patient.
- [ ] Health records: browse and open fictional reports and prescriptions.
- [ ] Motherhood: pregnancy timeline, reminders, journal, weight and movement tracking; postpartum/nanny routes.
- [ ] Child support: routine completion and therapy request flows.
- [ ] Profile: preferences, notifications, language, session reset and demo information.

## M5 — Polish and verification

- [ ] Add motion across navigation and key state changes; verify reduced motion.
- [ ] Inspect typography, spacing, contrast, keyboard handling, touch targets and safe areas.
- [ ] Verify empty/loading/error/success states and every exposed primary action.
- [ ] Run typechecks, API tests, Expo diagnostics and production bundle/export checks.
- [ ] Boot Android emulator, launch app and complete key journeys with persisted data.
- [ ] Capture and review screenshots; fix visible defects and runtime failures.
- [ ] Verify restart persistence and session isolation.

## M6 — Deployment and handoff

- [ ] Deploy Worker and D1 using available Cloudflare access; smoke-test remote API.
- [ ] Produce runnable native demo instructions and Expo web preview if supported.
- [ ] Add CI, setup/deployment guide, demo script, architecture notes, asset attribution and QA report.
- [ ] Commit and push completed implementation and verification evidence.
- [ ] Deliver public repository, preview/build access, screenshot highlights and honest integration limits.

## Definition of done

All planned demo journeys are implemented and validated. The demo uses Expo React Native + Panel UI and a real Hono/Workers/D1 backend with shared types. It starts with an animated splash, remains usable on an Android emulator, persists session-specific data, and has no unresolved blocking bugs. A remote URL depends on existing account authorization; any externally blocked integration must be explicitly documented, never claimed as completed.

## Progress log

- 2026-09-05: Requirements extracted; existing Expo/Panel UI starter found. Initialized project-local Git because the parent directory had an unrelated repository. CLI access to GitHub, Android ADB and Argent is available.
