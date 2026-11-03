export type NodeLikeReq = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  on(event: string, cb: (...args: unknown[]) => void): void;
};

export type NodeLikeRes = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
};

export function setCors(res: NodeLikeRes) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
}

export function sendJson(res: NodeLikeRes, status: number, body: unknown) {
  setCors(res);
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

export function readHeader(req: NodeLikeReq, name: string) {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.toLowerCase() !== target) continue;
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  }
  return "";
}

export function readBearer(req: NodeLikeReq) {
  const header = readHeader(req, "authorization");
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

function parseJsonBody<T>(raw: string): T {
  return JSON.parse(raw.trim() || "{}") as T;
}

export function readJsonBody<T>(req: NodeLikeReq): Promise<T> {
  return new Promise((resolve, reject) => {
    const existing = (req as NodeLikeReq & { body?: unknown }).body;
    if (typeof existing === "string") {
      try {
        resolve(parseJsonBody<T>(existing));
      } catch (error) {
        reject(error);
      }
      return;
    }
    if (existing && typeof existing === "object" && !ArrayBuffer.isView(existing)) {
      resolve(existing as T);
      return;
    }

    const chunks: string[] = [];
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };
    const timer = setTimeout(() => {
      finish(() => {
        try {
          resolve(parseJsonBody<T>(chunks.join("")));
        } catch (error) {
          reject(error);
        }
      });
    }, 4000);

    if (typeof req.on !== "function") {
      finish(() => resolve({} as T));
      return;
    }

    req.on("data", (chunk) => chunks.push(String(chunk)));
    req.on("end", () => {
      finish(() => {
        try {
          resolve(parseJsonBody<T>(chunks.join("")));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on("error", (error) => finish(() => reject(error)));
  });
}
