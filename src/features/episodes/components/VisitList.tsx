import { useState } from 'react';
import { removeVisit } from '@/features/episodes/service';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Stethoscope } from 'lucide-react';
import type { DoctorVisit } from '@/features/episodes/types';

interface VisitListProps {
  familyId: string;
  episodeId: string;
  visits: DoctorVisit[];
  onAddClick: () => void;
  onEditClick: (visit: DoctorVisit) => void;
}

export function VisitList({
  familyId,
  episodeId,
  visits,
  onAddClick,
  onEditClick,
}: VisitListProps) {
  const [confirmDelete, setConfirmDelete] = useState<DoctorVisit | null>(null);

  const sorted = [...visits].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-ink">Kunjungan dokter</h2>
        <Button id="btn-add-visit" variant="ghost" size="sm" onClick={onAddClick}>
          + Tambah
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          message="Belum ada kunjungan dokter."
          icon={<Stethoscope size={28} />}
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((v) => (
            <div key={v.id} className="bg-bg rounded-[var(--radius-card)] p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-ink">{v.date}</p>
                <div className="flex items-center">
                  <button
                    onClick={() => onEditClick(v)}
                    className="min-h-11 px-2 text-xs font-semibold text-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(v)}
                    className="min-h-11 px-2 text-xs text-ink-muted"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              {v.doctorName && <p className="text-ink-muted">{v.doctorName}</p>}
              {v.facility && <p className="text-ink-muted text-xs">{v.facility}</p>}
              {v.diagnosis && <p className="text-ink text-xs mt-1">Diagnosis: {v.diagnosis}</p>}
              {v.note && <p className="text-ink-muted text-xs mt-1">{v.note}</p>}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus kunjungan?"
        message="Data kunjungan ini akan dihapus permanen."
        confirmLabel="Hapus"
        danger
        onConfirm={() => {
          if (!confirmDelete) return;
          removeVisit(familyId, episodeId, visits.filter((x) => x.id !== confirmDelete.id));
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  );
}
