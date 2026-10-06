import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { disableGA4, initGA4 } from "../lib/analytics";
import {
  ensureFirstSeen,
  saveConsentDecision,
  shouldPromptConsent,
  type ConsentRecord,
} from "../lib/consent";

type ConsentContextValue = {
  record: ConsentRecord | null;
  open: boolean;
  ready: boolean;
  reopen: () => void;
  dismiss: () => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  saveChoices: (stats: boolean, prefs: boolean) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = ensureFirstSeen();
    setRecord(current);
    setOpen(shouldPromptConsent(current));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !record?.decided) {
      disableGA4();
      return;
    }
    if (record.stats) initGA4();
    else disableGA4();
  }, [ready, record]);

  const value = useMemo<ConsentContextValue>(
    () => ({
      record,
      open,
      ready,
      reopen: () => setOpen(true),
      dismiss: () => setOpen(false),
      acceptAll: () => {
        setRecord(saveConsentDecision({ stats: true, prefs: true }));
        setOpen(false);
      },
      rejectOptional: () => {
        setRecord(saveConsentDecision({ stats: false, prefs: false }));
        setOpen(false);
      },
      saveChoices: (stats, prefs) => {
        setRecord(saveConsentDecision({ stats, prefs }));
        setOpen(false);
      },
    }),
    [record, open, ready],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent deve vivere dentro ConsentProvider");
  return ctx;
}