import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Button,
  Table,
  Progress,
  Typography,
  Space,
  Spin,
  message,
  Divider,
  Tag
} from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  StarOutlined,
  RiseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { reportService, type DashboardData, type DashboardQueryParams } from '@/services/reportService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 图表颜色配置
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];

interface DisposalOrgDashboardProps {
  organizationId: number;
}

/**
 * 处置方效能看板组件
 */
const DisposalOrgDashboard: React.FC<DisposalOrgDashboardProps> = ({ organizationId }) => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [dimension, setDimension] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('efficiency');

  // 加载仪表盘数据
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params: DashboardQueryParams = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        dimension,
        includeComparison: comparisonEnabled,
        comparisonPeriod: 'PREVIOUS_PERIOD',
        limit: 10
      };
      
      const data = await reportService.getDisposalOrgDashboard(organizationId, params);
      setDashboardData(data);
    } catch (error) {
      message.error('加载数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [organizationId, dateRange, dimension, comparisonEnabled]);

  // 导出报表
  const handleExportReport = async () => {
    try {
      const params: DashboardQueryParams = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        dimension
      };
      
      const reportPath = await reportService.generateStatisticsReport('disposal_org_efficiency', organizationId, params);
      message.success('报表生成成功');
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = reportPath;
      link.download = `处置方效能报表_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      link.click();
    } catch (error) {
      message.error('报表生成失败');
    }
  };

  // 员工业绩排行表格列配置
  const staffRankingColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      width: 80,
      render: (rank: number) => (
        <Space>
          {rank <= 3 && <TrophyOutlined style={{ color: rank === 1 ? '#f5222d' : rank === 2 ? '#fa8c16' : '#faad14' }} />}
          <Text strong style={{ 
            color: rank <= 3 ? '#f5222d' : '#666',
            fontSize: rank <= 3 ? '16px' : '14px'
          }}>
            #{rank}
          </Text>
        </Space>
      )
    },
    {
      title: '员工姓名',
      dataIndex: 'name',
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: '处理案件数',
      dataIndex: 'details',
      render: (details: any) => (
        <Statistic 
          value={details?.handledCases || 0} 
          valueStyle={{ fontSize: '14px' }}
        />
      )
    },
    {
      title: '完成案件数',
      dataIndex: 'details',
      render: (details: any) => (
        <Text>{details?.completedCases || 0}</Text>
      )
    },
    {
      title: '成功率',
      dataIndex: 'value',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          format={percent => `${percent?.toFixed(1)}%`}
          strokeColor={rate >= 85 ? '#52c41a' : rate >= 70 ? '#faad14' : '#f5222d'}
        />
      ),
      sorter: true
    },
    {
      title: '回款金额',
      dataIndex: 'details',
      render: (details: any) => (
        <Statistic 
          value={details?.recoveredAmount || 0} 
          precision={0}
          formatter={(value) => `¥${Number(value).toLocaleString()}`}
          valueStyle={{ fontSize: '14px' }}
        />
      )
    },
    {
      title: '平均处置周期',
      dataIndex: 'details',
      render: (details: any) => (
        <Tag color={details?.avgProcessingDays <= 30 ? 'green' : details?.avgProcessingDays <= 60 ? 'orange' : 'red'}>
          {details?.avgProcessingDays || 0}天
        </Tag>
      )
    }
  ];

  // 案件类型分析数据（模拟）
  const caseTypeData = [
    { name: '信用卡逾期', value: 45, count: 1200 },
    { name: '个人消费贷', value: 30, count: 800 },
    { name: '小额贷款', value: 15, count: 400 },
    { name: '其他', value: 10, count: 300 }
  ];

  // 处置方式效果对比数据（模拟）
  const disposalMethodData = [
    { method: '电话催收', successRate: 75, avgDays: 25, cost: 50 },
    { method: '上门走访', successRate: 85, avgDays: 35, cost: 200 },
    { method: '法律诉讼', successRate: 90, avgDays: 90, cost: 800 },
    { method: '委托调解', successRate: 80, avgDays: 45, cost: 300 }
  ];

  if (loading && !dashboardData) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const overview = dashboardData?.overview;

  return (
    <div style={{ padding: '24px', background: '#fff', height: '100%', overflow: 'auto' }}>
      {/* 页面标题和操作区 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            处置方效能看板
          </Title>
        </Col>
        <Col>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
              style={{ width: 280 }}
            />
            <Select
              value={dimension}
              onChange={setDimension}
              style={{ width: 120 }}
            >
              <Option value="DAILY">按日</Option>
              <Option value="WEEKLY">按周</Option>
              <Option value="MONTHLY">按月</Option>
            </Select>
            <Select
              value={selectedMetric}
              onChange={setSelectedMetric}
              style={{ width: 120 }}
            >
              <Option value="efficiency">效率指标</Option>
              <Option value="quality">质量指标</Option>
              <Option value="cost">成本指标</Option>
            </Select>
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExportReport}
            >
              导出报表
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadDashboardData}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {/* 概览统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="接收案件数"
                value={overview?.totalCases || 0}
                prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="已完成案件"
                value={overview?.completedCases || 0}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="累计回款金额"
                value={overview?.recoveredAmount || 0}
                precision={0}
                prefix={<DollarOutlined style={{ color: '#faad14' }} />}
                formatter={(value) => `¥${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="成功处置率"
                value={overview?.successRate || 0}
                precision={1}
                suffix="%"
                prefix={<StarOutlined style={{ color: '#f5222d' }} />}
                valueStyle={{ 
                  color: (overview?.successRate || 0) >= 80 ? '#52c41a' : 
                         (overview?.successRate || 0) >= 60 ? '#faad14' : '#f5222d' 
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="平均处置周期"
                value={overview?.avgProcessingDays || 0}
                precision={1}
                suffix="天"
                prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="员工总数"
                value={overview?.staffCount || 0}
                prefix={<TeamOutlined style={{ color: '#13c2c2' }} />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="人均案件数"
                value={overview?.casesPerStaff || 0}
                precision={1}
                prefix={<UserOutlined style={{ color: '#eb2f96' }} />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="当月业绩增长"
                value={12.5}
                precision={1}
                suffix="%"
                prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 效能趋势图表 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={16}>
            <Card 
              title="处置效能趋势分析" 
              extra={
                <Select
                  value={comparisonEnabled}
                  onChange={setComparisonEnabled}
                  style={{ width: 120 }}
                >
                  <Option value={false}>当前周期</Option>
                  <Option value={true}>对比分析</Option>
                </Select>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dashboardData?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip 
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toLocaleString() : value,
                      name
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#1890ff" name="处理案件数" />
                  <Line yAxisId="right" type="monotone" dataKey="value" stroke="#52c41a" strokeWidth={2} name="成功率%" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="案件类型分布">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={caseTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {caseTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 处置方式效果对比 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card title="处置方式效果对比">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={disposalMethodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="successRate" fill="#52c41a" name="成功率%" />
                  <Bar yAxisId="left" dataKey="avgDays" fill="#faad14" name="平均天数" />
                  <Bar yAxisId="right" dataKey="cost" fill="#f5222d" name="平均成本(元)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 员工业绩排行榜 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title="员工业绩排行榜" 
              extra={
                <Space>
                  <Text type="secondary">按成功率排序</Text>
                  <Divider type="vertical" />
                  <Text type="secondary">前10名</Text>
                </Space>
              }
            >
              <Table
                columns={staffRankingColumns}
                dataSource={dashboardData?.rankings?.map((item, index) => ({
                  ...item,
                  rank: index + 1,
                  key: item.id
                })) || []}
                pagination={false}
                size="middle"
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default DisposalOrgDashboard;