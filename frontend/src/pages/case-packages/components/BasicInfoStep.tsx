import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tooltip,
  Button,
  Tag
} from 'antd';
import { InfoCircleOutlined, CalculatorOutlined } from '@ant-design/icons';
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
  const [disposalPeriod, setDisposalPeriod] = useState<number | null>(null);
  
  // 生成案件包编号
  const generatePackageCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PKG${timestamp}${random}`;
  };

  // 初始化表单默认值
  useEffect(() => {
    const currentValues = form.getFieldsValue();
    if (!currentValues.packageCode) {
      form.setFieldsValue({
        packageCode: generatePackageCode(),
        expectedRecoveryRate: 5, // 默认5%
        expectedRecoveryRateMin: 1, // 默认最低1%
        expectedDisposalDays: 90,
        reportingFrequency: 'WEEKLY',
        settlementMethod: 'MONTHLY'
      });
    }
  }, [form]);

  // 监听委托期限变化，自动计算处置周期
  const handleEntrustDatesChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      const days = dates[1].diff(dates[0], 'day');
      setDisposalPeriod(days);
      // 同时更新预期处置天数的默认值（如果当前没有值）
      const currentDisposalDays = form.getFieldValue('expectedDisposalDays');
      if (!currentDisposalDays) {
        form.setFieldValue('expectedDisposalDays', days);
      }
    } else {
      setDisposalPeriod(null);
    }
  };

  // 快捷设置回收率
  const setQuickRecoveryRate = (rate: number) => {
    form.setFieldValue('expectedRecoveryRate', rate);
  };

  // 快捷设置最低回收率
  const setQuickMinRecoveryRate = (rate: number) => {
    form.setFieldValue('expectedRecoveryRateMin', rate);
  };

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
                label={
                  <Space>
                    委托期限
                    {disposalPeriod && (
                      <Tag color="blue" icon={<CalculatorOutlined />}>
                        处置周期：{disposalPeriod}天
                      </Tag>
                    )}
                  </Space>
                }
                name="entrustDates"
                rules={[{ required: true, message: '请选择委托期限' }]}
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  placeholder={['开始日期', '结束日期']}
                  onChange={handleEntrustDatesChange}
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
                  <Option value="PRESERVATION">诉前保全</Option>
                  <Option value="OTHER">其他</Option>
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
                    <Tooltip title="预期能够回收的债务比例，支持精确到0.01%">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                name="expectedRecoveryRate"
                rules={[
                  { required: true, message: '请输入预期回收率' },
                  { type: 'number', min: 0.01, max: 100, message: '请输入0.01-100之间的数值' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  max={100}
                  step={0.01}
                  precision={2}
                  placeholder="请输入预期回收率"
                  formatter={value => `${value}%`}
                  parser={value => value?.replace('%', '') as any}
                />
              </Form.Item>
              <Space wrap style={{ marginTop: -10 }}>
                <Text type="secondary">快捷设置：</Text>
                <Button size="small" onClick={() => setQuickRecoveryRate(0.5)}>0.5%</Button>
                <Button size="small" onClick={() => setQuickRecoveryRate(1)}>1%</Button>
                <Button size="small" onClick={() => setQuickRecoveryRate(2)}>2%</Button>
                <Button size="small" onClick={() => setQuickRecoveryRate(5)}>5%</Button>
                <Button size="small" onClick={() => setQuickRecoveryRate(10)}>10%</Button>
                <Button size="small" onClick={() => setQuickRecoveryRate(20)}>20%</Button>
              </Space>
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
                extra={disposalPeriod ? `委托期限共${disposalPeriod}天，建议不超过此期限` : ''}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={disposalPeriod || 365}
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
                label={
                  <Space>
                    最低预期回收率
                    <Tooltip title="可接受的最低回收率，支持精确到0.01%">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                name="expectedRecoveryRateMin"
                rules={[
                  { type: 'number', min: 0.01, max: 100, message: '请输入0.01-100之间的数值' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  max={100}
                  step={0.01}
                  precision={2}
                  placeholder="请输入最低预期回收率"
                  formatter={value => `${value}%`}
                  parser={value => value?.replace('%', '') as any}
                />
              </Form.Item>
              <Space wrap style={{ marginTop: -10 }}>
                <Text type="secondary">快捷设置：</Text>
                <Button size="small" onClick={() => setQuickMinRecoveryRate(0.1)}>0.1%</Button>
                <Button size="small" onClick={() => setQuickMinRecoveryRate(0.5)}>0.5%</Button>
                <Button size="small" onClick={() => setQuickMinRecoveryRate(1)}>1%</Button>
                <Button size="small" onClick={() => setQuickMinRecoveryRate(2)}>2%</Button>
                <Button size="small" onClick={() => setQuickMinRecoveryRate(5)}>5%</Button>
              </Space>
            </Col>
            <Col span={12}>
              {/* 预留空间，可添加其他字段 */}
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default BasicInfoStep;