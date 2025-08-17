import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Checkbox,
  Radio,
  Space,
  Button,
  Typography,
  Card,
  Alert,
  Tag,
  Row,
  Col,
  Input,
  message,
  Divider
} from 'antd';
import {
  ExportOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { storeBatchOperation } from '@/services/batchOperationService';

const { Title, Text } = Typography;
const { Option } = Select;

interface ExportField {
  key: string;
  label: string;
  category: 'basic' | 'financial' | 'contact' | 'status' | 'progress';
  required?: boolean;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'EXCEL' | 'PDF' | 'CSV';
  fields: string[];
  useCase: string;
}

interface BatchExportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (result: any) => void;
  caseIds: string[];
}

const BatchExportModal: React.FC<BatchExportModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  caseIds
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [exportMode, setExportMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'EXCEL' | 'PDF' | 'CSV'>('EXCEL');

  // 可导出字段定义
  const exportFields: ExportField[] = [
    // 基础信息
    { key: 'caseNo', label: '案件编号', category: 'basic', required: true },
    { key: 'debtorName', label: '债务人姓名', category: 'basic', required: true },
    { key: 'debtorIdCard', label: '身份证号', category: 'basic' },
    { key: 'debtorPhone', label: '联系电话', category: 'contact' },
    { key: 'debtorAddress', label: '联系地址', category: 'contact' },
    
    // 财务信息
    { key: 'loanAmount', label: '贷款金额', category: 'financial' },
    { key: 'remainingAmount', label: '剩余欠款', category: 'financial' },
    { key: 'interestAmount', label: '利息金额', category: 'financial' },
    { key: 'penaltyAmount', label: '违约金', category: 'financial' },
    { key: 'totalAmount', label: '总欠款', category: 'financial' },
    
    // 状态信息
    { key: 'status', label: '案件状态', category: 'status' },
    { key: 'stage', label: '处理阶段', category: 'status' },
    { key: 'priority', label: '优先级', category: 'status' },
    { key: 'handler', label: '处理人', category: 'status' },
    { key: 'overdueDays', label: '逾期天数', category: 'status' },
    
    // 进度信息
    { key: 'lastContactDate', label: '最后联系日期', category: 'progress' },
    { key: 'nextContactDate', label: '下次联系日期', category: 'progress' },
    { key: 'workRecordCount', label: '作业记录数', category: 'progress' },
    { key: 'documentCount', label: '文档数量', category: 'progress' },
    { key: 'recoveryRate', label: '回收率', category: 'progress' },
    
    // 时间信息
    { key: 'createdAt', label: '创建时间', category: 'basic' },
    { key: 'updatedAt', label: '更新时间', category: 'basic' }
  ];

  // 导出模板
  const exportTemplates: ExportTemplate[] = [
    {
      id: 'basic_report',
      name: '基础案件报告',
      description: '包含案件基本信息和财务状况的标准报告',
      format: 'EXCEL',
      fields: ['caseNo', 'debtorName', 'debtorPhone', 'loanAmount', 'remainingAmount', 'status', 'handler', 'overdueDays'],
      useCase: '日常管理和监控'
    },
    {
      id: 'financial_analysis',
      name: '财务分析报告',
      description: '详细的财务数据分析，包含各类金额和回收率',
      format: 'EXCEL',
      fields: ['caseNo', 'debtorName', 'loanAmount', 'remainingAmount', 'interestAmount', 'penaltyAmount', 'totalAmount', 'recoveryRate'],
      useCase: '财务部门分析'
    },
    {
      id: 'contact_list',
      name: '联系信息清单',
      description: '债务人联系信息汇总，便于批量联系',
      format: 'CSV',
      fields: ['caseNo', 'debtorName', 'debtorPhone', 'debtorAddress', 'status', 'handler', 'nextContactDate'],
      useCase: '外呼和外访'
    },
    {
      id: 'legal_summary',
      name: '法律程序摘要',
      description: '适用于法律程序的案件信息摘要',
      format: 'PDF',
      fields: ['caseNo', 'debtorName', 'debtorIdCard', 'loanAmount', 'remainingAmount', 'overdueDays', 'status', 'lastContactDate'],
      useCase: '法律诉讼准备'
    },
    {
      id: 'progress_tracking',
      name: '进度跟踪报告',
      description: '案件处理进度和工作记录统计',
      format: 'EXCEL',
      fields: ['caseNo', 'debtorName', 'status', 'handler', 'workRecordCount', 'documentCount', 'lastContactDate', 'nextContactDate'],
      useCase: '进度监控'
    }
  ];

  useEffect(() => {
    if (visible) {
      setExportMode('template');
      setSelectedTemplate(null);
      setSelectedFields([]);
      setExportFormat('EXCEL');
      form.resetFields();
    }
  }, [visible, form]);

  // 选择模板
  const handleTemplateSelect = (template: ExportTemplate) => {
    setSelectedTemplate(template);
    setSelectedFields(template.fields);
    setExportFormat(template.format);
  };

  // 字段选择变更
  const handleFieldsChange = (fields: string[]) => {
    // 确保必填字段始终被选中
    const requiredFields = exportFields.filter(f => f.required).map(f => f.key);
    const finalFields = Array.from(new Set([...requiredFields, ...fields]));
    setSelectedFields(finalFields);
  };

  // 执行导出
  const handleExport = async () => {
    if (selectedFields.length === 0) {
      message.warning('请选择要导出的字段');
      return;
    }

    try {
      const values = await form.validateFields();
      setLoading(true);

      // 模拟导出API调用
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = {
        id: Date.now(),
        operationType: 'DATA_EXPORT',
        operationTypeDesc: '批量导出数据',
        operationName: selectedTemplate ? `导出${selectedTemplate.name}` : '自定义数据导出',
        targetType: 'CASE',
        targetCount: caseIds.length,
        successCount: caseIds.length,
        failedCount: 0,
        status: 'COMPLETED',
        statusDesc: '导出完成',
        parameters: JSON.stringify({
          templateId: selectedTemplate?.id,
          format: exportFormat,
          fields: selectedFields,
          fileName: values.fileName,
          caseIds
        }),
        progressPercentage: 100,
        currentStep: '数据导出完成',
        createdBy: 1,
        organizationId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        successRate: 100,
        isCompleted: true,
        executionTime: 2000,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        resultData: JSON.stringify({
          downloadUrl: '/api/downloads/export_' + Date.now() + '.' + exportFormat.toLowerCase(),
          fileSize: '2.5MB',
          recordCount: caseIds.length
        })
      };

      // 存储操作数据以便后续查询
      storeBatchOperation(result);
      onSuccess(result);
    } catch (error: any) {
      message.error(`导出失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setSelectedFields([]);
    form.resetFields();
    onCancel();
  };

  // 获取格式图标
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'EXCEL': return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'PDF': return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'CSV': return <FileTextOutlined style={{ color: '#1890ff' }} />;
      default: return <ExportOutlined />;
    }
  };

  // 按类别分组字段
  const fieldsByCategory = exportFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ExportField[]>);

  const categoryNames = {
    basic: '基础信息',
    financial: '财务信息',
    contact: '联系信息',
    status: '状态信息',
    progress: '进度信息'
  };

  return (
    <Modal
      title={
        <Space>
          <ExportOutlined />
          <span>批量导出数据</span>
          <Tag color="blue">{caseIds.length} 个案件</Tag>
        </Space>
      }
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          disabled={selectedFields.length === 0}
          onClick={handleExport}
        >
          开始导出
        </Button>
      ]}
      width={1400}
      destroyOnClose
      bodyStyle={{ maxHeight: 'calc(80vh - 110px)', overflowY: 'auto' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 操作说明 */}
        <Alert
          message={`将导出 ${caseIds.length} 个案件的数据`}
          description="请选择导出模板或自定义导出字段，系统将生成对应格式的文件供下载"
          type="info"
          showIcon
        />

        {/* 导出方式选择 */}
        <Card title="导出方式" size="small">
          <Radio.Group
            value={exportMode}
            onChange={(e) => setExportMode(e.target.value)}
          >
            <Radio value="template">使用预定义模板</Radio>
            <Radio value="custom">自定义字段导出</Radio>
          </Radio.Group>
        </Card>

        {/* 模板选择 */}
        {exportMode === 'template' && (
          <Card title="选择导出模板" size="small">
            <Row gutter={[16, 12]}>
              {exportTemplates.map(template => (
                <Col key={template.id} span={8}>
                  <Card
                    size="small"
                    hoverable
                    className={selectedTemplate?.id === template.id ? 'selected-template' : ''}
                    style={{
                      border: selectedTemplate?.id === template.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <Space>
                        {getFormatIcon(template.format)}
                        <Text strong>{template.name}</Text>
                        <Tag color="blue">{template.format}</Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {template.description}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        适用场景: {template.useCase}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        包含字段: {template.fields.length} 个
                      </Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* 自定义字段选择 */}
        {exportMode === 'custom' && (
          <Card title="选择导出字段" size="small">
            {Object.entries(fieldsByCategory).map(([category, fields]) => (
              <div key={category} style={{ marginBottom: 16 }}>
                <Title level={5}>{categoryNames[category as keyof typeof categoryNames]}</Title>
                <Checkbox.Group
                  value={selectedFields}
                  onChange={handleFieldsChange}
                >
                  <Row gutter={[12, 8]}>
                    {fields.map(field => (
                      <Col key={field.key} span={6}>
                        <Checkbox
                          value={field.key}
                          disabled={field.required}
                        >
                          {field.label}
                          {field.required && <Text type="danger"> *</Text>}
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
                <Divider />
              </div>
            ))}
          </Card>
        )}

        {/* 导出设置 */}
        <Card title="导出设置" size="small">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              fileName: `案件数据导出_${new Date().toISOString().split('T')[0]}`,
              format: exportFormat
            }}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="fileName"
                  label="文件名称"
                  rules={[{ required: true, message: '请输入文件名称' }]}
                >
                  <Input placeholder="请输入文件名称" maxLength={50} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="format"
                  label="导出格式"
                  rules={[{ required: true, message: '请选择导出格式' }]}
                >
                  <Select
                    value={exportFormat}
                    onChange={(value) => setExportFormat(value)}
                    disabled={exportMode === 'template' && !!selectedTemplate}
                  >
                    <Option value="EXCEL">
                      <Space>
                        <FileExcelOutlined style={{ color: '#52c41a' }} />
                        Excel (.xlsx)
                      </Space>
                    </Option>
                    <Option value="CSV">
                      <Space>
                        <FileTextOutlined style={{ color: '#1890ff' }} />
                        CSV (.csv)
                      </Space>
                    </Option>
                    <Option value="PDF">
                      <Space>
                        <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                        PDF (.pdf)
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* 已选择字段预览 */}
        {selectedFields.length > 0 && (
          <Card title={`已选择字段 (${selectedFields.length}个)`} size="small">
            <Space size={[0, 8]} wrap>
              {selectedFields.map(fieldKey => {
                const field = exportFields.find(f => f.key === fieldKey);
                return (
                  <Tag key={fieldKey} color={field?.required ? 'red' : 'blue'}>
                    {field?.label}
                    {field?.required && ' *'}
                  </Tag>
                );
              })}
            </Space>
          </Card>
        )}

        {/* 导出说明 */}
        <Alert
          message="导出说明"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>导出文件将包含所选案件的指定字段数据</li>
              <li>敏感信息（如完整身份证号）将部分屏蔽</li>
              <li>导出完成后可在下载中心查看和下载文件</li>
              <li>文件保留期限为30天，请及时下载</li>
            </ul>
          }
          type="info"
          showIcon={false}
        />
      </Space>
    </Modal>
  );
};

export default BatchExportModal;