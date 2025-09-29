import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  Row,
  Col,
  message,
  Divider,
  Typography,
  Select,
  Upload,
  Image,
  Alert,
  Tabs,
  List,
  Tag,
  Modal
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  UploadOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  MailOutlined,
  FileImageOutlined,
  DatabaseOutlined,
  BellOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface SystemConfig {
  id: number;
  configKey: string;
  configValue: string;
  configGroup: string;
  configName: string;
  description: string;
  valueType: string;
  isEncrypted: boolean;
  isSystem: boolean;
  editable: boolean;
}

const SystemSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [form] = Form.useForm();

  // 配置分组
  const configGroups = [
    { key: 'system', label: '系统配置', icon: <SettingOutlined /> },
    { key: 'security', label: '安全配置', icon: <SecurityScanOutlined /> },
    { key: 'notification', label: '通知配置', icon: <BellOutlined /> },
    { key: 'file', label: '文件配置', icon: <FileImageOutlined /> },
    { key: 'database', label: '数据库配置', icon: <DatabaseOutlined /> },
    { key: 'mail', label: '邮件配置', icon: <MailOutlined /> }
  ];

  // 模拟配置数据
  const mockConfigs: SystemConfig[] = [
    // 系统配置
    {
      id: 1,
      configKey: 'system.title',
      configValue: 'DRMP分散诉调平台',
      configGroup: 'system',
      configName: '系统标题',
      description: '系统页面标题',
      valueType: 'STRING',
      isEncrypted: false,
      isSystem: false,
      editable: true
    },
    {
      id: 2,
      configKey: 'system.logo.url',
      configValue: '/assets/logo.png',
      configGroup: 'system',
      configName: '系统Logo',
      description: '系统Logo图片地址',
      valueType: 'STRING',
      isEncrypted: false,
      isSystem: false,
      editable: true
    },
    {
      id: 3,
      configKey: 'system.copyright',
      configValue: '© 2025 DRMP. All rights reserved.',
      configGroup: 'system',
      configName: '版权信息',
      description: '系统版权信息',
      valueType: 'STRING',
      isEncrypted: false,
      isSystem: false,
      editable: true
    },
    // 安全配置
    {
      id: 4,
      configKey: 'security.password.min.length',
      configValue: '8',
      configGroup: 'security',
      configName: '密码最小长度',
      description: '用户密码最小长度要求',
      valueType: 'NUMBER',
      isEncrypted: false,
      isSystem: false,
      editable: true
    },
    {
      id: 5,
      configKey: 'security.password.complexity',
      configValue: 'true',
      configGroup: 'security',
      configName: '密码复杂度检查',
      description: '是否启用密码复杂度检查',
      valueType: 'BOOLEAN',
      isEncrypted: false,
      isSystem: false,
      editable: true
    },
    {
      id: 6,
      configKey: 'security.login.max.failure',
      configValue: '5',
      configGroup: 'security',
      configName: '最大登录失败次数',
      description: '连续登录失败后锁定账户',
      valueType: 'NUMBER',
      isEncrypted: false,
      isSystem: false,
      editable: true
    },
    {
      id: 7,
      configKey: 'security.session.timeout',
      configValue: '1800',
      configGroup: 'security',
      configName: '会话超时时间',
      description: '用户会话超时时间(秒)',
      valueType: 'NUMBER',
      isEncrypted: false,
      isSystem: false,
      editable: true
    },
    // 文件配置
    {
      id: 8,
      configKey: 'file.upload.max.size',
      configValue: '10485760',
      configGroup: 'file',
      configName: '文件上传大小限制',
      description: '单个文件上传大小限制(字节)',
      valueType: 'NUMBER',
      isEncrypted: false,
      isSystem: false,
      editable: true
    },
    {
      id: 9,
      configKey: 'file.upload.allowed.types',
      configValue: '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx',
      configGroup: 'file',
      configName: '允许上传的文件类型',
      description: '允许上传的文件扩展名',
      valueType: 'STRING',
      isEncrypted: false,
      isSystem: false,
      editable: true
    },
    // 通知配置
    {
      id: 10,
      configKey: 'notification.email.enabled',
      configValue: 'true',
      configGroup: 'notification',
      configName: '邮件通知',
      description: '是否启用邮件通知',
      valueType: 'BOOLEAN',
      isEncrypted: false,
      isSystem: false,
      editable: true
    },
    {
      id: 11,
      configKey: 'notification.sms.enabled',
      configValue: 'false',
      configGroup: 'notification',
      configName: '短信通知',
      description: '是否启用短信通知',
      valueType: 'BOOLEAN',
      isEncrypted: false,
      isSystem: false,
      editable: true
    }
  ];

  // 加载配置
  const loadConfigs = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setConfigs(mockConfigs);
      
      // 设置表单初始值
      const formValues: any = {};
      mockConfigs.forEach(config => {
        if (config.valueType === 'BOOLEAN') {
          formValues[config.configKey] = config.configValue === 'true';
        } else if (config.valueType === 'NUMBER') {
          formValues[config.configKey] = Number(config.configValue);
        } else {
          formValues[config.configKey] = config.configValue;
        }
      });
      form.setFieldsValue(formValues);
    } catch (error) {
      message.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  // 保存配置
  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('配置保存成功');
      loadConfigs();
    } catch (error) {
      message.error('配置保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置配置
  const handleReset = () => {
    form.resetFields();
    loadConfigs();
  };

  // 渲染配置项
  const renderConfigItem = (config: SystemConfig) => {
    if (!config.editable) {
      return (
        <Form.Item
          key={config.configKey}
          label={config.configName}
          help={config.description}
        >
          <Input value={config.configValue} disabled />
        </Form.Item>
      );
    }

    switch (config.valueType) {
      case 'BOOLEAN':
        return (
          <Form.Item
            key={config.configKey}
            name={config.configKey}
            label={config.configName}
            help={config.description}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        );
      
      case 'NUMBER':
        return (
          <Form.Item
            key={config.configKey}
            name={config.configKey}
            label={config.configName}
            help={config.description}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        );
      
      default:
        if (config.configKey.includes('logo') || config.configKey.includes('image')) {
          return (
            <Form.Item
              key={config.configKey}
              name={config.configKey}
              label={config.configName}
              help={config.description}
            >
              <div>
                <Input placeholder="图片URL" />
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={(info) => {
                    // 处理图片上传
                    message.info('图片上传功能待实现');
                  }}
                >
                  <Button icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                    上传图片
                  </Button>
                </Upload>
                {config.configValue && config.configValue.startsWith('http') && (
                  <Image
                    src={config.configValue}
                    alt="预览"
                    width={100}
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            </Form.Item>
          );
        } else if (config.description && config.description.length > 50) {
          return (
            <Form.Item
              key={config.configKey}
              name={config.configKey}
              label={config.configName}
              help={config.description}
            >
              <TextArea rows={3} />
            </Form.Item>
          );
        } else {
          return (
            <Form.Item
              key={config.configKey}
              name={config.configKey}
              label={config.configName}
              help={config.description}
            >
              <Input />
            </Form.Item>
          );
        }
    }
  };

  // 按分组渲染配置
  const renderConfigGroup = (groupKey: string) => {
    const groupConfigs = configs.filter(config => config.configGroup === groupKey);
    
    return (
      <Card key={groupKey}>
        <Row gutter={[24, 16]}>
          {groupConfigs.map(config => (
            <Col span={12} key={config.configKey}>
              {renderConfigItem(config)}
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Title level={3}>
            <SettingOutlined style={{ marginRight: '8px' }} />
            系统设置
          </Title>
          <Paragraph type="secondary">
            配置系统的基本参数和业务规则，修改后请点击保存按钮
          </Paragraph>
        </div>

        <Alert
          message="安全提示"
          description="修改系统配置可能会影响系统正常运行，请谨慎操作。建议在维护时间窗口内进行配置变更。"
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Tabs defaultActiveKey="system" type="card">
            {configGroups.map(group => (
              <TabPane
                tab={
                  <span>
                    {group.icon}
                    {group.label}
                  </span>
                }
                key={group.key}
              >
                {renderConfigGroup(group.key)}
              </TabPane>
            ))}
          </Tabs>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Space size="middle">
              <Button 
                onClick={handleReset}
                icon={<ReloadOutlined />}
              >
                重置
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存配置
              </Button>
            </Space>
          </div>
        </Form>

        {/* 配置说明 */}
        <Card 
          title="配置说明" 
          style={{ marginTop: '24px' }}
          type="inner"
        >
          <List
            size="small"
            dataSource={[
              '系统配置：控制系统的基本显示和行为',
              '安全配置：设置密码策略、登录限制等安全参数',
              '通知配置：配置邮件、短信等通知方式',
              '文件配置：设置文件上传的大小和类型限制',
              '数据库配置：数据库连接和性能参数（只读）',
              '邮件配置：SMTP服务器和邮件发送相关设置'
            ]}
            renderItem={item => (
              <List.Item>
                <Text>• {item}</Text>
              </List.Item>
            )}
          />
        </Card>
      </Card>
    </div>
  );
};

export default SystemSettings;