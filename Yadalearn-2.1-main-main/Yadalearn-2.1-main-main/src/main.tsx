import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Unregister stale service workers and clear cache storage to force-load the new layout
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log('Unregistered stale service worker');
      });
    }
  });
}
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then(keys => {
    for (const key of keys) {
      caches.delete(key);
    }
  });
}

// Suppress deprecated warnings from third-party libraries (e.g., react-undraw-illustrations)
const ignoreWarns = [
  'defaultProps',
  'dataName',
  'React Router Future Flag Warning',
  'Relative route resolution within Splat'
];

const filterLogs = (originalFunc: any) => {
  return (...args: any[]) => {
    const msg = args[0];
    if (typeof msg === 'string' && ignoreWarns.some(warn => msg.includes(warn))) {
      return;
    }
    originalFunc(...args);
  };
};

console.warn = filterLogs(console.warn);
console.error = filterLogs(console.error);

console.log('Main: Starting app...');
try {
  createRoot(document.getElementById("root")!).render(
    <App />
  );
  console.log('Main: Render called');
} catch (e) {
  console.error('Main: Render crashed', e);
}
