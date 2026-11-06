import { cn } from '@/shared/lib/cn';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
  id: string;
  error?: string;
  className?: string;
}

// Input Field
interface InputFieldProps
  extends FieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {}

export function InputField({ label, id, error, className, ...props }: InputFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={cn(
          'w-full rounded-[var(--radius-control)] border px-3 py-2.5 text-sm text-ink',
          'bg-surface placeholder:text-ink-muted',
          'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          error ? 'border-sev-parah' : 'border-line focus:border-primary',
        )}
      />
      {error && <p className="text-xs text-sev-parah">{error}</p>}
    </div>
  );
}

// Textarea Field
interface TextareaFieldProps
  extends FieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {}

export function TextareaField({ label, id, error, className, ...props }: TextareaFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        {...props}
        className={cn(
          'w-full rounded-[var(--radius-control)] border px-3 py-2.5 text-sm text-ink',
          'bg-surface placeholder:text-ink-muted resize-none',
          'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          error ? 'border-sev-parah' : 'border-line focus:border-primary',
        )}
      />
      {error && <p className="text-xs text-sev-parah">{error}</p>}
    </div>
  );
}

// Select Field
interface SelectFieldProps
  extends FieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  children: React.ReactNode;
}

export function SelectField({ label, id, error, className, children, ...props }: SelectFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className={cn(
          'w-full rounded-[var(--radius-control)] border px-3 py-2.5 text-sm text-ink',
          'bg-surface',
          'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          error ? 'border-sev-parah' : 'border-line focus:border-primary',
        )}
      >
        {children}
      </select>
      {error && <p className="text-xs text-sev-parah">{error}</p>}
    </div>
  );
}
