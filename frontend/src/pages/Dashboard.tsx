import React from 'react';
import { Card, Row, Col, Statistic, Typography, Progress, Table, Tag } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface RecentCase {
  key: string;
  packageName: string;
  caseCount: number;
  status: string;
  organizationName: string;
  createTime: string;
}

const Dashboard: React.FC = () => {
  // Mock data - in real app, these would come from API
  const recentCases: RecentCase[] = [
    {
      key: '1',
      packageName: '银行A-2024年第1批案件包',
      caseCount: 150,
      status: 'PROCESSING',
      organizationName: '中诚律师事务所',
      createTime: '2024-01-15',
    },
    {
      key: '2',
      packageName: '消金B-逾期案件包',
      caseCount: 89,
      status: 'PENDING_ASSIGNMENT',
      organizationName: '-',
      createTime: '2024-01-14',
    },
    {
      key: '3',
      packageName: '网贷C-催收案件包',
      caseCount: 203,
      status: 'CLOSED',
      organizationName: '东方调解中心',
      createTime: '2024-01-10',
    },
  ];

  const columns: ColumnsType<RecentCase> = [
    {
      title: '案件包名称',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: '案件数量',
      dataIndex: 'caseCount',
      key: 'caseCount',
      render: (count) => <Text strong>{count}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          PROCESSING: { color: 'processing', text: '处置中' },
          PENDING_ASSIGNMENT: { color: 'warning', text: '待分配' },
          CLOSED: { color: 'success', text: '已关闭' },
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '处置机构',
      dataIndex: 'organizationName',
      key: 'organizationName',
      render: (name) => name || <Text type="secondary">-</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        工作台
      </Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总机构数"
              value={156}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃案件包"
              value={23}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总案件数"
              value={12580}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="回款金额"
              value={8520000}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#eb2f96' }}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Cases */}
        <Col xs={24} lg={16}>
          <Card title="最近案件包" style={{ height: 400 }}>
            <Table
              columns={columns}
              dataSource={recentCases}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Performance Overview */}
        <Col xs={24} lg={8}>
          <Card title="处置效果概览" style={{ height: 400 }}>
            <div style={{ marginBottom: 24 }}>
              <Text>整体回款率</Text>
              <Progress
                percent={68}
                strokeColor="#52c41a"
                style={{ marginTop: 8 }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <Text>平均处置周期</Text>
              <div style={{ marginTop: 8 }}>
                <Statistic
                  value={45}
                  suffix="天"
                  valueStyle={{ fontSize: 24 }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Text>案件处置率</Text>
              <Progress
                percent={85}
                strokeColor="#1890ff"
                style={{ marginTop: 8 }}
              />
            </div>
            <div>
              <Text>机构满意度</Text>
              <Progress
                percent={92}
                strokeColor="#fa8c16"
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;