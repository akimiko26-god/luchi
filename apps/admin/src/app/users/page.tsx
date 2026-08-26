'use client';

import { Button } from '@luchi/ui';
import { useEffect, useState } from 'react';
import { AdminShell } from '../../components/AdminShell';
import { api } from '../../lib/api';

type AdminUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  city: string | null;
  status: string;
  level: number;
  roles: string[];
  roleCodes: string[];
  rays: number;
};

type Role = { id: string; name: string; displayName: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load(): Promise<void> {
    const [rows, roleRows] = await Promise.all([
      api<AdminUser[]>('/admin/users'),
      api<Role[]>('/admin/roles'),
    ]);
    setUsers(rows);
    setRoles(roleRows);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(user: AdminUser, patch: { status?: string; role?: string }): Promise<void> {
    await api(`/admin/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    setMessage(`Обновлён @${user.username}`);
    await load();
  }

  return (
    <AdminShell>
      <h1 className="mb-2 text-2xl font-bold">Пользователи</h1>
      <p className="mb-6 text-sm text-gray-900/70">Меняйте статус и роль. После смены роли пользователь должен войти заново.</p>
      {message && <p className="mb-4 text-sm text-growth">{message}</p>}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-3">Имя</th>
              <th className="p-3">Email</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Роль</th>
              <th className="p-3">Лучи</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100">
                <td className="p-3">
                  {user.displayName}
                  <div className="text-gray-900/50">@{user.username}</div>
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <select
                    className="rounded-lg border border-gray-100 p-1"
                    value={user.status}
                    onChange={(e) => void save(user, { status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="BANNED">BANNED</option>
                  </select>
                </td>
                <td className="p-3">
                  <select
                    className="rounded-lg border border-gray-100 p-1"
                    value={user.roleCodes[0] ?? 'user'}
                    onChange={(e) => void save(user, { role: e.target.value })}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.displayName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">{user.rays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button className="mt-4" variant="ghost" type="button" onClick={() => void load()}>
        Обновить
      </Button>
    </AdminShell>
  );
}
