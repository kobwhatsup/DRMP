import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  DatePicker,
  Space,
  Button,
  Typography,
  Progress,
  List,
  Tag,
  Divider,
  Timeline,
  Avatar,
  Badge,
  Tooltip
} from 'antd';
import {
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  StarOutlined,
  PercentageOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

interface PerformanceData {
  mediatorId: string;
  mediatorName: string;
  department: string;
  totalCases: number;
  completedCases: number;
  successRate: number;
  totalAmount: number;
  collectedAmount: number;
  collectionRate: number;
  avgCycleTime: number;
  rating: number;
}

interface DailyStats {
  date: string;
  newCases: number;
  completedCases: number;
  collectedAmount: number;
  contactCount: number;
}

interface CaseTypeStats {
  type: string;
  count: number;
  successRate: number;
  avgAmount: number;
}

const PerformanceAnalysis: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // 模拟性能数据
  const performanceData: PerformanceData[] = [
    {
      mediatorId: '1',
      mediatorName: '王律师',
      department: '华南调解中心',
      totalCases: 156,
      completedCases: 142,
      successRate: 78.5,
      totalAmount: 2580000,
      collectedAmount: 1950000,
      collectionRate: 75.6,
      avgCycleTime: 12.5,
      rating: 4.8
    },
    {
      mediatorId: '2',
      mediatorName: '张调解员',
      department: '金融调解中心',
      totalCases: 134,
      completedCases: 128,
      successRate: 72.3,
      totalAmount: 2100000,
      collectedAmount: 1480000,
      collectionRate: 70.5,
      avgCycleTime: 15.2,
      rating: 4.5
    },
    {
      mediatorId: '3',
      mediatorName: '李调解员',
      department: '华南调解中心',
      totalCases: 98,
      completedCases: 89,
      successRate: 68.9,
      totalAmount: 1650000,
      collectedAmount: 1120000,
      collectionRate: 67.9,
      avgCycleTime: 18.3,
      rating: 4.2
    }
  ];

  const dailyStats: DailyStats[] = [
    { date: '2024-02-01', newCases: 12, completedCases: 8, collectedAmount: 156000, contactCount: 45 },
    { date: '2024-02-02', newCases: 15, completedCases: 11, collectedAmount: 189000, contactCount: 52 },
    { date: '2024-02-03', newCases: 9, completedCases: 13, collectedAmount: 234000, contactCount: 38 },
    { date: '2024-02-04', newCases: 18, completedCases: 6, collectedAmount: 98000, contactCount: 67 },
    { date: '2024-02-05', newCases: 14, completedCases: 16, collectedAmount: 278000, contactCount: 59 }
  ];

  const caseTypeStats: CaseTypeStats[] = [
    { type: '信用卡债务', count: 145, successRate: 76.5, avgAmount: 25000 },
    { type: '消费贷款', count: 89, successRate: 68.2, avgAmount: 35000 },
    { type: '网贷债务', count: 234, successRate: 71.8, avgAmount: 15000 },
    { type: '其他债务', count: 67, successRate: 65.4, avgAmount: 45000 }
  ];

  // 总体统计
  const overallStats = {
    totalMediators: performanceData.length,
    totalCases: performanceData.reduce((sum, item) => sum + item.totalCases, 0),
    completedCases: performanceData.reduce((sum, item) => sum + item.completedCases, 0),
    totalAmount: performanceData.reduce((sum, item) => sum + item.totalAmount, 0),
    collectedAmount: performanceData.reduce((sum, item) => sum + item.collectedAmount, 0),
    avgSuccessRate: performanceData.reduce((sum, item) => sum + item.successRate, 0) / performanceData.length,
    avgCollectionRate: performanceData.reduce((sum, item) => sum + item.collectionRate, 0) / performanceData.length,
    avgCycleTime: performanceData.reduce((sum, item) => sum + item.avgCycleTime, 0) / performanceData.length
  };

  const performanceColumns = [
    {
      title: '调解员',
      key: 'mediator',
      render: (record: PerformanceData) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.mediatorName}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.department}</div>
          </div>
        </Space>
      )
    },
    {
      title: '案件处理',
      key: 'cases',
      render: (record: PerformanceData) => (
        <div>
          <div>{record.completedCases}/{record.totalCases}</div>
          <Progress 
            percent={Math.round((record.completedCases / record.totalCases) * 100)} 
            size="small" 
            showInfo={false}
          />
        </div>
      )
    },
    {
      title: '调解成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <div>
          <span style={{ fontWeight: 'bold', color: rate > 75 ? '#52c41a' : rate > 60 ? '#faad14' : '#ff4d4f' }}>
            {rate.toFixed(1)}%
          </span>
          {rate > 75 ? <ArrowUpOutlined style={{ color: '#52c41a', marginLeft: 4 }} /> : 
           rate < 60 ? <ArrowDownOutlined style={{ color: '#ff4d4f', marginLeft: 4 }} /> : null}
        </div>
      ),
      sorter: (a: PerformanceData, b: PerformanceData) => a.successRate - b.successRate
    },
    {
      title: '回收金额',
      key: 'collection',
      render: (record: PerformanceData) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>¥{(record.collectedAmount / 10000).toFixed(1)}万</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            回收率: {record.collectionRate.toFixed(1)}%
          </div>
        </div>
      ),
      sorter: (a: PerformanceData, b: PerformanceData) => a.collectedAmount - b.collectedAmount
    },
    {
      title: '平均周期',
      dataIndex: 'avgCycleTime',
      key: 'avgCycleTime',
      render: (days: number) => `${days.toFixed(1)}天`,
      sorter: (a: PerformanceData, b: PerformanceData) => a.avgCycleTime - b.avgCycleTime
    },
    {
      title: '评价',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <span>{rating.toFixed(1)}</span>
        </Space>
      ),
      sorter: (a: PerformanceData, b: PerformanceData) => a.rating - b.rating
    }
  ];

  const topPerformers = [...performanceData]
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 3);

  return (
    <div>
      {/* 时间选择和筛选 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Select value={selectedPeriod} onChange={setSelectedPeriod} style={{ width: 120 }}>
                <Option value="week">本周</Option>
                <Option value="month">本月</Option>
                <Option value="quarter">本季度</Option>
                <Option value="year">本年度</Option>
                <Option value="custom">自定义</Option>
              </Select>
              {selectedPeriod === 'custom' && (
                <RangePicker 
                  value={dateRange} 
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([dates[0], dates[1]]);
                    } else {
                      setDateRange(null);
                    }
                  }} 
                />
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<BarChartOutlined />}>
                生成报表
              </Button>
              <Button icon={<FileTextOutlined />}>
                导出数据
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 总体统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="调解员总数"
              value={overallStats.totalMediators}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总案件数"
              value={overallStats.totalCases}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均成功率"
              value={overallStats.avgSuccessRate}
              precision={1}
              suffix="%"
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总回收金额"
              value={overallStats.collectedAmount / 10000}
              precision={1}
              suffix="万元"
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 左侧：排行榜和趋势 */}
        <Col span={8}>
          {/* 业绩排行榜 */}
          <Card title="业绩排行榜" style={{ marginBottom: 16 }}>
            <List
              dataSource={topPerformers}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge count={index + 1} style={{ backgroundColor: index === 0 ? '#f5222d' : index === 1 ? '#fa8c16' : '#faad14' }}>
                        <Avatar icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={item.mediatorName}
                    description={
                      <div>
                        <div>成功率: {item.successRate.toFixed(1)}%</div>
                        <div>回收: ¥{(item.collectedAmount / 10000).toFixed(1)}万</div>
                      </div>
                    }
                  />
                  {index === 0 && <TrophyOutlined style={{ color: '#faad14', fontSize: 20 }} />}
                </List.Item>
              )}
            />
          </Card>

          {/* 案件类型统计 */}
          <Card title="案件类型分析">
            <List
              dataSource={caseTypeStats}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.type}
                    description={
                      <div>
                        <div>数量: {item.count}件</div>
                        <div>成功率: {item.successRate.toFixed(1)}%</div>
                        <div>平均金额: ¥{item.avgAmount.toLocaleString()}</div>
                      </div>
                    }
                  />
                  <Progress 
                    type="circle" 
                    percent={item.successRate} 
                    width={50} 
                    format={percent => `${percent?.toFixed(0)}%`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 右侧：详细数据表格 */}
        <Col span={16}>
          <Card title="调解员业绩详情">
            <Table
              columns={performanceColumns}
              dataSource={performanceData}
              rowKey="mediatorId"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      {/* 近期活动时间线 */}
      <Card title="近期重要事件" style={{ marginTop: 16 }}>
        <Timeline>
          <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
            <div>
              <Text strong>调解成功</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>2小时前</Text>
            </div>
            <div>王律师成功调解案件MED-2024-156，回收金额15万元</div>
          </Timeline.Item>
          <Timeline.Item color="blue" dot={<PhoneOutlined />}>
            <div>
              <Text strong>批量联系</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>4小时前</Text>
            </div>
            <div>张调解员完成批量外呼，联系债务人23人次</div>
          </Timeline.Item>
          <Timeline.Item color="orange" dot={<ClockCircleOutlined />}>
            <div>
              <Text strong>方案调整</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>1天前</Text>
            </div>
            <div>李调解员为5个案件调整还款方案，延长还款周期</div>
          </Timeline.Item>
          <Timeline.Item dot={<CalendarOutlined />}>
            <div>
              <Text strong>预约调解</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>2天前</Text>
            </div>
            <div>本周预约调解会议12场，涉及金额180万元</div>
          </Timeline.Item>
        </Timeline>
      </Card>
    </div>
  );
};

export default PerformanceAnalysis;