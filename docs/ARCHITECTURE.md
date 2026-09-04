# Architecture

## App

Keep the existing Expo project at the repository root. Expo Router owns routes and navigation. Shared components wrap or compose Panel UI controls. Uniwind semantic tokens define the CareNow theme. Reanimated handles splash, screen entrances, press states, progress and restrained ambient motion; reduced-motion preferences are respected. Local fonts and branded assets work without third-party image requests.

## API and data

`server/` contains the Hono application, Wrangler configuration and SQL migrations. `shared/` contains Zod contracts and shared data definitions. Export the Hono route type for the native RPC client; validate input server-side and avoid untyped JSON assertions. TanStack Query owns request state and invalidation. AsyncStorage stores only the bearer token and active member ID. Preferences and health data live in the D1 session aggregate.

Use a random bearer token for an isolated demo session. Hash tokens at rest. Never use a fixed shared user identity for writes. Scope all reads and mutations by session, use parameterized SQL, enforce foreign-key ownership and validate enum/range constraints. Each session is one validated JSON aggregate in D1, with a separate relational attachments table. Prepared statements update the aggregate with a compare-and-swap version check; up to four conflict retries preserve concurrent writes. This keeps the bounded exhibition data atomic and avoids half-created bookings or notifications. It is a deliberate demo architecture; a production multi-provider service would use normalized entities and a separate media store. Initial fixtures are fictional and deterministic where useful for tests; appointment dates are relative to the current date.

## Operations

Local: Wrangler + local D1, Expo Metro and Android emulator. Remote: deploy Worker and D1 using existing authorized Cloudflare access if available. A seven-day expiry and bounded opportunistic cleanup remove old sessions, cascading to their attachments. Tokens are SHA-256 hashed at rest. Attachments are limited to 20 PDF/JPEG/PNG files per session, with server-side magic-byte checks and a 750 KB request-body limit. Expose only public API base URLs in Expo. Ignore secrets, generated native projects, and original source document. Commit lockfile and migrations. Add CI for typecheck and integration tests. Test real Hono handlers against a SQLite-compatible database and smoke-test the running Wrangler service.

## Verification

Typecheck both app and server. Exercise booking and cancellation, family ownership, chat, care requests, emergency simulation, tracking and invalid data. Export Expo web and Android bundles, run Expo diagnostics, inspect native screenshots and interact with core journeys using Argent/ADB. Record actual results and remaining external-integration boundaries in docs/QA.md.
