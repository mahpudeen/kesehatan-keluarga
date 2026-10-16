import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// Tanpa huruf/angka yang mirip (0/O, 1/I)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(length = 10) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export async function createInvite(familyId: string, uid: string) {
  const code = randomCode();
  await setDoc(doc(db, 'invites', code), {
    familyId,
    createdBy: uid,
    used: false,
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    createdAt: serverTimestamp(),
  });
  return code;
}

export async function joinFamily(rawCode: string, uid: string) {
  const code = rawCode.trim().toUpperCase();
  const inviteRef = doc(db, 'invites', code);
  const snap = await getDoc(inviteRef);

  if (!snap.exists()) throw new Error('Kode tidak ditemukan.');
  const inv = snap.data();
  if (inv.used) throw new Error('Kode ini sudah dipakai.');
  if (inv.expiresAt.toMillis() < Date.now()) throw new Error('Kode sudah kedaluwarsa.');

  // Atomik: tambah anggota + tandai undangan terpakai, atau gagal semuanya
  const batch = writeBatch(db);
  batch.update(doc(db, 'families', inv.familyId), {
    memberUids: arrayUnion(uid),
    joinCode: code,
  });
  batch.update(inviteRef, { used: true, usedBy: uid });
  await batch.commit();
}