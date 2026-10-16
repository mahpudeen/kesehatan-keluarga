import { useState } from 'react';
import { todayStr } from '@/shared/lib/date';
import { addVisit } from '@/features/episodes/service';
import { Button } from '@/shared/ui/Button';
import { InputField } from '@/shared/ui/Field';
import type { DoctorVisit } from '@/features/episodes/types';

interface VisitFormProps {
  familyId: string;
  episodeId: string;
  onDone: () => void;
}

function useVisitForm() {
  const [date, setDate] = useState(todayStr());
  const [doctor, setDoctor] = useState('');
  const [facility, setFacility] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [note, setNote] = useState('');

  function reset() {
    setDate(todayStr());
    setDoctor('');
    setFacility('');
    setDiagnosis('');
    setNote('');
  }

  return { date, setDate, doctor, setDoctor, facility, setFacility, diagnosis, setDiagnosis, note, setNote, reset };
}

export function VisitForm({ familyId, episodeId, onDone }: VisitFormProps) {
  const form = useVisitForm();

  function handleSave() {
    const visit: Omit<DoctorVisit, 'id'> = {
      date: form.date,
      doctorName: form.doctor.trim(),
      facility: form.facility.trim(),
      diagnosis: form.diagnosis.trim(),
      note: form.note.trim(),
    };
    addVisit(familyId, episodeId, visit);
    form.reset();
    onDone();
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-primary-soft bg-primary-soft/30 p-4">
      <InputField
        id="visit-date"
        label="Tanggal kunjungan"
        type="date"
        value={form.date}
        max={todayStr()}
        onChange={(e) => form.setDate(e.target.value)}
      />
      <InputField
        id="visit-doctor"
        label="Nama dokter"
        value={form.doctor}
        onChange={(e) => form.setDoctor(e.target.value)}
        placeholder="Dr. ..."
      />
      <InputField
        id="visit-facility"
        label="Fasilitas kesehatan"
        value={form.facility}
        onChange={(e) => form.setFacility(e.target.value)}
        placeholder="Klinik / RS / Puskesmas"
      />
      <InputField
        id="visit-diagnosis"
        label="Diagnosis dokter"
        value={form.diagnosis}
        onChange={(e) => form.setDiagnosis(e.target.value)}
        placeholder="Diagnosis..."
      />
      <InputField
        id="visit-note"
        label="Catatan (opsional)"
        value={form.note}
        onChange={(e) => form.setNote(e.target.value)}
        placeholder="Catatan tambahan..."
      />
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone} fullWidth size="sm">
          Batal
        </Button>
        <Button id="btn-save-visit" onClick={handleSave} fullWidth size="sm">
          Simpan kunjungan
        </Button>
      </div>
    </div>
  );
}
