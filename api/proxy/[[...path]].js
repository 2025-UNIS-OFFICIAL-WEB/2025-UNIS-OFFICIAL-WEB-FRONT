const ALLOW_ORIGINS = new Set([
    "https://www.unis-ewha.com",
    "https://unis-ewha.com",
    "http://localhost:5173", // (선택) 로컬 테스트
  ]);
  
  const API_ORIGIN = process.env.API_TARGET_ORIGIN || "https://api-unis.com";
  // (선택) 백엔드가 /v1 같은 공통 prefix가 있으면 여기에 넣으세요. 없으면 "" 유지.
  const API_TARGET_BASE_PATH = (process.env.API_TARGET_BASE_PATH || "").trim(); // 예: "", "/v1"
  
  function setCORS(res, origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Vary", "Origin");
  }
  
  async function readBody(req) {
    if (req.method === "GET" || req.method === "HEAD") return undefined;
    const chunks = [];
    for await (const c of req) chunks.push(c);
    return Buffer.concat(chunks);
  }
  
  export default async function handler(req, res) {
    try {
      const reqOrigin = req.headers.origin || "";
      const allowOrigin = ALLOW_ORIGINS.has(reqOrigin) ? reqOrigin : "https://www.unis-ewha.com";
      setCORS(res, allowOrigin);
  
      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      }
  
      // ✅ '/api' 하드코딩 제거: proxy 뒤 경로를 그대로 전달
      const seg = req.query?.path;
      const pathFromProxy =
        Array.isArray(seg) ? `/${seg.join("/")}` : (seg ? `/${seg}` : "");
  
      const base = API_TARGET_BASE_PATH
        ? `/${API_TARGET_BASE_PATH.replace(/^\/|\/$/g, "")}`
        : "";
  
      const { search } = new URL(req.url, "http://local");
      const targetUrl = `${API_ORIGIN}${base}${pathFromProxy}${search || ""}`;
  
      const fwdHeaders = { ...req.headers };
      delete fwdHeaders.host;
      delete fwdHeaders["content-length"];
  
      const body = await readBody(req);
  
      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers: fwdHeaders,
        body,
      });
  
      const buf = Buffer.from(await upstream.arrayBuffer());
  
      for (const [k, v] of upstream.headers.entries()) {
        if (/^access-control-/i.test(k)) continue;
        res.setHeader(k, v);
      }
      setCORS(res, allowOrigin);
  
      res.statusCode = upstream.status;
      res.end(buf);
    } catch (e) {
      setCORS(res, "https://www.unis-ewha.com");
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Bad gateway", detail: String(e?.message || e) }));
    }
  }
  