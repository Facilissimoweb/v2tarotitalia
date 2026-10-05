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
          next();
        } catch {
          const { siteContent } = await import("./src/data/siteContent.ts");
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: siteContent.itha.groqManca }));
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
