import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import axiosInstance from '@/api/axiosInstance'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/token'
import { refreshAccessToken } from '@/api/auth'

let isRefreshing = false
let queue: {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}[] = []

const pushQueue = (resolve: (t: string) => void, reject: (e: unknown) => void) => {
  queue.push({ resolve, reject })
}

const flushQueue = (error: unknown, token?: string) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else if (token) resolve(token)
  })
  queue = []
}

export const setupAuthInterceptor = (instance: AxiosInstance = axiosInstance) => {
  // 요청: 액세스 토큰 붙이기
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
      // 디버깅 로그가 필요하면 주석 해제
      // console.log('🔑 [REQUEST] Adding token:', token.slice(0, 12), '…', config.url)
    }
    return config
  })

  // 응답: 401 처리(리프레시 → 원요청 재시도)
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
      const status = error.response?.status

      // 원요청이 없거나 401이 아니면 통과
      if (!original || status !== 401) throw error

      // 리프레시 엔드포인트 자체의 401이면 바로 로그아웃
      if (original.url?.includes('/admin/user/refresh')) {
        clearTokens()
        throw error
      }

      // 이미 한 번 재시도했다면 더 이상 반복 금지
      if (original._retry) {
        clearTokens()
        throw error
      }

      // 동시 401 방지: 큐에 적재
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

      // 리프레시 시도
      original._retry = true
      isRefreshing = true
      try {
        const rtk = getRefreshToken()
        if (!rtk) {
          clearTokens()
          throw error
        }

        // refresh는 전역 인스턴스(인터셉터 미적용 axios)로 호출
        const { accessToken, refreshToken } = await refreshAccessToken(rtk)
        setTokens(accessToken, refreshToken)

        // 큐 비우기
        flushQueue(null, accessToken)

        // 원요청 재시도
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
