import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, DatePicker, Button, Space, 
  Table, Tag, Alert, Spin, message, Progress, Timeline, Avatar
} from 'antd';
import {
  BarChartOutlined, LineChartOutlined, PieChartOutlined,
  DownloadOutlined, ReloadOutlined, FileTextOutlined,
  RiseOutlined, FallOutlined, ClockCircleOutlined,
  CheckCircleOutlined, WarningOutlined, TeamOutlined
} from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 数据接口定义
interface CasePublishStatsData {
  summary: {
    totalPackages: number;
    totalCases: number;
    publishedToday: number;
    pendingReview: number;
    avgPackageSize: number;
    successRate: number;
  };
  publishTrend: Array<{
    date: string;
    packages: number;
    cases: number;
    avgSize: number;
  }>;
  orgPublishStats: Array<{
    orgId: number;
    orgName: string;
    orgType: string;
    totalPackages: number;
    totalCases: number;
    avgPackageSize: number;
    lastPublishDate: string;
    publishFrequency: number;
    qualityScore: number;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  }>;
  packageSizeDistribution: Array<{
    sizeRange: string;
    count: number;
    percentage: number;
  }>;
  recentPublishHistory: Array<{
    id: string;
    orgName: string;
    packageName: string;
    caseCount: number;
    publishDate: string;
    status: string;
    reviewer: string;
  }>;
  timeDistribution: Array<{
    hour: number;
    packages: number;
  }>;
}

const SourceOrgCasePublishStats: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<CasePublishStatsData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [selectedOrgType, setSelectedOrgType] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadStatsData();
    
    if (autoRefresh) {
      const interval = setInterval(loadStatsData, 30000); // 30秒刷新
      return () => clearInterval(interval);
    }
  }, [dateRange, selectedOrgType, autoRefresh]);

  const loadStatsData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: CasePublishStatsData = {
        summary: {
          totalPackages: 1256,
          totalCases: 186190,
          publishedToday: 23,
          pendingReview: 8,
          avgPackageSize: 148,
          successRate: 94.5
        },
        publishTrend: [
          { date: '2024-07-01', packages: 42, cases: 6200, avgSize: 147 },
          { date: '2024-07-02', packages: 38, cases: 5890, avgSize: 155 },
          { date: '2024-07-03', packages: 45, cases: 6750, avgSize: 150 },
          { date: '2024-07-04', packages: 41, cases: 6150, avgSize: 150 },
          { date: '2024-07-05', packages: 39, cases: 5850, avgSize: 150 },
          { date: '2024-07-06', packages: 43, cases: 6450, avgSize: 150 },
          { date: '2024-07-07', packages: 47, cases: 7050, avgSize: 150 },
          { date: '2024-07-08', packages: 44, cases: 6600, avgSize: 150 },
          { date: '2024-07-09', packages: 46, cases: 6900, avgSize: 150 },
          { date: '2024-07-10', packages: 48, cases: 7200, avgSize: 150 }
        ],
        orgPublishStats: [
          {
            orgId: 1, orgName: '中国工商银行', orgType: 'BANK',
            totalPackages: 156, totalCases: 28900, avgPackageSize: 185,
            lastPublishDate: '2024-07-30', publishFrequency: 5.2, qualityScore: 92.5,
            status: 'ACTIVE'
          },
          {
            orgId: 2, orgName: '招商银行', orgType: 'BANK', 
            totalPackages: 142, totalCases: 24300, avgPackageSize: 171,
            lastPublishDate: '2024-07-30', publishFrequency: 4.8, qualityScore: 89.2,
            status: 'ACTIVE'
          },
          {
            orgId: 3, orgName: '平安普惠', orgType: 'CONSUMER_FINANCE',
            totalPackages: 89, totalCases: 21600, avgPackageSize: 242,
            lastPublishDate: '2024-07-29', publishFrequency: 3.2, qualityScore: 85.8,
            status: 'ACTIVE'
          },
          {
            orgId: 4, orgName: '蚂蚁借呗', orgType: 'ONLINE_LOAN',
            totalPackages: 67, totalCases: 19800, avgPackageSize: 295,
            lastPublishDate: '2024-07-28', publishFrequency: 2.1, qualityScore: 78.3,
            status: 'SUSPENDED'
          }
        ],
        packageSizeDistribution: [
          { sizeRange: '1-50件', count: 156, percentage: 12.4 },
          { sizeRange: '51-100件', count: 289, percentage: 23.0 },
          { sizeRange: '101-200件', count: 412, percentage: 32.8 },
          { sizeRange: '201-500件', count: 298, percentage: 23.7 },
          { sizeRange: '500+件', count: 101, percentage: 8.1 }
        ],
        recentPublishHistory: [
          {
            id: 'PKG001', orgName: '中国工商银行', packageName: '个人消费贷批次2024073001',
            caseCount: 230, publishDate: '2024-07-30 10:30:00', status: 'APPROVED',
            reviewer: '李审核员'
          },
          {
            id: 'PKG002', orgName: '招商银行', packageName: '信用卡逾期批次2024073001', 
            caseCount: 180, publishDate: '2024-07-30 09:45:00', status: 'APPROVED',
            reviewer: '王审核员'
          },
          {
            id: 'PKG003', orgName: '平安普惠', packageName: '小额贷款批次2024073001',
            caseCount: 156, publishDate: '2024-07-30 09:15:00', status: 'PENDING',
            reviewer: '-'
          },
          {
            id: 'PKG004', orgName: '京东金融', packageName: '消费贷批次2024072901',
            caseCount: 195, publishDate: '2024-07-29 16:20:00', status: 'REJECTED',
            reviewer: '张审核员'
          }
        ],
        timeDistribution: [
          { hour: 9, packages: 45 },
          { hour: 10, packages: 52 },
          { hour: 11, packages: 38 },
          { hour: 14, packages: 41 },
          { hour: 15, packages: 48 },
          { hour: 16, packages: 35 },
          { hour: 17, packages: 28 }
        ]
      };
      
      setStatsData(mockData);
    } catch (error) {
      console.error('加载发布统计失败:', error);
      message.error('加载发布统计失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.success('导出功能开发中...');
  };

  // 发布趋势图配置
  const publishTrendConfig = {
    data: statsData?.publishTrend || [],
    xField: 'date',
    yField: 'packages',
    height: 300,
    point: {
      size: 5,
      shape: 'diamond',
    },
    color: '#1890ff',
    smooth: true,
  };

  // 案件包大小分布配置
  const packageSizeConfig = {
    data: statsData?.packageSizeDistribution || [],
    xField: 'sizeRange',
    yField: 'count',
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

  // 时间分布图配置
  const timeDistributionConfig = {
    data: statsData?.timeDistribution || [],
    angleField: 'packages',
    colorField: 'hour',
    radius: 0.8,
    height: 300,
    label: {
      type: 'outer' as const,
      content: '{name}时: {value}个',
    },
  };

  // 机构发布统计表格列配置
  const orgStatsColumns: ColumnsType<any> = [
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
      fixed: 'left',
    },
    {
      title: '机构类型',
      dataIndex: 'orgType',
      key: 'orgType',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { name: string; color: string }> = {
          'BANK': { name: '银行', color: 'blue' },
          'CONSUMER_FINANCE': { name: '消金', color: 'green' },
          'ONLINE_LOAN': { name: '网贷', color: 'orange' },
        };
        const config = typeMap[type] || { name: type, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
    {
      title: '案件包数',
      dataIndex: 'totalPackages',
      key: 'totalPackages',
      width: 100,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '案件总数',
      dataIndex: 'totalCases',
      key: 'totalCases',
      width: 100,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '平均包大小',
      dataIndex: 'avgPackageSize',
      key: 'avgPackageSize',
      width: 100,
      render: (size: number) => `${size}件`,
    },
    {
      title: '发布频率',
      dataIndex: 'publishFrequency',
      key: 'publishFrequency',
      width: 100,
      render: (freq: number) => `${freq}次/周`,
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 100,
      render: (score: number) => (
        <span style={{ 
          color: score >= 90 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f' 
        }}>
          {score}
        </span>
      ),
    },
    {
      title: '最后发布',
      dataIndex: 'lastPublishDate',
      key: 'lastPublishDate',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { name: string; color: string }> = {
          'ACTIVE': { name: '活跃', color: 'green' },
          'INACTIVE': { name: '不活跃', color: 'orange' },
          'SUSPENDED': { name: '暂停', color: 'red' },
        };
        const config = statusMap[status] || { name: status, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'PENDING': return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'REJECTED': return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'APPROVED': '已通过',
      'PENDING': '待审核',
      'REJECTED': '已拒绝',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="source-org-case-publish-stats">
      <Card title="案件发布统计分析" bordered={false}>
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
              <Option value="BANK">银行</Option>
              <Option value="CONSUMER_FINANCE">消费金融</Option>
              <Option value="ONLINE_LOAN">网络贷款</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadStatsData} loading={loading}>
                刷新
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出报告
              </Button>
              <span style={{ marginLeft: 16, color: '#666', fontSize: 12 }}>
                自动刷新: 
                <Button 
                  type="link" 
                 
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  style={{ padding: '0 4px' }}
                >
                  {autoRefresh ? '开启' : '关闭'}
                </Button>
              </span>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {/* 概览统计 */}
          {statsData && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="案件包总数"
                    value={statsData.summary.totalPackages}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="案件总数"
                    value={statsData.summary.totalCases}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="今日发布"
                    value={statsData.summary.publishedToday}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<RiseOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="待审核"
                    value={statsData.summary.pendingReview}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="平均包大小"
                    value={statsData.summary.avgPackageSize}
                    suffix="件"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="通过率"
                    value={statsData.summary.successRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#13c2c2' }}
                  />
                  <Progress 
                    percent={statsData.summary.successRate} 
                   
                    strokeColor="#13c2c2"
                    showInfo={false}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* 图表区域 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="发布趋势">
                <Line {...publishTrendConfig} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="案件包大小分布">
                <Column {...packageSizeConfig} />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="发布时间分布">
                <Pie {...timeDistributionConfig} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="最近发布记录">
                <Timeline style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {statsData?.recentPublishHistory.map(record => (
                    <Timeline.Item
                      key={record.id}
                      dot={getStatusIcon(record.status)}
                    >
                      <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                          {record.packageName}
                        </div>
                        <div style={{ color: '#666', marginBottom: 2 }}>
                          <TeamOutlined /> {record.orgName} | {record.caseCount}件案件
                        </div>
                        <div style={{ color: '#666', fontSize: 12 }}>
                          {record.publishDate} | {getStatusText(record.status)}
                          {record.reviewer !== '-' && ` | 审核：${record.reviewer}`}
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
          </Row>

          {/* 机构发布统计表格 */}
          <Card title="机构发布统计">
            <Table
              columns={orgStatsColumns}
              dataSource={statsData?.orgPublishStats || []}
              rowKey="orgId"
              scroll={{ x: 1000 }}
             
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
            />
          </Card>
        </Spin>
      </Card>
    </div>
  );
};

export default SourceOrgCasePublishStats;