import { siteContent } from "../data/siteContent";
import { normalizeAppPath } from "./siteRoutes";

const { brand, chiSiamo, consulti, home, legal, nav, pages } = siteContent;

export const SITE_URL = legal.sitoUrl.replace(/\/$/, "");
export const DEFAULT_OG_IMAGE = `${SITE_URL}/angelo-hero.webp`;
export const INDEX_FOLLOW = "index, follow, max-snippet:-1, max-image-preview:large";
export const NOINDEX = "noindex, nofollow";

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  image: string;
  robots: string;
  jsonLd?: boolean;
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

const LIVE: SeoPage[] = [
  {
    path: "/",
    title: home.seo.titolo,
    description: home.seo.descrizione,
    image: DEFAULT_OG_IMAGE,
    robots: INDEX_FOLLOW,
    jsonLd: true,
    changefreq: "weekly",
    priority: 1,
  },
  {
    path: "/chi-sono",
    title: chiSiamo.seo.titolo,
    description: chiSiamo.seo.descrizione,
    image: imageUrl(chiSiamo.immagini.hero.src),
    robots: INDEX_FOLLOW,
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    path: "/consulti",
    title: consulti.seo.titolo,
    description: consulti.seo.descrizione,
    image: imageUrl(consulti.immagini.hero.src),
    robots: INDEX_FOLLOW,
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/percorsi",
    title: pages.percorsi.seo.titolo,
    description: pages.percorsi.seo.descrizione,
    image: imageUrl(siteContent.percorsi.immagini.hero.src),
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
];

const PRIVATE_PATHS = ["/carrello", "/login", "/riservata"] as const;

export function liveSeoPages() {
  return LIVE;
}

export function seoForPath(pathname: string): SeoPage {
  const path = normalizeAppPath(pathname);
  const live = LIVE.find((page) => page.path === path);
  if (live) return live;

  if (path === "/arcani" || path.startsWith("/arcani/")) {
    return {
      path,
      title: brandedTitle(nav.arcaniMaggiori),
      description: brand.descrizione,
      image: DEFAULT_OG_IMAGE,
      robots: INDEX_FOLLOW,
      changefreq: "monthly",
      priority: 0.6,
    };
  }

  if (path === "/arcani-minori" || path.startsWith("/arcani-minori/")) {
    return {
      path,
      title: brandedTitle(pages.arcaniMinori.titolo),
      description: brand.descrizione,
      image: DEFAULT_OG_IMAGE,
      robots: INDEX_FOLLOW,
      changefreq: "monthly",
      priority: 0.6,
    };
  }

  const privatePage = PRIVATE_PATHS.find((item) => item === path);
  if (privatePage) {
    const labels: Record<(typeof PRIVATE_PATHS)[number], string> = {
      "/carrello": pages.carrello.titolo,
      "/login": nav.accedi,
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

function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: brand.name,
    legalName: brand.sottotitolo,
    description: home.seo.descrizione,
    url: SITE_URL,
    image: DEFAULT_OG_IMAGE,
    telephone: brand.whatsapp,
    email: brand.email,
    founder: {
      "@type": "Person",
      name: brand.titolare,
      jobTitle: brand.ruolo,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Via Crispi 37",
      addressLocality: brand.city,
      postalCode: "62100",
      addressRegion: "MC",
      addressCountry: "IT",
    },
    areaServed: ["IT", "Online"],
    priceRange: "€€",
  };
}

export function seoTagValues(page: SeoPage) {
  const url = canonicalUrl(page.path);
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
    ogImageAlt: brand.sottotitolo,
    ogLocale: "it_IT",
    ogSiteName: brand.wordmark,
    twitterCard: "summary_large_image",
    twitterTitle: page.title,
    twitterDescription: page.description,
    twitterImage: page.image,
    jsonLd: page.jsonLd ? JSON.stringify(localBusinessJsonLd()) : "",
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
  upsertMeta(head, "property", "og:image:alt", tags.ogImageAlt);
  upsertMeta(head, "property", "og:locale", tags.ogLocale);
  upsertMeta(head, "property", "og:site_name", tags.ogSiteName);
  upsertMeta(head, "name", "twitter:card", tags.twitterCard);
  upsertMeta(head, "name", "twitter:title", tags.twitterTitle);
  upsertMeta(head, "name", "twitter:description", tags.twitterDescription);
  upsertMeta(head, "name", "twitter:image", tags.twitterImage);

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
  next = setProp(next, "og:image:alt", tags.ogImageAlt);
  next = setProp(next, "og:locale", tags.ogLocale);
  next = setProp(next, "og:site_name", tags.ogSiteName);
  next = setName(next, "twitter:card", tags.twitterCard);
  next = setName(next, "twitter:title", tags.twitterTitle);
  next = setName(next, "twitter:description", tags.twitterDescription);
  next = setName(next, "twitter:image", tags.twitterImage);
  if (tags.jsonLd) {
    const jsonTag = `<script type="application/ld+json">${tags.jsonLd}</script>`;
    next = next.includes('type="application/ld+json"')
      ? next.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonTag)
      : next.replace("</head>", `    ${jsonTag}\n  </head>`);
  }
  return next;
}

export function buildSitemapXml(today = "2026-11-04") {
  const urls = LIVE.map(
    (page) => `  <url>
    <loc>${canonicalUrl(page.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
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

export function buildRobotsTxt() {
  return `User-agent: *
Allow: /
Allow: /chi-sono
Allow: /consulti
Allow: /percorsi
Allow: /blog
Allow: /contatti
Allow: /privacy.html

Disallow: /carrello
Disallow: /login
Disallow: /riservata
Disallow: /shop
Disallow: /corsi
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
}
