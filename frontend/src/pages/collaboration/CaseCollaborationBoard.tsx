import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Avatar, Button, Space, Tag, Modal, Form, 
  Input, Select, DatePicker, message, Badge, Tooltip, Progress, 
  Typography, Dropdown, Menu, Divider, Empty, Spin, Timeline,
  Popover, List, Rate, Statistic, Checkbox
} from 'antd';
import {
  UserOutlined, TeamOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  MessageOutlined, FileTextOutlined, CalendarOutlined, FlagOutlined,
  StarOutlined, ArrowRightOutlined, MoreOutlined, SyncOutlined,
  DragOutlined, EyeOutlined, ShareAltOutlined, LinkOutlined,
  TagsOutlined, FilterOutlined, SearchOutlined, HistoryOutlined
} from '@ant-design/icons';
// Drag and drop functionality temporarily disabled
// TODO: Implement drag and drop with a compatible library
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// 看板列类型
enum BoardColumnType {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO', 
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

// 看板卡片接口
interface BoardCard {
  id: string;
  caseId: number;
  caseName: string;
  debtorName: string;
  remainingAmount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT';
  status: BoardColumnType;
  assignees: Array<{
    id: number;
    name: string;
    avatar?: string;
  }>;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  progress: number;
  attachmentCount: number;
  commentCount: number;
  checklist?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  watchers: number[];
  sourceOrg: string;
  disposalMethod: 'MEDIATION' | 'LITIGATION' | 'NEGOTIATION';
}

// 活动记录接口
interface Activity {
  id: string;
  cardId: string;
  userId: number;
  userName: string;
  action: string;
  timestamp: string;
  details?: string;
}

// 评论接口
interface CardComment {
  id: string;
  cardId: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  mentions?: number[];
  attachments?: string[];
}

// 看板列配置
const boardColumns = {
  [BoardColumnType.BACKLOG]: {
    title: '待处理',
    color: '#8c8c8c',
    description: '新分配的案件，等待开始处理'
  },
  [BoardColumnType.TODO]: {
    title: '计划中',
    color: '#1890ff',
    description: '已规划处理方案，准备开始'
  },
  [BoardColumnType.IN_PROGRESS]: {
    title: '进行中',
    color: '#faad14',
    description: '正在积极处理的案件'
  },
  [BoardColumnType.REVIEW]: {
    title: '审核中',
    color: '#722ed1',
    description: '等待审核确认的案件'
  },
  [BoardColumnType.DONE]: {
    title: '已完成',
    color: '#52c41a',
    description: '处理完成的案件'
  }
};

// 优先级配置
const priorityConfig = {
  URGENT: { text: '紧急', color: '#ff4d4f', icon: <ExclamationCircleOutlined /> },
  HIGH: { text: '高', color: '#fa8c16', icon: <FlagOutlined /> },
  MEDIUM: { text: '中', color: '#1890ff', icon: <FlagOutlined /> },
  LOW: { text: '低', color: '#8c8c8c', icon: <FlagOutlined /> }
};

// 处置方式配置
const disposalMethodConfig = {
  MEDIATION: { text: '调解', color: '#52c41a' },
  LITIGATION: { text: '诉讼', color: '#ff4d4f' },
  NEGOTIATION: { text: '协商', color: '#1890ff' }
};

// 拖拽卡片组件
const DraggableCard: React.FC<{
  card: BoardCard;
  onCardClick: (card: BoardCard) => void;
  onQuickAction: (cardId: string, action: string) => void;
}> = ({ card, onCardClick, onQuickAction }) => {
  // Drag and drop temporarily disabled
  const isDragging = false;
  const drag = null;

  const isOverdue = card.dueDate && dayjs(card.dueDate).isBefore(dayjs());
  const daysUntilDue = card.dueDate ? dayjs(card.dueDate).diff(dayjs(), 'day') : null;

  return (
    <div
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
        marginBottom: 8
      }}
    >
      <Card
        size="small"
        hoverable
        onClick={() => onCardClick(card)}
        extra={
          <Dropdown
            menu={{
              items: [
                { key: 'edit', label: '编辑', icon: <EditOutlined /> },
                { key: 'archive', label: '归档', icon: <FileTextOutlined /> },
                { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true }
              ],
              onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation();
                onQuickAction(card.id, key);
              }
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        }
      >
        {/* 优先级标签 */}
        {card.priority && (
          <Tag 
            color={priorityConfig[card.priority].color} 
            icon={priorityConfig[card.priority].icon}
            style={{ marginBottom: 8 }}
          >
            {priorityConfig[card.priority].text}
          </Tag>
        )}

        {/* 案件信息 */}
        <div style={{ marginBottom: 8 }}>
          <Text strong>{card.caseName}</Text>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {card.debtorName} · ¥{card.remainingAmount.toLocaleString()}
          </div>
        </div>

        {/* 标签 */}
        {card.tags.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {card.tags.map(tag => (
              <Tag key={tag} style={{ marginBottom: 2 }}>
                {tag}
              </Tag>
            ))}
          </div>
        )}

        {/* 进度条 */}
        {card.progress > 0 && (
          <Progress 
            percent={card.progress} 
            size="small" 
            showInfo={false}
            strokeColor={card.progress === 100 ? '#52c41a' : '#1890ff'}
            style={{ marginBottom: 8 }}
          />
        )}

        {/* 底部信息栏 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '12px',
          color: '#8c8c8c'
        }}>
          <Space size={4}>
            {/* 处置方式 */}
            <Tag color={disposalMethodConfig[card.disposalMethod].color}>
              {disposalMethodConfig[card.disposalMethod].text}
            </Tag>
            
            {/* 截止日期 */}
            {card.dueDate && (
              <Tooltip title={`截止日期: ${dayjs(card.dueDate).format('YYYY-MM-DD')}`}>
                <Tag 
                  color={isOverdue ? 'error' : daysUntilDue! <= 3 ? 'warning' : 'default'}
                  icon={<CalendarOutlined />}
                >
                  {isOverdue ? '已逾期' : `${daysUntilDue}天`}
                </Tag>
              </Tooltip>
            )}
          </Space>

          <Space size={8}>
            {/* 附件数 */}
            {card.attachmentCount > 0 && (
              <Tooltip title={`${card.attachmentCount} 个附件`}>
                <FileTextOutlined /> {card.attachmentCount}
              </Tooltip>
            )}
            
            {/* 评论数 */}
            {card.commentCount > 0 && (
              <Tooltip title={`${card.commentCount} 条评论`}>
                <MessageOutlined /> {card.commentCount}
              </Tooltip>
            )}
            
            {/* 负责人头像 */}
            <Avatar.Group maxCount={2} size="small">
              {card.assignees.map(assignee => (
                <Tooltip key={assignee.id} title={assignee.name}>
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />}
                    style={{ cursor: 'pointer' }}
                  >
                    {assignee.name.charAt(0)}
                  </Avatar>
                </Tooltip>
              ))}
            </Avatar.Group>
          </Space>
        </div>
      </Card>
    </div>
  );
};

// 看板列组件
const BoardColumn: React.FC<{
  column: BoardColumnType;
  cards: BoardCard[];
  onCardMove: (cardId: string, targetColumn: BoardColumnType) => void;
  onCardClick: (card: BoardCard) => void;
  onQuickAction: (cardId: string, action: string) => void;
  onAddCard: (column: BoardColumnType) => void;
}> = ({ column, cards, onCardMove, onCardClick, onQuickAction, onAddCard }) => {
  // Drop functionality temporarily disabled
  const isOver = false;
  const drop = null;

  const columnConfig = boardColumns[column];

  return (
    <div
      style={{
        backgroundColor: isOver ? '#e6f7ff' : '#fafafa',
        borderRadius: 8,
        padding: 12,
        minHeight: 600,
        transition: 'background-color 0.3s'
      }}
    >
      {/* 列头 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16
      }}>
        <div>
          <Badge 
            count={cards.length} 
            style={{ backgroundColor: columnConfig.color }}
          >
            <Title level={5} style={{ margin: 0 }}>
              {columnConfig.title}
            </Title>
          </Badge>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
            {columnConfig.description}
          </Text>
        </div>
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onAddCard(column)}
        />
      </div>

      {/* 卡片列表 */}
      <div style={{ minHeight: 400 }}>
        {cards.length > 0 ? (
          cards.map(card => (
            <DraggableCard
              key={card.id}
              card={card}
              onCardClick={onCardClick}
              onQuickAction={onQuickAction}
            />
          ))
        ) : (
          <Empty 
            description="暂无案件"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 50 }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * 案件协作看板页面
 */
const CaseCollaborationBoard: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createColumn, setCreateColumn] = useState<BoardColumnType | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    priority: '',
    assignee: '',
    tag: '',
    dateRange: null as any
  });
  
  const [cardForm] = Form.useForm();
  const [createForm] = Form.useForm();

  // 加载看板数据
  const loadBoardData = async () => {
    setLoading(true);
    try {
      // 模拟看板数据
      const mockCards: BoardCard[] = [
        {
          id: 'card_1',
          caseId: 1,
          caseName: 'JJ202400001',
          debtorName: '张某某',
          remainingAmount: 45000,
          priority: 'HIGH',
          status: BoardColumnType.IN_PROGRESS,
          assignees: [
            { id: 1, name: '李处理员' },
            { id: 2, name: '王助理' }
          ],
          tags: ['重点案件', '本月必结'],
          dueDate: '2024-01-25 18:00:00',
          createdAt: '2024-01-15 09:00:00',
          updatedAt: '2024-01-21 16:30:00',
          description: '债务人已承诺本周内还款50%',
          progress: 65,
          attachmentCount: 3,
          commentCount: 5,
          checklist: [
            { id: 'check_1', title: '初次联系', completed: true },
            { id: 'check_2', title: '还款协商', completed: true },
            { id: 'check_3', title: '协议签署', completed: false },
            { id: 'check_4', title: '首期还款', completed: false }
          ],
          watchers: [3, 4],
          sourceOrg: 'XX银行',
          disposalMethod: 'MEDIATION'
        },
        {
          id: 'card_2',
          caseId: 2,
          caseName: 'JJ202400002',
          debtorName: '赵某某',
          remainingAmount: 78000,
          priority: 'URGENT',
          status: BoardColumnType.TODO,
          assignees: [
            { id: 3, name: '陈处理员' }
          ],
          tags: ['紧急', '大额'],
          dueDate: '2024-01-22 18:00:00',
          createdAt: '2024-01-20 10:00:00',
          updatedAt: '2024-01-21 09:00:00',
          progress: 0,
          attachmentCount: 1,
          commentCount: 2,
          watchers: [1],
          sourceOrg: 'YY消金',
          disposalMethod: 'LITIGATION'
        },
        {
          id: 'card_3',
          caseId: 3,
          caseName: 'JJ202400003',
          debtorName: '李某某',
          remainingAmount: 32000,
          priority: 'MEDIUM',
          status: BoardColumnType.REVIEW,
          assignees: [
            { id: 2, name: '王助理' }
          ],
          tags: ['协商中'],
          dueDate: '2024-01-28 18:00:00',
          createdAt: '2024-01-18 14:00:00',
          updatedAt: '2024-01-21 11:20:00',
          progress: 85,
          attachmentCount: 5,
          commentCount: 8,
          watchers: [1, 3],
          sourceOrg: 'ZZ银行',
          disposalMethod: 'NEGOTIATION'
        },
        {
          id: 'card_4',
          caseId: 4,
          caseName: 'JJ202400004',
          debtorName: '王某某',
          remainingAmount: 15000,
          priority: 'LOW',
          status: BoardColumnType.DONE,
          assignees: [
            { id: 4, name: '刘处理员' }
          ],
          tags: ['已结清'],
          createdAt: '2024-01-10 09:00:00',
          updatedAt: '2024-01-20 17:00:00',
          progress: 100,
          attachmentCount: 8,
          commentCount: 12,
          watchers: [],
          sourceOrg: 'AA信贷',
          disposalMethod: 'MEDIATION'
        }
      ];

      // 模拟活动记录
      const mockActivities: Activity[] = [
        {
          id: 'act_1',
          cardId: 'card_1',
          userId: 1,
          userName: '李处理员',
          action: '更新了进度',
          timestamp: '2024-01-21 16:30:00',
          details: '进度从45%更新到65%'
        },
        {
          id: 'act_2',
          cardId: 'card_3',
          userId: 2,
          userName: '王助理',
          action: '移动了卡片',
          timestamp: '2024-01-21 11:20:00',
          details: '从"进行中"移动到"审核中"'
        },
        {
          id: 'act_3',
          cardId: 'card_2',
          userId: 3,
          userName: '陈处理员',
          action: '添加了标签',
          timestamp: '2024-01-21 09:00:00',
          details: '添加了"紧急"标签'
        }
      ];

      setCards(mockCards);
      setActivities(mockActivities);
    } catch (error) {
      message.error('加载看板数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 移动卡片
  const handleCardMove = async (cardId: string, targetColumn: BoardColumnType) => {
    try {
      setCards(prev => prev.map(card => 
        card.id === cardId 
          ? { ...card, status: targetColumn, updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') }
          : card
      ));
      
      // 添加活动记录
      const card = cards.find(c => c.id === cardId);
      const newActivity: Activity = {
        id: `act_${Date.now()}`,
        cardId: cardId,
        userId: 1, // 当前用户
        userName: '当前用户',
        action: '移动了卡片',
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        details: `从"${boardColumns[card!.status].title}"移动到"${boardColumns[targetColumn].title}"`
      };
      setActivities(prev => [newActivity, ...prev]);
      
      message.success('卡片移动成功');
    } catch (error) {
      message.error('移动卡片失败');
    }
  };

  // 创建新卡片
  const handleCreateCard = async (values: any) => {
    try {
      const newCard: BoardCard = {
        id: `card_${Date.now()}`,
        caseId: values.caseId,
        caseName: values.caseName,
        debtorName: values.debtorName,
        remainingAmount: values.remainingAmount,
        priority: values.priority,
        status: createColumn!,
        assignees: values.assignees.map((id: number) => ({
          id,
          name: `用户${id}`
        })),
        tags: values.tags || [],
        dueDate: values.dueDate?.format('YYYY-MM-DD HH:mm:ss'),
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        description: values.description,
        progress: 0,
        attachmentCount: 0,
        commentCount: 0,
        watchers: [],
        sourceOrg: values.sourceOrg,
        disposalMethod: values.disposalMethod
      };
      
      setCards(prev => [...prev, newCard]);
      message.success('案件卡片创建成功');
      setCreateModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      message.error('创建卡片失败');
    }
  };

  // 快速操作处理
  const handleQuickAction = async (cardId: string, action: string) => {
    switch (action) {
      case 'edit':
        const card = cards.find(c => c.id === cardId);
        if (card) {
          setSelectedCard(card);
          cardForm.setFieldsValue(card);
          setCardModalVisible(true);
        }
        break;
      case 'archive':
        Modal.confirm({
          title: '确认归档',
          content: '归档后该案件将不再显示在看板中，确定要归档吗？',
          onOk: async () => {
            setCards(prev => prev.filter(c => c.id !== cardId));
            message.success('案件已归档');
          }
        });
        break;
      case 'delete':
        Modal.confirm({
          title: '确认删除',
          content: '删除后不可恢复，确定要删除吗？',
          onOk: async () => {
            setCards(prev => prev.filter(c => c.id !== cardId));
            message.success('案件已删除');
          }
        });
        break;
    }
  };

  // 按列分组卡片
  const getCardsByColumn = (column: BoardColumnType) => {
    return cards.filter(card => card.status === column);
  };

  // 应用过滤器
  const getFilteredCards = () => {
    return cards.filter(card => {
      return (
        (!filters.priority || card.priority === filters.priority) &&
        (!filters.assignee || card.assignees.some(a => a.id.toString() === filters.assignee)) &&
        (!filters.tag || card.tags.includes(filters.tag)) &&
        (!filters.dateRange || (
          dayjs(card.createdAt).isAfter(filters.dateRange[0]) &&
          dayjs(card.createdAt).isBefore(filters.dateRange[1])
        ))
      );
    });
  };

  useEffect(() => {
    loadBoardData();
  }, []);

  const displayCards = filters.priority || filters.assignee || filters.tag || filters.dateRange
    ? getFilteredCards()
    : cards;

  return (
      <div className="case-collaboration-board">
        {/* 页面头部 */}
        <Card style={{ marginBottom: 16 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                案件协作看板
              </Title>
              <Text type="secondary">
                拖拽卡片以更新案件状态，点击卡片查看详情
              </Text>
            </Col>
            <Col>
              <Space>
                <Button icon={<SyncOutlined />} onClick={loadBoardData}>
                  刷新
                </Button>
                <Button 
                  icon={<FilterOutlined />}
                  onClick={() => setFilterVisible(!filterVisible)}
                >
                  筛选
                </Button>
                <Button icon={<TeamOutlined />} onClick={() => navigate('/collaboration/team')}>
                  团队工作台
                </Button>
                <Button icon={<MessageOutlined />} onClick={() => navigate('/communication')}>
                  沟通中心
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 筛选器 */}
        {filterVisible && (
          <Card style={{ marginBottom: 16 }}>
            <Form layout="inline">
              <Form.Item label="优先级">
                <Select
                  placeholder="全部"
                  style={{ width: 100 }}
                  allowClear
                  value={filters.priority}
                  onChange={(value) => setFilters(prev => ({ ...prev, priority: value || '' }))}
                >
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <Option key={key} value={key}>{config.text}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="负责人">
                <Select
                  placeholder="全部"
                  style={{ width: 120 }}
                  allowClear
                  value={filters.assignee}
                  onChange={(value) => setFilters(prev => ({ ...prev, assignee: value || '' }))}
                >
                  <Option value="1">李处理员</Option>
                  <Option value="2">王助理</Option>
                  <Option value="3">陈处理员</Option>
                  <Option value="4">刘处理员</Option>
                </Select>
              </Form.Item>
              <Form.Item label="标签">
                <Select
                  placeholder="全部"
                  style={{ width: 120 }}
                  allowClear
                  value={filters.tag}
                  onChange={(value) => setFilters(prev => ({ ...prev, tag: value || '' }))}
                >
                  <Option value="重点案件">重点案件</Option>
                  <Option value="本月必结">本月必结</Option>
                  <Option value="紧急">紧急</Option>
                  <Option value="大额">大额</Option>
                </Select>
              </Form.Item>
              <Form.Item label="创建时间">
                <RangePicker
                  value={filters.dateRange}
                  onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="link"
                  onClick={() => setFilters({ priority: '', assignee: '', tag: '', dateRange: null })}
                >
                  重置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* 看板主体 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        ) : (
          <Row gutter={16}>
            {Object.values(BoardColumnType).map(column => (
              <Col key={column} span={24 / Object.values(BoardColumnType).length}>
                <BoardColumn
                  column={column}
                  cards={getCardsByColumn(column).filter(card => displayCards.includes(card))}
                  onCardMove={handleCardMove}
                  onCardClick={(card) => {
                    setSelectedCard(card);
                    setCardModalVisible(true);
                  }}
                  onQuickAction={handleQuickAction}
                  onAddCard={(col) => {
                    setCreateColumn(col);
                    setCreateModalVisible(true);
                  }}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* 活动时间线 */}
        <Card 
          title="最近活动" 
          style={{ marginTop: 24 }}
          extra={
            <Button type="link" size="small" onClick={() => navigate('/collaboration/activities')}>
              查看全部
            </Button>
          }
        >
          <Timeline mode="left">
            {activities.slice(0, 5).map(activity => (
              <Timeline.Item key={activity.id}>
                <div style={{ fontSize: '12px' }}>
                  <Space>
                    <Text strong>{activity.userName}</Text>
                    <Text>{activity.action}</Text>
                    {activity.details && <Text type="secondary">({activity.details})</Text>}
                  </Space>
                  <div style={{ color: '#999', marginTop: 4 }}>
                    {dayjs(activity.timestamp).fromNow()}
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>

        {/* 卡片详情弹窗 */}
        <Modal
          title={selectedCard?.caseName}
          open={cardModalVisible}
          onCancel={() => {
            setCardModalVisible(false);
            setSelectedCard(null);
          }}
          width={800}
          footer={[
            <Button key="cancel" onClick={() => setCardModalVisible(false)}>
              关闭
            </Button>,
            <Button key="communicate" icon={<MessageOutlined />} onClick={() => navigate(`/communication?caseId=${selectedCard?.caseId}`)}>
              沟通
            </Button>,
            <Button key="detail" type="primary" onClick={() => navigate(`/cases/${selectedCard?.caseId}`)}>
              查看详情
            </Button>
          ]}
        >
          {selectedCard && (
            <div>
              <Row gutter={16}>
                <Col span={16}>
                  <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <p><strong>债务人:</strong> {selectedCard.debtorName}</p>
                        <p><strong>剩余金额:</strong> ¥{selectedCard.remainingAmount.toLocaleString()}</p>
                        <p><strong>案源机构:</strong> {selectedCard.sourceOrg}</p>
                      </Col>
                      <Col span={12}>
                        <p><strong>处置方式:</strong> {disposalMethodConfig[selectedCard.disposalMethod].text}</p>
                        <p><strong>优先级:</strong> <Tag color={priorityConfig[selectedCard.priority].color}>{priorityConfig[selectedCard.priority].text}</Tag></p>
                        <p><strong>当前状态:</strong> <Tag color={boardColumns[selectedCard.status].color}>{boardColumns[selectedCard.status].title}</Tag></p>
                      </Col>
                    </Row>
                  </Card>

                  {/* 描述 */}
                  {selectedCard.description && (
                    <Card title="案件描述" size="small" style={{ marginBottom: 16 }}>
                      <Text>{selectedCard.description}</Text>
                    </Card>
                  )}

                  {/* 检查清单 */}
                  {selectedCard.checklist && selectedCard.checklist.length > 0 && (
                    <Card title="处理清单" size="small" style={{ marginBottom: 16 }}>
                      <List
                        size="small"
                        dataSource={selectedCard.checklist}
                        renderItem={item => (
                          <List.Item>
                            <Checkbox checked={item.completed}>
                              {item.title}
                            </Checkbox>
                          </List.Item>
                        )}
                      />
                    </Card>
                  )}
                </Col>

                <Col span={8}>
                  {/* 负责人 */}
                  <Card title="负责人" size="small" style={{ marginBottom: 16 }}>
                    <List
                      size="small"
                      dataSource={selectedCard.assignees}
                      renderItem={assignee => (
                        <List.Item>
                          <Space>
                            <Avatar size="small" icon={<UserOutlined />} />
                            {assignee.name}
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Card>

                  {/* 时间信息 */}
                  <Card title="时间信息" size="small" style={{ marginBottom: 16 }}>
                    <p><strong>创建时间:</strong><br/>{dayjs(selectedCard.createdAt).format('YYYY-MM-DD HH:mm')}</p>
                    <p><strong>更新时间:</strong><br/>{dayjs(selectedCard.updatedAt).format('YYYY-MM-DD HH:mm')}</p>
                    {selectedCard.dueDate && (
                      <p><strong>截止时间:</strong><br/>{dayjs(selectedCard.dueDate).format('YYYY-MM-DD HH:mm')}</p>
                    )}
                  </Card>

                  {/* 标签 */}
                  <Card title="标签" size="small">
                    {selectedCard.tags.map(tag => (
                      <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>
                    ))}
                    <Button type="dashed" size="small" icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                      添加标签
                    </Button>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* 创建卡片弹窗 */}
        <Modal
          title={`创建案件卡片 - ${createColumn ? boardColumns[createColumn].title : ''}`}
          open={createModalVisible}
          onCancel={() => {
            setCreateModalVisible(false);
            setCreateColumn(null);
            createForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={createForm}
            layout="vertical"
            onFinish={handleCreateCard}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="caseId"
                  label="案件ID"
                  rules={[{ required: true, message: '请输入案件ID' }]}
                >
                  <Input placeholder="输入案件ID" type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="caseName"
                  label="案件编号"
                  rules={[{ required: true, message: '请输入案件编号' }]}
                >
                  <Input placeholder="如：JJ202400005" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="debtorName"
                  label="债务人姓名"
                  rules={[{ required: true, message: '请输入债务人姓名' }]}
                >
                  <Input placeholder="输入债务人姓名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="remainingAmount"
                  label="剩余金额"
                  rules={[{ required: true, message: '请输入剩余金额' }]}
                >
                  <Input placeholder="0" type="number" prefix="¥" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="sourceOrg"
                  label="案源机构"
                  rules={[{ required: true, message: '请输入案源机构' }]}
                >
                  <Input placeholder="输入案源机构名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="disposalMethod"
                  label="处置方式"
                  rules={[{ required: true, message: '请选择处置方式' }]}
                >
                  <Select placeholder="选择处置方式">
                    {Object.entries(disposalMethodConfig).map(([key, config]) => (
                      <Option key={key} value={key}>{config.text}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="优先级"
                  rules={[{ required: true, message: '请选择优先级' }]}
                >
                  <Select placeholder="选择优先级">
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <Option key={key} value={key}>{config.text}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dueDate"
                  label="截止日期"
                >
                  <DatePicker
                    showTime
                    placeholder="选择截止日期"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="assignees"
              label="负责人"
              rules={[{ required: true, message: '请选择负责人' }]}
            >
              <Select mode="multiple" placeholder="选择负责人">
                <Option value={1}>李处理员</Option>
                <Option value={2}>王助理</Option>
                <Option value={3}>陈处理员</Option>
                <Option value={4}>刘处理员</Option>
              </Select>
            </Form.Item>

            <Form.Item name="tags" label="标签">
              <Select mode="tags" placeholder="添加标签">
                <Option value="重点案件">重点案件</Option>
                <Option value="本月必结">本月必结</Option>
                <Option value="紧急">紧急</Option>
                <Option value="大额">大额</Option>
              </Select>
            </Form.Item>

            <Form.Item name="description" label="案件描述">
              <TextArea rows={3} placeholder="输入案件描述信息..." />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => setCreateModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  创建
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
};

export default CaseCollaborationBoard;