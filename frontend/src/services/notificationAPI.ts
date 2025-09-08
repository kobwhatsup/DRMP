import { ApiResponse } from './api';

export interface NotificationMessage {
  id: number;
  type: string;
  title: string;
  content: string;
  recipientId: number;
  priority: string;
  status: string;
  channel: string;
  createdAt: string;
  sentAt?: string;
  readAt?: string;
  category: string;
  businessId?: string;
  businessType?: string;
  extraData?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export interface CreateNotificationFromTemplateRequest {
  templateCode: string;
  recipientId: number;
  channel: string;
  variables: Record<string, any>;
}

class NotificationAPI {
  private baseUrl = '/v1/notifications';

  /**
   * 发送通知消息
   */
  async sendNotification(message: Partial<NotificationMessage>): Promise<ApiResponse<string>> {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    return response.json();
  }

  /**
   * 获取用户未读消息
   */
  async getUnreadMessages(userId: number): Promise<ApiResponse<NotificationMessage[]>> {
    const response = await fetch(`${this.baseUrl}/unread/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(messageId: number, userId: number): Promise<ApiResponse<string>> {
    const response = await fetch(`${this.baseUrl}/mark-read/${messageId}?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }

  /**
   * 获取消息统计
   */
  async getMessageStatistics(userId: number): Promise<ApiResponse<NotificationStats>> {
    const response = await fetch(`${this.baseUrl}/statistics/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }

  /**
   * 使用模板创建通知
   */
  async createFromTemplate(request: CreateNotificationFromTemplateRequest): Promise<ApiResponse<string>> {
    const response = await fetch(`${this.baseUrl}/create-from-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.variables),
      // 将其他参数作为查询参数
    });

    // 构建查询参数
    const params = new URLSearchParams({
      templateCode: request.templateCode,
      recipientId: request.recipientId.toString(),
      channel: request.channel,
    });

    const finalResponse = await fetch(`${this.baseUrl}/create-from-template?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.variables),
    });

    return finalResponse.json();
  }

  /**
   * 批量标记消息为已读
   */
  async batchMarkAsRead(messageIds: number[], userId: number): Promise<ApiResponse<string>> {
    const promises = messageIds.map(id => this.markAsRead(id, userId));
    await Promise.all(promises);
    
    return {
      success: true,
      code: 200,
      message: '批量标记成功',
      data: '',
      timestamp: Date.now()
    };
  }

  /**
   * 删除消息
   */
  async deleteMessage(messageId: number, userId: number): Promise<ApiResponse<string>> {
    // 这里可以实现软删除逻辑
    // 目前暂时使用标记已读来模拟
    return this.markAsRead(messageId, userId);
  }
}

export const notificationAPI = new NotificationAPI();