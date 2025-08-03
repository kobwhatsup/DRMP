import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Statistic,
  Space,
  Divider,
  Tag,
  List,
  Avatar,
  message,
  Spin,
  Alert,
  Progress
} from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DashboardOutlined,
  BankOutlined,
  TeamOutlined,
  GlobalOutlined,
  DownloadOutlined,
  EyeOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FileTextOutlined,
  RightOutlined,
  FireOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { reportService } from '@/services/reportService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface QuickStat {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  color?: string;
  trend?: number;
}

interface ReportItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  type: 'dashboard' | 'report' | 'analysis';
  permissions: string[];
  lastUpdated?: string;
  popular?: boolean;
}

const ReportDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);

  // 报表功能列表
  const reportItems: ReportItem[] = [
    {
      id: 'platform_dashboard',
      title: '平台运营看板',
      description: '查看平台整体运营情况、机构活跃度、收入分析等核心指标',
      icon: <GlobalOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      path: '/reports/platform',
      type: 'dashboard',
      permissions: ['admin'],
      lastUpdated: '2分钟前',
      popular: true
    },
    {
      id: 'source_org_dashboard',
      title: '案源方业绩看板',
      description: '案源机构专属看板，跟踪案件发布、处置进度、回款情况等',
      icon: <BankOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      path: '/reports/source-org/1',
      type: 'dashboard',
      permissions: ['admin', 'source_org'],
      lastUpdated: '5分钟前',
      popular: true
    },
    {
      id: 'disposal_org_dashboard',
      title: '处置方效能看板',
      description: '处置机构专属看板，监控处置效率、成功率、团队业绩等',
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
      path: '/reports/disposal-org/1',
      type: 'dashboard',
      permissions: ['admin', 'disposal_org'],
      lastUpdated: '3分钟前',
      popular: true
    },
    {
      id: 'case_analysis',
      title: '案件数据分析',
      description: '深度分析案件类型、地域分布、处置周期等多维度数据',
      icon: <BarChartOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      path: '/cases/reports',
      type: 'analysis',
      permissions: ['admin', 'source_org', 'disposal_org'],
      lastUpdated: '10分钟前'
    },
    {
      id: 'performance_report',
      title: '业绩统计报告',
      description: '生成详细的业绩报告，支持多种维度和时间范围',
      icon: <TrophyOutlined style={{ fontSize: '24px', color: '#f5222d' }} />,
      path: '/performance/analysis',
      type: 'report',
      permissions: ['admin', 'source_org', 'disposal_org'],
      lastUpdated: '15分钟前'
    },
    {
      id: 'financial_report',
      title: '财务数据报表',
      description: '财务收支分析、对账统计、收入趋势等财务相关报表',
      icon: <PieChartOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />,
      path: '/financial/reports',
      type: 'report',
      permissions: ['admin', 'source_org', 'disposal_org'],
      lastUpdated: '20分钟前'
    }
  ];

  // 快速统计数据
  useEffect(() => {
    const loadQuickStats = async () => {
      setLoading(true);
      try {
        // 模拟加载实时统计数据
        const stats: QuickStat[] = [
          {
            title: '今日活跃机构',
            value: 156,
            prefix: <BankOutlined style={{ color: '#1890ff' }} />,
            color: '#1890ff',
            trend: 12
          },
          {
            title: '本月新增案件',
            value: '23,567',
            prefix: <FileTextOutlined style={{ color: '#52c41a' }} />,
            color: '#52c41a',
            trend: 8
          },
          {
            title: '平台总收入',
            value: '¥5.2M',
            prefix: <TrophyOutlined style={{ color: '#faad14' }} />,
            color: '#faad14',
            trend: 15
          },
          {
            title: '数据更新时间',
            value: dayjs().format('HH:mm:ss'),
            prefix: <ClockCircleOutlined style={{ color: '#722ed1' }} />,
            color: '#722ed1'
          }
        ];
        setQuickStats(stats);
      } catch (error) {
        message.error('加载统计数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadQuickStats();
    // 每30秒更新一次数据
    const interval = setInterval(loadQuickStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigateToReport = (item: ReportItem) => {
    navigate(item.path);
  };

  const handleExportReport = (reportId: string) => {
    message.info(`正在生成${reportItems.find(r => r.id === reportId)?.title}报表...`);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <DashboardOutlined style={{ marginRight: '8px' }} />
          数据报表分析
        </Title>
        <Paragraph type="secondary" style={{ marginTop: '8px', marginBottom: 0 }}>
          全面的数据分析和报表功能，助您洞察业务趋势，优化运营决策
        </Paragraph>
      </div>

      {/* 实时统计卡片 */}
      <Card title="实时数据概览" style={{ marginBottom: '24px' }}>
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            {quickStats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card size="small">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: stat.color }}
                  />
                  {stat.trend && (
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        较昨日 {stat.trend > 0 ? '↗' : '↘'} {Math.abs(stat.trend)}%
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </Spin>
      </Card>

      {/* 功能入口 */}
      <Row gutter={[24, 24]}>
        {/* 主要看板 */}
        <Col xs={24} lg={16}>
          <Card 
            title="主要看板" 
            extra={
              <Button type="link" icon={<EyeOutlined />}>
                查看全部
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              {reportItems
                .filter(item => item.type === 'dashboard')
                .map(item => (
                  <Col xs={24} sm={12} lg={8} key={item.id}>
                    <Card
                      size="small"
                      hoverable
                      style={{ height: '100%' }}
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => handleNavigateToReport(item)}
                    >
                      <div style={{ textAlign: 'center' }}>
                        {item.icon}
                        <div style={{ marginTop: '12px' }}>
                          <Text strong>{item.title}</Text>
                          {item.popular && (
                            <Tag color="red" style={{ marginLeft: '4px', fontSize: '11px' }}>
                              <FireOutlined /> 热门
                            </Tag>
                          )}
                        </div>
                        <Paragraph 
                          type="secondary" 
                          style={{ 
                            fontSize: '12px', 
                            marginTop: '8px',
                            marginBottom: '12px',
                            height: '32px',
                            overflow: 'hidden'
                          }}
                        >
                          {item.description}
                        </Paragraph>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {item.lastUpdated}
                          </Text>
                          <Button type="primary" size="small" icon={<RightOutlined />}>
                            查看
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>

        {/* 侧边栏 */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* 快速操作 */}
            <Card title="快速操作" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  block 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExportReport('platform_dashboard')}
                >
                  导出平台报表
                </Button>
                <Button 
                  block 
                  icon={<CalendarOutlined />}
                  onClick={() => navigate('/reports/platform')}
                >
                  定时报表设置
                </Button>
                <Button 
                  block 
                  icon={<LineChartOutlined />}
                  onClick={() => navigate('/cases/reports')}
                >
                  数据分析工具
                </Button>
              </Space>
            </Card>

            {/* 系统状态 */}
            <Card title="系统状态" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>数据同步状态</Text>
                  <Progress percent={98} size="small" status="active" />
                </div>
                <div>
                  <Text>报表生成队列</Text>
                  <Progress percent={45} size="small" />
                </div>
                <Alert
                  message="系统运行正常"
                  type="success"
                  showIcon
                  style={{ marginTop: '8px' }}
                />
              </Space>
            </Card>

            {/* 使用提示 */}
            <Card title="使用提示" size="small">
              <List
                size="small"
                dataSource={[
                  '点击看板卡片可直接进入对应报表',
                  '支持导出Excel格式的详细报表',
                  '数据每5分钟自动更新一次',
                  '可设置定时报表推送'
                ]}
                renderItem={(item, index) => (
                  <List.Item style={{ padding: '4px 0' }}>
                    <Text style={{ fontSize: '12px' }}>
                      {index + 1}. {item}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>

      <Divider />

      {/* 其他报表功能 */}
      <Card title="其他报表功能">
        <Row gutter={[16, 16]}>
          {reportItems
            .filter(item => item.type !== 'dashboard')
            .map(item => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  size="small"
                  hoverable
                  actions={[
                    <Button 
                      type="link" 
                      icon={<EyeOutlined />}
                      onClick={() => handleNavigateToReport(item)}
                    >
                      查看
                    </Button>,
                    <Button 
                      type="link" 
                      icon={<DownloadOutlined />}
                      onClick={() => handleExportReport(item.id)}
                    >
                      导出
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={<Avatar icon={item.icon} />}
                    title={item.title}
                    description={
                      <div>
                        <Paragraph 
                          style={{ 
                            fontSize: '12px', 
                            marginBottom: '8px',
                            color: '#666'
                          }}
                        >
                          {item.description}
                        </Paragraph>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Tag color={item.type === 'analysis' ? 'blue' : 'green'}>
                            {item.type === 'analysis' ? '数据分析' : '统计报表'}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {item.lastUpdated}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
        </Row>
      </Card>
    </div>
  );
};

export default ReportDashboard;