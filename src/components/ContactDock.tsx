import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { useConsent } from "../context/ConsentContext";
import { usePercorsi } from "../context/PercorsiContext";
import { useFooterClearance } from "../lib/useFooterClearance";
import { tarotChatUi } from "../lib/tarotChat/ui";
import { mailtoHref, openMailto } from "../lib/mailto";
import { getPhoneHref, telegramHref, whatsappChatHref, WHATSAPP_ANCHOR } from "../lib/whatsapp";

const { brand, cta, nav } = siteContent;

const dockClass =
  "esoteric-badge-btn pointer-events-auto flex w-[min(36rem,calc(100vw-1.5rem))] items-center justify-center gap-2 px-5 py-2 sm:gap-2.5 sm:px-8 sm:py-2.5 md:gap-3 md:px-10 md:py-3";

const itemClass =
  "dock-sphere relative z-[2] grid h-11 w-11 place-items-center sm:h-12 sm:w-12 md:h-[3.15rem] md:w-[3.15rem]";

type DockBarProps = {
  onCookies?: () => void;
  hidden?: boolean;
};

export function ContactDock({ onCookies, hidden = false }: DockBarProps) {
  const lift = useFooterClearance();
  const tel = getPhoneHref();
  const wa = whatsappChatHref();
  const telegram = telegramHref();
  const inset = "max(1.25rem, env(safe-area-inset-bottom))";
  const navRef = useRef<HTMLElement>(null);
  const [orb, setOrb] = useState({ x: 0, on: false, travel: false });
  const leaveTimer = useRef<number>(0);

  const activate = useCallback((el: EventTarget | null) => {
    const nav = navRef.current;
    if (!(el instanceof HTMLElement) || !nav) return;
    window.clearTimeout(leaveTimer.current);
    const bar = nav.getBoundingClientRect();
    const item = el.getBoundingClientRect();
    const x = item.left - bar.left + item.width / 2;
    setOrb((prev) => ({ x, on: true, travel: prev.on }));
    nav.querySelectorAll("[data-dock-item]").forEach((node) => {
      node.toggleAttribute("data-raised", node === el);
    });
  }, []);

  const restNow = useCallback(() => {
    window.clearTimeout(leaveTimer.current);
    setOrb((current) => ({ ...current, on: false, travel: false }));
    navRef.current?.querySelectorAll("[data-dock-item]").forEach((node) => {
      node.removeAttribute("data-raised");
    });
  }, []);

  const rest = useCallback(() => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(restNow, 140);
  }, [restNow]);

  useEffect(() => {
    if (!hidden) return;
    restNow();
  }, [hidden, restNow]);

  useEffect(() => () => restNow(), [restNow]);

  const openCookies = useCallback(
    (el: HTMLElement) => {
      restNow();
      el.blur();
      onCookies?.();
    },
    [onCookies, restNow],
  );

  if (hidden) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3 sm:px-4"
      style={{ bottom: `calc(${lift}px + ${inset})` }}
    >
      <nav
        ref={navRef}
        className={dockClass}
        aria-label={nav.contatti}
        style={{
          ["--dock-notch-x" as string]: `${orb.x}px`,
          ["--dock-notch-r" as string]: orb.on ? "1.85rem" : "0px",
        }}
        onPointerLeave={rest}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) rest();
        }}
      >
        <div className="dock-skin pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]" />
        <span
          className={`dock-fluid-orb${orb.travel ? "" : " is-jump"}`}
          style={{ left: orb.x, opacity: orb.on ? 1 : 0 }}
          aria-hidden
        />
        <DockLink href={mailtoHref(brand.email)} label={cta.scriviStudio} mailto onActivate={activate}>
          <MailIcon />
        </DockLink>
        {tel ? (
          <DockLink
            href={tel}
            label={`${cta.chiama} ${brand.whatsapp}`}
            onActivate={activate}
          >
            <PhoneIcon />
          </DockLink>
        ) : null}
        <DockLink
          href={wa}
          label={`${cta.whatsappRapido} ${brand.whatsapp}`}
          extra={WHATSAPP_ANCHOR}
          onActivate={activate}
        >
          <WhatsAppIcon />
        </DockLink>
        {telegram ? (
          <DockLink href={telegram} label={cta.telegram} extra={WHATSAPP_ANCHOR} onActivate={activate}>
            <TelegramIcon />
          </DockLink>
        ) : null}
        {onCookies ? (
          <button
            type="button"
            className={itemClass}
            data-dock-item=""
            aria-label={siteContent.cookies.gestisci}
            onPointerDown={() => restNow()}
            onClick={(event) => openCookies(event.currentTarget)}
            onPointerEnter={(event) => activate(event.currentTarget)}
            onFocus={(event) => {
              if (event.currentTarget.matches(":focus-visible")) activate(event.currentTarget);
            }}
          >
            <span className="dock-icon">
              <CookieIcon />
            </span>
          </button>
        ) : null}
      </nav>
    </div>
  );
}

/** Barra contatti: nasconde il dock quando un overlay è aperto. */
export function StudioContactDock() {
  const { open: cookieOpen, ready, reopen } = useConsent();
  const { authOpen } = useAuth();
  const { open: percorsiOpen } = usePercorsi();
  const chatOpen = useSyncExternalStore(tarotChatUi.subscribe, tarotChatUi.getOpen, () => false);
  const hidden = !ready || cookieOpen || authOpen || percorsiOpen || chatOpen;
  return <ContactDock onCookies={reopen} hidden={hidden} />;
}

function DockLink({
  href,
  label,
  extra,
  mailto = false,
  onActivate,
  children,
}: {
  href: string;
  label: string;
  extra?: { target?: string; rel?: string };
  mailto?: boolean;
  onActivate: (el: EventTarget | null) => void;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={`${itemClass} pointer-events-auto relative z-10`}
      data-dock-item=""
      aria-label={label}
      translate={mailto ? "no" : undefined}
      {...extra}
      onPointerEnter={(event) => onActivate(event.currentTarget)}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) onActivate(event.currentTarget);
      }}
      onClick={
        mailto
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              openMailto(href);
            }
          : undefined
      }
    >
      <span className="dock-icon">{children}</span>
    </a>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.25" y="5.25" width="17.5" height="13.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.4 7.1 7.6 5.4 7.6-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.4 3.7h3l.85 2.25-1.65 1.15a11.6 11.6 0 0 0 5.9 5.9l1.15-1.65 2.25.85v3c0 .7-.5 1.25-1.18 1.35-7 0.85-12.7-4.85-11.85-11.85.1-.68.65-1.2 1.35-1.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.9a8.1 8.1 0 0 0-6.95 12.25L4 20.2l4.15-1A8.1 8.1 0 1 0 12 3.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.15 8.95c.2-.5.4-.5.7-.5h.55c.2 0 .4.1.5.4l.55 1.35c.1.2 0 .4-.1.55l-.4.5c-.1.2 0 .4.2.6.4.5.95 1 1.55 1.4.2.15.4.2.6 0l.5-.4c.2-.2.4-.2.55-.1l1.35.55c.3.1.4.3.4.5v.55c0 .3 0 .5-.5.7-1.4.6-3.7.2-5.65-1.75-1.7-1.7-2.2-3.9-1.55-5.35Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5.2 11.55 18.8 5.7l-3.2 12.4-4.15-3.85-3.1 3 .65-4.9 7.9-6.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CookieIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9.2" cy="10.2" r="1.1" fill="currentColor" />
      <circle cx="13.6" cy="13" r="1" fill="currentColor" />
      <circle cx="10.2" cy="15.2" r="0.85" fill="currentColor" />
    </svg>
  );
}
