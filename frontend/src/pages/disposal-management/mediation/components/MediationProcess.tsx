import React, { useState } from 'react';
import {
  Card,
  Steps,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Row,
  Col,
  Divider,
  Alert,
  Upload,
  Table,
  Tag,
  Typography,
  Modal,
  Tabs,
  Timeline,
  message,
  Statistic,
  Descriptions
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  DollarOutlined,
  UploadOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Step } = Steps;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface RepaymentPlan {
  period: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

interface MediationRecord {
  id: string;
  caseNumber: string;
  currentStep: number;
  debtorName: string;
  originalAmount: number;
  negotiatedAmount?: number;
  repaymentPlans?: RepaymentPlan[];
  agreementStatus?: string;
  mediationNotes?: string;
}

const MediationProcess: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [repaymentPlans, setRepaymentPlans] = useState<RepaymentPlan[]>([]);
  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [caseDocuments, setCaseDocuments] = useState<any[]>([]);
  const [mediationRecords, setMediationRecords] = useState<any[]>([
    { id: 1, time: '2024-02-15 14:00', content: '首次调解会议，债务人表示愿意协商还款', color: 'green' },
    { id: 2, time: '2024-02-16 10:00', content: '债务人提出分期还款请求，希望分12期', color: 'blue' },
    { id: 3, time: '2024-02-17 15:00', content: '债权人同意分期方案，要求首期支付20%', color: 'orange' }
  ]);
  const [form] = Form.useForm();
  const [planForm] = Form.useForm();
  const [appointmentForm] = Form.useForm();
  const [recordForm] = Form.useForm();

  // 步骤配置
  const steps = [
    {
      title: '案件准备',
      description: '收集材料',
      icon: <FileTextOutlined />
    },
    {
      title: '调解预约',
      description: '安排时间',
      icon: <ClockCircleOutlined />
    },
    {
      title: '方案制定',
      description: '协商方案',
      icon: <CalculatorOutlined />
    },
    {
      title: '协议签署',
      description: '达成协议',
      icon: <SolutionOutlined />
    },
    {
      title: '履约跟踪',
      description: '监督执行',
      icon: <CheckCircleOutlined />
    }
  ];

  // 生成还款计划
  const generateRepaymentPlan = (values: any) => {
    const { totalAmount, periods, startDate } = values;
    const monthlyAmount = Math.round(totalAmount / periods);
    const plans: RepaymentPlan[] = [];

    for (let i = 0; i < periods; i++) {
      plans.push({
        period: i + 1,
        amount: i === periods - 1 ? totalAmount - monthlyAmount * (periods - 1) : monthlyAmount,
        dueDate: dayjs(startDate).add(i, 'month').format('YYYY-MM-DD'),
        status: 'pending'
      });
    }

    setRepaymentPlans(plans);
    message.success('还款计划已生成');
  };

  // 文档上传处理
  const handleDocumentUpload = (info: any) => {
    if (info.file.status === 'done') {
      setCaseDocuments(prev => [...prev, info.file]);
      message.success(`${info.file.name} 文件上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  };

  // 保存案件准备信息
  const handleSaveCasePrep = () => {
    form.validateFields().then(values => {
      console.log('保存案件准备信息:', values);
      message.success('案件准备信息已保存');
    });
  };

  // 预约调解
  const handleScheduleMediation = () => {
    appointmentForm.validateFields().then(values => {
      console.log('预约调解:', values);
      message.success('调解预约已创建');
      setAppointmentModalVisible(false);
      appointmentForm.resetFields();
    });
  };

  // 添加调解记录
  const handleAddRecord = () => {
    recordForm.validateFields().then(values => {
      const newRecord = {
        id: Date.now(),
        time: dayjs().format('YYYY-MM-DD HH:mm'),
        content: values.content,
        color: 'blue'
      };
      setMediationRecords(prev => [newRecord, ...prev]);
      message.success('调解记录已添加');
      setRecordModalVisible(false);
      recordForm.resetFields();
    });
  };

  // 在线签署
  const handleOnlineSignature = () => {
    setSignatureModalVisible(true);
  };

  // 协议下载
  const handleDownloadAgreement = () => {
    message.success('正在下载调解协议...');
  };

  // 协议打印
  const handlePrintAgreement = () => {
    window.print();
    message.success('正在打印调解协议...');
  };

  // 发送协议给双方
  const handleSendAgreement = () => {
    message.success('调解协议已发送给双方当事人');
    setAgreementModalVisible(false);
  };

  // 确认还款
  const handleConfirmPayment = (plan: RepaymentPlan) => {
    const updatedPlans = repaymentPlans.map(p => 
      p.period === plan.period ? { ...p, status: 'paid' as const } : p
    );
    setRepaymentPlans(updatedPlans);
    message.success(`第${plan.period}期还款已确认`);
  };

  // 发送还款提醒
  const handleSendReminder = (plan: RepaymentPlan) => {
    message.success(`已向债务人发送第${plan.period}期还款提醒`);
  };

  // 完成调解
  const handleCompleteMediation = () => {
    Modal.confirm({
      title: '确认完成调解',
      content: '确认要完成此案件的调解吗？完成后案件状态将变为已结案。',
      onOk: () => {
        message.success('调解案件已完成结案');
      }
    });
  };

  // 还款计划表格列
  const planColumns = [
    {
      title: '期数',
      dataIndex: 'period',
      key: 'period',
      render: (period: number) => `第${period}期`
    },
    {
      title: '还款金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`
    },
    {
      title: '到期日期',
      dataIndex: 'dueDate',
      key: 'dueDate'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          pending: { color: 'blue', text: '待还款' },
          paid: { color: 'green', text: '已还款' },
          overdue: { color: 'red', text: '已逾期' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card 
            title="案件准备"
            extra={
              <Button type="primary" onClick={handleSaveCasePrep}>
                保存信息
              </Button>
            }
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="债权证明材料">
                    <Upload
                      action="/api/upload"
                      onChange={handleDocumentUpload}
                      multiple
                    >
                      <Button icon={<UploadOutlined />}>上传借款合同</Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="还款记录">
                    <Upload
                      action="/api/upload"
                      onChange={handleDocumentUpload}
                      multiple
                    >
                      <Button icon={<UploadOutlined />}>上传还款流水</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item 
                label="案件概述" 
                name="caseOverview"
                rules={[{ required: true, message: '请输入案件基本情况' }]}
              >
                <TextArea rows={4} placeholder="请输入案件基本情况..." />
              </Form.Item>

              <Alert
                message="材料清单"
                description="1. 借款合同 2. 还款记录 3. 催收记录 4. 债务人身份信息"
                type="info"
                showIcon
              />

              {caseDocuments.length > 0 && (
                <Form.Item label="已上传文件">
                  <div>
                    {caseDocuments.map((doc, index) => (
                      <Tag key={index} style={{ marginBottom: 8 }}>
                        {doc.name}
                      </Tag>
                    ))}
                  </div>
                </Form.Item>
              )}
            </Form>
          </Card>
        );

      case 1:
        return (
          <Card 
            title="调解预约"
            extra={
              <Button 
                type="primary" 
                onClick={() => setAppointmentModalVisible(true)}
              >
                创建预约
              </Button>
            }
          >
            <Form form={appointmentForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="调解时间" 
                    name="mediationTime"
                    rules={[{ required: true, message: '请选择调解时间' }]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="调解地点" 
                    name="location"
                    rules={[{ required: true, message: '请选择调解地点' }]}
                  >
                    <Select placeholder="选择调解地点">
                      <Option value="room1">调解室A</Option>
                      <Option value="room2">调解室B</Option>
                      <Option value="online">线上调解</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="调解员" 
                    name="mediator"
                    rules={[{ required: true, message: '请选择调解员' }]}
                  >
                    <Select placeholder="选择调解员">
                      <Option value="wang">王调解员</Option>
                      <Option value="li">李调解员</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="参与方" name="participants">
                    <Select mode="multiple" placeholder="选择参与方">
                      <Option value="debtor">债务人</Option>
                      <Option value="guarantor">担保人</Option>
                      <Option value="lawyer">律师</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="预约备注" name="notes">
                <TextArea rows={3} placeholder="特殊要求或注意事项..." />
              </Form.Item>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Space>
                  <Button type="primary" onClick={handleScheduleMediation}>
                    确认预约
                  </Button>
                  <Button>
                    发送通知
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        );

      case 2:
        return (
          <Card title="方案制定">
            <Tabs 
              defaultActiveKey="calculator"
              tabBarExtraContent={
                <Button 
                  size="small" 
                  type="primary" 
                  onClick={() => setRecordModalVisible(true)}
                >
                  添加记录
                </Button>
              }
            >
              <TabPane tab="还款计算器" key="calculator">
                <Form
                  form={planForm}
                  layout="vertical"
                  onFinish={generateRepaymentPlan}
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        label="原始债务"
                        name="originalAmount"
                        initialValue={50000}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/\¥\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="协商金额"
                        name="totalAmount"
                        rules={[{ required: true, message: '请输入协商金额' }]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/\¥\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="减免金额"
                        name="discountAmount"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          disabled
                          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        label="分期期数"
                        name="periods"
                        rules={[{ required: true, message: '请选择分期期数' }]}
                      >
                        <Select placeholder="选择期数">
                          <Option value={3}>3期</Option>
                          <Option value={6}>6期</Option>
                          <Option value={12}>12期</Option>
                          <Option value={24}>24期</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="首期还款日"
                        name="startDate"
                        rules={[{ required: true, message: '请选择首期还款日' }]}
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label=" ">
                        <Button type="primary" htmlType="submit" block>
                          生成还款计划
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>

                {repaymentPlans.length > 0 && (
                  <>
                    <Divider />
                    <Table
                      columns={planColumns}
                      dataSource={repaymentPlans}
                      rowKey="period"
                      pagination={false}
                      size="small"
                    />
                  </>
                )}
              </TabPane>

              <TabPane 
                tab="调解记录" 
                key="records"
              >
                <Timeline>
                  {mediationRecords.map(record => (
                    <Timeline.Item key={record.id} color={record.color}>
                      <p>{record.time}</p>
                      <p>{record.content}</p>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </TabPane>
            </Tabs>
          </Card>
        );

      case 3:
        return (
          <Card title="协议签署">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="调解协议要点"
                description={
                  <ul>
                    <li>债务人承认债务金额：¥50,000</li>
                    <li>协商还款金额：¥45,000（减免¥5,000）</li>
                    <li>还款方式：分12期，每期¥3,750</li>
                    <li>首期还款日：2024年3月1日</li>
                  </ul>
                }
                type="success"
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    block
                    onClick={() => setAgreementModalVisible(true)}
                  >
                    生成调解协议
                  </Button>
                </Col>
                <Col span={12}>
                  <Button icon={<EditOutlined />} block onClick={handleOnlineSignature}>
                    在线签署
                  </Button>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <Button icon={<PrinterOutlined />} block onClick={handlePrintAgreement}>
                    打印协议
                  </Button>
                </Col>
                <Col span={8}>
                  <Button icon={<DownloadOutlined />} block onClick={handleDownloadAgreement}>
                    下载协议
                  </Button>
                </Col>
                <Col span={8}>
                  <Button icon={<UploadOutlined />} block onClick={() => setUploadModalVisible(true)}>
                    上传签署版
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>
        );

      case 4:
        return (
          <Card title="履约跟踪">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="已还期数"
                    value={3}
                    suffix="/ 12期"
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="已还金额"
                    value={11250}
                    prefix="¥"
                    suffix="/ 45,000"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="履约率"
                    value={100}
                    suffix="%"
                    prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
                  />
                </Card>
              </Col>
            </Row>

            <Table
              columns={[
                ...planColumns,
                {
                  title: '操作',
                  key: 'action',
                  render: (record: RepaymentPlan) => (
                    <Space>
                      {record.status === 'pending' && (
                        <Button 
                          type="link" 
                          size="small"
                          onClick={() => handleConfirmPayment(record)}
                        >
                          确认还款
                        </Button>
                      )}
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => handleSendReminder(record)}
                      >
                        发送提醒
                      </Button>
                    </Space>
                  )
                }
              ]}
              dataSource={repaymentPlans.map((plan, index) => ({
                ...plan,
                status: index < 3 ? 'paid' : 'pending'
              }))}
              rowKey="period"
              pagination={false}
            />
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Card>
        <Steps current={currentStep} onChange={setCurrentStep}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>

        <Divider />

        {renderStepContent()}

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
              <Button type="primary" onClick={handleCompleteMediation}>
                完成调解
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* 协议生成弹窗 */}
      <Modal
        title="调解协议预览"
        open={agreementModalVisible}
        onCancel={() => setAgreementModalVisible(false)}
        width={800}
        footer={[
          <Button key="edit" icon={<EditOutlined />}>
            编辑
          </Button>,
          <Button key="download" icon={<DownloadOutlined />} onClick={handleDownloadAgreement}>
            下载
          </Button>,
          <Button key="send" type="primary" onClick={handleSendAgreement}>
            发送给双方
          </Button>
        ]}
      >
        <div style={{ padding: '20px', background: '#f5f5f5' }}>
          <Title level={3} style={{ textAlign: 'center' }}>债务调解协议书</Title>
          <p>协议编号：MED-2024-001-AG</p>
          <p>签订日期：{dayjs().format('YYYY年MM月DD日')}</p>
          
          <Divider />
          
          <p><strong>甲方（债权人）：</strong>某某银行股份有限公司</p>
          <p><strong>乙方（债务人）：</strong>张三</p>
          
          <Divider />
          
          <p>鉴于乙方因个人原因未能按期偿还甲方债务，经双方友好协商，达成如下协议：</p>
          
          <ol>
            <li>乙方确认截至本协议签订之日，尚欠甲方债务本金人民币50,000元。</li>
            <li>甲方同意减免部分利息和费用，乙方需偿还总金额为人民币45,000元。</li>
            <li>还款方式：乙方分12期偿还，每期还款3,750元。</li>
            <li>首期还款日为2024年3月1日，此后每月1日为还款日。</li>
            <li>如乙方按期履行还款义务，甲方不再追究其他费用。</li>
          </ol>
          
          <Divider />
          
          <Row>
            <Col span={12}>
              <p>甲方签字：__________</p>
              <p>日期：__________</p>
            </Col>
            <Col span={12}>
              <p>乙方签字：__________</p>
              <p>日期：__________</p>
            </Col>
          </Row>
        </div>
      </Modal>

      {/* 添加调解记录弹窗 */}
      <Modal
        title="添加调解记录"
        open={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        onOk={handleAddRecord}
        width={600}
      >
        <Form form={recordForm} layout="vertical">
          <Form.Item
            label="记录内容"
            name="content"
            rules={[{ required: true, message: '请输入调解记录内容' }]}
          >
            <TextArea rows={4} placeholder="请详细描述调解过程和结果..." />
          </Form.Item>
          
          <Form.Item
            label="记录类型"
            name="type"
            initialValue="normal"
          >
            <Select>
              <Option value="normal">普通记录</Option>
              <Option value="important">重要节点</Option>
              <Option value="agreement">达成协议</Option>
              <Option value="payment">还款记录</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 在线签署弹窗 */}
      <Modal
        title="在线电子签署"
        open={signatureModalVisible}
        onCancel={() => setSignatureModalVisible(false)}
        onOk={() => {
          message.success('电子签署完成');
          setSignatureModalVisible(false);
        }}
        width={700}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            border: '2px dashed #d9d9d9', 
            padding: '40px', 
            marginBottom: '20px',
            borderRadius: '8px'
          }}>
            <EditOutlined style={{ fontSize: 48, color: '#999', marginBottom: 16 }} />
            <p>请在此区域进行电子签名</p>
            <Button type="primary">开始签署</Button>
          </div>
          
          <Space>
            <Button>重新签署</Button>
            <Button type="primary">确认签署</Button>
          </Space>
        </div>
      </Modal>

      {/* 文档上传弹窗 */}
      <Modal
        title="上传签署版协议"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={() => {
          message.success('协议上传成功');
          setUploadModalVisible(false);
        }}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Upload.Dragger
            name="agreement"
            action="/api/upload"
            accept=".pdf,.doc,.docx"
          >
            <p style={{ fontSize: 48, margin: '20px 0' }}>
              <UploadOutlined />
            </p>
            <p>点击或拖拽文件到此区域上传</p>
            <p style={{ color: '#999' }}>支持 PDF、Word 格式</p>
          </Upload.Dragger>
        </div>
      </Modal>

      {/* 预约确认弹窗 */}
      <Modal
        title="确认调解预约"
        open={appointmentModalVisible}
        onCancel={() => setAppointmentModalVisible(false)}
        onOk={handleScheduleMediation}
        width={600}
      >
        <Alert
          message="预约信息确认"
          description="请确认以下调解预约信息是否正确"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Descriptions bordered>
          <Descriptions.Item label="调解时间">2024年2月20日 14:00</Descriptions.Item>
          <Descriptions.Item label="调解地点">调解室A</Descriptions.Item>
          <Descriptions.Item label="调解员">王调解员</Descriptions.Item>
          <Descriptions.Item label="参与方">债务人、担保人</Descriptions.Item>
          <Descriptions.Item label="联系电话">13800138001</Descriptions.Item>
          <Descriptions.Item label="备注">需准备相关证明材料</Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};

export default MediationProcess;