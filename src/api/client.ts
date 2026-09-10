import { getIdToken } from '../auth/firebaseAuth';
import { API_BASE_URL } from './config';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getIdToken();
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

export async function requestForm<T>(
  path: string,
  fields: Record<string, unknown>,
  options: { method?: string } = {},
): Promise<T> {
  const headers = await authHeaders();
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => appendFormValue(form, key, value));

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'POST',
    headers,
    // React Native's FormData is a valid fetch body at runtime; its bundled
    // fetch typings don't line up with lib.dom's BodyInit for this overload.
    body: form as unknown as string,
  });
  return parseResponse(res);
}

export function imageFieldToFormFile(uri: string | null): FormFile | undefined {
  if (!uri) {
    return undefined;
  }
  const name = uri.split('/').pop() ?? 'upload.jpg';
  return { uri, name, type: 'image/jpeg' };
}
