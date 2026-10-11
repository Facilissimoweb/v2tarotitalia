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
  "dock-night pointer-events-auto flex items-center gap-2.5 px-4 py-2 transition-all sm:gap-3.5 sm:px-5 sm:py-2.5 md:gap-5";

const itemClass =
  "group relative flex h-8 w-8 items-center justify-center !rounded-full text-sage transition-colors duration-200 hover:text-ink sm:h-9 sm:w-9";

const sealButtonClass =
  "group relative flex items-center justify-center !rounded-full";

const tipClass =
  "pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 hidden -translate-x-1/2 whitespace-nowrap border border-moss/30 bg-[#0d1411] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-sage opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 md:block";

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
          <button type="button" className={sealButtonClass} aria-label={itha.sticky} onClick={onItha}>
            <DockSeal />
            <span className={tipClass}>{itha.sticky}</span>
          </button>
        ) : (
          <span className="flex items-center justify-center" aria-hidden>
            <DockSeal />
          </span>
        )}
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

function DockSeal() {
  return (
    <span
      className="flex h-8 w-8 items-center justify-center rounded-full p-0.5 shadow-md sm:h-9 sm:w-9"
      style={{ background: "linear-gradient(135deg, #3fd69a 0%, #8b5cf6 100%)" }}
    >
      <BrandLogo className="h-full w-full !ring-0" />
    </span>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6.5" width="16" height="11" stroke="currentColor" strokeWidth="1.4" />
      <path d="m5 8 7 5.5L19 8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
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

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9.2" cy="10.2" r="1" fill="currentColor" />
      <circle cx="13.6" cy="13" r="0.9" fill="currentColor" />
      <circle cx="10.2" cy="15.2" r="0.75" fill="currentColor" />
    </svg>
  );
}
