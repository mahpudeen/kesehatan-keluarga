import { useEffect, useEffectEvent, useRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Bottom sheet — slides up on open, traps focus, closes on backdrop tap and Escape.
 * Respects prefers-reduced-motion via global CSS.
 */
export function Sheet({ open, onClose, children, className }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleClose = useEffectEvent(onClose);

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const el = sheetRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'Tab') {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet panel */}
      <div
        ref={sheetRef}
        className={cn(
          'relative z-10 w-full max-w-md max-h-[90dvh] overflow-y-auto',
          'bg-surface rounded-t-[var(--radius-sheet)] px-5 pt-5 pb-8',
          'shadow-2xl',
          'animate-slide-up',
          className,
        )}
      >
        {/* Drag indicator */}
        <div className="mx-auto mb-4 w-10 h-1 rounded-full bg-line" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
