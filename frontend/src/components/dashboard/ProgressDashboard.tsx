import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
  Button,
  Select,
  DatePicker,
  Table,
  Tag,
  Avatar,
  List,
  Tooltip,
  Alert,
  Tabs,
  Badge,
  Timeline,
  Empty,
  Spin,
  Divider,
  message
} from 'antd';
import {
  DashboardOutlined,
  ArrowUpOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  ExportOutlined,
  ReloadOutlined,
  FilterOutlined,
  EyeOutlined
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
import moment from 'moment';
import { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface ProgressStats {
  totalProgress: number;
  todayProgress: number;
  weekProgress: number;
  monthProgress: number;
  avgResponseTime: number;
  completionRate: number;
  qualityScore: number;
  trend: number; // 百分比变化
}

interface ProgressTrend {
  date: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  avgQuality: number;
}

interface ProgressByType {
  type: string;
  typeName: string;
  count: number;
  percentage: number;
  color: string;
}

interface StaffPerformance {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  progressCount: number;
  successRate: number;
  avgQuality: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

interface CaseProgressSummary {
  caseId: string;
  caseNo: string;
  debtorName: string;
  totalProgress: number;
  lastProgressTime: string;
  nextScheduledTime?: string;
  status: string;
  handler: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ProgressDashboardProps {
  organizationId?: string;
  timeRange?: any;
  refreshInterval?: number; // 秒
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  organizationId,
  timeRange = [moment().subtract(30, 'days'), moment()],
  refreshInterval = 60
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<any>(timeRange);
  const [activeTab, setActiveTab] = useState('overview');
  
  // 数据状态
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    totalProgress: 0,
    todayProgress: 0,
    weekProgress: 0,
    monthProgress: 0,
    avgResponseTime: 0,
    completionRate: 0,
    qualityScore: 0,
    trend: 0
  });
  
  const [progressTrends, setProgressTrends] = useState<ProgressTrend[]>([]);
  const [progressByType, setProgressByType] = useState<ProgressByType[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [caseProgressSummary, setCaseProgressSummary] = useState<CaseProgressSummary[]>([]);

  useEffect(() => {
    loadDashboardData();
    
    // 设置自动刷新
    const interval = setInterval(loadDashboardData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [selectedTimeRange, refreshInterval]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 模拟数据加载
      await Promise.all([
        loadProgressStats(),
        loadProgressTrends(),
        loadProgressByType(),
        loadStaffPerformance(),
        loadCaseProgressSummary()
      ]);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadProgressStats = async () => {
    // 模拟统计数据
    setProgressStats({
      totalProgress: 15234,
      todayProgress: 156,
      weekProgress: 1089,
      monthProgress: 4578,
      avgResponseTime: 2.5,
      completionRate: 85.6,
      qualityScore: 4.2,
      trend: 12.5
    });
  };

  const loadProgressTrends = async () => {
    // 模拟趋势数据
    const mockTrends: ProgressTrend[] = Array.from({ length: 30 }, (_, i) => {
      const date = moment().subtract(29 - i, 'days');
      const total = Math.floor(Math.random() * 100) + 50;
      const success = Math.floor(total * (0.8 + Math.random() * 0.15));
      return {
        date: date.format('MM-DD'),
        totalCount: total,
        successCount: success,
        failedCount: total - success,
        avgQuality: 3.5 + Math.random() * 1.5
      };
    });
    setProgressTrends(mockTrends);
  };

  const loadProgressByType = async () => {
    // 模拟进度类型分布
    const mockTypes: ProgressByType[] = [
      { type: 'CONTACT', typeName: '联系记录', count: 5234, percentage: 35.2, color: '#1890ff' },
      { type: 'PAYMENT', typeName: '还款记录', count: 2156, percentage: 14.5, color: '#52c41a' },
      { type: 'VISIT', typeName: '外访记录', count: 1897, percentage: 12.8, color: '#faad14' },
      { type: 'NEGOTIATION', typeName: '协商记录', count: 2745, percentage: 18.5, color: '#722ed1' },
      { type: 'LEGAL', typeName: '法律程序', count: 1534, percentage: 10.3, color: '#f5222d' },
      { type: 'OTHER', typeName: '其他', count: 1298, percentage: 8.7, color: '#13c2c2' }
    ];
    setProgressByType(mockTypes);
  };

  const loadStaffPerformance = async () => {
    // 模拟员工绩效数据
    const mockStaff: StaffPerformance[] = Array.from({ length: 10 }, (_, i) => ({
      id: `STAFF${i + 1}`,
      name: `员工${i + 1}`,
      department: ['调解部', '法务部', '客服部'][Math.floor(Math.random() * 3)],
      progressCount: Math.floor(Math.random() * 200) + 50,
      successRate: 70 + Math.random() * 25,
      avgQuality: 3.0 + Math.random() * 2.0,
      rank: i + 1,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
    }));
    setStaffPerformance(mockStaff.sort((a, b) => b.progressCount - a.progressCount));
  };

  const loadCaseProgressSummary = async () => {
    // 模拟案件进度汇总
    const mockSummary: CaseProgressSummary[] = Array.from({ length: 20 }, (_, i) => ({
      caseId: `CASE${(i + 1).toString().padStart(6, '0')}`,
      caseNo: `2024${(i + 1).toString().padStart(6, '0')}`,
      debtorName: `债务人${i + 1}`,
      totalProgress: Math.floor(Math.random() * 20) + 1,
      lastProgressTime: moment().subtract(Math.floor(Math.random() * 72), 'hours').toISOString(),
      nextScheduledTime: Math.random() > 0.3 ? 
        moment().add(Math.floor(Math.random() * 168), 'hours').toISOString() : undefined,
      status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
      handler: ['张三', '李四', '王五'][Math.floor(Math.random() * 3)],
      riskLevel: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] as any
    }));
    setCaseProgressSummary(mockSummary);
  };

  // 员工绩效表格列
  const staffColumns: ColumnsType<StaffPerformance> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank: number) => (
        <Badge 
          count={rank} 
          style={{ 
            backgroundColor: rank <= 3 ? '#faad14' : '#d9d9d9',
            color: rank <= 3 ? '#fff' : '#666'
          }} 
        />
      )
    },
    {
      title: '员工',
      key: 'staff',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.department}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '进度数量',
      dataIndex: 'progressCount',
      key: 'progressCount',
      sorter: (a, b) => a.progressCount - b.progressCount,
      render: (count: number, record) => (
        <Space>
          <Text>{count}</Text>
          {record.trend === 'up' && <RiseOutlined style={{ color: '#52c41a' }} />}
          {record.trend === 'down' && <FallOutlined style={{ color: '#ff4d4f' }} />}
        </Space>
      )
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      sorter: (a, b) => a.successRate - b.successRate,
      render: (rate: number) => (
        <div>
          <Text>{rate.toFixed(1)}%</Text>
          <Progress 
            percent={rate} 
            size="small" 
            showInfo={false}
            strokeColor={rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#ff4d4f'}
          />
        </div>
      )
    },
    {
      title: '质量评分',
      dataIndex: 'avgQuality',
      key: 'avgQuality',
      sorter: (a, b) => a.avgQuality - b.avgQuality,
      render: (score: number) => (
        <Space>
          <Text>{score.toFixed(1)}</Text>
          <Text type="secondary">/ 5.0</Text>
        </Space>
      )
    }
  ];

  // 案件进度表格列
  const caseColumns: ColumnsType<CaseProgressSummary> = [
    {
      title: '案件编号',
      dataIndex: 'caseNo',
      key: 'caseNo',
      width: 120
    },
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName',
      width: 100
    },
    {
      title: '进度数量',
      dataIndex: 'totalProgress',
      key: 'totalProgress',
      width: 80,
      sorter: (a, b) => a.totalProgress - b.totalProgress
    },
    {
      title: '最近进度',
      dataIndex: 'lastProgressTime',
      key: 'lastProgressTime',
      width: 150,
      render: (time: string) => (
        <Tooltip title={moment(time).format('YYYY-MM-DD HH:mm:ss')}>
          <Text type="secondary">{moment(time).fromNow()}</Text>
        </Tooltip>
      )
    },
    {
      title: '下次计划',
      dataIndex: 'nextScheduledTime',
      key: 'nextScheduledTime',
      width: 150,
      render: (time?: string) => time ? (
        <Tooltip title={moment(time).format('YYYY-MM-DD HH:mm:ss')}>
          <Text>{moment(time).format('MM-DD HH:mm')}</Text>
        </Tooltip>
      ) : <Text type="secondary">-</Text>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          PENDING: { color: 'default', text: '待处理' },
          IN_PROGRESS: { color: 'processing', text: '进行中' },
          COMPLETED: { color: 'success', text: '已完成' }
        };
        const config = statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (risk: string) => {
        const riskMap = {
          HIGH: { color: 'red', text: '高' },
          MEDIUM: { color: 'orange', text: '中' },
          LOW: { color: 'green', text: '低' }
        };
        const config = riskMap[risk as keyof typeof riskMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100
    }
  ];

  return (
    <div className="progress-dashboard">
      {/* 头部控制栏 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>
            <DashboardOutlined /> 进度统计看板
          </Title>
        </Col>
        <Col>
          <Space>
            <RangePicker
              value={selectedTimeRange}
              onChange={(dates) => setSelectedTimeRange(dates)}
              format="YYYY-MM-DD"
            />
            <Button icon={<ReloadOutlined />} onClick={loadDashboardData}>
              刷新
            </Button>
            <Button icon={<ExportOutlined />}>
              导出
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 概览统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总进度记录"
              value={progressStats.totalProgress}
              prefix={<FileTextOutlined />}
              suffix={
                <Space>
                  {progressStats.trend > 0 ? (
                    <RiseOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <FallOutlined style={{ color: '#ff4d4f' }} />
                  )}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {Math.abs(progressStats.trend)}%
                  </Text>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={progressStats.todayProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="完成率"
              value={progressStats.completionRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="质量评分"
              value={progressStats.qualityScore}
              precision={1}
              suffix="/ 5.0"
              valueStyle={{ color: '#faad14' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细内容标签页 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="进度趋势" key="trends">
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Card title="进度数量趋势" size="small">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalCount" 
                        stroke="#1890ff" 
                        name="总数量"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="successCount" 
                        stroke="#52c41a" 
                        name="成功数量"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="质量分数趋势" size="small">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={progressTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <RechartsTooltip />
                      <Area 
                        type="monotone" 
                        dataKey="avgQuality" 
                        stroke="#faad14" 
                        fill="#faad14"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="类型分布" key="distribution">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="进度类型分布" size="small">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={progressByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ typeName, percentage }) => `${typeName} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {progressByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="类型统计详情" size="small">
                  <List
                    dataSource={progressByType}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <div 
                              style={{
                                width: 12,
                                height: 12,
                                backgroundColor: item.color,
                                borderRadius: '50%'
                              }}
                            />
                          }
                          title={item.typeName}
                          description={
                            <Space>
                              <Text>{item.count} 条</Text>
                              <Text type="secondary">({item.percentage}%)</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="员工绩效" key="performance">
            <Card title="员工绩效排行" size="small">
              <Table
                columns={staffColumns}
                dataSource={staffPerformance}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="案件进度" key="cases">
            <Card title="案件进度汇总" size="small">
              <Table
                columns={caseColumns}
                dataSource={caseProgressSummary}
                rowKey="caseId"
                size="small"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="实时监控" key="monitor">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="实时活动" size="small">
                  <Timeline>
                    <Timeline.Item color="green">
                      <Space>
                        <Text type="secondary">{moment().format('HH:mm')}</Text>
                        <Text>张三 完成案件 2024000123 的电话联系</Text>
                      </Space>
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <Space>
                        <Text type="secondary">{moment().subtract(2, 'minutes').format('HH:mm')}</Text>
                        <Text>李四 记录案件 2024000124 的还款信息</Text>
                      </Space>
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      <Space>
                        <Text type="secondary">{moment().subtract(5, 'minutes').format('HH:mm')}</Text>
                        <Text>王五 完成案件 2024000125 的外访记录</Text>
                      </Space>
                    </Timeline.Item>
                    <Timeline.Item>
                      <Space>
                        <Text type="secondary">{moment().subtract(8, 'minutes').format('HH:mm')}</Text>
                        <Text>系统自动生成催收函</Text>
                      </Space>
                    </Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="进度质量监控" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                      message="质量提醒"
                      description="检测到案件 2024000126 的进度记录质量较低，建议审核"
                      type="warning"
                      showIcon
                      action={
                        <Button size="small" type="text" icon={<EyeOutlined />}>
                          查看
                        </Button>
                      }
                    />
                    <Alert
                      message="及时性提醒"
                      description="案件 2024000127 已超过24小时未更新进度"
                      type="info"
                      showIcon
                      action={
                        <Button size="small" type="text" icon={<EyeOutlined />}>
                          查看
                        </Button>
                      }
                    />
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProgressDashboard;