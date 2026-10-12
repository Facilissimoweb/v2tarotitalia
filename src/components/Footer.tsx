import { useState } from "react";
import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { flattenNav, MAIN_NAV } from "../data/navigation";
import { useConsent } from "../context/ConsentContext";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";
import { LanguageWidget } from "./LanguageWidget";
import { LegalCopy, LegalNotice, type LegalKind } from "./LegalNotice";
import { getPhoneHref, whatsappChatHref } from "../lib/whatsapp";

const { brand, cookies, legal } = siteContent;
const { tutela } = legal;

export function Footer() {
  const { reopen } = useConsent();
  const links = flattenNav(MAIN_NAV);
  const [notice, setNotice] = useState<LegalKind | null>(null);

  return (
    <footer data-site-footer className="relative mt-auto overflow-hidden bg-mist px-6 py-20 text-center md:px-10 md:py-28">
      {/* Fondo: incisione in filigrana, sfumata verso l'alto nel colore del footer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 aspect-[9/16] -translate-x-1/2 bg-[url('/footer-sfondo.png')] bg-cover bg-center opacity-[0.12] mix-blend-multiply md:opacity-[0.17] [mask-image:linear-gradient(to_right,transparent,#000_22%,#000_78%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_22%,#000_78%,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-mist to-transparent"
      />
      <div className="relative [text-shadow:0_0_10px_var(--color-mist)]">
        <div translate="no">
          <BrandLogo className="mx-auto h-24 w-24 md:h-28 md:w-28" />
          <p className="mt-8 font-display text-lg tracking-[0.2em] text-ink">{brand.wordmark.toUpperCase()}</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-ink/70">{brand.name}</p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed tracking-[0.02em] text-ink/80 md:text-[15px]">
          {brand.slogan}
        </p>
        <p className="mx-auto mt-8 max-w-md text-xs uppercase leading-relaxed tracking-[0.14em] text-ink/80">
          {brand.titolare} — {brand.studioDiTeresa}
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.14em] text-ink/80">{brand.coords}</p>
        <a
          href={`mailto:${brand.email}`}
          className="mt-6 inline-block font-display text-sm italic text-ink underline decoration-sage/40 underline-offset-4"
        >
          {brand.email}
        </a>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row [text-shadow:none]">
          <Button href={whatsappChatHref()}>{siteContent.cta.whatsappRapido}</Button>
          <Button href={getPhoneHref()} variant="ghost">
            {siteContent.cta.chiama}
          </Button>
        </div>
        <div className="mx-auto mt-14 flex max-w-xl flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium uppercase tracking-[0.14em] text-ink/80">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="hover:text-ink">
              {item.label}
            </NavLink>
          ))}
          <LanguageWidget placement="footer" />
          <button type="button" className="uppercase tracking-[0.14em] hover:text-ink" onClick={reopen}>
            {cookies.gestisci}
          </button>
        </div>
        <p className="mx-auto mt-12 max-w-lg text-[11px] uppercase leading-relaxed tracking-[0.12em] text-ink/70">
          {brand.deontologia}
        </p>

        <div className="mx-auto mt-16 max-w-xl border-t border-ink/10 pt-14 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/70">{tutela.kicker}</p>
          <p className="mt-5 text-[15px] leading-[1.9] text-ink/85">
            <LegalCopy>{tutela.sintesi}</LegalCopy>
          </p>
          <a
            href={`mailto:${brand.adminEmail}`}
            className="mt-5 inline-block font-display text-sm italic text-ink underline decoration-sage/40 underline-offset-4"
          >
            {brand.adminEmail}
          </a>
          <div className="mt-10 flex flex-col items-center gap-5 text-xs font-medium uppercase tracking-[0.14em] text-ink/80">
            <button type="button" className="hover:text-ink" onClick={() => setNotice("tutela")}>
              {tutela.sezione}
            </button>
            <button type="button" className="hover:text-ink" onClick={() => setNotice("privacy")}>
              {legal.privacy.sezione}
            </button>
            <button type="button" className="hover:text-ink" onClick={() => setNotice("disclaimer")}>
              {legal.disclaimer.sezione}
            </button>
            <button type="button" className="hover:text-ink" onClick={() => setNotice("vendita")}>
              {legal.vendita.sezione}
            </button>
          </div>
        </div>

        <LegalNotice kind={notice} onClose={() => setNotice(null)} />
      </div>
    </footer>
  );
}
