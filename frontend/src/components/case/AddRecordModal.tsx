import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Upload,
  Button,
  Space,
  Card,
  Row,
  Col,
  Radio,
  Checkbox,
  Typography,
  Alert,
  Divider,
  Tag,
  message,
  Steps,
  Result
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  PhoneOutlined,
  MessageOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  CloseOutlined,
  HistoryOutlined,
  CalendarOutlined,
  DollarOutlined,
  EditOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;
const { Step } = Steps;

interface RecordTemplate {
  id: string;
  name: string;
  type: 'CONTACT' | 'VISIT' | 'NEGOTIATION' | 'PAYMENT' | 'LEGAL' | 'OTHER';
  description: string;
  fields: TemplateField[];
}

interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'textarea' | 'upload';
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface AddRecordModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (record: any) => void;
  caseId: string;
  caseNo: string;
  debtorName: string;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  caseId,
  caseNo,
  debtorName
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<RecordTemplate | null>(null);
  const [recordType, setRecordType] = useState<'template' | 'custom'>('template');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // 记录模板
  const recordTemplates: RecordTemplate[] = [
    {
      id: 'contact_phone',
      name: '电话联系记录',
      type: 'CONTACT',
      description: '记录电话联系债务人的详细情况',
      fields: [
        { name: 'contactMethod', label: '联系方式', type: 'select', required: true, 
          options: [
            { label: '手机', value: 'MOBILE' },
            { label: '固话', value: 'LANDLINE' },
            { label: '工作电话', value: 'WORK_PHONE' }
          ]
        },
        { name: 'contactResult', label: '联系结果', type: 'select', required: true,
          options: [
            { label: '接通成功', value: 'SUCCESS' },
            { label: '无人接听', value: 'NO_ANSWER' },
            { label: '关机', value: 'POWERED_OFF' },
            { label: '占线', value: 'BUSY' },
            { label: '拒接', value: 'REFUSED' },
            { label: '空号', value: 'INVALID_NUMBER' }
          ]
        },
        { name: 'contactDuration', label: '通话时长（分钟）', type: 'number' },
        { name: 'debtorAttitude', label: '债务人态度', type: 'select', required: true,
          options: [
            { label: '配合', value: 'COOPERATIVE' },
            { label: '消极', value: 'PASSIVE' },
            { label: '抗拒', value: 'RESISTANT' },
            { label: '威胁', value: 'THREATENING' }
          ]
        },
        { name: 'contactContent', label: '沟通内容', type: 'textarea', required: true, placeholder: '详细记录与债务人的沟通内容' },
        { name: 'debtorResponse', label: '债务人回应', type: 'textarea', required: true, placeholder: '记录债务人的具体回应和承诺' },
        { name: 'promiseAmount', label: '承诺还款金额', type: 'number', placeholder: '债务人承诺的还款金额' },
        { name: 'promiseDate', label: '承诺还款日期', type: 'date' },
        { name: 'nextContactDate', label: '下次联系时间', type: 'date', required: true }
      ]
    },
    {
      id: 'visit_record',
      name: '外访记录',
      type: 'VISIT',
      description: '记录上门拜访债务人的情况',
      fields: [
        { name: 'visitAddress', label: '外访地址', type: 'text', required: true, placeholder: '具体的外访地址' },
        { name: 'visitTime', label: '外访时间', type: 'date', required: true },
        { name: 'visitDuration', label: '外访时长（分钟）', type: 'number' },
        { name: 'visitResult', label: '外访结果', type: 'select', required: true,
          options: [
            { label: '见到本人', value: 'MET_DEBTOR' },
            { label: '见到家属', value: 'MET_FAMILY' },
            { label: '见到邻居', value: 'MET_NEIGHBOR' },
            { label: '无人在家', value: 'NO_ONE_HOME' },
            { label: '地址错误', value: 'WRONG_ADDRESS' },
            { label: '拒绝开门', value: 'REFUSED_ENTRY' }
          ]
        },
        { name: 'visitTeam', label: '外访人员', type: 'text', required: true, placeholder: '参与外访的人员姓名' },
        { name: 'metPerson', label: '见面人员', type: 'text', placeholder: '实际见到的人员信息' },
        { name: 'visitContent', label: '外访过程', type: 'textarea', required: true, placeholder: '详细记录外访的全过程' },
        { name: 'evidenceCollected', label: '收集证据', type: 'textarea', placeholder: '记录收集到的证据信息' },
        { name: 'nextVisitDate', label: '下次外访时间', type: 'date' }
      ]
    },
    {
      id: 'payment_record',
      name: '还款记录',
      type: 'PAYMENT',
      description: '记录债务人的还款情况',
      fields: [
        { name: 'paymentAmount', label: '还款金额', type: 'number', required: true },
        { name: 'paymentDate', label: '还款日期', type: 'date', required: true },
        { name: 'paymentMethod', label: '还款方式', type: 'select', required: true,
          options: [
            { label: '银行转账', value: 'BANK_TRANSFER' },
            { label: '支付宝', value: 'ALIPAY' },
            { label: '微信支付', value: 'WECHAT_PAY' },
            { label: '现金', value: 'CASH' },
            { label: '支票', value: 'CHECK' },
            { label: '其他', value: 'OTHER' }
          ]
        },
        { name: 'transactionNo', label: '交易流水号', type: 'text', placeholder: '银行或第三方支付的交易号' },
        { name: 'paidBy', label: '付款人', type: 'text', required: true, placeholder: '实际付款人姓名' },
        { name: 'paymentProof', label: '付款凭证', type: 'upload' },
        { name: 'remainingAmount', label: '剩余欠款', type: 'number', required: true },
        { name: 'paymentNote', label: '还款备注', type: 'textarea', placeholder: '记录还款的相关说明' }
      ]
    },
    {
      id: 'negotiation_record',
      name: '协商记录',
      type: 'NEGOTIATION',
      description: '记录与债务人的协商谈判过程',
      fields: [
        { name: 'negotiationType', label: '协商类型', type: 'select', required: true,
          options: [
            { label: '分期还款', value: 'INSTALLMENT' },
            { label: '减免协商', value: 'REDUCTION' },
            { label: '一次性结清', value: 'LUMP_SUM' },
            { label: '延期还款', value: 'EXTENSION' },
            { label: '其他方案', value: 'OTHER' }
          ]
        },
        { name: 'negotiationDate', label: '协商日期', type: 'date', required: true },
        { name: 'negotiationMethod', label: '协商方式', type: 'select', required: true,
          options: [
            { label: '电话协商', value: 'PHONE' },
            { label: '面谈', value: 'FACE_TO_FACE' },
            { label: '微信沟通', value: 'WECHAT' },
            { label: '邮件沟通', value: 'EMAIL' }
          ]
        },
        { name: 'proposedAmount', label: '提议金额', type: 'number', placeholder: '我方提议的还款金额' },
        { name: 'counterAmount', label: '对方回应金额', type: 'number', placeholder: '债务人提出的金额' },
        { name: 'agreedAmount', label: '协商一致金额', type: 'number' },
        { name: 'paymentPlan', label: '还款计划', type: 'textarea', required: true, placeholder: '详细的还款时间和金额安排' },
        { name: 'negotiationResult', label: '协商结果', type: 'select', required: true,
          options: [
            { label: '达成一致', value: 'AGREED' },
            { label: '部分同意', value: 'PARTIAL_AGREED' },
            { label: '拒绝', value: 'REJECTED' },
            { label: '需要考虑', value: 'CONSIDERING' }
          ]
        },
        { name: 'nextNegotiationDate', label: '下次协商时间', type: 'date' }
      ]
    }
  ];

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setSelectedTemplate(null);
      setRecordType('template');
      setUploadedFiles([]);
      form.resetFields();
    }
  }, [visible, form]);

  // 选择模板
  const handleTemplateSelect = (template: RecordTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep(1);
    // 设置表单默认值
    const defaultValues: any = {};
    template.fields.forEach(field => {
      if (field.type === 'date' && field.name.includes('next')) {
        defaultValues[field.name] = moment().add(3, 'days');
      } else if (field.type === 'date' && field.name.includes('Date')) {
        defaultValues[field.name] = moment();
      }
    });
    form.setFieldsValue(defaultValues);
  };

  // 自定义记录
  const handleCustomRecord = () => {
    setRecordType('custom');
    setCurrentStep(1);
    form.setFieldsValue({
      recordDate: moment(),
      nextActionDate: moment().add(3, 'days')
    });
  };

  // 提交记录
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      const recordData = {
        id: `WR${Date.now()}`,
        caseId,
        caseNo,
        type: selectedTemplate?.type || 'OTHER',
        title: selectedTemplate ? selectedTemplate.name : values.title,
        ...values,
        attachments: uploadedFiles.map(file => file.response?.url || file.url),
        handler: '当前用户',
        handlerId: 'CURRENT_USER',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      };

      setCurrentStep(2);
      setTimeout(() => {
        message.success('记录添加成功');
        onSuccess(recordData);
      }, 1000);
    } catch (error) {
      console.error('添加记录失败:', error);
      message.error('添加记录失败，请检查表单数据');
    } finally {
      setLoading(false);
    }
  };

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    listType: 'picture-card' as const,
    fileList: uploadedFiles,
    onChange: ({ fileList }: any) => setUploadedFiles(fileList),
    beforeUpload: (file: File) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB');
      }
      return isLt10M;
    }
  };

  // 渲染表单字段
  const renderFormField = (field: TemplateField) => {
    const commonProps = {
      placeholder: field.placeholder || `请输入${field.label}`
    };

    switch (field.type) {
      case 'text':
        return <Input {...commonProps} />;
      case 'number':
        return <InputNumber style={{ width: '100%' }} {...commonProps} />;
      case 'date':
        return <DatePicker style={{ width: '100%' }} {...commonProps} />;
      case 'time':
        return <TimePicker style={{ width: '100%' }} format="HH:mm" {...commonProps} />;
      case 'select':
        return (
          <Select {...commonProps}>
            {field.options?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      case 'textarea':
        return <TextArea rows={3} {...commonProps} />;
      case 'upload':
        return (
          <Upload {...uploadProps}>
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传文件</div>
            </div>
          </Upload>
        );
      default:
        return <Input {...commonProps} />;
    }
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // 选择记录类型
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message={`为案件 ${caseNo} (${debtorName}) 添加作业记录`}
              type="info"
              showIcon
            />

            <Card title="选择记录类型" size="small">
              <Row gutter={[16, 16]}>
                {recordTemplates.map(template => (
                  <Col span={12} key={template.id}>
                    <Card
                      hoverable
                      onClick={() => handleTemplateSelect(template)}
                      style={{ cursor: 'pointer', height: 120 }}
                      bodyStyle={{ padding: 16 }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          {template.type === 'CONTACT' && <PhoneOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                          {template.type === 'VISIT' && <UserOutlined style={{ fontSize: 20, color: '#52c41a' }} />}
                          {template.type === 'PAYMENT' && <DollarOutlined style={{ fontSize: 20, color: '#fa8c16' }} />}
                          {template.type === 'NEGOTIATION' && <MessageOutlined style={{ fontSize: 20, color: '#eb2f96' }} />}
                          <Text strong>{template.name}</Text>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {template.description}
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                ))}
                <Col span={12}>
                  <Card
                    hoverable
                    onClick={handleCustomRecord}
                    style={{ 
                      cursor: 'pointer', 
                      height: 120,
                      borderStyle: 'dashed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    bodyStyle={{ padding: 16, textAlign: 'center' }}
                  >
                    <Space direction="vertical">
                      <PlusOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                      <Text>自定义记录</Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Space>
        );

      case 1: // 填写记录信息
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              message={
                selectedTemplate 
                  ? `正在添加：${selectedTemplate.name}` 
                  : '正在添加：自定义记录'
              }
              type="info"
              showIcon
            />

            <Form
              form={form}
              layout="vertical"
              scrollToFirstError
            >
              {selectedTemplate ? (
                // 模板字段
                <Row gutter={16}>
                  {selectedTemplate.fields.map((field, index) => (
                    <Col span={field.type === 'textarea' || field.type === 'upload' ? 24 : 12} key={field.name}>
                      <Form.Item
                        name={field.name}
                        label={field.label}
                        rules={[
                          { required: field.required, message: `请${field.type === 'select' ? '选择' : '输入'}${field.label}` }
                        ]}
                      >
                        {renderFormField(field)}
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              ) : (
                // 自定义字段
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="recordType"
                      label="记录类型"
                      rules={[{ required: true, message: '请选择记录类型' }]}
                    >
                      <Select placeholder="请选择记录类型">
                        <Option value="CONTACT">联系记录</Option>
                        <Option value="VISIT">外访记录</Option>
                        <Option value="NEGOTIATION">协商记录</Option>
                        <Option value="PAYMENT">还款记录</Option>
                        <Option value="LEGAL">法律行动</Option>
                        <Option value="OTHER">其他记录</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="recordDate"
                      label="记录日期"
                      rules={[{ required: true, message: '请选择记录日期' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="title"
                      label="记录标题"
                      rules={[{ required: true, message: '请输入记录标题' }]}
                    >
                      <Input placeholder="请输入简明的记录标题" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="content"
                      label="记录内容"
                      rules={[{ required: true, message: '请输入记录内容' }]}
                    >
                      <TextArea rows={6} placeholder="请详细描述本次作业的具体内容和过程" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="result"
                      label="处理结果"
                      rules={[{ required: true, message: '请输入处理结果' }]}
                    >
                      <TextArea rows={3} placeholder="请记录本次作业的结果和效果" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="nextAction"
                      label="下一步行动"
                    >
                      <Input placeholder="请输入下一步计划采取的行动" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="nextActionDate"
                      label="下次行动时间"
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="attachments"
                      label="相关附件"
                    >
                      <Upload {...uploadProps}>
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>上传附件</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              )}

              <Divider />

              <Space>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                >
                  保存记录
                </Button>
                <Button onClick={() => setCurrentStep(0)}>
                  上一步
                </Button>
                <Button onClick={onCancel}>
                  取消
                </Button>
              </Space>
            </Form>
          </Space>
        );

      case 2: // 成功页面
        return (
          <Result
            status="success"
            title="记录添加成功"
            subTitle="作业记录已成功保存，可以在记录列表中查看"
            extra={[
              <Button type="primary" key="close" onClick={onCancel}>
                关闭
              </Button>,
              <Button key="continue" onClick={() => {
                setCurrentStep(0);
                setSelectedTemplate(null);
                form.resetFields();
              }}>
                继续添加
              </Button>
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined />
          <span>添加作业记录</span>
          <Tag color="blue">{caseNo}</Tag>
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      bodyStyle={{ 
        maxHeight: 'calc(80vh - 110px)', 
        overflowY: 'auto',
        padding: '16px 24px'
      }}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 步骤指示器 */}
        <Steps current={currentStep} size="small">
          <Step title="选择类型" icon={<FileTextOutlined />} />
          <Step title="填写信息" icon={<EditOutlined />} />
          <Step title="完成" icon={<CheckCircleOutlined />} />
        </Steps>

        {/* 步骤内容 */}
        {renderStepContent()}
      </Space>
    </Modal>
  );
};

export default AddRecordModal;