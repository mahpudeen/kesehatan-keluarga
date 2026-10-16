import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFamily } from '@/features/family/FamilyContext';
import { useMembers } from '@/features/members/MembersContext';
import { addMember, archiveMember } from '@/features/members/service';
import { createInvite } from '@/features/invites/service';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { InputField, SelectField } from '@/shared/ui/Field';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { RELATION_OPTIONS } from '@/features/members/constants';
import { Users } from 'lucide-react';
import type { Member } from '@/features/members/types';
import type { Relation } from '@/features/members/types';

export default function FamilyPage() {
  const { user } = useAuth();
  const { family } = useFamily();
  const { members, activeMembers } = useMembers();

  const [name, setName] = useState('');
  const [relation, setRelation] = useState<Relation>('anak');
  const [saving, setSaving] = useState(false);

  const [archiveTarget, setArchiveTarget] = useState<Member | null>(null);

  // Invite state
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!family || !user) return null;

  const isOwner = family.ownerUid === user.uid;

  async function handleAdd() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addMember(family!.id, name.trim(), relation, members.length);
      setName('');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateInvite() {
    setInviteLoading(true);
    setInviteError('');
    setCopied(false);
    try {
      const code = await createInvite(family!.id, user!.uid);
      setInviteCode(code);
    } catch {
      setInviteError('Gagal membuat kode. Coba lagi.');
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-4 pt-4 space-y-6 max-w-md mx-auto">

        {/* Member list */}
        <section>
          <h2 className="font-semibold text-ink mb-3">Anggota keluarga</h2>

          {activeMembers.length === 0 ? (
            <EmptyState
              message="Belum ada anggota. Tambahkan anggota pertama."
              icon={<Users size={32} />}
            />
          ) : (
            <ul className="space-y-2">
              {activeMembers.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 bg-surface rounded-[var(--radius-card)] p-3 shadow-sm"
                  style={{ borderLeft: `3px solid ${m.color}` }}
                >
                  <Avatar name={m.name} color={m.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">{m.name}</p>
                    <p className="text-xs text-ink-muted capitalize">{m.relation}</p>
                  </div>
                  <button
                    id={`btn-archive-${m.id}`}
                    onClick={() => setArchiveTarget(m)}
                    className="text-xs text-ink-muted underline underline-offset-2 flex-shrink-0"
                  >
                    Arsipkan
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Add member form */}
        <section className="bg-surface rounded-[var(--radius-card)] p-4 shadow-sm space-y-3">
          <h2 className="font-semibold text-ink">Tambah anggota</h2>
          <InputField
            id="member-name"
            label="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama anggota keluarga"
          />
          <SelectField
            id="member-relation"
            label="Hubungan"
            value={relation}
            onChange={(e) => setRelation(e.target.value as Relation)}
          >
            {RELATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>
          <Button
            id="btn-add-member"
            onClick={handleAdd}
            disabled={!name.trim() || saving}
            fullWidth
          >
            {saving ? 'Menyimpan...' : 'Tambah anggota'}
          </Button>
        </section>

        {/* Invite panel (owner only) */}
        {isOwner && (
          <section className="bg-surface rounded-[var(--radius-card)] p-4 shadow-sm space-y-3">
            <div>
              <h2 className="font-semibold text-ink">Undang pasangan</h2>
              <p className="text-xs text-ink-muted mt-1">
                Buat kode sekali pakai (berlaku 24 jam), lalu kirim ke pasangan Anda.
              </p>
            </div>

            {inviteCode && (
              <div className="rounded-xl bg-primary-soft p-4 text-center space-y-2">
                <p className="font-mono text-2xl font-bold tracking-[0.3em] text-primary">
                  {inviteCode}
                </p>
                <button
                  id="btn-copy-invite"
                  onClick={async () => {
                    await navigator.clipboard.writeText(inviteCode);
                    setCopied(true);
                  }}
                  className="text-sm font-semibold text-primary underline underline-offset-2"
                >
                  {copied ? 'Tersalin! ✓' : 'Salin kode'}
                </button>
              </div>
            )}

            {inviteError && (
              <p className="text-sm text-sev-parah" role="alert">
                {inviteError}
              </p>
            )}

            <Button
              id="btn-create-invite"
              variant="secondary"
              onClick={handleCreateInvite}
              disabled={inviteLoading}
              fullWidth
            >
              {inviteLoading ? 'Membuat...' : inviteCode ? 'Buat kode baru' : 'Buat kode undangan'}
            </Button>
          </section>
        )}
      </div>

      {/* Archive confirm dialog */}
      <ConfirmDialog
        open={archiveTarget !== null}
        title="Arsipkan anggota?"
        message={`Arsipkan ${archiveTarget?.name ?? ''}? Riwayat kesehatannya tetap tersimpan.`}
        confirmLabel="Arsipkan"
        onConfirm={() => {
          if (!archiveTarget) return;
          archiveMember(family.id, archiveTarget.id);
          setArchiveTarget(null);
        }}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
