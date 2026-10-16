import type { Severity } from './types';

// Mapping severity → Tailwind token classes (single source of truth)
export const SEVERITY_CLASSES: Record<Severity, string> = {
  ringan: 'bg-sev-ringan text-ink',
  sedang: 'bg-sev-sedang text-white',
  parah: 'bg-sev-parah text-white',
};

export const SEVERITY_DOT_CLASSES: Record<Severity, string> = {
  ringan: 'bg-sev-ringan',
  sedang: 'bg-sev-sedang',
  parah: 'bg-sev-parah',
};

export const SEVERITY_CONFIG: Array<{ value: Severity; label: string }> = [
  { value: 'ringan', label: 'Ringan' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'parah', label: 'Parah' },
];
