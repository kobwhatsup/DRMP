import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tabs, Tag, Button, Space, Row, Col, Timeline, Statistic,
  Table, Avatar, Badge, Divider, message, Modal, Form, Input, InputNumber
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, CheckOutlined, CloseOutlined,
  StopOutlined, PlayCircleOutlined, DollarOutlined, FileTextOutlined,
  TeamOutlined, BankOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, CalendarOutlined, UserOutlined
} from '@ant-design/icons';
import organizationService, { OrganizationDetail } from '@/services/organizationService';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;

const OrganizationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationDetail | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadOrganizationDetail();
    }
  }, [id]);

  const loadOrganizationDetail = async () => {
    setLoading(true);
    try {
      const data = await organizationService.getOrganizationDetail(Number(id));
      setOrganization(data);
    } catch (error) {
      console.error('加载机构详情失败:', error);
      message.error('加载机构详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const values = await form.validateFields();
      await organizationService.approveOrganization(Number(id), {
        remark: values.remark,
        membershipFee: values.membershipFee
      });
      message.success('审核通过');
      setApprovalModalVisible(false);
      form.resetFields();
      loadOrganizationDetail();
    } catch (error) {
      console.error('审核失败:', error);
      message.error('审核失败');
    }
  };

  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      await organizationService.rejectOrganization(Number(id), {
        remark: values.remark
      });
      message.success('已拒绝');
      setRejectModalVisible(false);
      form.resetFields();
      loadOrganizationDetail();
    } catch (error) {
      console.error('拒绝失败:', error);
      message.error('拒绝失败');
    }
  };

  const handleSuspend = async () => {
    try {
      const values = await form.validateFields();
      await organizationService.suspendOrganization(Number(id), values.reason);
      message.success('已停用');
      setSuspendModalVisible(false);
      form.resetFields();
      loadOrganizationDetail();
    } catch (error) {
      console.error('停用失败:', error);
      message.error('停用失败');
    }
  };

  const handleActivate = async () => {
    Modal.confirm({
      title: '确认激活',
      content: '确定要激活该机构吗？',
      onOk: async () => {
        try {
          await organizationService.activateOrganization(Number(id));
          message.success('已激活');
          loadOrganizationDetail();
        } catch (error) {
          console.error('激活失败:', error);
          message.error('激活失败');
        }
      }
    });
  };

  const handlePayment = async () => {
    try {
      const values = await paymentForm.validateFields();
      await organizationService.updateMembershipPayment(Number(id), {
        paymentMethod: values.paymentMethod,
        paymentReference: values.paymentReference,
        remark: values.remark
      });
      message.success('会员费支付信息已更新');
      setPaymentModalVisible(false);
      paymentForm.resetFields();
      loadOrganizationDetail();
    } catch (error) {
      console.error('更新支付信息失败:', error);
      message.error('更新支付信息失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'PENDING': return 'orange';
      case 'SUSPENDED': return 'red';
      case 'REJECTED': return 'red';
      default: return 'default';
    }
  };

  const getTypeInfo = (type: string) => {
    const typeMap: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
      'BANK': { name: '银行', color: '#1890ff', icon: <BankOutlined /> },
      'CONSUMER_FINANCE': { name: '消费金融公司', color: '#52c41a', icon: <BankOutlined /> },
      'ONLINE_LOAN': { name: '网络贷款公司', color: '#faad14', icon: <BankOutlined /> },
      'MICRO_LOAN': { name: '小额贷款公司', color: '#f5222d', icon: <BankOutlined /> },
      'AMC': { name: '资产管理公司', color: '#722ed1', icon: <BankOutlined /> },
      'MEDIATION_CENTER': { name: '调解中心', color: '#13c2c2', icon: <TeamOutlined /> },
      'LAW_FIRM': { name: '律师事务所', color: '#eb2f96', icon: <TeamOutlined /> },
      'OTHER': { name: '其他', color: '#8c8c8c', icon: <TeamOutlined /> },
    };
    return typeMap[type] || { name: type, color: '#8c8c8c', icon: <TeamOutlined /> };
  };

  if (!organization) {
    return <Card loading={loading} />;
  }

  const typeInfo = getTypeInfo(organization.type);

  return (
    <div>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large" align="center">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/organizations')}
              >
                返回列表
              </Button>
              <Avatar 
                size={48} 
                style={{ backgroundColor: typeInfo.color }}
                icon={typeInfo.icon}
              />
              <div>
                <h2 style={{ margin: 0 }}>{organization.orgName}</h2>
                <Space>
                  <Tag color={typeInfo.color}>{typeInfo.name}</Tag>
                  <Tag color={getStatusColor(organization.status)}>
                    {organization.statusName}
                  </Tag>
                  {organization.membershipPaid && (
                    <Tag color="gold">会员费已缴纳</Tag>
                  )}
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/organizations/${id}/edit`)}>
                编辑
              </Button>
              {organization.status === 'PENDING' && (
                <>
                  <Button 
                    type="primary" 
                    icon={<CheckOutlined />}
                    onClick={() => setApprovalModalVisible(true)}
                  >
                    通过审核
                  </Button>
                  <Button 
                    danger 
                    icon={<CloseOutlined />}
                    onClick={() => setRejectModalVisible(true)}
                  >
                    拒绝
                  </Button>
                </>
              )}
              {organization.status === 'ACTIVE' && (
                <Button 
                  danger 
                  icon={<StopOutlined />}
                  onClick={() => setSuspendModalVisible(true)}
                >
                  停用
                </Button>
              )}
              {organization.status === 'SUSPENDED' && (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={handleActivate}
                >
                  激活
                </Button>
              )}
              {organization.type.includes('DISPOSAL') && !organization.membershipPaid && (
                <Button 
                  type="primary" 
                  icon={<DollarOutlined />}
                  onClick={() => setPaymentModalVisible(true)}
                >
                  更新会员费支付
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Descriptions title="机构信息" bordered column={2}>
              <Descriptions.Item label="机构代码">{organization.orgCode}</Descriptions.Item>
              <Descriptions.Item label="机构类型">{typeInfo.name}</Descriptions.Item>
              <Descriptions.Item label="机构状态">
                <Tag color={getStatusColor(organization.status)}>
                  {organization.statusName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="注册日期">
                {organization.registrationDate ? dayjs(organization.registrationDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="营业执照">{organization.businessLicense || '-'}</Descriptions.Item>
              <Descriptions.Item label="法定代表人">{organization.legalRepresentative || '-'}</Descriptions.Item>
              <Descriptions.Item label="注册资本">
                {organization.registeredCapital ? `${organization.registeredCapital}万元` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>
                <EnvironmentOutlined /> {organization.address || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="机构简介" span={2}>
                {organization.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="联系信息" bordered column={2}>
              <Descriptions.Item label="联系人">
                <UserOutlined /> {organization.contactPerson}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                <PhoneOutlined /> {organization.contactPhone}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱" span={2}>
                <MailOutlined /> {organization.email}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="银行信息" bordered column={2}>
              <Descriptions.Item label="开户行">{organization.bankName || '-'}</Descriptions.Item>
              <Descriptions.Item label="银行账号">{organization.bankAccount || '-'}</Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="业务信息" key="business">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="处理能力">
                  <Statistic title="团队规模" value={organization.teamSize} suffix="人" />
                  <Statistic 
                    title="月处理能力" 
                    value={organization.monthlyCaseCapacity} 
                    suffix="件" 
                    style={{ marginTop: 16 }}
                  />
                  <Statistic 
                    title="当前负载" 
                    value={organization.currentLoadPercentage} 
                    suffix="%" 
                    style={{ marginTop: 16 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="服务区域">
                  {organization.serviceRegions && organization.serviceRegions.length > 0 ? (
                    <Space wrap>
                      {organization.serviceRegions.map(region => (
                        <Tag key={region} color="blue">{region}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <span style={{ color: '#999' }}>暂无服务区域</span>
                  )}
                </Card>
                <Card title="业务范围" style={{ marginTop: 16 }}>
                  {organization.businessScopes && organization.businessScopes.length > 0 ? (
                    <Space wrap>
                      {organization.businessScopes.map(scope => (
                        <Tag key={scope} color="green">{scope}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <span style={{ color: '#999' }}>暂无业务范围</span>
                  )}
                </Card>
              </Col>
            </Row>

            {organization.type.includes('DISPOSAL') && (
              <>
                <Divider />
                <Card title="处置信息">
                  <Row gutter={16}>
                    <Col span={12}>
                      <h4>处置类型</h4>
                      {organization.disposalTypes && organization.disposalTypes.length > 0 ? (
                        <Space wrap>
                          {organization.disposalTypes.map(type => (
                            <Tag key={type} color="purple">{type}</Tag>
                          ))}
                        </Space>
                      ) : (
                        <span style={{ color: '#999' }}>暂无处置类型</span>
                      )}
                    </Col>
                    <Col span={12}>
                      <h4>结算方式</h4>
                      {organization.settlementMethods && organization.settlementMethods.length > 0 ? (
                        <Space wrap>
                          {organization.settlementMethods.map(method => (
                            <Tag key={method} color="orange">{method}</Tag>
                          ))}
                        </Space>
                      ) : (
                        <span style={{ color: '#999' }}>暂无结算方式</span>
                      )}
                    </Col>
                  </Row>
                  <Divider />
                  <h4>合作案例</h4>
                  <p>{organization.cooperationCases || '暂无合作案例'}</p>
                </Card>
              </>
            )}
          </TabPane>

          {organization.type.includes('DISPOSAL') && (
            <TabPane tab="财务信息" key="finance">
              <Card title="会员费信息">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="会员费金额">
                    {organization.membershipFee ? `¥${organization.membershipFee}` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="缴费状态">
                    <Tag color={organization.membershipPaid ? 'green' : 'red'}>
                      {organization.membershipPaid ? '已缴纳' : '未缴纳'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="支付方式">{organization.paymentMethod || '-'}</Descriptions.Item>
                  <Descriptions.Item label="支付凭证">{organization.paymentReference || '-'}</Descriptions.Item>
                  <Descriptions.Item label="支付日期">
                    {organization.paymentDate ? dayjs(organization.paymentDate).format('YYYY-MM-DD') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="会员有效期">
                    {organization.membershipStartDate && organization.membershipEndDate ? 
                      `${dayjs(organization.membershipStartDate).format('YYYY-MM-DD')} 至 ${dayjs(organization.membershipEndDate).format('YYYY-MM-DD')}` : '-'
                    }
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </TabPane>
          )}

          <TabPane tab="操作历史" key="history">
            <Timeline>
              <Timeline.Item color="green">
                <p>机构创建</p>
                <p style={{ color: '#999', fontSize: 12 }}>
                  {organization.createdAt ? dayjs(organization.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </p>
              </Timeline.Item>
              {organization.approvalAt && (
                <Timeline.Item color={organization.status === 'ACTIVE' ? 'green' : 'red'}>
                  <p>{organization.status === 'ACTIVE' ? '审核通过' : '审核拒绝'}</p>
                  <p style={{ color: '#999', fontSize: 12 }}>
                    {dayjs(organization.approvalAt).format('YYYY-MM-DD HH:mm:ss')}
                    {organization.approvalByName && ` - ${organization.approvalByName}`}
                  </p>
                  {organization.approvalRemark && (
                    <p style={{ fontSize: 12 }}>备注：{organization.approvalRemark}</p>
                  )}
                </Timeline.Item>
              )}
              {organization.lastActiveAt && (
                <Timeline.Item>
                  <p>最后活跃</p>
                  <p style={{ color: '#999', fontSize: 12 }}>
                    {dayjs(organization.lastActiveAt).format('YYYY-MM-DD HH:mm:ss')}
                  </p>
                </Timeline.Item>
              )}
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* 审核通过弹窗 */}
      <Modal
        title="审核通过"
        open={approvalModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          setApprovalModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          {organization.type.includes('DISPOSAL') && (
            <Form.Item
              label="会员费金额"
              name="membershipFee"
              rules={[{ required: true, message: '请输入会员费金额' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                prefix="¥"
                placeholder="请输入会员费金额"
              />
            </Form.Item>
          )}
          <Form.Item
            label="审核备注"
            name="remark"
            rules={[{ required: true, message: '请输入审核备注' }]}
          >
            <TextArea rows={4} placeholder="请输入审核备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 拒绝弹窗 */}
      <Modal
        title="拒绝申请"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="拒绝原因"
            name="remark"
            rules={[{ required: true, message: '请输入拒绝原因' }]}
          >
            <TextArea rows={4} placeholder="请输入拒绝原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 停用弹窗 */}
      <Modal
        title="停用机构"
        open={suspendModalVisible}
        onOk={handleSuspend}
        onCancel={() => {
          setSuspendModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="停用原因"
            name="reason"
            rules={[{ required: true, message: '请输入停用原因' }]}
          >
            <TextArea rows={4} placeholder="请输入停用原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 会员费支付弹窗 */}
      <Modal
        title="更新会员费支付信息"
        open={paymentModalVisible}
        onOk={handlePayment}
        onCancel={() => {
          setPaymentModalVisible(false);
          paymentForm.resetFields();
        }}
      >
        <Form form={paymentForm} layout="vertical">
          <Form.Item
            label="支付方式"
            name="paymentMethod"
            rules={[{ required: true, message: '请选择支付方式' }]}
          >
            <Input placeholder="如：银行转账、支付宝、微信等" />
          </Form.Item>
          <Form.Item
            label="支付凭证号"
            name="paymentReference"
            rules={[{ required: true, message: '请输入支付凭证号' }]}
          >
            <Input placeholder="请输入支付凭证号或交易号" />
          </Form.Item>
          <Form.Item
            label="备注"
            name="remark"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationDetailPage;