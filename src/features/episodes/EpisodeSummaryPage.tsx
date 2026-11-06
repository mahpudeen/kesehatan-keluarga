import { useState } from 'react';
import { Printer } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useFamily } from '@/features/family/FamilyContext';
import { useMembers } from '@/features/members/MembersContext';
import { useEpisodeLogs } from '@/features/daylog/hooks';
import { useMedications } from '@/features/medications/hooks';
import { Button } from '@/shared/ui/Button';
import { PageHeader } from '@/shared/ui/PageHeader';
import { todayStr } from '@/shared/lib/date';
import { useAllEpisodes } from './hooks';
import { episodeDurationDays } from './utils';
import { SummaryOverview } from './components/SummaryOverview';
import { DailyLogSummary } from './components/DailyLogSummary';
import { ClinicalSummary } from './components/ClinicalSummary';

function SummaryState({ message, backTo }: { message: string; backTo: string }) {
  return (
    <div className="flex min-h-0 flex-col">
      <PageHeader title="Ringkasan untuk dokter" backTo={backTo} />
      <p className="m-auto text-sm text-ink-muted">{message}</p>
    </div>
  );
}

export default function EpisodeSummaryPage() {
  const { episodeId = '' } = useParams<{ episodeId: string }>();
  const { family } = useFamily();
  const { members, loading: membersLoading } = useMembers();
  const [reportDate] = useState(todayStr);
  const familyId = family?.id ?? '';
  const episodesResult = useAllEpisodes(familyId);
  const logsResult = useEpisodeLogs(familyId, episodeId);
  const medicationsResult = useMedications(familyId, episodeId);
  const { data: episodes } = episodesResult;
  const { data: logs } = logsResult;
  const { data: medications } = medicationsResult;
  const episode = episodes.find((item) => item.id === episodeId);
  const member = members.find((item) => item.id === episode?.memberId);
  const backTo = `/riwayat/penyakit/${episodeId}`;

  if (!family) return null;
  if (
    membersLoading
    || episodesResult.loading
    || logsResult.loading
    || medicationsResult.loading
  ) {
    return <SummaryState message="Menyiapkan ringkasan..." backTo={backTo} />;
  }
  if (episodesResult.error || logsResult.error || medicationsResult.error) {
    return <SummaryState message="Ringkasan gagal dimuat. Coba lagi." backTo={backTo} />;
  }
  if (!episode || !member) {
    return <SummaryState message="Episode tidak ditemukan." backTo="/riwayat" />;
  }

  const effectiveEndDate = episode.endDate ?? reportDate;
  const durationDays = episodeDurationDays(episode.startDate, effectiveEndDate);

  return (
    <div className="flex min-h-0 flex-col print-report-shell">
      <PageHeader
        title="Ringkasan untuk dokter"
        backTo={`/riwayat/penyakit/${episode.id}`}
        className="print-hidden"
        right={
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            <Printer size={17} aria-hidden="true" />
            Cetak
          </Button>
        }
      />
      <article className="print-report mx-auto w-full max-w-md space-y-7 bg-surface px-5 py-6">
        <SummaryOverview
          familyName={family.name}
          member={member}
          episode={episode}
          effectiveEndDate={effectiveEndDate}
          durationDays={durationDays}
        />
        <DailyLogSummary logs={logs} />
        <ClinicalSummary visits={episode.visits ?? []} medications={medications} />
        <p className="border-t border-line pt-4 text-xs text-ink-muted">
          Ringkasan ini dibuat dari catatan keluarga dan bukan diagnosis atau pengganti
          pemeriksaan tenaga kesehatan.
        </p>
      </article>
    </div>
  );
}
