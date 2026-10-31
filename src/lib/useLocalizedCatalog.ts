import { useEffect, useState } from "react";
import { digitalCatalog, type DigitalProduct, type DigitalProductId } from "../data/catalogo";
import { siteContent } from "../data/siteContent";
import { useLanguage } from "../context/LanguageContext";
import { DigitalDownloadError } from "./digitalDownload";
import { downloadProtectedDigital } from "./downloadMaterial";
import { activeLanguage, isSourceLanguage } from "./language";
import { localizeOfficialTexts } from "./localizeClient";

export function useLocalizedCatalog() {
  const { language } = useLanguage();
  const source = digitalCatalog();
  const [products, setProducts] = useState<DigitalProduct[]>(source);
  const [busy, setBusy] = useState(false);
  const [localized, setLocalized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextSource = digitalCatalog();
    if (isSourceLanguage(language)) {
      setProducts(nextSource);
      setLocalized(false);
      return;
    }
    let cancelled = false;
    setLocalized(false);
    const texts: Record<string, string> = {};
    for (const item of nextSource) {
      texts[`${item.id}.kicker`] = item.kicker;
      texts[`${item.id}.title`] = item.title;
      texts[`${item.id}.blurb`] = item.blurb;
      texts[`${item.id}.format`] = item.format;
      item.assets.forEach((asset, index) => {
        texts[`${item.id}.asset.${index}`] = asset.title;
      });
    }
    setBusy(true);
    void localizeOfficialTexts(language, texts)
      .then((next) => {
        if (cancelled) return;
        setProducts(
          nextSource.map((item) => ({
            ...item,
            kicker: next[`${item.id}.kicker`] ?? item.kicker,
            title: next[`${item.id}.title`] ?? item.title,
            blurb: next[`${item.id}.blurb`] ?? item.blurb,
            format: next[`${item.id}.format`] ?? item.format,
            assets: item.assets.map((asset, index) => ({
              ...asset,
              title: next[`${item.id}.asset.${index}`] ?? asset.title,
            })),
          })),
        );
        setLocalized(Object.keys(texts).some((key) => next[key] && next[key] !== texts[key]));
      })
      .catch(() => {
        if (!cancelled) {
          setProducts(nextSource);
          setLocalized(false);
        }
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  async function download(productId: DigitalProductId, assetId: string, filename: string, title?: string) {
    setBusy(true);
    setError(null);
    try {
      await downloadProtectedDigital(productId, assetId, filename, { language: activeLanguage(language), title });
    } catch (error) {
      setError(
        error instanceof DigitalDownloadError && error.status === 403
          ? siteContent.pages.corsi.sbloccaDopo
          : siteContent.auth.errori.generico,
      );
    } finally {
      setBusy(false);
    }
  }

  const corsi = products.filter((item) => item.id !== "alchemici");
  const materiali = products.find((item) => item.id === "alchemici")?.assets ?? [];

  return { products, corsi, materiali, language, busy, localized, error, download };
}
