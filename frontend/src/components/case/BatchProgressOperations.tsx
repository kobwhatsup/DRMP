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
  TimePicker,
  InputNumber,
  message,
  Alert,
  Typography,
  Row,
  Col,
  Checkbox,
  Radio,
  Upload,
  Progress,
  Divider,
  Steps,
  Result,
  Spin,
  Tooltip,
  Badge,
  Statistic,
  Empty,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  DollarOutlined,
  CalendarOutlined,
  UploadOutlined,
  DownloadOutlined,
  SyncOutlined,
  FilterOutlined,
  SearchOutlined,
  CopyOutlined,
  ExportOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;
const { RangePicker } = DatePicker;
const { Dragger } = Upload;

interface CaseInfo {
  id: string;
  caseNo: string;
  debtorName: string;
  debtorPhone: string;
  remainingAmount: number;
  status: string;
  handler: string;
  lastProgressTime?: string;
}

interface BatchProgressTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: TemplateField[];
  isDefault?: boolean;
}

interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: any;
}

interface BatchProgressResult {
  caseId: string;
  caseNo: string;
  success: boolean;
  message?: string;
  progressId?: string;
}

interface BatchProgressOperationsProps {
  selectedCases?: CaseInfo[];
  onClose?: () => void;
  onSuccess?: (results: BatchProgressResult[]) => void;
}

const BatchProgressOperations: React.FC<BatchProgressOperationsProps> = ({
  selectedCases = [],
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<BatchProgressTemplate | null>(null);
  const [progressData, setProgressData] = useState<Record<string, any>>({});
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<BatchProgressResult[]>([]);
  const [templates, setTemplates] = useState<BatchProgressTemplate[]>([]);
  const [customTemplate, setCustomTemplate] = useState(false);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const [form] = Form.useForm();

  // 进度模板
  const defaultTemplates: BatchProgressTemplate[] = [
    {
      id: '1',
      name: '批量电话联系',
      type: 'CONTACT',
      description: '批量记录电话联系结果',
      isDefault: true,
      fields: [
        { name: 'contactType', label: '联系方式', type: 'select', required: true, 
          options: [
            { label: '电话', value: 'PHONE' },
            { label: '短信', value: 'SMS' },
            { label: '邮件', value: 'EMAIL' }
          ]
        },
        { name: 'contactResult', label: '联系结果', type: 'select', required: true,
          options: [
            { label: '接通', value: 'CONNECTED' },
            { label: '未接', value: 'NOT_ANSWERED' },
            { label: '关机', value: 'POWERED_OFF' },
            { label: '拒接', value: 'REJECTED' }
          ]
        },
        { name: 'description', label: '沟通内容', type: 'textarea', required: true },
        { name: 'nextContactTime', label: '下次联系时间', type: 'date' },
        { name: 'promiseAmount', label: '承诺金额', type: 'number' }
      ]
    },
    {
      id: '2',
      name: '批量还款记录',
      type: 'PAYMENT',
      description: '批量记录还款信息',
      isDefault: true,
      fields: [
        { name: 'paymentAmount', label: '还款金额', type: 'number', required: true },
        { name: 'paymentDate', label: '还款日期', type: 'date', required: true },
        { name: 'paymentMethod', label: '还款方式', type: 'select', required: true,
          options: [
            { label: '银行转账', value: 'BANK_TRANSFER' },
            { label: '支付宝', value: 'ALIPAY' },
            { label: '微信', value: 'WECHAT' },
            { label: '现金', value: 'CASH' }
          ]
        },
        { name: 'transactionNo', label: '交易流水号', type: 'text' },
        { name: 'remark', label: '备注', type: 'textarea' }
      ]
    },
    {
      id: '3',
      name: '批量发送催收函',
      type: 'DOCUMENT',
      description: '批量生成并发送催收函',
      isDefault: true,
      fields: [
        { name: 'documentType', label: '文书类型', type: 'select', required: true,
          options: [
            { label: '催收函', value: 'DEMAND_LETTER' },
            { label: '律师函', value: 'LAWYER_LETTER' },
            { label: '和解协议', value: 'SETTLEMENT' }
          ]
        },
        { name: 'sendMethod', label: '发送方式', type: 'select', required: true,
          options: [
            { label: 'EMS', value: 'EMS' },
            { label: '顺丰快递', value: 'SF_EXPRESS' },
            { label: '电子邮件', value: 'EMAIL' },
            { label: '短信', value: 'SMS' }
          ]
        },
        { name: 'deadline', label: '限期日期', type: 'date', required: true },
        { name: 'attachments', label: '附件', type: 'text' }
      ]
    },
    {
      id: '4',
      name: '批量外访记录',
      type: 'VISIT',
      description: '批量记录外访结果',
      isDefault: true,
      fields: [
        { name: 'visitDate', label: '外访日期', type: 'date', required: true },
        { name: 'visitAddress', label: '外访地址', type: 'text', required: true },
        { name: 'visitResult', label: '外访结果', type: 'select', required: true,
          options: [
            { label: '见到本人', value: 'MET_PERSON' },
            { label: '见到家属', value: 'MET_FAMILY' },
            { label: '无人在家', value: 'NO_ONE_HOME' },
            { label: '地址错误', value: 'WRONG_ADDRESS' }
          ]
        },
        { name: 'visitTeam', label: '外访人员', type: 'text', required: true },
        { name: 'description', label: '外访记录', type: 'textarea', required: true }
      ]
    }
  ];

  useEffect(() => {
    // 加载模板
    setTemplates(defaultTemplates);
    
    // 如果有选中的案件，设置选中的案件ID
    if (selectedCases.length > 0) {
      setSelectedCaseIds(selectedCases.map(c => c.id));
    }
  }, [selectedCases]);

  // 表格列定义
  const caseColumns: ColumnsType<CaseInfo> = [
    {
      title: '案件编号',
      dataIndex: 'caseNo',
      key: 'caseNo',
      width: 120
    },
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName',
      width: 100
    },
    {
      title: '手机号',
      dataIndex: 'debtorPhone',
      key: 'debtorPhone',
      width: 120
    },
    {
      title: '剩余金额',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      render: (amount: number) => `¥${amount.toLocaleString()}`
    },
    {
      title: '案件状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
          PENDING: { color: 'default', label: '待处理' },
          IN_PROGRESS: { color: 'processing', label: '处理中' },
          COMPLETED: { color: 'success', label: '已完成' }
        };
        return (
          <Tag color={statusMap[status]?.color || 'default'}>
            {statusMap[status]?.label || status}
          </Tag>
        );
      }
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100
    },
    {
      title: '最近进度',
      dataIndex: 'lastProgressTime',
      key: 'lastProgressTime',
      width: 150,
      render: (time: string) => time ? moment(time).format('YYYY-MM-DD HH:mm') : '-'
    }
  ];

  // 结果表格列
  const resultColumns: ColumnsType<BatchProgressResult> = [
    {
      title: '案件编号',
      dataIndex: 'caseNo',
      key: 'caseNo',
      width: 120
    },
    {
      title: '处理结果',
      dataIndex: 'success',
      key: 'success',
      width: 100,
      render: (success: boolean) => (
        success ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>成功</Tag>
        ) : (
          <Tag color="error" icon={<CloseOutlined />}>失败</Tag>
        )
      )
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: '进度ID',
      dataIndex: 'progressId',
      key: 'progressId',
      width: 150,
      render: (id: string) => id ? (
        <Text copyable={{ text: id }}>
          {id.substring(0, 8)}...
        </Text>
      ) : '-'
    }
  ];

  // 选择模板
  const handleSelectTemplate = (template: BatchProgressTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep(1);
  };

  // 创建自定义模板
  const handleCreateCustomTemplate = () => {
    setCustomTemplate(true);
    setCurrentStep(1);
  };

  // 填写进度信息
  const handleFillProgress = () => {
    form.validateFields().then(values => {
      setProgressData(values);
      setCurrentStep(2);
    });
  };

  // 执行批量操作
  const handleExecuteBatch = async () => {
    setProcessing(true);
    
    try {
      // 模拟批量处理
      const mockResults: BatchProgressResult[] = selectedCases.map(caseInfo => ({
        caseId: caseInfo.id,
        caseNo: caseInfo.caseNo,
        success: Math.random() > 0.1, // 90%成功率
        message: Math.random() > 0.1 ? '进度记录成功' : '处理失败：系统错误',
        progressId: `PROG${Date.now()}${Math.random().toString(36).substr(2, 9)}`
      }));

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResults(mockResults);
      setCurrentStep(3);
      
      const successCount = mockResults.filter(r => r.success).length;
      const messageKey = `batch-progress-success-${Date.now()}`;
      message.success({
        content: `批量操作完成：成功 ${successCount} 个，失败 ${mockResults.length - successCount} 个`,
        duration: 3,
        key: messageKey,
        onClick: () => {
          message.destroy(messageKey);
        }
      });
      // 保险措施：3.2秒后强制清理
      setTimeout(() => message.destroy(messageKey), 3200);
      
      if (onSuccess) {
        onSuccess(mockResults);
      }
    } catch (error) {
      message.error('批量操作失败');
    } finally {
      setProcessing(false);
    }
  };

  // 重试失败的案件
  const handleRetryFailed = async () => {
    const failedCases = results.filter(r => !r.success);
    if (failedCases.length === 0) {
      message.info('没有失败的案件需要重试');
      return;
    }

    setProcessing(true);
    
    try {
      // 模拟重试
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const retryResults = failedCases.map(failed => ({
        ...failed,
        success: Math.random() > 0.3, // 70%成功率
        message: Math.random() > 0.3 ? '重试成功' : '重试失败'
      }));

      // 更新结果
      const newResults = results.map(r => {
        const retryResult = retryResults.find(rr => rr.caseId === r.caseId);
        return retryResult || r;
      });

      setResults(newResults);
      
      const successCount = retryResults.filter(r => r.success).length;
      message.success(`重试完成：成功 ${successCount} 个，失败 ${retryResults.length - successCount} 个`);
    } catch (error) {
      message.error('重试失败');
    } finally {
      setProcessing(false);
    }
  };

  // 导出结果
  const handleExportResults = () => {
    message.info('正在导出批量操作结果...');
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // 选择模板
        return (
          <div>
            <Alert
              message={`已选择 ${selectedCases.length} 个案件进行批量进度操作`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Title level={5}>选择操作模板</Title>
            <Row gutter={[16, 16]}>
              {templates.map(template => (
                <Col span={12} key={template.id}>
                  <Card
                    hoverable
                    onClick={() => handleSelectTemplate(template)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Meta
                      avatar={
                        template.type === 'CONTACT' ? <PhoneOutlined style={{ fontSize: 24 }} /> :
                        template.type === 'PAYMENT' ? <DollarOutlined style={{ fontSize: 24 }} /> :
                        template.type === 'DOCUMENT' ? <FileTextOutlined style={{ fontSize: 24 }} /> :
                        <TeamOutlined style={{ fontSize: 24 }} />
                      }
                      title={template.name}
                      description={template.description}
                    />
                    {template.isDefault && (
                      <Tag color="blue" style={{ marginTop: 8 }}>系统模板</Tag>
                    )}
                  </Card>
                </Col>
              ))}
              <Col span={12}>
                <Card
                  hoverable
                  onClick={handleCreateCustomTemplate}
                  style={{ 
                    cursor: 'pointer',
                    borderStyle: 'dashed',
                    minHeight: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Space direction="vertical" align="center">
                    <PlusOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                    <Text>自定义进度</Text>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>案件列表</Title>
            <Table
              columns={caseColumns}
              dataSource={selectedCases}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 300 }}
            />
          </div>
        );

      case 1: // 填写进度信息
        return (
          <div>
            <Alert
              message={`正在为 ${selectedCases.length} 个案件${selectedTemplate ? `使用"${selectedTemplate.name}"模板` : ''}录入进度`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form
              form={form}
              layout="vertical"
              initialValues={progressData}
            >
              {selectedTemplate ? (
                selectedTemplate.fields.map(field => (
                  <Form.Item
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    rules={[{ required: field.required, message: `请输入${field.label}` }]}
                  >
                    {field.type === 'text' ? (
                      <Input placeholder={`请输入${field.label}`} />
                    ) : field.type === 'number' ? (
                      <InputNumber style={{ width: '100%' }} placeholder={`请输入${field.label}`} />
                    ) : field.type === 'date' ? (
                      <DatePicker style={{ width: '100%' }} placeholder={`请选择${field.label}`} />
                    ) : field.type === 'select' ? (
                      <Select placeholder={`请选择${field.label}`}>
                        {field.options?.map(opt => (
                          <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                        ))}
                      </Select>
                    ) : field.type === 'textarea' ? (
                      <TextArea rows={3} placeholder={`请输入${field.label}`} />
                    ) : null}
                  </Form.Item>
                ))
              ) : (
                // 自定义进度表单
                <>
                  <Form.Item
                    name="progressType"
                    label="进度类型"
                    rules={[{ required: true, message: '请选择进度类型' }]}
                  >
                    <Select placeholder="请选择进度类型">
                      <Option value="CONTACT">联系记录</Option>
                      <Option value="PAYMENT">还款记录</Option>
                      <Option value="VISIT">外访记录</Option>
                      <Option value="NEGOTIATION">协商记录</Option>
                      <Option value="LEGAL">法律行动</Option>
                      <Option value="OTHER">其他</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="title"
                    label="进度标题"
                    rules={[{ required: true, message: '请输入进度标题' }]}
                  >
                    <Input placeholder="请输入进度标题" />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="进度描述"
                    rules={[{ required: true, message: '请输入进度描述' }]}
                  >
                    <TextArea rows={4} placeholder="请输入进度描述" />
                  </Form.Item>
                  <Form.Item
                    name="result"
                    label="处理结果"
                  >
                    <TextArea rows={2} placeholder="请输入处理结果" />
                  </Form.Item>
                  <Form.Item
                    name="nextAction"
                    label="下一步行动"
                  >
                    <Input placeholder="请输入下一步行动" />
                  </Form.Item>
                  <Form.Item
                    name="nextActionTime"
                    label="下次行动时间"
                  >
                    <DatePicker showTime style={{ width: '100%' }} placeholder="请选择下次行动时间" />
                  </Form.Item>
                </>
              )}

              <Form.Item>
                <Space>
                  <Button type="primary" onClick={handleFillProgress}>
                    下一步
                  </Button>
                  <Button onClick={() => setCurrentStep(0)}>
                    上一步
                  </Button>
                  <Button onClick={() => setPreviewModalVisible(true)}>
                    预览
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        );

      case 2: // 确认并执行
        return (
          <div>
            <Alert
              message="请确认批量操作信息"
              description="确认无误后点击执行按钮开始批量处理"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Card title="操作摘要" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="待处理案件"
                    value={selectedCases.length}
                    prefix={<FileTextOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="操作模板"
                    value={selectedTemplate?.name || '自定义进度'}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="预计耗时"
                    value={Math.ceil(selectedCases.length * 0.5)}
                    suffix="秒"
                  />
                </Col>
              </Row>
            </Card>

            <Card title="进度信息" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={1} size="small">
                {Object.entries(progressData).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {moment.isMoment(value) ? value.format('YYYY-MM-DD HH:mm') : String(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>

            <Card title="案件列表">
              <Table
                columns={caseColumns}
                dataSource={selectedCases}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ y: 200 }}
              />
            </Card>

            <Divider />

            <Space>
              <Button 
                type="primary" 
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={handleExecuteBatch}
                loading={processing}
              >
                执行批量操作
              </Button>
              <Button 
                size="large"
                onClick={() => setCurrentStep(1)}
                disabled={processing}
              >
                上一步
              </Button>
              <Button 
                size="large"
                onClick={onClose}
                disabled={processing}
              >
                取消
              </Button>
            </Space>
          </div>
        );

      case 3: // 显示结果
        const successCount = results.filter(r => r.success).length;
        const failedCount = results.length - successCount;

        return (
          <div>
            <Result
              status={failedCount === 0 ? 'success' : 'warning'}
              title="批量操作完成"
              subTitle={`成功: ${successCount} 个，失败: ${failedCount} 个`}
              extra={[
                failedCount > 0 && (
                  <Button 
                    key="retry"
                    type="primary"
                    onClick={handleRetryFailed}
                    loading={processing}
                  >
                    重试失败项
                  </Button>
                ),
                <Button key="export" onClick={handleExportResults}>
                  导出结果
                </Button>,
                <Button key="close" onClick={onClose}>
                  关闭
                </Button>
              ].filter(Boolean)}
            />

            <Card title="执行结果详情">
              <Table
                columns={resultColumns}
                dataSource={results}
                rowKey="caseId"
                size="small"
                pagination={false}
                scroll={{ y: 400 }}
                rowClassName={(record) => !record.success ? 'error-row' : ''}
              />
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="batch-progress-operations">
      <Card>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="选择模板" icon={<FileTextOutlined />} />
          <Step title="填写信息" icon={<EditOutlined />} />
          <Step title="确认执行" icon={<CheckCircleOutlined />} />
          <Step title="查看结果" icon={<FileTextOutlined />} />
        </Steps>

        <Spin spinning={processing} tip="正在处理...">
          {renderStepContent()}
        </Spin>
      </Card>

      {/* 预览弹窗 */}
      <Modal
        title="进度信息预览"
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={1000}
        bodyStyle={{ maxHeight: 'calc(80vh - 110px)', overflowY: 'auto' }}
      >
        <Descriptions bordered column={1}>
          {Object.entries(progressData).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              {moment.isMoment(value) ? value.format('YYYY-MM-DD HH:mm') : String(value)}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Modal>
    </div>
  );
};

export default BatchProgressOperations;