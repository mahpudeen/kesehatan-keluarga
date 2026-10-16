import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';
import { useAuth } from './lib/useAuth';
import { useFamily } from './lib/family';
import Members from './components/Members';
import Today from './components/Today';
import History from './components/History';
import EpisodeList from './components/EpisodeList';
import Onboarding from './components/Onboarding';
import Invite from './components/Invite';

export default function App() {
  const { user, loading } = useAuth();
  const { family, loading: familyLoading } = useFamily(user?.uid);

  if (loading || (user && familyLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-emerald-50 p-6">
        <h1 className="text-2xl font-bold text-emerald-700 text-center">
          Catatan Kesehatan Keluarga
        </h1>
        <button
          onClick={() => signInWithPopup(auth, googleProvider)}
          className="rounded-xl bg-emerald-600 px-6 py-3 text-white font-semibold shadow active:scale-95"
        >
          Masuk dengan Google
        </button>
      </div>
    );
  }

  if (!family) return <Onboarding uid={user.uid} />;

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <h1 className="text-xl font-bold text-emerald-700">{family.name}</h1>
      <p className="text-gray-700">Halo, {user.displayName}</p>
      <Today familyId={family.id} uid={user.uid} />
      <History familyId={family.id} uid={user.uid} />
      <EpisodeList familyId={family.id} />
      <Members familyId={family.id} />
      {family.ownerUid === user.uid && <Invite familyId={family.id} uid={user.uid} />}
      <button
        onClick={() => signOut(auth)}
        className="mt-4 rounded-lg border border-emerald-600 px-4 py-2 text-emerald-700"
      >
        Keluar
      </button>
    </div>
  );
}