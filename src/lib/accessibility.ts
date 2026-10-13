import { useSyncExternalStore } from "react";

/**
 * Facilitazione visiva: preferenze salvate in localStorage e applicate all'elemento <html>.
 * - dimensione testo: percentuale sul font-size radice (il sito è in rem, quindi scala tutto);
 * - alto contrasto / font ad alta leggibilità / spaziatura: attributi `data-a11y-*` letti da `index.css`.
 */

export const SIZE_STEPS = [87.5, 100, 112.5, 125, 137.5, 150] as const;
const DEFAULT_SIZE = 1;
const STORAGE_KEY = "tarotitalia.accessibilita.v1";

export type A11yPrefs = {
  /** Indice in `SIZE_STEPS`. */
  size: number;
  contrast: boolean;
  font: boolean;
  spacing: boolean;
};

const DEFAULTS: A11yPrefs = { size: DEFAULT_SIZE, contrast: false, font: false, spacing: false };

type State = A11yPrefs & { open: boolean };

function read(): A11yPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const data = JSON.parse(raw) as Partial<A11yPrefs>;
    const size = Number.isInteger(data.size) ? Math.min(Math.max(data.size as number, 0), SIZE_STEPS.length - 1) : DEFAULT_SIZE;
    return { size, contrast: data.contrast === true, font: data.font === true, spacing: data.spacing === true };
  } catch {
    return { ...DEFAULTS };
  }
}

function write(prefs: A11yPrefs) {
  try {
    if (isDefault(prefs)) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage non disponibile: le preferenze valgono per la sessione */
  }
}

export function isDefault(p: A11yPrefs) {
  return p.size === DEFAULT_SIZE && !p.contrast && !p.font && !p.spacing;
}

let fontRequested = false;
function loadReadableFont() {
  if (fontRequested) return;
  fontRequested = true;
  // Atkinson Hyperlegible (Google Fonts, servito dal sito): caricato solo quando serve.
  void import("@fontsource/atkinson-hyperlegible/latin-400.css");
  void import("@fontsource/atkinson-hyperlegible/latin-700.css");
}

function apply(p: A11yPrefs) {
  const root = document.documentElement;
  if (p.size === DEFAULT_SIZE) root.style.removeProperty("font-size");
  else root.style.fontSize = `${SIZE_STEPS[p.size]}%`;
  const flag = (name: string, on: boolean) => {
    if (on) root.setAttribute(name, "on");
    else root.removeAttribute(name);
  };
  flag("data-a11y-contrast", p.contrast);
  flag("data-a11y-font", p.font);
  flag("data-a11y-spacing", p.spacing);
  if (p.font) loadReadableFont();
}

let state: State = { ...DEFAULTS, open: false };
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  listeners.forEach((fn) => fn());
}

function update(patch: Partial<A11yPrefs>) {
  const { open, ...prefs } = state;
  const next = { ...prefs, ...patch };
  apply(next);
  write(next);
  commit({ ...next, open });
}

/** Da chiamare una sola volta all'avvio, prima del render, per evitare lampi di stile. */
export function initAccessibility() {
  const prefs = read();
  apply(prefs);
  state = { ...prefs, open: false };
}

export const a11y = {
  setSize: (size: number) => update({ size: Math.min(Math.max(size, 0), SIZE_STEPS.length - 1) }),
  toggle: (key: "contrast" | "font" | "spacing") => update({ [key]: !state[key] }),
  reset: () => update({ ...DEFAULTS }),
  setOpen: (open: boolean) => commit({ ...state, open }),
};

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useAccessibility(): State {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
