import { useLocation } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { pageShare } from "../lib/share";
import { WHATSAPP_ANCHOR } from "../lib/whatsapp";

const { footer } = siteContent;
const { piattaforme } = footer;

const iconBtn =
  "inline-flex h-11 w-11 items-center justify-center text-[#EDE4D4]/85 transition-colors duration-200 hover:text-ember-pale focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember-pale";

export function FooterShare() {
  const { pathname } = useLocation();
  const share = pageShare(pathname);

  return (
    <div className="relative z-[1] mx-auto max-w-6xl border-t border-[#EDE4D4]/12 px-6 py-8 sm:px-10">
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-[#EDE4D4]">
        {footer.condividi}
      </p>
      <ul className="mt-5 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <li>
          <a href={share.whatsapp} className={iconBtn} aria-label={piattaforme.whatsapp} {...WHATSAPP_ANCHOR}>
            <WhatsAppIcon />
          </a>
        </li>
        <li>
          <a href={share.x} className={iconBtn} aria-label={piattaforme.x} target="_blank" rel="noopener noreferrer">
            <XIcon />
          </a>
        </li>
        <li>
          <a
            href={share.facebook}
            className={iconBtn}
            aria-label={piattaforme.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FacebookIcon />
          </a>
        </li>
        <li>
          <a
            href={share.linkedin}
            className={iconBtn}
            aria-label={piattaforme.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInIcon />
          </a>
        </li>
        <li>
          <a
            href={share.pinterest}
            className={iconBtn}
            aria-label={piattaforme.pinterest}
            target="_blank"
            rel="noopener noreferrer"
          >
            <PinterestIcon />
          </a>
        </li>
      </ul>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.9a8.1 8.1 0 0 0-6.95 12.25L4 20.2l4.15-1A8.1 8.1 0 1 0 12 3.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4.4 4.4 19.6 19.6M19.6 4.4 4.4 19.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14.2 8.2V6.7c0-.7.5-1.2 1.2-1.2h1.1V3.4h-1.8c-2.2 0-3.7 1.6-3.7 3.8v1h-1.6v2.2h1.6V20.6h2.6V10.4h2l.4-2.2h-2.4Z" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.4V16.6M8 7.5v.1M12.2 16.6v-3.5c0-1 .8-1.7 1.7-1.7s1.7.7 1.7 1.7v3.5M12.2 10.4V16.6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.4 19.2 12.2 12c.35-1.15 1.7-1.05 1.7.25 0 1.7-1.15 3.15-2.9 3.15" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
