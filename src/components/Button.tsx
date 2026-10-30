import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { isWhatsAppHref, WHATSAPP_ANCHOR } from "../lib/whatsapp";

const base =
  "inline-flex items-center justify-center gap-2 px-6 py-4 text-[0.6875rem] font-bold uppercase tracking-[0.2em] transition-colors duration-200 disabled:opacity-40";

const variants = {
  primary: "bg-ink text-on-ink hover:bg-[#3a3430]",
  ghost: "bg-transparent text-ink ring-1 ring-inset ring-ink hover:bg-ink hover:text-on-ink",
  ember: "bg-lime text-graphite hover:bg-[#e4fb4a]",
  paper: "bg-paper text-ink hover:bg-mist",
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
  target?: string;
  rel?: string;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
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
  target,
  rel,
  "aria-expanded": ariaExpanded,
  "aria-controls": ariaControls,
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
        {...(target ? { target } : {})}
        {...(rel ? { rel } : {})}
        {...(download !== undefined ? { download: download === true ? true : download } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {children}
    </button>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <span className="label-kicker">{children}</span>;
}
