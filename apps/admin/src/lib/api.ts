export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }
  if (path.startsWith('http')) {
    return path;
  }
  return `${API_ORIGIN}${path}`;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('admin_access_token');
}

export function setAccessToken(token: string): void {
  localStorage.setItem('admin_access_token', token);
}

export function clearAccessToken(): void {
  localStorage.removeItem('admin_access_token');
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    credentials: 'include',
  });
  const body = (await response.json()) as { data?: T; detail?: string; code?: string };
  if (!response.ok) {
    throw new ApiError(body.detail ?? 'Ошибка запроса', body.code);
  }
  return body.data as T;
}

export type UploadedFile = {
  url: string;
  kind: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  originalName: string;
  mimeType: string;
};

export async function uploadFile(file: File): Promise<UploadedFile> {
  const token = getAccessToken();
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${API_URL}/media/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
    body: form,
  });
  const body = (await response.json()) as { data?: UploadedFile; detail?: string; code?: string };
  if (!response.ok) {
    throw new ApiError(body.detail ?? 'Ошибка загрузки', body.code);
  }
  return body.data as UploadedFile;
}
