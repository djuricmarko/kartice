# Kartice — Expo app

This is an [Expo](https://expo.dev) project.

## Get started

1. Install dependencies

   ```bash
   pnpm install # or npm install / yarn install
   ```

2. Start the app

   ```bash
   pnpm start
   ```

## Build for Android (installable on a phone)

We use EAS Build to produce an APK (easy to install) or an AAB (Play Store format).

Prerequisites (one time):
- Log in: `pnpm eas login`

Build an APK for quick install:
```bash
pnpm build:android-apk
```
- When the build finishes, EAS will print a URL where you can download the APK.
- Transfer the APK to your Android phone and open it to install (you may need to allow installing from unknown sources).

Build a production AAB:
```bash
pnpm build:android-aab
```

Optional: Development build (for debugging with native modules):
```bash
pnpm build:android-dev
```

Notes:
- The Android package is set to `com.elirium.kartice` in `app.json`. If you want a different package, change `expo.android.package` before building.
- You don’t need a keystore for the APK preview build; EAS will manage credentials for production if you proceed with the AAB.

## Project scripts
- `pnpm start` — start Metro bundler
- `pnpm android` — open the development server in Android
- `pnpm web` — run on web
- `pnpm lint` — lint the project

## Reset template code (optional)

```bash
pnpm reset-project
```
