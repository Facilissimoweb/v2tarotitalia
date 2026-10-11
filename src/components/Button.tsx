import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { isWhatsAppHref, WHATSAPP_ANCHOR } from "../lib/whatsapp";

const base =
  "inline-flex items-center justify-center gap-2 border px-6 py-4 text-[11px] uppercase tracking-[0.2em] transition-[color,background-color,border-color,box-shadow,translate] duration-300 disabled:opacity-40";

// Pulsante in evidenza: oro metallico, testo scuro, alone dorato; in hover sale di 2px e il bagliore cresce
const gold =
  "border-sage/50 bg-gold-sheen font-semibold text-on-ink shadow-[0_0_20px_rgba(197,168,128,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(197,168,128,0.5)]";

const variants = {
  primary: gold,
  sage: gold,
  // Secondario: bordo bronzo, vetro fumé sfocato, testo caldo chiaro
  ghost:
    "border-bronze bg-ivory/35 font-medium text-ink backdrop-blur-md hover:-translate-y-0.5 hover:border-sage hover:text-sage hover:shadow-[0_0_22px_rgba(197,168,128,0.2)]",
  paper:
    "border-sage/30 bg-paper/80 font-medium text-ink backdrop-blur-md hover:border-sage/60 hover:bg-linen",
};

type Props = {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  to?: string;
  href?: string;
  download?: string | boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

export function Button({
  children,
  variant = "primary",
  className = "",
  to,
  href,
  download,
  type = "button",
  onClick,
  disabled,
}: Props) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (to) {
    return (
      <NavLink to={to} className={cls}>
        {children}
      </NavLink>
    );
  }
  if (href) {
    const whatsapp = isWhatsAppHref(href);
    return (
      <a
        href={href}
        className={cls}
        {...(whatsapp ? WHATSAPP_ANCHOR : {})}
        {...(download !== undefined ? { download: download === true ? true : download } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <span className="label-kicker">{children}</span>;
}
