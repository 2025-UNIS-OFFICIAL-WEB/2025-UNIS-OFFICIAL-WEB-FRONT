import axiosInstance from '@/api/axiosInstance'
import { refreshAccessToken } from '@/api/auth'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (error?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

export const setupAuthInterceptor = () => {
  // Request interceptor - 모든 요청에 토큰 추가
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken')
      console.log('🔑 [REQUEST] Adding token to request:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
      })
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // FormData일 때는 Content-Type을 완전히 제거해서 브라우저가 자동 설정하게 함
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
        console.log('📋 [REQUEST] FormData detected, removed Content-Type header')
      }
      
      return config
    },
    (error) => {
      console.error('❌ [REQUEST] Request interceptor error:', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor - 401 에러 시 토큰 갱신
  axiosInstance.interceptors.response.use(
    (response) => {
      console.log('✅ [RESPONSE] Request successful:', {
        url: response.config.url,
        status: response.status
      })
      return response
    },
    async (error) => {
      const originalRequest = error.config
      
      console.log('🔍 [RESPONSE] Response error:', {
        status: error.response?.status,
        url: originalRequest?.url,
        method: originalRequest?.method,
        hasRetried: !!originalRequest?._retry,
        isRefreshing,
        errorMessage: error.response?.data?.message
      })

      // 401 에러이고 아직 재시도하지 않은 경우만 처리
      if (error.response?.status === 401 && 
          !originalRequest._retry && 
          originalRequest.url !== '/admin/user/login' && 
          originalRequest.url !== '/admin/user/refresh') {
        
        console.log('🔄 [AUTH] Starting token refresh process...')
        
        // 이미 토큰 갱신 중이면 큐에 추가
        if (isRefreshing) {
          console.log('⏳ [AUTH] Token refresh in progress, adding to queue...')
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            console.log('🎯 [AUTH] Queue resolved, retrying request with new token')
            
            // ✅ 새로운 config 객체 생성 (기존 객체 변경 방지)
            const retryConfig = { 
              ...originalRequest,
              headers: { ...originalRequest.headers }
            }
            retryConfig.headers.Authorization = `Bearer ${token}`
            
            if (retryConfig.data instanceof FormData) {
              delete retryConfig.headers['Content-Type']
              console.log('📋 [AUTH] Queue retry - FormData detected, removed Content-Type')
            }
            
            return axiosInstance(retryConfig)
          }).catch(err => {
            console.error('❌ [AUTH] Queue rejected:', err)
            return Promise.reject(err)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        const refreshToken = localStorage.getItem('refreshToken')
        console.log('🔑 [AUTH] Refresh token check:', {
          hasRefreshToken: !!refreshToken,
          refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'none'
        })

        if (!refreshToken) {
          console.log('❌ [AUTH] No refresh token, clearing storage and redirecting')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          processQueue(new Error('인증이 필요합니다.'), null)
          isRefreshing = false
          window.location.href = '/'
          return Promise.reject(new Error('인증이 필요합니다.'))
        }

        try {
          console.log('📡 [AUTH] Calling refresh token API...')
          const response = await refreshAccessToken(refreshToken)
          
          // ✅ 응답 검증 강화
          if (!response || !response.accessToken || !response.refreshToken) {
            throw new Error('토큰 갱신 응답이 올바르지 않습니다.')
          }
          
          const { accessToken, refreshToken: newRefreshToken } = response
          
          console.log('✅ [AUTH] Token refresh successful, updating storage:', {
            oldTokenPreview: localStorage.getItem('accessToken')?.substring(0, 20) + '...',
            newTokenPreview: accessToken.substring(0, 20) + '...',
            tokensAreDifferent: localStorage.getItem('accessToken') !== accessToken
          })
          
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          // 대기 중인 요청들 처리
          processQueue(null, accessToken)
          
          // ✅ 원래 요청 재실행 - 완전히 새로운 config 객체 생성
          console.log('🔄 [AUTH] Retrying original request with new token')
          
          const retryConfig = { 
            ...originalRequest,
            headers: { ...originalRequest.headers },
            _retry: false // 재시도 플래그 초기화
          }
          retryConfig.headers.Authorization = `Bearer ${accessToken}`
          
          if (retryConfig.data instanceof FormData) {
            delete retryConfig.headers['Content-Type']
            console.log('📋 [AUTH] Original retry - FormData detected, removed Content-Type')
          }
          
          // ✅ 토큰 저장이 완료된 후 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 100))
          
          return axiosInstance(retryConfig)
        } catch (refreshError: any) {
          console.error('❌ [AUTH] Token refresh failed:', {
            error: refreshError,
            status: refreshError.response?.status,
            message: refreshError.response?.data?.message
          })
          
          processQueue(refreshError, null)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          
          // 더 구체적인 에러 메시지
          const errorMsg = refreshError.response?.status === 401 
            ? '세션이 만료되었습니다. 다시 로그인해주세요.'
            : '인증 갱신에 실패했습니다. 다시 로그인해주세요.'
            
          alert(errorMsg)
          window.location.href = '/'
          return Promise.reject(new Error('인증이 필요합니다.'))
        } finally {
          isRefreshing = false
          console.log('🏁 [AUTH] Token refresh process completed')
        }
      }

      // 다른 에러들은 그대로 전달
      console.log('⚠️ [AUTH] Non-401 error or already retried, passing through:', {
        status: error.response?.status,
        hasRetried: !!originalRequest?._retry,
        message: error.response?.data?.message
      })
      return Promise.reject(error)
    }
  )
}
