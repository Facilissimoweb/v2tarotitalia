import { useEffect } from "react";
import { siteContent } from "../data/siteContent";
import { DisclaimerBody, LegalCopy } from "../components/LegalNotice";
import { PageBanner } from "../components/PageBanner";

const { brand, legal } = siteContent;
const { disclaimer } = legal;

/** Pagina pubblica `/disclaimer` — stessa informativa del modale footer (link email). */
export function Disclaimer() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${disclaimer.titolo} — ${brand.wordmark}`;
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div>
      <PageBanner title={disclaimer.sezione} className="mb-10 md:mb-14" />

      <section className="px-6 pb-24 md:px-10 md:pb-32">
        <article className="mx-auto max-w-3xl bg-paper px-8 py-12 md:px-12 md:py-16">
          <p className="text-center text-[0.75rem] text-ink/50">
            <LegalCopy>{disclaimer.intestazione}</LegalCopy>
          </p>
          <DisclaimerBody className="mt-10" />
        </article>
      </section>
    </div>
  );
}
