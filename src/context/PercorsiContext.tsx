import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type PercorsiContextValue = {
  open: boolean;
  tipoId: string | null;
  openPercorso: (tipoId?: string) => void;
  closePercorso: () => void;
};

const PercorsiContext = createContext<PercorsiContextValue | null>(null);

export function PercorsiProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tipoId, setTipoId] = useState<string | null>(null);

  const openPercorso = useCallback((nextTipo?: string) => {
    setTipoId(nextTipo ?? null);
    setOpen(true);
  }, []);

  const closePercorso = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ open, tipoId, openPercorso, closePercorso }),
    [open, tipoId, openPercorso, closePercorso],
  );

  return <PercorsiContext.Provider value={value}>{children}</PercorsiContext.Provider>;
}

export function usePercorsi() {
  const ctx = useContext(PercorsiContext);
  if (!ctx) throw new Error("usePercorsi deve vivere dentro PercorsiProvider");
  return ctx;
}
