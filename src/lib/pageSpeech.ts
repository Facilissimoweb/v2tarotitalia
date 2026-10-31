import { useSyncExternalStore } from "react";

/**
 * Lettura vocale della pagina: solo `window.speechSynthesis`, nessuna dipendenza.
 * Legge il contenuto di `main`, a pezzi, per evitare il taglio di Chrome sulle utterance lunghe.
 */

export type SpeechStatus = "idle" | "speaking" | "paused" | "unsupported";

type State = {
  status: SpeechStatus;
  message: "none" | "empty";
};

const DEFAULT: State = { status: "idle", message: "none" };
const UNSUPPORTED: State = { status: "unsupported", message: "none" };
const CHUNK = 180;
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "BUTTON", "SELECT", "TEXTAREA", "NAV", "IFRAME"]);

let state: State = { ...DEFAULT };
const listeners = new Set<() => void>();
let queue: string[] = [];
let index = 0;
let current: SpeechSynthesisUtterance | null = null;
let voicesReady = false;

function emit() {
  listeners.forEach((fn) => fn());
}

function commit(next: State) {
  if (state.status === next.status && state.message === next.message) return;
  state = next;
  emit();
}

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

export function speechSupported() {
  return Boolean(synth() && typeof SpeechSynthesisUtterance !== "undefined");
}

function speechLang() {
  const raw = document.documentElement.lang?.trim() || "it-IT";
  if (raw === "it") return "it-IT";
  return raw;
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const list = synth()?.getVoices() ?? [];
  if (!list.length) return undefined;
  const wanted = lang.toLowerCase().replace("_", "-");
  const prefix = wanted.slice(0, 2);
  return (
    list.find((v) => v.lang.replace("_", "-").toLowerCase() === wanted) ||
    list.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix) && v.default) ||
    list.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix))
  );
}

function skipNode(el: Element | null) {
  if (!el) return true;
  if (el.closest("[data-nospeech], [aria-hidden='true'], [hidden]")) return true;
  if ((el as HTMLElement).hidden) return true;
  return false;
}

/** Testo visibile del contenuto principale: paragrafi, titoli, alternative delle immagini. */
export function extractMainText() {
  const root = document.querySelector("main");
  if (!root) return "";
  const parts: string[] = [];

  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.replace(/\s+/g, " ").trim();
      if (text) parts.push(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    if (SKIP.has(el.tagName) || skipNode(el)) return;
    if (el.tagName === "IMG") {
      const alt = el.getAttribute("alt")?.trim();
      if (alt) parts.push(alt);
      return;
    }
    for (const child of el.childNodes) visit(child);
  };

  visit(root);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function chunkText(text: string) {
  const sentences = text.match(/[^.!?…]+(?:[.!?…]+|$)/g) ?? [text];
  const out: string[] = [];
  let buf = "";

  const flush = () => {
    if (buf) out.push(buf);
    buf = "";
  };

  const pushPiece = (piece: string) => {
    if (!piece) return;
    if (piece.length > CHUNK) {
      flush();
      for (let i = 0; i < piece.length; i += CHUNK) out.push(piece.slice(i, i + CHUNK).trim());
      return;
    }
    if (!buf) {
      buf = piece;
      return;
    }
    if (buf.length + 1 + piece.length <= CHUNK) buf = `${buf} ${piece}`;
    else {
      flush();
      buf = piece;
    }
  };

  for (const raw of sentences) pushPiece(raw.replace(/\s+/g, " ").trim());
  flush();
  return out.filter(Boolean);
}

function speakNext() {
  const engine = synth();
  if (!engine) return;
  if (index >= queue.length) {
    current = null;
    commit({ status: "idle", message: "none" });
    return;
  }

  const utterance = new SpeechSynthesisUtterance(queue[index]);
  const lang = speechLang();
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;

  utterance.onend = () => {
    if (state.status !== "speaking") return;
    index += 1;
    speakNext();
  };
  utterance.onerror = (event) => {
    if (event.error === "interrupted" || event.error === "canceled") return;
    current = null;
    queue = [];
    index = 0;
    commit({ status: "idle", message: "none" });
  };

  current = utterance;
  engine.speak(utterance);
}

function ensureVoices() {
  const engine = synth();
  if (!engine || voicesReady) return;
  voicesReady = true;
  engine.addEventListener("voiceschanged", () => {
    /* le voci arrivano in ritardo su Chromium: al prossimo speak si usano */
  });
}

function startFromMain() {
  if (!speechSupported()) {
    commit({ status: "unsupported", message: "none" });
    return;
  }
  ensureVoices();
  const text = extractMainText();
  if (!text) {
    commit({ status: "idle", message: "empty" });
    return;
  }
  synth()?.cancel();
  queue = chunkText(text);
  index = 0;
  commit({ status: "speaking", message: "none" });
  speakNext();
}

export const pageSpeech = {
  play() {
    if (state.status === "paused") {
      pageSpeech.resume();
      return;
    }
    if (state.status === "speaking") return;
    startFromMain();
  },
  pause() {
    if (state.status !== "speaking") return;
    synth()?.pause();
    commit({ status: "paused", message: "none" });
  },
  resume() {
    if (state.status !== "paused") return;
    const engine = synth();
    if (!engine) return;
    commit({ status: "speaking", message: "none" });
    if (engine.paused) engine.resume();
    else speakNext();
  },
  stop() {
    const engine = synth();
    if (engine) {
      if (engine.paused) engine.resume();
      engine.cancel();
    }
    current = null;
    queue = [];
    index = 0;
    if (state.status === "unsupported") return;
    commit({ status: "idle", message: "none" });
  },
  toggle() {
    if (state.status === "speaking" || state.status === "paused") pageSpeech.stop();
    else pageSpeech.play();
  },
};

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getSnapshot() {
  if (!speechSupported()) return UNSUPPORTED;
  return state;
}

export function usePageSpeech(): State {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT);
}
