import React, { useState, useEffect } from 'react';
import {
  Card,
  Tag,
  Select,
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Tooltip,
  Popconfirm,
  message,
  Badge,
  Avatar,
  Alert,
  Checkbox,
  ColorPicker
} from 'antd';
import {
  TagsOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  ExclamationCircleOutlined as ExclamationTriangleOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  BugOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useApiRequest } from '@/hooks/useApiRequest';

const { Option } = Select;
const { Text, Title } = Typography;
const { CheckableTag } = Tag;

// 预定义标签类型
export const LABEL_TYPES = {
  PRIORITY: {
    code: 'PRIORITY',
    name: '优先级',
    color: '#ff4d4f',
    icon: <StarOutlined />,
    description: '案件优先级标识'
  },
  RISK: {
    code: 'RISK',
    name: '风险等级',
    color: '#faad14',
    icon: <WarningOutlined />,
    description: '案件风险评估等级'
  },
  STATUS: {
    code: 'STATUS',
    name: '处理状态',
    color: '#52c41a',
    icon: <CheckCircleOutlined />,
    description: '案件处理状态标识'
  },
  DIFFICULTY: {
    code: 'DIFFICULTY',
    name: '难度等级',
    color: '#1890ff',
    icon: <ThunderboltOutlined />,
    description: '案件处理难度评估'
  },
  SPECIAL: {
    code: 'SPECIAL',
    name: '特殊标记',
    color: '#722ed1',
    icon: <CrownOutlined />,
    description: '特殊情况标记'
  },
  CUSTOM: {
    code: 'CUSTOM',
    name: '自定义',
    color: '#13c2c2',
    icon: <TagsOutlined />,
    description: '自定义标签'
  }
};

// 预定义标签
export const PREDEFINED_LABELS = {
  // 优先级标签
  PRIORITY: [
    { code: 'HIGH_PRIORITY', name: '高优先级', color: '#ff4d4f', icon: <FireOutlined /> },
    { code: 'MEDIUM_PRIORITY', name: '中优先级', color: '#faad14', icon: <StarOutlined /> },
    { code: 'LOW_PRIORITY', name: '低优先级', color: '#52c41a', icon: <ClockCircleOutlined /> }
  ],
  // 风险等级标签
  RISK: [
    { code: 'HIGH_RISK', name: '高风险', color: '#ff4d4f', icon: <ExclamationTriangleOutlined /> },
    { code: 'MEDIUM_RISK', name: '中风险', color: '#faad14', icon: <WarningOutlined /> },
    { code: 'LOW_RISK', name: '低风险', color: '#52c41a', icon: <SafetyCertificateOutlined /> }
  ],
  // 处理状态标签
  STATUS: [
    { code: 'URGENT', name: '紧急处理', color: '#ff4d4f', icon: <ThunderboltOutlined /> },
    { code: 'NORMAL', name: '正常处理', color: '#1890ff', icon: <CheckCircleOutlined /> },
    { code: 'DELAYED', name: '延期处理', color: '#faad14', icon: <ClockCircleOutlined /> }
  ],
  // 难度等级标签
  DIFFICULTY: [
    { code: 'VERY_HARD', name: '极难', color: '#722ed1', icon: <CrownOutlined /> },
    { code: 'HARD', name: '困难', color: '#ff4d4f', icon: <BugOutlined /> },
    { code: 'MEDIUM', name: '中等', color: '#faad14', icon: <StarOutlined /> },
    { code: 'EASY', name: '简单', color: '#52c41a', icon: <HeartOutlined /> }
  ],
  // 特殊标记
  SPECIAL: [
    { code: 'VIP', name: 'VIP客户', color: '#722ed1', icon: <CrownOutlined /> },
    { code: 'DISPUTE', name: '争议案件', color: '#ff4d4f', icon: <ExclamationTriangleOutlined /> },
    { code: 'LEGAL', name: '法律程序', color: '#1890ff', icon: <SafetyCertificateOutlined /> },
    { code: 'SETTLEMENT', name: '和解中', color: '#52c41a', icon: <HeartOutlined /> }
  ]
};

interface CaseLabel {
  id?: number;
  code: string;
  name: string;
  type: string;
  color: string;
  icon?: string;
  description?: string;
  isSystem?: boolean;
  usageCount?: number;
  createdAt?: string;
  createdBy?: string;
}

interface CaseLabelsManagementProps {
  caseId: string;
  currentLabels?: string[];
  onLabelsChange?: (labels: string[]) => void;
  mode?: 'view' | 'edit' | 'manage';
  showStatistics?: boolean;
}

const CaseLabelsManagement: React.FC<CaseLabelsManagementProps> = ({
  caseId,
  currentLabels = [],
  onLabelsChange,
  mode = 'edit',
  showStatistics = true
}) => {
  const [selectedLabels, setSelectedLabels] = useState<string[]>(currentLabels);
  const [availableLabels, setAvailableLabels] = useState<CaseLabel[]>([]);
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingLabel, setEditingLabel] = useState<CaseLabel | null>(null);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [form] = Form.useForm();

  // 加载可用标签
  const { loading: loadingLabels, execute: loadAvailableLabels } = useApiRequest(async () => {
    // 模拟API调用，加载系统预定义标签和自定义标签
    const systemLabels: CaseLabel[] = [];
    
    Object.entries(PREDEFINED_LABELS).forEach(([type, labels]) => {
      labels.forEach(label => {
        systemLabels.push({
          id: Math.random(),
          code: label.code,
          name: label.name,
          type: type,
          color: label.color,
          icon: label.icon?.type?.displayName,
          isSystem: true,
          usageCount: Math.floor(Math.random() * 100)
        });
      });
    });

    // 添加一些自定义标签
    const customLabels: CaseLabel[] = [
      {
        id: Math.random(),
        code: 'COOPERATIVE',
        name: '配合度高',
        type: 'CUSTOM',
        color: '#52c41a',
        isSystem: false,
        usageCount: 45,
        description: '债务人配合度较高，沟通顺畅'
      },
      {
        id: Math.random(),
        code: 'UNCOOPERATIVE',
        name: '不配合',
        type: 'CUSTOM',
        color: '#ff4d4f',
        isSystem: false,
        usageCount: 23,
        description: '债务人不配合，拒绝沟通'
      }
    ];

    const allLabels = [...systemLabels, ...customLabels];
    setAvailableLabels(allLabels);
    return allLabels;
  });

  // 保存标签变更
  const { loading: savingLabels, execute: saveLabels } = useApiRequest(async (labels: string[]) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    message.success('标签更新成功');
    onLabelsChange?.(labels);
    return true;
  });

  // 创建自定义标签
  const { loading: creatingLabel, execute: createLabel } = useApiRequest(async (labelData: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newLabel: CaseLabel = {
      id: Math.random(),
      ...labelData,
      isSystem: false,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    setAvailableLabels(prev => [...prev, newLabel]);
    message.success('自定义标签创建成功');
    return newLabel;
  });

  useEffect(() => {
    loadAvailableLabels();
  }, []);

  useEffect(() => {
    setSelectedLabels(currentLabels);
  }, [currentLabels]);

  // 处理标签选择/取消选择
  const handleLabelToggle = (labelCode: string, checked: boolean) => {
    let newLabels;
    if (checked) {
      newLabels = [...selectedLabels, labelCode];
    } else {
      newLabels = selectedLabels.filter(code => code !== labelCode);
    }
    setSelectedLabels(newLabels);
    
    if (mode === 'edit') {
      saveLabels(newLabels);
    }
  };

  // 打开标签管理对话框
  const handleOpenLabelModal = () => {
    setLabelModalVisible(true);
  };

  // 打开创建标签对话框
  const handleCreateLabel = () => {
    form.resetFields();
    setEditingLabel(null);
    setCreateModalVisible(true);
  };

  // 编辑标签
  const handleEditLabel = (label: CaseLabel) => {
    form.setFieldsValue(label);
    setEditingLabel(label);
    setCreateModalVisible(true);
  };

  // 删除标签
  const handleDeleteLabel = async (labelId: number) => {
    setAvailableLabels(prev => prev.filter(label => label.id !== labelId));
    message.success('标签删除成功');
  };

  // 提交标签创建/编辑
  const handleSubmitLabel = async () => {
    try {
      const values = await form.validateFields();
      await createLabel(values);
      setCreateModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 获取过滤后的标签
  const getFilteredLabels = () => {
    if (selectedType === 'ALL') {
      return availableLabels;
    }
    return availableLabels.filter(label => label.type === selectedType);
  };

  // 获取标签图标
  const getLabelIcon = (label: CaseLabel) => {
    if (label.type && PREDEFINED_LABELS[label.type as keyof typeof PREDEFINED_LABELS]) {
      const typeLabels = PREDEFINED_LABELS[label.type as keyof typeof PREDEFINED_LABELS];
      const predefinedLabel = typeLabels.find(l => l.code === label.code);
      return predefinedLabel?.icon;
    }
    return <TagsOutlined />;
  };

  // 获取已选标签的详细信息
  const getSelectedLabelDetails = () => {
    return selectedLabels.map(labelCode => 
      availableLabels.find(label => label.code === labelCode)
    ).filter(Boolean) as CaseLabel[];
  };

  const selectedLabelDetails = getSelectedLabelDetails();
  const filteredLabels = getFilteredLabels();

  return (
    <div className="case-labels-management">
      <Card 
        title={
          <Space>
            <TagsOutlined />
            <span>案件标识管理</span>
            {selectedLabels.length > 0 && (
              <Badge count={selectedLabels.length} />
            )}
          </Space>
        }
        extra={
          mode !== 'view' && (
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateLabel}
              >
                自定义标签
              </Button>
              <Button 
                icon={<EditOutlined />}
                onClick={handleOpenLabelModal}
              >
                管理标签
              </Button>
            </Space>
          )
        }
      >
        {/* 当前标签显示 */}
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>当前标签</Title>
          {selectedLabelDetails.length > 0 ? (
            <Space wrap>
              {selectedLabelDetails.map(label => (
                <Tag
                  key={label.code}
                  color={label.color}
                  icon={getLabelIcon(label)}
                  closable={mode === 'edit'}
                  onClose={() => handleLabelToggle(label.code, false)}
                >
                  {label.name}
                </Tag>
              ))}
            </Space>
          ) : (
            <Text type="secondary">暂未设置标签</Text>
          )}
        </div>

        {mode === 'edit' && (
          <>
            <Divider />
            
            {/* 快速标签选择 */}
            <div>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>快速选择</Title>
                  <Select
                    value={selectedType}
                    onChange={setSelectedType}
                    style={{ width: 200, marginBottom: 16 }}
                  >
                    <Option value="ALL">全部类型</Option>
                    {Object.values(LABEL_TYPES).map(type => (
                      <Option key={type.code} value={type.code}>
                        <Space>
                          {type.icon}
                          {type.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              <Space wrap>
                {filteredLabels.map(label => (
                  <CheckableTag
                    key={label.code}
                    checked={selectedLabels.includes(label.code)}
                    onChange={(checked) => handleLabelToggle(label.code, checked)}
                  >
                    <Space>
                      {getLabelIcon(label)}
                      {label.name}
                      {showStatistics && label.usageCount !== undefined && (
                        <Badge 
                          count={label.usageCount} 
                          size="small"
                          style={{ backgroundColor: '#f0f0f0', color: '#999' }}
                        />
                      )}
                    </Space>
                  </CheckableTag>
                ))}
              </Space>
            </div>
          </>
        )}

        {/* 标签统计 */}
        {showStatistics && mode === 'view' && (
          <>
            <Divider />
            <Row gutter={16}>
              {Object.values(LABEL_TYPES).map(type => {
                const typeLabels = selectedLabelDetails.filter(label => label.type === type.code);
                return (
                  <Col key={type.code} span={8}>
                    <Card size="small">
                      <Space>
                        {type.icon}
                        <div>
                          <Text strong>{type.name}</Text>
                          <div>
                            <Badge count={typeLabels.length} style={{ backgroundColor: type.color }} />
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </>
        )}
      </Card>

      {/* 标签管理对话框 */}
      <Modal
        title="标签管理"
        open={labelModalVisible}
        onCancel={() => setLabelModalVisible(false)}
        footer={null}
        width={800}
      >
        <Row gutter={16}>
          {Object.values(LABEL_TYPES).map(type => (
            <Col key={type.code} span={12} style={{ marginBottom: 16 }}>
              <Card 
                size="small" 
                title={
                  <Space>
                    {type.icon}
                    {type.name}
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {availableLabels
                    .filter(label => label.type === type.code)
                    .map(label => (
                      <div key={label.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tag color={label.color}>
                          <Space>
                            {getLabelIcon(label)}
                            {label.name}
                          </Space>
                        </Tag>
                        {!label.isSystem && (
                          <Space>
                            <Button 
                              type="text" 
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditLabel(label)}
                            />
                            <Popconfirm
                              title="确定要删除这个标签吗？"
                              onConfirm={() => handleDeleteLabel(label.id!)}
                            >
                              <Button 
                                type="text" 
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                              />
                            </Popconfirm>
                          </Space>
                        )}
                      </div>
                    ))}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* 创建/编辑标签对话框 */}
      <Modal
        title={editingLabel ? '编辑标签' : '创建自定义标签'}
        open={createModalVisible}
        onOk={handleSubmitLabel}
        onCancel={() => setCreateModalVisible(false)}
        confirmLoading={creatingLabel}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            label="标签名称" 
            name="name"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="输入标签名称" />
          </Form.Item>

          <Form.Item 
            label="标签类型" 
            name="type"
            rules={[{ required: true, message: '请选择标签类型' }]}
          >
            <Select placeholder="选择标签类型">
              {Object.values(LABEL_TYPES).map(type => (
                <Option key={type.code} value={type.code}>
                  <Space>
                    {type.icon}
                    {type.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label="标签颜色" 
            name="color"
            rules={[{ required: true, message: '请选择标签颜色' }]}
          >
            <Input type="color" />
          </Form.Item>

          <Form.Item 
            label="标签代码" 
            name="code"
            rules={[{ required: true, message: '请输入标签代码' }]}
          >
            <Input placeholder="输入标签代码（唯一标识）" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="输入标签描述（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CaseLabelsManagement;