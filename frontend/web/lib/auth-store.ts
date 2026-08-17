import type { User } from "./types";

/**
 * A tiny external store (outside React) that holds the current user and the
 * in-memory access token. It's kept outside of React context so the Axios
 * client (lib/api-client.ts) can read/write the access token without needing
 * a hook, while the AuthProvider subscribes to it via useSyncExternalStore
 * so components re-render on change.
 *
 * The access token deliberately never touches localStorage/sessionStorage or
 * a non-httpOnly cookie -> it only lives in this module's memory, which is
 * the safest place for it on the client.
 */

export interface AuthState {
  user: User | null;
  accessToken: string | null;
}

type Listener = () => void;

let state: AuthState = { user: null, accessToken: null };
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getAuthState(): AuthState {
  return state;
}

export function getAccessToken(): string | null {
  return state.accessToken;
}

export function setAuthState(next: Partial<AuthState>) {
  state = { ...state, ...next };
  emit();
}

export function clearAuthState() {
  state = { user: null, accessToken: null };
  emit();
}

export function subscribeAuthState(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
