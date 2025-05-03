// src/lib/api-client.ts

import Axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '@/lib/supabase';
import { logger } from './logger';

// // Determine the API URL dynamically
// const getApiUrl = (): string => {
//   // Server-side: Use NEXT_SERVER_API_URL if defined, otherwise default to localhost
//   if (typeof window === 'undefined') {
//     return process.env.NEXT_SERVER_API_URL || 'http://localhost:3000';
//   }

//   // Client-side: Use the current host (dynamic) or NEXT_PUBLIC_API_URL
//   const currentHost = window.location.origin;
//   return process.env.NEXT_PUBLIC_API_URL || currentHost;
// };

// Determine the API URL dynamically
const getApiUrl = (): string => {
  // Client-side: Use the current host
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: Use Vercel's VERCEL_URL or fallback to localhost
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  // Local development fallback
  return process.env.NEXT_SERVER_API_URL || 'http://localhost:3000';
};

const apiUrl = getApiUrl();

if (!apiUrl) throw new Error('API URL is not defined');

export const apiClient = Axios.create({
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Ensure cookies are sent
});

// apiClient.interceptors.request.use(
//   async (config: InternalAxiosRequestConfig) => {
//     if (typeof window !== 'undefined') {
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();
//       if (error) {
//         console.error('Failed to get session:', error.message);
//       } else if (session?.access_token) {
//         config.headers.set('Authorization', `Bearer ${session.access_token}`);
//         console.log('Token added to request:', session.access_token);
//       } else {
//         console.warn('No session token available');
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && supabase) {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        logger.error('Failed to get session:', error.message);
      } else if (session?.access_token) {
        config.headers.set('Authorization', `Bearer ${session.access_token}`);
        logger.debug('Token added to request:', session.access_token);
      } else {
        logger.warn('No session token available');
      }
    } else if (!supabase) {
      logger.warn('Supabase client not initialized, skipping session check');
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      console.error('Unauthorized request, redirecting to login');
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        const encodedRedirect = encodeURIComponent(currentPath || '/dashboard');
        window.location.href = `/login?next=${encodedRedirect}`;
      }
    }
    return Promise.reject(error);
  },
);
//Path: src/lib/api-client.ts
