import { useState } from 'react';
import { useMembers, type Member } from '../lib/members';
import {
  saveSickDay,
  setDayStatus,
  useDayLogs,
  type SickInput,
} from '../lib/dayLogs';
import { closeEpisode, useOpenEpisodes } from '../lib/episodes';
import { todayStr } from '../lib/dateUtil';
import SickForm from './SickForm';

export default function Today({ familyId, uid }: { familyId: string; uid: string }) {
  const date = todayStr();
  const members = useMembers(familyId).filter((m) => !m.archived);
  const logs = useDayLogs(familyId, date);
  const openEpisodes = useOpenEpisodes(familyId);
  const [sickFor, setSickFor] = useState<Member | null>(null);

  const prettyDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800">Hari ini</h2>
      <p className="mb-3 text-sm text-gray-500">{prettyDate}</p>

      <div className="space-y-3">
        {members.map((m) => {
          const log = logs.find((l) => l.memberId === m.id);
          const status = log?.status;
          const openEp = openEpisodes.find((e) => e.memberId === m.id);
          return (
            <div key={m.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
                <p className="font-medium text-gray-800">{m.name}</p>
                {!status && (
                  <span className="ml-auto text-xs text-gray-400">belum dicatat</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDayStatus(familyId, m.id, date, 'sehat', uid)}
                  className={`rounded-xl py-4 text-lg font-semibold active:scale-95 ${
                    status === 'sehat'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  Sehat
                </button>
                <button
                  onClick={() => setSickFor(m)}
                  className={`rounded-xl py-4 text-lg font-semibold active:scale-95 ${
                    status === 'sakit'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  Sakit
                </button>
              </div>

              {status === 'sakit' && (
                <p className="mt-3 text-sm text-gray-600">
                  {log?.severity && <b className="capitalize">{log.severity}</b>}
                  {log?.symptoms && log.symptoms.length > 0 && (
                    <> · {log.symptoms.join(', ')}</>
                  )}
                </p>
              )}

              {openEp && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-red-50 p-3">
                  <p className="text-sm text-red-700">
                    <b>{openEp.illness}</b>
                    <span className="block text-xs text-red-500">sejak {openEp.startDate}</span>
                  </p>
                  <button
                    onClick={() => {
                      if (confirm(`Tandai ${m.name} sudah sembuh dari ${openEp.illness}?`)) {
                        closeEpisode(familyId, openEp.id, date);
                        setDayStatus(familyId, m.id, date, 'sehat', uid);
                      }
                    }}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white active:scale-95"
                  >
                    Sembuh
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {members.length === 0 && (
          <p className="text-sm text-gray-500">Tambahkan anggota dulu di bawah.</p>
        )}
      </div>

      {sickFor && (
        <SickForm
          memberName={sickFor.name}
          openEpisode={openEpisodes.find((e) => e.memberId === sickFor.id)}
          onClose={() => setSickFor(null)}
          onSave={(input: SickInput) => {
            const open = openEpisodes.find((e) => e.memberId === sickFor.id);
            saveSickDay(familyId, sickFor.id, date, uid, input, open?.id);
            setSickFor(null);
          }}
        />
      )}
    </section>
  );
}