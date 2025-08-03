import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Radio, InputNumber, message, Tag, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { permissionService } from '../../services/permissionService';

const { Option } = Select;
const { TextArea } = Input;

interface Permission {
  id: number;
  permissionCode: string;
  permissionName: string;
  description?: string;
  resourceType: string;
  resourcePath?: string;
  httpMethod?: string;
  parentId: number;
  sortOrder: number;
  status: string;
  children?: Permission[];
}

const PermissionManagement: React.FC = () => {
  const [permissionList, setPermissionList] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [form] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    loadPermissionTree();
  }, []);

  const loadPermissionTree = async () => {
    setLoading(true);
    try {
      const response = await permissionService.getPermissionTree();
      setPermissionList(response.data);
      const keys = extractAllKeys(response.data);
      setExpandedKeys(keys);
    } catch (error) {
      message.error('加载权限失败');
    } finally {
      setLoading(false);
    }
  };

  const extractAllKeys = (data: Permission[]): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (items: Permission[]) => {
      items.forEach(item => {
        keys.push(item.id);
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(data);
    return keys;
  };

  const handleAdd = (parentId: number = 0) => {
    setEditingPermission(null);
    form.resetFields();
    form.setFieldsValue({
      parentId,
      resourceType: 'API',
      sortOrder: 0
    });
    setModalVisible(true);
  };

  const handleEdit = (record: Permission) => {
    setEditingPermission(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该权限吗？删除后无法恢复。',
      onOk: async () => {
        try {
          await permissionService.deletePermission(id);
          message.success('删除成功');
          loadPermissionTree();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingPermission) {
        await permissionService.updatePermission(editingPermission.id, values);
        message.success('更新成功');
      } else {
        await permissionService.createPermission(values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      loadPermissionTree();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns: ColumnsType<Permission> = [
    {
      title: '权限名称',
      dataIndex: 'permissionName',
      key: 'permissionName',
      width: 200,
    },
    {
      title: '权限编码',
      dataIndex: 'permissionCode',
      key: 'permissionCode',
      width: 250,
    },
    {
      title: '资源类型',
      dataIndex: 'resourceType',
      key: 'resourceType',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          MENU: { text: '菜单', color: 'blue' },
          BUTTON: { text: '按钮', color: 'green' },
          API: { text: '接口', color: 'orange' },
          DATA: { text: '数据', color: 'purple' }
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '资源路径',
      dataIndex: 'resourcePath',
      key: 'resourcePath',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'HTTP方法',
      dataIndex: 'httpMethod',
      key: 'httpMethod',
      width: 100,
      render: (method: string) => {
        if (!method) return '-';
        const methodMap: Record<string, string> = {
          GET: 'blue',
          POST: 'green',
          PUT: 'orange',
          DELETE: 'red',
          PATCH: 'purple'
        };
        return <Tag color={methodMap[method] || 'default'}>{method}</Tag>;
      }
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>
          {status === 'ACTIVE' ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAdd(record.id)}
          >
            添加子权限
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  return (
    <div className="permission-management">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
              新增权限
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadPermissionTree}>
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={permissionList}
          loading={loading}
          rowKey="id"
          pagination={false}
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpandedRowsChange: (keys) => setExpandedKeys([...keys])
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Modal
        title={editingPermission ? '编辑权限' : '新增权限'}
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            resourceType: 'API',
            sortOrder: 0,
            status: 'ACTIVE'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="permissionCode"
                label="权限编码"
                rules={[{ required: true, message: '请输入权限编码' }]}
              >
                <Input placeholder="例如：system:user:create" disabled={!!editingPermission} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="permissionName"
                label="权限名称"
                rules={[{ required: true, message: '请输入权限名称' }]}
              >
                <Input placeholder="请输入权限名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="parentId" label="父级权限">
                <Select placeholder="请选择父级权限">
                  <Option value={0}>根权限</Option>
                  {/* TODO: 添加权限树选择 */}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="resourceType"
                label="资源类型"
                rules={[{ required: true, message: '请选择资源类型' }]}
              >
                <Radio.Group>
                  <Radio value="MENU">菜单</Radio>
                  <Radio value="BUTTON">按钮</Radio>
                  <Radio value="API">接口</Radio>
                  <Radio value="DATA">数据</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="resourcePath" label="资源路径">
                <Input placeholder="例如：/api/system/users" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="httpMethod" label="HTTP方法">
                <Select placeholder="请选择HTTP方法" allowClear>
                  {httpMethods.map(method => (
                    <Option key={method} value={method}>{method}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sortOrder" label="排序号">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Radio.Group>
                  <Radio value="ACTIVE">启用</Radio>
                  <Radio value="DISABLED">禁用</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="权限描述">
            <TextArea rows={3} placeholder="请输入权限描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PermissionManagement;