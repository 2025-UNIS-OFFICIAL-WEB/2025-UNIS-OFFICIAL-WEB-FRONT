import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://api-unis.com",  // 외부 API
        changeOrigin: true,
        secure: false,
      },
    },
  },
});