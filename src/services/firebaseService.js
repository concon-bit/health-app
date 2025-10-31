// src/services/firebaseService.js

import { auth, googleProvider, db } from '../firebase';
// ▼▼▼ [修正] 'signInWithPopup' に加えて、'setPersistence' と 'browserLocalPersistence' をインポート ▼▼▼
import { signInWithPopup, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
// ▼▼▼ [修正] 'getDoc' を削除 ▼▼▼
import { collection, query, where, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
// ▲▲▲ [修正] ▲▲▲

// --- Authentication ---
export const onAuthChange = (callback) => { return onAuthStateChanged(auth, callback); };

// ▼▼▼ [ここから修正] ログイン処理の直前に永続化設定を行うように変更 ▼▼▼
export const loginWithGoogle = async () => {
  try {
    // 1. 最初に「認証状態をローカルに保存する」設定（ずっと継続する設定）を実行します
    await setPersistence(auth, browserLocalPersistence);
    
    // 2. 永続化設定が完了してから、ポップアップでログインを実行します
    return signInWithPopup(auth, googleProvider);
    
  } catch (error) {
    // エラーハンドリングを強化
    if (error.code === 'auth/missing-or-invalid-nonce') {
        console.error("認証エラー(nonce):", error);
        alert("認証に失敗しました。ブラウザのストレージ設定（サードパーティCookieなど）を確認してください。");
    } else {
        console.error("Firebase 永続化設定 または ログインに失敗:", error);
    }
    throw error;
  }
};
// ▲▲▲ [ここまで修正] ▲▲▲

export const logout = () => { return signOut(auth); };

// --- Firestore (Health Logs) ---
const LOGS_COLLECTION = "logs";

export const fetchLogs = async (userId) => {
  if (!userId) return [];
  try {
    const logsCollection = collection(db, LOGS_COLLECTION);
    const q = query(logsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("体調記録の取得に失敗しました:", error);
    throw error;
  }
};

export const saveLog = async (logData) => {
  const { userId, date } = logData;
  if (!userId || !date) throw new Error("ユーザーIDと日付は必須です。");

  try {
    const logsCollection = collection(db, LOGS_COLLECTION);
    const q = query(logsCollection, where("userId", "==", userId), where("date", "==", date));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      await setDoc(doc(db, LOGS_COLLECTION, docId), logData);
    } else {
      await addDoc(logsCollection, logData);
    }
  } catch (error) {
    console.error("体調記録の保存に失敗しました:", error);
    throw error;
  }
};