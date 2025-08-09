import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/token'

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

export const setupAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // 응답 인터셉터 - accessToken 만료 시 refresh 시도
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // 조건: 토큰 만료 메시지 && 중복 재시도 방지 && refreshToken 존재
      const isExpired = error?.response?.data?.message === 'JWT Token Expired'

      if (isExpired && !originalRequest._retry && getRefreshToken()) {
        originalRequest._retry = true

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return instance(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        isRefreshing = true

        try {
          // refresh 요청
          const refreshToken = getRefreshToken()
          const res = await axios(originalRequest.url, {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Refresh: `Bearer ${refreshToken}`,
            },
          })

          const newAccessToken = res.headers['authorization']
          const newRefreshToken = res.headers['refresh']

          if (!newAccessToken || !newRefreshToken) {
            throw new Error('토큰 재발급 실패: 서버가 새 토큰을 반환하지 않음')
          }

          setTokens(newAccessToken, newRefreshToken)
          processQueue(null, newAccessToken)

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return instance(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          clearTokens()
          window.location.href = '/'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    }
  )
}
