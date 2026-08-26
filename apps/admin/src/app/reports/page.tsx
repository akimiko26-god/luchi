'use client';

import { useEffect, useState } from 'react';
import { BarChart, DonutChart, LineChart } from '../../components/Charts';
import { AdminShell } from '../../components/AdminShell';
import { api } from '../../lib/api';

type ChartSlice = { label: string; value: number };
type ActivityPoint = { date: string; deeds: number; rays: number };
type Tx = { id: string; type: string; reason: string; createdAt: string; amount: number };

type Reports = {
  deedsByStatus: ChartSlice[];
  deedsByCategory: ChartSlice[];
  raysByType: ChartSlice[];
  activity: ActivityPoint[];
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Reports | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api<Reports>('/admin/reports'), api<Tx[]>('/admin/transactions')])
      .then(([reportRows, txRows]) => {
        setReports(reportRows);
        setTxs(txRows);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <AdminShell>
      <h1 className="mb-2 text-2xl font-bold">Отчёты</h1>
      <p className="mb-6 text-sm text-gray-900/70">Добрые дела, Лучи и транзакции ledger.</p>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      {reports && (
        <div className="mb-8 grid gap-4 xl:grid-cols-2">
          <DonutChart title="Дела по статусам" items={reports.deedsByStatus} />
          <BarChart title="Дела по категориям" items={reports.deedsByCategory} />
          <div className="xl:col-span-2">
            <LineChart title="14 дней: отчёты и Лучи" points={reports.activity} />
          </div>
          <BarChart title="Типы операций" items={reports.raysByType} />
        </div>
      )}
      <h2 className="mb-3 text-xl font-semibold">Последние транзакции</h2>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-3">Тип</th>
              <th className="p-3">Причина</th>
              <th className="p-3">Сумма</th>
              <th className="p-3">Дата</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((row) => (
              <tr key={row.id} className="border-b border-gray-100">
                <td className="p-3">{row.type}</td>
                <td className="p-3">{row.reason}</td>
                <td className="p-3">{row.amount}</td>
                <td className="p-3">{new Date(row.createdAt).toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
