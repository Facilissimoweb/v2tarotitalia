import { siteContent } from "../../data/siteContent";
import type { TarotChatMessage, TarotChatSuccess } from "./types";

const { tarotChat: copy } = siteContent;

const TIMEOUT_MS = 45_000;

export async function sendTarotChat(messages: TarotChatMessage[]): Promise<string> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch("/api/tarot-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
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
    return reply;
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
