// src/contexts/LogContext.js

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchLogs as fetchLogsService, saveLog as saveLogService } from '../services/firebaseService';

const LogContext = createContext();

export const useLogs = () => {
  return useContext(LogContext);
};

export const LogProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserLogs = useCallback(async () => {
    if (currentUser) {
      setLoading(true);
      setError(null);
      try {
        const fetchedLogs = await fetchLogsService(currentUser.uid);
        setLogs(fetchedLogs);
      } catch (err) {
        setError("ログの取得に失敗しました。");
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setLogs([]);
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserLogs();
  }, [fetchUserLogs]);
  
  const saveLog = async (logData) => {
    if (!currentUser) throw new Error("ログインしていません。");

    // [修正] 記録の有無を、ユーザーが直接入力する項目だけで判断するように変更
    const { mood, isPooped, memo } = logData;
    const hasUserInput = mood || isPooped || (memo && memo.trim() !== '');

    // 体温と水分量は常にデフォルト値があるため、上記のhasUserInputで判断する
    if (!hasUserInput) {
      alert("体調、排便、メモのいずれか1つ以上を入力・選択してください。");
      return false;
    }

    setLoading(true);
    try {
        const completeLogData = {
            ...logData,
            userId: currentUser.uid,
        };
        await saveLogService(completeLogData);
        await fetchUserLogs();
        return true;
    } catch (err) {
        setError("記録の保存に失敗しました。");
        console.error(err);
        return false;
    } finally {
        setLoading(false);
    }
  };

  const value = {
    logs,
    loading,
    error,
    saveLog,
    fetchUserLogs
  };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
};