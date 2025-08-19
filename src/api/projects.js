// ------------------------------------------------------------------
// 환경:
//  - dev(로컬): 프록시 사용 → API_BASE = "" , API_PATH = "/api" (vite proxy)
//  - prod(배포): 직접 호출   → API_BASE = VITE_API_BASE_URL (예: https://api-unis.com)
//    * 배포에서 프록시를 쓸 게 아니라면 API_PATH는 빈 값("")로 두는 걸 권장
// ------------------------------------------------------------------
const PROD = import.meta.env.PROD;
const API_BASE = PROD ? (import.meta?.env?.VITE_API_BASE_URL || "") : "";
const API_PATH = (import.meta?.env?.VITE_API_BASE_PATH ?? "/api").trim();

const PLACEHOLDER = "/placeholder-project.png";

// ---------- 공통 유틸 ----------
function joinURL(base, path) {
  if (!base) return path; // 프록시 모드: "/api/..." 그대로
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
  try {
    const url = new URL(u);
    return /^https?:$/.test(url.protocol) ? u : "";
  } catch {
    return "";
  }
}

// ---------- 목록 ----------
export async function fetchProjects() {
  const path = `${API_PATH}/projects`;
  const json = await fetchJSON(path);
  console.log("[projects:list] url =", joinURL(API_BASE, path));

  const arr = Array.isArray(json?.data) ? json.data : [];
  return arr.map((d) => {
    const g = Number(d?.generation);
    return {
      id: d?.projectId,
      title: s(d?.serviceName),
      gen: Number.isFinite(g) ? g : undefined,
      intro: s(d?.shortDescription),
      thumbnail: s(d?.imageUrl) || PLACEHOLDER,
      isAlumni: Boolean(d?.isAlumni),
      isOfficial: Boolean(d?.isOfficial),
    };
  });
}

// ---------- 상세 (경로형만! 쿼리형 금지) ----------
export async function fetchProjectDetail(id) {
  const idStr = String(id ?? "").trim();
  if (!/^\d+$/.test(idStr)) throw new Error(`Invalid project id: "${id}"`);

  const path = `${API_PATH}/projects/${encodeURIComponent(idStr)}`;
  const json = await fetchJSON(path);
  console.log("[projects:detail] url =", joinURL(API_BASE, path));

  const d = json?.data;
  if (!d || Array.isArray(d) || typeof d !== "object") {
    const err = new Error("Detail not found or malformed response");
    err.status = 404;
    throw err;
  }

  const g = Number(d?.generation);

  return {
    id: Number(idStr),
    title: s(d?.serviceName),
    gen: Number.isFinite(g) ? g : undefined,
    intro: s(d?.shortDescription),
    detail: s(d?.description) || s(d?.shortDescription) || "",
    coverImage: s(d?.imageUrl) || PLACEHOLDER, // ← 서버 imageUrl을 커버로 사용
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

// 서버가 generation 제공하므로 보강 불필요
export async function enrichProjectsWithGen(list) { return list; }

// (옵션) 내부 캐시
const _detailCache = new Map();
export async function getProjectDetailCached(id) {
  if (_detailCache.has(id)) return _detailCache.get(id);
  const d = await fetchProjectDetail(id);
  _detailCache.set(id, d);
  return d;
}
