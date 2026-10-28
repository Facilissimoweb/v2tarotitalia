import { Reveal } from "./Reveal";

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
  ratio?: Ratio;
  /** `contain` mostra l’immagine intera (senza ritaglio); default `cover`. */
  fit?: "cover" | "contain";
  className?: string;
};

export function ImageSlot({
  src,
  alt,
  caption,
  ratio = "portrait",
  fit = "cover",
  className = "",
}: Props) {
  const contain = fit === "contain";

  return (
    <Reveal className={className}>
      <figure>
        <div className={`overflow-hidden bg-mist ${contain ? "" : ratios[ratio]}`}>
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={
              contain ? "block h-auto w-full object-contain" : "h-full w-full object-cover"
            }
          />
        </div>
        {caption ? (
          <figcaption className="mt-5 text-[0.625rem] uppercase tracking-[0.16em] text-sage">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </Reveal>
  );
}
