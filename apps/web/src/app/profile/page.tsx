'use client';

import { Button, RayBalance } from '@luchi/ui';
import { FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { api } from '../../lib/api';

type Overview = {
  displayName: string;
  username: string;
  email: string;
  bio: string | null;
  city: string | null;
  level: number;
  experiencePoints: number;
  roles: string[];
  raysBalance: number;
  stats: { deedsApproved: number; deedsPending: number; orders: number; posts: number };
  recentDeeds: Array<{ id: string; title: string; status: string; rewardAmount: number | null }>;
};

export default function ProfilePage() {
  const [data, setData] = useState<Overview | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [saved, setSaved] = useState(false);

  async function load(): Promise<void> {
    const overview = await api<Overview>('/cabinet/me');
    setData(overview);
    setDisplayName(overview.displayName);
    setBio(overview.bio ?? '');
    setCity(overview.city ?? '');
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(event: FormEvent): Promise<void> {
    event.preventDefault();
    await api('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ displayName, bio, city }),
    });
    setSaved(true);
    await load();
  }

  if (!data) {
    return (
      <AppShell>
        <p>Загрузка кабинета...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h1 className="text-2xl font-bold">{data.displayName}</h1>
          <p className="text-gray-900/60">
            @{data.username} · {data.email}
          </p>
          <p className="mt-3">{data.bio}</p>
          <p className="mt-1 text-sm text-gray-900/60">{data.city}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RayBalance balance={data.raysBalance} size="lg" />
            <span>Уровень {data.level}</span>
            <span className="text-sm text-gray-900/60">{data.experiencePoints} XP</span>
          </div>
          <p className="mt-2 text-sm text-gray-900/60">Роли: {data.roles.join(', ')}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['Дела', data.stats.deedsApproved],
              ['На проверке', data.stats.deedsPending],
              ['Посты', data.stats.posts],
              ['Покупки', data.stats.orders],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-900/60">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </section>
        <form onSubmit={save} className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Редактировать профиль</h2>
          <label className="mb-3 block text-sm">
            Имя
            <input
              className="mt-1 w-full rounded-lg border border-gray-100 px-3 py-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>
          <label className="mb-3 block text-sm">
            Город
            <input
              className="mt-1 w-full rounded-lg border border-gray-100 px-3 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
          <label className="mb-3 block text-sm">
            О себе
            <textarea
              className="mt-1 h-24 w-full rounded-lg border border-gray-100 px-3 py-2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
          {saved && <p className="mb-2 text-sm text-growth">Сохранено</p>}
          <Button type="submit" variant="rays" className="w-full">
            Сохранить
          </Button>
        </form>
      </div>
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Последние дела</h2>
        <ul className="space-y-2">
          {data.recentDeeds.map((deed) => (
            <li key={deed.id} className="flex justify-between rounded-lg bg-gray-50 p-3">
              <span>{deed.title}</span>
              <span className="text-sm text-gray-900/60">
                {deed.status}
                {deed.rewardAmount ? ` · +${deed.rewardAmount} ☀` : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
