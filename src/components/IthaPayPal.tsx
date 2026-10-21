import { useEffect, useRef, useState } from "react";
import { siteContent } from "../data/siteContent.ts";
import { capturePaypalOrder, createPaypalOrder } from "../lib/itha/client.ts";
import type { IthaPlanId } from "../lib/itha/types.ts";

const { itha } = siteContent;

type PaypalButtons = {
  render: (el: HTMLElement) => Promise<void>;
  close?: () => Promise<void>;
  isEligible?: () => boolean;
};

type PaypalNamespace = {
  Buttons: (opts: {
    style?: Record<string, string | number>;
    fundingSource?: string;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onCancel?: () => void;
    onError?: (err?: unknown) => void;
    onClick?: (data: unknown, actions: { resolve: () => Promise<void>; reject: () => Promise<void> }) => Promise<void>;
  }) => PaypalButtons;
  FUNDING?: { PAYPAL?: string; PAYLATER?: string };
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
  /** Mostra anche «Paga a rate» (solo piani che lo prevedono). */
  enablePayLater?: boolean;
};

function readClientId() {
  const raw = String(import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/\r/g, "");
  if (!raw || raw === "sb") return "";
  return raw;
}

const DISABLED_FUNDING =
  "card,credit,venmo,sepa,bancontact,eps,giropay,ideal,mybank,p24,sofort,blik,trustly,mercadopago";

export function IthaPayPal({ planId, onPaid, enabled = true, enablePayLater = false }: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const buttonsRef = useRef<PaypalButtons | null>(null);
  const paid = useRef(onPaid);
  paid.current = onPaid;
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const clientId = readClientId();

  useEffect(() => {
    if (!enabled || !clientId) {
      setReady(false);
      return;
    }
    let cancelled = false;
    let attempts = 0;

    async function mount() {
      const el = host.current;
      if (!el) {
        if (attempts < 30) {
          attempts += 1;
          window.setTimeout(() => {
            if (!cancelled) void mount();
          }, 40);
        }
        return;
      }
      setError(null);
      setReady(false);
      try {
        if (buttonsRef.current?.close) {
          await buttonsRef.current.close().catch(() => undefined);
          buttonsRef.current = null;
        }
        el.innerHTML = "";
        const paypal = await loadPaypal(clientId, enablePayLater);
        if (!paypal || cancelled || !host.current) return;

        const buttons = paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 48 },
          // Un solo funding evita carta/MyBank non configurati; con paylater lascia eleggere PayPal + rate.
          ...(enablePayLater ? {} : { fundingSource: paypal.FUNDING?.PAYPAL }),
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
          onCancel: () => setError(null),
          onError: () => setError(itha.paypalOrdine),
        });

        if (buttons.isEligible && !buttons.isEligible()) {
          if (!cancelled) setError(itha.paypalSdkErrore);
          return;
        }

        buttonsRef.current = buttons;
        await buttons.render(host.current);
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setError(itha.paypalSdkErrore);
      }
    }

    void mount();
    return () => {
      cancelled = true;
      const pending = buttonsRef.current;
      buttonsRef.current = null;
      void pending?.close?.().catch(() => undefined);
    };
  }, [clientId, planId, enabled, enablePayLater]);

  if (!clientId) {
    return <p className="text-[0.75rem] leading-relaxed text-ink/55">{itha.paypalManca}</p>;
  }

  if (!enabled) {
    return <p className="text-[0.75rem] leading-relaxed text-ink/55">{itha.paypalConsensoAttendi}</p>;
  }

  return (
    <div className="relative z-[200] w-full overflow-visible" data-itha-paypal-host="true">
      <div ref={host} className="relative z-[201] min-h-[52px] w-full overflow-visible" />
      {!ready && !error ? (
        <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink/45">{itha.pianiLead}</p>
      ) : null}
      {error ? <p className="mt-3 text-[0.75rem] text-ink">{error}</p> : null}
    </div>
  );
}

let paypalLoader: Promise<PaypalNamespace | undefined> | null = null;
let paypalLoaderKey = "";

function sdkSrc(clientId: string, enablePayLater: boolean) {
  const params = new URLSearchParams({
    "client-id": clientId,
    currency: "EUR",
    intent: "capture",
    components: "buttons",
    "disable-funding": DISABLED_FUNDING,
  });
  if (enablePayLater) params.set("enable-funding", "paylater");
  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

function loadPaypal(clientId: string, enablePayLater: boolean) {
  const key = `${clientId}|${enablePayLater ? "paylater" : "paypal"}`;
  if (window.paypal && paypalLoaderKey === key) return Promise.resolve(window.paypal);
  if (paypalLoader && paypalLoaderKey === key) return paypalLoader;

  paypalLoaderKey = key;
  paypalLoader = new Promise<PaypalNamespace | undefined>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-itha-paypal]");
    if (existing) {
      const same = existing.dataset.paypalKey === key && (window.paypal || existing.dataset.loaded === "true");
      if (same) {
        resolve(window.paypal);
        return;
      }
      existing.remove();
      delete window.paypal;
    }

    const script = document.createElement("script");
    script.src = sdkSrc(clientId, enablePayLater);
    script.async = true;
    script.dataset.ithaPaypal = "true";
    script.dataset.paypalKey = key;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve(window.paypal);
    };
    script.onerror = () => {
      paypalLoader = null;
      paypalLoaderKey = "";
      reject(new Error("paypal-sdk"));
    };
    document.body.appendChild(script);
  });

  return paypalLoader;
}
