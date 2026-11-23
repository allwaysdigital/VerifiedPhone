import { Alert, NativeModules, PermissionsAndroid, Platform } from 'react-native';

export type SavedDownload = { uri: string; name: string };

type DownloadsNativeModule = {
  saveToDownloads(sourcePath: string, fileName: string, mimeType: string): Promise<SavedDownload>;
  openFile(uri: string, mimeType: string): Promise<void>;
};

const { DownloadsModule } = NativeModules as { DownloadsModule?: DownloadsNativeModule };

// Copies a generated file into the phone's public Downloads folder and
// returns its content URI and final name. Android 9 and older need storage
// permission.
export async function saveToDownloads(
  sourcePath: string,
  fileName: string,
  mimeType: string,
): Promise<SavedDownload> {
  if (Platform.OS !== 'android' || !DownloadsModule) {
    throw new Error('Saving to Downloads is only supported on Android.');
  }
  if (Number(Platform.Version) < 29) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Storage permission is needed to save to Downloads.');
    }
  }
  return DownloadsModule.saveToDownloads(sourcePath, fileName, mimeType);
}

export async function openDownloadedFile(uri: string, mimeType: string): Promise<void> {
  if (!DownloadsModule) {
    throw new Error('Opening files is only supported on Android.');
  }
  await DownloadsModule.openFile(uri, mimeType);
}

// Saves a generated PDF to Downloads and tells the user where it went, with
// an option to open it. `title` is the alert heading, e.g. "Invoice downloaded".
export async function savePdfToDownloads(
  filePath: string,
  fileName: string,
  title: string,
): Promise<void> {
  const { uri, name } = await saveToDownloads(filePath, `${fileName}.pdf`, 'application/pdf');
  Alert.alert(title, `Saved to your Downloads folder as ${name}.`, [
    { text: 'OK', style: 'cancel' },
    {
      text: 'Open',
      onPress: () =>
        openDownloadedFile(uri, 'application/pdf').catch(() =>
          Alert.alert('Could not open', 'No app found to open PDF files.'),
        ),
    },
  ]);
}
