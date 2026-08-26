'use client';

import { Button } from '@luchi/ui';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { api, mediaUrl, uploadFile, type UploadedFile } from '../../lib/api';

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
  url: string;
  category: { name: string; icon: string | null };
  organization: string;
};

type Submission = {
  id: string;
  status: string;
  taskTitle: string;
  taskId: string;
  taskUrl: string;
  rewardAmount: number | null;
  confirmedCount: number;
  pendingCount: number;
  createdAt: string;
};

type PendingConfirmation = {
  id: string;
  taskTitle: string;
  taskId: string;
  volunteer: { displayName: string; username: string };
  description: string | null;
  createdAt: string;
};

export default function DeedsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mine, setMine] = useState<Submission[]>([]);
  const [confirmations, setConfirmations] = useState<PendingConfirmation[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [description, setDescription] = useState('');
  const [helped, setHelped] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const selectedTask = tasks.find((task) => task.id === selected);
  const full = selectedTask?.spotsLeft === 0;

  async function load(): Promise<void> {
    const [taskRows, submissions, pending] = await Promise.all([
      api<Task[]>('/deeds/tasks'),
      api<Submission[]>('/deeds/submissions/me'),
      api<PendingConfirmation[]>('/deeds/confirmations/me'),
    ]);
    setTasks(taskRows);
    setMine(submissions);
    setConfirmations(pending);
    if (!selected && taskRows[0]) {
      setSelected(taskRows[0].id);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onFiles(list: FileList | null): Promise<void> {
    if (!list || list.length === 0) {
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const uploaded: UploadedFile[] = [];
      for (const file of Array.from(list)) {
        uploaded.push(await uploadFile(file));
      }
      setFiles((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не удалось загрузить файл');
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setMessage(null);
    const helpedUsernames = helped
      .split(',')
      .map((name) => name.trim().replace(/^@/, ''))
      .filter(Boolean);
    try {
      await api('/deeds/submissions', {
        method: 'POST',
        body: JSON.stringify({
          taskId: selected,
          description,
          attachments: files,
          helpedUsernames,
        }),
      });
      setDescription('');
      setHelped('');
      setFiles([]);
      setMessage('Отчёт отправлен на модерацию. Человек, которому вы помогли, получит запрос на подтверждение.');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не удалось отправить отчёт');
    }
  }

  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-bold">Добрые дела</h1>
      <p className="mb-6 text-gray-900/70">
        Выберите дело, приложите фото, видео или документы и укажите, кому помогли.
      </p>
      {confirmations.length > 0 && (
        <section className="mb-6 rounded-2xl border border-sun bg-sun/20 p-5">
          <h2 className="mb-3 font-semibold">Вас отметили — подтвердите помощь</h2>
          <ul className="space-y-3">
            {confirmations.map((item) => (
              <li key={item.id} className="rounded-xl bg-white p-4">
                <p className="font-medium">{item.volunteer.displayName} помог(ла) вам</p>
                <p className="text-sm text-gray-900/70">{item.description}</p>
                <Link href={`/deeds/${item.taskId}`} className="text-sm text-sky underline">
                  {item.taskTitle}
                </Link>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="rays"
                    onClick={async () => {
                      await api(`/deeds/confirmations/${item.id}/confirm`, { method: 'POST' });
                      await load();
                    }}
                  >
                    Подтвердить
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      await api(`/deeds/confirmations/${item.id}/deny`, { method: 'POST' });
                      await load();
                    }}
                  >
                    Это не так
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {tasks.map((task) => (
            <article key={task.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-900/60">
                {task.category.icon} {task.category.name} · {task.organization}
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                <Link href={`/deeds/${task.id}`} className="hover:underline">
                  {task.title}
                </Link>
              </h2>
              <p className="mt-2 text-gray-900/80">{task.description}</p>
              <p className="mt-3 text-sm font-medium text-rays-gold">
                Награда: {task.rewardMin}–{task.rewardMax} ☀ {task.locationCity ? `· ${task.locationCity}` : ''}
              </p>
              <p className="mt-1 text-sm text-gray-900/60">
                {task.maxParticipants == null
                  ? 'Мест не ограничено'
                  : task.spotsLeft === 0
                    ? 'Набор закрыт'
                    : `Мест: ${task.spotsLeft} из ${task.maxParticipants}`}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant={selected === task.id ? 'rays' : 'secondary'}
                  onClick={() => setSelected(task.id)}
                  disabled={task.spotsLeft === 0}
                >
                  {selected === task.id ? 'Выбрано' : 'Выбрать'}
                </Button>
                <Link href={`/deeds/${task.id}`} className="self-center text-sm text-sky underline">
                  Открыть дело
                </Link>
              </div>
            </article>
          ))}
        </div>
        <aside className="space-y-6">
          <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-1 font-semibold">Отправить отчёт</h2>
            {selectedTask && (
              <p className="mb-3 text-sm">
                Дело:{' '}
                <Link href={`/deeds/${selectedTask.id}`} className="text-sky underline">
                  {selectedTask.title}
                </Link>
              </p>
            )}
            <textarea
              required
              minLength={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-3 h-28 w-full rounded-lg border border-gray-100 p-3"
              placeholder="Что вы сделали?"
            />
            <input
              required
              value={helped}
              onChange={(e) => setHelped(e.target.value)}
              className="mb-3 w-full rounded-lg border border-gray-100 p-3 text-sm"
              placeholder="Кому помогли: olga_help (через запятую)"
            />
            <label className="mb-3 block text-sm">
              Фото, видео, документы
              <input
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm,.pdf,.doc,.docx"
                className="mt-1 block w-full text-sm"
                onChange={(e) => void onFiles(e.target.files)}
              />
            </label>
            {files.length > 0 && (
              <ul className="mb-3 space-y-1 text-xs text-gray-900/70">
                {files.map((file) => (
                  <li key={file.url}>
                    {file.kind}: {file.originalName}
                    {file.kind === 'PHOTO' && mediaUrl(file.url) && (
                      <img src={mediaUrl(file.url) ?? ''} alt="" className="mt-1 h-16 rounded object-cover" />
                    )}
                  </li>
                ))}
              </ul>
            )}
            {message && <p className="mb-2 text-sm text-growth">{message}</p>}
            <Button type="submit" variant="rays" className="w-full" disabled={uploading || full || files.length === 0}>
              {uploading ? 'Загрузка...' : 'Отправить'}
            </Button>
          </form>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Мои отчёты</h2>
            <ul className="space-y-2 text-sm">
              {mine.map((row) => (
                <li key={row.id} className="rounded-lg bg-gray-50 p-3">
                  <Link href={`/deeds/${row.taskId}`} className="font-medium hover:underline">
                    {row.taskTitle}
                  </Link>
                  <p className="text-gray-900/60">
                    {row.status}
                    {row.rewardAmount ? ` · +${row.rewardAmount} ☀` : ''}
                    {row.pendingCount > 0 ? ` · ждут подтверждения: ${row.pendingCount}` : ''}
                    {row.confirmedCount > 0 ? ` · подтвердили: ${row.confirmedCount}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
