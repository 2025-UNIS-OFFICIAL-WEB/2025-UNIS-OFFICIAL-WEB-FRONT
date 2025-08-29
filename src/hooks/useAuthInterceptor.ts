import { useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/token';
import { refreshAccessToken } from '@/api/auth';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 토큰 갱신 중 다른 API 요청들을 임시 저장할 큐
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

// 토큰 갱신 중인지 여부를 나타내는 플래그
let isRefreshing = false;

export const useAuthInterceptor = () => {
  useEffect(() => {
    // 1. 요청 인터셉터: 모든 요청 헤더에 액세스 토큰 추가
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) {
          // config.headers가 없을 경우를 대비하여 기본값 할당
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 2. 응답 인터셉터: 401 에러 발생 시 토큰 재발급 및 요청 재시도 처리
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response, // 성공 응답은 그대로 반환
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 401 에러가 아니거나, 재시도 요청이었다면 에러를 그대로 반환
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        // 토큰 갱신 요청 자체가 실패한 경우 (리프레시 토큰 만료 등)
        if (originalRequest.url?.includes('/admin/user/refresh')) {
          console.error('Refresh token is invalid or expired. Logging out.');
          clearTokens();
          // 필요 시 로그인 페이지로 리디렉션
          // window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // 이미 다른 요청에 의해 토큰 갱신이 진행 중인 경우
        if (isRefreshing) {
          // 현재 실패한 요청을 큐에 추가하고, 새로운 Promise를 반환하여 대기
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        }
        
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            // 리프레시 토큰이 없으면 즉시 에러 처리
            throw new Error('No refresh token available.');
          }

          // 새로운 토큰 발급 요청
          const tokens = await refreshAccessToken(refreshToken);
          setTokens(tokens.accessToken, tokens.refreshToken);

          // 새 토큰으로 원래 요청의 헤더를 교체
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;

          // 대기 중이던 모든 요청들을 성공 처리
          failedQueue.forEach(promise => promise.resolve(axiosInstance(originalRequest)));
          failedQueue = [];
          
          // 현재 실패했던 원래 요청을 재시도
          return axiosInstance(originalRequest);

        } catch (e) {
          // 토큰 갱신 실패 시, 대기 중이던 모든 요청들을 에러 처리
          failedQueue.forEach(promise => promise.reject(e));
          failedQueue = [];

          clearTokens();
          console.error('Failed to refresh token, logging out.', e);
          // 필요 시 로그인 페이지로 리디렉션
          // window.location.href = '/login';
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }
    );

    // 컴포넌트 언마운트 시 인터셉터 정리 (메모리 누수 방지)
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때 한 번만 실행되도록 설정
};
