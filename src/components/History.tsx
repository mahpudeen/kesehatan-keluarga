import { useState } from 'react';
import { useMembers, type Member } from '../lib/members';
import {
  saveSickDay,
  setDayStatus,
  useMonthLogs,
  type Severity,
} from '../lib/dayLogs';
import { useAllEpisodes, type Episode } from '../lib/episodes';
import { todayStr } from '../lib/dateUtil';
import SickForm from './SickForm';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const SEVERITY_CLS: Record<Severity, string> = {
  ringan: 'bg-yellow-300 text-gray-900',
  sedang: 'bg-orange-500 text-white',
  parah: 'bg-red-600 text-white',
};

const pad = (n: number) => String(n).padStart(2, '0');
export default function History({ familyId, uid }: { familyId: string; uid: string }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [sickFor, setSickFor] = useState<Member | null>(null);
  const episodes = useAllEpisodes(familyId);

  const allMembers = useMembers(familyId);
  const activeMembers = allMembers.filter((m) => !m.archived);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // minggu mulai Senin
  const start = `${year}-${pad(month + 1)}-01`;
  const end = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;

  const monthLogs = useMonthLogs(familyId, start, end);
  const logs = monthLogs.filter((l) => filter === 'all' || l.memberId === filter);

  const byDate: Record<string, typeof logs> = {};
  for (const l of logs) (byDate[l.date] ??= []).push(l);

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelected(null);
  }

  const memberOf = (id: string) => allMembers.find((m) => m.id === id);
  function findEpisode(memberId: string, date: string): Episode | undefined {
    return episodes.find(
      (e) =>
        e.memberId === memberId &&
        e.startDate <= date &&
        (e.endDate === null || e.endDate >= date),
    );
  }
  // const selectedLogs = selected ? byDate[selected] ?? [] : [];

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">Riwayat</h2>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1 text-sm ${
            filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'
          }`}
        >
          Semua
        </button>
        {activeMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => setFilter(m.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === m.id ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => shift(-1)} className="px-3 py-1 text-xl text-gray-600">
            ‹
          </button>
          <p className="font-semibold text-gray-800">
            {MONTHS[month]} {year}
          </p>
          <button onClick={() => shift(1)} className="px-3 py-1 text-xl text-gray-600">
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
          {WEEKDAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
            const dayLogs = byDate[dateStr] ?? [];
            const single = filter !== 'all' ? dayLogs[0] : undefined;

            let cls = 'bg-gray-100 text-gray-400';
            if (single) {
              cls =
                single.status === 'sehat'
                  ? 'bg-emerald-200 text-emerald-900'
                  : SEVERITY_CLS[single.severity ?? 'ringan'];
            }

            return (
              <button
                key={dateStr}
                onClick={() => setSelected(dateStr)}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm ${cls} ${
                  selected === dateStr ? 'ring-2 ring-gray-800' : ''
                }`}
              >
                <span>{day}</span>
                {filter === 'all' && (
                  <span className="mt-0.5 flex gap-0.5">
                    {dayLogs
                      .filter((l) => l.status === 'sakit')
                      .map((l) => (
                        <span
                          key={l.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: memberOf(l.memberId)?.color ?? '#999' }}
                        />
                      ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>🟩 Sehat</span>
          <span>🟨 Ringan</span>
          <span>🟧 Sedang</span>
          <span>🟥 Parah</span>
          <span>⬜ Belum dicatat</span>
        </div>
        {filter === 'all' && (
          <p className="mt-1 text-xs text-gray-400">
            Mode "Semua": titik berwarna = anggota yang sakit hari itu. Pilih satu anggota
            untuk melihat warna tingkat sakit.
          </p>
        )}
      </div>

      {selected && (
        <div className="mt-3 rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-3 font-semibold text-gray-800">
            {new Date(selected + 'T00:00:00').toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          {selected > todayStr() ? (
            <p className="text-sm text-gray-500">Tanggal ini belum tiba.</p>
          ) : (
            <div className="space-y-3">
              {activeMembers.map((m) => {
                const log = monthLogs.find((l) => l.memberId === m.id && l.date === selected);
                return (
                  <div key={m.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
                      <p className="text-sm font-medium text-gray-800">{m.name}</p>
                      <span className="ml-auto text-xs text-gray-400">
                        {log ? log.status : 'belum dicatat'}
                        {log?.severity ? ` (${log.severity})` : ''}
                      </span>
                    </div>
                    {log?.symptoms && log.symptoms.length > 0 && (
                      <p className="mb-2 text-xs text-gray-500">{log.symptoms.join(', ')}</p>
                    )}
                    {log?.note && <p className="mb-2 text-xs text-gray-500">Catatan: {log.note}</p>}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDayStatus(familyId, m.id, selected, 'sehat', uid)}
                        className={`rounded-lg py-2 text-sm font-semibold ${
                          log?.status === 'sehat'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        Sehat
                      </button>
                      <button
                        onClick={() => setSickFor(m)}
                        className={`rounded-lg py-2 text-sm font-semibold ${
                          log?.status === 'sakit'
                            ? 'bg-red-500 text-white'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        Sakit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {sickFor && selected && (
        <SickForm
          memberName={sickFor.name}
          openEpisode={findEpisode(sickFor.id, selected)}
          onClose={() => setSickFor(null)}
          onSave={(input) => {
            const ep = findEpisode(sickFor.id, selected);
            saveSickDay(
              familyId,
              sickFor.id,
              selected,
              uid,
              input,
              ep?.id,
              selected === todayStr() ? null : selected,
            );
            setSickFor(null);
          }}
        />
      )}
    </section>
  );
}