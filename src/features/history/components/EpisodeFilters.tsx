import { Filter } from 'lucide-react';
import { SYMPTOMS } from '@/shared/constants/labels';
import { Button } from '@/shared/ui/Button';
import { InputField, SelectField } from '@/shared/ui/Field';
import type { Member } from '@/features/members/types';
import type { EpisodeFilters as EpisodeFiltersState, EpisodeStatusFilter } from '../types';
import { EMPTY_EPISODE_FILTERS } from '../episodeFilters';

interface EpisodeFiltersProps {
  filters: EpisodeFiltersState;
  members: Member[];
  today: string;
  onChange: (filters: EpisodeFiltersState) => void;
}

export function EpisodeFilters({ filters, members, today, onChange }: EpisodeFiltersProps) {
  const filterCount = [
    filters.memberId !== 'all',
    filters.status !== 'all',
    filters.symptom !== '',
    filters.startDate !== '',
    filters.endDate !== '',
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <InputField
        id="episode-search"
        type="search"
        label="Cari riwayat"
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
        placeholder="Penyakit, anggota, dokter, diagnosis..."
      />
      <details className="rounded-[var(--radius-card)] border border-line bg-surface">
        <summary
          className={
            'flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 '
            + 'text-sm font-semibold text-primary'
          }
        >
          <Filter size={17} aria-hidden="true" />
          Filter{filterCount > 0 ? ` (${filterCount})` : ''}
        </summary>
        <div className="space-y-3 border-t border-line p-3">
          <SelectField
            id="episode-member-filter"
            label="Anggota"
            value={filters.memberId}
            onChange={(event) => onChange({ ...filters, memberId: event.target.value })}
          >
            <option value="all">Semua anggota</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </SelectField>
          <SelectField
            id="episode-status-filter"
            label="Status episode"
            value={filters.status}
            onChange={(event) => onChange({
              ...filters,
              status: event.target.value as EpisodeStatusFilter,
            })}
          >
            <option value="all">Semua status</option>
            <option value="open">Berlangsung</option>
            <option value="closed">Sembuh</option>
          </SelectField>
          <SelectField
            id="episode-symptom-filter"
            label="Gejala"
            value={filters.symptom}
            onChange={(event) => onChange({ ...filters, symptom: event.target.value })}
          >
            <option value="">Semua gejala</option>
            {SYMPTOMS.map((symptom) => (
              <option key={symptom} value={symptom}>{symptom}</option>
            ))}
          </SelectField>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              id="episode-start-filter"
              type="date"
              label="Dari tanggal"
              value={filters.startDate}
              max={filters.endDate || today}
              onChange={(event) => onChange({ ...filters, startDate: event.target.value })}
            />
            <InputField
              id="episode-end-filter"
              type="date"
              label="Sampai tanggal"
              value={filters.endDate}
              min={filters.startDate || undefined}
              max={today}
              onChange={(event) => onChange({ ...filters, endDate: event.target.value })}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => onChange(EMPTY_EPISODE_FILTERS)}
          >
            Reset filter
          </Button>
        </div>
      </details>
    </div>
  );
}
