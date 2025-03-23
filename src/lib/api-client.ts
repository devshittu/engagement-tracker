// src/lib/api-client.ts
import Axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '@/lib/supabase';

const apiUrl =
  typeof window === 'undefined'
    ? process.env.NEXT_SERVER_API_URL || 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

if (!apiUrl) {
  throw new Error('API URL is not defined');
}

export const apiClient = Axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Failed to get session:', error.message);
      } else if (session?.access_token) {
        config.headers.set('Authorization', `Bearer ${session.access_token}`);
        console.log('Token added to request:', session.access_token);
      } else {
        console.warn('No session token available');
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error) => {
    const status = error.response?.status;
    if (status === 401) {
      console.error('Unauthorized request, redirecting to login');
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        const encodedRedirect = encodeURIComponent(currentPath);
        window.location.href = `/login?next=${encodedRedirect}`;
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);
//Path: src/lib/api-client.ts
