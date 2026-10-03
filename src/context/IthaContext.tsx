import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { loadIthaCredits, loadIthaReadings } from "../lib/itha/client.ts";
import { grantDevCredits, isIthaDev, readDevCredits, readDevReadings } from "../lib/itha/dev.ts";
import { ithaDemoAccess } from "../lib/itha/types.ts";
import type { IthaReading } from "../lib/itha/types.ts";

type IthaContextValue = {
  open: boolean;
  credits: number;
  readings: IthaReading[];
  openItha: () => void;
  closeItha: () => void;
  refreshItha: () => Promise<void>;
  setCredits: (n: number) => void;
  simulateCredits: () => number;
};

const IthaContext = createContext<IthaContextValue | null>(null);

export function IthaProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState(0);
  const [readings, setReadings] = useState<IthaReading[]>([]);

  const refreshItha = useCallback(async () => {
    if (!session && !isIthaDev() && !ithaDemoAccess()) {
      setCredits(0);
      setReadings([]);
      return;
    }
    const [nextCredits, nextReadings] = await Promise.all([loadIthaCredits(), loadIthaReadings()]);
    setCredits(isIthaDev() ? Math.max(nextCredits, readDevCredits()) : nextCredits);
    setReadings(nextReadings);
  }, [session]);

  const simulateCredits = useCallback(() => {
    if (!isIthaDev()) return 0;
    const next = grantDevCredits();
    setCredits(next);
    setReadings(readDevReadings());
    return next;
  }, []);

  useEffect(() => {
    void refreshItha();
  }, [refreshItha]);

  const value = useMemo<IthaContextValue>(
    () => ({
      open,
      credits,
      readings,
      openItha: () => setOpen(true),
      closeItha: () => setOpen(false),
      refreshItha,
      setCredits,
      simulateCredits,
    }),
    [open, credits, readings, refreshItha, simulateCredits],
  );

  return <IthaContext.Provider value={value}>{children}</IthaContext.Provider>;
}

export function useItha() {
  const ctx = useContext(IthaContext);
  if (!ctx) throw new Error("useItha deve vivere dentro IthaProvider");
  return ctx;
}
