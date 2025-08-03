import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Progress, Table, DatePicker, Select, Button,
  Space, Divider, Typography, Tag, Tooltip, Rate, Badge, Timeline,
  Alert, Tabs, List, Avatar
} from 'antd';
import {
  TrophyOutlined, TeamOutlined, DollarOutlined, ClockCircleOutlined,
  RiseOutlined, FallOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  CalendarOutlined, UserOutlined, BankOutlined, FileTextOutlined,
  DownloadOutlined, PrinterOutlined, ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface PerformanceMetrics {
  totalCases: number;
  completedCases: number;
  completionRate: number;
  totalRecoveredAmount: number;
  recoveryRate: number;
  avgProcessingTime: number;
  customerSatisfaction: number;
  teamEfficiency: number;
  monthlyTarget: number;
  monthlyProgress: number;
}

interface CaseTypePerformance {
  type: string;
  typeName: string;
  caseCount: number;
  completedCount: number;
  completionRate: number;
  recoveryRate: number;
  avgProcessingTime: number;
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface TeamMemberPerformance {
  id: number;
  name: string;
  role: string;
  department: string;
  casesHandled: number;
  casesCompleted: number;
  completionRate: number;
  recoveryRate: number;
  avgProcessingTime: number;
  satisfaction: number;
  ranking: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

interface MonthlyTrend {
  month: string;
  completedCases: number;
  recoveredAmount: number;
  recoveryRate: number;
  avgProcessingTime: number;
  satisfaction: number;
}

const DisposalPerformanceDashboard: React.FC = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [caseTypePerformance, setCaseTypePerformance] = useState<CaseTypePerformance[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamMemberPerformance[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(6, 'month'), dayjs()]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPerformanceData();
  }, [dateRange, selectedPeriod]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // 模拟加载性能数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 综合指标
      setPerformanceMetrics({
        totalCases: 1250,
        completedCases: 865,
        completionRate: 69.2,
        totalRecoveredAmount: 8750000,
        recoveryRate: 68.5,
        avgProcessingTime: 42,
        customerSatisfaction: 4.6,
        teamEfficiency: 85.3,
        monthlyTarget: 1000,
        monthlyProgress: 86.5
      });

      // 案件类型表现
      setCaseTypePerformance([
        {
          type: 'BANK',
          typeName: '银行类',
          caseCount: 450,
          completedCount: 315,
          completionRate: 70,
          recoveryRate: 72,
          avgProcessingTime: 38,
          difficulty: 'MEDIUM'
        },
        {
          type: 'CONSUMER_FINANCE',
          typeName: '消费金融',
          caseCount: 380,
          completedCount: 268,
          completionRate: 70.5,
          recoveryRate: 65,
          avgProcessingTime: 45,
          difficulty: 'HIGH'
        },
        {
          type: 'ONLINE_LOAN',
          typeName: '网络贷款',
          caseCount: 420,
          completedCount: 282,
          completionRate: 67.1,
          recoveryRate: 68,
          avgProcessingTime: 43,
          difficulty: 'MEDIUM'
        }
      ]);

      // 团队成员表现
      setTeamPerformance([
        {
          id: 1,
          name: '李调解员',
          role: '高级调解员',
          department: '调解一部',
          casesHandled: 125,
          casesCompleted: 92,
          completionRate: 73.6,
          recoveryRate: 75,
          avgProcessingTime: 35,
          satisfaction: 4.8,
          ranking: 1,
          trend: 'UP'
        },
        {
          id: 2,
          name: '王律师',
          role: '资深律师',
          department: '法务部',
          casesHandled: 98,
          casesCompleted: 68,
          completionRate: 69.4,
          recoveryRate: 72,
          avgProcessingTime: 41,
          satisfaction: 4.5,
          ranking: 2,
          trend: 'STABLE'
        },
        {
          id: 3,
          name: '张专员',
          role: '调解员',
          department: '调解二部',
          casesHandled: 88,
          casesCompleted: 58,
          completionRate: 65.9,
          recoveryRate: 68,
          avgProcessingTime: 48,
          satisfaction: 4.3,
          ranking: 3,
          trend: 'DOWN'
        }
      ]);

      // 月度趋势
      setMonthlyTrend([
        { month: '2024-01', completedCases: 125, recoveredAmount: 1200000, recoveryRate: 65, avgProcessingTime: 45, satisfaction: 4.2 },
        { month: '2024-02', completedCases: 138, recoveredAmount: 1350000, recoveryRate: 67, avgProcessingTime: 43, satisfaction: 4.4 },
        { month: '2024-03', completedCases: 142, recoveredAmount: 1420000, recoveryRate: 68, avgProcessingTime: 42, satisfaction: 4.5 },
        { month: '2024-04', completedCases: 155, recoveredAmount: 1580000, recoveryRate: 69, avgProcessingTime: 40, satisfaction: 4.6 },
        { month: '2024-05', completedCases: 148, recoveredAmount: 1480000, recoveryRate: 70, avgProcessingTime: 41, satisfaction: 4.5 },
        { month: '2024-06', completedCases: 157, recoveredAmount: 1650000, recoveryRate: 71, avgProcessingTime: 39, satisfaction: 4.7 }
      ]);

    } catch (error) {
      console.error('加载性能数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyTag = (difficulty: string) => {
    const difficultyMap: Record<string, { color: string; text: string }> = {
      'LOW': { color: 'green', text: '简单' },
      'MEDIUM': { color: 'orange', text: '中等' },
      'HIGH': { color: 'red', text: '困难' }
    };
    const config = difficultyMap[difficulty] || { color: 'default', text: difficulty };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP':
        return <RiseOutlined style={{ color: '#52c41a' }} />;
      case 'DOWN':
        return <FallOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <span style={{ color: '#d9d9d9' }}>—</span>;
    }
  };

  const caseTypeColumns: ColumnsType<CaseTypePerformance> = [
    {
      title: '案件类型',
      dataIndex: 'typeName',
      key: 'typeName',
      render: (text: string, record: CaseTypePerformance) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          {getDifficultyTag(record.difficulty)}
        </div>
      ),
    },
    {
      title: '案件数量',
      key: 'caseCount',
      render: (_, record: CaseTypePerformance) => (
        <div>
          <Text>{record.caseCount}件</Text>
          <br />
          <Text type="secondary">完成 {record.completedCount}件</Text>
        </div>
      ),
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          strokeColor={rate > 70 ? '#52c41a' : rate > 50 ? '#1890ff' : '#fa8c16'}
        />
      ),
    },
    {
      title: '回款率',
      dataIndex: 'recoveryRate',
      key: 'recoveryRate',
      render: (rate: number) => (
        <div>
          <Text strong style={{ color: rate > 70 ? '#52c41a' : rate > 50 ? '#1890ff' : '#fa8c16' }}>
            {rate}%
          </Text>
        </div>
      ),
    },
    {
      title: '平均处理时间',
      dataIndex: 'avgProcessingTime',
      key: 'avgProcessingTime',
      render: (time: number) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          <Text>{time}天</Text>
        </div>
      ),
    },
  ];

  const teamPerformanceColumns: ColumnsType<TeamMemberPerformance> = [
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 60,
      render: (rank: number) => (
        <Badge 
          count={rank} 
          style={{ 
            backgroundColor: rank === 1 ? '#f5222d' : rank === 2 ? '#fa8c16' : '#52c41a' 
          }} 
        />
      ),
    },
    {
      title: '成员信息',
      key: 'memberInfo',
      render: (_, record: TeamMemberPerformance) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary">{record.role}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.department}</Text>
        </div>
      ),
    },
    {
      title: '案件数量',
      key: 'caseStats',
      render: (_, record: TeamMemberPerformance) => (
        <div>
          <Text>{record.casesHandled}件</Text>
          <br />
          <Text type="secondary">完成 {record.casesCompleted}件</Text>
        </div>
      ),
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          strokeColor={rate > 70 ? '#52c41a' : rate > 50 ? '#1890ff' : '#fa8c16'}
        />
      ),
    },
    {
      title: '回款率',
      dataIndex: 'recoveryRate',
      key: 'recoveryRate',
      render: (rate: number) => `${rate}%`,
    },
    {
      title: '平均处理时间',
      dataIndex: 'avgProcessingTime',
      key: 'avgProcessingTime',
      render: (time: number) => `${time}天`,
    },
    {
      title: '满意度',
      dataIndex: 'satisfaction',
      key: 'satisfaction',
      render: (rating: number) => (
        <Rate disabled value={rating} style={{ fontSize: '14px' }} />
      ),
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend: string) => getTrendIcon(trend),
    },
  ];

  if (!performanceMetrics) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 头部控制 */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <TrophyOutlined style={{ marginRight: 8 }} />
              处置效能分析看板
            </Title>
          </Col>
          <Col>
            <Space>
              <Select value={selectedPeriod} onChange={setSelectedPeriod}>
                <Option value="week">本周</Option>
                <Option value="month">本月</Option>
                <Option value="quarter">本季度</Option>
                <Option value="year">本年</Option>
                <Option value="custom">自定义</Option>
              </Select>
              {selectedPeriod === 'custom' && (
                <RangePicker 
                  value={dateRange}
                  onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                />
              )}
              <Button icon={<ReloadOutlined />} onClick={loadPerformanceData}>
                刷新
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="综合概览" key="overview">
          {/* 核心指标 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="案件完成率"
                  value={performanceMetrics.completionRate}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress 
                  percent={performanceMetrics.completionRate} 
                  showInfo={false} 
                  strokeColor="#52c41a"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="资金回款率"
                  value={performanceMetrics.recoveryRate}
                  suffix="%"
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Progress 
                  percent={performanceMetrics.recoveryRate} 
                  showInfo={false} 
                  strokeColor="#1890ff"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="平均处理时间"
                  value={performanceMetrics.avgProcessingTime}
                  suffix="天"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
                <Progress 
                  percent={100 - performanceMetrics.avgProcessingTime} 
                  showInfo={false} 
                  strokeColor="#fa8c16"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="客户满意度"
                  value={performanceMetrics.customerSatisfaction}
                  suffix="/5.0"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Rate disabled value={performanceMetrics.customerSatisfaction} style={{ fontSize: '14px' }} />
              </Card>
            </Col>
          </Row>

          {/* 详细统计 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card title="案件处理统计" size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="总案件数" 
                      value={performanceMetrics.totalCases} 
                      suffix="件"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="已完成" 
                      value={performanceMetrics.completedCases} 
                      suffix="件"
                    />
                  </Col>
                </Row>
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="月度目标" 
                      value={performanceMetrics.monthlyTarget} 
                      suffix="件"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="完成进度" 
                      value={performanceMetrics.monthlyProgress} 
                      suffix="%"
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="资金回收统计" size="small">
                <Statistic 
                  title="累计回款金额" 
                  value={(performanceMetrics.totalRecoveredAmount / 10000).toFixed(1)} 
                  suffix="万元"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">日均回款</Text>
                    <br />
                    <Text strong>
                      {((performanceMetrics.totalRecoveredAmount / 30) / 10000).toFixed(1)}万
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">单案均值</Text>
                    <br />
                    <Text strong>
                      {(performanceMetrics.totalRecoveredAmount / performanceMetrics.completedCases / 10000).toFixed(1)}万
                    </Text>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="团队效能统计" size="small">
                <Statistic 
                  title="团队效能指数" 
                  value={performanceMetrics.teamEfficiency} 
                  suffix="/100"
                  valueStyle={{ color: '#722ed1' }}
                />
                <Progress 
                  percent={performanceMetrics.teamEfficiency} 
                  size="small" 
                  strokeColor="#722ed1"
                />
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary">
                  基于完成率、回款率、处理时间、满意度等综合评估
                </Text>
              </Card>
            </Col>
          </Row>

          {/* 案件类型表现 */}
          <Card title="案件类型表现分析" style={{ marginBottom: 24 }}>
            <Table
              dataSource={caseTypePerformance}
              columns={caseTypeColumns}
              rowKey="type"
              pagination={false}
              size="middle"
            />
          </Card>
        </TabPane>

        <TabPane tab="团队表现" key="team">
          <Card title="团队成员表现排行" style={{ marginBottom: 24 }}>
            <Alert
              message="排行榜说明"
              description="基于案件完成率、回款率、处理时间、客户满意度等维度进行综合排名"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              dataSource={teamPerformance}
              columns={teamPerformanceColumns}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>

          {/* 团队协作统计 */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="部门协作情况" size="small">
                <List
                  dataSource={[
                    { dept: '调解一部', cooperation: 95, cases: 450 },
                    { dept: '调解二部', cooperation: 88, cases: 380 },
                    { dept: '法务部', cooperation: 92, cases: 420 }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<TeamOutlined />} />}
                        title={item.dept}
                        description={`协作指数: ${item.cooperation}% | 处理案件: ${item.cases}件`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="培训与发展" size="small">
                <Timeline
                  items={[
                    {
                      children: '完成"高效调解技巧"培训 - 15人参与',
                      color: 'green',
                    },
                    {
                      children: '组织"法律实务研讨会" - 待开展',
                      color: 'blue',
                    },
                    {
                      children: '计划"客户服务提升"培训 - 下月',
                      color: 'gray',
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="趋势分析" key="trend">
          <Card title="月度趋势分析" style={{ marginBottom: 24 }}>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic 
                  title="本月完成案件" 
                  value={monthlyTrend[monthlyTrend.length - 1]?.completedCases || 0} 
                  suffix="件"
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="本月回款金额" 
                  value={(monthlyTrend[monthlyTrend.length - 1]?.recoveredAmount / 10000).toFixed(1) || 0} 
                  suffix="万"
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="回款率趋势" 
                  value={monthlyTrend[monthlyTrend.length - 1]?.recoveryRate || 0} 
                  suffix="%"
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="满意度趋势" 
                  value={monthlyTrend[monthlyTrend.length - 1]?.satisfaction || 0} 
                  suffix="/5.0"
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>

            <Alert
              message="趋势分析"
              description="近6个月数据显示，团队处置效能稳步提升，回款率和客户满意度均呈上升趋势。建议继续保持当前工作方式，并加强团队协作。"
              type="success"
              showIcon
            />
          </Card>

          {/* 预测与建议 */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="效能预测" size="small">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Progress 
                    type="circle" 
                    percent={78} 
                    strokeColor="#52c41a"
                    format={percent => `${percent}%`}
                  />
                  <br />
                  <Text style={{ marginTop: 16, display: 'block' }}>
                    预计下月完成率达到78%
                  </Text>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="改进建议" size="small">
                <List
                  size="small"
                  dataSource={[
                    '加强困难案件的团队协作处理',
                    '优化调解流程，缩短平均处理时间',
                    '提升客户沟通技巧和服务质量',
                    '增加专业培训，提高业务能力'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DisposalPerformanceDashboard;