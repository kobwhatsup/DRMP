import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Dropdown,
  Menu,
  Tooltip,
  Progress,
  Drawer,
  Descriptions,
  Upload,
  Typography,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  EyeOutlined,
  FileTextOutlined,
  SignatureOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
// import { PageHeader } from '@ant-design/pro-layout'; // 已废弃
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  contractType: string;
  status: string;
  partyAName: string;
  partyBName: string;
  partyCName?: string;
  contractAmount?: number;
  currency: string;
  signatureDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  version: number;
  riskLevel: string;
  isFullySigned: boolean;
  signatureProgress: number;
  isExpired: boolean;
  isEffective: boolean;
  isExpiringSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

const contractTypeMap = {
  DISPOSAL_CONTRACT: '委托处置合同',
  PAYMENT_AGREEMENT: '还款协议',
  SETTLEMENT_AGREEMENT: '和解协议',
  SERVICE_AGREEMENT: '服务协议',
  CONFIDENTIALITY_AGREEMENT: '保密协议',
  FRAMEWORK_AGREEMENT: '框架协议',
  SUPPLEMENTARY_AGREEMENT: '补充协议',
  TERMINATION_AGREEMENT: '终止协议'
};

const contractStatusMap = {
  DRAFT: '草稿',
  PENDING_REVIEW: '待审核',
  REVIEWING: '审核中',
  APPROVED: '已批准',
  REJECTED: '已拒绝',
  PENDING_SIGNATURE: '待签署',
  PARTIALLY_SIGNED: '部分签署',
  FULLY_SIGNED: '已签署',
  EFFECTIVE: '生效',
  SUSPENDED: '暂停',
  TERMINATED: '终止',
  EXPIRED: '已过期',
  CANCELLED: '已取消'
};

const statusColorMap = {
  DRAFT: 'default',
  PENDING_REVIEW: 'processing',
  REVIEWING: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  PENDING_SIGNATURE: 'warning',
  PARTIALLY_SIGNED: 'warning',
  FULLY_SIGNED: 'success',
  EFFECTIVE: 'success',
  SUSPENDED: 'default',
  TERMINATED: 'error',
  EXPIRED: 'error',
  CANCELLED: 'error'
};

const riskLevelMap = {
  LOW: { color: 'green', text: '低风险' },
  MEDIUM: { color: 'orange', text: '中风险' },
  HIGH: { color: 'red', text: '高风险' }
};

const ContractList: React.FC = () => {
  const [form] = Form.useForm();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [filters, setFilters] = useState({
    contractType: '',
    status: '',
    riskLevel: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null
  });

  // 获取合同列表
  const fetchContracts = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockContracts: Contract[] = [
        {
          id: '1',
          contractNumber: 'DC20240115001',
          title: '不良资产处置委托合同',
          contractType: 'DISPOSAL_CONTRACT',
          status: 'EFFECTIVE',
          partyAName: '某银行股份有限公司',
          partyBName: '某律师事务所',
          contractAmount: 1000000,
          currency: 'CNY',
          signatureDate: '2024-01-15',
          effectiveDate: '2024-01-16',
          expiryDate: '2024-12-31',
          version: 1,
          riskLevel: 'MEDIUM',
          isFullySigned: true,
          signatureProgress: 100,
          isExpired: false,
          isEffective: true,
          isExpiringSoon: false,
          createdAt: '2024-01-10 09:00:00',
          updatedAt: '2024-01-15 14:30:00'
        },
        {
          id: '2',
          contractNumber: 'PA20240118001',
          title: '债务人还款协议',
          contractType: 'PAYMENT_AGREEMENT',
          status: 'PARTIALLY_SIGNED',
          partyAName: '某律师事务所',
          partyBName: '张某某',
          contractAmount: 50000,
          currency: 'CNY',
          effectiveDate: '2024-01-20',
          expiryDate: '2024-07-20',
          version: 1,
          riskLevel: 'LOW',
          isFullySigned: false,
          signatureProgress: 50,
          isExpired: false,
          isEffective: false,
          isExpiringSoon: false,
          createdAt: '2024-01-18 10:30:00',
          updatedAt: '2024-01-18 15:45:00'
        },
        {
          id: '3',
          contractNumber: 'SA20240120001',
          title: '债务和解协议',
          contractType: 'SETTLEMENT_AGREEMENT',
          status: 'PENDING_SIGNATURE',
          partyAName: '某银行股份有限公司',
          partyBName: '李某某',
          partyCName: '某律师事务所',
          contractAmount: 80000,
          currency: 'CNY',
          effectiveDate: '2024-01-25',
          expiryDate: '2024-06-25',
          version: 1,
          riskLevel: 'HIGH',
          isFullySigned: false,
          signatureProgress: 0,
          isExpired: false,
          isEffective: false,
          isExpiringSoon: false,
          createdAt: '2024-01-20 11:15:00',
          updatedAt: '2024-01-20 16:20:00'
        }
      ];
      setContracts(mockContracts);
    } catch (error) {
      message.error('获取合同列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const columns = [
    {
      title: '合同编号',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      width: 150,
      render: (text: string) => (
        <Button type="link">{text}</Button>
      )
    },
    {
      title: '合同标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true
    },
    {
      title: '合同类型',
      dataIndex: 'contractType',
      key: 'contractType',
      width: 120,
      render: (type: string) => (
        <Tag color="blue">{contractTypeMap[type as keyof typeof contractTypeMap]}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColorMap[status as keyof typeof statusColorMap]}>
          {contractStatusMap[status as keyof typeof contractStatusMap]}
        </Tag>
      )
    },
    {
      title: '甲方',
      dataIndex: 'partyAName',
      key: 'partyAName',
      width: 150,
      ellipsis: true
    },
    {
      title: '乙方',
      dataIndex: 'partyBName',
      key: 'partyBName',
      width: 150,
      ellipsis: true
    },
    {
      title: '合同金额',
      dataIndex: 'contractAmount',
      key: 'contractAmount',
      width: 120,
      render: (amount: number) => 
        amount ? `¥${amount.toLocaleString()}` : '-'
    },
    {
      title: '签署进度',
      dataIndex: 'signatureProgress',
      key: 'signatureProgress',
      width: 120,
      render: (progress: number, record: Contract) => (
        <Space direction="vertical">
          <Progress 
            percent={progress} 
            
            status={record.isFullySigned ? 'success' : 'active'}
          />
          <Text style={{ fontSize: 12 }}>
            {record.isFullySigned ? '已完成' : `${progress}%`}
          </Text>
        </Space>
      )
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (level: string) => (
        <Tag color={riskLevelMap[level as keyof typeof riskLevelMap]?.color}>
          {riskLevelMap[level as keyof typeof riskLevelMap]?.text}
        </Tag>
      )
    },
    {
      title: '到期日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string, record: Contract) => (
        <Space direction="vertical">
          <Text style={{ fontSize: 12 }}>
            {date ? dayjs(date).format('YYYY-MM-DD') : '-'}
          </Text>
          {record.isExpiringSoon && (
            <Tag color="orange">即将到期</Tag>
          )}
          {record.isExpired && (
            <Tag color="red">已过期</Tag>
          )}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (record: Contract) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
             
              icon={<EyeOutlined />}
              onClick={() => handleViewContract(record)}
            />
          </Tooltip>
          
          <Tooltip title="编辑">
            <Button
             
              icon={<EditOutlined />}
              onClick={() => handleEditContract(record)}
              disabled={['TERMINATED', 'EXPIRED', 'CANCELLED'].includes(record.status)}
            />
          </Tooltip>

          <Dropdown
            overlay={
              <Menu onClick={({ key }) => handleMenuClick(key, record)}>
                {!record.isFullySigned && record.status === 'PENDING_SIGNATURE' && (
                  <Menu.Item key="sign" icon={<SignatureOutlined />}>
                    签署
                  </Menu.Item>
                )}
                {record.status === 'FULLY_SIGNED' && (
                  <Menu.Item key="activate" icon={<CheckCircleOutlined />}>
                    生效
                  </Menu.Item>
                )}
                {record.status === 'EFFECTIVE' && (
                  <Menu.Item key="suspend" icon={<ClockCircleOutlined />}>
                    暂停
                  </Menu.Item>
                )}
                {record.status === 'SUSPENDED' && (
                  <Menu.Item key="resume" icon={<CheckCircleOutlined />}>
                    恢复
                  </Menu.Item>
                )}
                <Menu.Item key="download" icon={<DownloadOutlined />}>
                  下载
                </Menu.Item>
                {['DRAFT', 'CANCELLED'].includes(record.status) && (
                  <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                    删除
                  </Menu.Item>
                )}
              </Menu>
            }
          >
            <Button>
              更多 <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      )
    }
  ];

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setDrawerVisible(true);
  };

  const handleEditContract = (contract?: Contract) => {
    setEditingContract(contract || null);
    if (contract) {
      form.setFieldsValue({
        ...contract,
        effectiveDate: contract.effectiveDate ? dayjs(contract.effectiveDate) : null,
        expiryDate: contract.expiryDate ? dayjs(contract.expiryDate) : null
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleMenuClick = (key: string, contract: Contract) => {
    switch (key) {
      case 'sign':
        handleSignContract(contract);
        break;
      case 'activate':
        handleActivateContract(contract);
        break;
      case 'suspend':
        handleSuspendContract(contract);
        break;
      case 'resume':
        handleResumeContract(contract);
        break;
      case 'download':
        handleDownloadContract(contract);
        break;
      case 'delete':
        handleDeleteContract(contract);
        break;
    }
  };

  const handleSignContract = (contract: Contract) => {
    Modal.confirm({
      title: '签署合同',
      content: `确定要签署合同 ${contract.contractNumber} 吗？`,
      onOk() {
        message.success('合同签署成功');
        fetchContracts();
      }
    });
  };

  const handleActivateContract = (contract: Contract) => {
    Modal.confirm({
      title: '激活合同',
      content: `确定要使合同 ${contract.contractNumber} 生效吗？`,
      onOk() {
        message.success('合同已生效');
        fetchContracts();
      }
    });
  };

  const handleSuspendContract = (contract: Contract) => {
    Modal.confirm({
      title: '暂停合同',
      content: `确定要暂停合同 ${contract.contractNumber} 吗？`,
      onOk() {
        message.success('合同已暂停');
        fetchContracts();
      }
    });
  };

  const handleResumeContract = (contract: Contract) => {
    Modal.confirm({
      title: '恢复合同',
      content: `确定要恢复合同 ${contract.contractNumber} 吗？`,
      onOk() {
        message.success('合同已恢复');
        fetchContracts();
      }
    });
  };

  const handleDownloadContract = (contract: Contract) => {
    message.info('开始下载合同文件...');
  };

  const handleDeleteContract = (contract: Contract) => {
    Modal.confirm({
      title: '删除合同',
      content: `确定要删除合同 ${contract.contractNumber} 吗？此操作不可撤销。`,
      onOk() {
        setContracts(contracts.filter(c => c.id !== contract.id));
        message.success('合同已删除');
      }
    });
  };

  const handleSaveContract = async (values: any) => {
    try {
      const contractData = {
        ...values,
        id: editingContract?.id || Date.now().toString(),
        contractNumber: editingContract?.contractNumber || `DC${Date.now()}`,
        effectiveDate: values.effectiveDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        status: editingContract?.status || 'DRAFT',
        version: editingContract?.version || 1,
        isFullySigned: false,
        signatureProgress: 0,
        isExpired: false,
        isEffective: false,
        isExpiringSoon: false,
        createdAt: editingContract?.createdAt || new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString()
      };

      if (editingContract) {
        setContracts(contracts.map(c => c.id === editingContract.id ? contractData : c));
        message.success('合同已更新');
      } else {
        setContracts([...contracts, contractData]);
        message.success('合同已创建');
      }

      setModalVisible(false);
      setEditingContract(null);
      form.resetFields();
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 计算统计数据
  const totalContracts = contracts.length;
  const effectiveContracts = contracts.filter(c => c.status === 'EFFECTIVE').length;
  const pendingSignature = contracts.filter(c => ['PENDING_SIGNATURE', 'PARTIALLY_SIGNED'].includes(c.status)).length;
  const expiringSoon = contracts.filter(c => c.isExpiringSoon).length;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>合同管理</Title>
            <Text type="secondary">管理各类合同和协议</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleEditContract()}
          >
            新建合同
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="合同总数" value={totalContracts} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="生效合同" value={effectiveContracts} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待签署" value={pendingSignature} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="即将到期" value={expiringSoon} />
          </Card>
        </Col>
      </Row>

      {/* 筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="合同类型"
            style={{ width: 150 }}
            allowClear
            value={filters.contractType}
            onChange={value => setFilters({ ...filters, contractType: value || '' })}
          >
            {Object.entries(contractTypeMap).map(([key, label]) => (
              <Option key={key} value={key}>{label}</Option>
            ))}
          </Select>

          <Select
            placeholder="合同状态"
            style={{ width: 120 }}
            allowClear
            value={filters.status}
            onChange={value => setFilters({ ...filters, status: value || '' })}
          >
            {Object.entries(contractStatusMap).map(([key, label]) => (
              <Option key={key} value={key}>{label}</Option>
            ))}
          </Select>

          <Select
            placeholder="风险等级"
            style={{ width: 120 }}
            allowClear
            value={filters.riskLevel}
            onChange={value => setFilters({ ...filters, riskLevel: value || '' })}
          >
            {Object.entries(riskLevelMap).map(([key, config]) => (
              <Option key={key} value={key}>{config.text}</Option>
            ))}
          </Select>

          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | null })}
            format="YYYY-MM-DD"
          />

          <Button onClick={() => setFilters({ contractType: '', status: '', riskLevel: '', dateRange: null })}>
            清除筛选
          </Button>
        </Space>
      </Card>

      {/* 合同表格 */}
      <Card>
        <Table
          dataSource={contracts}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
        />
      </Card>

      {/* 合同编辑弹窗 */}
      <Modal
        title={editingContract ? '编辑合同' : '新建合同'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingContract(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveContract}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="合同标题"
                rules={[{ required: true, message: '请输入合同标题' }]}
              >
                <Input placeholder="请输入合同标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contractType"
                label="合同类型"
                rules={[{ required: true, message: '请选择合同类型' }]}
              >
                <Select placeholder="请选择合同类型">
                  {Object.entries(contractTypeMap).map(([key, label]) => (
                    <Option key={key} value={key}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="partyAName"
                label="甲方名称"
                rules={[{ required: true, message: '请输入甲方名称' }]}
              >
                <Input placeholder="请输入甲方名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="partyBName"
                label="乙方名称"
                rules={[{ required: true, message: '请输入乙方名称' }]}
              >
                <Input placeholder="请输入乙方名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="partyCName" label="第三方名称">
                <Input placeholder="请输入第三方名称（可选）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contractAmount" label="合同金额">
                <Input placeholder="请输入合同金额" type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="effectiveDate" label="生效日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiryDate" label="到期日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="riskLevel" label="风险等级" initialValue="LOW">
                <Select>
                  {Object.entries(riskLevelMap).map(([key, config]) => (
                    <Option key={key} value={key}>{config.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currency" label="币种" initialValue="CNY">
                <Select>
                  <Option value="CNY">人民币</Option>
                  <Option value="USD">美元</Option>
                  <Option value="EUR">欧元</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="contentSummary" label="合同摘要">
            <TextArea rows={3} placeholder="请输入合同内容摘要" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 合同详情抽屉 */}
      <Drawer
        title="合同详情"
        placement="right"
        width={600}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={() => {
              setDrawerVisible(false);
              handleEditContract(selectedContract!);
            }}>
              编辑
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => handleDownloadContract(selectedContract!)}>
              下载
            </Button>
          </Space>
        }
      >
        {selectedContract && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="合同编号">
              {selectedContract.contractNumber}
            </Descriptions.Item>
            <Descriptions.Item label="合同标题">
              {selectedContract.title}
            </Descriptions.Item>
            <Descriptions.Item label="合同类型">
              <Tag color="blue">
                {contractTypeMap[selectedContract.contractType as keyof typeof contractTypeMap]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColorMap[selectedContract.status as keyof typeof statusColorMap]}>
                {contractStatusMap[selectedContract.status as keyof typeof contractStatusMap]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="甲方">
              {selectedContract.partyAName}
            </Descriptions.Item>
            <Descriptions.Item label="乙方">
              {selectedContract.partyBName}
            </Descriptions.Item>
            {selectedContract.partyCName && (
              <Descriptions.Item label="第三方">
                {selectedContract.partyCName}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="合同金额">
              {selectedContract.contractAmount ? 
                `¥${selectedContract.contractAmount.toLocaleString()}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="签署进度">
              <Progress 
                percent={selectedContract.signatureProgress} 
                status={selectedContract.isFullySigned ? 'success' : 'active'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="风险等级">
              <Tag color={riskLevelMap[selectedContract.riskLevel as keyof typeof riskLevelMap]?.color}>
                {riskLevelMap[selectedContract.riskLevel as keyof typeof riskLevelMap]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="生效日期">
              {selectedContract.effectiveDate || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="到期日期">
              {selectedContract.expiryDate || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="版本号">
              v{selectedContract.version}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {selectedContract.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {selectedContract.updatedAt}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default ContractList;