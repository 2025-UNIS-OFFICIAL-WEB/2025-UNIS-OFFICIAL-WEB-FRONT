import axios from "axios"

export interface LoginRequest {
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post(
    "https://admin-unis.com/admin/user/login",
    credentials,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  console.log('로그인 응답:', response.data)
  return response.data.data
}

// 리프레시 토큰 요청은 별도 axios 인스턴스 사용 (인터셉터 무한루프 방지)
export const refreshAccessToken = async (refreshToken: string) => {
  const response = await axios.post(
    'https://admin-unis.com/admin/user/refresh',
    { refreshToken }, // body에 refreshToken 포함
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`, // 헤더에도 포함
      },
    }
  )

  return response.data.data // { accessToken, refreshToken }
}