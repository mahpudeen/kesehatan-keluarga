import { cn } from '@/shared/lib/cn';
import { SEVERITY_LABELS } from '@/shared/constants/labels';
import type { Severity } from '@/features/daylog/types';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const badgeClasses: Record<Severity, string> = {
  ringan: 'bg-sev-ringan/20 text-amber-800',
  sedang: 'bg-sev-sedang/20 text-orange-800',
  parah: 'bg-sev-parah/20 text-red-800',
};

/**
 * Shows severity as text badge — color is never the only signal
 * (always includes the text label for a11y).
 */
export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold',
        badgeClasses[severity],
        className,
      )}
    >
      <span
        className={cn('w-2 h-2 rounded-full flex-shrink-0', {
          'bg-sev-ringan': severity === 'ringan',
          'bg-sev-sedang': severity === 'sedang',
          'bg-sev-parah': severity === 'parah',
        })}
        aria-hidden="true"
      />
      {SEVERITY_LABELS[severity]}
    </span>
  );
}
