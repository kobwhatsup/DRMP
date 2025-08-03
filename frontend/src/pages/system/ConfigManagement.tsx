import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Select,
  Form,
  Row,
  Col,
  Tag,
  Modal,
  Descriptions,
  Typography,
  message,
  Tooltip,
  Switch,
  Tabs,
  Divider,
  InputNumber,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined as RefreshOutlined,
  UndoOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Config {
  id: number;
  configKey: string;
  configValue: string;
  configGroup: string;
  configName: string;
  description: string;
  valueType: string;
  valueTypeDesc: string;
  isEncrypted: boolean;
  isSystem: boolean;
  editable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface QueryParams {
  page: number;
  size: number;
  configGroup?: string;
  configKey?: string;
  configName?: string;
  isSystem?: boolean;
  editable?: boolean;
  valueType?: string;
}

const ConfigManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<Config | null>(null);
  const [configGroups, setConfigGroups] = useState<string[]>([]);
  const [groupStatistics, setGroupStatistics] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState('all');

  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 0,
    size: 20,
  });

  // 值类型选项
  const valueTypes = [
    { value: 'STRING', label: '字符串' },
    { value: 'NUMBER', label: '数字' },
    { value: 'BOOLEAN', label: '布尔值' },
    { value: 'JSON', label: 'JSON对象' },
    { value: 'ARRAY', label: '数组' },
  ];

  useEffect(() => {
    fetchConfigs();
    fetchConfigGroups();
    fetchGroupStatistics();
  }, [queryParams, activeTab]);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      // 根据tab设置查询条件
      const params = { ...queryParams };
      if (activeTab === 'system') {
        params.isSystem = true;
      } else if (activeTab === 'user') {
        params.isSystem = false;
      }

      // 模拟API调用
      const mockData = {
        content: [
          {
            id: 1,
            configKey: 'system.title',
            configValue: 'DRMP全国分散诉调平台',
            configGroup: 'system',
            configName: '系统标题',
            description: '系统页面标题',
            valueType: 'STRING',
            valueTypeDesc: '字符串',
            isEncrypted: false,
            isSystem: true,
            editable: true,
            sortOrder: 1,
            createdAt: '2024-01-01 00:00:00',
            updatedAt: '2024-01-15 10:00:00',
          },
          {
            id: 2,
            configKey: 'security.password.min.length',
            configValue: '8',
            configGroup: 'security',
            configName: '密码最小长度',
            description: '用户密码最小长度要求',
            valueType: 'NUMBER',
            valueTypeDesc: '数字',
            isEncrypted: false,
            isSystem: true,
            editable: true,
            sortOrder: 1,
            createdAt: '2024-01-01 00:00:00',
            updatedAt: '2024-01-10 15:30:00',
          },
          {
            id: 3,
            configKey: 'notification.email.enabled',
            configValue: 'true',
            configGroup: 'notification',
            configName: '邮件通知',
            description: '是否启用邮件通知',
            valueType: 'BOOLEAN',
            valueTypeDesc: '布尔值',
            isEncrypted: false,
            isSystem: false,
            editable: true,
            sortOrder: 1,
            createdAt: '2024-01-01 00:00:00',
            updatedAt: '2024-01-12 09:20:00',
          },
        ],
        totalElements: 3,
      };

      setConfigs(mockData.content);
      setTotal(mockData.totalElements);
    } catch (error) {
      message.error('获取配置列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigGroups = async () => {
    try {
      // 模拟API调用
      const mockGroups = ['system', 'security', 'notification', 'file'];
      setConfigGroups(mockGroups);
    } catch (error) {
      console.error('获取配置组失败', error);
    }
  };

  const fetchGroupStatistics = async () => {
    try {
      // 模拟API调用
      const mockStats = {
        system: 5,
        security: 8,
        notification: 3,
        file: 4,
      };
      setGroupStatistics(mockStats);
    } catch (error) {
      console.error('获取配置组统计失败', error);
    }
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setQueryParams({
      ...queryParams,
      page: 0,
      ...values,
    });
  };

  const handleReset = () => {
    form.resetFields();
    setQueryParams({
      page: 0,
      size: 20,
    });
  };

  const handleTableChange = (pagination: any) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current - 1,
      size: pagination.pageSize,
    });
  };

  const handleCreate = () => {
    setCurrentConfig(null);
    editForm.resetFields();
    setEditModalVisible(true);
  };

  const handleEdit = (config: Config) => {
    setCurrentConfig(config);
    editForm.setFieldsValue({
      ...config,
      configValue: config.isEncrypted ? '' : config.configValue,
    });
    setEditModalVisible(true);
  };

  const handleDelete = (config: Config) => {
    Modal.confirm({
      title: '确认删除',
      content: `是否删除配置"${config.configName}"？`,
      onOk: async () => {
        try {
          message.success('删除成功');
          fetchConfigs();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的配置');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `是否删除选中的 ${selectedRowKeys.length} 项配置？`,
      onOk: async () => {
        try {
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          fetchConfigs();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      
      if (currentConfig) {
        // 更新
        message.success('更新成功');
      } else {
        // 创建
        message.success('创建成功');
      }
      
      setEditModalVisible(false);
      fetchConfigs();
    } catch (error) {
      console.error('表单验证失败', error);
    }
  };

  const handleResetToDefault = (config: Config) => {
    Modal.confirm({
      title: '确认重置',
      content: `是否将配置"${config.configName}"重置为默认值？`,
      onOk: async () => {
        try {
          message.success('重置成功');
          fetchConfigs();
        } catch (error) {
          message.error('重置失败');
        }
      },
    });
  };

  const handleRefreshCache = () => {
    Modal.confirm({
      title: '确认刷新',
      content: '是否刷新配置缓存？操作后新配置将立即生效。',
      onOk: async () => {
        try {
          message.success('缓存刷新成功');
        } catch (error) {
          message.error('缓存刷新失败');
        }
      },
    });
  };

  const getValueTypeTag = (type: string, desc: string) => {
    const colorMap: { [key: string]: string } = {
      STRING: 'blue',
      NUMBER: 'green',
      BOOLEAN: 'orange',
      JSON: 'purple',
      ARRAY: 'cyan',
    };
    return <Tag color={colorMap[type] || 'default'}>{desc}</Tag>;
  };

  const renderConfigValue = (config: Config) => {
    if (config.isEncrypted) {
      return <Text type="secondary">******</Text>;
    }

    let displayValue = config.configValue;
    if (config.valueType === 'BOOLEAN') {
      return (
        <Switch
          checked={config.configValue === 'true'}
          disabled
          size="small"
        />
      );
    }

    if (displayValue && displayValue.length > 50) {
      return (
        <Tooltip title={displayValue}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {displayValue}
          </Text>
        </Tooltip>
      );
    }

    return <Text code>{displayValue}</Text>;
  };

  const columns: ColumnsType<Config> = [
    {
      title: '配置名称',
      dataIndex: 'configName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '配置键',
      dataIndex: 'configKey',
      width: 200,
      ellipsis: true,
      render: (key) => <Text code>{key}</Text>,
    },
    {
      title: '配置值',
      dataIndex: 'configValue',
      width: 200,
      render: (_, record) => renderConfigValue(record),
    },
    {
      title: '配置组',
      dataIndex: 'configGroup',
      width: 100,
      render: (group) => <Tag>{group}</Tag>,
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      width: 100,
      render: (type, record) => getValueTypeTag(type, record.valueTypeDesc),
    },
    {
      title: '属性',
      key: 'properties',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          {record.isSystem && <Badge color="blue" text="系统" />}
          {record.isEncrypted && <Badge color="red" text="加密" />}
          {!record.editable && <Badge color="orange" text="只读" />}
        </Space>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 150,
      render: (time) => time.split(' ')[0],
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!record.editable}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<UndoOutlined />}
            onClick={() => handleResetToDefault(record)}
            disabled={!record.editable}
          >
            重置
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={record.isSystem}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record: Config) => ({
      disabled: record.isSystem,
    }),
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部配置" key="all" />
          <TabPane tab="系统配置" key="system" />
          <TabPane tab="用户配置" key="user" />
        </Tabs>

        {/* 配置组统计 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {Object.entries(groupStatistics).map(([group, count]) => (
            <Col key={group}>
              <Badge count={count} style={{ backgroundColor: '#52c41a' }}>
                <Button
                  type={queryParams.configGroup === group ? 'primary' : 'default'}
                  size="small"
                  onClick={() => {
                    setQueryParams({
                      ...queryParams,
                      configGroup: queryParams.configGroup === group ? undefined : group,
                      page: 0,
                    });
                  }}
                >
                  {group}
                </Button>
              </Badge>
            </Col>
          ))}
        </Row>

        <Divider />

        {/* 搜索表单 */}
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="配置组" name="configGroup">
                <Select placeholder="请选择配置组" allowClear>
                  {configGroups.map(group => (
                    <Option key={group} value={group}>
                      {group}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="配置键" name="configKey">
                <Input placeholder="请输入配置键" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="配置名称" name="configName">
                <Input placeholder="请输入配置名称" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="值类型" name="valueType">
                <Select placeholder="请选择值类型" allowClear>
                  {valueTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                  >
                    搜索
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    重置
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                  >
                    新增配置
                  </Button>
                  <Button
                    icon={<RefreshOutlined />}
                    onClick={handleRefreshCache}
                  >
                    刷新缓存
                  </Button>
                  <Button icon={<ExportOutlined />}>
                    导出配置
                  </Button>
                  <Button icon={<ImportOutlined />}>
                    导入配置
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBatchDelete}
                    disabled={selectedRowKeys.length === 0}
                  >
                    批量删除
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* 表格 */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={configs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryParams.page + 1,
            pageSize: queryParams.size,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* 编辑弹窗 */}
      <Modal
        title={currentConfig ? '编辑配置' : '新增配置'}
        open={editModalVisible}
        onOk={handleModalOk}
        onCancel={() => setEditModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="配置键"
                name="configKey"
                rules={[{ required: true, message: '请输入配置键' }]}
              >
                <Input placeholder="请输入配置键" disabled={!!currentConfig} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="配置名称"
                name="configName"
                rules={[{ required: true, message: '请输入配置名称' }]}
              >
                <Input placeholder="请输入配置名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="配置组" name="configGroup">
                <Select placeholder="请选择配置组" allowClear>
                  {configGroups.map(group => (
                    <Option key={group} value={group}>
                      {group}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="值类型"
                name="valueType"
                rules={[{ required: true, message: '请选择值类型' }]}
              >
                <Select placeholder="请选择值类型">
                  {valueTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="配置值" name="configValue">
            <TextArea
              placeholder="请输入配置值"
              rows={3}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
          <Form.Item label="配置描述" name="description">
            <TextArea placeholder="请输入配置描述" rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="是否加密" name="isEncrypted" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="是否可编辑" name="editable" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="排序序号" name="sortOrder">
                <InputNumber min={0} placeholder="排序序号" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ConfigManagement;