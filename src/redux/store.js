// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import userReducer from './userSlice';
import logsReducer from './logsSlice';
import periodReducer from './periodSlice';
import medicationReducer from './medicationSlice';
import exerciseReducer from './exerciseSlice'; // <<< [追加] exerciseSliceをインポート

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    user: userReducer,
    logs: logsReducer,
    period: periodReducer,
    medications: medicationReducer,
    exercise: exerciseReducer, // <<< [追加] reducerに登録
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});