import axiosInstance from '@/api/axiosInstance'
import { refreshAccessToken } from '@/api/auth'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

interface FailedQueueItem {
  resolve: (token: string) => void
  reject: (error: any) => void
}

let isInterceptorInitialized = false
let isRefreshing = false
let failedQueue: FailedQueueItem[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else if (token) resolve(token)
  })
  failedQueue = []
}

export const setupAuthInterceptor = () => {
  if (isInterceptorInitialized) {
    console.warn('useAuthInterceptor: 이미 초기화되었습니다. 중복 등록 방지됨.')
    return
  }
  isInterceptorInitialized = true

  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('accessToken')
      config.headers = config.headers || {}

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }

      if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
        console.log('[REQUEST] FormData detected, removed Content-Type header')
      }

      console.log('[REQUEST] Adding token to request:', {
        url: config.url,
        method: config.method,
        token: token ?? 'none'
      })

      return config
    },
    (error) => Promise.reject(error)
  )

  // ✅ Response Interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/admin/user/login') &&
        !originalRequest.url?.includes('/admin/user/refresh')
      ) {
        originalRequest._retry = true

        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then((token) => {
            const retryConfig = {
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`
              }
            }

            if (retryConfig.data instanceof FormData) {
              delete retryConfig.headers['Content-Type']
              console.log('[AUTH] Queue retry - FormData detected, removed Content-Type')
            }

            return axiosInstance(retryConfig)
          })
        }

        isRefreshing = true
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          localStorage.clear()
          window.location.href = '/'
          return Promise.reject(error)
        }

        try {
          const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken)

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          processQueue(null, accessToken)

          const retryConfig = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${accessToken}`
            },
            _retry: false
          }

          if (retryConfig.data instanceof FormData) {
            delete retryConfig.headers['Content-Type']
            console.log('[AUTH] Original retry - FormData detected, removed Content-Type')
          }

          return axiosInstance(retryConfig)
        } catch (refreshError) {
          processQueue(refreshError, null)
          localStorage.clear()
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
