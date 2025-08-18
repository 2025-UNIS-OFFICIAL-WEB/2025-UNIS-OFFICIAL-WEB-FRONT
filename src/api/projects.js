// src/api/projects.js

const PROD = import.meta.env.PROD;
const API_BASE = PROD ? "" : (import.meta?.env?.VITE_API_BASE_URL || "");
const API_PATH = PROD ? "/api/proxy" : (import.meta?.env?.VITE_API_BASE_PATH || "/api");
const PLACEHOLDER = "/placeholder-project.png";

function joinURL(base, path) {
  if (!base) return path;
  const b = base.endsWith("/") ? b = base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function fetchJSON(path, { timeout = 12000, ...opts } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  const url = joinURL(API_BASE, path);
  try {
    const res = await fetch(url, {
      ...(import.meta.env.VITE_API_WITH_CREDENTIALS === "true" ? { credentials: "include" } : {}),
      headers: { Accept: "application/json", ...(opts.headers || {}) },
      signal: controller.signal,
      ...opts,
    });
    const text = await res.text();
    let json = {};
    try { json = text ? JSON.parse(text) : {}; } catch {}
    if (!res.ok) {
      const err = new Error(json?.message || `HTTP ${res.status} @ ${url}`);
      err.status = res.status; err.url = url;
      throw err;
    }
    return json;
  } finally { clearTimeout(t); }
}

const s = (v, d = "") => (typeof v === "string" ? v : d);
function safeUrl(u = "") {
  if (typeof u !== "string" || !u.trim()) return "";
  try { const url = new URL(u); return /^https?:$/.test(url.protocol) ? u : ""; } catch { return ""; }
}
function djb2(str) { let h = 5381; for (let i=0;i<str.length;i++) h=((h<<5)+h)+str.charCodeAt(i); return Math.abs(h); }

// 숫자 파서: "4", "4기", "GEN_4" → 4
function parseGen(v) {
  if (v == null) return undefined;
  const m = String(v).match(/\d+/);
  if (!m) return undefined;
  const n = parseInt(m[0], 10);
  return Number.isFinite(n) ? n : undefined;
}

// --- 목록 ---
export async function fetchProjects() {
  const json = await fetchJSON(`${API_PATH}/projects`);
  const arr = Array.isArray(json?.data) ? json.data : [];
  return arr.map((d) => {
    const title = s(d?.serviceName);
    const gen = (
      parseGen(d?.generation) ??
      parseGen(d?.projectGeneration) ??
      parseGen(d?.gen) ??
      parseGen(d?.generationNumber) ??
      parseGen(title)                       // ⬅️ serviceName 에서도 추출
    );
    return {
      id: d?.projectId,
      title,
      gen,
      intro: s(d?.shortDescription),
      thumbnail: s(d?.imageUrl) || PLACEHOLDER,
      isAlumni: Boolean(d?.isAlumni),
      isOfficial: Boolean(d?.isOfficial),
    };
  });
}

// --- 상세: 쿼리형 고정, 하지만 응답이 "배열"이면 id로 찾아서 사용 ---
export async function fetchProjectDetail(id) {
  const idStr = String(id ?? "").trim();
  if (!/^\d+$/.test(idStr)) throw new Error(`Invalid project id: "${id}"`);

  const url = `${API_PATH}/projects?projectId=${encodeURIComponent(idStr)}`;
  const json = await fetchJSON(url);

  // 백엔드가 배열을 반환(목록 그대로)하는 경우가 있어 id로 찾아줌
  let payload = json?.data;
  let d = Array.isArray(payload)
    ? (payload.find(x => String(x?.projectId) === idStr) || payload[0] || {})
    : (payload || {});

  const title = s(d?.serviceName);
  const gen = (
    parseGen(d?.generation) ??
    parseGen(d?.projectGeneration) ??
    parseGen(d?.gen) ??
    parseGen(d?.generationNumber) ??
    parseGen(title)                         // ⬅️ 없으면 제목에서
  );

  return {
    id: Number(idStr),
    title,
    gen,
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

// --- 캐시 & 보강 ---
const _detailCache = new Map();
export async function getProjectDetailCached(id) {
  if (_detailCache.has(id)) return _detailCache.get(id);
  const d = await fetchProjectDetail(id);
  _detailCache.set(id, d);
  return d;
}

export async function enrichProjectsWithGen(list) {
  const targets = list.filter(p => p?.id != null && (p.gen == null));
  const results = await Promise.allSettled(targets.map(p => getProjectDetailCached(p.id)));
  const genById = new Map();
  results.forEach((r, i) => { if (r.status === "fulfilled") genById.set(targets[i].id, r.value.gen); });
  return list.map(p => ({ ...p, gen: p.gen ?? genById.get(p.id) }));
}
