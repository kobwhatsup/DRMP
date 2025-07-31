import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, Button, Space, Table, Tag, 
  Tabs, Alert, Spin, message, Progress, Badge, Tooltip
} from 'antd';
import {
  TeamOutlined, ThunderboltOutlined, WarningOutlined, CheckCircleOutlined,
  DownloadOutlined, ReloadOutlined, SettingOutlined, EyeOutlined,
  RiseOutlined, FallOutlined, SyncOutlined
} from '@ant-design/icons';
import DisposalOrgMap from '@/components/map/DisposalOrgMap';
import { Column, Gauge, Line } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';

const { TabPane } = Tabs;
const { Option } = Select;

// 数据接口定义
interface CapacityData {
  summary: {
    totalOrgs: number;
    activeOrgs: number;
    totalCapacity: number;
    usedCapacity: number;
    avgUtilization: number;
    overloadedOrgs: number;
    underutilizedOrgs: number;
    serviceGaps: number;
  };
  capacityTrend: Array<{
    month: string;
    totalCapacity: number;
    usedCapacity: number;
    utilization: number;
  }>;
  orgCapacityList: Array<{
    orgId: number;
    orgName: string;
    orgType: string;
    region: string;
    teamSize: number;
    monthlyCapacity: number;
    currentLoad: number;
    utilization: number;
    performanceScore: number;
    status: 'NORMAL' | 'OVERLOADED' | 'UNDERUTILIZED' | 'SUSPENDED';
    membershipStatus: string;
    lastUpdated: string;
  }>;
  regionCapacity: Array<{
    region: string;
    totalOrgs: number;
    totalCapacity: number;
    usedCapacity: number;
    utilization: number;
    coverageRate: number;
    serviceGaps: number;
  }>;
  capacityDistribution: Array<{
    utilizationRange: string;
    orgCount: number;
    percentage: number;
  }>;
}

const DisposalOrgCapacityManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [capacityData, setCapacityData] = useState<CapacityData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedOrgType, setSelectedOrgType] = useState<string>('all');
  const [utilizationFilter, setUtilizationFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadCapacityData();
    
    // 自动刷新
    if (autoRefresh) {
      const interval = setInterval(loadCapacityData, 60000); // 每分钟刷新
      return () => clearInterval(interval);
    }
  }, [selectedRegion, selectedOrgType, utilizationFilter, autoRefresh]);

  const loadCapacityData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: CapacityData = {
        summary: {
          totalOrgs: 256,
          activeOrgs: 231,
          totalCapacity: 52800,
          usedCapacity: 41440,
          avgUtilization: 78.5,
          overloadedOrgs: 12,
          underutilizedOrgs: 28,
          serviceGaps: 18
        },
        capacityTrend: [
          { month: '2024-01', totalCapacity: 48000, usedCapacity: 36000, utilization: 75.0 },
          { month: '2024-02', totalCapacity: 48500, usedCapacity: 36750, utilization: 75.8 },
          { month: '2024-03', totalCapacity: 49200, usedCapacity: 37632, utilization: 76.5 },
          { month: '2024-04', totalCapacity: 50100, usedCapacity: 38577, utilization: 77.0 },
          { month: '2024-05', totalCapacity: 51000, usedCapacity: 39780, utilization: 78.0 },
          { month: '2024-06', totalCapacity: 51800, usedCapacity: 40404, utilization: 78.0 },
          { month: '2024-07', totalCapacity: 52800, usedCapacity: 41440, utilization: 78.5 }
        ],
        orgCapacityList: [
          {
            orgId: 1, orgName: '北京朝阳调解中心', orgType: 'MEDIATION_CENTER', region: '北京',
            teamSize: 25, monthlyCapacity: 500, currentLoad: 480, utilization: 96,
            performanceScore: 92, status: 'OVERLOADED', membershipStatus: 'ACTIVE',
            lastUpdated: '2024-07-30 10:30:00'
          },
          {
            orgId: 2, orgName: '上海浦东法律服务所', orgType: 'LAW_FIRM', region: '上海',
            teamSize: 32, monthlyCapacity: 600, currentLoad: 420, utilization: 70,
            performanceScore: 88, status: 'NORMAL', membershipStatus: 'ACTIVE',
            lastUpdated: '2024-07-30 09:45:00'
          },
          {
            orgId: 3, orgName: '深圳南山调解中心', orgType: 'MEDIATION_CENTER', region: '广东',
            teamSize: 18, monthlyCapacity: 350, currentLoad: 140, utilization: 40,
            performanceScore: 65, status: 'UNDERUTILIZED', membershipStatus: 'EXPIRED',
            lastUpdated: '2024-07-30 08:20:00'
          },
          {
            orgId: 4, orgName: '广州天河律师事务所', orgType: 'LAW_FIRM', region: '广东',
            teamSize: 22, monthlyCapacity: 450, currentLoad: 360, utilization: 80,
            performanceScore: 85, status: 'NORMAL', membershipStatus: 'ACTIVE',
            lastUpdated: '2024-07-30 11:15:00'
          },
          {
            orgId: 5, orgName: '杭州西湖调解中心', orgType: 'MEDIATION_CENTER', region: '浙江',
            teamSize: 15, monthlyCapacity: 300, currentLoad: 0, utilization: 0,
            performanceScore: 0, status: 'SUSPENDED', membershipStatus: 'UNPAID',
            lastUpdated: '2024-07-28 16:00:00'
          }
        ],
        regionCapacity: [
          { region: '北京', totalOrgs: 15, totalCapacity: 3200, usedCapacity: 2680, utilization: 83.75, coverageRate: 95.2, serviceGaps: 1 },
          { region: '上海', totalOrgs: 18, totalCapacity: 3800, usedCapacity: 3420, utilization: 90.0, coverageRate: 98.5, serviceGaps: 0 },
          { region: '广东', totalOrgs: 45, totalCapacity: 8900, usedCapacity: 7120, utilization: 80.0, coverageRate: 87.3, serviceGaps: 3 },
          { region: '江苏', totalOrgs: 32, totalCapacity: 6400, usedCapacity: 4800, utilization: 75.0, coverageRate: 92.1, serviceGaps: 2 },
          { region: '浙江', totalOrgs: 28, totalCapacity: 5600, usedCapacity: 4480, utilization: 80.0, coverageRate: 89.7, serviceGaps: 2 }
        ],
        capacityDistribution: [
          { utilizationRange: '0-30%', orgCount: 28, percentage: 10.9 },
          { utilizationRange: '31-60%', orgCount: 45, percentage: 17.6 },
          { utilizationRange: '61-80%', orgCount: 98, percentage: 38.3 },
          { utilizationRange: '81-95%', orgCount: 73, percentage: 28.5 },
          { utilizationRange: '96-100%', orgCount: 12, percentage: 4.7 }
        ]
      };
      
      setCapacityData(mockData);
    } catch (error) {
      console.error('加载产能数据失败:', error);
      message.error('加载产能数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = () => {
    message.info('产能优化建议功能开发中...');
  };

  const handleExport = () => {
    message.success('导出产能报告功能开发中...');
  };

  // 产能利用率仪表盘配置
  const utilizationGaugeConfig = {
    percent: capacityData ? capacityData.summary.avgUtilization / 100 : 0,
    height: 200,
    color: ['#F4664A', '#FAAD14', '#30BF78'],
    innerRadius: 0.75,
    statistic: {
      title: {
        formatter: () => '平均利用率',
        style: ({ percent }: { percent: number }) => ({
          fontSize: '14px',
          color: percent > 0.85 ? '#F4664A' : '#30BF78',
        }),
      },
      content: {
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
        },
        formatter: ({ percent }: { percent: number }) => `${(percent * 100).toFixed(1)}%`,
      },
    },
  };

  // 产能趋势图配置
  const capacityTrendConfig = {
    data: capacityData?.capacityTrend || [],
    xField: 'month',
    yField: 'utilization',
    height: 300,
    color: '#1890ff',
    point: {
      size: 4,
      shape: 'diamond',
    },
    yAxis: {
      min: 70,
      max: 85,
      label: {
        formatter: (val: string) => `${val}%`,
      },
    },
  };

  // 机构产能表格列配置
  const orgColumns: ColumnsType<any> = [
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
      fixed: 'left',
    },
    {
      title: '类型',
      dataIndex: 'orgType',
      key: 'orgType',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { name: string; color: string }> = {
          'MEDIATION_CENTER': { name: '调解中心', color: 'blue' },
          'LAW_FIRM': { name: '律所', color: 'green' },
          'COLLECTION_AGENCY': { name: '催收', color: 'orange' },
        };
        const config = typeMap[type] || { name: type, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      width: 80,
    },
    {
      title: '团队规模',
      dataIndex: 'teamSize',
      key: 'teamSize',
      width: 80,
      render: (size: number) => `${size}人`,
    },
    {
      title: '月处理能力',
      dataIndex: 'monthlyCapacity',
      key: 'monthlyCapacity',
      width: 100,
      render: (capacity: number) => `${capacity}件`,
    },
    {
      title: '当前负载',
      dataIndex: 'currentLoad',
      key: 'currentLoad',
      width: 100,
      render: (load: number) => `${load}件`,
    },
    {
      title: '产能利用率',
      dataIndex: 'utilization',
      key: 'utilization',
      width: 120,
      render: (utilization: number) => (
        <div>
          <Progress 
            percent={utilization} 
           
            status={utilization > 95 ? 'exception' : utilization > 80 ? 'active' : 'normal'}
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
    },
    {
      title: '业绩评分',
      dataIndex: 'performanceScore',
      key: 'performanceScore',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
          'NORMAL': { name: '正常', color: 'green', icon: <CheckCircleOutlined /> },
          'OVERLOADED': { name: '超负荷', color: 'red', icon: <WarningOutlined /> },
          'UNDERUTILIZED': { name: '低负载', color: 'orange', icon: <FallOutlined /> },
          'SUSPENDED': { name: '暂停', color: 'default', icon: <SyncOutlined spin /> },
        };
        const config = statusMap[status] || { name: status, color: 'default', icon: null };
        return (
          <Tag color={config.color}>
            {config.icon} {config.name}
          </Tag>
        );
      },
    },
    {
      title: '会员状态',
      dataIndex: 'membershipStatus',
      key: 'membershipStatus',
      width: 100,
      render: (status: string) => (
        <Badge 
          status={status === 'ACTIVE' ? 'success' : status === 'EXPIRED' ? 'warning' : 'error'} 
          text={status === 'ACTIVE' ? '正常' : status === 'EXPIRED' ? '过期' : '未付费'}
        />
      ),
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 150,
      render: (time: string) => (
        <Tooltip title={time}>
          {time.split(' ')[0]}
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="调整产能">
            <Button icon={<SettingOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="disposal-org-capacity-management">
      <Card title="处置机构产能资源管理" bordered={false}>
        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Select
              value={selectedRegion}
              onChange={setSelectedRegion}
              style={{ width: '100%' }}
              placeholder="选择地区"
            >
              <Option value="all">全部地区</Option>
              <Option value="北京">北京</Option>
              <Option value="上海">上海</Option>
              <Option value="广东">广东</Option>
              <Option value="江苏">江苏</Option>
              <Option value="浙江">浙江</Option>
            </Select>
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
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={utilizationFilter}
              onChange={setUtilizationFilter}
              style={{ width: '100%' }}
              placeholder="利用率筛选"
            >
              <Option value="all">全部利用率</Option>
              <Option value="overloaded">超负荷 (&gt;95%)</Option>
              <Option value="high">高负载 (80-95%)</Option>
              <Option value="normal">正常 (60-80%)</Option>
              <Option value="low">低负载 (&lt;60%)</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadCapacityData} loading={loading}>
                刷新数据
              </Button>
              <Button icon={<ThunderboltOutlined />} type="primary" onClick={handleOptimize}>
                产能优化
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
          {capacityData && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="机构总数"
                    value={capacityData.summary.totalOrgs}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="活跃机构"
                    value={capacityData.summary.activeOrgs}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="总处理能力"
                    value={capacityData.summary.totalCapacity}
                    suffix="件/月"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="已用产能"
                    value={capacityData.summary.usedCapacity}
                    suffix="件/月"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="超负荷机构"
                    value={capacityData.summary.overloadedOrgs}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<WarningOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="服务空白点"
                    value={capacityData.summary.serviceGaps}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* 主要内容区域 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="地图分布" key="map">
              <Alert
                message="处置机构地理分布"
                description="展示全国处置机构分布情况，包括产能分布、服务覆盖、负载状态等多维度分析"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <DisposalOrgMap height={650} autoRefresh={autoRefresh} />
            </TabPane>

            <TabPane tab="产能概览" key="overview">
              <Row gutter={16}>
                <Col span={8}>
                  <Card title="平均产能利用率">
                    <Gauge {...utilizationGaugeConfig} />
                  </Card>
                </Col>
                <Col span={16}>
                  <Card title="产能利用率趋势">
                    <Line {...capacityTrendConfig} />
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Card title="产能分布统计">
                    <Column
                      data={capacityData?.capacityDistribution || []}
                      xField="utilizationRange"
                      yField="orgCount"
                      height={300}
                      color="#52c41a"
                      label={{
                        position: 'middle',
                        style: {
                          fill: '#FFFFFF',
                          opacity: 0.6,
                        },
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="机构明细" key="detail">
              <Card title="机构产能详情">
                <Table
                  columns={orgColumns}
                  dataSource={capacityData?.orgCapacityList || []}
                  rowKey="orgId"
                  scroll={{ x: 1200 }}
                 
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                  }}
                />
              </Card>
            </TabPane>

            <TabPane tab="区域分析" key="region">
              <Card title="区域产能分析">
                <Table
                  columns={[
                    { title: '地区', dataIndex: 'region', key: 'region' },
                    { title: '机构数量', dataIndex: 'totalOrgs', key: 'totalOrgs' },
                    { 
                      title: '总产能', 
                      dataIndex: 'totalCapacity', 
                      key: 'totalCapacity',
                      render: (capacity: number) => `${capacity.toLocaleString()}件/月`
                    },
                    { 
                      title: '已用产能', 
                      dataIndex: 'usedCapacity', 
                      key: 'usedCapacity',
                      render: (capacity: number) => `${capacity.toLocaleString()}件/月`
                    },
                    { 
                      title: '利用率', 
                      dataIndex: 'utilization', 
                      key: 'utilization',
                      render: (utilization: number) => (
                        <Progress 
                          percent={utilization} 
                         
                          format={(percent) => `${percent}%`}
                        />
                      )
                    },
                    { 
                      title: '覆盖率', 
                      dataIndex: 'coverageRate', 
                      key: 'coverageRate',
                      render: (rate: number) => `${rate}%`
                    },
                    { 
                      title: '服务空白', 
                      dataIndex: 'serviceGaps', 
                      key: 'serviceGaps',
                      render: (gaps: number) => (
                        <Tag color={gaps > 0 ? 'red' : 'green'}>
                          {gaps}个
                        </Tag>
                      )
                    },
                  ]}
                  dataSource={capacityData?.regionCapacity || []}
                  rowKey="region"
                  pagination={false}
                 
                />
              </Card>
            </TabPane>
          </Tabs>
        </Spin>
      </Card>
    </div>
  );
};

export default DisposalOrgCapacityManagement;