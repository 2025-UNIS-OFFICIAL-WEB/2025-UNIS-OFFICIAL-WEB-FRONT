// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "https://api-unis.com",
        changeOrigin: true,
        secure: false,
        // ★ 백엔드가 /v1/* 이라면 주석 해제
        // rewrite: (path) => path.replace(/^\/api/, "/v1"),
        // ★ 백엔드가 /api/* 그대로면 rewrite 불필요
      },
    },
  },
});
