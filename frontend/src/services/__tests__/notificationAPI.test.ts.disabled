import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { notificationAPI, NotificationMessage, NotificationStats } from '../notificationAPI';

// Mock fetch
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

describe('notificationAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      const mockMessage: Partial<NotificationMessage> = {
        type: 'CASE_ASSIGNMENT',
        title: '新案件分配',
        content: '您有新的案件包待处理',
        recipientId: 1,
        channel: 'WEBSOCKET',
        priority: 'HIGH',
      };

      const mockResponse = {
        success: true,
        code: 200,
        message: 'success',
        data: '通知发送成功',
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await notificationAPI.sendNotification(mockMessage);

      expect(mockFetch).toHaveBeenCalledWith('/v1/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockMessage),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle network error', async () => {
      const mockMessage: Partial<NotificationMessage> = {
        title: '测试消息',
        content: '测试内容',
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(notificationAPI.sendNotification(mockMessage)).rejects.toThrow('Network error');
    });
  });

  describe('getUnreadMessages', () => {
    it('should fetch unread messages successfully', async () => {
      const userId = 1;
      const mockMessages: NotificationMessage[] = [
        {
          id: 1,
          type: 'CASE_ASSIGNMENT',
          title: '新案件分配',
          content: '您有新的案件包待处理',
          recipientId: userId,
          priority: 'HIGH',
          status: 'SENT',
          channel: 'WEBSOCKET',
          createdAt: '2023-12-01T10:00:00',
          category: 'BUSINESS',
        },
        {
          id: 2,
          type: 'CONTRACT_SIGNED',
          title: '合同签署完成',
          content: '合同已完成签署',
          recipientId: userId,
          priority: 'NORMAL',
          status: 'SENT',
          channel: 'WEBSOCKET',
          createdAt: '2023-12-01T09:00:00',
          category: 'BUSINESS',
        },
      ];

      const mockResponse = {
        success: true,
        code: 200,
        message: 'success',
        data: mockMessages,
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await notificationAPI.getUnreadMessages(userId);

      expect(mockFetch).toHaveBeenCalledWith('/v1/notifications/unread/1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should handle empty response', async () => {
      const userId = 1;
      const mockResponse = {
        success: true,
        code: 200,
        message: 'success',
        data: [],
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await notificationAPI.getUnreadMessages(userId);

      expect(result.data).toHaveLength(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read successfully', async () => {
      const messageId = 1;
      const userId = 1;

      const mockResponse = {
        success: true,
        code: 200,
        message: 'success',
        data: '消息已标记为已读',
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await notificationAPI.markAsRead(messageId, userId);

      expect(mockFetch).toHaveBeenCalledWith('/v1/notifications/mark-read/1?userId=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle message not found', async () => {
      const messageId = 999;
      const userId = 1;

      const mockResponse = {
        success: false,
        code: 400,
        message: '标记失败，消息不存在',
        data: '',
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockResponse,
      } as Response);

      const result = await notificationAPI.markAsRead(messageId, userId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('标记失败，消息不存在');
    });
  });

  describe('getMessageStatistics', () => {
    it('should fetch message statistics successfully', async () => {
      const userId = 1;
      const mockStats: NotificationStats = {
        total: 10,
        unread: 3,
        read: 7,
      };

      const mockResponse = {
        success: true,
        code: 200,
        message: 'success',
        data: mockStats,
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await notificationAPI.getMessageStatistics(userId);

      expect(mockFetch).toHaveBeenCalledWith('/v1/notifications/statistics/1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual(mockResponse);
      expect(result.data.total).toBe(10);
      expect(result.data.unread).toBe(3);
      expect(result.data.read).toBe(7);
    });
  });

  describe('createFromTemplate', () => {
    it('should create notification from template successfully', async () => {
      const request = {
        templateCode: 'CASE_ASSIGNMENT',
        recipientId: 1,
        channel: 'WEBSOCKET',
        variables: {
          packageName: '测试案件包',
          caseCount: 10,
          totalAmount: 100000,
        },
      };

      const mockResponse = {
        success: true,
        code: 200,
        message: 'success',
        data: '通知创建并发送成功',
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await notificationAPI.createFromTemplate(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/v1/notifications/create-from-template?templateCode=CASE_ASSIGNMENT&recipientId=1&channel=WEBSOCKET',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request.variables),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle template not found', async () => {
      const request = {
        templateCode: 'NON_EXISTING_TEMPLATE',
        recipientId: 1,
        channel: 'WEBSOCKET',
        variables: {},
      };

      const mockResponse = {
        success: false,
        code: 400,
        message: '模板不存在或创建失败',
        data: '',
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockResponse,
      } as Response);

      const result = await notificationAPI.createFromTemplate(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('模板不存在或创建失败');
    });
  });

  describe('batchMarkAsRead', () => {
    it('should batch mark messages as read successfully', async () => {
      const messageIds = [1, 2, 3];
      const userId = 1;

      const mockResponse = {
        success: true,
        code: 200,
        message: 'success',
        data: '消息已标记为已读',
        timestamp: Date.now(),
      };

      // Mock successful responses for each markAsRead call
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await notificationAPI.batchMarkAsRead(messageIds, userId);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
      expect(result.message).toBe('批量标记成功');
    });

    it('should handle partial failures in batch operation', async () => {
      const messageIds = [1, 2];
      const userId = 1;

      const successResponse = {
        success: true,
        code: 200,
        message: 'success',
        data: '消息已标记为已读',
        timestamp: Date.now(),
      };

      const failResponse = {
        success: false,
        code: 400,
        message: '消息不存在',
        data: '',
        timestamp: Date.now(),
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => successResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => failResponse,
        } as Response);

      const result = await notificationAPI.batchMarkAsRead(messageIds, userId);

      expect(result.success).toBe(true); // Still returns success as it's batch operation
      expect(result.message).toBe('批量标记成功');
    });
  });

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
      const messageId = 1;
      const userId = 1;

      const mockResponse = {
        success: true,
        code: 200,
        message: 'success',
        data: '消息已标记为已读',
        timestamp: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await notificationAPI.deleteMessage(messageId, userId);

      // Currently implemented as mark as read
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          code: 500,
          message: '服务器内部错误',
          data: null,
          timestamp: Date.now(),
        }),
      } as Response);

      const result = await notificationAPI.getUnreadMessages(1);

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(notificationAPI.getUnreadMessages(1)).rejects.toThrow('Invalid JSON');
    });

    it('should handle network timeouts', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(notificationAPI.getUnreadMessages(1)).rejects.toThrow('Request timeout');
    });
  });
});