import type { User } from "./types";

const AUTH_STORAGE_KEY = "bixi-dhiig.auth";

export interface PersistedAuthState {
  user: User | null;
  accessToken: string | null;
}

const emptyAuthState: PersistedAuthState = {
  user: null,
  accessToken: null,
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadPersistedAuthState(): PersistedAuthState {
  if (!isBrowser()) return emptyAuthState;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return emptyAuthState;

    const parsed = JSON.parse(raw) as Partial<PersistedAuthState>;

    return {
      user: parsed.user ?? null,
      accessToken:
        typeof parsed.accessToken === "string" ? parsed.accessToken : null,
    };
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return emptyAuthState;
  }
}

export function savePersistedAuthState(state: PersistedAuthState) {
  if (!isBrowser()) return;

  if (!state.accessToken) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

export function clearPersistedAuthState() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
