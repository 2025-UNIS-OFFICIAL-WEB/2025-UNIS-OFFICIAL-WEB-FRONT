import axiosInstance from '@/api/axiosInstance';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 디버그 전용 인터셉터
 * - 요청과 응답의 헤더/데이터를 모두 console.log로 출력합니다.
 */
export function setupDebugInterceptor() {
  // 요청 로깅
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      console.log('[DEBUG Request] URL:', `${config.baseURL ?? ''}${config.url}`);
      console.log('[DEBUG Request] Method:', config.method);
      console.log('[DEBUG Request] Headers:', config.headers);
      console.log('[DEBUG Request] Data:', config.data instanceof FormData ? Array.from(config.data.entries()) : config.data);
      return config;
    },
    (error) => {
      console.error('[DEBUG Request Error]', error);
      return Promise.reject(error);
    }
  );

  // 응답 로깅
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log('[DEBUG Response] URL:', `${response.config.baseURL ?? ''}${response.config.url}`);
      console.log('[DEBUG Response] Status:', response.status);
      console.log('[DEBUG Response] Headers:', response.headers);
      return response;
    },
    (error) => {
      const resp = error.response;
      console.error('[DEBUG Response Error]');
      if (resp) {
        console.error('  URL:', `${resp.config.baseURL ?? ''}${resp.config.url}`);
        console.error('  Status:', resp.status);
        console.error('  Response Headers:', resp.headers);
        console.error('  Response Data:', resp.data);
        console.error('  WWW-Authenticate:', resp.headers['www-authenticate']);
      } else {
        console.error('  No response received:', error);
      }
      return Promise.reject(error);
    }
  );
}

export default setupDebugInterceptor;