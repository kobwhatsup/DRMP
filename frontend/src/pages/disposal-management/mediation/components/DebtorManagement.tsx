import React, { useState } from 'react';
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
  Rate,
  Timeline,
  Descriptions,
  Tabs,
  Avatar,
  Typography,
  Divider,
  Row,
  Col,
  Progress,
  List,
  Empty,
  Statistic,
  Checkbox,
  message
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  BankOutlined,
  HistoryOutlined,
  FileTextOutlined,
  MessageOutlined,
  DollarOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface ContactRecord {
  id: string;
  time: string;
  type: 'phone' | 'sms' | 'email' | 'visit';
  content: string;
  result: string;
  operator: string;
}

interface Debtor {
  id: string;
  name: string;
  idCard: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address: string;
  workUnit?: string;
  income?: number;
  assets?: string;
  liabilities: number;
  cooperationLevel: number; // 1-5 配合度评分
  repaymentWillingness: 'high' | 'medium' | 'low';
  riskLevel: 'high' | 'medium' | 'low';
  contactRecords: ContactRecord[];
  caseCount: number;
  totalDebt: number;
  repaidAmount: number;
}

const DebtorManagement: React.FC = () => {
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [selectedDebtors, setSelectedDebtors] = useState<string[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [batchContactModalVisible, setBatchContactModalVisible] = useState(false);
  const [batchSmsModalVisible, setBatchSmsModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWillingness, setFilterWillingness] = useState('all');
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

  // 模拟债务人数据
  const debtors: Debtor[] = [
    {
      id: '1',
      name: '张三',
      idCard: '110101199001011234',
      phone: '13800138001',
      alternatePhone: '13900139001',
      email: 'zhangsan@example.com',
      address: '北京市朝阳区某某街道',
      workUnit: '某科技公司',
      income: 15000,
      assets: '房产一套，车辆一辆',
      liabilities: 150000,
      cooperationLevel: 4,
      repaymentWillingness: 'high',
      riskLevel: 'low',
      contactRecords: [
        {
          id: '1',
          time: '2024-02-10 10:30',
          type: 'phone',
          content: '首次电话联系，了解基本情况',
          result: '债务人表示愿意协商还款',
          operator: '王调解员'
        },
        {
          id: '2',
          time: '2024-02-12 14:00',
          type: 'sms',
          content: '发送调解预约通知',
          result: '已确认收到',
          operator: '系统'
        }
      ],
      caseCount: 3,
      totalDebt: 150000,
      repaidAmount: 30000
    },
    {
      id: '2',
      name: '李四',
      idCard: '110101199002021234',
      phone: '13800138002',
      address: '北京市海淀区某某小区',
      liabilities: 80000,
      cooperationLevel: 2,
      repaymentWillingness: 'low',
      riskLevel: 'high',
      contactRecords: [],
      caseCount: 1,
      totalDebt: 80000,
      repaidAmount: 0
    }
  ];

  const getWillingnessColor = (willingness: string) => {
    const colors = {
      high: 'green',
      medium: 'orange',
      low: 'red'
    };
    return colors[willingness as keyof typeof colors];
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'green'
    };
    return colors[risk as keyof typeof colors];
  };

  const getContactTypeIcon = (type: string) => {
    const icons = {
      phone: <PhoneOutlined />,
      sms: <MessageOutlined />,
      email: <MailOutlined />,
      visit: <HomeOutlined />
    };
    return icons[type as keyof typeof icons];
  };

  const showDebtorDetail = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setDetailModalVisible(true);
  };

  const handleContact = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setContactModalVisible(true);
    form.resetFields();
  };

  const handleContactSubmit = async (values: any) => {
    console.log('记录联系信息:', values);
    message.success('联系记录已保存');
    setContactModalVisible(false);
  };

  const handleBatchContact = () => {
    if (selectedDebtors.length === 0) {
      message.warning('请选择要联系的债务人');
      return;
    }
    setBatchContactModalVisible(true);
  };

  const handleBatchSms = () => {
    if (selectedDebtors.length === 0) {
      message.warning('请选择要发送短信的债务人');
      return;
    }
    setBatchSmsModalVisible(true);
  };

  const handleExport = () => {
    if (selectedDebtors.length === 0) {
      message.warning('请选择要导出的债务人');
      return;
    }
    setExportModalVisible(true);
  };

  const handleBatchContactSubmit = () => {
    batchForm.validateFields().then(values => {
      console.log('批量联系:', values, selectedDebtors);
      message.success(`已向${selectedDebtors.length}位债务人发起联系`);
      setBatchContactModalVisible(false);
      batchForm.resetFields();
    });
  };

  const handleBatchSmsSubmit = () => {
    batchForm.validateFields().then(values => {
      console.log('批量短信:', values, selectedDebtors);
      message.success(`已向${selectedDebtors.length}位债务人发送短信`);
      setBatchSmsModalVisible(false);
      batchForm.resetFields();
    });
  };

  const handleExportSubmit = () => {
    batchForm.validateFields().then(values => {
      console.log('导出档案:', values, selectedDebtors);
      message.success(`正在导出${selectedDebtors.length}个债务人档案`);
      setExportModalVisible(false);
      batchForm.resetFields();
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (value: string) => {
    setFilterWillingness(value);
  };

  // 过滤债务人数据
  const filteredDebtors = debtors.filter(debtor => {
    const matchesSearch = !searchTerm || 
      debtor.name.includes(searchTerm) || 
      debtor.phone.includes(searchTerm) ||
      debtor.idCard.includes(searchTerm);
    
    const matchesWillingness = filterWillingness === 'all' || 
      debtor.repaymentWillingness === filterWillingness;
    
    return matchesSearch && matchesWillingness;
  });

  const columns = [
    {
      title: '债务人',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Debtor) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.idCard.slice(0, 6) + '****' + record.idCard.slice(-4)}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (record: Debtor) => (
        <div>
          <div><PhoneOutlined /> {record.phone}</div>
          {record.email && (
            <div style={{ fontSize: 12, color: '#999' }}>
              <MailOutlined /> {record.email}
            </div>
          )}
        </div>
      )
    },
    {
      title: '债务情况',
      key: 'debt',
      render: (record: Debtor) => (
        <div>
          <div>总额: ¥{record.totalDebt.toLocaleString()}</div>
          <div style={{ fontSize: 12 }}>
            <Progress 
              percent={Math.round((record.repaidAmount / record.totalDebt) * 100)} 
              size="small" 
              format={percent => `已还 ${percent}%`}
            />
          </div>
        </div>
      )
    },
    {
      title: '配合度',
      dataIndex: 'cooperationLevel',
      key: 'cooperationLevel',
      render: (level: number) => (
        <Rate disabled defaultValue={level} style={{ fontSize: 14 }} />
      )
    },
    {
      title: '还款意愿',
      dataIndex: 'repaymentWillingness',
      key: 'repaymentWillingness',
      render: (willingness: string) => (
        <Tag color={getWillingnessColor(willingness)}>
          {willingness === 'high' ? '高' : willingness === 'medium' ? '中' : '低'}
        </Tag>
      )
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (risk: string) => (
        <Tag color={getRiskColor(risk)}>
          {risk === 'high' ? '高风险' : risk === 'medium' ? '中风险' : '低风险'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Debtor) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDebtorDetail(record)}>
            查看档案
          </Button>
          <Button type="link" size="small" onClick={() => handleContact(record)}>
            联系记录
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input.Search
                placeholder="搜索债务人姓名、手机号、身份证"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={4}>
              <Select 
                value={filterWillingness} 
                onChange={handleFilterChange} 
                style={{ width: '100%' }}
              >
                <Option value="all">全部债务人</Option>
                <Option value="high">高意愿</Option>
                <Option value="medium">中意愿</Option>
                <Option value="low">低意愿</Option>
              </Select>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PhoneOutlined />}
                  onClick={handleBatchContact}
                  disabled={selectedDebtors.length === 0}
                >
                  批量联系({selectedDebtors.length})
                </Button>
                <Button 
                  icon={<MessageOutlined />}
                  onClick={handleBatchSms}
                  disabled={selectedDebtors.length === 0}
                >
                  发送短信
                </Button>
                <Button 
                  icon={<FileTextOutlined />}
                  onClick={handleExport}
                  disabled={selectedDebtors.length === 0}
                >
                  导出档案
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredDebtors}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedDebtors,
            onChange: (selectedRowKeys: React.Key[]) => {
              setSelectedDebtors(selectedRowKeys as string[]);
            },
            getCheckboxProps: (record: Debtor) => ({
              name: record.name,
            }),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 债务人详情弹窗 */}
      <Modal
        title="债务人档案"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedDebtor && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="姓名">{selectedDebtor.name}</Descriptions.Item>
                <Descriptions.Item label="身份证号">
                  {selectedDebtor.idCard.slice(0, 6) + '****' + selectedDebtor.idCard.slice(-4)}
                </Descriptions.Item>
                <Descriptions.Item label="手机号">{selectedDebtor.phone}</Descriptions.Item>
                <Descriptions.Item label="备用电话">{selectedDebtor.alternatePhone || '-'}</Descriptions.Item>
                <Descriptions.Item label="电子邮箱">{selectedDebtor.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="工作单位">{selectedDebtor.workUnit || '-'}</Descriptions.Item>
                <Descriptions.Item label="联系地址" span={2}>{selectedDebtor.address}</Descriptions.Item>
                <Descriptions.Item label="月收入">
                  {selectedDebtor.income ? `¥${selectedDebtor.income.toLocaleString()}` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="资产状况">{selectedDebtor.assets || '-'}</Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="债务分析" key="debt">
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="案件数量"
                      value={selectedDebtor.caseCount}
                      suffix="件"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="债务总额"
                      value={selectedDebtor.totalDebt}
                      prefix="¥"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic
                      title="已还金额"
                      value={selectedDebtor.repaidAmount}
                      prefix="¥"
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="还款能力评估" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>配合度评分：</Text>
                    <Rate disabled value={selectedDebtor.cooperationLevel} />
                  </div>
                  <div>
                    <Text>还款意愿：</Text>
                    <Tag color={getWillingnessColor(selectedDebtor.repaymentWillingness)}>
                      {selectedDebtor.repaymentWillingness === 'high' ? '高' : 
                       selectedDebtor.repaymentWillingness === 'medium' ? '中' : '低'}
                    </Tag>
                  </div>
                  <div>
                    <Text>风险等级：</Text>
                    <Tag color={getRiskColor(selectedDebtor.riskLevel)}>
                      {selectedDebtor.riskLevel === 'high' ? '高风险' : 
                       selectedDebtor.riskLevel === 'medium' ? '中风险' : '低风险'}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </TabPane>

            <TabPane tab="联系记录" key="contact">
              {selectedDebtor.contactRecords.length > 0 ? (
                <Timeline>
                  {selectedDebtor.contactRecords.map(record => (
                    <Timeline.Item
                      key={record.id}
                      dot={getContactTypeIcon(record.type)}
                    >
                      <div>
                        <Space>
                          <Text strong>{record.time}</Text>
                          <Text type="secondary">{record.operator}</Text>
                        </Space>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Text>{record.content}</Text>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">结果：{record.result}</Text>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty description="暂无联系记录" />
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 添加联系记录弹窗 */}
      <Modal
        title="添加联系记录"
        open={contactModalVisible}
        onCancel={() => setContactModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleContactSubmit}
        >
          <Form.Item
            label="联系方式"
            name="type"
            rules={[{ required: true, message: '请选择联系方式' }]}
          >
            <Select placeholder="请选择联系方式">
              <Option value="phone">电话</Option>
              <Option value="sms">短信</Option>
              <Option value="email">邮件</Option>
              <Option value="visit">上门</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="联系内容"
            name="content"
            rules={[{ required: true, message: '请输入联系内容' }]}
          >
            <TextArea rows={3} placeholder="请输入联系内容" />
          </Form.Item>

          <Form.Item
            label="联系结果"
            name="result"
            rules={[{ required: true, message: '请输入联系结果' }]}
          >
            <TextArea rows={2} placeholder="请输入联系结果" />
          </Form.Item>

          <Form.Item
            label="配合度评分"
            name="cooperationLevel"
          >
            <Rate />
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量联系弹窗 */}
      <Modal
        title="批量联系债务人"
        open={batchContactModalVisible}
        onCancel={() => setBatchContactModalVisible(false)}
        onOk={handleBatchContactSubmit}
        width={600}
      >
        <Form form={batchForm} layout="vertical">
          <div style={{ marginBottom: 16 }}>
            <Text>已选择 <Text strong>{selectedDebtors.length}</Text> 位债务人</Text>
          </div>
          
          <Form.Item
            label="联系方式"
            name="contactType"
            rules={[{ required: true, message: '请选择联系方式' }]}
          >
            <Select placeholder="请选择联系方式">
              <Option value="phone">电话</Option>
              <Option value="sms">短信</Option>
              <Option value="email">邮件</Option>
              <Option value="visit">上门</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="联系内容模板"
            name="template"
            rules={[{ required: true, message: '请选择联系内容模板' }]}
          >
            <Select placeholder="请选择模板">
              <Option value="first_contact">首次联系</Option>
              <Option value="follow_up">跟进联系</Option>
              <Option value="payment_reminder">还款提醒</Option>
              <Option value="negotiation">协商邀请</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="备注信息"
            name="notes"
          >
            <TextArea rows={3} placeholder="可输入补充说明" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量短信弹窗 */}
      <Modal
        title="批量发送短信"
        open={batchSmsModalVisible}
        onCancel={() => setBatchSmsModalVisible(false)}
        onOk={handleBatchSmsSubmit}
        width={600}
      >
        <Form form={batchForm} layout="vertical">
          <div style={{ marginBottom: 16 }}>
            <Text>将向 <Text strong>{selectedDebtors.length}</Text> 位债务人发送短信</Text>
          </div>
          
          <Form.Item
            label="短信模板"
            name="smsTemplate"
            rules={[{ required: true, message: '请选择短信模板' }]}
          >
            <Select placeholder="请选择短信模板">
              <Option value="payment_reminder">还款提醒</Option>
              <Option value="mediation_notice">调解通知</Option>
              <Option value="appointment">预约通知</Option>
              <Option value="custom">自定义内容</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="短信内容"
            name="smsContent"
            rules={[{ required: true, message: '请输入短信内容' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入短信内容，支持变量：{姓名}、{金额}、{日期}" 
              showCount
              maxLength={200}
            />
          </Form.Item>
          
          <Form.Item
            label="发送时间"
            name="sendTime"
          >
            <Select placeholder="请选择发送时间" defaultValue="now">
              <Option value="now">立即发送</Option>
              <Option value="scheduled">定时发送</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 导出档案弹窗 */}
      <Modal
        title="导出债务人档案"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onOk={handleExportSubmit}
        width={500}
      >
        <Form form={batchForm} layout="vertical">
          <div style={{ marginBottom: 16 }}>
            <Text>将导出 <Text strong>{selectedDebtors.length}</Text> 个债务人档案</Text>
          </div>
          
          <Form.Item
            label="导出格式"
            name="exportFormat"
            rules={[{ required: true, message: '请选择导出格式' }]}
          >
            <Select placeholder="请选择导出格式" defaultValue="excel">
              <Option value="excel">Excel表格</Option>
              <Option value="pdf">PDF文档</Option>
              <Option value="word">Word文档</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="包含信息"
            name="includeInfo"
            initialValue={['basic', 'contact', 'debt']}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={12}><Checkbox value="basic">基本信息</Checkbox></Col>
                <Col span={12}><Checkbox value="contact">联系记录</Checkbox></Col>
                <Col span={12}><Checkbox value="debt">债务信息</Checkbox></Col>
                <Col span={12}><Checkbox value="assets">资产信息</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          
          <Form.Item
            label="文件名称"
            name="fileName"
            initialValue={`债务人档案_${dayjs().format('YYYY-MM-DD')}`}
          >
            <Input placeholder="请输入文件名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DebtorManagement;