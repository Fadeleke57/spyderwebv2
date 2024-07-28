import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '../index';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<any>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export const selectAuth = (state: AppState) => state.auth;

export default authSlice.reducer;