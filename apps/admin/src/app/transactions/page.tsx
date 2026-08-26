'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '../../components/AdminShell';
import { api } from '../../lib/api';

type Tx = {
  id: string;
  type: string;
  reason: string;
  createdAt: string;
  amount: number;
};

export default function TransactionsPage() {
  const [rows, setRows] = useState<Tx[]>([]);

  useEffect(() => {
    void api<Tx[]>('/admin/transactions').then(setRows);
  }, []);

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">Операции с Лучами</h1>
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
            {rows.map((row) => (
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
