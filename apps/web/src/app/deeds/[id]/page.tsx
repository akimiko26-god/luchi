'use client';

import { Button } from '@luchi/ui';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '../../../components/AppShell';
import { api } from '../../../lib/api';

type Task = {
  id: string;
  title: string;
  description: string;
  rewardMin: number;
  rewardMax: number;
  locationCity: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  spotsLeft: number | null;
  category: { name: string; icon: string | null; color: string | null };
  organization: string;
};

export default function DeedDetailPage() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Task>(`/deeds/tasks/${params.id}`)
      .then(setTask)
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  return (
    <AppShell>
      {error && <p className="text-red-500">{error}</p>}
      {task && (
        <article className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-900/60">
            {task.category.icon} {task.category.name} · {task.organization}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{task.title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-lg text-gray-900/80">{task.description}</p>
          <p className="mt-6 font-medium text-rays-gold">
            Награда: {task.rewardMin}–{task.rewardMax} ☀
            {task.locationCity ? ` · ${task.locationCity}` : ''}
          </p>
          <p className="mt-2 text-sm text-gray-900/70">
            {task.maxParticipants == null
              ? 'Количество волонтёров не ограничено'
              : `Волонтёры: ${task.currentParticipants} из ${task.maxParticipants}`}
          </p>
          <Link href="/deeds">
            <Button className="mt-6" variant="rays">
              Отправить отчёт по этому делу
            </Button>
          </Link>
        </article>
      )}
    </AppShell>
  );
}
