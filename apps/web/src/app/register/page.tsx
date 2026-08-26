'use client';

import { Button, RayBalance } from '@luchi/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    username: '',
    displayName: '',
    password: 'DemoP@ss123!',
    acceptTerms: true,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.detail ?? 'Ошибка регистрации');
        return;
      }
      localStorage.setItem('access_token', body.data.accessToken);
      setMessage(`Добро пожаловать, ${body.data.user.displayName}!`);
      router.push('/feed');
    } catch {
      setError('API недоступен');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Регистрация</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          {(['email', 'username', 'displayName', 'password'] as const).map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm capitalize" htmlFor={field}>
                {field === 'displayName' ? 'Имя' : field}
              </label>
              <input
                id={field}
                type={field === 'password' ? 'password' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full rounded-lg border border-gray-100 px-3 py-2"
                required
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && (
            <p className="text-sm text-green-600">
              {message} <RayBalance balance={0} size="sm" />
            </p>
          )}
          <Button type="submit" variant="rays" className="w-full" disabled={loading}>
            {loading ? 'Создание...' : 'Создать аккаунт'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-sky underline">
            Уже есть аккаунт
          </Link>
        </p>
      </div>
    </main>
  );
}
