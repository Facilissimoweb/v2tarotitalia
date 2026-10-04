import { LANGUAGE_STORAGE_KEY, SITE_LANGUAGES, SITE_SOURCE_LANG } from "./language";
import { applySiteLocale } from "./locale";

export { SITE_LANGUAGES, SITE_SOURCE_LANG } from "./language";

const STORAGE_KEY = LANGUAGE_STORAGE_KEY;
const COOKIE_NAME = "googtrans";
const SCRIPT_ID = "ti-google-translate";
const ELEMENT_ID = "google_translate_element";

type TranslateCombo = HTMLSelectElement | null;

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay: boolean;
            multilanguagePage: boolean;
          },
          id: string,
        ) => void;
      };
    };
  }
}

function includedLanguages() {
  return [SITE_SOURCE_LANG, ...SITE_LANGUAGES.map((lang) => lang.code)].join(",");
}

function cookieDomain() {
  const host = window.location.hostname;
  if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return host;
  return `.${host.replace(/^www\./, "")}`;
}

function writeCookie(value: string) {
  const expires = "expires=Thu, 31 Dec 2099 23:59:59 GMT";
  const encoded = encodeURIComponent(value);
  document.cookie = `${COOKIE_NAME}=${encoded}; ${expires}; path=/`;
  document.cookie = `${COOKIE_NAME}=${encoded}; ${expires}; path=/; domain=${cookieDomain()}`;
}

function clearCookie() {
  const past = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `${COOKIE_NAME}=; ${past}; path=/`;
  document.cookie = `${COOKIE_NAME}=; ${past}; path=/; domain=${cookieDomain()}`;
}

function combo(): TranslateCombo {
  return document.querySelector<HTMLSelectElement>(".goog-te-combo");
}

function applyCombo(code: string) {
  const select = combo();
  if (!select) return false;
  if (select.value !== code) {
    select.value = code;
    select.dispatchEvent(new Event("change"));
  }
  return true;
}

function waitForCombo(tries = 40): Promise<HTMLSelectElement | null> {
  return new Promise((resolve) => {
    const tick = (left: number) => {
      const select = combo();
      if (select) {
        resolve(select);
        return;
      }
      if (left <= 0) {
        resolve(null);
        return;
      }
      window.setTimeout(() => tick(left - 1), 80);
    };
    tick(tries);
  });
}

function ensureHost() {
  if (document.getElementById(ELEMENT_ID)) return;
  const host = document.createElement("div");
  host.id = ELEMENT_ID;
  host.setAttribute("aria-hidden", "true");
  document.body.appendChild(host);
}

function loadEngine() {
  if (document.getElementById(SCRIPT_ID) || window.google?.translate) return;
  ensureHost();
  window.googleTranslateElementInit = () => {
    if (!window.google?.translate) return;
    new window.google.translate.TranslateElement(
      {
        pageLanguage: SITE_SOURCE_LANG,
        includedLanguages: includedLanguages(),
        autoDisplay: false,
        multilanguagePage: false,
      },
      ELEMENT_ID,
    );
  };
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export function storedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function restoreLanguage() {
  const code = storedLanguage();
  if (!code || !SITE_LANGUAGES.some((lang) => lang.code === code)) return;
  void applyLanguage(code);
}

export async function applyLanguage(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore quota */
  }
  writeCookie(`/${SITE_SOURCE_LANG}/${code}`);
  loadEngine();
  const select = await waitForCombo();
  if (select) applyCombo(code);
}

export function resetLanguage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  clearCookie();
  applySiteLocale();
  const select = combo();
  if (select) applyCombo(SITE_SOURCE_LANG);
  if (document.documentElement.classList.contains("translated-ltr") || document.documentElement.classList.contains("translated-rtl")) {
    window.location.reload();
  }
}
