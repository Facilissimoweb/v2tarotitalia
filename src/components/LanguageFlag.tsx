import { languageFlagId } from "../lib/language";
import { FlagById } from "../lib/flagMarks";

type Props = {
  code?: string | null;
  className?: string;
};

/** Bandiera vettoriale della lingua, geometrica e senza raggio. */
export function LanguageFlag({ code, className = "" }: Props) {
  const flag = languageFlagId(code);
  return (
    <span
      className={`inline-flex h-4 w-[1.45rem] shrink-0 overflow-hidden ring-1 ring-ink/20 ${className}`}
      aria-hidden
    >
      <FlagById id={flag} />
    </span>
  );
}
