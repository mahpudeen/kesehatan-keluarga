import { useState } from 'react';
import { subDays } from 'date-fns';
import { useAuth } from '@/features/auth/AuthContext';
import { useFamily } from '@/features/family/FamilyContext';
import { useMembers } from '@/features/members/MembersContext';
import { useAllEpisodes } from '@/features/episodes/hooks';
import { useDateRangeLogs, useMonthLogs, useSymptomLogs } from '@/features/daylog/hooks';
import { setDayStatus, saveSickDay } from '@/features/daylog/service';
import { findEpisodeForDate } from '@/features/episodes/utils';
import { todayStr } from '@/shared/lib/date';
import { Chip, Segmented } from '@/shared/ui/Chip';
import { CalendarGrid, pad } from './components/CalendarGrid';
import { DayDetailSheet } from './components/DayDetailSheet';
import { InsightsView } from './components/InsightsView';
import { EpisodeFilters } from './components/EpisodeFilters';
import { EpisodeHistoryList } from './components/EpisodeHistoryList';
import {
  EMPTY_EPISODE_FILTERS,
  filterEpisodes,
  hasEpisodeFilters,
} from './episodeFilters';
import { useNavigate } from 'react-router-dom';
import SickSheet from '@/features/daylog/components/SickSheet';
import type { Member } from '@/features/members/types';

type HistoryView = 'kalender' | 'penyakit' | 'insight';

export default function HistoryPage() {
  const { user } = useAuth();
  const { family } = useFamily();
  const { members, activeMembers } = useMembers();
  const navigate = useNavigate();

  const [currentDate] = useState(() => new Date());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());
  const [filterMemberId, setFilterMemberId] = useState<string>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [sickFor, setSickFor] = useState<Member | null>(null);
  const [view, setView] = useState<HistoryView>('kalender');
  const [episodeFilters, setEpisodeFilters] = useState(EMPTY_EPISODE_FILTERS);

  const today = todayStr(currentDate);
  const insightStart = todayStr(subDays(currentDate, 89));

  const start = `${year}-${pad(month + 1)}-01`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;

  const { data: monthLogs } = useMonthLogs(family?.id ?? '', start, end);
  const { data: episodes } = useAllEpisodes(family?.id ?? '');
  const insightLogsResult = useDateRangeLogs(
    family?.id ?? '',
    insightStart,
    today,
    view === 'insight',
  );
  const symptomLogsResult = useSymptomLogs(
    family?.id ?? '',
    episodeFilters.symptom,
    view === 'penyakit',
  );

  if (!family || !user) return null;

  function handleShift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelected(null);
  }

  const symptomEpisodeIds = new Set(
    symptomLogsResult.data.flatMap((log) => log.episodeId ? [log.episodeId] : []),
  );
  const filteredEpisodes = filterEpisodes(
    episodes,
    members,
    episodeFilters,
    symptomEpisodeIds,
    today,
  );

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* View toggle */}
      <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm border-b border-line px-4 py-3">
        <Segmented
          options={[
            { value: 'kalender', label: 'Kalender' },
            { value: 'penyakit', label: 'Penyakit' },
            { value: 'insight', label: 'Insight' },
          ]}
          value={view}
          onChange={(v) => setView(v as HistoryView)}
          className="w-full"
        />
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-md mx-auto">
        {view === 'kalender' ? (
          <>
            {/* Member filter chips */}
            <div className="flex flex-wrap gap-2">
              <Chip
                label="Semua"
                selected={filterMemberId === 'all'}
                onClick={() => setFilterMemberId('all')}
              />
              {activeMembers.map((m) => (
                <Chip
                  key={m.id}
                  label={m.name}
                  selected={filterMemberId === m.id}
                  onClick={() => setFilterMemberId(m.id)}
                />
              ))}
            </div>

            <CalendarGrid
              year={year}
              month={month}
              logs={monthLogs}
              filterMemberId={filterMemberId}
              members={members}
              selected={selected}
              onSelectDate={setSelected}
              onShift={handleShift}
              today={today}
            />
          </>
        ) : view === 'penyakit' ? (
          <div className="space-y-4">
            <EpisodeFilters
              filters={episodeFilters}
              members={members}
              today={today}
              onChange={setEpisodeFilters}
            />
            {symptomLogsResult.error ? (
              <p className="py-8 text-center text-sm text-sev-parah">
                Filter gejala gagal dimuat.
              </p>
            ) : (
              <EpisodeHistoryList
                episodes={filteredEpisodes}
                members={members}
                filtered={hasEpisodeFilters(episodeFilters)}
                loading={symptomLogsResult.loading}
                onOpen={(id) => navigate(`/riwayat/penyakit/${id}`)}
              />
            )}
          </div>
        ) : (
          <InsightsView
            logs={insightLogsResult.data}
            episodes={episodes}
            members={members}
            today={today}
            loading={insightLogsResult.loading}
            error={insightLogsResult.error}
          />
        )}
      </div>

      {/* Day detail sheet */}
      <DayDetailSheet
        open={selected !== null}
        date={selected ?? today}
        allLogs={monthLogs}
        activeMembers={activeMembers}
        today={today}
        onClose={() => setSelected(null)}
        onMarkSehat={(memberId) => {
          setDayStatus(family.id, memberId, selected!, 'sehat', user.uid);
          setSelected(null);
        }}
        onMarkSick={(member) => {
          setSickFor(member);
        }}
      />

      {/* Sick sheet for history editing */}
      <SickSheet
        open={sickFor !== null}
        member={sickFor}
        openEpisode={
          sickFor && selected
            ? findEpisodeForDate(episodes, sickFor.id, selected)
            : undefined
        }
        onClose={() => setSickFor(null)}
        onSave={(input) => {
          if (!sickFor || !selected) return;
          const ep = findEpisodeForDate(episodes, sickFor.id, selected);
          saveSickDay({
            familyId: family.id,
            memberId: sickFor.id,
            date: selected,
            uid: user.uid,
            input,
            openEpisodeId: ep?.id,
            newEpisodeEndDate: selected === today ? null : selected,
          });
          setSickFor(null);
          setSelected(null);
        }}
      />
    </div>
  );
}
