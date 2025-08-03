import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Select, Button, Space, Steps, Row, Col, 
  Table, Tag, Modal, message, Alert, Divider, Typography, 
  Slider, Switch, InputNumber, Progress, Tooltip, Statistic,
  Tabs, Radio, Checkbox, Badge, Timeline, Rate
} from 'antd';
import {
  SettingOutlined, PlayCircleOutlined, StopOutlined, 
  RobotOutlined, UserOutlined, CheckCircleOutlined,
  ClockCircleOutlined, BarChartOutlined, ThunderboltOutlined,
  TeamOutlined, EnvironmentOutlined, DollarOutlined, CalendarOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { caseAssignmentService, casePackageService, type CasePackage, type CaseAssignment } from '@/services/caseService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;

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
           
            icon={<EditOutlined />}
            onClick={() => handleEditStrategy(record)}
          >
            配置
          </Button>
          <Button
           
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
           
            icon={<EditOutlined />}
            onClick={() => handleEditRule(record)}
          >
            编辑
          </Button>
          <Button
           
            icon={<PlayCircleOutlined />}
            onClick={() => handleTestRule(record)}
          >
            测试
          </Button>
          <Button
           
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

  const handleTestRule = async (rule: AssignmentRule) => {
    setTestModalVisible(true);
    // 模拟智能分案测试
    try {
      const testResult = await caseAssignmentService.testAssignmentRule(rule.id);
      message.success('分案测试完成');
    } catch (error) {
      message.error('分案测试失败');
    }
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

      {/* 智能测试分案弹窗 */}
      <Modal
        title="智能分案测试"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={null}
        width={1200}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="快速测试" key="1">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="案件包选择">
                    <Select placeholder="选择案件包进行测试">
                      <Option value="1">测试案件包A (100件)</Option>
                      <Option value="2">测试案件包B (200件)</Option>
                      <Option value="3">测试案件包C (500件)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="测试模式">
                    <Radio.Group defaultValue="simulation">
                      <Radio value="simulation">模拟分案</Radio>
                      <Radio value="preview">预览匹配</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="分案策略">
                    <Select placeholder="选择测试策略" defaultValue="INTELLIGENT">
                      {strategies.filter(s => s.enabled).map(strategy => (
                        <Option key={strategy.strategyName} value={strategy.strategyName}>
                          {strategy.description}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" icon={<ThunderboltOutlined />} block>
                  执行智能分案测试
                </Button>
              </Form.Item>

              <Divider>实时分案结果</Divider>
              
              {/* 分案进度 */}
              <div style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic title="总案件数" value={450} suffix="件" />
                  </Col>
                  <Col span={6}>
                    <Statistic title="已分配" value={340} suffix="件" valueStyle={{ color: '#52c41a' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="待分配" value={110} suffix="件" valueStyle={{ color: '#faad14' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="匹配度" value={87.5} suffix="%" valueStyle={{ color: '#1890ff' }} />
                  </Col>
                </Row>
                <Progress percent={75.6} status="active" style={{ marginTop: 16 }} />
              </div>

              {/* 分案结果 */}
              <div style={{ backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8 }}>
                <Title level={5}>智能匹配结果</Title>
                <Timeline>
                  <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                    <div>
                      <Text strong>华东调解中心</Text> - 分配120件案件
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        匹配度: 94% | 地域: 上海,江苏 | 专长: 金融纠纷调解
                      </div>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                    <div>
                      <Text strong>北京金诚律所</Text> - 分配85件案件
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        匹配度: 91% | 地域: 北京,天津 | 专长: 债权债务诉讼
                      </div>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="blue" dot={<ClockCircleOutlined />}>
                    <div>
                      <Text strong>南方处置公司</Text> - 分配135件案件
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        匹配度: 88% | 地域: 广东,湖南 | 专长: 综合处置
                      </div>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="orange" dot={<InfoCircleOutlined />}>
                    <div>
                      <Text strong>待匹配案件</Text> - 110件
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        原因: 地域覆盖不足，建议扩大匹配范围或调整策略权重
                      </div>
                    </div>
                  </Timeline.Item>
                </Timeline>
              </div>
            </Form>
          </TabPane>
          
          <TabPane tab="策略分析" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="策略权重分布" size="small">
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>地域匹配</Text>
                      <Text strong>40%</Text>
                    </div>
                    <Progress percent={40} strokeColor="#1890ff" size="small" />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>业绩权重</Text>
                      <Text strong>30%</Text>
                    </div>
                    <Progress percent={30} strokeColor="#52c41a" size="small" />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>负载均衡</Text>
                      <Text strong>20%</Text>
                    </div>
                    <Progress percent={20} strokeColor="#faad14" size="small" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>专业能力</Text>
                      <Text strong>10%</Text>
                    </div>
                    <Progress percent={10} strokeColor="#722ed1" size="small" />
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="机构能力评分" size="small">
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>华东调解中心</Text>
                      <Rate disabled defaultValue={5} style={{ fontSize: 14 }} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      综合评分: 9.4/10 | 处置效率: 95% | 回款率: 78%
                    </Text>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>北京金诚律所</Text>
                      <Rate disabled defaultValue={4} style={{ fontSize: 14 }} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      综合评分: 8.8/10 | 处置效率: 88% | 回款率: 82%
                    </Text>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>南方处置公司</Text>
                      <Rate disabled defaultValue={4} style={{ fontSize: 14 }} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      综合评分: 8.2/10 | 处置效率: 85% | 回款率: 75%
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Card title="AI推荐优化建议" size="small">
              <Alert
                message="智能分析建议"
                description={
                  <div>
                    <p>• 建议提高地域匹配权重至45%，可提升整体匹配度约3-5%</p>
                    <p>• 华东调解中心处置能力优秀，建议增加分配比例</p>
                    <p>• 110件待匹配案件主要分布在西北地区，建议寻找该地区合作机构</p>
                    <p>• 当前策略预期整体回款率76.8%，处置周期平均85天</p>
                  </div>
                }
                type="info"
                showIcon
              />
            </Card>
          </TabPane>
          
          <TabPane tab="历史对比" key="3">
            <Table
              size="small"
              columns={[
                { title: '测试时间', dataIndex: 'testTime', width: 150 },
                { title: '策略配置', dataIndex: 'strategy', width: 120 },
                { title: '案件数量', dataIndex: 'caseCount', width: 100 },
                { title: '匹配度', dataIndex: 'matchRate', width: 100, render: (rate: number) => `${rate}%` },
                { title: '预期回款率', dataIndex: 'recoveryRate', width: 120, render: (rate: number) => `${rate}%` },
                { title: '预期周期', dataIndex: 'period', width: 100, render: (days: number) => `${days}天` },
                { title: '操作', key: 'action', width: 120, render: () => (
                  <Space>
                    <Button type="link" size="small">查看</Button>
                    <Button type="link" size="small">应用</Button>
                  </Space>
                )}
              ]}
              dataSource={[
                { key: '1', testTime: '2024-01-20 14:30', strategy: '智能分案', caseCount: 450, matchRate: 87.5, recoveryRate: 76.8, period: 85 },
                { key: '2', testTime: '2024-01-19 16:20', strategy: '地域优先', caseCount: 380, matchRate: 92.1, recoveryRate: 74.2, period: 92 },
                { key: '3', testTime: '2024-01-18 10:15', strategy: '业绩优先', caseCount: 520, matchRate: 85.3, recoveryRate: 79.1, period: 78 },
              ]}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default AssignmentConfig;