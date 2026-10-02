import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type RitualisticaContextValue = {
  open: boolean;
  tipoId: string | null;
  openRitualistica: (tipoId?: string) => void;
  closeRitualistica: () => void;
};

const RitualisticaContext = createContext<RitualisticaContextValue | null>(null);

export function RitualisticaProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tipoId, setTipoId] = useState<string | null>(null);

  const openRitualistica = useCallback((nextTipo?: string) => {
    setTipoId(nextTipo ?? null);
    setOpen(true);
  }, []);

  const closeRitualistica = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ open, tipoId, openRitualistica, closeRitualistica }),
    [open, tipoId, openRitualistica, closeRitualistica],
  );

  return <RitualisticaContext.Provider value={value}>{children}</RitualisticaContext.Provider>;
}

export function useRitualistica() {
  const ctx = useContext(RitualisticaContext);
  if (!ctx) throw new Error("useRitualistica deve vivere dentro RitualisticaProvider");
  return ctx;
}
