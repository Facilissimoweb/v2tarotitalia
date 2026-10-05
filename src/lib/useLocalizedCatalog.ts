import { useEffect, useState } from "react";
import { CORSI, MATERIALI } from "../data/catalogo";
import { siteContent } from "../data/siteContent";
import { useLanguage } from "../context/LanguageContext";
import { downloadLocalizedFile } from "./downloadMaterial";
import { activeLanguage, isSourceLanguage } from "./language";
import { localizeOfficialTexts } from "./localizeClient";

export function useLocalizedCatalog() {
  const { language } = useLanguage();
  const [corsi, setCorsi] = useState(CORSI);
  const [materiali, setMateriali] = useState(MATERIALI);
  const [busy, setBusy] = useState(false);
  const [localized, setLocalized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSourceLanguage(language)) {
      setCorsi(CORSI);
      setMateriali(MATERIALI);
      setLocalized(false);
      return;
    }
    let cancelled = false;
    setLocalized(false);
    const texts: Record<string, string> = {};
    for (const course of CORSI) {
      texts[`${course.id}.kicker`] = course.kicker;
      texts[`${course.id}.title`] = course.title;
      texts[`${course.id}.blurb`] = course.blurb;
    }
    for (const item of MATERIALI) {
      texts[`${item.id}.title`] = item.title;
      texts[`${item.id}.blurb`] = item.blurb;
    }
    setBusy(true);
    void localizeOfficialTexts(language, texts)
      .then((next) => {
        if (cancelled) return;
        setCorsi(
          CORSI.map((course) => ({
            ...course,
            kicker: next[`${course.id}.kicker`] ?? course.kicker,
            title: next[`${course.id}.title`] ?? course.title,
            blurb: next[`${course.id}.blurb`] ?? course.blurb,
          })),
        );
        setMateriali(
          MATERIALI.map((item) => ({
            ...item,
            title: next[`${item.id}.title`] ?? item.title,
            blurb: next[`${item.id}.blurb`] ?? item.blurb,
          })),
        );
        setLocalized(Object.keys(texts).some((key) => next[key] && next[key] !== texts[key]));
      })
      .catch(() => {
        if (!cancelled) {
          setCorsi(CORSI);
          setMateriali(MATERIALI);
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

  async function download(file: string, filename: string, title?: string) {
    setBusy(true);
    setError(null);
    try {
      await downloadLocalizedFile(file, filename, { language: activeLanguage(language), title });
    } catch {
      setError(siteContent.itha.groqManca);
    } finally {
      setBusy(false);
    }
  }

  return { corsi, materiali, language, busy, localized, error, download };
}
