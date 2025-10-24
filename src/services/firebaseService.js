// src/services/firebaseService.js

import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
// ▼▼▼ [修正] 'getDoc' を削除 ▼▼▼
import { collection, query, where, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
// ▲▲▲ [修正] ▲▲▲

// --- Authentication ---
export const onAuthChange = (callback) => { return onAuthStateChanged(auth, callback); };

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

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