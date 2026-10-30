import { sendJson, type NodeLikeReq, type NodeLikeRes } from "../src/lib/http.ts";
import { emptySubstackFeed } from "../src/lib/substack.ts";
import { handleSubstackFeed } from "../src/lib/substack.server.ts";

export default async function handler(req: NodeLikeReq, res: NodeLikeRes) {
  if (req.method !== "GET") {
    sendJson(res, 405, emptySubstackFeed());
    return;
  }
  try {
    const body = await handleSubstackFeed();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      !body.available
        ? "no-store"
        : body.posts.length === 0
          ? "public, max-age=30, s-maxage=30"
          : "public, s-maxage=600, stale-while-revalidate=86400",
    );
    res.statusCode = 200;
    res.end(JSON.stringify(body));
  } catch {
    sendJson(res, 200, emptySubstackFeed());
  }
}
