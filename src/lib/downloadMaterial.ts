import { siteContent } from "../data/siteContent.ts";
import { downloadLumiereDocument } from "./itha/pdf.ts";
import { activeLanguage, isSourceLanguage } from "./language";
import { localizeOfficialTexts } from "./localizeClient";

const { itha } = siteContent;

export async function downloadLocalizedFile(
  file: string,
  filename: string,
  languageOrOptions?: string | { language?: string; title?: string },
) {
  const options = typeof languageOrOptions === "string" ? { language: languageOrOptions } : (languageOrOptions ?? {});
  const target = activeLanguage(options.language);
  const italian = await (await fetch(file)).text();
  const title = options.title || filename.replace(/\.[^.]+$/, "").replace(/_/g, " ");
  if (isSourceLanguage(target)) {
    await downloadLumiereDocument({
      title,
      body: italian,
      filename,
      language: target,
      footer: itha.pdfFooter,
    });
    return;
  }
  const localized = await localizeOfficialTexts(
    target,
    { title, body: italian, footer: itha.pdfFooter },
    { strict: true },
  );
  await downloadLumiereDocument({
    title: localized.title || title,
    body: localized.body || italian,
    filename,
    language: target,
    footer: localized.footer || itha.pdfFooter,
  });
}
