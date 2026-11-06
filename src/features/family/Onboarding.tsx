import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/shared/firebase/client';
import { createFamily } from '@/features/family/service';
import { joinFamily } from '@/features/invites/service';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/shared/ui/Button';
import { InputField } from '@/shared/ui/Field';
import { Segmented } from '@/shared/ui/Chip';

export default function Onboarding() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!user || !name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await createFamily(name.trim(), user.uid);
    } catch {
      setError('Gagal membuat keluarga. Coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!user || !code.trim()) return;
    setBusy(true);
    setError('');
    try {
      await joinFamily(code, user.uid);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal bergabung.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6 bg-bg">
      <div className="text-center">
        <h1 className="text-xl font-bold text-ink">Mulai</h1>
        <p className="text-sm text-ink-muted mt-1">Bergabung ke keluarga yang ada atau buat baru</p>
      </div>

      <div className="w-full max-w-sm space-y-5">
        <Segmented
          options={[
            { value: 'join', label: 'Gabung' },
            { value: 'create', label: 'Buat baru' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as 'join' | 'create')}
          className="w-full"
        />

        {mode === 'join' ? (
          <div className="space-y-4">
            <InputField
              id="invite-code"
              label="Kode undangan"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: ABCD1234EF"
              autoCapitalize="characters"
              autoComplete="off"
              className="font-mono tracking-widest text-center"
            />
            <Button id="btn-join" onClick={handleJoin} disabled={!code.trim() || busy} fullWidth size="lg">
              {busy ? 'Memproses...' : 'Gabung ke keluarga'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <InputField
              id="family-name"
              label="Nama keluarga"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Keluarga Saya"
            />
            <Button id="btn-create" onClick={handleCreate} disabled={!name.trim() || busy} fullWidth size="lg">
              {busy ? 'Menyimpan...' : 'Buat keluarga'}
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-sev-parah text-center" role="alert">
            {error}
          </p>
        )}
      </div>

      <button
        onClick={() => signOut(auth)}
        className="text-sm text-ink-muted underline underline-offset-2"
      >
        Keluar dari akun
      </button>
    </div>
  );
}
