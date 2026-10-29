import { useState } from "react";
import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { flattenNav, MAIN_NAV } from "../data/navigation";
import { useConsent } from "../context/ConsentContext";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";
import { LanguageWidget } from "./LanguageWidget";
import { LegalCopy, LegalNotice, type LegalKind } from "./LegalNotice";
import { MailToLink } from "./MailToLink";
import { getPhoneHref, whatsappChatHref } from "../lib/whatsapp";

const { brand, cookies, legal } = siteContent;
const { tutela } = legal;

export function Footer() {
  const { reopen } = useConsent();
  const links = flattenNav(MAIN_NAV);
  const [notice, setNotice] = useState<LegalKind | null>(null);

  return (
    <footer data-site-footer className="footer-graphite relative mt-auto overflow-hidden px-6 py-20 text-center text-[#EDE4D4] md:px-10 md:py-28">
      <div className="relative">
        <div translate="no">
          <BrandLogo tone="hero" className="logo-hero-ring mx-auto h-24 w-24 md:h-28 md:w-28" />
          <p className="mt-8 font-display text-lg tracking-[0.16em] text-[#EDE4D4]">{brand.wordmark.toUpperCase()}</p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#EDE4D4]/90 md:text-[0.9375rem]">
          {brand.slogan}
        </p>
        <p className="mx-auto mt-8 max-w-lg text-xs uppercase leading-relaxed tracking-[0.16em] text-[#EDE4D4]/85">
          {brand.identitaFiscale}
        </p>
        <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-[#EDE4D4]/80">
          {brand.studioDiTeresa}
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.16em] text-[#EDE4D4]/85">{brand.coords}</p>
        <MailToLink
          email={brand.email}
          className="mt-6 inline-block font-display text-sm italic text-[#EDE4D4] underline decoration-[#EDE4D4]/50 underline-offset-4 hover:underline"
        >
          {brand.email}
        </MailToLink>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={whatsappChatHref()} variant="ember">
            {siteContent.cta.whatsappRapido}
          </Button>
          <Button href={getPhoneHref()} variant="paper">
            {siteContent.cta.chiama}
          </Button>
        </div>
        <div className="mx-auto mt-14 flex max-w-xl flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#EDE4D4]/85">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="hover:text-lime">
              {item.label}
            </NavLink>
          ))}
          <LanguageWidget placement="footer" />
          <button type="button" className="uppercase tracking-[0.16em] hover:text-lime" onClick={reopen}>
            {cookies.gestisci}
          </button>
        </div>
        <p className="mx-auto mt-12 max-w-lg text-[0.6875rem] uppercase leading-relaxed tracking-[0.16em] text-[#EDE4D4]/75">
          {brand.deontologia}
        </p>

        <div className="mx-auto mt-16 max-w-xl border-t border-[#EDE4D4]/15 pt-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EDE4D4]/75">{tutela.kicker}</p>
          <p className="mt-5 text-[0.9375rem] leading-[1.9] text-[#EDE4D4]/90">
            <LegalCopy>{tutela.sintesi}</LegalCopy>
          </p>
          <MailToLink
            email={brand.adminEmail}
            className="mt-5 inline-block font-display text-sm italic text-[#EDE4D4] underline decoration-[#EDE4D4]/50 underline-offset-4 hover:underline"
          >
            {brand.adminEmail}
          </MailToLink>
          <div className="mt-10 flex flex-col items-center gap-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#EDE4D4]/85">
            <button type="button" className="hover:text-lime" onClick={() => setNotice("tutela")}>
              {tutela.sezione}
            </button>
            <a href="https://www.tarotitalia.com/privacy.html" className="hover:text-lime">
              {legal.privacy.sezione}
            </a>
            <button type="button" className="hover:text-lime" onClick={() => setNotice("disclaimer")}>
              {legal.disclaimer.sezione}
            </button>
            <NavLink to="/termini-di-servizio" className="hover:text-lime">
              {legal.vendita.sezione}
            </NavLink>
          </div>
        </div>

        <LegalNotice kind={notice} onClose={() => setNotice(null)} />
      </div>
    </footer>
  );
}
