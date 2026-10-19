import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/shared/firebase/client';
import { fireAndForget } from '@/shared/firebase/fireAndForget';
import { useAuth } from '@/features/auth/AuthContext';
import { useFamily } from '@/features/family/FamilyContext';
import { updateFamilyName } from '@/features/family/service';
import { DataTransferPanel } from './components/DataTransferPanel';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { InputField } from '@/shared/ui/Field';
import { LogOut } from 'lucide-react';

export default function AccountPage() {
  const { user } = useAuth();
  const { family } = useFamily();
  const [editingFamily, setEditingFamily] = useState(false);
  const [familyName, setFamilyName] = useState('');

  if (!user || !family) return null;

  const familyId = family.id;
  const currentFamilyName = family.name;
  const isOwner = family.ownerUid === user.uid;

  function startEditingFamily() {
    setFamilyName(currentFamilyName);
    setEditingFamily(true);
  }

  function cancelEditingFamily() {
    setEditingFamily(false);
    setFamilyName('');
  }

  function handleUpdateFamily() {
    const name = familyName.trim();
    if (!name) return;
    if (name !== currentFamilyName) {
      fireAndForget(updateFamilyName(familyId, name), 'update-family-name');
    }
    cancelEditingFamily();
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-4 pt-4 space-y-4 max-w-md mx-auto">

        {/* User card */}
        <div className="bg-surface rounded-[var(--radius-card)] p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? 'Foto profil'}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <Avatar
                name={user.displayName ?? user.email ?? 'U'}
                color="var(--color-primary)"
                size="lg"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink truncate">
                {user.displayName ?? 'Pengguna'}
              </p>
              <p className="text-xs text-ink-muted truncate">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-line pt-3">
            {editingFamily ? (
              <div className="space-y-3">
                <InputField
                  id="family-name"
                  label="Nama keluarga"
                  value={familyName}
                  onChange={(event) => setFamilyName(event.target.value)}
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="ghost" onClick={cancelEditingFamily} fullWidth>
                    Batal
                  </Button>
                  <Button
                    id="btn-update-family"
                    onClick={handleUpdateFamily}
                    disabled={!familyName.trim()}
                    fullWidth
                  >
                    Simpan perubahan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-11 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-ink-muted">Keluarga</p>
                  <p className="font-semibold text-ink mt-0.5 truncate">{family.name}</p>
                </div>
                {isOwner && (
                  <button
                    id="btn-edit-family"
                    onClick={startEditingFamily}
                    className="min-h-11 px-2 text-sm font-semibold text-primary"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <DataTransferPanel familyId={familyId} familyName={currentFamilyName} canImport={isOwner} />

        {/* Sign out */}
        <Button
          id="btn-sign-out"
          variant="ghost"
          fullWidth
          onClick={() => signOut(auth)}
          className="text-sev-parah hover:bg-sev-parah/10"
        >
          <LogOut size={16} aria-hidden="true" />
          Keluar dari akun
        </Button>
      </div>
    </div>
  );
}
