import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, DatePicker, Button, Space, 
  Table, Tag, Tabs, Alert, Spin, message
} from 'antd';
import {
  BarChartOutlined, PieChartOutlined, LineChartOutlined,
  DownloadOutlined, ReloadOutlined, InfoCircleOutlined,
  RiseOutlined, FallOutlined, DollarOutlined
} from '@ant-design/icons';
import CaseDistributionMap from '@/components/map/CaseDistributionMap';
import { Column, Pie, Line } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

// 数据接口定义
interface CaseStatsData {
  summary: {
    totalCases: number;
    totalAmount: string;
    avgAmount: number;
    monthGrowth: number;
    activeOrgs: number;
  };
  trendData: Array<{
    month: string;
    cases: number;
    amount: number;
  }>;
  typeDistribution: Array<{
    type: string;
    cases: number;
    amount: number;
    percentage: number;
  }>;
  orgRanking: Array<{
    orgId: number;
    orgName: string;
    orgType: string;
    cases: number;
    amount: string;
    growthRate: number;
    avgAmount: number;
    rank: number;
  }>;
  regionDistribution: Array<{
    region: string;
    cases: number;
    amount: string;
    orgCount: number;
    density: number;
  }>;
}

const SourceOrgCaseStats: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<CaseStatsData | null>(null);
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
      const mockData: CaseStatsData = {
        summary: {
          totalCases: 186190,
          totalAmount: '28.4亿',
          avgAmount: 15256,
          monthGrowth: 12.5,
          activeOrgs: 45
        },
        trendData: [
          { month: '2023-08', cases: 14200, amount: 21.2 },
          { month: '2023-09', cases: 15600, amount: 23.1 },
          { month: '2023-10', cases: 16800, amount: 24.8 },
          { month: '2023-11', cases: 15900, amount: 23.5 },
          { month: '2023-12', cases: 17200, amount: 25.6 },
          { month: '2024-01', cases: 16500, amount: 24.9 },
          { month: '2024-02', cases: 14800, amount: 22.3 },
          { month: '2024-03', cases: 18900, amount: 28.1 },
          { month: '2024-04', cases: 19600, amount: 29.4 },
          { month: '2024-05', cases: 18200, amount: 27.8 },
          { month: '2024-06', cases: 19800, amount: 30.2 },
          { month: '2024-07', cases: 20400, amount: 31.6 }
        ],
        typeDistribution: [
          { type: '个人消费贷', cases: 68500, amount: 102.3, percentage: 36.8 },
          { type: '信用卡', cases: 45200, amount: 67.8, percentage: 24.3 },
          { type: '汽车贷款', cases: 28900, amount: 78.2, percentage: 15.5 },
          { type: '房屋贷款', cases: 21600, amount: 95.4, percentage: 11.6 },
          { type: '经营贷款', cases: 15800, amount: 45.6, percentage: 8.5 },
          { type: '其他', cases: 6190, amount: 12.1, percentage: 3.3 }
        ],
        orgRanking: [
          {
            orgId: 1, orgName: '中国工商银行', orgType: 'BANK',
            cases: 28900, amount: '4.2亿', growthRate: 15.6, avgAmount: 14535, rank: 1
          },
          {
            orgId: 2, orgName: '招商银行', orgType: 'BANK', 
            cases: 24300, amount: '3.8亿', growthRate: 12.3, avgAmount: 15637, rank: 2
          },
          {
            orgId: 3, orgName: '平安普惠', orgType: 'CONSUMER_FINANCE',
            cases: 21600, amount: '3.1亿', growthRate: 18.9, avgAmount: 14352, rank: 3
          },
          {
            orgId: 4, orgName: '蚂蚁借呗', orgType: 'ONLINE_LOAN',
            cases: 19800, amount: '2.6亿', growthRate: -8.2, avgAmount: 13131, rank: 4
          },
          {
            orgId: 5, orgName: '京东金融', orgType: 'ONLINE_LOAN',
            cases: 18700, amount: '2.9亿', growthRate: 24.1, avgAmount: 15508, rank: 5
          }
        ],
        regionDistribution: [
          { region: '广东', cases: 28900, amount: '4.2亿', orgCount: 8, density: 7.8 },
          { region: '江苏', cases: 21600, amount: '3.1亿', orgCount: 6, density: 6.9 },
          { region: '山东', cases: 24300, amount: '3.5亿', orgCount: 7, density: 5.8 },
          { region: '浙江', cases: 18700, amount: '2.9亿', orgCount: 5, density: 6.4 },
          { region: '河南', cases: 19800, amount: '2.6亿', orgCount: 4, density: 4.9 }
        ]
      };
      
      setStatsData(mockData);
    } catch (error) {
      console.error('加载统计数据失败:', error);
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.success('导出功能开发中...');
  };

  // 趋势图配置
  const trendConfig = {
    data: statsData?.trendData || [],
    xField: 'month',
    yField: 'cases',
    height: 300,
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    color: '#1890ff',
    smooth: true,
  };

  // 类型分布柱状图配置
  const typeDistributionConfig = {
    data: statsData?.typeDistribution || [],
    xField: 'type',
    yField: 'cases',
    height: 300,
    color: '#52c41a',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      type: {
        alias: '案件类型',
      },
      cases: {
        alias: '案件数量',
      },
    },
  };

  // 饼图配置
  const pieConfig = {
    data: statsData?.typeDistribution || [],
    angleField: 'cases',
    colorField: 'type',
    radius: 0.8,
    height: 300,
    label: {
      type: 'outer' as const,
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  // 机构排行表格列配置
  const orgColumns: ColumnsType<any> = [
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
          'BANK': { name: '银行', color: 'blue' },
          'CONSUMER_FINANCE': { name: '消金', color: 'green' },
          'ONLINE_LOAN': { name: '网贷', color: 'orange' },
          'MICRO_LOAN': { name: '小贷', color: 'purple' },
        };
        const config = typeMap[type] || { name: type, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
    {
      title: '案件数量',
      dataIndex: 'cases',
      key: 'cases',
      width: 100,
      render: (cases: number) => cases.toLocaleString(),
    },
    {
      title: '案件金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
    },
    {
      title: '平均金额',
      dataIndex: 'avgAmount',
      key: 'avgAmount',
      width: 100,
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '增长率',
      dataIndex: 'growthRate',
      key: 'growthRate',
      width: 100,
      render: (rate: number) => (
        <span style={{ color: rate >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {rate >= 0 ? <RiseOutlined /> : <FallOutlined />}
          {Math.abs(rate)}%
        </span>
      ),
    },
  ];

  return (
    <div className="source-org-case-stats">
      <Card title="案源机构案件统计分析" bordered={false}>
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
              <Option value="MICRO_LOAN">小额贷款</Option>
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
              <Option value="华东">华东地区</Option>
              <Option value="华南">华南地区</Option>
              <Option value="华北">华北地区</Option>
              <Option value="华中">华中地区</Option>
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
              <Col span={5}>
                <Card>
                  <Statistic
                    title="案件总数"
                    value={statsData.summary.totalCases}
                    precision={0}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col span={5}>
                <Card>
                  <Statistic
                    title="案件总金额"
                    value={statsData.summary.totalAmount}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={5}>
                <Card>
                  <Statistic
                    title="平均案件金额"
                    value={statsData.summary.avgAmount}
                    precision={0}
                    prefix="¥"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={5}>
                <Card>
                  <Statistic
                    title="月度增长率"
                    value={statsData.summary.monthGrowth}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: statsData.summary.monthGrowth >= 0 ? '#52c41a' : '#ff4d4f' }}
                    prefix={statsData.summary.monthGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="活跃机构数"
                    value={statsData.summary.activeOrgs}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* 主要内容区域 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="地图分布" key="map">
              <Alert
                message="案件地理分布"
                description="展示全国各省市案件分布情况，包括案件数量、金额分布、热力图等多维度分析"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <CaseDistributionMap height={600} autoRefresh />
            </TabPane>

            <TabPane tab="趋势分析" key="trend">
              <Row gutter={16}>
                <Col span={24}>
                  <Card title="案件发布趋势">
                    <Line {...trendConfig} />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="类型分布" key="type">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="案件类型分布（柱状图）">
                    <Column {...typeDistributionConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="案件类型占比（饼图）">
                    <Pie {...pieConfig} />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="机构排行" key="ranking">
              <Card title="案源机构排行榜">
                <Table
                  columns={orgColumns}
                  dataSource={statsData?.orgRanking || []}
                  rowKey="orgId"
                  pagination={false}
                 
                />
              </Card>
            </TabPane>

            <TabPane tab="区域对比" key="region">
              <Row gutter={16}>
                <Col span={24}>
                  <Card title="区域案件分布对比">
                    <Table
                      columns={[
                        { title: '地区', dataIndex: 'region', key: 'region' },
                        { 
                          title: '案件数量', 
                          dataIndex: 'cases', 
                          key: 'cases',
                          render: (cases: number) => cases.toLocaleString()
                        },
                        { title: '案件金额', dataIndex: 'amount', key: 'amount' },
                        { title: '机构数量', dataIndex: 'orgCount', key: 'orgCount' },
                        { 
                          title: '案件密度', 
                          dataIndex: 'density', 
                          key: 'density',
                          render: (density: number) => `${density}/万人`
                        },
                      ]}
                      dataSource={statsData?.regionDistribution || []}
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

export default SourceOrgCaseStats;