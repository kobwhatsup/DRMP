import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tag,
  Avatar,
  Popconfirm,
  Modal,
  Form,
  Row,
  Col,
  message,
  Tooltip,
  Badge,
  Statistic,
  Dropdown,
  MenuProps
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  UserOutlined,
  MoreOutlined,
  ExportOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { userService, type User, type UserQueryParams, type UserStatistics } from '@/services/userService';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [queryParams, setQueryParams] = useState<UserQueryParams>({});
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // 用户状态选项
  const userStatusOptions = [
    { label: '全部', value: '' },
    { label: '正常', value: 'ACTIVE' },
    { label: '禁用', value: 'DISABLED' },
    { label: '锁定', value: 'LOCKED' },
    { label: '待审核', value: 'PENDING' }
  ];

  // 用户类型选项
  const userTypeOptions = [
    { label: '全部', value: '' },
    { label: '管理员', value: 'ADMIN' },
    { label: '机构管理员', value: 'ORGANIZATION_ADMIN' },
    { label: '机构用户', value: 'ORGANIZATION_USER' }
  ];

  // 加载用户列表
  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        ...queryParams,
        page: current,
        size: pageSize
      };
      
      const result = await userService.getUsers(params);
      setUsers(result.content);
      setTotal(result.totalElements);
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const stats = await userService.getUserStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [current, pageSize, queryParams]);

  useEffect(() => {
    loadStatistics();
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

  // 状态筛选
  const handleStatusFilter = (value: string) => {
    setQueryParams({ ...queryParams, status: value || undefined });
    setCurrent(1);
  };

  // 类型筛选
  const handleTypeFilter = (value: string) => {
    setQueryParams({ ...queryParams, userType: value || undefined });
    setCurrent(1);
  };

  // 时间范围筛选
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setQueryParams({
        ...queryParams,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD')
      });
    } else {
      setQueryParams({
        ...queryParams,
        startDate: undefined,
        endDate: undefined
      });
    }
    setCurrent(1);
  };

  // 启用用户
  const handleEnableUser = async (id: number) => {
    try {
      await userService.enableUser(id);
      message.success('用户启用成功');
      loadUsers();
      loadStatistics();
    } catch (error) {
      message.error('用户启用失败');
    }
  };

  // 禁用用户
  const handleDisableUser = async (id: number) => {
    try {
      await userService.disableUser(id);
      message.success('用户禁用成功');
      loadUsers();
      loadStatistics();
    } catch (error) {
      message.error('用户禁用失败');
    }
  };

  // 锁定用户
  const handleLockUser = async (id: number) => {
    try {
      await userService.lockUser(id);
      message.success('用户锁定成功');
      loadUsers();
      loadStatistics();
    } catch (error) {
      message.error('用户锁定失败');
    }
  };

  // 解锁用户
  const handleUnlockUser = async (id: number) => {
    try {
      await userService.unlockUser(id);
      message.success('用户解锁成功');
      loadUsers();
      loadStatistics();
    } catch (error) {
      message.error('用户解锁失败');
    }
  };

  // 重置密码
  const handleResetPassword = async (id: number) => {
    try {
      const result = await userService.resetPassword(id);
      Modal.info({
        title: '密码重置成功',
        content: (
          <div>
            <p>新密码为：<strong style={{ color: '#f5222d' }}>{result.newPassword}</strong></p>
            <p style={{ color: '#faad14' }}>请妥善保管并及时通知用户修改密码</p>
          </div>
        )
      });
      loadUsers();
    } catch (error) {
      message.error('密码重置失败');
    }
  };

  // 删除用户
  const handleDeleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      message.success('用户删除成功');
      loadUsers();
      loadStatistics();
    } catch (error) {
      message.error('用户删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的用户');
      return;
    }

    try {
      await userService.deleteUsers(selectedRowKeys as number[]);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      loadUsers();
      loadStatistics();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 编辑用户
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue({
      ...user,
      roleIds: user.roles.map(role => role.id)
    });
    setUpdateModalVisible(true);
  };

  // 查看用户详情
  const handleViewUser = (user: User) => {
    Modal.info({
      title: '用户详情',
      width: 600,
      content: (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <strong>用户名：</strong>{user.username}
            </Col>
            <Col span={12}>
              <strong>真实姓名：</strong>{user.realName || '-'}
            </Col>
            <Col span={12}>
              <strong>邮箱：</strong>{user.email || '-'}
            </Col>
            <Col span={12}>
              <strong>手机号：</strong>{user.phone || '-'}
            </Col>
            <Col span={12}>
              <strong>用户类型：</strong>{user.userTypeDesc}
            </Col>
            <Col span={12}>
              <strong>状态：</strong>
              <Tag color={getStatusColor(user.status)}>{user.statusDesc}</Tag>
            </Col>
            <Col span={12}>
              <strong>最后登录：</strong>{user.lastLoginTime ? dayjs(user.lastLoginTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Col>
            <Col span={12}>
              <strong>登录IP：</strong>{user.lastLoginIp || '-'}
            </Col>
            <Col span={24}>
              <strong>角色：</strong>
              <Space wrap>
                {user.roles.map(role => (
                  <Tag key={role.id} color="blue">{role.roleName}</Tag>
                ))}
              </Space>
            </Col>
          </Row>
        </div>
      )
    });
  };

  // 获取状态颜色
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'DISABLED': return 'red';
      case 'LOCKED': return 'orange';
      case 'PENDING': return 'blue';
      default: return 'default';
    }
  };

  // 操作菜单
  const getActionMenu = (record: User): MenuProps => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: '查看详情',
        onClick: () => handleViewUser(record)
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
        onClick: () => handleEditUser(record)
      },
      {
        type: 'divider'
      },
      {
        key: 'resetPassword',
        icon: <KeyOutlined />,
        label: '重置密码',
        onClick: () => handleResetPassword(record.id)
      },
      ...(record.status === 'ACTIVE' ? [
        {
          key: 'disable',
          icon: <CloseCircleOutlined />,
          label: '禁用',
          onClick: () => handleDisableUser(record.id)
        },
        {
          key: 'lock',
          icon: <LockOutlined />,
          label: '锁定',
          onClick: () => handleLockUser(record.id)
        }
      ] : []),
      ...(record.status === 'DISABLED' ? [
        {
          key: 'enable',
          icon: <CheckCircleOutlined />,
          label: '启用',
          onClick: () => handleEnableUser(record.id)
        }
      ] : []),
      ...(record.status === 'LOCKED' ? [
        {
          key: 'unlock',
          icon: <UnlockOutlined />,
          label: '解锁',
          onClick: () => handleUnlockUser(record.id)
        }
      ] : []),
      {
        type: 'divider'
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        onClick: () => handleDeleteUser(record.id)
      }
    ]
  });

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={record.avatarUrl} 
            icon={<UserOutlined />} 
            style={{ marginRight: 12 }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.username}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.realName || '-'}</div>
          </div>
        </div>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.email || '-'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone || '-'}</div>
        </div>
      )
    },
    {
      title: '用户类型',
      dataIndex: 'userTypeDesc',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string, record) => (
        <Space>
          <Badge status={status === 'ACTIVE' ? 'success' : status === 'DISABLED' ? 'error' : 'warning'} />
          <Tag color={getStatusColor(status)}>{record.statusDesc}</Tag>
        </Space>
      )
    },
    {
      title: '角色',
      key: 'roles',
      width: 200,
      render: (_, record) => (
        <Space wrap>
          {record.roles.slice(0, 2).map(role => (
            <Tag key={role.id} color="purple">{role.roleName}</Tag>
          ))}
          {record.roles.length > 2 && (
            <Tooltip title={record.roles.slice(2).map(r => r.roleName).join(', ')}>
              <Tag>+{record.roles.length - 2}</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: '最后登录',
      key: 'lastLogin',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.lastLoginTime ? dayjs(record.lastLoginTime).format('MM-DD HH:mm') : '-'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.lastLoginIp || '-'}</div>
        </div>
      )
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
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Dropdown menu={getActionMenu(record)} trigger={['click']}>
            <Button type="link" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record: User) => ({
      disabled: record.userType === 'ADMIN', // 管理员不能被批量操作
    }),
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="总用户数" 
                value={statistics.totalUsers} 
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="正常用户" 
                value={statistics.activeUsers} 
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="待审核" 
                value={statistics.pendingUsers} 
                prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="今日新增" 
                value={statistics.todayNewUsers} 
                prefix={<PlusOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 主表格卡片 */}
      <Card>
        {/* 工具栏 */}
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]} justify="space-between">
            <Col flex="auto">
              <Space wrap>
                <Search
                  placeholder="搜索用户名、姓名、邮箱"
                  allowClear
                  style={{ width: 280 }}
                  onSearch={handleSearch}
                />
                <Select
                  placeholder="状态"
                  style={{ width: 120 }}
                  allowClear
                  onChange={handleStatusFilter}
                  options={userStatusOptions}
                />
                <Select
                  placeholder="用户类型"
                  style={{ width: 140 }}
                  allowClear
                  onChange={handleTypeFilter}
                  options={userTypeOptions}
                />
                <RangePicker
                  placeholder={['开始日期', '结束日期']}
                  onChange={handleDateRangeChange}
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
                    title={`确定要删除选中的 ${selectedRowKeys.length} 个用户吗？`}
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
                  新建用户
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          scroll={{ x: 1400 }}
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

      {/* 创建用户弹窗 */}
      <Modal
        title="新建用户"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        {/* 创建用户表单组件 */}
        <div>创建用户表单（待实现）</div>
      </Modal>

      {/* 编辑用户弹窗 */}
      <Modal
        title="编辑用户"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={null}
        width={800}
      >
        {/* 编辑用户表单组件 */}
        <div>编辑用户表单（待实现）</div>
      </Modal>
    </div>
  );
};

export default UserManagement;