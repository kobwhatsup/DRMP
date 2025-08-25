import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Select, DatePicker, InputNumber, Upload, Button,
  Space, Steps, Row, Col, Table, Tag, message, Modal, Alert, Divider,
  Typography, Tooltip, Progress, Switch, Radio, Checkbox, Tabs
} from 'antd';
import {
  SaveOutlined, SendOutlined, EyeOutlined, UploadOutlined,
  FileExcelOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
  InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  CloudUploadOutlined, DownloadOutlined, FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/lib/upload/interface';
import dayjs from 'dayjs';
import CaseBatchImport from './CaseBatchImport';
import { casePackageService } from '@/services/caseService';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 案件包接口
interface CasePackage {
  packageName: string;
  packageCode: string;
  caseType: string;
  description: string;
  totalCases: number;
  totalAmount: number;
  avgAmount: number;
  publishType: 'PUBLIC' | 'INVITATION' | 'DIRECT';
  bidStartTime: string;
  bidEndTime: string;
  serviceRegions: string[];
  targetOrgTypes: string[];
  requirements: string;
  feeStructure: FeeStructure;
  slaRequirements: SLARequirements;
}

interface FeeStructure {
  feeType: 'FIXED' | 'PERCENTAGE' | 'TIERED';
  fixedFee?: number;
  percentageFee?: number;
  tieredFees?: TieredFee[];
}

interface TieredFee {
  minAmount: number;
  maxAmount: number;
  feeRate: number;
}

interface SLARequirements {
  maxResponseTime: number; // 小时
  maxDisposalTime: number; // 天
  minRecoveryRate: number; // 百分比
  reportingFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

interface CaseItem {
  id: string;
  debtorName: string;
  idCard: string;
  phone: string;
  amount: number;
  overdueAmount: number;
  overdueDays: number;
  region: string;
  caseType: string;
  status: 'VALID' | 'INVALID' | 'DUPLICATE';
  errors?: string[];
}

const CreateCasePackage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [caseData, setCaseData] = useState<CaseItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResults, setValidationResults] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    duplicate: 0
  });

  // 模拟案件数据
  const mockCaseData: CaseItem[] = [
    {
      id: '1',
      debtorName: '张三',
      idCard: '110101199001011234',
      phone: '13800138001',
      amount: 50000,
      overdueAmount: 52000,
      overdueDays: 120,
      region: '北京市',
      caseType: 'PERSONAL_LOAN',
      status: 'VALID'
    },
    {
      id: '2',
      debtorName: '李四',
      idCard: '310101199002022345',
      phone: '13800138002',
      amount: 30000,
      overdueAmount: 31500,
      overdueDays: 90,
      region: '上海市',
      caseType: 'CREDIT_CARD',
      status: 'VALID'
    },
    {
      id: '3',
      debtorName: '王五',
      idCard: 'INVALID_ID',
      phone: '138001380',
      amount: 80000,
      overdueAmount: 83000,
      overdueDays: 150,
      region: '广州市',
      caseType: 'PERSONAL_LOAN',
      status: 'INVALID',
      errors: ['身份证号格式错误', '手机号格式错误']
    }
  ];

  const steps = [
    {
      title: '基本信息',
      description: '填写案件包基本信息',
      icon: <InfoCircleOutlined />
    },
    {
      title: '上传案件',
      description: '上传和验证案件数据',
      icon: <CloudUploadOutlined />
    },
    {
      title: '发布设置',
      description: '设置发布方式和要求',
      icon: <SendOutlined />
    },
    {
      title: '预览确认',
      description: '确认信息并发布',
      icon: <CheckCircleOutlined />
    }
  ];

  // 案件列表列定义
  const caseColumns: ColumnsType<CaseItem> = [
    {
      title: '债务人信息',
      key: 'debtorInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.debtorName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.idCard}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.phone}
          </div>
        </div>
      )
    },
    {
      title: '金额信息',
      key: 'amountInfo',
      width: 150,
      render: (_, record) => (
        <div>
          <div>本金：¥{record.amount.toLocaleString()}</div>
          <div style={{ color: '#f50' }}>
            逾期：¥{record.overdueAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            逾期{record.overdueDays}天
          </div>
        </div>
      )
    },
    {
      title: '地区',
      dataIndex: 'region',
      width: 100
    },
    {
      title: '案件类型',
      dataIndex: 'caseType',
      width: 120,
      render: (type) => {
        const typeMap = {
          'PERSONAL_LOAN': '个人贷款',
          'CREDIT_CARD': '信用卡',
          'MORTGAGE': '抵押贷款',
          'CAR_LOAN': '车贷'
        };
        return <Tag>{typeMap[type as keyof typeof typeMap] || type}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status, record) => {
        const statusConfig = {
          'VALID': { color: 'green', text: '有效' },
          'INVALID': { color: 'red', text: '无效' },
          'DUPLICATE': { color: 'orange', text: '重复' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <div>
            <Tag color={config.color}>{config.text}</Tag>
            {record.errors && record.errors.length > 0 && (
              <Tooltip title={record.errors.join(', ')}>
                <ExclamationCircleOutlined style={{ color: '#f50', marginLeft: 4 }} />
              </Tooltip>
            )}
          </div>
        );
      }
    }
  ];

  // 步骤处理函数
  const handleNext = async () => {
    if (currentStep === 0) {
      // 验证基本信息
      try {
        await form.validateFields([
          'packageName', 'caseType', 'description', 'serviceRegions',
          'expectedRecoveryRate', 'expectedDisposalDays', 'entrustDateRange'
        ]);
        setCurrentStep(1);
      } catch (error) {
        message.error('请完善基本信息');
      }
    } else if (currentStep === 1) {
      // 验证案件数据
      if (caseData.length === 0) {
        message.error('请上传案件数据');
        return;
      }
      const validCases = caseData.filter(c => c.status === 'VALID');
      if (validCases.length === 0) {
        message.error('没有有效的案件数据');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // 验证发布设置
      try {
        await form.validateFields([
          'publishType', 'bidStartTime', 'bidEndTime', 'requirements'
        ]);
        setCurrentStep(3);
      } catch (error) {
        message.error('请完善发布设置');
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const values = await form.getFieldsValue();
      console.log('保存草稿:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('草稿保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const values = await form.getFieldsValue();
      console.log('发布案件包:', values);
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('案件包发布成功');
      navigate('/case-packages');
    } catch (error) {
      message.error('发布失败');
    } finally {
      setLoading(false);
    }
  };

  // 文件上传处理
  const handleFileUpload = (file: UploadFile) => {
    setLoading(true);
    setUploadProgress(0);
    
    // 模拟文件上传和解析过程
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          // 模拟解析完成
          setTimeout(() => {
            setCaseData(mockCaseData);
            setValidationResults({
              total: mockCaseData.length,
              valid: mockCaseData.filter(c => c.status === 'VALID').length,
              invalid: mockCaseData.filter(c => c.status === 'INVALID').length,
              duplicate: mockCaseData.filter(c => c.status === 'DUPLICATE').length
            });
            setLoading(false);
            message.success('文件上传解析完成');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return false; // 阻止默认上传
  };

  const downloadTemplate = () => {
    message.info('正在下载案件模板文件...');
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="基本信息" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="packageName"
                  label="案件包名称"
                  rules={[{ required: true, message: '请输入案件包名称' }]}
                >
                  <Input placeholder="请输入案件包名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="packageCode"
                  label="案件包编号"
                  tooltip="系统自动生成，也可手动修改"
                >
                  <Input placeholder="系统自动生成" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="caseType"
                  label="案件类型"
                  rules={[{ required: true, message: '请选择案件类型' }]}
                >
                  <Select placeholder="请选择案件类型">
                    <Option value="PERSONAL_LOAN">个人信用贷款</Option>
                    <Option value="CREDIT_CARD">信用卡</Option>
                    <Option value="MORTGAGE">抵押贷款</Option>
                    <Option value="CAR_LOAN">车辆贷款</Option>
                    <Option value="BUSINESS_LOAN">企业贷款</Option>
                    <Option value="MIXED">混合类型</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="serviceRegions"
                  label="服务区域"
                  rules={[{ required: true, message: '请选择服务区域' }]}
                >
                  <Select mode="multiple" placeholder="请选择服务区域">
                    <Option value="北京市">北京市</Option>
                    <Option value="上海市">上海市</Option>
                    <Option value="广州市">广州市</Option>
                    <Option value="深圳市">深圳市</Option>
                    <Option value="杭州市">杭州市</Option>
                    <Option value="南京市">南京市</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="expectedRecoveryRate"
                  label="预期回收率"
                  tooltip="预期的债务回收百分比"
                  rules={[{ required: true, message: '请输入预期回收率' }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    step={0.1}
                    precision={2}
                    style={{ width: '100%' }}
                    placeholder="请输入预期回收率（%）"
                    addonAfter="%"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expectedRecoveryRateMin"
                  label="最低预期回收率"
                  tooltip="可接受的最低债务回收百分比"
                >
                  <InputNumber
                    min={0}
                    max={100}
                    step={0.1}
                    precision={2}
                    style={{ width: '100%' }}
                    placeholder="请输入最低预期回收率（%）"
                    addonAfter="%"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="expectedDisposalDays"
                  label="预期处置天数"
                  tooltip="预计完成案件处置的天数"
                  rules={[{ required: true, message: '请输入预期处置天数' }]}
                >
                  <InputNumber
                    min={1}
                    max={1095} // 最多3年
                    style={{ width: '100%' }}
                    placeholder="请输入预期处置天数"
                    addonAfter="天"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="disposalPeriodDays"
                  label="处置周期"
                  tooltip="整体处置周期，包括准备、执行、收尾等环节"
                >
                  <InputNumber
                    min={1}
                    max={1095} // 最多3年
                    style={{ width: '100%' }}
                    placeholder="请输入处置周期"
                    addonAfter="天"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="preferredDisposalMethods"
                  label="偏好处置方式"
                  tooltip="选择偏好的案件处置方式，可多选"
                >
                  <Select mode="multiple" placeholder="请选择偏好处置方式">
                    <Option value="mediation">调解</Option>
                    <Option value="litigation">诉讼</Option>
                    <Option value="preservation">保全</Option>
                    <Option value="negotiation">协商</Option>
                    <Option value="other">其他</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="assignmentStrategy"
                  label="分案策略"
                  tooltip="案件分配给处置机构的策略"
                >
                  <Select placeholder="请选择分案策略">
                    <Option value="AUTOMATIC">自动分案</Option>
                    <Option value="MANUAL">手动分案</Option>
                    <Option value="BIDDING">竞价分案</Option>
                    <Option value="ROUND_ROBIN">轮询分案</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="entrustDateRange"
                  label="委托期限"
                  tooltip="案件委托的开始和结束日期"
                  rules={[{ required: true, message: '请选择委托期限' }]}
                >
                  <RangePicker 
                    style={{ width: '100%' }}
                    placeholder={['委托开始日期', '委托结束日期']}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="案件包描述"
              rules={[{ required: true, message: '请输入案件包描述' }]}
            >
              <TextArea rows={4} placeholder="请详细描述本批次案件的特点、要求等信息" />
            </Form.Item>
          </Card>
        );

      case 1:
        return (
          <div style={{ marginTop: 16 }}>
            <CaseBatchImport 
              onDataChange={(data, stats) => {
                setCaseData(data.map((item, index) => ({
                  id: String(index + 1),
                  debtorName: item.debtorName,
                  idCard: item.debtorIdCard,
                  phone: item.debtorPhone || '',
                  amount: item.loanAmount,
                  overdueAmount: item.remainingAmount,
                  overdueDays: item.overdueDays,
                  region: item.debtorProvince || '',
                  caseType: item.productLine || 'PERSONAL_LOAN',
                  status: item.isValid ? 'VALID' : 'INVALID',
                  errors: item.errors
                })));
                setValidationResults({
                  total: stats.totalRows,
                  valid: stats.validRows,
                  invalid: stats.invalidRows,
                  duplicate: stats.duplicateRows
                });
              }}
              embedded={true}
            />
          </div>
        );

      case 2:
        return (
          <div style={{ marginTop: 16 }}>
            <Card title="发布设置" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="publishType"
                    label="发布方式"
                    rules={[{ required: true, message: '请选择发布方式' }]}
                  >
                    <Radio.Group>
                      <Radio value="PUBLIC">公开发布</Radio>
                      <Radio value="INVITATION">邀请发布</Radio>
                      <Radio value="DIRECT">定向委托</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="targetOrgTypes"
                    label="目标机构类型"
                  >
                    <Checkbox.Group>
                      <Checkbox value="MEDIATION_CENTER">调解中心</Checkbox>
                      <Checkbox value="LAW_FIRM">律师事务所</Checkbox>
                      <Checkbox value="COLLECTION_AGENCY">催收公司</Checkbox>
                    </Checkbox.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="bidStartTime"
                    label="报名开始时间"
                    rules={[{ required: true, message: '请选择报名开始时间' }]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="bidEndTime"
                    label="报名结束时间"
                    rules={[{ required: true, message: '请选择报名结束时间' }]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="requirements"
                label="处置要求"
                rules={[{ required: true, message: '请输入处置要求' }]}
              >
                <TextArea rows={4} placeholder="请详细说明对处置机构的要求、处置方式、时间要求等" />
              </Form.Item>
            </Card>

            <Card title="费用设置">
              <Tabs defaultActiveKey="1">
                <TabPane tab="服务费设置" key="1">
                  <Form.Item name={['feeStructure', 'feeType']} label="费用类型">
                    <Radio.Group>
                      <Radio value="FIXED">固定费用</Radio>
                      <Radio value="PERCENTAGE">比例费用</Radio>
                      <Radio value="TIERED">阶梯费用</Radio>
                    </Radio.Group>
                  </Form.Item>
                </TabPane>
                <TabPane tab="SLA要求" key="2">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name={['slaRequirements', 'maxResponseTime']} label="最大响应时间(小时)">
                        <InputNumber min={1} max={72} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['slaRequirements', 'maxDisposalTime']} label="最大处置时间(天)">
                        <InputNumber min={1} max={365} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['slaRequirements', 'minRecoveryRate']} label="最低回款率(%)">
                        <InputNumber min={0} max={100} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </Card>
          </div>
        );

      case 3:
        return (
          <Card title="预览确认" style={{ marginTop: 16 }}>
            <Alert
              message="请仔细检查以下信息，确认无误后点击发布"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Divider>基本信息</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>案件包名称：</Text>
                <div>{form.getFieldValue('packageName')}</div>
              </Col>
              <Col span={8}>
                <Text strong>案件类型：</Text>
                <div>{form.getFieldValue('caseType')}</div>
              </Col>
              <Col span={8}>
                <Text strong>服务区域：</Text>
                <div>{form.getFieldValue('serviceRegions')?.join(', ')}</div>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Text strong>预期回收率：</Text>
                <div>{form.getFieldValue('expectedRecoveryRate')}%</div>
              </Col>
              <Col span={8}>
                <Text strong>最低预期回收率：</Text>
                <div>{form.getFieldValue('expectedRecoveryRateMin') || '未设置'}%</div>
              </Col>
              <Col span={8}>
                <Text strong>预期处置天数：</Text>
                <div>{form.getFieldValue('expectedDisposalDays')} 天</div>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Text strong>处置周期：</Text>
                <div>{form.getFieldValue('disposalPeriodDays') || '未设置'} 天</div>
              </Col>
              <Col span={8}>
                <Text strong>偏好处置方式：</Text>
                <div>{form.getFieldValue('preferredDisposalMethods')?.join(', ') || '未设置'}</div>
              </Col>
              <Col span={8}>
                <Text strong>分案策略：</Text>
                <div>{form.getFieldValue('assignmentStrategy') || '未设置'}</div>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Text strong>委托期限：</Text>
                <div>
                  {form.getFieldValue('entrustDateRange')?.[0]?.format('YYYY-MM-DD')} 至 
                  {form.getFieldValue('entrustDateRange')?.[1]?.format('YYYY-MM-DD')}
                </div>
              </Col>
            </Row>

            <Divider>案件数据</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>总案件数：</Text>
                <div>{validationResults.total}</div>
              </Col>
              <Col span={8}>
                <Text strong>有效案件：</Text>
                <div style={{ color: '#52c41a' }}>{validationResults.valid}</div>
              </Col>
              <Col span={8}>
                <Text strong>总金额：</Text>
                <div>¥{caseData.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</div>
              </Col>
            </Row>

            <Divider>发布设置</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>发布方式：</Text>
                <div>{form.getFieldValue('publishType')}</div>
              </Col>
              <Col span={8}>
                <Text strong>报名开始：</Text>
                <div>{form.getFieldValue('bidStartTime')?.format('YYYY-MM-DD HH:mm')}</div>
              </Col>
              <Col span={8}>
                <Text strong>报名结束：</Text>
                <div>{form.getFieldValue('bidEndTime')?.format('YYYY-MM-DD HH:mm')}</div>
              </Col>
            </Row>
          </Card>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    // 初始化表单默认值
    form.setFieldsValue({
      packageCode: `PKG${Date.now()}`,
      expectedRecoveryRate: 35.0, // 默认35%回收率
      expectedDisposalDays: 90,   // 默认90天处置期
      assignmentStrategy: 'AUTOMATIC', // 默认自动分案
      feeStructure: { feeType: 'PERCENTAGE' },
      slaRequirements: {
        maxResponseTime: 24,
        maxDisposalTime: 90,
        minRecoveryRate: 30,
        reportingFrequency: 'WEEKLY'
      }
    });
  }, [form]);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>创建案件包</Title>
        <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
          按照步骤创建和发布新的案件包，系统将引导您完成整个流程
        </Paragraph>
      </div>

      {/* 步骤指示器 */}
      <Card style={{ marginBottom: '24px' }}>
        <Steps current={currentStep} size="small">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
      </Card>

      {/* 表单内容 */}
      <Form form={form} layout="vertical">
        {renderStepContent()}
      </Form>

      {/* 操作按钮 */}
      <Card style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button onClick={() => navigate('/case-packages')}>
              取消
            </Button>
            <Button 
              icon={<SaveOutlined />} 
              onClick={handleSaveDraft}
              loading={loading}
            >
              保存草稿
            </Button>
          </Space>
          
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>
                上一步
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            ) : (
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handlePublish}
                loading={loading}
              >
                发布案件包
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CreateCasePackage;