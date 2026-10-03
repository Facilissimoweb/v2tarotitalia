import { useEffect, useRef, useState } from "react";
import { siteContent } from "../data/siteContent.ts";
import { capturePaypalOrder, createPaypalOrder } from "../lib/itha/client.ts";
import type { IthaPlanId } from "../lib/itha/types.ts";

const { itha } = siteContent;

type PaypalNamespace = {
  Buttons: (opts: {
    style?: Record<string, string | number>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onError?: () => void;
  }) => { render: (el: HTMLElement) => Promise<void> };
};

declare global {
  interface Window {
    paypal?: PaypalNamespace;
  }
}

type Props = {
  planId: IthaPlanId;
  onPaid: (credits: number) => void;
};

export function IthaPayPal({ planId, onPaid }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const paid = useRef(onPaid);
  paid.current = onPaid;
  const [error, setError] = useState<string | null>(null);
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID?.trim() ?? "";

  useEffect(() => {
    if (!clientId || !host.current) return;
    let cancelled = false;

    async function mount() {
      const paypal = await loadPaypal(clientId);
      if (!paypal || cancelled || !host.current) return;
      host.current.innerHTML = "";
      await paypal.Buttons({
        style: { layout: "vertical", color: "black", shape: "rect", label: "paypal", height: 40 },
        createOrder: () => createPaypalOrder(planId),
        onApprove: async (data) => {
          const credits = await capturePaypalOrder(data.orderID);
          paid.current(credits);
        },
        onError: () => setError(itha.paypalManca),
      }).render(host.current);
    }

    void mount().catch(() => setError(itha.paypalManca));
    return () => {
      cancelled = true;
    };
  }, [clientId, planId]);

  if (!clientId) {
    return <p className="text-[12px] leading-relaxed text-ink/55">{itha.paypalManca}</p>;
  }

  return (
    <div>
      <div ref={host} />
      {error ? <p className="mt-3 text-[12px] text-ink">{error}</p> : null}
    </div>
  );
}

function loadPaypal(clientId: string) {
  if (window.paypal) return Promise.resolve(window.paypal);
  return new Promise<PaypalNamespace | undefined>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-itha-paypal]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.paypal));
      existing.addEventListener("error", () => reject());
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&intent=capture&enable-funding=paylater`;
    script.dataset.ithaPaypal = "true";
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}
