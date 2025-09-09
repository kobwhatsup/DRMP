import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Space,
  Statistic,
  Table,
  Typography,
  Tabs,
  Progress,
  Tag,
  Alert,
  Divider,
  List,
  Avatar,
  Tooltip,
  message
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  FundOutlined,
  RiseOutlined,
  FallOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  DownloadOutlined,
  CalendarOutlined,
  TeamOutlined,
  BankOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

interface ReportData {
  caseStats: {
    total: number;
    filing: number;
    trial: number;
    execution: number;
    completed: number;
    successRate: number;
  };
  trendData: Array<{
    month: string;
    filing: number;
    completed: number;
    amount: number;
  }>;
  courtDistribution: Array<{
    court: string;
    count: number;
    percentage: number;
  }>;
  performanceData: Array<{
    lawyer: string;
    cases: number;
    successRate: number;
    amount: number;
    efficiency: number;
  }>;
  executionData: {
    totalAmount: number;
    recoveredAmount: number;
    recoveryRate: number;
    avgDuration: number;
  };
}

const ReportAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
  ]);
  const [reportType, setReportType] = useState('comprehensive');
  const [selectedCourt, setSelectedCourt] = useState('all');
  const [reportData, setReportData] = useState<ReportData>({
    caseStats: {
      total: 1856,
      filing: 234,
      trial: 156,
      execution: 489,
      completed: 977,
      successRate: 78.5
    },
    trendData: [
      { month: '2024-01', filing: 145, completed: 98, amount: 2456000 },
      { month: '2024-02', filing: 178, completed: 112, amount: 3124000 },
      { month: '2024-03', filing: 203, completed: 156, amount: 4567000 },
      { month: '2024-04', filing: 189, completed: 178, amount: 5234000 },
      { month: '2024-05', filing: 234, completed: 201, amount: 6789000 },
      { month: '2024-06', filing: 256, completed: 232, amount: 7456000 }
    ],
    courtDistribution: [
      { court: '北京市朝阳区人民法院', count: 456, percentage: 24.6 },
      { court: '北京市海淀区人民法院', count: 389, percentage: 21.0 },
      { court: '北京市东城区人民法院', count: 312, percentage: 16.8 },
      { court: '北京市西城区人民法院', count: 287, percentage: 15.5 },
      { court: '其他法院', count: 412, percentage: 22.1 }
    ],
    performanceData: [
      { lawyer: '张律师', cases: 234, successRate: 85.2, amount: 5678000, efficiency: 92 },
      { lawyer: '李律师', cases: 189, successRate: 78.9, amount: 4567000, efficiency: 88 },
      { lawyer: '王律师', cases: 167, successRate: 82.3, amount: 3456000, efficiency: 85 },
      { lawyer: '赵律师', cases: 145, successRate: 76.5, amount: 2345000, efficiency: 80 },
      { lawyer: '刘律师', cases: 134, successRate: 79.8, amount: 2123000, efficiency: 83 }
    ],
    executionData: {
      totalAmount: 45678900,
      recoveredAmount: 34567890,
      recoveryRate: 75.7,
      avgDuration: 45
    }
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange, reportType, selectedCourt]);

  const loadReportData = async () => {
    // 模拟加载报表数据
    message.success('报表数据已更新');
  };

  const generateReport = () => {
    message.success('报表生成中，请稍候...');
    setTimeout(() => {
      message.success('报表生成完成！');
    }, 2000);
  };

  const exportReport = (format: 'excel' | 'pdf') => {
    message.success(`正在导出${format === 'excel' ? 'Excel' : 'PDF'}报表...`);
  };

  const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

  const radarData = [
    { subject: '立案效率', A: 85, fullMark: 100 },
    { subject: '庭审质量', A: 78, fullMark: 100 },
    { subject: '执行力度', A: 92, fullMark: 100 },
    { subject: '回款速度', A: 76, fullMark: 100 },
    { subject: '客户满意度', A: 88, fullMark: 100 }
  ];

  const efficiencyData = [
    { name: '立案阶段', value: 85, fill: '#1890ff' },
    { name: '庭审阶段', value: 78, fill: '#52c41a' },
    { name: '执行阶段', value: 92, fill: '#faad14' },
    { name: '结案阶段', value: 88, fill: '#722ed1' }
  ];

  return (
    <div>
      {/* 报表控制栏 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Space>
              <Text strong>报表类型：</Text>
              <Select
                value={reportType}
                onChange={setReportType}
                style={{ width: 150 }}
              >
                <Option value="comprehensive">综合报表</Option>
                <Option value="filing">立案分析</Option>
                <Option value="trial">庭审分析</Option>
                <Option value="execution">执行分析</Option>
                <Option value="performance">业绩报表</Option>
              </Select>
            </Space>
          </Col>
          <Col span={6}>
            <Space>
              <Text strong>法院：</Text>
              <Select
                value={selectedCourt}
                onChange={setSelectedCourt}
                style={{ width: 180 }}
              >
                <Option value="all">全部法院</Option>
                <Option value="chaoyang">朝阳区法院</Option>
                <Option value="haidian">海淀区法院</Option>
                <Option value="dongcheng">东城区法院</Option>
                <Option value="xicheng">西城区法院</Option>
              </Select>
            </Space>
          </Col>
          <Col span={6}>
            <Space>
              <Text strong>时间范围：</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              />
            </Space>
          </Col>
          <Col span={6}>
            <Space>
              <Button type="primary" icon={<SyncOutlined />} onClick={generateReport}>
                生成报表
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={() => exportReport('excel')}>
                导出Excel
              </Button>
              <Button icon={<FilePdfOutlined />} onClick={() => exportReport('pdf')}>
                导出PDF
              </Button>
              <Button icon={<PrinterOutlined />}>
                打印
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
              title="案件总数"
              value={reportData.caseStats.total}
              prefix={<BankOutlined />}
              suffix="件"
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">同比增长 </Text>
              <Text style={{ color: '#52c41a' }}>
                <RiseOutlined /> 23.5%
              </Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功率"
              value={reportData.caseStats.successRate}
              prefix={<TrophyOutlined />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress
              percent={reportData.caseStats.successRate}
              strokeColor="#52c41a"
              showInfo={false}
              style={{ marginTop: '8px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="回款总额"
              value={reportData.executionData.recoveredAmount}
              prefix="¥"
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">回款率 </Text>
              <Text strong>{reportData.executionData.recoveryRate}%</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均处理时长"
              value={reportData.executionData.avgDuration}
              suffix="天"
              prefix={<ClockCircleOutlined />}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">环比优化 </Text>
              <Text style={{ color: '#52c41a' }}>
                <FallOutlined /> 15.2%
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 报表内容标签页 */}
      <Card>
        <Tabs defaultActiveKey="overview">
          <TabPane
            tab={
              <span>
                <AreaChartOutlined />
                总体概览
              </span>
            }
            key="overview"
          >
            <Row gutter={16}>
              <Col span={16}>
                <Card
                  title="案件趋势分析"
                  extra={
                    <Select defaultValue="month" size="small">
                      <Option value="day">按日</Option>
                      <Option value="week">按周</Option>
                      <Option value="month">按月</Option>
                      <Option value="quarter">按季度</Option>
                    </Select>
                  }
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="filing"
                        stackId="1"
                        stroke="#1890ff"
                        fill="#1890ff"
                        name="立案数"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stackId="1"
                        stroke="#52c41a"
                        fill="#52c41a"
                        name="结案数"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="案件状态分布">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '立案中', value: reportData.caseStats.filing },
                          { name: '庭审中', value: reportData.caseStats.trial },
                          { name: '执行中', value: reportData.caseStats.execution },
                          { name: '已完结', value: reportData.caseStats.completed }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2, 3].map((index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="法院案件分布">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.courtDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="court" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="count" fill="#1890ff" name="案件数量">
                        {reportData.courtDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="效率指标雷达图">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="效率指标"
                        dataKey="A"
                        stroke="#1890ff"
                        fill="#1890ff"
                        fillOpacity={0.6}
                      />
                      <ChartTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                团队业绩
              </span>
            }
            key="performance"
          >
            <Card
              title="律师业绩排行"
              extra={
                <Space>
                  <Select defaultValue="cases" size="small">
                    <Option value="cases">按案件数</Option>
                    <Option value="amount">按回款额</Option>
                    <Option value="rate">按成功率</Option>
                  </Select>
                  <Button size="small" type="primary">导出明细</Button>
                </Space>
              }
            >
              <Table
                dataSource={reportData.performanceData}
                pagination={false}
                columns={[
                  {
                    title: '排名',
                    key: 'rank',
                    render: (_, __, index) => {
                      const medals = ['🥇', '🥈', '🥉'];
                      return index < 3 ? medals[index] : index + 1;
                    }
                  },
                  {
                    title: '律师',
                    dataIndex: 'lawyer',
                    key: 'lawyer',
                    render: (name: string) => (
                      <Space>
                        <Avatar style={{ backgroundColor: '#1890ff' }}>
                          {name[0]}
                        </Avatar>
                        {name}
                      </Space>
                    )
                  },
                  {
                    title: '案件数',
                    dataIndex: 'cases',
                    key: 'cases',
                    sorter: (a, b) => a.cases - b.cases
                  },
                  {
                    title: '成功率',
                    dataIndex: 'successRate',
                    key: 'successRate',
                    render: (rate: number) => (
                      <Progress
                        percent={rate}
                        size="small"
                        strokeColor={rate > 80 ? '#52c41a' : rate > 60 ? '#faad14' : '#f5222d'}
                      />
                    ),
                    sorter: (a, b) => a.successRate - b.successRate
                  },
                  {
                    title: '回款金额',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (amount: number) => `¥${amount.toLocaleString()}`,
                    sorter: (a, b) => a.amount - b.amount
                  },
                  {
                    title: '效率评分',
                    dataIndex: 'efficiency',
                    key: 'efficiency',
                    render: (score: number) => (
                      <Tag color={score > 90 ? 'green' : score > 70 ? 'blue' : 'orange'}>
                        {score}分
                      </Tag>
                    )
                  }
                ]}
              />
            </Card>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="团队效率对比">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="10%"
                      outerRadius="80%"
                      data={efficiencyData}
                    >
                      <RadialBar
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        dataKey="value"
                      />
                      <ChartTooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="月度业绩趋势">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={reportData.trendData}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="filing"
                        stroke="#1890ff"
                        name="立案数"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="completed"
                        stroke="#52c41a"
                        name="结案数"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="amount"
                        stroke="#faad14"
                        name="回款额"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <FundOutlined />
                财务分析
              </span>
            }
            key="financial"
          >
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="目标回款额"
                    value={60000000}
                    prefix="¥"
                    precision={0}
                  />
                  <Progress
                    percent={75.7}
                    status="active"
                    strokeColor={{
                      from: '#108ee9',
                      to: '#87d068',
                    }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary">完成率：75.7%</Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="本月回款"
                    value={7456000}
                    prefix="¥"
                    precision={0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary">日均回款：</Text>
                    <Text strong>¥248,533</Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="待执行金额"
                    value={11111010}
                    prefix="¥"
                    precision={0}
                    valueStyle={{ color: '#faad14' }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary">预计回款周期：</Text>
                    <Text strong>45天</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card title="回款趋势分析">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={reportData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#52c41a"
                    fill="#52c41a"
                    fillOpacity={0.6}
                    name="回款金额"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                自定义报表
              </span>
            }
            key="custom"
          >
            <Alert
              message="自定义报表生成器"
              description="选择您需要的维度和指标，系统将为您生成定制化报表"
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />
            
            <Card>
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="选择维度" type="inner">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Select mode="multiple" placeholder="时间维度" style={{ width: '100%' }}>
                        <Option value="day">按日</Option>
                        <Option value="week">按周</Option>
                        <Option value="month">按月</Option>
                        <Option value="quarter">按季度</Option>
                        <Option value="year">按年</Option>
                      </Select>
                      <Select mode="multiple" placeholder="业务维度" style={{ width: '100%' }}>
                        <Option value="court">法院</Option>
                        <Option value="lawyer">承办律师</Option>
                        <Option value="caseType">案件类型</Option>
                        <Option value="status">案件状态</Option>
                      </Select>
                      <Select mode="multiple" placeholder="地域维度" style={{ width: '100%' }}>
                        <Option value="province">省份</Option>
                        <Option value="city">城市</Option>
                        <Option value="district">区县</Option>
                      </Select>
                    </Space>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="选择指标" type="inner">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Select mode="multiple" placeholder="数量指标" style={{ width: '100%' }}>
                        <Option value="caseCount">案件数量</Option>
                        <Option value="filingCount">立案数量</Option>
                        <Option value="completedCount">结案数量</Option>
                      </Select>
                      <Select mode="multiple" placeholder="金额指标" style={{ width: '100%' }}>
                        <Option value="totalAmount">标的总额</Option>
                        <Option value="recoveredAmount">回款金额</Option>
                        <Option value="feeAmount">律师费用</Option>
                      </Select>
                      <Select mode="multiple" placeholder="效率指标" style={{ width: '100%' }}>
                        <Option value="successRate">成功率</Option>
                        <Option value="recoveryRate">回款率</Option>
                        <Option value="avgDuration">平均时长</Option>
                      </Select>
                    </Space>
                  </Card>
                </Col>
              </Row>
              <Divider />
              <div style={{ textAlign: 'center' }}>
                <Space size="large">
                  <Button type="primary" size="large" icon={<BarChartOutlined />}>
                    生成报表
                  </Button>
                  <Button size="large" icon={<DownloadOutlined />}>
                    保存模板
                  </Button>
                </Space>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* 报表说明 */}
      <Card style={{ marginTop: '24px' }}>
        <Alert
          message="报表说明"
          description={
            <div>
              <p>1. 本报表数据实时更新，每日凌晨自动生成前一日报表</p>
              <p>2. 支持导出Excel、PDF格式，可直接打印或分享</p>
              <p>3. 自定义报表功能可根据业务需求灵活配置</p>
              <p>4. 如需历史报表，请访问文档管理中心</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default ReportAnalytics;