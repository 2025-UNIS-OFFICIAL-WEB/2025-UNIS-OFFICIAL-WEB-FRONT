// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ✅ 오직 /api 로 시작하는 요청만 백엔드로 보낸다
      '/api': {
        target: 'https://api-unis.com',
        changeOrigin: true,
        secure: true,
        // 백엔드 실제 경로가 /projects 이므로 /api 접두사만 제거
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // ❌ 절대 추가하지 마세요: '/' 또는 '/projects' 프록시
    },
  },
})
