import { Sheet } from '@/shared/ui/Sheet';
import { Button } from '@/shared/ui/Button';
import { Chip } from '@/shared/ui/Chip';
import { InputField, TextareaField } from '@/shared/ui/Field';
import { SYMPTOMS } from '@/shared/constants/labels';
import { SEVERITY_CONFIG } from '@/features/daylog/constants';
import { cn } from '@/shared/lib/cn';
import { useState } from 'react';
import type { Severity, SickInput } from '@/features/daylog/types';
import type { Episode } from '@/features/episodes/types';
import type { Member } from '@/features/members/types';

interface SickSheetProps {
  open: boolean;
  member: Member | null;
  openEpisode?: Episode;
  onClose: () => void;
  onSave: (input: SickInput) => void;
}

export default function SickSheet({ open, member, openEpisode, onClose, onSave }: SickSheetProps) {
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [illness, setIllness] = useState('');
  const [note, setNote] = useState('');

  function reset() {
    setSeverity(null);
    setSymptoms([]);
    setIllness('');
    setNote('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSave() {
    if (!severity || (!openEpisode && !illness.trim())) return;
    onSave({
      severity,
      symptoms,
      illness: openEpisode ? openEpisode.illness : illness.trim(),
      note: note.trim(),
    });
    reset();
  }

  function toggleSymptom(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  const canSave = severity !== null && (openEpisode || illness.trim());

  return (
    <Sheet open={open} onClose={handleClose}>
      <h2 className="text-lg font-semibold text-ink mb-4">
        {member?.name} sakit
      </h2>

      {openEpisode ? (
        <div className="mb-4 rounded-xl bg-sev-parah/8 border border-sev-parah/20 px-3 py-2.5">
          <p className="text-sm font-semibold text-sev-parah">{openEpisode.illness}</p>
          <p className="text-xs text-ink-muted">Melanjutkan sakit sejak {openEpisode.startDate}</p>
        </div>
      ) : (
        <InputField
          id="illness-name"
          label="Sakit apa?"
          value={illness}
          onChange={(e) => setIllness(e.target.value)}
          placeholder="Misal: Flu, Demam, Tipes"
          className="mb-4"
        />
      )}

      {/* Severity */}
      <fieldset className="mb-4">
        <legend className="text-sm font-medium text-ink mb-2">Tingkat keparahan</legend>
        <div className="grid grid-cols-3 gap-2">
          {SEVERITY_CONFIG.map((lvl) => (
            <button
              key={lvl.value}
              type="button"
              onClick={() => setSeverity(lvl.value)}
              className={cn(
                'rounded-[var(--radius-control)] py-3 font-semibold text-sm transition-all active:scale-95',
                severity === lvl.value
                  ? {
                      ringan: 'bg-sev-ringan text-ink',
                      sedang: 'bg-sev-sedang text-white',
                      parah: 'bg-sev-parah text-white',
                    }[lvl.value]
                  : 'bg-bg text-ink-muted border border-line',
              )}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Symptoms */}
      <fieldset className="mb-4">
        <legend className="text-sm font-medium text-ink mb-2">Gejala</legend>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <Chip
              key={s}
              label={s}
              selected={symptoms.includes(s)}
              onClick={() => toggleSymptom(s)}
            />
          ))}
        </div>
      </fieldset>

      <TextareaField
        id="sick-note"
        label="Catatan (opsional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Tambahkan catatan..."
        rows={2}
        className="mb-5"
      />

      <div className="grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={handleClose} fullWidth>
          Batal
        </Button>
        <Button
          id="btn-save-sick"
          variant="danger"
          onClick={handleSave}
          disabled={!canSave}
          fullWidth
        >
          Simpan
        </Button>
      </div>
    </Sheet>
  );
}
