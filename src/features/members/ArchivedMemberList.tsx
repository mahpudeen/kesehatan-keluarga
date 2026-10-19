import { RELATION_LABELS } from '@/shared/constants/labels';
import { Avatar } from '@/shared/ui/Avatar';
import type { Member } from './types';

interface ArchivedMemberListProps {
  members: Member[];
  onRestore: (member: Member) => void;
}

export function ArchivedMemberList({ members, onRestore }: ArchivedMemberListProps) {
  if (members.length === 0) return null;

  return (
    <section>
      <div className="mb-3">
        <h2 className="font-semibold text-ink">Anggota diarsipkan</h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Pulihkan anggota agar muncul kembali di pencatatan harian.
        </p>
      </div>
      <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface px-3 shadow-sm">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 py-2">
            <Avatar name={member.name} color={member.color} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{member.name}</p>
              <p className="text-xs text-ink-muted">{RELATION_LABELS[member.relation]}</p>
            </div>
            <button
              id={`btn-restore-${member.id}`}
              onClick={() => onRestore(member)}
              className="min-h-11 flex-shrink-0 px-2 text-xs font-semibold text-primary"
            >
              Pulihkan
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
