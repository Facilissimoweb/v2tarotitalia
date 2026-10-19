export type TarotChatRole = "user" | "assistant";

export type TarotChatMessage = {
  role: TarotChatRole;
  content: string;
};

export type TarotChatRequest = {
  messages: TarotChatMessage[];
};

export type TarotChatSuccess = {
  reply: string;
};

export type TarotChatErrorBody = {
  error: string;
};
