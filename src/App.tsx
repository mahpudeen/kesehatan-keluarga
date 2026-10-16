import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { FamilyProvider } from '@/features/family/FamilyContext';
import { MembersProvider } from '@/features/members/MembersContext';
import AppRouter from './app/router.tsx';


/** Composes providers in order: Auth > Family > Members > Router. */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FamilyProvider>
          <MembersProvider>
            <AppRouter />
          </MembersProvider>
        </FamilyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}