import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Tag, Space, Modal, Form, Input, Select, 
  DatePicker, message, Row, Col, Statistic, Badge, Tabs, Radio
} from 'antd';
import {
  DollarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  BankOutlined, WechatOutlined, AlipayCircleOutlined,
  CreditCardOutlined, ExportOutlined, ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import organizationService, { Organization, PageResponse } from '@/services/organizationService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface PaymentModalProps {
  visible: boolean;
  organization: Organization | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ visible, organization, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await organizationService.updateMembershipPayment(organization!.id, {
        paymentMethod: values.paymentMethod,
        paymentReference: values.paymentReference,
        remark: values.remark
      });

      message.success('会员费支付信息已更新');
      onSuccess();
      form.resetFields();
    } catch (error) {
      console.error('更新支付信息失败', error);
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="登记会员费支付"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="机构名称">
          <Input value={organization?.orgName} disabled />
        </Form.Item>
        
        <Form.Item label="会员费金额">
          <Input 
            value={organization?.membershipFee ? `¥${organization.membershipFee}` : '¥999'} 
            disabled 
            addonAfter="元/月"
          />
        </Form.Item>

        <Form.Item
          name="paymentMethod"
          label="支付方式"
          rules={[{ required: true, message: '请选择支付方式' }]}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="BANK_TRANSFER">
                <BankOutlined /> 银行转账
              </Radio>
              <Radio value="ALIPAY">
                <AlipayCircleOutlined /> 支付宝
              </Radio>
              <Radio value="WECHAT">
                <WechatOutlined /> 微信支付
              </Radio>
              <Radio value="CREDIT_CARD">
                <CreditCardOutlined /> 信用卡
              </Radio>
              <Radio value="OTHER">其他</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="paymentReference"
          label="支付凭证号"
          rules={[
            { required: true, message: '请输入支付凭证号' },
            { min: 6, message: '支付凭证号至少6个字符' }
          ]}
        >
          <Input placeholder="请输入交易流水号或凭证号" />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={3} placeholder="请输入备注信息（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const MembershipPayment: React.FC = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('unpaid');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statistics, setStatistics] = useState({
    totalOrgs: 0,
    unpaidOrgs: 0,
    paidOrgs: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
  });
  const [filters, setFilters] = useState({
    dateRange: null as any,
    orgType: undefined as string | undefined,
  });
  const [paymentModal, setPaymentModal] = useState<{
    visible: boolean;
    organization: Organization | null;
  }>({
    visible: false,
    organization: null,
  });

  useEffect(() => {
    loadOrganizations();
    loadStatistics();
  }, [activeTab, pagination.current, pagination.pageSize]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        type: filters.orgType,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };

      // 根据tab筛选
      if (activeTab === 'unpaid') {
        const response = await organizationService.getOrganizations({
          ...params,
          status: 'ACTIVE', // 只显示已激活的机构
        });
        
        // 筛选出需要缴纳会员费但未缴纳的处置机构
        const unpaidOrgs = response.content.filter(org => 
          org.type.includes('MEDIATION_CENTER') || org.type.includes('LAW_FIRM') || org.type.includes('DISPOSAL')
        ).filter(org => !org.membershipPaid);
        
        setOrganizations(unpaidOrgs);
        setPagination({
          ...pagination,
          total: unpaidOrgs.length,
        });
      } else {
        const response = await organizationService.getOrganizations({
          ...params,
          status: 'ACTIVE',
        });
        
        // 筛选出已缴纳会员费的处置机构
        const paidOrgs = response.content.filter(org => 
          org.type.includes('MEDIATION_CENTER') || org.type.includes('LAW_FIRM') || org.type.includes('DISPOSAL')
        ).filter(org => org.membershipPaid);
        
        setOrganizations(paidOrgs);
        setPagination({
          ...pagination,
          total: paidOrgs.length,
        });
      }
    } catch (error) {
      console.error('加载机构列表失败', error);
      message.error('加载数据失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // 模拟统计数据
      setStatistics({
        totalOrgs: 45,
        unpaidOrgs: 12,
        paidOrgs: 33,
        monthlyRevenue: 32967,
        yearlyRevenue: 395604,
      });
    } catch (error) {
      console.error('加载统计数据失败', error);
    }
  };

  const handlePayment = (organization: Organization) => {
    setPaymentModal({
      visible: true,
      organization,
    });
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const columns: ColumnsType<Organization> = [
    {
      title: '机构代码',
      dataIndex: 'orgCode',
      key: 'orgCode',
      width: 120,
    },
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
      render: (text, record) => (
        <a onClick={() => {
          const basePath = record.category === 'SOURCE' ? '/source-orgs' : '/disposal-orgs';
          navigate(`${basePath}/${record.id}`);
        }}>
          {text}
        </a>
      ),
    },
    {
      title: '机构类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: 120,
      render: (_, record) => (
        <Tag color="green">{record.typeName}</Tag>
      ),
    },
    {
      title: '会员费标准',
      key: 'membershipFee',
      width: 120,
      render: (_, record) => (
        <span style={{ fontWeight: 'bold' }}>
          ¥{record.membershipFee || 999}/月
        </span>
      ),
    },
    {
      title: '缴费状态',
      key: 'paymentStatus',
      width: 100,
      render: (_, record) => (
        <Badge
          status={record.membershipPaid ? 'success' : 'error'}
          text={
            <Tag color={record.membershipPaid ? 'green' : 'red'}>
              {record.membershipPaid ? '已缴费' : '待缴费'}
            </Tag>
          }
        />
      ),
    },
    {
      title: '缴费日期',
      dataIndex: 'membershipPaidAt',
      key: 'membershipPaidAt',
      width: 120,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : '-',
    },
    {
      title: '到期日期',
      key: 'expiryDate',
      width: 120,
      render: (_, record) => {
        if (!record.membershipPaidAt) return '-';
        const expiryDate = dayjs(record.membershipPaidAt).add(1, 'year');
        const isExpiring = expiryDate.diff(dayjs(), 'day') < 30;
        return (
          <span style={{ color: isExpiring ? '#ff4d4f' : undefined }}>
            {expiryDate.format('YYYY-MM-DD')}
            {isExpiring && <span> (即将到期)</span>}
          </span>
        );
      },
    },
    {
      title: '支付方式',
      key: 'paymentMethod',
      width: 100,
      render: (_, record) => {
        if (!record.membershipPaid) return '-';
        const paymentMethodMap: Record<string, { icon: React.ReactNode; text: string }> = {
          'BANK_TRANSFER': { icon: <BankOutlined />, text: '银行转账' },
          'ALIPAY': { icon: <AlipayCircleOutlined />, text: '支付宝' },
          'WECHAT': { icon: <WechatOutlined />, text: '微信支付' },
          'CREDIT_CARD': { icon: <CreditCardOutlined />, text: '信用卡' },
          'OTHER': { icon: <DollarOutlined />, text: '其他' },
        };
        const method = paymentMethodMap[(record as any).paymentMethod || 'OTHER'];
        return (
          <Space>
            {method.icon}
            <span>{method.text}</span>
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              const basePath = record.category === 'SOURCE' ? '/source-orgs' : '/disposal-orgs';
              navigate(`${basePath}/${record.id}`);
            }}
          >
            查看详情
          </Button>
          {!record.membershipPaid && (
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handlePayment(record)}
            >
              登记缴费
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="会员费管理"
        extra={
          <Space>
            <Button icon={<ExportOutlined />}>导出报表</Button>
            <Button icon={<ReloadOutlined />} onClick={loadOrganizations}>
              刷新
            </Button>
          </Space>
        }
      >
        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="处置机构总数"
                value={statistics.totalOrgs}
                prefix={<BankOutlined />}
              />
            </Card>
          </Col>
          <Col span={5}>
            <Card>
              <Statistic
                title="待缴费机构"
                value={statistics.unpaidOrgs}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={5}>
            <Card>
              <Statistic
                title="已缴费机构"
                value={statistics.paidOrgs}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={5}>
            <Card>
              <Statistic
                title="本月收入"
                value={statistics.monthlyRevenue}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={5}>
            <Card>
              <Statistic
                title="年度收入"
                value={statistics.yearlyRevenue}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 筛选条件 */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                style={{ width: '100%' }}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="选择机构类型"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => setFilters({ ...filters, orgType: value })}
              >
                <Select.Option value="MEDIATION_CENTER">调解中心</Select.Option>
                <Select.Option value="LAW_FIRM">律师事务所</Select.Option>
                <Select.Option value="DISPOSAL_COMPANY">处置公司</Select.Option>
              </Select>
            </Col>
            <Col span={4}>
              <Button onClick={() => {
                setFilters({ dateRange: null, orgType: undefined });
              }}>
                重置筛选
              </Button>
            </Col>
          </Row>
        </Card>

        {/* 标签页 */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPagination({ ...pagination, current: 1 });
          }}
        >
          <TabPane
            tab={
              <span>
                待缴费
                <Badge count={statistics.unpaidOrgs} style={{ marginLeft: 8 }} />
              </span>
            }
            key="unpaid"
          />
          <TabPane
            tab={
              <span>
                已缴费
                <Tag color="green" style={{ marginLeft: 4 }}>
                  {statistics.paidOrgs}
                </Tag>
              </span>
            }
            key="paid"
          />
        </Tabs>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={organizations}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 支付登记弹窗 */}
      <PaymentModal
        visible={paymentModal.visible}
        organization={paymentModal.organization}
        onCancel={() => setPaymentModal({ ...paymentModal, visible: false })}
        onSuccess={() => {
          setPaymentModal({ ...paymentModal, visible: false });
          loadOrganizations();
          loadStatistics();
        }}
      />
    </div>
  );
};

export default MembershipPayment;