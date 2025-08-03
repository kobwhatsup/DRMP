import React, { useState, useEffect } from 'react';
import {
  Card, Descriptions, Tag, Button, Space, Modal, Form, Input, 
  Tabs, Table, Statistic, Row, Col, Timeline,
  Avatar, Progress, Divider, Typography, InputNumber
} from 'antd';
import {
  BankOutlined, TeamOutlined, TrophyOutlined,
  SettingOutlined, EditOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, CalendarOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const DisposalOrgDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [org, setOrg] = useState<any>(null);
  const [caseAssignments, setCaseAssignments] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [form] = Form.useForm();

  useEffect(() => {
    loadOrgDetail();
    loadCaseAssignments();
    loadTeamMembers();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrgDetail = async () => {
    setLoading(true);
    try {
      // 模拟加载机构详情
      const mockOrg = {
        id: Number(id),
        orgName: '北京市朝阳区人民调解中心',
        orgType: 'MEDIATION_CENTER',
        typeName: '调解中心',
        status: 'ACTIVE',
        contactPerson: '张主任',
        contactPhone: '13800138000',
        email: 'zhang@mediation.gov.cn',
        address: '北京市朝阳区建国路88号',
        teamSize: 45,
        monthlyCapacity: 1200,
        currentLoad: 75,
        serviceRegions: ['北京', '天津', '河北'],
        businessScope: ['BANK', 'CONSUMER_FINANCE', 'ONLINE_LOAN'],
        disposalTypes: ['MEDIATION', 'LITIGATION'],
        settlementMethods: ['HALF_RISK'],
        membershipPaid: true,
        membershipPaidAt: '2024-01-15',
        contractStartDate: '2024-01-01',
        cooperationCases: '曾与工商银行、建设银行等多家银行合作处置个贷不良案件，累计处理案件超过50000件，平均回款率达到65%。',
        orgDescription: '北京市朝阳区人民调解中心是经政府批准设立的专业调解机构，拥有资深调解员45名，年处理各类纠纷案件超过10000件。',
        createdAt: '2024-01-01',
        lastActiveAt: '2024-07-30 15:30:00'
      };
      setOrg(mockOrg);
    } catch (error) {
      console.error('加载机构详情失败', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseAssignments = async () => {
    try {
      const mockAssignments = [
        {
          id: 1,
          casePackageName: '工商银行个贷不良包-202407',
          sourceOrgName: '中国工商银行',
          caseCount: 850,
          totalAmount: 12500000,
          assignedAt: '2024-07-01',
          status: 'PROCESSING',
          progress: 78,
          recoveredAmount: 8750000,
          recoveryRate: 70
        }
      ];
      setCaseAssignments(mockAssignments);
    } catch (error) {
      console.error('加载案件分配数据失败', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const mockMembers = [
        {
          id: 1,
          name: '李调解员',
          role: '高级调解员',
          department: '调解一部',
          caseCount: 245,
          recoveredAmount: 3200000,
          recoveryRate: 68,
          performance: 'EXCELLENT'
        }
      ];
      setTeamMembers(mockMembers);
    } catch (error) {
      console.error('加载团队成员数据失败', error);
    }
  };

  const handleEdit = () => {
    form.setFieldsValue(org);
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('更新机构信息:', values);
      setEditModalVisible(false);
      loadOrgDetail();
    } catch (error) {
      console.error('更新失败', error);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      'ACTIVE': { color: 'green', text: '正常' },
      'PENDING': { color: 'orange', text: '审核中' },
      'SUSPENDED': { color: 'red', text: '暂停' },
      'REJECTED': { color: 'red', text: '已拒绝' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  if (!org) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 头部信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col span={18}>
            <Space size="large" align="start">
              <Avatar size={64} icon={<BankOutlined />} />
              <div>
                <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                  {org.orgName}
                </Title>
                <Space size="middle">
                  <Tag color="blue">{org.typeName}</Tag>
                  {getStatusTag(org.status)}
                  {org.membershipPaid && (
                    <Tag color="green" icon={<CheckCircleOutlined />}>已缴费</Tag>
                  )}
                </Space>
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">
                    <EnvironmentOutlined /> {org.address}
                  </Text>
                  <Divider type="vertical" />
                  <Text type="secondary">
                    <CalendarOutlined /> 最后活跃：{org.lastActiveAt}
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Space direction="vertical" size="middle">
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                编辑信息
              </Button>
              <Button icon={<SettingOutlined />}>
                机构设置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="团队规模"
              value={org.teamSize}
              suffix="人"
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="月处理能力"
              value={org.monthlyCapacity}
              suffix="件"
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前负载"
              value={org.currentLoad}
              suffix="%"
              valueStyle={{ color: org.currentLoad > 80 ? '#cf1322' : '#3f8600' }}
            />
            <Progress percent={org.currentLoad} showInfo={false} size="small" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="会员状态"
              value={org.membershipPaid ? '正常' : '待缴费'}
              valueStyle={{ color: org.membershipPaid ? '#3f8600' : '#cf1322' }}
              prefix={org.membershipPaid ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 详情标签页 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="基本信息" key="overview">
          <Card title="机构详情" bordered={false}>
            <Row gutter={24}>
              <Col span={12}>
                <Descriptions column={1} size="middle">
                  <Descriptions.Item label="机构名称">{org.orgName}</Descriptions.Item>
                  <Descriptions.Item label="机构类型">{org.typeName}</Descriptions.Item>
                  <Descriptions.Item label="联系人">{org.contactPerson}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    {org.contactPhone}
                  </Descriptions.Item>
                  <Descriptions.Item label="邮箱地址">
                    <MailOutlined style={{ marginRight: 8 }} />
                    {org.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="办公地址">
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    {org.address}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions column={1} size="middle">
                  <Descriptions.Item label="服务区域">
                    {org.serviceRegions?.map((region: string) => (
                      <Tag key={region} color="blue" style={{ margin: '2px' }}>{region}</Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="业务范围">
                    {org.businessScope?.map((scope: string) => (
                      <Tag key={scope} color="green" style={{ margin: '2px' }}>{scope}</Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="处置类型">
                    {org.disposalTypes?.map((type: string) => (
                      <Tag key={type} color="orange" style={{ margin: '2px' }}>{type}</Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="结算方式">
                    <Tag color="purple">{org.settlementMethods?.[0]}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="合同开始时间">{org.contractStartDate}</Descriptions.Item>
                  <Descriptions.Item label="注册时间">{org.createdAt}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={24}>
              <Col span={24}>
                <Title level={5}>机构描述</Title>
                <Text>{org.orgDescription}</Text>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={24}>
              <Col span={24}>
                <Title level={5}>合作案例</Title>
                <Text>{org.cooperationCases}</Text>
              </Col>
            </Row>
          </Card>
        </TabPane>

        <TabPane tab="案件分配" key="cases">
          <Card title="案件分配记录" bordered={false}>
            <Table
              dataSource={caseAssignments}
              columns={[
                {
                  title: '案件包名称',
                  dataIndex: 'casePackageName',
                  key: 'casePackageName',
                },
                {
                  title: '案源机构',
                  dataIndex: 'sourceOrgName',
                  key: 'sourceOrgName',
                },
                {
                  title: '案件数量',
                  dataIndex: 'caseCount',
                  key: 'caseCount',
                  render: (count: number) => `${count}件`,
                },
                {
                  title: '总金额',
                  dataIndex: 'totalAmount',
                  key: 'totalAmount',
                  render: (amount: number) => `¥${(amount / 10000).toFixed(2)}万`,
                },
                {
                  title: '分配时间',
                  dataIndex: 'assignedAt',
                  key: 'assignedAt',
                },
                {
                  title: '处理进度',
                  dataIndex: 'progress',
                  key: 'progress',
                  render: (progress: number) => (
                    <Progress percent={progress} size="small" />
                  ),
                },
                {
                  title: '已回款金额',
                  dataIndex: 'recoveredAmount',
                  key: 'recoveredAmount',
                  render: (amount: number) => `¥${(amount / 10000).toFixed(2)}万`,
                },
                {
                  title: '回款率',
                  dataIndex: 'recoveryRate',
                  key: 'recoveryRate',
                  render: (rate: number) => `${rate}%`,
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const statusMap: Record<string, { color: string; text: string }> = {
                      'PROCESSING': { color: 'blue', text: '处理中' },
                      'COMPLETED': { color: 'green', text: '已完成' },
                      'PAUSED': { color: 'orange', text: '暂停' },
                    };
                    const config = statusMap[status] || { color: 'default', text: status };
                    return <Tag color={config.color}>{config.text}</Tag>;
                  },
                },
              ]}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="团队管理" key="team">
          <Card title="团队成员" bordered={false}>
            <Table
              dataSource={teamMembers}
              columns={[
                {
                  title: '姓名',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: '职位',
                  dataIndex: 'role',
                  key: 'role',
                },
                {
                  title: '部门',
                  dataIndex: 'department',
                  key: 'department',
                },
                {
                  title: '处理案件数',
                  dataIndex: 'caseCount',
                  key: 'caseCount',
                  render: (count: number) => `${count}件`,
                },
                {
                  title: '累计回款',
                  dataIndex: 'recoveredAmount',
                  key: 'recoveredAmount',
                  render: (amount: number) => `¥${(amount / 10000).toFixed(2)}万`,
                },
                {
                  title: '回款率',
                  dataIndex: 'recoveryRate',
                  key: 'recoveryRate',
                  render: (rate: number) => `${rate}%`,
                },
                {
                  title: '绩效评级',
                  dataIndex: 'performance',
                  key: 'performance',
                  render: (performance: string) => {
                    const performanceMap: Record<string, { color: string; text: string }> = {
                      'EXCELLENT': { color: 'green', text: '优秀' },
                      'GOOD': { color: 'blue', text: '良好' },
                      'AVERAGE': { color: 'orange', text: '一般' },
                      'POOR': { color: 'red', text: '待改进' },
                    };
                    const config = performanceMap[performance] || { color: 'default', text: performance };
                    return <Tag color={config.color}>{config.text}</Tag>;
                  },
                },
              ]}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="会员费记录" key="membership">
          <Card title="会员费缴费记录" bordered={false}>
            <Timeline
              items={[
                {
                  color: 'green',
                  dot: <CheckCircleOutlined />,
                  children: (
                    <div>
                      <Text strong>2024年07月 会员费</Text>
                      <br />
                      <Text type="secondary">¥999.00 - 已支付</Text>
                      <br />
                      <Text type="secondary">支付时间：2024-07-01 09:30:00</Text>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  dot: <CheckCircleOutlined />,
                  children: (
                    <div>
                      <Text strong>2024年06月 会员费</Text>
                      <br />
                      <Text type="secondary">¥999.00 - 已支付</Text>
                      <br />
                      <Text type="secondary">支付时间：2024-06-01 10:15:00</Text>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  dot: <CheckCircleOutlined />,
                  children: (
                    <div>
                      <Text strong>首次会员费</Text>
                      <br />
                      <Text type="secondary">¥999.00 - 已支付</Text>
                      <br />
                      <Text type="secondary">支付时间：{org.membershipPaidAt} 14:20:00</Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑机构信息"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSave}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactPerson" label="联系人">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPhone" label="联系电话">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="邮箱地址">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="teamSize" label="团队规模">
                <InputNumber style={{ width: '100%' }} addonAfter="人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="monthlyCapacity" label="月处理能力">
                <InputNumber style={{ width: '100%' }} addonAfter="件" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currentLoad" label="当前负载">
                <InputNumber style={{ width: '100%' }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="办公地址">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="orgDescription" label="机构描述">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DisposalOrgDetail;