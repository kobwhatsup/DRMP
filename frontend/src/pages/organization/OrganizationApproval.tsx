import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Tabs, Statistic, Row, Col, DatePicker, Select, Modal, Form, Input, message, Tooltip, Badge } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined, HistoryOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { organizationService } from '../../services/organizationService';
import type { Organization } from '../../types/organization';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface ApprovalModalProps {
  visible: boolean;
  organization: Organization | null;
  type: 'approve' | 'reject';
  onCancel: () => void;
  onSuccess: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ visible, organization, type, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (type === 'approve') {
        await organizationService.approve(organization!.id, values);
        message.success('审核通过操作成功');
      } else {
        await organizationService.reject(organization!.id, values);
        message.success('审核拒绝操作成功');
      }

      onSuccess();
      form.resetFields();
    } catch (error) {
      console.error('审核操作失败', error);
      message.error('审核操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={type === 'approve' ? '审核通过' : '审核拒绝'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={type === 'approve' ? '通过' : '拒绝'}
      okButtonProps={{ danger: type === 'reject' }}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="机构名称">
          <Input value={organization?.orgName} disabled />
        </Form.Item>
        <Form.Item
          name="remark"
          label="审核备注"
          rules={[
            { required: true, message: '请输入审核备注' },
            { min: 10, message: '审核备注至少10个字符' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder={type === 'approve' ? '请输入审核通过的备注信息' : '请输入审核拒绝的原因'}
          />
        </Form.Item>
        {type === 'approve' && (
          <Form.Item
            name="membershipFee"
            label="会员费（元/月）"
            rules={[{ required: true, message: '请输入会员费金额' }]}
            initialValue={999}
          >
            <Input type="number" prefix="¥" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

const OrganizationApproval: React.FC = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    dateRange: null as any,
    type: undefined as string | undefined,
    approvalBy: undefined as string | undefined,
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    todayPending: 0,
    weekApproved: 0,
  });
  const [approvalModal, setApprovalModal] = useState<{
    visible: boolean;
    organization: Organization | null;
    type: 'approve' | 'reject';
  }>({
    visible: false,
    organization: null,
    type: 'approve',
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    loadOrganizations();
    loadStatistics();
  }, [activeTab, pagination.current, pagination.pageSize, filters]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      let status = undefined;
      if (activeTab === 'pending') status = 'PENDING';
      else if (activeTab === 'approved') status = 'ACTIVE';
      else if (activeTab === 'rejected') status = 'REJECTED';

      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        status,
        type: filters.type,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };

      const response = await organizationService.getList(params);
      setOrganizations(response.data.content);
      setPagination({
        ...pagination,
        total: response.data.totalElements,
      });
    } catch (error) {
      console.error('加载机构列表失败', error);
      message.error('加载数据失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await organizationService.getStatistics();
      setStatistics({
        total: stats.data.total || 0,
        pending: stats.data.pending || 0,
        approved: stats.data.approved || 0,
        rejected: stats.data.rejected || 0,
        todayPending: stats.data.todayPending || 0,
        weekApproved: stats.data.weekApproved || 0,
      });
    } catch (error) {
      console.error('加载统计数据失败', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'ACTIVE':
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'SUSPENDED':
        return 'volcano';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': '待审核',
      'ACTIVE': '已通过',
      'APPROVED': '已通过',
      'REJECTED': '已拒绝',
      'SUSPENDED': '已停用',
    };
    return statusMap[status] || status;
  };

  const handleApproval = (organization: Organization, type: 'approve' | 'reject') => {
    setApprovalModal({
      visible: true,
      organization,
      type,
    });
  };

  const handleBatchApproval = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要审核的机构');
      return;
    }
    Modal.confirm({
      title: '批量审核确认',
      content: `确定要批量通过 ${selectedRowKeys.length} 个机构的申请吗？`,
      onOk: async () => {
        try {
          for (const id of selectedRowKeys) {
            await organizationService.approve(id as number, { remark: '批量审核通过' });
          }
          message.success('批量审核成功');
          setSelectedRowKeys([]);
          loadOrganizations();
          loadStatistics();
        } catch (error) {
          message.error('批量审核失败');
        }
      },
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
      fixed: 'left',
    },
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <a onClick={() => navigate(`/organizations/${record.id}`)}>
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
        <Tag color={record.category === 'SOURCE' ? 'blue' : 'green'}>
          {record.typeName}
        </Tag>
      ),
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 120,
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Badge
          status={status === 'PENDING' ? 'processing' : status === 'ACTIVE' ? 'success' : 'error'}
          text={
            <Tag color={getStatusColor(status)}>
              {getStatusText(status)}
            </Tag>
          }
        />
      ),
    },
    {
      title: '审核人',
      dataIndex: 'approvalByName',
      key: 'approvalByName',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '审核时间',
      dataIndex: 'approvalAt',
      key: 'approvalAt',
      width: 160,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '审核备注',
      dataIndex: 'approvalRemark',
      key: 'approvalRemark',
      ellipsis: true,
      width: 200,
      render: (text) => text ? (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      ) : '-',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
           
            onClick={() => navigate(`/organizations/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
               
                style={{ color: '#52c41a' }}
                onClick={() => handleApproval(record, 'approve')}
              >
                通过
              </Button>
              <Button
                type="link"
                icon={<CloseCircleOutlined />}
               
                danger
                onClick={() => handleApproval(record, 'reject')}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'REJECTED' && (
            <Button
              type="link"
              icon={<HistoryOutlined />}
             
              onClick={() => navigate(`/organizations/${record.id}`)}
            >
              查看原因
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: Organization) => ({
      disabled: record.status !== 'PENDING',
    }),
  };

  return (
    <div>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>审核中心</span>
            {activeTab === 'pending' && selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleBatchApproval}
              >
                批量通过 ({selectedRowKeys.length})
              </Button>
            )}
          </div>
        }
        bordered={false}
      >
        {/* Enhanced Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card hoverable>
              <Statistic
                title="总申请数"
                value={statistics.total}
                prefix={<SafetyCertificateOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card hoverable style={{ borderLeft: '3px solid #faad14' }}>
              <Statistic
                title="待审核"
                value={statistics.pending}
                valueStyle={{ color: '#faad14' }}
                suffix={
                  <span style={{ fontSize: 12, color: '#999' }}>
                    今日新增 {statistics.todayPending}
                  </span>
                }
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card hoverable style={{ borderLeft: '3px solid #52c41a' }}>
              <Statistic
                title="已通过"
                value={statistics.approved}
                valueStyle={{ color: '#52c41a' }}
                suffix={
                  <span style={{ fontSize: 12, color: '#999' }}>
                    本周 {statistics.weekApproved}
                  </span>
                }
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card hoverable style={{ borderLeft: '3px solid #f5222d' }}>
              <Statistic
                title="已拒绝"
                value={statistics.rejected}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card hoverable>
              <Statistic
                title="通过率"
                value={statistics.total > 0 ? (statistics.approved / statistics.total * 100).toFixed(1) : 0}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card hoverable>
              <Statistic
                title="平均审核时长"
                value="2.5"
                suffix="小时"
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Enhanced Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <RangePicker 
                placeholder={['开始日期', '结束日期']}
                style={{ width: '100%' }}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              />
            </Col>
            <Col span={5}>
              <Select 
                placeholder="选择机构类型" 
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => setFilters({ ...filters, type: value })}
              >
                <Select.Option value="BANK">银行</Select.Option>
                <Select.Option value="CONSUMER_FINANCE">消费金融公司</Select.Option>
                <Select.Option value="LAW_FIRM">律师事务所</Select.Option>
                <Select.Option value="MEDIATION_CENTER">调解中心</Select.Option>
                <Select.Option value="ONLINE_LOAN">网贷公司</Select.Option>
                <Select.Option value="SMALL_LOAN">小贷公司</Select.Option>
              </Select>
            </Col>
            <Col span={5}>
              <Select 
                placeholder="选择审核人" 
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => setFilters({ ...filters, approvalBy: value })}
              >
                <Select.Option value="admin">管理员</Select.Option>
                <Select.Option value="reviewer1">审核员1</Select.Option>
                <Select.Option value="reviewer2">审核员2</Select.Option>
              </Select>
            </Col>
            <Col span={4}>
              <Button onClick={() => {
                setFilters({
                  dateRange: null,
                  type: undefined,
                  approvalBy: undefined,
                });
              }}>
                重置筛选
              </Button>
            </Col>
            <Col span={4} style={{ textAlign: 'right' }}>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => message.info('导出功能开发中')}
              >
                导出报表
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => {
            setActiveTab(key);
            setSelectedRowKeys([]);
          }}
        >
          <TabPane tab="全部" key="all" />
          <TabPane 
            tab={
              <span>
                待审核 
                {statistics.pending > 0 && (
                  <Badge count={statistics.pending} style={{ marginLeft: 8 }} />
                )}
              </span>
            } 
            key="pending" 
          />
          <TabPane 
            tab={
              <span>
                已通过
                <Tag color="green" style={{ marginLeft: 4 }}>
                  {statistics.approved}
                </Tag>
              </span>
            } 
            key="approved" 
          />
          <TabPane 
            tab={
              <span>
                已拒绝
                <Tag color="red" style={{ marginLeft: 4 }}>
                  {statistics.rejected}
                </Tag>
              </span>
            } 
            key="rejected" 
          />
        </Tabs>

        <Table
          columns={columns}
          dataSource={organizations}
          rowKey="id"
          loading={loading}
          rowSelection={activeTab === 'pending' ? rowSelection : undefined}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* Approval Modal */}
      <ApprovalModal
        visible={approvalModal.visible}
        organization={approvalModal.organization}
        type={approvalModal.type}
        onCancel={() => setApprovalModal({ ...approvalModal, visible: false })}
        onSuccess={() => {
          setApprovalModal({ ...approvalModal, visible: false });
          loadOrganizations();
          loadStatistics();
        }}
      />
    </div>
  );
};

export default OrganizationApproval;