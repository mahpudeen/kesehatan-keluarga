import { useState } from 'react';
import { addVisit, removeVisit, type Episode } from '../lib/episodes';
import { addMedication, deleteMedication, useMedications } from '../lib/medications';
import { todayStr } from '../lib/dateUtil';

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

export default function EpisodeDetail({
  familyId,
  episode,
  memberName,
  onClose,
}: {
  familyId: string;
  episode: Episode;
  memberName: string;
  onClose: () => void;
}) {
  const meds = useMedications(familyId, episode.id);
  const visits = [...(episode.visits ?? [])].sort((a, b) => b.date.localeCompare(a.date));

  const [showVisitForm, setShowVisitForm] = useState(false);
  const [vDate, setVDate] = useState(todayStr());
  const [vDoctor, setVDoctor] = useState('');
  const [vFacility, setVFacility] = useState('');
  const [vDiagnosis, setVDiagnosis] = useState('');
  const [vNote, setVNote] = useState('');

  const [showMedForm, setShowMedForm] = useState(false);
  const [mName, setMName] = useState('');
  const [mDose, setMDose] = useState('');
  const [mFreq, setMFreq] = useState('');
  const [mDate, setMDate] = useState(todayStr());
  const [mPrescribed, setMPrescribed] = useState(true);
  const [mNote, setMNote] = useState('');

  function saveVisit() {
    addVisit(familyId, episode.id, {
      date: vDate,
      doctorName: vDoctor.trim(),
      facility: vFacility.trim(),
      diagnosis: vDiagnosis.trim(),
      note: vNote.trim(),
    });
    setVDoctor('');
    setVFacility('');
    setVDiagnosis('');
    setVNote('');
    setShowVisitForm(false);
  }

  function saveMed() {
    if (!mName.trim()) return;
    addMedication(familyId, {
      episodeId: episode.id,
      memberId: episode.memberId,
      name: mName.trim(),
      dose: mDose.trim(),
      frequency: mFreq.trim(),
      startDate: mDate,
      prescribedByDoctor: mPrescribed,
      note: mNote.trim(),
    });
    setMName('');
    setMDose('');
    setMFreq('');
    setMNote('');
    setShowMedForm(false);
  }

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{episode.illness}</h3>
            <p className="text-sm text-gray-500">
              {memberName} · {episode.startDate}
              {episode.endDate ? ` s/d ${episode.endDate}` : ' · masih berlangsung'}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none text-gray-400">
            ×
          </button>
        </div>

        {/* Kunjungan dokter */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-medium text-gray-800">Kunjungan dokter</p>
            <button
              onClick={() => setShowVisitForm(!showVisitForm)}
              className="text-sm font-semibold text-emerald-700"
            >
              {showVisitForm ? 'Tutup' : '+ Tambah'}
            </button>
          </div>

          {visits.length === 0 && !showVisitForm && (
            <p className="text-sm text-gray-500">Belum ada kunjungan dokter.</p>
          )}

          {visits.map((v) => (
            <div key={v.id} className="mb-2 rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <p className="font-medium text-gray-800">{v.date}</p>
                <button
                  onClick={() => {
                    if (confirm('Hapus kunjungan ini?')) {
                      removeVisit(
                        familyId,
                        episode.id,
                        (episode.visits ?? []).filter((x) => x.id !== v.id),
                      );
                    }
                  }}
                  className="text-xs text-gray-400 underline"
                >
                  Hapus
                </button>
              </div>
              {v.doctorName && <p className="text-gray-600">{v.doctorName}</p>}
              {v.facility && <p className="text-gray-500">{v.facility}</p>}
              {v.diagnosis && <p className="text-gray-600">Diagnosis: {v.diagnosis}</p>}
              {v.note && <p className="text-gray-500">Catatan: {v.note}</p>}
            </div>
          ))}

          {showVisitForm && (
            <div className="space-y-2 rounded-lg border border-emerald-200 p-3">
              <input type="date" value={vDate} max={todayStr()} onChange={(e) => setVDate(e.target.value)} className={inputCls} />
              <input value={vDoctor} onChange={(e) => setVDoctor(e.target.value)} placeholder="Nama dokter" className={inputCls} />
              <input value={vFacility} onChange={(e) => setVFacility(e.target.value)} placeholder="Klinik / RS / puskesmas" className={inputCls} />
              <input value={vDiagnosis} onChange={(e) => setVDiagnosis(e.target.value)} placeholder="Diagnosis dokter" className={inputCls} />
              <input value={vNote} onChange={(e) => setVNote(e.target.value)} placeholder="Catatan (opsional)" className={inputCls} />
              <button onClick={saveVisit} className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white">
                Simpan kunjungan
              </button>
            </div>
          )}
        </div>

        {/* Obat */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-medium text-gray-800">Obat</p>
            <button
              onClick={() => setShowMedForm(!showMedForm)}
              className="text-sm font-semibold text-emerald-700"
            >
              {showMedForm ? 'Tutup' : '+ Tambah'}
            </button>
          </div>

          {meds.length === 0 && !showMedForm && (
            <p className="text-sm text-gray-500">Belum ada obat tercatat.</p>
          )}

          {meds.map((m) => (
            <div key={m.id} className="mb-2 rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <p className="font-medium text-gray-800">
                  {m.name}
                  {m.dose && <span className="font-normal text-gray-500"> · {m.dose}</span>}
                </p>
                <button
                  onClick={() => {
                    if (confirm(`Hapus obat ${m.name}?`)) deleteMedication(familyId, m.id);
                  }}
                  className="text-xs text-gray-400 underline"
                >
                  Hapus
                </button>
              </div>
              {m.frequency && <p className="text-gray-600">{m.frequency}</p>}
              <p className="text-xs text-gray-500">
                {m.prescribedByDoctor ? 'Resep dokter' : 'Beli sendiri'} · mulai {m.startDate}
              </p>
              {m.note && <p className="text-xs text-gray-500">Catatan: {m.note}</p>}
            </div>
          ))}

          {showMedForm && (
            <div className="space-y-2 rounded-lg border border-emerald-200 p-3">
              <input value={mName} onChange={(e) => setMName(e.target.value)} placeholder="Nama obat" className={inputCls} />
              <input value={mDose} onChange={(e) => setMDose(e.target.value)} placeholder="Dosis (misal 500 mg, 5 ml)" className={inputCls} />
              <input value={mFreq} onChange={(e) => setMFreq(e.target.value)} placeholder="Aturan (misal 3x sehari sesudah makan)" className={inputCls} />
              <input type="date" value={mDate} max={todayStr()} onChange={(e) => setMDate(e.target.value)} className={inputCls} />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMPrescribed(true)}
                  className={`rounded-lg py-2 text-sm font-medium ${mPrescribed ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Resep dokter
                </button>
                <button
                  onClick={() => setMPrescribed(false)}
                  className={`rounded-lg py-2 text-sm font-medium ${!mPrescribed ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Beli sendiri
                </button>
              </div>
              <input value={mNote} onChange={(e) => setMNote(e.target.value)} placeholder="Catatan (opsional)" className={inputCls} />
              <button
                onClick={saveMed}
                disabled={!mName.trim()}
                className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white disabled:opacity-40"
              >
                Simpan obat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}