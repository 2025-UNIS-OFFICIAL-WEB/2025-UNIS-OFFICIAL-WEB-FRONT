// src/api/projects.js
const PROD = import.meta.env.PROD;

// 개발(프록시)에서는 baseURL 비움, 배포(직접호출)에서만 채움
const API_BASE = PROD ? (import.meta?.env?.VITE_API_BASE_URL || "") : "";
const API_PATH = import.meta?.env?.VITE_API_BASE_PATH || "/api";

const PLACEHOLDER = "/placeholder-project.png";

function joinURL(base, path) {
  if (!base) return path; // 프록시 모드: /api/.. 그대로
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
  } finally {
    clearTimeout(t);
  }
}

const s = (v, d = "") => (typeof v === "string" ? v : d);
function safeUrl(u = "") {
  if (typeof u !== "string" || !u.trim()) return "";
  try { const url = new URL(u); return /^https?:$/.test(url.protocol) ? u : ""; } catch { return ""; }
}

function pickRecordById(json, idStr) {
  const d = json?.data;
  if (d && !Array.isArray(d) && typeof d === "object") return d;            // 단건
  if (Array.isArray(d)) return d.find(x => String(x?.projectId) === idStr) || d[0] || {};
  return {};
}

/* ──────────────────────────────────────────────
   엔드포인트 폴백 목록(오른쪽으로 갈수록 보수적)
   1) /api/projects
   2) /api/admin/projects
   3) /api/v1/projects
────────────────────────────────────────────── */
const LIST_ENDPOINTS = [
  `${API_PATH}/projects`,
  `${API_PATH}/admin/projects`,
  `${API_PATH.replace(/\/api$/, "/api/v1")}/projects`,
];

async function fetchFirstOkJson(paths) {
  let lastErr;
  for (const p of paths) {
    try {
      const json = await fetchJSON(p);
      return { json, used: p };
    } catch (e) {
      lastErr = e;
      console.warn(`[projects] fail @ ${e.url || p}:`, e.message);
    }
  }
  throw lastErr;
}

// ── 목록
export async function fetchProjects() {
  const { json, used } = await fetchFirstOkJson(LIST_ENDPOINTS);
  console.log("[projects] endpoint used:", used);

  const arr = Array.isArray(json?.data) ? json.data : [];
  return arr.map((d) => ({
    id: d?.projectId,
    title: s(d?.serviceName),
    gen: Number.isFinite(d?.generation) ? d.generation : undefined,  // ★ 서버 값 그대로 사용
    intro: s(d?.shortDescription),
    thumbnail: s(d?.imageUrl) || PLACEHOLDER,
    isAlumni: Boolean(d?.isAlumni),
    isOfficial: Boolean(d?.isOfficial),
  }));
}

// ── 상세
export async function fetchProjectDetail(id) {
  const idStr = String(id ?? "").trim();
  if (!/^\d+$/.test(idStr)) throw new Error(`Invalid project id: "${id}"`);

  const detailCandidates = [
    `${API_PATH}/projects/${encodeURIComponent(idStr)}`,
    `${API_PATH}/admin/projects/${encodeURIComponent(idStr)}`,
    `${API_PATH.replace(/\/api$/, "/api/v1")}/projects/${encodeURIComponent(idStr)}`,
  ];

  try {
    const { json } = await fetchFirstOkJson(detailCandidates);
    const d = pickRecordById(json, idStr);
    return normalizeDetailRecord(d, idStr);
  } catch (e) {
    const queryCandidates = [
      `${API_PATH}/projects?projectId=${encodeURIComponent(idStr)}`,
      `${API_PATH}/admin/projects?projectId=${encodeURIComponent(idStr)}`,
      `${API_PATH.replace(/\/api$/, "/api/v1")}/projects?projectId=${encodeURIComponent(idStr)}`,
    ];
    const { json } = await fetchFirstOkJson(queryCandidates);
    const d = pickRecordById(json, idStr);
    return normalizeDetailRecord(d, idStr);
  }
}

function normalizeDetailRecord(d, idStr) {
  return {
    id: Number(idStr),
    title: s(d?.serviceName),
    gen: Number.isFinite(d?.generation) ? d.generation : undefined,  // ★ 서버 값 그대로
    intro: s(d?.shortDescription),
    detail: s(d?.description),
    coverImage: s(d?.imageUrl) || PLACEHOLDER,
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

// ── 캐시 & 보강 (이제 보강 불필요 → no-op로 유지)
const _detailCache = new Map();
export async function getProjectDetailCached(id) {
  if (_detailCache.has(id)) return _detailCache.get(id);
  const d = await fetchProjectDetail(id);
  _detailCache.set(id, d);
  return d;
}

export async function enrichProjectsWithGen(list) {
  return list; // 서버가 generation 제공하므로 추가 보강 불필요
}
