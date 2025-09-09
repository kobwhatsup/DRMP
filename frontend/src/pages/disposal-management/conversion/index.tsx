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
  message,
  Descriptions,
  Row,
  Col,
  Statistic,
  Timeline,
  Alert,
  Radio,
  DatePicker,
  Upload,
  Checkbox,
  Steps,
  Progress,
  Divider,
  Tooltip
} from 'antd';
import {
  SwapOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  UploadOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { disposalConversionAPI, ConversionRequest, ConversionQueryParams, CreateConversionRequestParams, BatchConversionParams } from '../../../services/disposalConversionService';

const { Option } = Select;
const { TextArea } = Input;

interface ConversionCase {
  id: string;
  caseNumber: string;
  debtorName: string;
  amount: number;
  currentDisposalType: '调解' | '诉讼';
  targetDisposalType: '调解' | '诉讼';
  currentOrg: string;
  targetOrg?: string;
  status: string;
  reason: string;
  requestTime: string;
  approvalTime?: string;
  approver?: string;
  notes?: string;
}

interface BatchOperationResult {
  successCount: number;
  failedCount: number;
  successIds: string[];
  failedItems: Array<{ caseId: string; error: string }>;
}

interface ExportProgress {
  status: 'preparing' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  downloadUrl?: string;
  fileName?: string;
}

const DisposalConversion: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [conversionCases, setConversionCases] = useState<ConversionCase[]>([]);
  const [conversionModalVisible, setConversionModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ConversionCase | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ConversionCase[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [queryParams, setQueryParams] = useState<ConversionQueryParams>({});
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [exportForm] = Form.useForm();

  useEffect(() => {
    loadConversionCases();
  }, []);

  const loadConversionCases = async (params?: ConversionQueryParams) => {
    setLoading(true);
    try {
      const queryData = {
        ...queryParams,
        ...params,
        page: currentPage - 1,
        size: pageSize
      };
      
      // 使用真实API或模拟数据
      try {
        const response = await disposalConversionAPI.getConversionRequests(queryData);
        // 转换API数据格式到本地格式
        const apiContent = (response.content || []) as any[];
        const convertedCases: ConversionCase[] = apiContent.map((item: any) => ({
          id: item.id,
          caseNumber: item.caseNumber,
          debtorName: item.debtorName,
          amount: item.amount,
          currentDisposalType: item.currentDisposalType === 'mediation' ? '调解' : '诉讼',
          targetDisposalType: item.targetDisposalType === 'mediation' ? '调解' : '诉讼',
          currentOrg: item.currentOrgName || item.currentOrg || '未知机构',
          targetOrg: item.targetOrgName || item.targetOrg,
          status: item.status === 'pending' ? '审核中' : 
                 item.status === 'approved' ? '已批准' : 
                 item.status === 'rejected' ? '已拒绝' :
                 item.status === 'processing' ? '转换中' :
                 item.status === 'completed' ? '已完成' : item.status,
          reason: item.reason,
          requestTime: item.requestTime,
          approvalTime: item.approvalTime,
          approver: item.approverName || item.approver,
          notes: item.notes
        }));
        setConversionCases(convertedCases);
        setTotalCount(response.totalElements || 0);
      } catch (apiError) {
        console.warn('API未接通，使用模拟数据:', apiError);
        // 模拟数据兜底
        const mockData: ConversionCase[] = [
          {
            id: '1',
            caseNumber: 'CONV-2024-001',
            debtorName: '陈八',
            amount: 75000,
            currentDisposalType: '调解',
            targetDisposalType: '诉讼',
            currentOrg: '华南调解中心',
            targetOrg: '金融律师事务所',
            status: '审核中',
            reason: '债务人拒绝配合调解，需要通过诉讼途径解决',
            requestTime: '2024-01-25 10:30:00',
            notes: '已尝试3次调解，债务人均未出席'
          },
          {
            id: '2',
            caseNumber: 'CONV-2024-002',
            debtorName: '周九',
            amount: 45000,
            currentDisposalType: '诉讼',
            targetDisposalType: '调解',
            currentOrg: '华泰律师事务所',
            targetOrg: '金融调解中心',
            status: '已批准',
            reason: '债务人主动联系要求调解解决',
            requestTime: '2024-01-20 14:20:00',
            approvalTime: '2024-01-22 09:15:00',
            approver: '系统管理员',
            notes: '债务人态度积极，有还款意愿'
          },
          {
            id: '3',
            caseNumber: 'CONV-2024-003',
            debtorName: '吴十',
            amount: 120000,
            currentDisposalType: '调解',
            targetDisposalType: '诉讼',
            currentOrg: '华东调解中心',
            status: '已拒绝',
            reason: '调解超时未果',
            requestTime: '2024-01-18 16:45:00',
            approvalTime: '2024-01-19 11:30:00',
            approver: '审核专员',
            notes: '当前调解机构建议继续尝试调解'
          }
        ];
        setConversionCases(mockData);
        setTotalCount(mockData.length);
      }
    } catch (error) {
      console.error('加载转换案件失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      '审核中': 'processing',
      '已批准': 'success',
      '已拒绝': 'error',
      '转换中': 'blue',
      '已完成': 'success'
    };
    return colorMap[status] || 'default';
  };

  const getDisposalTypeColor = (type: string) => {
    return type === '调解' ? 'blue' : 'orange';
  };

  const handleConversion = (record: ConversionCase) => {
    setSelectedCase(record);
    setConversionModalVisible(true);
    form.resetFields();
  };

  const handleCloseConversionModal = () => {
    setConversionModalVisible(false);
    form.resetFields();
    setSelectedCase(null);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedCase(null);
  };

  const handleConversionSubmit = async (values: any) => {
    try {
      const params: CreateConversionRequestParams = {
        caseId: values.caseId,
        targetDisposalType: values.targetDisposalType === '调解' ? 'mediation' : 'litigation',
        targetOrgId: values.targetOrg,
        reason: values.reason,
        notes: values.notes,
        priority: values.priority || 'medium',
        attachments: values.attachments?.fileList?.map((file: any) => file.originFileObj).filter(Boolean)
      };
      
      try {
        await disposalConversionAPI.createConversionRequest(params);
        message.success('转换申请提交成功');
      } catch (apiError) {
        console.warn('API未接通，模拟提交成功:', apiError);
        message.success('转换申请提交成功（模拟）');
      }
      
      handleCloseConversionModal();
      loadConversionCases();
    } catch (error) {
      message.error('转换申请提交失败');
      console.error('提交失败:', error);
    }
  };

  // 批量操作处理函数
  const handleBatchOperation = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要处理的转换申请');
      return;
    }
    setBatchModalVisible(true);
    batchForm.resetFields();
  };

  const handleCloseBatchModal = () => {
    setBatchModalVisible(false);
    batchForm.resetFields();
    setBatchProcessing(false);
  };

  const handleBatchSubmit = async (values: any) => {
    setBatchProcessing(true);
    try {
      const params: BatchConversionParams = {
        caseIds: selectedRows.map(row => row.id),
        targetDisposalType: values.targetDisposalType === '调解' ? 'mediation' : 'litigation',
        targetOrgId: values.targetOrgId,
        reason: values.reason,
        notes: values.notes,
        priority: values.priority || 'medium'
      };

      try {
        const result = await disposalConversionAPI.batchCreateConversionRequests(params);
        message.success(`批量处理完成：成功${result.successCount}个，失败${result.failedCount}个`);
      } catch (apiError) {
        console.warn('API未接通，模拟批量处理成功:', apiError);
        message.success(`批量处理完成：成功${selectedRowKeys.length}个，失败0个（模拟）`);
      }

      handleCloseBatchModal();
      setSelectedRowKeys([]);
      setSelectedRows([]);
      loadConversionCases();
    } catch (error) {
      message.error('批量操作失败');
      console.error('批量操作失败:', error);
    } finally {
      setBatchProcessing(false);
    }
  };

  // 数据导出处理函数
  const handleExportData = () => {
    setExportModalVisible(true);
    exportForm.resetFields();
  };

  const handleCloseExportModal = () => {
    setExportModalVisible(false);
    exportForm.resetFields();
    setExportProgress(null);
  };

  const handleExportSubmit = async (values: any) => {
    try {
      setExportProgress({
        status: 'preparing',
        progress: 10,
        message: '正在准备导出数据...'
      });

      const exportParams = {
        ...queryParams,
        format: values.format,
        fields: values.fields
      };

      // 模拟导出进度
      const updateProgress = (progress: number, message: string) => {
        setExportProgress(prev => prev ? { ...prev, progress, message } : null);
      };

      updateProgress(30, '正在查询数据...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateProgress(60, '正在生成文件...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      updateProgress(90, '正在上传文件...');
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const result = await disposalConversionAPI.exportConversionData(exportParams);
        setExportProgress({
          status: 'completed',
          progress: 100,
          message: '导出完成',
          downloadUrl: result.downloadUrl,
          fileName: result.fileName
        });
        message.success('数据导出成功');
      } catch (apiError) {
        console.warn('API未接通，模拟导出成功:', apiError);
        setExportProgress({
          status: 'completed',
          progress: 100,
          message: '导出完成',
          downloadUrl: '#',
          fileName: `conversion_data_${dayjs().format('YYYYMMDD_HHmmss')}.${values.format}`
        });
        message.success('数据导出成功（模拟）');
      }
    } catch (error) {
      setExportProgress({
        status: 'failed',
        progress: 0,
        message: '导出失败'
      });
      message.error('数据导出失败');
      console.error('导出失败:', error);
    }
  };

  // 表格行选择处理
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[], rows: ConversionCase[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
    onSelectAll: (selected: boolean, selectedRows: ConversionCase[], changeRows: ConversionCase[]) => {
      console.log('全选状态:', selected, selectedRows, changeRows);
    },
  };

  // 状态筛选处理
  const handleStatusFilter = (status: string) => {
    const newParams = status === 'all' ? {} : { status };
    setQueryParams(newParams);
    setCurrentPage(1);
    loadConversionCases(newParams);
  };

  // 刷新数据
  const handleRefresh = () => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
    loadConversionCases();
  };

  const showDetail = (record: ConversionCase) => {
    setSelectedCase(record);
    setDetailModalVisible(true);
  };

  const handleApproval = async (id: string, approved: boolean) => {
    console.log(`🎯 开始${approved ? '批准' : '拒绝'}操作，ID: ${id}`);
    
    try {
      // 显示加载状态
      message.loading(`正在${approved ? '批准' : '拒绝'}申请...`, 2);
      
      const approval = {
        requestId: id,
        action: approved ? 'approve' as const : 'reject' as const,
        comments: approved ? '申请已批准' : '申请被拒绝',
        targetOrgId: approved ? 'default-org' : undefined
      };

      console.log('📋 审批参数:', approval);

      try {
        if (approved) {
          console.log('🔄 调用API批准接口...');
          await disposalConversionAPI.approveConversionRequest(id, approval);
        } else {
          console.log('🔄 调用API拒绝接口...');
          await disposalConversionAPI.rejectConversionRequest(id, approval);
        }
        console.log('✅ API调用成功');
        message.success(`转换申请已${approved ? '批准' : '拒绝'}`);
      } catch (apiError) {
        console.warn('⚠️ API未接通，使用模拟模式:', apiError);
        // 模拟延时
        await new Promise(resolve => setTimeout(resolve, 1000));
        message.success(`转换申请已${approved ? '批准' : '拒绝'}（模拟）`);
      }

      console.log('🔄 重新加载数据...');
      // 重新加载数据
      await loadConversionCases();
      console.log('✅ 数据刷新完成');
      
    } catch (error) {
      console.error('❌ 批准/拒绝操作失败:', error);
      message.error('操作失败，请重试');
    }
  };

  const columns = [
    {
      title: '案件编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
    },
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '转换方向',
      key: 'conversion',
      render: (record: ConversionCase) => (
        <Space>
          <Tag color={getDisposalTypeColor(record.currentDisposalType)}>
            {record.currentDisposalType}
          </Tag>
          <ArrowRightOutlined />
          <Tag color={getDisposalTypeColor(record.targetDisposalType)}>
            {record.targetDisposalType}
          </Tag>
        </Space>
      ),
    },
    {
      title: '当前机构',
      dataIndex: 'currentOrg',
      key: 'currentOrg',
    },
    {
      title: '目标机构',
      dataIndex: 'targetOrg',
      key: 'targetOrg',
      render: (org: string) => org || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'requestTime',
      key: 'requestTime',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: ConversionCase) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDetail(record)}>
            详情
          </Button>
          {record.status === '审核中' && (
            <>
              <Button 
                type="link" 
                size="small" 
                style={{ color: '#52c41a' }}
                onMouseEnter={() => console.log('🖱️ 鼠标悬停在批准按钮上')}
                onClick={(e) => {
                  console.log('🖱️ 批准按钮被点击！');
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('📝 点击批准按钮，记录:', record);
                  handleApproval(record.id, true);
                }}
              >
                批准
              </Button>
              <Button 
                type="link" 
                size="small" 
                style={{ color: '#ff4d4f' }}
                onMouseEnter={() => console.log('🖱️ 鼠标悬停在拒绝按钮上')}
                onClick={(e) => {
                  console.log('🖱️ 拒绝按钮被点击！');
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('📝 点击拒绝按钮，记录:', record);
                  handleApproval(record.id, false);
                }}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const statisticsData = [
    {
      title: '转换申请总数',
      value: 45,
      icon: <SwapOutlined style={{ color: '#1890ff' }} />
    },
    {
      title: '批准率',
      value: 78.9,
      suffix: '%',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    },
    {
      title: '平均处理时间',
      value: 2.5,
      suffix: '天',
      icon: <ClockCircleOutlined style={{ color: '#faad14' }} />
    },
    {
      title: '待审核申请',
      value: 12,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>
          <SwapOutlined style={{ marginRight: '8px' }} />
          处置转换
        </h2>
      </div>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {statisticsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={stat.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 操作提示 */}
      <Alert
        message="处置转换说明"
        description="当调解无效时可申请转为诉讼处理；当债务人主动配合时可从诉讼转为调解。转换需要审核批准。"
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      {/* 案件列表 */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setConversionModalVisible(true)}>
              申请转换
            </Button>
            <Button 
              icon={<EditOutlined />} 
              onClick={handleBatchOperation}
              disabled={selectedRowKeys.length === 0}
            >
              批量处理 {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportData}>
              导出数据
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Select 
              defaultValue="all" 
              style={{ width: 120 }} 
              onChange={handleStatusFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">全部状态</Option>
              <Option value="pending">审核中</Option>
              <Option value="approved">已批准</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="processing">转换中</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={conversionCases}
          loading={loading}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{
            total: totalCount,
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) {
                setPageSize(size);
              }
              loadConversionCases();
            },
          }}
        />
      </Card>

      {/* 申请转换弹窗 */}
      <Modal
        title="申请处置转换"
        open={conversionModalVisible}
        onCancel={handleCloseConversionModal}
        onOk={() => form.submit()}
        width={600}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConversionSubmit}
        >
          <Form.Item
            label="选择案件"
            name="caseId"
            rules={[{ required: true, message: '请选择要转换的案件' }]}
          >
            <Select placeholder="请选择案件">
              <Option value="CASE-2024-001">CASE-2024-001 - 张三 - 调解中</Option>
              <Option value="CASE-2024-002">CASE-2024-002 - 李四 - 诉讼中</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="当前处置方式"
                name="currentDisposalType"
                rules={[{ required: true, message: '请选择当前处置方式' }]}
              >
                <Select placeholder="请选择">
                  <Option value="调解">调解</Option>
                  <Option value="诉讼">诉讼</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="目标处置方式"
                name="targetDisposalType"
                rules={[{ required: true, message: '请选择目标处置方式' }]}
              >
                <Select placeholder="请选择">
                  <Option value="调解">调解</Option>
                  <Option value="诉讼">诉讼</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="目标处置机构"
            name="targetOrg"
            rules={[{ required: true, message: '请选择目标处置机构' }]}
          >
            <Select placeholder="请选择目标处置机构">
              <Option value="华南调解中心">华南调解中心</Option>
              <Option value="金融调解中心">金融调解中心</Option>
              <Option value="金融律师事务所">金融律师事务所</Option>
              <Option value="华泰律师事务所">华泰律师事务所</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="转换原因"
            name="reason"
            rules={[{ required: true, message: '请输入转换原因' }]}
          >
            <TextArea rows={3} placeholder="请详细说明申请转换的原因" />
          </Form.Item>

          <Form.Item
            label="优先级"
            name="priority"
          >
            <Radio.Group>
              <Radio value="low">低</Radio>
              <Radio value="medium">中</Radio>
              <Radio value="high">高</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="附件上传"
            name="attachments"
          >
            <Upload
              multiple
              beforeUpload={() => false}
              fileList={form.getFieldValue('attachments')?.fileList || []}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="备注"
            name="notes"
          >
            <TextArea rows={2} placeholder="其他需要说明的信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="转换申请详情"
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            关闭
          </Button>
        ]}
        width={800}
        destroyOnClose={true}
      >
        {selectedCase && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="案件编号">{selectedCase.caseNumber}</Descriptions.Item>
              <Descriptions.Item label="债务人">{selectedCase.debtorName}</Descriptions.Item>
              <Descriptions.Item label="债务金额">¥{selectedCase.amount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={getStatusColor(selectedCase.status)}>{selectedCase.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="转换方向">
                <Space>
                  <Tag color={getDisposalTypeColor(selectedCase.currentDisposalType)}>
                    {selectedCase.currentDisposalType}
                  </Tag>
                  <ArrowRightOutlined />
                  <Tag color={getDisposalTypeColor(selectedCase.targetDisposalType)}>
                    {selectedCase.targetDisposalType}
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="当前机构">{selectedCase.currentOrg}</Descriptions.Item>
              <Descriptions.Item label="目标机构">{selectedCase.targetOrg || '-'}</Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {dayjs(selectedCase.requestTime).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              {selectedCase.approvalTime && (
                <Descriptions.Item label="处理时间">
                  {dayjs(selectedCase.approvalTime).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              )}
              {selectedCase.approver && (
                <Descriptions.Item label="处理人">{selectedCase.approver}</Descriptions.Item>
              )}
              <Descriptions.Item label="转换原因" span={2}>
                {selectedCase.reason}
              </Descriptions.Item>
              {selectedCase.notes && (
                <Descriptions.Item label="备注" span={2}>
                  {selectedCase.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Timeline
              items={[
                {
                  dot: <HistoryOutlined style={{ fontSize: '16px' }} />,
                  children: `${dayjs(selectedCase.requestTime).format('YYYY-MM-DD HH:mm')} 提交转换申请`
                },
                selectedCase.approvalTime ? {
                  dot: selectedCase.status === '已批准' ? 
                    <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} /> :
                    <ExclamationCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />,
                  children: `${dayjs(selectedCase.approvalTime).format('YYYY-MM-DD HH:mm')} 申请${selectedCase.status === '已批准' ? '已批准' : '被拒绝'}`
                } : {
                  dot: <ClockCircleOutlined style={{ fontSize: '16px', color: '#1890ff' }} />,
                  children: '等待审核中...'
                }
              ].filter(Boolean)}
            />
          </div>
        )}
      </Modal>

      {/* 批量处理弹窗 */}
      <Modal
        title={`批量转换处理 (${selectedRowKeys.length}个)`}
        open={batchModalVisible}
        onCancel={handleCloseBatchModal}
        onOk={() => batchForm.submit()}
        width={700}
        confirmLoading={batchProcessing}
        destroyOnClose={true}
      >
        <Alert
          message="批量处理说明"
          description={`将对选中的 ${selectedRowKeys.length} 个转换申请执行批量操作，请确认操作信息无误。`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={batchForm}
          layout="vertical"
          onFinish={handleBatchSubmit}
        >
          <Form.Item
            label="批量操作类型"
            name="operationType"
            rules={[{ required: true, message: '请选择操作类型' }]}
          >
            <Radio.Group>
              <Radio value="approve">批量批准</Radio>
              <Radio value="reject">批量拒绝</Radio>
              <Radio value="reassign">批量重新分配</Radio>
            </Radio.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="目标处置方式"
                name="targetDisposalType"
                rules={[{ required: true, message: '请选择目标处置方式' }]}
              >
                <Select placeholder="请选择">
                  <Option value="调解">调解</Option>
                  <Option value="诉讼">诉讼</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="目标机构"
                name="targetOrgId"
                rules={[{ required: true, message: '请选择目标机构' }]}
              >
                <Select placeholder="请选择目标机构">
                  <Option value="org1">华南调解中心</Option>
                  <Option value="org2">金融调解中心</Option>
                  <Option value="org3">金融律师事务所</Option>
                  <Option value="org4">华泰律师事务所</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="优先级"
            name="priority"
          >
            <Radio.Group>
              <Radio value="low">低</Radio>
              <Radio value="medium">中</Radio>
              <Radio value="high">高</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="批量处理原因"
            name="reason"
            rules={[{ required: true, message: '请输入批量处理原因' }]}
          >
            <TextArea rows={3} placeholder="请详细说明批量处理的原因" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="notes"
          >
            <TextArea rows={2} placeholder="其他需要说明的信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 数据导出弹窗 */}
      <Modal
        title="导出转换数据"
        open={exportModalVisible}
        onCancel={handleCloseExportModal}
        footer={null}
        width={600}
        destroyOnClose={true}
      >
        {!exportProgress ? (
          <Form
            form={exportForm}
            layout="vertical"
            onFinish={handleExportSubmit}
          >
            <Form.Item
              label="导出格式"
              name="format"
              rules={[{ required: true, message: '请选择导出格式' }]}
            >
              <Radio.Group>
                <Radio value="excel">
                  <FileExcelOutlined style={{ color: '#52c41a' }} /> Excel格式
                </Radio>
                <Radio value="csv">
                  <FilePdfOutlined style={{ color: '#ff4d4f' }} /> CSV格式
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="导出字段"
              name="fields"
              rules={[{ required: true, message: '请选择导出字段' }]}
            >
              <Checkbox.Group>
                <Row>
                  <Col span={8}>
                    <Checkbox value="caseNumber">案件编号</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="debtorName">债务人</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="amount">债务金额</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="currentDisposalType">当前处置方式</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="targetDisposalType">目标处置方式</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="status">状态</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="currentOrg">当前机构</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="targetOrg">目标机构</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="reason">转换原因</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="requestTime">申请时间</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="approvalTime">处理时间</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="approver">处理人</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="开始日期"
                  name="startDate"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="结束日期"
                  name="endDate"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleCloseExportModal}>取消</Button>
                <Button type="primary" htmlType="submit" icon={<DownloadOutlined />}>
                  开始导出
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Steps
              current={exportProgress.status === 'preparing' ? 0 : 
                     exportProgress.status === 'processing' ? 1 : 
                     exportProgress.status === 'completed' ? 2 : -1}
              status={exportProgress.status === 'failed' ? 'error' : 'process'}
              items={[
                {
                  title: '准备数据',
                  icon: <ClockCircleOutlined />,
                },
                {
                  title: '生成文件',
                  icon: <FileExcelOutlined />,
                },
                {
                  title: '导出完成',
                  icon: <CheckCircleOutlined />,
                },
              ]}
            />
            
            <div style={{ margin: '20px 0' }}>
              <Progress 
                percent={exportProgress.progress} 
                status={exportProgress.status === 'failed' ? 'exception' : 'active'}
              />
              <p style={{ marginTop: 10 }}>{exportProgress.message}</p>
            </div>

            {exportProgress.status === 'completed' && (
              <Space>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    if (exportProgress.downloadUrl && exportProgress.downloadUrl !== '#') {
                      window.open(exportProgress.downloadUrl, '_blank');
                    } else {
                      message.info('模拟模式：实际环境中会下载文件');
                    }
                  }}
                >
                  下载文件 ({exportProgress.fileName})
                </Button>
                <Button onClick={handleCloseExportModal}>关闭</Button>
              </Space>
            )}

            {exportProgress.status === 'failed' && (
              <Button onClick={() => setExportProgress(null)}>重新导出</Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DisposalConversion;