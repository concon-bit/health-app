// src/redux/logsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchLogs as fetchLogsService, saveLog as saveLogService } from '../services/firebaseService';

// [非同期処理] ユーザーIDに基づいてログを取得する
export const fetchLogs = createAsyncThunk('logs/fetchLogs', async (userId, { rejectWithValue }) => {
  try {
    const logs = await fetchLogsService(userId);
    return logs;
  } catch (error) {
    return rejectWithValue(error.toString());
  }
});

// [非同期処理] ログを保存する
export const saveLog = createAsyncThunk('logs/saveLog', async (logData, { dispatch, rejectWithValue }) => {
  try {
    await saveLogService(logData);
    // 保存が成功したら、最新のログを再取得する
    dispatch(fetchLogs(logData.userId));
    return true; // 保存成功を示す
  } catch (error) {
    return rejectWithValue(error.toString());
  }
});


const initialState = {
  items: [],
  loading: true,
  error: null,
};

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {},
  // createAsyncThunkで作成した非同期処理の結果をハンドリングする
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveLog.pending, (state) => {
        // 保存時にもローディング表示をしても良い
      })
      .addCase(saveLog.fulfilled, (state) => {
        // 保存成功時の特別な処理があればここに書く
      })
      .addCase(saveLog.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default logsSlice.reducer;