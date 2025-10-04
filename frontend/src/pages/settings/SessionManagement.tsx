import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, message, Tooltip } from 'antd';
import { DeleteOutlined, LogoutOutlined, DesktopOutlined, MobileOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import sessionService, { UserSession } from '@/services/sessionService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionService.getActiveSessions();
      setSessions(data);
    } catch (error) {
      console.error('加载会话失败:', error);
      message.error('加载会话列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = (sessionId: string) => {
    Modal.confirm({
      title: '确认登出',
      content: '确定要登出此会话吗？该设备将被强制下线。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await sessionService.logoutSession(sessionId);
          message.success('会话已登出');
          loadSessions();
        } catch (error) {
          console.error('登出会话失败:', error);
          message.error('登出会话失败');
        }
      },
    });
  };

  const handleLogoutAllSessions = () => {
    Modal.confirm({
      title: '确认登出所有会话',
      content: '确定要登出所有其他设备吗？所有其他设备将被强制下线，但当前会话不受影响。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await sessionService.logoutAllSessions();
          message.success('所有其他会话已登出');
          loadSessions();
        } catch (error) {
          console.error('登出所有会话失败:', error);
          message.error('登出所有会话失败');
        }
      },
    });
  };

  const getBrowserIcon = (userAgent: string) => {
    if (!userAgent) return <QuestionCircleOutlined />;

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <MobileOutlined />;
    }
    return <DesktopOutlined />;
  };

  const parseBrowser = (userAgent: string): string => {
    if (!userAgent) return '未知浏览器';

    const ua = userAgent.toLowerCase();
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('opera')) return 'Opera';
    return '其他浏览器';
  };

  const parseOS = (userAgent: string): string => {
    if (!userAgent) return '未知系统';

    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    return '其他系统';
  };

  const columns: ColumnsType<UserSession> = [
    {
      title: '设备',
      dataIndex: 'userAgent',
      key: 'device',
      width: 80,
      render: (userAgent: string) => (
        <Space>
          {getBrowserIcon(userAgent)}
        </Space>
      ),
    },
    {
      title: '浏览器 / 系统',
      key: 'browserOS',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{parseBrowser(record.userAgent)}</span>
          <span style={{ fontSize: 12, color: '#999' }}>{parseOS(record.userAgent)}</span>
        </Space>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'clientIp',
      key: 'clientIp',
      width: 150,
    },
    {
      title: '登录时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt: string) => (
        <Tooltip title={dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}>
          {dayjs(createdAt).fromNow()}
        </Tooltip>
      ),
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      width: 180,
      render: (lastActivity: string) => (
        <Tooltip title={dayjs(lastActivity).format('YYYY-MM-DD HH:mm:ss')}>
          {dayjs(lastActivity).fromNow()}
        </Tooltip>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        record.isCurrent ? (
          <Tag color="green">当前会话</Tag>
        ) : (
          <Tag>活跃</Tag>
        )
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        record.isCurrent ? (
          <span style={{ color: '#999' }}>当前会话</span>
        ) : (
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleLogoutSession(record.sessionId)}
          >
            登出
          </Button>
        )
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="会话管理"
        extra={
          <Space>
            <Button icon={<LogoutOutlined />} onClick={loadSessions}>
              刷新
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleLogoutAllSessions}
              disabled={sessions.filter(s => !s.isCurrent).length === 0}
            >
              登出所有其他会话
            </Button>
          </Space>
        }
      >
        <p style={{ marginBottom: 16, color: '#666' }}>
          管理您在不同设备上的登录会话。您可以查看所有活跃会话并远程登出不需要的设备。
        </p>

        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="sessionId"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default SessionManagement;
