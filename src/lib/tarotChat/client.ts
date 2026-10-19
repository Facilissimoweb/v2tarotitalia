import { siteContent } from "../../data/siteContent";
import { extractTarotChatActions, type TarotChatActionId } from "./actions";
import type { TarotChatMessage, TarotChatSuccess } from "./types";

const { tarotChat: copy } = siteContent;

const TIMEOUT_MS = 45_000;

export type TarotChatReply = {
  reply: string;
  actions: TarotChatActionId[];
};

export async function sendTarotChat(messages: TarotChatMessage[]): Promise<TarotChatReply> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  const payloadMessages = messages.map(({ role, content }) => ({ role, content }));

  try {
    const response = await fetch("/api/tarot-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payloadMessages }),
      signal: controller.signal,
    });

    let payload: Partial<TarotChatSuccess> & { error?: string } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      throw new Error(copy.erroreRete);
    }

    if (!response.ok) {
      throw new Error(payload.error || copy.erroreRete);
    }
    const reply = payload.reply?.trim();
    if (!reply) throw new Error(copy.erroreRisposta);

    const fromApi = Array.isArray(payload.actions) ? payload.actions : [];
    const fallback = extractTarotChatActions(reply);
    return {
      reply: fallback.text,
      actions: fromApi.length > 0 ? fromApi : fallback.actions,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(copy.erroreTimeout);
    }
    if (error instanceof Error && error.message) throw error;
    throw new Error(copy.erroreRete);
  } finally {
    window.clearTimeout(timer);
  }
}
