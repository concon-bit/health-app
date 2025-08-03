// src/App.js
import React from 'react';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/Login';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // ローディング中の表示（必要であればスピナーなどを表示）
    return <div>読み込み中...</div>;
  }

  return currentUser ? <Dashboard /> : <Login />;
}

export default App;