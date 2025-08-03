import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Input, Button, List, Avatar, Space, Tag, Dropdown, Modal, 
  Form, Upload, message, Typography, Divider, Badge, Tooltip, 
  Row, Col, Timeline, Tabs, Select, DatePicker, Spin, Empty
} from 'antd';
import {
  SendOutlined, PaperClipOutlined, PhoneOutlined, VideoCameraOutlined,
  UserOutlined, MoreOutlined, EditOutlined, DeleteOutlined, 
  FileTextOutlined, PictureOutlined, AudioOutlined, ClockCircleOutlined,
  CheckCircleOutlined, DoubleRightOutlined, TeamOutlined, BellOutlined,
  SearchOutlined, FilterOutlined, SettingOutlined, ExportOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 消息类型枚举
enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  SYSTEM = 'SYSTEM',
  REMINDER = 'REMINDER'
}

// 消息状态枚举
enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

// 消息接口
interface ChatMessage {
  id: string;
  caseId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  senderRole: 'SOURCE_ORG' | 'DISPOSAL_ORG' | 'SYSTEM';
  content: string;
  messageType: MessageType;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }>;
  status: MessageStatus;
  createdAt: string;
  readAt?: string;
  replyToId?: string;
  mentions?: number[];
}

// 对话参与者接口
interface ChatParticipant {
  id: number;
  name: string;
  avatar?: string;
  role: 'SOURCE_ORG' | 'DISPOSAL_ORG' | 'HANDLER';
  organization: string;
  online: boolean;
  lastSeen?: string;
}

// 案件对话摘要接口
interface ChatSummary {
  caseId: number;
  caseName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participants: ChatParticipant[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
}

/**
 * 案件沟通协作页面
 */
const CaseCommunication: React.FC = () => {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('caseId');
  
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(
    caseId ? Number(caseId) : null
  );
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [fileUploadVisible, setFileUploadVisible] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [reminderForm] = Form.useForm();

  // 滚动到消息底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 加载聊天摘要列表
  const loadChatSummaries = async () => {
    try {
      // 模拟数据
      const mockSummaries: ChatSummary[] = [
        {
          caseId: 1,
          caseName: '张某某 - JJ202400001',
          lastMessage: '债务人已承诺本周内还款，请关注进展',
          lastMessageTime: '2024-01-20 15:30:00',
          unreadCount: 2,
          participants: [
            {
              id: 1,
              name: '李案源',
              role: 'SOURCE_ORG',
              organization: 'XX银行',
              online: true
            },
            {
              id: 2,
              name: '王处置',
              role: 'DISPOSAL_ORG',
              organization: '华东调解中心',
              online: false,
              lastSeen: '2024-01-20 14:30:00'
            }
          ],
          priority: 'HIGH',
          status: 'ACTIVE'
        },
        {
          caseId: 2,
          caseName: '赵某某 - JJ202400002',
          lastMessage: '已上传债务人联系记录',
          lastMessageTime: '2024-01-20 10:15:00',
          unreadCount: 0,
          participants: [
            {
              id: 3,
              name: '刘案源',
              role: 'SOURCE_ORG',
              organization: 'YY消金',
              online: false,
              lastSeen: '2024-01-20 09:30:00'
            },
            {
              id: 4,
              name: '陈处置',
              role: 'DISPOSAL_ORG',
              organization: '北京金诚律所',
              online: true
            }
          ],
          priority: 'MEDIUM',
          status: 'ACTIVE'
        }
      ];
      
      setChatSummaries(mockSummaries);
      
      // 如果没有选中案件，自动选择第一个
      if (!selectedCaseId && mockSummaries.length > 0) {
        setSelectedCaseId(mockSummaries[0].caseId);
      }
    } catch (error) {
      message.error('加载对话列表失败');
    }
  };

  // 加载指定案件的消息
  const loadMessages = async (caseId: number) => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      // 模拟消息数据
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          caseId: caseId,
          senderId: 1,
          senderName: '李案源',
          senderRole: 'SOURCE_ORG',
          content: '该案件债务人最近有联系吗？',
          messageType: MessageType.TEXT,
          status: MessageStatus.READ,
          createdAt: '2024-01-20 09:00:00',
          readAt: '2024-01-20 09:05:00'
        },
        {
          id: '2',
          caseId: caseId,
          senderId: 2,
          senderName: '王处置',
          senderRole: 'DISPOSAL_ORG',
          content: '昨天刚联系过，债务人表示有还款意愿，正在筹措资金',
          messageType: MessageType.TEXT,
          status: MessageStatus.READ,
          createdAt: '2024-01-20 09:30:00',
          readAt: '2024-01-20 09:32:00',
          replyToId: '1'
        },
        {
          id: '3',
          caseId: caseId,
          senderId: 2,
          senderName: '王处置',
          senderRole: 'DISPOSAL_ORG',
          content: '已上传通话录音和协商记录',
          messageType: MessageType.FILE,
          attachments: [
            {
              id: 'att_1',
              fileName: '通话录音_20240119.mp3',
              fileUrl: '/files/audio_20240119.mp3',
              fileSize: 2048576,
              fileType: 'audio/mp3'
            },
            {
              id: 'att_2',
              fileName: '协商记录_20240119.pdf',
              fileUrl: '/files/record_20240119.pdf',
              fileSize: 1024000,
              fileType: 'application/pdf'
            }
          ],
          status: MessageStatus.READ,
          createdAt: '2024-01-20 10:00:00',
          readAt: '2024-01-20 10:05:00'
        },
        {
          id: '4',
          caseId: caseId,
          senderId: 0,
          senderName: '系统',
          senderRole: 'SYSTEM',
          content: '债务人承诺还款提醒已设置，将于明天提醒跟进',
          messageType: MessageType.SYSTEM,
          status: MessageStatus.DELIVERED,
          createdAt: '2024-01-20 15:30:00'
        }
      ];
      
      setMessages(mockMessages);
      
      // 加载参与者信息
      const summary = chatSummaries.find(s => s.caseId === caseId);
      if (summary) {
        setParticipants(summary.participants);
      }
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      message.error('加载消息失败');
    } finally {
      setLoading(false);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedCaseId) return;
    
    setSendingMessage(true);
    try {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        caseId: selectedCaseId,
        senderId: 1, // 当前用户ID
        senderName: '当前用户',
        senderRole: 'SOURCE_ORG',
        content: messageInput.trim(),
        messageType: MessageType.TEXT,
        status: MessageStatus.SENDING,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        replyToId: replyToMessage?.id
      };
      
      // 添加到消息列表
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      setReplyToMessage(null);
      
      // 模拟发送延迟
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: MessageStatus.SENT }
              : msg
          )
        );
        scrollToBottom();
      }, 1000);
      
    } catch (error) {
      message.error('发送消息失败');
    } finally {
      setSendingMessage(false);
    }
  };

  // 设置提醒
  const handleSetReminder = async (values: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const reminderMessage: ChatMessage = {
        id: Date.now().toString(),
        caseId: selectedCaseId!,
        senderId: 0,
        senderName: '系统',
        senderRole: 'SYSTEM',
        content: `已设置提醒：${values.reminderContent}，提醒时间：${dayjs(values.reminderTime).format('YYYY-MM-DD HH:mm')}`,
        messageType: MessageType.REMINDER,
        status: MessageStatus.DELIVERED,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };
      
      setMessages(prev => [...prev, reminderMessage]);
      message.success('提醒设置成功');
      setReminderModalVisible(false);
      reminderForm.resetFields();
      scrollToBottom();
    } catch (error) {
      message.error('设置提醒失败');
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    try {
      // 模拟文件上传
      const fileMessage: ChatMessage = {
        id: Date.now().toString(),
        caseId: selectedCaseId!,
        senderId: 1,
        senderName: '当前用户',
        senderRole: 'SOURCE_ORG',
        content: '发送了文件',
        messageType: MessageType.FILE,
        attachments: [{
          id: Date.now().toString(),
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          fileSize: file.size,
          fileType: file.type
        }],
        status: MessageStatus.SENT,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };
      
      setMessages(prev => [...prev, fileMessage]);
      message.success('文件发送成功');
      scrollToBottom();
    } catch (error) {
      message.error('文件发送失败');
    }
  };

  // 获取消息状态图标
  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.SENDING:
        return <Spin size="small" />;
      case MessageStatus.SENT:
        return <CheckCircleOutlined style={{ color: '#1890ff' }} />;
      case MessageStatus.DELIVERED:
        return <DoubleRightOutlined style={{ color: '#1890ff' }} />;
      case MessageStatus.READ:
        return <DoubleRightOutlined style={{ color: '#52c41a' }} />;
      case MessageStatus.FAILED:
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  // 渲染消息内容
  const renderMessageContent = (message: ChatMessage) => {
    switch (message.messageType) {
      case MessageType.FILE:
        return (
          <div>
            <Text>{message.content}</Text>
            {message.attachments && (
              <div style={{ marginTop: 8 }}>
                {message.attachments.map(attachment => (
                  <Card key={attachment.id} size="small" style={{ marginBottom: 4 }}>
                    <Space>
                      {attachment.fileType.startsWith('image/') ? (
                        <PictureOutlined style={{ color: '#1890ff' }} />
                      ) : attachment.fileType.startsWith('audio/') ? (
                        <AudioOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <FileTextOutlined style={{ color: '#faad14' }} />
                      )}
                      <div>
                        <div>{attachment.fileName}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </div>
                      <Button type="link" size="small">
                        下载
                      </Button>
                    </Space>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return <Text>{message.content}</Text>;
    }
  };

  // 渲染消息项
  const renderMessage = (message: ChatMessage) => {
    const isSystemMessage = message.senderRole === 'SYSTEM';
    const isCurrentUser = message.senderId === 1; // 假设当前用户ID为1
    
    if (isSystemMessage) {
      return (
        <div key={message.id} style={{ textAlign: 'center', margin: '16px 0' }}>
          <Tag color="blue" icon={<BellOutlined />}>
            {message.content}
          </Tag>
          <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
            {dayjs(message.createdAt).format('MM-DD HH:mm')}
          </div>
        </div>
      );
    }
    
    return (
      <div 
        key={message.id} 
        style={{ 
          display: 'flex', 
          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
          marginBottom: 16 
        }}
      >
        <div style={{ maxWidth: '70%' }}>
          {!isCurrentUser && (
            <div style={{ marginBottom: 4 }}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text strong style={{ fontSize: '12px' }}>
                  {message.senderName}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {dayjs(message.createdAt).fromNow()}
                </Text>
              </Space>
            </div>
          )}
          
          {message.replyToId && (
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '4px 8px', 
              borderLeft: '3px solid #1890ff',
              marginBottom: 4,
              fontSize: '12px'
            }}>
              回复消息
            </div>
          )}
          
          <Card 
            size="small" 
            style={{ 
              backgroundColor: isCurrentUser ? '#1890ff' : '#ffffff',
              color: isCurrentUser ? 'white' : 'inherit',
              border: isCurrentUser ? 'none' : '1px solid #d9d9d9'
            }}
            bodyStyle={{ padding: '8px 12px' }}
          >
            {renderMessageContent(message)}
          </Card>
          
          {isCurrentUser && (
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <Space>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {dayjs(message.createdAt).format('HH:mm')}
                </Text>
                {getMessageStatusIcon(message.status)}
              </Space>
            </div>
          )}
        </div>
        
        <Dropdown 
          menu={{
            items: [
              { key: 'reply', label: '回复', icon: <EditOutlined /> },
              { key: 'copy', label: '复制', icon: <FileTextOutlined /> },
              { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true }
            ]
          }}
          trigger={['hover']}
        >
          <Button 
            type="text" 
            size="small" 
            icon={<MoreOutlined />}
            style={{ marginLeft: 8, opacity: 0.6 }}
          />
        </Dropdown>
      </div>
    );
  };

  useEffect(() => {
    loadChatSummaries();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadMessages(selectedCaseId);
    }
  }, [selectedCaseId, chatSummaries]);

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex' }}>
      {/* 左侧对话列表 */}
      <div style={{ width: 320, borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
        {/* 搜索栏 */}
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
          <Input
            placeholder="搜索案件或联系人"
            prefix={<SearchOutlined />}
            allowClear
          />
        </div>
        
        {/* 筛选器 */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Space>
            <Select placeholder="状态" size="small" style={{ width: 80 }}>
              <Option value="ACTIVE">活跃</Option>
              <Option value="RESOLVED">已解决</Option>
              <Option value="ARCHIVED">已归档</Option>
            </Select>
            <Select placeholder="优先级" size="small" style={{ width: 80 }}>
              <Option value="HIGH">高</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="LOW">低</Option>
            </Select>
            <Button size="small" icon={<FilterOutlined />} />
          </Space>
        </div>
        
        {/* 对话列表 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <List
            dataSource={chatSummaries}
            renderItem={(summary) => (
              <List.Item
                style={{ 
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: selectedCaseId === summary.caseId ? '#e6f7ff' : 'transparent'
                }}
                onClick={() => setSelectedCaseId(summary.caseId)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={summary.unreadCount} size="small">
                      <Avatar icon={<UserOutlined />} />
                    </Badge>
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: '14px' }}>
                        {summary.caseName}
                      </Text>
                      <Space>
                        <Tag 
                          color={summary.priority === 'HIGH' ? 'red' : summary.priority === 'MEDIUM' ? 'orange' : 'default'}
                        >
                          {summary.priority}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(summary.lastMessageTime).format('MM-DD')}
                        </Text>
                      </Space>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {summary.lastMessage}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        {summary.participants.map(participant => (
                          <Tooltip key={participant.id} title={participant.organization}>
                            <Badge 
                              status={participant.online ? 'success' : 'default'} 
                              dot 
                              style={{ marginRight: 8 }}
                            >
                              <Text style={{ fontSize: '12px' }}>{participant.name}</Text>
                            </Badge>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </div>
      
      {/* 右侧聊天区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedCaseId ? (
          <>
            {/* 聊天头部 */}
            <div style={{ 
              padding: 16, 
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {chatSummaries.find(s => s.caseId === selectedCaseId)?.caseName}
                </Title>
                <Text type="secondary">
                  参与人员: {participants.map(p => p.name).join(', ')}
                </Text>
              </div>
              <Space>
                <Button icon={<PhoneOutlined />} />
                <Button icon={<VideoCameraOutlined />} />
                <Button 
                  icon={<BellOutlined />}
                  onClick={() => setReminderModalVisible(true)}
                >
                  设置提醒
                </Button>
                <Dropdown
                  menu={{
                    items: [
                      { key: 'export', label: '导出聊天记录', icon: <ExportOutlined /> },
                      { key: 'settings', label: '聊天设置', icon: <SettingOutlined /> }
                    ]
                  }}
                >
                  <Button icon={<MoreOutlined />} />
                </Dropdown>
              </Space>
            </div>
            
            {/* 消息区域 */}
            <div style={{ 
              flex: 1, 
              padding: 16, 
              overflow: 'auto',
              backgroundColor: '#fafafa'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 50 }}>
                  <Spin size="large" />
                </div>
              ) : (
                <div>
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* 输入区域 */}
            <div style={{ 
              padding: 16, 
              borderTop: '1px solid #f0f0f0',
              backgroundColor: 'white'
            }}>
              {replyToMessage && (
                <div style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: 8, 
                  borderRadius: 4,
                  marginBottom: 8,
                  fontSize: '12px'
                }}>
                  <Space>
                    <Text type="secondary">回复:</Text>
                    <Text>{replyToMessage.content.substring(0, 50)}...</Text>
                    <Button 
                      type="text" 
                      size="small" 
                      onClick={() => setReplyToMessage(null)}
                    >
                      取消
                    </Button>
                  </Space>
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <Upload
                  beforeUpload={(file) => {
                    handleFileUpload(file);
                    return false;
                  }}
                  showUploadList={false}
                >
                  <Button icon={<PaperClipOutlined />} />
                </Upload>
                
                <Input.Group compact style={{ flex: 1 }}>
                  <TextArea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="输入消息..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </Input.Group>
                
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  loading={sendingMessage}
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                >
                  发送
                </Button>
              </div>
              
              <div style={{ marginTop: 4, fontSize: '12px', color: '#999' }}>
                按 Enter 发送，Shift + Enter 换行
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <Empty 
              description="请选择一个案件开始沟通"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
      
      {/* 设置提醒弹窗 */}
      <Modal
        title="设置提醒"
        open={reminderModalVisible}
        onCancel={() => setReminderModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={reminderForm}
          layout="vertical"
          onFinish={handleSetReminder}
        >
          <Form.Item
            name="reminderContent"
            label="提醒内容"
            rules={[{ required: true, message: '请输入提醒内容' }]}
          >
            <TextArea rows={3} placeholder="请输入要提醒的内容..." />
          </Form.Item>
          
          <Form.Item
            name="reminderTime"
            label="提醒时间"
            rules={[{ required: true, message: '请选择提醒时间' }]}
          >
            <DatePicker 
              showTime 
              placeholder="选择提醒时间"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setReminderModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                设置提醒
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CaseCommunication;