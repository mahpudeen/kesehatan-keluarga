import { useState } from 'react';
import {
  addMember,
  archiveMember,
  useMembers,
  type Relation,
} from '../lib/members';

export default function Members({ familyId }: { familyId: string }) {
  const members = useMembers(familyId);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<Relation>('saya');
  const [saving, setSaving] = useState(false);

  const active = members.filter((m) => !m.archived);

  async function handleAdd() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addMember(familyId, name.trim(), relation, members.length);
      setName('');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: string, memberName: string) {
    if (confirm(`Arsipkan ${memberName}? Riwayatnya tetap tersimpan.`)) {
      await archiveMember(familyId, id);
    }
  }

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">Anggota keluarga</h2>

      <ul className="space-y-2">
        {active.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: m.color }}
              />
              <div>
                <p className="font-medium text-gray-800">{m.name}</p>
                <p className="text-xs text-gray-500">{m.relation}</p>
              </div>
            </div>
            <button
              onClick={() => handleArchive(m.id, m.name)}
              className="text-sm text-gray-400 underline"
            >
              Arsipkan
            </button>
          </li>
        ))}
        {active.length === 0 && (
          <p className="text-sm text-gray-500">Belum ada anggota. Tambahkan di bawah.</p>
        )}
      </ul>

      <div className="mt-4 space-y-2 rounded-xl bg-white p-3 shadow-sm">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama anggota"
          className="w-full rounded-lg border border-emerald-300 px-3 py-2"
        />
        <select
          value={relation}
          onChange={(e) => setRelation(e.target.value as Relation)}
          className="w-full rounded-lg border border-emerald-300 px-3 py-2"
        >
          <option value="saya">Saya</option>
          <option value="istri">Istri</option>
          <option value="anak">Anak</option>
          <option value="lainnya">Lainnya</option>
        </select>
        <button
          onClick={handleAdd}
          disabled={!name.trim() || saving}
          className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Tambah anggota'}
        </button>
      </div>
    </section>
  );
}