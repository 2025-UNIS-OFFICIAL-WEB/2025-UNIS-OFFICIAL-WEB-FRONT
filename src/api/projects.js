// src/api/projects.js
// ------------------------------------------------------------------
// 환경: dev(로컬) = 프록시 사용 → API_BASE = ""
//      prod(배포) = 직접 호출(권장) → API_BASE = VITE_API_BASE_URL
//        * 만약 배포에서 Vercel 리라이트(/api/proxy)를 쓰면
//          API_BASE는 ""(프록시), API_PATH는 "/api/proxy"로 설정
// ------------------------------------------------------------------
const PROD = import.meta.env.PROD;
const API_BASE = PROD ? (import.meta?.env?.VITE_API_BASE_URL || "") : ""; // prod: 직접호출, dev: 프록시
const API_PATH = import.meta?.env?.VITE_API_BASE_PATH || "/api";

const PLACEHOLDER = "/placeholder-project.png";

// ---------- 공통 유틸 ----------
function joinURL(base, path) {
  if (!base) return path; // 프록시 모드: /api/... 그대로
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function fetchJSON(path, { timeout = 12000, ...opts } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  const url = joinURL(API_BASE, path);
  try {
    const res = await fetch(url, {
      ...(import.meta.env.VITE_API_WITH_CREDENTIALS === "true"
        ? { credentials: "include" }
        : {}),
      headers: { Accept: "application/json", ...(opts.headers || {}) },
      signal: controller.signal,
      ...opts,
    });

    const text = await res.text();
    let json = {};
    try { json = text ? JSON.parse(text) : {}; } catch {}

    if (!res.ok) {
      const err = new Error(json?.message || `HTTP ${res.status} @ ${url}`);
      err.status = res.status; err.url = url; err.body = json;
      throw err;
    }
    return json;
  } finally { clearTimeout(t); }
}

const s = (v, d = "") => (typeof v === "string" ? v : d);
function safeUrl(u = "") {
  if (typeof u !== "string" || !u.trim()) return "";
  try { const url = new URL(u); return /^https?:$/.test(url.protocol) ? u : ""; }
  catch { return ""; }
}

function pickRecordById(json, idStr) {
  const d = json?.data;
  // 상세(단건) 응답: data가 객체
  if (d && !Array.isArray(d) && typeof d === "object") return d;
  // 리스트 응답: data가 배열
  if (Array.isArray(d)) return d.find(x => String(x?.projectId) === idStr) || d[0] || {};
  return {};
}

// 여러 후보를 순차 시도해서 첫 성공을 반환
async function fetchFirstOkJson(paths) {
  let lastErr;
  for (const p of paths) {
    try {
      const json = await fetchJSON(p);
      return { json, used: p };
    } catch (e) {
      lastErr = e;
      console.warn(`[api] fail @ ${e.url || p}:`, e.message);
    }
  }
  throw lastErr;
}

// ---------- 목록 ----------
/*
  서버 스펙(예):
  {
    "status":200, "message":"Success",
    "data":[
      { "projectId": 18, "imageUrl": "...", "serviceName":"...", "shortDescription":"...",
        "generation": 6, "isAlumni":false, "isOfficial":true }, ...
    ]
  }
*/
const LIST_ENDPOINTS = [
  `${API_PATH}/projects`,
  `${API_PATH}/admin/projects`,
  `${API_PATH.replace(/\/api$/, "/api/v1")}/projects`,
];

export async function fetchProjects() {
  const { json, used } = await fetchFirstOkJson(LIST_ENDPOINTS);
  console.log("[projects:list] endpoint used:", used);

  const arr = Array.isArray(json?.data) ? json.data : [];
  return arr.map((d) => ({
    id: d?.projectId,
    title: s(d?.serviceName),
    gen: Number.isFinite(d?.generation) ? d.generation : undefined,  // 서버 값 그대로
    intro: s(d?.shortDescription),
    thumbnail: s(d?.imageUrl) || PLACEHOLDER,
    isAlumni: Boolean(d?.isAlumni),
    isOfficial: Boolean(d?.isOfficial),
  }));
}

// ---------- 상세 ----------
/*
  서버 스펙(예):
  {
    "status":200, "message":"Success",
    "data": {
      "imageUrl":"...", "serviceName":"...", "shortDescription":"...",
      "description":"...", "githubUrl":"", "instagramUrl":"", "etcUrl":"",
      "generation":6
    }
  }
*/
export async function fetchProjectDetail(id) {
  const idStr = String(id ?? "").trim();
  if (!/^\d+$/.test(idStr)) throw new Error(`Invalid project id: "${id}"`);

  // 1) 경로형 → 실패 시 2) 쿼리형
  const detailCandidates = [
    `${API_PATH}/projects/${encodeURIComponent(idStr)}`,
    `${API_PATH}/admin/projects/${encodeURIComponent(idStr)}`,
    `${API_PATH.replace(/\/api$/, "/api/v1")}/projects/${encodeURIComponent(idStr)}`,
  ];
  const queryCandidates = [
    `${API_PATH}/projects?projectId=${encodeURIComponent(idStr)}`,
    `${API_PATH}/admin/projects?projectId=${encodeURIComponent(idStr)}`,
    `${API_PATH.replace(/\/api$/, "/api/v1")}/projects?projectId=${encodeURIComponent(idStr)}`,
  ];

  try {
    const { json, used } = await fetchFirstOkJson(detailCandidates);
    console.log("[projects:detail] endpoint used:", used);
    const d = pickRecordById(json, idStr);
    return normalizeDetail(d, idStr);
  } catch {
    const { json, used } = await fetchFirstOkJson(queryCandidates);
    console.log("[projects:detail-fallback] endpoint used:", used);
    const d = pickRecordById(json, idStr);
    return normalizeDetail(d, idStr);
  }
}

function normalizeDetail(d, idStr) {
  return {
    id: Number(idStr),
    title: s(d?.serviceName),
    gen: Number.isFinite(d?.generation) ? d.generation : undefined,
    intro: s(d?.shortDescription),
    detail: s(d?.description),
    coverImage: s(d?.imageUrl) || PLACEHOLDER, // 컴포넌트에서 고정 이미지로 덮어써도 됨
    links: {
      github: safeUrl(d?.githubUrl),
      instagram: safeUrl(d?.instagramUrl),
      etc: safeUrl(d?.etcUrl),
    },
    isAlumni: Boolean(d?.isAlumni),
    isOfficial: Boolean(d?.isOfficial),
    gallery: [],
  };
}

// ---------- 캐시 & 보강(이제 보강 불필요) ----------
const _detailCache = new Map();
export async function getProjectDetailCached(id) {
  if (_detailCache.has(id)) return _detailCache.get(id);
  const d = await fetchProjectDetail(id);
  _detailCache.set(id, d);
  return d;
}

// 서버가 generation 제공하므로 no-op
export async function enrichProjectsWithGen(list) { return list; }
