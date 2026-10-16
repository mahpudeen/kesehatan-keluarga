import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createFamily } from '../lib/family';
import { joinFamily } from '../lib/invites';

export default function Onboarding({ uid }: { uid: string }) {
  const [mode, setMode] = useState<'create' | 'join'>('join');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setBusy(true);
    setError('');
    try {
      await createFamily(name.trim(), uid);
    } catch (e) {
      console.error(e);
      setError('Gagal membuat keluarga.');
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    setBusy(true);
    setError('');
    try {
      await joinFamily(code, uid);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Gagal bergabung.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-emerald-50 p-6">
      <h1 className="text-xl font-bold text-emerald-700">Mulai</h1>

      <div className="grid w-full max-w-sm grid-cols-2 gap-2">
        <button
          onClick={() => setMode('join')}
          className={`rounded-lg py-2 font-medium ${
            mode === 'join' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'
          }`}
        >
          Gabung
        </button>
        <button
          onClick={() => setMode('create')}
          className={`rounded-lg py-2 font-medium ${
            mode === 'create' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'
          }`}
        >
          Buat baru
        </button>
      </div>

      {mode === 'join' ? (
        <div className="w-full max-w-sm space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Kode undangan"
            autoCapitalize="characters"
            className="w-full rounded-lg border border-emerald-300 px-4 py-3 text-center font-mono tracking-widest"
          />
          <button
            onClick={handleJoin}
            disabled={!code.trim() || busy}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Memproses...' : 'Gabung ke keluarga'}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama keluarga, misal: Keluarga Saya"
            className="w-full rounded-lg border border-emerald-300 px-4 py-3"
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim() || busy}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Menyimpan...' : 'Buat keluarga'}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button onClick={() => signOut(auth)} className="text-sm text-gray-500 underline">
        Keluar
      </button>
    </div>
  );
}