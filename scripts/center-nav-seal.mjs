import sharp from "sharp";

const srcPath = "public/logo-nav-seal-src.png";
const outPath = "public/logo-nav-seal.webp";
const size = 256;

const img = sharp(srcPath);
const { width, height } = await img.metadata();
const { data } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

let minX = width,
  minY = height,
  maxX = 0,
  maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (data[i + 3] > 20 && lum > 22) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}

const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;
const radius = Math.ceil(Math.max(maxX - minX, maxY - minY) / 2) + 1;
const side = radius * 2;
const left = Math.round(cx - radius);
const top = Math.round(cy - radius);

const extract = {
  left: Math.max(0, left),
  top: Math.max(0, top),
  width: Math.min(side, width - Math.max(0, left)),
  height: Math.min(side, height - Math.max(0, top)),
};

const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
  </svg>`,
);

await sharp(srcPath)
  .extract(extract)
  .resize(size, size, { fit: "fill" })
  .ensureAlpha()
  .composite([{ input: mask, blend: "dest-in" }])
  .webp({ quality: 94, alphaQuality: 100 })
  .toFile(outPath);

const check = sharp(outPath);
const meta = await check.metadata();
const raw = await check.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let bMinX = size,
  bMinY = size,
  bMaxX = 0,
  bMaxY = 0;
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const lum = 0.2126 * raw.data[i] + 0.7152 * raw.data[i + 1] + 0.0722 * raw.data[i + 2];
    if (raw.data[i + 3] > 20 && lum > 22) {
      if (x < bMinX) bMinX = x;
      if (y < bMinY) bMinY = y;
      if (x > bMaxX) bMaxX = x;
      if (y > bMaxY) bMaxY = y;
    }
  }
}

console.log({
  srcBbox: { minX, minY, maxX, maxY, cx, cy },
  extract,
  out: meta,
  outBbox: {
    bMinX,
    bMinY,
    bMaxX,
    bMaxY,
    cx: (bMinX + bMaxX) / 2,
    cy: (bMinY + bMaxY) / 2,
    offX: (bMinX + bMaxX) / 2 - (size - 1) / 2,
    offY: (bMinY + bMaxY) / 2 - (size - 1) / 2,
  },
});
