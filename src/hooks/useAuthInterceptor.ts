import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import axiosInstance from '@/api/axiosInstance'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/token'
import { refreshAccessToken } from '@/api/auth'

let isRefreshing = false
let queue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

const pushQueue = (resolve: (t: string) => void, reject: (e: unknown) => void) => {
  queue.push({ resolve, reject })
}
const flushQueue = (error: unknown, token?: string) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : token ? resolve(token) : null))
  queue = []
}

export const setupAuthInterceptor = (instance: AxiosInstance = axiosInstance) => {
  // 요청 인터셉터: 토큰 부착
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // 응답 인터셉터: 401 처리
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
      const status = error.response?.status

      if (!original || status !== 401) throw error

      // refresh 호출 자체가 401이면 바로 로그아웃
      if (original.url?.includes('/admin/user/refresh')) {
        clearTokens()
        throw error
      }

      if (original._retry) {
        // 이미 한 번 재시도했는데 또 401 → 토큰 무효. 정리.
        clearTokens()
        throw error
      }

      // 동시 갱신 방지
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pushQueue(
            (newToken) => {
              original.headers = original.headers ?? {}
              original.headers.Authorization = `Bearer ${newToken}`
              resolve(instance(original))
            },
            reject
          )
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const rtk = getRefreshToken()
        if (!rtk) {
          clearTokens()
          throw error
        }

        // ♻️ 토큰 재발급 (헤더/바디 모두 지원)
        const { accessToken, refreshToken } = await refreshAccessToken(rtk)
        setTokens(accessToken, refreshToken)

        flushQueue(null, accessToken)

        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${accessToken}`
        return instance(original)
      } catch (e) {
        flushQueue(e)
        clearTokens()
        throw e
      } finally {
        isRefreshing = false
      }
    }
  )
}
