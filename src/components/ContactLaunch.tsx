import { siteContent } from "../data/siteContent";
import { getPhoneHref, whatsappChatHref, WHATSAPP_ANCHOR } from "../lib/whatsapp";

const { cta } = siteContent;

const actionClass =
  "flex items-center gap-3 bg-ivory/95 px-4 py-3 text-ink shadow-[0_8px_24px_rgba(43,37,35,0.1)] ring-1 ring-ink/10 backdrop-blur-md transition-colors duration-200 hover:text-sage";

type Props = {
  raised?: boolean;
};

/** WhatsApp e Chiama: sempre visibili, numero ufficiale dello Studio. */
export function ContactLaunch({ raised = false }: Props) {
  const tel = getPhoneHref();
  const wa = whatsappChatHref();

  return (
    <div
      className={`fixed z-40 flex flex-col items-end gap-2 ${
        raised ? "bottom-[5.75rem] right-5 md:bottom-[6.5rem] md:right-6" : "bottom-5 right-5 md:bottom-6 md:right-6"
      }`}
    >
      {tel ? (
        <a href={tel} className={actionClass} aria-label={`${cta.chiama} ${siteContent.brand.whatsapp}`}>
          <PhoneIcon />
          <span className="font-display text-[11px] uppercase tracking-[0.22em]">{cta.chiama}</span>
        </a>
      ) : null}
      <a
        href={wa}
        className={actionClass}
        {...WHATSAPP_ANCHOR}
        aria-label={`${cta.whatsappRapido} ${siteContent.brand.whatsapp}`}
      >
        <WhatsAppIcon />
        <span className="font-display text-[11px] uppercase tracking-[0.22em]">{cta.whatsappRapido}</span>
      </a>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.2 3.8h3.1l.9 2.3-1.7 1.2a12.2 12.2 0 0 0 6.2 6.2l1.2-1.7 2.3.9v3.1c0 .7-.5 1.3-1.2 1.4-7.3.9-13.3-5.1-12.4-12.4.1-.7.7-1.2 1.4-1.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4.4a7.6 7.6 0 0 0-6.5 11.5L4.6 19.4l3.6-.9A7.6 7.6 0 1 0 12 4.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M9.3 9.2c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .4-.1.6l-.4.5c-.1.2 0 .4.2.6.4.5.9 1 1.5 1.4.2.1.4.2.6 0l.5-.4c.2-.2.4-.2.6-.1l1.4.6c.3.1.4.3.4.5v.6c0 .3 0 .5-.5.7-1.4.6-3.6.2-5.5-1.7-1.7-1.7-2.2-3.8-1.6-5.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
