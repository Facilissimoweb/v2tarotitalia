import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

async function cropCoin(logoIn, logoOut) {
  const { data: logoPx, info: logoInfo } = await sharp(logoIn)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const lw = logoInfo.width;
  const lh = logoInfo.height;
  const lcx = (lw - 1) / 2;
  const lcy = (lh - 1) / 2;
  let metalR = 0;
  for (let y = 0; y < lh; y += 1) {
    for (let x = 0; x < lw; x += 1) {
      const i = (y * lw + x) * 4;
      const lum = (logoPx[i] + logoPx[i + 1] + logoPx[i + 2]) / 3;
      if (logoPx[i + 3] > 20 && lum > 22) {
        const dist = Math.hypot(x - lcx, y - lcy);
        if (dist > metalR) metalR = dist;
      }
    }
  }
  const cropR = Math.max(8, metalR - 2);
  const cropSize = Math.round(cropR * 2);
  const cropLeft = Math.max(0, Math.round(lcx - cropR));
  const cropTop = Math.max(0, Math.round(lcy - cropR));
  const circle = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cropSize}" height="${cropSize}"><circle cx="${cropSize / 2}" cy="${cropSize / 2}" r="${cropSize / 2 - 0.5}" fill="white"/></svg>`,
  );
  await sharp(logoIn)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: Math.min(cropSize, lw - cropLeft),
      height: Math.min(cropSize, lh - cropTop),
    })
    .resize(cropSize, cropSize, { fit: "cover" })
    .ensureAlpha()
    .composite([{ input: circle, blend: "dest-in" }])
    .webp({ quality: 92 })
    .toFile(logoOut);
}

const logoOut = join(pub, "logo-medallion.webp");
await cropCoin(join(pub, "logo-metal.webp"), logoOut);
await cropCoin(join(pub, "medaglione-1-src.png"), join(pub, "medaglione-1.webp"));
await cropCoin(join(pub, "medaglione-2-src.png"), join(pub, "medaglione-2.webp"));
await cropCoin(join(pub, "medaglione-3-src.png"), join(pub, "medaglione-3.webp"));

const chatIn = join(pub, "chat-icon-src.png");
const chatOut = join(pub, "chat-icon.png");
const { data, info } = await sharp(chatIn).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const px = Buffer.from(data);
const w = info.width;
const h = info.height;
function isBg(i) {
  return Math.max(px[i], px[i + 1], px[i + 2]) < 28;
}
const seen = new Uint8Array(w * h);
const q = [];
function tryPush(x, y) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const idx = y * w + x;
  if (seen[idx]) return;
  seen[idx] = 1;
  if (isBg(idx * 4)) q.push(idx);
}
for (let x = 0; x < w; x += 1) {
  tryPush(x, 0);
  tryPush(x, h - 1);
}
for (let y = 0; y < h; y += 1) {
  tryPush(0, y);
  tryPush(w - 1, y);
}
while (q.length) {
  const idx = q.pop();
  px[idx * 4 + 3] = 0;
  const x = idx % w;
  const y = (idx / w) | 0;
  tryPush(x - 1, y);
  tryPush(x + 1, y);
  tryPush(x, y - 1);
  tryPush(x, y + 1);
}
let minX = w;
let minY = h;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < h; y += 1) {
  for (let x = 0; x < w; x += 1) {
    if (px[(y * w + x) * 4 + 3] > 8) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}
const pad = 8;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(w - 1, maxX + pad);
maxY = Math.min(h - 1, maxY + pad);
await sharp(px, { raw: { width: w, height: h, channels: 4 } })
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .png()
  .toFile(chatOut);

console.log("wrote", logoOut, "and", chatOut, "chat", maxX - minX + 1, "x", maxY - minY + 1);


