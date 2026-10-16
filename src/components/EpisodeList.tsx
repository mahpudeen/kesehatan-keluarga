import { useState } from 'react';
import { useMembers } from '../lib/members';
import { useAllEpisodes } from '../lib/episodes';
import EpisodeDetail from './EpisodeDetail';

export default function EpisodeList({ familyId }: { familyId: string }) {
  const members = useMembers(familyId);
  const episodes = useAllEpisodes(familyId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...episodes].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const selected = episodes.find((e) => e.id === selectedId);
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? 'Anggota';

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">Riwayat penyakit</h2>

      <div className="space-y-2">
        {sorted.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelectedId(e.id)}
            className="flex w-full items-center justify-between rounded-xl bg-white p-3 text-left shadow-sm"
          >
            <div>
              <p className="font-medium text-gray-800">{e.illness}</p>
              <p className="text-xs text-gray-500">
                {nameOf(e.memberId)} · {e.startDate}
                {e.endDate && e.endDate !== e.startDate ? ` s/d ${e.endDate}` : ''}
              </p>
              <p className="text-xs text-gray-400">
                {(e.visits?.length ?? 0) > 0 ? `${e.visits?.length} kunjungan dokter` : 'tanpa dokter'}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                e.endDate === null ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {e.endDate === null ? 'Berlangsung' : 'Sembuh'}
            </span>
          </button>
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-gray-500">Belum ada riwayat penyakit.</p>
        )}
      </div>

      {selected && (
        <EpisodeDetail
          familyId={familyId}
          episode={selected}
          memberName={nameOf(selected.memberId)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}