'use client';

import { Button } from '@luchi/ui';
import { FormEvent, useEffect, useState } from 'react';
import { AdminShell } from '../../components/AdminShell';
import { api } from '../../lib/api';

type Org = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  verificationStatus: string;
};

type Category = { id: string; name: string };

const emptyOrg = { name: '', slug: '', description: '', city: '', verificationStatus: 'VERIFIED' };

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyOrg);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [task, setTask] = useState({
    title: '',
    description: '',
    categoryId: '',
    organizationId: '',
    rewardMin: 20,
    rewardMax: 50,
    locationCity: '',
    maxParticipants: '',
  });
  const [message, setMessage] = useState<string | null>(null);

  async function load(): Promise<void> {
    const [orgRows, categoryRows] = await Promise.all([
      api<Org[]>('/admin/organizations'),
      api<Category[]>('/deeds/categories'),
    ]);
    setOrgs(orgRows);
    setCategories(categoryRows);
    if (!task.organizationId && orgRows[0]) {
      setTask((prev) => ({ ...prev, organizationId: orgRows[0].id, categoryId: categoryRows[0]?.id ?? '' }));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveOrg(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (editingId) {
      await api(`/admin/organizations/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
    } else {
      await api('/admin/organizations', { method: 'POST', body: JSON.stringify(form) });
    }
    setForm(emptyOrg);
    setEditingId(null);
    setMessage('Организация сохранена');
    await load();
  }

  async function saveTask(event: FormEvent): Promise<void> {
    event.preventDefault();
    await api('/deeds/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        categoryId: task.categoryId,
        organizationId: task.organizationId || undefined,
        rewardMin: Number(task.rewardMin),
        rewardMax: Number(task.rewardMax),
        locationCity: task.locationCity || undefined,
        maxParticipants: task.maxParticipants ? Number(task.maxParticipants) : undefined,
      }),
    });
    setMessage('Доброе дело создано');
    setTask((prev) => ({ ...prev, title: '', description: '', maxParticipants: '' }));
  }

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">Организации</h1>
      {message && <p className="mb-4 text-sm text-growth">{message}</p>}
      <form onSubmit={saveOrg} className="mb-8 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2">
        <h2 className="md:col-span-2 font-semibold">{editingId ? 'Редактировать' : 'Новая организация'}</h2>
        <input
          required
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Название"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          className="rounded-lg border border-gray-100 p-2"
          placeholder="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <input
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Город"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <select
          className="rounded-lg border border-gray-100 p-2"
          value={form.verificationStatus}
          onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}
        >
          <option value="PENDING">PENDING</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <textarea
          className="md:col-span-2 h-20 rounded-lg border border-gray-100 p-2"
          placeholder="Описание"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Button type="submit" variant="rays">
          Сохранить
        </Button>
      </form>
      <div className="mb-10 space-y-4">
        {orgs.map((org) => (
          <article key={org.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">{org.name}</h2>
            <p className="text-sm text-gray-900/60">
              {org.city} · {org.verificationStatus} · {org.slug}
            </p>
            <p className="mt-2">{org.description}</p>
            <Button
              className="mt-3"
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingId(org.id);
                setForm({
                  name: org.name,
                  slug: org.slug,
                  description: org.description ?? '',
                  city: org.city ?? '',
                  verificationStatus: org.verificationStatus,
                });
              }}
            >
              Редактировать
            </Button>
          </article>
        ))}
      </div>
      <form onSubmit={saveTask} className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2">
        <h2 className="md:col-span-2 font-semibold">Новое доброе дело</h2>
        <input
          required
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Название"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
        />
        <select
          className="rounded-lg border border-gray-100 p-2"
          value={task.organizationId}
          onChange={(e) => setTask({ ...task, organizationId: e.target.value })}
        >
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-gray-100 p-2"
          value={task.categoryId}
          onChange={(e) => setTask({ ...task, categoryId: e.target.value })}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Город"
          value={task.locationCity}
          onChange={(e) => setTask({ ...task, locationCity: e.target.value })}
        />
        <input
          type="number"
          min={1}
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Награда мин"
          value={task.rewardMin}
          onChange={(e) => setTask({ ...task, rewardMin: Number(e.target.value) })}
        />
        <input
          type="number"
          min={1}
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Награда макс"
          value={task.rewardMax}
          onChange={(e) => setTask({ ...task, rewardMax: Number(e.target.value) })}
        />
        <input
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Лимит волонтёров (необязательно)"
          value={task.maxParticipants}
          onChange={(e) => setTask({ ...task, maxParticipants: e.target.value })}
        />
        <textarea
          required
          minLength={8}
          className="md:col-span-2 h-24 rounded-lg border border-gray-100 p-2"
          placeholder="Описание задания"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
        />
        <Button type="submit" variant="rays">
          Создать дело
        </Button>
      </form>
    </AdminShell>
  );
}
