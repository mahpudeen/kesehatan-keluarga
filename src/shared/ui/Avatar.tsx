import { cn } from '@/shared/lib/cn';

interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

/** Shows the member's initial letter on their color background. */
export function Avatar({ name, color, size = 'md', className }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold text-white flex-shrink-0',
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
