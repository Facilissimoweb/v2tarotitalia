import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyDocumentSeo, seoForPath } from "./seo";

/** Titolo, description, canonical, Open Graph e Twitter Card per il percorso corrente. */
export function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyDocumentSeo(seoForPath(pathname));
  }, [pathname]);

  return null;
}

/** Compatibilità: applica titolo e description a un percorso già risolto. */
export function usePageSeo(title: string, description?: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    applyDocumentSeo({
      ...seoForPath(pathname),
      title,
      description: description || seoForPath(pathname).description,
    });
  }, [title, description, pathname]);
}
