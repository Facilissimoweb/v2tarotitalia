import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { siteContent } from "../data/siteContent";
import { extractTarotChatActions } from "../lib/tarotChat/actions";
import { sendTarotChat } from "../lib/tarotChat/client";
import type { TarotChatMessage } from "../lib/tarotChat/types";
import { tarotChatUi } from "../lib/tarotChat/ui";
import { TarotChatActions } from "./TarotChatActions";
import { WidgetBrandMark } from "./WidgetFrame";
import { WidgetCloseButton } from "./WidgetCloseButton";

const { tarotChat: copy } = siteContent;

const welcomeParsed = extractTarotChatActions(copy.benvenuto);
const INITIAL_MESSAGES: TarotChatMessage[] = [
  {
    role: "assistant",
    content: welcomeParsed.text,
    actions: welcomeParsed.actions.length
      ? welcomeParsed.actions
      : ["consulti", "percorsi", "whatsapp"],
  },
];

function useChatOpen() {
  return useSyncExternalStore(tarotChatUi.subscribe, tarotChatUi.getOpen, () => false);
}

/** FAB + pannello chat collegato a Groq via `/api/tarot-chat` (chiave solo server). */
export function TarotChat() {
  const open = useChatOpen();
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<TarotChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") tarotChatUi.setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prev || "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || loading) return;

    const nextMessages: TarotChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setLoading(true);

    try {
      const { reply, actions } = await sendTarotChat(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply, actions }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.erroreRete);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-3 z-[45] flex h-[4.25rem] w-[5.9rem] items-center justify-center bg-transparent p-0 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember sm:right-4 md:bottom-[calc(6.5rem+env(safe-area-inset-bottom))] md:h-[4.5rem] md:w-[6.25rem]"
        aria-label={copy.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? "tarot-chat-panel" : undefined}
        onClick={() => tarotChatUi.toggle()}
      >
        <ChatIcon />
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/35 p-0 sm:items-center sm:p-4"
              role="presentation"
              onClick={(event) => {
                if (event.target === event.currentTarget) tarotChatUi.setOpen(false);
              }}
            >
              <div
                id="tarot-chat-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative flex h-[min(92dvh,40rem)] w-full max-w-lg flex-col overflow-hidden bg-ivory shadow-[0_24px_60px_rgba(43,37,35,0.28)] ring-1 ring-ink/10 sm:h-[min(86dvh,36rem)]"
              >
                <WidgetCloseButton onClick={() => tarotChatUi.setOpen(false)} />

                <header className="shrink-0 border-b border-ink/10 px-6 pb-5 pt-7 md:px-8">
                  <WidgetBrandMark size="sm" />
                  <h2
                    id={titleId}
                    className="mt-5 text-center font-display text-xl text-ink md:text-2xl"
                  >
                    {copy.titolo}
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-center text-xs leading-relaxed text-ink/65">
                    {copy.lead}
                  </p>
                </header>

                <div
                  ref={listRef}
                  className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 md:px-7"
                  aria-live="polite"
                >
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[92%] px-4 py-3 text-sm leading-relaxed ${
                          message.role === "user"
                            ? "bg-ink text-on-ink"
                            : "bg-mist text-ink ring-1 ring-ink/8"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.role === "assistant" && message.actions?.length ? (
                          <TarotChatActions actions={message.actions} />
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {loading ? (
                    <p className="text-center text-xs uppercase tracking-[0.16em] text-ember-soft">
                      {copy.inAttesa}
                    </p>
                  ) : null}
                  {error ? (
                    <p className="bg-mist px-4 py-3 text-center text-sm leading-relaxed text-ink/80 ring-1 ring-ink/10">
                      {error}
                    </p>
                  ) : null}
                </div>

                <form
                  onSubmit={onSubmit}
                  className="shrink-0 border-t border-ink/10 bg-ivory px-4 py-4 md:px-6"
                >
                  <label className="sr-only" htmlFor="tarot-chat-input">
                    {copy.placeholder}
                  </label>
                  <div className="flex items-end gap-2">
                    <textarea
                      id="tarot-chat-input"
                      ref={inputRef}
                      rows={2}
                      value={draft}
                      disabled={loading}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      placeholder={copy.placeholder}
                      className="min-h-[2.75rem] max-h-28 w-full resize-none bg-mist px-3 py-2.5 text-sm leading-relaxed text-ink outline-none ring-1 ring-ink/10 placeholder:text-ink/40 focus:ring-ink/25 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={loading || !draft.trim()}
                      className="shrink-0 bg-ink px-4 py-2.5 text-[0.625rem] font-medium uppercase tracking-[0.2em] text-on-ink transition-opacity disabled:opacity-40"
                    >
                      {copy.invia}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function ChatIcon() {
  return (
    <img
      src="/chat-icon.png"
      alt=""
      width={96}
      height={69}
      draggable={false}
      aria-hidden="true"
      className="h-full w-full object-contain"
    />
  );
}
