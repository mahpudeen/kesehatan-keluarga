import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/shared/firebase/client';
import { Button } from '@/shared/ui/Button';

export default function LoginScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-8 px-6 bg-bg">
      {/* Logo area */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-white" aria-hidden="true">
            <path
              d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink">Catatan Kesehatan</h1>
          <p className="text-ink-muted mt-1">Pantau kesehatan keluarga hari demi hari</p>
        </div>
      </div>

      {/* Features list */}
      <ul className="w-full max-w-xs space-y-3">
        {[
          'Catat status sehat/sakit per anggota',
          'Riwayat penyakit dengan kunjungan dokter',
          'Sinkronisasi real-time antar perangkat',
          'Bekerja tanpa koneksi internet',
        ].map((feat) => (
          <li key={feat} className="flex items-start gap-3 text-sm text-ink-muted">
            <span className="w-5 h-5 rounded-full bg-primary-soft flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3" aria-hidden="true">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="var(--color-primary)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {feat}
          </li>
        ))}
      </ul>

      <Button
        id="btn-login-google"
        onClick={() => signInWithPopup(auth, googleProvider)}
        fullWidth
        size="lg"
        className="max-w-xs"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Masuk dengan Google
      </Button>

      <p className="text-xs text-ink-muted text-center max-w-xs">
        Data kesehatan Anda aman dan terenkripsi. Hanya Anda dan keluarga yang dapat mengaksesnya.
      </p>
    </div>
  );
}
