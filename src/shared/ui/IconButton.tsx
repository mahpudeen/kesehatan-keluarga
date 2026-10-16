import { cn } from '@/shared/lib/cn';
import type { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // required for accessibility
}

export function IconButton({ label, className, children, ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center w-11 h-11 rounded-full text-ink-muted',
        'hover:bg-line active:scale-90 transition-all duration-150 cursor-pointer',
        'disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  );
}
