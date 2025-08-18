// src/api/projects.js

const PROD = import.meta.env.PROD;
const API_BASE = PROD ? "" : (import.meta?.env?.VITE_API_BASE_URL || "");
const API_PATH = PROD ? "/api/proxy" : (import.meta?.env?.VITE_API_BASE_PATH || "/api");
const PLACEHOLDER = "/placeholder-project.png";

function joinURL(base, path) {
  if (!base) return path; // 프록시: "/api/..." 그대로
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
      err.status = res.status;
      err.url = url;
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

// ── gen 파싱 도우미 ──────────────────────────────────────────────
function parseGenStrict(txt) {
  if (txt == null) return undefined;
  const m = String(txt).match(/(\d+)\s*기\b/i);
  if (!m) return undefined;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : undefined;
}
function parseGenLoose(txt) {
  if (txt == null) return undefined;
  const m = String(txt).match(/\d+/);
  if (!m) return undefined;
  const n = parseInt(m[0], 10);
  return Number.isFinite(n) ? n : undefined;
}
function extractGenFromRecord(d) {
  // 1순위: 명시 필드
  let g =
    parseGenStrict(d?.generation) ??
    parseGenStrict(d?.projectGeneration) ??
    parseGenStrict(d?.gen) ??
    parseGenStrict(d?.generationNumber);

  // 2순위: 텍스트에서 “N기”
  g ??= parseGenStrict(d?.serviceName) ?? parseGenStrict(d?.shortDescription) ?? parseGenStrict(d?.description);

  // 3순위: 느슨 파싱(제목에서 숫자만)
  g ??= parseGenLoose(d?.serviceName);

  return g;
}
function pickRecordById(json, idStr) {
  const d = json?.data;
  if (d && !Array.isArray(d) && typeof d === "object") return d;            // 단건
  if (Array.isArray(d)) return d.find(x => String(x?.projectId) === idStr) || d[0] || {}; // 리스트일 때
  return {};
}

// ── 목록: GET {API_PATH}/projects ───────────────────────────────
export async function fetchProjects() {
  const json = await fetchJSON(`${API_PATH}/projects`);
  const arr = Array.isArray(json?.data) ? json.data : [];

  return arr.map((d) => {
    const title = s(d?.serviceName);
    const gen = extractGenFromRecord(d); // 목록에서 최대한 채움

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

// ── 상세: 우선 경로형 → 폴백 쿼리형 ───────────────────────────────
export async function fetchProjectDetail(id) {
  const idStr = String(id ?? "").trim();
  if (!/^\d+$/.test(idStr)) throw new Error(`Invalid project id: "${id}"`);

  // 1) 경로형: /projects/:id  (백엔드가 여기서 generation을 내려주는 게 정상)
  try {
    const json1 = await fetchJSON(`${API_PATH}/projects/${encodeURIComponent(idStr)}`);
    const d1 = pickRecordById(json1, idStr);
    const title1 = s(d1?.serviceName);
    const gen1 = extractGenFromRecord(d1);
    if (gen1 != null || Object.keys(d1).length) {
      return normalizeDetailRecord(d1, idStr, title1, gen1);
    }
  } catch (e) {
    // 404면 폴백 진행, 그 외 에러는 다시 throw
    if (Number(e?.status) && Number(e.status) !== 404) throw e;
  }

  // 2) 폴백: 쿼리형 /projects?projectId=:id  (혹시 리스트가 오면 id로 선택)
  const json2 = await fetchJSON(`${API_PATH}/projects?projectId=${encodeURIComponent(idStr)}`);
  const d2 = pickRecordById(json2, idStr);
  const title2 = s(d2?.serviceName);
  const gen2 = extractGenFromRecord(d2);
  return normalizeDetailRecord(d2, idStr, title2, gen2);
}

function normalizeDetailRecord(d, idStr, title, gen) {
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

// ── 캐시 & 보강 ────────────────────────────────────────────────
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
