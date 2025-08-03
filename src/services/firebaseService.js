// src/services/firebaseService.js

import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, doc, setDoc } from "firebase/firestore";

// --- Authentication ---

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const logout = () => {
  return signOut(auth);
};


// --- Firestore (Logs) ---

const LOGS_COLLECTION = "logs";

export const fetchLogs = async (userId) => {
  if (!userId) return [];
  try {
    const q = query(collection(db, LOGS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("ログの取得に失敗しました:", error);
    throw error;
  }
};

export const saveLog = async (logData) => {
  if (!logData.userId) {
    throw new Error("ユーザーIDが必要です。");
  }

  // 既存ログの検索
  const q = query(collection(db, LOGS_COLLECTION), where("userId", "==", logData.userId), where("date", "==", logData.date));
  const querySnapshot = await getDocs(q);
  
  try {
    if (!querySnapshot.empty) {
      // 既存ログがあれば更新 (merge: true で指定したフィールドのみ更新)
      const existingLogDoc = querySnapshot.docs[0];
      await setDoc(doc(db, LOGS_COLLECTION, existingLogDoc.id), logData, { merge: true });
    } else {
      // 既存ログがなければ新規作成
      await addDoc(collection(db, LOGS_COLLECTION), logData);
    }
  } catch (error) {
    console.error("記録の保存に失敗しました:", error);
    throw error;
  }
};