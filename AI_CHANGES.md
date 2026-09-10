# AI-Authored Work in This Repo

This file exists so any AI tool (or human) picking up this repo cold can understand what's
already been built, how it's structured, and what patterns to follow. It covers everything
built by Claude across this project's history. Keep it updated as AI-driven work continues —
treat it as a living changelog, not a one-time snapshot.

## App at a glance

**VerifiedPhone** ("Mobile Hub — Dealer Sathi") is a React Native (bare CLI, TypeScript) app
for used-phone dealers: track stock, record purchases/sales with IMEI + KYC documentation,
generate invoices and police-verification records, and manage a subscription. Built from a
Figma design. React Native 0.86, New Architecture enabled, React 19.

A real backend exists (`server/` — Node/Express/MongoDB) and every screen reads/writes it via
`src/context/ShopDataContext.tsx`. See "Backend & API integration" below. `src/data/` now only
holds `countryCodes.ts` (a static list) — the old `devices.ts`/`brands.ts`/`subscription.ts`
in-memory modules were deleted; their type shapes moved to `src/types/domain.ts`.

## Tech stack

- **Navigation**: `@react-navigation` — one root native-stack (`RootNavigator.tsx`) containing
  a bottom-tab navigator (`MainTabs.tsx`) for the main app plus stacked screens for flows
  reached from a tab (Add Sale, Invoice Preview, Subscription, etc). Route params are typed in
  `src/navigation/types.ts` — **always add new screens there first**, it's the source of truth
  for what params a screen expects.
- **Forms**: shared components in `src/components/FormControls.tsx` (`FormInput`, `FormSelect`,
  `FormCheckbox`, `FormSection`, `UploadField`) — use these instead of raw `TextInput`/
  `TouchableOpacity` for any new form field, so validation styling and error display stay
  consistent.
- **Validation**: `src/utils/validators.ts` — pure functions (`isValidMobile`, `isValidImei`,
  `isValidGst`, `isValidOtp`, `isPositiveNumber`, `isPercentage`, `isRequired`) plus their
  paired error-message constants. Screens compute a `FormErrors` object on submit, pass
  `error={errors.field}` into the `Form*` components, and clear a field's error as the user
  edits it. See `AddPurchaseScreen.tsx` for the fullest example of this pattern.
- **Icons**: SVGs live in `src/assets/icons/*.svg` and import directly as React components via
  `react-native-svg-transformer` (configured in `metro.config.js`). One-off inline icons (e.g.
  subscription screens) use `react-native-svg` primitives directly — see
  `src/components/SubscriptionIcons.tsx`.
- **Native modules added**: `react-native-html-to-pdf` (invoice/police-record PDF generation),
  `react-native-share` (WhatsApp/share sheet), `react-native-image-picker` (camera/gallery
  photo uploads), `@react-native-firebase/app` + `@react-native-firebase/auth` (Phone Auth
  login — see "Authentication" below). All needed `pod install` (iOS) and a full native
  rebuild — **a JS reload/Fast Refresh does not pick up new native modules**, this has caused
  confusion more than once in this project's history. Rebuild with `npx react-native run-ios` /
  `run-android` after adding any native dependency.
- **Testing**: Jest + `@testing-library/react-native`. See "Testing setup" below — this took
  real effort to get working and has a few non-obvious gotchas.

## Screens added

| Screen | File | Notes |
|---|---|---|
| Brands list / Add Brand | `BrandsScreen.tsx`, `AddBrandScreen.tsx` | Duplicate-name validation via `POST /api/brands` (409 on duplicate) |
| Add Sale | `AddSaleScreen.tsx` | Select in-stock phone → customer/pricing form → live profit/margin summary → `PATCH /api/devices/:id` marks it Sold → Invoice Preview |
| Invoice Preview | `InvoicePreviewScreen.tsx` | Renders an HTML invoice, generates a real PDF, and shares it (WhatsApp) or downloads it |
| Police Export Record | `PoliceExportRecordScreen.tsx` | Compliance document view/PDF for a device's purchase record |
| Subscription flow | `SubscriptionPlansScreen.tsx`, `PlanDetailScreen.tsx`, `TrialActivatedScreen.tsx`, `ManageSubscriptionScreen.tsx` | Plan selection → checkout → trial confirmation → manage (active/trial/expired states, cancel flow). Backed by `Shop.subscription` on the server, embedded 1:1, not its own collection |
| Add Purchase (rewired) | `AddPurchaseScreen.tsx` | Was a non-functional UI shell (no `value`/`onChangeText` on most fields) — fully wired to controlled state + validation + real image uploads |
| Shared `BackButton` | `src/components/BackButton.tsx` | Standardized back-arrow icon/behavior across all screens |

Full navigation map: see `src/navigation/types.ts` (`RootStackParamList` / `MainTabParamList`).

## Validation coverage

Every form-bearing screen validates on submit with inline error messages (red border + text,
not silent no-ops): `LoginScreen`, `OtpVerifyScreen`, `RegisterScreen`, `SettingsScreen` (shop
details), `AddPurchaseScreen`, `AddSaleScreen`, `AddBrandScreen`. `DigitalSignatureScreen` has a
disabled-until-valid submit with an explanatory hint instead (checkbox + signature required).

**A real bug worth knowing about**: `AddSaleScreen`'s submit button used to be
`disabled={!canComplete}` — since React Native skips `onPress` entirely when `disabled` is
true, the validation errors could never actually be shown (the button was unpressable exactly
when it needed to explain why). Fixed by removing `disabled`, keeping only the dimmed style.
If you ever see a submit button with both `disabled={!isValid}` *and* validation error text
that's supposed to show on press, check for this trap.

## Image uploads

`UploadField` (in `FormControls.tsx`) opens an in-app sheet (Take Photo / Choose from Gallery)
via `react-native-image-picker`, shows a thumbnail preview, and offers "Remove photo". Wired
into `AddPurchaseScreen` (Phone Front/Back, Old Phone Bill, Aadhaar Front/Back) and the Shop
Logo field in `RegisterScreen` / `SettingsScreen`. State is a plain `string | null` image URI.
On submit, `src/api/client.ts`'s `requestForm()` turns picked `file://` URIs into a multipart
`FormData` upload; the server (`multer`, disk storage under `server/uploads/<shopId>/<field>/`)
saves them and returns relative URLs, which `src/api/*` resolves to absolute URLs via
`resolveUrl()` in `src/api/config.ts` before handing them back to screens.

## Testing setup

`npm test` runs Jest. This **did not work at all** before this work — `@react-native/jest-preset`
wasn't installed and `transformIgnorePatterns` didn't cover `@react-navigation` or most
`react-native-*` packages. Fixed in `jest.config.js` / `jest.setup.js` / `__mocks__/`. Key
things to know if tests start failing mysteriously:

- **New native module → add a mock.** Anything that touches a real native module
  (`react-native-html-to-pdf`, `react-native-share`, `react-native-image-picker`,
  `@react-native-firebase/app`, `@react-native-firebase/auth`) needs a manual mock in
  root-level `__mocks__/`
  (Jest auto-applies these for node_modules packages, no `jest.mock()` call needed). Follow the
  existing pattern in `__mocks__/react-native-image-picker.js` for the shape.
- **`useScreenStatusBar` calls `useFocusEffect`**, which needs a real navigation context.
  `jest.setup.js` mocks `useFocusEffect` globally to just run as a plain effect — this is why
  screens can be rendered standalone in tests without wrapping them in a `NavigationContainer`.
- **`.svg` imports** are mapped to a mock component (`__mocks__/svgMock.js`) via
  `moduleNameMapper`, mirroring what `react-native-svg-transformer` does at build time.
- **Test helpers live in `test-utils/`, not `__tests__/`** — anything under `__tests__/`
  matches Jest's default `testMatch` and gets treated as a test file, even without `.test.` in
  the name. `test-utils/mockNavigation.ts` provides `createMockNavigation()` for screen tests.
- Component tests live in `__tests__/screens/`, one file per screen, and generally test: submit
  with an empty/invalid form → assert the exact error messages shown → fill correctly → assert
  the expected navigation call. See `__tests__/screens/AddSaleScreen.test.tsx` for a test that
  explicitly guards against the disabled-button bug above regressing.

## Authentication (Firebase Phone Auth)

Login/OTP is real Firebase Authentication now, not a local stub. `src/auth/firebaseAuth.ts` is
the only file that should touch `@react-native-firebase/*` directly — everything else goes
through its exports: `sendOtp(localMobile)`, `subscribeToAuthState(callback)`, `logout()`,
`getAuthErrorMessage(error, fallback)`. Uses the **modular** RNFirebase v22+ API
(`getAuth`/`signInWithPhoneNumber`/`onAuthStateChanged`/`signOut`), not the older namespaced
`auth()` API — don't mix the two styles if you extend this.

Flow: `LoginScreen` calls `sendOtp` → gets back a `ConfirmationResult` → passes it as a route
param (along with the raw phone number) to `OtpVerifyScreen` → `confirmation.confirm(code)`
completes sign-in. `ConfirmationResult` is **not serializable** (it has a `.confirm()` method) —
this only works because this app doesn't use React Navigation linking/deep-link config or
persist navigation state; don't add either without reworking this. `SplashScreen` decides
Onboarding vs. MainTabs by subscribing to `onAuthStateChanged` once on mount (Firebase persists
sessions natively — no more AsyncStorage flag; `authStorage.ts` and the
`@react-native-async-storage/async-storage` dependency were removed as part of this, since
nothing else in the app used them).

**Setup this repo does NOT include and can't include** (needs a human with Firebase/Apple
console access):
- A real Firebase project. Package name / bundle ID for both platform registrations:
  `com.verifiedphone.app`.
- `android/app/google-services.json` and `ios/VerifiedPhone/GoogleService-Info.plist` — neither
  file exists in this repo (correctly — they shouldn't be faked or committed by AI). The Android
  Gradle build will fail immediately without the former (`com.google.gms.google-services` plugin
  is already applied in `android/app/build.gradle`); the iOS app will build but crash on launch
  without the latter (`FirebaseApp.configure()` in `AppDelegate.swift` requires it).
- The `GoogleService-Info.plist` also needs to be **added to the Xcode project as a bundle
  resource** (drag into `ios/VerifiedPhone/` in Xcode with target membership checked) — placing
  the file on disk alone isn't enough for iOS.
- Phone Auth must be enabled as a Sign-in provider in the Firebase console.
- Android: the debug keystore's SHA-1/SHA-256 must be registered on the Firebase Android app
  (get them via `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
  -storepass android -keypass android`; a separate release-keystore fingerprint is needed before
  shipping a release build).
- iOS: for silent (no-CAPTCHA) verification, enable Push Notifications + Background Modes >
  Remote notifications, and upload an APNs auth key to the Firebase console. Without this,
  Firebase falls back to a reCAPTCHA web challenge — that's an expected, supported fallback, not
  a bug, if APNs isn't configured yet.
- `ios/Podfile` needed `use_modular_headers!` added — the Firebase iOS SDK's Swift pods don't
  define modules, which CocoaPods requires for static linking. If a future `pod install` fails
  with "cannot yet be integrated as static libraries", this is already handled, don't re-add it
  or flip to `use_frameworks!` without checking this line first.

Phone numbers are sent to Firebase in E.164 format via `toE164(dialCode, localMobile)` in
`firebaseAuth.ts` — `dialCode` comes from the country-code picker on `LoginScreen`
(`src/data/countryCodes.ts`), not hardcoded. Firebase Auth is the *only* identity system in this
app; the backend below deliberately does not reimplement login — it verifies the same Firebase
ID token the client already has.

## Backend & API integration

Every screen that used to read/write `src/data/*` now goes through a real Node/Express/MongoDB
API. Two halves:

**`server/`** — standalone Express + Mongoose app (own `package.json`/`node_modules`, doesn't
touch Metro/RN tooling). `npm run dev` (from `server/`) boots it with `ts-node-dev`. Identity is
delegated entirely to Firebase: `server/src/middleware/requireAuth.ts` verifies the client's
Firebase ID token via `firebase-admin`'s `verifyIdToken()` (needs
`server/config/serviceAccountKey.json`, a **service account key for the same Firebase project**
as `google-services.json`/`GoogleService-Info.plist` — gitignored, not included, get it from
Firebase Console → Project Settings → Service Accounts). `resolveShop.ts` then auto-vivifies a
`Shop` document keyed by `firebaseUid` on first authenticated request (atomic upsert, also
seeds 8 default brands for a brand-new shop) — so no route ever 500s on "shop doesn't exist yet."
Models: `Shop` (shop profile + an **embedded** `subscription` object, not a separate collection),
`Device` (mirrors the old `Device` type field-for-field, plus `shopId` and 5 image URL fields),
`Brand` (`shopId` + unique-per-shop name). Every query is scoped by `req.shop._id` — cross-tenant
reads/writes 404 rather than leak. Image uploads go through `multer` to local disk
(`server/uploads/<shopId>/<field>/`), served statically; see `server/README.md` for full setup.

**RN side** — `src/api/` is the single point of contact with the backend (mirrors how
`firebaseAuth.ts` is the single point of contact with Firebase): `client.ts` attaches the
Firebase ID token to every request and handles both JSON and multipart bodies; one file per
resource (`shop.ts`, `devices.ts`, `brands.ts`, `subscription.ts`) maps raw API JSON into the
same display-oriented shapes screens already expected (e.g. the server's `purchasedAt` ISO
timestamp becomes `purchaseDate`/`purchaseTime` formatted strings in `src/api/devices.ts`, so
screen rendering code didn't need to change). `src/context/ShopDataContext.tsx` is the one shared
state layer — a single React Context (deliberately not Redux/Zustand/React Query, given the
app's size: 4 small resources, no offline/optimistic-conflict complexity to justify more) holding
`shop`/`devices`/`brands`/`subscription` plus mutation functions, fetched on Firebase sign-in and
cleared on sign-out. Screens call `useShopData()` instead of importing `src/data/*`.

**A real gap this closed, not just a data-source swap**: `AddPurchaseScreen` and `AddSaleScreen`
used to validate and navigate without persisting anything at all — no device was ever created or
marked sold. The actual `POST /api/devices` call now happens in `DigitalSignatureScreen` (the
legal-declaration step, which is where creation belongs conceptually), fed by a
`purchaseData` route param `AddPurchaseScreen` now passes through `DigitalSignature` in
`src/navigation/types.ts`. `AddSaleScreen`'s "Complete Sale" button now awaits
`markDeviceSold()` before navigating to `InvoicePreview`. Similarly, `RegisterScreen`'s shop
details used to be collected and thrown away — they're now threaded through route params
(`Register → Login → OtpVerify`, same non-serializable-safe pattern already used for
`ConfirmationResult`) and registered via `POST /api/shops/register` right after
`confirmation.confirm(otp)` succeeds in `OtpVerifyScreen`.

**Dev networking**: Android emulator reaches the backend at `10.0.2.2:4000`; iOS simulator at
`localhost:4000` — see `src/api/config.ts` (`Platform.OS` branch). `SignaturePad` has no
rasterized image export (stroke-tracking only, no `toDataURL`), so the Device model stores
`sellerDeclarationConfirmed`/`sellerDeclarationConfirmedAt` instead of a signature image —
revisit if an actual signature image ever needs to be persisted.

**Setup this repo does NOT include and can't include** (same category as the Firebase config
files above — needs a human, shouldn't be faked or committed by AI):
- `server/config/serviceAccountKey.json` (Firebase Admin service account).
- `server/.env` (copy from `server/.env.example`) — needs a real `MONGODB_URI` (local `mongod`
  or a free MongoDB Atlas cluster both work).
- Everything under "Authentication" above still applies unchanged — the backend adds a second
  dependency (Mongo + a service account) on top of the existing Firebase Auth requirements, it
  doesn't replace them.

## Known gaps / stubs

- iOS builds on the current dev machine are blocked by a missing iOS 26.2 Simulator platform
  (Xcode has the SDK but not the runtime installed) — this is a machine-setup issue, not a
  project issue; Android builds work fine via `npx react-native run-android`.
- Firebase Phone Auth + the backend are wired end-to-end in code but **cannot run together
  until the config above is provided** — see "Authentication" and "Backend & API integration".
- No production deploy target yet for `server/` — `src/api/config.ts`'s `PROD_BASE_URL` still
  points at the dev address; update it once the backend has a real host.
- `DeviceDetailsScreen`'s "✎" edit icon, "Export Consent Letter", and "View Documents" buttons
  are still visual-only (pre-existing, not part of this backend pass).
