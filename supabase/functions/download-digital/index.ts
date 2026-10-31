/**
 * Proxy autenticato: verifica ordine confirmed, registra il download, serve il file.
 * Auth: JWT. Secrets: SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { TEXT_FILES, WAV_BASE64 } from "./bundle.ts";

const PRODUCT_IDS = ["trattato", "velo", "taccuino", "alchemici"] as const;
type ProductId = (typeof PRODUCT_IDS)[number];

type Asset = {
  file: string;
  kind: "text" | "audio";
  downloadName: string;
  contentType: string;
};

const ASSETS: Record<ProductId, Record<string, Asset>> = {
  trattato: {
    "trattato-arcani-maggiori": {
      file: "trattato-arcani-maggiori.txt",
      kind: "text",
      downloadName: "Trattato-Arcani-Maggiori-Tarot-Italia.pdf",
      contentType: "text/plain; charset=utf-8",
    },
  },
  velo: {
    "ermeneutica-luce-ombra": {
      file: "ermeneutica-luce-ombra.txt",
      kind: "text",
      downloadName: "Il-Velo-di-Maya-Tarot-Italia.pdf",
      contentType: "text/plain; charset=utf-8",
    },
    "lezione-01-velo-di-maya": {
      file: "lezione-01-velo-di-maya.wav",
      kind: "audio",
      downloadName: "Il-Velo-di-Maya-Tarot-Italia.wav",
      contentType: "audio/wav",
    },
  },
  taccuino: {
    "taccuino-studio-macerata": {
      file: "taccuino-studio-macerata.txt",
      kind: "text",
      downloadName: "Taccuino-di-Studio-Tarot-Italia.pdf",
      contentType: "text/plain; charset=utf-8",
    },
  },
  alchemici: {
    "calendario-lunare": {
      file: "calendario-lunare.txt",
      kind: "text",
      downloadName: "Calendario-Lunare-Tarot-Italia.pdf",
      contentType: "text/plain; charset=utf-8",
    },
    "griglia-purificazione": {
      file: "griglia-purificazione.txt",
      kind: "text",
      downloadName: "Griglia-Purificazione-Mazzo-Tarot-Italia.pdf",
      contentType: "text/plain; charset=utf-8",
    },
    "glossario-ermetico": {
      file: "glossario-ermetico.txt",
      kind: "text",
      downloadName: "Glossario-Simboli-Ermetici-Tarot-Italia.pdf",
      contentType: "text/plain; charset=utf-8",
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !serviceKey) return json({ error: "Servizio non configurato." }, 503);

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json({ error: "Per scaricare è necessario accedere." }, 401);

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  const user = userData.user;
  if (userErr || !user?.id) return json({ error: "Sessione non valida." }, 401);

  let productId = "";
  let assetId = "";
  try {
    const body = (await req.json()) as { productId?: string; asset?: string };
    productId = (body.productId ?? "").trim();
    assetId = (body.asset ?? "").trim();
  } catch {
    return json({ error: "Richiesta non valida." }, 400);
  }

  if (!isProductId(productId) || !assetId) return json({ error: "Titolo non valido." }, 400);
  const owner = assetOwner(assetId);
  if (!owner) return json({ error: "File non valido." }, 400);
  if (owner !== productId) {
    return json({ error: "Questo titolo non è ancora sbloccato." }, 403);
  }
  const asset = ASSETS[productId][assetId];
  if (!asset) return json({ error: "File non valido." }, 400);

  const owned = await admin
    .from("digital_orders")
    .select("id, download_count, first_download_at")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .in("status", ["confirmed", "completed"])
    .maybeSingle();
  if (owned.error) {
    console.error("digital own", owned.error);
    return json({ error: "Non riesco a verificare l’acquisto." }, 500);
  }
  if (!owned.data) return json({ error: "Questo titolo non è ancora sbloccato." }, 403);

  const bytes = fileBytes(asset.file, asset.kind);
  if (!bytes) return json({ error: "Il file non è disponibile in questo momento." }, 404);

  const now = new Date().toISOString();
  const recent = await admin
    .from("digital_download_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("asset", assetId)
    .gte("created_at", new Date(Date.now() - 5000).toISOString())
    .limit(1);
  if (!recent.data?.[0]) {
    const event = await admin.from("digital_download_events").insert({
      order_id: owned.data.id,
      user_id: user.id,
      product_id: productId,
      asset: assetId,
      ip: clientIp(req),
      user_agent: (req.headers.get("user-agent") ?? "").slice(0, 512) || null,
    });
    if (event.error) console.error("digital download log", event.error);

    const touch = await admin
      .from("digital_orders")
      .update({
        download_count: (Number(owned.data.download_count) || 0) + 1,
        first_download_at: owned.data.first_download_at || now,
        updated_at: now,
      })
      .eq("id", owned.data.id);
    if (touch.error) console.error("digital download count", touch.error);
  }

  return new Response(bytes, {
    status: 200,
    headers: {
      ...cors(),
      "Content-Type": asset.contentType,
      "Content-Disposition": `attachment; filename="${asset.downloadName}"`,
      "X-Asset-Kind": asset.kind,
      "Cache-Control": "no-store",
    },
  });
});

function isProductId(value: string): value is ProductId {
  return (PRODUCT_IDS as readonly string[]).includes(value);
}

function assetOwner(assetId: string): ProductId | null {
  for (const id of PRODUCT_IDS) {
    if (ASSETS[id][assetId]) return id;
  }
  return null;
}

function fileBytes(file: string, kind: "text" | "audio"): Uint8Array | null {
  if (kind === "audio") {
    if (!WAV_BASE64) return null;
    const binary = atob(WAV_BASE64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }
  const text = TEXT_FILES[file];
  if (!text) return null;
  return new TextEncoder().encode(text);
}

function clientIp(req: Request): string | null {
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || null;
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Expose-Headers": "content-type, content-disposition, x-asset-kind",
  };
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(), "Content-Type": "application/json" },
  });
}
