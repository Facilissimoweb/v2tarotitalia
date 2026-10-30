import { readServerEnv } from "./serverEnv.ts";
import {
  emptySubstackFeed,
  SUBSTACK_FEED_DEFAULT,
  SUBSTACK_HOME,
  type SubstackFeedPayload,
  type SubstackPost,
} from "./substack.ts";

const MAX_POSTS = 12;
const SNIPPET = 220;
const FETCH_MS = 8000;

const UA = "TarotItaliaBlog/1.0 (+https://www.tarotitalia.com)";

type ArchiveRow = {
  id?: number | string;
  title?: string;
  subtitle?: string;
  slug?: string;
  post_date?: string;
  canonical_url?: string;
  description?: string;
  truncated_body_text?: string;
  body_html?: string;
  is_published?: boolean;
};

function feedUrl() {
  return readServerEnv("SUBSTACK_FEED_URL", SUBSTACK_FEED_DEFAULT);
}

function decodeEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number.parseInt(dec, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

function firstTag(xml: string, name: string) {
  const re = new RegExp(
    `<${name}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))</${name}>`,
    "i",
  );
  const match = xml.match(re);
  return decodeEntities((match?.[1] ?? match?.[2] ?? "").trim());
}

function htmlToSnippet(raw: string) {
  const text = decodeEntities(raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  if (text.length <= SNIPPET) return text;
  const cut = text.slice(0, SNIPPET);
  const space = cut.lastIndexOf(" ");
  return `${(space > 140 ? cut.slice(0, space) : cut).trim()}…`;
}

function toIso(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : "";
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function looksLikeFeed(xml: string) {
  return /<(rss|feed|rdf:RDF)\b/i.test(xml);
}

function parseRss(xml: string): SubstackPost[] {
  const blocks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((match) => match[0]);
  const posts: SubstackPost[] = [];

  for (const block of blocks) {
    const title = firstTag(block, "title");
    const link =
      firstTag(block, "link") ||
      block.match(/<link\b[^>]*href=["']([^"']+)["']/i)?.[1]?.trim() ||
      firstTag(block, "guid");
    const date = toIso(firstTag(block, "pubDate") || firstTag(block, "published") || firstTag(block, "updated"));
    const snippetSource =
      firstTag(block, "description") || firstTag(block, "summary") || firstTag(block, "content:encoded");
    if (!title || !isHttpUrl(link)) continue;
    posts.push({
      id: firstTag(block, "guid") || link,
      title,
      date,
      link,
      snippet: htmlToSnippet(snippetSource),
    });
    if (posts.length >= MAX_POSTS) break;
  }

  return posts;
}

function mapArchive(rows: ArchiveRow[]): SubstackPost[] {
  const posts: SubstackPost[] = [];
  for (const row of rows) {
    if (row.is_published === false) continue;
    const title = row.title?.trim() ?? "";
    const link = (row.canonical_url || (row.slug ? `${SUBSTACK_HOME}/p/${row.slug}` : "")).trim();
    if (!title || !isHttpUrl(link)) continue;
    posts.push({
      id: String(row.id ?? link),
      title,
      date: toIso(row.post_date ?? ""),
      link,
      snippet: htmlToSnippet(
        row.description || row.subtitle || row.truncated_body_text || row.body_html || "",
      ),
    });
    if (posts.length >= MAX_POSTS) break;
  }
  return posts;
}

async function fetchText(url: string, accept: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    return await fetch(url, {
      headers: { Accept: accept, "User-Agent": UA },
      redirect: "manual",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function postsFromRss(url: string): Promise<SubstackPost[] | null> {
  const response = await fetchText(url, "application/rss+xml, application/atom+xml, application/xml, text/xml, */*");
  if (response.status >= 300 && response.status < 400) return null;
  if (!response.ok) return null;
  const xml = await response.text();
  if (!looksLikeFeed(xml)) return null;
  return parseRss(xml);
}

async function postsFromJson(endpoint: string): Promise<SubstackPost[] | null> {
  const response = await fetchText(endpoint, "application/json");
  if (response.status >= 300 && response.status < 400) return null;
  if (!response.ok) return null;
  const data: unknown = await response.json();
  const rows = Array.isArray(data)
    ? data
    : Array.isArray((data as { posts?: unknown }).posts)
      ? (data as { posts: ArchiveRow[] }).posts
      : null;
  if (!rows) return null;
  return mapArchive(rows as ArchiveRow[]);
}

export async function handleSubstackFeed(): Promise<SubstackFeedPayload> {
  const url = feedUrl();
  if (!isHttpUrl(url)) return emptySubstackFeed();

  const origin = new URL(url).origin.replace(/\/$/, "");
  try {
    const fromRss = await postsFromRss(url);
    if (fromRss && fromRss.length > 0) return { available: true, posts: fromRss };

    const fromPosts = await postsFromJson(`${origin}/api/v1/posts?limit=${MAX_POSTS}&offset=0`);
    if (fromPosts && fromPosts.length > 0) return { available: true, posts: fromPosts };

    const fromArchive = await postsFromJson(`${origin}/api/v1/archive?sort=new&offset=0&limit=${MAX_POSTS}`);
    if (fromArchive && fromArchive.length > 0) return { available: true, posts: fromArchive };

    if (fromRss || fromPosts || fromArchive) return { available: true, posts: [] };
    return emptySubstackFeed();
  } catch {
    return emptySubstackFeed();
  }
}
