import { apiService, ApiResponse } from './api';

export interface NotificationMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  status: 'read' | 'unread';
  createdAt: string;
  readAt?: string;
  userId: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  todayCount: number;
}

export const notificationAPI = {
  // Get unread messages for a user
  async getUnreadMessages(userId: string): Promise<NotificationMessage[]> {
    return apiService.get(`/v1/notifications/users/${userId}/unread`);
  },

  // Get notification statistics
  async getMessageStatistics(userId: string): Promise<NotificationStats> {
    return apiService.get(`/v1/notifications/users/${userId}/stats`);
  },

  // Mark message as read
  async markAsRead(messageId: string, userId: string): Promise<string> {
    return apiService.put(`/v1/notifications/${messageId}/read`, { userId });
  },

  // Mark all messages as read
  async markAllAsRead(userId: string): Promise<string> {
    return apiService.put(`/v1/notifications/users/${userId}/read-all`);
  }
};