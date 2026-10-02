import { siteContent } from "../data/siteContent";
import type { Consents } from "../lib/storage";

const { auth } = siteContent;

type Props = {
  consents: Consents;
  onChange: (next: Consents) => void;
  onPrivacy?: () => void;
};

export function ConsentFields({ consents, onChange, onPrivacy }: Props) {
  function toggle(key: keyof Consents) {
    onChange({ ...consents, [key]: !consents[key] });
  }

  return (
    <fieldset className="flex flex-col gap-4">
      <ConsentRow
        checked={consents.privacy}
        onChange={() => toggle("privacy")}
        label={auth.consensi.privacyCookie}
        onOpen={onPrivacy}
      />
      <ConsentRow checked={consents.adult} onChange={() => toggle("adult")} label={auth.consensi.adulto} />
      <ConsentRow checked={consents.refund} onChange={() => toggle("refund")} label={auth.consensi.rimborso} />
    </fieldset>
  );
}

function ConsentRow({
  checked,
  onChange,
  label,
  onOpen,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  onOpen?: () => void;
}) {
  return (
    <label className="flex items-start gap-3 text-[12px] leading-snug text-ink/70">
      <input type="checkbox" className="mt-0.5 accent-ink" checked={checked} onChange={onChange} required />
      <span>
        {onOpen ? (
          <button
            type="button"
            className="text-left underline decoration-sage/40 underline-offset-4 hover:text-ink"
            onClick={onOpen}
          >
            {label}
          </button>
        ) : (
          label
        )}
      </span>
    </label>
  );
}
