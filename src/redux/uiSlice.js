// src/redux/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { addDays } from 'date-fns';

const initialState = {
  activeMode: 'health',
  activeHealthTab: 'log',
  selectedDate: new Date().toISOString(),
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
    toggleMoreMenu(state) { state.showMoreMenu = !state.showMoreMenu; },
  },
});

export const {
  setActiveMode, setActiveHealthTab, setSelectedDate, changeDateBy,
  toggleMoreMenu,
} = uiSlice.actions;

export default uiSlice.reducer;