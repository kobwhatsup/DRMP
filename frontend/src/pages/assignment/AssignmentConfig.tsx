import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  Space,
  Modal,
  Input,
  Switch,
  InputNumber,
  message,
  Typography,
  Divider,
  Tag,
  Row,
  Col
} from 'antd';
import {
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
// import { PageHeader } from '@ant-design/pro-layout'; // 已废弃，使用antd内置组件替代

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface AssignmentStrategy {
  strategyName: string;
  description: string;
  priority: number;
  enabled: boolean;
  configuration: {
    maxCasesPerOrganization?: number;
    regionWeight?: number;
    experienceWeight?: number;
    performanceWeight?: number;
    loadBalanceThreshold?: number;
    [key: string]: any;
  };
}

interface AssignmentRule {
  id: string;
  name: string;
  description: string;
  strategies: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const AssignmentConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [strategies, setStrategies] = useState<AssignmentStrategy[]>([]);
  const [rules, setRules] = useState<AssignmentRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AssignmentRule | null>(null);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

  // 获取可用策略
  const fetchStrategies = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockStrategies: AssignmentStrategy[] = [
        {
          strategyName: 'GEOGRAPHIC',
          description: '地域匹配策略',
          priority: 10,
          enabled: true,
          configuration: {
            regionWeight: 0.8,
            maxCasesPerOrganization: 100
          }
        },
        {
          strategyName: 'LOAD_BALANCE',
          description: '负载均衡策略',
          priority: 8,
          enabled: true,
          configuration: {
            loadBalanceThreshold: 80,
            maxCasesPerOrganization: 150
          }
        },
        {
          strategyName: 'PERFORMANCE',
          description: '业绩匹配策略',
          priority: 6,
          enabled: false,
          configuration: {
            performanceWeight: 0.7,
            experienceWeight: 0.3
          }
        }
      ];
      setStrategies(mockStrategies);
    } catch (error) {
      message.error('获取分案策略失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取分案规则
  const fetchRules = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockRules: AssignmentRule[] = [
        {
          id: '1',
          name: '默认分案规则',
          description: '适用于一般案件的默认分案策略',
          strategies: ['GEOGRAPHIC', 'LOAD_BALANCE'],
          enabled: true,
          createdAt: '2024-01-15 10:30:00',
          updatedAt: '2024-01-15 10:30:00'
        },
        {
          id: '2',
          name: '高价值案件规则',
          description: '适用于金额较大的重要案件',
          strategies: ['PERFORMANCE', 'GEOGRAPHIC'],
          enabled: true,
          createdAt: '2024-01-16 14:20:00',
          updatedAt: '2024-01-16 14:20:00'
        }
      ];
      setRules(mockRules);
    } catch (error) {
      message.error('获取分案规则失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
    fetchRules();
  }, []);

  // 策略表格列定义
  const strategyColumns = [
    {
      title: '策略名称',
      dataIndex: 'strategyName',
      key: 'strategyName',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a: AssignmentStrategy, b: AssignmentStrategy) => a.priority - b.priority
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (record: AssignmentStrategy) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditStrategy(record)}
          >
            配置
          </Button>
          <Button
            size="small"
            type={record.enabled ? 'default' : 'primary'}
            onClick={() => handleToggleStrategy(record)}
          >
            {record.enabled ? '禁用' : '启用'}
          </Button>
        </Space>
      )
    }
  ];

  // 规则表格列定义
  const ruleColumns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '应用策略',
      dataIndex: 'strategies',
      key: 'strategies',
      render: (strategies: string[]) => (
        <>
          {strategies.map(strategy => (
            <Tag key={strategy} color="blue">{strategy}</Tag>
          ))}
        </>
      )
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (record: AssignmentRule) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditRule(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleTestRule(record)}
          >
            测试
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRule(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleEditStrategy = (strategy: AssignmentStrategy) => {
    Modal.info({
      title: `配置策略: ${strategy.strategyName}`,
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          <Form layout="vertical">
            <Form.Item label="优先级">
              <InputNumber
                min={1}
                max={10}
                defaultValue={strategy.priority}
                style={{ width: '100%' }}
              />
            </Form.Item>
            {strategy.strategyName === 'GEOGRAPHIC' && (
              <Form.Item label="地域权重">
                <InputNumber
                  min={0}
                  max={1}
                  step={0.1}
                  defaultValue={strategy.configuration.regionWeight}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
            {strategy.strategyName === 'LOAD_BALANCE' && (
              <Form.Item label="负载阈值 (%)">
                <InputNumber
                  min={50}
                  max={100}
                  defaultValue={strategy.configuration.loadBalanceThreshold}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
            {strategy.strategyName === 'PERFORMANCE' && (
              <>
                <Form.Item label="业绩权重">
                  <InputNumber
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={strategy.configuration.performanceWeight}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label="经验权重">
                  <InputNumber
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={strategy.configuration.experienceWeight}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </>
            )}
            <Form.Item label="最大案件数">
              <InputNumber
                min={1}
                defaultValue={strategy.configuration.maxCasesPerOrganization}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </div>
      ),
      onOk() {
        message.success('策略配置已保存');
      }
    });
  };

  const handleToggleStrategy = (strategy: AssignmentStrategy) => {
    const newStrategies = strategies.map(s =>
      s.strategyName === strategy.strategyName
        ? { ...s, enabled: !s.enabled }
        : s
    );
    setStrategies(newStrategies);
    message.success(`策略已${strategy.enabled ? '禁用' : '启用'}`);
  };

  const handleEditRule = (rule?: AssignmentRule) => {
    setEditingRule(rule || null);
    if (rule) {
      form.setFieldsValue(rule);
      setSelectedStrategies(rule.strategies);
    } else {
      form.resetFields();
      setSelectedStrategies([]);
    }
    setModalVisible(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分案规则吗？',
      onOk() {
        setRules(rules.filter(rule => rule.id !== ruleId));
        message.success('规则已删除');
      }
    });
  };

  const handleTestRule = (rule: AssignmentRule) => {
    setTestModalVisible(true);
    // 这里可以添加测试逻辑
  };

  const handleSaveRule = async (values: any) => {
    try {
      const ruleData = {
        ...values,
        strategies: selectedStrategies,
        id: editingRule?.id || Date.now().toString(),
        createdAt: editingRule?.createdAt || new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString()
      };

      if (editingRule) {
        setRules(rules.map(rule => rule.id === editingRule.id ? ruleData : rule));
        message.success('规则已更新');
      } else {
        setRules([...rules, ruleData]);
        message.success('规则已创建');
      }

      setModalVisible(false);
      setEditingRule(null);
      form.resetFields();
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>分案配置</Title>
            <Text type="secondary">管理智能分案策略和规则</Text>
          </div>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => setTestModalVisible(true)}
          >
            测试分案
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={<><SettingOutlined /> 分案策略配置</>}
            extra={
              <Button type="link" icon={<InfoCircleOutlined />}>
                策略说明
              </Button>
            }
          >
            <Table
              dataSource={strategies}
              columns={strategyColumns}
              rowKey="strategyName"
              loading={loading}
              size="middle"
              pagination={false}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title="分案规则管理"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleEditRule()}
              >
                新建规则
              </Button>
            }
          >
            <Table
              dataSource={rules}
              columns={ruleColumns}
              rowKey="id"
              loading={loading}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      {/* 规则编辑弹窗 */}
      <Modal
        title={editingRule ? '编辑分案规则' : '新建分案规则'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRule(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRule}
        >
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="请输入规则名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="规则描述"
            rules={[{ required: true, message: '请输入规则描述' }]}
          >
            <TextArea rows={3} placeholder="请输入规则描述" />
          </Form.Item>

          <Form.Item
            label="应用策略"
            required
          >
            <Select
              mode="multiple"
              placeholder="选择要应用的策略"
              value={selectedStrategies}
              onChange={setSelectedStrategies}
              style={{ width: '100%' }}
            >
              {strategies.filter(s => s.enabled).map(strategy => (
                <Option key={strategy.strategyName} value={strategy.strategyName}>
                  {strategy.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="enabled"
            label="启用状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试分案弹窗 */}
      <Modal
        title="测试分案"
        visible={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical">
          <Form.Item label="案件包信息">
            <Input.Group compact>
              <Input style={{ width: '30%' }} placeholder="案件数量" />
              <Input style={{ width: '30%' }} placeholder="案件金额" />
              <Input style={{ width: '40%' }} placeholder="案件地域" />
            </Input.Group>
          </Form.Item>

          <Form.Item label="测试策略">
            <Select mode="multiple" placeholder="选择要测试的策略">
              {strategies.filter(s => s.enabled).map(strategy => (
                <Option key={strategy.strategyName} value={strategy.strategyName}>
                  {strategy.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" block>
              执行测试分案
            </Button>
          </Form.Item>

          <Divider>测试结果</Divider>
          <div style={{ minHeight: 200, backgroundColor: '#f5f5f5', padding: 16 }}>
            <Text type="secondary">
              这里将显示分案测试结果...
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignmentConfig;