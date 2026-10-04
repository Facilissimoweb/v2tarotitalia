import { languageName, resolveOutputLanguage, SITE_SOURCE_LANG } from "../language.ts";
import { groqApiKey, groqModelPreference, ITHA_GROQ_LLAMA_70B, ITHA_GROQ_OSS_120B } from "./serverEnv.ts";

export type LocalizeTexts = Record<string, string>;

function groqModels() {
  const preferred = groqModelPreference();
  return [...new Set([preferred, ITHA_GROQ_LLAMA_70B, ITHA_GROQ_OSS_120B].filter(Boolean))];
}

export async function handleLocalize(body: { language?: string; texts?: LocalizeTexts }) {
  const texts = body.texts ?? {};
  if (Object.keys(texts).length === 0) return { status: 400, body: { error: "texts" } };
  try {
    const localized = await localizeOfficialTexts(body.language, texts);
    return { status: 200, body: { texts: localized, language: resolveOutputLanguage(body.language) } };
  } catch {
    return { status: 500, body: { error: "localize" } };
  }
}

export async function localizeOfficialTexts(language: string | undefined, texts: LocalizeTexts): Promise<LocalizeTexts> {
  const target = resolveOutputLanguage(language);
  if (target === SITE_SOURCE_LANG) return texts;
  const key = groqApiKey();
  if (!key) throw new Error("groq");
  const entries = Object.entries(texts).filter(([, value]) => value.trim());
  if (entries.length === 0) return texts;

  let lastError: Error | undefined;
  for (const model of groqModels()) {
    try {
      return await localizeWithModel(key, model, target, texts);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("groq");
    }
  }
  throw lastError ?? new Error("groq");
}

async function localizeWithModel(key: string, model: string, language: string, texts: LocalizeTexts) {
  const name = languageName(language);
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.15,
      max_tokens: 6000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You localize official Tarot Italia materials for on-page copy and downloadable documents (PDF, reports, course extracts).",
            `The source language of every page and archive is Italian (${SITE_SOURCE_LANG}).`,
            `Write every JSON value entirely in ${name} (${language}).`,
            "Keep the same JSON keys. Do not add keys. Do not invent methods, titles, biographies or teachings.",
            "Do not mention Jodorowsky. Do not add prescriptions. Stay faithful to the source.",
            "If a key is body, title or footer, translate the complete document text into the chosen language.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify(texts),
        },
      ],
    }),
  });
  if (response.status === 404 || response.status === 403) throw new Error("model");
  if (!response.ok) throw new Error("groq");
  const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const parsed = JSON.parse(json.choices?.[0]?.message?.content || "{}") as LocalizeTexts;
  const next: LocalizeTexts = { ...texts };
  for (const key of Object.keys(texts)) {
    if (typeof parsed[key] === "string" && parsed[key].trim()) next[key] = parsed[key];
  }
  return next;
}
