// src/lib/axios-extensions.d.ts
import { AxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    requiresAuth?: boolean;
  }
}
// src/lib/axios-extensions.d.ts
