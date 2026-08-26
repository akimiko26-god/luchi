'use client';

import { Button } from '@luchi/ui';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL, setAccessToken } from '../../lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@luchi.app');
  const [password, setPassword] = useState('DemoP@ss123!');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const body = (await response.json()) as {
      data?: { accessToken: string; user: { roles: string[] } };
      detail?: string;
    };
    if (!response.ok || !body.data) {
      setError(body.detail ?? 'Ошибка входа');
      return;
    }
    const allowed = body.data.user.roles.some((role) =>
      ['administrator', 'super_administrator', 'moderator'].includes(role),
    );
    if (!allowed) {
      setError('Недостаточно прав для админ-панели');
      return;
    }
    setAccessToken(body.data.accessToken);
    router.push('/');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Вход в админку</h1>
        <label className="mb-3 block text-sm">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-gray-100 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mb-4 block text-sm">
          Пароль
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-gray-100 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        <Button type="submit" variant="rays" className="w-full">
          Войти
        </Button>
      </form>
    </main>
  );
}
