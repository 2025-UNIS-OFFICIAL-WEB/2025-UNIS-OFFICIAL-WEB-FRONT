// src/api/projects.js

const PROD = import.meta.env.PROD;
const API_BASE = PROD ? "" : (import.meta?.env?.VITE_API_BASE_URL || "");
const API_PATH = PROD ? "/api/proxy" : (import.meta?.env?.VITE_API_BASE_PATH || "/api");
const PLACEHOLDER = "/placeholder-project.png";

function joinURL(base, path) {
  if (!base) return path; // 프록시: "/api/..." 그대로 반환
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
    try { json = text ? JSON.parse(text) : {}; } catch { /* ignore */ }

    if (!res.ok) {
      const msg = json?.message || `HTTP ${res.status} @ ${url}`;
      const err = new Error(msg);
      err.status = res.status;
      err.url = url;
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
  } catch { return ""; }
}
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return Math.abs(h);
}
const is404 = (e) => Number(e?.status) === 404 || String(e?.message || "").includes("HTTP 404");

/** 목록: GET {API_PATH}/projects */
export async function fetchProjects() {
  const json = await fetchJSON(`${API_PATH}/projects`);
  const arr = Array.isArray(json?.data) ? json.data : [];

  return arr.map((d) => ({
    id: d?.projectId,
    title: s(d?.serviceName),
    gen: undefined,
    intro: s(d?.shortDescription),
    thumbnail: s(d?.imageUrl) || PLACEHOLDER,
    isAlumni: Boolean(d?.isAlumni),
    isOfficial: Boolean(d?.isOfficial),
  }));
}

/** 상세: GET {API_PATH}/projects/:id  (404면 ?projectId= 로 폴백) */
export async function fetchProjectDetail(id) {
  const idStr = String(id ?? "").trim();
  if (!/^\d+$/.test(idStr)) {
    throw new Error(`Invalid project id: "${id}"`);
  }

  // 1차: 경로형
  const url1 = `${API_PATH}/projects/${encodeURIComponent(idStr)}`;
  try {
    const json = await fetchJSON(url1);
    return normalizeDetail(json, idStr);
  } catch (e) {
    if (!is404(e)) throw e;
    // 콘솔에 한 번만 힌트 남김
    console.warn(`[detail] 404 on ${url1} → fallback to query`);
  }

  // 2차: 쿼리형 (?projectId=)
  const url2 = `${API_PATH}/projects?projectId=${encodeURIComponent(idStr)}`;
  const json2 = await fetchJSON(url2);
  return normalizeDetail(json2, idStr);
}

function normalizeDetail(json, idStr) {
  const payload = json?.data;
  const d = Array.isArray(payload) ? (payload[0] || {}) : (payload || {});

  const title = s(d?.serviceName);
  const gen = Number.isFinite(d?.generation) ? d.generation : undefined;

  return {
    id: Number.isFinite(+idStr) ? +idStr : djb2(`${title}#${gen ?? "na"}`),
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
    isAlumni: false,
    isOfficial: false,
    gallery: [],
  };
}

// 간단 캐시: 상세를 한 번만 부름
const _detailCache = new Map(); // id -> detail

export async function getProjectDetailCached(id) {
  if (_detailCache.has(id)) return _detailCache.get(id);
  const d = await fetchProjectDetail(id);
  _detailCache.set(id, d);
  return d;
}

export async function enrichProjectsWithGen(list) {
  const targets = list.filter((p) => p?.id != null && p.gen == null);

  const results = await Promise.allSettled(
    targets.map((p) => getProjectDetailCached(p.id))
  );

  const genById = new Map();
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      genById.set(targets[i].id, r.value.gen);
    }
  });

  return list.map((p) => ({
    ...p,
    gen: p.gen ?? genById.get(p.id),
  }));
}
