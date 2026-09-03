import { Platform } from 'react-native';

// 10.0.2.2 only resolves inside the Android *emulator* (its alias for the
// host machine) — a real phone on the same Wi-Fi needs the host's actual
// LAN IP instead. Swap this for your Mac's IP (`ipconfig getifaddr en0`)
// when running on physical hardware; switch back to 10.0.2.2 for the
// emulator.
const DEV_BASE_URL = Platform.OS === 'android' ? 'http://192.168.1.100:4000' : 'http://localhost:4000';

const PROD_BASE_URL = 'https://verifiedphone-api.onrender.com';

export const API_BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;

export function resolveUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}
