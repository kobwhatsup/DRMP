import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '@/store/authStore';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false; // 防止并发刷新
  private refreshAttempts = 0; // 刷新尝试次数
  private readonly MAX_REFRESH_ATTEMPTS = 1; // 最多尝试1次

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.startTokenRefreshTimer(); // 启动主动刷新定时器
  }

  /**
   * 启动Token主动刷新定时器
   * 每分钟检查一次，如果Token即将在5分钟内过期，则自动刷新
   */
  private startTokenRefreshTimer() {
    setInterval(() => {
      const { accessToken, refreshToken, login, user } = useAuthStore.getState();

      if (!accessToken || !refreshToken || !user) {
        return;
      }

      try {
        // 解析JWT Token获取过期时间
        const tokenPayload = this.parseJwt(accessToken);
        if (!tokenPayload || !tokenPayload.exp) {
          return;
        }

        const expirationTime = tokenPayload.exp * 1000; // 转换为毫秒
        const now = Date.now();
        const timeUntilExpiry = expirationTime - now;

        // 如果Token将在5分钟内过期，主动刷新
        if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
          console.log('🔄 Token即将过期，主动刷新...');
          this.refreshTokenSafely();
        }
      } catch (error) {
        console.error('Token过期检查失败:', error);
      }
    }, 60 * 1000); // 每分钟检查一次
  }

  /**
   * 解析JWT Token
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  /**
   * 安全地刷新Token（带防并发和重试限制）
   */
  private async refreshTokenSafely(): Promise<boolean> {
    // 防止并发刷新
    if (this.isRefreshing) {
      console.log('⏳ Token刷新进行中，跳过...');
      return false;
    }

    // 检查刷新次数
    if (this.refreshAttempts >= this.MAX_REFRESH_ATTEMPTS) {
      console.error('❌ Token刷新失败次数过多，强制登出');
      this.forceLogout();
      return false;
    }

    this.isRefreshing = true;
    this.refreshAttempts++;

    try {
      const { refreshToken, login, user } = useAuthStore.getState();

      if (!refreshToken || !user) {
        throw new Error('缺少刷新Token或用户信息');
      }

      const response = await axios.post<ApiResponse<{
        accessToken: string;
        refreshToken: string;
      }>>('/api/v1/auth/refresh', { refreshToken });

      if (response.data.code === 200 && response.data.data) {
        login(
          response.data.data.accessToken,
          response.data.data.refreshToken,
          user
        );
        this.refreshAttempts = 0; // 重置尝试次数
        console.log('✅ Token刷新成功');
        return true;
      } else {
        throw new Error('Token刷新响应无效');
      }
    } catch (error) {
      console.error('❌ Token刷新失败:', error);

      if (this.refreshAttempts >= this.MAX_REFRESH_ATTEMPTS) {
        this.forceLogout();
      }

      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 强制登出
   */
  private forceLogout() {
    const { logout } = useAuthStore.getState();
    logout();
    window.location.href = '/login';
    message.error('登录已过期，请重新登录');
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
          // 尝试刷新Token（仅尝试一次）
          const refreshed = await this.refreshTokenSafely();

          if (refreshed && error.config) {
            // 刷新成功，重试原始请求
            const { accessToken } = useAuthStore.getState();
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return this.api.request(error.config);
          } else {
            // 刷新失败或无配置，不再重试
            // forceLogout已在refreshTokenSafely中调用
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

// Export notification API
export { notificationAPI } from './notificationAPI';

export default apiService;
