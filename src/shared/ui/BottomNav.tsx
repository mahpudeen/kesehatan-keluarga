import { NavLink } from 'react-router-dom';
import { CalendarDays, Heart, Users, User } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { NAV_LABELS } from '@/shared/constants/labels';

const tabs = [
  { to: '/', label: NAV_LABELS.today, icon: Heart, exact: true },
  { to: '/riwayat', label: NAV_LABELS.history, icon: CalendarDays, exact: false },
  { to: '/keluarga', label: NAV_LABELS.family, icon: Users, exact: false },
  { to: '/akun', label: NAV_LABELS.account, icon: User, exact: false },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="safe-bottom fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-line"
    >
      <ul className="flex max-w-md mx-auto">
        {tabs.map(({ to, label, icon: Icon, exact }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={exact}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-h-[56px] w-full',
                  'transition-colors duration-150',
                  isActive ? 'text-primary' : 'text-ink-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-transform duration-150"
                    aria-hidden="true"
                  />
                  <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
