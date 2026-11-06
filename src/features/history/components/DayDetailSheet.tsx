import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/Button';
import { Avatar } from '@/shared/ui/Avatar';
import { SeverityBadge } from '@/shared/ui/SeverityBadge';
import { formatLocalDate } from '@/shared/lib/date';
import type { DayLog } from '@/features/daylog/types';
import type { Member } from '@/features/members/types';

interface DayDetailSheetProps {
  open: boolean;
  date: string;
  allLogs: DayLog[];
  activeMembers: Member[];
  today: string;
  onClose: () => void;
  onMarkSehat: (memberId: string) => void;
  onMarkSick: (member: Member) => void;
}

export function DayDetailSheet({
  open,
  date,
  allLogs,
  activeMembers,
  today,
  onClose,
  onMarkSehat,
  onMarkSick,
}: DayDetailSheetProps) {
  const isFuture = date > today;

  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="text-base font-semibold text-ink mb-4 capitalize">
        {formatLocalDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </h2>

      {isFuture ? (
        <p className="text-sm text-ink-muted text-center py-6">Tanggal ini belum tiba.</p>
      ) : (
        <div className="space-y-3">
          {activeMembers.map((member) => {
            const log = allLogs.find((l) => l.memberId === member.id && l.date === date);

            return (
              <div
                key={member.id}
                className="flex flex-col gap-3 pb-3 border-b border-line last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} color={member.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{member.name}</p>
                    {log?.symptoms && log.symptoms.length > 0 && (
                      <p className="text-xs text-ink-muted truncate">{log.symptoms.join(', ')}</p>
                    )}
                  </div>
                  {log?.severity && <SeverityBadge severity={log.severity} />}
                  {!log && <span className="text-xs text-ink-muted">Belum dicatat</span>}
                  {log?.status === 'sehat' && (
                    <span className="text-xs font-medium text-sev-sehat">Sehat</span>
                  )}
                </div>

                {log?.note && (
                  <p className="text-xs text-ink-muted pl-11">Catatan: {log.note}</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    id={`hist-sehat-${member.id}`}
                    variant={log?.status === 'sehat' ? 'primary' : 'secondary'}
                    size="sm"
                    fullWidth
                    onClick={() => onMarkSehat(member.id)}
                  >
                    Sehat
                  </Button>
                  <Button
                    id={`hist-sakit-${member.id}`}
                    variant={log?.status === 'sakit' ? 'danger' : 'ghost'}
                    size="sm"
                    fullWidth
                    onClick={() => onMarkSick(member)}
                  >
                    Sakit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}
