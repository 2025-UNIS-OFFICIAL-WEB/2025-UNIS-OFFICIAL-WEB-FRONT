// api/proxy/[...path].js

const ALLOW_ORIGINS = new Set([
  "https://unis-ewha.com",
  "https://www.unis-ewha.com",
  "http://localhost:5173",
]);

const DEFAULT_ORIGIN = "https://unis-ewha.com";
const API_ORIGIN = process.env.API_TARGET_ORIGIN || "https://api-unis.com";
const API_TARGET_BASE_PATH = (process.env.API_TARGET_BASE_PATH || "").trim(); // "", "/v1" 등

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
    const allowOrigin = ALLOW_ORIGINS.has(reqOrigin) ? reqOrigin : DEFAULT_ORIGIN;
    setCORS(res, allowOrigin);

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    // 1) URL 파싱: pathname에서 /api/proxy 뒤를 그대로 사용
    const u = new URL(req.url, "http://local");
    const pathname = u.pathname; // 예) "/api/proxy/projects"
    const afterProxy = pathname.replace(/^\/api\/proxy/, ""); // 예) "/projects"
    const pathFromProxy = afterProxy || "/";

    // 2) Vercel이 붙인 쿼리 파라미터 'path'는 업스트림으로 전달하지 않음
    u.searchParams.delete("path");
    const search = u.search || "";

    // 3) (선택) 공통 prefix(/v1 등) ENV 적용
    const base = API_TARGET_BASE_PATH ? `/${API_TARGET_BASE_PATH.replace(/^\/|\/$/g, "")}` : "";

    // 4) 전달 헤더 정리
    const fwdHeaders = { ...req.headers };
    delete fwdHeaders.host;
    delete fwdHeaders["content-length"];
    delete fwdHeaders.origin;

    const body = await readBody(req);

    const buildUrl = (extraPrefix = "") =>
      `${API_ORIGIN}${extraPrefix}${base}${pathFromProxy}${search}`;

    // 디버그 로그
    console.log("REQ", req.method, pathname + search);
    console.log("TRY1", buildUrl());

    const fetchOpts = { method: req.method, headers: fwdHeaders, body };

    // 1차 호출
    let upstream = await fetch(buildUrl(), fetchOpts);

    // 404면 '/api' 프리픽스로 한 번 더 시도 (백엔드 경로 혼재 대비)
    const baseEndsWithApi = /\/api$/.test(base);
    const pathStartsWithApi = pathFromProxy.startsWith("/api/");
    if (upstream.status === 404 && !baseEndsWithApi && !pathStartsWithApi) {
      console.log("RETRY", buildUrl("/api"));
      upstream = await fetch(buildUrl("/api"), fetchOpts);
    }

    // 응답 전달
    const buf = Buffer.from(await upstream.arrayBuffer());
    upstream.headers.forEach((v, k) => {
      if (!/^access-control-/i.test(k)) res.setHeader(k, v);
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
