import { cn } from '@/shared/lib/cn';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-strong active:scale-95 disabled:opacity-40',
  secondary:
    'bg-primary-soft text-primary hover:bg-line active:scale-95 disabled:opacity-40',
  ghost:
    'bg-transparent text-ink-muted hover:bg-line active:scale-95 disabled:opacity-40',
  danger:
    'bg-sev-parah text-white hover:opacity-90 active:scale-95 disabled:opacity-40',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-sm min-h-[44px]',
  lg: 'px-5 py-3.5 text-base min-h-[52px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-control)] transition-all duration-150 cursor-pointer select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {children}
    </button>
  );
}
