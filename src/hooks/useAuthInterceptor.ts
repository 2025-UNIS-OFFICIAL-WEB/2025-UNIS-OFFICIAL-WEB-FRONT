import { useEffect } from 'react';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import axiosInstance from '@/api/axiosInstance';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/token';
import { refreshAccessToken } from '@/api/auth';

// --- 전역 변수: 컴포넌트 리렌더링과 관계없이 인터셉터의 상태를 공유해야 하므로 모듈 스코프에 선언합니다. --- //

// 토큰 갱신 중 실패한 요청들의 콜백 함수를 저장하는 큐
let subscribers: ((token: string) => void)[] = [];

// 토큰 갱신 중인지 여부를 나타내는 플래그
let isRefreshing = false;

// 큐에 쌓인 모든 구독자(콜백)들에게 새로운 토큰을 전달하여 실행시키는 함수
const onRefreshed = (token: string) => {
  subscribers.forEach((callback) => callback(token));
  subscribers = []; // 실행 후 큐 비우기
};

// 토큰 갱신을 기다리는 요청의 콜백을 큐에 추가하는 함수
const addSubscriber = (callback: (token: string) => void) => {
  subscribers.push(callback);
};

//Axios 인스턴스에 인증 인터셉터를 설정하는 React Hook

const useAuthInterceptor = (instance: AxiosInstance = axiosInstance) => {
  useEffect(() => {
    // 1. 요청 인터셉터: 모든 요청 헤더에 액세스 토큰 추가
    const requestInterceptor = instance.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 2. 응답 인터셉터: 401 에러 발생 시 토큰 재발급 및 요청 재시도 처리
    const responseInterceptor = instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || !originalRequest) {
          return Promise.reject(error);
        }

        // 토큰 갱신 요청 자체가 실패한 경우 (무한 루프 방지)
        if (originalRequest.url?.includes('/admin/user/refresh')) {
          console.error('Refresh token is invalid or expired. Redirecting to login.');
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // 이미 다른 요청에 의해 토큰 갱신이 진행 중인 경우
        if (isRefreshing) {
          return new Promise((resolve) => {
            // 현재 요청을 큐에 추가. 토큰이 갱신되면 실행될 것임.
            addSubscriber((token: string) => {
              originalRequest.headers!.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available.');
          }

          const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);
          setTokens(accessToken, newRefreshToken);

          // axios 인스턴스의 기본 헤더를 새 토큰으로 업데이트
          instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // 큐에 대기 중이던 모든 요청들을 새 토큰으로 실행
          onRefreshed(accessToken);

          // 현재 실패했던 원래 요청도 새 토큰으로 재시도
          originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);

        } catch (e) {
          console.error('Failed to refresh token. Redirecting to login.', e);
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }
    );

    // 컴포넌트 언마운트 시 인터셉터 정리 (메모리 누수 방지)
    return () => {
      instance.interceptors.request.eject(requestInterceptor);
      instance.interceptors.response.eject(responseInterceptor);
    };
  }, [instance]); // instance가 변경될 경우 인터셉터를 다시 설정
};

export default useAuthInterceptor;

