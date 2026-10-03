import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { IncomingMessage, ServerResponse } from "node:http";

function applyEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
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
        try {
          const nodeReq = req as IncomingMessage;
          const nodeRes = res as ServerResponse;
          if (url === "/api/itha-decode") {
            const { default: handler } = await import("./api/itha-decode.ts");
            await handler(nodeReq, nodeRes);
            return;
          }
          if (url === "/api/itha-dev-decode") {
            const { readJsonBody, sendJson } = await import("./src/lib/itha/http.ts");
            const { handleIthaDevPreview } = await import("./src/lib/itha/serverDecode.ts");
            if (req.method !== "POST") {
              sendJson(nodeRes, 405, { error: "method" });
              return;
            }
            const body = await readJsonBody(nodeReq);
            const result = await handleIthaDevPreview(body);
            sendJson(nodeRes, result.status, result.body);
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
          next();
        } catch {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "api" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  applyEnv(mode);
  return {
    plugins: [react(), tailwindcss(), ithaApiPlugin()],
    server: {
      port: 5173,
      host: true,
    },
  };
});
