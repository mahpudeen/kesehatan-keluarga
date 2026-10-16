import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFamily } from '@/features/family/FamilyContext';
import { useMembers } from '@/features/members/MembersContext';
import { useDayLogs } from '@/features/daylog/hooks';
import { useOpenEpisodes } from '@/features/episodes/hooks';
import { setDayStatus, saveSickDay } from '@/features/daylog/service';
import { closeEpisode } from '@/features/episodes/service';
import { todayStr, formatLocalDate } from '@/shared/lib/date';
import { Avatar } from '@/shared/ui/Avatar';
import { SeverityBadge } from '@/shared/ui/SeverityBadge';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Users } from 'lucide-react';
import SickSheet from './components/SickSheet';
import type { Member } from '@/features/members/types';
import type { Episode } from '@/features/episodes/types';

export default function TodayPage() {
  const { user } = useAuth();
  const { family } = useFamily();
  const { activeMembers } = useMembers();
  const date = todayStr();

  const { data: logs } = useDayLogs(family?.id ?? '', date);
  const { data: openEpisodes } = useOpenEpisodes(family?.id ?? '');

  const [sickFor, setSickFor] = useState<Member | null>(null);
  const [confirmClose, setConfirmClose] = useState<{ member: Member; episode: Episode } | null>(null);

  if (!family || !user) return null;

  const prettyDate = formatLocalDate(date);

  function handleMarkSehat(memberId: string) {
    setDayStatus(family!.id, memberId, date, 'sehat', user!.uid);
  }

  function handleMarkSick(member: Member) {
    setSickFor(member);
  }

  function handleConfirmRecover() {
    if (!confirmClose) return;
    closeEpisode(family!.id, confirmClose.episode.id, date);
    setDayStatus(family!.id, confirmClose.member.id, date, 'sehat', user!.uid);
    setConfirmClose(null);
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Date header */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-ink-muted capitalize">{prettyDate}</p>
      </div>

      <div className="px-4 space-y-3 max-w-md mx-auto">
        {activeMembers.length === 0 && (
          <EmptyState
            message="Belum ada anggota. Tambahkan anggota pertama di tab Keluarga."
            icon={<Users size={36} />}
          />
        )}

        {activeMembers.map((member) => {
          const log = logs.find((l) => l.memberId === member.id);
          const status = log?.status;
          const openEp = openEpisodes.find((e) => e.memberId === member.id);

          return (
            <div
              key={member.id}
              className="bg-surface rounded-[var(--radius-card)] shadow-sm overflow-hidden"
              style={{ borderLeft: `3px solid ${member.color}` }}
            >
              {/* Member header */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <Avatar name={member.name} color={member.color} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">{member.name}</p>
                  <p className="text-xs text-ink-muted capitalize">{member.relation}</p>
                </div>
                {status === 'sakit' && log?.severity && (
                  <SeverityBadge severity={log.severity} />
                )}
                {!status && (
                  <span className="text-xs text-ink-muted">Belum dicatat</span>
                )}
              </div>

              {/* Symptoms */}
              {status === 'sakit' && log?.symptoms && log.symptoms.length > 0 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-ink-muted">{log.symptoms.join(' · ')}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                <button
                  id={`btn-sehat-${member.id}`}
                  onClick={() => handleMarkSehat(member.id)}
                  className={`rounded-[var(--radius-control)] py-4 text-base font-semibold transition-all active:scale-95 ${
                    status === 'sehat'
                      ? 'bg-sev-sehat text-white'
                      : 'bg-primary-soft text-primary'
                  }`}
                >
                  Sehat
                </button>
                <button
                  id={`btn-sakit-${member.id}`}
                  onClick={() => handleMarkSick(member)}
                  className={`rounded-[var(--radius-control)] py-4 text-base font-semibold transition-all active:scale-95 ${
                    status === 'sakit'
                      ? 'bg-sev-parah text-white'
                      : 'bg-sev-parah/10 text-sev-parah'
                  }`}
                >
                  Sakit
                </button>
              </div>

              {/* Open episode banner */}
              {openEp && (
                <div className="mx-4 mb-4 flex items-center justify-between rounded-xl bg-sev-parah/8 border border-sev-parah/20 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-sev-parah truncate">{openEp.illness}</p>
                    <p className="text-xs text-ink-muted">sejak {openEp.startDate}</p>
                  </div>
                  <button
                    id={`btn-sembuh-${member.id}`}
                    onClick={() => setConfirmClose({ member, episode: openEp })}
                    className="ml-3 flex-shrink-0 rounded-[var(--radius-control)] bg-sev-sehat px-3 py-1.5 text-xs font-semibold text-white active:scale-95 transition-all"
                  >
                    Tandai sembuh
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sick sheet */}
      <SickSheet
        open={sickFor !== null}
        member={sickFor}
        openEpisode={sickFor ? openEpisodes.find((e) => e.memberId === sickFor.id) : undefined}
        onClose={() => setSickFor(null)}
        onSave={(input) => {
          if (!sickFor) return;
          const open = openEpisodes.find((e) => e.memberId === sickFor.id);
          saveSickDay({
            familyId: family.id,
            memberId: sickFor.id,
            date,
            uid: user.uid,
            input,
            openEpisodeId: open?.id,
          });
          setSickFor(null);
        }}
      />

      {/* Confirm recovery */}
      <ConfirmDialog
        open={confirmClose !== null}
        title="Tandai sembuh?"
        message={
          confirmClose
            ? `Tandai ${confirmClose.member.name} sudah sembuh dari ${confirmClose.episode.illness}?`
            : ''
        }
        confirmLabel="Sembuh"
        onConfirm={handleConfirmRecover}
        onCancel={() => setConfirmClose(null)}
      />
    </div>
  );
}
