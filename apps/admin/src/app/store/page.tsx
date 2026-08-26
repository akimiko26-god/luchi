'use client';

import { Button, RayBalance } from '@luchi/ui';
import { FormEvent, useEffect, useState } from 'react';
import { AdminShell } from '../../components/AdminShell';
import { api, mediaUrl, uploadFile } from '../../lib/api';

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageEmoji: string | null;
  imageUrl: string | null;
  priceRays: number;
  stock: number;
  productType: string;
  status: string;
};

const emptyProduct = {
  name: '',
  description: '',
  imageEmoji: '☀',
  imageUrl: '',
  priceRays: 40,
  stock: 20,
  productType: 'PHYSICAL',
  status: 'ACTIVE',
};

export default function AdminStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load(): Promise<void> {
    setProducts(await api<Product[]>('/admin/products'));
  }

  useEffect(() => {
    void load();
  }, []);

  async function onImage(file: File | undefined): Promise<void> {
    if (!file) {
      return;
    }
    const uploaded = await uploadFile(file);
    setForm((prev) => ({ ...prev, imageUrl: uploaded.url }));
  }

  async function save(event: FormEvent): Promise<void> {
    event.preventDefault();
    const payload = {
      ...form,
      priceRays: Number(form.priceRays),
      stock: Number(form.stock),
      imageUrl: form.imageUrl || undefined,
    };
    if (editingId) {
      await api(`/admin/products/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
    } else {
      await api('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
    }
    setForm(emptyProduct);
    setEditingId(null);
    setMessage('Товар сохранён');
    await load();
  }

  return (
    <AdminShell>
      <h1 className="mb-2 text-2xl font-bold">Магазин</h1>
      <p className="mb-6 text-sm text-gray-900/70">Описание, картинки, цена в Лучах и остаток.</p>
      {message && <p className="mb-4 text-sm text-growth">{message}</p>}
      <form onSubmit={save} className="mb-8 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2">
        <h2 className="md:col-span-2 font-semibold">{editingId ? 'Редактировать товар' : 'Новый товар'}</h2>
        <input
          required
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Название"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          min={1}
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Цена в Лучах"
          value={form.priceRays}
          onChange={(e) => setForm({ ...form, priceRays: Number(e.target.value) })}
        />
        <input
          type="number"
          min={0}
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Остаток"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        />
        <input
          className="rounded-lg border border-gray-100 p-2"
          placeholder="Эмодзи"
          value={form.imageEmoji}
          onChange={(e) => setForm({ ...form, imageEmoji: e.target.value })}
        />
        <select
          className="rounded-lg border border-gray-100 p-2"
          value={form.productType}
          onChange={(e) => setForm({ ...form, productType: e.target.value })}
        >
          <option value="PHYSICAL">PHYSICAL</option>
          <option value="VOUCHER">VOUCHER</option>
          <option value="CERTIFICATE">CERTIFICATE</option>
          <option value="DIGITAL">DIGITAL</option>
        </select>
        <select
          className="rounded-lg border border-gray-100 p-2"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="HIDDEN">HIDDEN</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <textarea
          className="md:col-span-2 h-20 rounded-lg border border-gray-100 p-2"
          placeholder="Описание"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <label className="text-sm">
          Картинка
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full"
            onChange={(e) => void onImage(e.target.files?.[0])}
          />
        </label>
        {mediaUrl(form.imageUrl) && (
          <img src={mediaUrl(form.imageUrl) ?? ''} alt="" className="h-24 rounded object-cover" />
        )}
        <Button type="submit" variant="rays">
          Сохранить
        </Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {mediaUrl(product.imageUrl) ? (
              <img src={mediaUrl(product.imageUrl) ?? ''} alt="" className="h-36 w-full object-cover" />
            ) : (
              <div className="flex h-20 items-center justify-center text-4xl">{product.imageEmoji}</div>
            )}
            <div className="p-5">
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-900/70">{product.description}</p>
              <p className="mt-1 text-sm text-gray-900/60">
                {product.productType} · {product.status} · остаток {product.stock}
              </p>
              <div className="mt-2">
                <RayBalance balance={product.priceRays} />
              </div>
              <Button
                className="mt-3"
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditingId(product.id);
                  setForm({
                    name: product.name,
                    description: product.description ?? '',
                    imageEmoji: product.imageEmoji ?? '',
                    imageUrl: product.imageUrl ?? '',
                    priceRays: product.priceRays,
                    stock: product.stock,
                    productType: product.productType,
                    status: product.status,
                  });
                }}
              >
                Редактировать
              </Button>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
