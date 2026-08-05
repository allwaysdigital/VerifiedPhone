import { Platform } from 'react-native';

const DEV_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

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
