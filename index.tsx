
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Root mounting logic
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Impossible de trouver l'élément racine pour le montage");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
