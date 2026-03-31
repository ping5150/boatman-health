import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UserProvider } from '@/contexts/UserContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { ToastProvider } from '@/components/Toast';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <UserProvider>
        <AuthModalProvider>
          <App />
        </AuthModalProvider>
      </UserProvider>
    </ToastProvider>
  </StrictMode>,
);
