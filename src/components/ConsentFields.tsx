import { siteContent } from "../data/siteContent";
import type { Consents } from "../lib/storage";

const { auth, legal } = siteContent;

type Props = {
  consents: Consents;
  onChange: (next: Consents) => void;
  onPrivacy?: () => void;
  onVendita?: () => void;
};

export function ConsentFields({ consents, onChange, onPrivacy, onVendita }: Props) {
  function toggle(key: keyof Consents) {
    onChange({ ...consents, [key]: !consents[key] });
  }

  return (
    <fieldset className="flex flex-col gap-5">
      <ConsentRow
        checked={consents.privacy}
        onChange={() => toggle("privacy")}
        label={auth.consensi.privacyCookie}
        linkLabel={auth.consensi.leggiPrivacy}
        onOpen={onPrivacy}
      />
      <ConsentRow checked={consents.adult} onChange={() => toggle("adult")} label={auth.consensi.adulto} />
      <ConsentRow
        checked={consents.refund}
        onChange={() => toggle("refund")}
        label={auth.consensi.rimborso}
        linkLabel={legal.vendita.leggi}
        onOpen={onVendita}
      />
    </fieldset>
  );
}

function ConsentRow({
  checked,
  onChange,
  label,
  linkLabel,
  onOpen,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  linkLabel?: string;
  onOpen?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-start gap-3 text-[12px] leading-[1.7] text-ink/70">
        <input
          type="checkbox"
          className="mt-0.5 shrink-0 accent-ink"
          checked={checked}
          onChange={onChange}
          required
        />
        <span>{label}</span>
      </label>
      {onOpen && linkLabel ? (
        <button
          type="button"
          className="ml-7 text-left text-[11px] underline decoration-sage/40 underline-offset-4 hover:text-ink"
          onClick={onOpen}
        >
          {linkLabel}
        </button>
      ) : null}
    </div>
  );
}
