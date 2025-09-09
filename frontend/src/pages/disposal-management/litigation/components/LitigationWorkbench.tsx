import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  List,
  Badge,
  Progress,
  Space,
  Typography,
  Avatar,
  Tag,
  Divider,
  Calendar,
  Alert,
  Timeline,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Table,
  Tabs
} from 'antd';
import {
  BankOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  AlertOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  PlusOutlined,
  SendOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface TodoItem {
  id: string;
  title: string;
  type: 'filing' | 'trial' | 'execution' | 'document';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  caseNumber: string;
  status: 'pending' | 'processing' | 'completed';
  description?: string;
}

interface LitigationAlert {
  id: string;
  type: 'deadline' | 'court_notice' | 'document_required' | 'payment_due';
  title: string;
  message: string;
  caseNumber: string;
  urgency: 'high' | 'medium' | 'low';
  createdTime: string;
  resolved: boolean;
}

interface UpcomingHearing {
  id: string;
  caseNumber: string;
  debtorName: string;
  court: string;
  hearingTime: string;
  hearingType: '开庭审理' | '证据交换' | '调解' | '宣判';
  preparationStatus: 'completed' | 'partial' | 'pending';
  lawyer: string;
}

const LitigationWorkbench: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [alerts, setAlerts] = useState<LitigationAlert[]>([]);
  const [upcomingHearings, setUpcomingHearings] = useState<UpcomingHearing[]>([]);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [hearingModalVisible, setHearingModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<LitigationAlert | null>(null);
  const [selectedHearing, setSelectedHearing] = useState<UpcomingHearing | null>(null);
  const [batchFilingModalVisible, setBatchFilingModalVisible] = useState(false);
  const [quickReportModalVisible, setQuickReportModalVisible] = useState(false);
  const [batchNotificationModalVisible, setBatchNotificationModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [batchFilingForm] = Form.useForm();
  const [quickReportForm] = Form.useForm();
  const [batchNotificationForm] = Form.useForm();
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [batchFilingLoading, setBatchFilingLoading] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [notificationSending, setNotificationSending] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadWorkbenchData();
  }, []);

  const loadWorkbenchData = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: '提交网上立案材料',
          type: 'filing',
          priority: 'high',
          deadline: '2024-02-10 17:00:00',
          caseNumber: 'LIT-2024-001',
          status: 'pending',
          description: '需要完成起诉状修改并提交到北京法院立案系统'
        },
        {
          id: '2',
          title: '准备庭审材料',
          type: 'trial',
          priority: 'high',
          deadline: '2024-02-12 09:00:00',
          caseNumber: 'LIT-2024-002',
          status: 'processing',
          description: '整理证据材料，准备代理词和质证意见'
        },
        {
          id: '3',
          title: '申请财产保全',
          type: 'execution',
          priority: 'medium',
          deadline: '2024-02-15 16:00:00',
          caseNumber: 'LIT-2024-003',
          status: 'pending',
          description: '向法院申请查封债务人银行账户和房产'
        }
      ];

      const mockAlerts: LitigationAlert[] = [
        {
          id: '1',
          type: 'court_notice',
          title: '开庭通知',
          message: '案件LIT-2024-001将于2024年2月15日上午9:30在北京市朝阳区法院第3法庭开庭审理',
          caseNumber: 'LIT-2024-001',
          urgency: 'high',
          createdTime: '2024-02-08 14:30:00',
          resolved: false
        },
        {
          id: '2',
          type: 'document_required',
          title: '补充材料通知',
          message: '法院要求在3个工作日内补充债务人财产证明材料',
          caseNumber: 'LIT-2024-002',
          urgency: 'medium',
          createdTime: '2024-02-07 10:15:00',
          resolved: false
        }
      ];

      const mockHearings: UpcomingHearing[] = [
        {
          id: '1',
          caseNumber: 'LIT-2024-001',
          debtorName: '王五',
          court: '北京市朝阳区法院',
          hearingTime: '2024-02-15 09:30:00',
          hearingType: '开庭审理',
          preparationStatus: 'partial',
          lawyer: '李律师'
        },
        {
          id: '2',
          caseNumber: 'LIT-2024-002',
          debtorName: '赵六',
          court: '北京市海淀区法院',
          hearingTime: '2024-02-18 14:00:00',
          hearingType: '证据交换',
          preparationStatus: 'pending',
          lawyer: '张律师'
        }
      ];

      setTodoItems(mockTodos);
      setAlerts(mockAlerts);
      setUpcomingHearings(mockHearings);
    } catch (error) {
      console.error('加载工作台数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const todayStats = {
    totalCases: 156,
    newFilings: 12,
    upcomingHearings: 5,
    urgentTasks: 8,
    completedTasks: 23,
    pendingExecutions: 15
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'blue';
  };

  const getUrgencyColor = (urgency: string) => {
    return urgency === 'high' ? 'error' : urgency === 'medium' ? 'warning' : 'info';
  };

  const getPreparationStatusColor = (status: string) => {
    return status === 'completed' ? 'success' : status === 'partial' ? 'warning' : 'default';
  };

  const handleProcessTodo = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setProcessModalVisible(true);
    form.setFieldsValue({
      title: todo.title,
      description: todo.description,
      status: todo.status,
      deadline: dayjs(todo.deadline)
    });
  };

  const handleProcessAlert = (alert: LitigationAlert) => {
    setSelectedAlert(alert);
    setAlertModalVisible(true);
  };

  const handleProcessAlertAsync = async (alert: LitigationAlert) => {
    try {
      setLoading(true);
      // 模拟处理提醒的API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新提醒状态
      setAlerts(prev => prev.map(a => 
        a.id === alert.id ? { ...a, resolved: true } : a
      ));
      
      message.success('提醒已处理');
    } catch (error) {
      message.error('处理失败');
    } finally {
      setLoading(false);
    }
  };

  const handleHearingPreparation = (hearing: UpcomingHearing) => {
    setSelectedHearing(hearing);
    setHearingModalVisible(true);
  };

  const handleTodoSubmit = async (values: any) => {
    try {
      console.log('更新待办事项:', values);
      message.success('待办事项更新成功');
      setProcessModalVisible(false);
      loadWorkbenchData();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      console.log('处理提醒:', alertId);
      message.success('提醒已处理');
      setAlertModalVisible(false);
      loadWorkbenchData();
    } catch (error) {
      message.error('处理失败');
    }
  };

  const handleBatchFiling = () => {
    setBatchFilingModalVisible(true);
  };

  const handleQuickReport = () => {
    setQuickReportModalVisible(true);
  };

  const handleBatchNotification = () => {
    setBatchNotificationModalVisible(true);
  };

  // 增强的Modal关闭处理函数
  const handleCloseProcessModal = () => {
    setProcessModalVisible(false);
    form.resetFields();
    setSelectedTodo(null);
  };

  const handleCloseAlertModal = () => {
    setAlertModalVisible(false);
    setSelectedAlert(null);
  };

  const handleCloseHearingModal = () => {
    setHearingModalVisible(false);
    setSelectedHearing(null);
  };

  const handleCloseBatchFilingModal = () => {
    setBatchFilingModalVisible(false);
    batchFilingForm.resetFields();
    setSelectedCases([]);
    setBatchFilingLoading(false);
  };

  const handleCloseQuickReportModal = () => {
    setQuickReportModalVisible(false);
    quickReportForm.resetFields();
    setReportGenerating(false);
  };

  const handleCloseBatchNotificationModal = () => {
    setBatchNotificationModalVisible(false);
    batchNotificationForm.resetFields();
    setNotificationSending(false);
  };


  // 批量立案处理
  const handleBatchFilingSubmit = async () => {
    try {
      setBatchFilingLoading(true);
      const values = await batchFilingForm.validateFields();
      
      // 模拟批量立案API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success(`成功提交 ${selectedCases.length} 个案件的立案申请`);
      handleCloseBatchFilingModal();
      
      // 刷新数据
      loadWorkbenchData();
    } catch (error) {
      message.error('立案提交失败');
    } finally {
      setBatchFilingLoading(false);
    }
  };

  // 生成报告处理
  const handleReportGenerate = async () => {
    try {
      setReportGenerating(true);
      const values = await quickReportForm.validateFields();
      
      // 模拟报告生成API调用
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      message.success('报告生成成功，已发送至您的邮箱');
      setQuickReportModalVisible(false);
      quickReportForm.resetFields();
    } catch (error) {
      message.error('报告生成失败');
    } finally {
      setReportGenerating(false);
    }
  };

  // 批量通知处理
  const handleNotificationSend = async () => {
    try {
      setNotificationSending(true);
      const values = await batchNotificationForm.validateFields();
      
      // 模拟发送通知API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success(`通知已发送给 ${values.recipients.length} 个对象`);
      setBatchNotificationModalVisible(false);
      batchNotificationForm.resetFields();
    } catch (error) {
      message.error('通知发送失败');
    } finally {
      setNotificationSending(false);
    }
  };

  const todoColumns = [
    {
      title: '任务',
      key: 'task',
      render: (todo: TodoItem) => (
        <Space direction="vertical" size="small">
          <Text strong>{todo.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{todo.caseNumber}</Text>
        </Space>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
        </Tag>
      )
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'success' : status === 'processing' ? 'processing' : 'default'}>
          {status === 'completed' ? '已完成' : status === 'processing' ? '处理中' : '待处理'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (todo: TodoItem) => (
        <Space>
          <Button size="small" type="link" onClick={() => handleProcessTodo(todo)}>
            处理
          </Button>
          <Button size="small" type="link">
            详情
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 头部工具栏 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={3}>
            <BankOutlined style={{ marginRight: '8px' }} />
            诉讼工作台
          </Title>
        </Col>
        <Col>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleBatchFiling}>
              批量立案
            </Button>
            <Button icon={<FileTextOutlined />} onClick={handleQuickReport}>
              生成报告
            </Button>
            <Button icon={<SendOutlined />} onClick={handleBatchNotification}>
              批量通知
            </Button>
          </Space>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="工作概览" key="overview">
          {/* 今日统计 */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col span={4}>
              <Card>
                <Statistic
                  title="案件总数"
                  value={todayStats.totalCases}
                  prefix={<BankOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="今日立案"
                  value={todayStats.newFilings}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="即将开庭"
                  value={todayStats.upcomingHearings}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="紧急任务"
                  value={todayStats.urgentTasks}
                  prefix={<AlertOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="已完成"
                  value={todayStats.completedTasks}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="执行中"
                  value={todayStats.pendingExecutions}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* 左侧 - 待办任务和提醒 */}
            <Col span={16}>
              {/* 重要提醒 */}
              {alerts.filter(alert => !alert.resolved).length > 0 && (
                <Card title="重要提醒" style={{ marginBottom: '16px' }}>
                  <List
                    dataSource={alerts.filter(alert => !alert.resolved)}
                    renderItem={alert => (
                      <List.Item
                        actions={[
                          <Button size="small" type="link" onClick={() => handleProcessAlert(alert)}>
                            查看
                          </Button>,
                          <Button size="small" type="primary" onClick={() => handleProcessAlertAsync(alert)}>
                            处理
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Badge status={getUrgencyColor(alert.urgency) as any} />
                          }
                          title={
                            <Space>
                              <Text strong>{alert.title}</Text>
                              <Tag>{alert.caseNumber}</Tag>
                            </Space>
                          }
                          description={
                            <div>
                              <div>{alert.message}</div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {dayjs(alert.createdTime).format('MM-DD HH:mm')}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              )}

              {/* 今日待办 */}
              <Card 
                title="今日待办" 
                extra={
                  <Space>
                    <Text type="secondary">共 {todoItems.length} 项</Text>
                    <Button size="small" type="link">
                      查看全部
                    </Button>
                  </Space>
                }
              >
                <Table
                  columns={todoColumns}
                  dataSource={todoItems.slice(0, 5)}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            </Col>

            {/* 右侧 - 开庭安排和快捷操作 */}
            <Col span={8}>
              {/* 近期开庭 */}
              <Card title="近期开庭" style={{ marginBottom: '16px' }}>
                <List
                  dataSource={upcomingHearings.slice(0, 3)}
                  renderItem={hearing => (
                    <List.Item
                      actions={[
                        <Button 
                          size="small" 
                          type="link" 
                          onClick={() => handleHearingPreparation(hearing)}
                        >
                          准备
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<CalendarOutlined />}
                        title={
                          <Space>
                            <Text strong>{hearing.caseNumber}</Text>
                            <Tag color={getPreparationStatusColor(hearing.preparationStatus)}>
                              {hearing.preparationStatus === 'completed' ? '已准备' : 
                               hearing.preparationStatus === 'partial' ? '部分完成' : '待准备'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <div>{hearing.debtorName} | {hearing.court}</div>
                            <div style={{ color: '#fa541c' }}>
                              {dayjs(hearing.hearingTime).format('MM-DD HH:mm')} {hearing.hearingType}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* 快捷操作 */}
              <Card title="快捷操作">
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Button block size="small" icon={<PlusOutlined />}>
                      新建案件
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button block size="small" icon={<EditOutlined />}>
                      起草文书
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button block size="small" icon={<CalendarOutlined />}>
                      安排开庭
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button block size="small" icon={<DollarOutlined />}>
                      执行申请
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button block size="small" icon={<PhoneOutlined />}>
                      联系法院
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button block size="small" icon={<EyeOutlined />}>
                      查看进度
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="进度跟踪" key="tracking">
          <Card title="案件进度跟踪">
            <Timeline>
              <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                <Text strong>立案成功</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>2小时前</Text>
                <div>案件LIT-2024-012已成功在北京市朝阳区法院立案</div>
              </Timeline.Item>
              <Timeline.Item color="blue" dot={<FileTextOutlined />}>
                <Text strong>材料提交</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>4小时前</Text>
                <div>向法院提交了5个案件的补充证据材料</div>
              </Timeline.Item>
              <Timeline.Item color="orange" dot={<ClockCircleOutlined />}>
                <Text strong>开庭通知</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>1天前</Text>
                <div>收到3个案件的开庭通知，开庭时间已安排</div>
              </Timeline.Item>
              <Timeline.Item dot={<CalendarOutlined />}>
                <Text strong>批量立案</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>2天前</Text>
                <div>成功提交15个案件的网上立案申请</div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </TabPane>

        <TabPane tab="效率统计" key="statistics">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="本周业绩">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title="立案成功" value={28} suffix="件" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="胜诉率" value={85.2} suffix="%" />
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title="执行回款" value={156.8} suffix="万元" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="平均周期" value={45} suffix="天" />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="律师排行">
                <List
                  dataSource={[
                    { name: '李律师', cases: 23, rate: 92.1 },
                    { name: '张律师', cases: 18, rate: 88.9 },
                    { name: '王律师', cases: 15, rate: 86.7 }
                  ]}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Badge count={index + 1} style={{ 
                            backgroundColor: index === 0 ? '#f5222d' : '#faad14' 
                          }}>
                            <Avatar icon={<UserOutlined />} />
                          </Badge>
                        }
                        title={item.name}
                        description={`${item.cases}件 · 成功率${item.rate}%`}
                      />
                      {index === 0 && <TrophyOutlined style={{ color: '#faad14' }} />}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 处理待办事项弹窗 */}
      <Modal
        title="处理待办事项"
        open={processModalVisible}
        onCancel={handleCloseProcessModal}
        onOk={() => form.submit()}
        width={600}
        destroyOnClose={true}
      >
        <Form form={form} layout="vertical" onFinish={handleTodoSubmit}>
          <Form.Item label="任务标题" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="任务描述" name="description">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item label="完成状态" name="status">
            <Select>
              <Option value="pending">待处理</Option>
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
          <Form.Item label="截止时间" name="deadline">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="处理备注" name="notes">
            <TextArea rows={2} placeholder="请输入处理备注..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 处理提醒弹窗 */}
      <Modal
        title="处理提醒"
        open={alertModalVisible}
        onCancel={handleCloseAlertModal}
        destroyOnClose={true}
        footer={[
          <Button key="cancel" onClick={handleCloseAlertModal}>
            取消
          </Button>,
          <Button 
            key="resolve" 
            type="primary" 
            onClick={() => selectedAlert && handleResolveAlert(selectedAlert.id)}
          >
            标记已处理
          </Button>
        ]}
      >
        {selectedAlert && (
          <div>
            <Alert
              message={selectedAlert.title}
              description={selectedAlert.message}
              type={selectedAlert.urgency === 'high' ? 'error' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div>
              <Text strong>案件编号：</Text>
              <Text>{selectedAlert.caseNumber}</Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text strong>创建时间：</Text>
              <Text>{dayjs(selectedAlert.createdTime).format('YYYY-MM-DD HH:mm')}</Text>
            </div>
          </div>
        )}
      </Modal>

      {/* 庭审准备弹窗 */}
      <Modal
        title="庭审准备"
        open={hearingModalVisible}
        onCancel={handleCloseHearingModal}
        width={800}
        destroyOnClose={true}
        footer={[
          <Button key="cancel" onClick={handleCloseHearingModal}>
            关闭
          </Button>,
          <Button key="prepare" type="primary">
            完成准备
          </Button>
        ]}
      >
        {selectedHearing && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <div><strong>案件编号：</strong>{selectedHearing.caseNumber}</div>
                  <div><strong>债务人：</strong>{selectedHearing.debtorName}</div>
                  <div><strong>开庭法院：</strong>{selectedHearing.court}</div>
                  <div><strong>开庭时间：</strong>{dayjs(selectedHearing.hearingTime).format('YYYY-MM-DD HH:mm')}</div>
                  <div><strong>庭审类型：</strong>{selectedHearing.hearingType}</div>
                  <div><strong>承办律师：</strong>{selectedHearing.lawyer}</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="准备进度">
                  <List
                    size="small"
                    dataSource={[
                      { item: '起诉状', status: 'completed' },
                      { item: '证据材料', status: 'completed' },
                      { item: '代理词', status: 'partial' },
                      { item: '质证意见', status: 'pending' }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <Space>
                          <Text>{item.item}</Text>
                          <Tag color={getPreparationStatusColor(item.status)}>
                            {item.status === 'completed' ? '已完成' : 
                             item.status === 'partial' ? '进行中' : '未开始'}
                          </Tag>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* 批量立案弹窗 */}
      <Modal
        title="批量立案"
        open={batchFilingModalVisible}
        onCancel={handleCloseBatchFilingModal}
        width={800}
        destroyOnClose={true}
        footer={[
          <Button key="cancel" onClick={handleCloseBatchFilingModal} disabled={batchFilingLoading}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleBatchFilingSubmit}
            loading={batchFilingLoading}
          >
            开始立案
          </Button>
        ]}
      >
        <div>
          <Alert
            message="批量立案功能"
            description="可同时处理多个案件的立案申请，支持自动分配法院和文书生成"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form form={batchFilingForm} layout="vertical">
            <Form.Item 
              label="选择案件" 
              name="selectedCases"
              rules={[{ required: true, message: '请选择要立案的案件' }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择要立案的案件"
                style={{ width: '100%' }}
                onChange={setSelectedCases}
              >
                <Option value="CASE-2024-001">CASE-2024-001 - 张三债务纠纷</Option>
                <Option value="CASE-2024-002">CASE-2024-002 - 李四借贷纠纷</Option>
                <Option value="CASE-2024-003">CASE-2024-003 - 王五合同纠纷</Option>
                <Option value="CASE-2024-004">CASE-2024-004 - 赵六金融借款</Option>
                <Option value="CASE-2024-005">CASE-2024-005 - 钱七信用卡纠纷</Option>
              </Select>
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label="立案方式" 
                  name="filingType"
                  initialValue="online"
                  rules={[{ required: true, message: '请选择立案方式' }]}
                >
                  <Select style={{ width: '100%' }}>
                    <Option value="online">网上立案</Option>
                    <Option value="offline">线下立案</Option>
                    <Option value="mixed">混合模式</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label="目标法院" 
                  name="targetCourt"
                  rules={[{ required: true, message: '请选择目标法院' }]}
                >
                  <Select placeholder="请选择法院" style={{ width: '100%' }}>
                    <Option value="court1">广州市天河区人民法院</Option>
                    <Option value="court2">深圳市南山区人民法院</Option>
                    <Option value="court3">佛山市禅城区人民法院</Option>
                    <Option value="auto">自动分配</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              label="诉讼请求模板" 
              name="claimTemplate"
              rules={[{ required: true, message: '请选择诉讼请求模板' }]}
            >
              <Select placeholder="请选择模板" style={{ width: '100%' }}>
                <Option value="debt_recovery">债务追讨标准模板</Option>
                <Option value="loan_dispute">借贷纠纷标准模板</Option>
                <Option value="contract_dispute">合同纠纷标准模板</Option>
                <Option value="custom">自定义模板</Option>
              </Select>
            </Form.Item>

            <Form.Item label="特殊说明" name="specialNotes">
              <TextArea 
                rows={3} 
                placeholder="如有特殊要求或说明，请在此填写..." 
              />
            </Form.Item>

            <Alert
              message="立案预估"
              description={
                <div>
                  <div>预计处理时间：3-5个工作日</div>
                  <div>预计费用：每案件 ¥200-500 元</div>
                  <div>已选择案件数：{selectedCases.length} 个</div>
                </div>
              }
              type="warning"
              showIcon
            />
          </Form>
        </div>
      </Modal>

      {/* 生成报告弹窗 */}
      <Modal
        title="生成报告"
        open={quickReportModalVisible}
        onCancel={handleCloseQuickReportModal}
        width={700}
        destroyOnClose={true}
        footer={[
          <Button key="cancel" onClick={handleCloseQuickReportModal} disabled={reportGenerating}>
            取消
          </Button>,
          <Button 
            key="generate" 
            type="primary"
            onClick={handleReportGenerate}
            loading={reportGenerating}
          >
            生成报告
          </Button>
        ]}
      >
        <div>
          <Alert
            message="快速报告生成"
            description="支持多种报告格式和数据维度，生成后可下载或发送至邮箱"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form form={quickReportForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label="报告类型" 
                  name="reportType"
                  initialValue="weekly"
                  rules={[{ required: true, message: '请选择报告类型' }]}
                >
                  <Select>
                    <Option value="daily">日报</Option>
                    <Option value="weekly">周报</Option>
                    <Option value="monthly">月报</Option>
                    <Option value="quarterly">季度报告</Option>
                    <Option value="custom">自定义时间</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label="报告格式" 
                  name="format"
                  initialValue="pdf"
                  rules={[{ required: true, message: '请选择报告格式' }]}
                >
                  <Select>
                    <Option value="pdf">PDF 格式</Option>
                    <Option value="excel">Excel 格式</Option>
                    <Option value="word">Word 格式</Option>
                    <Option value="html">网页格式</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              label="包含内容" 
              name="contents"
              initialValue={['cases', 'performance']}
              rules={[{ required: true, message: '请选择报告内容' }]}
            >
              <Select mode="multiple" placeholder="请选择报告包含的内容">
                <Option value="cases">案件统计</Option>
                <Option value="performance">业绩分析</Option>
                <Option value="efficiency">效率指标</Option>
                <Option value="trends">趋势预测</Option>
                <Option value="financial">财务数据</Option>
                <Option value="court">法院分布</Option>
                <Option value="lawyer">律师业绩</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              label="时间范围" 
              name="dateRange"
              rules={[{ required: true, message: '请选择时间范围' }]}
            >
              <RangePicker 
                style={{ width: '100%' }}
                defaultValue={[dayjs().subtract(7, 'day'), dayjs()]}
              />
            </Form.Item>

            <Form.Item label="筛选条件" name="filters">
              <Select mode="multiple" placeholder="选择数据筛选条件（可选）">
                <Option value="status_processing">进行中案件</Option>
                <Option value="status_completed">已完成案件</Option>
                <Option value="high_amount">高金额案件</Option>
                <Option value="urgent">紧急案件</Option>
                <Option value="specific_court">特定法院</Option>
              </Select>
            </Form.Item>

            <Form.Item label="发送方式" name="deliveryMethod" initialValue="download">
              <Select>
                <Option value="download">直接下载</Option>
                <Option value="email">发送到邮箱</Option>
                <Option value="both">下载并发送邮箱</Option>
              </Select>
            </Form.Item>

            <Form.Item label="备注说明" name="remarks">
              <TextArea 
                rows={2} 
                placeholder="可添加报告的特殊说明或要求..." 
              />
            </Form.Item>

            <Alert
              message="生成预估"
              description={
                <div>
                  <div>预计生成时间：2-5分钟</div>
                  <div>支持的最大数据量：10,000条记录</div>
                  <div>报告将包含图表和详细数据分析</div>
                </div>
              }
              type="success"
              showIcon
            />
          </Form>
        </div>
      </Modal>

      {/* 批量通知弹窗 */}
      <Modal
        title="批量通知"
        open={batchNotificationModalVisible}
        onCancel={handleCloseBatchNotificationModal}
        width={700}
        destroyOnClose={true}
        footer={[
          <Button key="cancel" onClick={handleCloseBatchNotificationModal} disabled={notificationSending}>
            取消
          </Button>,
          <Button 
            key="send" 
            type="primary"
            onClick={handleNotificationSend}
            loading={notificationSending}
          >
            发送通知
          </Button>
        ]}
      >
        <div>
          <Alert
            message="批量通知功能"
            description="支持向相关人员批量发送短信、邮件和系统通知，确保重要信息及时传达"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form form={batchNotificationForm} layout="vertical">
            <Form.Item 
              label="通知对象" 
              name="recipients"
              rules={[{ required: true, message: '请选择通知对象' }]}
            >
              <Select mode="multiple" placeholder="请选择要通知的对象">
                <Option value="lawyers">案件律师</Option>
                <Option value="clients">当事人</Option>
                <Option value="assistants">法律助理</Option>
                <Option value="managers">部门经理</Option>
                <Option value="courts">法院联系人</Option>
                <Option value="custom">自定义联系人</Option>
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label="通知方式" 
                  name="notificationMethod"
                  initialValue={['system']}
                  rules={[{ required: true, message: '请选择通知方式' }]}
                >
                  <Select mode="multiple">
                    <Option value="system">系统通知</Option>
                    <Option value="email">邮件通知</Option>
                    <Option value="sms">短信通知</Option>
                    <Option value="wechat">微信通知</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label="优先级" 
                  name="priority"
                  initialValue="medium"
                  rules={[{ required: true, message: '请选择通知优先级' }]}
                >
                  <Select>
                    <Option value="high">高优先级</Option>
                    <Option value="medium">普通优先级</Option>
                    <Option value="low">低优先级</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              label="通知模板" 
              name="template"
              rules={[{ required: true, message: '请选择通知模板' }]}
            >
              <Select placeholder="请选择通知模板">
                <Option value="hearing_reminder">开庭提醒模板</Option>
                <Option value="deadline_alert">截止日期提醒</Option>
                <Option value="document_request">文件提交请求</Option>
                <Option value="case_update">案件进度更新</Option>
                <Option value="payment_notice">费用缴纳通知</Option>
                <Option value="custom">自定义模板</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              label="通知标题" 
              name="title"
              rules={[{ required: true, message: '请输入通知标题' }]}
            >
              <Input placeholder="请输入通知标题" maxLength={50} />
            </Form.Item>

            <Form.Item 
              label="通知内容" 
              name="content"
              rules={[{ required: true, message: '请输入通知内容' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="请输入通知的具体内容..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item label="定时发送" name="scheduledTime">
              <DatePicker 
                showTime 
                placeholder="选择发送时间（留空则立即发送）"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Form.Item label="附加选项" name="additionalOptions">
              <Select mode="multiple" placeholder="选择附加选项（可选）">
                <Option value="require_confirmation">要求确认回执</Option>
                <Option value="auto_remind">自动提醒</Option>
                <Option value="urgent_mark">标记为紧急</Option>
                <Option value="cc_manager">抄送给经理</Option>
              </Select>
            </Form.Item>

            <Alert
              message="发送预估"
              description={
                <div>
                  <div>预计发送时间：1-2分钟</div>
                  <div>支持发送记录追踪和统计</div>
                  <div>失败通知将自动重试</div>
                </div>
              }
              type="success"
              showIcon
            />
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default LitigationWorkbench;