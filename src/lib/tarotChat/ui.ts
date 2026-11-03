/** Stato UI condiviso: apre/chiude la chat e nasconde il contact dock. */

type Store = {
  open: boolean;
  listeners: Set<() => void>;
};

const memory: Store = { open: false, listeners: new Set() };

function store(): Store {
  if (typeof window === "undefined") return memory;
  const w = window as Window & { __tarotChatUi?: Store };
  if (!w.__tarotChatUi) w.__tarotChatUi = { open: false, listeners: new Set() };
  return w.__tarotChatUi;
}

function emit(current: Store) {
  current.listeners.forEach((listener) => listener());
}

export const tarotChatUi = {
  getOpen() {
    return store().open;
  },
  setOpen(next: boolean) {
    const current = store();
    if (current.open === next) return;
    current.open = next;
    emit(current);
  },
  toggle() {
    const current = store();
    current.open = !current.open;
    emit(current);
  },
  subscribe(listener: () => void) {
    const current = store();
    current.listeners.add(listener);
    return () => {
      current.listeners.delete(listener);
    };
  },
};
