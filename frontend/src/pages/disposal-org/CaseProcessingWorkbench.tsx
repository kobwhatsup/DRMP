import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, DatePicker,
  Tag, Progress, Statistic, Row, Col, Divider, Typography, Badge,
  Timeline, Upload, Tabs, Alert, Tooltip, Rate, Steps, Radio,
  List, Avatar, Drawer, Descriptions
} from 'antd';
import {
  SearchOutlined, FilterOutlined, EditOutlined, EyeOutlined,
  ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  FileTextOutlined, PhoneOutlined, MailOutlined, MessageOutlined,
  UploadOutlined, DownloadOutlined, PrinterOutlined, TeamOutlined,
  DollarOutlined, CalendarOutlined, UserOutlined, BankOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

interface CaseDetail {
  id: number;
  caseNumber: string;
  debtorName: string;
  debtorPhone: string;
  debtorIdCard: string;
  originalAmount: number;
  remainingAmount: number;
  overdueDays: number;
  assignedAt: string;
  deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'PROCESSING' | 'MEDIATION' | 'LITIGATION' | 'COMPLETED' | 'FAILED';
  sourceOrgName: string;
  assignedTo: string;
  lastContactAt?: string;
  nextAction?: string;
  tags: string[];
  progress: number;
  documents: any[];
  communications: any[];
  timeline: any[];
}

interface CasePackageInfo {
  id: number;
  name: string;
  sourceOrg: string;
  totalCases: number;
  completedCases: number;
  totalAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
  assignedAt: string;
  deadline: string;
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
}

const CaseProcessingWorkbench: React.FC = () => {
  const [cases, setCases] = useState<CaseDetail[]>([]);
  const [casePackages, setCasePackages] = useState<CasePackageInfo[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [caseDetailVisible, setCaseDetailVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCases();
    loadCasePackages();
  }, []);

  const loadCases = async () => {
    // 模拟加载案件数据
    const mockCases: CaseDetail[] = [
      {
        id: 1,
        caseNumber: 'ICBC202407001',
        debtorName: '张三',
        debtorPhone: '138****1234',
        debtorIdCard: '110101199001011234',
        originalAmount: 50000,
        remainingAmount: 45000,
        overdueDays: 120,
        assignedAt: '2024-07-01',
        deadline: '2024-08-01',
        priority: 'HIGH',
        status: 'PROCESSING',
        sourceOrgName: '中国工商银行',
        assignedTo: '李调解员',
        lastContactAt: '2024-07-25',
        nextAction: '安排面谈调解',
        tags: ['高风险', '有还款意愿'],
        progress: 65,
        documents: [],
        communications: [],
        timeline: []
      },
      {
        id: 2,
        caseNumber: 'ICBC202407002',
        debtorName: '李四',
        debtorPhone: '139****5678',
        debtorIdCard: '110101199002022345',
        originalAmount: 30000,
        remainingAmount: 28000,
        overdueDays: 90,
        assignedAt: '2024-07-02',
        deadline: '2024-08-02',
        priority: 'MEDIUM',
        status: 'MEDIATION',
        sourceOrgName: '中国工商银行',
        assignedTo: '王律师',
        lastContactAt: '2024-07-28',
        nextAction: '调解协议签署',
        tags: ['配合调解', '分期还款'],
        progress: 85,
        documents: [],
        communications: [],
        timeline: []
      }
    ];
    setCases(mockCases);
  };

  const loadCasePackages = async () => {
    // 模拟加载案件包数据
    const mockPackages: CasePackageInfo[] = [
      {
        id: 1,
        name: '工商银行个贷不良包-202407',
        sourceOrg: '中国工商银行',
        totalCases: 850,
        completedCases: 425,
        totalAmount: 12500000,
        recoveredAmount: 8750000,
        recoveryRate: 70,
        assignedAt: '2024-07-01',
        deadline: '2024-12-31',
        status: 'ACTIVE'
      }
    ];
    setCasePackages(mockPackages);
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      'PENDING': { color: 'default', text: '待处理' },
      'PROCESSING': { color: 'blue', text: '处理中' },
      'MEDIATION': { color: 'orange', text: '调解中' },
      'LITIGATION': { color: 'red', text: '诉讼中' },
      'COMPLETED': { color: 'green', text: '已完成' },
      'FAILED': { color: 'red', text: '失败' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPriorityTag = (priority: string) => {
    const priorityMap: Record<string, { color: string; text: string }> = {
      'HIGH': { color: 'red', text: '高' },
      'MEDIUM': { color: 'orange', text: '中' },
      'LOW': { color: 'green', text: '低' }
    };
    const config = priorityMap[priority] || { color: 'default', text: priority };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleCaseAction = (caseItem: CaseDetail, action: string) => {
    setSelectedCase(caseItem);
    // 根据不同的操作类型设置表单
    switch (action) {
      case 'contact':
        form.setFieldsValue({
          actionType: 'contact',
          contactMethod: 'phone',
          content: ''
        });
        break;
      case 'update':
        form.setFieldsValue({
          actionType: 'update',
          status: caseItem.status,
          progress: caseItem.progress,
          nextAction: caseItem.nextAction
        });
        break;
      case 'mediation':
        form.setFieldsValue({
          actionType: 'mediation',
          mediationDate: dayjs(),
          mediationLocation: '',
          participants: []
        });
        break;
    }
    setActionModalVisible(true);
  };

  const handleViewDetail = (caseItem: CaseDetail) => {
    setSelectedCase(caseItem);
    setCaseDetailVisible(true);
  };

  const caseColumns: ColumnsType<CaseDetail> = [
    {
      title: '案件信息',
      key: 'caseInfo',
      width: 200,
      render: (_, record: CaseDetail) => (
        <div>
          <Text strong>{record.caseNumber}</Text>
          <br />
          <Text type="secondary">{record.debtorName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.sourceOrgName}
          </Text>
        </div>
      ),
    },
    {
      title: '金额信息',
      key: 'amountInfo',
      width: 120,
      render: (_, record: CaseDetail) => (
        <div>
          <Text>¥{(record.originalAmount / 10000).toFixed(1)}万</Text>
          <br />
          <Text type="secondary">余额: ¥{(record.remainingAmount / 10000).toFixed(1)}万</Text>
        </div>
      ),
    },
    {
      title: '逾期情况',
      key: 'overdueInfo',
      width: 100,
      render: (_, record: CaseDetail) => (
        <div>
          <Badge 
            status={record.overdueDays > 90 ? 'error' : 'warning'} 
            text={`${record.overdueDays}天`}
          />
        </div>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '处理进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small" 
          strokeColor={progress > 80 ? '#52c41a' : progress > 50 ? '#1890ff' : '#fa8c16'}
        />
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 100,
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 100,
      render: (deadline: string) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4 }} />
          <Text 
            type={dayjs(deadline).isBefore(dayjs()) ? 'danger' : 'secondary'}
          >
            {deadline}
          </Text>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: CaseDetail) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="联系债务人">
            <Button 
              type="text" 
              size="small" 
              icon={<PhoneOutlined />}
              onClick={() => handleCaseAction(record, 'contact')}
            />
          </Tooltip>
          <Tooltip title="更新状态">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleCaseAction(record, 'update')}
            />
          </Tooltip>
          <Tooltip title="安排调解">
            <Button 
              type="text" 
              size="small" 
              icon={<MessageOutlined />}
              onClick={() => handleCaseAction(record, 'mediation')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderCaseDetail = () => {
    if (!selectedCase) return null;

    return (
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="基本信息" key="basic">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="案件编号">{selectedCase.caseNumber}</Descriptions.Item>
            <Descriptions.Item label="债务人姓名">{selectedCase.debtorName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{selectedCase.debtorPhone}</Descriptions.Item>
            <Descriptions.Item label="身份证号">{selectedCase.debtorIdCard}</Descriptions.Item>
            <Descriptions.Item label="原始金额">¥{selectedCase.originalAmount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="剩余金额">¥{selectedCase.remainingAmount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="逾期天数">{selectedCase.overdueDays}天</Descriptions.Item>
            <Descriptions.Item label="优先级">{getPriorityTag(selectedCase.priority)}</Descriptions.Item>
            <Descriptions.Item label="当前状态">{getStatusTag(selectedCase.status)}</Descriptions.Item>
            <Descriptions.Item label="处理进度">{selectedCase.progress}%</Descriptions.Item>
            <Descriptions.Item label="负责人">{selectedCase.assignedTo}</Descriptions.Item>
            <Descriptions.Item label="截止时间">{selectedCase.deadline}</Descriptions.Item>
          </Descriptions>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}>案件标签</Title>
              {selectedCase.tags.map(tag => (
                <Tag key={tag} color="blue" style={{ margin: '2px' }}>{tag}</Tag>
              ))}
            </Col>
            <Col span={12}>
              <Title level={5}>下一步行动</Title>
              <Text>{selectedCase.nextAction}</Text>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="处理时间线" key="timeline">
          <Timeline
            items={[
              {
                dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                children: (
                  <div>
                    <Text strong>案件分配</Text>
                    <br />
                    <Text type="secondary">{selectedCase.assignedAt}</Text>
                    <br />
                    <Text type="secondary">案件已分配给{selectedCase.assignedTo}</Text>
                  </div>
                ),
              },
              {
                dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                children: (
                  <div>
                    <Text strong>首次联系</Text>
                    <br />
                    <Text type="secondary">2024-07-02 10:30</Text>
                    <br />
                    <Text type="secondary">电话联系债务人，了解基本情况</Text>
                  </div>
                ),
              },
              {
                dot: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
                children: (
                  <div>
                    <Text strong>调解协商</Text>
                    <br />
                    <Text type="secondary">进行中</Text>
                    <br />
                    <Text type="secondary">与债务人协商还款方案</Text>
                  </div>
                ),
              },
            ]}
          />
        </TabPane>

        <TabPane tab="沟通记录" key="communications">
          <List
            dataSource={[
              {
                id: 1,
                type: 'phone',
                content: '电话联系债务人，债务人表示愿意协商还款',
                operator: '李调解员',
                time: '2024-07-25 14:30',
                result: '有效沟通'
              },
              {
                id: 2,
                type: 'email',
                content: '发送还款方案邮件给债务人',
                operator: '李调解员',
                time: '2024-07-24 09:15',
                result: '已发送'
              }
            ]}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={<div>{item.operator} <Text type="secondary" style={{ fontSize: '12px' }}>{item.time}</Text></div>}
                  description={
                    <div>
                      <Text>{item.content}</Text>
                      <br />
                      <Tag color="blue" style={{ marginTop: 8 }}>{item.result}</Tag>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab="相关文档" key="documents">
          <Upload.Dragger>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">支持单个或批量上传调解协议、还款凭证等文档</p>
          </Upload.Dragger>
          
          <Divider />
          
          <List
            dataSource={[
              { name: '调解协议.pdf', size: '1.2MB', uploadTime: '2024-07-25' },
              { name: '还款计划.docx', size: '856KB', uploadTime: '2024-07-24' }
            ]}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button type="link" icon={<DownloadOutlined />}>下载</Button>,
                  <Button type="link" icon={<EyeOutlined />}>预览</Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: '20px' }} />}
                  title={item.name}
                  description={`${item.size} · ${item.uploadTime}`}
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计面板 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理案件"
              value={cases.filter(c => c.status === 'PENDING').length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="处理中案件"
              value={cases.filter(c => ['PROCESSING', 'MEDIATION'].includes(c.status)).length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成案件"
              value={cases.filter(c => c.status === 'COMPLETED').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均进度"
              value={Math.round(cases.reduce((sum, c) => sum + c.progress, 0) / cases.length)}
              suffix="%"
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 案件包信息 */}
      <Card title="案件包概览" style={{ marginBottom: 24 }}>
        {casePackages.map(pkg => (
          <Card key={pkg.id} size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div>
                  <Title level={5} style={{ margin: 0 }}>{pkg.name}</Title>
                  <Text type="secondary">{pkg.sourceOrg}</Text>
                </div>
              </Col>
              <Col span={16}>
                <Row gutter={16}>
                  <Col span={4}>
                    <Statistic title="总案件" value={pkg.totalCases} />
                  </Col>
                  <Col span={4}>
                    <Statistic title="已完成" value={pkg.completedCases} />
                  </Col>
                  <Col span={4}>
                    <Statistic 
                      title="完成率" 
                      value={Math.round((pkg.completedCases / pkg.totalCases) * 100)} 
                      suffix="%" 
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic 
                      title="回款率" 
                      value={pkg.recoveryRate} 
                      suffix="%" 
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic 
                      title="总金额" 
                      value={(pkg.totalAmount / 10000).toFixed(1)} 
                      suffix="万" 
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic 
                      title="已回款" 
                      value={(pkg.recoveredAmount / 10000).toFixed(1)} 
                      suffix="万" 
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        ))}
      </Card>

      {/* 案件列表 */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>案件处理工作台</Title>
            <Space>
              <Button icon={<SearchOutlined />}>搜索</Button>
              <Button icon={<FilterOutlined />}>筛选</Button>
              <Button icon={<DownloadOutlined />}>导出</Button>
            </Space>
          </div>
        }
      >
        <Table
          dataSource={cases}
          columns={caseColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* 案件详情抽屉 */}
      <Drawer
        title={`案件详情 - ${selectedCase?.caseNumber}`}
        placement="right"
        width={800}
        open={caseDetailVisible}
        onClose={() => setCaseDetailVisible(false)}
      >
        {renderCaseDetail()}
      </Drawer>

      {/* 操作弹窗 */}
      <Modal
        title="案件操作"
        visible={actionModalVisible}
        onCancel={() => setActionModalVisible(false)}
        onOk={() => {
          form.validateFields().then(() => {
            setActionModalVisible(false);
            // 处理操作逻辑
          });
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="actionType" label="操作类型">
            <Select disabled>
              <Option value="contact">联系债务人</Option>
              <Option value="update">更新状态</Option>
              <Option value="mediation">安排调解</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="content" label="操作内容">
            <TextArea rows={4} placeholder="请描述具体的操作内容..." />
          </Form.Item>
          
          <Form.Item name="nextAction" label="下一步行动">
            <Input placeholder="请输入下一步计划..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CaseProcessingWorkbench;