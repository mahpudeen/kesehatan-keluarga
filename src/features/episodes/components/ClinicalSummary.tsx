import { formatLocalDate } from '@/shared/lib/date';
import type { DoctorVisit } from '../types';
import type { Medication } from '@/features/medications/types';

interface ClinicalSummaryProps {
  visits: DoctorVisit[];
  medications: Medication[];
}

export function ClinicalSummary({ visits, medications }: ClinicalSummaryProps) {
  const sortedVisits = [...visits].sort((a, b) => a.date.localeCompare(b.date));
  const sortedMedications = [...medications].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );

  return (
    <>
      <section>
        <h2 className="text-base font-bold text-ink mb-3">Kunjungan dokter</h2>
        {sortedVisits.length === 0 ? (
          <p className="text-sm text-ink-muted">Belum ada kunjungan dokter tercatat.</p>
        ) : (
          <div className="space-y-3">
            {sortedVisits.map((visit) => (
              <div
                key={visit.id}
                className="border-l-2 border-primary pl-3 text-sm print-avoid-break"
              >
                <p className="font-semibold text-ink">{formatLocalDate(visit.date)}</p>
                {(visit.doctorName || visit.facility) && (
                  <p className="text-ink-muted">
                    {[visit.doctorName, visit.facility].filter(Boolean).join(' · ')}
                  </p>
                )}
                {visit.diagnosis && <p className="mt-1 text-ink">Diagnosis: {visit.diagnosis}</p>}
                {visit.note && <p className="mt-1 text-ink-muted">Catatan: {visit.note}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-bold text-ink mb-3">Obat</h2>
        {sortedMedications.length === 0 ? (
          <p className="text-sm text-ink-muted">Belum ada obat tercatat.</p>
        ) : (
          <div className="space-y-3">
            {sortedMedications.map((medication) => (
              <div
                key={medication.id}
                className="border-l-2 border-primary pl-3 text-sm print-avoid-break"
              >
                <p className="font-semibold text-ink">
                  {medication.name}{medication.dose ? ` · ${medication.dose}` : ''}
                </p>
                {medication.frequency && <p className="text-ink">{medication.frequency}</p>}
                <p className="text-ink-muted">
                  {medication.prescribedByDoctor ? 'Resep dokter' : 'Beli sendiri'} · mulai{' '}
                  {formatLocalDate(medication.startDate)}
                </p>
                {medication.note && <p className="mt-1 text-ink-muted">{medication.note}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
