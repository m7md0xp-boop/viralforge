import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initSecrets } from './services/secrets';

// Load API keys (encrypted storage in the desktop app) before the first render
initSecrets()
  .catch((err) => console.warn('Failed to load saved keys', err))
  .finally(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
