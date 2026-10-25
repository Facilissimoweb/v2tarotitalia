import { siteContent } from "../data/siteContent";

const { errori } = siteContent.auth;

type AuthErrorLike = {
  message?: string | null;
  code?: string | null;
  status?: number | null;
} | null | undefined;

/** Maps Supabase / API auth failures to polite Italian copy. Never returns raw English. */
export function mapAuthError(
  error: AuthErrorLike | string | null | undefined,
  fallback: string = errori.generico,
): string {
  const message = (typeof error === "string" ? error : error?.message ?? "").trim();
  const code = (typeof error === "string" ? "" : error?.code ?? "").trim().toLowerCase();
  const status = typeof error === "string" ? undefined : error?.status ?? undefined;
  const hay = `${code} ${message}`.toLowerCase();

  if (!hay.trim()) return fallback;

  if (
    /invalid login credentials|invalid_credentials|invalid email or password|wrong password|email.*password/.test(
      hay,
    )
  ) {
    return errori.credenziali;
  }

  if (/email not confirmed|email_not_confirmed|confirm.*email/.test(hay)) {
    return errori.emailNonConfermata;
  }

  if (/user already registered|already.?registered|email.?exists|user_already_exists|duplicate/.test(hay)) {
    return errori.giaRegistrato;
  }

  if (/user not found|user_not_found|no user found|account.*not.*found/.test(hay)) {
    return errori.utenteNonTrovato;
  }

  if (
    /rate.?limit|over_email_send_rate_limit|over_request_rate_limit|only request this after|too many requests|429/.test(
      hay,
    ) ||
    status === 429
  ) {
    return errori.rateLimit;
  }

  if (/invalid.*email|email.*invalid|unable to validate email|validation_failed/.test(hay)) {
    return errori.emailInvalida;
  }

  if (/password.*(at least|weak|short|characters)|weak_password|password_too_short/.test(hay)) {
    return errori.passwordDebole;
  }

  if (/otp_expired|token.*(expired|invalid)|link.*(expired|invalid)|email link is invalid/.test(hay)) {
    return errori.linkScaduto;
  }

  if (
    /oauth|provider.*(not enabled|disabled)|access_denied|exchange.*code|pkce|google/.test(hay) &&
    /auth|oauth|provider|sign.?in/.test(hay)
  ) {
    return errori.oauth;
  }

  if (/signups? not allowed|signup_disabled/.test(hay)) {
    return errori.servizio;
  }

  if (/network|fetch|failed to fetch|timeout|503|502|500|service/.test(hay)) {
    return errori.servizio;
  }

  // Known safe Italian copy already from siteContent — pass through.
  const known = Object.values(errori) as string[];
  if (known.includes(message)) return message;

  return fallback;
}
