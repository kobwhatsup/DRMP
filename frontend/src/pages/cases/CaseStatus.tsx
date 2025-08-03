import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Space, Modal, Form, Input, Select, DatePicker,
  Steps, Timeline, Tabs, Row, Col, Statistic, Progress, Alert, Badge,
  Upload, message, Tooltip, Dropdown, Menu
} from 'antd';
import {
  EyeOutlined, EditOutlined, PlusOutlined, PhoneOutlined, MessageOutlined,
  FileTextOutlined, DollarOutlined, CalendarOutlined, UserOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  UploadOutlined, DownloadOutlined, MoreOutlined, HistoryOutlined,
  TeamOutlined, BankOutlined, FileProtectOutlined, SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { caseService, type Case } from '@/services/caseService';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
// const { MenuItem } = Menu; // MenuItem is deprecated, using items prop instead

// 案件状态枚举
const CaseStatus = {
  PENDING: { text: '待分配', color: 'default' },
  ASSIGNED: { text: '已分配', color: 'blue' },
  PROCESSING: { text: '处置中', color: 'processing' },
  MEDIATION: { text: '调解中', color: 'orange' },
  LITIGATION: { text: '诉讼中', color: 'red' },
  SETTLED: { text: '已和解', color: 'success' },
  COMPLETED: { text: '已完成', color: 'success' },
  SUSPENDED: { text: '暂停处理', color: 'warning' }
};

// 处置方式映射
const DisposalMethods = {
  MEDIATION: { text: '调解', icon: <UserOutlined />, color: '#52c41a' },
  LITIGATION: { text: '诉讼', icon: <FileProtectOutlined />, color: '#ff4d4f' },
  NEGOTIATION: { text: '协商', icon: <MessageOutlined />, color: '#1890ff' },
  COLLECTION: { text: '催收', icon: <PhoneOutlined />, color: '#faad14' }
};

// 进展类型
const ProgressTypes = {
  CONTACT: '联系沟通',
  NEGOTIATION: '协商谈判',
  PAYMENT: '回款记录',
  DOCUMENT: '文档提交',
  COURT: '法院相关',
  OTHER: '其他进展'
};

// 案件进展记录接口
interface CaseProgress {
  id: number;
  progressType: string;
  progressContent: string;
  contactMethod?: string;
  contactResult?: string;
  nextAction?: string;
  nextContactTime?: string;
  attachments?: string[];
  createdAt: string;
  handlerName: string;
}

// 回款记录接口
interface PaymentRecord {
  id: number;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod?: string;
  paymentNote?: string;
  verified: boolean;
  createdAt: string;
}

/**
 * 案件状态管理页面
 */
const CaseStatusManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('caseId');
  
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseProgress, setCaseProgress] = useState<CaseProgress[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [statusUpdateModalVisible, setStatusUpdateModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [progressForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [transferForm] = Form.useForm();

  // 加载案件详情
  const loadCaseDetail = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      // 模拟案件数据，因为实际API还未实现
      const mockCaseData: Case = {
        id: Number(caseId),
        casePackageId: 1,
        sourceOrgId: 1,
        disposalOrgId: 2,
        debtorName: '张某某',
        debtorIdCard: '110101199001011234',
        debtorPhone: '13800138000',
        debtorGender: '男',
        debtorAge: 35,
        debtorProvince: '北京',
        debtorCity: '北京',
        debtorAddress: '朝阳区某某街道某某号',
        loanContractNo: 'JJ202400001',
        productLine: '消费贷',
        loanAmount: 50000,
        remainingAmount: 45000,
        overdueDays: 90,
        loanDate: '2023-01-01',
        dueDate: '2024-01-01',
        entrustStartDate: '2024-01-01',
        entrustEndDate: '2024-12-31',
        fundingParty: 'XX银行',
        contact1Name: '李某某',
        contact1Phone: '13900139000',
        contact1Relation: '配偶',
        status: 'PROCESSING',
        disposalType: 'MEDIATION',
        priorityLevel: 'NORMAL',
        difficultyLevel: 'MEDIUM',
        assignedAt: '2024-01-15 10:30:00',
        handlerId: 1,
        latestProgress: '已联系债务人，债务人承诺本月内还款',
        progressUpdatedAt: '2024-01-20 14:30:00',
        communicationCount: 5,
        lastCommunicationAt: '2024-01-20 14:30:00',
        recoveredAmount: 5000,
        recoveryRate: 11.1,
        lastPaymentAt: '2024-01-18 16:00:00',
        paymentCount: 1,
        processingStartTime: '2024-01-15 10:30:00',
        processingDays: 15,
        createdAt: '2024-01-10 10:30:00',
        updatedAt: '2024-01-20 14:30:00'
      };

      const mockProgressData: CaseProgress[] = [
        {
          id: 1,
          progressType: 'CONTACT',
          progressContent: '首次联系债务人，已告知相关情况',
          contactMethod: '电话',
          contactResult: '接通',
          nextAction: '跟进了解还款意愿',
          nextContactTime: '2024-01-17 10:00:00',
          createdAt: '2024-01-15 14:30:00',
          handlerName: '王处理员'
        }
      ];

      const mockPaymentData: PaymentRecord[] = [
        {
          id: 1,
          paymentAmount: 5000,
          paymentDate: '2024-01-18',
          paymentMethod: '银行转账',
          paymentNote: '首次还款',
          verified: true,
          createdAt: '2024-01-18 16:00:00'
        }
      ];
      
      setSelectedCase(mockCaseData);
      setCaseProgress(mockProgressData);
      setPaymentRecords(mockPaymentData);
    } catch (error) {
      message.error('加载案件信息失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 添加进展记录
  const handleAddProgress = async (values: any) => {
    if (!caseId) return;

    try {
      await caseService.addCaseProgress(Number(caseId), values);
      message.success('进展记录添加成功');
      setProgressModalVisible(false);
      progressForm.resetFields();
      loadCaseDetail();
    } catch (error) {
      message.error('添加进展记录失败');
    }
  };

  // 添加回款记录
  const handleAddPayment = async (values: any) => {
    if (!caseId) return;

    try {
      await caseService.addCasePayment(Number(caseId), values);
      message.success('回款记录添加成功');
      setPaymentModalVisible(false);
      paymentForm.resetFields();
      loadCaseDetail();
    } catch (error) {
      message.error('添加回款记录失败');
    }
  };

  // 更新案件状态
  const handleStatusUpdate = async (values: any) => {
    if (!caseId) return;

    try {
      await caseService.updateCase(Number(caseId), {
        status: values.status,
        latestProgress: values.statusNote
      });
      message.success('案件状态更新成功');
      setStatusUpdateModalVisible(false);
      statusForm.resetFields();
      loadCaseDetail();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 案件移交
  const handleCaseTransfer = async (values: any) => {
    if (!caseId) return;

    try {
      await caseService.assignCase(Number(caseId), values.newOrgId, values.newHandlerId);
      message.success('案件移交成功');
      setTransferModalVisible(false);
      transferForm.resetFields();
      loadCaseDetail();
    } catch (error) {
      message.error('案件移交失败');
    }
  };

  // 获取案件状态步骤
  const getCaseStatusSteps = () => {
    const currentStatus = selectedCase?.status;
    const statusFlow = ['ASSIGNED', 'PROCESSING', 'COMPLETED'];
    const currentStep = statusFlow.indexOf(currentStatus || '');
    
    return (
      <Steps current={currentStep} size="small">
        <Step title="已分配" description="案件已分配给处置机构" />
        <Step title="处置中" description="正在积极处置案件" />
        <Step title="已完成" description="案件处置完成" />
      </Steps>
    );
  };

  // 渲染案件基本信息
  const renderBasicInfo = () => (
    <Card title="案件基本信息" size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={8}>
          <div style={{ marginBottom: 12 }}>
            <strong>债务人姓名：</strong>{selectedCase?.debtorName}
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>身份证号：</strong>
            {selectedCase?.debtorIdCard?.replace(/(\d{6})\d{8}(\d{4})/, '$1****$2')}
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>联系电话：</strong>
            {selectedCase?.debtorPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
          </div>
          <div>
            <strong>地址：</strong>{selectedCase?.debtorAddress}
          </div>
        </Col>
        <Col span={8}>
          <div style={{ marginBottom: 12 }}>
            <strong>借据编号：</strong>{selectedCase?.loanContractNo}
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>贷款金额：</strong>¥{selectedCase?.loanAmount?.toLocaleString()}
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>剩余金额：</strong>¥{selectedCase?.remainingAmount?.toLocaleString()}
          </div>
          <div>
            <strong>逾期天数：</strong>{selectedCase?.overdueDays}天
          </div>
        </Col>
        <Col span={8}>
          <div style={{ marginBottom: 12 }}>
            <strong>案件状态：</strong>
            <Tag color={CaseStatus[selectedCase?.status as keyof typeof CaseStatus]?.color}>
              {CaseStatus[selectedCase?.status as keyof typeof CaseStatus]?.text}
            </Tag>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>分配时间：</strong>
            {selectedCase?.assignedAt ? dayjs(selectedCase.assignedAt).format('YYYY-MM-DD HH:mm') : '-'}
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>处理天数：</strong>{selectedCase?.processingDays || 0}天
          </div>
          <div>
            <strong>回款金额：</strong>¥{selectedCase?.recoveredAmount?.toLocaleString() || 0}
          </div>
        </Col>
      </Row>
    </Card>
  );

  // 渲染案件进展时间线
  const renderProgressTimeline = () => (
    <Card 
      title="处置进展" 
      size="small" 
      style={{ marginBottom: 16 }}
      extra={
        <Button type="primary" size="small" onClick={() => setProgressModalVisible(true)}>
          添加进展
        </Button>
      }
    >
      <Timeline mode="left" style={{ marginTop: 16 }}>
        {caseProgress.map(progress => (
          <Timeline.Item
            key={progress.id}
            color={getProgressColor(progress.progressType)}
            label={dayjs(progress.createdAt).format('MM-DD HH:mm')}
          >
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {ProgressTypes[progress.progressType as keyof typeof ProgressTypes] || progress.progressType}
              </div>
              <div style={{ color: '#666', marginBottom: 8 }}>
                {progress.progressContent}
              </div>
              {progress.contactMethod && (
                <div style={{ fontSize: '12px', color: '#999' }}>
                  联系方式: {progress.contactMethod} | 联系结果: {progress.contactResult}
                </div>
              )}
              {progress.nextAction && (
                <div style={{ fontSize: '12px', color: '#1890ff' }}>
                  下一步行动: {progress.nextAction}
                  {progress.nextContactTime && ` (${dayjs(progress.nextContactTime).format('MM-DD HH:mm')})`}
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                处理人: {progress.handlerName}
              </div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );

  // 渲染回款记录
  const renderPaymentRecords = () => (
    <Card 
      title="回款记录" 
      size="small"
      extra={
        <Button type="primary" size="small" onClick={() => setPaymentModalVisible(true)}>
          添加回款
        </Button>
      }
    >
      <Table
        size="small"
        dataSource={paymentRecords}
        rowKey="id"
        pagination={false}
        columns={[
          {
            title: '回款金额',
            dataIndex: 'paymentAmount',
            render: (amount: number) => `¥${amount.toLocaleString()}`
          },
          {
            title: '回款日期',
            dataIndex: 'paymentDate',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD')
          },
          {
            title: '回款方式',
            dataIndex: 'paymentMethod'
          },
          {
            title: '状态',
            dataIndex: 'verified',
            render: (verified: boolean) => (
              <Badge 
                status={verified ? 'success' : 'warning'} 
                text={verified ? '已验证' : '待验证'} 
              />
            )
          },
          {
            title: '备注',
            dataIndex: 'paymentNote',
            render: (note: string) => note || '-'
          },
          {
            title: '操作',
            key: 'action',
            render: (record: PaymentRecord) => (
              <Space size="small">
                {!record.verified && (
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => handleVerifyPayment(record.id)}
                  >
                    验证
                  </Button>
                )}
                <Button type="link" size="small">查看</Button>
              </Space>
            )
          }
        ]}
      />
    </Card>
  );

  // 验证回款记录
  const handleVerifyPayment = async (paymentId: number) => {
    try {
      await caseService.verifyCasePayment(paymentId);
      message.success('回款记录验证成功');
      loadCaseDetail();
    } catch (error) {
      message.error('验证失败');
    }
  };

  // 获取进展类型颜色
  const getProgressColor = (progressType: string) => {
    const colorMap: Record<string, string> = {
      CONTACT: 'blue',
      NEGOTIATION: 'orange',
      PAYMENT: 'green',
      DOCUMENT: 'purple',
      COURT: 'red',
      OTHER: 'default'
    };
    return colorMap[progressType] || 'default';
  };

  useEffect(() => {
    if (caseId) {
      loadCaseDetail();
    }
  }, [caseId]);

  return (
    <div className="case-status-management">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col span={18}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FileTextOutlined style={{ fontSize: 24, marginRight: 12, color: '#1890ff' }} />
              <div>
                <h2 style={{ margin: 0 }}>案件详情 - {selectedCase?.debtorName}</h2>
                <span style={{ color: '#666' }}>
                  借据号: {selectedCase?.loanContractNo} | 
                  剩余金额: ¥{selectedCase?.remainingAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setStatusUpdateModalVisible(true)}>
                更新状态
              </Button>
              <Button onClick={() => setTransferModalVisible(true)}>
                案件移交
              </Button>
              <Dropdown menu={{
                items: [
                  { key: 'export', icon: <DownloadOutlined />, label: '导出报告' },
                  { key: 'print', icon: <FileTextOutlined />, label: '打印案件' },
                  { key: 'history', icon: <HistoryOutlined />, label: '查看历史' }
                ]
              }}>
                <Button icon={<MoreOutlined />}>更多</Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 案件状态流程 */}
      <Card title="处置流程" style={{ marginBottom: 16 }}>
        {getCaseStatusSteps()}
      </Card>

      {/* 案件统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="回款金额"
              value={selectedCase?.recoveredAmount || 0}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="回款率"
              value={selectedCase?.recoveryRate || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="处理天数"
              value={selectedCase?.processingDays || 0}
              suffix="天"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="沟通次数"
              value={selectedCase?.communicationCount || 0}
              suffix="次"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细信息标签页 */}
      <Tabs defaultActiveKey="1">
        <TabPane tab="案件信息" key="1">
          {renderBasicInfo()}
        </TabPane>
        
        <TabPane tab="处置进展" key="2">
          {renderProgressTimeline()}
        </TabPane>
        
        <TabPane tab="回款记录" key="3">
          {renderPaymentRecords()}
        </TabPane>
        
        <TabPane tab="相关文档" key="4">
          <Card title="案件相关文档" size="small">
            <Upload.Dragger
              multiple
              beforeUpload={() => false}
              style={{ marginBottom: 16 }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持上传合同、凭证、法律文书等相关文档</p>
            </Upload.Dragger>
            
            {/* 文档列表 */}
            <div>
              <p style={{ fontWeight: 'bold', marginBottom: 8 }}>已上传文档：</p>
              <div style={{ color: '#999' }}>暂无相关文档</div>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      {/* 添加进展记录弹窗 */}
      <Modal
        title="添加处置进展"
        open={progressModalVisible}
        onCancel={() => setProgressModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={progressForm}
          layout="vertical"
          onFinish={handleAddProgress}
        >
          <Form.Item
            name="progressType"
            label="进展类型"
            rules={[{ required: true, message: '请选择进展类型' }]}
          >
            <Select placeholder="选择进展类型">
              {Object.entries(ProgressTypes).map(([key, value]) => (
                <Option key={key} value={key}>{value}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="progressContent"
            label="进展内容"
            rules={[{ required: true, message: '请输入进展内容' }]}
          >
            <TextArea rows={4} placeholder="详细描述本次进展情况..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactMethod" label="联系方式">
                <Select placeholder="选择联系方式" allowClear>
                  <Option value="电话">电话</Option>
                  <Option value="短信">短信</Option>
                  <Option value="微信">微信</Option>
                  <Option value="上门">上门</Option>
                  <Option value="邮件">邮件</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactResult" label="联系结果">
                <Select placeholder="选择联系结果" allowClear>
                  <Option value="接通">接通</Option>
                  <Option value="未接通">未接通</Option>
                  <Option value="拒接">拒接</Option>
                  <Option value="承诺还款">承诺还款</Option>
                  <Option value="部分还款">部分还款</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="nextAction" label="下一步行动">
            <Input placeholder="计划的下一步处置行动" />
          </Form.Item>

          <Form.Item name="nextContactTime" label="下次联系时间">
            <DatePicker 
              showTime 
              placeholder="选择下次联系时间" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setProgressModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加回款记录弹窗 */}
      <Modal
        title="添加回款记录"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handleAddPayment}
        >
          <Form.Item
            name="paymentAmount"
            label="回款金额"
            rules={[{ required: true, message: '请输入回款金额' }]}
          >
            <Input
              prefix="¥"
              placeholder="0.00"
              type="number"
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="paymentDate"
            label="回款日期"
            rules={[{ required: true, message: '请选择回款日期' }]}
          >
            <DatePicker placeholder="选择回款日期" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="paymentMethod" label="回款方式">
            <Select placeholder="选择回款方式" allowClear>
              <Option value="银行转账">银行转账</Option>
              <Option value="现金">现金</Option>
              <Option value="支付宝">支付宝</Option>
              <Option value="微信">微信</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item name="paymentNote" label="备注">
            <TextArea rows={3} placeholder="回款相关备注信息" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setPaymentModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 状态更新弹窗 */}
      <Modal
        title="更新案件状态"
        open={statusUpdateModalVisible}
        onCancel={() => setStatusUpdateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={handleStatusUpdate}
          initialValues={{ status: selectedCase?.status }}
        >
          <Form.Item
            name="status"
            label="新状态"
            rules={[{ required: true, message: '请选择新状态' }]}
          >
            <Select placeholder="选择案件新状态">
              {Object.entries(CaseStatus).map(([key, value]) => (
                <Option key={key} value={key}>
                  <Tag color={value.color}>{value.text}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="statusNote"
            label="状态变更说明"
            rules={[{ required: true, message: '请输入状态变更说明' }]}
          >
            <TextArea rows={3} placeholder="说明状态变更的原因..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setStatusUpdateModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 案件移交弹窗 */}
      <Modal
        title="案件移交"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleCaseTransfer}
        >
          <Form.Item
            name="newOrgId"
            label="移交机构"
            rules={[{ required: true, message: '请选择移交机构' }]}
          >
            <Select placeholder="选择接收案件的机构">
              <Option value="1">华东调解中心</Option>
              <Option value="2">北京金诚律所</Option>
              <Option value="3">南方处置公司</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="newHandlerId"
            label="指定处理人"
          >
            <Select placeholder="选择具体处理人（可选）" allowClear>
              <Option value="1">张三</Option>
              <Option value="2">李四</Option>
              <Option value="3">王五</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="transferReason"
            label="移交原因"
            rules={[{ required: true, message: '请输入移交原因' }]}
          >
            <TextArea rows={3} placeholder="说明案件移交的原因..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setTransferModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认移交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CaseStatusManagement;