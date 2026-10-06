/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_TELEGRAM_URL?: string;
  readonly VITE_PAYPAL_CLIENT_ID?: string;
  readonly VITE_SITE_GATE?: string;
  readonly VITE_SITE_ACCESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}