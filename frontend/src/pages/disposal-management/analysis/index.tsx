import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Table,
  Button,
  Space,
  Progress,
  Tabs,
  Tooltip
} from 'antd';
import {
  FundOutlined,
  RiseOutlined,
  PieChartOutlined,
  BarChartOutlined,
  TeamOutlined,
  BankOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface AnalysisData {
  disposalStats: {
    totalCases: number;
    mediationCases: number;
    litigationCases: number;
    completedCases: number;
    successRate: number;
    averageDays: number;
  };
  trendData: Array<{
    month: string;
    mediation: number;
    litigation: number;
    completed: number;
  }>;
  orgPerformance: Array<{
    orgName: string;
    totalCases: number;
    completedCases: number;
    successRate: number;
    avgDays: number;
    amount: number;
  }>;
  typeDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const DisposalAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
  ]);
  const [selectedOrg, setSelectedOrg] = useState<string>('all');

  useEffect(() => {
    loadAnalysisData();
  }, [dateRange, selectedOrg]);

  const loadAnalysisData = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockData: AnalysisData = {
        disposalStats: {
          totalCases: 1245,
          mediationCases: 789,
          litigationCases: 456,
          completedCases: 892,
          successRate: 78.5,
          averageDays: 42.3
        },
        trendData: [
          { month: '2023-08', mediation: 65, litigation: 35, completed: 78 },
          { month: '2023-09', mediation: 72, litigation: 28, completed: 85 },
          { month: '2023-10', mediation: 68, litigation: 42, completed: 89 },
          { month: '2023-11', mediation: 85, litigation: 38, completed: 95 },
          { month: '2023-12', mediation: 78, litigation: 45, completed: 102 },
          { month: '2024-01', mediation: 92, litigation: 52, completed: 118 },
        ],
        orgPerformance: [
          {
            orgName: '华南调解中心',
            totalCases: 156,
            completedCases: 132,
            successRate: 84.6,
            avgDays: 28.5,
            amount: 15600000
          },
          {
            orgName: '金融调解中心',
            totalCases: 134,
            completedCases: 108,
            successRate: 80.6,
            avgDays: 32.1,
            amount: 12800000
          },
          {
            orgName: '金融律师事务所',
            totalCases: 89,
            completedCases: 67,
            successRate: 75.3,
            avgDays: 58.6,
            amount: 18900000
          },
          {
            orgName: '华泰律师事务所',
            totalCases: 78,
            completedCases: 56,
            successRate: 71.8,
            avgDays: 62.4,
            amount: 16200000
          }
        ],
        typeDistribution: [
          { name: '调解案件', value: 63.4, color: '#1890ff' },
          { name: '诉讼案件', value: 36.6, color: '#fa8c16' }
        ]
      };
      setAnalysisData(mockData);
    } catch (error) {
      console.error('加载分析数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const orgColumns = [
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
    },
    {
      title: '案件总数',
      dataIndex: 'totalCases',
      key: 'totalCases',
      sorter: (a: any, b: any) => a.totalCases - b.totalCases,
    },
    {
      title: '已完成',
      dataIndex: 'completedCases',
      key: 'completedCases',
      sorter: (a: any, b: any) => a.completedCases - b.completedCases,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <div>
          <Progress percent={rate} size="small" />
          <span style={{ marginLeft: 8 }}>{rate}%</span>
        </div>
      ),
      sorter: (a: any, b: any) => a.successRate - b.successRate,
    },
    {
      title: '平均周期',
      dataIndex: 'avgDays',
      key: 'avgDays',
      render: (days: number) => `${days.toFixed(1)}天`,
      sorter: (a: any, b: any) => a.avgDays - b.avgDays,
    },
    {
      title: '处理金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${(amount / 10000).toFixed(0)}万`,
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
  ];

  if (!analysisData) {
    return <div style={{ padding: '24px' }}>加载中...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>
          <FundOutlined style={{ marginRight: '8px' }} />
          处置分析
        </h2>
      </div>

      {/* 筛选条件 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Space>
              <span>时间范围：</span>
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              />
            </Space>
          </Col>
          <Col span={4}>
            <Space>
              <span>处置机构：</span>
              <Select
                value={selectedOrg}
                onChange={setSelectedOrg}
                style={{ width: 150 }}
              >
                <Option value="all">全部机构</Option>
                <Option value="mediation">调解机构</Option>
                <Option value="litigation">诉讼机构</Option>
              </Select>
            </Space>
          </Col>
          <Col span={4}>
            <Button type="primary">
              导出报告
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 总体统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="案件总数"
              value={analysisData.disposalStats.totalCases}
              prefix={<PieChartOutlined style={{ color: '#1890ff' }} />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="调解案件"
              value={analysisData.disposalStats.mediationCases}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="诉讼案件"
              value={analysisData.disposalStats.litigationCases}
              prefix={<BankOutlined style={{ color: '#fa8c16' }} />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已完成案件"
              value={analysisData.disposalStats.completedCases}
              prefix={<CheckCircleOutlined style={{ color: '#13c2c2' }} />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="平均成功率"
              value={analysisData.disposalStats.successRate}
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="平均周期"
              value={analysisData.disposalStats.averageDays}
              prefix={<ClockCircleOutlined style={{ color: '#eb2f96' }} />}
              suffix="天"
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表分析 */}
      <Tabs defaultActiveKey="trend">
        <TabPane tab="趋势分析" key="trend">
          <Card title="处置案件趋势">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analysisData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="mediation" stroke="#52c41a" name="调解案件" />
                <Line type="monotone" dataKey="litigation" stroke="#fa8c16" name="诉讼案件" />
                <Line type="monotone" dataKey="completed" stroke="#1890ff" name="完成案件" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabPane>

        <TabPane tab="类型分布" key="distribution">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="处置方式分布">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analysisData.typeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {analysisData.typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="月度处置量对比">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="mediation" fill="#52c41a" name="调解" />
                    <Bar dataKey="litigation" fill="#fa8c16" name="诉讼" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="机构绩效" key="performance">
          <Card title="机构处置绩效排行">
            <Table
              columns={orgColumns}
              dataSource={analysisData.orgPerformance}
              loading={loading}
              rowKey="orgName"
              pagination={false}
              size="middle"
            />
          </Card>
        </TabPane>

        <TabPane tab="效率分析" key="efficiency">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="处置效率趋势">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={analysisData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stackId="1"
                      stroke="#1890ff"
                      fill="#1890ff"
                      fillOpacity={0.6}
                      name="完成案件数"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }}>
                <RiseOutlined />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                调解优势明显
              </div>
              <div style={{ color: '#666' }}>
                调解案件平均周期比诉讼短30天，成功率高出8.5%
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }}>
                <BarChartOutlined />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                处置量稳步增长
              </div>
              <div style={{ color: '#666' }}>
                近6个月处置案件数量平均增长15%，趋势良好
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }}>
                <DollarOutlined />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                回款效果显著
              </div>
              <div style={{ color: '#666' }}>
                总回款金额6.35亿元，平均回款率达到68.2%
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DisposalAnalysis;