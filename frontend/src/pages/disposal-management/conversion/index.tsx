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
  message,
  Descriptions,
  Row,
  Col,
  Statistic,
  Timeline,
  Alert,
  Radio,
  DatePicker
} from 'antd';
import {
  SwapOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface ConversionCase {
  id: string;
  caseNumber: string;
  debtorName: string;
  amount: number;
  currentDisposalType: '调解' | '诉讼';
  targetDisposalType: '调解' | '诉讼';
  currentOrg: string;
  targetOrg?: string;
  status: string;
  reason: string;
  requestTime: string;
  approvalTime?: string;
  approver?: string;
  notes?: string;
}

const DisposalConversion: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [conversionCases, setConversionCases] = useState<ConversionCase[]>([]);
  const [conversionModalVisible, setConversionModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ConversionCase | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadConversionCases();
  }, []);

  const loadConversionCases = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockData: ConversionCase[] = [
        {
          id: '1',
          caseNumber: 'CONV-2024-001',
          debtorName: '陈八',
          amount: 75000,
          currentDisposalType: '调解',
          targetDisposalType: '诉讼',
          currentOrg: '华南调解中心',
          targetOrg: '金融律师事务所',
          status: '审核中',
          reason: '债务人拒绝配合调解，需要通过诉讼途径解决',
          requestTime: '2024-01-25 10:30:00',
          notes: '已尝试3次调解，债务人均未出席'
        },
        {
          id: '2',
          caseNumber: 'CONV-2024-002',
          debtorName: '周九',
          amount: 45000,
          currentDisposalType: '诉讼',
          targetDisposalType: '调解',
          currentOrg: '华泰律师事务所',
          targetOrg: '金融调解中心',
          status: '已批准',
          reason: '债务人主动联系要求调解解决',
          requestTime: '2024-01-20 14:20:00',
          approvalTime: '2024-01-22 09:15:00',
          approver: '系统管理员',
          notes: '债务人态度积极，有还款意愿'
        },
        {
          id: '3',
          caseNumber: 'CONV-2024-003',
          debtorName: '吴十',
          amount: 120000,
          currentDisposalType: '调解',
          targetDisposalType: '诉讼',
          currentOrg: '华东调解中心',
          status: '已拒绝',
          reason: '调解超时未果',
          requestTime: '2024-01-18 16:45:00',
          approvalTime: '2024-01-19 11:30:00',
          approver: '审核专员',
          notes: '当前调解机构建议继续尝试调解'
        }
      ];
      setConversionCases(mockData);
    } catch (error) {
      console.error('加载转换案件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      '审核中': 'processing',
      '已批准': 'success',
      '已拒绝': 'error',
      '转换中': 'blue',
      '已完成': 'success'
    };
    return colorMap[status] || 'default';
  };

  const getDisposalTypeColor = (type: string) => {
    return type === '调解' ? 'blue' : 'orange';
  };

  const handleConversion = (record: ConversionCase) => {
    setSelectedCase(record);
    setConversionModalVisible(true);
    form.resetFields();
  };

  const handleConversionSubmit = async (values: any) => {
    try {
      console.log('提交转换申请:', values);
      message.success('转换申请提交成功');
      setConversionModalVisible(false);
      loadConversionCases();
    } catch (error) {
      message.error('转换申请提交失败');
    }
  };

  const showDetail = (record: ConversionCase) => {
    setSelectedCase(record);
    setDetailModalVisible(true);
  };

  const handleApproval = async (id: string, approved: boolean) => {
    try {
      console.log(`${approved ? '批准' : '拒绝'}转换申请:`, id);
      message.success(`转换申请已${approved ? '批准' : '拒绝'}`);
      loadConversionCases();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '案件编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
    },
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '转换方向',
      key: 'conversion',
      render: (record: ConversionCase) => (
        <Space>
          <Tag color={getDisposalTypeColor(record.currentDisposalType)}>
            {record.currentDisposalType}
          </Tag>
          <ArrowRightOutlined />
          <Tag color={getDisposalTypeColor(record.targetDisposalType)}>
            {record.targetDisposalType}
          </Tag>
        </Space>
      ),
    },
    {
      title: '当前机构',
      dataIndex: 'currentOrg',
      key: 'currentOrg',
    },
    {
      title: '目标机构',
      dataIndex: 'targetOrg',
      key: 'targetOrg',
      render: (org: string) => org || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'requestTime',
      key: 'requestTime',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: ConversionCase) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDetail(record)}>
            详情
          </Button>
          {record.status === '审核中' && (
            <>
              <Button 
                type="link" 
                size="small" 
                style={{ color: '#52c41a' }}
                onClick={() => handleApproval(record.id, true)}
              >
                批准
              </Button>
              <Button 
                type="link" 
                size="small" 
                style={{ color: '#ff4d4f' }}
                onClick={() => handleApproval(record.id, false)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const statisticsData = [
    {
      title: '转换申请总数',
      value: 45,
      icon: <SwapOutlined style={{ color: '#1890ff' }} />
    },
    {
      title: '批准率',
      value: 78.9,
      suffix: '%',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    },
    {
      title: '平均处理时间',
      value: 2.5,
      suffix: '天',
      icon: <ClockCircleOutlined style={{ color: '#faad14' }} />
    },
    {
      title: '待审核申请',
      value: 12,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>
          <SwapOutlined style={{ marginRight: '8px' }} />
          处置转换
        </h2>
      </div>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {statisticsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={stat.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 操作提示 */}
      <Alert
        message="处置转换说明"
        description="当调解无效时可申请转为诉讼处理；当债务人主动配合时可从诉讼转为调解。转换需要审核批准。"
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      {/* 案件列表 */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Button type="primary" onClick={() => setConversionModalVisible(true)}>
              申请转换
            </Button>
            <Button>批量处理</Button>
            <Button>导出数据</Button>
            <Select defaultValue="all" style={{ width: 120 }}>
              <Option value="all">全部状态</Option>
              <Option value="pending">审核中</Option>
              <Option value="approved">已批准</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={conversionCases}
          loading={loading}
          rowKey="id"
          pagination={{
            total: conversionCases.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 申请转换弹窗 */}
      <Modal
        title="申请处置转换"
        open={conversionModalVisible}
        onCancel={() => setConversionModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConversionSubmit}
        >
          <Form.Item
            label="选择案件"
            name="caseId"
            rules={[{ required: true, message: '请选择要转换的案件' }]}
          >
            <Select placeholder="请选择案件">
              <Option value="CASE-2024-001">CASE-2024-001 - 张三 - 调解中</Option>
              <Option value="CASE-2024-002">CASE-2024-002 - 李四 - 诉讼中</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="当前处置方式"
                name="currentDisposalType"
                rules={[{ required: true, message: '请选择当前处置方式' }]}
              >
                <Select placeholder="请选择">
                  <Option value="调解">调解</Option>
                  <Option value="诉讼">诉讼</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="目标处置方式"
                name="targetDisposalType"
                rules={[{ required: true, message: '请选择目标处置方式' }]}
              >
                <Select placeholder="请选择">
                  <Option value="调解">调解</Option>
                  <Option value="诉讼">诉讼</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="目标处置机构"
            name="targetOrg"
            rules={[{ required: true, message: '请选择目标处置机构' }]}
          >
            <Select placeholder="请选择目标处置机构">
              <Option value="华南调解中心">华南调解中心</Option>
              <Option value="金融调解中心">金融调解中心</Option>
              <Option value="金融律师事务所">金融律师事务所</Option>
              <Option value="华泰律师事务所">华泰律师事务所</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="转换原因"
            name="reason"
            rules={[{ required: true, message: '请输入转换原因' }]}
          >
            <TextArea rows={3} placeholder="请详细说明申请转换的原因" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="notes"
          >
            <TextArea rows={2} placeholder="其他需要说明的信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="转换申请详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedCase && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="案件编号">{selectedCase.caseNumber}</Descriptions.Item>
              <Descriptions.Item label="债务人">{selectedCase.debtorName}</Descriptions.Item>
              <Descriptions.Item label="债务金额">¥{selectedCase.amount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={getStatusColor(selectedCase.status)}>{selectedCase.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="转换方向">
                <Space>
                  <Tag color={getDisposalTypeColor(selectedCase.currentDisposalType)}>
                    {selectedCase.currentDisposalType}
                  </Tag>
                  <ArrowRightOutlined />
                  <Tag color={getDisposalTypeColor(selectedCase.targetDisposalType)}>
                    {selectedCase.targetDisposalType}
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="当前机构">{selectedCase.currentOrg}</Descriptions.Item>
              <Descriptions.Item label="目标机构">{selectedCase.targetOrg || '-'}</Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {dayjs(selectedCase.requestTime).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              {selectedCase.approvalTime && (
                <Descriptions.Item label="处理时间">
                  {dayjs(selectedCase.approvalTime).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              )}
              {selectedCase.approver && (
                <Descriptions.Item label="处理人">{selectedCase.approver}</Descriptions.Item>
              )}
              <Descriptions.Item label="转换原因" span={2}>
                {selectedCase.reason}
              </Descriptions.Item>
              {selectedCase.notes && (
                <Descriptions.Item label="备注" span={2}>
                  {selectedCase.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Timeline
              items={[
                {
                  dot: <HistoryOutlined style={{ fontSize: '16px' }} />,
                  children: `${dayjs(selectedCase.requestTime).format('YYYY-MM-DD HH:mm')} 提交转换申请`
                },
                selectedCase.approvalTime ? {
                  dot: selectedCase.status === '已批准' ? 
                    <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} /> :
                    <ExclamationCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />,
                  children: `${dayjs(selectedCase.approvalTime).format('YYYY-MM-DD HH:mm')} 申请${selectedCase.status === '已批准' ? '已批准' : '被拒绝'}`
                } : {
                  dot: <ClockCircleOutlined style={{ fontSize: '16px', color: '#1890ff' }} />,
                  children: '等待审核中...'
                }
              ].filter(Boolean)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DisposalConversion;