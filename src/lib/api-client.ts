import Axios, { AxiosResponse } from 'axios';
// import { useRouter } from 'next/navigation';

// Use the correct url depending on if it's server or public

const apiUrl =
  typeof window === 'undefined'
    ? process.env.NEXT_SERVER_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

// Ensure that apiUrl is available
if (!apiUrl) {
  throw new Error('API URL is not defined');
}

export const apiClient = Axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  requiresAuth: false,

  // Add withCredentials here if you want it to be the default for all requests
  // withCredentials: true,
});

apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor (if needed)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const errorCode = error.response?.data?.error?.code;
    // const router = useRouter();

    // Handle specific error code 'token_not_provided'
    if (errorCode === errorCode.TokenNotProvided) {
      // If the error is not from the refresh token or logout endpoints
      console.log('when code is:', errorCode, error.response); // Check for specific token errors and sign out

      // router.push('/auth/signin');
    }
    // Handle response errors here
    return Promise.reject(error);
  },
);

//Path: src/lib/api-client.ts
