import { useRef, useState, type ChangeEvent } from 'react';
import { Download, Upload } from 'lucide-react';
import { parseFamilyBackup } from '../backup';
import { exportFamilyData, importFamilyData } from '../service';
import type { FamilyBackup } from '../types';
import { todayStr } from '@/shared/lib/date';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

interface DataTransferPanelProps {
  familyId: string;
  familyName: string;
  canImport: boolean;
}

function downloadBackup(backup: FamilyBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `catatan-kesehatan-${todayStr()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function DataTransferPanel({ familyId, familyName, canImport }: DataTransferPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [pendingBackup, setPendingBackup] = useState<FamilyBackup | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleExport() {
    setBusy('export');
    setError('');
    setMessage('');
    try {
      downloadBackup(await exportFamilyData(familyId, familyName));
      setMessage('Data berhasil diekspor.');
    } catch {
      setError('Gagal mengekspor data. Periksa koneksi lalu coba lagi.');
    } finally {
      setBusy(null);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setMessage('');
    if (file.size > 10 * 1024 * 1024) {
      setError('File terlalu besar. Maksimal 10 MB.');
      return;
    }
    try {
      setPendingBackup(parseFamilyBackup(await file.text()));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'File backup tidak valid.');
    }
  }

  function confirmImport() {
    if (!pendingBackup) return;
    setBusy('import');
    try {
      const count = importFamilyData(familyId, pendingBackup);
      setPendingBackup(null);
      setMessage(`${count} dokumen dijadwalkan untuk diimpor.`);
    } catch {
      setError('Gagal memulai impor data. Coba lagi.');
    } finally {
      setBusy(null);
    }
  }

  const importCount = pendingBackup
    ? pendingBackup.members.length
      + pendingBackup.dayLogs.length
      + pendingBackup.episodes.length
      + pendingBackup.medications.length
    : 0;

  return (
    <>
      <section className="bg-surface rounded-[var(--radius-card)] p-4 shadow-sm space-y-4">
        <div>
          <p className="font-semibold text-ink text-sm">Cadangkan data</p>
          <p className="text-xs text-ink-muted mt-0.5">
            Ekspor seluruh data kesehatan ke JSON atau pulihkan dari file backup.
          </p>
        </div>
        <div className={canImport ? 'grid grid-cols-2 gap-3' : undefined}>
          <Button
            id="btn-export"
            variant="secondary"
            onClick={handleExport}
            disabled={busy !== null}
            fullWidth
          >
            <Download size={18} aria-hidden="true" />
            {busy === 'export' ? 'Mengekspor...' : 'Ekspor'}
          </Button>
          {canImport && (
            <Button
              id="btn-import"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy !== null}
              fullWidth
            >
              <Upload size={18} aria-hidden="true" />
              Impor
            </Button>
          )}
        </div>
        {canImport && (
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            className="sr-only"
            aria-label="Pilih file backup JSON"
          />
        )}
        {message && <p className="text-xs text-primary" role="status">{message}</p>}
        {error && <p className="text-xs text-sev-parah" role="alert">{error}</p>}
      </section>

      <ConfirmDialog
        open={pendingBackup !== null}
        title="Impor data keluarga?"
        message={
          `Nama keluarga dan ${importCount} dokumen akan digabungkan. `
          + 'Dokumen dengan ID yang sama akan ditimpa, tetapi data lain tidak dihapus.'
        }
        confirmLabel="Impor data"
        onConfirm={confirmImport}
        onCancel={() => setPendingBackup(null)}
      />
    </>
  );
}
