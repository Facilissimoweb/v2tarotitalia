import { type ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { useConsent } from "../context/ConsentContext";
import { useItha } from "../context/IthaContext.tsx";
import { useRitualistica } from "../context/RitualisticaContext";
import { useFooterClearance } from "../lib/useFooterClearance";
import { getPhoneHref, telegramHref, whatsappChatHref, WHATSAPP_ANCHOR } from "../lib/whatsapp";
import { BrandLogo } from "./BrandLogo";

const { brand, cta, itha, nav } = siteContent;

const dockClass =
  "pointer-events-auto flex items-center gap-0.5 bg-ivory/95 px-1.5 py-1.5 shadow-[0_8px_24px_rgba(43,37,35,0.1)] ring-1 ring-ink/10 backdrop-blur-md md:gap-1 md:px-2 md:py-2";

const itemClass =
  "group relative flex h-10 w-10 items-center justify-center text-ink transition-colors duration-200 hover:text-sage sm:h-11 sm:w-11 md:h-12 md:w-12";

const tipClass =
  "pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 hidden -translate-x-1/2 whitespace-nowrap bg-ink px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-on-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 md:block";

type DockBarProps = {
  onItha?: () => void;
  onCookies?: () => void;
  hidden?: boolean;
};

export function ContactDock({ onItha, onCookies, hidden = false }: DockBarProps) {
  const lift = useFooterClearance();
  const tel = getPhoneHref();
  const wa = whatsappChatHref();
  const telegram = telegramHref();
  const inset = "max(1.25rem, env(safe-area-inset-bottom))";

  if (hidden) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3 sm:px-4"
      style={{ bottom: `calc(${lift}px + ${inset})` }}
    >
      <nav className={dockClass} aria-label={nav.contatti}>
        <DockLink href={`mailto:${brand.email}`} label={cta.scriviStudio}>
          <MailIcon />
        </DockLink>
        {tel ? (
          <DockLink href={tel} label={cta.chiama} ariaLabel={`${cta.chiama} ${brand.whatsapp}`}>
            <PhoneIcon />
          </DockLink>
        ) : null}
        <DockLink href={wa} label={cta.whatsappRapido} ariaLabel={`${cta.whatsappRapido} ${brand.whatsapp}`} extra={WHATSAPP_ANCHOR}>
          <WhatsAppIcon />
        </DockLink>
        {telegram ? (
          <DockLink href={telegram} label={cta.telegram} extra={WHATSAPP_ANCHOR}>
            <TelegramIcon />
          </DockLink>
        ) : null}
        {onItha ? (
          <button type="button" className={itemClass} aria-label={itha.sticky} onClick={onItha}>
            <BrandLogo className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9" />
            <span className={tipClass}>{itha.sticky}</span>
          </button>
        ) : null}
        {onCookies ? (
          <button type="button" className={itemClass} aria-label={siteContent.cookies.gestisci} onClick={onCookies}>
            <CookieIcon />
            <span className={tipClass}>{siteContent.cookies.gestisci}</span>
          </button>
        ) : null}
      </nav>
    </div>
  );
}

/** Barra contatti dello Studio: nasconde il dock quando un overlay è aperto. */
export function StudioContactDock() {
  const { openItha, open: ithaOpen } = useItha();
  const { open: cookieOpen, ready, reopen } = useConsent();
  const { authOpen } = useAuth();
  const { open: ritualOpen } = useRitualistica();
  const hidden = !ready || cookieOpen || ithaOpen || authOpen || ritualOpen;
  return <ContactDock onItha={openItha} onCookies={reopen} hidden={hidden} />;
}

function DockLink({
  href,
  label,
  ariaLabel,
  extra,
  children,
}: {
  href: string;
  label: string;
  ariaLabel?: string;
  extra?: { target?: string; rel?: string };
  children: ReactNode;
}) {
  return (
    <a href={href} className={itemClass} aria-label={ariaLabel ?? label} {...extra}>
      {children}
      <span className={tipClass}>{label}</span>
    </a>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6.5" width="16" height="11" stroke="currentColor" strokeWidth="1.4" />
      <path d="m5 8 7 5.5L19 8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.6 11.6 19.2 5.4l-3.4 13.2-4.4-4.1-3.3 3.2.7-5.2 8.4-6.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CookieIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9.2" cy="10.2" r="1" fill="currentColor" />
      <circle cx="13.6" cy="13" r="0.9" fill="currentColor" />
      <circle cx="10.2" cy="15.2" r="0.75" fill="currentColor" />
    </svg>
  );
}
