import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, Button, Space, Table, Tag, 
  Tabs, Alert, Spin, message, Progress, Badge, Modal, Form, Input,
  DatePicker, InputNumber, Rate, Descriptions, Timeline, Divider
} from 'antd';
import {
  CrownOutlined, DollarOutlined, CalendarOutlined, TrophyOutlined,
  DownloadOutlined, ReloadOutlined, SettingOutlined, EditOutlined,
  CheckCircleOutlined, WarningOutlined, StarOutlined, GiftOutlined,
  UserOutlined, SafetyCertificateOutlined, UpOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// 数据接口定义
interface MembershipData {
  summary: {
    totalMembers: number;
    platinumMembers: number;
    goldMembers: number;
    silverMembers: number;
    bronzeMembers: number;
    avgMembershipLevel: number;
    totalRevenue: string;
    renewalRate: number;
  };
  membershipTrend: Array<{
    month: string;
    newMembers: number;
    renewals: number;
    upgrades: number;
    cancellations: number;
  }>;
  levelDistribution: Array<{
    level: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
  memberList: Array<{
    orgId: number;
    orgName: string;
    orgType: string;
    currentLevel: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
    joinDate: string;
    renewDate: string;
    expireDate: string;
    status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'SUSPENDED';
    creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';
    performanceScore: number;
    totalSpent: string;
    lastPayment: string;
    paymentStatus: 'NORMAL' | 'DELAYED' | 'OVERDUE';
    benefits: string[];
    upgradeEligible: boolean;
  }>;
  revenueAnalysis: Array<{
    level: string;
    monthlyRevenue: number;
    yearlyRevenue: number;
    avgSpending: number;
  }>;
  benefitsUsage: Array<{
    benefit: string;
    usage: number;
    totalAvailable: number;
    popularityScore: number;
  }>;
  membershipOperations: Array<{
    id: string;
    orgName: string;
    operation: 'UPGRADE' | 'DOWNGRADE' | 'RENEW' | 'SUSPEND' | 'CANCEL';
    fromLevel: string;
    toLevel: string;
    date: string;
    operator: string;
    reason: string;
    amount: string;
  }>;
}

const DisposalOrgMembershipManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [operationModalVisible, setOperationModalVisible] = useState(false);
  const [benefitModalVisible, setBenefitModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [form] = Form.useForm();
  const [benefitForm] = Form.useForm();

  useEffect(() => {
    loadMembershipData();
  }, [selectedLevel, selectedStatus, selectedType]);

  const loadMembershipData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: MembershipData = {
        summary: {
          totalMembers: 256,
          platinumMembers: 18,
          goldMembers: 45,
          silverMembers: 128,
          bronzeMembers: 65,
          avgMembershipLevel: 2.3,
          totalRevenue: '1,285万',
          renewalRate: 89.5
        },
        membershipTrend: [
          { month: '2024-01', newMembers: 12, renewals: 45, upgrades: 8, cancellations: 3 },
          { month: '2024-02', newMembers: 15, renewals: 38, upgrades: 12, cancellations: 2 },
          { month: '2024-03', newMembers: 18, renewals: 52, upgrades: 15, cancellations: 4 },
          { month: '2024-04', newMembers: 14, renewals: 41, upgrades: 9, cancellations: 1 },
          { month: '2024-05', newMembers: 20, renewals: 48, upgrades: 18, cancellations: 3 },
          { month: '2024-06', newMembers: 16, renewals: 44, upgrades: 11, cancellations: 2 },
          { month: '2024-07', newMembers: 22, renewals: 56, upgrades: 20, cancellations: 1 }
        ],
        levelDistribution: [
          { level: '铂金', count: 18, percentage: 7.0, revenue: 432 },
          { level: '黄金', count: 45, percentage: 17.6, revenue: 675 },
          { level: '白银', count: 128, percentage: 50.0, revenue: 384 },
          { level: '青铜', count: 65, percentage: 25.4, revenue: 195 }
        ],
        memberList: [
          {
            orgId: 4, orgName: '广州天河仲裁委员会', orgType: 'ARBITRATION_CENTER',
            currentLevel: 'PLATINUM', joinDate: '2018-12-05', renewDate: '2024-01-05',
            expireDate: '2025-01-05', status: 'ACTIVE', creditRating: 'AAA',
            performanceScore: 94, totalSpent: '48万', lastPayment: '2024-01-05',
            paymentStatus: 'NORMAL', benefits: ['优先分案', '专属客服', '免费培训', '数据分析报告'],
            upgradeEligible: false
          },
          {
            orgId: 1, orgName: '北京朝阳调解中心', orgType: 'MEDIATION_CENTER',
            currentLevel: 'PLATINUM', joinDate: '2019-03-15', renewDate: '2024-03-15',
            expireDate: '2025-03-15', status: 'ACTIVE', creditRating: 'AAA',
            performanceScore: 92, totalSpent: '42万', lastPayment: '2024-03-15',
            paymentStatus: 'NORMAL', benefits: ['优先分案', '专属客服', '免费培训', '数据分析报告'],
            upgradeEligible: false
          },
          {
            orgId: 2, orgName: '上海浦东法律服务所', orgType: 'LAW_FIRM',
            currentLevel: 'GOLD', joinDate: '2020-06-20', renewDate: '2024-06-20',
            expireDate: '2025-06-20', status: 'ACTIVE', creditRating: 'AA',
            performanceScore: 88, totalSpent: '28万', lastPayment: '2024-06-20',
            paymentStatus: 'NORMAL', benefits: ['优先分案', '专属客服', '免费培训'],
            upgradeEligible: true
          },
          {
            orgId: 5, orgName: '深圳福田律师事务所', orgType: 'LAW_FIRM',
            currentLevel: 'GOLD', joinDate: '2021-01-15', renewDate: '2024-01-15',
            expireDate: '2025-01-15', status: 'ACTIVE', creditRating: 'AA',
            performanceScore: 87, totalSpent: '25万', lastPayment: '2024-01-15',
            paymentStatus: 'NORMAL', benefits: ['优先分案', '专属客服', '免费培训'],
            upgradeEligible: true
          },
          {
            orgId: 3, orgName: '深圳南山催收服务公司', orgType: 'COLLECTION_AGENCY',
            currentLevel: 'BRONZE', joinDate: '2021-09-10', renewDate: '2023-09-10',
            expireDate: '2024-09-10', status: 'EXPIRING', creditRating: 'BBB',
            performanceScore: 65, totalSpent: '8万', lastPayment: '2023-09-10',
            paymentStatus: 'OVERDUE', benefits: ['基础服务'],
            upgradeEligible: false
          }
        ],
        revenueAnalysis: [
          { level: '铂金', monthlyRevenue: 36, yearlyRevenue: 432, avgSpending: 24000 },
          { level: '黄金', monthlyRevenue: 56.25, yearlyRevenue: 675, avgSpending: 15000 },
          { level: '白银', monthlyRevenue: 32, yearlyRevenue: 384, avgSpending: 3000 },
          { level: '青铜', monthlyRevenue: 16.25, yearlyRevenue: 195, avgSpending: 3000 }
        ],
        benefitsUsage: [
          { benefit: '优先分案', usage: 1856, totalAvailable: 2000, popularityScore: 92.8 },
          { benefit: '专属客服', usage: 789, totalAvailable: 1000, popularityScore: 78.9 },
          { benefit: '免费培训', usage: 456, totalAvailable: 800, popularityScore: 57.0 },
          { benefit: '数据分析报告', usage: 234, totalAvailable: 400, popularityScore: 58.5 },
          { benefit: '技术支持', usage: 678, totalAvailable: 1200, popularityScore: 56.5 }
        ],
        membershipOperations: [
          {
            id: '1', orgName: '北京朝阳调解中心', operation: 'RENEW',
            fromLevel: '铂金', toLevel: '铂金', date: '2024-07-25 14:30:00',
            operator: '系统管理员', reason: '年度续费', amount: '24,000'
          },
          {
            id: '2', orgName: '上海浦东法律服务所', operation: 'UPGRADE',
            fromLevel: '白银', toLevel: '黄金', date: '2024-07-20 09:00:00',
            operator: '客户经理', reason: '业绩优秀，申请升级', amount: '12,000'
          },
          {
            id: '3', orgName: '深圳南山催收服务公司', operation: 'DOWNGRADE',
            fromLevel: '白银', toLevel: '青铜', date: '2024-07-15 16:00:00',
            operator: '风控部门', reason: '业绩下滑，信用等级降低', amount: '0'
          }
        ]
      };
      
      setMembershipData(mockData);
    } catch (error) {
      console.error('加载会员数据失败:', error);
      message.error('加载会员数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipOperation = (member: any) => {
    setSelectedMember(member);
    form.setFieldsValue({
      orgName: member.orgName,
      currentLevel: member.currentLevel,
      operation: 'UPGRADE'
    });
    setOperationModalVisible(true);
  };

  const handleBenefitManagement = () => {
    setBenefitModalVisible(true);
  };

  const handleOperationSubmit = async () => {
    try {
      const values = await form.validateFields();
      // API调用
      message.success('会员操作成功');
      setOperationModalVisible(false);
      form.resetFields();
      loadMembershipData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleBenefitSubmit = async () => {
    try {
      const values = await benefitForm.validateFields();
      // API调用
      message.success('权益配置更新成功');
      setBenefitModalVisible(false);
      benefitForm.resetFields();
      loadMembershipData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 会员趋势图配置
  const membershipTrendConfig = {
    data: membershipData?.membershipTrend || [],
    xField: 'month',
    yField: 'newMembers',
    height: 300,
    point: {
      size: 5,
      shape: 'diamond',
    },
    color: '#1890ff',
    smooth: true,
  };

  // 等级分布饼图配置
  const levelDistributionConfig = {
    data: membershipData?.levelDistribution || [],
    angleField: 'count',
    colorField: 'level',
    radius: 0.8,
    height: 300,
    label: {
      type: 'outer' as const,
      content: '{name} {percentage}%',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  // 收入分析图配置
  const revenueAnalysisConfig = {
    data: membershipData?.revenueAnalysis || [],
    xField: 'level',
    yField: 'yearlyRevenue',
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

  // 会员列表表格配置
  const memberColumns: ColumnsType<any> = [
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
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, { name: string; color: string }> = {
          'MEDIATION_CENTER': { name: '调解中心', color: 'blue' },
          'LAW_FIRM': { name: '律所', color: 'green' },
          'COLLECTION_AGENCY': { name: '催收', color: 'orange' },
          'ARBITRATION_CENTER': { name: '仲裁', color: 'purple' },
        };
        const config = typeMap[type] || { name: type, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
    {
      title: '会员等级',
      dataIndex: 'currentLevel',
      key: 'currentLevel',
      width: 120,
      render: (level: string, record) => {
        const levelColors: Record<string, string> = {
          'PLATINUM': '#722ed1',
          'GOLD': '#faad14',
          'SILVER': '#d9d9d9',
          'BRONZE': '#d48806'
        };
        const levelNames: Record<string, string> = {
          'PLATINUM': '铂金',
          'GOLD': '黄金',
          'SILVER': '白银',
          'BRONZE': '青铜'
        };
        return (
          <div>
            <Tag color={levelColors[level] || 'default'}>
              <CrownOutlined /> {levelNames[level] || level}
            </Tag>
            {record.upgradeEligible && (
              <Tag color="green">可升级</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: '会员状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
          'ACTIVE': { name: '正常', color: 'green', icon: <CheckCircleOutlined /> },
          'EXPIRING': { name: '即将到期', color: 'orange', icon: <WarningOutlined /> },
          'EXPIRED': { name: '已过期', color: 'red', icon: <WarningOutlined /> },
          'SUSPENDED': { name: '暂停', color: 'default', icon: <WarningOutlined /> },
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
      title: '信用等级',
      dataIndex: 'creditRating',
      key: 'creditRating',
      width: 100,
      render: (rating: string) => {
        const ratingColors: Record<string, string> = {
          'AAA': '#52c41a',
          'AA': '#73d13d',
          'A': '#95de64',
          'BBB': '#faad14',
          'BB': '#ffc53d',
          'B': '#ff7875'
        };
        return (
          <Tag color={ratingColors[rating] || 'default'}>
            {rating}
          </Tag>
        );
      },
    },
    {
      title: '业绩评分',
      dataIndex: 'performanceScore',
      key: 'performanceScore',
      width: 120,
      render: (score: number) => (
        <div>
          <div style={{ 
            fontWeight: 'bold',
            color: score >= 90 ? '#52c41a' : score >= 80 ? '#faad14' : '#ff4d4f'
          }}>
            {score}
          </div>
          <Progress 
            percent={score} 
           
            strokeColor={score >= 90 ? '#52c41a' : score >= 80 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: '累计消费',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 100,
    },
    {
      title: '到期时间',
      dataIndex: 'expireDate',
      key: 'expireDate',
      width: 120,
      render: (date: string, record) => {
        const isExpiring = dayjs(date).diff(dayjs(), 'days') < 30;
        return (
          <span style={{ color: isExpiring ? '#ff4d4f' : 'inherit' }}>
            {date}
          </span>
        );
      },
    },
    {
      title: '付款状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { name: string; color: string }> = {
          'NORMAL': { name: '正常', color: 'green' },
          'DELAYED': { name: '延迟', color: 'orange' },
          'OVERDUE': { name: '逾期', color: 'red' },
        };
        const config = statusMap[status] || { name: status, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical">
          <Space>
            <Button 
              
              icon={<EditOutlined />} 
              onClick={() => handleMembershipOperation(record)}
            >
              管理
            </Button>
            <Button 
              
              icon={<SettingOutlined />}
              onClick={() => message.info(`配置 ${record.orgName} 权益`)}
            >
              权益
            </Button>
          </Space>
          {record.upgradeEligible && (
            <Button 
              
              type="primary"
              icon={<UpOutlined />}
              onClick={() => message.info(`升级 ${record.orgName} 会员等级`)}
            >
              升级
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getMembershipLevelColor = (level: string) => {
    const levelColors: Record<string, string> = {
      'PLATINUM': '#722ed1',
      'GOLD': '#faad14',
      'SILVER': '#d9d9d9',
      'BRONZE': '#d48806'
    };
    return levelColors[level] || 'default';
  };

  const getOperationColor = (operation: string) => {
    const operationColors: Record<string, string> = {
      'UPGRADE': '#52c41a',
      'DOWNGRADE': '#ff4d4f',
      'RENEW': '#1890ff',
      'SUSPEND': '#faad14',
      'CANCEL': '#f5222d'
    };
    return operationColors[operation] || 'default';
  };

  const getOperationText = (operation: string) => {
    const operationTexts: Record<string, string> = {
      'UPGRADE': '升级',
      'DOWNGRADE': '降级',
      'RENEW': '续费',
      'SUSPEND': '暂停',
      'CANCEL': '取消'
    };
    return operationTexts[operation] || operation;
  };

  return (
    <div className="disposal-org-membership-management">
      <Card title="处置机构会员管理" bordered={false}>
        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Select
              value={selectedLevel}
              onChange={setSelectedLevel}
              style={{ width: '100%' }}
              placeholder="会员等级"
            >
              <Option value="all">全部等级</Option>
              <Option value="PLATINUM">铂金</Option>
              <Option value="GOLD">黄金</Option>
              <Option value="SILVER">白银</Option>
              <Option value="BRONZE">青铜</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
              placeholder="会员状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="ACTIVE">正常</Option>
              <Option value="EXPIRING">即将到期</Option>
              <Option value="EXPIRED">已过期</Option>
              <Option value="SUSPENDED">暂停</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: '100%' }}
              placeholder="机构类型"
            >
              <Option value="all">全部类型</Option>
              <Option value="MEDIATION_CENTER">调解中心</Option>
              <Option value="LAW_FIRM">律师事务所</Option>
              <Option value="COLLECTION_AGENCY">催收机构</Option>
              <Option value="ARBITRATION_CENTER">仲裁中心</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadMembershipData} loading={loading}>
                刷新数据
              </Button>
              <Button icon={<GiftOutlined />} type="primary" onClick={handleBenefitManagement}>
                权益配置
              </Button>
              <Button icon={<TrophyOutlined />}>
                等级设置
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {/* 概览统计 */}
          {membershipData && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="会员总数"
                    value={membershipData.summary.totalMembers}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="铂金会员"
                    value={membershipData.summary.platinumMembers}
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<CrownOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="黄金会员"
                    value={membershipData.summary.goldMembers}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<TrophyOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="白银会员"
                    value={membershipData.summary.silverMembers}
                    valueStyle={{ color: '#d9d9d9' }}
                    prefix={<StarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="青铜会员"
                    value={membershipData.summary.bronzeMembers}
                    valueStyle={{ color: '#d48806' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="会员收入"
                    value={membershipData.summary.totalRevenue}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="续费率"
                    value={membershipData.summary.renewalRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#13c2c2' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* 主要内容区域 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="会员概览" key="overview">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="会员发展趋势">
                    <Line {...membershipTrendConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="等级分布">
                    <Pie {...levelDistributionConfig} />
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={16}>
                  <Card title="收入分析">
                    <Column {...revenueAnalysisConfig} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="等级收益对比">
                    <Table
                      columns={[
                        { 
                          title: '等级', 
                          dataIndex: 'level', 
                          key: 'level',
                          render: (level: string) => (
                            <Tag color={getMembershipLevelColor(level === '铂金' ? 'PLATINUM' : level === '黄金' ? 'GOLD' : level === '白银' ? 'SILVER' : 'BRONZE')}>
                              {level}
                            </Tag>
                          )
                        },
                        { 
                          title: '年收入', 
                          dataIndex: 'yearlyRevenue', 
                          key: 'yearlyRevenue',
                          render: (revenue: number) => `${revenue}万`
                        },
                        { 
                          title: '平均消费', 
                          dataIndex: 'avgSpending', 
                          key: 'avgSpending',
                          render: (spending: number) => `${spending.toLocaleString()}`
                        },
                      ]}
                      dataSource={membershipData?.revenueAnalysis || []}
                      rowKey="level"
                     
                      pagination={false}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="会员列表" key="members">
              <Card title="会员机构列表">
                <Table
                  columns={memberColumns}
                  dataSource={membershipData?.memberList || []}
                  rowKey="orgId"
                  scroll={{ x: 1400 }}
                 
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                  }}
                />
              </Card>
            </TabPane>

            <TabPane tab="权益分析" key="benefits">
              <Row gutter={16}>
                <Col span={16}>
                  <Card title="权益使用情况">
                    <Table
                      columns={[
                        { title: '权益名称', dataIndex: 'benefit', key: 'benefit' },
                        { 
                          title: '使用次数', 
                          dataIndex: 'usage', 
                          key: 'usage',
                          render: (usage: number) => usage.toLocaleString()
                        },
                        { 
                          title: '总可用次数', 
                          dataIndex: 'totalAvailable', 
                          key: 'totalAvailable',
                          render: (total: number) => total.toLocaleString()
                        },
                        { 
                          title: '使用率', 
                          key: 'utilizationRate',
                          render: (_, record) => {
                            const rate = (record.usage / record.totalAvailable) * 100;
                            return (
                              <div>
                                <div style={{ marginBottom: 4 }}>{rate.toFixed(1)}%</div>
                                <Progress 
                                  percent={rate} 
                                 
                                  strokeColor={rate > 80 ? '#52c41a' : rate > 60 ? '#faad14' : '#ff4d4f'}
                                  showInfo={false}
                                />
                              </div>
                            );
                          }
                        },
                        { 
                          title: '受欢迎度', 
                          dataIndex: 'popularityScore', 
                          key: 'popularityScore',
                          render: (score: number) => (
                            <Rate disabled value={score / 20} allowHalf />
                          )
                        },
                      ]}
                      dataSource={membershipData?.benefitsUsage || []}
                      rowKey="benefit"
                     
                      pagination={false}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="权益优化建议">
                    <Alert
                      message="权益优化建议"
                      description={
                        <div>
                          <p><CheckCircleOutlined style={{ color: '#52c41a' }} /> 优先分案权益使用率最高，建议继续保持</p>
                          <p><WarningOutlined style={{ color: '#faad14' }} /> 免费培训权益使用率偏低，建议加强推广</p>
                          <p><SafetyCertificateOutlined style={{ color: '#1890ff' }} /> 技术支持需求稳定，可作为基础权益</p>
                          <p><StarOutlined style={{ color: '#722ed1' }} /> 数据分析报告受欢迎度较高，可扩大覆盖范围</p>
                        </div>
                      }
                      type="info"
                      showIcon
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="操作记录" key="operations">
              <Card title="会员操作记录">
                <Timeline>
                  {membershipData?.membershipOperations.map(operation => (
                    <Timeline.Item
                      key={operation.id}
                      color={getOperationColor(operation.operation)}
                    >
                      <div>
                        <h4>
                          <Tag color={getOperationColor(operation.operation)}>
                            {getOperationText(operation.operation)}
                          </Tag>
                          {operation.orgName}
                        </h4>
                        <p>
                          {operation.fromLevel} → {operation.toLevel}
                          {operation.amount && ` | 金额: ¥${operation.amount}`}
                        </p>
                        <p style={{ color: '#666', marginBottom: 4 }}>{operation.reason}</p>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          <CalendarOutlined /> {operation.date} | 
                          <UserOutlined style={{ marginLeft: 8 }} /> {operation.operator}
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </TabPane>
          </Tabs>
        </Spin>
      </Card>

      {/* 会员操作弹窗 */}
      <Modal
        title="会员操作"
        open={operationModalVisible}
        onOk={handleOperationSubmit}
        onCancel={() => {
          setOperationModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="机构名称"
            name="orgName"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="当前等级"
            name="currentLevel"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="操作类型"
            name="operation"
            rules={[{ required: true, message: '请选择操作类型' }]}
          >
            <Select placeholder="请选择操作类型">
              <Option value="UPGRADE">升级</Option>
              <Option value="DOWNGRADE">降级</Option>
              <Option value="RENEW">续费</Option>
              <Option value="SUSPEND">暂停</Option>
              <Option value="CANCEL">取消</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="目标等级"
            name="targetLevel"
            rules={[{ required: true, message: '请选择目标等级' }]}
          >
            <Select placeholder="请选择目标等级">
              <Option value="PLATINUM">铂金</Option>
              <Option value="GOLD">黄金</Option>
              <Option value="SILVER">白银</Option>
              <Option value="BRONZE">青铜</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="操作原因"
            name="reason"
            rules={[{ required: true, message: '请输入操作原因' }]}
          >
            <TextArea rows={3} placeholder="请输入操作原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 权益配置弹窗 */}
      <Modal
        title="权益配置"
        open={benefitModalVisible}
        onOk={handleBenefitSubmit}
        onCancel={() => {
          setBenefitModalVisible(false);
          benefitForm.resetFields();
        }}
        width={800}
      >
        <Form form={benefitForm} layout="vertical">
          <Form.Item
            label="权益名称"
            name="benefitName"
            rules={[{ required: true, message: '请输入权益名称' }]}
          >
            <Input placeholder="请输入权益名称" />
          </Form.Item>
          <Form.Item
            label="适用等级"
            name="applicableLevels"
            rules={[{ required: true, message: '请选择适用等级' }]}
          >
            <Select mode="multiple" placeholder="请选择适用等级">
              <Option value="PLATINUM">铂金</Option>
              <Option value="GOLD">黄金</Option>
              <Option value="SILVER">白银</Option>
              <Option value="BRONZE">青铜</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="权益数量"
            name="quantity"
            rules={[{ required: true, message: '请输入权益数量' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="权益数量" />
          </Form.Item>
          <Form.Item
            label="权益描述"
            name="description"
          >
            <TextArea rows={3} placeholder="请输入权益描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DisposalOrgMembershipManagement;