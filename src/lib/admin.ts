import { siteContent } from "../data/siteContent";

/** Unica email autorizzata all’agenda di studio. Non è la mail pubblica info@. */
export const STUDIO_ADMIN_EMAIL = siteContent.brand.emailPersonale.trim().toLowerCase();

export function isStudioAdminEmail(email: string | null | undefined) {
  return Boolean(email && email.trim().toLowerCase() === STUDIO_ADMIN_EMAIL);
}
