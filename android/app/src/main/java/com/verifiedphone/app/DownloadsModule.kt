package com.verifiedphone.app

import android.app.DownloadManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileInputStream

// Saves an app-generated file (e.g. an invoice PDF) into the phone's public
// Downloads folder, where the user can find it in Files, and opens it.
class DownloadsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "DownloadsModule"

  @ReactMethod
  fun saveToDownloads(sourcePath: String, fileName: String, mimeType: String, promise: Promise) {
    try {
      val source = File(sourcePath.removePrefix("file://"))
      val uri =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
          saveWithMediaStore(source, fileName, mimeType)
        } else {
          saveLegacy(source, fileName, mimeType)
        }
      // Android renames duplicates ("name (1).pdf"), so report the real name.
      val result =
        Arguments.createMap().apply {
          putString("uri", uri.toString())
          putString("name", displayName(uri) ?: fileName)
        }
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("SAVE_FAILED", e.message ?: "Could not save the file", e)
    }
  }

  @ReactMethod
  fun openFile(uriString: String, mimeType: String, promise: Promise) {
    val intent =
      Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(Uri.parse(uriString), mimeType)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
      }
    try {
      reactContext.startActivity(intent)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("NO_VIEWER", "No app found to open this file", e)
    }
  }

  private fun displayName(uri: Uri): String? =
    try {
      reactContext.contentResolver
        .query(uri, arrayOf(MediaStore.MediaColumns.DISPLAY_NAME), null, null, null)
        ?.use { cursor -> if (cursor.moveToFirst()) cursor.getString(0) else null }
    } catch (e: Exception) {
      null
    }

  // Android 10+: no storage permission needed for the shared Downloads folder.
  private fun saveWithMediaStore(source: File, fileName: String, mimeType: String): Uri {
    val resolver = reactContext.contentResolver
    val values =
      ContentValues().apply {
        put(MediaStore.Downloads.DISPLAY_NAME, fileName)
        put(MediaStore.Downloads.MIME_TYPE, mimeType)
        put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
        put(MediaStore.Downloads.IS_PENDING, 1)
      }
    val uri =
      resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
        ?: throw IllegalStateException("Could not create the file in Downloads")
    resolver.openOutputStream(uri).use { out ->
      requireNotNull(out) { "Could not write to Downloads" }
      FileInputStream(source).use { it.copyTo(out) }
    }
    values.clear()
    values.put(MediaStore.Downloads.IS_PENDING, 0)
    resolver.update(uri, values, null, null)
    return uri
  }

  // Android 7–9: needs WRITE_EXTERNAL_STORAGE (requested from JS first).
  @Suppress("DEPRECATION")
  private fun saveLegacy(source: File, fileName: String, mimeType: String): Uri {
    val downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
    downloads.mkdirs()
    var target = File(downloads, fileName)
    var copy = 1
    while (target.exists()) {
      target = File(downloads, "${fileName.substringBeforeLast('.')} ($copy).${fileName.substringAfterLast('.')}")
      copy++
    }
    source.copyTo(target)
    val manager = reactContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
    val id =
      manager.addCompletedDownload(
        target.name, target.name, true, mimeType, target.absolutePath, target.length(), true,
      )
    return manager.getUriForDownloadedFile(id) ?: Uri.fromFile(target)
  }
}
