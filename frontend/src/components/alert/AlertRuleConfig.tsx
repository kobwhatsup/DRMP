import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Tabs,
  Alert,
  Popconfirm,
  message,
  Drawer,
  Divider,
  Typography,
  Tooltip,
  Badge,
  Empty,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  SettingOutlined,
  BellOutlined,
  ExperimentOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import {
  alertService,
  AlertRule,
  AlertType,
  AlertLevel,
  AlertCondition,
  AlertAction,
  ALERT_TYPE_CONFIG,
  ALERT_LEVEL_CONFIG
} from '../../services/alertService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface AlertRuleConfigProps {
  onRuleChange?: () => void;
}

const AlertRuleConfig: React.FC<AlertRuleConfigProps> = ({ onRuleChange }) => {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [templates, setTemplates] = useState<AlertRule[]>([]);
  const [testResult, setTestResult] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  
  const [form] = Form.useForm();

  // 加载规则列表
  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await alertService.getRules();
      setRules(data);
    } catch (error) {
      message.error('加载预警规则失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载模板
  const loadTemplates = async () => {
    try {
      const data = await alertService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  };

  useEffect(() => {
    loadRules();
    loadTemplates();
  }, []);

  // 创建/编辑规则
  const handleSubmit = async (values: any) => {
    try {
      if (editingRule) {
        await alertService.updateRule(editingRule.id, values);
        message.success('规则更新成功');
      } else {
        await alertService.createRule(values);
        message.success('规则创建成功');
      }
      setModalVisible(false);
      loadRules();
      onRuleChange?.();
    } catch (error) {
      message.error(editingRule ? '更新规则失败' : '创建规则失败');
    }
  };

  // 删除规则
  const handleDelete = async (ruleId: string) => {
    try {
      await alertService.deleteRule(ruleId);
      message.success('规则删除成功');
      loadRules();
      onRuleChange?.();
    } catch (error) {
      message.error('删除规则失败');
    }
  };

  // 切换规则状态
  const handleToggle = async (ruleId: string, enabled: boolean) => {
    try {
      await alertService.toggleRule(ruleId, enabled);
      message.success(enabled ? '规则已启用' : '规则已禁用');
      loadRules();
      onRuleChange?.();
    } catch (error) {
      message.error('切换规则状态失败');
    }
  };

  // 测试规则
  const handleTest = async () => {
    const values = form.getFieldsValue();
    try {
      const result = await alertService.testRule(values);
      setTestResult(result);
      if (result.success) {
        message.success('规则测试通过');
      } else {
        message.warning('规则测试未通过');
      }
    } catch (error) {
      message.error('规则测试失败');
    }
  };

  // 从模板创建
  const handleCreateFromTemplate = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        form.setFieldsValue({
          ...template,
          name: `${template.name} (副本)`
        });
        setModalVisible(true);
      }
    } catch (error) {
      message.error('加载模板失败');
    }
  };

  // 复制规则
  const handleCopy = (rule: AlertRule) => {
    form.setFieldsValue({
      ...rule,
      name: `${rule.name} (副本)`
    });
    setEditingRule(null);
    setModalVisible(true);
  };

  // 查看规则详情
  const handleViewDetails = (rule: AlertRule) => {
    setSelectedRule(rule);
    setDrawerVisible(true);
  };

  // 表格列定义
  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: AlertRule) => (
        <Space>
          <BellOutlined />
          <a onClick={() => handleViewDetails(record)}>{text}</a>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: AlertType) => (
        <Tag color="blue">{ALERT_TYPE_CONFIG[type]?.label || type}</Tag>
      )
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: AlertLevel) => (
        <Tag color={ALERT_LEVEL_CONFIG[level]?.color}>
          {ALERT_LEVEL_CONFIG[level]?.label}
        </Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: AlertRule) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleToggle(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (record: AlertRule) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRule(record);
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
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
          <Popconfirm
            title="确定删除这个规则吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 条件编辑器
  const ConditionEditor: React.FC<{ value?: AlertCondition[]; onChange?: (value: AlertCondition[]) => void }> = ({ value = [], onChange }) => {
    const addCondition = () => {
      onChange?.([...value, { field: '', operator: 'GT', value: '' }]);
    };

    const updateCondition = (index: number, field: keyof AlertCondition, val: any) => {
      const newConditions = [...value];
      newConditions[index] = { ...newConditions[index], [field]: val };
      onChange?.(newConditions);
    };

    const removeCondition = (index: number) => {
      onChange?.(value.filter((_, i) => i !== index));
    };

    return (
      <div>
        {value.map((condition, index) => (
          <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
            <Col span={8}>
              <Select
                placeholder="选择字段"
                value={condition.field}
                onChange={(val) => updateCondition(index, 'field', val)}
                style={{ width: '100%' }}
              >
                <Select.Option value="caseCount">案件数量</Select.Option>
                <Select.Option value="processingTime">处理时间</Select.Option>
                <Select.Option value="recoveryRate">回款率</Select.Option>
                <Select.Option value="successRate">成功率</Select.Option>
                <Select.Option value="costRate">成本率</Select.Option>
                <Select.Option value="errorRate">错误率</Select.Option>
                <Select.Option value="responseTime">响应时间</Select.Option>
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="操作符"
                value={condition.operator}
                onChange={(val) => updateCondition(index, 'operator', val)}
                style={{ width: '100%' }}
              >
                <Select.Option value="GT">大于</Select.Option>
                <Select.Option value="LT">小于</Select.Option>
                <Select.Option value="EQ">等于</Select.Option>
                <Select.Option value="NEQ">不等于</Select.Option>
                <Select.Option value="GTE">大于等于</Select.Option>
                <Select.Option value="LTE">小于等于</Select.Option>
              </Select>
            </Col>
            <Col span={8}>
              <InputNumber
                placeholder="值"
                value={condition.value}
                onChange={(val) => updateCondition(index, 'value', val)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={2}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeCondition(index)}
              />
            </Col>
          </Row>
        ))}
        <Button type="dashed" onClick={addCondition} block icon={<PlusOutlined />}>
          添加条件
        </Button>
      </div>
    );
  };

  // 动作编辑器
  const ActionEditor: React.FC<{ value?: AlertAction[]; onChange?: (value: AlertAction[]) => void }> = ({ value = [], onChange }) => {
    const addAction = () => {
      onChange?.([...value, { type: 'NOTIFICATION', config: {} }]);
    };

    const updateAction = (index: number, field: keyof AlertAction, val: any) => {
      const newActions = [...value];
      newActions[index] = { ...newActions[index], [field]: val };
      onChange?.(newActions);
    };

    const removeAction = (index: number) => {
      onChange?.(value.filter((_, i) => i !== index));
    };

    return (
      <div>
        {value.map((action, index) => (
          <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
            <Col span={8}>
              <Select
                placeholder="动作类型"
                value={action.type}
                onChange={(val) => updateAction(index, 'type', val)}
                style={{ width: '100%' }}
              >
                <Select.Option value="NOTIFICATION">系统通知</Select.Option>
                <Select.Option value="EMAIL">邮件通知</Select.Option>
                <Select.Option value="SMS">短信通知</Select.Option>
                <Select.Option value="WEBHOOK">Webhook</Select.Option>
                <Select.Option value="ESCALATE">升级处理</Select.Option>
              </Select>
            </Col>
            <Col span={14}>
              <Input
                placeholder="配置（JSON格式）"
                value={JSON.stringify(action.config)}
                onChange={(e) => {
                  try {
                    updateAction(index, 'config', JSON.parse(e.target.value));
                  } catch {}
                }}
              />
            </Col>
            <Col span={2}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeAction(index)}
              />
            </Col>
          </Row>
        ))}
        <Button type="dashed" onClick={addAction} block icon={<PlusOutlined />}>
          添加动作
        </Button>
      </div>
    );
  };

  return (
    <div className="alert-rule-config">
      <Card
        title={
          <Space>
            <SettingOutlined />
            <Title level={4} style={{ margin: 0 }}>预警规则配置</Title>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRule(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              新建规则
            </Button>
            <Button onClick={loadRules} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table
            dataSource={rules}
            columns={columns}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条规则`
            }}
          />
        </Spin>
      </Card>

      {/* 规则编辑模态框 */}
      <Modal
        title={editingRule ? '编辑预警规则' : '新建预警规则'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setTestResult(null);
        }}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="test" icon={<ExperimentOutlined />} onClick={handleTest}>
            测试规则
          </Button>,
          <Button key="submit" type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
            保存
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="规则名称"
                    rules={[{ required: true, message: '请输入规则名称' }]}
                  >
                    <Input placeholder="输入规则名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="预警类型"
                    rules={[{ required: true, message: '请选择预警类型' }]}
                  >
                    <Select placeholder="选择预警类型">
                      {Object.entries(ALERT_TYPE_CONFIG).map(([key, config]) => (
                        <Select.Option key={key} value={key}>
                          {config.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="level"
                    label="预警级别"
                    rules={[{ required: true, message: '请选择预警级别' }]}
                  >
                    <Select placeholder="选择预警级别">
                      {Object.entries(ALERT_LEVEL_CONFIG).map(([key, config]) => (
                        <Select.Option key={key} value={key}>
                          <Tag color={config.color}>{config.label}</Tag>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="enabled"
                    label="状态"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="description"
                    label="规则描述"
                  >
                    <TextArea rows={3} placeholder="输入规则描述" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="触发条件" key="conditions">
              <Form.Item
                name="conditions"
                label="触发条件"
                rules={[{ required: true, message: '请配置至少一个触发条件' }]}
              >
                <ConditionEditor />
              </Form.Item>
              <Form.Item
                name="schedule"
                label="执行计划（Cron表达式）"
              >
                <Input placeholder="例如：0 */5 * * * （每5分钟执行一次）" />
              </Form.Item>
            </TabPane>

            <TabPane tab="响应动作" key="actions">
              <Form.Item
                name="actions"
                label="响应动作"
                rules={[{ required: true, message: '请配置至少一个响应动作' }]}
              >
                <ActionEditor />
              </Form.Item>
            </TabPane>
          </Tabs>

          {testResult && (
            <Alert
              message={testResult.success ? '规则测试通过' : '规则测试未通过'}
              description={<pre>{JSON.stringify(testResult.result, null, 2)}</pre>}
              type={testResult.success ? 'success' : 'warning'}
              showIcon
              closable
              onClose={() => setTestResult(null)}
              style={{ marginTop: 16 }}
            />
          )}
        </Form>
      </Modal>

      {/* 规则详情抽屉 */}
      <Drawer
        title="规则详情"
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
      >
        {selectedRule && (
          <div>
            <Paragraph>
              <Text strong>规则名称：</Text> {selectedRule.name}
            </Paragraph>
            <Paragraph>
              <Text strong>类型：</Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {ALERT_TYPE_CONFIG[selectedRule.type]?.label}
              </Tag>
            </Paragraph>
            <Paragraph>
              <Text strong>级别：</Text>
              <Tag color={ALERT_LEVEL_CONFIG[selectedRule.level]?.color} style={{ marginLeft: 8 }}>
                {ALERT_LEVEL_CONFIG[selectedRule.level]?.label}
              </Tag>
            </Paragraph>
            <Paragraph>
              <Text strong>状态：</Text>
              <Badge
                status={selectedRule.enabled ? 'success' : 'default'}
                text={selectedRule.enabled ? '已启用' : '已禁用'}
                style={{ marginLeft: 8 }}
              />
            </Paragraph>
            <Paragraph>
              <Text strong>描述：</Text> {selectedRule.description}
            </Paragraph>
            
            <Divider />
            
            <Title level={5}>触发条件</Title>
            {selectedRule.conditions.map((condition, index) => (
              <Paragraph key={index}>
                {`${condition.field} ${condition.operator} ${condition.value} ${condition.unit || ''}`}
              </Paragraph>
            ))}
            
            <Divider />
            
            <Title level={5}>响应动作</Title>
            {selectedRule.actions.map((action, index) => (
              <Paragraph key={index}>
                <Tag>{action.type}</Tag>
                <Text code>{JSON.stringify(action.config)}</Text>
              </Paragraph>
            ))}
            
            <Divider />
            
            <Paragraph>
              <Text strong>创建时间：</Text> {new Date(selectedRule.createdAt).toLocaleString()}
            </Paragraph>
            <Paragraph>
              <Text strong>更新时间：</Text> {new Date(selectedRule.updatedAt).toLocaleString()}
            </Paragraph>
            <Paragraph>
              <Text strong>创建人：</Text> {selectedRule.createdBy}
            </Paragraph>
          </div>
        )}
      </Drawer>

      {/* 模板选择 */}
      {templates.length > 0 && (
        <Card title="预警规则模板" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            {templates.map(template => (
              <Col key={template.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  size="small"
                  onClick={() => handleCreateFromTemplate(template.id)}
                >
                  <Card.Meta
                    title={template.name}
                    description={template.description}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Tag color={ALERT_LEVEL_CONFIG[template.level]?.color}>
                      {ALERT_LEVEL_CONFIG[template.level]?.label}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default AlertRuleConfig;