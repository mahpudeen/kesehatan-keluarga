import { useState } from 'react';
import { createInvite } from '../lib/invites';

export default function Invite({ familyId, uid }: { familyId: string; uid: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      setCode(await createInvite(familyId, uid));
    } catch (e) {
      console.error(e);
      setError('Gagal membuat kode. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">Undang pasangan</h2>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm text-gray-600">
          Buat kode sekali pakai (berlaku 24 jam), lalu kirim ke pasangan Anda.
        </p>

        {code && (
          <div className="mb-3 rounded-lg bg-emerald-50 p-3 text-center">
            <p className="font-mono text-2xl font-bold tracking-widest text-emerald-700">
              {code}
            </p>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(code);
                setCopied(true);
              }}
              className="mt-2 text-sm font-semibold text-emerald-700 underline"
            >
              {copied ? 'Tersalin!' : 'Salin kode'}
            </button>
          </div>
        )}

        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Membuat...' : code ? 'Buat kode baru' : 'Buat kode undangan'}
        </button>
      </div>
    </section>
  );
}