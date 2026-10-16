import { useState } from 'react';
import { todayStr } from '@/shared/lib/date';
import { addMedication } from '@/features/medications/service';
import { Button } from '@/shared/ui/Button';
import { InputField } from '@/shared/ui/Field';

interface MedicationFormProps {
  familyId: string;
  episodeId: string;
  memberId: string;
  onDone: () => void;
}

function useMedicationForm() {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [freq, setFreq] = useState('');
  const [date, setDate] = useState(todayStr());
  const [prescribed, setPrescribed] = useState(true);
  const [note, setNote] = useState('');

  function reset() {
    setName('');
    setDose('');
    setFreq('');
    setDate(todayStr());
    setPrescribed(true);
    setNote('');
  }

  return { name, setName, dose, setDose, freq, setFreq, date, setDate, prescribed, setPrescribed, note, setNote, reset };
}

export function MedicationForm({ familyId, episodeId, memberId, onDone }: MedicationFormProps) {
  const form = useMedicationForm();

  function handleSave() {
    if (!form.name.trim()) return;
    addMedication(familyId, {
      episodeId,
      memberId,
      name: form.name.trim(),
      dose: form.dose.trim(),
      frequency: form.freq.trim(),
      startDate: form.date,
      prescribedByDoctor: form.prescribed,
      note: form.note.trim(),
    });
    form.reset();
    onDone();
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-primary-soft bg-primary-soft/30 p-4">
      <InputField
        id="med-name"
        label="Nama obat"
        value={form.name}
        onChange={(e) => form.setName(e.target.value)}
        placeholder="Paracetamol, Amoxicillin..."
      />
      <InputField
        id="med-dose"
        label="Dosis"
        value={form.dose}
        onChange={(e) => form.setDose(e.target.value)}
        placeholder="500 mg, 5 ml..."
      />
      <InputField
        id="med-freq"
        label="Aturan pakai"
        value={form.freq}
        onChange={(e) => form.setFreq(e.target.value)}
        placeholder="3x sehari sesudah makan"
      />
      <InputField
        id="med-date"
        label="Mulai dikonsumsi"
        type="date"
        value={form.date}
        max={todayStr()}
        onChange={(e) => form.setDate(e.target.value)}
      />

      {/* Prescription toggle */}
      <fieldset>
        <legend className="text-sm font-medium text-ink mb-2">Jenis obat</legend>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => form.setPrescribed(true)}
            className={`rounded-[var(--radius-control)] py-2 text-sm font-medium transition-colors ${
              form.prescribed
                ? 'bg-primary text-white'
                : 'bg-bg text-ink-muted border border-line'
            }`}
          >
            Resep dokter
          </button>
          <button
            type="button"
            onClick={() => form.setPrescribed(false)}
            className={`rounded-[var(--radius-control)] py-2 text-sm font-medium transition-colors ${
              !form.prescribed
                ? 'bg-primary text-white'
                : 'bg-bg text-ink-muted border border-line'
            }`}
          >
            Beli sendiri
          </button>
        </div>
      </fieldset>

      <InputField
        id="med-note"
        label="Catatan (opsional)"
        value={form.note}
        onChange={(e) => form.setNote(e.target.value)}
        placeholder="Catatan tambahan..."
      />

      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone} fullWidth size="sm">
          Batal
        </Button>
        <Button
          id="btn-save-med"
          onClick={handleSave}
          disabled={!form.name.trim()}
          fullWidth
          size="sm"
        >
          Simpan obat
        </Button>
      </div>
    </div>
  );
}
