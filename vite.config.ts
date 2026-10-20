import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv, type Plugin, type PreviewServer, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { isKnownAppPath } from "./src/lib/siteRoutes.ts";

function applyEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [rawKey, value] of Object.entries(env)) {
    const key = rawKey.replace(/^\uFEFF/, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function ithaApiPlugin(): Plugin {
  return {
    name: "itha-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/api/")) {
          next();
          return;
        }
        const nodeReq = req as IncomingMessage;
        const nodeRes = res as ServerResponse;
        const sendUnavailable = async () => {
          try {
            const { siteContent } = await import("./src/data/siteContent.ts");
            if (!nodeRes.headersSent) {
              nodeRes.statusCode = 503;
              nodeRes.setHeader("Content-Type", "application/json; charset=utf-8");
              nodeRes.end(JSON.stringify({ error: siteContent.itha.groqManca }));
            }
          } catch {
            if (!nodeRes.headersSent) {
              nodeRes.statusCode = 503;
              nodeRes.setHeader("Content-Type", "application/json; charset=utf-8");
              nodeRes.end(JSON.stringify({ error: "unavailable" }));
            }
          }
        };
        try {
          if (url === "/api/itha-decode") {
            const { default: handler } = await import("./api/itha-decode.ts");
            await handler(nodeReq, nodeRes);
            return;
          }
          if (url === "/api/itha-dev-decode") {
            const { default: handler } = await import("./api/itha-dev-decode.ts");
            await handler(nodeReq, nodeRes);
            return;
          }
          if (url === "/api/localize") {
            const { default: handler } = await import("./api/localize.ts");
            await handler(nodeReq, nodeRes);
            return;
          }
          if (url === "/api/paypal-create-order") {
            const { default: handler } = await import("./api/paypal-create-order.ts");
            await handler(nodeReq, nodeRes);
            return;
          }
          if (url === "/api/paypal-capture-order") {
            const { default: handler } = await import("./api/paypal-capture-order.ts");
            await handler(nodeReq, nodeRes);
            return;
          }
          if (url === "/api/paypal-webhook") {
            const { default: handler } = await import("./api/paypal-webhook.ts");
            await handler(nodeReq, nodeRes);
            return;
          }
          if (url === "/api/google-reviews") {
            const { default: handler } = await import("./api/google-reviews.ts");
            await handler(nodeReq, nodeRes);
            return;
          }
          if (url === "/api/tarot-chat") {
            const { default: handler } = await import("./api/tarot-chat.ts");
            await handler(nodeReq, nodeRes);
            return;
          }
          next();
        } catch (error) {
          console.error("[itha-api]", url, error);
          await sendUnavailable();
        }
      });
    },
  };
}

function isVitePassthrough(url: string) {
  if (url.startsWith("/api/")) return true;
  if (url.startsWith("/@") || url.startsWith("/src/") || url.startsWith("/node_modules/") || url.startsWith("/__")) {
    return true;
  }
  return /\.[a-zA-Z0-9]+$/.test(url);
}

function spaNotFoundPlugin(): Plugin {
  return {
    name: "spa-not-found",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if ((req.method !== "GET" && req.method !== "HEAD") || isVitePassthrough(url) || isKnownAppPath(url)) {
          next();
          return;
        }
        try {
          const html = await server.transformIndexHtml(url, readFileSync(resolve("index.html"), "utf8"));
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        } catch {
          next();
        }
      });
    },
    configurePreviewServer(server: PreviewServer) {
      return () => {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split("?")[0] ?? "";
          if ((req.method !== "GET" && req.method !== "HEAD") || isVitePassthrough(url) || isKnownAppPath(url)) {
            next();
            return;
          }
          const index = resolve("dist/index.html");
          if (!existsSync(index)) {
            next();
            return;
          }
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(readFileSync(index));
        });
      };
    },
    closeBundle() {
      const index = resolve("dist/index.html");
      if (existsSync(index)) copyFileSync(index, resolve("dist/404.html"));
    },
  };
}

export default defineConfig(({ mode }) => {
  applyEnv(mode);
  return {
    // Evita il configLoader native di Vite 8 su import relativi senza estensione.
    configLoader: "bundle",
    clearScreen: false,
    plugins: [react(), tailwindcss(), ithaApiPlugin(), spaNotFoundPlugin()],
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      hmr: {
        overlay: true,
      },
      watch: {
        // Su Windows riduce chiusure/HMR intermittenti con antivirus o sync cartelle.
        awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 },
      },
    },
    preview: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: true,
    },
    optimizeDeps: {
      // Evita freeze lunghi/ripetuti dell’optimizer in locale.
      holdUntilCrawlEnd: false,
    },
  };
});
