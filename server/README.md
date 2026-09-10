# VerifiedPhone API server

Node.js + Express + MongoDB (Mongoose) backend for the VerifiedPhone app. Identity
comes from Firebase Phone Auth (the same Firebase project the RN app uses) — this
server only verifies Firebase ID tokens, it does not implement its own auth.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` (a local `mongod`, or a free MongoDB Atlas cluster both work)
   - `FIREBASE_PROJECT_ID` — must match the `project_id` in
     `android/app/google-services.json` / `ios/VerifiedPhone/GoogleService-Info.plist`
3. `npm run dev`

No Firebase service account key is needed — ID tokens from the app are verified directly
against Firebase's public signing keys (see `src/auth/verifyFirebaseToken.ts`). Use this
approach if your GCP org policy blocks creating service account keys
(`iam.disableServiceAccountKeyCreation`).

## Dev networking from the RN app

- Android emulator reaches this server at `http://10.0.2.2:<PORT>`.
- iOS simulator reaches this server at `http://localhost:<PORT>`.

See `src/api/config.ts` in the RN app.
