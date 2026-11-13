import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { isWhatsAppHref, WHATSAPP_ANCHOR } from "../lib/whatsapp";

const base =
  "ti-btn inline-flex items-center justify-center gap-2 px-6 py-4 text-[0.6875rem] font-bold uppercase tracking-[0.2em] transition-colors duration-200 disabled:opacity-40";

const variants = {
  primary: "border-ember bg-ember text-ivory hover:border-ember-hot hover:bg-ember-hot",
  ghost: "border-ink/20 bg-paper text-ink hover:border-ink hover:bg-graphite hover:text-on-ink",
  ember: "border-ember bg-ember text-ivory hover:border-ember-hot hover:bg-ember-hot",
  paper: "border-ink/15 bg-paper text-ink hover:border-ink/25 hover:bg-mist",
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
  return <span className="label-kicker inline-block min-w-0 max-w-full [overflow-wrap:anywhere]">{children}</span>;
}
