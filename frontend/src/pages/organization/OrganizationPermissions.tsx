import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Select, Tree, message, Tabs, Tag } from 'antd';
import { SettingOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';

const { TabPane } = Tabs;

interface OrganizationPermission {
  id: number;
  orgCode: string;
  orgName: string;
  type: string;
  typeName: string;
  userCount: number;
  status: string;
  statusName: string;
  permissions: string[];
}

interface UserPermission {
  id: number;
  username: string;
  realName: string;
  email: string;
  roles: string[];
  permissions: string[];
  status: string;
}

const OrganizationPermissions: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationPermission[]>([]);
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationPermission | null>(null);
  const [activeTab, setActiveTab] = useState('organization');
  const [form] = Form.useForm();

  // Permission tree data
  const permissionTreeData: DataNode[] = [
    {
      title: '机构管理',
      key: 'organization',
      children: [
        { title: '查看机构', key: 'organization:read' },
        { title: '创建机构', key: 'organization:create' },
        { title: '更新机构', key: 'organization:update' },
        { title: '删除机构', key: 'organization:delete' },
        { title: '审核机构', key: 'organization:approve' },
      ],
    },
    {
      title: '案件包管理',
      key: 'case_package',
      children: [
        { title: '查看案件包', key: 'case_package:read' },
        { title: '创建案件包', key: 'case_package:create' },
        { title: '更新案件包', key: 'case_package:update' },
        { title: '删除案件包', key: 'case_package:delete' },
        { title: '分配案件包', key: 'case_package:assign' },
      ],
    },
    {
      title: '案件管理',
      key: 'case',
      children: [
        { title: '查看案件', key: 'case:read' },
        { title: '更新案件', key: 'case:update' },
      ],
    },
    {
      title: '用户管理',
      key: 'user',
      children: [
        { title: '查看用户', key: 'user:read' },
        { title: '创建用户', key: 'user:create' },
        { title: '更新用户', key: 'user:update' },
        { title: '删除用户', key: 'user:delete' },
      ],
    },
    {
      title: '报表管理',
      key: 'report',
      children: [
        { title: '查看报表', key: 'report:read' },
        { title: '导出报表', key: 'report:export' },
      ],
    },
    {
      title: '系统管理',
      key: 'system',
      children: [
        { title: '系统配置', key: 'system:config' },
        { title: '查看日志', key: 'system:log' },
      ],
    },
  ];

  useEffect(() => {
    if (activeTab === 'organization') {
      loadOrganizations();
    } else {
      loadUsers();
    }
  }, [activeTab]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      // Mock data for development
      const mockData: OrganizationPermission[] = [
        {
          id: 1,
          orgCode: 'ORG001',
          orgName: '某银行股份有限公司',
          type: 'BANK',
          typeName: '银行',
          userCount: 15,
          status: 'ACTIVE',
          statusName: '正常',
          permissions: ['organization:read', 'case_package:read', 'case_package:create'],
        },
        {
          id: 2,
          orgCode: 'ORG002',
          orgName: '某律师事务所',
          type: 'LAW_FIRM',
          typeName: '律师事务所',
          userCount: 8,
          status: 'ACTIVE',
          statusName: '正常',
          permissions: ['case:read', 'case:update', 'report:read'],
        },
      ];
      setOrganizations(mockData);
    } catch (error) {
      message.error('加载机构列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Mock data for development
      const mockData: UserPermission[] = [
        {
          id: 1,
          username: 'bank_admin',
          realName: '银行管理员',
          email: 'admin@bank.com',
          roles: ['ORG_ADMIN'],
          permissions: ['organization:read', 'case_package:read', 'case_package:create'],
          status: 'ACTIVE',
        },
        {
          id: 2,
          username: 'law_user',
          realName: '律师用户',
          email: 'user@lawfirm.com',
          roles: ['ORG_USER'],
          permissions: ['case:read', 'case:update'],
          status: 'ACTIVE',
        },
      ];
      setUsers(mockData);
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigurePermissions = (organization: OrganizationPermission) => {
    setSelectedOrganization(organization);
    setPermissionModalVisible(true);
    form.setFieldsValue({
      permissions: organization.permissions,
    });
  };

  const handlePermissionSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // In real implementation, call API here
      console.log('Permission update:', {
        organizationId: selectedOrganization?.id,
        permissions: values.permissions,
      });

      message.success('权限配置更新成功');
      setPermissionModalVisible(false);
      loadOrganizations();
    } catch (error) {
      message.error('权限配置更新失败');
    }
  };

  const organizationColumns: ColumnsType<OrganizationPermission> = [
    {
      title: '机构代码',
      dataIndex: 'orgCode',
      key: 'orgCode',
      width: 120,
    },
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
    },
    {
      title: '机构类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: 120,
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      render: (count) => (
        <span>
          <UserOutlined style={{ marginRight: 4 }} />
          {count}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'statusName',
      key: 'statusName',
      width: 80,
      render: (status, record) => (
        <Tag color={record.status === 'ACTIVE' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 100,
      render: (permissions) => (
        <Tag color="blue">{permissions.length} 项</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<SettingOutlined />}
           
            onClick={() => handleConfigurePermissions(record)}
          >
            配置权限
          </Button>
        </Space>
      ),
    },
  ];

  const userColumns: ColumnsType<UserPermission> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 150,
      render: (roles: string[]) => (
        <Space>
          {roles.map((role: string) => (
            <Tag key={role} color="blue">
              {role === 'ORG_ADMIN' ? '机构管理员' : '机构用户'}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 100,
      render: (permissions) => (
        <Tag color="green">{permissions.length} 项</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'orange'}>
          {status === 'ACTIVE' ? '正常' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<SettingOutlined />}
           
          >
            配置权限
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="权限配置管理" bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                机构权限
              </span>
            } 
            key="organization"
          >
            <Table
              columns={organizationColumns}
              dataSource={organizations}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                用户权限
              </span>
            } 
            key="user"
          >
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="配置机构权限"
        open={permissionModalVisible}
        onOk={handlePermissionSubmit}
        onCancel={() => setPermissionModalVisible(false)}
        width={700}
        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
      >
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: 16 }}>
            <strong>机构信息：</strong>
            <p>{selectedOrganization?.orgName} ({selectedOrganization?.orgCode})</p>
            <p>机构类型：{selectedOrganization?.typeName}</p>
          </div>
          
          <Form.Item
            label="权限配置"
            name="permissions"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Tree
              checkable
              defaultExpandAll
              treeData={permissionTreeData}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationPermissions;