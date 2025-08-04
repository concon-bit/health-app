// src/redux/userSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserProfile, saveUserProfile } from '../services/firebaseService';

// [非同期処理] ユーザープロファイルを取得
export const fetchProfile = createAsyncThunk('user/fetchProfile', async (userId) => {
  const profile = await fetchUserProfile(userId);
  return profile;
});

// [非同期処理] ユーザープロファイルを保存
export const saveProfile = createAsyncThunk('user/saveProfile', async ({ userId, profileData }) => {
  await saveUserProfile(userId, profileData);
  return profileData;
});

const initialState = {
  currentUser: null,
  profile: {
    weight: '', // ユーザーの体重
  },
  loading: true,
  profileLoading: 'idle',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.currentUser = action.payload;
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.profileLoading = 'pending';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileLoading = 'succeeded';
        if (action.payload) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.profile = { ...state.profile, ...action.payload };
      });
  },
});

export const { setUser, setLoading } = userSlice.actions;
export default userSlice.reducer;