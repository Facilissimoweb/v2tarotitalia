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
    onError?: (err?: unknown) => void;
    onCancel?: () => void;
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
  enabled?: boolean;
};

function readClientId() {
  const raw = String(import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/\r/g, "");
  if (!raw || raw === "sb") return "";
  return raw;
}

export function IthaPayPal({ planId, onPaid, enabled = true }: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const paid = useRef(onPaid);
  paid.current = onPaid;
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const clientId = readClientId();

  useEffect(() => {
    if (!enabled || !clientId) return;
    let cancelled = false;
    let attempts = 0;

    async function mount() {
      const el = host.current;
      if (!el) {
        if (attempts < 20) {
          attempts += 1;
          window.setTimeout(() => {
            if (!cancelled) void mount();
          }, 50);
        }
        return;
      }
      setError(null);
      try {
        const paypal = await loadPaypal(clientId);
        if (!paypal || cancelled || !host.current) return;
        host.current.innerHTML = "";
        await paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 42 },
            createOrder: async () => {
              try {
                return await createPaypalOrder(planId);
              } catch (err) {
                const message = err instanceof Error && err.message ? err.message : itha.paypalAuth;
                setError(message);
                throw err;
              }
            },
            onApprove: async (data) => {
              try {
                const credits = await capturePaypalOrder(data.orderID);
                paid.current(credits);
              } catch (err) {
                const message = err instanceof Error && err.message ? err.message : itha.paypalOrdine;
                setError(message);
              }
            },
            onError: () => setError(itha.paypalOrdine),
          })
          .render(host.current);
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setError(itha.paypalSdkErrore);
      }
    }

    void mount();
    return () => {
      cancelled = true;
    };
  }, [clientId, planId, enabled]);

  if (!clientId) {
    return <p className="text-[0.75rem] leading-relaxed text-ink/55">{itha.paypalManca}</p>;
  }

  if (!enabled) {
    return <p className="text-[0.75rem] leading-relaxed text-ink/55">{itha.paypalConsensoAttendi}</p>;
  }

  return (
    <div>
      <div ref={host} className="min-h-[45px]" />
      {!ready && !error ? (
        <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink/45">{itha.pianiLead}</p>
      ) : null}
      {error ? <p className="mt-3 text-[0.75rem] text-ink">{error}</p> : null}
    </div>
  );
}

let paypalLoader: Promise<PaypalNamespace | undefined> | null = null;

function loadPaypal(clientId: string) {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (paypalLoader) return paypalLoader;

  paypalLoader = new Promise<PaypalNamespace | undefined>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-itha-paypal]");
    if (existing) {
      if (window.paypal) {
        resolve(window.paypal);
        return;
      }
      existing.addEventListener("load", () => resolve(window.paypal), { once: true });
      existing.addEventListener("error", () => reject(new Error("paypal-sdk")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=EUR&intent=capture&components=buttons`;
    script.async = true;
    script.dataset.ithaPaypal = "true";
    script.onload = () => resolve(window.paypal);
    script.onerror = () => {
      paypalLoader = null;
      reject(new Error("paypal-sdk"));
    };
    document.body.appendChild(script);
  });

  return paypalLoader;
}
