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
  Tooltip,
  Tag,
  Alert,
  Avatar
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
  ComposedChart,
  Area,
  AreaChart,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  BankOutlined,
  TeamOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { reportService, type DashboardData, type DashboardQueryParams } from '@/services/reportService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 图表颜色配置
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];

interface PlatformOperationDashboardProps {
  // 平台看板不需要特定机构ID
}

/**
 * 平台运营看板组件
 */
const PlatformOperationDashboard: React.FC<PlatformOperationDashboardProps> = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [dimension, setDimension] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // 加载仪表盘数据
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params: DashboardQueryParams = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        dimension,
        regionCodes: selectedRegion !== 'all' ? [selectedRegion] : undefined,
        limit: 20
      };
      
      const data = await reportService.getPlatformOperationDashboard(params);
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
  }, [dateRange, dimension, selectedRegion]);

  // 导出报表
  const handleExportReport = async () => {
    try {
      const params: DashboardQueryParams = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        dimension
      };
      
      const reportPath = await reportService.generateStatisticsReport('platform_operation', undefined, params);
      message.success('报表生成成功');
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = reportPath;
      link.download = `平台运营报表_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      link.click();
    } catch (error) {
      message.error('报表生成失败');
    }
  };

  // 机构排行榜表格列配置
  const organizationRankingColumns = [
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
      title: '机构名称',
      dataIndex: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: record.category === 'SOURCE' ? '#1890ff' : '#52c41a' }}>
            {record.category === 'SOURCE' ? '源' : '处'}
          </Avatar>
          <Text strong>{name}</Text>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'category',
      render: (category: string) => (
        <Tag color={category === 'SOURCE' ? 'blue' : 'green'}>
          {category === 'SOURCE' ? '案源机构' : '处置机构'}
        </Tag>
      )
    },
    {
      title: '业绩评分',
      dataIndex: 'value',
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          format={percent => `${percent?.toFixed(1)}`}
          strokeColor={score >= 90 ? '#52c41a' : score >= 75 ? '#faad14' : '#f5222d'}
        />
      ),
      sorter: true
    },
    {
      title: '总交易额',
      dataIndex: 'details',
      render: (details: any) => (
        <Statistic 
          value={details?.totalAmount || 0} 
          precision={0}
          formatter={(value) => `¥${Number(value).toLocaleString()}`}
          valueStyle={{ fontSize: '14px' }}
        />
      )
    },
    {
      title: '活跃度',
      dataIndex: 'details',
      render: (details: any) => {
        const activity = details?.activityRate || 0;
        return (
          <Tag color={activity >= 80 ? 'green' : activity >= 60 ? 'orange' : 'red'}>
            {activity}%
          </Tag>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => message.info(`查看${record.name}详情`)}
        >
          详情
        </Button>
      )
    }
  ];

  // 地域分布数据（模拟）
  const regionalData = [
    { region: '华东', caseCount: 1500, amount: 50000000, percentage: 35 },
    { region: '华南', caseCount: 1200, amount: 40000000, percentage: 28 },
    { region: '华北', caseCount: 800, amount: 30000000, percentage: 19 },
    { region: '西南', caseCount: 500, amount: 20000000, percentage: 12 },
    { region: '其他', caseCount: 300, amount: 10000000, percentage: 6 }
  ];

  // 平台收入构成数据（模拟）
  const revenueData = [
    { type: '会员费', amount: 5000000, percentage: 45 },
    { type: '服务费', amount: 3500000, percentage: 32 },
    { type: '技术服务费', amount: 1500000, percentage: 13 },
    { type: '其他收入', amount: 1000000, percentage: 10 }
  ];

  // 实时监控数据（模拟）
  const realTimeStats = {
    onlineUsers: 1247,
    activeOrgs: 156,
    todayTransactions: 423,
    systemLoad: 65,
    errorRate: 0.02
  };

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
            平台运营看板
          </Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={selectedRegion}
              onChange={setSelectedRegion}
              style={{ width: 120 }}
            >
              <Option value="all">全国</Option>
              <Option value="east">华东</Option>
              <Option value="south">华南</Option>
              <Option value="north">华北</Option>
              <Option value="southwest">西南</Option>
            </Select>
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
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 120 }}
            >
              <Option value="overview">概览模式</Option>
              <Option value="detailed">详细模式</Option>
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

      {/* 实时监控告警 */}
      {realTimeStats.errorRate > 0.01 && (
        <Alert
          message="系统监控告警"
          description={`当前错误率 ${(realTimeStats.errorRate * 100).toFixed(2)}% 超出正常范围，请及时关注`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      <Spin spinning={loading}>
        {/* 核心指标概览 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="注册机构总数"
                value={overview?.totalOrgs || 0}
                prefix={<BankOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
                suffix={
                  <Tooltip title="较上月增长12%">
                    <RiseOutlined style={{ fontSize: '12px', color: '#52c41a' }} />
                  </Tooltip>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="活跃机构数"
                value={overview?.activeOrgs || 0}
                prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="累计案件数"
                value={overview?.totalCasesLong || 0}
                prefix={<BarChartOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
                formatter={(value) => Number(value).toLocaleString()}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="累计交易金额"
                value={overview?.totalAmount || 0}
                precision={0}
                prefix={<DollarOutlined style={{ color: '#f5222d' }} />}
                formatter={(value) => `¥${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="平台总收入"
                value={overview?.totalRevenue || 0}
                precision={0}
                prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
                formatter={(value) => `¥${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="在线用户数"
                value={realTimeStats.onlineUsers}
                prefix={<GlobalOutlined style={{ color: '#13c2c2' }} />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 业务趋势分析 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={16}>
            <Card 
              title="平台业务增长趋势" 
              extra={
                <Space>
                  <Button icon={<LineChartOutlined />} size="small">趋势</Button>
                  <Button icon={<BarChartOutlined />} size="small">对比</Button>
                </Space>
              }
            >
              <ResponsiveContainer width="100%" height={350}>
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
                  <Area yAxisId="left" type="monotone" dataKey="count" fill="#1890ff" stroke="#1890ff" fillOpacity={0.3} name="新增案件数" />
                  <Line yAxisId="right" type="monotone" dataKey="value" stroke="#52c41a" strokeWidth={3} name="平台收入(万元)" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="实时系统监控">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>系统负载</Text>
                  <Progress 
                    percent={realTimeStats.systemLoad} 
                    strokeColor={realTimeStats.systemLoad > 80 ? '#f5222d' : '#52c41a'}
                    format={percent => `${percent}%`}
                  />
                </div>
                <div>
                  <Text strong>错误率</Text>
                  <Progress 
                    percent={realTimeStats.errorRate * 100} 
                    strokeColor={realTimeStats.errorRate > 0.01 ? '#f5222d' : '#52c41a'}
                    format={percent => `${percent?.toFixed(2)}%`}
                  />
                </div>
                <div>
                  <Row>
                    <Col span={12}>
                      <Statistic
                        title="今日交易"
                        value={realTimeStats.todayTransactions}
                        valueStyle={{ fontSize: '16px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="活跃机构"
                        value={realTimeStats.activeOrgs}
                        valueStyle={{ fontSize: '16px' }}
                      />
                    </Col>
                  </Row>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 地域分布和收入构成 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={12}>
            <Card title="业务地域分布">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionalData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({region, percentage}) => `${region} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {regionalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name, props) => [
                      `${value}% (${props.payload.caseCount}案件)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="平台收入构成">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" width={80} />
                  <RechartsTooltip 
                    formatter={(value) => [`¥${Number(value).toLocaleString()}`, '收入']}
                  />
                  <Bar dataKey="amount" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 机构业绩排行榜 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title="机构业绩排行榜" 
              extra={
                <Space>
                  <Button icon={<PieChartOutlined />} size="small">图表视图</Button>
                  <Text type="secondary">按综合评分排序</Text>
                  <Divider type="vertical" />
                  <Text type="secondary">前20名</Text>
                </Space>
              }
            >
              <Table
                columns={organizationRankingColumns}
                dataSource={dashboardData?.rankings?.map((item, index) => ({
                  ...item,
                  rank: index + 1,
                  key: item.id
                })) || []}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
                size="middle"
                scroll={{ x: 1000 }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default PlatformOperationDashboard;