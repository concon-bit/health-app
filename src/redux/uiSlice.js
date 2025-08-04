// src/redux/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { addDays } from 'date-fns';

const initialState = {
  activeMode: 'health',
  activeHealthTab: 'log',
  selectedDate: new Date().toISOString(),
  showPeriodCalendar: false,
  showMedicationCalendar: false,
  showExerciseCalendar: false,
  showExerciseChart: false, // <<< [追加] グラフ表示用
  showMoreMenu: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveMode(state, action) {
      state.activeMode = action.payload;
      state.showMoreMenu = false;
    },
    setActiveHealthTab(state, action) {
      state.activeHealthTab = action.payload;
    },
    setSelectedDate(state, action) {
      state.selectedDate = action.payload;
    },
    changeDateBy(state, action) {
      const currentDate = new Date(state.selectedDate);
      state.selectedDate = addDays(currentDate, action.payload).toISOString();
    },
    togglePeriodCalendar(state) { state.showPeriodCalendar = !state.showPeriodCalendar; },
    toggleMedicationCalendar(state) { state.showMedicationCalendar = !state.showMedicationCalendar; },
    toggleExerciseCalendar(state) { state.showExerciseCalendar = !state.showExerciseCalendar; },
    toggleExerciseChart(state) { state.showExerciseChart = !state.showExerciseChart; }, // <<< [追加]
    toggleMoreMenu(state) { state.showMoreMenu = !state.showMoreMenu; },
  },
});

export const {
  setActiveMode, setActiveHealthTab, setSelectedDate, changeDateBy,
  togglePeriodCalendar, toggleMedicationCalendar, toggleExerciseCalendar,
  toggleExerciseChart, // <<< [追加]
  toggleMoreMenu,
} = uiSlice.actions;

export default uiSlice.reducer;