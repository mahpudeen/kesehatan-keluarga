import { useState } from 'react';
import type { Severity, SickInput } from '../lib/dayLogs';
import type { Episode } from '../lib/episodes';

const SYMPTOMS = [
  'Demam', 'Batuk', 'Pilek', 'Sakit tenggorokan', 'Sakit kepala',
  'Mual/muntah', 'Diare', 'Ruam', 'Nyeri badan', 'Lainnya',
];

const LEVELS: { value: Severity; label: string; cls: string }[] = [
  { value: 'ringan', label: 'Ringan', cls: 'bg-yellow-400 text-gray-900' },
  { value: 'sedang', label: 'Sedang', cls: 'bg-orange-500 text-white' },
  { value: 'parah', label: 'Parah', cls: 'bg-red-600 text-white' },
];

export default function SickForm({
  memberName,
  openEpisode,
  onSave,
  onClose,
}: {
  memberName: string;
  openEpisode?: Episode;
  onSave: (input: SickInput) => void;
  onClose: () => void;
}) {
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [illness, setIllness] = useState('');
  const [note, setNote] = useState('');

  const canSave = severity !== null && (openEpisode || illness.trim());

  function toggle(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-800">{memberName} sakit</h3>

        {openEpisode ? (
          <p className="mt-1 rounded-lg bg-red-50 p-2 text-sm text-red-700">
            Melanjutkan sakit: <b>{openEpisode.illness}</b> (sejak {openEpisode.startDate})
          </p>
        ) : (
          <input
            value={illness}
            onChange={(e) => setIllness(e.target.value)}
            placeholder="Sakit apa? (misal: Flu, Demam, Tipes)"
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        )}

        <p className="mt-4 mb-2 text-sm font-medium text-gray-700">Tingkat</p>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => setSeverity(l.value)}
              className={`rounded-xl py-3 font-semibold ${
                severity === l.value ? l.cls : 'bg-gray-100 text-gray-600'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <p className="mt-4 mb-2 text-sm font-medium text-gray-700">Gejala</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <button
              key={s}
              onClick={() => toggle(s)}
              className={`rounded-full px-3 py-1 text-sm ${
                symptoms.includes(s)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan (opsional)"
          rows={2}
          className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="rounded-xl bg-gray-100 py-3 text-gray-700">
            Batal
          </button>
          <button
            disabled={!canSave}
            onClick={() =>
              severity &&
              onSave({
                severity,
                symptoms,
                illness: openEpisode ? openEpisode.illness : illness.trim(),
                note: note.trim(),
              })
            }
            className="rounded-xl bg-red-500 py-3 font-semibold text-white disabled:opacity-40"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}