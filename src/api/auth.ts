import axios from 'axios'

export interface LoginRequest {
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post(
    'https://admin-unis.com/admin/user/login',
    credentials,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
  console.log('로그인 응답:', response.data)
  return response.data.data
}

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await axios.post(
    'https://admin-unis.com/admin/user/refresh',
    undefined,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  )
  return response.data.data // { accessToken, refreshToken }
}
