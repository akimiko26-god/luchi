type Slice = { label: string; value: number };
type ActivityPoint = { date: string; deeds: number; rays: number };

const PALETTE = ['#FFB800', '#4ECDC4', '#6BCB77', '#FF6B6B', '#8B7CFF', '#1A1A2E'];

function totalOf(items: Slice[]): number {
  return items.reduce((sum, item) => sum + item.value, 0);
}

export function DonutChart({ items, title }: { items: Slice[]; title: string }) {
  const total = totalOf(items) || 1;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 140 140" className="h-36 w-36">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#F5F5F5" strokeWidth="16" />
          {items.map((item, index) => {
            const length = (item.value / total) * circumference;
            const dash = `${length} ${circumference - length}`;
            const current = offset;
            offset += length;
            return (
              <circle
                key={item.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={PALETTE[index % PALETTE.length]}
                strokeWidth="16"
                strokeDasharray={dash}
                strokeDashoffset={-current}
                transform="rotate(-90 70 70)"
              />
            );
          })}
          <text x="70" y="74" textAnchor="middle" fill="#1A1A2E" fontSize="18" fontWeight="700">
            {totalOf(items)}
          </text>
        </svg>
        <ul className="space-y-1 text-sm">
          {items.map((item, index) => (
            <li key={item.label} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: PALETTE[index % PALETTE.length] }}
              />
              {item.label}: {item.value}
            </li>
          ))}
          {items.length === 0 && <li className="text-gray-900/50">Нет данных</li>}
        </ul>
      </div>
    </div>
  );
}

export function BarChart({ items, title }: { items: Slice[]; title: string }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  background: PALETTE[index % PALETTE.length],
                }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-900/50">Нет данных</p>}
      </div>
    </div>
  );
}

export function LineChart({ points, title }: { points: ActivityPoint[]; title: string }) {
  const width = 560;
  const height = 180;
  const pad = 28;
  const max = Math.max(...points.map((point) => Math.max(point.deeds, point.rays / 10)), 1);

  function x(index: number): number {
    return pad + (index * (width - pad * 2)) / Math.max(points.length - 1, 1);
  }
  function y(value: number): number {
    return height - pad - (value / max) * (height - pad * 2);
  }
  const deedsPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.deeds)}`)
    .join(' ');
  const raysPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.rays / 10)}`)
    .join(' ');

  return (
    <div className="rounded-2xl bg-gradient-to-br from-sun/30 via-white to-sky/20 p-6 shadow-sm">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <path d={deedsPath} fill="none" stroke="#4ECDC4" strokeWidth="3" />
        <path d={raysPath} fill="none" stroke="#FFB800" strokeWidth="3" />
        {points.map((point, index) => (
          <circle key={point.date} cx={x(index)} cy={y(point.deeds)} r="3.5" fill="#4ECDC4" />
        ))}
      </svg>
      <p className="mt-2 text-xs text-gray-900/60">бирюзовый — отчёты · золотой — Лучи (÷10)</p>
    </div>
  );
}
