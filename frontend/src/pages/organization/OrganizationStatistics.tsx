import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select, DatePicker, Progress } from 'antd';
import {
  TeamOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
// import { Line, Column, Pie } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

interface StatisticsData {
  totalOrganizations: number;
  activeOrganizations: number;
  pendingOrganizations: number;
  rejectedOrganizations: number;
  sourceOrganizations: number;
  disposalOrganizations: number;
  monthlyGrowth: number;
}

interface OrganizationTypeStats {
  type: string;
  typeName: string;
  count: number;
  percentage: number;
  activeCount: number;
  pendingCount: number;
}

interface TrendData {
  month: string;
  newOrganizations: number;
  activeOrganizations: number;
}

const OrganizationStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    pendingOrganizations: 0,
    rejectedOrganizations: 0,
    sourceOrganizations: 0,
    disposalOrganizations: 0,
    monthlyGrowth: 0,
  });
  const [typeStats, setTypeStats] = useState<OrganizationTypeStats[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading] = useState(false);

  useEffect(() => {
    loadStatistics();
    loadTypeStatistics();
    loadTrendData();
  }, []);

  const loadStatistics = async () => {
    try {
      // Mock data for development
      const mockStats: StatisticsData = {
        totalOrganizations: 256,
        activeOrganizations: 198,
        pendingOrganizations: 23,
        rejectedOrganizations: 35,
        sourceOrganizations: 156,
        disposalOrganizations: 100,
        monthlyGrowth: 12.5,
      };
      setStatistics(mockStats);
    } catch (error) {
      console.error('加载统计数据失败', error);
    }
  };

  const loadTypeStatistics = async () => {
    try {
      // Mock data for development
      const mockTypeStats: OrganizationTypeStats[] = [
        {
          type: 'BANK',
          typeName: '银行',
          count: 45,
          percentage: 17.6,
          activeCount: 42,
          pendingCount: 3,
        },
        {
          type: 'CONSUMER_FINANCE',
          typeName: '消费金融公司',
          count: 38,
          percentage: 14.8,
          activeCount: 35,
          pendingCount: 3,
        },
        {
          type: 'LAW_FIRM',
          typeName: '律师事务所',
          count: 67,
          percentage: 26.2,
          activeCount: 58,
          pendingCount: 9,
        },
        {
          type: 'MEDIATION_CENTER',
          typeName: '调解中心',
          count: 33,
          percentage: 12.9,
          activeCount: 28,
          pendingCount: 5,
        },
        {
          type: 'OTHER',
          typeName: '其他',
          count: 73,
          percentage: 28.5,
          activeCount: 65,
          pendingCount: 8,
        },
      ];
      setTypeStats(mockTypeStats);
    } catch (error) {
      console.error('加载类型统计失败', error);
    }
  };

  const loadTrendData = async () => {
    try {
      // Mock trend data for development
      const mockTrendData: TrendData[] = [
        { month: '2024-01', newOrganizations: 12, activeOrganizations: 145 },
        { month: '2024-02', newOrganizations: 15, activeOrganizations: 160 },
        { month: '2024-03', newOrganizations: 18, activeOrganizations: 178 },
        { month: '2024-04', newOrganizations: 22, activeOrganizations: 200 },
        { month: '2024-05', newOrganizations: 16, activeOrganizations: 216 },
        { month: '2024-06', newOrganizations: 19, activeOrganizations: 235 },
        { month: '2024-07', newOrganizations: 21, activeOrganizations: 256 },
      ];
      setTrendData(mockTrendData);
    } catch (error) {
      console.error('加载趋势数据失败', error);
    }
  };

  const typeColumns: ColumnsType<OrganizationTypeStats> = [
    {
      title: '机构类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: 150,
    },
    {
      title: '总数量',
      dataIndex: 'count',
      key: 'count',
      width: 100,
      render: (count) => <strong>{count}</strong>,
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 120,
      render: (percentage) => (
        <Progress 
          percent={percentage} 
          
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: '正常',
      dataIndex: 'activeCount',
      key: 'activeCount',
      width: 80,
      render: (count) => (
        <span style={{ color: '#52c41a' }}>
          <CheckCircleOutlined style={{ marginRight: 4 }} />
          {count}
        </span>
      ),
    },
    {
      title: '待审核',
      dataIndex: 'pendingCount',
      key: 'pendingCount',
      width: 80,
      render: (count) => (
        <span style={{ color: '#faad14' }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {count}
        </span>
      ),
    },
  ];

  // Simple trend summary for display
  const latestTrend = trendData.length > 0 ? trendData[trendData.length - 1] : null;
  const previousTrend = trendData.length > 1 ? trendData[trendData.length - 2] : null;

  return (
    <div>
      <Card title="机构统计分析" bordered={false}>
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <RangePicker 
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Select 
              placeholder="选择机构类型" 
              style={{ width: '100%' }}
              allowClear
            >
              <Select.Option value="BANK">银行</Select.Option>
              <Select.Option value="CONSUMER_FINANCE">消费金融公司</Select.Option>
              <Select.Option value="LAW_FIRM">律师事务所</Select.Option>
              <Select.Option value="MEDIATION_CENTER">调解中心</Select.Option>
            </Select>
          </Col>
        </Row>

        {/* Overview Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="机构总数"
                value={statistics.totalOrganizations}
                prefix={<TeamOutlined />}
                suffix="家"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="正常运行"
                value={statistics.activeOrganizations}
                prefix={<CheckCircleOutlined />}
                suffix="家"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待审核"
                value={statistics.pendingOrganizations}
                prefix={<ClockCircleOutlined />}
                suffix="家"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="月度增长"
                value={statistics.monthlyGrowth}
                prefix={<RiseOutlined />}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Trend Summary */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="趋势分析">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="本月新增"
                    value={latestTrend?.newOrganizations || 0}
                    suffix="家"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="环比增长"
                    value={previousTrend && latestTrend ? 
                      ((latestTrend.newOrganizations - previousTrend.newOrganizations) / previousTrend.newOrganizations * 100).toFixed(1) : 0}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
                <p>最近7个月趋势数据：</p>
                {trendData.slice(-7).map(item => (
                  <div key={item.month} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{item.month}</span>
                    <span>{item.newOrganizations}家</span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="类型分布">
              <Row gutter={16}>
                {typeStats.slice(0, 4).map((item, index) => (
                  <Col span={12} key={item.type} style={{ marginBottom: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: ['#1890ff', '#52c41a', '#faad14', '#f5222d'][index] }}>
                        {item.count}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {item.typeName}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {item.percentage}%
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Detailed Table */}
        <Row gutter={16}>
          <Col span={24}>
            <Card title="机构类型分布明细">
              <Table
                columns={typeColumns}
                dataSource={typeStats}
                rowKey="type"
                pagination={false}
               
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default OrganizationStatistics;