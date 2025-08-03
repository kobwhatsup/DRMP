import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Avatar, Button, Space, Tag, Table, Modal, Form, 
  Input, Select, DatePicker, message, Badge, Tooltip, Progress, 
  Timeline, Tabs, Divider, Typography, Alert, Drawer, List, 
  Checkbox, Radio, Statistic, Empty, Spin
} from 'antd';
import {
  UserOutlined, TeamOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  BellOutlined, MessageOutlined, FileTextOutlined, CalendarOutlined,
  BarChartOutlined, UserAddOutlined, SettingOutlined, ShareAltOutlined,
  FlagOutlined, StarOutlined, TrophyOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// 团队成员接口
interface TeamMember {
  id: number;
  name: string;
  avatar?: string;
  role: 'TEAM_LEAD' | 'SENIOR_HANDLER' | 'HANDLER' | 'ASSISTANT';
  department: string;
  skills: string[];
  workload: number; // 工作负荷百分比
  efficiency: number; // 工作效率评分
  activeCases: number;
  completedCases: number;
  online: boolean;
  lastSeen?: string;
  joinDate: string;
}

// 协作任务接口
interface CollaborationTask {
  id: string;
  title: string;
  description: string;
  type: 'CASE_PROCESSING' | 'DOCUMENT_REVIEW' | 'COMMUNICATION' | 'REPORTING' | 'TRAINING';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';
  assigneeId: number;
  assigneeName: string;
  reporterId: number;
  reporterName: string;
  caseId?: number;
  caseName?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  dependencies?: string[]; // 依赖的任务ID
}

// 工作日志接口
interface WorkLog {
  id: string;
  userId: number;
  userName: string;
  taskId: string;
  taskTitle: string;
  workType: 'COMMUNICATION' | 'PROCESSING' | 'DOCUMENTATION' | 'REVIEW' | 'MEETING';
  duration: number; // 工作时长(分钟)
  description: string;
  createdAt: string;
  efficiency: number; // 效率评分
}

// 团队统计接口
interface TeamStats {
  totalMembers: number;
  onlineMembers: number;
  activeTasksCount: number;
  completedTasksToday: number;
  avgWorkload: number;
  avgEfficiency: number;
  teamPerformance: number;
}

/**
 * 团队协作工作台
 */
const TeamWorkspace: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<CollaborationTask[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [memberDrawerVisible, setMemberDrawerVisible] = useState(false);
  const [workLogModalVisible, setWorkLogModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<CollaborationTask | null>(null);
  const [taskFilters, setTaskFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    type: ''
  });
  
  const [taskForm] = Form.useForm();
  const [workLogForm] = Form.useForm();

  // 角色映射
  const roleMap = {
    TEAM_LEAD: { text: '团队负责人', color: 'red' },
    SENIOR_HANDLER: { text: '资深处置员', color: 'blue' },
    HANDLER: { text: '处置员', color: 'green' },
    ASSISTANT: { text: '助理', color: 'default' }
  };

  // 任务类型映射
  const taskTypeMap = {
    CASE_PROCESSING: { text: '案件处置', color: 'blue', icon: <FileTextOutlined /> },
    DOCUMENT_REVIEW: { text: '文档审核', color: 'orange', icon: <CheckCircleOutlined /> },
    COMMUNICATION: { text: '沟通协调', color: 'green', icon: <MessageOutlined /> },
    REPORTING: { text: '报告撰写', color: 'purple', icon: <BarChartOutlined /> },
    TRAINING: { text: '培训学习', color: 'cyan', icon: <TrophyOutlined /> }
  };

  // 任务状态映射
  const taskStatusMap = {
    PENDING: { text: '待开始', color: 'default' },
    IN_PROGRESS: { text: '进行中', color: 'processing' },
    REVIEW: { text: '待审核', color: 'warning' },
    COMPLETED: { text: '已完成', color: 'success' },
    CANCELLED: { text: '已取消', color: 'error' }
  };

  // 优先级映射
  const priorityMap = {
    HIGH: { text: '高', color: 'red' },
    MEDIUM: { text: '中', color: 'orange' },
    LOW: { text: '低', color: 'green' }
  };

  // 加载团队数据
  const loadTeamData = async () => {
    setLoading(true);
    try {
      // 模拟团队成员数据
      const mockMembers: TeamMember[] = [
        {
          id: 1,
          name: '张团队长',
          role: 'TEAM_LEAD',
          department: '华东调解中心',
          skills: ['债务调解', '法律咨询', '团队管理'],
          workload: 85,
          efficiency: 95,
          activeCases: 15,
          completedCases: 128,
          online: true,
          joinDate: '2023-01-15'
        },
        {
          id: 2,
          name: '李资深',
          role: 'SENIOR_HANDLER',
          department: '华东调解中心',
          skills: ['复杂案件处置', '客户沟通', '新人培训'],
          workload: 92,
          efficiency: 88,
          activeCases: 18,
          completedCases: 245,
          online: true,
          joinDate: '2023-03-20'
        },
        {
          id: 3,
          name: '王处置员',
          role: 'HANDLER',
          department: '华东调解中心',
          skills: ['电话催收', '协商谈判', '文档整理'],
          workload: 78,
          efficiency: 82,
          activeCases: 12,
          completedCases: 156,
          online: false,
          lastSeen: '2024-01-20 18:30:00',
          joinDate: '2023-06-10'
        },
        {
          id: 4,
          name: '刘助理',
          role: 'ASSISTANT',
          department: '华东调解中心',
          skills: ['数据录入', '文档管理', '客户回访'],
          workload: 65,
          efficiency: 75,
          activeCases: 8,
          completedCases: 89,
          online: true,
          joinDate: '2023-09-01'
        }
      ];

      // 模拟协作任务数据
      const mockTasks: CollaborationTask[] = [
        {
          id: 'task_1',
          title: '处置案件 JJ202400001',
          description: '联系债务人张某某，进行债务协商',
          type: 'CASE_PROCESSING',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          assigneeId: 2,
          assigneeName: '李资深',
          reporterId: 1,
          reporterName: '张团队长',
          caseId: 1,
          caseName: '张某某 - JJ202400001',
          dueDate: '2024-01-25 18:00:00',
          createdAt: '2024-01-20 09:00:00',
          updatedAt: '2024-01-21 14:30:00',
          progress: 65,
          estimatedHours: 8,
          actualHours: 5.5,
          tags: ['紧急', '高价值']
        },
        {
          id: 'task_2',
          title: '审核还款协议文档',
          description: '审核案件 JJ202400002 的还款协议文档',
          type: 'DOCUMENT_REVIEW',
          priority: 'MEDIUM',
          status: 'PENDING',
          assigneeId: 1,
          assigneeName: '张团队长',
          reporterId: 2,
          reporterName: '李资深',
          dueDate: '2024-01-24 17:00:00',
          createdAt: '2024-01-21 10:15:00',
          updatedAt: '2024-01-21 10:15:00',
          progress: 0,
          estimatedHours: 2,
          tags: ['文档审核']
        },
        {
          id: 'task_3',
          title: '新人培训 - 电话沟通技巧',
          description: '为新入职的处置员进行电话沟通技巧培训',
          type: 'TRAINING',
          priority: 'LOW',
          status: 'COMPLETED',
          assigneeId: 2,
          assigneeName: '李资深',
          reporterId: 1,
          reporterName: '张团队长',
          dueDate: '2024-01-22 16:00:00',
          createdAt: '2024-01-18 14:00:00',
          updatedAt: '2024-01-22 16:30:00',
          progress: 100,
          estimatedHours: 4,
          actualHours: 3.5,
          tags: ['培训', '技能提升']
        }
      ];

      // 模拟工作日志数据
      const mockWorkLogs: WorkLog[] = [
        {
          id: 'log_1',
          userId: 2,
          userName: '李资深',
          taskId: 'task_1',
          taskTitle: '处置案件 JJ202400001',
          workType: 'COMMUNICATION',
          duration: 45,
          description: '与债务人进行电话沟通，了解还款意愿',
          createdAt: '2024-01-21 14:30:00',
          efficiency: 85
        },
        {
          id: 'log_2',
          userId: 3,
          userName: '王处置员',
          taskId: 'task_1',
          taskTitle: '处置案件 JJ202400001',
          workType: 'DOCUMENTATION',
          duration: 30,
          description: '整理沟通记录，更新案件进展',
          createdAt: '2024-01-21 15:15:00',
          efficiency: 78
        }
      ];

      // 模拟团队统计数据
      const mockStats: TeamStats = {
        totalMembers: mockMembers.length,
        onlineMembers: mockMembers.filter(m => m.online).length,
        activeTasksCount: mockTasks.filter(t => t.status === 'IN_PROGRESS').length,
        completedTasksToday: mockTasks.filter(t => 
          t.status === 'COMPLETED' && 
          dayjs(t.updatedAt).isAfter(dayjs().startOf('day'))
        ).length,
        avgWorkload: mockMembers.reduce((sum, m) => sum + m.workload, 0) / mockMembers.length,
        avgEfficiency: mockMembers.reduce((sum, m) => sum + m.efficiency, 0) / mockMembers.length,
        teamPerformance: 87
      };

      setTeamMembers(mockMembers);
      setTasks(mockTasks);
      setWorkLogs(mockWorkLogs);
      setTeamStats(mockStats);
    } catch (error) {
      message.error('加载团队数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建/更新任务
  const handleSaveTask = async (values: any) => {
    try {
      const taskData: Partial<CollaborationTask> = {
        ...values,
        id: editingTask?.id || `task_${Date.now()}`,
        reporterId: 1, // 当前用户ID
        reporterName: '当前用户',
        assigneeName: teamMembers.find(m => m.id === values.assigneeId)?.name,
        createdAt: editingTask?.createdAt || dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        progress: editingTask?.progress || 0,
        tags: values.tags || []
      };

      if (editingTask) {
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id ? { ...task, ...taskData } : task
        ));
        message.success('任务更新成功');
      } else {
        setTasks(prev => [...prev, taskData as CollaborationTask]);
        message.success('任务创建成功');
      }

      setTaskModalVisible(false);
      setEditingTask(null);
      taskForm.resetFields();
    } catch (error) {
      message.error('保存任务失败');
    }
  };

  // 更新任务状态
  const handleUpdateTaskStatus = async (taskId: string, status: string, progress?: number) => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: status as any, 
              progress: progress !== undefined ? progress : task.progress,
              updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }
          : task
      ));
      message.success('任务状态更新成功');
    } catch (error) {
      message.error('更新任务状态失败');
    }
  };

  // 记录工作日志
  const handleAddWorkLog = async (values: any) => {
    try {
      const workLog: WorkLog = {
        id: `log_${Date.now()}`,
        userId: 1, // 当前用户ID
        userName: '当前用户',
        taskId: values.taskId,
        taskTitle: tasks.find(t => t.id === values.taskId)?.title || '',
        workType: values.workType,
        duration: values.duration,
        description: values.description,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        efficiency: values.efficiency
      };

      setWorkLogs(prev => [workLog, ...prev]);
      message.success('工作日志添加成功');
      setWorkLogModalVisible(false);
      workLogForm.resetFields();
    } catch (error) {
      message.error('添加工作日志失败');
    }
  };

  // 任务表格列定义
  const taskColumns: ColumnsType<CollaborationTask> = [
    {
      title: '任务',
      key: 'task',
      width: 300,
      render: (record: CollaborationTask) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.title}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.description}
          </div>
          <div style={{ marginTop: 8 }}>
            {record.tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 120,
      render: (type: string) => {
        const config = taskTypeMap[type as keyof typeof taskTypeMap];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (priority: string) => {
        const config = priorityMap[priority as keyof typeof priorityMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const config = taskStatusMap[status as keyof typeof taskStatusMap];
        return <Badge status={config.color as any} text={config.text} />;
      }
    },
    {
      title: '负责人',
      dataIndex: 'assigneeName',
      width: 120,
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {name}
        </Space>
      )
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small"
          strokeColor={progress === 100 ? '#52c41a' : progress > 50 ? '#1890ff' : '#faad14'}
        />
      )
    },
    {
      title: '截止时间',
      dataIndex: 'dueDate',
      width: 150,
      render: (date: string) => {
        const isOverdue = dayjs(date).isBefore(dayjs());
        return (
          <Text type={isOverdue ? 'danger' : undefined}>
            {dayjs(date).format('MM-DD HH:mm')}
          </Text>
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (record: CollaborationTask) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              setEditingTask(record);
              taskForm.setFieldsValue(record);
              setTaskModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => navigate(`/communication?caseId=${record.caseId}`)}
            disabled={!record.caseId}
          >
            沟通
          </Button>
          {record.status !== 'COMPLETED' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleUpdateTaskStatus(record.id, 'COMPLETED', 100)}
            >
              完成
            </Button>
          )}
        </Space>
      )
    }
  ];

  // 渲染团队成员卡片
  const renderMemberCard = (member: TeamMember) => (
    <Card 
      key={member.id}
      size="small"
      style={{ marginBottom: 16 }}
      onClick={() => {
        setSelectedMember(member);
        setMemberDrawerVisible(true);
      }}
      hoverable
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <Badge status={member.online ? 'success' : 'default'} dot>
          <Avatar icon={<UserOutlined />} style={{ marginRight: 12 }} />
        </Badge>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold' }}>{member.name}</div>
          <Tag color={roleMap[member.role].color}>
            {roleMap[member.role].text}
          </Tag>
        </div>
      </div>
      
      <Row gutter={8} style={{ marginBottom: 8 }}>
        <Col span={12}>
          <Statistic 
            title="工作负荷" 
            value={member.workload} 
            suffix="%" 
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="效率评分" 
            value={member.efficiency} 
            suffix="/100" 
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
      </Row>
      
      <Row gutter={8}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            活跃案件: {member.activeCases}
          </Text>
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            已完成: {member.completedCases}
          </Text>
        </Col>
      </Row>
    </Card>
  );

  useEffect(() => {
    loadTeamData();
  }, []);

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    return (
      (!taskFilters.status || task.status === taskFilters.status) &&
      (!taskFilters.priority || task.priority === taskFilters.priority) &&
      (!taskFilters.assignee || task.assigneeId.toString() === taskFilters.assignee) &&
      (!taskFilters.type || task.type === taskFilters.type)
    );
  });

  return (
    <div className="team-workspace">
      {/* 团队统计概览 */}
      {teamStats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="团队成员"
                value={teamStats.totalMembers}
                suffix="人"
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                在线: {teamStats.onlineMembers}人
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="活跃任务"
                value={teamStats.activeTasksCount}
                suffix="个"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="今日完成"
                value={teamStats.completedTasksToday}
                suffix="个"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="平均负荷"
                value={teamStats.avgWorkload}
                suffix="%"
                precision={1}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="平均效率"
                value={teamStats.avgEfficiency}
                suffix="/100"
                precision={1}
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="团队表现"
                value={teamStats.teamPerformance}
                suffix="/100"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#f56a00' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        {/* 左侧：团队成员 */}
        <Col span={6}>
          <Card 
            title="团队成员" 
            size="small"
            extra={
              <Button size="small" icon={<UserAddOutlined />}>
                邀请成员
              </Button>
            }
          >
            {loading ? (
              <Spin style={{ display: 'block', textAlign: 'center', padding: '20px 0' }} />
            ) : (
              <div style={{ maxHeight: 600, overflow: 'auto' }}>
                {teamMembers.map(renderMemberCard)}
              </div>
            )}
          </Card>
        </Col>

        {/* 中间：任务管理 */}
        <Col span={12}>
          <Card
            title="协作任务"
            size="small"
            extra={
              <Space>
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingTask(null);
                    taskForm.resetFields();
                    setTaskModalVisible(true);
                  }}
                >
                  新建任务
                </Button>
                <Button 
                  size="small" 
                  icon={<BellOutlined />}
                  onClick={() => setWorkLogModalVisible(true)}
                >
                  记录工时
                </Button>
              </Space>
            }
          >
            {/* 任务筛选 */}
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                <Select
                  placeholder="状态"
                  style={{ width: 100 }}
                  allowClear
                  value={taskFilters.status}
                  onChange={(value) => setTaskFilters(prev => ({ ...prev, status: value || '' }))}
                >
                  {Object.entries(taskStatusMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.text}</Option>
                  ))}
                </Select>
                <Select
                  placeholder="优先级"
                  style={{ width: 100 }}
                  allowClear
                  value={taskFilters.priority}
                  onChange={(value) => setTaskFilters(prev => ({ ...prev, priority: value || '' }))}
                >
                  {Object.entries(priorityMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.text}</Option>
                  ))}
                </Select>
                <Select
                  placeholder="负责人"
                  style={{ width: 120 }}
                  allowClear
                  value={taskFilters.assignee}
                  onChange={(value) => setTaskFilters(prev => ({ ...prev, assignee: value || '' }))}
                >
                  {teamMembers.map(member => (
                    <Option key={member.id} value={member.id.toString()}>
                      {member.name}
                    </Option>
                  ))}
                </Select>
                <Select
                  placeholder="类型"
                  style={{ width: 120 }}
                  allowClear
                  value={taskFilters.type}
                  onChange={(value) => setTaskFilters(prev => ({ ...prev, type: value || '' }))}
                >
                  {Object.entries(taskTypeMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.text}</Option>
                  ))}
                </Select>
              </Space>
            </div>

            <Table
              columns={taskColumns}
              dataSource={filteredTasks}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
              scroll={{ y: 400 }}
            />
          </Card>
        </Col>

        {/* 右侧：工作日志和活动时间线 */}
        <Col span={6}>
          <Tabs defaultActiveKey="1" size="small">
            <TabPane tab="工作日志" key="1">
              <div style={{ maxHeight: 600, overflow: 'auto' }}>
                {workLogs.length > 0 ? (
                  <Timeline>
                    {workLogs.map(log => (
                      <Timeline.Item key={log.id}>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ fontWeight: 'bold' }}>
                            {log.userName}
                          </div>
                          <div style={{ color: '#666' }}>
                            {log.description}
                          </div>
                          <div style={{ color: '#999', marginTop: 4 }}>
                            {dayjs(log.createdAt).format('MM-DD HH:mm')} · {log.duration}分钟
                          </div>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty description="暂无工作日志" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </TabPane>
            
            <TabPane tab="团队动态" key="2">
              <div style={{ maxHeight: 600, overflow: 'auto' }}>
                <Timeline>
                  <Timeline.Item color="green">
                    <div style={{ fontSize: '12px' }}>
                      <div>李资深 完成了任务</div>
                      <div style={{ color: '#666' }}>新人培训 - 电话沟通技巧</div>
                      <div style={{ color: '#999' }}>2小时前</div>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <div style={{ fontSize: '12px' }}>
                      <div>张团队长 创建了任务</div>
                      <div style={{ color: '#666' }}>审核还款协议文档</div>
                      <div style={{ color: '#999' }}>4小时前</div>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item>
                    <div style={{ fontSize: '12px' }}>
                      <div>王处置员 更新了进展</div>
                      <div style={{ color: '#666' }}>案件 JJ202400001</div>
                      <div style={{ color: '#999' }}>6小时前</div>
                    </div>
                  </Timeline.Item>
                </Timeline>
              </div>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* 任务创建/编辑弹窗 */}
      <Modal
        title={editingTask ? '编辑任务' : '创建任务'}
        open={taskModalVisible}
        onCancel={() => {
          setTaskModalVisible(false);
          setEditingTask(null);
          taskForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleSaveTask}
        >
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="任务类型"
                rules={[{ required: true, message: '请选择任务类型' }]}
              >
                <Select placeholder="选择任务类型">
                  {Object.entries(taskTypeMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="选择优先级">
                  {Object.entries(priorityMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assigneeId"
                label="负责人"
                rules={[{ required: true, message: '请选择负责人' }]}
              >
                <Select placeholder="选择负责人">
                  {teamMembers.map(member => (
                    <Option key={member.id} value={member.id}>
                      {member.name} - {roleMap[member.role].text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estimatedHours"
                label="预估工时"
                rules={[{ required: true, message: '请输入预估工时' }]}
              >
                <Input suffix="小时" placeholder="0" type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dueDate"
            label="截止时间"
            rules={[{ required: true, message: '请选择截止时间' }]}
          >
            <DatePicker
              showTime
              placeholder="选择截止时间"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item name="caseId" label="关联案件">
            <Select placeholder="选择关联案件（可选）" allowClear>
              <Option value={1}>张某某 - JJ202400001</Option>
              <Option value={2}>赵某某 - JJ202400002</Option>
              <Option value={3}>李某某 - JJ202400003</Option>
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="添加标签" style={{ width: '100%' }}>
              <Option value="紧急">紧急</Option>
              <Option value="高价值">高价值</Option>
              <Option value="培训">培训</Option>
              <Option value="技能提升">技能提升</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setTaskModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 工作日志记录弹窗 */}
      <Modal
        title="记录工作日志"
        open={workLogModalVisible}
        onCancel={() => {
          setWorkLogModalVisible(false);
          workLogForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={workLogForm}
          layout="vertical"
          onFinish={handleAddWorkLog}
        >
          <Form.Item
            name="taskId"
            label="关联任务"
            rules={[{ required: true, message: '请选择关联任务' }]}
          >
            <Select placeholder="选择任务">
              {tasks.filter(t => t.status !== 'COMPLETED').map(task => (
                <Option key={task.id} value={task.id}>
                  {task.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="workType"
            label="工作类型"
            rules={[{ required: true, message: '请选择工作类型' }]}
          >
            <Select placeholder="选择工作类型">
              <Option value="COMMUNICATION">沟通协调</Option>
              <Option value="PROCESSING">案件处置</Option>
              <Option value="DOCUMENTATION">文档整理</Option>
              <Option value="REVIEW">审核检查</Option>
              <Option value="MEETING">会议讨论</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label="工时(分钟)"
            rules={[{ required: true, message: '请输入工作时长' }]}
          >
            <Input type="number" placeholder="60" min={1} />
          </Form.Item>

          <Form.Item
            name="description"
            label="工作描述"
            rules={[{ required: true, message: '请输入工作描述' }]}
          >
            <TextArea rows={3} placeholder="描述本次工作内容..." />
          </Form.Item>

          <Form.Item
            name="efficiency"
            label="效率评分"
            rules={[{ required: true, message: '请选择效率评分' }]}
          >
            <Select placeholder="选择效率评分">
              <Option value={90}>优秀 (90分)</Option>
              <Option value={80}>良好 (80分)</Option>
              <Option value={70}>一般 (70分)</Option>
              <Option value={60}>较差 (60分)</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setWorkLogModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 成员详情抽屉 */}
      <Drawer
        title="成员详情"
        placement="right"
        onClose={() => setMemberDrawerVisible(false)}
        open={memberDrawerVisible}
        width={400}
      >
        {selectedMember && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={64} icon={<UserOutlined />} />
              <div style={{ marginTop: 12 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedMember.name}
                </Title>
                <Tag color={roleMap[selectedMember.role].color}>
                  {roleMap[selectedMember.role].text}
                </Tag>
              </div>
              <Badge 
                status={selectedMember.online ? 'success' : 'default'} 
                text={selectedMember.online ? '在线' : `离线 - ${selectedMember.lastSeen ? dayjs(selectedMember.lastSeen).fromNow() : '未知'}`}
              />
            </div>

            <Divider />

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Card size="small">
                  <Statistic 
                    title="工作负荷" 
                    value={selectedMember.workload} 
                    suffix="%" 
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic 
                    title="效率评分" 
                    value={selectedMember.efficiency} 
                    suffix="/100" 
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Card size="small">
                  <Statistic 
                    title="活跃案件" 
                    value={selectedMember.activeCases} 
                    suffix="件" 
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic 
                    title="已完成" 
                    value={selectedMember.completedCases} 
                    suffix="件" 
                  />
                </Card>
              </Col>
            </Row>

            <Card title="技能标签" size="small" style={{ marginBottom: 16 }}>
              {selectedMember.skills.map(skill => (
                <Tag key={skill} color="blue" style={{ marginBottom: 4 }}>
                  {skill}
                </Tag>
              ))}
            </Card>

            <Card title="基本信息" size="small">
              <p><strong>部门:</strong> {selectedMember.department}</p>
              <p><strong>入职时间:</strong> {dayjs(selectedMember.joinDate).format('YYYY-MM-DD')}</p>
              <p><strong>工作天数:</strong> {dayjs().diff(selectedMember.joinDate, 'day')}天</p>
            </Card>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Space>
                <Button 
                  type="primary"
                  onClick={() => navigate(`/communication?userId=${selectedMember.id}`)}
                >
                  发起沟通
                </Button>
                <Button>
                  分配任务
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TeamWorkspace;