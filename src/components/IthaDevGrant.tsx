import { siteContent } from "../data/siteContent.ts";
import { useItha } from "../context/IthaContext.tsx";
import { isIthaDev } from "../lib/itha/dev.ts";

const { itha } = siteContent;

export function IthaDevGrant({ onGranted }: { onGranted?: () => void }) {
  const { simulateCredits } = useItha();
  if (!isIthaDev()) return null;

  return (
    <div className="border-t border-ink/10 pt-5">
      <button
        type="button"
        onClick={() => {
          simulateCredits();
          onGranted?.();
        }}
        className="text-left text-[10px] uppercase tracking-[0.14em] text-sage/80 hover:text-ink"
      >
        {itha.devSimula}
      </button>
      <p className="mt-2 text-[11px] leading-relaxed text-ink/45">{itha.devNota}</p>
    </div>
  );
}
