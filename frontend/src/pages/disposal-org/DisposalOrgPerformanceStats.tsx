import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, DatePicker, Button, Space, 
  Table, Tag, Tabs, Alert, Spin, message, Progress, Badge
} from 'antd';
import {
  TrophyOutlined, RiseOutlined, FallOutlined, TeamOutlined,
  CheckCircleOutlined, ClockCircleOutlined, StarOutlined,
  DownloadOutlined, ReloadOutlined, InfoCircleOutlined,
  DollarOutlined, ThunderboltOutlined, CalendarOutlined
} from '@ant-design/icons';
import DisposalOrgMap from '@/components/map/DisposalOrgMap';
import { Line, Column, Pie, Gauge } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

// 数据接口定义
interface PerformanceStatsData {
  summary: {
    totalOrgs: number;
    topPerformers: number;
    avgPerformanceScore: number;
    totalHandled: number;
    avgSuccessRate: number;
    avgSatisfaction: number;
    totalRevenue: string;
    monthGrowth: number;
  };
  performanceTrend: Array<{
    month: string;
    avgScore: number;
    successRate: number;
    satisfaction: number;
    handled: number;
  }>;
  orgPerformanceRanking: Array<{
    rank: number;
    orgId: number;
    orgName: string;
    orgType: string;
    performanceScore: number;
    handled: number;
    successRate: number;
    satisfaction: number;
    revenue: string;
    growth: number;
    membershipLevel: string;
  }>;
  performanceDistribution: Array<{
    scoreRange: string;
    orgCount: number;
    percentage: number;
  }>;
  typePerformance: Array<{
    orgType: string;
    avgScore: number;
    avgSuccessRate: number;
    avgSatisfaction: number;
    totalHandled: number;
  }>;
  regionPerformance: Array<{
    region: string;
    orgCount: number;
    avgScore: number;
    totalHandled: number;
    topOrgName: string;
  }>;
  satisfactionTrend: Array<{
    month: string;
    satisfaction: number;
    complaints: number;
    compliments: number;
  }>;
  efficiencyMetrics: Array<{
    metric: string;
    value: number;
    target: number;
    status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  }>;
}

const DisposalOrgPerformanceStats: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<PerformanceStatsData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(12, 'month'),
    dayjs()
  ]);
  const [selectedOrgType, setSelectedOrgType] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStatsData();
  }, [dateRange, selectedOrgType, selectedRegion]);

  const loadStatsData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: PerformanceStatsData = {
        summary: {
          totalOrgs: 256,
          topPerformers: 45,
          avgPerformanceScore: 85.6,
          totalHandled: 186543,
          avgSuccessRate: 89.3,
          avgSatisfaction: 92.1,
          totalRevenue: '2,856万',
          monthGrowth: 12.5
        },
        performanceTrend: [
          { month: '2023-08', avgScore: 82.1, successRate: 86.2, satisfaction: 89.5, handled: 14200 },
          { month: '2023-09', avgScore: 83.4, successRate: 87.1, satisfaction: 90.1, handled: 15600 },
          { month: '2023-10', avgScore: 84.2, successRate: 87.8, satisfaction: 90.8, handled: 16800 },
          { month: '2023-11', avgScore: 83.9, successRate: 87.5, satisfaction: 90.3, handled: 15900 },
          { month: '2023-12', avgScore: 84.7, successRate: 88.2, satisfaction: 91.2, handled: 17200 },
          { month: '2024-01', avgScore: 85.1, successRate: 88.6, satisfaction: 91.5, handled: 16500 },
          { month: '2024-02', avgScore: 84.8, successRate: 88.3, satisfaction: 91.1, handled: 14800 },
          { month: '2024-03', avgScore: 85.5, successRate: 89.1, satisfaction: 91.8, handled: 18900 },
          { month: '2024-04', avgScore: 85.8, successRate: 89.4, satisfaction: 92.0, handled: 19600 },
          { month: '2024-05', avgScore: 85.3, successRate: 89.0, satisfaction: 91.7, handled: 18200 },
          { month: '2024-06', avgScore: 85.9, successRate: 89.6, satisfaction: 92.3, handled: 19800 },
          { month: '2024-07', avgScore: 85.6, successRate: 89.3, satisfaction: 92.1, handled: 20400 }
        ],
        orgPerformanceRanking: [
          {
            rank: 1, orgId: 4, orgName: '广州天河仲裁委员会', orgType: 'ARBITRATION_CENTER',
            performanceScore: 94.3, handled: 1567, successRate: 96.8, satisfaction: 95.1,
            revenue: '234万', growth: 15.8, membershipLevel: 'PLATINUM'
          },
          {
            rank: 2, orgId: 1, orgName: '北京朝阳调解中心', orgType: 'MEDIATION_CENTER',
            performanceScore: 92.5, handled: 2856, successRate: 89.5, satisfaction: 92.3,
            revenue: '156万', growth: 12.5, membershipLevel: 'PLATINUM'
          },
          {
            rank: 3, orgId: 2, orgName: '上海浦东法律服务所', orgType: 'LAW_FIRM',
            performanceScore: 88.7, handled: 2134, successRate: 85.2, satisfaction: 88.7,
            revenue: '198万', growth: 8.3, membershipLevel: 'GOLD'
          },
          {
            rank: 4, orgId: 5, orgName: '深圳福田律师事务所', orgType: 'LAW_FIRM',
            performanceScore: 87.2, handled: 1876, successRate: 84.6, satisfaction: 87.9,
            revenue: '167万', growth: 6.7, membershipLevel: 'GOLD'
          },
          {
            rank: 5, orgId: 3, orgName: '深圳南山催收服务公司', orgType: 'COLLECTION_AGENCY',
            performanceScore: 75.6, handled: 987, successRate: 72.1, satisfaction: 75.6,
            revenue: '89万', growth: -5.2, membershipLevel: 'BRONZE'
          }
        ],
        performanceDistribution: [
          { scoreRange: '90-100分', orgCount: 45, percentage: 17.6 },
          { scoreRange: '80-89分', orgCount: 128, percentage: 50.0 },
          { scoreRange: '70-79分', orgCount: 67, percentage: 26.2 },
          { scoreRange: '60-69分', orgCount: 13, percentage: 5.1 },
          { scoreRange: '60分以下', orgCount: 3, percentage: 1.1 }
        ],
        typePerformance: [
          {
            orgType: '仲裁中心',
            avgScore: 91.2,
            avgSuccessRate: 94.3,
            avgSatisfaction: 93.8,
            totalHandled: 12540
          },
          {
            orgType: '调解中心',
            avgScore: 88.5,
            avgSuccessRate: 87.6,
            avgSatisfaction: 90.2,
            totalHandled: 78600
          },
          {
            orgType: '律师事务所',
            avgScore: 85.3,
            avgSuccessRate: 84.8,
            avgSatisfaction: 87.9,
            totalHandled: 67890
          },
          {
            orgType: '催收机构',
            avgScore: 78.9,
            avgSuccessRate: 76.2,
            avgSatisfaction: 81.4,
            totalHandled: 27513
          }
        ],
        regionPerformance: [
          {
            region: '北京',
            orgCount: 15,
            avgScore: 89.2,
            totalHandled: 28900,
            topOrgName: '北京朝阳调解中心'
          },
          {
            region: '上海',
            orgCount: 18,
            avgScore: 87.5,
            totalHandled: 31200,
            topOrgName: '上海浦东法律服务所'
          },
          {
            region: '广东',
            orgCount: 45,
            avgScore: 85.8,
            totalHandled: 56700,
            topOrgName: '广州天河仲裁委员会'
          },
          {
            region: '江苏',
            orgCount: 32,
            avgScore: 84.6,
            totalHandled: 42300,
            topOrgName: '南京建邺调解中心'
          },
          {
            region: '浙江',
            orgCount: 28,
            avgScore: 86.1,
            totalHandled: 35600,
            topOrgName: '杭州西湖律师事务所'
          }
        ],
        satisfactionTrend: [
          { month: '2024-01', satisfaction: 91.5, complaints: 45, compliments: 567 },
          { month: '2024-02', satisfaction: 91.1, complaints: 52, compliments: 523 },
          { month: '2024-03', satisfaction: 91.8, complaints: 38, compliments: 634 },
          { month: '2024-04', satisfaction: 92.0, complaints: 41, compliments: 678 },
          { month: '2024-05', satisfaction: 91.7, complaints: 47, compliments: 612 },
          { month: '2024-06', satisfaction: 92.3, complaints: 35, compliments: 698 },
          { month: '2024-07', satisfaction: 92.1, complaints: 39, compliments: 689 }
        ],
        efficiencyMetrics: [
          { metric: '平均响应时间', value: 2.3, target: 2.0, status: 'GOOD' },
          { metric: '案件完成率', value: 89.3, target: 90.0, status: 'GOOD' },
          { metric: '客户投诉率', value: 2.1, target: 3.0, status: 'EXCELLENT' },
          { metric: '重复处理率', value: 4.5, target: 5.0, status: 'EXCELLENT' },
          { metric: '资源利用率', value: 78.5, target: 80.0, status: 'AVERAGE' }
        ]
      };
      
      setStatsData(mockData);
    } catch (error) {
      console.error('加载业绩统计失败:', error);
      message.error('加载业绩统计失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.success('导出功能开发中...');
  };

  // 业绩趋势图配置
  const performanceTrendConfig = {
    data: statsData?.performanceTrend || [],
    xField: 'month',
    yField: 'avgScore',
    height: 300,
    point: {
      size: 5,
      shape: 'diamond',
    },
    color: '#1890ff',
    smooth: true,
  };

  // 机构类型业绩图配置
  const typePerformanceConfig = {
    data: statsData?.typePerformance || [],
    xField: 'orgType',
    yField: 'avgScore',
    height: 300,
    color: '#52c41a',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
  };

  // 业绩分布饼图配置
  const performanceDistributionConfig = {
    data: statsData?.performanceDistribution || [],
    angleField: 'orgCount',
    colorField: 'scoreRange',
    radius: 0.8,
    height: 300,
    label: {
      type: 'outer' as const,
      content: '{name} {percentage}%',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  // 满意度趋势图配置
  const satisfactionTrendConfig = {
    data: statsData?.satisfactionTrend || [],
    xField: 'month',
    yField: 'satisfaction',
    height: 300,
    point: {
      size: 5,
      shape: 'diamond',
    },
    color: '#faad14',
    smooth: true,
  };

  // 机构业绩排行表格配置
  const performanceColumns: ColumnsType<any> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank: number) => (
        <div className={`rank-badge rank-${Math.min(rank, 3)}`}>
          {rank}
        </div>
      ),
    },
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
    },
    {
      title: '机构类型',
      dataIndex: 'orgType',
      key: 'orgType',
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, { name: string; color: string }> = {
          'MEDIATION_CENTER': { name: '调解中心', color: 'blue' },
          'LAW_FIRM': { name: '律所', color: 'green' },
          'COLLECTION_AGENCY': { name: '催收', color: 'orange' },
          'ARBITRATION_CENTER': { name: '仲裁', color: 'purple' },
        };
        const config = typeMap[type] || { name: type, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
    {
      title: '业绩评分',
      dataIndex: 'performanceScore',
      key: 'performanceScore',
      width: 120,
      render: (score: number) => (
        <div>
          <div style={{ 
            fontWeight: 'bold',
            color: score >= 90 ? '#52c41a' : score >= 80 ? '#faad14' : '#ff4d4f'
          }}>
            {score}
          </div>
          <Progress 
            percent={score} 
           
            strokeColor={score >= 90 ? '#52c41a' : score >= 80 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: '处理案件',
      dataIndex: 'handled',
      key: 'handled',
      width: 100,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      width: 100,
      render: (rate: number) => `${rate}%`,
    },
    {
      title: '满意度',
      dataIndex: 'satisfaction',
      key: 'satisfaction',
      width: 100,
      render: (satisfaction: number) => `${satisfaction}%`,
    },
    {
      title: '收入',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 100,
    },
    {
      title: '增长率',
      dataIndex: 'growth',
      key: 'growth',
      width: 100,
      render: (growth: number) => (
        <span style={{ color: growth >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {growth >= 0 ? <RiseOutlined /> : <FallOutlined />}
          {Math.abs(growth)}%
        </span>
      ),
    },
    {
      title: '会员等级',
      dataIndex: 'membershipLevel',
      key: 'membershipLevel',
      width: 100,
      render: (level: string) => {
        const levelColors: Record<string, string> = {
          'PLATINUM': '#722ed1',
          'GOLD': '#faad14',
          'SILVER': '#d9d9d9',
          'BRONZE': '#d48806'
        };
        return (
          <Tag color={levelColors[level] || 'default'}>
            {level}
          </Tag>
        );
      },
    },
  ];

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'EXCELLENT': '#52c41a',
      'GOOD': '#73d13d',
      'AVERAGE': '#faad14',
      'POOR': '#ff4d4f'
    };
    return statusMap[status] || '#d9d9d9';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'EXCELLENT': '优秀',
      'GOOD': '良好',
      'AVERAGE': '一般',
      'POOR': '待改进'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="disposal-org-performance-stats">
      <Card title="处置机构业绩统计分析" bordered={false}>
        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col span={4}>
            <Select
              value={selectedOrgType}
              onChange={setSelectedOrgType}
              style={{ width: '100%' }}
              placeholder="机构类型"
            >
              <Option value="all">全部类型</Option>
              <Option value="MEDIATION_CENTER">调解中心</Option>
              <Option value="LAW_FIRM">律师事务所</Option>
              <Option value="COLLECTION_AGENCY">催收机构</Option>
              <Option value="ARBITRATION_CENTER">仲裁中心</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={selectedRegion}
              onChange={setSelectedRegion}
              style={{ width: '100%' }}
              placeholder="所属地区"
            >
              <Option value="all">全部地区</Option>
              <Option value="北京">北京</Option>
              <Option value="上海">上海</Option>
              <Option value="广东">广东</Option>
              <Option value="江苏">江苏</Option>
              <Option value="浙江">浙江</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadStatsData} loading={loading}>
                刷新
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {/* 概览统计 */}
          {statsData && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="机构总数"
                    value={statsData.summary.totalOrgs}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="优秀机构"
                    value={statsData.summary.topPerformers}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<TrophyOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="平均业绩评分"
                    value={statsData.summary.avgPerformanceScore}
                    precision={1}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="处理案件总数"
                    value={statsData.summary.totalHandled}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="平均成功率"
                    value={statsData.summary.avgSuccessRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#13c2c2' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="平均满意度"
                    value={statsData.summary.avgSatisfaction}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#eb2f96' }}
                    prefix={<StarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="总收入"
                    value={statsData.summary.totalRevenue}
                    valueStyle={{ color: '#f5222d' }}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* 主要内容区域 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="地图分析" key="map">
              <Alert
                message="处置机构业绩地理分布"
                description="展示全国处置机构业绩分布情况，包括业绩评分、处理能力、服务质量等多维度分析"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <DisposalOrgMap height={650} autoRefresh />
            </TabPane>

            <TabPane tab="业绩概览" key="overview">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="业绩趋势">
                    <Line {...performanceTrendConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="机构类型业绩对比">
                    <Column {...typePerformanceConfig} />
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Card title="业绩分布">
                    <Pie {...performanceDistributionConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="效率指标">
                    <Row gutter={16}>
                      {statsData?.efficiencyMetrics.map((metric, index) => (
                        <Col span={24} key={index} style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 12 }}>{metric.metric}</span>
                            <Badge 
                              color={getStatusColor(metric.status)} 
                              text={getStatusText(metric.status)}
                            />
                          </div>
                          <Progress 
                            percent={(metric.value / metric.target) * 100} 
                            strokeColor={getStatusColor(metric.status)}
                            format={() => `${metric.value}${metric.metric.includes('率') ? '%' : metric.metric.includes('时间') ? 'h' : ''}`}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="机构排行" key="ranking">
              <Card title="机构业绩排行榜">
                <Table
                  columns={performanceColumns}
                  dataSource={statsData?.orgPerformanceRanking || []}
                  rowKey="orgId"
                 
                  pagination={false}
                />
              </Card>
            </TabPane>

            <TabPane tab="满意度分析" key="satisfaction">
              <Row gutter={16}>
                <Col span={16}>
                  <Card title="客户满意度趋势">
                    <Line {...satisfactionTrendConfig} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="满意度指标">
                    <Row gutter={16}>
                      <Col span={24}>
                        <Statistic
                          title="平均满意度"
                          value={statsData?.summary.avgSatisfaction || 0}
                          precision={1}
                          suffix="%"
                          valueStyle={{ color: '#52c41a' }}
                          style={{ marginBottom: 16 }}
                        />
                      </Col>
                      <Col span={24}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>本月投诉</div>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }}>
                            {statsData?.satisfactionTrend[statsData.satisfactionTrend.length - 1]?.complaints || 0}
                          </div>
                        </div>
                      </Col>
                      <Col span={24}>
                        <div>
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>本月表扬</div>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                            {statsData?.satisfactionTrend[statsData.satisfactionTrend.length - 1]?.compliments || 0}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="区域对比" key="region">
              <Row gutter={16}>
                <Col span={24}>
                  <Card title="区域业绩对比">
                    <Table
                      columns={[
                        { title: '地区', dataIndex: 'region', key: 'region' },
                        { title: '机构数量', dataIndex: 'orgCount', key: 'orgCount' },
                        { 
                          title: '平均评分', 
                          dataIndex: 'avgScore', 
                          key: 'avgScore',
                          render: (score: number) => (
                            <span style={{ 
                              fontWeight: 'bold',
                              color: score >= 90 ? '#52c41a' : score >= 80 ? '#faad14' : '#ff4d4f'
                            }}>
                              {score}
                            </span>
                          )
                        },
                        { 
                          title: '处理案件总数', 
                          dataIndex: 'totalHandled', 
                          key: 'totalHandled',
                          render: (count: number) => count.toLocaleString()
                        },
                        { title: '最佳机构', dataIndex: 'topOrgName', key: 'topOrgName' },
                      ]}
                      dataSource={statsData?.regionPerformance || []}
                      rowKey="region"
                     
                      pagination={false}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Spin>
      </Card>

      <style>{`
        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: white;
          font-weight: bold;
        }
        .rank-1 { background: #ff4d4f; }
        .rank-2 { background: #fa8c16; }
        .rank-3 { background: #fadb14; }
        .rank-badge:not(.rank-1):not(.rank-2):not(.rank-3) {
          background: #d9d9d9;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default DisposalOrgPerformanceStats;