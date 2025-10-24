// src/App.js

import React, { useEffect } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from './redux/userSlice';
import { fetchLogs } from './redux/logsSlice';
import { onAuthChange } from './services/firebaseService';

function App() {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      // デバッグ用のconsole.logを削除しました

      if (user) {
        const serializedUser = { uid: user.uid, email: user.email, displayName: user.displayName };
        dispatch(setUser(serializedUser));
        // 全てのデータ取得をここに集約
        dispatch(fetchLogs(user.uid)); // 全ての体調記録
      } else {
        dispatch(setUser(null));
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return <div>読み込み中...</div>;
  }
  return currentUser ? <Dashboard /> : <Login />;
}

export default App;