import { useEffect } from "react";
import { siteContent } from "../data/siteContent";

/** Titolo del documento e meta description unici per pagina. */
export function usePageSeo(title: string, description?: string) {
  const wordmark = siteContent.brand.wordmark;

  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    document.title = `${title} — ${wordmark}`;
    if (description && meta) meta.setAttribute("content", description);
    return () => {
      document.title = previousTitle;
      if (description && meta) meta.setAttribute("content", previousDescription);
    };
  }, [title, description, wordmark]);
}
