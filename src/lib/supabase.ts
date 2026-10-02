import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { siteContent } from "../data/siteContent";

export const SUPABASE_ADMIN_EMAIL = siteContent.brand.adminEmail;

export type SupabaseEnv = {
  url: string;
  anonKey: string;
  adminEmail: string;
};

export function getSupabaseEnv(): SupabaseEnv {
  return {
    url: import.meta.env.VITE_SUPABASE_URL?.trim() ?? "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "",
    adminEmail: SUPABASE_ADMIN_EMAIL,
  };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseEnv();
  return url.startsWith("https://") && anonKey.length > 20;
}

let client: SupabaseClient | null = null;

/** Base per la futura area di login e raccolta dati (riferimento admin: info@tarotitalia.com). */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (client) return client;
  const { url, anonKey } = getSupabaseEnv();
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}