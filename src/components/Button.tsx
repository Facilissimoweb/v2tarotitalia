import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-200 disabled:opacity-40";

const variants = {
  primary: "bg-ink text-on-ink hover:bg-moss",
  sage: "bg-sage text-ivory hover:bg-moss",
  ghost: "bg-transparent text-ink ring-1 ring-ink/15 hover:bg-mist",
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
    return (
      <a
        href={href}
        className={cls}
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
