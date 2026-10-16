import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFamily } from '@/features/family/FamilyContext';
import { useMembers } from '@/features/members/MembersContext';
import { useAllEpisodes } from '@/features/episodes/hooks';
import { useMonthLogs } from '@/features/daylog/hooks';
import { setDayStatus, saveSickDay } from '@/features/daylog/service';
import { findEpisodeForDate } from '@/features/episodes/utils';
import { todayStr } from '@/shared/lib/date';
import { Chip, Segmented } from '@/shared/ui/Chip';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Avatar } from '@/shared/ui/Avatar';
import { Stethoscope } from 'lucide-react';
import { CalendarGrid, pad } from './components/CalendarGrid';
import { DayDetailSheet } from './components/DayDetailSheet';
import { useNavigate } from 'react-router-dom';
import SickSheet from '@/features/daylog/components/SickSheet';
import type { Member } from '@/features/members/types';

export default function HistoryPage() {
  const { user } = useAuth();
  const { family } = useFamily();
  const { members, activeMembers } = useMembers();
  const navigate = useNavigate();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filterMemberId, setFilterMemberId] = useState<string>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [sickFor, setSickFor] = useState<Member | null>(null);
  const [view, setView] = useState<'kalender' | 'penyakit'>('kalender');

  const today = todayStr();

  const start = `${year}-${pad(month + 1)}-01`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;

  const { data: monthLogs } = useMonthLogs(family?.id ?? '', start, end);
  const { data: episodes } = useAllEpisodes(family?.id ?? '');

  if (!family || !user) return null;

  function handleShift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelected(null);
  }

  const sortedEpisodes = [...episodes].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* View toggle */}
      <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm border-b border-line px-4 py-3">
        <Segmented
          options={[
            { value: 'kalender', label: 'Kalender' },
            { value: 'penyakit', label: 'Penyakit' },
          ]}
          value={view}
          onChange={(v) => setView(v as 'kalender' | 'penyakit')}
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
        ) : (
          /* Episode list */
          <div className="space-y-2">
            {sortedEpisodes.length === 0 && (
              <EmptyState
                message="Belum ada riwayat penyakit."
                icon={<Stethoscope size={36} />}
              />
            )}
            {sortedEpisodes.map((ep) => {
              const member = memberMap[ep.memberId];
              return (
                <button
                  key={ep.id}
                  id={`ep-${ep.id}`}
                  onClick={() => navigate(`/riwayat/penyakit/${ep.id}`)}
                  className="w-full flex items-center gap-3 bg-surface rounded-[var(--radius-card)] p-3 shadow-sm text-left active:scale-98 transition-all"
                >
                  {member && <Avatar name={member.name} color={member.color} size="sm" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">{ep.illness}</p>
                    <p className="text-xs text-ink-muted">
                      {member?.name} · {ep.startDate}
                      {ep.endDate && ep.endDate !== ep.startDate ? ` – ${ep.endDate}` : ''}
                    </p>
                    {(ep.visits?.length ?? 0) > 0 && (
                      <p className="text-xs text-ink-muted">
                        {ep.visits?.length} kunjungan dokter
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      ep.endDate === null
                        ? 'bg-sev-parah/10 text-sev-parah'
                        : 'bg-sev-sehat/10 text-sev-sehat'
                    }`}
                  >
                    {ep.endDate === null ? 'Berlangsung' : 'Sembuh'}
                  </span>
                </button>
              );
            })}
          </div>
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
