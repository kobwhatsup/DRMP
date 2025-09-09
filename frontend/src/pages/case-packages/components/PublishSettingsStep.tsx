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
  Tooltip
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

type AssignmentType = 'MANUAL' | 'BIDDING' | 'SMART' | 'DESIGNATED';

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
    if (value !== 'BIDDING') {
      form.setFieldsValue({
        biddingStartTime: undefined,
        biddingEndTime: undefined,
        minBidAmount: undefined,
        bidBondAmount: undefined,
        biddingRequirements: undefined
      });
    }
    if (value !== 'SMART') {
      form.setFieldsValue({
        smartAssignConfig: undefined
      });
    }
    if (value !== 'DESIGNATED') {
      form.setFieldValue('targetOrgId', undefined);
    }
  };

  const renderAssignmentConfig = () => {
    switch (assignmentType) {
      case 'BIDDING':
        return (
          <Card title="竞标配置" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="竞标时间"
                  name="biddingTime"
                  rules={[{ required: true, message: '请选择竞标时间' }]}
                >
                  <RangePicker
                    showTime
                    style={{ width: '100%' }}
                    placeholder={['开始时间', '结束时间']}
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf('day');
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="最低出价"
                  name="minBidAmount"
                  rules={[
                    { required: true, message: '请输入最低出价' },
                    { type: 'number', min: 0, message: '金额不能为负数' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="请输入最低出价金额"
                    formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\¥\s?|(,*)/g, '') as any}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="竞标保证金"
                  name="bidBondAmount"
                  rules={[
                    { required: true, message: '请输入竞标保证金' },
                    { type: 'number', min: 0, message: '金额不能为负数' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="请输入竞标保证金金额"
                    formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\¥\s?|(,*)/g, '') as any}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="评标方式"
                  name="evaluationMethod"
                  initialValue="COMPREHENSIVE"
                >
                  <Select>
                    <Option value="PRICE_ONLY">价格优先</Option>
                    <Option value="QUALITY_ONLY">质量优先</Option>
                    <Option value="COMPREHENSIVE">综合评分</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="竞标要求"
                  name="biddingRequirements"
                  rules={[{ max: 1000, message: '竞标要求不能超过1000个字符' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="请输入竞标要求，如资质要求、业绩要求等"
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        );

      case 'SMART':
        return (
          <Card title="智能分案配置" style={{ marginTop: 16 }}>
            <Alert
              message="系统将根据设置的权重，自动匹配最合适的处置机构"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form.Item name="smartAssignConfig">
              <div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          地域匹配权重
                          <Tooltip title="优先匹配案件所在地的处置机构">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      name={['smartAssignConfig', 'regionWeight']}
                      initialValue={30}
                    >
                      <Slider
                        marks={{
                          0: '0%',
                          50: '50%',
                          100: '100%'
                        }}
                        tipFormatter={(value) => `${value}%`}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          历史业绩权重
                          <Tooltip title="优先匹配历史回收率高的处置机构">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      name={['smartAssignConfig', 'performanceWeight']}
                      initialValue={40}
                    >
                      <Slider
                        marks={{
                          0: '0%',
                          50: '50%',
                          100: '100%'
                        }}
                        tipFormatter={(value) => `${value}%`}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          负载均衡权重
                          <Tooltip title="优先匹配当前案件量较少的处置机构">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      name={['smartAssignConfig', 'loadWeight']}
                      initialValue={20}
                    >
                      <Slider
                        marks={{
                          0: '0%',
                          50: '50%',
                          100: '100%'
                        }}
                        tipFormatter={(value) => `${value}%`}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          专长匹配权重
                          <Tooltip title="优先匹配擅长处理该类型案件的处置机构">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      name={['smartAssignConfig', 'specialtyWeight']}
                      initialValue={10}
                    >
                      <Slider
                        marks={{
                          0: '0%',
                          50: '50%',
                          100: '100%'
                        }}
                        tipFormatter={(value) => `${value}%`}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="最低匹配分数"
                      name={['smartAssignConfig', 'minMatchScore']}
                      initialValue={60}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        placeholder="最低匹配分数"
                        suffix="分"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="单机构最大案件数"
                      name={['smartAssignConfig', 'maxCasesPerOrg']}
                      initialValue={100}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={1}
                        placeholder="单机构最大案件数"
                        suffix="件"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Form.Item>
          </Card>
        );

      case 'DESIGNATED':
        return (
          <Card title="指定分案" style={{ marginTop: 16 }}>
            <Form.Item
              label="选择处置机构"
              name="targetOrgId"
              rules={[{ required: true, message: '请选择处置机构' }]}
            >
              <Select
                placeholder="请选择要指定的处置机构"
                showSearch
                filterOption={(input, option) => {
                  const label = `${option?.label || ''}`;
                  return label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
              >
                {availableOrgs.map(org => (
                  <Option key={org.id} value={org.id} label={`${org.name} - ${org.region}`}>
                    {org.name} - {org.region} (历史成功率: {org.successRate}%)
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Alert
              message="指定分案后，所有案件将直接分配给选定的处置机构"
              type="warning"
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
          >
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Radio.Button value="MANUAL" style={{ width: '100%', height: '80px' }}>
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <UserOutlined style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} />
                    <div>手动分案</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>灵活控制</div>
                  </div>
                </Radio.Button>
              </Col>
              <Col span={6}>
                <Radio.Button value="BIDDING" style={{ width: '100%', height: '80px' }}>
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <TrophyOutlined style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} />
                    <div>竞标分案</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>价高者得</div>
                  </div>
                </Radio.Button>
              </Col>
              <Col span={6}>
                <Radio.Button value="SMART" style={{ width: '100%', height: '80px' }}>
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <RobotOutlined style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} />
                    <div>智能分案</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>自动匹配</div>
                  </div>
                </Radio.Button>
              </Col>
              <Col span={6}>
                <Radio.Button value="DESIGNATED" style={{ width: '100%', height: '80px' }}>
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <TeamOutlined style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} />
                    <div>指定分案</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>定向分配</div>
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