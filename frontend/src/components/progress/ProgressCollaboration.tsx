import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  Timeline,
  Button,
  Form,
  Input,
  Select,
  Upload,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Progress,
  Badge,
  Divider,
  Typography,
  Modal,
  message,
  Spin,
  Alert,
  Popconfirm,
  DatePicker,
  Row,
  Col,
  Checkbox,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SendOutlined,
  BellOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  EyeOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import io from 'socket.io-client';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

interface ProgressItem {
  id: number;
  caseId: number;
  progressType: string;
  progressTypeName: string;
  progressContent: string;
  contactMethod?: string;
  contactResult?: string;
  nextAction?: string;
  nextContactTime?: string;
  attachmentUrls?: string[];
  isKeyMilestone: boolean;
  milestoneName?: string;
  progressPercentage?: number;
  handlerName: string;
  handlerPhone?: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  readTime?: string;
  readByUsers: number[];
  status: string;
  statusName: string;
  commentCount: number;
  attachmentCount: number;
  hasReminder: boolean;
  reminderTime?: string;
}

interface ProgressCollaborationProps {
  caseId: number;
  caseNo: string;
  readonly?: boolean;
  onProgressUpdate?: (progress: ProgressItem) => void;
  className?: string;
}

interface ReminderForm {
  reminderTime: string;
  reminderContent: string;
}

/**
 * 进度协同组件
 * 支持实时进度更新、协同编辑、提醒设置等功能
 */
const ProgressCollaboration: React.FC<ProgressCollaborationProps> = ({
  caseId,
  caseNo,
  readonly = false,
  onProgressUpdate,
  className
}) => {
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [reminderForm] = Form.useForm();
  const [unreadCount, setUnreadCount] = useState(0);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [progressTypes, setProgressTypes] = useState<any[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  const socketRef = useRef<any>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  // 初始化WebSocket连接
  useEffect(() => {
    const initSocket = () => {
      const socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:8080', {
        auth: {
          token: localStorage.getItem('access_token')
        }
      });

      socket.on('connect', () => {
        console.log('Progress collaboration socket connected');
        socket.emit('join_case_room', { caseId });
      });

      socket.on('progress_update', (data: ProgressItem) => {
        setProgressList(prev => {
          const updated = [...prev];
          const index = updated.findIndex(p => p.id === data.id);
          if (index >= 0) {
            updated[index] = data;
          } else {
            updated.unshift(data);
          }
          return updated;
        });

        if (data.createdBy !== getCurrentUserId()) {
          setUnreadCount(prev => prev + 1);
          message.info(`${data.createdByName} 更新了案件进度`);
        }

        onProgressUpdate?.(data);
      });

      socket.on('progress_deleted', (progressId: number) => {
        setProgressList(prev => prev.filter(p => p.id !== progressId));
      });

      socket.on('user_joined', (user: any) => {
        setConnectedUsers(prev => [...prev, user]);
        message.info(`${user.name} 加入了协同`);
      });

      socket.on('user_left', (userId: number) => {
        setConnectedUsers(prev => prev.filter(u => u.id !== userId));
      });

      socket.on('typing', (data: { userId: number, userName: string, isTyping: boolean }) => {
        // 处理正在输入状态
      });

      socketRef.current = socket;
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [caseId, onProgressUpdate]);

  // 获取当前用户ID (示例实现)
  const getCurrentUserId = () => {
    // 从认证状态获取当前用户ID
    return 1; // 示例返回值
  };

  // 加载进度列表
  const loadProgressList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/case-progress/case/${caseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const result = await response.json();
      
      if (result.code === 200) {
        setProgressList(result.data || []);
        
        // 计算未读数量
        const unread = result.data?.filter((p: ProgressItem) => !p.isRead).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to load progress list:', error);
      message.error('加载进度记录失败');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  // 初始加载
  useEffect(() => {
    loadProgressList();
    loadProgressTypes();
  }, [loadProgressList]);

  // 加载进度类型
  const loadProgressTypes = async () => {
    try {
      // 模拟进度类型数据
      const types = [
        { value: 'CONTACT', label: '联系沟通', color: 'blue' },
        { value: 'NEGOTIATION', label: '协商谈判', color: 'orange' },
        { value: 'PAYMENT', label: '还款记录', color: 'green' },
        { value: 'LEGAL_ACTION', label: '法律措施', color: 'red' },
        { value: 'MEDIATION', label: '调解处理', color: 'purple' },
        { value: 'MILESTONE', label: '关键节点', color: 'gold' }
      ];
      setProgressTypes(types);
    } catch (error) {
      console.error('Failed to load progress types:', error);
    }
  };

  // 提交进度记录
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const progressData = {
        caseId,
        progressType: values.progressType,
        progressContent: values.progressContent,
        contactMethod: values.contactMethod,
        contactResult: values.contactResult,
        nextAction: values.nextAction,
        nextContactTime: values.nextContactTime ? dayjs(values.nextContactTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
        isKeyMilestone: values.isKeyMilestone || false,
        milestoneName: values.milestoneName,
        progressPercentage: values.progressPercentage
      };

      const response = await fetch('/api/v1/case-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(progressData)
      });

      const result = await response.json();
      
      if (result.code === 200) {
        message.success('进度记录添加成功');
        form.resetFields();
        
        // 实时推送更新
        if (socketRef.current) {
          socketRef.current.emit('progress_created', result.data);
        }
        
        // 滚动到最新记录
        setTimeout(() => {
          if (progressContainerRef.current) {
            progressContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      } else {
        message.error(result.message || '添加进度记录失败');
      }
    } catch (error) {
      console.error('Failed to submit progress:', error);
      message.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 标记为已读
  const markAsRead = async (progressIds: number[]) => {
    try {
      await fetch('/api/v1/case-progress/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(progressIds)
      });

      setProgressList(prev => 
        prev.map(p => 
          progressIds.includes(p.id) 
            ? { ...p, isRead: true, readTime: new Date().toISOString() }
            : p
        )
      );

      setUnreadCount(prev => Math.max(0, prev - progressIds.length));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // 设置提醒
  const handleSetReminder = async (values: ReminderForm) => {
    try {
      await fetch('/api/v1/case-progress/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          caseId,
          reminderTime: values.reminderTime,
          reminderContent: values.reminderContent
        })
      });

      message.success('提醒设置成功');
      setReminderVisible(false);
      reminderForm.resetFields();
    } catch (error) {
      console.error('Failed to set reminder:', error);
      message.error('设置提醒失败');
    }
  };

  // 获取进度类型配置
  const getProgressTypeConfig = (type: string) => {
    return progressTypes.find(t => t.value === type) || { label: type, color: 'default' };
  };

  // 渲染进度时间线
  const renderTimeline = () => {
    const timelineItems = progressList.map(progress => {
      const typeConfig = getProgressTypeConfig(progress.progressType);
      
      return {
        key: progress.id,
        dot: progress.isKeyMilestone ? (
          <Badge dot={!progress.isRead}>
            <Avatar 
              size="small" 
              style={{ backgroundColor: '#faad14' }}
              icon={<CheckCircleOutlined />}
            />
          </Badge>
        ) : (
          <Badge dot={!progress.isRead}>
            <Avatar 
              size="small" 
              style={{ backgroundColor: typeConfig.color }}
            >
              {progress.createdByName?.charAt(0) || 'U'}
            </Avatar>
          </Badge>
        ),
        children: (
          <Card 
            size="small" 
            className={`progress-item ${!progress.isRead ? 'unread' : ''}`}
            style={{ 
              marginBottom: 8,
              border: !progress.isRead ? '1px solid #1890ff' : undefined,
              boxShadow: !progress.isRead ? '0 2px 8px rgba(24, 144, 255, 0.2)' : undefined
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                  {progress.isKeyMilestone && (
                    <Tag color="gold">关键节点</Tag>
                  )}
                  {!progress.isRead && (
                    <Tag color="blue">NEW</Tag>
                  )}
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {progress.createdByName}
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {formatDistanceToNow(new Date(progress.createdAt), { 
                      addSuffix: true, 
                      locale: zhCN 
                    })}
                  </Text>
                </div>
                
                <div style={{ marginBottom: 8 }}>
                  <Text>{progress.progressContent}</Text>
                </div>

                {progress.contactMethod && (
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">联系方式：</Text>
                    <Text>{progress.contactMethod}</Text>
                  </div>
                )}

                {progress.contactResult && (
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">联系结果：</Text>
                    <Text>{progress.contactResult}</Text>
                  </div>
                )}

                {progress.nextAction && (
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">下一步行动：</Text>
                    <Text>{progress.nextAction}</Text>
                  </div>
                )}

                {progress.nextContactTime && (
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">下次联系时间：</Text>
                    <Text>{dayjs(progress.nextContactTime).format('YYYY-MM-DD HH:mm')}</Text>
                  </div>
                )}

                {progress.progressPercentage && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">进度：</Text>
                    <Progress 
                      percent={progress.progressPercentage} 
                      size="small" 
                      style={{ marginLeft: 8, width: 100 }}
                    />
                  </div>
                )}

                {progress.attachmentUrls && progress.attachmentUrls.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">附件：</Text>
                    {progress.attachmentUrls.map((url, index) => (
                      <Button 
                        key={index}
                        type="link" 
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={() => window.open(url)}
                      >
                        附件 {index + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <Space>
                {!progress.isRead && (
                  <Button 
                    size="small"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => markAsRead([progress.id])}
                  >
                    标记已读
                  </Button>
                )}
                
                {progress.hasReminder && (
                  <Tooltip title="已设置提醒">
                    <BellOutlined style={{ color: '#faad14' }} />
                  </Tooltip>
                )}
              </Space>
            </div>
          </Card>
        )
      };
    });

    return (
      <Timeline
        items={timelineItems}
        style={{ marginTop: 16 }}
      />
    );
  };

  return (
    <div className={className}>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              案件进度协同 - {caseNo}
              {unreadCount > 0 && (
                <Badge count={unreadCount} style={{ marginLeft: 8 }} />
              )}
            </span>
            <Space>
              {connectedUsers.length > 0 && (
                <Tooltip title={`当前在线：${connectedUsers.map(u => u.name).join(', ')}`}>
                  <Avatar.Group size="small">
                    {connectedUsers.slice(0, 3).map(user => (
                      <Avatar key={user.id} style={{ backgroundColor: '#87d068' }}>
                        {user.name?.charAt(0) || 'U'}
                      </Avatar>
                    ))}
                    {connectedUsers.length > 3 && (
                      <Avatar style={{ backgroundColor: '#f56a00' }}>
                        +{connectedUsers.length - 3}
                      </Avatar>
                    )}
                  </Avatar.Group>
                </Tooltip>
              )}
              
              <Button 
                size="small"
                icon={<BellOutlined />}
                onClick={() => setReminderVisible(true)}
              >
                设置提醒
              </Button>
              
              <Button 
                size="small"
                icon={<SyncOutlined />}
                onClick={loadProgressList}
                loading={loading}
              >
                刷新
              </Button>

              {unreadCount > 0 && (
                <Button 
                  size="small"
                  type="primary"
                  onClick={() => {
                    const unreadIds = progressList
                      .filter(p => !p.isRead)
                      .map(p => p.id);
                    markAsRead(unreadIds);
                  }}
                >
                  全部已读
                </Button>
              )}
            </Space>
          </div>
        }
      >
        {!readonly && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginBottom: 24, padding: 16, backgroundColor: '#fafafa', borderRadius: 6 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="progressType"
                  label="进度类型"
                  rules={[{ required: true, message: '请选择进度类型' }]}
                >
                  <Select placeholder="请选择进度类型">
                    {progressTypes.map(type => (
                      <Option key={type.value} value={type.value}>
                        <Tag color={type.color}>{type.label}</Tag>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item name="isKeyMilestone" valuePropName="checked">
                  <Checkbox>标记为关键节点</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="progressContent"
              label="进度内容"
              rules={[{ required: true, message: '请输入进度内容' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="请详细描述处置进度..."
                showCount
                maxLength={2000}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="contactMethod" label="联系方式">
                  <Input placeholder="电话、微信等" />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item name="contactResult" label="联系结果">
                  <Input placeholder="联系结果" />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item name="progressPercentage" label="进度百分比">
                  <InputNumber 
                    min={0} 
                    max={100} 
                    formatter={(value: any) => `${value}%`}
                    parser={(value: any) => value!.replace('%', '')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="nextAction" label="下一步行动">
                  <Input placeholder="下一步计划行动" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item name="nextContactTime" label="下次联系时间">
                  <DatePicker 
                    showTime 
                    style={{ width: '100%' }} 
                    placeholder="选择下次联系时间"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  icon={<SendOutlined />}
                >
                  提交进度
                </Button>
                <Button onClick={() => form.resetFields()}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}

        <Divider>进度记录</Divider>

        <div 
          ref={progressContainerRef}
          style={{ maxHeight: 600, overflowY: 'auto' }}
        >
          <Spin spinning={loading}>
            {progressList.length > 0 ? (
              renderTimeline()
            ) : (
              <Alert
                message="暂无进度记录"
                description="开始添加第一条进度记录吧"
                type="info"
                showIcon
              />
            )}
          </Spin>
        </div>
      </Card>

      {/* 提醒设置弹窗 */}
      <Modal
        title="设置进度提醒"
        open={reminderVisible}
        onCancel={() => setReminderVisible(false)}
        footer={null}
      >
        <Form
          form={reminderForm}
          layout="vertical"
          onFinish={handleSetReminder}
        >
          <Form.Item
            name="reminderTime"
            label="提醒时间"
            rules={[{ required: true, message: '请选择提醒时间' }]}
          >
            <DatePicker 
              showTime 
              style={{ width: '100%' }} 
              placeholder="选择提醒时间"
            />
          </Form.Item>

          <Form.Item
            name="reminderContent"
            label="提醒内容"
            rules={[{ required: true, message: '请输入提醒内容' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="请输入提醒内容..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                设置提醒
              </Button>
              <Button onClick={() => setReminderVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProgressCollaboration;