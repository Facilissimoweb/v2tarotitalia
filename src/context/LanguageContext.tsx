import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SITE_SOURCE_LANG, resolveOutputLanguage } from "../lib/language";
import { applyLanguage, resetLanguage, restoreLanguage, storedLanguage } from "../lib/translate";

type LanguageContextValue = {
  language: string;
  setLanguage: (code: string | null) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setStored] = useState(() => resolveOutputLanguage(storedLanguage()));

  useEffect(() => {
    restoreLanguage();
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (code) => {
        const next = resolveOutputLanguage(code);
        setStored(next);
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
