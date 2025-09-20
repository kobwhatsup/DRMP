import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import NotificationCenter from '../NotificationCenter';
import { useAuth } from '../../../hooks/useAuth';
import { notificationAPI } from '../../../services/notificationAPI';

// Mock dependencies
vi.mock('../../../hooks/useAuth');
vi.mock('../../../services/notificationAPI');
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    notification: {
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
    },
  };
});

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  send(data: string) {
    // Mock send implementation
  }
}

global.WebSocket = MockWebSocket as any;

// Mock Notification API
Object.defineProperty(global, 'Notification', {
  value: class MockNotification {
    static permission = 'granted';
    static requestPermission = vi.fn().mockResolvedValue('granted');
    
    constructor(public title: string, public options?: NotificationOptions) {}
  },
  writable: true,
});

const mockUser = {
  id: 1,
  username: 'testuser',
  organizationId: 100,
};

const mockMessages = [
  {
    id: 1,
    type: 'CASE_ASSIGNMENT',
    title: '新案件分配',
    content: '您有新的案件包待处理',
    priority: 'HIGH',
    status: 'SENT',
    createdAt: '2023-12-01T10:00:00',
    category: 'BUSINESS',
  },
  {
    id: 2,
    type: 'CONTRACT_SIGNED',
    title: '合同签署完成',
    content: '合同已完成签署',
    priority: 'NORMAL',
    status: 'READ',
    createdAt: '2023-12-01T09:00:00',
    readAt: '2023-12-01T09:30:00',
    category: 'BUSINESS',
  },
];

const mockStats = {
  total: 10,
  unread: 3,
  read: 7,
};

describe('NotificationCenter', () => {
  const mockUseAuth = vi.mocked(useAuth);
  const mockNotificationAPI = vi.mocked(notificationAPI);

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    } as any);

    mockNotificationAPI.getUnreadMessages.mockResolvedValue({
      success: true,
      data: mockMessages,
      code: 200,
      message: 'success',
      timestamp: Date.now(),
    });

    mockNotificationAPI.getMessageStatistics.mockResolvedValue({
      success: true,
      data: mockStats,
      code: 200,
      message: 'success',
      timestamp: Date.now(),
    });

    mockNotificationAPI.markAsRead.mockResolvedValue({
      success: true,
      data: '标记成功',
      code: 200,
      message: 'success',
      timestamp: Date.now(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render notification bell icon with badge', async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // Should show unread count badge
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should open notification drawer when bell icon is clicked', async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('通知中心')).toBeInTheDocument();
      expect(screen.getByText('3 未读')).toBeInTheDocument();
    });
  });

  it('should display notifications in the drawer', async () => {
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('新案件分配')).toBeInTheDocument();
      expect(screen.getByText('合同签署完成')).toBeInTheDocument();
      expect(screen.getByText('您有新的案件包待处理')).toBeInTheDocument();
    });
  });

  it('should mark message as read when read button is clicked', async () => {
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('新案件分配')).toBeInTheDocument();
    });

    // Find and click the mark as read button for unread message
    const readButtons = screen.getAllByRole('button');
    const markReadButton = readButtons.find(btn => 
      btn.querySelector('.anticon-check')
    );

    if (markReadButton) {
      fireEvent.click(markReadButton);

      await waitFor(() => {
        expect(mockNotificationAPI.markAsRead).toHaveBeenCalledWith(1, 1);
      });
    }
  });

  it('should mark all messages as read when mark all button is clicked', async () => {
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('通知中心')).toBeInTheDocument();
    });

    // Find and click mark all as read button
    const markAllButton = screen.getByRole('button', { name: /标记全部已读/i });
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(mockNotificationAPI.markAsRead).toHaveBeenCalledTimes(1); // Only unread message
    });
  });

  it('should refresh notifications when refresh button is clicked', async () => {
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('通知中心')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /刷新/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockNotificationAPI.getUnreadMessages).toHaveBeenCalledTimes(2); // Initial load + refresh
      expect(mockNotificationAPI.getMessageStatistics).toHaveBeenCalledTimes(2);
    });
  });

  it('should display empty state when no messages', async () => {
    mockNotificationAPI.getUnreadMessages.mockResolvedValue({
      success: true,
      data: [],
      code: 200,
      message: 'success',
      timestamp: Date.now(),
    });

    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('暂无通知消息')).toBeInTheDocument();
    });
  });

  it('should handle WebSocket messages', async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // Simulate WebSocket message
    const mockWs = new MockWebSocket('ws://localhost:8080/ws/notifications?userId=1');
    
    await act(async () => {
      if (mockWs.onmessage) {
        const mockMessage = {
          type: 'notification',
          data: {
            id: 3,
            type: 'PAYMENT_RECEIVED',
            title: '收到回款',
            content: '案件回款到账',
            priority: 'HIGH',
            status: 'SENT',
            createdAt: new Date().toISOString(),
            category: 'BUSINESS',
          },
        };

        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify(mockMessage),
        }));
      }
    });

    // Badge count should increase
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument(); // 3 + 1 new message
    });
  });

  it('should handle WebSocket connection errors gracefully', async () => {
    render(<NotificationCenter />);

    const mockWs = new MockWebSocket('ws://localhost:8080/ws/notifications?userId=1');
    
    await act(async () => {
      if (mockWs.onerror) {
        mockWs.onerror(new Event('error'));
      }
    });

    // Component should still work
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should display priority tags correctly', async () => {
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('NORMAL')).toBeInTheDocument();
    });
  });

  it('should display message statistics', async () => {
    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('总计: 10')).toBeInTheDocument();
      expect(screen.getByText('未读: 3')).toBeInTheDocument();
      expect(screen.getByText('已读: 7')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockNotificationAPI.getUnreadMessages.mockRejectedValue(new Error('API Error'));
    mockNotificationAPI.getMessageStatistics.mockRejectedValue(new Error('API Error'));

    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('暂无通知消息')).toBeInTheDocument();
    });
  });

  it('should handle missing user gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    } as any);

    render(<NotificationCenter />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(mockNotificationAPI.getUnreadMessages).not.toHaveBeenCalled();
  });
});