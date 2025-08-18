// api/proxy/[[...path]].js

const ALLOW_ORIGINS = new Set([
    "https://unis-ewha.com",
    "https://www.unis-ewha.com", // www도 허용
    "http://localhost:5173",     // 로컬 테스트
  ]);
  
  const DEFAULT_ORIGIN = "https://unis-ewha.com";
  
  const API_ORIGIN = process.env.API_TARGET_ORIGIN || "https://api-unis.com";
  // 백엔드 공통 prefix가 있으면(예: /v1) ENV로 넣어 사용
  const API_TARGET_BASE_PATH = (process.env.API_TARGET_BASE_PATH || "").trim(); // "", "/v1" 등
  
  function setCORS(res, origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Vary", "Origin");
    // 필요시 쿠키 사용:
    // res.setHeader("Access-Control-Allow-Credentials", "true");
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
      const allowOrigin = ALLOW_ORIGINS.has(reqOrigin) ? reqOrigin : DEFAULT_ORIGIN;
      setCORS(res, allowOrigin);
  
      // Preflight
      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      }
  
      // 프록시 뒤 경로 그대로 보존
      const seg = req.query?.path;
      const pathFromProxy = Array.isArray(seg) ? `/${seg.join("/")}` : (seg ? `/${seg}` : "");
  
      // ENV 공통 prefix(/v1 같은 것) 적용
      const base = API_TARGET_BASE_PATH ? `/${API_TARGET_BASE_PATH.replace(/^\/|\/$/g, "")}` : "";
  
      const { search } = new URL(req.url, "http://local");
  
      // 전달 헤더 정리
      const fwdHeaders = { ...req.headers };
      delete fwdHeaders.host;
      delete fwdHeaders["content-length"];
      delete fwdHeaders.origin; // 서버-투-서버에 불필요 & 일부 서버에서 차단 요소
  
      const body = await readBody(req);
  
      const buildUrl = (extraPrefix = "") =>
        `${API_ORIGIN}${extraPrefix}${base}${pathFromProxy}${search || ""}`;
  
      // 1차 시도: ENV base만 적용
      let upstream = await fetch(buildUrl(), {
        method: req.method,
        headers: fwdHeaders,
        body,
      });
  
      // ❗404면 '/api' 프리픽스를 덧붙여 한 번 더 시도 (백엔드 경로 혼재 대비)
      const baseEndsWithApi = /\/api$/.test(base);
      const pathStartsWithApi = pathFromProxy.startsWith("/api/");
      if (upstream.status === 404 && !baseEndsWithApi && !pathStartsWithApi) {
        upstream = await fetch(buildUrl("/api"), {
          method: req.method,
          headers: fwdHeaders,
          body,
        });
      }
  
      // 응답 전달
      const buf = Buffer.from(await upstream.arrayBuffer());
  
      upstream.headers.forEach((v, k) => {
        if (!/^access-control-/i.test(k)) res.setHeader(k, v); // CORS 헤더는 우리가 설정
      });
      setCORS(res, allowOrigin);
  
      res.statusCode = upstream.status;
      res.end(buf);
    } catch (e) {
      setCORS(res, DEFAULT_ORIGIN);
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Bad gateway", detail: String(e?.message || e) }));
    }
  }
  