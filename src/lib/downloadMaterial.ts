import { siteContent } from "../data/siteContent.ts";
import type { DigitalProductId } from "../data/catalogo";
import { fetchDigitalAsset } from "./digitalDownload";
import { downloadLumiereDocument } from "./lumiereDocument.ts";
import { activeLanguage, isSourceLanguage } from "./language";
import { localizeOfficialTexts } from "./localizeClient";

const pdfFooter = siteContent.brand.identitaFiscale;

export async function downloadProtectedDigital(
  productId: DigitalProductId,
  assetId: string,
  filename: string,
  languageOrOptions?: string | { language?: string; title?: string },
) {
  const options = typeof languageOrOptions === "string" ? { language: languageOrOptions } : (languageOrOptions ?? {});
  const target = activeLanguage(options.language);
  const { blob, kind } = await fetchDigitalAsset(productId, assetId);
  const title = options.title || filename.replace(/\.[^.]+$/, "").replace(/_/g, " ");

  if (kind === "audio") {
    triggerBlobDownload(blob, filename.replace(/\.pdf$/i, ".wav"));
    return;
  }

  const italian = await blob.text();
  if (isSourceLanguage(target)) {
    await downloadLumiereDocument({
      title,
      body: italian,
      filename,
      language: target,
      footer: pdfFooter,
    });
    return;
  }
  const localized = await localizeOfficialTexts(target, {
    title,
    body: italian,
    footer: pdfFooter,
  });
  await downloadLumiereDocument({
    title: localized.title || title,
    body: localized.body || italian,
    filename,
    language: target,
    footer: localized.footer || pdfFooter,
  });
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
