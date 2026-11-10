import { siteContent } from "../data/siteContent";
import type { ShopItem } from "../data/productRegistry";
import type { DigitalProductId } from "../data/catalogo";
import { Button } from "./Button";
import { conPeso } from "./Prosa";
import { ProtectedAudio } from "./ProtectedAudio";
import { Reveal } from "./Reveal";

const { cta, pages } = siteContent;

type Props = {
  item: ShopItem;
  owned: boolean;
  busy: boolean;
  localized?: boolean;
  delay?: number;
  onBuy: (productId: DigitalProductId) => void;
  onDownload: (productId: DigitalProductId, assetId: string, filename: string, title: string) => void;
};

export function ShopCard({ item, owned, busy, localized, delay = 0, onBuy, onDownload }: Props) {
  const digital = item.kind === "digital" ? item.digital : undefined;

  return (
    <Reveal delay={delay}>
      <article
        className="depth-card flex h-full flex-col"
        translate={localized ? "no" : undefined}
      >
        <div className="depth-card__well aspect-[3/4] bg-mist">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="depth-card__art h-full w-full object-cover"
              draggable={false}
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-8 md:p-10">
          <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{item.kicker}</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <h2 className="font-display text-xl leading-snug md:text-2xl">{item.title}</h2>
            <div className="shrink-0 text-right">
              <p className="font-display text-xl">€{item.price}</p>
              <p className="mt-1 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                {owned ? pages.corsi.posseduto : item.format}
              </p>
            </div>
          </div>
          <p className="mt-5 flex-1 text-sm leading-[1.75] text-ink/70">{conPeso(item.blurb)}</p>

          {owned && digital?.audio ? (
            <div className="mt-8 bg-mist p-6">
              <p className="mb-4 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{item.title}</p>
              <ProtectedAudio productId={digital.id} assetId={digital.audio} label={item.title} />
            </div>
          ) : null}

          {item.kind === "consult" && item.consultId ? (
            <div className="mt-8">
              <Button className="ti-btn-plain w-full" to={`/consulti?tipo=${item.consultId}`}>
                {cta.consultoWhatsapp} · €{item.price}
              </Button>
            </div>
          ) : null}

          {digital && owned ? (
            <div className="mt-8 flex flex-col gap-3">
              {digital.assets.map((asset) => (
                <Button
                  key={asset.id}
                  className="w-full"
                  disabled={busy}
                  onClick={() => onDownload(digital.id, asset.id, asset.filename, asset.title)}
                >
                  {busy ? siteContent.lingua.genera : `${cta.scarica} · ${asset.title}`}
                </Button>
              ))}
            </div>
          ) : null}

          {digital && !owned ? (
            <div className="mt-8">
              <Button className="w-full" onClick={() => onBuy(digital.id)}>
                {cta.acquista} · €{item.price}
              </Button>
            </div>
          ) : null}
        </div>
      </article>
    </Reveal>
  );
}
