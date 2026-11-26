# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# The app's own native modules are looked up by name from JavaScript.
-keep class com.verifiedphone.app.** { *; }

# pdfbox (PDF library) optionally supports JPEG 2000 via a decoder that isn't
# bundled and isn't needed here.
-dontwarn com.gemalto.jp2.JP2Decoder
