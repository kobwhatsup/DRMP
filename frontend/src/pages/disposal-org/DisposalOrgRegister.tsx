import React, { useState } from 'react';
import {
  Form, Input, Select, DatePicker, Upload, Button, Steps, Card, 
  Row, Col, Checkbox, InputNumber, message, Radio, Space, Divider,
  Typography, Alert, Progress
} from 'antd';
import {
  UserOutlined, BankOutlined, FileOutlined, SafetyCertificateOutlined,
  UploadOutlined, CheckOutlined, WarningOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface DisposalOrgRegisterForm {
  // 基本信息
  orgName: string;
  orgType: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
  businessLicense: any;
  contractStartDate: string;
  
  // 处置能力信息
  teamSize: number;
  monthlyCapacity: number;
  currentLoad: number;
  serviceRegions: string[];
  businessScope: string[];
  disposalTypes: string[];
  settlementMethods: string[];
  
  // 合作案例和描述
  cooperationCases: string;
  orgDescription: string;
  
  // 同意条款
  agreeTerms: boolean;
}

const DisposalOrgRegister: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [registerProgress, setRegisterProgress] = useState(0);

  // 省份列表
  const provinces = [
    '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
    '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
    '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
    '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'
  ];

  const steps = [
    {
      title: '基本信息',
      icon: <UserOutlined />,
      description: '填写机构基本信息'
    },
    {
      title: '处置能力',
      icon: <BankOutlined />,
      description: '设置处置能力参数'
    },
    {
      title: '资质材料',
      icon: <FileOutlined />,
      description: '上传相关资质文件'
    },
    {
      title: '提交审核',
      icon: <SafetyCertificateOutlined />,
      description: '提交注册申请'
    }
  ];

  const handleNext = async () => {
    try {
      await form.validateFields();
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setRegisterProgress((currentStep + 1) * 25);
      }
    } catch (error) {
      message.error('请完善当前步骤的必填信息');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    setRegisterProgress(currentStep * 25);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 模拟提交注册申请
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('注册申请提交成功！我们将在3个工作日内完成审核。');
      navigate('/disposal-org/register-success');
      
    } catch (error) {
      message.error('注册失败，请检查填写信息');
    } finally {
      setLoading(false);
    }
  };

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    beforeUpload: (file: File) => {
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValidType) {
        message.error('只能上传 PDF 或图片文件！');
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB！');
      }
      return isValidType && isLt10M;
    },
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="机构基本信息" bordered={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="orgName"
                  label="机构名称"
                  rules={[{ required: true, message: '请输入机构名称' }]}
                >
                  <Input placeholder="请输入完整的机构名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="orgType"
                  label="机构类型"
                  rules={[{ required: true, message: '请选择机构类型' }]}
                >
                  <Select placeholder="请选择机构类型">
                    <Option value="MEDIATION_CENTER">调解中心</Option>
                    <Option value="LAW_FIRM">律师事务所</Option>
                    <Option value="DISPOSAL_COMPANY">处置公司</Option>
                    <Option value="OTHER">其他</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="contactPerson"
                  label="联系人"
                  rules={[{ required: true, message: '请输入联系人姓名' }]}
                >
                  <Input placeholder="请输入联系人姓名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contactPhone"
                  label="联系电话"
                  rules={[
                    { required: true, message: '请输入联系电话' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                  ]}
                >
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="邮箱地址"
                  rules={[
                    { required: true, message: '请输入邮箱地址' },
                    { type: 'email', message: '请输入正确的邮箱格式' }
                  ]}
                >
                  <Input placeholder="请输入邮箱地址" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contractStartDate"
                  label="合同起始日期"
                  rules={[{ required: true, message: '请选择合同起始日期' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    placeholder="请选择合同起始日期"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="办公地址"
              rules={[{ required: true, message: '请输入办公地址' }]}
            >
              <TextArea rows={2} placeholder="请输入详细的办公地址" />
            </Form.Item>
          </Card>
        );

      case 1:
        return (
          <Card title="处置能力信息" bordered={false}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="teamSize"
                  label="团队规模"
                  rules={[{ required: true, message: '请输入团队规模' }]}
                >
                  <InputNumber
                    min={1}
                    max={1000}
                    style={{ width: '100%' }}
                    placeholder="人员数量"
                    addonAfter="人"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="monthlyCapacity"
                  label="每月处理案件数量"
                  rules={[{ required: true, message: '请输入月处理能力' }]}
                >
                  <InputNumber
                    min={1}
                    max={100000}
                    style={{ width: '100%' }}
                    placeholder="案件数量"
                    addonAfter="件"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="currentLoad"
                  label="当前负载"
                  rules={[{ required: true, message: '请输入当前负载' }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    placeholder="负载百分比"
                    addonAfter="%"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="serviceRegions"
              label="服务区域"
              rules={[{ required: true, message: '请选择服务区域' }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择可服务的省份（可多选）"
                maxTagCount={5}
              >
                {provinces.map(province => (
                  <Option key={province} value={province}>{province}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="businessScope"
              label="业务范围"
              rules={[{ required: true, message: '请选择业务范围' }]}
            >
              <Checkbox.Group>
                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <Checkbox value="BANK">银行</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="CONSUMER_FINANCE">消费金融</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="ONLINE_LOAN">网络贷款</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="MICRO_LOAN">小额贷款</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="LENDING_ASSISTANCE">助贷</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="P2P">P2P</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="OTHER">其他</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              name="disposalTypes"
              label="处置类型"
              rules={[{ required: true, message: '请选择处置类型' }]}
            >
              <Checkbox.Group>
                <Row gutter={[16, 8]}>
                  <Col span={6}>
                    <Checkbox value="MEDIATION">调解</Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="LITIGATION">诉讼</Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="PRESERVATION">保全</Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="ARBITRATION">仲裁</Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="OTHER">其他</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              name="settlementMethods"
              label="结算方式"
              rules={[{ required: true, message: '请选择结算方式' }]}
            >
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="FULL_RISK">全风险（按回款比例分佣）</Radio>
                  <Radio value="HALF_RISK">半风险（固定费用+回款分佣）</Radio>
                  <Radio value="NO_RISK">无风险（按案件固定金额）</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Card>
        );

      case 2:
        return (
          <Card title="资质材料" bordered={false}>
            <Alert
              message="上传须知"
              description="请上传清晰的资质文件，支持PDF或图片格式，单个文件不超过10MB。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="businessLicense"
              label="营业执照"
              rules={[{ required: true, message: '请上传营业执照' }]}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>点击上传营业执照</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="cooperationCases"
              label="合作案例"
              tooltip="请描述贵机构曾经合作过的案源机构和处置效果"
            >
              <TextArea
                rows={4}
                placeholder="请详细描述合作过的机构名称、合作案件数量、回款率等效果指标..."
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="orgDescription"
              label="机构描述"
              tooltip="请介绍机构的特色、优势、专业能力等"
            >
              <TextArea
                rows={4}
                placeholder="请介绍机构的核心团队、专业能力、处置特色、技术优势等..."
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Card>
        );

      case 3:
        return (
          <Card title="提交审核" bordered={false}>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Progress 
                type="circle" 
                percent={registerProgress} 
                status="active"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
                注册信息确认
              </Title>
              <Text type="secondary">
                请确认以上信息无误后提交注册申请。审核通过后，您需要支付999元/月的会员费用以激活账户。
              </Text>

              <Alert
                message="审核流程说明"
                description={
                  <div>
                    <p>1. 提交注册申请后，我们将在3个工作日内完成资质审核</p>
                    <p>2. 审核通过后，系统将发送通知邮件和短信</p>
                    <p>3. 完成会员费支付后，即可正式开始使用平台服务</p>
                    <p>4. 如有疑问，请联系客服：400-000-0000</p>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginTop: 24, textAlign: 'left' }}
              />

              <Form.Item
                name="agreeTerms"
                valuePropName="checked"
                rules={[
                  { required: true, message: '请阅读并同意服务条款' }
                ]}
                style={{ marginTop: 24 }}
              >
                <Checkbox>
                  我已阅读并同意 <a href="/terms" target="_blank">《平台服务条款》</a> 和 <a href="/privacy" target="_blank">《隐私政策》</a>
                </Checkbox>
              </Form.Item>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
            处置机构入驻申请
          </Title>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
            成为DRMP平台专业处置机构，获取优质案源资源
          </Text>
        </div>

        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          {renderStepContent()}
        </Form>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            {currentStep > 0 && (
              <Button size="large" onClick={handlePrev}>
                上一步
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" size="large" onClick={handleNext}>
                下一步
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button 
                type="primary" 
                size="large" 
                onClick={handleSubmit}
                loading={loading}
                icon={<CheckOutlined />}
              >
                提交申请
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default DisposalOrgRegister;