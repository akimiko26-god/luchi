import { cn } from '../../utils/cn';

type RayBalanceProps = {
  balance: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'text-sm gap-1',
  md: 'text-base gap-1.5',
  lg: 'text-xl gap-2',
};

function formatRays(amount: number): string {
  return new Intl.NumberFormat('ru-RU').format(amount);
}

export function RayBalance({ balance, size = 'md', className }: RayBalanceProps) {
  return (
    <div className={cn('inline-flex items-center font-semibold text-rays-gold', sizeClasses[size], className)}>
      <span aria-hidden="true">☀</span>
      <span>{formatRays(balance)}</span>
    </div>
  );
}
