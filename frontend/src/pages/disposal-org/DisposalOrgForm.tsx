import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Select, Button, Space, Row, Col, Steps, 
  Upload, message, Divider, DatePicker, InputNumber, Switch, Tag,
  Checkbox, Rate, TimePicker
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, TeamOutlined,
  UploadOutlined, BankOutlined, UserOutlined, ContactsOutlined,
  SettingOutlined, SafetyCertificateOutlined, TrophyOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const CheckboxGroup = Checkbox.Group;

interface DisposalOrgFormData {
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
  
  // 处置能力信息
  capacityInfo: {
    teamSize: number;
    monthlyCapacity: number;
    peakCapacity: number;
    avgHandlingTime: number;
    workingHours: string;
    workingDays: string[];
    languages: string[];
  };
  
  // 服务配置
  serviceConfig: {
    serviceRegions: string[];
    disposalTypes: string[];
    specialties: string[];
    caseTypes: string[];
    minAmount: number;
    maxAmount: number;
    acceptsUrgent: boolean;
    urgentSurcharge: number;
  };
  
  // 资质认证
  qualifications: {
    licenses: Array<{
      name: string;
      number: string;
      issueDate: string;
      expireDate: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      issueDate: string;
      level: string;
    }>;
  };
  
  // 团队信息
  teamInfo: {
    seniorMembers: number;
    juniorMembers: number;
    members: Array<{
      name: string;
      position: string;
      qualification: string;
      experience: number;
      specialties: string[];
    }>;
  };
  
  // 收费标准
  feeStructure: {
    feeType: 'FIXED' | 'PERCENTAGE' | 'MIXED';
    baseRate: number;
    tieredRates: Array<{
      minAmount: number;
      maxAmount: number;
      rate: number;
    }>;
    additionalFees: Array<{
      name: string;
      amount: number;
      type: 'FIXED' | 'PERCENTAGE';
    }>;
  };
  
  // 文件上传
  businessLicenseFile: any[];
  qualificationFiles: any[];
  certificationFiles: any[];
  teamCertFiles: any[];
}

const DisposalOrgForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<DisposalOrgFormData>>({});

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
      const mockData: DisposalOrgFormData = {
        orgCode: 'MC001',
        orgName: '北京朝阳调解中心',
        orgType: 'MEDIATION_CENTER',
        legalRepresentative: '王主任',
        registeredCapital: 500,
        registrationDate: '2019-03-15',
        businessLicense: '91110000MA001234X',
        address: '北京市朝阳区建国路88号',
        description: '专业从事金融纠纷调解服务的机构。',
        
        contactPerson: '王主任',
        contactPhone: '13800138001',
        email: 'wang@bjcymc.com',
        businessManager: '李经理',
        
        bankName: '中国建设银行朝阳支行',
        bankAccount: '1100123456789012',
        
        capacityInfo: {
          teamSize: 25,
          monthlyCapacity: 500,
          peakCapacity: 650,
          avgHandlingTime: 15,
          workingHours: '09:00-17:00',
          workingDays: ['周一', '周二', '周三', '周四', '周五'],
          languages: ['中文', '英文']
        },
        
        serviceConfig: {
          serviceRegions: ['北京', '天津', '河北'],
          disposalTypes: ['民事调解', '商事调解', '金融纠纷调解'],
          specialties: ['金融纠纷', '消费纠纷', '合同纠纷'],
          caseTypes: ['债务纠纷', '合同违约', '消费争议'],
          minAmount: 1000,
          maxAmount: 1000000,
          acceptsUrgent: true,
          urgentSurcharge: 20
        },
        
        qualifications: {
          licenses: [
            {
              name: '人民调解员证书',
              number: 'RMTZ2019001',
              issueDate: '2019-03-20',
              expireDate: '2024-03-20'
            }
          ],
          certifications: [
            {
              name: 'ISO9001质量管理体系认证',
              issuer: '中国质量认证中心',
              issueDate: '2020-06-15',
              level: '优秀'
            }
          ]
        },
        
        teamInfo: {
          seniorMembers: 8,
          juniorMembers: 17,
          members: [
            {
              name: '王主任',
              position: '主任调解员',
              qualification: '高级调解员',
              experience: 15,
              specialties: ['金融纠纷', '合同纠纷']
            }
          ]
        },
        
        feeStructure: {
          feeType: 'PERCENTAGE',
          baseRate: 5.0,
          tieredRates: [
            { minAmount: 0, maxAmount: 10000, rate: 5.0 },
            { minAmount: 10000, maxAmount: 50000, rate: 4.5 },
            { minAmount: 50000, maxAmount: 999999, rate: 4.0 }
          ],
          additionalFees: [
            { name: '紧急处理费', amount: 500, type: 'FIXED' }
          ]
        },
        
        businessLicenseFile: [],
        qualificationFiles: [],
        certificationFiles: [],
        teamCertFiles: []
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
      navigate('/disposal-orgs');
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请检查表单数据');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    try {
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

  const getStepFields = (step: number): (string | string[])[] => {
    switch (step) {
      case 0:
        return ['orgCode', 'orgName', 'orgType', 'legalRepresentative', 'registeredCapital'];
      case 1:
        return ['contactPerson', 'contactPhone', 'email'];
      case 2:
        return [['capacityInfo', 'teamSize'], ['capacityInfo', 'monthlyCapacity']];
      case 3:
        return [['serviceConfig', 'serviceRegions'], ['serviceConfig', 'disposalTypes']];
      case 4:
        return [];
      case 5:
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
                <Option value="MEDIATION_CENTER">调解中心</Option>
                <Option value="LAW_FIRM">律师事务所</Option>
                <Option value="COLLECTION_AGENCY">催收机构</Option>
                <Option value="ARBITRATION_CENTER">仲裁中心</Option>
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
      title: '处置能力',
      icon: <TeamOutlined />,
      content: (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="团队规模(人)"
              name={['capacityInfo', 'teamSize']}
              rules={[{ required: true, message: '请输入团队规模' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="请输入团队规模"
                min={1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="月处理能力(件)"
              name={['capacityInfo', 'monthlyCapacity']}
              rules={[{ required: true, message: '请输入月处理能力' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="请输入月处理能力"
                min={1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="峰值处理能力(件)"
              name={['capacityInfo', 'peakCapacity']}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="请输入峰值处理能力"
                min={1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="平均处理时间(天)"
              name={['capacityInfo', 'avgHandlingTime']}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="请输入平均处理时间"
                min={1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="工作时间"
              name={['capacityInfo', 'workingHours']}
            >
              <Input placeholder="如: 09:00-17:00" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="工作日期"
              name={['capacityInfo', 'workingDays']}
            >
              <CheckboxGroup
                options={['周一', '周二', '周三', '周四', '周五', '周六', '周日']}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="服务语言"
              name={['capacityInfo', 'languages']}
            >
              <Select mode="multiple" placeholder="请选择服务语言">
                <Option value="中文">中文</Option>
                <Option value="英文">英文</Option>
                <Option value="日文">日文</Option>
                <Option value="韩文">韩文</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      title: '服务配置',
      icon: <SettingOutlined />,
      content: (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="服务区域"
              name={['serviceConfig', 'serviceRegions']}
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
              label="处置类型"
              name={['serviceConfig', 'disposalTypes']}
              rules={[{ required: true, message: '请选择处置类型' }]}
            >
              <Select mode="multiple" placeholder="请选择处置类型">
                <Option value="民事调解">民事调解</Option>
                <Option value="商事调解">商事调解</Option>
                <Option value="金融纠纷调解">金融纠纷调解</Option>
                <Option value="法律咨询">法律咨询</Option>
                <Option value="诉讼代理">诉讼代理</Option>
                <Option value="债务追收">债务追收</Option>
                <Option value="电话催收">电话催收</Option>
                <Option value="上门催收">上门催收</Option>
                <Option value="商事仲裁">商事仲裁</Option>
                <Option value="金融仲裁">金融仲裁</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="专业领域"
              name={['serviceConfig', 'specialties']}
            >
              <Select mode="multiple" placeholder="请选择专业领域">
                <Option value="金融纠纷">金融纠纷</Option>
                <Option value="消费纠纷">消费纠纷</Option>
                <Option value="合同纠纷">合同纠纷</Option>
                <Option value="劳动纠纷">劳动纠纷</Option>
                <Option value="房产纠纷">房产纠纷</Option>
                <Option value="保险纠纷">保险纠纷</Option>
                <Option value="证券纠纷">证券纠纷</Option>
                <Option value="互联网纠纷">互联网纠纷</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="案件类型"
              name={['serviceConfig', 'caseTypes']}
            >
              <Select mode="multiple" placeholder="请选择案件类型">
                <Option value="债务纠纷">债务纠纷</Option>
                <Option value="合同违约">合同违约</Option>
                <Option value="消费争议">消费争议</Option>
                <Option value="贷款逾期">贷款逾期</Option>
                <Option value="信用卡透支">信用卡透支</Option>
                <Option value="担保代偿">担保代偿</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="最小处理金额(元)"
              name={['serviceConfig', 'minAmount']}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="请输入最小处理金额"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="最大处理金额(元)"
              name={['serviceConfig', 'maxAmount']}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="请输入最大处理金额"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="接受紧急案件"
              name={['serviceConfig', 'acceptsUrgent']}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="紧急案件加收(%)"
              name={['serviceConfig', 'urgentSurcharge']}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="紧急案件加收比例"
                min={0}
                max={100}
              />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      title: '资质认证',
      icon: <SafetyCertificateOutlined />,
      content: (
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="执业资质">
              <Form.List name={['qualifications', 'licenses']}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} style={{ marginBottom: 8 }}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label="资质名称"
                              rules={[{ required: true, message: '请输入资质名称' }]}
                            >
                              <Input placeholder="资质名称" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'number']}
                              label="证书编号"
                              rules={[{ required: true, message: '请输入证书编号' }]}
                            >
                              <Input placeholder="证书编号" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'issueDate']}
                              label="颁发日期"
                            >
                              <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'expireDate']}
                              label="到期日期"
                            >
                              <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Button type="link" onClick={() => remove(name)} danger>
                          删除
                        </Button>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>
                      添加执业资质
                    </Button>
                  </>
                )}
              </Form.List>
            </Form.Item>
          </Col>
          
          <Col span={24}>
            <Form.Item label="认证证书">
              <Form.List name={['qualifications', 'certifications']}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} style={{ marginBottom: 8 }}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label="认证名称"
                            >
                              <Input placeholder="认证名称" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'issuer']}
                              label="颁发机构"
                            >
                              <Input placeholder="颁发机构" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'issueDate']}
                              label="颁发日期"
                            >
                              <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'level']}
                              label="等级"
                            >
                              <Input placeholder="等级" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Button type="link" onClick={() => remove(name)} danger>
                          删除
                        </Button>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>
                      添加认证证书
                    </Button>
                  </>
                )}
              </Form.List>
            </Form.Item>
          </Col>
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
              label="资质证书文件"
              name="qualificationFiles"
            >
              <Upload {...uploadProps} multiple fileList={formData.qualificationFiles}>
                <Button icon={<UploadOutlined />}>点击上传资质证书</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="认证证书文件"
              name="certificationFiles"
            >
              <Upload {...uploadProps} multiple fileList={formData.certificationFiles}>
                <Button icon={<UploadOutlined />}>点击上传认证证书</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="团队资质文件"
              name="teamCertFiles"
            >
              <Upload {...uploadProps} multiple fileList={formData.teamCertFiles}>
                <Button icon={<UploadOutlined />}>点击上传团队资质文件</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <div className="disposal-org-form">
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/disposal-orgs')}
          >
            返回列表
          </Button>
          <h2 style={{ margin: 0 }}>
            {isEdit ? '编辑处置机构' : '新增处置机构'}
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
            capacityInfo: {
              workingDays: ['周一', '周二', '周三', '周四', '周五'],
              languages: ['中文']
            },
            serviceConfig: {
              acceptsUrgent: false,
              urgentSurcharge: 20
            },
            feeStructure: {
              feeType: 'PERCENTAGE',
              baseRate: 5.0
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

export default DisposalOrgForm;