import type { TarotChatActionId } from "./actions";

export type TarotChatRole = "user" | "assistant";

export type TarotChatMessage = {
  role: TarotChatRole;
  content: string;
  /** Solo messaggi assistant: CTA rese come pulsanti. */
  actions?: TarotChatActionId[];
};

export type TarotChatRequest = {
  messages: Array<Pick<TarotChatMessage, "role" | "content">>;
};

export type TarotChatSuccess = {
  reply: string;
  actions: TarotChatActionId[];
};

export type TarotChatErrorBody = {
  error: string;
};
