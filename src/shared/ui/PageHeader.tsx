import { cn } from '@/shared/lib/cn';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  right?: ReactNode;
  className?: string;
}

export function PageHeader({ title, backTo, right, className }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex items-center gap-2 px-4 h-14',
        'bg-surface/90 backdrop-blur-sm border-b border-line',
        className,
      )}
    >
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          aria-label="Kembali"
          className="flex items-center justify-center w-9 h-9 -ml-1 rounded-full hover:bg-bg transition-colors"
        >
          <ChevronLeft size={20} className="text-ink-muted" />
        </button>
      )}
      <h1 className="flex-1 text-base font-semibold text-ink truncate">{title}</h1>
      {right && <div className="flex items-center">{right}</div>}
    </header>
  );
}
