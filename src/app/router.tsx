import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './AppShell';
import { AuthGate, FamilyGate } from './gates';

const TodayPage = lazy(() => import('@/features/daylog/TodayPage'));
const HistoryPage = lazy(() => import('@/features/history/HistoryPage'));
const EpisodeDetailPage = lazy(() => import('@/features/episodes/EpisodeDetailPage'));
const EpisodeSummaryPage = lazy(() => import('@/features/episodes/EpisodeSummaryPage'));
const FamilyPage = lazy(() => import('@/features/family/FamilyPage'));
const AccountPage = lazy(() => import('@/features/account/AccountPage'));

function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <AuthGate>
      <FamilyGate>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<TodayPage />} />
              <Route path="riwayat" element={<HistoryPage />} />
              <Route path="riwayat/penyakit/:episodeId" element={<EpisodeDetailPage />} />
              <Route
                path="riwayat/penyakit/:episodeId/ringkasan"
                element={<EpisodeSummaryPage />}
              />
              <Route path="keluarga" element={<FamilyPage />} />
              <Route path="akun" element={<AccountPage />} />
            </Route>
          </Routes>
        </Suspense>
      </FamilyGate>
    </AuthGate>
  );
}
