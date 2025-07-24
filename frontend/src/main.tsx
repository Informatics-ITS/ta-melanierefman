import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './locales/i18n';
import { HelmetProvider } from 'react-helmet-async';
import { SelectedOptionProvider } from "./contexts/selectedOption";
import { ToastProvider } from './hooks/useToast.tsx';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <HelmetProvider>
      <ToastProvider>
        <SelectedOptionProvider>
          <App />
        </SelectedOptionProvider>
      </ToastProvider>
    </HelmetProvider>
  </StrictMode>
);

