import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Select, Button, Space, Row, Col,
  Upload, message, Divider, DatePicker, InputNumber, Typography
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined,
  UploadOutlined, BankOutlined, ContactsOutlined,
  SettingOutlined, FileTextOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

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
  const [formData, setFormData] = useState<Partial<SourceOrgFormData>>({});

  const isEdit = !!id && id !== 'create';

  useEffect(() => {
    if (isEdit) {
      loadOrgData();
    } else {
      // 新增时自动生成机构代码
      generateOrgCode();
    }
  }, [id, isEdit]);

  const generateOrgCode = () => {
    // 生成机构代码：ORG + 时间戳 + 随机数
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orgCode = `ORG${timestamp}${random}`;
    form.setFieldsValue({ orgCode });
  };

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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            cooperationMode: 'COMMISSION',
            feeStructure: {
              baseRate: 3.5
            }
          }}
        >
          {/* 基本信息 */}
          <div style={{ marginBottom: 32 }}>
            <Title level={4} style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <BankOutlined style={{ marginRight: 8 }} />
              基本信息
            </Title>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="机构代码"
                  name="orgCode"
                  tooltip="系统自动生成，无需手动输入"
                >
                  <Input placeholder="系统自动生成" disabled />
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
                >
                  <Input placeholder="请输入法定代表人" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="注册资本(万元)"
                  name="registeredCapital"
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
                >
                  <DatePicker style={{ width: '100%' }} placeholder="请选择成立日期" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="营业执照号"
                  name="businessLicense"
                >
                  <Input placeholder="请输入营业执照号" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="注册地址"
                  name="address"
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
          </div>

          <Divider />

          {/* 联系信息 */}
          <div style={{ marginBottom: 32 }}>
            <Title level={4} style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <ContactsOutlined style={{ marginRight: 8 }} />
              联系信息
            </Title>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="联系人"
                  name="contactPerson"
                >
                  <Input placeholder="请输入联系人" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="联系电话"
                  name="contactPhone"
                  rules={[
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
                >
                  <Input placeholder="请输入业务经理" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Title level={5} style={{ marginTop: 16, marginBottom: 16 }}>银行信息</Title>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="开户行"
                  name="bankName"
                >
                  <Input placeholder="请输入开户行" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="银行账号"
                  name="bankAccount"
                >
                  <Input placeholder="请输入银行账号" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* 业务配置 */}
          <div style={{ marginBottom: 32 }}>
            <Title level={4} style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <SettingOutlined style={{ marginRight: 8 }} />
              业务配置
            </Title>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="服务区域"
                  name="serviceRegions"
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
                >
                  <Select placeholder="请选择合作模式">
                    <Option value="COMMISSION">佣金模式</Option>
                    <Option value="FIXED_FEE">固定费用</Option>
                    <Option value="MIXED">混合模式</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Title level={5} style={{ marginTop: 16, marginBottom: 16 }}>费率结构</Title>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="基础费率(%)"
                  name={['feeStructure', 'baseRate']}
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
          </div>

          <Divider />

          {/* 资质文件 */}
          <div style={{ marginBottom: 32 }}>
            <Title level={4} style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              资质文件
            </Title>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  label="营业执照"
                  name="businessLicenseFile"
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
                >
                  <Upload {...uploadProps} fileList={formData.authorizationLetterFile}>
                    <Button icon={<UploadOutlined />}>点击上传授权委托书</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate('/source-orgs')}>
                取消
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                loading={submitting}
                htmlType="submit"
              >
                {isEdit ? '更新机构' : '创建机构'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SourceOrgForm;