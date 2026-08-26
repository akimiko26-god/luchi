'use client';

import { Button } from '@luchi/ui';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { clearAccessToken, getAccessToken } from '../lib/api';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/users', label: 'Пользователи' },
  { href: '/organizations', label: 'Организации' },
  { href: '/moderation', label: 'Модерация' },
  { href: '/reports', label: 'Отчёты' },
  { href: '/transactions', label: 'Лучи' },
  { href: '/store', label: 'Магазин' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-gray-100 bg-white p-6">
        <Link href="/" className="mb-8 flex items-center gap-2 font-bold">
          <span aria-hidden="true">☀</span>
          ЛУЧИ Admin
        </Link>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                pathname === item.href ? 'bg-sky/20 font-medium' : 'text-gray-900/70 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          className="mt-8 w-full"
          variant="ghost"
          type="button"
          onClick={() => {
            clearAccessToken();
            router.replace('/login');
          }}
        >
          Выйти
        </Button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
