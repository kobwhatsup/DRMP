import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Radio,
  Space,
  Button,
  Typography,
  Card,
  Tag,
  Alert,
  Row,
  Col,
  Input,
  message
} from 'antd';
import {
  FileTextOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { storeBatchOperation } from '@/services/batchOperationService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'NOTICE' | 'AGREEMENT' | 'LEGAL' | 'REPORT';
  format: 'WORD' | 'PDF';
  requiredFields: string[];
  estimatedTime: number; // 分钟
}

interface BatchDocumentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (result: any) => void;
  caseIds: string[];
}

const BatchDocumentModal: React.FC<BatchDocumentModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  caseIds
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('batch');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  // 模拟文书模板数据
  const documentTemplates: DocumentTemplate[] = [
    {
      id: 'notice_payment',
      name: '还款通知书',
      description: '标准的还款催收通知书，包含债务信息和法律提醒',
      type: 'NOTICE',
      format: 'WORD',
      requiredFields: ['债务人姓名', '欠款金额', '逾期天数'],
      estimatedTime: 2
    },
    {
      id: 'agreement_installment',
      name: '分期还款协议',
      description: '债务人分期还款协议模板',
      type: 'AGREEMENT',
      format: 'PDF',
      requiredFields: ['债务人姓名', '联系方式', '分期金额', '分期期数'],
      estimatedTime: 5
    },
    {
      id: 'legal_warning',
      name: '法律催告函',
      description: '正式的法律催告文书，威慑力较强',
      type: 'LEGAL',
      format: 'PDF',
      requiredFields: ['债务人姓名', '欠款金额', '债权人信息'],
      estimatedTime: 3
    },
    {
      id: 'visit_report',
      name: '外访调查报告',
      description: '外访调查情况报告模板',
      type: 'REPORT',
      format: 'WORD',
      requiredFields: ['调查时间', '调查地点', '调查结果'],
      estimatedTime: 8
    },
    {
      id: 'settlement_agreement',
      name: '和解协议书',
      description: '债务和解协议书模板',
      type: 'AGREEMENT',
      format: 'PDF',
      requiredFields: ['双方信息', '和解金额', '和解条件'],
      estimatedTime: 10
    },
    {
      id: 'litigation_materials',
      name: '诉讼材料清单',
      description: '法律诉讼所需材料清单和模板',
      type: 'LEGAL',
      format: 'WORD',
      requiredFields: ['案件编号', '债务详情', '证据清单'],
      estimatedTime: 15
    }
  ];

  useEffect(() => {
    if (visible) {
      setSelectedTemplate(null);
      setGenerationMode('batch');
      setCustomFields({});
      form.resetFields();
    }
  }, [visible, form]);

  // 选择模板
  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    // 初始化自定义字段
    const fields: Record<string, string> = {};
    template.requiredFields.forEach(field => {
      fields[field] = '';
    });
    setCustomFields(fields);
  };

  // 更新自定义字段
  const handleFieldChange = (field: string, value: string) => {
    setCustomFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 执行文书生成
  const handleGenerate = async () => {
    if (!selectedTemplate) {
      message.warning('请选择文书模板');
      return;
    }

    // 检查必填字段
    const missingFields = selectedTemplate.requiredFields.filter(
      field => !customFields[field]?.trim()
    );
    
    if (missingFields.length > 0) {
      message.warning(`请填写必填字段: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // 模拟文书生成API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        id: Date.now(),
        operationType: 'DOCUMENT_GENERATION',
        operationTypeDesc: '批量生成文书',
        operationName: `生成${selectedTemplate.name}`,
        targetType: 'CASE',
        targetCount: caseIds.length,
        successCount: caseIds.length,
        failedCount: 0,
        status: 'COMPLETED',
        statusDesc: '生成完成',
        parameters: JSON.stringify({
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          customFields,
          generationMode,
          caseIds
        }),
        progressPercentage: 100,
        currentStep: '文书生成完成',
        createdBy: 1,
        organizationId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        successRate: 100,
        isCompleted: true,
        executionTime: selectedTemplate.estimatedTime * 1000 * 60, // 转换为毫秒
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      // 存储操作数据以便后续查询
      storeBatchOperation(result);

      onSuccess(result);
    } catch (error: any) {
      message.error(`文书生成失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setCustomFields({});
    form.resetFields();
    onCancel();
  };

  // 获取文书类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'NOTICE':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'AGREEMENT':
        return <FileWordOutlined style={{ color: '#52c41a' }} />;
      case 'LEGAL':
        return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'REPORT':
        return <FileTextOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  // 获取文书类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'NOTICE': return 'blue';
      case 'AGREEMENT': return 'green';
      case 'LEGAL': return 'red';
      case 'REPORT': return 'orange';
      default: return 'default';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>批量生成文书</span>
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
          disabled={!selectedTemplate}
          onClick={handleGenerate}
        >
          生成文书
        </Button>
      ]}
      width={1400}
      destroyOnClose
      bodyStyle={{ maxHeight: 'calc(80vh - 110px)', overflowY: 'auto' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 操作说明 */}
        <Alert
          message={`将为 ${caseIds.length} 个案件生成指定类型的文书`}
          description="请选择文书模板并填写必要信息，系统将自动为每个案件生成对应的文书"
          type="info"
          showIcon
        />

        {/* 文书模板选择 */}
        <Card title="选择文书模板" size="small">
          <Row gutter={[16, 12]}>
            {documentTemplates.map(template => (
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
                      {getTypeIcon(template.type)}
                      <Text strong>{template.name}</Text>
                      <Tag color={getTypeColor(template.type)}>
                        {template.type}
                      </Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {template.description}
                    </Text>
                    <Space>
                      <Tag color="default">
                        {template.format}
                      </Tag>
                      <Tag color="cyan">
                        <ClockCircleOutlined /> {template.estimatedTime}分钟
                      </Tag>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 生成模式选择 */}
        <Card title="生成模式" size="small">
          <Radio.Group
            value={generationMode}
            onChange={(e) => setGenerationMode(e.target.value)}
          >
            <Radio value="batch">批量生成（所有案件使用相同模板和内容）</Radio>
            <Radio value="single">单独生成（每个案件可自定义内容）</Radio>
          </Radio.Group>
        </Card>

        {/* 模板详情和自定义字段 */}
        {selectedTemplate && (
          <Card
            title={
              <Space>
                {getTypeIcon(selectedTemplate.type)}
                <span>{selectedTemplate.name}</span>
                <Tag color={getTypeColor(selectedTemplate.type)}>
                  {selectedTemplate.type}
                </Tag>
              </Space>
            }
            size="small"
            extra={
              <Tag color="cyan">
                预计耗时: {selectedTemplate.estimatedTime * caseIds.length} 分钟
              </Tag>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Paragraph>{selectedTemplate.description}</Paragraph>
              
              {/* 必填字段 */}
              <div>
                <Title level={5}>填写必要信息:</Title>
                <Row gutter={[24, 16]}>
                  {selectedTemplate.requiredFields.map(field => (
                    <Col key={field} span={8}>
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Text strong>{field} <Text type="danger">*</Text></Text>
                        {field.includes('内容') || field.includes('说明') ? (
                          <TextArea
                            placeholder={`请输入${field}`}
                            value={customFields[field] || ''}
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                            rows={3}
                            maxLength={500}
                          />
                        ) : (
                          <Input
                            placeholder={`请输入${field}`}
                            value={customFields[field] || ''}
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                            maxLength={100}
                          />
                        )}
                      </Space>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* 操作提示 */}
              <Alert
                message="生成说明"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>文书将根据案件信息自动填充债务人姓名、金额等基础信息</li>
                    <li>生成的文书支持{selectedTemplate.format}格式下载</li>
                    <li>生成后可在案件详情页面查看和下载文书</li>
                    <li>预计生成时间: {selectedTemplate.estimatedTime * caseIds.length} 分钟</li>
                  </ul>
                }
                type="info"
                showIcon={false}
              />
            </Space>
          </Card>
        )}
      </Space>
    </Modal>
  );
};

export default BatchDocumentModal;