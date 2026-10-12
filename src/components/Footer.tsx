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
    <footer data-site-footer className="mt-auto bg-mist px-6 py-20 text-center md:px-10 md:py-28">
      <div translate="no">
        <BrandLogo className="mx-auto h-24 w-24 md:h-28 md:w-28" />
        <p className="mt-8 font-display text-lg tracking-[0.2em] text-ink">{brand.wordmark.toUpperCase()}</p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-sage">{brand.name}</p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-[11px] leading-relaxed tracking-[0.04em] text-ink/55">
        {brand.slogan}
      </p>
      <p className="mx-auto mt-8 max-w-md text-[10px] uppercase leading-relaxed tracking-[0.16em] text-ink/45">
        {brand.titolare} — {brand.studioDiTeresa}
      </p>
      <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-ink/45">{brand.coords}</p>
      <a
        href={`mailto:${brand.email}`}
        className="mt-6 inline-block font-display text-sm italic text-ink underline decoration-sage/40 underline-offset-4"
      >
        {brand.email}
      </a>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button href={whatsappChatHref()}>{siteContent.cta.whatsappRapido}</Button>
        <Button href={getPhoneHref()} variant="ghost">
          {siteContent.cta.chiama}
        </Button>
      </div>
      <div className="mx-auto mt-14 flex max-w-xl flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] uppercase tracking-[0.16em] text-ink/50">
        {links.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="hover:text-ink">
            {item.label}
          </NavLink>
        ))}
        <LanguageWidget placement="footer" />
        <button type="button" className="uppercase tracking-[0.16em] hover:text-ink" onClick={reopen}>
          {cookies.gestisci}
        </button>
      </div>
      <p className="mx-auto mt-12 max-w-lg text-[9px] uppercase leading-relaxed tracking-[0.16em] text-ink/35">
        {brand.deontologia}
      </p>

      <div className="mx-auto mt-16 max-w-xl border-t border-ink/10 pt-14 text-center">
        <p className="text-[10px] uppercase tracking-[0.16em] text-sage">{tutela.kicker}</p>
        <p className="mt-5 text-sm leading-[1.9] text-ink/65">
          <LegalCopy>{tutela.sintesi}</LegalCopy>
        </p>
        <a
          href={`mailto:${brand.adminEmail}`}
          className="mt-5 inline-block font-display text-sm italic text-ink underline decoration-sage/40 underline-offset-4"
        >
          {brand.adminEmail}
        </a>
        <div className="mt-10 flex flex-col items-center gap-5 text-[10px] uppercase tracking-[0.16em] text-ink/50">
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
    </footer>
  );
}
