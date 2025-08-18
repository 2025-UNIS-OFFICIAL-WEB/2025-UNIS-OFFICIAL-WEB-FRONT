// src/api/project.js
const PROD = import.meta.env.PROD;
const API_BASE = PROD ? "" : (import.meta?.env?.VITE_API_BASE_URL || "");
const API_PATH = PROD ? "/api/proxy" : (import.meta?.env?.VITE_API_BASE_PATH || "/api");

function joinURL(base, path) {
  if (!base) return path;
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
function pickRecordById(json, idStr) {
  const d = json?.data;
  if (d && !Array.isArray(d) && typeof d === "object") return d;                 // 단건
  if (Array.isArray(d)) return d.find(x => String(x?.projectId) === idStr) || {}; // 리스트면 id로 선택
  return {};
}

/**
 * 상세: 스펙 우선(/projects/:id), 404면 폴백(?projectId=:id)
 * 스펙: { status:200, data:[{ imageUrl, serviceName, shortDescription, description,
 *         githubUrl, instagramUrl, etcUrl, generation }] }
 * gen은 사용하지 않음(표시 제외)
 */
export async function fetchProjectDetail(id) {
  const idStr = String(id ?? "").trim();
  if (!/^\d+$/.test(idStr)) throw new Error(`Invalid project id: "${id}"`);

  // 1) 경로형
  try {
    const json1 = await fetchJSON(`${API_PATH}/projects/${encodeURIComponent(idStr)}`);
    const rec1 = pickRecordById(json1, idStr);
    if (Object.keys(rec1).length) return normalizeDetail(rec1, idStr);
  } catch (e) {
    if (Number(e?.status) && Number(e.status) !== 404) throw e; // 404만 폴백
  }

  // 2) 폴백: 쿼리형
  const json2 = await fetchJSON(`${API_PATH}/projects?projectId=${encodeURIComponent(idStr)}`);
  const rec2 = pickRecordById(json2, idStr);
  if (Object.keys(rec2).length) return normalizeDetail(rec2, idStr);

  return null;
}

function normalizeDetail(d, idStr) {
  return {
    id: Number(idStr),
    title: s(d?.serviceName),
    intro: s(d?.shortDescription),
    detail: s(d?.description),
    // coverImage는 컴포넌트에서 하드코딩 사용
    coverImage: undefined,
    links: {
      github: safeUrl(d?.githubUrl),
      instagram: safeUrl(d?.instagramUrl),
      etc: safeUrl(d?.etcUrl),
    },
    // 목록에서 넘어온 값 보강에 대비해 필드는 유지
    isAlumni: Boolean(d?.isAlumni),
    isOfficial: Boolean(d?.isOfficial),
    gallery: [],
  };
}
