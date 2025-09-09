import React, { useState } from 'react';
import { Card, Row, Col, List, Badge, Avatar, Button, Tag, Space, Typography, Progress, Tooltip, Modal, Form, Input, Select, DatePicker, message, Drawer, Table } from 'antd';
import {
  ClockCircleOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TodoItem {
  id: string;
  type: 'contact' | 'appointment' | 'mediation' | 'follow';
  title: string;
  description: string;
  time?: string;
  priority: 'high' | 'medium' | 'low';
  caseNumber: string;
  debtorName: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'postponed';
}

interface TodayWork {
  appointments: number;
  dueCases: number;
  expectedPayments: number;
  totalAmount: number;
}

const CaseWorkbench: React.FC = () => {
  // 状态管理
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [postponeModalVisible, setPostponeModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [allTodosDrawerVisible, setAllTodosDrawerVisible] = useState(false);
  const [batchCallModalVisible, setBatchCallModalVisible] = useState(false);
  const [batchAppointmentModalVisible, setBatchAppointmentModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟待办事项数据
  const initialTodoItems: TodoItem[] = [
    {
      id: '1',
      type: 'contact',
      title: '首次联系债务人',
      description: '需要进行首次电话联系，了解还款意愿',
      priority: 'high',
      caseNumber: 'MED-2024-003',
      debtorName: '王先生',
      amount: 35000,
      time: '10:00',
      status: 'pending'
    },
    {
      id: '2',
      type: 'appointment',
      title: '调解预约确认',
      description: '确认明天下午的调解时间和地点',
      priority: 'medium',
      caseNumber: 'MED-2024-001',
      debtorName: '张女士',
      amount: 50000,
      time: '14:00',
      status: 'pending'
    },
    {
      id: '3',
      type: 'follow',
      title: '还款跟进',
      description: '跟进本月15日的还款承诺',
      priority: 'high',
      caseNumber: 'MED-2024-002',
      debtorName: '李先生',
      amount: 30000,
      time: '16:00',
      status: 'pending'
    },
    {
      id: '4',
      type: 'mediation',
      title: '准备调解材料',
      description: '整理债权证明、还款记录等材料',
      priority: 'medium',
      caseNumber: 'MED-2024-004',
      debtorName: '赵女士',
      amount: 45000,
      status: 'pending'
    }
  ];

  // 初始化数据
  React.useEffect(() => {
    setTodoItems(initialTodoItems);
  }, []);

  // 事件处理函数
  const handleProcessTodo = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setProcessModalVisible(true);
  };

  const handlePostponeTodo = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setPostponeModalVisible(true);
  };

  const handleProcessSubmit = (values: any) => {
    if (selectedTodo) {
      setTodoItems(prev => prev.map(item => 
        item.id === selectedTodo.id 
          ? { ...item, status: 'completed' }
          : item
      ));
      message.success(`任务"${selectedTodo.title}"已完成处理`);
      setProcessModalVisible(false);
      form.resetFields();
    }
  };

  const handlePostponeSubmit = (values: any) => {
    if (selectedTodo) {
      setTodoItems(prev => prev.map(item => 
        item.id === selectedTodo.id 
          ? { ...item, status: 'postponed', time: values.newTime?.format('HH:mm') }
          : item
      ));
      message.success(`任务"${selectedTodo.title}"已推迟到${values.newTime?.format('HH:mm')}`);
      setPostponeModalVisible(false);
      form.resetFields();
    }
  };

  const handleBatchCall = () => {
    setBatchCallModalVisible(true);
  };

  const handleBatchAppointment = () => {
    setBatchAppointmentModalVisible(true);
  };

  const handleGenerateReport = () => {
    setReportModalVisible(true);
  };

  const handleViewAllTodos = () => {
    setAllTodosDrawerVisible(true);
  };

  const handleBatchCallSubmit = (values: any) => {
    message.success(`已启动批量外呼，共${values.selectedCases?.length || 0}个案件`);
    setBatchCallModalVisible(false);
    form.resetFields();
  };

  const handleBatchAppointmentSubmit = (values: any) => {
    message.success(`已创建批量预约，共${values.selectedCases?.length || 0}个案件`);
    setBatchAppointmentModalVisible(false);
    form.resetFields();
  };

  const handleReportSubmit = (values: any) => {
    message.success(`正在生成${values.reportType}报告，请稍候...`);
    setReportModalVisible(false);
    form.resetFields();
  };

  // 今日工作统计
  const todayWork: TodayWork = {
    appointments: 3,
    dueCases: 5,
    expectedPayments: 8,
    totalAmount: 280000
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      contact: <PhoneOutlined style={{ color: '#1890ff' }} />,
      appointment: <CalendarOutlined style={{ color: '#52c41a' }} />,
      mediation: <FileTextOutlined style={{ color: '#fa8c16' }} />,
      follow: <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
    };
    return icons[type as keyof typeof icons];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'green'
    };
    return colors[priority as keyof typeof colors];
  };

  const getTypeText = (type: string) => {
    const texts = {
      contact: '联系',
      appointment: '预约',
      mediation: '调解',
      follow: '跟进'
    };
    return texts[type as keyof typeof texts];
  };

  return (
    <div>
      {/* 今日工作统计 */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          今日工作
        </Title>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {todayWork.appointments}
              </div>
              <Text type="secondary">今日预约</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                {todayWork.dueCases}
              </div>
              <Text type="secondary">到期案件</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {todayWork.expectedPayments}
              </div>
              <Text type="secondary">预期回款</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                ¥{(todayWork.totalAmount / 10000).toFixed(1)}万
              </div>
              <Text type="secondary">预计金额</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 待办事项 */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0 }}>
            <CheckCircleOutlined style={{ marginRight: 8 }} />
            待办事项
          </Title>
          <Button type="link" onClick={handleViewAllTodos}>查看全部 <RightOutlined /></Button>
        </div>
        
        <List
          dataSource={todoItems}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={() => handleProcessTodo(item)}
                  disabled={item.status === 'completed'}
                >
                  {item.status === 'completed' ? '已完成' : '处理'}
                </Button>,
                <Button 
                  size="small" 
                  onClick={() => handlePostponeTodo(item)}
                  disabled={item.status === 'completed'}
                >
                  推迟
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: '#f0f0f0' }}>
                    {getTypeIcon(item.type)}
                  </Avatar>
                }
                title={
                  <Space>
                    <Tag color={getPriorityColor(item.priority)}>
                      {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                    </Tag>
                    <span>{item.title}</span>
                    {item.time && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined /> {item.time}
                      </Text>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.description}
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Space size="large">
                        <Text style={{ fontSize: 12 }}>
                          <FileTextOutlined /> {item.caseNumber}
                        </Text>
                        <Text style={{ fontSize: 12 }}>
                          <UserOutlined /> {item.debtorName}
                        </Text>
                        <Text style={{ fontSize: 12 }}>
                          <DollarOutlined /> ¥{item.amount.toLocaleString()}
                        </Text>
                      </Space>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />

        {/* 快速操作 */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Space>
            <Button type="primary" icon={<PhoneOutlined />} onClick={handleBatchCall}>批量外呼</Button>
            <Button icon={<CalendarOutlined />} onClick={handleBatchAppointment}>批量预约</Button>
            <Button icon={<FileTextOutlined />} onClick={handleGenerateReport}>生成报告</Button>
          </Space>
        </div>
      </Card>

      {/* 处理任务弹窗 */}
      <Modal
        title="处理任务"
        open={processModalVisible}
        onCancel={() => setProcessModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        {selectedTodo && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleProcessSubmit}
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>{selectedTodo.title}</Title>
              <Text type="secondary">{selectedTodo.description}</Text>
            </div>
            <Form.Item
              label="处理结果"
              name="result"
              rules={[{ required: true, message: '请输入处理结果' }]}
            >
              <TextArea rows={3} placeholder="请详细描述处理过程和结果..." />
            </Form.Item>
            <Form.Item
              label="后续跟进"
              name="followUp"
            >
              <Select placeholder="请选择后续跟进方式">
                <Option value="none">无需跟进</Option>
                <Option value="phone">电话跟进</Option>
                <Option value="meeting">安排会面</Option>
                <Option value="document">准备材料</Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 推迟任务弹窗 */}
      <Modal
        title="推迟任务"
        open={postponeModalVisible}
        onCancel={() => setPostponeModalVisible(false)}
        onOk={() => form.submit()}
      >
        {selectedTodo && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handlePostponeSubmit}
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>{selectedTodo.title}</Title>
              <Text type="secondary">当前时间: {selectedTodo.time}</Text>
            </div>
            <Form.Item
              label="推迟到"
              name="newTime"
              rules={[{ required: true, message: '请选择新的处理时间' }]}
            >
              <DatePicker 
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                placeholder="选择新的处理时间"
              />
            </Form.Item>
            <Form.Item
              label="推迟原因"
              name="reason"
              rules={[{ required: true, message: '请输入推迟原因' }]}
            >
              <TextArea rows={2} placeholder="请输入推迟原因..." />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 批量外呼弹窗 */}
      <Modal
        title="批量外呼"
        open={batchCallModalVisible}
        onCancel={() => setBatchCallModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBatchCallSubmit}
        >
          <Form.Item
            label="选择案件"
            name="selectedCases"
            rules={[{ required: true, message: '请选择要外呼的案件' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择要外呼的案件"
              style={{ width: '100%' }}
            >
              {todoItems.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.caseNumber} - {item.debtorName} (¥{item.amount.toLocaleString()})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="外呼时间"
            name="callTime"
          >
            <DatePicker 
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              placeholder="选择外呼时间（默认立即）"
            />
          </Form.Item>
          <Form.Item
            label="话术模板"
            name="scriptTemplate"
          >
            <Select placeholder="选择话术模板">
              <Option value="first_contact">首次联系模板</Option>
              <Option value="follow_up">跟进模板</Option>
              <Option value="payment_reminder">还款提醒模板</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量预约弹窗 */}
      <Modal
        title="批量预约"
        open={batchAppointmentModalVisible}
        onCancel={() => setBatchAppointmentModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBatchAppointmentSubmit}
        >
          <Form.Item
            label="选择案件"
            name="selectedCases"
            rules={[{ required: true, message: '请选择要预约的案件' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择要预约的案件"
            >
              {todoItems.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.caseNumber} - {item.debtorName} (¥{item.amount.toLocaleString()})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="预约时间"
            name="appointmentTime"
            rules={[{ required: true, message: '请选择预约时间' }]}
          >
            <DatePicker 
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              placeholder="选择预约时间"
            />
          </Form.Item>
          <Form.Item
            label="预约地点"
            name="location"
          >
            <Select placeholder="选择预约地点">
              <Option value="office_a">调解室A</Option>
              <Option value="office_b">调解室B</Option>
              <Option value="online">线上调解</Option>
              <Option value="other">其他地点</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="备注"
            name="notes"
          >
            <TextArea rows={2} placeholder="预约备注..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 生成报告弹窗 */}
      <Modal
        title="生成报告"
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReportSubmit}
        >
          <Form.Item
            label="报告类型"
            name="reportType"
            rules={[{ required: true, message: '请选择报告类型' }]}
          >
            <Select placeholder="选择报告类型">
              <Option value="daily">日报</Option>
              <Option value="weekly">周报</Option>
              <Option value="monthly">月报</Option>
              <Option value="custom">自定义报告</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="时间范围"
            name="dateRange"
            rules={[{ required: true, message: '请选择时间范围' }]}
          >
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item
            label="报告内容"
            name="reportContent"
          >
            <Select
              mode="multiple"
              placeholder="选择报告内容（默认全部）"
            >
              <Option value="tasks">任务完成情况</Option>
              <Option value="calls">外呼统计</Option>
              <Option value="appointments">预约统计</Option>
              <Option value="performance">业绩统计</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看全部任务抽屉 */}
      <Drawer
        title="全部待办任务"
        placement="right"
        onClose={() => setAllTodosDrawerVisible(false)}
        open={allTodosDrawerVisible}
        width={800}
      >
        <Table
          dataSource={todoItems}
          rowKey="id"
          columns={[
            {
              title: '任务',
              dataIndex: 'title',
              key: 'title',
            },
            {
              title: '案件',
              dataIndex: 'caseNumber',
              key: 'caseNumber',
            },
            {
              title: '债务人',
              dataIndex: 'debtorName',
              key: 'debtorName',
            },
            {
              title: '金额',
              dataIndex: 'amount',
              key: 'amount',
              render: (amount: number) => `¥${amount.toLocaleString()}`,
            },
            {
              title: '优先级',
              dataIndex: 'priority',
              key: 'priority',
              render: (priority: string) => (
                <Tag color={getPriorityColor(priority)}>
                  {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
                </Tag>
              ),
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => (
                <Tag color={status === 'completed' ? 'green' : status === 'postponed' ? 'orange' : 'blue'}>
                  {status === 'completed' ? '已完成' : 
                   status === 'postponed' ? '已推迟' : 
                   status === 'in_progress' ? '进行中' : '待处理'}
                </Tag>
              ),
            },
            {
              title: '时间',
              dataIndex: 'time',
              key: 'time',
              render: (time: string) => time || '-',
            },
            {
              title: '操作',
              key: 'actions',
              render: (record: TodoItem) => (
                <Space>
                  <Button 
                    size="small" 
                    type="primary"
                    onClick={() => handleProcessTodo(record)}
                    disabled={record.status === 'completed'}
                  >
                    处理
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => handlePostponeTodo(record)}
                    disabled={record.status === 'completed'}
                  >
                    推迟
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Drawer>
    </div>
  );
};

export default CaseWorkbench;