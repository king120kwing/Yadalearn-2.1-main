import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
