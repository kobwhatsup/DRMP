import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Select, Button, Space, Row, Col, InputNumber, 
  DatePicker, message, Spin, Divider, Upload, Steps
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, 
  UploadOutlined, BankOutlined, TeamOutlined
} from '@ant-design/icons';
import organizationService, { 
  OrganizationCreateRequest, 
  OrganizationUpdateRequest,
  OrganizationDetail 
} from '@/services/organizationService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

interface OrganizationFormProps {
  mode: 'create' | 'edit';
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationDetail | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadOrganizationDetail();
    }
  }, [mode, id]);

  const loadOrganizationDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await organizationService.getOrganizationDetail(Number(id));
      setOrganization(data);
      
      // 设置表单值
      form.setFieldsValue({
        ...data,
        registrationDate: data.registrationDate ? dayjs(data.registrationDate) : null,
        serviceRegions: data.serviceRegions ? Array.from(data.serviceRegions) : [],
        businessScopes: data.businessScopes ? Array.from(data.businessScopes) : [],
        disposalTypes: data.disposalTypes ? Array.from(data.disposalTypes) : [],
        settlementMethods: data.settlementMethods ? Array.from(data.settlementMethods) : [],
      });
    } catch (error) {
      console.error('加载机构详情失败:', error);
      message.error('加载机构详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);

      const submitData = {
        ...values,
        registrationDate: values.registrationDate ? values.registrationDate.format('YYYY-MM-DD') : null,
      };

      if (mode === 'create') {
        await organizationService.createOrganization(submitData as OrganizationCreateRequest);
        message.success('机构创建成功');
      } else if (id) {
        await organizationService.updateOrganization(Number(id), submitData as OrganizationUpdateRequest);
        message.success('机构更新成功');
      }

      navigate('/organizations');
    } catch (error) {
      console.error('提交失败:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('操作失败');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const organizationTypes = [
    // 案源机构
    { value: 'BANK', label: '银行', category: 'SOURCE' },
    { value: 'CONSUMER_FINANCE', label: '消费金融公司', category: 'SOURCE' },
    { value: 'ONLINE_LOAN', label: '网络贷款公司', category: 'SOURCE' },
    { value: 'MICRO_LOAN', label: '小额贷款公司', category: 'SOURCE' },
    { value: 'ASSIST_LOAN', label: '助贷公司', category: 'SOURCE' },
    { value: 'AMC', label: '资产管理公司', category: 'SOURCE' },
    { value: 'OTHER', label: '其他', category: 'SOURCE' },
    // 处置机构
    { value: 'MEDIATION_CENTER', label: '调解中心', category: 'DISPOSAL' },
    { value: 'LAW_FIRM', label: '律师事务所', category: 'DISPOSAL' },
    { value: 'DISPOSAL_COMPANY', label: '处置公司', category: 'DISPOSAL' },
    { value: 'OTHER', label: '其他', category: 'DISPOSAL' },
  ];

  const serviceRegionOptions = [
    '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
    '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
    '浙江省', '安徽省', '福建省', '江西省', '山东省',
    '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
    '海南省', '重庆市', '四川省', '贵州省', '云南省',
    '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
    '新疆维吾尔自治区'
  ];

  const businessScopeOptions = [
    '个人信贷', '企业信贷', '信用卡', '消费金融',
    '车贷', '房贷', '经营贷', '现金贷'
  ];

  const disposalTypeOptions = [
    '诉前调解', '诉讼代理', '仲裁代理', '执行代理',
    '协商还款', '分期还款', '减免处理', '资产处置'
  ];

  const settlementMethodOptions = [
    '按件收费', '按比例收费', '固定费用', '混合收费'
  ];

  const renderBasicInfo = () => (
    <Card title="基本信息">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="机构代码"
            name="orgCode"
            rules={[
              { required: true, message: '请输入机构代码' },
              { pattern: /^[A-Z0-9]{6,20}$/, message: '机构代码格式不正确' }
            ]}
          >
            <Input placeholder="请输入机构代码" disabled={mode === 'edit'} />
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
            name="type"
            rules={[{ required: true, message: '请选择机构类型' }]}
          >
            <Select placeholder="请选择机构类型" disabled={mode === 'edit'}>
              <Select.OptGroup label="案源机构">
                {organizationTypes.filter(t => t.category === 'SOURCE').map(type => (
                  <Option key={type.value} value={type.value}>
                    <BankOutlined /> {type.label}
                  </Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="处置机构">
                {organizationTypes.filter(t => t.category === 'DISPOSAL').map(type => (
                  <Option key={type.value} value={type.value}>
                    <TeamOutlined /> {type.label}
                  </Option>
                ))}
              </Select.OptGroup>
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
            label="注册资本（万元）"
            name="registeredCapital"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入注册资本"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="注册日期"
            name="registrationDate"
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择注册日期" />
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
            label="资质文件"
            name="qualificationDocuments"
          >
            <Input placeholder="请输入资质文件信息" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="机构地址"
            name="address"
          >
            <Input placeholder="请输入机构地址" />
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
    </Card>
  );

  const renderContactInfo = () => (
    <Card title="联系信息">
      <Row gutter={16}>
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
        <Col span={24}>
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
      </Row>
    </Card>
  );

  const renderBusinessInfo = () => (
    <Card title="业务信息">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="团队规模"
            name="teamSize"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="请输入团队规模"
              addonAfter="人"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="月处理能力"
            name="monthlyCaseCapacity"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="请输入月处理能力"
              addonAfter="件"
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="服务区域"
            name="serviceRegions"
          >
            <Select
              mode="multiple"
              placeholder="请选择服务区域"
              options={serviceRegionOptions.map(region => ({ label: region, value: region }))}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="业务范围"
            name="businessScopes"
          >
            <Select
              mode="multiple"
              placeholder="请选择业务范围"
              options={businessScopeOptions.map(scope => ({ label: scope, value: scope }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
        {({ getFieldValue }) => {
          const orgType = getFieldValue('type');
          const isDisposalOrg = orgType && ['MEDIATION_CENTER', 'LAW_FIRM', 'DISPOSAL_COMPANY', 'OTHER'].includes(orgType) && organizationTypes.find(t => t.value === orgType)?.category === 'DISPOSAL';
          
          return isDisposalOrg ? (
            <>
              <Divider />
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="处置类型"
                    name="disposalTypes"
                  >
                    <Select
                      mode="multiple"
                      placeholder="请选择处置类型"
                      options={disposalTypeOptions.map(type => ({ label: type, value: type }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="结算方式"
                    name="settlementMethods"
                  >
                    <Select
                      mode="multiple"
                      placeholder="请选择结算方式"
                      options={settlementMethodOptions.map(method => ({ label: method, value: method }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="合作案例"
                    name="cooperationCases"
                  >
                    <TextArea rows={4} placeholder="请输入合作案例描述" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : null;
        }}
      </Form.Item>
    </Card>
  );

  const renderBankInfo = () => (
    <Card title="银行信息">
      <Row gutter={16}>
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
    </Card>
  );

  const steps = [
    { title: '基本信息', content: renderBasicInfo() },
    { title: '联系信息', content: renderContactInfo() },
    { title: '业务信息', content: renderBusinessInfo() },
    { title: '银行信息', content: renderBankInfo() },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large" align="center">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/organizations')}
              >
                返回列表
              </Button>
              <h2 style={{ margin: 0 }}>
                {mode === 'create' ? '新建机构' : '编辑机构'}
              </h2>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button onClick={() => navigate('/organizations')}>
                取消
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={submitLoading}
                onClick={handleSubmit}
              >
                {mode === 'create' ? '创建' : '保存'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 表单内容 */}
      <Card>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="middle"
        >
          {steps[currentStep].content}
        </Form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                上一步
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                下一步
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={submitLoading}
                onClick={handleSubmit}
              >
                {mode === 'create' ? '创建机构' : '保存修改'}
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default OrganizationForm;