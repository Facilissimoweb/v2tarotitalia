import { getIthaCardImagePath, type IthaCard } from "../data/ithaMazzo.ts";

export function IthaCardFace({ card, className = "" }: { card: IthaCard; className?: string }) {
  return (
    <div className={`aspect-[2/3] bg-mist ring-1 ring-ink/10 ${className}`}>
      <img src={getIthaCardImagePath(card.id)} alt={card.name} className="block h-full w-full object-cover" />
    </div>
  );
}

export function IthaCardBack({ className = "" }: { className?: string }) {
  return (
    <div className={`aspect-[2/3] bg-ink text-on-ink ${className}`}>
      <div className="flex h-full flex-col justify-between p-3">
        <p className="text-center text-[8px] uppercase tracking-[0.28em] text-on-ink/55">Itha</p>
        <svg viewBox="0 0 100 100" className="mx-auto h-16 w-16 stroke-on-ink/80" fill="none">
          <circle cx="50" cy="50" r="36" strokeDasharray="2 3" />
          <path d="M50 18 L74 68 H26 Z" />
          <circle cx="50" cy="50" r="10" />
        </svg>
        <p className="text-center text-[8px] uppercase tracking-[0.2em] text-on-ink/55">Ecate</p>
      </div>
    </div>
  );
}
