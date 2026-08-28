'use client';

import { Button } from '@luchi/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@luchi.app');
  const [password, setPassword] = useState('DemoP@ss123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) {
        const messages: Record<string, string> = {
          INVALID_CREDENTIALS: 'Неверный email или пароль',
          SESSION_LIMIT: 'Слишком много сессий — войдите ещё раз',
          ACCOUNT_LOCKED: 'Аккаунт временно заблокирован',
        };
        setError(messages[body.code as string] ?? body.detail ?? 'Ошибка входа');
        return;
      }
      localStorage.setItem('access_token', body.data.accessToken);
      router.push('/feed');
    } catch {
      setError('Не удалось связаться с сервером. Проверьте, что API доступен.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-3xl" aria-hidden="true">
            ☀
          </span>
          <h1 className="mt-2 text-2xl font-bold">Вход в ЛУЧИ</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-100 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-100 px-3 py-2"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="rays" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-900/60">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-sky underline">
            Регистрация
          </Link>
        </p>
      </div>
    </main>
  );
}
