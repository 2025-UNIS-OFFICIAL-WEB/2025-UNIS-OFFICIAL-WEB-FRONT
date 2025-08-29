import axiosInstance from './axiosInstance';

// ===== 타입 정의 ===== //
interface LoginRequest {
  password: string;
}
// 로그인 또는 토큰 재발급 성공 시 응답 Body
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ===== API 함수 ===== //
export const login = async (credentials: LoginRequest): Promise<TokenResponse> => {
  try {
    const response = await axiosInstance.post<{ data: TokenResponse }>(
      '/admin/user/login',
      credentials
    );
    return response.data.data;
  } catch (error) {
    console.error('Login API request failed:', error);
    // 에러를 호출한 쪽(Login.tsx)으로 다시 던져서 처리
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string): Promise<TokenResponse> => {
  try {
    const response = await axiosInstance.post<{ data: TokenResponse }>(
      '/admin/user/refresh',
      {},
      {
        headers: {
          // 재발급 요청 시에는 헤더에 리프레시 토큰을 담아 보냄.
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data.data;
  } catch (error)
    {
    console.error('Token refresh API request failed:', error);
    throw error;
  }
};

