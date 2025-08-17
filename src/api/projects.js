// src/api/projects.js
const ENV_BASE = import.meta?.env?.VITE_API_BASE_URL || ""; // 배포: https://api-unis.com, 로컬 프록시: ""
const BASE_PATH = "/api"; // 백엔드 프리픽스 맞추기 (/api 또는 /api/v1 등)
const PLACEHOLDER = "/placeholder-project.png";

function joinURL(base, path) {
  if (!base) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function fetchJSON(path, { timeout = 12000, ...opts } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  const url = ENV_BASE ? joinURL(ENV_BASE, path) : path;

  try {
    const res = await fetch(url, {
      credentials: "include",
      headers: { Accept: "application/json", ...(opts.headers || {}) },
      signal: controller.signal,
      ...opts,
    });
    const txt = await res.text();
    const json = txt ? JSON.parse(txt) : {};
    if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
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
function djb2(str) { // projectId 없을 때 안정 키
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return Math.abs(h);
}

/** 목록: GET /api/projects
 * data: [{ projectId, imageUrl, serviceName, shortDescription, isAlumni, isOfficial }]
 */
export async function fetchProjects() {
  const json = await fetchJSON(`${BASE_PATH}/projects`);
  const arr = Array.isArray(json?.data) ? json.data : [];

  return arr.map((d) => ({
    id: d?.projectId,                                   // 목록은 id 존재
    title: s(d?.serviceName),
    gen: undefined,                                     // 목록 스펙엔 generation 없음
    intro: s(d?.shortDescription),
    thumbnail: s(d?.imageUrl) || PLACEHOLDER,
    isAlumni: Boolean(d?.isAlumni),
    isOfficial: Boolean(d?.isOfficial),
  }));
}

/** 상세: GET /api/projects/:id
 * data: { imageUrl, serviceName, shortDescription, description, githubUrl, instagramUrl, etcUrl, generation }
 * ⚠ 문서 예시가 배열로 되어 있어 배열/객체 모두 대응
 */
export async function fetchProjectDetail(id) {
  const json = await fetchJSON(`${BASE_PATH}/projects/${id}`);
  const payload = json?.data;

  // 배열로 오면 첫 번째 요소 사용, 객체면 그대로
  const d = Array.isArray(payload) ? (payload[0] || {}) : (payload || {});

  const title = s(d?.serviceName);
  const gen = Number.isFinite(d?.generation) ? d.generation : undefined;

  return {
    // 상세 스펙엔 projectId가 없으므로 목록 id를 그대로 쓰거나, 대체 키를 생성
    id: id ?? djb2(`${title}#${gen ?? "na"}`),
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
    // 목록 스펙의 배지 값이 상세엔 없으므로 기본 false
    isAlumni: false,
    isOfficial: false,
    gallery: [], // 스펙에 없으므로 기본값
  };
}
