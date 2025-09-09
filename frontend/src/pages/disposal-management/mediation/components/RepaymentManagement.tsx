import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Descriptions,
  Timeline,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Typography,
  Divider,
  Alert,
  Badge,
  Tooltip
} from 'antd';
import {
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BankOutlined,
  FileTextOutlined,
  HistoryOutlined,
  PlusOutlined,
  EditOutlined,
  MessageOutlined,
  PhoneOutlined,
  CreditCardOutlined,
  MoneyCollectOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface RepaymentPlan {
  id: string;
  caseNumber: string;
  debtorName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  planType: 'lump_sum' | 'installment';
  installments?: InstallmentPlan[];
  status: 'active' | 'completed' | 'defaulted' | 'suspended';
  createdDate: string;
  nextPaymentDate?: string;
}

interface InstallmentPlan {
  id: string;
  periodNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount?: number;
  notes?: string;
}

interface PaymentRecord {
  id: string;
  planId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'alipay' | 'wechat' | 'cash' | 'other';
  transactionId?: string;
  notes?: string;
  verifiedBy: string;
}

const RepaymentManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [repaymentPlans, setRepaymentPlans] = useState<RepaymentPlan[]>([]);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [planDetailVisible, setPlanDetailVisible] = useState(false);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<RepaymentPlan | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockPlans: RepaymentPlan[] = [
    {
      id: '1',
      caseNumber: 'MED-2024-001',
      debtorName: '张三',
      totalAmount: 50000,
      paidAmount: 15000,
      remainingAmount: 35000,
      planType: 'installment',
      status: 'active',
      createdDate: '2024-01-15',
      nextPaymentDate: '2024-02-15',
      installments: [
        {
          id: '1',
          periodNumber: 1,
          amount: 10000,
          dueDate: '2024-01-15',
          paidDate: '2024-01-15',
          status: 'paid',
          paidAmount: 10000
        },
        {
          id: '2',
          periodNumber: 2,
          amount: 5000,
          dueDate: '2024-01-30',
          paidDate: '2024-01-30',
          status: 'paid',
          paidAmount: 5000
        },
        {
          id: '3',
          periodNumber: 3,
          amount: 10000,
          dueDate: '2024-02-15',
          status: 'pending'
        }
      ]
    },
    {
      id: '2',
      caseNumber: 'MED-2024-002',
      debtorName: '李四',
      totalAmount: 30000,
      paidAmount: 0,
      remainingAmount: 30000,
      planType: 'lump_sum',
      status: 'defaulted',
      createdDate: '2024-01-20',
      nextPaymentDate: '2024-01-30'
    }
  ];

  React.useEffect(() => {
    setRepaymentPlans(mockPlans);
  }, []);

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      active: 'processing',
      completed: 'success',
      defaulted: 'error',
      suspended: 'warning'
    };
    return colorMap[status];
  };

  const getStatusText = (status: string) => {
    const textMap: { [key: string]: string } = {
      active: '执行中',
      completed: '已完成',
      defaulted: '违约',
      suspended: '暂停'
    };
    return textMap[status];
  };

  const getInstallmentStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: 'default',
      paid: 'success',
      overdue: 'error',
      partial: 'warning'
    };
    return colorMap[status];
  };

  const getInstallmentStatusText = (status: string) => {
    const textMap: { [key: string]: string } = {
      pending: '待还款',
      paid: '已还清',
      overdue: '逾期',
      partial: '部分还款'
    };
    return textMap[status];
  };

  const getPaymentMethodText = (method: string) => {
    const textMap: { [key: string]: string } = {
      bank_transfer: '银行转账',
      alipay: '支付宝',
      wechat: '微信支付',
      cash: '现金',
      other: '其他'
    };
    return textMap[method];
  };

  const handleRecordPayment = (plan: RepaymentPlan) => {
    setSelectedPlan(plan);
    setRecordModalVisible(true);
    form.resetFields();
  };

  const handleViewDetail = (plan: RepaymentPlan) => {
    setSelectedPlan(plan);
    setPlanDetailVisible(true);
  };

  const handleAdjustPlan = (plan: RepaymentPlan) => {
    setSelectedPlan(plan);
    setAdjustModalVisible(true);
    form.resetFields();
  };

  const submitPaymentRecord = async (values: any) => {
    try {
      console.log('记录还款:', values);
      message.success('还款记录已保存');
      setRecordModalVisible(false);
    } catch (error) {
      message.error('保存失败');
    }
  };

  const submitPlanAdjustment = async (values: any) => {
    try {
      console.log('调整方案:', values);
      message.success('还款方案已调整');
      setAdjustModalVisible(false);
    } catch (error) {
      message.error('调整失败');
    }
  };

  const columns = [
    {
      title: '案件信息',
      key: 'case',
      render: (record: RepaymentPlan) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.caseNumber}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.debtorName}</div>
        </div>
      )
    },
    {
      title: '还款方案',
      key: 'plan',
      render: (record: RepaymentPlan) => (
        <div>
          <Tag color={record.planType === 'lump_sum' ? 'blue' : 'green'}>
            {record.planType === 'lump_sum' ? '一次性' : '分期'}
          </Tag>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            ¥{record.totalAmount.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      title: '还款进度',
      key: 'progress',
      render: (record: RepaymentPlan) => {
        const progress = Math.round((record.paidAmount / record.totalAmount) * 100);
        return (
          <div style={{ width: 120 }}>
            <Progress percent={progress} size="small" />
            <div style={{ fontSize: 12, marginTop: 4 }}>
              已还: ¥{record.paidAmount.toLocaleString()}
            </div>
          </div>
        );
      }
    },
    {
      title: '下次还款',
      dataIndex: 'nextPaymentDate',
      key: 'nextPaymentDate',
      render: (date: string) => date ? dayjs(date).format('MM-DD') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: RepaymentPlan) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleRecordPayment(record)}>
            记录还款
          </Button>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" onClick={() => handleAdjustPlan(record)}>
            调整
          </Button>
        </Space>
      )
    }
  ];

  // 统计数据
  const statistics = {
    totalPlans: repaymentPlans.length,
    activePlans: repaymentPlans.filter(p => p.status === 'active').length,
    completedPlans: repaymentPlans.filter(p => p.status === 'completed').length,
    defaultedPlans: repaymentPlans.filter(p => p.status === 'defaulted').length,
    totalAmount: repaymentPlans.reduce((sum, p) => sum + p.totalAmount, 0),
    paidAmount: repaymentPlans.reduce((sum, p) => sum + p.paidAmount, 0),
    overdueCount: repaymentPlans.filter(p => 
      p.nextPaymentDate && dayjs(p.nextPaymentDate).isBefore(dayjs())
    ).length
  };

  return (
    <div>
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="还款方案"
              value={statistics.totalPlans}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="执行中"
              value={statistics.activePlans}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="回收金额"
              value={statistics.paidAmount}
              prefix="¥"
              precision={0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="逾期案件"
              value={statistics.overdueCount}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            创建还款方案
          </Button>
          <Button icon={<MoneyCollectOutlined />}>
            批量记录还款
          </Button>
          <Button icon={<MessageOutlined />}>
            还款提醒
          </Button>
          <Button icon={<FileTextOutlined />}>
            导出报表
          </Button>
        </Space>
      </Card>

      {/* 还款方案列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={repaymentPlans}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个方案`
          }}
        />
      </Card>

      {/* 记录还款弹窗 */}
      <Modal
        title="记录还款"
        open={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submitPaymentRecord}
        >
          {selectedPlan && (
            <Alert
              message={`案件: ${selectedPlan.caseNumber} - ${selectedPlan.debtorName}`}
              description={`剩余金额: ¥${selectedPlan.remainingAmount.toLocaleString()}`}
              type="info"
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="还款金额"
                name="amount"
                rules={[{ required: true, message: '请输入还款金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => {
                    const parsed = parseFloat(value?.replace(/¥\s?|(,*)/g, '') || '0') || 0;
                    return parsed as 0;
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="还款日期"
                name="paymentDate"
                rules={[{ required: true, message: '请选择还款日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="还款方式"
                name="paymentMethod"
                rules={[{ required: true, message: '请选择还款方式' }]}
              >
                <Select placeholder="请选择还款方式">
                  <Option value="bank_transfer">银行转账</Option>
                  <Option value="alipay">支付宝</Option>
                  <Option value="wechat">微信支付</Option>
                  <Option value="cash">现金</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="交易流水号"
                name="transactionId"
              >
                <Input placeholder="请输入交易流水号" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="备注"
            name="notes"
          >
            <TextArea rows={3} placeholder="请输入还款备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 方案详情弹窗 */}
      <Modal
        title="还款方案详情"
        open={planDetailVisible}
        onCancel={() => setPlanDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPlanDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedPlan && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="案件编号">{selectedPlan.caseNumber}</Descriptions.Item>
              <Descriptions.Item label="债务人">{selectedPlan.debtorName}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{selectedPlan.totalAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="已还金额">¥{selectedPlan.paidAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="剩余金额">¥{selectedPlan.remainingAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="方案类型">
                <Tag color={selectedPlan.planType === 'lump_sum' ? 'blue' : 'green'}>
                  {selectedPlan.planType === 'lump_sum' ? '一次性还款' : '分期还款'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="方案状态">
                <Tag color={getStatusColor(selectedPlan.status)}>
                  {getStatusText(selectedPlan.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建日期">
                {dayjs(selectedPlan.createdDate).format('YYYY-MM-DD')}
              </Descriptions.Item>
            </Descriptions>

            {selectedPlan.planType === 'installment' && selectedPlan.installments && (
              <div>
                <Title level={5}>分期详情</Title>
                <Table
                  dataSource={selectedPlan.installments}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: '期数',
                      dataIndex: 'periodNumber',
                      key: 'periodNumber'
                    },
                    {
                      title: '应还金额',
                      dataIndex: 'amount',
                      key: 'amount',
                      render: (amount: number) => `¥${amount.toLocaleString()}`
                    },
                    {
                      title: '到期日期',
                      dataIndex: 'dueDate',
                      key: 'dueDate',
                      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
                    },
                    {
                      title: '实还金额',
                      key: 'paidAmount',
                      render: (record: InstallmentPlan) => 
                        record.paidAmount ? `¥${record.paidAmount.toLocaleString()}` : '-'
                    },
                    {
                      title: '还款日期',
                      dataIndex: 'paidDate',
                      key: 'paidDate',
                      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => (
                        <Tag color={getInstallmentStatusColor(status)}>
                          {getInstallmentStatusText(status)}
                        </Tag>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 调整方案弹窗 */}
      <Modal
        title="调整还款方案"
        open={adjustModalVisible}
        onCancel={() => setAdjustModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submitPlanAdjustment}
        >
          <Alert
            message="方案调整将生成新的还款计划"
            description="请谨慎操作，调整后原方案将被替换"
            type="warning"
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            label="调整原因"
            name="reason"
            rules={[{ required: true, message: '请选择调整原因' }]}
          >
            <Select placeholder="请选择调整原因">
              <Option value="debtor_request">债务人申请</Option>
              <Option value="payment_difficulty">还款困难</Option>
              <Option value="business_change">业务调整</Option>
              <Option value="other">其他原因</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="新方案类型"
            name="newPlanType"
            rules={[{ required: true, message: '请选择新方案类型' }]}
          >
            <Select placeholder="请选择方案类型">
              <Option value="lump_sum">一次性还款</Option>
              <Option value="installment">分期还款</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="调整说明"
            name="notes"
            rules={[{ required: true, message: '请输入调整说明' }]}
          >
            <TextArea rows={4} placeholder="请详细说明调整原因和新方案内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RepaymentManagement;