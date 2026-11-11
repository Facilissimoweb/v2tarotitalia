import { ARCANI } from "../data/arcani.ts";
import { ARCANI_MINORI } from "../data/arcaniMinori.ts";
import { TARIFFE } from "../data/catalogo.ts";
import { siteContent } from "../data/siteContent.ts";
import { normalizeAppPath } from "./siteRoutes.ts";
import { SUBSTACK_HOME, SUBSTACK_PROFILE } from "./substack.ts";

const { admin, brand, chiSono, consulti, home, legal, nav, pages, percorsi } = siteContent;

export const SITE_URL = legal.sitoUrl.replace(/\/$/, "");
export const DEFAULT_OG_IMAGE = `${SITE_URL}/immagine-snippet.jpg`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_TYPE = "image/jpeg";
export const INDEX_FOLLOW = "index, follow, max-snippet:-1, max-image-preview:large";
export const NOINDEX = "noindex, nofollow";

const STUDIO_ID = `${SITE_URL}/#studio`;
const PERSON_ID = `${SITE_URL}/chi-sono#persona`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const VAT_ID = `IT${brand.piva.replace(/\D/g, "")}`;

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  image: string;
  robots: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: number;
};

function abs(path: string) {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function imageUrl(path: string) {
  return abs(path.replace(/\?.*$/, ""));
}

function brandedTitle(title: string) {
  return title.includes(brand.wordmark) ? title : `${title} — ${brand.wordmark}`;
}

const CORE_LIVE: SeoPage[] = [
  {
    path: "/",
    title: home.seo.titolo,
    description: home.seo.descrizione,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "weekly",
    priority: 1,
  },
  {
    path: "/chi-sono",
    title: chiSono.seo.titolo,
    description: chiSono.seo.descrizione,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    path: "/consulti",
    title: consulti.seo.titolo,
    description: consulti.seo.descrizione,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/percorsi",
    title: pages.percorsi.seo.titolo,
    description: pages.percorsi.seo.descrizione,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/blog",
    title: pages.blog.seo.titolo,
    description: pages.blog.seo.descrizione,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/contatti",
    title: pages.contatti.seo.titolo,
    description: pages.contatti.seo.descrizione,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/arcani",
    title: pages.arcani.seo.titolo,
    description: pages.arcani.seo.descrizione,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/arcani-minori",
    title: pages.arcaniMinori.seo.titolo,
    description: pages.arcaniMinori.seo.descrizione,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/privacy",
    title: brandedTitle(legal.privacy.titolo),
    description: legal.privacy.intro[0],
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "monthly",
    priority: 0.3,
  },
  {
    path: "/disclaimer",
    title: brandedTitle(legal.disclaimer.titolo),
    description: legal.disclaimer.sezione,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "monthly",
    priority: 0.3,
  },
  {
    path: "/termini-di-servizio",
    title: brandedTitle(legal.vendita.titolo),
    description: legal.vendita.sezioni[0].testi[0],
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "monthly",
    priority: 0.3,
  },
];

function arcanaSeoPages(): SeoPage[] {
  const maggiori = ARCANI.map((card) => ({
    path: `/arcani/${card.slug}`,
    title: brandedTitle(`${card.name} · ${nav.arcaniMaggiori}`),
    description: `${card.name}: ${card.essence} Tarot Italia di Maria Teresa Rogani, Macerata.`,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "monthly" as const,
    priority: 0.55,
  }));
  const minori = ARCANI_MINORI.map((card) => ({
    path: `/arcani-minori/${card.slug}`,
    title: brandedTitle(`${card.nome} · ${pages.arcaniMinori.titolo}`),
    description: `${card.nome}: ${card.essence} Tarot Italia di Maria Teresa Rogani, Macerata.`,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    changefreq: "monthly" as const,
    priority: 0.5,
  }));
  return [...maggiori, ...minori];
}

const PRIVATE_PATHS = ["/carrello", "/login", "/admin", "/riservata"] as const;

export function liveSeoPages() {
  return [...CORE_LIVE, ...arcanaSeoPages()];
}

export function seoForPath(pathname: string): SeoPage {
  const path = normalizeAppPath(pathname);
  const live = liveSeoPages().find((page) => page.path === path);
  if (live) return live;

  const privatePage = PRIVATE_PATHS.find((item) => item === path);
  if (privatePage) {
    const labels: Record<(typeof PRIVATE_PATHS)[number], string> = {
      "/carrello": pages.carrello.titolo,
      "/login": nav.accedi,
      "/admin": admin.titolo,
      "/riservata": nav.riservata,
    };
    return {
      path,
      title: brandedTitle(labels[privatePage]),
      description: brand.descrizione,
      image: DEFAULT_OG_IMAGE,
      robots: NOINDEX,
      changefreq: "monthly",
      priority: 0,
    };
  }

  return {
    path,
    title: brandedTitle(pages.nonTrovata.titolo),
    description: pages.nonTrovata.lead,
    image: DEFAULT_OG_IMAGE,
    robots: NOINDEX,
    changefreq: "monthly",
    priority: 0,
  };
}

export function comingSoonSeo(): SeoPage {
  return {
    path: "/",
    title: brandedTitle(pages.soglia.titolo),
    description: brand.slogan,
    image: DEFAULT_OG_IMAGE,
    robots: NOINDEX,
    changefreq: "monthly",
    priority: 0,
  };
}

export function canonicalUrl(path: string) {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

function postalAddress() {
  return {
    "@type": "PostalAddress",
    streetAddress: "Via Crispi 37",
    addressLocality: brand.city,
    postalCode: "62100",
    addressRegion: "MC",
    addressCountry: "IT",
  };
}

function geoCoordinates() {
  return {
    "@type": "GeoCoordinates",
    latitude: brand.latitude,
    longitude: brand.longitude,
  };
}

function sameAs() {
  return [SUBSTACK_HOME, SUBSTACK_PROFILE, home.recensioni.profiloUrl];
}

function personJsonLd() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: brand.titolare,
    alternateName: ["M. Teresa Rogani", "Teresa"],
    jobTitle: brand.ruolo,
    url: canonicalUrl("/chi-sono"),
    image: imageUrl(chiSono.immagini.teresa.src),
    worksFor: { "@id": STUDIO_ID },
    address: postalAddress(),
    email: brand.email,
    telephone: brand.whatsapp,
    knowsAbout: [
      "Tarologia archetipica",
      "Consulti di tarocchi evolutivi",
      "Percorsi di Armonizzazione",
      "Arcani Maggiori",
      "Arcani Minori",
    ],
    sameAs: sameAs(),
  };
}

function offerCatalog() {
  const consultOffers = consulti.opzioni.map((opt, index) => {
    const tariffa = TARIFFE.find((item) => item.id === opt.id);
    return {
      "@type": "Offer",
      position: index + 1,
      name: opt.titolo,
      price: String(opt.prezzo),
      priceCurrency: "EUR",
      url: canonicalUrl("/consulti"),
      availability: "https://schema.org/InStock",
      itemOffered: {
        "@type": "Service",
        name: opt.titolo,
        description: tariffa?.summary ?? opt.titolo,
        provider: { "@id": STUDIO_ID },
        areaServed: [brand.city, "Online"],
      },
    };
  });
  const percorsoOffers = percorsi.tipologie.map((tipo, index) => ({
    "@type": "Offer",
    position: consultOffers.length + index + 1,
    name: tipo.titolo,
    url: canonicalUrl("/percorsi"),
    itemOffered: {
      "@type": "Service",
      name: tipo.titolo,
      description: tipo.testo,
      provider: { "@id": STUDIO_ID },
      areaServed: [brand.city, "Online"],
    },
  }));

  return {
    "@type": "OfferCatalog",
    name: "Consulti e Percorsi di Tarot Italia",
    itemListElement: [...consultOffers, ...percorsoOffers],
  };
}

function professionalServiceJsonLd() {
  return {
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": STUDIO_ID,
    name: brand.name,
    legalName: brand.sottotitolo,
    description: home.seo.descrizione,
    url: SITE_URL,
    image: [DEFAULT_OG_IMAGE, imageUrl(brand.logo), imageUrl(chiSono.immagini.teresa.src)],
    logo: imageUrl(brand.logo),
    telephone: brand.whatsapp,
    email: brand.email,
    vatID: VAT_ID,
    taxID: brand.piva.replace(/\D/g, ""),
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card",
    availableLanguage: ["Italian"],
    isAccessibleForFree: false,
    founder: { "@id": PERSON_ID },
    employee: { "@id": PERSON_ID },
    address: postalAddress(),
    geo: geoCoordinates(),
    hasMap: home.recensioni.profiloUrl,
    areaServed: [
      { "@type": "City", name: brand.city },
      { "@type": "AdministrativeArea", name: "Marche" },
      { "@type": "Country", name: "IT" },
      { "@type": "Place", name: "Online" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: brand.whatsapp,
      email: brand.email,
      contactType: "customer service",
      availableLanguage: "Italian",
      areaServed: "IT",
    },
    hasOfferCatalog: offerCatalog(),
    sameAs: sameAs(),
  };
}

function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: brand.name,
    inLanguage: "it-IT",
    publisher: { "@id": STUDIO_ID },
  };
}

function webPageJsonLd(page: SeoPage) {
  const url = canonicalUrl(page.path);
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: "it-IT",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": STUDIO_ID },
    primaryImageOfPage: page.image,
  };
}

function breadcrumbJsonLd(page: SeoPage) {
  const crumbs: { name: string; path: string }[] = [{ name: nav.home, path: "/" }];
  if (page.path === "/chi-sono") crumbs.push({ name: nav.chiSono, path: "/chi-sono" });
  if (page.path === "/consulti") crumbs.push({ name: nav.consulti, path: "/consulti" });
  if (page.path === "/percorsi") crumbs.push({ name: nav.percorsi, path: "/percorsi" });
  if (page.path === "/blog") crumbs.push({ name: nav.blog, path: "/blog" });
  if (page.path === "/contatti") crumbs.push({ name: nav.contatti, path: "/contatti" });
  if (page.path === "/arcani" || page.path.startsWith("/arcani/")) {
    crumbs.push({ name: nav.arcaniMaggiori, path: "/arcani" });
  }
  if (page.path === "/arcani-minori" || page.path.startsWith("/arcani-minori/")) {
    crumbs.push({ name: nav.arcaniMinori, path: "/arcani-minori" });
  }
  if (page.path.startsWith("/arcani/") && page.path !== "/arcani") {
    crumbs.push({ name: page.title.split(" — ")[0] ?? page.title, path: page.path });
  }
  if (page.path.startsWith("/arcani-minori/") && page.path !== "/arcani-minori") {
    crumbs.push({ name: page.title.split(" — ")[0] ?? page.title, path: page.path });
  }
  if (crumbs.length < 2) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  };
}

function faqPageJsonLd(path: string, voci: readonly { domanda: string; risposta: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": `${canonicalUrl(path)}#faq`,
    mainEntity: voci.map((voce) => ({
      "@type": "Question",
      name: voce.domanda,
      acceptedAnswer: {
        "@type": "Answer",
        text: voce.risposta,
      },
    })),
  };
}

function consultiServiceJsonLd() {
  return {
    "@type": "Service",
    "@id": `${canonicalUrl("/consulti")}#servizio`,
    name: "Consulti di tarocchi evolutivi",
    description: consulti.seo.descrizione,
    provider: { "@id": STUDIO_ID },
    url: canonicalUrl("/consulti"),
    areaServed: [brand.city, "Online"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: nav.consulti,
      itemListElement: consulti.opzioni.map((opt, index) => {
        const tariffa = TARIFFE.find((item) => item.id === opt.id);
        return {
          "@type": "Offer",
          position: index + 1,
          name: opt.titolo,
          price: String(opt.prezzo),
          priceCurrency: "EUR",
          url: canonicalUrl("/consulti"),
          itemOffered: {
            "@type": "Service",
            name: opt.titolo,
            description: tariffa?.summary ?? opt.titolo,
          },
        };
      }),
    },
  };
}

function percorsiServiceJsonLd() {
  return {
    "@type": "Service",
    "@id": `${canonicalUrl("/percorsi")}#servizio`,
    name: percorsi.sezione,
    description: pages.percorsi.seo.descrizione,
    provider: { "@id": STUDIO_ID },
    url: canonicalUrl("/percorsi"),
    areaServed: [brand.city, "Online"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: percorsi.sezione,
      itemListElement: percorsi.tipologie.map((tipo, index) => ({
        "@type": "Offer",
        position: index + 1,
        name: tipo.titolo,
        url: canonicalUrl("/percorsi"),
        itemOffered: {
          "@type": "Service",
          name: tipo.titolo,
          description: tipo.testo,
        },
      })),
    },
  };
}

function definedTermJsonLd(page: SeoPage) {
  const maggiore = ARCANI.find((card) => page.path === `/arcani/${card.slug}`);
  if (maggiore) {
    return {
      "@type": "DefinedTerm",
      "@id": `${canonicalUrl(page.path)}#termine`,
      name: maggiore.name,
      description: maggiore.essence,
      inDefinedTermSet: canonicalUrl("/arcani"),
      url: canonicalUrl(page.path),
    };
  }
  const minore = ARCANI_MINORI.find((card) => page.path === `/arcani-minori/${card.slug}`);
  if (!minore) return null;
  return {
    "@type": "DefinedTerm",
    "@id": `${canonicalUrl(page.path)}#termine`,
    name: minore.nome,
    description: minore.essence,
    inDefinedTermSet: canonicalUrl("/arcani-minori"),
    url: canonicalUrl(page.path),
  };
}

function jsonLdGraph(page: SeoPage): object[] | null {
  if (page.robots === NOINDEX) return null;

  const graph: object[] = [websiteJsonLd(), professionalServiceJsonLd(), personJsonLd(), webPageJsonLd(page)];
  const crumbs = breadcrumbJsonLd(page);
  if (crumbs) graph.push(crumbs);

  if (page.path === "/") {
    graph.push(faqPageJsonLd("/", home.chiSono.faq.voci));
  }
  if (page.path === "/consulti") {
    graph.push(consultiServiceJsonLd(), faqPageJsonLd("/consulti", consulti.faq.voci));
  }
  if (page.path === "/percorsi") {
    graph.push(percorsiServiceJsonLd(), faqPageJsonLd("/percorsi", percorsi.faq.voci));
  }
  const term = definedTermJsonLd(page);
  if (term) graph.push(term);

  return graph;
}

export function seoTagValues(page: SeoPage) {
  const url = canonicalUrl(page.path);
  const graph = jsonLdGraph(page);
  return {
    title: page.title,
    description: page.description,
    canonical: url,
    robots: page.robots,
    ogType: "website",
    ogTitle: page.title,
    ogDescription: page.description,
    ogUrl: url,
    ogImage: page.image,
    ogImageAlt: home.seo.immagineAlt,
    ogImageWidth: String(OG_IMAGE_WIDTH),
    ogImageHeight: String(OG_IMAGE_HEIGHT),
    ogImageType: OG_IMAGE_TYPE,
    ogLocale: "it_IT",
    ogSiteName: brand.wordmark,
    twitterCard: "summary_large_image",
    twitterTitle: page.title,
    twitterDescription: page.description,
    twitterImage: page.image,
    twitterImageAlt: home.seo.immagineAlt,
    jsonLd: graph ? JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) : "",
  };
}

function upsertMeta(head: HTMLHeadElement, attr: "name" | "property", key: string, content: string) {
  let el = head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("data-seo", "1");
    head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(head: HTMLHeadElement, rel: string, href: string) {
  let el = head.querySelector(`link[rel="${rel}"][data-seo]`) as HTMLLinkElement | null;
  if (!el) {
    el = head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  }
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    el.setAttribute("data-seo", "1");
    head.appendChild(el);
  }
  el.href = href;
}

export function applyDocumentSeo(page: SeoPage) {
  if (typeof document === "undefined") return;
  const tags = seoTagValues(page);
  const head = document.head;
  document.title = tags.title;
  upsertMeta(head, "name", "description", tags.description);
  upsertMeta(head, "name", "robots", tags.robots);
  upsertMeta(head, "name", "author", brand.titolare);
  upsertLink(head, "canonical", tags.canonical);
  upsertMeta(head, "property", "og:type", tags.ogType);
  upsertMeta(head, "property", "og:title", tags.ogTitle);
  upsertMeta(head, "property", "og:description", tags.ogDescription);
  upsertMeta(head, "property", "og:url", tags.ogUrl);
  upsertMeta(head, "property", "og:image", tags.ogImage);
  upsertMeta(head, "property", "og:image:url", tags.ogImage);
  upsertMeta(head, "property", "og:image:secure_url", tags.ogImage);
  upsertMeta(head, "property", "og:image:type", tags.ogImageType);
  upsertMeta(head, "property", "og:image:width", tags.ogImageWidth);
  upsertMeta(head, "property", "og:image:height", tags.ogImageHeight);
  upsertMeta(head, "property", "og:image:alt", tags.ogImageAlt);
  upsertMeta(head, "property", "og:locale", tags.ogLocale);
  upsertMeta(head, "property", "og:site_name", tags.ogSiteName);
  upsertMeta(head, "name", "twitter:card", tags.twitterCard);
  upsertMeta(head, "name", "twitter:title", tags.twitterTitle);
  upsertMeta(head, "name", "twitter:description", tags.twitterDescription);
  upsertMeta(head, "name", "twitter:image", tags.twitterImage);
  upsertMeta(head, "name", "twitter:image:alt", tags.twitterImageAlt);

  const existing =
    head.querySelector("script[data-seo-jsonld]") ??
    head.querySelector('script[type="application/ld+json"]');
  if (tags.jsonLd) {
    const node = existing ?? document.createElement("script");
    node.setAttribute("type", "application/ld+json");
    node.setAttribute("data-seo-jsonld", "1");
    node.textContent = tags.jsonLd;
    if (!existing) head.appendChild(node);
  } else {
    existing?.remove();
  }
}

export function stampHtml(html: string, page: SeoPage) {
  const tags = seoTagValues(page);
  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const setName = (source: string, name: string, content: string) => {
    const re = new RegExp(`<meta\\s+name="${name}"[^>]*>`, "i");
    const tag = `<meta name="${name}" content="${escape(content)}" />`;
    return re.test(source) ? source.replace(re, tag) : source.replace("</head>", `    ${tag}\n  </head>`);
  };
  const setProp = (source: string, property: string, content: string) => {
    const re = new RegExp(`<meta\\s+property="${property}"[^>]*>`, "i");
    const tag = `<meta property="${property}" content="${escape(content)}" />`;
    return re.test(source) ? source.replace(re, tag) : source.replace("</head>", `    ${tag}\n  </head>`);
  };
  const setLink = (source: string, rel: string, href: string) => {
    const re = new RegExp(`<link\\s+rel="${rel}"[^>]*>`, "i");
    const tag = `<link rel="${rel}" href="${escape(href)}" />`;
    return re.test(source) ? source.replace(re, tag) : source.replace("</head>", `    ${tag}\n  </head>`);
  };

  let next = html.replace(/<title>[^<]*<\/title>/i, `<title>${escape(tags.title)}</title>`);
  next = setName(next, "description", tags.description);
  next = setName(next, "robots", tags.robots);
  next = setName(next, "author", brand.titolare);
  next = setLink(next, "canonical", tags.canonical);
  next = setProp(next, "og:type", tags.ogType);
  next = setProp(next, "og:title", tags.ogTitle);
  next = setProp(next, "og:description", tags.ogDescription);
  next = setProp(next, "og:url", tags.ogUrl);
  next = setProp(next, "og:image", tags.ogImage);
  next = setProp(next, "og:image:url", tags.ogImage);
  next = setProp(next, "og:image:secure_url", tags.ogImage);
  next = setProp(next, "og:image:type", tags.ogImageType);
  next = setProp(next, "og:image:width", tags.ogImageWidth);
  next = setProp(next, "og:image:height", tags.ogImageHeight);
  next = setProp(next, "og:image:alt", tags.ogImageAlt);
  next = setProp(next, "og:locale", tags.ogLocale);
  next = setProp(next, "og:site_name", tags.ogSiteName);
  next = setName(next, "twitter:card", tags.twitterCard);
  next = setName(next, "twitter:title", tags.twitterTitle);
  next = setName(next, "twitter:description", tags.twitterDescription);
  next = setName(next, "twitter:image", tags.twitterImage);
  next = setName(next, "twitter:image:alt", tags.twitterImageAlt);
  const jsonTag = tags.jsonLd ? `<script type="application/ld+json">${tags.jsonLd}</script>` : "";
  if (next.includes('type="application/ld+json"')) {
    next = jsonTag
      ? next.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonTag)
      : next.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");
  } else if (jsonTag) {
    next = next.replace("</head>", `    ${jsonTag}\n  </head>`);
  }
  return next;
}

export function buildSitemapXml(today = "2026-11-04") {
  const urls = liveSeoPages().map(
    (page) => `  <url>
    <loc>${canonicalUrl(page.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${Number.isInteger(page.priority) ? page.priority.toFixed(1) : String(page.priority)}</priority>
  </url>`,
  );
  urls.push(`  <url>
    <loc>${SITE_URL}/privacy.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

const AI_SEARCH_AGENTS = [
  "Googlebot",
  "Google-Extended",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Applebot",
  "Applebot-Extended",
] as const;

export function buildRobotsTxt() {
  const privateDisallow = `Disallow: /carrello
Disallow: /login
Disallow: /admin
Disallow: /riservata
Disallow: /shop
Disallow: /corsi
Disallow: /api/`;

  const groups = [
    `User-agent: *
Allow: /
Allow: /chi-sono
Allow: /consulti
Allow: /percorsi
Allow: /blog
Allow: /contatti
Allow: /arcani
Allow: /arcani-minori
Allow: /privacy.html
Allow: /llms.txt

${privateDisallow}`,
    ...AI_SEARCH_AGENTS.map(
      (agent) => `User-agent: ${agent}
Allow: /`,
    ),
  ];

  return `${groups.join("\n\n")}

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

export function buildLlmsTxt() {
  return `# Tarot Italia

> ${home.seo.descrizione}

- Titolare: ${brand.titolare}
- Ruolo: ${brand.ruolo}
- Sede: ${brand.studioDiTeresa}
- P.IVA: ${brand.piva.replace(/^P\.IVA\s+/i, "")}
- Telefono / WhatsApp: ${brand.whatsapp}
- Email: ${brand.email}
- Coordinate: ${brand.coords}
- Letture: ${brand.modalitaLettura}
- Online: chiamata vocale WhatsApp, nessuna videochiamata

${brand.deontologia}

## Pagine

- Home: ${canonicalUrl("/")}
- Chi sono (Maria Teresa Rogani): ${canonicalUrl("/chi-sono")}
- Consulti di tarocchi evolutivi: ${canonicalUrl("/consulti")}
- Percorsi di Armonizzazione: ${canonicalUrl("/percorsi")}
- 22 Arcani Maggiori: ${canonicalUrl("/arcani")}
- Arcani Minori: ${canonicalUrl("/arcani-minori")}
- Blog: ${canonicalUrl("/blog")}
- Contatti: ${canonicalUrl("/contatti")}
- Informativa sulla privacy: ${SITE_URL}/privacy.html

## Identità

Tarot Italia è lo spazio di ${brand.titolare}, ${brand.ruolo.toLocaleLowerCase("it-IT")}, a Macerata: tarologia archetipica, consulti evolutivi e Percorsi di Armonizzazione, dal vivo e a distanza.
`;
}
