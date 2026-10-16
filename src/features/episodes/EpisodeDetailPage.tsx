import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFamily } from '@/features/family/FamilyContext';
import { useMembers } from '@/features/members/MembersContext';
import { useAllEpisodes } from '@/features/episodes/hooks';
import { useMedications } from '@/features/medications/hooks';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Avatar } from '@/shared/ui/Avatar';
import { VisitList } from './components/VisitList';
import { VisitForm } from './components/VisitForm';
import { MedicationList } from '@/features/medications/components/MedicationList';
import { MedicationForm } from '@/features/medications/components/MedicationForm';

export default function EpisodeDetailPage() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const { family } = useFamily();
  const { members } = useMembers();

  const { data: episodes } = useAllEpisodes(family?.id ?? '');
  const episode = episodes.find((e) => e.id === episodeId);
  const { data: medications } = useMedications(family?.id ?? '', episodeId ?? '');

  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showMedForm, setShowMedForm] = useState(false);

  if (!family) return null;

  if (!episode) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-ink-muted text-sm">Episode tidak ditemukan.</p>
      </div>
    );
  }

  const member = members.find((m) => m.id === episode.memberId);

  return (
    <div className="flex flex-col min-h-0">
      <PageHeader title={episode.illness} backTo="/riwayat" />

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Episode summary */}
        <div className="px-4 pt-4 pb-4 max-w-md mx-auto">
          <div className="bg-surface rounded-[var(--radius-card)] p-4 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-3">
              {member && <Avatar name={member.name} color={member.color} size="md" />}
              <div>
                <p className="font-semibold text-ink">{member?.name ?? 'Anggota'}</p>
                <p className="text-xs text-ink-muted capitalize">{member?.relation}</p>
              </div>
              <span
                className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${
                  episode.endDate === null
                    ? 'bg-sev-parah/10 text-sev-parah'
                    : 'bg-sev-sehat/10 text-sev-sehat'
                }`}
              >
                {episode.endDate === null ? 'Berlangsung' : 'Sembuh'}
              </span>
            </div>
            <p className="text-sm text-ink-muted">
              {episode.startDate}
              {episode.endDate ? ` – ${episode.endDate}` : ' · masih berlangsung'}
            </p>
          </div>

          {/* Doctor visits */}
          <div className="mb-6">
            {showVisitForm ? (
              <VisitForm
                familyId={family.id}
                episodeId={episode.id}
                onDone={() => setShowVisitForm(false)}
              />
            ) : (
              <VisitList
                familyId={family.id}
                episodeId={episode.id}
                visits={episode.visits ?? []}
                onAddClick={() => setShowVisitForm(true)}
              />
            )}
          </div>

          {/* Medications */}
          <div>
            {showMedForm ? (
              <MedicationForm
                familyId={family.id}
                episodeId={episode.id}
                memberId={episode.memberId}
                onDone={() => setShowMedForm(false)}
              />
            ) : (
              <MedicationList
                familyId={family.id}
                medications={medications}
                onAddClick={() => setShowMedForm(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
