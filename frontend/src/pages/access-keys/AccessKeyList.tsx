import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Popconfirm,
  Tooltip,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  StopOutlined,
  PlayCircleOutlined,
  KeyOutlined,
  ExportOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FormInstance } from 'antd/es/form';
import dayjs from 'dayjs';
import { accessKeyService } from '../../services/accessKeyService';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface AccessKey {
  id: number;
  keyId: string;
  keySecret?: string;
  name: string;
  description: string;
  keyTypeCode: string;
  keyTypeName: string;
  ownerType: string;
  ownerId: number;
  status: string;
  permissions: string;
  ipWhitelist: string;
  rateLimitPerMinute: number;
  expiresAt: string;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
}

interface AccessKeyFormData {
  name: string;
  description: string;
  keyTypeCode: string;
  ownerType: string;
  ownerId: number;
  permissions: string;
  ipWhitelist: string;
  rateLimitPerMinute: number;
  expiresAt?: dayjs.Dayjs;
}

const AccessKeyList: React.FC = () => {
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    ownerType: '',
    ownerId: '',
    status: '',
    keyTypeCode: '',
  });

  // 模态框状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState<AccessKey | null>(null);
  
  // 表单实例
  const [createForm] = Form.useForm<AccessKeyFormData>();
  const [editForm] = Form.useForm<AccessKeyFormData>();

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    suspended: 0,
  });

  // 加载数据
  const loadAccessKeys = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.current - 1,
        size: pagination.pageSize,
      };
      
      const response = await accessKeyService.getAccessKeys(params);
      setAccessKeys(response.data.content);
      setPagination(prev => ({
        ...prev,
        total: response.data.totalElements,
      }));

      // 计算统计数据
      const total = response.data.totalElements;
      const content = response.data.content;
      setStats({
        total,
        active: content.filter(key => key.status === 'ACTIVE').length,
        expired: content.filter(key => key.status === 'EXPIRED').length,
        suspended: content.filter(key => key.status === 'SUSPENDED').length,
      });
    } catch (error) {
      message.error('加载访问密钥列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccessKeys();
  }, [pagination.current, pagination.pageSize, filters]);

  // 创建密钥
  const handleCreate = async (values: AccessKeyFormData) => {
    try {
      const createData = {
        ...values,
        expiresAt: values.expiresAt?.toISOString(),
      };
      
      const response = await accessKeyService.createAccessKey(createData);
      
      // 显示新密钥信息
      Modal.info({
        title: '密钥创建成功',
        width: 600,
        content: (
          <div>
            <p><strong>密钥ID:</strong> {response.data.keyId}</p>
            <p><strong>密钥秘钥:</strong> 
              <Text code copyable style={{ color: 'red', marginLeft: 8 }}>
                {response.data.keySecret}
              </Text>
            </p>
            <p style={{ color: 'red', marginTop: 16 }}>
              ⚠️ 请立即复制并安全保存密钥秘钥，此信息只显示一次！
            </p>
          </div>
        ),
      });

      setCreateModalVisible(false);
      createForm.resetFields();
      loadAccessKeys();
      message.success('访问密钥创建成功');
    } catch (error) {
      message.error('创建访问密钥失败');
    }
  };

  // 更新密钥
  const handleUpdate = async (values: AccessKeyFormData) => {
    if (!currentKey) return;
    
    try {
      const updateData = {
        ...values,
        expiresAt: values.expiresAt?.toISOString(),
      };
      
      await accessKeyService.updateAccessKey(currentKey.id, updateData);
      setEditModalVisible(false);
      editForm.resetFields();
      setCurrentKey(null);
      loadAccessKeys();
      message.success('访问密钥更新成功');
    } catch (error) {
      message.error('更新访问密钥失败');
    }
  };

  // 吊销密钥
  const handleRevoke = async (key: AccessKey, reason: string) => {
    try {
      await accessKeyService.revokeAccessKey(key.id, reason);
      loadAccessKeys();
      message.success('访问密钥已吊销');
    } catch (error) {
      message.error('吊销访问密钥失败');
    }
  };

  // 暂停密钥
  const handleSuspend = async (key: AccessKey, reason: string) => {
    try {
      await accessKeyService.suspendAccessKey(key.id, reason);
      loadAccessKeys();
      message.success('访问密钥已暂停');
    } catch (error) {
      message.error('暂停访问密钥失败');
    }
  };

  // 激活密钥
  const handleActivate = async (key: AccessKey) => {
    try {
      await accessKeyService.activateAccessKey(key.id);
      loadAccessKeys();
      message.success('访问密钥已激活');
    } catch (error) {
      message.error('激活访问密钥失败');
    }
  };

  // 重新生成密钥
  const handleRegenerate = (key: AccessKey) => {
    Modal.confirm({
      title: '重新生成密钥秘钥',
      content: (
        <div>
          <p>确定要重新生成密钥 "{key.name}" 的秘钥吗？</p>
          <p style={{ color: 'red' }}>⚠️ 重新生成后，原秘钥将立即失效！</p>
          <Input.TextArea
            placeholder="请输入重新生成的原因"
            rows={3}
            onChange={(e) => {
              // 存储原因到临时变量
              (window as any).regenerateReason = e.target.value;
            }}
          />
        </div>
      ),
      onOk: async () => {
        const reason = (window as any).regenerateReason || '手动重新生成';
        try {
          const response = await accessKeyService.regenerateKeySecret(key.id, reason);
          
          Modal.info({
            title: '密钥重新生成成功',
            width: 600,
            content: (
              <div>
                <p><strong>新密钥秘钥:</strong> 
                  <Text code copyable style={{ color: 'red', marginLeft: 8 }}>
                    {response.data}
                  </Text>
                </p>
                <p style={{ color: 'red', marginTop: 16 }}>
                  ⚠️ 请立即复制并安全保存新的密钥秘钥，此信息只显示一次！
                </p>
              </div>
            ),
          });
          
          loadAccessKeys();
        } catch (error) {
          message.error('重新生成密钥失败');
        }
      },
    });
  };

  // 查看密钥详情
  const handleView = (key: AccessKey) => {
    setCurrentKey(key);
    setViewModalVisible(true);
  };

  // 编辑密钥
  const handleEdit = (key: AccessKey) => {
    setCurrentKey(key);
    editForm.setFieldsValue({
      name: key.name,
      description: key.description,
      permissions: key.permissions,
      ipWhitelist: key.ipWhitelist,
      rateLimitPerMinute: key.rateLimitPerMinute,
      expiresAt: key.expiresAt ? dayjs(key.expiresAt) : undefined,
    });
    setEditModalVisible(true);
  };

  // 状态标签渲染
  const renderStatusTag = (status: string) => {
    const statusMap = {
      ACTIVE: { color: 'green', text: '活跃' },
      EXPIRED: { color: 'orange', text: '过期' },
      REVOKED: { color: 'red', text: '吊销' },
      SUSPENDED: { color: 'gray', text: '暂停' },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<AccessKey> = [
    {
      title: '密钥名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '密钥ID',
      dataIndex: 'keyId',
      key: 'keyId',
      width: 200,
      render: (keyId) => (
        <Text code copyable ellipsis>
          {keyId}
        </Text>
      ),
    },
    {
      title: '类型',
      dataIndex: 'keyTypeName',
      key: 'keyTypeName',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: renderStatusTag,
    },
    {
      title: '所有者',
      key: 'owner',
      width: 120,
      render: (_, record) => `${record.ownerType}:${record.ownerId}`,
    },
    {
      title: '访问频率',
      dataIndex: 'rateLimitPerMinute',
      key: 'rateLimitPerMinute',
      width: 100,
      render: (rate) => `${rate}/分钟`,
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 120,
      render: (expiresAt) => expiresAt ? dayjs(expiresAt).format('YYYY-MM-DD') : '永不过期',
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      width: 120,
      render: (lastUsedAt) => lastUsedAt ? dayjs(lastUsedAt).format('YYYY-MM-DD HH:mm') : '从未使用',
    },
    {
      title: '请求统计',
      key: 'requests',
      width: 120,
      render: (_, record) => (
        <div>
          <div>总数: {record.totalRequests || 0}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            成功: {record.successfulRequests || 0} | 失败: {record.failedRequests || 0}
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          {record.status === 'ACTIVE' && (
            <>
              <Tooltip title="暂停">
                <Popconfirm
                  title="确定要暂停此密钥吗？"
                  onConfirm={() => handleSuspend(record, '手动暂停')}
                >
                  <Button type="text" icon={<StopOutlined />} />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="重新生成">
                <Button type="text" icon={<KeyOutlined />} onClick={() => handleRegenerate(record)} />
              </Tooltip>
            </>
          )}
          {record.status === 'SUSPENDED' && (
            <Tooltip title="激活">
              <Popconfirm
                title="确定要激活此密钥吗？"
                onConfirm={() => handleActivate(record)}
              >
                <Button type="text" icon={<PlayCircleOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
          <Tooltip title="吊销">
            <Popconfirm
              title="确定要吊销此密钥吗？吊销后无法恢复！"
              onConfirm={() => handleRevoke(record, '手动吊销')}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="总密钥数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="活跃密钥" value={stats.active} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="过期密钥" value={stats.expired} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="暂停密钥" value={stats.suspended} valueStyle={{ color: '#666' }} />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={18}>
            <Space wrap>
              <Select
                placeholder="所有者类型"
                allowClear
                style={{ width: 120 }}
                value={filters.ownerType}
                onChange={(value) => setFilters(prev => ({ ...prev, ownerType: value || '' }))}
              >
                <Option value="PLATFORM">平台</Option>
                <Option value="ORGANIZATION">机构</Option>
                <Option value="USER">用户</Option>
              </Select>
              
              <Input
                placeholder="所有者ID"
                allowClear
                style={{ width: 120 }}
                value={filters.ownerId}
                onChange={(e) => setFilters(prev => ({ ...prev, ownerId: e.target.value }))}
              />
              
              <Select
                placeholder="密钥状态"
                allowClear
                style={{ width: 120 }}
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
              >
                <Option value="ACTIVE">活跃</Option>
                <Option value="EXPIRED">过期</Option>
                <Option value="REVOKED">吊销</Option>
                <Option value="SUSPENDED">暂停</Option>
              </Select>
              
              <Select
                placeholder="密钥类型"
                allowClear
                style={{ width: 140 }}
                value={filters.keyTypeCode}
                onChange={(value) => setFilters(prev => ({ ...prev, keyTypeCode: value || '' }))}
              >
                <Option value="API_ACCESS">API访问</Option>
                <Option value="SYSTEM_INTEGRATION">系统集成</Option>
                <Option value="USER_ACCESS">用户访问</Option>
                <Option value="DATA_EXPORT">数据导出</Option>
                <Option value="WEBHOOK">Webhook</Option>
              </Select>
            </Space>
          </Col>
          
          <Col span={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadAccessKeys}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />}>
                导出
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                创建密钥
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table<AccessKey>
          columns={columns}
          dataSource={accessKeys}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page, size) => {
              setPagination(prev => ({ ...prev, current: page, pageSize: size || 20 }));
            },
          }}
        />
      </Card>

      {/* 创建密钥模态框 */}
      <Modal
        title="创建访问密钥"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="密钥名称"
            rules={[{ required: true, message: '请输入密钥名称' }]}
          >
            <Input placeholder="请输入密钥名称" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入密钥描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="keyTypeCode"
                label="密钥类型"
                rules={[{ required: true, message: '请选择密钥类型' }]}
              >
                <Select placeholder="请选择密钥类型">
                  <Option value="API_ACCESS">API访问密钥</Option>
                  <Option value="SYSTEM_INTEGRATION">系统集成密钥</Option>
                  <Option value="USER_ACCESS">用户访问密钥</Option>
                  <Option value="DATA_EXPORT">数据导出密钥</Option>
                  <Option value="WEBHOOK">Webhook密钥</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ownerType"
                label="所有者类型"
                rules={[{ required: true, message: '请选择所有者类型' }]}
              >
                <Select placeholder="请选择所有者类型">
                  <Option value="PLATFORM">平台</Option>
                  <Option value="ORGANIZATION">机构</Option>
                  <Option value="USER">用户</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ownerId"
                label="所有者ID"
                rules={[{ required: true, message: '请输入所有者ID' }]}
              >
                <InputNumber placeholder="请输入所有者ID" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rateLimitPerMinute"
                label="访问频率限制"
                initialValue={1000}
                rules={[{ required: true, message: '请输入访问频率限制' }]}
              >
                <InputNumber
                  placeholder="每分钟最大请求数"
                  min={1}
                  style={{ width: '100%' }}
                  addonAfter="次/分钟"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="expiresAt" label="过期时间">
            <DatePicker
              placeholder="选择过期时间，留空为永不过期"
              style={{ width: '100%' }}
              showTime
            />
          </Form.Item>

          <Form.Item name="ipWhitelist" label="IP白名单">
            <TextArea
              rows={3}
              placeholder='IP白名单，JSON格式，例如：["192.168.1.1", "10.0.0.0/8"]'
            />
          </Form.Item>

          <Form.Item name="permissions" label="权限配置">
            <TextArea
              rows={4}
              placeholder='权限配置，JSON格式，例如：{"endpoints": ["GET:/api/v1/*"], "operations": ["read"]}'
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑密钥模态框 */}
      <Modal
        title="编辑访问密钥"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setCurrentKey(null);
        }}
        onOk={() => editForm.submit()}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="name"
            label="密钥名称"
            rules={[{ required: true, message: '请输入密钥名称' }]}
          >
            <Input placeholder="请输入密钥名称" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入密钥描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="rateLimitPerMinute"
                label="访问频率限制"
                rules={[{ required: true, message: '请输入访问频率限制' }]}
              >
                <InputNumber
                  placeholder="每分钟最大请求数"
                  min={1}
                  style={{ width: '100%' }}
                  addonAfter="次/分钟"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiresAt" label="过期时间">
                <DatePicker
                  placeholder="选择过期时间"
                  style={{ width: '100%' }}
                  showTime
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ipWhitelist" label="IP白名单">
            <TextArea
              rows={3}
              placeholder='IP白名单，JSON格式，例如：["192.168.1.1", "10.0.0.0/8"]'
            />
          </Form.Item>

          <Form.Item name="permissions" label="权限配置">
            <TextArea
              rows={4}
              placeholder='权限配置，JSON格式，例如：{"endpoints": ["GET:/api/v1/*"], "operations": ["read"]}'
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看密钥详情模态框 */}
      <Modal
        title="访问密钥详情"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setCurrentKey(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {currentKey && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>密钥名称:</strong> {currentKey.name}</p>
                <p><strong>密钥ID:</strong> <Text code copyable>{currentKey.keyId}</Text></p>
                <p><strong>密钥类型:</strong> {currentKey.keyTypeName}</p>
                <p><strong>状态:</strong> {renderStatusTag(currentKey.status)}</p>
                <p><strong>所有者:</strong> {currentKey.ownerType}:{currentKey.ownerId}</p>
              </Col>
              <Col span={12}>
                <p><strong>访问频率:</strong> {currentKey.rateLimitPerMinute}/分钟</p>
                <p><strong>过期时间:</strong> {currentKey.expiresAt ? dayjs(currentKey.expiresAt).format('YYYY-MM-DD HH:mm:ss') : '永不过期'}</p>
                <p><strong>最后使用:</strong> {currentKey.lastUsedAt ? dayjs(currentKey.lastUsedAt).format('YYYY-MM-DD HH:mm:ss') : '从未使用'}</p>
                <p><strong>创建时间:</strong> {dayjs(currentKey.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
              </Col>
            </Row>
            
            <div style={{ marginTop: '16px' }}>
              <p><strong>描述:</strong></p>
              <p>{currentKey.description || '暂无描述'}</p>
            </div>

            <div style={{ marginTop: '16px' }}>
              <p><strong>权限配置:</strong></p>
              <Input.TextArea 
                value={currentKey.permissions || ''} 
                rows={4} 
                readOnly 
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <p><strong>IP白名单:</strong></p>
              <Input.TextArea 
                value={currentKey.ipWhitelist || ''} 
                rows={2} 
                readOnly 
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <p><strong>使用统计:</strong></p>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="总请求数" value={currentKey.totalRequests || 0} />
                </Col>
                <Col span={6}>
                  <Statistic title="成功请求" value={currentKey.successfulRequests || 0} />
                </Col>
                <Col span={6}>
                  <Statistic title="失败请求" value={currentKey.failedRequests || 0} />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="平均响应时间" 
                    value={currentKey.avgResponseTime || 0} 
                    suffix="ms" 
                  />
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AccessKeyList;