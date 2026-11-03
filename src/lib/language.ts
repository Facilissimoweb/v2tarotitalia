import { SITE_LOCALE } from "./locale.ts";

export type SiteLanguage = {
  code: string;
  label: string;
  name: string;
  latin: boolean;
  flag: string;
  rtl?: boolean;
};

export const SITE_SOURCE_LANG = SITE_LOCALE.htmlLang;
export const LANGUAGE_STORAGE_KEY = "ti-lingua";
export const LANGUAGE_QUERY_KEY = "hl";

const HREFLANG_OVERRIDE: Record<string, string> = {
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

/** Lingue essenziali: europee più note, più cinese, giapponese e arabo. Italiano è la fonte. */
type Row = [code: string, label: string, name: string, latin: boolean, flag: string, rtl?: 1];

const ROWS: Row[] = [
  ["ar", "العربية", "Arabic", false, "sa", 1],
  ["cs", "Čeština", "Czech", true, "cz"],
  ["da", "Dansk", "Danish", true, "dk"],
  ["de", "Deutsch", "German", true, "de"],
  ["el", "Ελληνικά", "Greek", false, "gr"],
  ["en", "English", "English", true, "gb"],
  ["es", "Español", "Spanish", true, "es"],
  ["fi", "Suomi", "Finnish", true, "fi"],
  ["fr", "Français", "French", true, "fr"],
  ["hu", "Magyar", "Hungarian", true, "hu"],
  ["ja", "日本語", "Japanese", false, "jp"],
  ["nl", "Nederlands", "Dutch", true, "nl"],
  ["no", "Norsk", "Norwegian", true, "no"],
  ["pl", "Polski", "Polish", true, "pl"],
  ["pt", "Português", "Portuguese", true, "pt"],
  ["ro", "Română", "Romanian", true, "ro"],
  ["ru", "Русский", "Russian", false, "ru"],
  ["sv", "Svenska", "Swedish", true, "se"],
  ["uk", "Українська", "Ukrainian", false, "ua"],
  ["zh-CN", "中文", "Simplified Chinese", false, "cn"],
  ["zh-TW", "中文（繁體）", "Traditional Chinese", false, "tw"],
];

function toLanguage(row: Row): SiteLanguage {
  return {
    code: row[0],
    label: row[1],
    name: row[2],
    latin: row[3],
    flag: row[4],
    ...(row[5] ? { rtl: true } : {}),
  };
}

export const SITE_LANGUAGES: SiteLanguage[] = ROWS.map(toLanguage).sort((a, b) =>
  a.name.localeCompare(b.name, "en"),
);

const BY_CODE = new Map(SITE_LANGUAGES.map((lang) => [lang.code, lang]));

export function findLanguage(code?: string | null) {
  if (!code) return undefined;
  return BY_CODE.get(code);
}

export function resolveOutputLanguage(code?: string | null) {
  if (!code || code === SITE_SOURCE_LANG) return SITE_SOURCE_LANG;
  return BY_CODE.has(code) ? code : SITE_SOURCE_LANG;
}

export function isSourceLanguage(code?: string | null) {
  return resolveOutputLanguage(code) === SITE_SOURCE_LANG;
}

export function languageName(code?: string | null) {
  const resolved = resolveOutputLanguage(code);
  if (resolved === SITE_SOURCE_LANG) return "Italian";
  return findLanguage(resolved)?.name ?? "Italian";
}

export function isLatinLanguage(code?: string | null) {
  const resolved = resolveOutputLanguage(code);
  if (resolved === SITE_SOURCE_LANG) return true;
  return findLanguage(resolved)?.latin ?? true;
}

export function languageLabel(code?: string | null) {
  const resolved = resolveOutputLanguage(code);
  if (resolved === SITE_SOURCE_LANG) return "Italiano";
  return findLanguage(resolved)?.label ?? "Italiano";
}

export function languageFlagId(code?: string | null) {
  const resolved = resolveOutputLanguage(code);
  if (resolved === SITE_SOURCE_LANG) return "it";
  return findLanguage(resolved)?.flag ?? "it";
}

export function isRtlLanguage(code?: string | null) {
  const resolved = resolveOutputLanguage(code);
  return Boolean(findLanguage(resolved)?.rtl);
}

export function hreflangCode(code?: string | null) {
  const resolved = resolveOutputLanguage(code);
  if (resolved === SITE_SOURCE_LANG) return SITE_SOURCE_LANG;
  return HREFLANG_OVERRIDE[resolved] ?? resolved;
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

export function includedTranslateCodes() {
  return [SITE_SOURCE_LANG, ...SITE_LANGUAGES.map((lang) => lang.code)].join(",");
}
