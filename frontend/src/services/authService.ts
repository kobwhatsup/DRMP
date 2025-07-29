import apiService from './api';
import { UserInfo } from '@/store/authStore';

export interface LoginRequest {
  username: string;
  password: string;
  captcha?: string;
  captchaKey?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: UserInfo;
}

class AuthService {
  /**
   * User login
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/v1/auth/login', request);
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    return apiService.post('/v1/auth/refresh', { refreshToken });
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    return apiService.post('/v1/auth/logout');
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserInfo> {
    return apiService.get('/v1/auth/me');
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return apiService.post('/v1/auth/change-password', {
      oldPassword,
      newPassword,
    });
  }
}

export const authService = new AuthService();
export default authService;