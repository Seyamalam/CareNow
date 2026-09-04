# Product specification

## Intent

Deliver a complete, polished demonstration of family care coordination in Bangladesh. Working app title: CareNow. The supplied Project DBA document calls the concept CareLife; retain its service scope while using the existing project's CareNow identity.

## Product language and design

Concise functional labels, clear prices in BDT, local city choices (Dhaka and Chattogram), generous whitespace, warm ivory surfaces, deep evergreen, mint accents, editorial typography, rounded cards, tactile press feedback, animated transitions, and an original animated brand mark. No marketing paragraphs or narrative filler in the app. English first with a functional Bangla language option for core navigation and key actions.

## Functional journeys

1. Enter a private demo session; view family overview, next appointment, services, medication schedule, and recommended doctors.
2. Search/filter doctors across the specialties in the brief; view doctor details, availability and price; choose family member, date, time, and consultation mode; confirm and persist a booking.
3. View appointment details; enter a clearly labeled simulated consultation with microphone/camera controls, chat, attachment handling, and call completion; review a fictional consultation summary.
4. Select elderly, motherhood, or child support; choose caregiver, nurse, nanny, or therapy; inspect included services and estimated price; choose location, patient, shift (8/12/24 hours), duration (7/15/30 days), start date and contact; submit, view, and cancel requests.
5. Browse emergency support: ambulance, hospital/doctor companion, diagnostic collection, medicine delivery, pre-burial support and freezer van; request simulated dispatch and view progress. Real emergency calls require an explicit user action and system dialer.
6. Manage family members and patient info, care appointments, health records, medication completion, and notifications.
7. Motherhood hub: pregnancy timeline, prenatal checklist, symptom journal, weight and movement logs, appointments and supplements; postpartum/nanny options. Child hub: routine tracking, therapy and parent support. No generated diagnosis, treatment advice, or clinical claims.

## Demo boundaries

The database and API are real. Session-scoped writes survive app restart. Clinicians, availability, prescriptions, dispatch, payment selection, and calls are fictional demo data/experiences. Keep a compact Demo status visible where confusion could arise. Do not charge money, dispatch services, contact people, or represent simulations as live clinical services.

## Acceptance

Every exposed primary action works and gives visible feedback. Empty, loading, error, success, cancellation and validation states are handled. No dead buttons, fabricated credentials, or silent fake success. Native Android runtime is verified; Expo web is a secondary preview of the same React Native implementation. Persisted data and privacy boundaries are exercised through integration tests. Source, setup, public repository, screenshots and demo walkthrough are delivered.
