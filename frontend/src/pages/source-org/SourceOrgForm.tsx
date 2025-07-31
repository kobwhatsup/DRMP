import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Select, Button, Space, Row, Col, Steps, 
  Upload, message, Divider, DatePicker, InputNumber, Switch, Tag
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined,
  UploadOutlined, BankOutlined, UserOutlined, ContactsOutlined,
  SettingOutlined, ApiOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface SourceOrgFormData {
  // 基本信息
  orgCode: string;
  orgName: string;
  orgType: string;
  legalRepresentative: string;
  registeredCapital: number;
  registrationDate: string;
  businessLicense: string;
  address: string;
  description: string;
  
  // 联系信息
  contactPerson: string;
  contactPhone: string;
  email: string;
  businessManager: string;
  
  // 银行信息
  bankName: string;
  bankAccount: string;
  
  // 业务配置
  serviceRegions: string[];
  businessScopes: string[];
  caseTypes: string[];
  
  // API配置
  apiEnabled: boolean;
  apiVersion: string;
  apiUrl: string;
  apiKey: string;
  webhookUrl: string;
  
  // 合作信息
  cooperationMode: string;
  feeStructure: {
    baseRate: number;
    tieredRates: Array<{
      minAmount: number;
      maxAmount: number;
      rate: number;
    }>;
  };
  
  // 文件上传
  businessLicenseFile: any[];
  organizationCodeFile: any[];
  authorizationLetterFile: any[];
}

const SourceOrgForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<SourceOrgFormData>>({});

  const isEdit = !!id && id !== 'create';

  useEffect(() => {
    if (isEdit) {
      loadOrgData();
    }
  }, [id, isEdit]);

  const loadOrgData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: SourceOrgFormData = {
        orgCode: 'ICBC001',
        orgName: '中国工商银行',
        orgType: 'BANK',
        legalRepresentative: '陈四清',
        registeredCapital: 35640000,
        registrationDate: '1984-01-01',
        businessLicense: '91110000100000567X',
        address: '北京市西城区复兴门内大街55号',
        description: '中国工商银行成立于1984年1月1日，是中央管理的大型国有银行。',
        
        contactPerson: '张经理',
        contactPhone: '13800138001',
        email: 'zhang@icbc.com',
        businessManager: '李明',
        
        bankName: '中国工商银行总行',
        bankAccount: '0200001019200000001',
        
        serviceRegions: ['北京', '上海', '广东', '江苏'],
        businessScopes: ['个人消费贷', '信用卡', '汽车贷款'],
        caseTypes: ['贷款逾期', '信用卡透支', '违约金'],
        
        apiEnabled: true,
        apiVersion: 'v2.1',
        apiUrl: 'https://api.icbc.com/drmp',
        apiKey: 'icbc_api_key_12345',
        webhookUrl: 'https://api.icbc.com/drmp/webhook',
        
        cooperationMode: 'COMMISSION',
        feeStructure: {
          baseRate: 3.5,
          tieredRates: [
            { minAmount: 0, maxAmount: 10000, rate: 3.5 },
            { minAmount: 10000, maxAmount: 50000, rate: 3.0 },
            { minAmount: 50000, maxAmount: 999999, rate: 2.5 }
          ]
        },
        
        businessLicenseFile: [],
        organizationCodeFile: [],
        authorizationLetterFile: []
      };
      
      form.setFieldsValue(mockData);
      setFormData(mockData);
    } catch (error) {
      console.error('加载机构数据失败:', error);
      message.error('加载机构数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      
      // API调用
      const apiCall = isEdit ? 
        console.log('更新机构:', values) : 
        console.log('创建机构:', values);
      
      message.success(isEdit ? '机构信息更新成功' : '机构创建成功');
      navigate('/source-orgs');
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请检查表单数据');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    try {
      // 验证当前步骤的表单字段
      const fieldsToValidate = getStepFields(currentStep);
      await form.validateFields(fieldsToValidate);
      
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('请填写完整的表单信息');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0:
        return ['orgCode', 'orgName', 'orgType', 'legalRepresentative', 'registeredCapital'];
      case 1:
        return ['contactPerson', 'contactPhone', 'email'];
      case 2:
        return ['serviceRegions', 'businessScopes'];
      case 3:
        return [];
      default:
        return [];
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    beforeUpload: (file) => {
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValidType) {
        message.error('只能上传PDF或图片文件');
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB');
      }
      return isValidType && isLt10M;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  const steps = [
    {
      title: '基本信息',
      icon: <BankOutlined />,
      content: (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="机构代码"
              name="orgCode"
              rules={[{ required: true, message: '请输入机构代码' }]}
            >
              <Input placeholder="请输入机构代码" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="机构名称"
              name="orgName"
              rules={[{ required: true, message: '请输入机构名称' }]}
            >
              <Input placeholder="请输入机构名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="机构类型"
              name="orgType"
              rules={[{ required: true, message: '请选择机构类型' }]}
            >
              <Select placeholder="请选择机构类型">
                <Option value="BANK">银行</Option>
                <Option value="CONSUMER_FINANCE">消费金融公司</Option>
                <Option value="ONLINE_LOAN">网络贷款公司</Option>
                <Option value="MICRO_LOAN">小额贷款公司</Option>
                <Option value="ASSIST_LOAN">助贷公司</Option>
                <Option value="AMC">资产管理公司</Option>
                <Option value="OTHER">其他</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="法定代表人"
              name="legalRepresentative"
              rules={[{ required: true, message: '请输入法定代表人' }]}
            >
              <Input placeholder="请输入法定代表人" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="注册资本(万元)"
              name="registeredCapital"
              rules={[{ required: true, message: '请输入注册资本' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="请输入注册资本"
                min={0}
                precision={2}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="成立日期"
              name="registrationDate"
              rules={[{ required: true, message: '请选择成立日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="营业执照号"
              name="businessLicense"
              rules={[{ required: true, message: '请输入营业执照号' }]}
            >
              <Input placeholder="请输入营业执照号" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="注册地址"
              name="address"
              rules={[{ required: true, message: '请输入注册地址' }]}
            >
              <Input placeholder="请输入注册地址" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="机构简介"
              name="description"
            >
              <TextArea rows={4} placeholder="请输入机构简介" />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      title: '联系信息',
      icon: <ContactsOutlined />,
      content: (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="联系人"
              name="contactPerson"
              rules={[{ required: true, message: '请输入联系人' }]}
            >
              <Input placeholder="请输入联系人" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="联系电话"
              name="contactPhone"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
              ]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="邮箱地址"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入正确的邮箱地址' }
              ]}
            >
              <Input placeholder="请输入邮箱地址" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="业务经理"
              name="businessManager"
              rules={[{ required: true, message: '请输入业务经理' }]}
            >
              <Input placeholder="请输入业务经理" />
            </Form.Item>
          </Col>
          
          <Divider>银行信息</Divider>
          
          <Col span={12}>
            <Form.Item
              label="开户行"
              name="bankName"
              rules={[{ required: true, message: '请输入开户行' }]}
            >
              <Input placeholder="请输入开户行" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="银行账号"
              name="bankAccount"
              rules={[{ required: true, message: '请输入银行账号' }]}
            >
              <Input placeholder="请输入银行账号" />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      title: '业务配置',
      icon: <SettingOutlined />,
      content: (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="服务区域"
              name="serviceRegions"
              rules={[{ required: true, message: '请选择服务区域' }]}
            >
              <Select 
                mode="multiple" 
                placeholder="请选择服务区域"
                showSearch
                optionFilterProp="children"
              >
                <Option value="北京">北京</Option>
                <Option value="上海">上海</Option>
                <Option value="广东">广东</Option>
                <Option value="江苏">江苏</Option>
                <Option value="浙江">浙江</Option>
                <Option value="山东">山东</Option>
                <Option value="河南">河南</Option>
                <Option value="四川">四川</Option>
                <Option value="湖北">湖北</Option>
                <Option value="湖南">湖南</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="业务范围"
              name="businessScopes"
              rules={[{ required: true, message: '请选择业务范围' }]}
            >
              <Select mode="multiple" placeholder="请选择业务范围">
                <Option value="个人消费贷">个人消费贷</Option>
                <Option value="信用卡">信用卡</Option>
                <Option value="汽车贷款">汽车贷款</Option>
                <Option value="房屋贷款">房屋贷款</Option>
                <Option value="经营贷款">经营贷款</Option>
                <Option value="其他贷款">其他贷款</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="案件类型"
              name="caseTypes"
              rules={[{ required: true, message: '请选择案件类型' }]}
            >
              <Select mode="multiple" placeholder="请选择案件类型">
                <Option value="贷款逾期">贷款逾期</Option>
                <Option value="信用卡透支">信用卡透支</Option>
                <Option value="违约金">违约金</Option>
                <Option value="利息逾期">利息逾期</Option>
                <Option value="担保代偿">担保代偿</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="合作模式"
              name="cooperationMode"
              rules={[{ required: true, message: '请选择合作模式' }]}
            >
              <Select placeholder="请选择合作模式">
                <Option value="COMMISSION">佣金模式</Option>
                <Option value="FIXED_FEE">固定费用</Option>
                <Option value="MIXED">混合模式</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Divider>费率结构</Divider>
          
          <Col span={24}>
            <Form.Item
              label="基础费率(%)"
              name={['feeStructure', 'baseRate']}
              rules={[{ required: true, message: '请输入基础费率' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="请输入基础费率"
                min={0}
                max={100}
                precision={2}
              />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      title: 'API配置',
      icon: <ApiOutlined />,
      content: (
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label="启用API对接"
              name="apiEnabled"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.apiEnabled !== curr.apiEnabled}>
            {({ getFieldValue }) => {
              const apiEnabled = getFieldValue('apiEnabled');
              return apiEnabled ? (
                <>
                  <Col span={12}>
                    <Form.Item
                      label="API版本"
                      name="apiVersion"
                      rules={[{ required: true, message: '请选择API版本' }]}
                    >
                      <Select placeholder="请选择API版本">
                        <Option value="v1.5">v1.5</Option>
                        <Option value="v2.0">v2.0</Option>
                        <Option value="v2.1">v2.1</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="API地址"
                      name="apiUrl"
                      rules={[
                        { required: true, message: '请输入API地址' },
                        { type: 'url', message: '请输入正确的URL地址' }
                      ]}
                    >
                      <Input placeholder="https://api.example.com/drmp" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="API密钥"
                      name="apiKey"
                      rules={[{ required: true, message: '请输入API密钥' }]}
                    >
                      <Input.Password placeholder="请输入API密钥" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="回调地址"
                      name="webhookUrl"
                      rules={[{ type: 'url', message: '请输入正确的URL地址' }]}
                    >
                      <Input placeholder="https://api.example.com/webhook" />
                    </Form.Item>
                  </Col>
                </>
              ) : null;
            }}
          </Form.Item>
        </Row>
      )
    },
    {
      title: '资质文件',
      icon: <UploadOutlined />,
      content: (
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label="营业执照"
              name="businessLicenseFile"
              rules={[{ required: true, message: '请上传营业执照' }]}
            >
              <Upload {...uploadProps} fileList={formData.businessLicenseFile}>
                <Button icon={<UploadOutlined />}>点击上传营业执照</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="组织机构代码证"
              name="organizationCodeFile"
            >
              <Upload {...uploadProps} fileList={formData.organizationCodeFile}>
                <Button icon={<UploadOutlined />}>点击上传组织机构代码证</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="授权委托书"
              name="authorizationLetterFile"
              rules={[{ required: true, message: '请上传授权委托书' }]}
            >
              <Upload {...uploadProps} fileList={formData.authorizationLetterFile}>
                <Button icon={<UploadOutlined />}>点击上传授权委托书</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <div className="source-org-form">
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/source-orgs')}
          >
            返回列表
          </Button>
          <h2 style={{ margin: 0 }}>
            {isEdit ? '编辑案源机构' : '新增案源机构'}
          </h2>
        </Space>
      </Card>

      <Card loading={loading}>
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((step, index) => (
            <Step 
              key={index} 
              title={step.title} 
              icon={step.icon}
              status={currentStep === index ? 'process' : currentStep > index ? 'finish' : 'wait'}
            />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            apiEnabled: false,
            cooperationMode: 'COMMISSION',
            feeStructure: {
              baseRate: 3.5
            }
          }}
        >
          <div style={{ minHeight: 400 }}>
            {steps[currentStep].content}
          </div>

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space>
              {currentStep > 0 && (
                <Button onClick={handlePrev}>
                  上一步
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  下一步
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  loading={submitting}
                  onClick={handleSubmit}
                >
                  {isEdit ? '更新机构' : '创建机构'}
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SourceOrgForm;