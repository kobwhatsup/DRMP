import React from 'react';
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Slider,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tooltip
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface BasicInfoStepProps {
  form: FormInstance;
  initialValues?: any;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ form }) => {
  // 生成案件包编号
  const generatePackageCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PKG${timestamp}${random}`;
  };

  // 初始化表单默认值
  React.useEffect(() => {
    const currentValues = form.getFieldsValue();
    if (!currentValues.packageCode) {
      form.setFieldsValue({
        packageCode: generatePackageCode(),
        expectedRecoveryRate: 30,
        expectedDisposalDays: 90,
        reportingFrequency: 'WEEKLY',
        settlementMethod: 'MONTHLY'
      });
    }
  }, [form]);

  return (
    <div>
      <Card title="基本信息配置" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="案件包编号"
                name="packageCode"
                rules={[{ required: true, message: '请输入案件包编号' }]}
                extra="系统自动生成，可手动修改"
              >
                <Input placeholder="请输入案件包编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="案件包名称"
                name="packageName"
                rules={[
                  { required: true, message: '请输入案件包名称' },
                  { max: 200, message: '名称长度不能超过200个字符' }
                ]}
              >
                <Input placeholder="请输入案件包名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="委托期限"
                name="entrustDates"
                rules={[{ required: true, message: '请选择委托期限' }]}
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  placeholder={['开始日期', '结束日期']}
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="偏好处置方式"
                name="preferredDisposalMethods"
                rules={[{ required: true, message: '请选择偏好处置方式' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择偏好处置方式"
                  allowClear
                >
                  <Option value="MEDIATION">调解</Option>
                  <Option value="LITIGATION">诉讼</Option>
                  <Option value="ARBITRATION">仲裁</Option>
                  <Option value="ENFORCEMENT">强制执行</Option>
                  <Option value="ASSET_DISPOSAL">资产处置</Option>
                  <Option value="DEBT_RESTRUCTURING">债务重组</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    预期回收率
                    <Tooltip title="预期能够回收的债务比例">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                name="expectedRecoveryRate"
              >
                <Slider
                  marks={{
                    0: '0%',
                    25: '25%',
                    50: '50%',
                    75: '75%',
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
                    预期处置天数
                    <Tooltip title="预计完成全部案件处置所需的天数">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                name="expectedDisposalDays"
                rules={[
                  { required: true, message: '请输入预期处置天数' },
                  { type: 'number', min: 1, message: '处置天数不能少于1天' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={365}
                  placeholder="请输入预期处置天数"
                  suffix="天"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="案件包描述"
                name="description"
                rules={[{ max: 500, message: '描述长度不能超过500个字符' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请输入案件包描述信息，如案件特点、处置要求等"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="其他设置">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="报告频率"
                name="reportingFrequency"
                rules={[{ required: true, message: '请选择报告频率' }]}
              >
                <Select placeholder="请选择报告频率">
                  <Option value="DAILY">每日报告</Option>
                  <Option value="WEEKLY">每周报告</Option>
                  <Option value="BIWEEKLY">双周报告</Option>
                  <Option value="MONTHLY">每月报告</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="结算方式"
                name="settlementMethod"
                rules={[{ required: true, message: '请选择结算方式' }]}
              >
                <Select placeholder="请选择结算方式">
                  <Option value="MONTHLY">月度结算</Option>
                  <Option value="QUARTERLY">季度结算</Option>
                  <Option value="CASE_BY_CASE">逐案结算</Option>
                  <Option value="MILESTONE">里程碑结算</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="最低预期回收率"
                name="expectedRecoveryRateMin"
                rules={[
                  { type: 'number', min: 0, max: 100, message: '请输入0-100之间的数值' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  placeholder="请输入最低预期回收率"
                  formatter={value => `${value}%`}
                  parser={value => value?.replace('%', '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="处置周期"
                name="disposalPeriodDays"
                rules={[
                  { type: 'number', min: 1, message: '处置周期不能少于1天' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={365}
                  placeholder="请输入处置周期"
                  suffix="天"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default BasicInfoStep;