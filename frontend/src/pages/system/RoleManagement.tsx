import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Popconfirm,
  Modal,
  Form,
  Row,
  Col,
  message,
  Tooltip,
  Tree,
  Divider,
  Switch
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  MoreOutlined,
  ExportOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TreeProps } from 'antd/es/tree';
import dayjs from 'dayjs';
import { roleService, permissionService, type Role, type Permission, type RoleQueryParams } from '@/services/roleService';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const RoleManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [queryParams, setQueryParams] = useState<RoleQueryParams>({});
  
  // 弹窗状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // 权限相关
  const [permissionTree, setPermissionTree] = useState<Permission[]>([]);
  const [checkedPermissions, setCheckedPermissions] = useState<number[]>([]);
  
  const [form] = Form.useForm();
  const [permissionForm] = Form.useForm();

  // 角色类型选项
  const roleTypeOptions = [
    { label: '全部', value: '' },
    { label: '系统角色', value: 'SYSTEM' },
    { label: '机构角色', value: 'ORGANIZATION' },
    { label: '自定义角色', value: 'CUSTOM' }
  ];

  // 角色状态选项
  const roleStatusOptions = [
    { label: '全部', value: '' },
    { label: '启用', value: 'ACTIVE' },
    { label: '禁用', value: 'DISABLED' }
  ];

  // 加载角色列表
  const loadRoles = async () => {
    setLoading(true);
    try {
      const params = {
        ...queryParams,
        page: current,
        size: pageSize
      };
      
      const result = await roleService.getRoles(params);
      setRoles(result.content);
      setTotal(result.totalElements);
    } catch (error) {
      message.error('加载角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载权限树
  const loadPermissionTree = async () => {
    try {
      const tree = await permissionService.getPermissionTree();
      setPermissionTree(tree);
    } catch (error) {
      message.error('加载权限树失败');
    }
  };

  useEffect(() => {
    loadRoles();
  }, [current, pageSize, queryParams]);

  useEffect(() => {
    loadPermissionTree();
  }, []);

  // 搜索处理
  const handleSearch = (value: string) => {
    setQueryParams({ ...queryParams, keyword: value });
    setCurrent(1);
  };

  // 重置搜索
  const handleReset = () => {
    setQueryParams({});
    setCurrent(1);
  };

  // 类型筛选
  const handleTypeFilter = (value: string) => {
    setQueryParams({ ...queryParams, roleType: value || undefined });
    setCurrent(1);
  };

  // 状态筛选
  const handleStatusFilter = (value: string) => {
    setQueryParams({ ...queryParams, status: value || undefined });
    setCurrent(1);
  };

  // 创建角色
  const handleCreateRole = async (values: any) => {
    try {
      await roleService.createRole(values);
      message.success('角色创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      loadRoles();
    } catch (error) {
      message.error('角色创建失败');
    }
  };

  // 更新角色
  const handleUpdateRole = async (values: any) => {
    if (!selectedRole) return;
    
    try {
      await roleService.updateRole(selectedRole.id, values);
      message.success('角色更新成功');
      setUpdateModalVisible(false);
      form.resetFields();
      loadRoles();
    } catch (error) {
      message.error('角色更新失败');
    }
  };

  // 删除角色
  const handleDeleteRole = async (id: number) => {
    try {
      await roleService.deleteRole(id);
      message.success('角色删除成功');
      loadRoles();
    } catch (error) {
      message.error('角色删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的角色');
      return;
    }

    try {
      await roleService.deleteRoles(selectedRowKeys as number[]);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      loadRoles();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 启用角色
  const handleEnableRole = async (id: number) => {
    try {
      await roleService.enableRole(id);
      message.success('角色启用成功');
      loadRoles();
    } catch (error) {
      message.error('角色启用失败');
    }
  };

  // 禁用角色
  const handleDisableRole = async (id: number) => {
    try {
      await roleService.disableRole(id);
      message.success('角色禁用成功');
      loadRoles();
    } catch (error) {
      message.error('角色禁用失败');
    }
  };

  // 编辑角色
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    form.setFieldsValue(role);
    setUpdateModalVisible(true);
  };

  // 配置权限
  const handleConfigPermissions = (role: Role) => {
    setSelectedRole(role);
    const permissionIds = role.permissions.map(p => p.id);
    setCheckedPermissions(permissionIds);
    setPermissionModalVisible(true);
  };

  // 保存权限配置
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    
    try {
      await roleService.assignPermissions(selectedRole.id, checkedPermissions);
      message.success('权限配置成功');
      setPermissionModalVisible(false);
      loadRoles();
    } catch (error) {
      message.error('权限配置失败');
    }
  };

  // 查看角色详情
  const handleViewRole = (role: Role) => {
    Modal.info({
      title: '角色详情',
      width: 800,
      content: (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <strong>角色编码：</strong>{role.roleCode}
            </Col>
            <Col span={12}>
              <strong>角色名称：</strong>{role.roleName}
            </Col>
            <Col span={12}>
              <strong>角色类型：</strong>{role.roleTypeDesc}
            </Col>
            <Col span={12}>
              <strong>状态：</strong>
              <Tag color={role.status === 'ACTIVE' ? 'green' : 'red'}>{role.statusDesc}</Tag>
            </Col>
            <Col span={24}>
              <strong>描述：</strong>{role.description || '-'}
            </Col>
            <Col span={24}>
              <strong>权限列表：</strong>
              <div style={{ marginTop: '8px', maxHeight: '200px', overflow: 'auto' }}>
                <Space wrap>
                  {role.permissions.map(permission => (
                    <Tag key={permission.id} color="blue">{permission.permissionName}</Tag>
                  ))}
                </Space>
              </div>
            </Col>
          </Row>
        </div>
      )
    });
  };

  // 获取状态颜色
  const getStatusColor = (status: string): string => {
    return status === 'ACTIVE' ? 'green' : 'red';
  };

  // 转换权限树数据格式
  const convertPermissionTreeData = (permissions: Permission[]): any[] => {
    return permissions.map(permission => ({
      title: permission.permissionName,
      key: permission.id,
      children: permission.children ? convertPermissionTreeData(permission.children) : []
    }));
  };

  // 权限树选择处理
  const handlePermissionCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
    const keys = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked;
    setCheckedPermissions(keys as number[]);
  };

  // 表格列定义
  const columns: ColumnsType<Role> = [
    {
      title: '角色信息',
      key: 'roleInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.roleName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.roleCode}</div>
        </div>
      )
    },
    {
      title: '角色类型',
      dataIndex: 'roleTypeDesc',
      width: 120,
      render: (text: string, record) => {
        const color = record.roleType === 'SYSTEM' ? 'red' : 
                     record.roleType === 'ORGANIZATION' ? 'blue' : 'green';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string, record) => (
        <Tag color={getStatusColor(status)}>{record.statusDesc}</Tag>
      )
    },
    {
      title: '权限数量',
      key: 'permissions',
      width: 100,
      render: (_, record) => (
        <Tooltip title="点击查看权限详情">
          <Button 
            type="link" 
            size="small"
            onClick={() => handleViewRole(record)}
          >
            {record.permissions.length} 个
          </Button>
        </Tooltip>
      )
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 80
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 120,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewRole(record)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEditRole(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={<KeyOutlined />} 
            onClick={() => handleConfigPermissions(record)}
          >
            权限
          </Button>
          {record.roleType !== 'SYSTEM' && (
            <Popconfirm
              title="确定要删除这个角色吗？"
              onConfirm={() => handleDeleteRole(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record: Role) => ({
      disabled: record.roleType === 'SYSTEM', // 系统角色不能被批量操作
    }),
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* 工具栏 */}
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]} justify="space-between">
            <Col flex="auto">
              <Space wrap>
                <Search
                  placeholder="搜索角色名称、编码"
                  allowClear
                  style={{ width: 280 }}
                  onSearch={handleSearch}
                />
                <Select
                  placeholder="角色类型"
                  style={{ width: 120 }}
                  allowClear
                  onChange={handleTypeFilter}
                  options={roleTypeOptions}
                />
                <Select
                  placeholder="状态"
                  style={{ width: 120 }}
                  allowClear
                  onChange={handleStatusFilter}
                  options={roleStatusOptions}
                />
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
            <Col>
              <Space>
                {selectedRowKeys.length > 0 && (
                  <Popconfirm
                    title={`确定要删除选中的 ${selectedRowKeys.length} 个角色吗？`}
                    onConfirm={handleBatchDelete}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      批量删除
                    </Button>
                  </Popconfirm>
                )}
                <Button icon={<ExportOutlined />}>
                  导出
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  新建角色
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: setCurrent,
            onShowSizeChange: (_, size) => setPageSize(size)
          }}
        />
      </Card>

      {/* 创建角色弹窗 */}
      <Modal
        title="新建角色"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRole}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleCode"
                label="角色编码"
                rules={[
                  { required: true, message: '请输入角色编码' },
                  { pattern: /^[A-Z_]+$/, message: '只能包含大写字母和下划线' }
                ]}
              >
                <Input placeholder="如：ADMIN" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roleName"
                label="角色名称"
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input placeholder="如：管理员" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleType"
                label="角色类型"
                rules={[{ required: true, message: '请选择角色类型' }]}
              >
                <Select placeholder="请选择">
                  <Option value="SYSTEM">系统角色</Option>
                  <Option value="ORGANIZATION">机构角色</Option>
                  <Option value="CUSTOM">自定义角色</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sortOrder"
                label="排序"
                initialValue={0}
              >
                <Input type="number" placeholder="数字越小排序越靠前" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="角色描述"
          >
            <TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑角色弹窗 */}
      <Modal
        title="编辑角色"
        open={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateRole}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleName"
                label="角色名称"
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input placeholder="如：管理员" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roleType"
                label="角色类型"
                rules={[{ required: true, message: '请选择角色类型' }]}
              >
                <Select placeholder="请选择">
                  <Option value="SYSTEM">系统角色</Option>
                  <Option value="ORGANIZATION">机构角色</Option>
                  <Option value="CUSTOM">自定义角色</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
              >
                <Select placeholder="请选择">
                  <Option value="ACTIVE">启用</Option>
                  <Option value="DISABLED">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sortOrder"
                label="排序"
              >
                <Input type="number" placeholder="数字越小排序越靠前" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="角色描述"
          >
            <TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限配置弹窗 */}
      <Modal
        title={`配置权限 - ${selectedRole?.roleName}`}
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        onOk={handleSavePermissions}
        width={800}
        bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
      >
        <div>
          <div style={{ marginBottom: '16px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <span>已选择 <strong>{checkedPermissions.length}</strong> 个权限</span>
          </div>
          <Tree
            checkable
            checkedKeys={checkedPermissions}
            onCheck={handlePermissionCheck}
            treeData={convertPermissionTreeData(permissionTree)}
            height={400}
          />
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagement;