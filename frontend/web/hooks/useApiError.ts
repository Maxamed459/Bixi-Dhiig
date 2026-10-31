"use client";

import { useCallback } from "react";
import { isAxiosError } from "axios";
import { useI18n } from "@/lib/i18n/context";
import { dictionaries } from "@/lib/i18n";

/**
 * Turns an API error into a message in the active language. Known backend messages
 * (English strings, see `server.*` in the dictionaries) are translated; anything else
 * falls back to the provided translation key / the server's own text.
 */
export function useApiError() {
  const { t } = useI18n();

  return useCallback(
    (error: unknown, fallbackKey: string = "common.somethingWrong"): string => {
      if (isAxiosError(error)) {
        const message = (error.response?.data as { message?: unknown } | undefined)?.message;
        if (typeof message === "string") {
          const slug = Object.entries(dictionaries.en.server).find(([, text]) => text === message)?.[0];
          if (slug) return t(`server.${slug}`);
          return t(fallbackKey);
        }
        return t(fallbackKey);
      }
      if (error instanceof Error && error.message && error.message !== "ROLE_NOT_ALLOWED") {
        return t(fallbackKey);
      }
      return t(fallbackKey);
    },
    [t],
  );
}
