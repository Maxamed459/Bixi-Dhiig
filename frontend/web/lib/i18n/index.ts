import { en, type Dictionary } from "./en";
import { so } from "./so";

export type Locale = "en" | "so";
export const LOCALES: Locale[] = ["en", "so"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "bixi-lang";
export const LOCALE_STORAGE_KEY = "bixi-dhiig.lang";

export type { Dictionary };

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<Dictionary>;

export const dictionaries: Record<Locale, Dictionary> = { en, so };

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "so";
}

/** BCP-47 tag to use with toLocaleString / Intl for the given UI language. */
export const dateLocale = (locale: Locale) => (locale === "so" ? "so-SO" : "en-US");

function lookup(dict: Dictionary, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>((acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined), dict);
  return typeof value === "string" ? value : undefined;
}

/**
 * Looks `key` up in the active dictionary (falling back to English). If the key doesn't
 * exist the string is returned untouched — that's deliberate: server messages and
 * already-translated text can flow through t() safely.
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const text = lookup(dictionaries[locale], key) ?? lookup(en, key) ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`));
}
