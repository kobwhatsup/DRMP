import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, Button, Space, Table, Tag, 
  Tabs, Alert, Spin, message, Modal, Form, Input, DatePicker,
  Progress, Badge, Descriptions, Timeline, Avatar, Divider
} from 'antd';
import {
  ShakeOutlined, FileTextOutlined, DollarOutlined, TeamOutlined,
  EditOutlined, PlusOutlined, DeleteOutlined, EyeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, WarningOutlined,
  CalendarOutlined, UserOutlined, DownloadOutlined, ReloadOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 数据接口定义
interface CooperationData {
  summary: {
    totalOrgs: number;
    activeContracts: number;
    expiringContracts: number;
    avgCooperationScore: number;
    totalRevenue: string;
    monthlyGrowth: number;
  };
  cooperationTrend: Array<{
    month: string;
    newContracts: number;
    renewedContracts: number;
    expiredContracts: number;
    revenue: number;
  }>;
  orgCooperationList: Array<{
    orgId: number;
    orgName: string;
    orgType: string;
    cooperationStatus: 'ACTIVE' | 'EXPIRING' | 'SUSPENDED' | 'TERMINATED';
    contractCount: number;
    startDate: string;
    endDate: string;
    cooperationScore: number;
    totalRevenue: string;
    lastContactDate: string;
    businessManager: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  contractDetails: Array<{
    contractId: string;
    orgName: string;
    contractType: string;
    signDate: string;
    startDate: string;
    endDate: string;
    status: string;
    value: string;
    feeRate: number;
    autoRenew: boolean;
  }>;
  revenueDistribution: Array<{
    orgType: string;
    revenue: number;
    percentage: number;
  }>;
}

const SourceOrgCooperationManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cooperationData, setCooperationData] = useState<CooperationData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrgType, setSelectedOrgType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [form] = Form.useForm();
  const [renewForm] = Form.useForm();

  useEffect(() => {
    loadCooperationData();
  }, [selectedStatus, selectedOrgType]);

  const loadCooperationData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: CooperationData = {
        summary: {
          totalOrgs: 45,
          activeContracts: 89,
          expiringContracts: 12,
          avgCooperationScore: 85.6,
          totalRevenue: '2,856万',
          monthlyGrowth: 15.8
        },
        cooperationTrend: [
          { month: '2024-01', newContracts: 8, renewedContracts: 12, expiredContracts: 3, revenue: 180 },
          { month: '2024-02', newContracts: 6, renewedContracts: 15, expiredContracts: 4, revenue: 195 },
          { month: '2024-03', newContracts: 12, renewedContracts: 10, expiredContracts: 2, revenue: 220 },
          { month: '2024-04', newContracts: 9, renewedContracts: 14, expiredContracts: 5, revenue: 208 },
          { month: '2024-05', newContracts: 15, renewedContracts: 8, expiredContracts: 3, revenue: 245 },
          { month: '2024-06', newContracts: 11, renewedContracts: 13, expiredContracts: 4, revenue: 232 },
          { month: '2024-07', newContracts: 13, renewedContracts: 11, expiredContracts: 2, revenue: 268 }
        ],
        orgCooperationList: [
          {
            orgId: 1, orgName: '中国工商银行', orgType: 'BANK',
            cooperationStatus: 'ACTIVE', contractCount: 3, startDate: '2020-01-15',
            endDate: '2025-12-31', cooperationScore: 92.5, totalRevenue: '486万',
            lastContactDate: '2024-07-28', businessManager: '李明', riskLevel: 'LOW'
          },
          {
            orgId: 2, orgName: '招商银行', orgType: 'BANK',
            cooperationStatus: 'ACTIVE', contractCount: 2, startDate: '2020-03-20',
            endDate: '2025-06-30', cooperationScore: 89.2, totalRevenue: '398万',
            lastContactDate: '2024-07-30', businessManager: '刘华', riskLevel: 'LOW'
          },
          {
            orgId: 3, orgName: '平安普惠', orgType: 'CONSUMER_FINANCE',
            cooperationStatus: 'EXPIRING', contractCount: 2, startDate: '2021-05-10',
            endDate: '2024-09-15', cooperationScore: 85.8, totalRevenue: '312万',
            lastContactDate: '2024-07-25', businessManager: '周强', riskLevel: 'MEDIUM'
          },
          {
            orgId: 4, orgName: '蚂蚁借呗', orgType: 'ONLINE_LOAN',
            cooperationStatus: 'SUSPENDED', contractCount: 1, startDate: '2021-08-20',
            endDate: '2024-12-31', cooperationScore: 78.3, totalRevenue: '156万',
            lastContactDate: '2024-07-15', businessManager: '赵伟', riskLevel: 'HIGH'
          }
        ],
        contractDetails: [
          {
            contractId: 'CONTRACT001', orgName: '中国工商银行', contractType: '标准合作协议',
            signDate: '2020-01-15', startDate: '2020-01-15', endDate: '2025-12-31',
            status: 'ACTIVE', value: '200万', feeRate: 3.5, autoRenew: true
          },
          {
            contractId: 'CONTRACT002', orgName: '中国工商银行', contractType: '数据对接协议',
            signDate: '2020-02-01', startDate: '2020-02-01', endDate: '2025-12-31',
            status: 'ACTIVE', value: '50万', feeRate: 2.0, autoRenew: true
          },
          {
            contractId: 'CONTRACT003', orgName: '招商银行', contractType: '标准合作协议',
            signDate: '2020-03-20', startDate: '2020-03-20', endDate: '2025-06-30',
            status: 'ACTIVE', value: '180万', feeRate: 3.2, autoRenew: false
          }
        ],
        revenueDistribution: [
          { orgType: '银行', revenue: 1285, percentage: 45.0 },
          { orgType: '消费金融', revenue: 856, percentage: 30.0 },
          { orgType: '网络贷款', revenue: 428, percentage: 15.0 },
          { orgType: '小额贷款', revenue: 287, percentage: 10.0 }
        ]
      };
      
      setCooperationData(mockData);
    } catch (error) {
      console.error('加载合作数据失败:', error);
      message.error('加载合作数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewContract = (record: any) => {
    setSelectedContract(record);
    setContractModalVisible(true);
  };

  const handleRenewContract = (record: any) => {
    setSelectedContract(record);
    renewForm.setFieldsValue({
      orgName: record.orgName,
      currentEndDate: record.endDate,
      newEndDate: dayjs(record.endDate).add(1, 'year').format('YYYY-MM-DD')
    });
    setRenewModalVisible(true);
  };

  const handleSuspendCooperation = (record: any) => {
    Modal.confirm({
      title: '暂停合作',
      content: `确定要暂停与"${record.orgName}"的合作吗？`,
      onOk: async () => {
        try {
          // API调用
          message.success('合作已暂停');
          loadCooperationData();
        } catch (error) {
          message.error('操作失败');
        }
      }
    });
  };

  const handleContractSubmit = async () => {
    try {
      const values = await form.validateFields();
      // API调用
      message.success('合同信息已保存');
      setContractModalVisible(false);
      form.resetFields();
      loadCooperationData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleRenewSubmit = async () => {
    try {
      const values = await renewForm.validateFields();
      // API调用
      message.success('合同续签成功');
      setRenewModalVisible(false);
      renewForm.resetFields();
      loadCooperationData();
    } catch (error) {
      message.error('续签失败');
    }
  };

  // 合作趋势图配置
  const cooperationTrendConfig = {
    data: cooperationData?.cooperationTrend || [],
    xField: 'month',
    yField: 'newContracts',
    height: 300,
    color: '#1890ff',
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  // 收入分布图配置
  const revenueDistributionConfig = {
    data: cooperationData?.revenueDistribution || [],
    xField: 'orgType',
    yField: 'revenue',
    height: 300,
    color: '#52c41a',
    label: {
      position: 'top' as const,
      style: {
        fill: '#333333',
        fontSize: 12,
        fontWeight: 'bold',
      },
    },
  };

  // 机构合作列表表格配置
  const orgCooperationColumns: ColumnsType<any> = [
    {
      title: '机构信息',
      key: 'orgInfo',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size={40} 
            style={{ backgroundColor: '#1890ff', marginRight: 12 }}
            icon={<TeamOutlined />}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.orgName}</div>
            <Tag>{record.orgType === 'BANK' ? '银行' : record.orgType === 'CONSUMER_FINANCE' ? '消金' : '网贷'}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: '合作状态',
      dataIndex: 'cooperationStatus',
      key: 'cooperationStatus',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
          'ACTIVE': { name: '正常合作', color: 'green', icon: <CheckCircleOutlined /> },
          'EXPIRING': { name: '即将到期', color: 'orange', icon: <ClockCircleOutlined /> },
          'SUSPENDED': { name: '暂停合作', color: 'red', icon: <WarningOutlined /> },
          'TERMINATED': { name: '终止合作', color: 'default', icon: <WarningOutlined /> },
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
      title: '合同数量',
      dataIndex: 'contractCount',
      key: 'contractCount',
      width: 80,
      render: (count: number) => `${count}个`,
    },
    {
      title: '合作期限',
      key: 'cooperationPeriod',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, color: '#666' }}>开始：{record.startDate}</div>
          <div style={{ fontSize: 12, color: record.cooperationStatus === 'EXPIRING' ? '#ff4d4f' : '#666' }}>
            结束：{record.endDate}
          </div>
        </div>
      ),
    },
    {
      title: '合作评分',
      dataIndex: 'cooperationScore',
      key: 'cooperationScore',
      width: 100,
      render: (score: number) => (
        <div>
          <div style={{ fontWeight: 'bold', color: score >= 90 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f' }}>
            {score}
          </div>
          <Progress 
            percent={score} 
            size="small"
            strokeColor={score >= 90 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: '累计收入',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 100,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 80,
      render: (level: string) => {
        const levelMap: Record<string, { name: string; color: string }> = {
          'LOW': { name: '低风险', color: 'green' },
          'MEDIUM': { name: '中风险', color: 'orange' },
          'HIGH': { name: '高风险', color: 'red' },
        };
        const config = levelMap[level] || { name: level, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
    {
      title: '业务经理',
      dataIndex: 'businessManager',
      key: 'businessManager',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical">
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => handleViewContract(record)}>
              查看
            </Button>
            <Button icon={<EditOutlined />} onClick={() => handleRenewContract(record)}>
              续签
            </Button>
          </Space>
          {record.cooperationStatus === 'ACTIVE' && (
            <Button 
              size="small"
              danger 
              onClick={() => handleSuspendCooperation(record)}
            >
              暂停
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getCooperationStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'green',
      'EXPIRING': 'orange',
      'SUSPENDED': 'red',
      'TERMINATED': 'default'
    };
    return statusMap[status] || 'default';
  };

  return (
    <div className="source-org-cooperation-management">
      <Card title="案源机构合作管理" bordered={false}>
        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
              placeholder="合作状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="ACTIVE">正常合作</Option>
              <Option value="EXPIRING">即将到期</Option>
              <Option value="SUSPENDED">暂停合作</Option>
              <Option value="TERMINATED">终止合作</Option>
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
              <Option value="BANK">银行</Option>
              <Option value="CONSUMER_FINANCE">消费金融</Option>
              <Option value="ONLINE_LOAN">网络贷款</Option>
            </Select>
          </Col>
          <Col span={16}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadCooperationData} loading={loading}>
                刷新
              </Button>
              <Button icon={<PlusOutlined />} type="primary">
                新增合作
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {/* 概览统计 */}
          {cooperationData && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="合作机构"
                    value={cooperationData.summary.totalOrgs}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="有效合同"
                    value={cooperationData.summary.activeContracts}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="即将到期"
                    value={cooperationData.summary.expiringContracts}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="平均评分"
                    value={cooperationData.summary.avgCooperationScore}
                    precision={1}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="总收入"
                    value={cooperationData.summary.totalRevenue}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="月度增长"
                    value={cooperationData.summary.monthlyGrowth}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#13c2c2' }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* 主要内容区域 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="合作概览" key="overview">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="新签合同趋势">
                    <Line {...cooperationTrendConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="收入分布">
                    <Column {...revenueDistributionConfig} />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="机构合作" key="cooperation">
              <Card title="机构合作列表">
                <Table
                  columns={orgCooperationColumns}
                  dataSource={cooperationData?.orgCooperationList || []}
                  rowKey="orgId"
                  scroll={{ x: 1200 }}
                  size="middle"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                  }}
                />
              </Card>
            </TabPane>

            <TabPane tab="合同管理" key="contracts">
              <Card title="合同详情">
                <Table
                  columns={[
                    { title: '合同编号', dataIndex: 'contractId', key: 'contractId' },
                    { title: '机构名称', dataIndex: 'orgName', key: 'orgName' },
                    { title: '合同类型', dataIndex: 'contractType', key: 'contractType' },
                    { title: '签署日期', dataIndex: 'signDate', key: 'signDate' },
                    { title: '生效日期', dataIndex: 'startDate', key: 'startDate' },
                    { title: '到期日期', dataIndex: 'endDate', key: 'endDate' },
                    { 
                      title: '状态', 
                      dataIndex: 'status', 
                      key: 'status',
                      render: (status: string) => (
                        <Tag color={getCooperationStatusColor(status)}>
                          {status === 'ACTIVE' ? '有效' : '其他'}
                        </Tag>
                      )
                    },
                    { title: '合同价值', dataIndex: 'value', key: 'value' },
                    { 
                      title: '费率', 
                      dataIndex: 'feeRate', 
                      key: 'feeRate',
                      render: (rate: number) => `${rate}%`
                    },
                    { 
                      title: '自动续约', 
                      dataIndex: 'autoRenew', 
                      key: 'autoRenew',
                      render: (autoRenew: boolean) => (
                        <Badge status={autoRenew ? 'success' : 'default'} text={autoRenew ? '是' : '否'} />
                      )
                    },
                  ]}
                  dataSource={cooperationData?.contractDetails || []}
                  rowKey="contractId"
                  size="middle"
                  pagination={false}
                />
              </Card>
            </TabPane>
          </Tabs>
        </Spin>
      </Card>

      {/* 合同查看弹窗 */}
      <Modal
        title="合同详情"
        open={contractModalVisible}
        onCancel={() => setContractModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setContractModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedContract && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="机构名称">{selectedContract.orgName}</Descriptions.Item>
            <Descriptions.Item label="合作状态">
              <Tag color={getCooperationStatusColor(selectedContract.cooperationStatus)}>
                {selectedContract.cooperationStatus === 'ACTIVE' ? '正常合作' : '其他'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="合同数量">{selectedContract.contractCount}个</Descriptions.Item>
            <Descriptions.Item label="合作评分">{selectedContract.cooperationScore}</Descriptions.Item>
            <Descriptions.Item label="累计收入">{selectedContract.totalRevenue}</Descriptions.Item>
            <Descriptions.Item label="风险等级">
              <Tag color={selectedContract.riskLevel === 'LOW' ? 'green' : selectedContract.riskLevel === 'MEDIUM' ? 'orange' : 'red'}>
                {selectedContract.riskLevel === 'LOW' ? '低风险' : selectedContract.riskLevel === 'MEDIUM' ? '中风险' : '高风险'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="合作开始">{selectedContract.startDate}</Descriptions.Item>
            <Descriptions.Item label="合作结束">{selectedContract.endDate}</Descriptions.Item>
            <Descriptions.Item label="业务经理">{selectedContract.businessManager}</Descriptions.Item>
            <Descriptions.Item label="最后联系">{selectedContract.lastContactDate}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 合同续签弹窗 */}
      <Modal
        title="合同续签"
        open={renewModalVisible}
        onOk={handleRenewSubmit}
        onCancel={() => {
          setRenewModalVisible(false);
          renewForm.resetFields();
        }}
        width={600}
      >
        <Form form={renewForm} layout="vertical">
          <Form.Item
            label="机构名称"
            name="orgName"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="当前到期日期"
            name="currentEndDate"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="新到期日期"
            name="newEndDate"
            rules={[{ required: true, message: '请选择新的到期日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="续签原因"
            name="renewReason"
            rules={[{ required: true, message: '请输入续签原因' }]}
          >
            <TextArea rows={4} placeholder="请输入续签原因和说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SourceOrgCooperationManagement;