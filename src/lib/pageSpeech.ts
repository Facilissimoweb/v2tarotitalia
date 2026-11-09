import { useSyncExternalStore } from "react";
import { isNaturalSpeechVoice, selectSpeechVoice } from "./speechVoice";

/**
 * Lettura vocale della pagina: solo `window.speechSynthesis`, voci già presenti
 * nel sistema. Nessun servizio esterno. I brani restano entro una frase o due,
 * così l’intonazione non si spezza e Chrome non tronca la coda.
 */

export type SpeechStatus = "idle" | "speaking" | "paused" | "unsupported";

type State = {
  status: SpeechStatus;
  message: "none" | "empty";
};

const DEFAULT: State = { status: "idle", message: "none" };
const UNSUPPORTED: State = { status: "unsupported", message: "none" };
const CHUNK = 340;
/** Chrome sospende la sintesi dopo circa 15 secondi se il motore non viene risvegliato. */
const KEEP_ALIVE_MS = 10_000;
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "BUTTON", "SELECT", "TEXTAREA", "NAV", "IFRAME"]);

let state: State = { ...DEFAULT };
const listeners = new Set<() => void>();
let queue: string[] = [];
let index = 0;
/** Chrome: senza un riferimento vivo l’utterance viene raccolta e la voce si interrompe. */
const hold: { utterance: SpeechSynthesisUtterance | null } = { utterance: null };
let voicesReady = false;
let voicesSettled = false;
let keepAlive = 0;
let runToken = 0;
let activeVoice: SpeechSynthesisVoice | undefined;

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
  return selectSpeechVoice(synth()?.getVoices() ?? [], lang);
}

function stopKeepAlive() {
  if (!keepAlive) return;
  window.clearInterval(keepAlive);
  keepAlive = 0;
}

function startKeepAlive() {
  stopKeepAlive();
  keepAlive = window.setInterval(() => {
    const engine = synth();
    if (!engine || state.status !== "speaking") return;
    if (engine.speaking && !engine.paused) engine.resume();
  }, KEEP_ALIVE_MS);
}

function primeVoices() {
  const engine = synth();
  if (!engine) return Promise.resolve();
  const naturalReady = () => isNaturalSpeechVoice(selectSpeechVoice(engine.getVoices(), speechLang()));
  if (voicesSettled || naturalReady()) {
    voicesSettled = true;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      voicesSettled = true;
      engine.removeEventListener("voiceschanged", onChange);
      resolve();
    };
    const onChange = () => {
      if (naturalReady()) finish();
    };
    engine.addEventListener("voiceschanged", onChange);
    engine.getVoices();
    if (naturalReady()) finish();
    else window.setTimeout(finish, 500);
  });
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
      let rest = piece;
      while (rest.length > CHUNK) {
        const slice = rest.slice(0, CHUNK);
        const cut = Math.max(slice.lastIndexOf(" "), slice.lastIndexOf(","), slice.lastIndexOf(";"));
        const at = cut > 40 ? cut : CHUNK;
        out.push(rest.slice(0, at).trim());
        rest = rest.slice(at).trim();
      }
      if (rest) out.push(rest);
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
    hold.utterance = null;
    stopKeepAlive();
    commit({ status: "idle", message: "none" });
    return;
  }

  const utterance = new SpeechSynthesisUtterance(queue[index]);
  const lang = speechLang();
  utterance.lang = lang;
  utterance.rate = isNaturalSpeechVoice(activeVoice) ? 1 : 0.94;
  utterance.pitch = 1;
  utterance.volume = 1;
  if (activeVoice) utterance.voice = activeVoice;

  utterance.onend = () => {
    if (state.status !== "speaking") return;
    index += 1;
    speakNext();
  };
  utterance.onerror = (event) => {
    if (event.error === "interrupted" || event.error === "canceled") return;
    stopKeepAlive();
    hold.utterance = null;
    queue = [];
    index = 0;
    commit({ status: "idle", message: "none" });
  };

  hold.utterance = utterance;
  engine.speak(hold.utterance);
}

function ensureVoices() {
  const engine = synth();
  if (!engine || voicesReady) return;
  voicesReady = true;
  const refresh = () => {
    if (state.status === "speaking" || state.status === "paused") return;
    activeVoice = pickVoice(speechLang());
  };
  engine.addEventListener("voiceschanged", refresh);
  refresh();
}

async function startFromMain() {
  if (!speechSupported()) {
    commit({ status: "unsupported", message: "none" });
    return;
  }
  const run = ++runToken;
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
  await primeVoices();
  if (run !== runToken || state.status !== "speaking") return;
  activeVoice = pickVoice(speechLang());
  startKeepAlive();
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
    stopKeepAlive();
    synth()?.pause();
    commit({ status: "paused", message: "none" });
  },
  resume() {
    if (state.status !== "paused") return;
    const engine = synth();
    if (!engine) return;
    commit({ status: "speaking", message: "none" });
    startKeepAlive();
    if (engine.paused) engine.resume();
    else speakNext();
  },
  stop() {
    runToken += 1;
    stopKeepAlive();
    const engine = synth();
    if (engine) {
      if (engine.paused) engine.resume();
      engine.cancel();
    }
    hold.utterance = null;
    queue = [];
    index = 0;
    activeVoice = undefined;
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
