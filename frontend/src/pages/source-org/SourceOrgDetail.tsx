import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tabs, Tag, Button, Space, Row, Col, Timeline, Statistic,
  Table, Avatar, Badge, Divider, message, Modal, Form, Input, Progress,
  Alert, Tooltip, Select
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, SettingOutlined, PhoneOutlined,
  MailOutlined, BankOutlined, TeamOutlined, RiseOutlined,
  WarningOutlined, CheckCircleOutlined, ApiOutlined, FileTextOutlined,
  DollarOutlined, CalendarOutlined, UserOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;

// 案源机构详情接口
interface SourceOrgDetail {
  id: number;
  orgCode: string;
  orgName: string;
  type: string;
  typeName: string;
  
  // 基本信息
  legalRepresentative: string;
  registeredCapital: number;
  registrationDate: string;
  businessLicense: string;
  address: string;
  description: string;
  
  // 联系信息
  contactPerson: string;
  contactPhone: string;
  email: string;
  businessManager: string;
  
  // 银行信息
  bankName: string;
  bankAccount: string;
  
  // 案件统计
  caseStats: {
    totalPackages: number;
    totalCases: number;
    totalAmount: string;
    avgPackageSize: number;
    monthlyTrend: Array<{
      month: string;
      packages: number;
      cases: number;
      amount: number;
    }>;
  };
  
  // 案件质量分析
  qualityAnalysis: {
    completeRate: number;
    accuracyRate: number;
    disputeRate: number;
    qualityScore: number;
  };
  
  // 处置效果统计
  disposalStats: {
    assignedRate: number;
    avgDisposalTime: number;
    recoveryRate: number;
    avgRecoveryAmount: string;
  };
  
  // 案件类型分布
  caseTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
    avgAmount: string;
  }>;
  
  // 合作信息
  cooperationInfo: {
    status: string;
    startDate: string;
    contracts: Array<{
      id: string;
      type: string;
      signDate: string;
      expireDate: string;
      status: string;
    }>;
    feeStructure: {
      baseRate: number;
      tieredRates: Array<{
        minAmount: number;
        maxAmount: number;
        rate: number;
      }>;
    };
  };
  
  // API对接状态
  apiStatus: {
    connectivity: string;
    lastSyncTime: string;
    successRate: number;
    errorCount: number;
    endpoints: Array<{
      name: string;
      status: string;
      lastCall: string;
      responseTime: number;
    }>;
  };
  
  // 操作历史
  operationHistory: Array<{
    id: string;
    action: string;
    operator: string;
    time: string;
    description: string;
    status: string;
  }>;
}

const SourceOrgDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [orgDetail, setOrgDetail] = useState<SourceOrgDetail | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [cooperationModalVisible, setCooperationModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadOrgDetail();
    }
  }, [id]);

  const loadOrgDetail = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: SourceOrgDetail = {
        id: 1,
        orgCode: 'ICBC001',
        orgName: '中国工商银行',
        type: 'BANK',
        typeName: '银行',
        
        legalRepresentative: '陈四清',
        registeredCapital: 35640000,
        registrationDate: '1984-01-01',
        businessLicense: '91110000100000567X',
        address: '北京市西城区复兴门内大街55号',
        description: '中国工商银行成立于1984年1月1日，是中央管理的大型国有银行，国家副部级单位。',
        
        contactPerson: '张经理',
        contactPhone: '13800138001',
        email: 'zhang@icbc.com',
        businessManager: '李明',
        
        bankName: '中国工商银行总行',
        bankAccount: '0200001019200000001',
        
        caseStats: {
          totalPackages: 156,
          totalCases: 28900,
          totalAmount: '4.2亿',
          avgPackageSize: 185,
          monthlyTrend: [
            { month: '2024-01', packages: 12, cases: 2200, amount: 32.5 },
            { month: '2024-02', packages: 15, cases: 2400, amount: 35.2 },
            { month: '2024-03', packages: 18, cases: 2800, amount: 38.9 },
            { month: '2024-04', packages: 16, cases: 2600, amount: 36.1 },
            { month: '2024-05', packages: 20, cases: 3100, amount: 42.3 },
            { month: '2024-06', packages: 22, cases: 3200, amount: 45.6 },
            { month: '2024-07', packages: 19, cases: 2900, amount: 41.2 }
          ]
        },
        
        qualityAnalysis: {
          completeRate: 95.8,
          accuracyRate: 92.3,
          disputeRate: 2.1,
          qualityScore: 88.5
        },
        
        disposalStats: {
          assignedRate: 89.6,
          avgDisposalTime: 45,
          recoveryRate: 32.8,
          avgRecoveryAmount: '4,756'
        },
        
        caseTypeDistribution: [
          { type: '个人消费贷', count: 12800, percentage: 44.3, avgAmount: '15,200' },
          { type: '信用卡', count: 8900, percentage: 30.8, avgAmount: '8,900' },
          { type: '汽车贷款', count: 4200, percentage: 14.5, avgAmount: '28,500' },
          { type: '房屋贷款', count: 2100, percentage: 7.3, avgAmount: '89,000' },
          { type: '其他', count: 900, percentage: 3.1, avgAmount: '12,300' }
        ],
        
        cooperationInfo: {
          status: 'ACTIVE',
          startDate: '2020-01-15',
          contracts: [
            {
              id: 'CONTRACT001',
              type: '标准合作协议',
              signDate: '2020-01-15',
              expireDate: '2025-12-31',
              status: 'ACTIVE'
            },
            {
              id: 'CONTRACT002',
              type: '数据对接协议',
              signDate: '2020-02-01',
              expireDate: '2025-12-31',
              status: 'ACTIVE'
            }
          ],
          feeStructure: {
            baseRate: 3.5,
            tieredRates: [
              { minAmount: 0, maxAmount: 10000, rate: 3.5 },
              { minAmount: 10000, maxAmount: 50000, rate: 3.0 },
              { minAmount: 50000, maxAmount: 999999, rate: 2.5 }
            ]
          }
        },
        
        apiStatus: {
          connectivity: 'ONLINE',
          lastSyncTime: '2024-07-30 10:30:00',
          successRate: 98.5,
          errorCount: 23,
          endpoints: [
            { name: '案件数据推送', status: 'ONLINE', lastCall: '2024-07-30 10:30:00', responseTime: 156 },
            { name: '状态回调', status: 'ONLINE', lastCall: '2024-07-30 10:25:00', responseTime: 89 },
            { name: '文件上传', status: 'ONLINE', lastCall: '2024-07-30 10:20:00', responseTime: 234 },
            { name: '进度查询', status: 'ONLINE', lastCall: '2024-07-30 10:15:00', responseTime: 67 }
          ]
        },
        
        operationHistory: [
          {
            id: '1',
            action: '合作协议续签',
            operator: '李明',
            time: '2024-07-28 14:30:00',
            description: '续签合作协议至2025年12月31日',
            status: 'COMPLETED'
          },
          {
            id: '2',
            action: 'API接口升级',
            operator: '技术部',
            time: '2024-07-25 09:00:00',
            description: '升级数据推送接口至v2.1版本',
            status: 'COMPLETED'
          },
          {
            id: '3',
            action: '案件质量评估',
            operator: '业务部',
            time: '2024-07-20 16:00:00',
            description: '月度案件质量评估完成，评分88.5分',
            status: 'COMPLETED'
          }
        ]
      };
      
      setOrgDetail(mockData);
    } catch (error) {
      console.error('加载机构详情失败:', error);
      message.error('加载机构详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCooperationManagement = async () => {
    try {
      const values = await form.validateFields();
      // API调用
      message.success('合作信息更新成功');
      setCooperationModalVisible(false);
      form.resetFields();
      loadOrgDetail();
    } catch (error) {
      message.error('操作失败');
    }
  };

  if (!orgDetail) {
    return <Card loading={loading} />;
  }

  // 案件趋势图配置
  const caseTrendConfig = {
    data: orgDetail.caseStats.monthlyTrend,
    xField: 'month',
    yField: 'cases',
    height: 300,
    point: { size: 5, shape: 'diamond' },
    color: '#1890ff',
  };

  // 案件类型分布图配置
  const caseTypeConfig = {
    data: orgDetail.caseTypeDistribution,
    xField: 'type',
    yField: 'count',
    height: 300,
    color: '#52c41a',
    label: {
      position: 'middle' as const,
      style: { fill: '#FFFFFF', opacity: 0.6 },
    },
  };

  return (
    <div className="source-org-detail">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large" align="center">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/source-orgs')}
              >
                返回列表
              </Button>
              <Avatar 
                size={48} 
                style={{ backgroundColor: '#1890ff' }}
                icon={<BankOutlined />}
              />
              <div>
                <h2 style={{ margin: 0 }}>{orgDetail.orgName}</h2>
                <Space>
                  <Tag color="blue">{orgDetail.typeName}</Tag>
                  <Tag color="green">正常合作</Tag>
                  <Badge 
                    status={orgDetail.apiStatus.connectivity === 'ONLINE' ? 'success' : 'error'} 
                    text={orgDetail.apiStatus.connectivity === 'ONLINE' ? 'API在线' : 'API离线'}
                  />
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<EditOutlined />} 
                onClick={() => navigate(`/source-orgs/${id}/edit`)}
              >
                编辑
              </Button>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setCooperationModalVisible(true)}
              >
                合作管理
              </Button>
              <Button 
                type="primary"
                icon={<ApiOutlined />}
                onClick={() => navigate(`/source-orgs/${id}/api`)}
              >
                API管理
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Descriptions title="机构信息" bordered column={2}>
              <Descriptions.Item label="机构代码">{orgDetail.orgCode}</Descriptions.Item>
              <Descriptions.Item label="机构类型">{orgDetail.typeName}</Descriptions.Item>
              <Descriptions.Item label="法定代表人">{orgDetail.legalRepresentative}</Descriptions.Item>
              <Descriptions.Item label="注册资本">{orgDetail.registeredCapital?.toLocaleString()}万元</Descriptions.Item>
              <Descriptions.Item label="成立日期">{orgDetail.registrationDate}</Descriptions.Item>
              <Descriptions.Item label="营业执照">{orgDetail.businessLicense}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{orgDetail.address}</Descriptions.Item>
              <Descriptions.Item label="机构简介" span={2}>{orgDetail.description}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="联系信息" bordered column={2}>
              <Descriptions.Item label="联系人">{orgDetail.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="联系电话">
                <Button type="link" icon={<PhoneOutlined />} href={`tel:${orgDetail.contactPhone}`}>
                  {orgDetail.contactPhone}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                <Button type="link" icon={<MailOutlined />} href={`mailto:${orgDetail.email}`}>
                  {orgDetail.email}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="业务经理">{orgDetail.businessManager}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="银行信息" bordered column={2}>
              <Descriptions.Item label="开户行">{orgDetail.bankName}</Descriptions.Item>
              <Descriptions.Item label="银行账号">{orgDetail.bankAccount}</Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="案件统计" key="caseStats">
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="案件包总数"
                    value={orgDetail.caseStats.totalPackages}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="案件总数"
                    value={orgDetail.caseStats.totalCases}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="案件总金额"
                    value={orgDetail.caseStats.totalAmount}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="平均包大小"
                    value={orgDetail.caseStats.avgPackageSize}
                    suffix="件"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Card title="案件发布趋势">
                  <Line {...caseTrendConfig} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="案件类型分布">
                  <Column {...caseTypeConfig} />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="案件质量分析">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="信息完整率"
                        value={orgDetail.qualityAnalysis.completeRate}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                      <Progress percent={orgDetail.qualityAnalysis.completeRate} strokeColor="#52c41a" />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="信息准确率"
                        value={orgDetail.qualityAnalysis.accuracyRate}
                        suffix="%"
                        valueStyle={{ color: '#1890ff' }}
                      />
                      <Progress percent={orgDetail.qualityAnalysis.accuracyRate} strokeColor="#1890ff" />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="争议案件比例"
                        value={orgDetail.qualityAnalysis.disputeRate}
                        suffix="%"
                        valueStyle={{ color: '#faad14' }}
                      />
                      <Progress percent={orgDetail.qualityAnalysis.disputeRate} strokeColor="#faad14" />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="综合质量评分"
                        value={orgDetail.qualityAnalysis.qualityScore}
                        valueStyle={{ color: '#722ed1' }}
                      />
                      <Progress percent={orgDetail.qualityAnalysis.qualityScore} strokeColor="#722ed1" />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="合作管理" key="cooperation">
            <Card title="合作状态" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={3}>
                <Descriptions.Item label="合作状态">
                  <Tag color="green">正常合作</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="合作开始时间">{orgDetail.cooperationInfo.startDate}</Descriptions.Item>
                <Descriptions.Item label="有效合同数">{orgDetail.cooperationInfo.contracts.length}个</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="合同信息" style={{ marginBottom: 16 }}>
              <Table
                dataSource={orgDetail.cooperationInfo.contracts}
                rowKey="id"
               
                pagination={false}
                columns={[
                  { title: '合同编号', dataIndex: 'id', key: 'id' },
                  { title: '合同类型', dataIndex: 'type', key: 'type' },
                  { title: '签署日期', dataIndex: 'signDate', key: 'signDate' },
                  { title: '到期日期', dataIndex: 'expireDate', key: 'expireDate' },
                  { 
                    title: '状态', 
                    dataIndex: 'status', 
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={status === 'ACTIVE' ? 'green' : 'orange'}>
                        {status === 'ACTIVE' ? '有效' : '即将到期'}
                      </Tag>
                    )
                  },
                ]}
              />
            </Card>

            <Card title="费率结构">
              <p>基础费率：{orgDetail.cooperationInfo.feeStructure.baseRate}%</p>
              <Table
                dataSource={orgDetail.cooperationInfo.feeStructure.tieredRates}
                rowKey={(record, index) => index || 0}
               
                pagination={false}
                columns={[
                  { 
                    title: '金额区间', 
                    key: 'range',
                    render: (_, record) => `¥${record.minAmount.toLocaleString()} - ¥${record.maxAmount.toLocaleString()}`
                  },
                  { 
                    title: '费率', 
                    dataIndex: 'rate', 
                    key: 'rate',
                    render: (rate: number) => `${rate}%`
                  },
                ]}
              />
            </Card>
          </TabPane>

          <TabPane tab="API对接" key="api">
            <Alert
              message="API连接状态"
              description={`当前API连接正常，最后同步时间：${orgDetail.apiStatus.lastSyncTime}`}
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="连接状态"
                    value={orgDetail.apiStatus.connectivity === 'ONLINE' ? '在线' : '离线'}
                    valueStyle={{ color: orgDetail.apiStatus.connectivity === 'ONLINE' ? '#52c41a' : '#ff4d4f' }}
                    prefix={orgDetail.apiStatus.connectivity === 'ONLINE' ? <CheckCircleOutlined /> : <WarningOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="成功率"
                    value={orgDetail.apiStatus.successRate}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="错误次数"
                    value={orgDetail.apiStatus.errorCount}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="API端点状态">
              <Table
                dataSource={orgDetail.apiStatus.endpoints}
                rowKey="name"
               
                pagination={false}
                columns={[
                  { title: '端点名称', dataIndex: 'name', key: 'name' },
                  { 
                    title: '状态', 
                    dataIndex: 'status', 
                    key: 'status',
                    render: (status: string) => (
                      <Badge 
                        status={status === 'ONLINE' ? 'success' : 'error'} 
                        text={status === 'ONLINE' ? '在线' : '离线'}
                      />
                    )
                  },
                  { title: '最后调用', dataIndex: 'lastCall', key: 'lastCall' },
                  { 
                    title: '响应时间', 
                    dataIndex: 'responseTime', 
                    key: 'responseTime',
                    render: (time: number) => `${time}ms`
                  },
                ]}
              />
            </Card>
          </TabPane>

          <TabPane tab="操作历史" key="history">
            <Timeline>
              {orgDetail.operationHistory.map(item => (
                <Timeline.Item
                  key={item.id}
                  color={item.status === 'COMPLETED' ? 'green' : 'blue'}
                >
                  <div>
                    <h4>{item.action}</h4>
                    <p>{item.description}</p>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      <CalendarOutlined /> {item.time} | 
                      <UserOutlined style={{ marginLeft: 8 }} /> {item.operator}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* 合作管理弹窗 */}
      <Modal
        title="合作管理"
        open={cooperationModalVisible}
        onOk={handleCooperationManagement}
        onCancel={() => {
          setCooperationModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="操作类型"
            name="actionType"
            rules={[{ required: true, message: '请选择操作类型' }]}
          >
            <Select placeholder="请选择操作类型">
              <Select.Option value="renew">续签合同</Select.Option>
              <Select.Option value="suspend">暂停合作</Select.Option>
              <Select.Option value="terminate">终止合作</Select.Option>
              <Select.Option value="modify">修改费率</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="备注说明"
            name="remark"
            rules={[{ required: true, message: '请输入备注说明' }]}
          >
            <TextArea rows={4} placeholder="请输入操作备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SourceOrgDetail;