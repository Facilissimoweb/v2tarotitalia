import { Reveal } from "./Reveal";
import { TextFold } from "./TextFold";

type Ratio = "portrait" | "landscape" | "square";

const ratios: Record<Ratio, string> = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[16/10]",
  square: "aspect-square",
};

type Props = {
  src: string;
  alt: string;
  caption?: string;
  /** Testo di corpo sotto la didascalia breve. */
  note?: string;
  ratio?: Ratio;
  /** `contain` mostra l’immagine intera (senza ritaglio); default `cover`. */
  fit?: "cover" | "contain";
  /** Mantiene il box del ratio anche con `contain`, senza ritagliare. */
  framed?: boolean;
  className?: string;
};

export function ImageSlot({
  src,
  alt,
  caption,
  note,
  ratio = "portrait",
  fit = "cover",
  framed = false,
  className = "",
}: Props) {
  const contain = fit === "contain";
  const lockBox = !contain || framed;

  return (
    <Reveal className={className}>
      <figure>
        <div className="depth-frame">
          <div
            className={`depth-frame__plate overflow-hidden ${framed ? "bg-plate" : "bg-mist"} ${
              lockBox ? ratios[ratio] : ""
            }`}
          >
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className={
                contain
                  ? lockBox
                    ? "h-full w-full object-contain object-center"
                    : "block h-auto w-full object-contain"
                  : "depth-frame__media h-full w-full object-cover"
              }
            />
          </div>
        </div>
        {caption || note ? (
          <figcaption
            className={
              note
                ? "mt-5 text-sm leading-[1.85] text-ink/70"
                : "mt-5 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft"
            }
          >
            {note ? (
              <TextFold summary={caption ? <p>{caption}</p> : null}>
                <p>{note}</p>
              </TextFold>
            ) : caption ? (
              <p>{caption}</p>
            ) : null}
          </figcaption>
        ) : null}
      </figure>
    </Reveal>
  );
}
