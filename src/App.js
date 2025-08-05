// src/App.js

import React, { useEffect } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, fetchProfile } from './redux/userSlice';
import { fetchLogs } from './redux/logsSlice';
import { fetchPeriodLogs } from './redux/periodSlice';
import { fetchMedications, fetchMonthDoseHistory } from './redux/medicationSlice';
import { fetchAllExerciseLogs, fetchExerciseLogs } from './redux/exerciseSlice';
import { onAuthChange } from './services/firebaseService';

function App() {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      // ▼▼▼【デバッグ用コード】▼▼▼
      console.log("Firebase認証状態が変化しました。 Userオブジェクト:", user);
      // ▲▲▲【デバッグ用コード】▲▲▲

      if (user) {
        const serializedUser = { uid: user.uid, email: user.email, displayName: user.displayName };
        dispatch(setUser(serializedUser));
        // 全てのデータ取得をここに集約
        dispatch(fetchProfile(user.uid));
        dispatch(fetchLogs(user.uid)); // 全ての体調記録
        dispatch(fetchPeriodLogs(user.uid));
        dispatch(fetchMedications(user.uid));
        dispatch(fetchMonthDoseHistory({ userId: user.uid, date: new Date() })); // 今月の服薬履歴
        dispatch(fetchExerciseLogs({ userId: user.uid, date: new Date() })); // 今日の運動記録
        dispatch(fetchAllExerciseLogs(user.uid)); // 全ての運動記録(グラフ・カレンダー用)
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