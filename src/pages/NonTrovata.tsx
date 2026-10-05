import { useEffect } from "react";
import { siteContent } from "../data/siteContent";
import { PageHero } from "../components/PageHero";

const { brand, nav, pages } = siteContent;
const copy = pages.nonTrovata;

export function NonTrovata() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${copy.titolo} — ${brand.wordmark}`;
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    return () => {
      document.title = previousTitle;
      robots.remove();
    };
  }, []);

  return (
    <div>
      <PageHero
        kicker={copy.kicker}
        title={copy.titolo}
        lead={copy.lead}
        cta={{ to: "/", label: nav.home }}
      />
    </div>
  );
}
