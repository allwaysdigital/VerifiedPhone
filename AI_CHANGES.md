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

No backend exists yet. All "data" lives in plain in-memory TS modules under `src/data/`
(`devices.ts`, `brands.ts`, `subscription.ts`) — arrays/objects with getter/mutator functions,
reset on every app restart. When wiring a real API, these modules are the seams to replace.

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
  photo uploads). All three needed `pod install` (iOS) and a full native rebuild — **a JS
  reload/Fast Refresh does not pick up new native modules**, this has caused confusion more
  than once in this project's history. Rebuild with `npx react-native run-ios` /
  `run-android` after adding any native dependency.
- **Testing**: Jest + `@testing-library/react-native`. See "Testing setup" below — this took
  real effort to get working and has a few non-obvious gotchas.

## Screens added

| Screen | File | Notes |
|---|---|---|
| Brands list / Add Brand | `BrandsScreen.tsx`, `AddBrandScreen.tsx` | Duplicate-name validation against `data/brands.ts` |
| Add Sale | `AddSaleScreen.tsx` | Select in-stock phone → customer/pricing form → live profit/margin summary → Invoice Preview |
| Invoice Preview | `InvoicePreviewScreen.tsx` | Renders an HTML invoice, generates a real PDF, and shares it (WhatsApp) or downloads it |
| Police Export Record | `PoliceExportRecordScreen.tsx` | Compliance document view/PDF for a device's purchase record |
| Subscription flow | `SubscriptionPlansScreen.tsx`, `PlanDetailScreen.tsx`, `TrialActivatedScreen.tsx`, `ManageSubscriptionScreen.tsx` | Plan selection → checkout → trial confirmation → manage (active/trial/expired states, cancel flow). Backed by `data/subscription.ts` |
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
Logo field in `RegisterScreen` / `SettingsScreen`. State is a plain `string | null` image URI —
no upload-to-server step exists yet (there's no backend).

## Testing setup

`npm test` runs Jest. This **did not work at all** before this work — `@react-native/jest-preset`
wasn't installed and `transformIgnorePatterns` didn't cover `@react-navigation` or most
`react-native-*` packages. Fixed in `jest.config.js` / `jest.setup.js` / `__mocks__/`. Key
things to know if tests start failing mysteriously:

- **New native module → add a mock.** Anything that touches a real native module
  (`react-native-html-to-pdf`, `react-native-share`, `react-native-image-picker`,
  `@react-native-async-storage/async-storage`) needs a manual mock in root-level `__mocks__/`
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

## Known gaps / stubs

- No backend — everything in `src/data/` is in-memory and resets on app restart.
- "Complete Sale" doesn't flip a device's status to Sold in `devices.ts` (no mutator exists yet).
- Shop details save (`SettingsScreen`) validates but doesn't persist anywhere.
- Uploaded images aren't sent anywhere — no server, no persistent storage.
- iOS builds on the current dev machine are blocked by a missing iOS 26.2 Simulator platform
  (Xcode has the SDK but not the runtime installed) — this is a machine-setup issue, not a
  project issue; Android builds work fine via `npx react-native run-android`.
