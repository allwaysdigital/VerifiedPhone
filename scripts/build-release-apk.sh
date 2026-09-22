#!/usr/bin/env bash
# Builds a signed release APK for handing off to the client.
#
# Usage: npm run release:android   (or  ./scripts/build-release-apk.sh)
#
# The output is copied into ./release-builds/ with a name that includes the
# app's versionName + versionCode + build timestamp, so successive builds
# never overwrite each other and it's obvious which one you sent.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
OUT_DIR="$ROOT_DIR/release-builds"

VERSION_NAME=$(grep -m1 'versionName' "$ANDROID_DIR/app/build.gradle" | sed -E 's/.*versionName "([^"]+)".*/\1/')
VERSION_CODE=$(grep -m1 'versionCode' "$ANDROID_DIR/app/build.gradle" | sed -E 's/[^0-9]*([0-9]+).*/\1/')
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "==> Building release APK (v${VERSION_NAME} code ${VERSION_CODE})"
echo "    Release builds point at the production backend (PROD_BASE_URL in src/api/config.ts)."

cd "$ANDROID_DIR"
./gradlew assembleRelease

BUILT_APK="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$BUILT_APK" ]; then
  echo "Build did not produce $BUILT_APK — check the Gradle output above." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
DEST_APK="$OUT_DIR/VerifiedPhone-v${VERSION_NAME}-${VERSION_CODE}-${TIMESTAMP}.apk"
cp "$BUILT_APK" "$DEST_APK"

echo "==> Release APK ready:"
echo "    $DEST_APK"
