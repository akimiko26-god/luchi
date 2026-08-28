'use client';

import { Button, RayBalance } from '@luchi/ui';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { api, clearAccessToken, getAccessToken } from '../lib/api';

type CabinetOverview = {
  displayName: string;
  raysBalance: number;
  roles: string[];
};

const NAV = [
  { href: '/feed', label: 'Лента' },
  { href: '/deeds', label: 'Добрые дела' },
  { href: '/store', label: 'Магазин' },
  { href: '/rays', label: 'Лучи' },
  { href: '/profile', label: 'Кабинет' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [cabinet, setCabinet] = useState<CabinetOverview | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login');
      return;
    }
    api<CabinetOverview>('/cabinet/me')
      .then(setCabinet)
      .catch(() => {
        clearAccessToken();
        router.replace('/login');
      });
  }, [router, pathname]);

  function logout(): void {
    const token = getAccessToken();
    void fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    clearAccessToken();
    router.replace('/login');
  }

  const isAdmin = cabinet?.roles.some((role) =>
    ['administrator', 'super_administrator', 'moderator'].includes(role),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/feed" className="flex items-center gap-2 font-bold">
            <span aria-hidden="true">☀</span>
            ЛУЧИ
          </Link>
          <nav className="hidden gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === item.href ? 'bg-sun/30 text-gray-900' : 'text-gray-900/70 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <RayBalance balance={cabinet?.raysBalance ?? 0} />
            {isAdmin && (
              <a
                href={process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3002'}
                className="text-sm text-sky underline"
              >
                Админка
              </a>
            )}
            <Button variant="ghost" size="sm" type="button" onClick={logout}>
              Выйти
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                pathname === item.href ? 'bg-sun/30' : 'bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
