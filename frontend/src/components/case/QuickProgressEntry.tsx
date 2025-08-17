import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Upload,
  Row,
  Col,
  Space,
  Tag,
  Alert,
  Typography,
  InputNumber,
  Radio,
  TimePicker,
  message,
  Tooltip,
  Popover,
  Divider
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  ClearOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MessageOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  SoundOutlined,
  FileTextOutlined as TemplateOutlined,
  InfoCircleOutlined,
  PaperClipOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useApiRequest } from '@/hooks/useApiRequest';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Dragger } = Upload;

// 进度类型配置
const PROGRESS_TYPES = {
  CONTACT: {
    code: 'CONTACT',
    name: '联系沟通',
    icon: <PhoneOutlined />,
    color: 'blue',
    description: '与债务人的电话、短信、微信等联系记录',
    fields: ['contactMethod', 'contactResult', 'nextContactDate', 'contactDuration']
  },
  NEGOTIATION: {
    code: 'NEGOTIATION',
    name: '协商谈判',
    icon: <MessageOutlined />,
    color: 'orange',
    description: '与债务人进行还款协商、方案讨论等',
    fields: ['negotiationResult', 'proposedAmount', 'acceptedAmount', 'paymentPlan']
  },
  PAYMENT: {
    code: 'PAYMENT',
    name: '回款记录',
    icon: <DollarOutlined />,
    color: 'green',
    description: '债务人实际还款记录',
    fields: ['paymentAmount', 'paymentMethod', 'paymentDate', 'receiptNumber']
  },
  DOCUMENT: {
    code: 'DOCUMENT',
    name: '文档提交',
    icon: <FileTextOutlined />,
    color: 'purple',
    description: '提交相关文档、证据材料等',
    fields: ['documentType', 'documentDescription', 'submitDate']
  },
  LEGAL: {
    code: 'LEGAL',
    name: '法律行动',
    icon: <FileTextOutlined />,
    color: 'red',
    description: '法律程序、诉讼、仲裁等法律行动',
    fields: ['legalAction', 'courtInfo', 'lawyerInfo', 'expectedResult']
  },
  VISIT: {
    code: 'VISIT',
    name: '上门走访',
    icon: <PhoneOutlined />,
    color: 'cyan',
    description: '实地走访债务人或相关人员',
    fields: ['visitAddress', 'visitResult', 'personMet', 'visitDuration']
  },
  OTHER: {
    code: 'OTHER',
    name: '其他进展',
    icon: <InfoCircleOutlined />,
    color: 'default',
    description: '其他类型的进展记录',
    fields: ['description']
  }
};

// 联系方式选项
const CONTACT_METHODS = [
  { value: 'PHONE', label: '电话联系' },
  { value: 'SMS', label: '短信' },
  { value: 'WECHAT', label: '微信' },
  { value: 'EMAIL', label: '邮件' },
  { value: 'VISIT', label: '上门' },
  { value: 'LETTER', label: '信函' }
];

// 联系结果选项
const CONTACT_RESULTS = [
  { value: 'CONNECTED', label: '联系成功', color: 'success' },
  { value: 'NO_ANSWER', label: '无人接听', color: 'warning' },
  { value: 'REFUSED', label: '拒绝沟通', color: 'error' },
  { value: 'BUSY', label: '占线', color: 'default' },
  { value: 'WRONG_NUMBER', label: '号码错误', color: 'error' },
  { value: 'PROMISED_CALLBACK', label: '承诺回电', color: 'processing' }
];

// 常用模板
const QUICK_TEMPLATES = [
  {
    name: '首次联系',
    type: 'CONTACT',
    content: '首次联系债务人，告知欠款情况，要求尽快还款。',
    data: {
      contactMethod: 'PHONE',
      contactResult: 'CONNECTED'
    }
  },
  {
    name: '协商还款',
    type: 'NEGOTIATION',
    content: '与债务人协商还款方案，债务人表示困难，提出分期还款。',
    data: {
      negotiationResult: 'PARTIAL_AGREEMENT'
    }
  },
  {
    name: '部分回款',
    type: 'PAYMENT',
    content: '债务人按约定还款，收到部分款项。',
    data: {
      paymentMethod: 'BANK_TRANSFER'
    }
  }
];

interface QuickProgressEntryProps {
  caseId: string;
  onSuccess?: (progress: any) => void;
  initialType?: string;
  compact?: boolean;
}

const QuickProgressEntry: React.FC<QuickProgressEntryProps> = ({
  caseId,
  onSuccess,
  initialType = 'CONTACT',
  compact = false
}) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState(initialType);
  const [fileList, setFileList] = useState<any[]>([]);
  const [templatePopoverVisible, setTemplatePopoverVisible] = useState(false);

  // 提交进度记录
  const { loading: submitLoading, execute: submitProgress } = useApiRequest(async (progressData: any) => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    message.success('进度记录添加成功');
    onSuccess?.(progressData);
    return true;
  });

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    setFileList([]);
    setSelectedType('CONTACT');
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const progressData = {
        caseId,
        progressType: selectedType,
        ...values,
        attachments: fileList.map(file => file.url || file.response?.url),
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
      };
      
      await submitProgress(progressData);
      handleReset();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 应用模板
  const applyTemplate = (template: any) => {
    setSelectedType(template.type);
    form.setFieldsValue({
      progressDescription: template.content,
      ...template.data
    });
    setTemplatePopoverVisible(false);
    message.success(`已应用模板：${template.name}`);
  };

  // 渲染动态字段
  const renderDynamicFields = () => {
    const typeConfig = PROGRESS_TYPES[selectedType as keyof typeof PROGRESS_TYPES];
    if (!typeConfig) return null;

    const fields = typeConfig.fields || [];

    return fields.map(fieldName => {
      switch (fieldName) {
        case 'contactMethod':
          return (
            <Form.Item key={fieldName} label="联系方式" name="contactMethod">
              <Select placeholder="选择联系方式">
                {CONTACT_METHODS.map(method => (
                  <Option key={method.value} value={method.value}>
                    {method.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );

        case 'contactResult':
          return (
            <Form.Item key={fieldName} label="联系结果" name="contactResult">
              <Select placeholder="选择联系结果">
                {CONTACT_RESULTS.map(result => (
                  <Option key={result.value} value={result.value}>
                    <Tag color={result.color} style={{ margin: 0 }}>
                      {result.label}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );

        case 'nextContactDate':
          return (
            <Form.Item key={fieldName} label="下次联系时间" name="nextContactDate">
              <DatePicker 
                showTime 
                placeholder="选择下次联系时间"
                style={{ width: '100%' }}
              />
            </Form.Item>
          );

        case 'contactDuration':
          return (
            <Form.Item key={fieldName} label="通话时长(分钟)" name="contactDuration">
              <InputNumber 
                min={0} 
                placeholder="输入通话时长"
                style={{ width: '100%' }}
              />
            </Form.Item>
          );

        case 'paymentAmount':
          return (
            <Form.Item key={fieldName} label="还款金额" name="paymentAmount" rules={[{ required: true }]}>
              <InputNumber 
                min={0}
                precision={2}
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: string | undefined) => {
                  const parsed = parseFloat(value?.replace(/¥\s?|(,*)/g, '') || '0');
                  return isNaN(parsed) ? 0 : parsed;
                }}
                style={{ width: '100%' }}
                placeholder="输入还款金额"
              />
            </Form.Item>
          );

        case 'paymentMethod':
          return (
            <Form.Item key={fieldName} label="还款方式" name="paymentMethod">
              <Select placeholder="选择还款方式">
                <Option value="CASH">现金</Option>
                <Option value="BANK_TRANSFER">银行转账</Option>
                <Option value="ALIPAY">支付宝</Option>
                <Option value="WECHAT">微信支付</Option>
                <Option value="CHECK">支票</Option>
              </Select>
            </Form.Item>
          );

        case 'paymentDate':
          return (
            <Form.Item key={fieldName} label="还款日期" name="paymentDate">
              <DatePicker style={{ width: '100%' }} placeholder="选择还款日期" />
            </Form.Item>
          );

        case 'receiptNumber':
          return (
            <Form.Item key={fieldName} label="收据编号" name="receiptNumber">
              <Input placeholder="输入收据编号" />
            </Form.Item>
          );

        case 'documentType':
          return (
            <Form.Item key={fieldName} label="文档类型" name="documentType">
              <Select placeholder="选择文档类型">
                <Option value="EVIDENCE">证据材料</Option>
                <Option value="CONTRACT">合同协议</Option>
                <Option value="NOTICE">通知函件</Option>
                <Option value="RECEIPT">收据凭证</Option>
                <Option value="REPORT">报告文档</Option>
              </Select>
            </Form.Item>
          );

        case 'visitAddress':
          return (
            <Form.Item key={fieldName} label="走访地址" name="visitAddress">
              <Input placeholder="输入走访地址" />
            </Form.Item>
          );

        case 'visitResult':
          return (
            <Form.Item key={fieldName} label="走访结果" name="visitResult">
              <Select placeholder="选择走访结果">
                <Option value="MET_DEBTOR">见到债务人</Option>
                <Option value="MET_FAMILY">见到家属</Option>
                <Option value="NO_ONE_HOME">无人在家</Option>
                <Option value="MOVED_OUT">已搬迁</Option>
                <Option value="REFUSED_MEETING">拒绝见面</Option>
              </Select>
            </Form.Item>
          );

        default:
          return null;
      }
    });
  };

  const currentTypeConfig = PROGRESS_TYPES[selectedType as keyof typeof PROGRESS_TYPES];

  const templateContent = (
    <div style={{ width: 300 }}>
      <Title level={5}>快速模板</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        {QUICK_TEMPLATES.map((template, index) => (
          <Card 
            key={index}
            size="small" 
            hoverable
            onClick={() => applyTemplate(template)}
          >
            <Space direction="vertical" size="small">
              <Space>
                <Tag color={PROGRESS_TYPES[template.type as keyof typeof PROGRESS_TYPES].color}>
                  {PROGRESS_TYPES[template.type as keyof typeof PROGRESS_TYPES].name}
                </Tag>
                <Text strong>{template.name}</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {template.content}
              </Text>
            </Space>
          </Card>
        ))}
      </Space>
    </div>
  );

  return (
    <Card 
      title={
        <Space>
          <FileTextOutlined />
          <span>快速进度录入</span>
        </Space>
      }
      extra={
        <Space>
          <Popover 
            content={templateContent}
            title="选择模板"
            trigger="click"
            open={templatePopoverVisible}
            onOpenChange={setTemplatePopoverVisible}
          >
            <Button icon={<TemplateOutlined />}>
              模板
            </Button>
          </Popover>
          <Button icon={<ClearOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      }
      size={compact ? 'small' : 'default'}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* 进度类型选择 */}
        <Form.Item label="进度类型" required>
          <Select 
            value={selectedType}
            onChange={setSelectedType}
            placeholder="选择进度类型"
          >
            {Object.values(PROGRESS_TYPES).map(type => (
              <Option key={type.code} value={type.code}>
                <Space>
                  <span style={{ color: type.color }}>{type.icon}</span>
                  <span>{type.name}</span>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {type.description}
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* 当前类型说明 */}
        {currentTypeConfig && (
          <Alert
            message={currentTypeConfig.name}
            description={currentTypeConfig.description}
            type="info"
            showIcon
            icon={currentTypeConfig.icon}
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={16}>
          {/* 动态字段 */}
          <Col span={compact ? 24 : 12}>
            {renderDynamicFields()}
          </Col>

          {/* 基础字段 */}
          <Col span={compact ? 24 : 12}>
            <Form.Item 
              label="进度描述" 
              name="progressDescription"
              rules={[{ required: true, message: '请输入进度描述' }]}
            >
              <TextArea 
                rows={compact ? 3 : 4}
                placeholder="详细描述本次进度情况..."
              />
            </Form.Item>

            <Form.Item label="下一步行动" name="nextAction">
              <Input placeholder="计划的下一步行动" />
            </Form.Item>

            <Form.Item label="预期完成时间" name="expectedCompletionDate">
              <DatePicker 
                showTime 
                style={{ width: '100%' }}
                placeholder="选择预期完成时间"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* 附件上传 */}
        <Form.Item label="相关附件">
          <Dragger
            multiple
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false} // 阻止自动上传
          >
            <p className="ant-upload-drag-icon">
              <PaperClipOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个或批量上传图片、文档等相关材料
            </p>
          </Dragger>
        </Form.Item>

        {/* 提交按钮 */}
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={submitLoading}
              icon={<SaveOutlined />}
            >
              保存进度
            </Button>
            <Button onClick={handleReset}>
              重置表单
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default QuickProgressEntry;