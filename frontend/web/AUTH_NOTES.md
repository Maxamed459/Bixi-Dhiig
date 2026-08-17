# Bixi-Dhiig Web — Auth System Notes

## Setup

```bash
# from the web/ folder
npm install
cp .env.local.example .env.local   # already done for you; edit if your API runs elsewhere
npm run dev
```

The packages this auth system needs (already installed in this project):

```bash
npm install react-hook-form @hookform/resolvers zod @tanstack/react-query axios sonner \
  class-variance-authority clsx tailwind-merge lucide-react \
  @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-select
```

## Folder structure

```
web/
  app/
    layout.tsx                # Providers + Toaster, root HTML shell
    page.tsx                  # "/" -> redirects straight to /login
    login/page.tsx
    register/page.tsx
    verify-email/page.tsx
    unauthorized/page.tsx
    dashboard/
      layout.tsx               # Protected shell: sidebar + role guard
      page.tsx                 # Dashboard home
      profile/page.tsx
  components/
    ui/                        # button, input, label, card, select, badge, sonner, form-field
    layout/sidebar.tsx
  hooks/
    useAuth.ts
    useRequireAuth.ts
  providers/
    auth-provider.tsx          # Session bootstrap, login/register/verify/logout
    query-provider.tsx         # TanStack Query client
  lib/
    api-client.ts               # Axios instance + refresh-on-401 interceptor
    auth-api.ts                  # POST /auth/login, /register, /verify, /resend-code
    auth-store.ts                 # External store: { user, accessToken } (memory only)
    role-guard.ts                  # DASHBOARD_ROLES + isAllowedRole()
    validation.ts                   # Zod schemas for the 3 forms
    get-error-message.ts             # Normalizes Axios errors into a toast-friendly string
    types.ts                          # User, AuthPayload, ApiEnvelope
  .env.local.example
```

## How the auth flow works

- **Access token** lives only in a module-level variable (`lib/auth-store.ts`) — never in
  `localStorage`, `sessionStorage`, or a JS-readable cookie. `AuthProvider` subscribes to
  this store via `useSyncExternalStore` so React re-renders when it changes, and
  `lib/api-client.ts` reads from the same store to attach `Authorization: Bearer <token>`
  to every request.
- **Refresh token** is entirely backend-owned: an HttpOnly cookie your browser sends
  automatically (`withCredentials: true` on the Axios instance). The frontend never touches it.
- **Session bootstrap**: on every app load, `AuthProvider` calls `POST /auth/refresh-token`
  once. If it succeeds, the user is silently signed back in; if not, they land on `/login`.
- **401 handling**: any authenticated request that gets a 401 triggers one automatic
  refresh-and-retry via the Axios response interceptor. If the refresh also fails, the
  user is logged out.
- **Role gate**: `lib/role-guard.ts` defines `DASHBOARD_ROLES = ["admin", "hospital"]`.
  - On login, if `user.role` isn't in that list, the session is cleared, a toast fires, and
    the user is sent to `/unauthorized` (not the dashboard).
  - `useRequireAuth()` (used in `app/dashboard/layout.tsx`) re-checks this on every
    protected route mount — so a role change or a tampered/stale session can't sneak in.

## Backend assumptions — please confirm/adjust

1. **Response envelope**: every endpoint is assumed to return
   `{ success, message, data: { ... } }`. `unwrap()` in `lib/auth-api.ts` and
   `refreshAccessToken()` in `lib/api-client.ts` fall back to the raw body if `data` is
   missing, so a flat response shape (`{ user, accessToken }` directly) also works without
   changes.
2. **`role` field on the user object** — must be one of `"admin" | "hospital" | "user"`.
   This is the single field the entire access-control system relies on.
3. **`POST /auth/login`** returns `{ user, accessToken }`.
4. **`POST /auth/register`** returns `{ user, accessToken }` — i.e. the account is created
   *and* logged in (unverified) in one step, since `/auth/verify` is called with a bearer
   token and there's no email/userId field sent alongside the code. If your backend instead
   requires a separate login after registering, tell me and I'll adjust `register()` to
   redirect to `/login` with a "check your email" toast instead.
5. **`POST /auth/verify`** body is `{ submittedCode }`, authenticated via the bearer token
   from step 3/4, and returns the updated `{ user }` (with `isVerified: true` / a valid `role`).
6. **`POST /auth/resend-code`** is also authenticated via the bearer token (no body needed).
7. **`POST /auth/refresh-token`** ideally returns `{ accessToken, user }`. There's no
   `GET /auth/me` in the provided endpoint list, so `user` is only restored on page reload
   if the refresh endpoint includes it. If it only returns `accessToken`, session restore on
   reload will still refresh the token, but `user` (and therefore the role gate) won't be
   populated until the next explicit login/verify — add a `/auth/me` endpoint if you want
   this fixed properly.
8. **CORS**: since cookies are used for the refresh token, your backend needs
   `Access-Control-Allow-Credentials: true` and an explicit (non-`*`) `Access-Control-Allow-Origin`
   matching your frontend's origin.
9. There's no logout endpoint in the provided list, so `logout()` only clears local state —
   the refresh-token cookie will keep working until it expires. Add a `POST /auth/logout`
   that clears the cookie server-side if you want a true logout.

## Things you'll likely want next

- A `GET /auth/me` (or equivalent) endpoint, per point 7 above.
- A `POST /auth/logout` endpoint, per point 9 above.
- Wire the dashboard's stat cards (`app/dashboard/page.tsx`) up to real endpoints once you
  build the blood-request/donor APIs.
