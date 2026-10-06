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
  iw: "he",
  jw: "jv",
  tl: "fil",
};

/** Catalogo Google Translate (NMT), senza italiano e senza varianti regionali duplicate. */
type Row = [code: string, label: string, name: string, latin: boolean, flag: string, rtl?: 1];

const ROWS: Row[] = [
  ["ab", "Аҧсуа", "Abkhaz", false, "ge"],
  ["ace", "Aceh", "Acehnese", true, "id"],
  ["ach", "Acholi", "Acholi", true, "ug"],
  ["af", "Afrikaans", "Afrikaans", true, "za"],
  ["ak", "Twi", "Twi (Akan)", true, "gh"],
  ["alz", "Alur", "Alur", true, "ug"],
  ["am", "አማርኛ", "Amharic", false, "et"],
  ["ar", "العربية", "Arabic", false, "sa", 1],
  ["as", "অসমীয়া", "Assamese", false, "in"],
  ["awa", "अवधी", "Awadhi", false, "in"],
  ["ay", "Aymar aru", "Aymara", true, "bo"],
  ["az", "Azərbaycan", "Azerbaijani", true, "az"],
  ["ba", "Башҡорт", "Bashkir", false, "ru"],
  ["ban", "Basa Bali", "Balinese", true, "id"],
  ["bbc", "Batak Toba", "Batak Toba", true, "id"],
  ["be", "Беларуская", "Belarusian", false, "by"],
  ["bem", "Ichibemba", "Bemba", true, "zm"],
  ["bew", "Betawi", "Betawi", true, "id"],
  ["bho", "भोजपुरी", "Bhojpuri", false, "in"],
  ["bik", "Bikol", "Bikol", true, "ph"],
  ["bg", "Български", "Bulgarian", false, "bg"],
  ["bm", "Bamanankan", "Bambara", true, "ml"],
  ["bn", "বাংলা", "Bengali", false, "bd"],
  ["br", "Brezhoneg", "Breton", true, "fr"],
  ["bs", "Bosanski", "Bosnian", true, "ba"],
  ["bts", "Batak Simalungun", "Batak Simalungun", true, "id"],
  ["btx", "Batak Karo", "Batak Karo", true, "id"],
  ["bua", "Буряад", "Buryat", false, "ru"],
  ["ca", "Català", "Catalan", true, "es"],
  ["ceb", "Cebuano", "Cebuano", true, "ph"],
  ["cgg", "Rukiga", "Kiga", true, "ug"],
  ["chm", "Олык марий", "Meadow Mari", false, "ru"],
  ["ckb", "کوردیی ناوەندی", "Kurdish (Sorani)", false, "iq", 1],
  ["cnh", "Hakha Chin", "Hakha Chin", true, "mm"],
  ["co", "Corsu", "Corsican", true, "fr"],
  ["crh", "Qırımtatarca", "Crimean Tatar", true, "ua"],
  ["crs", "Kreol Seselwa", "Seychellois Creole", true, "sc"],
  ["cs", "Čeština", "Czech", true, "cz"],
  ["cv", "Чӑвашла", "Chuvash", false, "ru"],
  ["cy", "Cymraeg", "Welsh", true, "gb-wls"],
  ["da", "Dansk", "Danish", true, "dk"],
  ["de", "Deutsch", "German", true, "de"],
  ["din", "Thuɔŋjäŋ", "Dinka", true, "ss"],
  ["doi", "डोगरी", "Dogri", false, "in"],
  ["dov", "Dombe", "Dombe", true, "mz"],
  ["dv", "ދިވެހި", "Divehi", false, "mv", 1],
  ["dz", "རྫོང་ཁ", "Dzongkha", false, "bt"],
  ["ee", "Eʋegbe", "Ewe", true, "gh"],
  ["el", "Ελληνικά", "Greek", false, "gr"],
  ["en", "English", "English", true, "gb"],
  ["eo", "Esperanto", "Esperanto", true, "eo"],
  ["es", "Español", "Spanish", true, "es"],
  ["et", "Eesti", "Estonian", true, "ee"],
  ["eu", "Euskara", "Basque", true, "es"],
  ["fa", "فارسی", "Persian", false, "ir", 1],
  ["ff", "Fulfulde", "Fulfulde", true, "sn"],
  ["fi", "Suomi", "Finnish", true, "fi"],
  ["fj", "Na Vosa Vakaviti", "Fijian", true, "fj"],
  ["fr", "Français", "French", true, "fr"],
  ["fy", "Frysk", "Frisian", true, "nl"],
  ["ga", "Gaeilge", "Irish", true, "ie"],
  ["gaa", "Ga", "Ga", true, "gh"],
  ["gd", "Gàidhlig", "Scots Gaelic", true, "gb-sct"],
  ["gl", "Galego", "Galician", true, "es"],
  ["gn", "Avañe’ẽ", "Guarani", true, "py"],
  ["gom", "कोंकणी", "Konkani", false, "in"],
  ["gu", "ગુજરાતી", "Gujarati", false, "in"],
  ["ha", "Hausa", "Hausa", true, "ng"],
  ["haw", "ʻŌlelo Hawaiʻi", "Hawaiian", true, "us"],
  ["hi", "हिन्दी", "Hindi", false, "in"],
  ["hil", "Hiligaynon", "Hiligaynon", true, "ph"],
  ["hmn", "Hmoob", "Hmong", true, "la"],
  ["hr", "Hrvatski", "Croatian", true, "hr"],
  ["hrx", "Hunsrik", "Hunsrik", true, "br"],
  ["ht", "Kreyòl ayisyen", "Haitian Creole", true, "ht"],
  ["hu", "Magyar", "Hungarian", true, "hu"],
  ["hy", "Հայերեն", "Armenian", false, "am"],
  ["id", "Bahasa Indonesia", "Indonesian", true, "id"],
  ["ig", "Igbo", "Igbo", true, "ng"],
  ["ilo", "Ilokano", "Ilocano", true, "ph"],
  ["is", "Íslenska", "Icelandic", true, "is"],
  ["iw", "עברית", "Hebrew", false, "il", 1],
  ["ja", "日本語", "Japanese", false, "jp"],
  ["jw", "Basa Jawa", "Javanese", true, "id"],
  ["ka", "ქართული", "Georgian", false, "ge"],
  ["kk", "Қазақ", "Kazakh", false, "kz"],
  ["km", "ខ្មែរ", "Khmer", false, "kh"],
  ["kn", "ಕನ್ನಡ", "Kannada", false, "in"],
  ["ko", "한국어", "Korean", false, "kr"],
  ["kri", "Krio", "Krio", true, "sl"],
  ["ktu", "Kituba", "Kituba", true, "cd"],
  ["ku", "Kurdî", "Kurdish (Kurmanji)", true, "tr"],
  ["ky", "Кыргызча", "Kyrgyz", false, "kg"],
  ["la", "Latina", "Latin", true, "va"],
  ["lb", "Lëtzebuergesch", "Luxembourgish", true, "lu"],
  ["lg", "Luganda", "Ganda (Luganda)", true, "ug"],
  ["li", "Limburgs", "Limburgan", true, "nl"],
  ["lij", "Ligure", "Ligurian", true, "it"],
  ["lmo", "Lombard", "Lombard", true, "it"],
  ["ln", "Lingála", "Lingala", true, "cd"],
  ["lo", "ລາວ", "Lao", false, "la"],
  ["lt", "Lietuvių", "Lithuanian", true, "lt"],
  ["ltg", "Latgalīšu", "Latgalian", true, "lv"],
  ["luo", "Dholuo", "Luo", true, "ke"],
  ["lus", "Mizo ṭawng", "Mizo", true, "in"],
  ["lv", "Latviešu", "Latvian", true, "lv"],
  ["mai", "मैथिली", "Maithili", false, "in"],
  ["mak", "Basa Mangkasara", "Makassar", true, "id"],
  ["mg", "Malagasy", "Malagasy", true, "mg"],
  ["min", "Baso Minang", "Minang", true, "id"],
  ["mi", "Māori", "Maori", true, "nz"],
  ["mk", "Македонски", "Macedonian", false, "mk"],
  ["ml", "മലയാളം", "Malayalam", false, "in"],
  ["mn", "Монгол", "Mongolian", false, "mn"],
  ["mni-Mtei", "ꯃꯤꯇꯩꯂꯣꯟ", "Meiteilon (Manipuri)", false, "in"],
  ["mr", "मराठी", "Marathi", false, "in"],
  ["ms", "Bahasa Melayu", "Malay", true, "my"],
  ["mt", "Malti", "Maltese", true, "mt"],
  ["my", "မြန်မာ", "Myanmar (Burmese)", false, "mm"],
  ["ne", "नेपाली", "Nepali", false, "np"],
  ["new", "नेपाल भाषा", "Nepalbhasa (Newari)", false, "np"],
  ["nl", "Nederlands", "Dutch", true, "nl"],
  ["no", "Norsk", "Norwegian", true, "no"],
  ["nr", "isiNdebele", "Ndebele (South)", true, "za"],
  ["nso", "Sepedi", "Northern Sotho (Sepedi)", true, "za"],
  ["nus", "Thok Nath", "Nuer", true, "ss"],
  ["ny", "Chichewa", "Chichewa (Nyanja)", true, "mw"],
  ["oc", "Occitan", "Occitan", true, "fr"],
  ["om", "Afaan Oromoo", "Oromo", true, "et"],
  ["or", "ଓଡ଼ିଆ", "Odia (Oriya)", false, "in"],
  ["pa", "ਪੰਜਾਬੀ", "Punjabi", false, "in"],
  ["pag", "Pangasinan", "Pangasinan", true, "ph"],
  ["pam", "Kapampangan", "Kapampangan", true, "ph"],
  ["pap", "Papiamentu", "Papiamento", true, "cw"],
  ["pl", "Polski", "Polish", true, "pl"],
  ["ps", "پښتو", "Pashto", false, "af", 1],
  ["pt", "Português", "Portuguese", true, "pt"],
  ["qu", "Runasimi", "Quechua", true, "pe"],
  ["rn", "Ikirundi", "Rundi", true, "bi"],
  ["ro", "Română", "Romanian", true, "ro"],
  ["rom", "Romani", "Romani", true, "ro"],
  ["ru", "Русский", "Russian", false, "ru"],
  ["rw", "Ikinyarwanda", "Kinyarwanda", true, "rw"],
  ["sa", "संस्कृतम्", "Sanskrit", false, "in"],
  ["scn", "Sicilianu", "Sicilian", true, "it"],
  ["sd", "سنڌي", "Sindhi", false, "pk", 1],
  ["sg", "Sängö", "Sango", true, "cf"],
  ["shn", "လိၵ်ႈတႆး", "Shan", false, "mm"],
  ["si", "සිංහල", "Sinhala (Sinhalese)", false, "lk"],
  ["sk", "Slovenčina", "Slovak", true, "sk"],
  ["sl", "Slovenščina", "Slovenian", true, "si"],
  ["sm", "Gagana Samoa", "Samoan", true, "ws"],
  ["sn", "chiShona", "Shona", true, "zw"],
  ["so", "Soomaali", "Somali", true, "so"],
  ["sq", "Shqip", "Albanian", true, "al"],
  ["sr", "Српски", "Serbian", false, "rs"],
  ["ss", "siSwati", "Swati", true, "sz"],
  ["st", "Sesotho", "Sesotho", true, "ls"],
  ["su", "Basa Sunda", "Sundanese", true, "id"],
  ["sv", "Svenska", "Swedish", true, "se"],
  ["sw", "Kiswahili", "Swahili", true, "tz"],
  ["szl", "Ślůnski", "Silesian", true, "pl"],
  ["ta", "தமிழ்", "Tamil", false, "in"],
  ["te", "తెలుగు", "Telugu", false, "in"],
  ["tet", "Tetun", "Tetum", true, "tl"],
  ["tg", "Тоҷикӣ", "Tajik", false, "tj"],
  ["th", "ไทย", "Thai", false, "th"],
  ["ti", "ትግርኛ", "Tigrinya", false, "er"],
  ["tk", "Türkmen", "Turkmen", true, "tm"],
  ["tl", "Filipino", "Filipino (Tagalog)", true, "ph"],
  ["tn", "Setswana", "Tswana", true, "bw"],
  ["tr", "Türkçe", "Turkish", true, "tr"],
  ["ts", "Xitsonga", "Tsonga", true, "za"],
  ["tt", "Татар", "Tatar", false, "ru"],
  ["ug", "ئۇيغۇرچە", "Uyghur", false, "cn", 1],
  ["uk", "Українська", "Ukrainian", false, "ua"],
  ["ur", "اردو", "Urdu", false, "pk", 1],
  ["uz", "Oʻzbekcha", "Uzbek", true, "uz"],
  ["vi", "Tiếng Việt", "Vietnamese", true, "vn"],
  ["xh", "isiXhosa", "Xhosa", true, "za"],
  ["yi", "ייִדיש", "Yiddish", false, "il", 1],
  ["yo", "Yorùbá", "Yoruba", true, "ng"],
  ["yua", "Màaya t’aan", "Yucatec Maya", true, "mx"],
  ["yue", "粵語", "Cantonese", false, "hk"],
  ["zh-CN", "中文", "Simplified Chinese", false, "cn"],
  ["zh-TW", "中文（繁體）", "Traditional Chinese", false, "tw"],
  ["zu", "isiZulu", "Zulu", true, "za"],
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
