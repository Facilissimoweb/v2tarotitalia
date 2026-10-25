import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../../../context/AuthContext";
import { loadIthaReadings } from "../lib/client.ts";
import type { IthaReading } from "../lib/types.ts";

type IthaContextValue = {
  open: boolean;
  readings: IthaReading[];
  openItha: () => void;
  closeItha: () => void;
  refreshItha: () => Promise<void>;
};

const IthaContext = createContext<IthaContextValue | null>(null);

export function IthaProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [readings, setReadings] = useState<IthaReading[]>([]);

  const refreshItha = useCallback(async () => {
    if (!session) {
      setReadings([]);
      return;
    }
    setReadings(await loadIthaReadings());
  }, [session]);

  useEffect(() => {
    void refreshItha();
  }, [refreshItha]);

  const value = useMemo<IthaContextValue>(
    () => ({
      open,
      readings,
      openItha: () => setOpen(true),
      closeItha: () => setOpen(false),
      refreshItha,
    }),
    [open, readings, refreshItha],
  );

  return <IthaContext.Provider value={value}>{children}</IthaContext.Provider>;
}

export function useItha() {
  const ctx = useContext(IthaContext);
  if (!ctx) throw new Error("useItha deve vivere dentro IthaProvider");
  return ctx;
}
