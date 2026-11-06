import { cn } from '@/shared/lib/cn';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ message, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-10 text-center',
        className,
      )}
      role="status"
    >
      {icon && (
        <span className="text-line" aria-hidden="true">
          {icon}
        </span>
      )}
      <p className="text-sm text-ink-muted max-w-[22ch]">{message}</p>
    </div>
  );
}
