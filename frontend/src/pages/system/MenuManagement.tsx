import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Radio, InputNumber, Switch, message, Tree, Row, Col, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import { menuService } from '../../services/menuService';

const { Option } = Select;

interface MenuItem {
  id: number;
  menuCode: string;
  menuName: string;
  parentId: number;
  menuType: string;
  path?: string;
  component?: string;
  icon?: string;
  sortOrder: number;
  visible: boolean;
  status: string;
  permissionCode?: string;
  cacheFlag: boolean;
  externalLink: boolean;
  remark?: string;
  children?: MenuItem[];
}

const MenuManagement: React.FC = () => {
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    loadMenuTree();
  }, []);

  const loadMenuTree = async () => {
    setLoading(true);
    try {
      const response = await menuService.getMenuTree();
      setMenuList(response.data);
      const keys = extractAllKeys(response.data);
      setExpandedKeys(keys);
    } catch (error) {
      message.error('加载菜单失败');
    } finally {
      setLoading(false);
    }
  };

  const extractAllKeys = (data: MenuItem[]): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (items: MenuItem[]) => {
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
    setEditingMenu(null);
    form.resetFields();
    form.setFieldsValue({
      parentId,
      menuType: 'MENU',
      sortOrder: 0,
      visible: true,
      cacheFlag: false,
      externalLink: false
    });
    setModalVisible(true);
  };

  const handleEdit = (record: MenuItem) => {
    setEditingMenu(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该菜单吗？删除后无法恢复。',
      onOk: async () => {
        try {
          await menuService.deleteMenu(id);
          message.success('删除成功');
          loadMenuTree();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMenu) {
        await menuService.updateMenu(editingMenu.id, values);
        message.success('更新成功');
      } else {
        await menuService.createMenu(values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      loadMenuTree();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleRefreshCache = async () => {
    try {
      await menuService.refreshCache();
      message.success('缓存刷新成功');
    } catch (error) {
      message.error('缓存刷新失败');
    }
  };

  const columns: ColumnsType<MenuItem> = [
    {
      title: '菜单名称',
      dataIndex: 'menuName',
      key: 'menuName',
      width: 200,
    },
    {
      title: '菜单编码',
      dataIndex: 'menuCode',
      key: 'menuCode',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'menuType',
      key: 'menuType',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          DIRECTORY: { text: '目录', color: 'blue' },
          MENU: { text: '菜单', color: 'green' },
          BUTTON: { text: '按钮', color: 'orange' }
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '路由路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
    },
    {
      title: '权限编码',
      dataIndex: 'permissionCode',
      key: 'permissionCode',
      width: 150,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '可见',
      dataIndex: 'visible',
      key: 'visible',
      width: 80,
      render: (visible: boolean) => (
        <Tag color={visible ? 'success' : 'default'}>{visible ? '是' : '否'}</Tag>
      )
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
            添加子菜单
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

  const convertToTreeData = (menus: MenuItem[]): DataNode[] => {
    return menus.map(menu => ({
      title: menu.menuName,
      key: menu.id,
      children: menu.children ? convertToTreeData(menu.children) : undefined
    }));
  };

  return (
    <div className="menu-management">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
              新增菜单
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadMenuTree}>
              刷新
            </Button>
            <Button icon={<SettingOutlined />} onClick={handleRefreshCache}>
              刷新缓存
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={menuList}
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
        title={editingMenu ? '编辑菜单' : '新增菜单'}
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
            menuType: 'MENU',
            sortOrder: 0,
            visible: true,
            status: 'ACTIVE',
            cacheFlag: false,
            externalLink: false
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="menuCode"
                label="菜单编码"
                rules={[{ required: true, message: '请输入菜单编码' }]}
              >
                <Input placeholder="请输入菜单编码" disabled={!!editingMenu} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="menuName"
                label="菜单名称"
                rules={[{ required: true, message: '请输入菜单名称' }]}
              >
                <Input placeholder="请输入菜单名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="parentId" label="父级菜单">
                <Select placeholder="请选择父级菜单">
                  <Option value={0}>根菜单</Option>
                  {/* TODO: 添加菜单树选择 */}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="menuType"
                label="菜单类型"
                rules={[{ required: true, message: '请选择菜单类型' }]}
              >
                <Radio.Group>
                  <Radio value="DIRECTORY">目录</Radio>
                  <Radio value="MENU">菜单</Radio>
                  <Radio value="BUTTON">按钮</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="path" label="路由路径">
                <Input placeholder="请输入路由路径" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="component" label="组件路径">
                <Input placeholder="请输入组件路径" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="icon" label="菜单图标">
                <Input placeholder="请输入菜单图标" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sortOrder" label="排序号">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="permissionCode" label="权限编码">
                <Input placeholder="请输入权限编码" />
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

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="visible" label="是否可见" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="cacheFlag" label="是否缓存" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="externalLink" label="是否外链" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;