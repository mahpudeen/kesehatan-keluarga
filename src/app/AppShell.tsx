import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/shared/ui/BottomNav';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useLocation } from 'react-router-dom';
import { NAV_LABELS } from '@/shared/constants/labels';

const PAGE_TITLES: Record<string, string> = {
  '/': NAV_LABELS.today,
  '/riwayat': NAV_LABELS.history,
  '/keluarga': NAV_LABELS.family,
  '/akun': NAV_LABELS.account,
};

export default function AppShell() {
  const { pathname } = useLocation();
  // Episode detail page has its own PageHeader with back button
  const isDetailPage = pathname.startsWith('/riwayat/penyakit/');
  const title = PAGE_TITLES[pathname] ?? '';

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      {/* Page header (not shown on detail pages which have their own) */}
      {!isDetailPage && title && (
        <PageHeader title={title} />
      )}

      {/* Page content — scrollable, leaves room for bottom nav */}
      <main className="flex flex-col flex-1 pb-[calc(56px+env(safe-area-inset-bottom))] min-h-0">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      {!isDetailPage && <BottomNav />}
    </div>
  );
}
