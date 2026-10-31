import { digitalAssetBelongsTo, type DigitalProductId } from "../data/catalogo";
import { getSupabaseEnv, getSupabaseClient } from "./supabase";

export class DigitalDownloadError extends Error {
  status: number;
  constructor(status: number, message = `download ${status}`) {
    super(message);
    this.name = "DigitalDownloadError";
    this.status = status;
  }
}

export async function fetchDigitalAsset(productId: DigitalProductId, asset: string) {
  if (!digitalAssetBelongsTo(productId, asset)) {
    throw new DigitalDownloadError(403);
  }
  const sb = getSupabaseClient();
  const { url, anonKey } = getSupabaseEnv();
  if (!sb || !url) throw new DigitalDownloadError(503);
  const { data: sessionData } = await sb.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new DigitalDownloadError(401);

  const response = await fetch(`${url}/functions/v1/download-digital`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, asset }),
  });
  if (response.status === 403) throw new DigitalDownloadError(403);
  if (!response.ok) throw new DigitalDownloadError(response.status);
  const kind = response.headers.get("x-asset-kind") || "text";
  const blob = await response.blob();
  return { blob, kind };
}
