/** Localizzazione del sito: italiano d’Italia, origine di ogni traduzione. */
export const SITE_LOCALE = {
  htmlLang: "it",
  bcp47: "it-IT",
  ogLocale: "it_IT",
  country: "IT",
  timezone: "Europe/Rome",
  currency: "EUR",
  datePattern: "DD/MM/YYYY",
} as const;

export function applySiteLocale() {
  applyDocumentLanguage(SITE_LOCALE.htmlLang);
}

export function applyDocumentLanguage(code: string, options?: { rtl?: boolean; hreflang?: string }) {
  document.documentElement.lang = options?.hreflang ?? code;
  document.documentElement.dir = options?.rtl ? "rtl" : "ltr";
}

export function siteDateTime(options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(SITE_LOCALE.bcp47, {
    timeZone: SITE_LOCALE.timezone,
    ...options,
  });
}

export function formatSiteDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return siteDateTime({ day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function formatSiteCurrency(value: number) {
  return new Intl.NumberFormat(SITE_LOCALE.bcp47, {
    style: "currency",
    currency: SITE_LOCALE.currency,
  }).format(value);
}
