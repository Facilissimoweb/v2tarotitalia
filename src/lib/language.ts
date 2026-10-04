import { SITE_LOCALE } from "./locale.ts";

export type SiteLanguage = {
  code: string;
  label: string;
  name: string;
  latin: boolean;
};

export const SITE_SOURCE_LANG = SITE_LOCALE.htmlLang;
export const LANGUAGE_STORAGE_KEY = "ti-lingua";

export const SITE_LANGUAGES: SiteLanguage[] = [
  { code: "en", label: "English", name: "English", latin: true },
  { code: "fr", label: "Français", name: "French", latin: true },
  { code: "es", label: "Español", name: "Spanish", latin: true },
  { code: "de", label: "Deutsch", name: "German", latin: true },
  { code: "pt", label: "Português", name: "Portuguese", latin: true },
  { code: "zh-CN", label: "中文", name: "Simplified Chinese", latin: false },
  { code: "ar", label: "العربية", name: "Arabic", latin: false },
  { code: "ja", label: "日本語", name: "Japanese", latin: false },
  { code: "ru", label: "Русский", name: "Russian", latin: false },
  { code: "nl", label: "Nederlands", name: "Dutch", latin: true },
];

export function resolveOutputLanguage(code?: string | null) {
  if (!code || code === SITE_SOURCE_LANG) return SITE_SOURCE_LANG;
  return SITE_LANGUAGES.some((lang) => lang.code === code) ? code : SITE_SOURCE_LANG;
}

export function isSourceLanguage(code?: string | null) {
  return resolveOutputLanguage(code) === SITE_SOURCE_LANG;
}

export function languageName(code?: string | null) {
  const resolved = resolveOutputLanguage(code);
  if (resolved === SITE_SOURCE_LANG) return "Italian";
  return SITE_LANGUAGES.find((lang) => lang.code === resolved)?.name ?? "Italian";
}

export function isLatinLanguage(code?: string | null) {
  const resolved = resolveOutputLanguage(code);
  if (resolved === SITE_SOURCE_LANG) return true;
  return SITE_LANGUAGES.find((lang) => lang.code === resolved)?.latin ?? true;
}

export function languageLabel(code?: string | null) {
  const resolved = resolveOutputLanguage(code);
  if (resolved === SITE_SOURCE_LANG) return "Italiano";
  return SITE_LANGUAGES.find((lang) => lang.code === resolved)?.label ?? "Italiano";
}

export function activeLanguage(override?: string | null) {
  if (override) return resolveOutputLanguage(override);
  try {
    if (typeof localStorage === "undefined") return SITE_SOURCE_LANG;
    return resolveOutputLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return SITE_SOURCE_LANG;
  }
}
