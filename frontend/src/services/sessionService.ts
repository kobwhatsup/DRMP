import apiService from './api';

export interface UserSession {
  sessionId: string;
  userId: number;
  username: string;
  clientIp: string;
  userAgent: string;
  createdAt: string;
  lastActivity: string;
  isCurrent?: boolean;
}

class SessionService {
  /**
   * 获取当前用户的所有活跃会话
   */
  async getActiveSessions(): Promise<UserSession[]> {
    return apiService.get<UserSession[]>('/v1/auth/sessions');
  }

  /**
   * 登出所有会话（除当前会话）
   */
  async logoutAllSessions(): Promise<void> {
    return apiService.post('/v1/auth/logout-all');
  }

  /**
   * 登出指定会话
   */
  async logoutSession(sessionId: string): Promise<void> {
    return apiService.post(`/v1/auth/logout-session/${sessionId}`);
  }
}

export const sessionService = new SessionService();
export default sessionService;
