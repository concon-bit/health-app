// src/redux/medicationSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    fetchMedications as fetchMedicationsService,
    saveMedication as saveMedicationService,
    updateMedication as updateMedicationService,
    deleteMedication as deleteMedicationService,
    saveDoseRecord as saveDoseRecordService,
    fetchDoseRecordsForDate as fetchDoseRecordsForDateService,
    fetchDoseRecordsForMonth as fetchDoseRecordsForMonthService
} from '../services/firebaseService';

export const fetchMedications = createAsyncThunk('medications/fetch', async (userId) => {
    const medications = await fetchMedicationsService(userId);
    return medications;
});
export const addMedication = createAsyncThunk('medications/add', async (medData, { getState }) => {
    const userId = getState().user.currentUser.uid;
    const newMed = await saveMedicationService({ ...medData, userId });
    return newMed;
});
export const updateMedication = createAsyncThunk('medications/update', async ({ id, medData }) => {
    await updateMedicationService(id, medData);
    return { id, changes: medData };
});
export const deleteMedication = createAsyncThunk('medications/delete', async (id) => {
    await deleteMedicationService(id);
    return id;
});
export const fetchDoseHistory = createAsyncThunk('medications/fetchHistory', async ({ userId, date }) => {
    const records = await fetchDoseRecordsForDateService(userId, date);
    return records;
});
export const fetchMonthDoseHistory = createAsyncThunk('medications/fetchMonthHistory', async ({ userId, date }) => {
    const records = await fetchDoseRecordsForMonthService(userId, new Date(date));
    // [修正] どの月のデータか分かるように、取得した日付も一緒に返す
    return { records, date };
});
export const logDose = createAsyncThunk('medications/logDose', async (doseData, { getState }) => {
    const userId = getState().user.currentUser.uid;
    await saveDoseRecordService({ ...doseData, userId });
    return doseData;
});

const initialState = {
  items: [],
  history: [],
  monthlyHistory: [],
  loading: 'idle',
  historyLoading: 'idle',
  monthlyHistoryLoading: 'idle',
  error: null,
};

const medicationSlice = createSlice({
  name: 'medications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedications.pending, (state) => { state.loading = 'pending'; })
      .addCase(fetchMedications.fulfilled, (state, action) => { state.loading = 'succeeded'; state.items = action.payload; })
      .addCase(fetchMedications.rejected, (state, action) => { state.loading = 'failed'; state.error = action.error.message; })
      .addCase(addMedication.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateMedication.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) { state.items[index] = { ...state.items[index], ...action.payload.changes }; }
      })
      .addCase(deleteMedication.fulfilled, (state, action) => { state.items = state.items.filter(item => item.id !== action.payload); })
      .addCase(fetchDoseHistory.pending, (state) => { state.historyLoading = 'pending'; })
      .addCase(fetchDoseHistory.fulfilled, (state, action) => { state.historyLoading = 'succeeded'; state.history = action.payload; })
      .addCase(fetchDoseHistory.rejected, (state) => { state.historyLoading = 'failed'; })
      .addCase(fetchMonthDoseHistory.pending, (state) => { state.monthlyHistoryLoading = 'pending'; })
      // ▼▼▼ [ここから修正] ▼▼▼
      .addCase(fetchMonthDoseHistory.fulfilled, (state, action) => {
        state.monthlyHistoryLoading = 'succeeded';
        const { records: newRecords, date: fetchedDateStr } = action.payload;
        
        // フェッチした月の年と月を取得
        const fetchedDate = new Date(fetchedDateStr);
        const year = fetchedDate.getFullYear();
        const month = fetchedDate.getMonth();

        // 既存の履歴から、今回フェッチした月以外のデータだけを残す
        const otherMonthsHistory = state.monthlyHistory.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getFullYear() !== year || recordDate.getMonth() !== month;
        });

        // 他の月のデータと、今回新しく取得したデータを結合して、新しい月間履歴とする
        state.monthlyHistory = [...otherMonthsHistory, ...newRecords];
      })
      // ▲▲▲ [ここまで修正] ▲▲▲
      .addCase(fetchMonthDoseHistory.rejected, (state) => { state.monthlyHistoryLoading = 'failed'; })
      .addCase(logDose.fulfilled, (state, action) => {
        const newRecord = action.payload;
        
        const historyIndex = state.history.findIndex(h => 
            h.medicationId === newRecord.medicationId && 
            h.timing === newRecord.timing && 
            h.date === newRecord.date
        );

        if (historyIndex !== -1) {
          state.history[historyIndex].status = newRecord.status;
        } else {
          state.history.push(newRecord);
        }

        const monthlyHistoryIndex = state.monthlyHistory.findIndex(h => 
            h.medicationId === newRecord.medicationId && 
            h.timing === newRecord.timing && 
            h.date === newRecord.date
        );
        
        if (monthlyHistoryIndex !== -1) {
            state.monthlyHistory[monthlyHistoryIndex].status = newRecord.status;
        } else {
            state.monthlyHistory.push(newRecord);
        }
      });
  },
});

export default medicationSlice.reducer;