import sharp from "sharp";

const files = [
  "public/logo-nav-seal-src.png",
  "public/logo-nav-seal.webp",
];

for (const file of files) {
  const img = sharp(file);
  const { width, height, channels } = await img.metadata();
  const { data } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0,
    sumX = 0,
    sumY = 0,
    n = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2],
        a = data[i + 3];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (a > 20 && lum > 22) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        sumX += x;
        sumY += y;
        n++;
      }
    }
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const meanX = sumX / n;
  const meanY = sumY / n;
  console.log({
    file,
    width,
    height,
    channels,
    bbox: { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 },
    bboxCenter: { cx, cy },
    bboxOff: { dx: cx - (width - 1) / 2, dy: cy - (height - 1) / 2 },
    massCenter: { meanX, meanY },
    massOff: { dx: meanX - (width - 1) / 2, dy: meanY - (height - 1) / 2 },
    n,
  });
}
