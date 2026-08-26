'use client';

import { useEffect, useState } from 'react';
import { BarChart, DonutChart, LineChart } from '../components/Charts';
import { AdminShell } from '../components/AdminShell';
import { api } from '../lib/api';

type ChartSlice = { label: string; value: number };
type ActivityPoint = { date: string; deeds: number; rays: number };

type Dashboard = {
  users: number;
  activeUsers: number;
  pendingDeeds: number;
  approvedDeeds: number;
  products: number;
  orders: number;
  raysInCirculation: number;
  systemPoolBalance: number;
  charts: {
    deedsByStatus: ChartSlice[];
    deedsByCategory: ChartSlice[];
    raysByType: ChartSlice[];
    activity: ActivityPoint[];
  };
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Dashboard>('/admin/dashboard')
      .then(setStats)
      .catch((err: Error) => setError(err.message));
  }, []);

  const cards = stats
    ? [
        { label: 'Пользователи', value: String(stats.users), hint: `${stats.activeUsers} активных` },
        { label: 'Дела на модерации', value: String(stats.pendingDeeds), hint: 'ждут проверки' },
        { label: 'Подтверждённые дела', value: String(stats.approvedDeeds), hint: 'награждены Лучами' },
        { label: 'Лучи в обороте', value: String(stats.raysInCirculation), hint: `пул ${stats.systemPoolBalance}` },
        { label: 'Заказы', value: String(stats.orders), hint: 'магазин' },
        { label: 'Товары', value: String(stats.products), hint: 'в витрине' },
      ]
    : [];

  return (
    <AdminShell>
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-sun via-rays-gold to-sky p-8 text-gray-900 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide">ЛУЧИ · аналитика</p>
        <h1 className="mt-1 text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-80">
          Добрые дела, Лучи и магазин в одном экране. Данные из ledger и модерации.
        </p>
      </div>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-900/60">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-900/50">{stat.hint}</p>
          </div>
        ))}
      </div>
      {stats && (
        <div className="grid gap-4 xl:grid-cols-2">
          <DonutChart title="Дела по статусам" items={stats.charts.deedsByStatus} />
          <BarChart title="Дела по категориям" items={stats.charts.deedsByCategory} />
          <div className="xl:col-span-2">
            <LineChart title="Активность за 14 дней" points={stats.charts.activity} />
          </div>
          <BarChart title="Операции с Лучами" items={stats.charts.raysByType} />
        </div>
      )}
    </AdminShell>
  );
}
