import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ProfilePicker from './components/screens/ProfilePicker.jsx';
import { I18nProvider } from './i18n/I18nProvider.jsx';
import { initSecrets } from './services/secrets';
import './index.css';

// The desktop app opens a profile picker first (app://app/index.html?picker=1).
// The picker has no profile yet, so it does not load keys.
const isPicker = new URLSearchParams(window.location.search).has('picker');

const boot = isPicker
  ? Promise.resolve()
  : // Load API keys (encrypted storage in the desktop app) before the first render
    initSecrets().catch((err) => console.warn('Failed to load saved keys', err));

boot.finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <I18nProvider>{isPicker ? <ProfilePicker /> : <App />}</I18nProvider>
    </React.StrictMode>
  );
});
