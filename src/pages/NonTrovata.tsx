import { siteContent } from "../data/siteContent";
import { PageHero } from "../components/PageHero";

const { nav, pages } = siteContent;
const copy = pages.nonTrovata;

export function NonTrovata() {
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
