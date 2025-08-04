// src/redux/periodSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { calculateCycleInfo } from '../utils/periodUtils';
import { fetchPeriodData, savePeriodData } from '../services/firebaseService';

// [非同期処理] Firebaseからデータを取得
export const fetchPeriodLogs = createAsyncThunk('period/fetchData', async (userId, { rejectWithValue }) => {
  try {
    const data = await fetchPeriodData(userId);
    return data;
  } catch (error) {
    return rejectWithValue(error.toString());
  }
});

// [非同期処理] Firebaseにデータを保存
export const savePeriodLogs = createAsyncThunk('period/saveData', async (_, { getState }) => {
  const state = getState();
  const userId = state.user.currentUser.uid;
  if (!userId) {
      throw new Error("ユーザーが見つかりません。");
  }
  const periodState = state.period;
  await savePeriodData(userId, periodState);
  return periodState;
});


const initialState = {
  records: [],
  dailyLogs: {},
  cycleInfo: { averageCycle: 28, nextPredictedDate: null },
  ongoingPeriodStartDate: null,
  loading: true,
  error: null,
};

const periodSlice = createSlice({
  name: 'period',
  initialState,
  reducers: {
    startPeriod(state, action) {
      state.ongoingPeriodStartDate = action.payload;
      // --- [修正] 開始したタイミングで予測を再計算 ---
      state.cycleInfo = calculateCycleInfo(state.records, state.ongoingPeriodStartDate);
    },
    endPeriodAndLog(state, action) {
      if (!state.ongoingPeriodStartDate) return;
      const newRecord = {
        id: new Date().toISOString(),
        startDate: state.ongoingPeriodStartDate,
        endDate: action.payload,
      };
      state.records.push(newRecord);
      state.records.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      state.ongoingPeriodStartDate = null;
      // --- [修正] 終了したタイミングでも、新しい記録を元に予測を再計算 ---
      state.cycleInfo = calculateCycleInfo(state.records, null);
    },
    updateDailyPeriodLog(state, action) {
      const { date, logData } = action.payload;
      state.dailyLogs[date] = { ...(state.dailyLogs[date] || {}), ...logData };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPeriodLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPeriodLogs.fulfilled, (state, action) => {
        if (action.payload) {
            state.records = action.payload.records || [];
            state.dailyLogs = action.payload.dailyLogs || {};
            state.ongoingPeriodStartDate = action.payload.ongoingPeriodStartDate || null;
            // --- [修正] Firebaseから読み込んだデータで予測を再計算 ---
            state.cycleInfo = calculateCycleInfo(state.records, state.ongoingPeriodStartDate);
        }
        state.loading = false;
      })
      .addCase(fetchPeriodLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // --- [修正] 保存成功後も念のため再計算 ---
      .addCase(savePeriodLogs.fulfilled, (state, action) => {
        if(action.payload) {
          state.cycleInfo = calculateCycleInfo(action.payload.records, action.payload.ongoingPeriodStartDate);
        }
      });
  }
});

export const { startPeriod, endPeriodAndLog, updateDailyPeriodLog } = periodSlice.actions;
export default periodSlice.reducer;