import { cn } from '@/shared/lib/cn';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ label, selected = false, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium',
        'transition-colors duration-150 cursor-pointer min-h-[36px]',
        selected
          ? 'bg-primary text-white'
          : 'bg-surface border border-line text-ink-muted hover:border-primary hover:text-primary',
        className,
      )}
    >
      {label}
    </button>
  );
}

interface SegmentedProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Segmented({ options, value, onChange, className }: SegmentedProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex bg-bg rounded-[var(--radius-control)] p-1 gap-1',
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 px-4 py-1.5 rounded-[calc(var(--radius-control)-2px)] text-sm font-medium',
            'transition-all duration-150 cursor-pointer min-h-[36px]',
            value === opt.value
              ? 'bg-surface text-ink shadow-sm'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
