import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { useLanguage } from "../context/LanguageContext";
import {
  hreflangCode,
  LANGUAGE_QUERY_KEY,
  SITE_LANGUAGES,
  SITE_SOURCE_LANG,
} from "../lib/language";

const SITE_URL = siteContent.legal.sitoUrl.replace(/\/$/, "");

function languageHref(origin: string, pathname: string, code: string) {
  const url = new URL(pathname, origin);
  if (code !== SITE_SOURCE_LANG) url.searchParams.set(LANGUAGE_QUERY_KEY, code);
  return url.href;
}

/** Alternate hreflang per l’indicizzazione internazionale. */
export function LanguageSeo() {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const origin = window.location.origin.includes("localhost") ? SITE_URL : window.location.origin;
    const head = document.head;
    head.querySelectorAll("link[data-i18n-hreflang]").forEach((node) => node.remove());
    head.querySelectorAll("meta[data-i18n-og]").forEach((node) => node.remove());

    const addLink = (hreflang: string, href: string) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = hreflang;
      link.href = href;
      link.setAttribute("data-i18n-hreflang", hreflang);
      head.appendChild(link);
    };

    addLink("x-default", languageHref(origin, pathname, SITE_SOURCE_LANG));
    addLink(SITE_SOURCE_LANG, languageHref(origin, pathname, SITE_SOURCE_LANG));
    for (const lang of SITE_LANGUAGES) {
      addLink(hreflangCode(lang.code), languageHref(origin, pathname, lang.code));
    }

    if (language !== SITE_SOURCE_LANG) {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:locale:alternate");
      meta.content = hreflangCode(language).replace("-", "_");
      meta.setAttribute("data-i18n-og", "1");
      head.appendChild(meta);
    }

    return () => {
      head.querySelectorAll("link[data-i18n-hreflang]").forEach((node) => node.remove());
      head.querySelectorAll("meta[data-i18n-og]").forEach((node) => node.remove());
    };
  }, [pathname, language]);

  return null;
}
