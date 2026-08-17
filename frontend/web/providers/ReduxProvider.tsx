"use client";

import { useEffect, type ReactNode } from "react";
import { Provider, useDispatch } from "react-redux";
import { store, type AppDispatch } from "@/store/store";
import { setStatus } from "@/store/features/authSlice";
import { refreshAccessToken } from "@/lib/api";

/**
 * Runs once on app load, inside the Redux <Provider>, to silently restore a
 * session using the backend's HttpOnly refresh-token cookie. This is what
 * keeps a user signed in across a page reload — and it's also what picks up
 * the session automatically when the browser is redirected back from the
 * backend's Google OAuth flow (see components/auth/GoogleAuthButton.tsx).
 *
 * refreshAccessToken() (lib/api.ts) already dispatches setCredentials /
 * setAccessToken / logout — each of which sets `status` to "succeeded" or
 * "failed" — so this component only needs to flip `status` to "loading"
 * before kicking it off.
 */
function SessionBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setStatus("loading"));
    void refreshAccessToken();
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <SessionBootstrap>{children}</SessionBootstrap>
    </Provider>
  );
}
