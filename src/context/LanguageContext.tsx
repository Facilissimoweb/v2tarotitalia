import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LANGUAGE_QUERY_KEY,
  SITE_SOURCE_LANG,
  hreflangCode,
  isRtlLanguage,
  resolveOutputLanguage,
} from "../lib/language";
import { applyDocumentLanguage } from "../lib/locale";
import { applyLanguage, resetLanguage, storedLanguage } from "../lib/translate";

type LanguageContextValue = {
  language: string;
  setLanguage: (code: string | null) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function queryLanguage() {
  try {
    return new URLSearchParams(window.location.search).get(LANGUAGE_QUERY_KEY);
  } catch {
    return null;
  }
}

function writeLanguageQuery(code: string) {
  try {
    const url = new URL(window.location.href);
    if (code === SITE_SOURCE_LANG) url.searchParams.delete(LANGUAGE_QUERY_KEY);
    else url.searchParams.set(LANGUAGE_QUERY_KEY, code);
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
      window.history.replaceState(window.history.state, "", next);
    }
  } catch {
    /* ignore */
  }
}

function applyDocument(code: string) {
  applyDocumentLanguage(code, {
    rtl: isRtlLanguage(code),
    hreflang: hreflangCode(code),
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setStored] = useState(() =>
    resolveOutputLanguage(queryLanguage() ?? storedLanguage()),
  );

  useEffect(() => {
    applyDocument(language);
    writeLanguageQuery(language);
    if (language !== SITE_SOURCE_LANG) void applyLanguage(language);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (code) => {
        const next = resolveOutputLanguage(code);
        setStored(next);
        applyDocument(next);
        writeLanguageQuery(next);
        if (next === SITE_SOURCE_LANG) resetLanguage();
        else void applyLanguage(next);
      },
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage deve vivere dentro LanguageProvider");
  return ctx;
}
