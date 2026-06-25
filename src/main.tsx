import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import {OfflineProvider} from './offline';
import {setUpdateSW} from './offline/swUpdate';
import './index.css';

// Register the service worker and surface updates to the UI (update banner).
const updateSW = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('sw-update', {detail: {type: 'SW_UPDATED'}}));
  },
  onOfflineReady() {
    window.dispatchEvent(new CustomEvent('sw-offline-ready'));
  },
});
setUpdateSW(updateSW);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OfflineProvider>
      <App />
    </OfflineProvider>
  </StrictMode>,
);
