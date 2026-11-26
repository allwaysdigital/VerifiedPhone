import { getToken } from '../auth/session';
import { API_BASE_URL } from './config';
import { ApiError } from './apiError';

export { ApiError };

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(res: Response) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && data.error) || `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return data;
}

export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...headers,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return parseResponse(res);
}

export type FormFile = { uri: string; name: string; type: string };

function appendFormValue(form: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) {
    return;
  }
  if (typeof value === 'object' && 'uri' in (value as FormFile)) {
    form.append(key, value as unknown as Blob);
    return;
  }
  if (Array.isArray(value)) {
    form.append(key, JSON.stringify(value));
    return;
  }
  form.append(key, String(value));
}

// 0–1 share of the request body sent so far.
export type UploadProgress = (fraction: number) => void;

// Multipart upload. Uses XMLHttpRequest rather than fetch because only XHR
// reports upload progress, which the purchase screen shows while photos send.
export async function requestForm<T>(
  path: string,
  fields: Record<string, unknown>,
  options: { method?: string; onProgress?: UploadProgress } = {},
): Promise<T> {
  const headers = await authHeaders();
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => appendFormValue(form, key, value));

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method ?? 'POST', `${API_BASE_URL}${path}`);
    Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
    if (options.onProgress && xhr.upload) {
      const onProgress = options.onProgress;
      xhr.upload.onprogress = event => {
        if (event.lengthComputable && event.total > 0) {
          onProgress(event.loaded / event.total);
        }
      };
    }
    xhr.onload = () => {
      let data: any = null;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        data = null;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        const message = (data && data.error) || `Request failed with status ${xhr.status}`;
        reject(new ApiError(xhr.status, message));
        return;
      }
      resolve(data as T);
    };
    xhr.onerror = () => reject(new TypeError('Network request failed'));
    xhr.ontimeout = () => reject(new TypeError('Network request timed out'));
    xhr.send(form);
  });
}

// Only local photos are uploaded; an http(s) URI is a photo the server already
// has (when editing a purchase), so it is left out and the server keeps it.
export function imageFieldToFormFile(uri: string | null): FormFile | undefined {
  if (!uri || /^https?:\/\//i.test(uri)) {
    return undefined;
  }
  const name = uri.split('/').pop() ?? 'upload.jpg';
  return { uri, name, type: 'image/jpeg' };
}
