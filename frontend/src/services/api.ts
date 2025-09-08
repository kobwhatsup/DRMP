import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '@/store/authStore';

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      async (error: AxiosError<ApiResponse>) => {
        const { response } = error;

        if (response?.status === 401) {
          // Try to refresh token
          const { refreshToken, logout } = useAuthStore.getState();
          if (refreshToken) {
            try {
              const refreshResponse = await this.post<{
                accessToken: string;
                refreshToken: string;
              }>('/v1/auth/refresh', { refreshToken });

              // Update tokens
              const { login, user } = useAuthStore.getState();
              if (user) {
                login(
                  refreshResponse.accessToken,
                  refreshResponse.refreshToken,
                  user
                );
              }

              // Retry original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;
                return this.api.request(error.config);
              }
            } catch (refreshError) {
              logout();
              window.location.href = '/login';
              message.error('登录已过期，请重新登录');
            }
          } else {
            logout();
            window.location.href = '/login';
            message.error('未授权访问，请重新登录');
          }
        } else if (response?.status === 403) {
          message.error('权限不足，无法访问该资源');
        } else if (response?.status && response.status >= 500) {
          message.error('服务器错误，请稍后重试');
        } else if (response?.data?.message) {
          message.error(response.data.message);
        } else {
          message.error('请求失败，请检查网络连接');
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async delete<T = any>(url: string): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(url);
    return response.data.data;
  }

  async upload<T = any>(url: string, formData: FormData): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Raw axios instance for special cases
  getRawApi(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();

// Performance API
export const performanceAPI = {
  getDashboardData: (params: any) => apiService.get('/v1/performance/dashboard', params),
  exportPerformanceReport: (params: any) => apiService.post('/v1/performance/export', params),
};

// Export notification API (temporarily disabled)
// export { notificationAPI };

export default apiService;