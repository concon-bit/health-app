// src/services/firebaseService.js

import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

// --- Authentication ---
export const onAuthChange = (callback) => { return onAuthStateChanged(auth, callback); };
export const loginWithGoogle = () => { return signInWithPopup(auth, googleProvider); };
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

// --- Firestore (Period Logs) ---
const PERIOD_DATA_COLLECTION = "periodData";

export const fetchPeriodData = async (userId) => {
  if (!userId) return { records: [], dailyLogs: {}, ongoingPeriodStartDate: null };
  try {
    const docRef = doc(db, PERIOD_DATA_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            records: data.records || [],
            dailyLogs: data.dailyLogs || {},
            ongoingPeriodStartDate: data.ongoingPeriodStartDate || null
        };
    }
    return { records: [], dailyLogs: {}, ongoingPeriodStartDate: null };
  } catch (error) {
    console.error("生理データの取得に失敗しました:", error);
    throw error;
  }
};

export const savePeriodData = async (userId, periodState) => {
  if (!userId) throw new Error("ユーザーIDが必要です。");
  try {
    const docRef = doc(db, PERIOD_DATA_COLLECTION, userId);
    const dataToSave = {
      records: periodState.records,
      dailyLogs: periodState.dailyLogs,
      ongoingPeriodStartDate: periodState.ongoingPeriodStartDate,
    };
    await setDoc(docRef, dataToSave);
  } catch (error) {
    console.error("生理データの保存に失敗しました:", error);
    throw error;
  }
};

// --- Firestore (Medications) ---
const MEDICATIONS_COLLECTION = "medications";

export const fetchMedications = async (userId) => {
  if (!userId) return [];
  try {
    const medCollection = collection(db, MEDICATIONS_COLLECTION);
    const q = query(medCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("薬剤リストの取得に失敗しました:", error);
    throw error;
  }
};

export const saveMedication = async (medicationData) => {
  if (!medicationData.userId) throw new Error("ユーザーIDは必須です。");
  try {
    const medCollection = collection(db, MEDICATIONS_COLLECTION);
    const docRef = await addDoc(medCollection, medicationData);
    return { id: docRef.id, ...medicationData };
  } catch (error) {
    console.error("薬剤の保存に失敗しました:", error);
    throw error;
  }
};

export const updateMedication = async (medId, medicationData) => {
    try {
        const medRef = doc(db, MEDICATIONS_COLLECTION, medId);
        await setDoc(medRef, medicationData, { merge: true });
    } catch (error) {
        console.error("薬剤の更新に失敗しました:", error);
        throw error;
    }
};

export const deleteMedication = async (medId) => {
    try {
        const medRef = doc(db, MEDICATIONS_COLLECTION, medId);
        await deleteDoc(medRef);
    } catch (error) {
        console.error("薬剤の削除に失敗しました:", error);
        throw error;
    }
};

// --- Firestore (Medication History) ---
const MEDICATION_HISTORY_COLLECTION = "medicationHistory";

export const saveDoseRecord = async (historyData) => {
    try {
        const historyCollection = collection(db, MEDICATION_HISTORY_COLLECTION);
        const q = query(historyCollection, 
            where("userId", "==", historyData.userId),
            where("medicationId", "==", historyData.medicationId),
            where("date", "==", historyData.date),
            where("timing", "==", historyData.timing)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await addDoc(historyCollection, historyData);
        } else {
            const docId = querySnapshot.docs[0].id;
            await setDoc(doc(db, MEDICATION_HISTORY_COLLECTION, docId), historyData);
        }
    } catch (error) {
        console.error("服薬履歴の保存に失敗しました:", error);
        throw error;
    }
};

export const fetchDoseRecordsForDate = async (userId, date) => {
    if (!userId || !date) return [];
    try {
        const historyCollection = collection(db, MEDICATION_HISTORY_COLLECTION);
        const q = query(historyCollection,
            where("userId", "==", userId),
            where("date", "==", date)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("服薬履歴の取得に失敗しました:", error);
        throw error;
    }
};

export const fetchDoseRecordsForMonth = async (userId, dateInMonth) => {
    if (!userId) return [];
    try {
        const year = dateInMonth.getFullYear();
        const month = dateInMonth.getMonth();
        const startDateStr = new Date(year, month, 1).toISOString().split('T')[0];
        const endDateStr = new Date(year, month + 1, 0).toISOString().split('T')[0];
        
        const historyCollection = collection(db, MEDICATION_HISTORY_COLLECTION);
        const q = query(historyCollection,
            where("userId", "==", userId),
            where("date", ">=", startDateStr),
            where("date", "<=", endDateStr)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("月間服薬履歴の取得に失敗しました:", error);
        throw error;
    }
};

// --- Firestore (Exercise Logs) ---
const EXERCISE_LOGS_COLLECTION = "exerciseLogs";

export const fetchExerciseLogsForDate = async (userId, date) => {
  if (!userId || !date) return [];
  try {
    const logsCollection = collection(db, EXERCISE_LOGS_COLLECTION);
    const q = query(logsCollection, where("userId", "==", userId), where("date", "==", date));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [];
    } else {
      const docData = querySnapshot.docs[0].data();
      return docData.logs || [];
    }
  } catch (error) {
    console.error("運動記録の取得に失敗しました:", error);
    throw error;
  }
};

export const saveExerciseLogsForDate = async (userId, date, logs) => {
  if (!userId || !date) throw new Error("ユーザーIDと日付は必須です。");
  try {
    const logsCollection = collection(db, EXERCISE_LOGS_COLLECTION);
    const q = query(logsCollection, where("userId", "==", userId), where("date", "==", date));
    const querySnapshot = await getDocs(q);
    const dataToSave = { userId, date, logs, updatedAt: new Date() };
    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      if (logs.length === 0) {
        await deleteDoc(doc(db, EXERCISE_LOGS_COLLECTION, docId));
      } else {
        await setDoc(doc(db, EXERCISE_LOGS_COLLECTION, docId), dataToSave);
      }
    } else if (logs.length > 0) {
      await addDoc(logsCollection, dataToSave);
    }
  } catch (error) {
    console.error("運動記録の保存に失敗しました:", error);
    throw error;
  }
};

export const fetchExerciseLogsForMonth = async (userId, dateInMonth) => {
  if (!userId) return [];
  try {
    const year = dateInMonth.getFullYear();
    const month = dateInMonth.getMonth();
    const startDateStr = new Date(year, month, 1).toISOString().split('T')[0];
    const endDateStr = new Date(year, month + 1, 0).toISOString().split('T')[0];
    const logsCollection = collection(db, EXERCISE_LOGS_COLLECTION);
    const q = query(logsCollection,
        where("userId", "==", userId),
        where("date", ">=", startDateStr),
        where("date", "<=", endDateStr)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("月間運動記録の取得に失敗しました:", error);
    throw error;
  }
};

// --- Firestore (User Profiles) ---
const PROFILES_COLLECTION = "profiles";

export const fetchUserProfile = async (userId) => {
  if (!userId) return null;
  try {
    const docRef = doc(db, PROFILES_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("プロファイルの取得に失敗しました:", error);
    throw error;
  }
};

export const saveUserProfile = async (userId, profileData) => {
  if (!userId) throw new Error("ユーザーIDは必須です。");
  try {
    const docRef = doc(db, PROFILES_COLLECTION, userId);
    await setDoc(docRef, profileData, { merge: true });
  } catch (error) {
    console.error("プロファイルの保存に失敗しました:", error);
    throw error;
  }
};

/**
 * 特定のユーザーの、すべての運動記録を取得する
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const fetchAllExerciseLogs = async (userId) => {
  if (!userId) return [];
  try {
    const logsCollection = collection(db, EXERCISE_LOGS_COLLECTION);
    const q = query(logsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("全運動記録の取得に失敗しました:", error);
    throw error;
  }
};