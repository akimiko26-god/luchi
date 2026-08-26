import { Button, RayBalance } from '@luchi/ui';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              ☀
            </span>
            <span className="text-xl font-bold">ЛУЧИ</span>
          </a>
          <nav className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-sky underline">
              Войти
            </a>
            <RayBalance balance={0} />
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          Делай добро — получай <span className="text-rays-gold">Лучи</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-900/70">
          Социальная сеть, где ценность измеряется не лайками, а реальными подтверждёнными
          полезными действиями.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="rays" size="lg" href="/register">
            Начать
          </Button>
          <Button variant="secondary" size="lg" href="/login">
            Войти
          </Button>
          <Button variant="ghost" size="lg" href="/feed">
            Кабинет
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-16 md:grid-cols-3">
        {[
          { icon: '🌿', title: 'Добрые дела', text: 'Выполняй задания и получай подтверждение' },
          { icon: '☀', title: 'Лучи', text: 'Внутренняя валюта за реальный вклад' },
          { icon: '🎁', title: 'Магазин', text: 'Обменивай Лучи на товары и сертификаты' },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl" aria-hidden="true">
              {item.icon}
            </div>
            <h2 className="mb-2 text-lg font-semibold">{item.title}</h2>
            <p className="text-gray-900/70">{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
