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
  className?: string;
};

export function ImageSlot({ src, alt, caption, ratio = "portrait", className = "" }: Props) {
  return (
    <Reveal className={className}>
      <figure>
        <div className={`overflow-hidden bg-mist ${ratios[ratio]}`}>
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        </div>
        {caption ? (
          <figcaption className="mt-5 text-[10px] uppercase tracking-[0.2em] text-sage">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </Reveal>
  );
}
