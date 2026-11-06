import type {
  BackupTimestamp,
  DayLogBackup,
  DoctorVisitBackup,
  EpisodeBackup,
  FamilyBackup,
  MedicationBackup,
  MemberBackup,
} from './types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const RELATIONS = new Set(['saya', 'istri', 'suami', 'anak', 'lainnya']);
const STATUSES = new Set(['sehat', 'sakit']);
const SEVERITIES = new Set(['ringan', 'sedang', 'parah']);

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} tidak valid.`);
  }
  return value as Record<string, unknown>;
}

function string(value: unknown, label: string): string {
  if (typeof value !== 'string') throw new Error(`${label} tidak valid.`);
  return value;
}

function date(value: unknown, label: string): string {
  const parsed = string(value, label);
  if (!DATE_PATTERN.test(parsed)) throw new Error(`${label} harus berformat YYYY-MM-DD.`);
  return parsed;
}

function id(value: unknown, label: string): string {
  const parsed = string(value, label);
  if (!parsed || parsed.includes('/')) throw new Error(`${label} tidak valid.`);
  return parsed;
}

function number(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} tidak valid.`);
  }
  return value;
}

function timestamp(value: unknown, label: string): BackupTimestamp | null {
  if (value === null) return null;
  const data = object(value, label);
  const seconds = number(data.seconds, `${label}.seconds`);
  const nanoseconds = number(data.nanoseconds, `${label}.nanoseconds`);
  if (
    !Number.isInteger(seconds)
    || !Number.isInteger(nanoseconds)
    || nanoseconds < 0
    || nanoseconds >= 1_000_000_000
  ) {
    throw new Error(`${label} tidak valid.`);
  }
  return {
    seconds,
    nanoseconds,
  };
}

function array<T>(value: unknown, label: string, parse: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) throw new Error(`${label} tidak valid.`);
  return value.map(parse);
}

function parseMember(value: unknown): MemberBackup {
  const data = object(value, 'Anggota');
  const relation = string(data.relation, 'Hubungan anggota');
  if (!RELATIONS.has(relation)) throw new Error('Hubungan anggota tidak valid.');
  if (typeof data.archived !== 'boolean') throw new Error('Status arsip anggota tidak valid.');
  return {
    id: id(data.id, 'ID anggota'),
    name: string(data.name, 'Nama anggota'),
    relation,
    color: string(data.color, 'Warna anggota'),
    archived: data.archived,
    order: number(data.order, 'Urutan anggota'),
  };
}

function parseDayLog(value: unknown): DayLogBackup {
  const data = object(value, 'Catatan harian');
  const status = string(data.status, 'Status harian');
  if (!STATUSES.has(status)) throw new Error('Status harian tidak valid.');
  const severity = data.severity === undefined ? undefined : string(data.severity, 'Keparahan');
  if (severity && !SEVERITIES.has(severity)) throw new Error('Keparahan tidak valid.');
  const symptoms = data.symptoms === undefined
    ? undefined
    : array(data.symptoms, 'Gejala', (item) => string(item, 'Gejala'));
  return {
    id: id(data.id, 'ID catatan harian'),
    memberId: id(data.memberId, 'ID anggota catatan'),
    date: date(data.date, 'Tanggal catatan'),
    status,
    ...(severity ? { severity } : {}),
    ...(symptoms ? { symptoms } : {}),
    ...(data.note === undefined ? {} : { note: string(data.note, 'Catatan') }),
    ...(data.episodeId === undefined ? {} : { episodeId: id(data.episodeId, 'ID episode') }),
    updatedBy: string(data.updatedBy, 'Pengubah catatan'),
    updatedAt: timestamp(data.updatedAt, 'Waktu pembaruan'),
  };
}

function parseVisit(value: unknown): DoctorVisitBackup {
  const data = object(value, 'Kunjungan dokter');
  return {
    id: id(data.id, 'ID kunjungan'),
    date: date(data.date, 'Tanggal kunjungan'),
    doctorName: string(data.doctorName, 'Nama dokter'),
    facility: string(data.facility, 'Fasilitas kesehatan'),
    diagnosis: string(data.diagnosis, 'Diagnosis'),
    note: string(data.note, 'Catatan kunjungan'),
  };
}

function parseEpisode(value: unknown): EpisodeBackup {
  const data = object(value, 'Episode');
  return {
    id: id(data.id, 'ID episode'),
    memberId: id(data.memberId, 'ID anggota episode'),
    illness: string(data.illness, 'Nama penyakit'),
    startDate: date(data.startDate, 'Tanggal mulai episode'),
    endDate: data.endDate === null ? null : date(data.endDate, 'Tanggal selesai episode'),
    visits: array(data.visits, 'Kunjungan dokter', parseVisit),
    createdAt: timestamp(data.createdAt, 'Waktu pembuatan episode'),
  };
}

function parseMedication(value: unknown): MedicationBackup {
  const data = object(value, 'Obat');
  if (typeof data.prescribedByDoctor !== 'boolean') throw new Error('Jenis obat tidak valid.');
  return {
    id: id(data.id, 'ID obat'),
    episodeId: id(data.episodeId, 'ID episode obat'),
    memberId: id(data.memberId, 'ID anggota obat'),
    name: string(data.name, 'Nama obat'),
    dose: string(data.dose, 'Dosis obat'),
    frequency: string(data.frequency, 'Aturan pakai obat'),
    startDate: date(data.startDate, 'Tanggal mulai obat'),
    prescribedByDoctor: data.prescribedByDoctor,
    note: string(data.note, 'Catatan obat'),
    createdAt: timestamp(data.createdAt, 'Waktu pembuatan obat'),
  };
}

function assertReferences(backup: FamilyBackup): void {
  const collections = [backup.members, backup.dayLogs, backup.episodes, backup.medications];
  for (const documents of collections) {
    if (new Set(documents.map((item) => item.id)).size !== documents.length) {
      throw new Error('File backup memuat ID dokumen ganda.');
    }
  }
  const memberIds = new Set(backup.members.map((member) => member.id));
  const episodeIds = new Set(backup.episodes.map((episode) => episode.id));
  for (const log of backup.dayLogs) {
    if (!memberIds.has(log.memberId) || log.id !== `${log.memberId}_${log.date}`) {
      throw new Error('Relasi catatan harian tidak valid.');
    }
    if (log.episodeId && !episodeIds.has(log.episodeId)) {
      throw new Error('Episode pada catatan harian tidak ditemukan.');
    }
  }
  for (const episode of backup.episodes) {
    if (!memberIds.has(episode.memberId)) throw new Error('Anggota episode tidak ditemukan.');
  }
  for (const medication of backup.medications) {
    if (!memberIds.has(medication.memberId) || !episodeIds.has(medication.episodeId)) {
      throw new Error('Relasi obat tidak valid.');
    }
  }
}

export function parseFamilyBackup(text: string): FamilyBackup {
  const root = object(JSON.parse(text) as unknown, 'File backup');
  if (root.format !== 'catatan-kesehatan-keluarga' || root.version !== 1) {
    throw new Error('Format atau versi file backup tidak didukung.');
  }
  const family = object(root.family, 'Keluarga');
  const backup: FamilyBackup = {
    format: 'catatan-kesehatan-keluarga',
    version: 1,
    exportedAt: number(root.exportedAt, 'Waktu ekspor'),
    family: { name: string(family.name, 'Nama keluarga') },
    members: array(root.members, 'Anggota', parseMember),
    dayLogs: array(root.dayLogs, 'Catatan harian', parseDayLog),
    episodes: array(root.episodes, 'Episode', parseEpisode),
    medications: array(root.medications, 'Obat', parseMedication),
  };
  assertReferences(backup);
  return backup;
}
