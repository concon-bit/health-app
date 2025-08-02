import React, { useState, useEffect, useMemo } from 'react';
import CalendarView from './CalendarView';
import Chart from './Chart';
import HealthForm from './HealthForm'; // HealthFormをインポート
import './App.css';

// Firebase関連のインポート
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, doc, setDoc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 認証状態を監視する副作用
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchLogs(currentUser.uid);
      } else {
        setLogs([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestoreからデータを取得する関数
  const fetchLogs = async (userId) => {
    const q = query(collection(db, "logs"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const fetchedLogs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLogs(fetchedLogs);
  };

  // Firestoreにデータを保存/更新する関数
  const addOrUpdateLog = async (temp) => {
    if (!temp || !user) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existingLog = logs.find(log => log.date === dateStr);
    const logData = { userId: user.uid, date: dateStr, temp: temp };

    if (existingLog) {
      await setDoc(doc(db, "logs", existingLog.id), logData);
    } else {
      await addDoc(collection(db, "logs"), logData);
    }
    fetchLogs(user.uid);
  };

  // ログイン・ログアウト処理
  const handleLogin = () => signInWithPopup(auth, googleProvider).catch(console.error);
  const handleLogout = () => signOut(auth);

  // 選択された日付のログを計算
  const currentLog = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return logs.find(log => log.date === dateStr);
  }, [logs, selectedDate]);

  // ログインしていない時のUI
  if (!user) {
    return (
      <div className="login-container">
        <h1>Health Tracker</h1>
        <p>Googleアカウントでログインして、体調の記録を始めましょう。</p>
        <button onClick={handleLogin} className="login-button">Googleでログイン</button>
      </div>
    );
  }

  // ログイン後のUI
  return (
    <div className="container">
      <header>
        <h1>Health Tracker</h1>
        <div className="user-info">
          <img src={user.photoURL} alt={user.displayName} />
          <span>{user.displayName}</span>
          <button onClick={handleLogout}>ログアウト</button>
        </div>
      </header>
      <main>
        <div className="left-panel">
          <CalendarView logs={logs} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          <HealthForm
            key={selectedDate.toString()} // 日付が変わったらフォームを確実に再描画する
            currentTemp={currentLog?.temp || ''}
            onSave={addOrUpdateLog}
            selectedDate={selectedDate}
          />
        </div>
        <div className="right-panel">
          {logs.length > 0 ? <Chart logs={logs} /> : <p>記録がありません。</p>}
        </div>
      </main>
    </div>
  );
}

export default App;