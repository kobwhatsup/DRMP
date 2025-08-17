import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Select,
  Input,
  Radio,
  Space,
  Button,
  Typography,
  Card,
  Alert,
  Tag,
  Row,
  Col,
  Checkbox,
  message
} from 'antd';
import {
  ClockCircleOutlined,
  BellOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { storeBatchOperation } from '@/services/batchOperationService';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ReminderTemplate {
  id: string;
  name: string;
  description: string;
  type: 'FOLLOW_UP' | 'PAYMENT' | 'LEGAL' | 'REVIEW';
  defaultDays: number;
  content: string;
}

interface BatchReminderModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (result: any) => void;
  caseIds: string[];
}

const BatchReminderModal: React.FC<BatchReminderModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  caseIds
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reminderType, setReminderType] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ReminderTemplate | null>(null);
  const [reminderMethods, setReminderMethods] = useState<string[]>(['system']);

  // 提醒模板
  const reminderTemplates: ReminderTemplate[] = [
    {
      id: 'follow_up_3days',
      name: '3天后跟进提醒',
      description: '提醒3天后进行案件跟进',
      type: 'FOLLOW_UP',
      defaultDays: 3,
      content: '请跟进案件进展情况，联系债务人了解还款意愿'
    },
    {
      id: 'payment_reminder',
      name: '还款期限提醒',
      description: '提醒债务人还款期限临近',
      type: 'PAYMENT',
      defaultDays: 7,
      content: '您的还款期限即将到期，请及时还款避免产生额外费用'
    },
    {
      id: 'legal_action',
      name: '法律程序提醒',
      description: '提醒启动法律程序的时间节点',
      type: 'LEGAL',
      defaultDays: 15,
      content: '评估是否需要启动法律程序，准备相关法律文件'
    },
    {
      id: 'case_review',
      name: '案件复核提醒',
      description: '定期复核案件处理情况',
      type: 'REVIEW',
      defaultDays: 30,
      content: '复核案件处理效果，评估策略调整的必要性'
    },
    {
      id: 'urgent_follow',
      name: '紧急跟进提醒',
      description: '高优先级案件的紧急跟进',
      type: 'FOLLOW_UP',
      defaultDays: 1,
      content: '高优先级案件需要紧急跟进，请立即联系债务人'
    }
  ];

  useEffect(() => {
    if (visible) {
      setReminderType('template');
      setSelectedTemplate(null);
      setReminderMethods(['system']);
      form.resetFields();
      form.setFieldsValue({
        reminderDate: moment().add(3, 'days'),
        reminderTime: moment().add(1, 'hour')
      });
    }
  }, [visible, form]);

  // 选择模板
  const handleTemplateSelect = (template: ReminderTemplate) => {
    setSelectedTemplate(template);
    form.setFieldsValue({
      reminderDate: moment().add(template.defaultDays, 'days'),
      content: template.content
    });
  };

  // 提醒方式变更
  const handleReminderMethodChange = (methods: string[]) => {
    setReminderMethods(methods);
  };

  // 执行设置提醒
  const handleSetReminder = async () => {
    try {
      const values = await form.validateFields();
      
      if (reminderMethods.length === 0) {
        message.warning('请选择至少一种提醒方式');
        return;
      }

      setLoading(true);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        id: Date.now(),
        operationType: 'SET_REMINDER',
        operationTypeDesc: '批量设置提醒',
        operationName: selectedTemplate ? `设置${selectedTemplate.name}` : '设置自定义提醒',
        targetType: 'CASE',
        targetCount: caseIds.length,
        successCount: caseIds.length,
        failedCount: 0,
        status: 'COMPLETED',
        statusDesc: '设置完成',
        parameters: JSON.stringify({
          templateId: selectedTemplate?.id,
          reminderDate: values.reminderDate.format('YYYY-MM-DD'),
          reminderTime: values.reminderTime.format('HH:mm'),
          content: values.content,
          methods: reminderMethods,
          priority: values.priority,
          caseIds
        }),
        progressPercentage: 100,
        currentStep: '提醒设置完成',
        createdBy: 1,
        organizationId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        successRate: 100,
        isCompleted: true,
        executionTime: 1500,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      // 存储操作数据以便后续查询
      storeBatchOperation(result);
      onSuccess(result);
    } catch (error: any) {
      message.error(`设置提醒失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setReminderMethods(['system']);
    form.resetFields();
    onCancel();
  };

  // 获取类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FOLLOW_UP': return 'blue';
      case 'PAYMENT': return 'green';
      case 'LEGAL': return 'red';
      case 'REVIEW': return 'orange';
      default: return 'default';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined />
          <span>批量设置提醒</span>
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
          onClick={handleSetReminder}
        >
          设置提醒
        </Button>
      ]}
      width={1200}
      destroyOnClose
      bodyStyle={{ maxHeight: 'calc(80vh - 110px)', overflowY: 'auto' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 操作说明 */}
        <Alert
          message={`将为 ${caseIds.length} 个案件设置提醒`}
          description="系统将在指定时间通过选定的方式提醒相关人员进行案件处理"
          type="info"
          showIcon
        />

        {/* 提醒类型选择 */}
        <Card title="提醒设置方式" size="small">
          <Radio.Group
            value={reminderType}
            onChange={(e) => setReminderType(e.target.value)}
          >
            <Radio value="template">使用预定义模板</Radio>
            <Radio value="custom">自定义提醒</Radio>
          </Radio.Group>
        </Card>

        {/* 模板选择 */}
        {reminderType === 'template' && (
          <Card title="选择提醒模板" size="small">
            <Row gutter={[16, 16]}>
              {reminderTemplates.map(template => (
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
                        <BellOutlined />
                        <Text strong>{template.name}</Text>
                        <Tag color={getTypeColor(template.type)}>
                          {template.type}
                        </Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {template.description}
                      </Text>
                      <Tag color="cyan">
                        {template.defaultDays}天后提醒
                      </Tag>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* 提醒详情设置 */}
        <Card title="提醒详情" size="small">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              priority: 'medium',
              reminderDate: moment().add(3, 'days'),
              reminderTime: moment().add(1, 'hour')
            }}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="reminderDate"
                  label="提醒日期"
                  rules={[{ required: true, message: '请选择提醒日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current.isBefore(moment().startOf('day').toDate())}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="reminderTime"
                  label="提醒时间"
                  rules={[{ required: true, message: '请选择提醒时间' }]}
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="priority"
                  label="优先级"
                  rules={[{ required: true, message: '请选择优先级' }]}
                >
                  <Select>
                    <Option value="high">高优先级</Option>
                    <Option value="medium">中优先级</Option>
                    <Option value="low">低优先级</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="content"
                  label="提醒内容"
                  rules={[{ required: true, message: '请输入提醒内容' }]}
                >
                  <TextArea
                    placeholder="请输入提醒内容"
                    rows={3}
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* 提醒方式选择 */}
        <Card title="提醒方式" size="small">
          <Checkbox.Group
            value={reminderMethods}
            onChange={handleReminderMethodChange}
          >
            <Row gutter={[24, 16]}>
              <Col span={6}>
                <Checkbox value="system">
                  <Space>
                    <BellOutlined />
                    <span>系统通知</span>
                  </Space>
                </Checkbox>
              </Col>
              <Col span={6}>
                <Checkbox value="email">
                  <Space>
                    <MailOutlined />
                    <span>邮件提醒</span>
                  </Space>
                </Checkbox>
              </Col>
              <Col span={6}>
                <Checkbox value="sms">
                  <Space>
                    <MessageOutlined />
                    <span>短信提醒</span>
                  </Space>
                </Checkbox>
              </Col>
              <Col span={6}>
                <Checkbox value="phone">
                  <Space>
                    <PhoneOutlined />
                    <span>电话提醒</span>
                  </Space>
                </Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Card>

        {/* 操作说明 */}
        <Alert
          message="提醒说明"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>系统将在指定时间自动发送提醒</li>
              <li>提醒会发送给案件的当前处理人</li>
              <li>高优先级提醒会通过多种方式发送</li>
              <li>可以在案件详情页面查看和管理提醒</li>
            </ul>
          }
          type="info"
          showIcon={false}
        />
      </Space>
    </Modal>
  );
};

export default BatchReminderModal;