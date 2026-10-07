import { useEffect } from "react";
import { siteContent } from "../data/siteContent";
import { WidgetDialog } from "./WidgetDialog";

const { percorsoEsteso } = siteContent.chiSiamo;

function FormazioneCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {percorsoEsteso.voci.map((voce) => (
        <article
          key={voce.titolo}
          className="flex h-full flex-col bg-sage p-8 ring-1 ring-ivory/25 transition-colors duration-300 hover:ring-ivory/40"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ivory">{voce.badge}</p>
          <span
            className="mt-5 inline-block text-lg leading-none grayscale brightness-[1.65] contrast-110"
            aria-hidden
          >
            {voce.icona}
          </span>
          <h3 className="mt-4 font-display text-xl leading-snug text-ivory">{voce.titolo}</h3>
          <p className="mt-5 flex-1 text-sm leading-[1.85] text-ivory/85">{voce.testo}</p>
        </article>
      ))}
    </div>
  );
}

export function FormazioneOlisticaBody() {
  return (
    <div>
      <p className="text-center text-[10px] uppercase tracking-[0.16em] text-sage">{percorsoEsteso.kicker}</p>
      <p className="mt-4 text-center text-[10px] uppercase tracking-[0.16em] text-sage">{percorsoEsteso.badge}</p>
      <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-[1.85] text-ink/70">
        {percorsoEsteso.lead}
      </p>
      <div className="mt-10">
        <FormazioneCards />
      </div>
    </div>
  );
}

export function FormazioneOlisticaModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <WidgetDialog title={percorsoEsteso.titolo} onClose={onClose} xxl>
      <FormazioneOlisticaBody />
    </WidgetDialog>
  );
}
