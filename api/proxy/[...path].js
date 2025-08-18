// api/proxy/[[...path]].js

const ALLOW_ORIGINS = new Set([
    "https://unis-ewha.com",
    "https://www.unis-ewha.com", // www 허용
    "http://localhost:5173",     // 로컬
  ]);
  
  const DEFAULT_ORIGIN = "https://unis-ewha.com";
  
  const API_ORIGIN = process.env.API_TARGET_ORIGIN || "https://api-unis.com";
  const API_TARGET_BASE_PATH = (process.env.API_TARGET_BASE_PATH || "").trim(); // 예: "", "/v1"
  
  function setCORS(res, origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Vary", "Origin");
    // 필요 시: res.setHeader("Access-Control-Allow-Credentials", "true");
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
  
      // 프록시 뒤 경로
      const seg = req.query?.path;
      const pathFromProxy = Array.isArray(seg) ? `/${seg.join("/")}` : (seg ? `/${seg}` : "");
  
      // 공통 prefix(/v1 등)
      const base = API_TARGET_BASE_PATH ? `/${API_TARGET_BASE_PATH.replace(/^\/|\/$/g, "")}` : "";
  
      const u = new URL(req.url, "http://local");
      u.searchParams.delete("path");         // ← 캐치올 파라미터 제거
      const search = u.search || "";
      
      // 전달 헤더 정리
      const fwdHeaders = { ...req.headers };
      delete fwdHeaders.host;
      delete fwdHeaders["content-length"];
      delete fwdHeaders.origin; // 서버-투-서버 불필요
  
      const body = await readBody(req);
  
      // 업스트림 URL 생성기
      const buildUrl = (extraPrefix = "") =>
        `${API_ORIGIN}${extraPrefix}${base}${pathFromProxy}${search || ""}`;
  
      // ✅ 로그는 여기(함수 안, buildUrl 선언 후)
      console.log("REQ", req.method, req.url);
      console.log("TRY1", buildUrl());
  
      const fetchOpts = { method: req.method, headers: fwdHeaders, body };
  
      // 1차 시도
      let upstream = await fetch(buildUrl(), fetchOpts);
  
      // 404면 '/api' 프리픽스로 재시도 (백엔드 경로 혼재 대비)
      const baseEndsWithApi = /\/api$/.test(base);
      const pathStartsWithApi = pathFromProxy.startsWith("/api/");
      if (upstream.status === 404 && !baseEndsWithApi && !pathStartsWithApi) {
        console.log("RETRY", buildUrl("/api"));
        upstream = await fetch(buildUrl("/api"), fetchOpts);
      }
  
      // 응답 전달
      const buf = Buffer.from(await upstream.arrayBuffer());
      upstream.headers.forEach((v, k) => {
        if (!/^access-control-/i.test(k)) res.setHeader(k, v); // CORS는 우리가 세팅
      });
      setCORS(res, allowOrigin);
  
      res.statusCode = upstream.status;
      res.end(buf);
    } catch (e) {
      console.error("PROXY_ERR", e);
      setCORS(res, DEFAULT_ORIGIN);
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Bad gateway", detail: String(e?.message || e) }));
    }
  }
  