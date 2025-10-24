// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import userReducer from './userSlice';
import logsReducer from './logsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    user: userReducer,
    logs: logsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});