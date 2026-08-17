# Bixi-Dhiig Web — Auth System Notes (v2: Redux Toolkit + Google auth)

## What changed from v1

- **React Context → Redux Toolkit.** `providers/auth-provider.tsx`, `lib/auth-store.ts`,
  `lib/auth-api.ts`, and `lib/api-client.ts` are gone. Auth state now lives in
  `store/features/authSlice.ts` and is read via `store/hooks.ts` (`useAppSelector` /
  `useAppDispatch`).
- **`hooks/useAuth.ts` and `hooks/useRequireAuth.ts` keep the same public shape** as before
  (`login`, `register`, `verify`, `resendCode`, `logout`, `user`, `isAuthenticated`,
  `isLoading`) — only their internals changed, from Context to Redux. Nothing in
  `components/layout/sidebar.tsx`, `app/dashboard/page.tsx`, `app/dashboard/profile/page.tsx`,
  or `app/verify-email/page.tsx` needed to change as a result.
- **Register endpoint changed** to `POST /auth/register-hospital` (was `/auth/register`).
- **Login/Register UI rebuilt** as a two-column `AuthLayout` (brand panel + form card),
  with the form logic extracted into standalone `LoginForm` / `RegisterForm` components.
- **"Continue with Google" added** to both `/login` and `/register` via a shared
  `GoogleAuthButton` — pure redirect to `NEXT_PUBLIC_GOOGLE_AUTH_URL`, no client-side faking.

## Setup

```bash
npm install
cp .env.local.example .env.local   # already set up for local dev
npm run dev
```

New packages this update added on top of the previous auth system:

```bash
npm install @reduxjs/toolkit react-redux
```

## Folder structure (additions/changes only — see previous notes for the rest)

```
web/
  store/
    store.ts                  # configureStore({ auth: authReducer })
    hooks.ts                  # useAppDispatch / useAppSelector (typed)
    features/
      authSlice.ts             # user, accessToken, isAuthenticated, status
  providers/
    ReduxProvider.tsx          # <Provider store={store}> + session bootstrap
    query-provider.tsx         # unchanged (TanStack Query)
  components/
    auth/
      AuthLayout.tsx            # two-column shell (brand panel + form slot)
      GoogleAuthButton.tsx        # redirects to NEXT_PUBLIC_GOOGLE_AUTH_URL
      LoginForm.tsx
      RegisterForm.tsx
  lib/
    api.ts                     # Axios instance, reads/writes the Redux store directly
    auth.ts                    # POST /auth/login, /register-hospital, /verify, /resend-code
    role-guard.ts, validation.ts, types.ts, get-error-message.ts, utils.ts  (unchanged)
  hooks/
    useAuth.ts                  # Redux-backed (was Context-backed)
    useRequireAuth.ts            # Redux-backed (was Context-backed)
  app/
    login/page.tsx               # AuthLayout + LoginForm
    register/page.tsx             # AuthLayout + RegisterForm
    dashboard/layout.tsx            # unchanged, still calls useRequireAuth()
```

## How auth state flows now

- `authSlice` holds `{ user, accessToken, isAuthenticated, status }`.
  `status` is `"idle" | "loading" | "succeeded" | "failed"` and is what `isLoading` is
  derived from in both hooks.
- `lib/api.ts` imports the Redux `store` directly (not via a hook, since Axios interceptors
  run outside React) to read the current `accessToken` on every request, and to dispatch
  `setCredentials` / `setAccessToken` / `logout` when a silent refresh succeeds or fails.
- `providers/ReduxProvider.tsx` wraps the whole app and, on mount, dispatches
  `setStatus("loading")` then calls `refreshAccessToken()` — this is the "silent session
  restore" that runs on every page load, including a fresh landing after Google OAuth
  redirects back.
- `hooks/useAuth.ts` wraps `useAppDispatch`/`useAppSelector` and the `lib/auth.ts` request
  functions into the same convenience API the pages already used.
- `hooks/useRequireAuth.ts` (used in `app/dashboard/layout.tsx`) reads `isAuthenticated` /
  `user.role` from Redux and redirects to `/login` (no session) or `/unauthorized` + logout
  (wrong role) exactly as before.

## Google auth — how it's wired and what's still open

- `GoogleAuthButton` does a **full browser redirect** to `NEXT_PUBLIC_GOOGLE_AUTH_URL`
  (`http://localhost:5000/api/v1/auth/google` by default). It does not call Google or fake
  any part of the exchange client-side — the backend owns the entire flow.
- There's a `TODO(backend-google-oauth)` comment directly in
  `components/auth/GoogleAuthButton.tsx` marking where callback handling should be added if
  needed.
- **Backend assumption**: after Google auth completes, the backend must set its usual
  HttpOnly refresh-token cookie and then **redirect the browser back into this app**
  (e.g. to `${FRONTEND_URL}/dashboard` on success, `${FRONTEND_URL}/login?error=...` on
  failure). As long as it lands on any page in this app, `ReduxProvider`'s session bootstrap
  will call `POST /auth/refresh-token` automatically and populate Redux — **no dedicated
  `/auth/google/callback` page should be necessary** with this design.
- If your backend instead appends `accessToken`/`user` as query params on the redirect
  (rather than only using the cookie), that needs a small callback route added to read them
  and `dispatch(setCredentials(...))` — flag this to me and I'll add it.
- Same role gate applies to Google sign-ins as password sign-ins: whatever role comes back
  from the session-restore, `useRequireAuth` / the login-page redirect check still enforce
  `admin`/`hospital` only. Per your decision, a Google sign-in that doesn't match an existing
  hospital/admin account should be **rejected by the backend** (not auto-created) — make sure
  `/auth/google` implements that on its end, since the frontend has no way to intervene
  mid-redirect.

## Backend assumptions carried over / updated

1. **Response envelope**: `{ success, message, data: {...} }`, with a fallback to a flat
   body if `data` is absent (`lib/auth.ts`'s `unwrap()`, `lib/api.ts`'s refresh handler).
2. **`role` field on the user object** is required and must be one of
   `"admin" | "hospital" | "user"` — the whole access-control system depends on it, for both
   password and Google sign-ins.
3. **`POST /auth/login`** → `{ user, accessToken }`.
4. **`POST /auth/register-hospital`** → `{ user, accessToken }` (issues a token immediately
   since `/auth/verify` is called with a bearer token, no email/userId in the body).
5. **`POST /auth/verify`** body `{ submittedCode }`, bearer-authenticated, returns
   `{ user }`.
6. **`POST /auth/resend-code`** bearer-authenticated, no body needed.
7. **`POST /auth/refresh-token`** ideally returns `{ accessToken, user }` — there's still no
   `GET /auth/me` in the endpoint list, so `user` is only restored on reload/OAuth-return if
   this endpoint includes it.
8. **CORS**: `Access-Control-Allow-Credentials: true` + an explicit non-`*` origin, required
   for the refresh-token cookie to work across requests.
9. **No logout endpoint** provided — `logout()` only clears Redux state client-side; the
   refresh-token cookie keeps working until it expires unless you add `POST /auth/logout`.
