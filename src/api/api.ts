import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { API_CONFIG } from "../constants/apiURL";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@access_token",
  REFRESH_TOKEN: "@refresh_token",
  USER: "@user",
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_CONFIG.TIMEOUT,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = safeStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const headers = AxiosHeaders.from(config.headers);
      const hasAuthorizationHeader = Boolean(headers.get("Authorization"));

      // Keep explicit Authorization from caller (e.g. profile-scoped token requests).
      if (token && !hasAuthorizationHeader) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      config.headers = headers;
    } catch (error) {
      // Storage error, continue without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = safeStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (refreshToken) {
          // Remove trailing slash from BASE_URL if exists to avoid double slashes
          const baseUrl = API_CONFIG.BASE_URL?.replace(/\/+$/, "") || "";
          const response = await axios.post(
            `${baseUrl}/auth/refresh`,
            { refreshToken },
            { timeout: API_CONFIG.TIMEOUT }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          safeStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          if (newRefreshToken) {
            safeStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }

          const retryHeaders = AxiosHeaders.from(originalRequest.headers);
          retryHeaders.set("Authorization", `Bearer ${accessToken}`);
          originalRequest.headers = retryHeaders;

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        safeStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        safeStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        safeStorage.removeItem(STORAGE_KEYS.USER);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

class ApiClient {
  private client: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.client = axiosInstance;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const api = new ApiClient(apiClient);

export { apiClient };
