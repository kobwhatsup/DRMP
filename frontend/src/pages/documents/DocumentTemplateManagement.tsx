import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Row,
  Col,
  message,
  Modal,
  Form,
  Upload,
  Descriptions,
  Typography,
  Divider,
  Tooltip,
  Alert,
  Progress,
  Badge,
  Drawer,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  CopyOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import {
  queryTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplate,
  previewTemplate,
  approveTemplate,
  importTemplate,
  exportTemplate,
  DocumentTemplateResponse,
  DocumentTemplateCreateRequest
} from '@/services/documentService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Dragger } = Upload;

interface TemplateFormData extends DocumentTemplateCreateRequest {
  id?: number;
}

const DocumentTemplateManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DocumentTemplateResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchParams, setSearchParams] = useState<{
    templateType?: string;
    category?: string;
    isActive?: boolean;
    keyword?: string;
  }>({});
  
  // 模态框状态
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  
  // 表单和数据状态
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateResponse | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // 模板类型选项
  const templateTypes = [
    { value: 'DEMAND_LETTER', label: '催款通知书' },
    { value: 'PAYMENT_REMINDER', label: '还款提醒函' },
    { value: 'LEGAL_NOTICE', label: '律师函' },
    { value: 'SETTLEMENT_AGREEMENT', label: '和解协议' },
    { value: 'PAYMENT_PLAN', label: '还款计划书' },
    { value: 'COMMITMENT_LETTER', label: '承诺书' },
    { value: 'POWER_OF_ATTORNEY', label: '授权委托书' },
    { value: 'COURT_COMPLAINT', label: '起诉状' },
    { value: 'ENFORCEMENT_APPLICATION', label: '强制执行申请书' },
    { value: 'MEDIATION_AGREEMENT', label: '调解协议' },
    { value: 'DEBT_CONFIRMATION', label: '债务确认书' },
    { value: 'ASSET_PRESERVATION', label: '财产保全申请书' },
    { value: 'EVIDENCE_PRESERVATION', label: '证据保全申请书' },
    { value: 'INVESTIGATION_REPORT', label: '调查报告' },
    { value: 'CUSTOM', label: '自定义模板' }
  ];

  // 文档分类选项
  const documentCategories = [
    { value: 'CONTACT', label: '联系沟通' },
    { value: 'LEGAL', label: '法律文书' },
    { value: 'AGREEMENT', label: '协议合同' },
    { value: 'NOTICE', label: '通知函件' },
    { value: 'APPLICATION', label: '申请文件' },
    { value: 'REPORT', label: '报告文档' },
    { value: 'EVIDENCE', label: '证据材料' },
    { value: 'OTHER', label: '其他文档' }
  ];

  // 表格列定义
  const columns: ColumnsType<DocumentTemplateResponse> = [
    {
      title: '模板名称',
      dataIndex: 'templateName',
      key: 'templateName',
      render: (text, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => handleViewDetail(record)}
            style={{ padding: 0 }}
          >
            {text}
          </Button>
          {record.isSystemTemplate && (
            <Tag color="blue">系统</Tag>
          )}
        </Space>
      )
    },
    {
      title: '模板类型',
      dataIndex: 'templateTypeDesc',
      key: 'templateType',
      render: (text, record) => (
        <Tag color="purple">{text}</Tag>
      )
    },
    {
      title: '文档分类',
      dataIndex: 'categoryDesc',
      key: 'category',
      render: (text) => <Tag color="cyan">{text}</Tag>
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status) => {
        const statusConfig = {
          'PENDING': { color: 'orange', icon: <ExclamationCircleOutlined />, text: '待审批' },
          'APPROVED': { color: 'green', icon: <CheckCircleOutlined />, text: '已审批' },
          'REJECTED': { color: 'red', icon: <CloseCircleOutlined />, text: '已拒绝' }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="预览">
            <Button 
              type="text" 
              icon={<FileTextOutlined />} 
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Tooltip title="导出">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => handleExport(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 模拟数据
  const mockData: DocumentTemplateResponse[] = [
    {
      id: 1,
      templateName: '催款通知书标准模板',
      templateType: 'DEMAND_LETTER',
      templateTypeDesc: '催款通知书',
      category: 'NOTICE',
      categoryDesc: '通知函件',
      templateContent: '尊敬的${debtorName}先生/女士：\n\n根据我方记录，您于${loanDate}借款金额${loanAmount}元，截至${currentDate}，您的逾期金额为${remainingAmount}元，逾期天数为${overdueDays}天。\n\n请您于收到本通知书后7日内归还全部欠款，否则我方将采取进一步法律行动。\n\n联系电话：${contactPhone}',
      templateVariables: '{"debtorName":"债务人姓名","loanDate":"借款日期","loanAmount":"借款金额","currentDate":"当前日期","remainingAmount":"剩余金额","overdueDays":"逾期天数","contactPhone":"联系电话"}',
      outputFormat: 'PDF',
      pageSize: 'A4',
      pageOrientation: 'PORTRAIT',
      fontFamily: '宋体',
      fontSize: 12,
      isSystemTemplate: true,
      isActive: true,
      usageCount: 145,
      organizationId: 1,
      createdBy: 1,
      version: 1,
      approvalStatus: 'APPROVED',
      description: '标准催款通知书模板，适用于一般逾期案件',
      tags: '催款,通知,标准',
      tagList: ['催款', '通知', '标准'],
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-02-20T14:30:00Z',
      displayName: '催款通知书标准模板',
      isAvailable: true
    },
    {
      id: 2,
      templateName: '律师函专业版',
      templateType: 'LEGAL_NOTICE',
      templateTypeDesc: '律师函',
      category: 'LEGAL',
      categoryDesc: '法律文书',
      templateContent: '${debtorName}先生/女士：\n\n本律师受${creditorName}委托，就您拖欠的${loanAmount}元债务事宜向您发出本律师函。\n\n请您在收到本函后3日内与我方联系并妥善处理该债务，否则我方将代表委托人向法院提起诉讼。',
      templateVariables: '{"debtorName":"债务人姓名","creditorName":"债权人名称","loanAmount":"借款金额"}',
      outputFormat: 'PDF',
      pageSize: 'A4',
      pageOrientation: 'PORTRAIT',
      fontFamily: '宋体',
      fontSize: 12,
      isSystemTemplate: false,
      isActive: true,
      usageCount: 89,
      organizationId: 2,
      createdBy: 2,
      version: 2,
      approvalStatus: 'APPROVED',
      description: '专业律师函模板，具有较强法律威慑力',
      tags: '律师函,法律,专业',
      tagList: ['律师函', '法律', '专业'],
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-03-15T16:20:00Z',
      displayName: '律师函专业版',
      isAvailable: true
    },
    {
      id: 3,
      templateName: '和解协议模板',
      templateType: 'SETTLEMENT_AGREEMENT',
      templateTypeDesc: '和解协议',
      category: 'AGREEMENT',
      categoryDesc: '协议合同',
      templateContent: '甲方：${creditorName}\n乙方：${debtorName}\n\n双方就债务${originalAmount}元达成如下和解协议：\n1. 乙方同意分期偿还，每月还款${monthlyPayment}元\n2. 还款期限为${paymentMonths}个月\n3. 如逾期，甲方有权要求一次性偿还全部剩余债务',
      templateVariables: '{"creditorName":"债权人名称","debtorName":"债务人姓名","originalAmount":"原债务金额","monthlyPayment":"月还款额","paymentMonths":"还款月数"}',
      outputFormat: 'PDF',
      pageSize: 'A4',
      pageOrientation: 'PORTRAIT',
      fontFamily: '宋体',
      fontSize: 12,
      isSystemTemplate: true,
      isActive: true,
      usageCount: 67,
      organizationId: 1,
      createdBy: 1,
      version: 1,
      approvalStatus: 'PENDING',
      description: '标准和解协议模板，适用于分期还款安排',
      tags: '和解,协议,分期',
      tagList: ['和解', '协议', '分期'],
      createdAt: '2024-03-01T11:00:00Z',
      updatedAt: '2024-03-20T09:15:00Z',
      displayName: '和解协议模板',
      isAvailable: true
    }
  ];

  // 加载数据 (使用模拟数据)
  const fetchData = async () => {
    setLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟搜索过滤
      let filteredData = mockData;
      if (searchParams.keyword) {
        filteredData = filteredData.filter(item => 
          item.templateName.includes(searchParams.keyword!) ||
          item.description?.includes(searchParams.keyword!)
        );
      }
      if (searchParams.templateType) {
        filteredData = filteredData.filter(item => item.templateType === searchParams.templateType);
      }
      if (searchParams.category) {
        filteredData = filteredData.filter(item => item.category === searchParams.category);
      }
      if (searchParams.isActive !== undefined) {
        filteredData = filteredData.filter(item => item.isActive === searchParams.isActive);
      }
      
      // 模拟分页
      const startIndex = (pagination.current - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      setData(paginatedData);
      setTotal(filteredData.length);
    } catch (error) {
      message.error('加载模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination, searchParams]);

  // 处理搜索
  const handleSearch = (values: any) => {
    setSearchParams(values);
    setPagination({ ...pagination, current: 1 });
  };

  // 查看详情
  const handleViewDetail = async (record: DocumentTemplateResponse) => {
    setSelectedTemplate(record);
    setDetailDrawerVisible(true);
  };

  // 预览模板 (使用模拟数据)
  const handlePreview = async (record: DocumentTemplateResponse) => {
    try {
      // 模拟预览内容生成
      const sampleData = {
        debtorName: '张三',
        loanAmount: 500000,
        remainingAmount: 350000,
        overdueDays: 180,
        contactPhone: '138****8000',
        loanDate: '2023-01-15',
        currentDate: '2024-08-16',
        creditorName: '某银行股份有限公司',
        monthlyPayment: 50000,
        paymentMonths: 7,
        originalAmount: 500000
      };
      
      // 简单的模板变量替换
      let content = record.templateContent;
      Object.entries(sampleData).forEach(([key, value]) => {
        content = content.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value.toString());
      });
      
      setPreviewContent(`<div style="font-family: SimSun; font-size: 14px; line-height: 1.6; padding: 20px; white-space: pre-wrap;">${content}</div>`);
      setPreviewModalVisible(true);
      message.success('预览生成成功');
    } catch (error) {
      message.error('预览失败');
    }
  };

  // 编辑模板
  const handleEdit = (record: DocumentTemplateResponse) => {
    setFormMode('edit');
    setSelectedTemplate(record);
    form.setFieldsValue({
      ...record,
      tags: record.tagList?.join(',')
    });
    setFormModalVisible(true);
  };

  // 复制模板
  const handleCopy = (record: DocumentTemplateResponse) => {
    setFormMode('create');
    form.setFieldsValue({
      ...record,
      templateName: `${record.templateName}（副本）`,
      tags: record.tagList?.join(',')
    });
    setFormModalVisible(true);
  };

  // 导出模板 (使用模拟数据)
  const handleExport = async (record: DocumentTemplateResponse) => {
    try {
      // 模拟导出数据
      const exportData = {
        templateName: record.templateName,
        templateType: record.templateType,
        category: record.category,
        templateContent: record.templateContent,
        templateVariables: record.templateVariables,
        outputFormat: record.outputFormat,
        description: record.description,
        tags: record.tags
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${record.templateName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 删除模板 (使用模拟数据)
  const handleDelete = (record: DocumentTemplateResponse) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除模板"${record.templateName}"吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          // 模拟删除操作
          await new Promise(resolve => setTimeout(resolve, 500));
          message.success('删除成功');
          fetchData();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 保存模板 (使用模拟数据)
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const templateData: TemplateFormData = {
        ...values,
        tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()).join(',') : undefined
      };

      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 800));

      if (formMode === 'edit' && selectedTemplate) {
        message.success('更新成功');
      } else {
        message.success('创建成功');
      }

      setFormModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 审批模板 (使用模拟数据)
  const handleApprove = async (templateId: number, status: string) => {
    try {
      // 模拟审批操作
      await new Promise(resolve => setTimeout(resolve, 600));
      message.success('审批操作成功');
      fetchData();
      setDetailDrawerVisible(false);
    } catch (error) {
      message.error('审批操作失败');
    }
  };

  return (
    <div className="document-template-management">
      <Card>
        {/* 搜索和操作栏 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={16}>
            <Form layout="inline" onFinish={handleSearch}>
              <Form.Item name="keyword">
                <Input
                  placeholder="搜索模板名称或描述"
                  prefix={<SearchOutlined />}
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item name="templateType">
                <Select placeholder="模板类型" style={{ width: 150 }} allowClear>
                  {templateTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="category">
                <Select placeholder="文档分类" style={{ width: 120 }} allowClear>
                  {documentCategories.map(cat => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="isActive">
                <Select placeholder="状态" style={{ width: 100 }} allowClear>
                  <Option value={true}>启用</Option>
                  <Option value={false}>禁用</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  搜索
                </Button>
              </Form.Item>
            </Form>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setFormMode('create');
                  form.resetFields();
                  setFormModalVisible(true);
                }}
              >
                新建模板
              </Button>
              <Button 
                icon={<UploadOutlined />} 
                onClick={() => setImportModalVisible(true)}
              >
                导入模板
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize: pageSize || 10 });
            }
          }}
        />
      </Card>

      {/* 创建/编辑模板模态框 */}
      <Modal
        title={formMode === 'edit' ? '编辑模板' : '新建模板'}
        visible={formModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setFormModalVisible(false);
          form.resetFields();
        }}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="templateName" 
                label="模板名称" 
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input placeholder="请输入模板名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="templateType" 
                label="模板类型" 
                rules={[{ required: true, message: '请选择模板类型' }]}
              >
                <Select placeholder="请选择模板类型">
                  {templateTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="category" 
                label="文档分类" 
                rules={[{ required: true, message: '请选择文档分类' }]}
              >
                <Select placeholder="请选择文档分类">
                  {documentCategories.map(cat => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="outputFormat" label="输出格式">
                <Select placeholder="请选择输出格式" defaultValue="PDF">
                  <Option value="PDF">PDF</Option>
                  <Option value="WORD">Word</Option>
                  <Option value="HTML">HTML</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="templateContent" 
            label="模板内容" 
            rules={[{ required: true, message: '请输入模板内容' }]}
          >
            <TextArea 
              rows={8} 
              placeholder="请输入模板内容，可使用变量 ${变量名} 进行数据替换"
            />
          </Form.Item>

          <Form.Item name="description" label="模板描述">
            <TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tags" label="标签">
                <Input placeholder="请输入标签，多个标签用逗号分隔" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="状态" valuePropName="checked">
                <Select defaultValue={true}>
                  <Option value={true}>启用</Option>
                  <Option value={false}>禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 模板预览模态框 */}
      <Modal
        title="模板预览"
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <div 
          style={{ 
            border: '1px solid #d9d9d9', 
            padding: 16, 
            minHeight: 400,
            backgroundColor: '#fafafa'
          }}
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      </Modal>

      {/* 模板详情抽屉 */}
      <Drawer
        title="模板详情"
        visible={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        width={600}
      >
        {selectedTemplate && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="基本信息" key="info">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="模板名称">
                  {selectedTemplate.templateName}
                </Descriptions.Item>
                <Descriptions.Item label="模板类型">
                  <Tag color="purple">{selectedTemplate.templateTypeDesc}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="文档分类">
                  <Tag color="cyan">{selectedTemplate.categoryDesc}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="审批状态">
                  {/* 审批状态标签 */}
                </Descriptions.Item>
                <Descriptions.Item label="使用次数">
                  {selectedTemplate.usageCount}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {moment(selectedTemplate.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {moment(selectedTemplate.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* 审批操作 */}
              {selectedTemplate.approvalStatus === 'PENDING' && (
                <Space>
                  <Button 
                    type="primary" 
                    onClick={() => handleApprove(selectedTemplate.id, 'APPROVED')}
                  >
                    审批通过
                  </Button>
                  <Button 
                    danger 
                    onClick={() => handleApprove(selectedTemplate.id, 'REJECTED')}
                  >
                    审批拒绝
                  </Button>
                </Space>
              )}
            </TabPane>
            
            <TabPane tab="模板内容" key="content">
              <div style={{ whiteSpace: 'pre-wrap', padding: 16, backgroundColor: '#f5f5f5' }}>
                {selectedTemplate.templateContent}
              </div>
            </TabPane>
          </Tabs>
        )}
      </Drawer>

      {/* 导入模板模态框 */}
      <Modal
        title="导入模板"
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        <Dragger
          name="file"
          multiple={false}
          accept=".json"
          customRequest={async ({ file, onSuccess, onError }) => {
            try {
              // 模拟导入操作
              await new Promise(resolve => setTimeout(resolve, 1000));
              message.success('导入成功');
              onSuccess && onSuccess(file);
              setImportModalVisible(false);
              fetchData();
            } catch (error) {
              message.error('导入失败');
              onError && onError(error as Error);
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个JSON格式的模板文件上传
          </p>
        </Dragger>
      </Modal>
    </div>
  );
};

export default DocumentTemplateManagement;