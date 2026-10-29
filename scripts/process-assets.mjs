import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

const logoIn = join(pub, "logo-metal.webp");
const logoOut = join(pub, "logo-medallion.webp");
const logoMeta = await sharp(logoIn).metadata();
const size = Math.min(logoMeta.width ?? 1024, logoMeta.height ?? 1024);
const r = size / 2 - 1;
const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="white"/></svg>`,
);
await sharp(logoIn)
  .resize(size, size, { fit: "cover" })
  .ensureAlpha()
  .composite([{ input: circle, blend: "dest-in" }])
  .webp({ quality: 92 })
  .toFile(logoOut);

const chatIn = join(pub, "chat-icon.webp");
const chatOut = join(pub, "chat-icon.png");
const { data, info } = await sharp(chatIn).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const px = Buffer.from(data);
for (let i = 0; i < px.length; i += 4) {
  const min = Math.min(px[i], px[i + 1], px[i + 2]);
  const max = Math.max(px[i], px[i + 1], px[i + 2]);
  if (min > 242 && max - min < 18) {
    px[i + 3] = 0;
  } else if (min > 226 && max - min < 24) {
    px[i + 3] = Math.round(px[i + 3] * ((242 - min) / 16));
  }
}
let minX = info.width;
let minY = info.height;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    if (px[(y * info.width + x) * 4 + 3] > 8) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}
const pad = 12;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(info.width - 1, maxX + pad);
maxY = Math.min(info.height - 1, maxY + pad);
await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .png()
  .toFile(chatOut);

console.log("wrote", logoOut, "and", chatOut, "chat", maxX - minX + 1, "x", maxY - minY + 1);
