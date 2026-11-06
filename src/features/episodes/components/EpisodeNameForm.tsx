import { useState } from 'react';
import { updateEpisodeIllness } from '../service';
import { Button } from '@/shared/ui/Button';
import { InputField } from '@/shared/ui/Field';

interface EpisodeNameFormProps {
  familyId: string;
  episodeId: string;
  illness: string;
  onDone: () => void;
}

export function EpisodeNameForm({
  familyId,
  episodeId,
  illness,
  onDone,
}: EpisodeNameFormProps) {
  const [name, setName] = useState(illness);

  function handleSave() {
    const nextName = name.trim();
    if (!nextName) return;
    if (nextName !== illness) updateEpisodeIllness(familyId, episodeId, nextName);
    onDone();
  }

  return (
    <div
      className={
        'mb-4 space-y-3 rounded-[var(--radius-card)] border border-primary-soft '
        + 'bg-primary-soft/30 p-4'
      }
    >
      <InputField
        id="episode-illness"
        label="Nama penyakit atau keluhan"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
      />
      <div className="grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={onDone} fullWidth>
          Batal
        </Button>
        <Button onClick={handleSave} disabled={!name.trim()} fullWidth>
          Simpan perubahan
        </Button>
      </div>
    </div>
  );
}
