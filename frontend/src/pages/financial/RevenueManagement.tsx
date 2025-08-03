import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Tag, Input, Select, Row, Col,
  Statistic, message, Modal, DatePicker, Typography, Divider,
  Alert, Badge, Tooltip, Progress, Tabs, Form, InputNumber,
  Timeline, Descriptions, List, Avatar, Upload
} from 'antd';
import {
  DollarOutlined, RiseOutlined, FallOutlined, PieChartOutlined,
  LineChartOutlined, CalendarOutlined, ReloadOutlined, ExportOutlined,
  EyeOutlined, EditOutlined, PlusOutlined, SearchOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  FileTextOutlined, BankOutlined, CreditCardOutlined,
  DownloadOutlined, UploadOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useDebouncedCallback } from 'use-debounce';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 收入记录接口
interface RevenueRecord {
  id: number;
  packageId: number;
  packageName: string;
  sourceOrg: string;
  revenueType: 'SERVICE_FEE' | 'SUCCESS_FEE' | 'BONUS' | 'OTHER';
  amount: number;
  taxAmount: number;
  netAmount: number;
  feeRate: number;
  basedAmount: number;
  invoiceStatus: 'PENDING' | 'ISSUED' | 'PAID' | 'OVERDUE';
  invoiceNumber?: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'BANK_TRANSFER' | 'CHECK' | 'CASH' | 'ELECTRONIC';
  status: 'CONFIRMED' | 'DISPUTED' | 'CANCELLED';
  description: string;
  createdAt: string;
  updatedAt: string;
}

// 收入统计接口
interface RevenueStats {
  totalRevenue: number;
  confirmedRevenue: number;
  pendingRevenue: number;
  disputedRevenue: number;
  monthlyGrowth: number;
  ytdRevenue: number;
  avgMonthlyRevenue: number;
  topSourceOrg: string;
  topRevenueType: string;
}

// 收入趋势数据
interface RevenueTrend {
  month: string;
  serviceFee: number;
  successFee: number;
  bonus: number;
  total: number;
}

const RevenueManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [revenues, setRevenues] = useState<RevenueRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
  ]);
  
  // 弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState<RevenueRecord | null>(null);
  
  const [form] = Form.useForm();

  // 模拟数据
  const mockRevenues: RevenueRecord[] = [
    {
      id: 1,
      packageId: 1001,
      packageName: '个人信贷案件包2024-001',
      sourceOrg: '某商业银行',
      revenueType: 'SERVICE_FEE',
      amount: 125000,
      taxAmount: 7500,
      netAmount: 117500,
      feeRate: 8.5,
      basedAmount: 1470588,
      invoiceStatus: 'PAID',
      invoiceNumber: 'INV-2024-001',
      dueDate: '2024-07-31',
      paidDate: '2024-07-28',
      paymentMethod: 'BANK_TRANSFER',
      status: 'CONFIRMED',
      description: '个人信贷案件包处置服务费',
      createdAt: '2024-07-01',
      updatedAt: '2024-07-28'
    },
    {
      id: 2,
      packageId: 1002,
      packageName: '信用卡逾期案件包2024-002',
      sourceOrg: '某股份制银行',
      revenueType: 'SUCCESS_FEE',
      amount: 85000,
      taxAmount: 5100,
      netAmount: 79900,
      feeRate: 12.0,
      basedAmount: 708333,
      invoiceStatus: 'ISSUED',
      invoiceNumber: 'INV-2024-002',
      dueDate: '2024-08-15',
      paymentMethod: 'BANK_TRANSFER',
      status: 'CONFIRMED',
      description: '信用卡案件包成功回款奖励费',
      createdAt: '2024-07-15',
      updatedAt: '2024-08-01'
    },
    {
      id: 3,
      packageId: 1003,
      packageName: '车贷逾期案件包2024-003',
      sourceOrg: '某汽车金融公司',
      revenueType: 'SERVICE_FEE',
      amount: 45000,
      taxAmount: 2700,
      netAmount: 42300,
      feeRate: 9.0,
      basedAmount: 500000,
      invoiceStatus: 'PENDING',
      dueDate: '2024-08-30',
      status: 'DISPUTED',
      description: '车贷案件包处置服务费（存在争议）',
      createdAt: '2024-07-20',
      updatedAt: '2024-08-05'
    },
    {
      id: 4,
      packageId: 1004,
      packageName: '企业贷款案件包2024-004',
      sourceOrg: '某城商行',
      revenueType: 'BONUS',
      amount: 25000,
      taxAmount: 1500,
      netAmount: 23500,
      feeRate: 0,
      basedAmount: 0,
      invoiceStatus: 'OVERDUE',
      invoiceNumber: 'INV-2024-004',
      dueDate: '2024-07-15',
      status: 'CONFIRMED',
      description: '企业贷款案件包处置质量奖励',
      createdAt: '2024-06-30',
      updatedAt: '2024-07-15'
    }
  ];

  const mockTrendData: RevenueTrend[] = [
    { month: '2024-01', serviceFee: 120000, successFee: 45000, bonus: 15000, total: 180000 },
    { month: '2024-02', serviceFee: 135000, successFee: 52000, bonus: 18000, total: 205000 },
    { month: '2024-03', serviceFee: 148000, successFee: 48000, bonus: 22000, total: 218000 },
    { month: '2024-04', serviceFee: 156000, successFee: 65000, bonus: 28000, total: 249000 },
    { month: '2024-05', serviceFee: 142000, successFee: 58000, bonus: 25000, total: 225000 },
    { month: '2024-06', serviceFee: 165000, successFee: 72000, bonus: 35000, total: 272000 },
    { month: '2024-07', serviceFee: 178000, successFee: 85000, bonus: 42000, total: 305000 }
  ];

  // 获取收入列表
  const fetchRevenues = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setRevenues(mockRevenues);
    } catch (error) {
      message.error('获取收入记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索防抖处理
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchText(value);
  }, 300);

  // 过滤数据
  const filteredRevenues = revenues.filter(revenue => {
    const matchSearch = !searchText || 
      revenue.packageName.toLowerCase().includes(searchText.toLowerCase()) ||
      revenue.sourceOrg.toLowerCase().includes(searchText.toLowerCase()) ||
      revenue.description.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = !statusFilter || revenue.status === statusFilter;
    const matchType = !typeFilter || revenue.revenueType === typeFilter;
    
    return matchSearch && matchStatus && matchType;
  });

  // 获取收入类型显示
  const getRevenueTypeConfig = (type: string) => {
    const configs = {
      'SERVICE_FEE': { text: '服务费', color: 'blue' },
      'SUCCESS_FEE': { text: '成功费', color: 'green' },
      'BONUS': { text: '奖励费', color: 'orange' },
      'OTHER': { text: '其他', color: 'default' }
    };
    return configs[type as keyof typeof configs] || configs['OTHER'];
  };

  // 获取发票状态显示
  const getInvoiceStatusConfig = (status: string) => {
    const configs = {
      'PENDING': { text: '待开票', color: 'default', icon: <ClockCircleOutlined /> },
      'ISSUED': { text: '已开票', color: 'processing', icon: <FileTextOutlined /> },
      'PAID': { text: '已付款', color: 'success', icon: <CheckCircleOutlined /> },
      'OVERDUE': { text: '逾期', color: 'error', icon: <ExclamationCircleOutlined /> }
    };
    return configs[status as keyof typeof configs] || configs['PENDING'];
  };

  // 表格列定义
  const columns: ColumnsType<RevenueRecord> = [
    {
      title: '收入信息',
      key: 'revenueInfo',
      width: 280,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <strong>{record.packageName}</strong>
          </div>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
            {record.sourceOrg}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: '收入类型',
      key: 'type',
      width: 100,
      render: (_, record) => {
        const config = getRevenueTypeConfig(record.revenueType);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '金额信息',
      key: 'amount',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            ¥{record.amount.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            税额: ¥{record.taxAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            净额: ¥{record.netAmount.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: '费率',
      key: 'feeRate',
      width: 80,
      render: (_, record) => (
        record.feeRate > 0 ? `${record.feeRate}%` : '—'
      ),
    },
    {
      title: '发票状态',
      key: 'invoiceStatus',
      width: 120,
      render: (_, record) => {
        const config = getInvoiceStatusConfig(record.invoiceStatus);
        return (
          <div>
            <Badge 
              status={config.color as any}
              text={
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {config.icon}
                  {config.text}
                </span>
              }
            />
            {record.invoiceNumber && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                {record.invoiceNumber}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '付款期限',
      key: 'dueDate',
      width: 120,
      render: (_, record) => {
        const isOverdue = dayjs(record.dueDate).isBefore(dayjs()) && record.invoiceStatus !== 'PAID';
        return (
          <div>
            <div style={{ color: isOverdue ? '#f5222d' : '#666' }}>
              {dayjs(record.dueDate).format('YYYY-MM-DD')}
            </div>
            {record.paidDate && (
              <div style={{ fontSize: '12px', color: '#52c41a' }}>
                已付: {dayjs(record.paidDate).format('MM-DD')}
              </div>
            )}
            {isOverdue && <Tag color="red">逾期</Tag>}
          </div>
        );
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const statusConfig = {
          'CONFIRMED': { color: 'success', text: '已确认' },
          'DISPUTED': { color: 'warning', text: '有争议' },
          'CANCELLED': { color: 'error', text: '已取消' }
        };
        const config = statusConfig[record.status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.invoiceStatus === 'PENDING' && (
            <Tooltip title="开具发票">
              <Button 
                type="text" 
                size="small" 
                icon={<FileTextOutlined />}
                onClick={() => handleCreateInvoice(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // 操作处理函数
  const handleViewDetail = (record: RevenueRecord) => {
    setSelectedRevenue(record);
    setDetailModalVisible(true);
  };

  const handleCreateInvoice = (record: RevenueRecord) => {
    form.setFieldsValue({
      packageName: record.packageName,
      sourceOrg: record.sourceOrg,
      amount: record.amount,
      taxAmount: record.taxAmount,
      netAmount: record.netAmount,
      description: record.description
    });
    setSelectedRevenue(record);
    setInvoiceModalVisible(true);
  };

  const handleSubmitInvoice = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('发票开具成功');
      setInvoiceModalVisible(false);
      fetchRevenues();
    } catch (error) {
      message.error('开具失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.info('收入报表导出功能开发中...');
  };

  // 统计数据
  const stats: RevenueStats = {
    totalRevenue: filteredRevenues.reduce((sum, r) => sum + r.amount, 0),
    confirmedRevenue: filteredRevenues.filter(r => r.status === 'CONFIRMED').reduce((sum, r) => sum + r.amount, 0),
    pendingRevenue: filteredRevenues.filter(r => r.invoiceStatus === 'PENDING').reduce((sum, r) => sum + r.amount, 0),
    disputedRevenue: filteredRevenues.filter(r => r.status === 'DISPUTED').reduce((sum, r) => sum + r.amount, 0),
    monthlyGrowth: 12.5,
    ytdRevenue: 1850000,
    avgMonthlyRevenue: 264000,
    topSourceOrg: '某商业银行',
    topRevenueType: '服务费'
  };

  const chartColors = ['#1890ff', '#52c41a', '#faad14', '#f5222d'];

  useEffect(() => {
    fetchRevenues();
  }, []);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>收入管理</Title>
        <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
          管理所有收入记录，跟踪发票开具和款项回收情况
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.totalRevenue}
              precision={0}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已确认收入"
              value={stats.confirmedRevenue}
              precision={0}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待开票金额"
              value={stats.pendingRevenue}
              precision={0}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="争议金额"
              value={stats.disputedRevenue}
              precision={0}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 趋势图表 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={16}>
          <Card title="收入趋势">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`¥${Number(value).toLocaleString()}`, '']} />
                <Legend />
                <Line type="monotone" dataKey="serviceFee" stroke="#1890ff" name="服务费" strokeWidth={2} />
                <Line type="monotone" dataKey="successFee" stroke="#52c41a" name="成功费" strokeWidth={2} />
                <Line type="monotone" dataKey="bonus" stroke="#faad14" name="奖励费" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#722ed1" name="总收入" strokeWidth={3} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="收入构成">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: '服务费', value: 178000, color: '#1890ff' },
                    { name: '成功费', value: 85000, color: '#52c41a' },
                    { name: '奖励费', value: 42000, color: '#faad14' }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {[
                    { name: '服务费', value: 178000, color: '#1890ff' },
                    { name: '成功费', value: 85000, color: '#52c41a' },
                    { name: '奖励费', value: 42000, color: '#faad14' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`¥${Number(value).toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 操作区域 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} justify="space-between" align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Search
                placeholder="搜索案件包、机构或描述"
                allowClear
                style={{ width: 300 }}
                onChange={(e) => debouncedSearch(e.target.value)}
                onSearch={debouncedSearch}
              />
              <Select
                placeholder="收入类型"
                allowClear
                style={{ width: 120 }}
                value={typeFilter}
                onChange={setTypeFilter}
              >
                <Option value="SERVICE_FEE">服务费</Option>
                <Option value="SUCCESS_FEE">成功费</Option>
                <Option value="BONUS">奖励费</Option>
                <Option value="OTHER">其他</Option>
              </Select>
              <Select
                placeholder="状态"
                allowClear
                style={{ width: 120 }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="CONFIRMED">已确认</Option>
                <Option value="DISPUTED">有争议</Option>
                <Option value="CANCELLED">已取消</Option>
              </Select>
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                format="YYYY-MM"
                picker="month"
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchRevenues} loading={loading}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出报表
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 收入列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredRevenues}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
          }}
          pagination={{
            total: filteredRevenues.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 收入详情弹窗 */}
      <Modal
        title="收入详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedRevenue && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="案件包名称" span={2}>
              {selectedRevenue.packageName}
            </Descriptions.Item>
            <Descriptions.Item label="案源机构">
              {selectedRevenue.sourceOrg}
            </Descriptions.Item>
            <Descriptions.Item label="收入类型">
              <Tag color={getRevenueTypeConfig(selectedRevenue.revenueType).color}>
                {getRevenueTypeConfig(selectedRevenue.revenueType).text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="总金额">
              ¥{selectedRevenue.amount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="税额">
              ¥{selectedRevenue.taxAmount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="净收入">
              ¥{selectedRevenue.netAmount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="费率">
              {selectedRevenue.feeRate > 0 ? `${selectedRevenue.feeRate}%` : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="发票状态">
              <Badge 
                status={getInvoiceStatusConfig(selectedRevenue.invoiceStatus).color as any}
                text={getInvoiceStatusConfig(selectedRevenue.invoiceStatus).text}
              />
            </Descriptions.Item>
            <Descriptions.Item label="发票号码">
              {selectedRevenue.invoiceNumber || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="付款期限">
              {dayjs(selectedRevenue.dueDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="付款日期">
              {selectedRevenue.paidDate ? dayjs(selectedRevenue.paidDate).format('YYYY-MM-DD') : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="付款方式">
              {selectedRevenue.paymentMethod || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {selectedRevenue.description}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {dayjs(selectedRevenue.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {dayjs(selectedRevenue.updatedAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 开具发票弹窗 */}
      <Modal
        title="开具发票"
        open={invoiceModalVisible}
        onCancel={() => setInvoiceModalVisible(false)}
        width={600}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitInvoice}
        >
          <Form.Item
            name="packageName"
            label="案件包名称"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="sourceOrg"
            label="开票单位"
          >
            <Input disabled />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="amount"
                label="开票金额"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/¥\s?|(,*)/g, '')}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="taxAmount"
                label="税额"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/¥\s?|(,*)/g, '')}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="netAmount"
                label="净金额"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/¥\s?|(,*)/g, '')}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="invoiceType"
            label="发票类型"
            rules={[{ required: true, message: '请选择发票类型' }]}
          >
            <Select placeholder="请选择发票类型">
              <Option value="SPECIAL">增值税专用发票</Option>
              <Option value="GENERAL">增值税普通发票</Option>
              <Option value="ELECTRONIC">电子发票</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="发票内容"
          >
            <Input.TextArea rows={3} disabled />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={2} placeholder="请输入开票备注" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setInvoiceModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                开具发票
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RevenueManagement;