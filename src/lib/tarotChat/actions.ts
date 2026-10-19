export const TAROT_CHAT_ACTION_IDS = ["phone", "whatsapp", "telegram", "consulti", "percorsi"] as const;

export type TarotChatActionId = (typeof TAROT_CHAT_ACTION_IDS)[number];

const ACTION_SET = new Set<string>(TAROT_CHAT_ACTION_IDS);

/** Marker che il modello può appendere: [[CTA:phone,whatsapp,consulti]] */
const CTA_MARKER_RE = /\[\[\s*CTA\s*:\s*([a-zA-Z0-9_,\s]+)\]\]\s*$/i;

function normalizeIds(raw: string): TarotChatActionId[] {
  const seen = new Set<TarotChatActionId>();
  const out: TarotChatActionId[] = [];
  for (const part of raw.split(/[,|\s]+/)) {
    const id = part.trim().toLowerCase();
    if (!ACTION_SET.has(id) || seen.has(id as TarotChatActionId)) continue;
    seen.add(id as TarotChatActionId);
    out.push(id as TarotChatActionId);
  }
  return out;
}

/**
 * Estrae azioni dal marker finale e restituisce testo pulito.
 * Se il marker manca, inferisce dalle parole chiave del messaggio.
 */
export function extractTarotChatActions(raw: string): {
  text: string;
  actions: TarotChatActionId[];
} {
  const trimmed = raw.trim();
  const match = trimmed.match(CTA_MARKER_RE);
  if (match) {
    const text = trimmed.slice(0, match.index).trim();
    const actions = normalizeIds(match[1] ?? "");
    return { text: text || trimmed, actions };
  }
  return { text: trimmed, actions: inferActionsFromText(trimmed) };
}

/** Inferenza leggera quando il modello non emette il marker. */
export function inferActionsFromText(text: string): TarotChatActionId[] {
  const t = text.toLowerCase();
  const actions: TarotChatActionId[] = [];
  const push = (id: TarotChatActionId) => {
    if (!actions.includes(id)) actions.push(id);
  };

  if (/\bwhatsapp\b|wa\.me\//.test(t)) push("whatsapp");
  if (/\btelegram\b|t\.me\//.test(t)) push("telegram");
  if (/\b(chiama|telefono|telefonare|numero)\b|\+39\s*379|tel:/.test(t)) push("phone");
  if (/\bconsult[oi]\b|\/consulti/.test(t)) push("consulti");
  if (/\bpercors[oi]\b|armonizzaz|\/percorsi/.test(t)) push("percorsi");

  // Conversione tipica: predizione → servizi + contatto
  if (
    /\b(consulto tarologico|analisi approfondita|percorso di armonizzazione|affidarsi a|contattare teresa)\b/.test(
      t,
    )
  ) {
    push("consulti");
    push("percorsi");
    push("whatsapp");
    push("phone");
  }

  return actions;
}
