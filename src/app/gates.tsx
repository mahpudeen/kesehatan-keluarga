import { type ReactNode } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFamily } from '@/features/family/FamilyContext';
import LoginScreen from '@/features/auth/LoginScreen';
import Onboarding from '@/features/family/Onboarding';

/** Renders LoginScreen if user is not signed in. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  return <>{children}</>;
}

/** Renders Onboarding if user has no family. */
export function FamilyGate({ children }: { children: ReactNode }) {
  const { family, loading } = useFamily();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!family) return <Onboarding />;
  return <>{children}</>;
}
