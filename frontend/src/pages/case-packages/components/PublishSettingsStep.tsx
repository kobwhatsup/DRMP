import React, { useState, useEffect } from 'react';
import {
  Form,
  Radio,
  Card,
  DatePicker,
  InputNumber,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Space,
  Slider,
  Alert,
  Divider,
  Tooltip,
  Checkbox
} from 'antd';
import {
  InfoCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  RobotOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface PublishSettingsStepProps {
  form: FormInstance;
  initialValues?: any;
}

type AssignmentType = 'MANUAL' | 'SMART' | 'DESIGNATED';

const PublishSettingsStep: React.FC<PublishSettingsStepProps> = ({ form }) => {
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('MANUAL');
  const [availableOrgs, setAvailableOrgs] = useState<any[]>([]);

  useEffect(() => {
    // 获取当前表单中的分案类型
    const currentType = form.getFieldValue('assignmentType');
    if (currentType) {
      setAssignmentType(currentType);
    } else {
      form.setFieldValue('assignmentType', 'MANUAL');
    }

    // 加载可用的处置机构列表
    loadAvailableOrgs();
  }, [form]);

  const loadAvailableOrgs = async () => {
    // 模拟加载处置机构数据
    const mockOrgs = [
      { id: 1, name: '北京调解中心', region: '北京', successRate: 85 },
      { id: 2, name: '上海律师事务所', region: '上海', successRate: 78 },
      { id: 3, name: '深圳仲裁委员会', region: '深圳', successRate: 82 },
      { id: 4, name: '广州资产处置公司', region: '广州', successRate: 75 }
    ];
    setAvailableOrgs(mockOrgs);
  };

  const handleAssignmentTypeChange = (value: AssignmentType) => {
    setAssignmentType(value);
    form.setFieldValue('assignmentType', value);
    
    // 清除其他类型的配置数据
    if (value !== 'SMART') {
      form.setFieldsValue({
        smartAssignConfig: undefined
      });
    }
    if (value !== 'DESIGNATED') {
      form.setFieldValue('targetOrgIds', undefined);
      form.setFieldValue('targetOrgNames', undefined);
      form.setFieldValue('distributionMethod', undefined);
      form.setFieldValue('distributionRatio', undefined);
    }
  };

  const renderAssignmentConfig = () => {
    switch (assignmentType) {
      case 'SMART':
        return (
          <Card title="智能分案配置" style={{ marginTop: 16 }}>
            <Alert
              message="系统将根据您选择的规则自动匹配最合适的处置机构"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Title level={5} style={{ marginBottom: 12 }}>分案规则设置</Title>
            
            {/* 5个选项均匀分布 */}
            <Row gutter={24} style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '4px', marginBottom: 16 }}>
              <Col span={4} offset={1}>
                <Form.Item 
                  name={['smartAssignConfig', 'enableLocationBased']}
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox>
                    <Space size={4}>
                      <span style={{ fontWeight: 500 }}>按地域分配</span>
                      <Tooltip title="优先分配给债务人所在地的处置机构">
                        <InfoCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                      </Tooltip>
                    </Space>
                  </Checkbox>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item 
                  name={['smartAssignConfig', 'enablePerformanceBased']}
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox>
                    <Space size={4}>
                      <span style={{ fontWeight: 500 }}>按业绩分配</span>
                      <Tooltip title="优先分配给历史回收率高的机构">
                        <InfoCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                      </Tooltip>
                    </Space>
                  </Checkbox>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item 
                  name={['smartAssignConfig', 'enableDebtBased']}
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox>
                    <Space size={4}>
                      <span style={{ fontWeight: 500 }}>按金额分配</span>
                      <Tooltip title="根据机构擅长的金额范围匹配">
                        <InfoCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                      </Tooltip>
                    </Space>
                  </Checkbox>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item 
                  name={['smartAssignConfig', 'enableLoadBalance']}
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox>
                    <Space size={4}>
                      <span style={{ fontWeight: 500 }}>均衡分配</span>
                      <Tooltip title="避免案件过度集中">
                        <InfoCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                      </Tooltip>
                    </Space>
                  </Checkbox>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item 
                  name={['smartAssignConfig', 'enableSpecialtyBased']}
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox>
                    <Space size={4}>
                      <span style={{ fontWeight: 500 }}>按专长分配</span>
                      <Tooltip title="根据机构处置方式匹配">
                        <InfoCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                      </Tooltip>
                    </Space>
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>

            {/* 详细配置区域 - 只在有选项被选中时显示 */}
            <Form.Item noStyle dependencies={[
              ['smartAssignConfig', 'enableLocationBased'],
              ['smartAssignConfig', 'enablePerformanceBased'],
              ['smartAssignConfig', 'enableDebtBased'],
              ['smartAssignConfig', 'enableLoadBalance'],
              ['smartAssignConfig', 'enableSpecialtyBased']
            ]}>
              {({ getFieldValue }) => {
                const hasAnyEnabled = 
                  getFieldValue(['smartAssignConfig', 'enableLocationBased']) ||
                  getFieldValue(['smartAssignConfig', 'enablePerformanceBased']) ||
                  getFieldValue(['smartAssignConfig', 'enableDebtBased']) ||
                  getFieldValue(['smartAssignConfig', 'enableLoadBalance']) ||
                  getFieldValue(['smartAssignConfig', 'enableSpecialtyBased']);
                
                return hasAnyEnabled ? (
                  <div style={{ marginTop: 16 }}>
                    <Title level={5} style={{ marginBottom: 12 }}>详细配置</Title>
                    <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                      <Form.Item 
                        dependencies={[['smartAssignConfig', 'enableLocationBased']]}
                        style={{ marginBottom: 12 }}
                      >
                        {({ getFieldValue }) => {
                          const isEnabled = getFieldValue(['smartAssignConfig', 'enableLocationBased']);
                          return isEnabled ? (
                            <Row align="middle">
                              <Col span={6}>
                                <Text type="secondary">地域匹配策略：</Text>
                              </Col>
                              <Col span={18}>
                                <Form.Item 
                                  name={['smartAssignConfig', 'locationLevel']}
                                  style={{ marginBottom: 0 }}
                                  initialValue="CITY"
                                >
                                  <Radio.Group size="small">
                                    <Radio value="CITY">优先同城市</Radio>
                                    <Radio value="PROVINCE">优先同省份</Radio>
                                    <Radio value="BOTH">城市优先，其次省份</Radio>
                                  </Radio.Group>
                                </Form.Item>
                              </Col>
                            </Row>
                          ) : null;
                        }}
                      </Form.Item>

                      <Form.Item 
                        dependencies={[['smartAssignConfig', 'enablePerformanceBased']]}
                        style={{ marginBottom: 12 }}
                      >
                        {({ getFieldValue }) => {
                          const isEnabled = getFieldValue(['smartAssignConfig', 'enablePerformanceBased']);
                          return isEnabled ? (
                            <Row align="middle">
                              <Col span={6}>
                                <Text type="secondary">最低回收率要求：</Text>
                              </Col>
                              <Col span={18}>
                                <Form.Item 
                                  name={['smartAssignConfig', 'performanceThreshold']}
                                  style={{ marginBottom: 0 }}
                                  initialValue={5}
                                >
                                  <InputNumber
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    precision={1}
                                    formatter={value => `${value}%`}
                                    parser={value => value?.replace('%', '') as any}
                                    style={{ width: 120 }}
                                    size="small"
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          ) : null;
                        }}
                      </Form.Item>

                      <Form.Item 
                        dependencies={[['smartAssignConfig', 'enableDebtBased']]}
                        style={{ marginBottom: 12 }}
                      >
                        {({ getFieldValue }) => {
                          const isEnabled = getFieldValue(['smartAssignConfig', 'enableDebtBased']);
                          return isEnabled ? (
                            <Row align="middle">
                              <Col span={6}>
                                <Text type="secondary">金额分配策略：</Text>
                              </Col>
                              <Col span={18}>
                                <Form.Item 
                                  name={['smartAssignConfig', 'debtRangeType']}
                                  style={{ marginBottom: 0 }}
                                  initialValue="AUTO"
                                >
                                  <Radio.Group size="small">
                                    <Radio value="SMALL">小额专门（≤5万）</Radio>
                                    <Radio value="MEDIUM">中额综合（5-20万）</Radio>
                                    <Radio value="LARGE">大额专业（{'>'} 20万）</Radio>
                                    <Radio value="AUTO">自动匹配</Radio>
                                  </Radio.Group>
                                </Form.Item>
                              </Col>
                            </Row>
                          ) : null;
                        }}
                      </Form.Item>

                      <Form.Item 
                        dependencies={[['smartAssignConfig', 'enableLoadBalance']]}
                        style={{ marginBottom: 12 }}
                      >
                        {({ getFieldValue }) => {
                          const isEnabled = getFieldValue(['smartAssignConfig', 'enableLoadBalance']);
                          return isEnabled ? (
                            <Row align="middle">
                              <Col span={6}>
                                <Text type="secondary">单机构最大案件数：</Text>
                              </Col>
                              <Col span={18}>
                                <Space>
                                  <Form.Item 
                                    name={['smartAssignConfig', 'maxCasesPerOrg']}
                                    style={{ marginBottom: 0 }}
                                    initialValue={100}
                                  >
                                    <InputNumber
                                      min={1}
                                      max={10000}
                                      style={{ width: 120 }}
                                      size="small"
                                    />
                                  </Form.Item>
                                  <Text>件</Text>
                                </Space>
                              </Col>
                            </Row>
                          ) : null;
                        }}
                      </Form.Item>

                      <Form.Item 
                        dependencies={[['smartAssignConfig', 'enableSpecialtyBased']]}
                        style={{ marginBottom: 0 }}
                      >
                        {({ getFieldValue }) => {
                          const isEnabled = getFieldValue(['smartAssignConfig', 'enableSpecialtyBased']);
                          return isEnabled ? (
                            <Row align="middle">
                              <Col span={6}>
                                <Text type="secondary">优先处置方式：</Text>
                              </Col>
                              <Col span={18}>
                                <Form.Item 
                                  name={['smartAssignConfig', 'preferredMethods']}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Checkbox.Group>
                                    <Space wrap>
                                      <Checkbox value="MEDIATION">调解</Checkbox>
                                      <Checkbox value="LITIGATION">诉讼</Checkbox>
                                      <Checkbox value="ARBITRATION">仲裁</Checkbox>
                                      <Checkbox value="PRESERVATION">诉前保全</Checkbox>
                                      <Checkbox value="OTHER">其他</Checkbox>
                                    </Space>
                                  </Checkbox.Group>
                                </Form.Item>
                              </Col>
                            </Row>
                          ) : null;
                        }}
                      </Form.Item>
                    </div>
                  </div>
                ) : null;
              }}
            </Form.Item>
          </Card>
        );

      case 'DESIGNATED':
        return (
          <Card title="指定分案" style={{ marginTop: 16 }}>
            <Form.Item
              label="选择处置机构"
              name="targetOrgIds"
              rules={[{ required: true, message: '请选择至少一家处置机构' }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择要指定的处置机构（可多选）"
                showSearch
                onChange={(values) => {
                  // 找到所有选中的机构信息并保存名称
                  const selectedOrgs = availableOrgs.filter(org => values.includes(org.id));
                  const orgNames = selectedOrgs.map(org => org.name);
                  form.setFieldValue('targetOrgNames', orgNames);
                }}
                filterOption={(input, option) => {
                  const label = `${option?.label || ''}`;
                  return label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
                maxTagCount="responsive"
              >
                {availableOrgs.map(org => (
                  <Option key={org.id} value={org.id} label={`${org.name} - ${org.region}`}>
                    {org.name} - {org.region} (历史成功率: {org.successRate}%)
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              label="分配方式"
              name="distributionMethod"
              initialValue="AVERAGE"
              rules={[{ required: true, message: '请选择分配方式' }]}
              dependencies={[['targetOrgIds']]}
            >
              {({ getFieldValue }) => {
                const selectedOrgs = getFieldValue('targetOrgIds') || [];
                return selectedOrgs.length > 1 ? (
                  <Radio.Group>
                    <Radio value="AVERAGE">平均分配</Radio>
                    <Radio value="PROPORTION">按比例分配</Radio>
                    <Radio value="MANUAL">手动分配</Radio>
                  </Radio.Group>
                ) : (
                  <Text type="secondary">选择单个机构时，所有案件将分配给该机构</Text>
                );
              }}
            </Form.Item>

            <Form.Item
              noStyle
              dependencies={[['targetOrgIds'], ['distributionMethod']]}
            >
              {({ getFieldValue }) => {
                const selectedOrgs = getFieldValue('targetOrgIds') || [];
                const distributionMethod = getFieldValue('distributionMethod');
                
                if (selectedOrgs.length > 1 && distributionMethod === 'PROPORTION') {
                  return (
                    <Form.Item
                      label="分配比例"
                      name="distributionRatio"
                      rules={[{ required: true, message: '请设置分配比例' }]}
                    >
                      <div>
                        {selectedOrgs.map((orgId: number) => {
                          const org = availableOrgs.find(o => o.id === orgId);
                          return org ? (
                            <Row key={orgId} gutter={16} style={{ marginBottom: 8 }}>
                              <Col span={8}>
                                <Text>{org.name}：</Text>
                              </Col>
                              <Col span={16}>
                                <Form.Item
                                  name={['distributionRatio', orgId]}
                                  noStyle
                                  initialValue={Math.floor(100 / selectedOrgs.length)}
                                >
                                  <InputNumber
                                    min={0}
                                    max={100}
                                    formatter={value => `${value}%`}
                                    parser={value => value?.replace('%', '') as any}
                                    style={{ width: 120 }}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          ) : null;
                        })}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          提示：各机构分配比例之和应为100%
                        </Text>
                      </div>
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>

            <Alert
              message="指定分案说明"
              description="您可以选择一家或多家处置机构。选择多家时，可以设置不同的分配策略：平均分配将案件均匀分配给各机构；按比例分配可自定义各机构的案件比例；手动分配则在后续步骤中具体指定每个案件的归属。"
              type="info"
              showIcon
            />
          </Card>
        );

      case 'MANUAL':
      default:
        return (
          <Card title="手动分案说明" style={{ marginTop: 16 }}>
            <Alert
              message="手动分案模式"
              description="案件包发布后，您可以在案件包管理页面手动选择案件并分配给指定的处置机构。支持批量操作和灵活调整。"
              type="info"
              showIcon
            />
          </Card>
        );
    }
  };

  return (
    <div>
      <Card title="分案方式选择">
        <Form.Item
          name="assignmentType"
          rules={[{ required: true, message: '请选择分案方式' }]}
        >
          <Radio.Group
            value={assignmentType}
            onChange={(e) => handleAssignmentTypeChange(e.target.value)}
            style={{ width: '100%' }}
            buttonStyle="solid"
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Radio.Button 
                  value="MANUAL" 
                  style={{ 
                    width: '100%', 
                    height: '80px',
                    textAlign: 'center',
                    backgroundColor: assignmentType === 'MANUAL' ? '#1890ff' : undefined,
                    color: assignmentType === 'MANUAL' ? 'white' : undefined,
                    borderColor: assignmentType === 'MANUAL' ? '#1890ff' : undefined
                  }}
                >
                  <div style={{ padding: '10px' }}>
                    <UserOutlined style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} />
                    <div>手动分案</div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: assignmentType === 'MANUAL' ? 'rgba(255, 255, 255, 0.8)' : '#999' 
                    }}>
                      灵活控制
                    </div>
                  </div>
                </Radio.Button>
              </Col>
              <Col span={8}>
                <Radio.Button 
                  value="SMART" 
                  style={{ 
                    width: '100%', 
                    height: '80px',
                    textAlign: 'center',
                    backgroundColor: assignmentType === 'SMART' ? '#1890ff' : undefined,
                    color: assignmentType === 'SMART' ? 'white' : undefined,
                    borderColor: assignmentType === 'SMART' ? '#1890ff' : undefined
                  }}
                >
                  <div style={{ padding: '10px' }}>
                    <RobotOutlined style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} />
                    <div>智能分案</div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: assignmentType === 'SMART' ? 'rgba(255, 255, 255, 0.8)' : '#999' 
                    }}>
                      自动匹配
                    </div>
                  </div>
                </Radio.Button>
              </Col>
              <Col span={8}>
                <Radio.Button 
                  value="DESIGNATED" 
                  style={{ 
                    width: '100%', 
                    height: '80px',
                    textAlign: 'center',
                    backgroundColor: assignmentType === 'DESIGNATED' ? '#1890ff' : undefined,
                    color: assignmentType === 'DESIGNATED' ? 'white' : undefined,
                    borderColor: assignmentType === 'DESIGNATED' ? '#1890ff' : undefined
                  }}
                >
                  <div style={{ padding: '10px' }}>
                    <TeamOutlined style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} />
                    <div>指定分案</div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: assignmentType === 'DESIGNATED' ? 'rgba(255, 255, 255, 0.8)' : '#999' 
                    }}>
                      定向分配
                    </div>
                  </div>
                </Radio.Button>
              </Col>
            </Row>
          </Radio.Group>
        </Form.Item>
      </Card>

      {renderAssignmentConfig()}

      <Card title="其他发布设置" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="特殊要求"
              name="specialRequirements"
              rules={[{ max: 500, message: '特殊要求不能超过500个字符' }]}
            >
              <TextArea
                rows={3}
                placeholder="请输入其他特殊要求或说明"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default PublishSettingsStep;