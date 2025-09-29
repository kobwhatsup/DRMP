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
  Divider
} from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import {
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { reportService, type DashboardData, type DashboardQueryParams } from '@/services/reportService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 图表颜色配置
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];

interface SourceOrgDashboardProps {
  organizationId: number;
}

/**
 * 案源方业绩看板组件
 */
const SourceOrgDashboard: React.FC<SourceOrgDashboardProps> = ({ organizationId }) => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [dimension, setDimension] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [comparisonEnabled, setComparisonEnabled] = useState(false);

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
      
      const data = await reportService.getSourceOrgDashboard(organizationId, params);
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
      
      const reportPath = await reportService.generateStatisticsReport('source_org_performance', organizationId, params);
      message.success('报表生成成功');
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = reportPath;
      link.download = `案源方业绩报表_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      link.click();
    } catch (error) {
      message.error('报表生成失败');
    }
  };

  // 处置机构对比表格列配置
  const disposalOrgColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      width: 80,
      render: (rank: number) => (
        <Text strong style={{ 
          color: rank <= 3 ? '#f5222d' : '#666',
          fontSize: rank <= 3 ? '16px' : '14px'
        }}>
          #{rank}
        </Text>
      )
    },
    {
      title: '处置机构',
      dataIndex: 'name',
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: '回款率',
      dataIndex: 'value',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          format={percent => `${percent?.toFixed(1)}%`}
          strokeColor={rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#f5222d'}
        />
      ),
      sorter: true
    },
    {
      title: '回款金额',
      dataIndex: 'details',
      render: (details: any) => (
        <Statistic 
          value={details?.totalRecovered || 0} 
          precision={0}
          formatter={(value) => `¥${Number(value).toLocaleString()}`}
          valueStyle={{ fontSize: '14px' }}
        />
      )
    },
    {
      title: '完成案件数',
      dataIndex: 'details',
      render: (details: any) => (
        <Text>{details?.totalCompleted || 0}</Text>
      )
    },
    {
      title: '平均处置周期',
      dataIndex: 'details',
      render: (details: any) => (
        <Text>{details?.avgProcessingDays || 0}天</Text>
      )
    }
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
            案源方业绩看板
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
                title="总案件数"
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
                title="总委托金额"
                value={overview?.totalAmount || 0}
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
                title="回款金额"
                value={overview?.recoveredAmount || 0}
                precision={0}
                prefix={<DollarOutlined style={{ color: '#f5222d' }} />}
                formatter={(value) => `¥${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="整体回款率"
                value={overview?.recoveryRate || 0}
                precision={1}
                suffix="%"
                valueStyle={{ 
                  color: (overview?.recoveryRate || 0) >= 80 ? '#52c41a' : 
                         (overview?.recoveryRate || 0) >= 60 ? '#faad14' : '#f5222d' 
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
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="活跃案件包"
                value={overview?.activePackages || 0}
                prefix={<FileTextOutlined style={{ color: '#13c2c2' }} />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="合作处置机构"
                value={overview?.partneredOrgs || 0}
                prefix={<TeamOutlined style={{ color: '#eb2f96' }} />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 回款趋势图表 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card title="回款趋势分析" extra={
              <Select
                value={comparisonEnabled}
                onChange={setComparisonEnabled}
                style={{ width: 120 }}
              >
                <Option value={false}>当前周期</Option>
                <Option value={true}>对比分析</Option>
              </Select>
            }>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toLocaleString() : value,
                      name
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1890ff" 
                    strokeWidth={2}
                    name="回款金额"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 处置机构业绩对比 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title="合作处置机构业绩排行" 
              extra={
                <Text type="secondary">
                  按回款率排序 • 前10名
                </Text>
              }
            >
              <Table
                columns={disposalOrgColumns}
                dataSource={dashboardData?.rankings?.map((item, index) => ({
                  ...item,
                  rank: index + 1,
                  key: item.id
                })) || []}
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default SourceOrgDashboard;