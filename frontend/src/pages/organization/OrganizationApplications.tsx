import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, Form, Input, message, Row, Col, Statistic } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import organizationService, { Organization, OrganizationApprovalRequest, PageResponse } from '@/services/organizationService';

// 使用后端Organization接口，避免重复定义
type OrganizationApplication = Organization;

const OrganizationApplications: React.FC = () => {
  const [pageData, setPageData] = useState<PageResponse<OrganizationApplication>>({
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  });
  const [loading, setLoading] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<OrganizationApplication | null>(null);
  const [approvalType, setApprovalType] = useState<'approve' | 'reject'>('approve');
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({ pending: 0, total: 0 });

  useEffect(() => {
    loadApplications();
    loadStatistics();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      // 获取状态为PENDING的机构申请
      const data = await organizationService.getOrganizations({
        status: 'PENDING',
        page: pageData.page,
        size: pageData.size,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      setPageData(data);
    } catch (error) {
      message.error('加载申请列表失败');
      console.error('Load applications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await organizationService.getOrganizationStatistics();
      setStatistics({
        pending: stats.pendingCount || 0,
        total: stats.totalCount || 0
      });
    } catch (error) {
      console.error('Load statistics error:', error);
    }
  };

  const handleApproval = (application: OrganizationApplication, type: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setApprovalType(type);
    setApprovalModalVisible(true);
    form.resetFields();
  };

  const handleApprovalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!selectedApplication) {
        message.error('未选择机构');
        return;
      }

      const approvalData: OrganizationApprovalRequest = {
        remark: values.remark,
        membershipFee: values.membershipFee ? Number(values.membershipFee) : undefined
      };

      if (approvalType === 'approve') {
        await organizationService.approveOrganization(selectedApplication.id, approvalData);
      } else {
        await organizationService.rejectOrganization(selectedApplication.id, approvalData);
      }

      setApprovalModalVisible(false);
      loadApplications();
      loadStatistics(); // 更新统计数据
    } catch (error) {
      message.error('审核操作失败');
      console.error('Approval error:', error);
    }
  };

  const columns: ColumnsType<OrganizationApplication> = [
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
    },
    {
      title: '机构类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: 120,
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
      width: 130,
    },
    {
      title: '申请方式',
      dataIndex: 'registrationType',
      key: 'registrationType',
      width: 100,
      render: (type) => (
        <Tag color={type === 'ONLINE' ? 'blue' : 'green'}>
          {type === 'ONLINE' ? '线上' : '线下'}
        </Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'statusName',
      key: 'statusName',
      width: 80,
      render: (status) => (
        <Tag color="orange">{status}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
           
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<CheckOutlined />}
           
            onClick={() => handleApproval(record, 'approve')}
          >
            通过
          </Button>
          <Button
            type="link"
            danger
            icon={<CloseOutlined />}
           
            onClick={() => handleApproval(record, 'reject')}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: any) => {
    setPageData(prev => ({
      ...prev,
      page: pagination.current - 1,
      size: pagination.pageSize
    }));
    // Note: In real implementation, this would trigger loadApplications with new params
  };

  return (
    <div>
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核申请"
              value={statistics.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总机构数"
              value={statistics.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="入驻申请管理" bordered={false}>
        <Table
          columns={columns}
          dataSource={pageData.content}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: pageData.page + 1,
            pageSize: pageData.size,
            total: pageData.totalElements,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>

      <Modal
        title={approvalType === 'approve' ? '审核通过' : '审核拒绝'}
        open={approvalModalVisible}
        onOk={handleApprovalSubmit}
        onCancel={() => setApprovalModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: 16 }}>
            <strong>机构信息：</strong>
            <p>{selectedApplication?.orgName} ({selectedApplication?.orgCode})</p>
          </div>
          
          {approvalType === 'approve' && selectedApplication?.type && 
           ['LAW_FIRM', 'MEDIATION_CENTER', 'DISPOSAL_COMPANY'].includes(selectedApplication.type) && (
            <Form.Item
              label="会员费用"
              name="membershipFee"
              rules={[{ required: true, message: '请输入会员费用' }]}
            >
              <Input type="number" placeholder="请输入会员费用" addonAfter="元" />
            </Form.Item>
          )}
          
          <Form.Item
            label="审核备注"
            name="remark"
            rules={[{ required: true, message: '请输入审核备注' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入审核备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationApplications;