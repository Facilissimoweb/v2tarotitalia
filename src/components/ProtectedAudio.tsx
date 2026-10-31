import { useEffect, useState } from "react";
import type { DigitalProductId } from "../data/catalogo";
import { fetchDigitalAsset } from "../lib/digitalDownload";

export function ProtectedAudio({
  productId,
  assetId,
  label,
  className = "w-full",
}: {
  productId: DigitalProductId;
  assetId: string;
  label: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    void fetchDigitalAsset(productId, assetId)
      .then(({ blob }) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [productId, assetId]);

  if (!src) return null;
  return (
    <audio controls className={className} src={src} preload="metadata">
      {label}
    </audio>
  );
}
