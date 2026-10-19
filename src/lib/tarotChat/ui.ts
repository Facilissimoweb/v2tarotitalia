/** Stato UI condiviso: apre/chiude la chat e nasconde il contact dock. */
let open = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const tarotChatUi = {
  getOpen() {
    return open;
  },
  setOpen(next: boolean) {
    if (open === next) return;
    open = next;
    emit();
  },
  toggle() {
    open = !open;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
