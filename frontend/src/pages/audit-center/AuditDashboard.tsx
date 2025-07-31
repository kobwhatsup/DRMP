import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Progress, Table, Tag, Alert, Timeline, 
  Tabs, Select, DatePicker, Button, Space, Tooltip, Badge
} from 'antd';
import {
  AuditOutlined, ClockCircleOutlined, CheckCircleOutlined, 
  ExclamationCircleOutlined, TeamOutlined, TrophyOutlined,
  RiseOutlined, FallOutlined, CalendarOutlined, UserOutlined,
  FileTextOutlined, WarningOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Gauge } from '@ant-design/plots';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 审核仪表板数据接口
interface AuditDashboardData {
  // 总体统计
  overview: {
    totalApplications: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    approvalRate: number;
    avgProcessTime: number;
    todayApplications: number;
    urgentCount: number;
  };
  
  // 审核员工作量
  reviewerWorkload: Array<{
    reviewerId: string;
    reviewerName: string;
    pending: number;
    processing: number;
    completed: number;
    avgTime: number;
    efficiency: number;
    workload: number;
  }>;
  
  // 处理时效统计
  processTimeStats: {
    within24h: number;
    within48h: number;
    within72h: number;
    over72h: number;
    overdue: number;
  };
  
  // 申请趋势
  applicationTrend: Array<{
    date: string;
    applications: number;
    approvals: number;
    rejections: number;
    pending: number;
  }>;
  
  // 机构类型分布
  orgTypeDistribution: Array<{
    type: string;
    count: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  }>;
  
  // 拒绝原因统计
  rejectionReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  
  // 风险等级分布
  riskDistribution: Array<{
    level: string;
    count: number;
    percentage: number;
    avgProcessTime: number;
  }>;
  
  // 最近动态
  recentActivities: Array<{
    id: string;
    type: 'APPLY' | 'APPROVE' | 'REJECT' | 'RESUBMIT';
    orgName: string;
    reviewer: string;
    time: string;
    status: string;
  }>;
  
  // 待办事项
  todoItems: Array<{
    id: string;
    type: 'URGENT' | 'OVERDUE' | 'RESUBMIT' | 'REVIEW';
    title: string;
    orgName: string;
    dueTime: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

const AuditDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<AuditDashboardData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [selectedReviewer, setSelectedReviewer] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, selectedReviewer]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: AuditDashboardData = {
        overview: {
          totalApplications: 1247,
          pendingCount: 23,
          approvedCount: 187,
          rejectedCount: 12,
          approvalRate: 93.4,
          avgProcessTime: 2.3,
          todayApplications: 8,
          urgentCount: 5
        },
        
        reviewerWorkload: [
          {
            reviewerId: '001',
            reviewerName: '张审核员',
            pending: 8,
            processing: 3,
            completed: 156,
            avgTime: 2.1,
            efficiency: 95.2,
            workload: 85
          },
          {
            reviewerId: '002',
            reviewerName: '李审核员',
            pending: 6,
            processing: 2,
            completed: 189,
            avgTime: 1.8,
            efficiency: 97.5,
            workload: 78
          },
          {
            reviewerId: '003',
            reviewerName: '王审核员',
            pending: 9,
            processing: 4,
            completed: 142,
            avgTime: 2.5,
            efficiency: 91.8,
            workload: 92
          }
        ],
        
        processTimeStats: {
          within24h: 145,
          within48h: 87,
          within72h: 23,
          over72h: 8,
          overdue: 3
        },
        
        applicationTrend: [
          { date: '2024-07-01', applications: 12, approvals: 10, rejections: 1, pending: 1 },
          { date: '2024-07-02', applications: 15, approvals: 13, rejections: 2, pending: 0 },
          { date: '2024-07-03', applications: 8, approvals: 7, rejections: 1, pending: 0 },
          { date: '2024-07-04', applications: 18, approvals: 15, rejections: 2, pending: 1 },
          { date: '2024-07-05', applications: 11, approvals: 9, rejections: 1, pending: 1 },
          { date: '2024-07-06', applications: 9, approvals: 8, rejections: 0, pending: 1 },
          { date: '2024-07-07', applications: 14, approvals: 12, rejections: 1, pending: 1 }
        ],
        
        orgTypeDistribution: [
          { type: '银行', count: 456, approved: 432, rejected: 24, approvalRate: 94.7 },
          { type: '小贷公司', count: 378, approved: 351, rejected: 27, approvalRate: 92.9 },
          { type: '律师事务所', count: 234, approved: 218, rejected: 16, approvalRate: 93.2 },
          { type: '催收机构', count: 179, approved: 158, rejected: 21, approvalRate: 88.3 }
        ],
        
        rejectionReasons: [
          { reason: '资质材料不完整', count: 34, percentage: 38.6 },
          { reason: '营业执照过期', count: 18, percentage: 20.5 },
          { reason: '注册资本不足', count: 15, percentage: 17.0 },
          { reason: '经营范围不符', count: 12, percentage: 13.6 },
          { reason: '其他原因', count: 9, percentage: 10.3 }
        ],
        
        riskDistribution: [
          { level: '低风险', count: 856, percentage: 68.6, avgProcessTime: 1.8 },
          { level: '中风险', count: 312, percentage: 25.0, avgProcessTime: 2.5 },
          { level: '高风险', count: 79, percentage: 6.4, avgProcessTime: 4.2 }
        ],
        
        recentActivities: [
          {
            id: '1',
            type: 'APPLY',
            orgName: '深圳创新科技小贷公司',
            reviewer: '',
            time: '2024-07-28 14:30:00',
            status: '提交申请'
          },
          {
            id: '2',
            type: 'APPROVE',
            orgName: '北京德和律师事务所',
            reviewer: '张审核员',
            time: '2024-07-28 13:45:00',
            status: '审核通过'
          },
          {
            id: '3',
            type: 'RESUBMIT',
            orgName: '上海浦东催收公司',
            reviewer: '李审核员',
            time: '2024-07-28 11:20:00',
            status: '要求补充材料'
          }
        ],
        
        todoItems: [
          {
            id: '1',
            type: 'URGENT',
            title: '紧急审核申请',
            orgName: '深圳创新科技小贷公司',
            dueTime: '2024-07-28 18:00:00',
            priority: 'HIGH'
          },
          {
            id: '2',
            type: 'OVERDUE',
            title: '超期未审核',
            orgName: '广州华信投资公司',
            dueTime: '2024-07-27 17:00:00',
            priority: 'HIGH'
          },
          {
            id: '3',
            type: 'RESUBMIT',
            title: '补充材料审核',
            orgName: '上海浦东催收公司',
            dueTime: '2024-07-29 15:00:00',
            priority: 'MEDIUM'
          }
        ]
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!dashboardData) {
    return <Card loading={loading} />;
  }

  // 申请趋势图配置
  const trendConfig = {
    data: dashboardData.applicationTrend,
    xField: 'date',
    yField: 'applications',
    height: 300,
    point: { size: 5, shape: 'diamond' },
    color: '#1890ff',
    smooth: true,
  };

  // 机构类型分布图配置
  const typeDistributionConfig = {
    data: dashboardData.orgTypeDistribution,
    xField: 'type',
    yField: 'count',
    height: 300,
    color: '#52c41a',
    label: {
      position: 'middle' as const,
      style: { fill: '#FFFFFF', opacity: 0.6 },
    },
  };

  // 拒绝原因饼图配置
  const rejectionReasonsConfig = {
    data: dashboardData.rejectionReasons,
    angleField: 'count',
    colorField: 'reason',
    radius: 0.8,
    height: 300,
    label: {
      type: 'outer' as const,
      content: '{name} {percentage}%',
    },
  };

  // 审核员效率仪表盘配置
  const efficiencyGaugeConfig = {
    percent: 0.95,
    height: 200,
    color: ['#F4664A', '#FAAD14', '#30BF78'],
    innerRadius: 0.75,
    statistic: {
      title: {
        formatter: () => '整体效率',
        style: { fontSize: '14px' },
      },
      content: {
        style: { fontSize: '24px', fontWeight: 'bold' },
        formatter: ({ percent }: { percent: number }) => `${(percent * 100).toFixed(1)}%`,
      },
    },
  };

  const getActivityIcon = (type: string) => {
    const iconMap = {
      'APPLY': <FileTextOutlined style={{ color: '#1890ff' }} />,
      'APPROVE': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      'REJECT': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'RESUBMIT': <WarningOutlined style={{ color: '#faad14' }} />
    };
    return iconMap[type as keyof typeof iconMap] || <FileTextOutlined />;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap = {
      'HIGH': 'red',
      'MEDIUM': 'orange',
      'LOW': 'green'
    };
    return colorMap[priority as keyof typeof colorMap] || 'default';
  };

  const getTodoTypeIcon = (type: string) => {
    const iconMap = {
      'URGENT': <ThunderboltOutlined style={{ color: '#ff4d4f' }} />,
      'OVERDUE': <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      'RESUBMIT': <WarningOutlined style={{ color: '#faad14' }} />,
      'REVIEW': <AuditOutlined style={{ color: '#1890ff' }} />
    };
    return iconMap[type as keyof typeof iconMap] || <FileTextOutlined />;
  };

  return (
    <div className="audit-dashboard">
      <Card title="审核仪表板" bordered={false}>
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
          <Col span={6}>
            <Select
              value={selectedReviewer}
              onChange={setSelectedReviewer}
              style={{ width: '100%' }}
              placeholder="选择审核员"
            >
              <Option value="all">全部审核员</Option>
              <Option value="001">张审核员</Option>
              <Option value="002">李审核员</Option>
              <Option value="003">王审核员</Option>
            </Select>
          </Col>
          <Col span={10}>
            <Space>
              <Button type="primary" onClick={loadDashboardData}>
                刷新数据
              </Button>
              <Alert 
                message="实时数据每5分钟自动更新" 
                type="info" 
                showIcon 
                style={{ display: 'inline-block' }}
              />
            </Space>
          </Col>
        </Row>

        {/* 总体统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={3}>
            <Card>
              <Statistic
                title="总申请数"
                value={dashboardData.overview.totalApplications}
                valueStyle={{ color: '#1890ff' }}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="待审核"
                value={dashboardData.overview.pendingCount}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="已通过"
                value={dashboardData.overview.approvedCount}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="已拒绝"
                value={dashboardData.overview.rejectedCount}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="通过率"
                value={dashboardData.overview.approvalRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="平均用时"
                value={dashboardData.overview.avgProcessTime}
                precision={1}
                suffix="天"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="今日申请"
                value={dashboardData.overview.todayApplications}
                valueStyle={{ color: '#13c2c2' }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={3}>
            <Card>
              <Statistic
                title="紧急申请"
                value={dashboardData.overview.urgentCount}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 主要内容区域 */}
        <Row gutter={16}>
          <Col span={18}>
            <Tabs defaultActiveKey="trend">
              <TabPane tab="申请趋势" key="trend">
                <Card title="申请处理趋势">
                  <Line {...trendConfig} />
                </Card>
              </TabPane>
              
              <TabPane tab="机构分布" key="distribution">
                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="机构类型分布">
                      <Column {...typeDistributionConfig} />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="拒绝原因分析">
                      <Pie {...rejectionReasonsConfig} />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
              
              <TabPane tab="审核员工作量" key="workload">
                <Card title="审核员工作量统计">
                  <Table
                    dataSource={dashboardData.reviewerWorkload}
                    rowKey="reviewerId"
                   
                    pagination={false}
                    columns={[
                      { title: '审核员', dataIndex: 'reviewerName', key: 'reviewerName' },
                      { title: '待处理', dataIndex: 'pending', key: 'pending' },
                      { title: '处理中', dataIndex: 'processing', key: 'processing' },
                      { title: '已完成', dataIndex: 'completed', key: 'completed' },
                      { 
                        title: '平均用时', 
                        dataIndex: 'avgTime', 
                        key: 'avgTime',
                        render: (time: number) => `${time}天`
                      },
                      { 
                        title: '工作效率', 
                        dataIndex: 'efficiency', 
                        key: 'efficiency',
                        render: (efficiency: number) => (
                          <div>
                            <div>{efficiency}%</div>
                            <Progress 
                              percent={efficiency} 
                              
                              strokeColor={efficiency >= 95 ? '#52c41a' : efficiency >= 90 ? '#faad14' : '#ff4d4f'}
                              showInfo={false}
                            />
                          </div>
                        )
                      },
                      { 
                        title: '工作负荷', 
                        dataIndex: 'workload', 
                        key: 'workload',
                        render: (workload: number) => (
                          <Tag color={workload >= 90 ? 'red' : workload >= 80 ? 'orange' : 'green'}>
                            {workload}%
                          </Tag>
                        )
                      },
                    ]}
                  />
                </Card>
              </TabPane>
              
              <TabPane tab="处理时效" key="timeliness">
                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="处理时效分布">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="24小时内"
                            value={dashboardData.processTimeStats.within24h}
                            valueStyle={{ color: '#52c41a' }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="48小时内"
                            value={dashboardData.processTimeStats.within48h}
                            valueStyle={{ color: '#faad14' }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="72小时内"
                            value={dashboardData.processTimeStats.within72h}
                            valueStyle={{ color: '#ff7875' }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="超过72小时"
                            value={dashboardData.processTimeStats.over72h}
                            valueStyle={{ color: '#ff4d4f' }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="整体效率">
                      <Gauge {...efficiencyGaugeConfig} />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Col>
          
          <Col span={6}>
            <Card title="待办事项" style={{ marginBottom: 16 }}>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {dashboardData.todoItems.map(item => (
                  <div key={item.id} style={{ marginBottom: 12, padding: 8, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      {getTodoTypeIcon(item.type)}
                      <span style={{ marginLeft: 8, fontWeight: 'bold' }}>{item.title}</span>
                      <Tag 
                        color={getPriorityColor(item.priority)} 
                        style={{ marginLeft: 'auto' }}
                      >
                        {item.priority === 'HIGH' ? '高' : item.priority === 'MEDIUM' ? '中' : '低'}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>{item.orgName}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      <CalendarOutlined /> {dayjs(item.dueTime).format('MM-DD HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card title="最近动态">
              <Timeline>
                {dashboardData.recentActivities.map(activity => (
                  <Timeline.Item
                    key={activity.id}
                    dot={getActivityIcon(activity.type)}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{activity.orgName}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{activity.status}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {activity.reviewer && `${activity.reviewer} · `}
                        {dayjs(activity.time).fromNow()}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AuditDashboard;