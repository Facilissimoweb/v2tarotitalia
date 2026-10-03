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

export function readBearer(req: NodeLikeReq) {
  const raw = req.headers.authorization || req.headers.Authorization || "";
  const header = Array.isArray(raw) ? raw[0] : raw;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

export function readJsonBody<T>(req: NodeLikeReq): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    req.on("data", (chunk) => chunks.push(String(chunk)));
    req.on("end", () => {
      try {
        resolve(JSON.parse(chunks.join("") || "{}") as T);
      } catch (error) {
        reject(error);
      }
    });
  });
}
