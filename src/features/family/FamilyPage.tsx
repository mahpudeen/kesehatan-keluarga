import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFamily } from '@/features/family/FamilyContext';
import { useMembers } from '@/features/members/MembersContext';
import {
  addMember,
  archiveMember,
  restoreMember,
  updateMember,
} from '@/features/members/service';
import { ArchivedMemberList } from '@/features/members/ArchivedMemberList';
import { createInvite } from '@/features/invites/service';
import { fireAndForget } from '@/shared/firebase/fireAndForget';
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
  const [editTarget, setEditTarget] = useState<Member | null>(null);

  const [archiveTarget, setArchiveTarget] = useState<Member | null>(null);

  // Invite state
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!family || !user) return null;

  const familyId = family.id;
  const uid = user.uid;
  const isOwner = family.ownerUid === user.uid;
  const archivedMembers = members.filter((member) => member.archived);

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

  function handleEdit(member: Member) {
    setEditTarget(member);
    setName(member.name);
    setRelation(member.relation);
  }

  function cancelEdit() {
    setEditTarget(null);
    setName('');
    setRelation('anak');
  }

  function handleUpdate() {
    if (!editTarget || !name.trim()) return;
    fireAndForget(
      updateMember(familyId, editTarget.id, { name: name.trim(), relation }),
      'update-member',
    );
    cancelEdit();
  }

  async function handleCreateInvite() {
    setInviteLoading(true);
    setInviteError('');
    setCopied(false);
    try {
      const code = await createInvite(familyId, uid);
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
              message={
                archivedMembers.length > 0
                  ? 'Tidak ada anggota aktif. Pulihkan anggota di bawah ini.'
                  : 'Belum ada anggota. Tambahkan anggota pertama.'
              }
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
                  <div className="flex flex-shrink-0 items-center">
                    <button
                      id={`btn-edit-${m.id}`}
                      onClick={() => handleEdit(m)}
                      className="min-h-11 px-2 text-xs font-semibold text-primary"
                    >
                      Edit
                    </button>
                    <button
                      id={`btn-archive-${m.id}`}
                      onClick={() => setArchiveTarget(m)}
                      className="min-h-11 px-2 text-xs text-ink-muted"
                    >
                      Arsipkan
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <ArchivedMemberList
          members={archivedMembers}
          onRestore={(member) => {
            fireAndForget(restoreMember(familyId, member.id), 'restore-member');
          }}
        />

        {/* Add member form */}
        <section className="bg-surface rounded-[var(--radius-card)] p-4 shadow-sm space-y-3">
          <h2 className="font-semibold text-ink">
            {editTarget ? 'Edit anggota' : 'Tambah anggota'}
          </h2>
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
          <div className={editTarget ? 'grid grid-cols-2 gap-3' : undefined}>
            {editTarget && (
              <Button variant="ghost" onClick={cancelEdit} fullWidth>
                Batal
              </Button>
            )}
            <Button
              id={editTarget ? 'btn-update-member' : 'btn-add-member'}
              onClick={editTarget ? handleUpdate : handleAdd}
              disabled={!name.trim() || saving}
              fullWidth
            >
              {saving
                ? 'Menyimpan...'
                : editTarget
                  ? 'Simpan perubahan'
                  : 'Tambah anggota'}
            </Button>
          </div>
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
          archiveMember(familyId, archiveTarget.id);
          setArchiveTarget(null);
        }}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
