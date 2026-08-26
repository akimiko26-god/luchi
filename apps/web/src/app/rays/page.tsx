'use client';

import { Button, RayBalance } from '@luchi/ui';
import { FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { api } from '../../lib/api';

type Wallet = {
  balance: number;
  history: Array<{
    id: string;
    type: string;
    amount: number;
    direction: 'in' | 'out';
    reason: string;
    createdAt: string;
  }>;
};

export default function RaysPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [toUsername, setToUsername] = useState('ivan_green');
  const [amount, setAmount] = useState(5);
  const [reason, setReason] = useState('Спасибо');
  const [message, setMessage] = useState<string | null>(null);

  async function load(): Promise<void> {
    setWallet(await api<Wallet>('/rays/me'));
  }

  useEffect(() => {
    void load();
  }, []);

  async function transfer(event: FormEvent): Promise<void> {
    event.preventDefault();
    try {
      const next = await api<Wallet>('/rays/transfer', {
        method: 'POST',
        body: JSON.stringify({ toUsername, amount: Number(amount), reason }),
      });
      setWallet(next);
      setMessage('Перевод выполнен');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Ошибка перевода');
    }
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">Кошелёк Лучей</h1>
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-900/60">Текущий баланс</p>
        <RayBalance balance={wallet?.balance ?? 0} size="lg" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={transfer} className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Перевести Лучи</h2>
          <label className="mb-3 block text-sm">
            Username получателя
            <input
              className="mt-1 w-full rounded-lg border border-gray-100 px-3 py-2"
              value={toUsername}
              onChange={(e) => setToUsername(e.target.value)}
              required
            />
          </label>
          <label className="mb-3 block text-sm">
            Сумма
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-lg border border-gray-100 px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </label>
          <label className="mb-3 block text-sm">
            Сообщение
            <input
              className="mt-1 w-full rounded-lg border border-gray-100 px-3 py-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          {message && <p className="mb-3 text-sm">{message}</p>}
          <Button type="submit" variant="rays">
            Отправить
          </Button>
        </form>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">История</h2>
          <ul className="space-y-3 text-sm">
            {wallet?.history.map((item) => (
              <li key={`${item.id}-${item.createdAt}`} className="flex justify-between gap-4">
                <span>
                  {item.reason}
                  <span className="block text-gray-900/50">{item.type}</span>
                </span>
                <span className={item.direction === 'in' ? 'text-growth' : 'text-error'}>
                  {item.direction === 'in' ? '+' : '−'}
                  {item.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
