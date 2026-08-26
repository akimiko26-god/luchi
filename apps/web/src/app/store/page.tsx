'use client';

import { Button, RayBalance } from '@luchi/ui';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { api, mediaUrl } from '../../lib/api';

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageEmoji: string | null;
  imageUrl: string | null;
  priceRays: number;
  stock: number;
  productType: string;
};

type Order = {
  id: string;
  status: string;
  totalRays: number;
  createdAt: string;
  items: Array<{ name: string; emoji: string | null }>;
};

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load(): Promise<void> {
    const [catalog, myOrders] = await Promise.all([
      api<Product[]>('/store/products'),
      api<Order[]>('/store/orders/me'),
    ]);
    setProducts(catalog);
    setOrders(myOrders);
  }

  useEffect(() => {
    void load();
  }, []);

  async function buy(productId: string): Promise<void> {
    setMessage(null);
    try {
      const result = await api<{ productName: string; totalRays: number }>('/store/orders', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      setMessage(`Куплено: ${result.productName} за ${result.totalRays} ☀`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не удалось купить');
    }
  }

  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-bold">Магазин</h1>
      <p className="mb-6 text-gray-900/70">Обменивайте Лучи на товары, сертификаты и поддержку фондов.</p>
      {message && <p className="mb-4 text-sm font-medium">{message}</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {mediaUrl(product.imageUrl) ? (
              <img src={mediaUrl(product.imageUrl) ?? ''} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-24 items-center justify-center text-4xl">{product.imageEmoji}</div>
            )}
            <div className="p-5">
            <h2 className="mt-2 font-semibold">{product.name}</h2>
            <p className="mt-1 text-sm text-gray-900/70">{product.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <RayBalance balance={product.priceRays} />
              <Button type="button" variant="rays" size="sm" onClick={() => void buy(product.id)}>
                Купить
              </Button>
            </div>
            </div>
          </article>
        ))}
      </div>
      <h2 className="mb-3 mt-10 text-xl font-semibold">Мои покупки</h2>
      <ul className="space-y-2">
        {orders.map((order) => (
          <li key={order.id} className="rounded-xl bg-white p-4 shadow-sm">
            {order.items.map((item) => item.name).join(', ')} · {order.totalRays} ☀ · {order.status}
          </li>
        ))}
        {orders.length === 0 && <li className="text-sm text-gray-900/60">Пока нет покупок</li>}
      </ul>
    </AppShell>
  );
}
