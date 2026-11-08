import { siteContent } from "../data/siteContent";
import { BlogFeed } from "../components/BlogFeed";
import { PageHero } from "../components/PageHero";
import { StackSheet } from "../components/StackSheet";

const { brand, cta, pages } = siteContent;

export function Blog() {
  return (
    <div>
      <PageHero
        kicker={pages.blog.kicker}
        title={pages.blog.titolo}
        lead={brand.slogan}
        cta={{ to: "/consulti", label: cta.consultoWhatsapp }}
        secondary={{ to: "/chi-sono", label: cta.leggiChiSono }}
      />
      <StackSheet label={pages.blog.titolo} className="bg-ivory px-6 pb-24 md:px-10 md:pb-32">
        <BlogFeed />
      </StackSheet>
    </div>
  );
}
