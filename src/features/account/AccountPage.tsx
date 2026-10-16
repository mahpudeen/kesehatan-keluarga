import { signOut } from 'firebase/auth';
import { auth } from '@/shared/firebase/client';
import { useAuth } from '@/features/auth/AuthContext';
import { useFamily } from '@/features/family/FamilyContext';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { LogOut, Download } from 'lucide-react';

export default function AccountPage() {
  const { user } = useAuth();
  const { family } = useFamily();

  if (!user || !family) return null;

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
            <p className="text-xs text-ink-muted">Keluarga</p>
            <p className="font-semibold text-ink mt-0.5">{family.name}</p>
          </div>
        </div>

        {/* Export — TODO: implement JSON export */}
        <div className="bg-surface rounded-[var(--radius-card)] p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink text-sm">Ekspor data</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Unduh semua data kesehatan dalam format JSON.
              </p>
            </div>
            <Button
              id="btn-export"
              variant="secondary"
              size="sm"
              disabled
              className="flex-shrink-0"
            >
              <Download size={16} aria-hidden="true" />
              Ekspor
            </Button>
          </div>
          {/* TODO: implement JSON export of family health data */}
          <p className="mt-2 text-xs text-ink-muted italic">Fitur ini akan segera hadir.</p>
        </div>

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
