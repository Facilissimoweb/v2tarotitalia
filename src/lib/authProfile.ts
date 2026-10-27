import type { User } from "@supabase/supabase-js";
import type { AuthProviderKind } from "./storage";

export function providerFromUser(user: User | null | undefined): AuthProviderKind {
  const identities = user?.identities ?? [];
  const google = identities.some((item) => item.provider === "google");
  const email = identities.some((item) => item.provider === "email");
  if (google && !email) return "google";
  const appProvider = user?.app_metadata?.provider;
  if (appProvider === "google" && !email) return "google";
  return "email";
}

export function canManageCredentials(user: User | null | undefined, fallback: AuthProviderKind = "email") {
  const identities = user?.identities ?? [];
  if (identities.length === 0) return fallback === "email";
  return identities.some((item) => item.provider === "email");
}
