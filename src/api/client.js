import axios from "axios";

// env
const API_BASE  = import.meta.env?.VITE_API_BASE_URL  || "";
const API_PATH  = import.meta.env?.VITE_API_BASE_PATH || "/api";

// 안전한 경로 결합
function joinBase(base, path) {
  if (!base) return path; // 상대경로 사용 (dev proxy or same-origin)
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export const api = axios.create({
  baseURL: joinBase(API_BASE, API_PATH),  // 예) "/api" 또는 "https://www.unis-ewha.com/api/proxy"
  timeout: 10000,
  headers: { Accept: "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const cfg = err?.config;
    console.error("[API ERROR]", {
      url: cfg?.baseURL + (cfg?.url || ""),
      method: cfg?.method,
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message,
    });
    return Promise.reject(err);
  }
);
