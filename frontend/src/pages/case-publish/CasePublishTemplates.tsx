import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Tag, Input, Select, Row, Col,
  Statistic, message, Modal, Tooltip, Form, Upload, Typography,
  Divider, Alert, Badge, Switch, Popconfirm
} from 'antd';
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, ExportOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, CopyOutlined,
  UploadOutlined, DownloadOutlined, FileTextOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, RiseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useDebouncedCallback } from 'use-debounce';

const { Search } = Input;
const { Option } = Select;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

// 案件发布模板接口
interface CasePublishTemplate {
  id: number;
  templateName: string;
  templateCode: string;
  caseType: 'PERSONAL_LOAN' | 'CREDIT_CARD' | 'MORTGAGE' | 'CAR_LOAN' | 'BUSINESS_LOAN' | 'OTHER';
  caseTypeName: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  validationRules: ValidationRule[];
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ValidationRule {
  field: string;
  rule: 'required' | 'numeric' | 'date' | 'phone' | 'email' | 'idcard';
  message: string;
}

// 模板统计数据
interface TemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  defaultTemplates: number;
  totalUsage: number;
}

const CasePublishTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<CasePublishTemplate[]>([]);
  const [stats, setStats] = useState<TemplateStats>({
    totalTemplates: 0,
    activeTemplates: 0,
    defaultTemplates: 0,
    totalUsage: 0
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // 弹窗状态
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CasePublishTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CasePublishTemplate | null>(null);
  
  const [form] = Form.useForm();

  // 模拟数据
  const mockTemplates: CasePublishTemplate[] = [
    {
      id: 1,
      templateName: '个人信用贷款标准模板',
      templateCode: 'PERSONAL_LOAN_STANDARD',
      caseType: 'PERSONAL_LOAN',
      caseTypeName: '个人信用贷款',
      description: '个人信用贷款案件的标准发布模板，包含借款人基本信息、贷款信息、逾期情况等核心字段',
      requiredFields: ['借款人姓名', '身份证号', '手机号码', '贷款金额', '逾期金额', '逾期天数'],
      optionalFields: ['家庭地址', '工作单位', '担保人信息', '抵押物信息'],
      validationRules: [
        { field: '身份证号', rule: 'idcard', message: '请输入正确的18位身份证号码' },
        { field: '手机号码', rule: 'phone', message: '请输入正确的11位手机号码' },
        { field: '贷款金额', rule: 'numeric', message: '请输入有效的金额' }
      ],
      isDefault: true,
      isActive: true,
      usageCount: 156,
      createdBy: '系统管理员',
      createdAt: '2024-01-15',
      updatedAt: '2024-07-20'
    },
    {
      id: 2,
      templateName: '信用卡逾期专用模板',
      templateCode: 'CREDIT_CARD_OVERDUE',
      caseType: 'CREDIT_CARD',
      caseTypeName: '信用卡',
      description: '信用卡逾期案件专用模板，针对信用卡业务特点设计的字段配置',
      requiredFields: ['持卡人姓名', '身份证号', '卡号后四位', '逾期金额', '最低还款额', '逾期期数'],
      optionalFields: ['年费', '分期手续费', '利息', '违约金'],
      validationRules: [
        { field: '身份证号', rule: 'idcard', message: '请输入正确的18位身份证号码' },
        { field: '逾期金额', rule: 'numeric', message: '请输入有效的金额' },
        { field: '卡号后四位', rule: 'numeric', message: '请输入4位数字' }
      ],
      isDefault: false,
      isActive: true,
      usageCount: 89,
      createdBy: '业务专员',
      createdAt: '2024-02-10',
      updatedAt: '2024-07-18'
    },
    {
      id: 3,
      templateName: '车贷逾期模板',
      templateCode: 'CAR_LOAN_OVERDUE',
      caseType: 'CAR_LOAN',
      caseTypeName: '车辆贷款',
      description: '车辆贷款逾期案件模板，包含车辆信息和贷款详情字段',
      requiredFields: ['借款人姓名', '身份证号', '车辆品牌', '车牌号', '贷款余额', '逾期金额'],
      optionalFields: ['车辆型号', '购车价格', '首付金额', '保险情况'],
      validationRules: [
        { field: '身份证号', rule: 'idcard', message: '请输入正确的18位身份证号码' },
        { field: '贷款余额', rule: 'numeric', message: '请输入有效的金额' }
      ],
      isDefault: false,
      isActive: false,
      usageCount: 34,
      createdBy: '产品经理',
      createdAt: '2024-03-05',
      updatedAt: '2024-06-12'
    }
  ];

  // 获取模板列表
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      setTemplates(mockTemplates);
      setStats({
        totalTemplates: mockTemplates.length,
        activeTemplates: mockTemplates.filter(t => t.isActive).length,
        defaultTemplates: mockTemplates.filter(t => t.isDefault).length,
        totalUsage: mockTemplates.reduce((sum, t) => sum + t.usageCount, 0)
      });
    } catch (error) {
      message.error('获取模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索防抖处理
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchText(value);
  }, 300);

  // 过滤数据
  const filteredTemplates = templates.filter(template => {
    const matchSearch = !searchText || 
      template.templateName.toLowerCase().includes(searchText.toLowerCase()) ||
      template.templateCode.toLowerCase().includes(searchText.toLowerCase()) ||
      template.description.toLowerCase().includes(searchText.toLowerCase());
    
    const matchCaseType = !caseTypeFilter || template.caseType === caseTypeFilter;
    const matchStatus = !statusFilter || 
      (statusFilter === 'active' && template.isActive) ||
      (statusFilter === 'inactive' && !template.isActive) ||
      (statusFilter === 'default' && template.isDefault);
    
    return matchSearch && matchCaseType && matchStatus;
  });

  // 表格列定义
  const columns: ColumnsType<CasePublishTemplate> = [
    {
      title: '模板信息',
      key: 'templateInfo',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <strong>{record.templateName}</strong>
            {record.isDefault && (
              <Badge count="默认" style={{ backgroundColor: '#52c41a', marginLeft: 8 }} />
            )}
          </div>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
            模板代码：{record.templateCode}
          </div>
          <div style={{ color: '#999', fontSize: '12px' }}>
            {record.description.length > 50 
              ? `${record.description.substring(0, 50)}...` 
              : record.description}
          </div>
        </div>
      ),
    },
    {
      title: '案件类型',
      dataIndex: 'caseTypeName',
      key: 'caseType',
      width: 120,
      render: (text, record) => (
        <Tag color={getCaseTypeColor(record.caseType)}>{text}</Tag>
      ),
    },
    {
      title: '字段配置',
      key: 'fields',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Tag color="red">必填 {record.requiredFields.length}</Tag>
            <Tag color="blue">选填 {record.optionalFields.length}</Tag>
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            验证规则：{record.validationRules.length} 条
          </div>
        </div>
      ),
    },
    {
      title: '使用统计',
      key: 'usage',
      width: 100,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
            {record.usageCount}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>次使用</div>
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <div>
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? '启用' : '禁用'}
          </Tag>
        </div>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 100,
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button 
              type="text" 
              size="small" 
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个模板吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="text" 
                size="small" 
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 获取案件类型颜色
  const getCaseTypeColor = (type: string) => {
    const colors = {
      'PERSONAL_LOAN': 'blue',
      'CREDIT_CARD': 'green',
      'MORTGAGE': 'purple',
      'CAR_LOAN': 'orange',
      'BUSINESS_LOAN': 'cyan',
      'OTHER': 'default'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  // 操作处理函数
  const handlePreview = (template: CasePublishTemplate) => {
    setPreviewTemplate(template);
    setPreviewModalVisible(true);
  };

  const handleEdit = (template: CasePublishTemplate) => {
    setEditingTemplate(template);
    form.setFieldsValue(template);
    setTemplateModalVisible(true);
  };

  const handleCopy = (template: CasePublishTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now(),
      templateName: `${template.templateName} - 副本`,
      templateCode: `${template.templateCode}_COPY_${Date.now()}`,
      isDefault: false,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTemplates(prev => [newTemplate, ...prev]);
    message.success('模板复制成功');
  };

  const handleDelete = (id: number) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    message.success('模板删除成功');
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setTemplateModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      if (editingTemplate) {
        // 更新模板
        setTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id 
            ? { ...t, ...values, updatedAt: new Date().toISOString().split('T')[0] }
            : t
        ));
        message.success('模板更新成功');
      } else {
        // 创建新模板
        const newTemplate: CasePublishTemplate = {
          ...values,
          id: Date.now(),
          usageCount: 0,
          createdBy: '当前用户',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        setTemplates(prev => [newTemplate, ...prev]);
        message.success('模板创建成功');
      }
      setTemplateModalVisible(false);
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleExport = () => {
    message.info('模板导出功能开发中...');
  };

  const handleImport = () => {
    setImportModalVisible(true);
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的模板');
      return;
    }
    
    Modal.confirm({
      title: '批量删除模板',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个模板吗？`,
      onOk: () => {
        setTemplates(prev => prev.filter(t => !selectedRowKeys.includes(t.id)));
        setSelectedRowKeys([]);
        message.success('批量删除成功');
      }
    });
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>案件发布模板</Title>
        <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
          管理案件发布的标准化模板，提高案件信息录入的准确性和效率
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="模板总数"
              value={stats.totalTemplates}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="启用模板"
              value={stats.activeTemplates}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="默认模板"
              value={stats.defaultTemplates}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总使用次数"
              value={stats.totalUsage}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作区域 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} justify="space-between" align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Search
                placeholder="搜索模板名称、代码或描述"
                allowClear
                style={{ width: 300 }}
                onChange={(e) => debouncedSearch(e.target.value)}
                onSearch={debouncedSearch}
              />
              <Select
                placeholder="案件类型"
                allowClear
                style={{ width: 150 }}
                value={caseTypeFilter}
                onChange={setCaseTypeFilter}
              >
                <Option value="PERSONAL_LOAN">个人信用贷款</Option>
                <Option value="CREDIT_CARD">信用卡</Option>
                <Option value="MORTGAGE">抵押贷款</Option>
                <Option value="CAR_LOAN">车辆贷款</Option>
                <Option value="BUSINESS_LOAN">企业贷款</Option>
                <Option value="OTHER">其他</Option>
              </Select>
              <Select
                placeholder="模板状态"
                allowClear
                style={{ width: 120 }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
                <Option value="default">默认</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchTemplates}>
                刷新
              </Button>
              <Button icon={<UploadOutlined />} onClick={handleImport}>
                导入模板
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出模板
              </Button>
              <Button 
                danger 
                disabled={selectedRowKeys.length === 0}
                onClick={handleBatchDelete}
              >
                批量删除
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                新建模板
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 模板列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTemplates}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            total: filteredTemplates.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 模板编辑弹窗 */}
      <Modal
        title={editingTemplate ? '编辑模板' : '新建模板'}
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
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
                name="templateCode"
                label="模板代码"
                rules={[{ required: true, message: '请输入模板代码' }]}
              >
                <Input placeholder="请输入模板代码" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="caseType"
                label="案件类型"
                rules={[{ required: true, message: '请选择案件类型' }]}
              >
                <Select placeholder="请选择案件类型">
                  <Option value="PERSONAL_LOAN">个人信用贷款</Option>
                  <Option value="CREDIT_CARD">信用卡</Option>
                  <Option value="MORTGAGE">抵押贷款</Option>
                  <Option value="CAR_LOAN">车辆贷款</Option>
                  <Option value="BUSINESS_LOAN">企业贷款</Option>
                  <Option value="OTHER">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Space>
                <Form.Item name="isDefault" valuePropName="checked">
                  <Switch checkedChildren="默认" unCheckedChildren="普通" />
                </Form.Item>
                <Form.Item name="isActive" valuePropName="checked">
                  <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                </Form.Item>
              </Space>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button onClick={() => setTemplateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingTemplate ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 模板预览弹窗 */}
      <Modal
        title="模板预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {previewTemplate && (
          <div>
            <Alert
              message={previewTemplate.templateName}
              description={previewTemplate.description}
              type="info"
              style={{ marginBottom: 16 }}
            />
            <Divider>必填字段</Divider>
            <div style={{ marginBottom: 16 }}>
              {previewTemplate.requiredFields.map(field => (
                <Tag key={field} color="red" style={{ margin: '4px' }}>
                  {field}
                </Tag>
              ))}
            </div>
            <Divider>选填字段</Divider>
            <div style={{ marginBottom: 16 }}>
              {previewTemplate.optionalFields.map(field => (
                <Tag key={field} color="blue" style={{ margin: '4px' }}>
                  {field}
                </Tag>
              ))}
            </div>
            <Divider>验证规则</Divider>
            <div>
              {previewTemplate.validationRules.map((rule, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <Tag color="purple">{rule.field}</Tag>
                  <span style={{ color: '#666' }}>{rule.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* 导入模板弹窗 */}
      <Modal
        title="导入模板"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        width={500}
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            取消
          </Button>,
          <Button key="download" icon={<DownloadOutlined />}>
            下载模板
          </Button>,
          <Button key="import" type="primary">
            开始导入
          </Button>
        ]}
      >
        <Alert
          message="导入说明"
          description="请下载标准模板文件，填写完成后上传导入。支持Excel格式文件。"
          type="info"
          style={{ marginBottom: 16 }}
        />
        <Upload.Dragger
          name="file"
          multiple={false}
          accept=".xlsx,.xls"
          beforeUpload={() => false}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持单个文件上传，仅支持Excel格式</p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
};

export default CasePublishTemplates;