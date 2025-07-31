import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Tag, Row, Col, Statistic, Select, DatePicker,
  Badge, Modal, Form, Input, Upload, message, Tabs, Descriptions, Timeline,
  Alert, Tooltip, Progress, Rate, Divider
} from 'antd';
import {
  EyeOutlined, CheckOutlined, CloseOutlined, SearchOutlined,
  ReloadOutlined, DownloadOutlined, FileTextOutlined, AuditOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined, UserOutlined,
  BankOutlined, TeamOutlined, SafetyCertificateOutlined, UploadOutlined,
  PhoneOutlined, MailOutlined, EditOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { Line, Column } from '@ant-design/plots';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// 审核申请接口定义
interface AuditApplication {
  id: number;
  orgCode: string;
  orgName: string;
  orgType: 'SOURCE' | 'DISPOSAL';
  orgTypeName: string;
  subType: string;
  applicant: string;
  phone: string;
  email: string;
  applyDate: string;
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT';
  statusName: string;
  reviewer: string;
  reviewDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  businessLicense: string;
  registeredCapital: number;
  address: string;
  completionRate: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  documents: Array<{
    name: string;
    type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    url: string;
  }>;
}

// 审核统计数据
interface AuditStats {
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  totalThisMonth: number;
  avgProcessTime: number;
  approvalRate: number;
  dailyApplications: Array<{
    date: string;
    applications: number;
    approvals: number;
  }>;
  typeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  reviewerWorkload: Array<{
    reviewer: string;
    pending: number;
    completed: number;
    avgTime: number;
  }>;
}

const OrgAuditCenter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<AuditApplication[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    orgType: 'all',
    priority: 'all',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null
  });
  
  // 模态框状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AuditApplication | null>(null);
  const [auditForm] = Form.useForm();

  useEffect(() => {
    loadApplications();
    loadAuditStats();
  }, [filters]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: AuditApplication[] = [
        {
          id: 1,
          orgCode: 'PENDING_001',
          orgName: '深圳市创新科技小贷公司',
          orgType: 'SOURCE',
          orgTypeName: '案源机构',
          subType: '小贷公司',
          applicant: '李总经理',
          phone: '13800138001',
          email: 'li@cxkj.com',
          applyDate: '2024-07-28 10:30:00',
          status: 'PENDING',
          statusName: '待审核',
          reviewer: '',
          reviewDate: '',
          priority: 'HIGH',
          businessLicense: '91440300MA5DA123X',
          registeredCapital: 5000,
          address: '深圳市南山区科技园南区',
          completionRate: 85,
          riskLevel: 'LOW',
          documents: [
            { name: '营业执照', type: 'LICENSE', status: 'PENDING', url: '/files/license1.pdf' },
            { name: '金融许可证', type: 'PERMIT', status: 'PENDING', url: '/files/permit1.pdf' },
            { name: '法人身份证', type: 'ID', status: 'APPROVED', url: '/files/id1.pdf' }
          ]
        },
        {
          id: 2,
          orgCode: 'PENDING_002',
          orgName: '北京德和律师事务所',
          orgType: 'DISPOSAL',
          orgTypeName: '处置机构',
          subType: '律师事务所',
          applicant: '王律师',
          phone: '13800138002',
          email: 'wang@dehelaw.com',
          applyDate: '2024-07-27 14:20:00',
          status: 'REVIEWING',
          statusName: '审核中',
          reviewer: '审核员张三',
          reviewDate: '2024-07-28 09:00:00',
          priority: 'MEDIUM',
          businessLicense: '91110000MA001456Y',
          registeredCapital: 1000,
          address: '北京市朝阳区建国门外大街',
          completionRate: 92,
          riskLevel: 'LOW',
          documents: [
            { name: '营业执照', type: 'LICENSE', status: 'APPROVED', url: '/files/license2.pdf' },
            { name: '律师事务所执业许可证', type: 'PERMIT', status: 'APPROVED', url: '/files/permit2.pdf' },
            { name: '主任律师执业证', type: 'QUALIFICATION', status: 'PENDING', url: '/files/qual2.pdf' }
          ]
        },
        {
          id: 3,
          orgCode: 'PENDING_003',
          orgName: '上海浦东催收服务公司',
          orgType: 'DISPOSAL',
          orgTypeName: '处置机构',
          subType: '催收机构',
          applicant: '刘经理',
          phone: '13800138003',
          email: 'liu@pdcuishou.com',
          applyDate: '2024-07-26 16:45:00',
          status: 'RESUBMIT',
          statusName: '待补充',
          reviewer: '审核员李四',
          reviewDate: '2024-07-27 11:30:00',
          priority: 'LOW',
          businessLicense: '91310115MA1K567Z',
          registeredCapital: 500,
          address: '上海市浦东新区陆家嘴金融区',
          completionRate: 65,
          riskLevel: 'MEDIUM',
          documents: [
            { name: '营业执照', type: 'LICENSE', status: 'APPROVED', url: '/files/license3.pdf' },
            { name: '催收业务许可', type: 'PERMIT', status: 'REJECTED', url: '/files/permit3.pdf' },
            { name: '团队资质证明', type: 'TEAM', status: 'PENDING', url: '/files/team3.pdf' }
          ]
        }
      ];
      
      setApplications(mockData);
    } catch (error) {
      console.error('加载申请列表失败:', error);
      message.error('加载申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditStats = async () => {
    try {
      // 模拟API调用
      const mockStats: AuditStats = {
        pending: 23,
        reviewing: 15,
        approved: 187,
        rejected: 12,
        totalThisMonth: 45,
        avgProcessTime: 2.5,
        approvalRate: 89.2,
        dailyApplications: [
          { date: '2024-07-21', applications: 8, approvals: 6 },
          { date: '2024-07-22', applications: 12, approvals: 9 },
          { date: '2024-07-23', applications: 6, approvals: 5 },
          { date: '2024-07-24', applications: 15, approvals: 12 },
          { date: '2024-07-25', applications: 9, approvals: 8 },
          { date: '2024-07-26', applications: 11, approvals: 10 },
          { date: '2024-07-27', applications: 7, approvals: 6 }
        ],
        typeDistribution: [
          { type: '银行', count: 45, percentage: 35.2 },
          { type: '小贷公司', count: 38, percentage: 29.7 },
          { type: '律师事务所', count: 28, percentage: 21.9 },
          { type: '催收机构', count: 17, percentage: 13.2 }
        ],
        reviewerWorkload: [
          { reviewer: '审核员张三', pending: 8, completed: 23, avgTime: 2.1 },
          { reviewer: '审核员李四', pending: 6, completed: 28, avgTime: 2.3 },
          { reviewer: '审核员王五', pending: 9, completed: 19, avgTime: 2.8 }
        ]
      };
      
      setAuditStats(mockStats);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const handleViewDetail = (record: AuditApplication) => {
    setSelectedApplication(record);
    setDetailModalVisible(true);
  };

  const handleAudit = (record: AuditApplication) => {
    setSelectedApplication(record);
    setAuditModalVisible(true);
  };

  const handleAuditSubmit = async () => {
    try {
      const values = await auditForm.validateFields();
      // API调用
      message.success('审核操作成功');
      setAuditModalVisible(false);
      auditForm.resetFields();
      loadApplications();
    } catch (error) {
      message.error('审核操作失败');
    }
  };

  const handleBatchApprove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要批量审核的申请');
      return;
    }
    Modal.confirm({
      title: '批量通过审核',
      content: `确定要批量通过选中的 ${selectedRowKeys.length} 个申请吗？`,
      onOk: () => {
        message.success('批量审核成功');
        setSelectedRowKeys([]);
        loadApplications();
      }
    });
  };

  const handleExport = () => {
    message.success('导出功能开发中...');
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'orange',
      'REVIEWING': 'blue',
      'APPROVED': 'green',
      'REJECTED': 'red',
      'RESUBMIT': 'purple'
    };
    return statusMap[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'HIGH': 'red',
      'MEDIUM': 'orange',
      'LOW': 'green'
    };
    return priorityMap[priority] || 'default';
  };

  const getRiskLevelColor = (riskLevel: string) => {
    const riskMap: Record<string, string> = {
      'LOW': 'green',
      'MEDIUM': 'orange',
      'HIGH': 'red'
    };
    return riskMap[riskLevel] || 'default';
  };

  const columns: ColumnsType<AuditApplication> = [
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
      render: (text: string, record: AuditApplication) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.orgCode} | {record.subType}
          </div>
        </div>
      ),
    },
    {
      title: '机构类型',
      dataIndex: 'orgTypeName',
      key: 'orgTypeName',
      width: 100,
      render: (text: string, record: AuditApplication) => (
        <Tag color={record.orgType === 'SOURCE' ? 'blue' : 'green'}>
          {text}
        </Tag>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 120,
      render: (text: string, record: AuditApplication) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <PhoneOutlined /> {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'applyDate',
      key: 'applyDate',
      width: 150,
      render: (text: string) => (
        <div>
          <div>{dayjs(text).format('MM-DD HH:mm')}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {dayjs(text).fromNow()}
          </div>
        </div>
      ),
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: AuditApplication) => (
        <div>
          <Tag color={getStatusColor(status)}>{record.statusName}</Tag>
          {record.reviewer && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {record.reviewer}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '完成度',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 100,
      render: (rate: number) => (
        <div>
          <Progress 
            percent={rate} 
           
            strokeColor={rate >= 90 ? '#52c41a' : rate >= 70 ? '#faad14' : '#ff4d4f'}
          />
          <div style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            {rate}%
          </div>
        </div>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'HIGH' ? '高' : priority === 'MEDIUM' ? '中' : '低'}
        </Tag>
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 80,
      render: (riskLevel: string) => (
        <Tag color={getRiskLevelColor(riskLevel)}>
          {riskLevel === 'HIGH' ? '高风险' : riskLevel === 'MEDIUM' ? '中风险' : '低风险'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record: AuditApplication) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {record.status === 'PENDING' || record.status === 'REVIEWING' ? (
            <Button 
              type="link" 
              icon={<AuditOutlined />} 
              onClick={() => handleAudit(record)}
            >
              审核
            </Button>
          ) : null}
          {record.status === 'RESUBMIT' && (
            <Button type="link" icon={<EditOutlined />}>
              协助完善
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 每日申请趋势图配置
  const dailyTrendConfig = {
    data: auditStats?.dailyApplications || [],
    xField: 'date',
    yField: 'applications',
    height: 200,
    point: { size: 5, shape: 'diamond' },
    color: '#1890ff',
  };

  // 机构类型分布图配置
  const typeDistributionConfig = {
    data: auditStats?.typeDistribution || [],
    xField: 'type',
    yField: 'count',
    height: 200,
    color: '#52c41a',
    label: {
      position: 'middle' as const,
      style: { fill: '#FFFFFF', opacity: 0.6 },
    },
  };

  return (
    <div className="org-audit-center">
      <Card title="机构审核中心" bordered={false}>
        {/* 统计概览 */}
        {auditStats && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={4}>
              <Card>
                <Statistic
                  title="待审核"
                  value={auditStats.pending}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="审核中"
                  value={auditStats.reviewing}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<AuditOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="本月通过"
                  value={auditStats.approved}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="本月拒绝"
                  value={auditStats.rejected}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<CloseOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="平均处理时间"
                  value={auditStats.avgProcessTime}
                  precision={1}
                  suffix="天"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="通过率"
                  value={auditStats.approvalRate}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%' }}
              placeholder="审核状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="PENDING">待审核</Option>
              <Option value="REVIEWING">审核中</Option>
              <Option value="APPROVED">已通过</Option>
              <Option value="REJECTED">已拒绝</Option>
              <Option value="RESUBMIT">待补充</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={filters.orgType}
              onChange={(value) => setFilters({ ...filters, orgType: value })}
              style={{ width: '100%' }}
              placeholder="机构类型"
            >
              <Option value="all">全部类型</Option>
              <Option value="SOURCE">案源机构</Option>
              <Option value="DISPOSAL">处置机构</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={filters.priority}
              onChange={(value) => setFilters({ ...filters, priority: value })}
              style={{ width: '100%' }}
              placeholder="优先级"
            >
              <Option value="all">全部优先级</Option>
              <Option value="HIGH">高优先级</Option>
              <Option value="MEDIUM">中优先级</Option>
              <Option value="LOW">低优先级</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates as [any, any] | null })}
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col span={6}>
            <Space>
              <Button icon={<SearchOutlined />} type="primary">
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadApplications}>
                刷新
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 批量操作 */}
        {selectedRowKeys.length > 0 && (
          <Alert
            message={
              <Space>
                <span>已选择 {selectedRowKeys.length} 项</span>
                <Button type="link" onClick={handleBatchApprove}>
                  批量通过
                </Button>
                <Button type="link" onClick={() => setSelectedRowKeys([])}>
                  取消选择
                </Button>
              </Space>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 申请列表 */}
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: record.status === 'APPROVED' || record.status === 'REJECTED',
            }),
          }}
          pagination={{
            total: applications.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 详情查看弹窗 */}
      <Modal
        title="申请详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApplication && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="机构名称">{selectedApplication.orgName}</Descriptions.Item>
                <Descriptions.Item label="机构代码">{selectedApplication.orgCode}</Descriptions.Item>
                <Descriptions.Item label="机构类型">{selectedApplication.orgTypeName}</Descriptions.Item>
                <Descriptions.Item label="子类型">{selectedApplication.subType}</Descriptions.Item>
                <Descriptions.Item label="申请人">{selectedApplication.applicant}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{selectedApplication.phone}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{selectedApplication.email}</Descriptions.Item>
                <Descriptions.Item label="营业执照">{selectedApplication.businessLicense}</Descriptions.Item>
                <Descriptions.Item label="注册资本">{selectedApplication.registeredCapital}万元</Descriptions.Item>
                <Descriptions.Item label="注册地址" span={2}>{selectedApplication.address}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="审核状态" key="status">
              <div>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="当前状态"
                        value={selectedApplication.statusName}
                        valueStyle={{ color: getStatusColor(selectedApplication.status) }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="完成度"
                        value={selectedApplication.completionRate}
                        suffix="%"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="风险等级"
                        value={selectedApplication.riskLevel}
                        valueStyle={{ color: getRiskLevelColor(selectedApplication.riskLevel) }}
                      />
                    </Card>
                  </Col>
                </Row>
                
                {selectedApplication.reviewer && (
                  <Descriptions bordered>
                    <Descriptions.Item label="审核员">{selectedApplication.reviewer}</Descriptions.Item>
                    <Descriptions.Item label="审核时间">{selectedApplication.reviewDate}</Descriptions.Item>
                  </Descriptions>
                )}
              </div>
            </TabPane>
            
            <TabPane tab="提交文件" key="documents">
              <Table
                dataSource={selectedApplication.documents}
                rowKey="name"
               
                pagination={false}
                columns={[
                  { title: '文件名称', dataIndex: 'name', key: 'name' },
                  { title: '文件类型', dataIndex: 'type', key: 'type' },
                  { 
                    title: '审核状态', 
                    dataIndex: 'status', 
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={getStatusColor(status)}>
                        {status === 'PENDING' ? '待审核' : status === 'APPROVED' ? '已通过' : '已拒绝'}
                      </Tag>
                    )
                  },
                  { 
                    title: '操作', 
                    key: 'action',
                    render: (_, record) => (
                      <Button type="link" icon={<EyeOutlined />}>
                        查看
                      </Button>
                    )
                  },
                ]}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 审核操作弹窗 */}
      <Modal
        title="审核操作"
        open={auditModalVisible}
        onOk={handleAuditSubmit}
        onCancel={() => {
          setAuditModalVisible(false);
          auditForm.resetFields();
        }}
        width={600}
      >
        <Form form={auditForm} layout="vertical">
          <Form.Item
            label="审核结果"
            name="result"
            rules={[{ required: true, message: '请选择审核结果' }]}
          >
            <Select placeholder="请选择审核结果">
              <Option value="APPROVED">通过</Option>
              <Option value="REJECTED">拒绝</Option>
              <Option value="RESUBMIT">要求补充材料</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="审核意见"
            name="comments"
            rules={[{ required: true, message: '请输入审核意见' }]}
          >
            <TextArea rows={4} placeholder="请输入审核意见..." />
          </Form.Item>
          
          <Form.Item
            label="补充要求"
            name="requirements"
            dependencies={['result']}
            rules={[
              ({ getFieldValue }) => ({
                required: getFieldValue('result') === 'RESUBMIT',
                message: '请输入补充要求',
              }),
            ]}
          >
            <TextArea rows={3} placeholder="需要补充的材料和信息..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrgAuditCenter;