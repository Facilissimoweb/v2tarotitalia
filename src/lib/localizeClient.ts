import { activeLanguage, isSourceLanguage } from "./language";

const cache = new Map<string, Record<string, string>>();

export type LocalizeOptions = {
  language?: string;
  strict?: boolean;
};

function cacheKey(language: string, texts: Record<string, string>) {
  return `${language}:${Object.keys(texts)
    .sort()
    .map((key) => `${key}=${texts[key]}`)
    .join("|")}`;
}

function changed(source: Record<string, string>, next: Record<string, string>) {
  return Object.keys(source).some((key) => next[key] && next[key] !== source[key]);
}

export async function localizeOfficialTexts(
  language: string | undefined,
  texts: Record<string, string>,
  options: LocalizeOptions = {},
) {
  const target = activeLanguage(language ?? options.language);
  if (isSourceLanguage(target)) return texts;
  const key = cacheKey(target, texts);
  const hit = cache.get(key);
  if (hit) return hit;
  const response = await fetch("/api/localize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: target, texts }),
  });
  const json = (await response.json()) as { texts?: Record<string, string> };
  if (!response.ok || !json.texts || !changed(texts, json.texts)) {
    if (options.strict) throw new Error("localize");
    return texts;
  }
  cache.set(key, json.texts);
  return json.texts;
}
