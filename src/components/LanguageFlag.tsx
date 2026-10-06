import { resolveOutputLanguage } from "../lib/language";

type Props = {
  code?: string | null;
  className?: string;
};

/** Bandiera vettoriale della lingua, geometrica e senza raggio. */
export function LanguageFlag({ code, className = "" }: Props) {
  const resolved = resolveOutputLanguage(code);
  return (
    <span
      className={`inline-flex h-4 w-[1.45rem] shrink-0 overflow-hidden ring-1 ring-ink/20 ${className}`}
      aria-hidden
    >
      <FlagMark code={resolved} />
    </span>
  );
}

function FlagMark({ code }: { code: string }) {
  const common = {
    viewBox: "0 0 60 40",
    className: "h-full w-full",
    preserveAspectRatio: "none" as const,
  };

  switch (code) {
    case "en":
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#012169" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="8" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth="4" />
          <path d="M30 0 V40 M0 20 H60" stroke="#fff" strokeWidth="12" />
          <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="7" />
        </svg>
      );
    case "fr":
      return (
        <svg {...common}>
          <rect width="20" height="40" fill="#002654" />
          <rect x="20" width="20" height="40" fill="#fff" />
          <rect x="40" width="20" height="40" fill="#ED2939" />
        </svg>
      );
    case "es":
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#C60B1E" />
          <rect y="10" width="60" height="20" fill="#FFC400" />
        </svg>
      );
    case "de":
      return (
        <svg {...common}>
          <rect width="60" height="13.4" fill="#000" />
          <rect y="13.4" width="60" height="13.2" fill="#DD0000" />
          <rect y="26.6" width="60" height="13.4" fill="#FFCE00" />
        </svg>
      );
    case "pt":
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#FF0000" />
          <rect width="24" height="40" fill="#006600" />
          <circle cx="24" cy="20" r="7" fill="#FFCC00" />
        </svg>
      );
    case "zh-CN":
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#DE2910" />
          <polygon fill="#FFDE00" points="12,8 14.4,15.2 7.2,11 16.8,11 9.6,15.2" />
        </svg>
      );
    case "ar":
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#006C35" />
          <rect x="10" y="18" width="40" height="3" fill="#fff" />
          <path d="M14 24 H46" stroke="#fff" strokeWidth="2" />
        </svg>
      );
    case "ja":
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#fff" />
          <circle cx="30" cy="20" r="9" fill="#BC002D" />
        </svg>
      );
    case "ru":
      return (
        <svg {...common}>
          <rect width="60" height="13.4" fill="#fff" />
          <rect y="13.4" width="60" height="13.2" fill="#0039A6" />
          <rect y="26.6" width="60" height="13.4" fill="#D52B1E" />
        </svg>
      );
    case "nl":
      return (
        <svg {...common}>
          <rect width="60" height="13.4" fill="#AE1C28" />
          <rect y="13.4" width="60" height="13.2" fill="#fff" />
          <rect y="26.6" width="60" height="13.4" fill="#21468B" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect width="20" height="40" fill="#009246" />
          <rect x="20" width="20" height="40" fill="#fff" />
          <rect x="40" width="20" height="40" fill="#CE2B37" />
        </svg>
      );
  }
}
