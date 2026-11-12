import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { useConsent } from "../context/ConsentContext";
import { BrandLogo } from "./BrandLogo";
import { conPeso } from "./Prosa";
import { LanguageWidget } from "./LanguageWidget";
import { LegalNotice, type LegalKind } from "./LegalNotice";
import { FooterShare } from "./FooterShare";
import { MailToLink } from "./MailToLink";
import { getPhoneHref, telegramHref, whatsappChatHref, WHATSAPP_ANCHOR } from "../lib/whatsapp";

const { brand, cookies, cta, footer, legal, nav } = siteContent;
const { tutela } = legal;

const colTitle =
  "text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-[#EDE4D4]";
const colLink =
  "text-[0.8125rem] leading-relaxed text-[#EDE4D4]/90 transition-colors hover:text-ember-pale";
const legalLink =
  "text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[#EDE4D4]/70 transition-colors hover:text-ember-pale";

export function Footer() {
  const { reopen } = useConsent();
  const [notice, setNotice] = useState<LegalKind | null>(null);
  const tel = getPhoneHref();
  const wa = whatsappChatHref();
  const telegram = telegramHref();

  return (
    <footer data-site-footer className="footer-graphite relative mt-auto text-[#EDE4D4]">
      <div className="atmosphere-footer" aria-hidden>
        <span className="atmosphere-footer__orb" />
        <span className="atmosphere-footer__orb atmosphere-footer__orb--b" />
      </div>
      <div className="relative z-[1] mx-auto flex max-w-6xl flex-col items-center px-6 pt-14 text-center sm:px-10 lg:pt-20">
        <div translate="no" className="flex w-full flex-col items-center gap-5">
          <BrandLogo tone="hero" className="h-[7.75rem] w-[7.75rem] sm:h-[8.5rem] sm:w-[8.5rem]" />
          <p className="font-display text-[1.7rem] font-medium leading-none tracking-[0.04em] sm:text-[1.95rem]">
            {brand.wordmark}
          </p>
        </div>
        <p className="mt-5 max-w-xl text-[0.8125rem] leading-relaxed text-[#EDE4D4]/80">{conPeso(brand.descrizione)}</p>

        <div className="mt-10 flex w-full max-w-3xl flex-col items-center gap-3 text-[0.8125rem] leading-relaxed text-[#EDE4D4]/80">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-8">
            <span className="inline-flex items-center gap-2.5">
              <MailGlyph />
              <MailToLink email={brand.email} className="hover:text-ember-pale">
                {brand.email}
              </MailToLink>
            </span>
            {tel ? (
              <span className="inline-flex items-center gap-2.5">
                <PhoneGlyph />
                <a href={tel} className="hover:text-ember-pale">
                  {brand.whatsapp}
                </a>
              </span>
            ) : null}
          </div>
          <p className="inline-flex max-w-xl items-start gap-2.5 text-balance">
            <PinGlyph />
            <span>{conPeso(brand.studioDiTeresa)}</span>
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-8">
            <span>{brand.piva}</span>
            <LanguageWidget placement="footer" className="shadow-none" />
          </div>
          <div className="mt-1 flex items-center gap-4">
            <a href={wa} className="hover:text-ember-pale" aria-label={cta.whatsappRapido} {...WHATSAPP_ANCHOR}>
              <WhatsAppGlyph />
            </a>
            {telegram ? (
              <a href={telegram} className="hover:text-ember-pale" aria-label={cta.telegram} {...WHATSAPP_ANCHOR}>
                <TelegramGlyph />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative z-[1] mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-12 border-t border-[#EDE4D4]/12 px-6 py-14 sm:px-10 md:grid-cols-3 md:gap-10">
        <FooterColumn title={footer.esplora}>
          <NavLink to="/" end className={colLink}>
            {nav.home}
          </NavLink>
          <NavLink to="/consulti" className={colLink}>
            {nav.consulti}
          </NavLink>
          <NavLink to="/percorsi" className={colLink}>
            {nav.percorsi}
          </NavLink>
        </FooterColumn>

        <FooterColumn title={nav.tarocchi}>
          <NavLink to="/arcani" className={colLink}>
            {nav.arcaniMaggiori}
          </NavLink>
          <NavLink to="/arcani-minori" className={colLink}>
            {nav.arcaniMinori}
          </NavLink>
          <NavLink to="/blog" className={colLink}>
            {nav.blog}
          </NavLink>
        </FooterColumn>

        <FooterColumn title={footer.informazioni}>
          <NavLink to="/chi-sono" className={colLink}>
            {nav.chiSono}
          </NavLink>
          <NavLink to="/contatti" className={colLink}>
            {nav.contatti}
          </NavLink>
          <button type="button" className={colLink} onClick={() => setNotice("tutela")}>
            {tutela.kicker}
          </button>
          <button type="button" className={colLink} onClick={() => setNotice("disclaimer")}>
            {legal.disclaimer.sezione}
          </button>
        </FooterColumn>
      </div>

      <FooterShare />

      <div className="relative z-[1] mx-auto flex max-w-6xl flex-col gap-4 px-6 pb-6 sm:px-10 md:flex-row md:items-end md:justify-between">
        <p className="max-w-md text-[0.625rem] uppercase leading-relaxed tracking-[0.14em] text-[#EDE4D4]/55">
          {brand.deontologia}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
          <a href="https://www.tarotitalia.com/privacy.html" className={legalLink}>
            {legal.privacy.sezione}
          </a>
          <span className="text-[#EDE4D4]/30" aria-hidden>
            |
          </span>
          <NavLink to="/termini-di-servizio" className={legalLink}>
            {legal.vendita.sezione}
          </NavLink>
          <span className="text-[#EDE4D4]/30" aria-hidden>
            |
          </span>
          <button type="button" className={legalLink} onClick={reopen}>
            {cookies.gestisci}
          </button>
        </div>
      </div>

      <div
        className="h-[calc(5.25rem+var(--dock-lift)+env(safe-area-inset-bottom,0px))] bg-plate md:h-[calc(5.75rem+var(--dock-lift)+env(safe-area-inset-bottom,0px))]"
        aria-hidden
      />

      <LegalNotice kind={notice} onClose={() => setNotice(null)} />
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className={colTitle}>{title}</p>
      <div className="mt-6 flex flex-col items-center gap-3">{children}</div>
    </div>
  );
}

function MailGlyph() {
  return (
    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.25" y="5.25" width="17.5" height="13.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.4 7.1 7.6 5.4 7.6-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.4 3.7h3l.85 2.25-1.65 1.15a11.6 11.6 0 0 0 5.9 5.9l1.15-1.65 2.25.85v3c0 .7-.5 1.25-1.18 1.35-7 0.85-12.7-4.85-11.85-11.85.1-.68.65-1.2 1.35-1.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinGlyph() {
  return (
    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s6.5-5.4 6.5-10.2A6.5 6.5 0 0 0 12 4.3a6.5 6.5 0 0 0-6.5 6.5C5.5 15.6 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.8" r="1.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function WhatsAppGlyph() {
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

function TelegramGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5.2 11.55 18.8 5.7l-3.2 12.4-4.15-3.85-3.1 3 .65-4.9 7.9-6.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
