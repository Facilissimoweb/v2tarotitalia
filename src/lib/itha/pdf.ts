import { siteContent } from "../../data/siteContent.ts";
import { activeLanguage, isLatinLanguage, isSourceLanguage } from "../language.ts";
import { localizeOfficialTexts } from "../localizeClient.ts";
import { siteDateTime } from "../locale.ts";
import { getIthaCardImagePath, type DrawnIthaCard } from "../../data/ithaMazzo.ts";
import { ithaCardSvg } from "./cardArt.ts";
import { ithaCardSections } from "./prompt.ts";
import type { IthaReading } from "./types.ts";

const { brand, itha } = siteContent;

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const FOOTER_H = 72;
const IVORY = [0.976, 0.973, 0.965] as const;
const INK = [0.169, 0.145, 0.137] as const;
const SAGE = [0.478, 0.545, 0.471] as const;
const MIST = [0.953, 0.945, 0.933] as const;

type JpegImage = { name: string; bytes: Uint8Array; width: number; height: number };

function winAnsi(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/©/g, "\\251")
    .replace(/à/g, "\\340")
    .replace(/è/g, "\\350")
    .replace(/é/g, "\\351")
    .replace(/ì/g, "\\354")
    .replace(/ò/g, "\\362")
    .replace(/ù/g, "\\371")
    .replace(/À/g, "\\300")
    .replace(/È/g, "\\310")
    .replace(/É/g, "\\311")
    .replace(/Ì/g, "\\314")
    .replace(/Ò/g, "\\322")
    .replace(/Ù/g, "\\331")
    .replace(/’/g, "'")
    .replace(/«|»/g, '"')
    .replace(/—/g, "-")
    .replace(/·/g, "-")
    .replace(/ã/g, "\\343")
    .replace(/õ/g, "\\365")
    .replace(/ç/g, "\\347")
    .replace(/ñ/g, "\\361")
    .replace(/ä/g, "\\344")
    .replace(/ö/g, "\\366")
    .replace(/ü/g, "\\374")
    .replace(/ß/g, "\\337")
    .replace(/â/g, "\\342")
    .replace(/ê/g, "\\352")
    .replace(/î/g, "\\356")
    .replace(/ô/g, "\\364")
    .replace(/û/g, "\\373")
    .replace(/ë/g, "\\353")
    .replace(/ï/g, "\\357")
    .replace(/ÿ/g, "\\377")
    .replace(/Á/g, "\\301")
    .replace(/É/g, "\\311")
    .replace(/Í/g, "\\315")
    .replace(/Ó/g, "\\323")
    .replace(/Ú/g, "\\332")
    .replace(/á/g, "\\341")
    .replace(/í/g, "\\355")
    .replace(/ó/g, "\\363")
    .replace(/ú/g, "\\372")
    .replace(/¿/g, "\\277")
    .replace(/¡/g, "\\241");
}

function wrap(text: string, width: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function rgb(color: readonly number[]) {
  return `${color[0]} ${color[1]} ${color[2]} rg`;
}

function localAssetUrl(path: string) {
  if (!path.startsWith("/")) throw new Error("solo asset locali");
  return new URL(path, window.location.origin).toString();
}

function encode(parts: Array<string | Uint8Array>) {
  const encoder = new TextEncoder();
  const chunks = parts.map((part) => (typeof part === "string" ? encoder.encode(part) : part));
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

async function rasterizeSvg(svg: string, width = 280) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await rasterizeUrl(objectUrl, width);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function rasterizeUrl(url: string, width: number) {
  const image = new Image();
  image.src = url;
  await image.decode();
  const height = Math.max(1, Math.round((image.naturalHeight / Math.max(image.naturalWidth, 1)) * width));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#F9F8F6";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  if (!blob) return null;
  return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
}

async function loadLocalCard(card: DrawnIthaCard) {
  const path = getIthaCardImagePath(card.id);
  try {
    const response = await fetch(localAssetUrl(path));
    if (response.ok) {
      const svg = await response.text();
      if (svg.includes("<svg")) {
        const raster = await rasterizeSvg(svg);
        if (raster) return raster;
      }
    }
  } catch {
    /* mazzo locale in memoria */
  }
  return rasterizeSvg(ithaCardSvg(card));
}

async function loadLocalLogo() {
  try {
    return await rasterizeUrl(localAssetUrl("/logo.svg"), 72);
  } catch {
    return null;
  }
}

type ReportLabels = {
  subtitle: string;
  significato: string;
  lettura: string;
  metodo: string;
  footer: string;
  category: string;
};

type ReportSection = {
  titolo: string;
  significato: string;
  lettura: string;
};

async function localizeReport(reading: IthaReading, language: string) {
  const sections = ithaCardSections(reading);
  const official: Record<string, string> = {
    subtitle: itha.pdfSottotitolo,
    significato: itha.pdfSignificato,
    lettura: itha.pdfLettura,
    metodo: itha.pdfMetodo,
    footer: itha.pdfFooter,
    category: reading.category,
  };
  sections.forEach((section, i) => {
    official[`title_${i}`] = section.titolo;
    official[`sig_${i}`] = section.lama?.significato ?? "";
    official[`read_${i}`] = section.lettura;
  });
  const localized = isSourceLanguage(language)
    ? official
    : await localizeOfficialTexts(language, official, { strict: true });
  return {
    labels: {
      subtitle: localized.subtitle || official.subtitle,
      significato: localized.significato || official.significato,
      lettura: localized.lettura || official.lettura,
      metodo: localized.metodo || official.metodo,
      footer: localized.footer || official.footer,
      category: localized.category || official.category,
    } satisfies ReportLabels,
    sections: sections.map((section, i) => ({
      titolo: localized[`title_${i}`] || section.titolo,
      significato: localized[`sig_${i}`] || section.lama?.significato || "",
      lettura: localized[`read_${i}`] || section.lettura,
    })),
  };
}

function triggerBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function languageFile(base: string, language: string, ext: string) {
  const stem = base.replace(/\.[^.]+$/, "");
  return isSourceLanguage(language) ? `${stem}${ext}` : `${stem}-${language}${ext}`;
}

export async function downloadIthaPdf(reading: IthaReading, language?: string) {
  const target = activeLanguage(language);
  const { labels, sections } = await localizeReport(reading, target);
  const date = siteDateTime({
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(reading.createdAt));

  if (!isLatinLanguage(target)) {
    downloadIthaText(reading, labels, date, target, sections);
    return;
  }

  const [logo, ...cardRasters] = await Promise.all([
    loadLocalLogo(),
    ...reading.cards.map((card) => loadLocalCard(card)),
  ]);

  const images: JpegImage[] = [];
  if (logo) images.push({ name: "ImLogo", ...logo });
  reading.cards.forEach((_, i) => {
    const raster = cardRasters[i];
    if (raster) images.push({ name: `ImCard${i}`, ...raster });
  });

  const pages = layoutPages(reading, date, images, labels, sections);
  const blob = assemblePdf(pages, images, labels.footer);
  triggerBlob(blob, languageFile(`itha-crocicchio-${reading.id.slice(0, 8)}.pdf`, target, ".pdf"));
}

export async function downloadLumiereDocument(input: {
  title: string;
  body: string;
  filename: string;
  language: string;
  footer?: string;
}) {
  const target = activeLanguage(input.language);
  const footer = input.footer || itha.pdfFooter;
  if (!isLatinLanguage(target)) {
    triggerBlob(new Blob([`${input.title}\n\n${input.body}\n\n${footer}`], { type: "text/plain;charset=utf-8" }), languageFile(input.filename, target, ".txt"));
    return;
  }
  const logo = await loadLocalLogo();
  const images: JpegImage[] = logo ? [{ name: "ImLogo", ...logo }] : [];
  const pages = layoutDocumentPages(input.title, input.body, images);
  triggerBlob(assemblePdf(pages, images, footer), languageFile(input.filename.replace(/\.txt$/i, ".pdf"), target, ".pdf"));
}

function textOp(font: "/F1" | "/F2" | "/F3", text: string, color: readonly number[], size: number, x: number, y: number) {
  return `BT ${font} ${size} Tf ${rgb(color)} ${x.toFixed(2)} ${y.toFixed(2)} Td (${winAnsi(text)}) Tj ET`;
}

function trackedTitle(text: string, x: number, y: number) {
  const chars = [...text];
  const moves = chars
    .map((char, i) => (i === 0 ? `(${winAnsi(char)}) Tj` : `2.15 0 Td (${winAnsi(char)}) Tj`))
    .join(" ");
  return `BT /F3 16 Tf ${rgb(INK)} ${x.toFixed(2)} ${y.toFixed(2)} Td ${moves} ET`;
}

function sageRule(x: number, y: number, width: number) {
  return `q ${rgb(SAGE)} ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} 0.55 re f Q`;
}

function downloadIthaText(
  reading: IthaReading,
  labels: ReportLabels,
  date: string,
  language: string,
  sections: ReportSection[],
) {
  const body = [
    brand.wordmark,
    labels.subtitle,
    date,
    labels.category,
    reading.question,
    labels.metodo,
    sections
      .map((section) =>
        [section.titolo, labels.significato, section.significato, labels.lettura, section.lettura].join("\n\n"),
      )
      .join("\n\n----\n\n"),
    labels.footer,
  ].join("\n\n");
  triggerBlob(new Blob([body], { type: "text/plain;charset=utf-8" }), languageFile(`itha-crocicchio-${reading.id.slice(0, 8)}.txt`, language, ".txt"));
}

function layoutDocumentPages(title: string, body: string, images: JpegImage[]) {
  const pages: string[][] = [[]];
  let y = PAGE_H - 42;
  const current = () => pages[pages.length - 1];
  const push = (ops: string) => current().push(ops);
  const ensure = (height: number) => {
    if (y - height < MARGIN + FOOTER_H) {
      pages.push([]);
      y = PAGE_H - 56;
    }
  };
  const space = (height: number) => {
    ensure(height);
    y -= height;
  };

  const logo = images.find((image) => image.name === "ImLogo");
  if (logo) {
    const h = 20;
    const w = (logo.width / logo.height) * h;
    ensure(h + 10);
    y -= h;
    push(`q ${w.toFixed(2)} 0 0 ${h} ${MARGIN} ${y.toFixed(2)} cm /${logo.name} Do Q`);
    space(10);
  }

  ensure(22);
  y -= 18;
  push(trackedTitle("TAROT ITALIA", MARGIN, y));
  space(16);
  for (const line of wrap(title, 52)) {
    ensure(18);
    y -= 14;
    push(textOp("/F2", line, INK, 13, MARGIN, y));
    space(4);
  }
  space(8);
  push(sageRule(MARGIN, y, PAGE_W - MARGIN * 2));
  space(18);
  for (const paragraph of body.split(/\n{2,}/)) {
    for (const line of wrap(paragraph.replace(/\s+/g, " ").trim(), 78)) {
      if (!line) continue;
      ensure(15);
      y -= 12;
      push(textOp("/F1", line, INK, 10, MARGIN, y));
      space(3);
    }
    space(10);
  }
  return pages.map((ops) => ops.join("\n"));
}

function layoutPages(reading: IthaReading, date: string, images: JpegImage[], labels: ReportLabels, sections: ReportSection[]) {
  const pages: string[][] = [[]];
  let y = PAGE_H - 42;

  const current = () => pages[pages.length - 1];
  const push = (ops: string) => current().push(ops);
  const ensure = (height: number) => {
    if (y - height < MARGIN + FOOTER_H) {
      pages.push([]);
      y = PAGE_H - 56;
    }
  };
  const space = (height: number) => {
    ensure(height);
    y -= height;
  };

  const logo = images.find((image) => image.name === "ImLogo");
  if (logo) {
    const h = 20;
    const w = (logo.width / logo.height) * h;
    ensure(h + 10);
    y -= h;
    push(`q ${w.toFixed(2)} 0 0 ${h} ${MARGIN} ${y.toFixed(2)} cm /${logo.name} Do Q`);
    space(10);
  }

  ensure(22);
  y -= 18;
  push(trackedTitle("TAROT ITALIA", MARGIN, y));
  space(16);
  y -= 12;
  push(textOp("/F2", labels.subtitle, SAGE, 11, MARGIN, y));
  space(10);
  push(sageRule(MARGIN, y, PAGE_W - MARGIN * 2));
  space(16);
  y -= 10;
  push(textOp("/F3", date.toUpperCase(), SAGE, 8, MARGIN, y));
  space(12);
  y -= 10;
  push(textOp("/F3", labels.category.toUpperCase(), SAGE, 8, MARGIN, y));
  space(16);
  for (const line of wrap(reading.question, 76)) {
    ensure(16);
    y -= 13;
    push(textOp("/F2", line, INK, 12, MARGIN, y));
    space(3);
  }

  const metodo = wrap(labels.metodo, 80);
  const boxH = metodo.length * 12 + 16;
  ensure(boxH + 12);
  y -= boxH;
  push(`q ${rgb(MIST)} ${MARGIN} ${y.toFixed(2)} ${(PAGE_W - MARGIN * 2).toFixed(2)} ${boxH} re f Q`);
  push(`q ${rgb(SAGE)} ${MARGIN} ${y.toFixed(2)} 2 ${boxH} re f Q`);
  metodo.forEach((line, i) => {
    push(textOp("/F1", line, INK, 8.5, MARGIN + 10, y + boxH - 14 - i * 12));
  });
  space(22);

  const cardW = 88;
  const cardH = 132;
  const textX = MARGIN + cardW + 14;
  sections.forEach((section, i) => {
    const sigLines = wrap(section.significato, 46);
    const readLines = wrap(section.lettura, 78);
    const headerH = 28 + cardH;
    ensure(headerH);
    space(8);
    y -= 13;
    push(textOp("/F2", section.titolo, INK, 12, MARGIN, y));
    space(10);
    y -= cardH;
    const image = images.find((item) => item.name === `ImCard${i}`);
    if (image) {
      push(`q ${cardW} 0 0 ${cardH} ${MARGIN.toFixed(2)} ${y.toFixed(2)} cm /${image.name} Do Q`);
    } else {
      push(`q ${rgb(MIST)} ${MARGIN.toFixed(2)} ${y.toFixed(2)} ${cardW} ${cardH} re f Q`);
    }
    let ty = y + cardH - 10;
    push(textOp("/F3", labels.significato.toUpperCase(), SAGE, 7, textX, ty));
    ty -= 14;
    for (const line of sigLines) {
      ty -= 11;
      push(textOp("/F1", line, INK, 9, textX, ty));
    }
    y = Math.min(y, ty) - 14;
    ensure(28);
    y -= 11;
    push(textOp("/F3", labels.lettura.toUpperCase(), SAGE, 7, MARGIN, y));
    space(8);
    for (const line of readLines) {
      ensure(15);
      y -= 12;
      push(textOp("/F1", line, INK, 10, MARGIN, y));
      space(3);
    }
    space(8);
    push(sageRule(MARGIN, y, PAGE_W - MARGIN * 2));
    space(12);
  });

  return pages.map((ops) => ops.join("\n"));
}

function pageChrome(content: string, pageIndex: number, pageCount: number, footer: string) {
  const footerLines = wrap(footer, 90);
  const footerTop = MARGIN + 18 + (footerLines.length - 1) * 9;
  return [
    `q ${rgb(IVORY)} 0 0 ${PAGE_W} ${PAGE_H} re f Q`,
    content,
    sageRule(MARGIN, MARGIN + FOOTER_H - 8, PAGE_W - MARGIN * 2),
    ...footerLines.map((line, i) => textOp("/F1", line, SAGE, 7, MARGIN, footerTop - i * 9)),
    textOp("/F3", `${brand.wordmark.toUpperCase()}   ${pageIndex + 1} / ${pageCount}`, SAGE, 7, MARGIN, MARGIN),
  ].join("\n");
}

function assemblePdf(pageContents: string[], images: JpegImage[], footer: string) {
  const encoder = new TextEncoder();
  const items: Uint8Array[] = [];
  const put = (bytes: Uint8Array | string) => {
    items.push(typeof bytes === "string" ? encoder.encode(bytes) : bytes);
    return items.length;
  };

  put("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
  const pagesSlot = put("2 0 obj PLACEHOLDER endobj\n");
  const fontIds = [
    put("3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >> endobj\n"),
    put("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >> endobj\n"),
    put("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >> endobj\n"),
  ];

  let next = 6;
  const imageIds: Record<string, number> = {};
  for (const image of images) {
    imageIds[image.name] = next;
    put(
      encode([
        `${next} 0 obj << /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >> stream\n`,
        image.bytes,
        "\nendstream endobj\n",
      ]),
    );
    next += 1;
  }

  const pageIds: number[] = [];
  const rendered = pageContents.map((content, i) => pageChrome(content, i, pageContents.length, footer));
  for (const content of rendered) {
    const stream = encoder.encode(content);
    const contentId = next;
    put(encode([`${contentId} 0 obj << /Length ${stream.length} >> stream\n`, stream, "\nendstream endobj\n"]));
    next += 1;
    const xobjects = Object.entries(imageIds)
      .map(([name, objId]) => `/${name} ${objId} 0 R`)
      .join(" ");
    const pageId = next;
    put(
      `${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontIds[0]} 0 R /F2 ${fontIds[1]} 0 R /F3 ${fontIds[2]} 0 R >> /XObject << ${xobjects} >> >> >> endobj\n`,
    );
    pageIds.push(pageId);
    next += 1;
  }

  items[pagesSlot - 1] = encoder.encode(
    `2 0 obj << /Type /Pages /Kids [${pageIds.map((pageId) => `${pageId} 0 R`).join(" ")}] /Count ${pageIds.length} >> endobj\n`,
  );

  const header = encoder.encode("%PDF-1.4\n");
  const offsets = [0];
  let body = new Uint8Array(0);
  for (const item of items) {
    offsets.push(header.length + body.length);
    body = encode([body, item]);
  }
  const xrefPos = header.length + body.length;
  const xref =
    `xref\n0 ${items.length + 1}\n0000000000 65535 f \n` +
    offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)
      .join("\n") +
    "\n";
  const trailer = `trailer << /Size ${items.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return new Blob([encode([header, body, xref, trailer])], { type: "application/pdf" });
}
