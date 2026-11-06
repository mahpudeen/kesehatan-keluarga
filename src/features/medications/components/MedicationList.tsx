import { useState } from 'react';
import { deleteMedication } from '@/features/medications/service';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Pill } from 'lucide-react';
import type { Medication } from '@/features/medications/types';

interface MedicationListProps {
  familyId: string;
  medications: Medication[];
  onAddClick: () => void;
  onEditClick: (medication: Medication) => void;
}

export function MedicationList({
  familyId,
  medications,
  onAddClick,
  onEditClick,
}: MedicationListProps) {
  const [confirmDelete, setConfirmDelete] = useState<Medication | null>(null);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-ink">Obat</h2>
        <Button id="btn-add-med" variant="ghost" size="sm" onClick={onAddClick}>
          + Tambah
        </Button>
      </div>

      {medications.length === 0 ? (
        <EmptyState message="Belum ada obat tercatat." icon={<Pill size={28} />} />
      ) : (
        <div className="space-y-2">
          {medications.map((m) => (
            <div key={m.id} className="bg-bg rounded-[var(--radius-card)] p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">
                    {m.name}
                    {m.dose && (
                      <span className="font-normal text-ink-muted"> · {m.dose}</span>
                    )}
                  </p>
                  {m.frequency && <p className="text-ink-muted text-xs mt-0.5">{m.frequency}</p>}
                  <p className="text-ink-muted text-xs mt-0.5">
                    {m.prescribedByDoctor ? 'Resep dokter' : 'Beli sendiri'} · mulai {m.startDate}
                  </p>
                  {m.note && <p className="text-ink-muted text-xs mt-0.5">{m.note}</p>}
                </div>
                <div className="flex flex-shrink-0 items-center">
                  <button
                    onClick={() => onEditClick(m)}
                    className="min-h-11 px-2 text-xs font-semibold text-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(m)}
                    className="min-h-11 px-2 text-xs text-ink-muted"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus obat?"
        message={`Hapus ${confirmDelete?.name ?? ''} dari daftar obat?`}
        confirmLabel="Hapus"
        danger
        onConfirm={() => {
          if (!confirmDelete) return;
          deleteMedication(familyId, confirmDelete.id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  );
}
