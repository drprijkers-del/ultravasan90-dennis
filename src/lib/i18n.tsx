"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import nl from "../../messages/nl.json";
import sv from "../../messages/sv.json";

export type Locale = "nl" | "sv";

const messages: Record<Locale, typeof nl> = { nl, sv };

interface I18nContext {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nContext>({
  locale: "nl",
  setLocale: () => {},
  t: (k) => k,
});

/**
 * Resolve a dot-separated key like "home.countdown.days"
 * from the nested JSON structure.
 */
function resolve(obj: Record<string, unknown>, key: string): string {
  const parts = key.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return key;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : key;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("nl");

  useEffect(() => {
    const stored = localStorage.getItem("locale");
    if (stored === "nl" || stored === "sv") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string) => resolve(messages[locale] as unknown as Record<string, unknown>, key),
    [locale]
  );

  return (
    <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>
  );
}

export function useI18n() {
  return useContext(Ctx);
}

export function useT() {
  return useContext(Ctx).t;
}
