// src/redux/exerciseSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchExerciseLogsForDate, saveExerciseLogsForDate, fetchAllExerciseLogs as fetchAllService } from '../services/firebaseService';
import { format } from 'date-fns';

export const fetchExerciseLogs = createAsyncThunk(
  'exercise/fetchLogs',
  async ({ userId, date }, { rejectWithValue }) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const logs = await fetchExerciseLogsForDate(userId, dateStr);
      return { date: dateStr, logs };
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

// ▼▼▼ [ここから修正] ▼▼▼
export const saveExerciseLogs = createAsyncThunk(
  'exercise/saveLogs',
  async ({ userId, date, logs }, { getState, rejectWithValue }) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      await saveExerciseLogsForDate(userId, dateStr, logs);
      
      // 保存後、カレンダーやグラフが参照する全期間データ(allItems)も直接更新する
      const { allItems } = getState().exercise;
      const updatedAllItems = [...allItems];
      const index = updatedAllItems.findIndex(item => item.date === dateStr);
      const newDayLog = { userId, date: dateStr, logs };

      if (logs.length === 0 && index !== -1) {
        // その日のログが全て削除された場合は、全期間データからも削除
        updatedAllItems.splice(index, 1);
      } else if (index !== -1) {
        // 既存のログがあれば更新
        updatedAllItems[index] = { ...updatedAllItems[index], ...newDayLog };
      } else if (logs.length > 0) {
        // 新しい日付のログなら追加
        updatedAllItems.push(newDayLog);
      }
      
      // 日次データと全期間データの両方を返す
      return { daily: logs, all: updatedAllItems };
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);
// ▲▲▲ [ここまで修正] ▲▲▲

export const fetchAllExerciseLogs = createAsyncThunk(
  'exercise/fetchAllLogs',
  async (userId, { rejectWithValue }) => {
    try {
      const logs = await fetchAllService(userId);
      return logs;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

const initialState = {
  items: [],
  allItems: [],
  loading: 'idle',
  allLoading: 'idle',
  error: null,
};

const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExerciseLogs.pending, (state) => { state.loading = 'pending'; })
      .addCase(fetchExerciseLogs.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.items = action.payload.logs;
      })
      .addCase(fetchExerciseLogs.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      })
      // ▼▼▼ [ここから修正] ▼▼▼
      .addCase(saveExerciseLogs.pending, (state) => {})
      .addCase(saveExerciseLogs.fulfilled, (state, action) => {
        // 保存成功時は、ローカルのstateを直接更新する
        state.items = action.payload.daily;
        state.allItems = action.payload.all;
      })
      // ▲▲▲ [ここまで修正] ▲▲▲
      .addCase(fetchAllExerciseLogs.pending, (state) => {
        state.allLoading = 'pending';
      })
      .addCase(fetchAllExerciseLogs.fulfilled, (state, action) => {
        state.allLoading = 'succeeded';
        state.allItems = action.payload;
      })
      .addCase(fetchAllExerciseLogs.rejected, (state, action) => {
        state.allLoading = 'failed';
        state.error = action.payload;
      });
  },
});

export default exerciseSlice.reducer;