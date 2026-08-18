import { configureStore } from "@reduxjs/toolkit";
import { savePersistedAuthState } from "@/lib/auth-storage";
import authReducer from "./features/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

store.subscribe(() => {
  const { user, accessToken } = store.getState().auth;
  savePersistedAuthState({ user, accessToken });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
