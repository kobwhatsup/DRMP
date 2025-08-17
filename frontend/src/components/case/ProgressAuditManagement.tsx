import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Alert,
  Typography,
  Row,
  Col,
  Tabs,
  Badge,
  Avatar,
  Tooltip,
  Drawer,
  Descriptions,
  Timeline,
  Rate,
  Progress,
  Statistic,
  Divider,
  List,
  Empty,
  Spin,
  Popconfirm,
  Transfer,
  Switch
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  MessageOutlined,
  UserOutlined,
  AuditOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PrinterOutlined,
  StarOutlined,
  FlagOutlined,
  TeamOutlined,
  FileTextOutlined,
  CommentOutlined,
  LikeOutlined,
  DislikeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface ProgressAuditItem {
  id: string;
  caseId: string;
  caseNo: string;
  debtorName: string;
  progressId: string;
  progressType: string;
  progressTitle: string;
  progressDescription: string;
  progressResult?: string;
  amount?: number;
  submittedBy: string;
  submittedAt: string;
  auditStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  auditedBy?: string;
  auditedAt?: string;
  auditComment?: string;
  auditScore?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  attachments?: string[];
  tags?: string[];
  relatedRecords?: string[];
  compliance?: {
    regulatoryCompliant: boolean;
    dataAccurate: boolean;
    procedureFollowed: boolean;
  };
}

interface AuditStatistics {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalReturned: number;
  avgAuditTime: number;
  approvalRate: number;
  riskDistribution: Record<string, number>;
  auditBacklog: number;
}

interface ProgressAuditManagementProps {
  organizationId?: string;
  auditorId?: string;
  onAuditComplete?: (auditItem: ProgressAuditItem) => void;
}

const ProgressAuditManagement: React.FC<ProgressAuditManagementProps> = ({
  organizationId,
  auditorId,
  onAuditComplete
}) => {
  const [auditItems, setAuditItems] = useState<ProgressAuditItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ProgressAuditItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('pending');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<AuditStatistics>({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalReturned: 0,
    avgAuditTime: 0,
    approvalRate: 0,
    riskDistribution: {},
    auditBacklog: 0
  });

  // 抽屉和弹窗状态
  const [auditDrawerVisible, setAuditDrawerVisible] = useState(false);
  const [batchAuditModalVisible, setBatchAuditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedAuditItem, setSelectedAuditItem] = useState<ProgressAuditItem | null>(null);

  const [auditForm] = Form.useForm();
  const [batchAuditForm] = Form.useForm();

  // 状态配置
  const statusConfig = {
    PENDING: { label: '待审核', color: 'orange', icon: <ClockCircleOutlined /> },
    APPROVED: { label: '已通过', color: 'green', icon: <CheckCircleOutlined /> },
    REJECTED: { label: '已拒绝', color: 'red', icon: <CloseCircleOutlined /> },
    RETURNED: { label: '已退回', color: 'blue', icon: <EditOutlined /> }
  };

  // 优先级配置
  const priorityConfig = {
    HIGH: { label: '高', color: 'red' },
    MEDIUM: { label: '中', color: 'orange' },
    LOW: { label: '低', color: 'green' }
  };

  // 风险等级配置
  const riskConfig = {
    HIGH: { label: '高风险', color: 'red' },
    MEDIUM: { label: '中风险', color: 'orange' },
    LOW: { label: '低风险', color: 'green' }
  };

  useEffect(() => {
    loadAuditItems();
  }, [currentTab]);

  useEffect(() => {
    calculateStatistics();
  }, [auditItems]);

  const loadAuditItems = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: ProgressAuditItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `AUDIT${(i + 1).toString().padStart(4, '0')}`,
        caseId: `CASE${(i + 1).toString().padStart(6, '0')}`,
        caseNo: `2024${(i + 1).toString().padStart(6, '0')}`,
        debtorName: `债务人${i + 1}`,
        progressId: `PROG${(i + 1).toString().padStart(6, '0')}`,
        progressType: ['CONTACT', 'PAYMENT', 'VISIT', 'NEGOTIATION'][Math.floor(Math.random() * 4)],
        progressTitle: ['电话联系', '还款记录', '上门外访', '协商谈判'][Math.floor(Math.random() * 4)],
        progressDescription: `这是第${i + 1}条进度记录的详细描述，包含了处理过程和相关信息。`,
        progressResult: Math.random() > 0.3 ? `处理结果${i + 1}` : undefined,
        amount: Math.random() > 0.5 ? Math.floor(Math.random() * 100000) + 1000 : undefined,
        submittedBy: ['张三', '李四', '王五'][Math.floor(Math.random() * 3)],
        submittedAt: moment().subtract(Math.floor(Math.random() * 10), 'days').toISOString(),
        auditStatus: ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED'][Math.floor(Math.random() * 4)] as any,
        priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] as any,
        riskLevel: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] as any,
        tags: ['重要', '紧急', '风险'].slice(0, Math.floor(Math.random() * 3) + 1),
        compliance: {
          regulatoryCompliant: Math.random() > 0.2,
          dataAccurate: Math.random() > 0.1,
          procedureFollowed: Math.random() > 0.15
        }
      }));

      // 根据当前标签页过滤数据
      const filtered = mockData.filter(item => {
        if (currentTab === 'pending') return item.auditStatus === 'PENDING';
        if (currentTab === 'approved') return item.auditStatus === 'APPROVED';
        if (currentTab === 'rejected') return item.auditStatus === 'REJECTED';
        if (currentTab === 'returned') return item.auditStatus === 'RETURNED';
        return true;
      });

      setAuditItems(mockData);
      setFilteredItems(filtered);
    } catch (error) {
      message.error('加载审核数据失败');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = () => {
    const pending = auditItems.filter(item => item.auditStatus === 'PENDING').length;
    const approved = auditItems.filter(item => item.auditStatus === 'APPROVED').length;
    const rejected = auditItems.filter(item => item.auditStatus === 'REJECTED').length;
    const returned = auditItems.filter(item => item.auditStatus === 'RETURNED').length;
    const total = auditItems.length;

    const riskDistribution = auditItems.reduce((acc, item) => {
      acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStatistics({
      totalPending: pending,
      totalApproved: approved,
      totalRejected: rejected,
      totalReturned: returned,
      avgAuditTime: 2.5, // 模拟平均审核时间（小时）
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
      riskDistribution,
      auditBacklog: pending
    });
  };

  // 表格列定义
  const columns: ColumnsType<ProgressAuditItem> = [
    {
      title: '案件编号',
      dataIndex: 'caseNo',
      key: 'caseNo',
      width: 120,
      render: (text: string, record: ProgressAuditItem) => (
        <Button 
          type="link" 
          onClick={() => handleViewDetail(record)}
        >
          {text}
        </Button>
      )
    },
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName',
      width: 100
    },
    {
      title: '进度信息',
      key: 'progressInfo',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.progressTitle}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.progressDescription.length > 50 
              ? `${record.progressDescription.substring(0, 50)}...`
              : record.progressDescription
            }
          </Text>
          {record.amount && (
            <Text type="success">¥{record.amount.toLocaleString()}</Text>
          )}
        </Space>
      )
    },
    {
      title: '提交人',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      width: 100,
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{name}</Text>
        </Space>
      )
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 150,
      render: (time: string) => (
        <Tooltip title={moment(time).format('YYYY-MM-DD HH:mm:ss')}>
          <Text type="secondary">{moment(time).fromNow()}</Text>
        </Tooltip>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={priorityConfig[priority as keyof typeof priorityConfig]?.color}>
          {priorityConfig[priority as keyof typeof priorityConfig]?.label}
        </Tag>
      )
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (risk: string) => (
        <Tag color={riskConfig[risk as keyof typeof riskConfig]?.color}>
          {riskConfig[risk as keyof typeof riskConfig]?.label}
        </Tag>
      )
    },
    {
      title: '合规检查',
      key: 'compliance',
      width: 120,
      render: (_, record) => {
        const { regulatoryCompliant, dataAccurate, procedureFollowed } = record.compliance!;
        const passCount = [regulatoryCompliant, dataAccurate, procedureFollowed].filter(Boolean).length;
        const color = passCount === 3 ? 'green' : passCount >= 2 ? 'orange' : 'red';
        return (
          <Tag color={color}>
            {passCount}/3 通过
          </Tag>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      width: 100,
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config?.color} icon={config?.icon}>
            {config?.label}
          </Tag>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.auditStatus === 'PENDING' && (
            <Tooltip title="审核">
              <Button 
                type="link" 
                icon={<AuditOutlined />} 
                onClick={() => handleAudit(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="历史记录">
            <Button 
              type="link" 
              icon={<HistoryOutlined />} 
              onClick={() => handleViewHistory(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 处理审核
  const handleAudit = (item: ProgressAuditItem) => {
    setSelectedAuditItem(item);
    auditForm.resetFields();
    setAuditDrawerVisible(true);
  };

  // 提交审核
  const handleSubmitAudit = async () => {
    try {
      const values = await auditForm.validateFields();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新审核状态
      const updatedItem: ProgressAuditItem = {
        ...selectedAuditItem!,
        auditStatus: values.decision,
        auditedBy: '当前审核员',
        auditedAt: moment().toISOString(),
        auditComment: values.comment,
        auditScore: values.score
      };

      setAuditItems(prev => prev.map(item => 
        item.id === selectedAuditItem!.id ? updatedItem : item
      ));

      message.success('审核完成');
      setAuditDrawerVisible(false);
      
      if (onAuditComplete) {
        onAuditComplete(updatedItem);
      }
      
      // 重新加载数据
      loadAuditItems();
    } catch (error) {
      message.error('审核失败');
    }
  };

  // 批量审核
  const handleBatchAudit = async () => {
    if (selectedItems.length === 0) {
      message.warning('请选择要审核的项目');
      return;
    }

    try {
      const values = await batchAuditForm.validateFields();
      
      // 模拟批量审核
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAuditItems(prev => prev.map(item => 
        selectedItems.includes(item.id) ? {
          ...item,
          auditStatus: values.decision,
          auditedBy: '当前审核员',
          auditedAt: moment().toISOString(),
          auditComment: values.comment
        } : item
      ));

      message.success(`批量审核完成，处理了 ${selectedItems.length} 个项目`);
      setBatchAuditModalVisible(false);
      setSelectedItems([]);
      batchAuditForm.resetFields();
      
      // 重新加载数据
      loadAuditItems();
    } catch (error) {
      message.error('批量审核失败');
    }
  };

  // 查看详情
  const handleViewDetail = (item: ProgressAuditItem) => {
    setSelectedAuditItem(item);
    setDetailDrawerVisible(true);
  };

  // 查看历史
  const handleViewHistory = (item: ProgressAuditItem) => {
    message.info(`查看 ${item.caseNo} 的审核历史`);
  };

  // 导出审核报告
  const handleExportReport = () => {
    message.info('正在导出审核报告...');
  };

  return (
    <div className="progress-audit-management">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={statistics.totalPending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="审核通过率"
              value={statistics.approvalRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均审核时间"
              value={statistics.avgAuditTime}
              precision={1}
              suffix="小时"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="审核积压"
              value={statistics.auditBacklog}
              valueStyle={{ color: statistics.auditBacklog > 10 ? '#ff4d4f' : '#52c41a' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4}>进度审核管理</Title>
          </Col>
          <Col>
            <Space>
              {selectedItems.length > 0 && (
                <Button
                  type="primary"
                  icon={<AuditOutlined />}
                  onClick={() => setBatchAuditModalVisible(true)}
                >
                  批量审核 ({selectedItems.length})
                </Button>
              )}
              <Button icon={<DownloadOutlined />} onClick={handleExportReport}>
                导出报告
              </Button>
              <Button icon={<FilterOutlined />}>
                筛选
              </Button>
            </Space>
          </Col>
        </Row>

        <Tabs 
          activeKey={currentTab} 
          onChange={setCurrentTab}
          style={{ marginBottom: 16 }}
        >
          <TabPane 
            tab={
              <Badge count={statistics.totalPending}>
                <span>待审核</span>
              </Badge>
            } 
            key="pending" 
          />
          <TabPane 
            tab={
              <Badge count={statistics.totalApproved} style={{ backgroundColor: '#52c41a' }}>
                <span>已通过</span>
              </Badge>
            } 
            key="approved" 
          />
          <TabPane 
            tab={
              <Badge count={statistics.totalRejected} style={{ backgroundColor: '#ff4d4f' }}>
                <span>已拒绝</span>
              </Badge>
            } 
            key="rejected" 
          />
          <TabPane 
            tab={
              <Badge count={statistics.totalReturned} style={{ backgroundColor: '#1890ff' }}>
                <span>已退回</span>
              </Badge>
            } 
            key="returned" 
          />
          <TabPane tab="全部" key="all" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys: selectedItems,
            onChange: (keys) => setSelectedItems(keys.map(String)),
            getCheckboxProps: (record) => ({
              disabled: record.auditStatus !== 'PENDING'
            })
          }}
          pagination={{
            total: filteredItems.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 审核抽屉 */}
      <Drawer
        title={`审核进度记录 - ${selectedAuditItem?.caseNo}`}
        placement="right"
        width={600}
        visible={auditDrawerVisible}
        onClose={() => setAuditDrawerVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setAuditDrawerVisible(false)}>
              取消
            </Button>
            <Button type="primary" onClick={handleSubmitAudit}>
              提交审核
            </Button>
          </Space>
        }
      >
        {selectedAuditItem && (
          <div>
            {/* 进度信息 */}
            <Card title="进度信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="进度类型">
                  {selectedAuditItem.progressType}
                </Descriptions.Item>
                <Descriptions.Item label="标题">
                  {selectedAuditItem.progressTitle}
                </Descriptions.Item>
                <Descriptions.Item label="描述">
                  {selectedAuditItem.progressDescription}
                </Descriptions.Item>
                {selectedAuditItem.progressResult && (
                  <Descriptions.Item label="结果">
                    {selectedAuditItem.progressResult}
                  </Descriptions.Item>
                )}
                {selectedAuditItem.amount && (
                  <Descriptions.Item label="金额">
                    ¥{selectedAuditItem.amount.toLocaleString()}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="提交人">
                  {selectedAuditItem.submittedBy}
                </Descriptions.Item>
                <Descriptions.Item label="提交时间">
                  {moment(selectedAuditItem.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 合规检查 */}
            <Card title="合规检查" size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>监管合规: </Text>
                  <Tag color={selectedAuditItem.compliance?.regulatoryCompliant ? 'green' : 'red'}>
                    {selectedAuditItem.compliance?.regulatoryCompliant ? '通过' : '不通过'}
                  </Tag>
                </div>
                <div>
                  <Text>数据准确: </Text>
                  <Tag color={selectedAuditItem.compliance?.dataAccurate ? 'green' : 'red'}>
                    {selectedAuditItem.compliance?.dataAccurate ? '通过' : '不通过'}
                  </Tag>
                </div>
                <div>
                  <Text>程序规范: </Text>
                  <Tag color={selectedAuditItem.compliance?.procedureFollowed ? 'green' : 'red'}>
                    {selectedAuditItem.compliance?.procedureFollowed ? '通过' : '不通过'}
                  </Tag>
                </div>
              </Space>
            </Card>

            {/* 审核表单 */}
            <Card title="审核意见" size="small">
              <Form
                form={auditForm}
                layout="vertical"
              >
                <Form.Item
                  name="decision"
                  label="审核决定"
                  rules={[{ required: true, message: '请选择审核决定' }]}
                >
                  <Select placeholder="请选择审核决定">
                    <Option value="APPROVED">通过</Option>
                    <Option value="REJECTED">拒绝</Option>
                    <Option value="RETURNED">退回</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="score"
                  label="审核评分"
                >
                  <Rate allowHalf count={5} />
                </Form.Item>
                <Form.Item
                  name="comment"
                  label="审核意见"
                  rules={[{ required: true, message: '请输入审核意见' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="请输入审核意见，说明通过/拒绝/退回的原因"
                  />
                </Form.Item>
              </Form>
            </Card>
          </div>
        )}
      </Drawer>

      {/* 批量审核弹窗 */}
      <Modal
        title={`批量审核 (${selectedItems.length} 项)`}
        visible={batchAuditModalVisible}
        onOk={handleBatchAudit}
        onCancel={() => setBatchAuditModalVisible(false)}
        width={600}
      >
        <Alert
          message={`将对选中的 ${selectedItems.length} 个进度记录执行相同的审核操作`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={batchAuditForm}
          layout="vertical"
        >
          <Form.Item
            name="decision"
            label="审核决定"
            rules={[{ required: true, message: '请选择审核决定' }]}
          >
            <Select placeholder="请选择审核决定">
              <Option value="APPROVED">通过</Option>
              <Option value="REJECTED">拒绝</Option>
              <Option value="RETURNED">退回</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="comment"
            label="批量审核意见"
            rules={[{ required: true, message: '请输入批量审核意见' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入批量审核意见"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="进度详情"
        placement="right"
        width={800}
        visible={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedAuditItem && (
          <div>
            {/* 详情内容 */}
            <Descriptions bordered column={2}>
              <Descriptions.Item label="案件编号">
                {selectedAuditItem.caseNo}
              </Descriptions.Item>
              <Descriptions.Item label="债务人">
                {selectedAuditItem.debtorName}
              </Descriptions.Item>
              <Descriptions.Item label="进度ID">
                {selectedAuditItem.progressId}
              </Descriptions.Item>
              <Descriptions.Item label="进度类型">
                {selectedAuditItem.progressType}
              </Descriptions.Item>
              <Descriptions.Item label="标题" span={2}>
                {selectedAuditItem.progressTitle}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {selectedAuditItem.progressDescription}
              </Descriptions.Item>
              {selectedAuditItem.progressResult && (
                <Descriptions.Item label="结果" span={2}>
                  {selectedAuditItem.progressResult}
                </Descriptions.Item>
              )}
              {selectedAuditItem.amount && (
                <Descriptions.Item label="金额">
                  ¥{selectedAuditItem.amount.toLocaleString()}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="提交人">
                {selectedAuditItem.submittedBy}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {moment(selectedAuditItem.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="审核状态">
                <Tag color={statusConfig[selectedAuditItem.auditStatus].color}>
                  {statusConfig[selectedAuditItem.auditStatus].label}
                </Tag>
              </Descriptions.Item>
              {selectedAuditItem.auditedBy && (
                <Descriptions.Item label="审核人">
                  {selectedAuditItem.auditedBy}
                </Descriptions.Item>
              )}
              {selectedAuditItem.auditedAt && (
                <Descriptions.Item label="审核时间">
                  {moment(selectedAuditItem.auditedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              )}
              {selectedAuditItem.auditComment && (
                <Descriptions.Item label="审核意见" span={2}>
                  {selectedAuditItem.auditComment}
                </Descriptions.Item>
              )}
              {selectedAuditItem.auditScore && (
                <Descriptions.Item label="审核评分">
                  <Rate disabled value={selectedAuditItem.auditScore} />
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProgressAuditManagement;