// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css'; // グローバルCSSを先に読み込む
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LogProvider } from './contexts/LogContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <LogProvider>
        <App />
      </LogProvider>
    </AuthProvider>
  </React.StrictMode>
);