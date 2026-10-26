import type { MouseEvent, ReactNode } from "react";
import { mailtoHref, OFFICIAL_MAIL, openMailto } from "../lib/mailto";

type Props = {
  email?: string;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
};

/**
 * Link mailto nativo + fallback programmatico.
 * `translate="no"` evita che Google Translate rompa href/testo.
 */
export function MailToLink({
  email = OFFICIAL_MAIL,
  className = "",
  children,
  "aria-label": ariaLabel,
}: Props) {
  const href = mailtoHref(email);
  const label = children ?? email;

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    event.stopPropagation();
    openMailto(email);
  }

  return (
    <a
      href={href}
      rel="noopener noreferrer"
      className={`relative z-10 pointer-events-auto hover:underline ${className}`.trim()}
      aria-label={ariaLabel ?? `Email ${email}`}
      translate="no"
      onClick={onClick}
    >
      {label}
    </a>
  );
}
