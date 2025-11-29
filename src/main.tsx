import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // load Tailwind CSS

// Add error boundary logging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Application starting...');

// Removed StrictMode for R3F compatibility in development
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

console.log('Application mounted...');