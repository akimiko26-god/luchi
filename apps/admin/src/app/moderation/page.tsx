'use client';

import { Button } from '@luchi/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminShell } from '../../components/AdminShell';
import { api, mediaUrl } from '../../lib/api';

type QueueItem = {
  id: string;
  status: string;
  description: string | null;
  taskTitle: string;
  taskId: string;
  taskUrl: string;
  createdAt: string;
  attachments: Array<{ id: string; url: string; kind: string; originalName: string }>;
  confirmedCount: number;
  pendingCount: number;
  user: { displayName: string; username: string };
  confirmations: Array<{ id: string; status: string; user: { displayName: string; username: string } }>;
};

export default function ModerationPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load(): Promise<void> {
    setItems(await api<QueueItem[]>('/deeds/queue'));
  }

  useEffect(() => {
    void load();
  }, []);

  async function approve(id: string, override = false): Promise<void> {
    try {
      await api(`/deeds/queue/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ override }),
      });
      setMessage(override ? 'Одобрено без подтверждения получателя' : 'Начислены Лучи');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не удалось одобрить');
    }
  }

  async function reject(id: string): Promise<void> {
    await api(`/deeds/queue/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Недостаточно подтверждения' }),
    });
    setMessage('Отклонено');
    await load();
  }

  return (
    <AdminShell>
      <h1 className="mb-2 text-2xl font-bold">Модерация</h1>
      <p className="mb-6 text-gray-900/70">
        Проверяйте вложения и подтверждение человека, которому помогли. Без подтверждения Лучи не начисляются, если не сделать явное одобрение.
      </p>
      {message && <p className="mb-4 text-sm text-growth">{message}</p>}
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-900/60">
              {item.user.displayName} @{item.user.username}
            </p>
            <h2 className="font-semibold">
              <Link href={`http://localhost:3000/deeds/${item.taskId}`} className="hover:underline" target="_blank">
                {item.taskTitle}
              </Link>
            </h2>
            <p className="mt-2">{item.description}</p>
            <p className="mt-2 text-sm">
              Подтверждения: {item.confirmedCount} да · {item.pendingCount} ждут
            </p>
            <ul className="mt-1 text-sm text-gray-900/70">
              {item.confirmations.map((row) => (
                <li key={row.id}>
                  @{row.user.username} — {row.status}
                </li>
              ))}
            </ul>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {item.attachments.map((file) => {
                const src = mediaUrl(file.url);
                if (file.kind === 'PHOTO' && src) {
                  return <img key={file.id} src={src} alt={file.originalName} className="h-32 w-full rounded-lg object-cover" />;
                }
                if (file.kind === 'VIDEO' && src) {
                  return (
                    <video key={file.id} src={src} controls className="h-32 w-full rounded-lg bg-black">
                      <track kind="captions" />
                    </video>
                  );
                }
                return (
                  <a key={file.id} href={src ?? '#'} className="rounded-lg bg-gray-50 p-3 text-sm text-sky underline" target="_blank">
                    {file.kind}: {file.originalName}
                  </a>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="rays" onClick={() => void approve(item.id)}>
                Одобрить
              </Button>
              {item.confirmedCount === 0 && (
                <Button type="button" variant="secondary" onClick={() => void approve(item.id, true)}>
                  Одобрить без подтверждения
                </Button>
              )}
              <Button type="button" variant="danger" onClick={() => void reject(item.id)}>
                Отклонить
              </Button>
            </div>
          </article>
        ))}
        {items.length === 0 && <p>Очередь пуста</p>}
      </div>
    </AdminShell>
  );
}
