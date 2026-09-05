# Run CareNow

## Requirements

Node 22.13 or newer, npm, and Git. Android native builds need JDK 17 and Android SDK 35/36 with an ARM64 emulator or device. `npm ci` installs the versions recorded in the lockfile. The tested emulator is a Pixel 7 profile on Android 15 (API 35, ARM64).

## Start with the deployed API

```sh
npm ci
npm start
```

Run `npm run android` for a connected Android emulator. MapLibre requires a native build; Expo Go is no longer supported. `npm run web` opens the same React Native app in a browser. The default API is the deployed Hono Worker; no secrets or signup are needed. Each installation/browser receives a separate random demo session.

## Full local stack

```sh
npm ci
npm run db:migrate
npm run api:dev
```

In another terminal, copy `.env.example` to `.env`, set `EXPO_PUBLIC_API_URL=http://127.0.0.1:8787`, then:

```sh
adb reverse tcp:8787 tcp:8787
adb reverse tcp:8081 tcp:8081
npm start -- --clear
```

On a physical phone, use your machine's LAN IP instead of 127.0.0.1. Restart Metro after changing Expo public variables. Public variables contain only the API origin; never put secrets in them.

## Android release demo

The downloadable APK is a standalone ARM64 build. It includes JS, fonts and branding and needs internet for the API. It does not require Metro or Expo Go.

```sh
npx expo prebuild --platform android
cd android
CARENOW_METRO_LANE=android ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
adb install -r app/build/outputs/apk/release/app-release.apk
```

This exhibition build uses Expo's generated development signing key. Store distribution needs your own signing key and platform review. iOS source is included through Expo; this delivery was tested on Android and web.

## Verify

```sh
npm run typecheck
npm test
npx expo-doctor
node scripts/smoke-api.mjs
npm run export:web
```

`smoke-api.mjs` creates two temporary sessions, exercises the running Hono/D1 service, and deletes those sessions in cleanup. Set `API_URL` to test local Wrangler. The gallery generator runs with `node scripts/update-gallery.mjs` after adding inspected PNGs under `docs/screenshots/`.

## Deploy under your own Cloudflare account

1. `npx wrangler login`
2. `npx wrangler d1 create carenow-demo`
3. Replace `account_id` and `database_id` in `server/wrangler.jsonc` with your account's values.
4. `npx wrangler d1 migrations apply carenow-demo --remote --config server/wrangler.jsonc`
5. `npm run api:deploy`
6. Set `EXPO_PUBLIC_API_URL` to your Worker URL and rebuild native/web artifacts.
7. `npx wrangler pages project create carenow-demo --production-branch main`
8. `npm run export:web`
9. `npx wrangler pages deploy dist --project-name carenow-demo --branch main`

The public routing rules serve Expo's shell for session-specific dynamic routes; Expo Router resolves the actual path. CI verifies code and local D1, and does not contain deployment credentials.

The web target uses Expo single-page output. Cloudflare `_redirects` serves `index.html` for app routes, including direct links to saved trips.
