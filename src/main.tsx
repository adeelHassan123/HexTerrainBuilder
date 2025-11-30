import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // load Tailwind CSS

// Add error boundary logging
window.addEventListener('error', (event) => {
  // Suppress model loading errors - they're handled by Error Boundaries
  if (event.error?.message?.includes('Could not load') || 
      event.error?.message?.includes('is not valid JSON')) {
    event.preventDefault(); // Prevent error from crashing the app
    return;
  }
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  // Suppress model loading promise rejections - they're handled by Error Boundaries
  if (event.reason?.message?.includes('Could not load') || 
      event.reason?.message?.includes('is not valid JSON')) {
    event.preventDefault(); // Prevent unhandled rejection from crashing the app
    return;
  }
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Application starting...');

// Removed StrictMode for R3F compatibility in development
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

console.log('Application mounted...');