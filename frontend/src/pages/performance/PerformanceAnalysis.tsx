import React, { useState, useEffect } from 'react';
import {
  Card, Select, Row, Col, Statistic, Typography, DatePicker,
  Table, Progress, Tag, Space, Button, Tabs, Alert, List,
  Tooltip, Badge, Timeline, Divider, message
} from 'antd';
import {
  TrophyOutlined, RiseOutlined, FallOutlined, LineChartOutlined,
  BarChartOutlined, PieChartOutlined, CalendarOutlined, ReloadOutlined,
  ExportOutlined, InfoCircleOutlined, ThunderboltOutlined,
  CheckCircleOutlined, ClockCircleOutlined, DollarOutlined,
  TeamOutlined, StarOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// 业绩数据接口
interface PerformanceData {
  period: string;
  totalCases: number;
  completedCases: number;
  totalAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
  avgDisposalTime: number;
  revenue: number;
  ranking: number;
  competitorCount: number;
}

interface PerformanceMetrics {
  currentPeriod: PerformanceData;
  previousPeriod: PerformanceData;
  yearToDate: PerformanceData;
  trends: TrendData[];
  comparisons: ComparisonData[];
  rankings: RankingData[];
  achievements: Achievement[];
}

interface TrendData {
  month: string;
  cases: number;
  revenue: number;
  recoveryRate: number;
  disposalTime: number;
}

interface ComparisonData {
  metric: string;
  yourValue: number;
  industryAvg: number;
  topPerformer: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

interface RankingData {
  category: string;
  rank: number;
  total: number;
  score: number;
  change: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  achievedDate: string;
  type: 'milestone' | 'improvement' | 'excellence';
  icon: string;
}

const PerformanceAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
  ]);
  const [comparisonType, setComparisonType] = useState<'month' | 'quarter' | 'year'>('month');
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);

  // 模拟数据
  const mockTrendData: TrendData[] = [
    { month: '2024-01', cases: 180, revenue: 850000, recoveryRate: 38.5, disposalTime: 92 },
    { month: '2024-02', cases: 210, revenue: 950000, recoveryRate: 41.2, disposalTime: 88 },
    { month: '2024-03', cases: 195, revenue: 890000, recoveryRate: 39.8, disposalTime: 85 },
    { month: '2024-04', cases: 225, revenue: 1020000, recoveryRate: 43.5, disposalTime: 82 },
    { month: '2024-05', cases: 240, revenue: 1150000, recoveryRate: 45.2, disposalTime: 78 },
    { month: '2024-06', cases: 220, revenue: 1080000, recoveryRate: 44.8, disposalTime: 80 },
    { month: '2024-07', cases: 260, revenue: 1250000, recoveryRate: 47.3, disposalTime: 75 }
  ];

  const mockComparisonData: ComparisonData[] = [
    {
      metric: '回款率',
      yourValue: 47.3,
      industryAvg: 38.5,
      topPerformer: 52.1,
      unit: '%',
      trend: 'up'
    },
    {
      metric: '处置时效',
      yourValue: 75,
      industryAvg: 90,
      topPerformer: 65,
      unit: '天',
      trend: 'up'
    },
    {
      metric: '客户满意度',
      yourValue: 4.6,
      industryAvg: 4.2,
      topPerformer: 4.8,
      unit: '分',
      trend: 'stable'
    },
    {
      metric: '案件完成率',
      yourValue: 94.5,
      industryAvg: 88.2,
      topPerformer: 96.8,
      unit: '%',
      trend: 'up'
    }
  ];

  const mockRankings: RankingData[] = [
    { category: '回款率', rank: 3, total: 45, score: 47.3, change: 1 },
    { category: '处置效率', rank: 2, total: 45, score: 92.5, change: 2 },
    { category: '服务质量', rank: 1, total: 45, score: 4.6, change: 0 },
    { category: '案件量', rank: 5, total: 45, score: 260, change: -1 },
    { category: '客户满意', rank: 4, total: 45, score: 4.5, change: 1 }
  ];

  const mockAchievements: Achievement[] = [
    {
      id: 1,
      title: '月度回款率突破45%',
      description: '7月份回款率达到47.3%，创历史新高',
      achievedDate: '2024-07-31',
      type: 'milestone',
      icon: 'trophy'
    },
    {
      id: 2,
      title: '处置效率显著提升',
      description: '平均处置时间从90天缩短至75天',
      achievedDate: '2024-07-20',
      type: 'improvement',
      icon: 'rocket'
    },
    {
      id: 3,
      title: '服务质量全市第一',
      description: '在所有处置机构中服务质量评分最高',
      achievedDate: '2024-07-15',
      type: 'excellence',
      icon: 'star'
    }
  ];

  // 获取业绩数据
  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: PerformanceMetrics = {
        currentPeriod: {
          period: '2024-07',
          totalCases: 260,
          completedCases: 245,
          totalAmount: 12500000,
          recoveredAmount: 5912500,
          recoveryRate: 47.3,
          avgDisposalTime: 75,
          revenue: 1250000,
          ranking: 3,
          competitorCount: 45
        },
        previousPeriod: {
          period: '2024-06',
          totalCases: 220,
          completedCases: 208,
          totalAmount: 11000000,
          recoveredAmount: 4928000,
          recoveryRate: 44.8,
          avgDisposalTime: 80,
          revenue: 1080000,
          ranking: 4,
          competitorCount: 45
        },
        yearToDate: {
          period: '2024-YTD',
          totalCases: 1530,
          completedCases: 1445,
          totalAmount: 75000000,
          recoveredAmount: 31500000,
          recoveryRate: 42.0,
          avgDisposalTime: 83,
          revenue: 7190000,
          ranking: 3,
          competitorCount: 45
        },
        trends: mockTrendData,
        comparisons: mockComparisonData,
        rankings: mockRankings,
        achievements: mockAchievements
      };
      
      setPerformanceData(mockData);
    } catch (error) {
      message.error('获取业绩数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算变化百分比
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
  };

  // 获取趋势颜色
  const getTrendColor = (change: number) => {
    if (change > 0) return '#52c41a';
    if (change < 0) return '#f5222d';
    return '#faad14';
  };

  // 获取排名颜色
  const getRankColor = (rank: number, total: number) => {
    const ratio = rank / total;
    if (ratio <= 0.1) return '#52c41a';
    if (ratio <= 0.3) return '#1890ff';
    if (ratio <= 0.6) return '#faad14';
    return '#f5222d';
  };

  // 图表颜色配置
  const chartColors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

  const handleExport = () => {
    message.info('业绩报告导出功能开发中...');
  };

  const handleRefresh = () => {
    fetchPerformanceData();
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [dateRange, comparisonType]);

  if (!performanceData) {
    return <div>Loading...</div>;
  }

  const currentData = performanceData.currentPeriod;
  const previousData = performanceData.previousPeriod;
  const ytdData = performanceData.yearToDate;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>业绩分析</Title>
        <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
          全面分析您的业务表现，洞察发展趋势，制定优化策略
        </Paragraph>
      </div>

      {/* 控制面板 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                format="YYYY-MM"
                picker="month"
              />
              <Select
                value={comparisonType}
                onChange={setComparisonType}
                style={{ width: 120 }}
              >
                <Option value="month">按月对比</Option>
                <Option value="quarter">按季对比</Option>
                <Option value="year">按年对比</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 核心指标卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="本期案件数"
              value={currentData.totalCases}
              precision={0}
              valueStyle={{ 
                color: getTrendColor(calculateChange(currentData.totalCases, previousData.totalCases))
              }}
              prefix={<TeamOutlined />}
              suffix={
                <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                  {calculateChange(currentData.totalCases, previousData.totalCases) > 0 ? 
                    <RiseOutlined /> : <FallOutlined />}
                  {Math.abs(calculateChange(currentData.totalCases, previousData.totalCases))}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="回款率"
              value={currentData.recoveryRate}
              precision={1}
              valueStyle={{ 
                color: getTrendColor(calculateChange(currentData.recoveryRate, previousData.recoveryRate))
              }}
              prefix={<TrophyOutlined />}
              suffix={
                <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                  {calculateChange(currentData.recoveryRate, previousData.recoveryRate) > 0 ? 
                    <RiseOutlined /> : <FallOutlined />}
                  {Math.abs(calculateChange(currentData.recoveryRate, previousData.recoveryRate)).toFixed(1)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="处置时效"
              value={currentData.avgDisposalTime}
              precision={0}
              valueStyle={{ 
                color: getTrendColor(-calculateChange(currentData.avgDisposalTime, previousData.avgDisposalTime))
              }}
              prefix={<ClockCircleOutlined />}
              suffix={
                <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                  {calculateChange(currentData.avgDisposalTime, previousData.avgDisposalTime) < 0 ? 
                    <RiseOutlined /> : <FallOutlined />}
                  {Math.abs(calculateChange(currentData.avgDisposalTime, previousData.avgDisposalTime))}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本期收入"
              value={currentData.revenue}
              precision={0}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
              valueStyle={{ 
                color: getTrendColor(calculateChange(currentData.revenue, previousData.revenue))
              }}
              prefix={<DollarOutlined />}
              suffix={
                <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                  {calculateChange(currentData.revenue, previousData.revenue) > 0 ? 
                    <RiseOutlined /> : <FallOutlined />}
                  {Math.abs(calculateChange(currentData.revenue, previousData.revenue))}%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 详细分析 */}
      <Row gutter={16}>
        <Col span={16}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="趋势分析" key="1" icon={<LineChartOutlined />}>
              <Card>
                <div style={{ marginBottom: '16px' }}>
                  <Title level={4}>业绩趋势图</Title>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="cases" 
                      stroke="#1890ff" 
                      name="案件数量"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="recoveryRate" 
                      stroke="#52c41a" 
                      name="回款率(%)"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#faad14" 
                      name="收入(万元)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabPane>
            
            <TabPane tab="对比分析" key="2" icon={<BarChartOutlined />}>
              <Card>
                <div style={{ marginBottom: '16px' }}>
                  <Title level={4}>行业对比</Title>
                  <Text type="secondary">与行业平均水平和顶尖机构的对比</Text>
                </div>
                <Row gutter={16}>
                  {performanceData.comparisons.map((item, index) => (
                    <Col span={12} key={index} style={{ marginBottom: '16px' }}>
                      <Card size="small">
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong>{item.metric}</Text>
                          <span style={{ float: 'right' }}>
                            {item.trend === 'up' ? (
                              <RiseOutlined style={{ color: '#52c41a' }} />
                            ) : item.trend === 'down' ? (
                              <FallOutlined style={{ color: '#f5222d' }} />
                            ) : (
                              <Text type="secondary">—</Text>
                            )}
                          </span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>您的表现</span>
                            <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                              {item.yourValue}{item.unit}
                            </span>
                          </div>
                          <Progress 
                            percent={Math.min(100, (item.yourValue / item.topPerformer) * 100)} 
                            strokeColor="#1890ff"
                            size="small"
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                          <span>行业平均: {item.industryAvg}{item.unit}</span>
                          <span>顶尖表现: {item.topPerformer}{item.unit}</span>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </TabPane>
            
            <TabPane tab="收入分析" key="3" icon={<PieChartOutlined />}>
              <Card>
                <div style={{ marginBottom: '16px' }}>
                  <Title level={4}>收入构成分析</Title>
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: '服务费', value: 65, color: '#1890ff' },
                            { name: '成功费', value: 25, color: '#52c41a' },
                            { name: '其他费用', value: 10, color: '#faad14' }
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                        >
                          {[
                            { name: '服务费', value: 65, color: '#1890ff' },
                            { name: '成功费', value: 25, color: '#52c41a' },
                            { name: '其他费用', value: 10, color: '#faad14' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Col>
                  <Col span={12}>
                    <List
                      size="small"
                      dataSource={[
                        { title: '基础服务费', amount: 812000, ratio: 65 },
                        { title: '成功提成', amount: 312500, ratio: 25 },
                        { title: '其他收费', amount: 125500, ratio: 10 }
                      ]}
                      renderItem={item => (
                        <List.Item>
                          <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span>{item.title}</span>
                              <span style={{ fontWeight: 'bold' }}>¥{item.amount.toLocaleString()}</span>
                            </div>
                            <Progress percent={item.ratio} size="small" />
                          </div>
                        </List.Item>
                      )}
                    />
                  </Col>
                </Row>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
        
        <Col span={8}>
          <Card title="排名情况" style={{ marginBottom: '16px' }}>
            <List
              size="small"
              dataSource={performanceData.rankings}
              renderItem={item => (
                <List.Item>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{item.category}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {item.score}{item.category === '案件量' ? '件' : item.category === '服务质量' || item.category === '客户满意' ? '分' : '%'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Badge 
                        count={item.rank} 
                        style={{ backgroundColor: getRankColor(item.rank, item.total) }}
                      />
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        /{item.total}
                      </div>
                    </div>
                    <div style={{ marginLeft: '8px' }}>
                      {item.change > 0 ? (
                        <RiseOutlined style={{ color: '#52c41a' }} />
                      ) : item.change < 0 ? (
                        <FallOutlined style={{ color: '#f5222d' }} />
                      ) : (
                        <Text type="secondary">—</Text>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
          
          <Card title="最近成就" extra={<StarOutlined style={{ color: '#faad14' }} />}>
            <Timeline>
              {performanceData.achievements.map(achievement => (
                <Timeline.Item
                  key={achievement.id}
                  color={
                    achievement.type === 'milestone' ? '#52c41a' :
                    achievement.type === 'improvement' ? '#1890ff' : '#faad14'
                  }
                >
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      {achievement.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                      {achievement.description}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {achievement.achievedDate}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* 年度总结 */}
      <Card style={{ marginTop: '24px' }}>
        <Title level={4}>年度总结</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" title="总体表现">
              <Statistic
                title="年度案件总数"
                value={ytdData.totalCases}
                suffix="件"
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: '16px' }}>
                <Statistic
                  title="年度总收入"
                  value={ytdData.revenue}
                  formatter={(value) => `¥${Number(value).toLocaleString()}`}
                  valueStyle={{ color: '#52c41a' }}
                />
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="效率指标">
              <Statistic
                title="平均回款率"
                value={ytdData.recoveryRate}
                suffix="%"
                precision={1}
                valueStyle={{ color: '#faad14' }}
              />
              <div style={{ marginTop: '16px' }}>
                <Statistic
                  title="平均处置时效"
                  value={ytdData.avgDisposalTime}
                  suffix="天"
                  valueStyle={{ color: '#722ed1' }}
                />
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="市场地位">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1890ff' }}>
                  #{ytdData.ranking}
                </div>
                <div style={{ color: '#666' }}>
                  全市排名 (共{ytdData.competitorCount}家)
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    type="circle" 
                    percent={Math.round((1 - (ytdData.ranking - 1) / ytdData.competitorCount) * 100)}
                    size={80}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default PerformanceAnalysis;