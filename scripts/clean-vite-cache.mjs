import { rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const cacheDir = resolve(process.cwd(), "node_modules", ".vite");
if (existsSync(cacheDir)) {
  rmSync(cacheDir, { recursive: true, force: true });
  console.log("[vite] cache cleared:", cacheDir);
} else {
  console.log("[vite] no cache to clear");
}
