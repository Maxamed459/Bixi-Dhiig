import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/lib/types";

export type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Full login/register success: sets user + token together. */
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.status = "succeeded";
    },
    /** Used after a silent /auth/refresh-token call that only returns a new token. */
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      state.status = "succeeded";
    },
    /** Updates the user object without touching the token (e.g. after /auth/verify). */
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    /** Tracks the session-bootstrap lifecycle (used by ReduxProvider on app load). */
    setStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.status = "failed";
    },
  },
});

export const { setCredentials, setAccessToken, setUser, setStatus, logout } = authSlice.actions;
export default authSlice.reducer;
