declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const SCRIPT_ID = "ga4-gtag";

function measurementId() {
  return import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim() || "";
}

function setGaDisabled(id: string, disabled: boolean) {
  Object.assign(window, { [`ga-disable-${id}`]: disabled });
}

export function initGA4() {
  const id = measurementId();
  if (!id || typeof window === "undefined") return;

  setGaDisabled(id, false);
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("js", new Date());
  window.gtag("consent", "update", {
    analytics_storage: "granted",
  });
  window.gtag("config", id, { anonymize_ip: true });

  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function disableGA4() {
  const id = measurementId();
  if (!id || typeof window === "undefined") return;
  setGaDisabled(id, true);
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
  });
}
