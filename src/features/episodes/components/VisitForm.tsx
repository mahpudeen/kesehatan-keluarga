import { useState } from 'react';
import { todayStr } from '@/shared/lib/date';
import { addVisit, updateVisit } from '@/features/episodes/service';
import { Button } from '@/shared/ui/Button';
import { InputField } from '@/shared/ui/Field';
import type { DoctorVisit } from '@/features/episodes/types';

interface VisitFormProps {
  familyId: string;
  episodeId: string;
  visits: DoctorVisit[];
  visit?: DoctorVisit;
  onDone: () => void;
}

function useVisitForm(visit?: DoctorVisit) {
  const [date, setDate] = useState(visit?.date ?? todayStr());
  const [doctor, setDoctor] = useState(visit?.doctorName ?? '');
  const [facility, setFacility] = useState(visit?.facility ?? '');
  const [diagnosis, setDiagnosis] = useState(visit?.diagnosis ?? '');
  const [note, setNote] = useState(visit?.note ?? '');

  return {
    date,
    setDate,
    doctor,
    setDoctor,
    facility,
    setFacility,
    diagnosis,
    setDiagnosis,
    note,
    setNote,
  };
}

export function VisitForm({ familyId, episodeId, visits, visit, onDone }: VisitFormProps) {
  const form = useVisitForm(visit);

  function handleSave() {
    const visitInput: Omit<DoctorVisit, 'id'> = {
      date: form.date,
      doctorName: form.doctor.trim(),
      facility: form.facility.trim(),
      diagnosis: form.diagnosis.trim(),
      note: form.note.trim(),
    };
    if (visit) {
      updateVisit({
        familyId,
        episodeId,
        visits,
        visit: { id: visit.id, ...visitInput },
      });
    } else {
      addVisit(familyId, episodeId, visitInput);
    }
    onDone();
  }

  return (
    <div
      className="space-y-3 rounded-[var(--radius-card)] border border-primary-soft bg-primary-soft/30 p-4"
    >
      <h2 className="font-semibold text-ink">
        {visit ? 'Edit kunjungan dokter' : 'Tambah kunjungan dokter'}
      </h2>
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
          {visit ? 'Simpan perubahan' : 'Simpan kunjungan'}
        </Button>
      </div>
    </div>
  );
}
