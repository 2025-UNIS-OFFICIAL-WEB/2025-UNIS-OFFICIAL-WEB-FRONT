// src/api/auth.ts
import axios from 'axios'

export interface LoginRequest {
  password: string
}
export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

const API = 'https://admin-unis.com'

/** 헬퍼: 응답에서 토큰을 헤더/바디 모두 시도해 추출 */
function extractTokens(res: any): LoginResponse {
  const hAuth: string | undefined =
    res.headers?.authorization ?? res.headers?.Authorization
  const hRefresh: string | undefined =
    res.headers?.refresh ?? res.headers?.Refresh

  // 헤더에 Bearer 토큰이 오면 Bearer 제거
  const headerAccess =
    hAuth?.replace(/^Bearer\s+/i, '').trim() || undefined
  const headerRefresh =
    hRefresh?.replace(/^Bearer\s+/i, '').trim() || undefined

  const bodyAccess = res.data?.data?.accessToken ?? res.data?.accessToken
  const bodyRefresh = res.data?.data?.refreshToken ?? res.data?.refreshToken

  const accessToken = headerAccess || bodyAccess
  const refreshToken = headerRefresh || bodyRefresh

  if (!accessToken || !refreshToken) {
    // 디버깅에 도움
    // console.error('No tokens in response', { headers: res.headers, body: res.data })
    throw new Error('토큰이 응답에 없습니다.')
  }

  return { accessToken, refreshToken }
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const res = await axios.post(`${API}/admin/user/login`, credentials, {
    headers: { 'Content-Type': 'application/json' }
  })
  return extractTokens(res)
}

export const refreshAccessToken = async (refreshToken: string): Promise<LoginResponse> => {
  const res = await axios.post(`${API}/admin/user/refresh`, undefined, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    }
  })
  return extractTokens(res)
}
