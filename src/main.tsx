import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/plus-jakarta-sans';
import './styles/index.css';
import App from './App.tsx';
// Initialize Firebase (offline cache, auth)
import './shared/firebase/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
