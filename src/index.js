import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Make sure this element exists in your HTML
const container = document.getElementById('root');

// Check if container exists before creating root
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found. Make sure there is a <div id="root"></div> in your HTML file.');
}
