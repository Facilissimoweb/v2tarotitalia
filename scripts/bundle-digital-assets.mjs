import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const dir = "supabase/functions/download-digital/content";
const texts = [
  "trattato-arcani-maggiori.txt",
  "ermeneutica-luce-ombra.txt",
  "taccuino-studio-macerata.txt",
  "calendario-lunare.txt",
  "griglia-purificazione.txt",
  "glossario-ermetico.txt",
];
const textFiles = Object.fromEntries(
  texts.map((name) => [name, readFileSync(join(dir, name), "utf8")]),
);
const wav = readFileSync(join(dir, "lezione-01-velo-di-maya.wav")).toString("base64");
writeFileSync(
  "supabase/functions/download-digital/bundle.ts",
  `export const TEXT_FILES: Record<string, string> = ${JSON.stringify(textFiles, null, 2)};\nexport const WAV_BASE64 = ${JSON.stringify(wav)};\n`,
);
console.log("ok", Object.keys(textFiles).length, "texts", wav.length, "wav-b64");
