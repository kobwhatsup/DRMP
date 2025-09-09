import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Alert,
  Tag,
  Space,
  Typography,
  Tabs,
  List,
  Calendar,
  Badge,
  Timeline,
  Upload,
  Descriptions,
  Steps,
  Progress,
  Divider,
  Checkbox,
  message,
  Radio,
  Popconfirm,
  Drawer,
  Tree
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  UserOutlined,
  BankOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  BellOutlined,
  PlayCircleOutlined,
  PhoneOutlined,
  GlobalOutlined,
  CameraOutlined,
  ReconciliationOutlined,
  TrophyOutlined,
  AlertOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Step } = Steps;
const { Dragger } = Upload;

interface TrialCase {
  id: string;
  caseNumber: string;
  caseId: string;
  debtorName: string;
  amount: number;
  court: string;
  lawyer: string;
  judge?: string;
  trialType: '开庭审理' | '证据交换' | '调解' | '宣判' | '二审' | '再审';
  trialStatus: 'scheduled' | 'prepared' | 'ongoing' | 'completed' | 'postponed' | 'cancelled';
  hearingTime?: string;
  courtroom?: string;
  preparationProgress: number;
  trialMode: 'offline' | 'online' | 'hybrid';
  documents: TrialDocument[];
  participants: Participant[];
  notifications: TrialNotification[];
}

interface TrialDocument {
  id: string;
  name: string;
  type: 'complaint' | 'evidence' | 'witness' | 'expert' | 'rebuttal' | 'summary' | 'other';
  status: 'pending' | 'prepared' | 'submitted' | 'admitted';
  uploadTime?: string;
  fileSize?: number;
  url?: string;
}

interface Participant {
  id: string;
  name: string;
  role: 'plaintiff_lawyer' | 'defendant' | 'defendant_lawyer' | 'witness' | 'expert' | 'judge';
  contact: string;
  attendance: 'confirmed' | 'pending' | 'declined' | 'unknown';
  reminders: number;
}

interface TrialNotification {
  id: string;
  type: 'hearing_notice' | 'evidence_deadline' | 'preparation_reminder' | 'postponement' | 'judgment';
  title: string;
  content: string;
  sendTime: string;
  recipients: string[];
  status: 'sent' | 'delivered' | 'read';
}

interface CourtSession {
  id: string;
  sessionType: 'pre_trial' | 'formal_trial' | 'evidence_exchange' | 'mediation' | 'judgment';
  startTime: string;
  endTime?: string;
  duration?: number;
  recording?: string;
  notes: string;
  keyPoints: string[];
  nextSteps: string[];
}

const TrialManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [trialCases, setTrialCases] = useState<TrialCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<TrialCase | null>(null);
  const [preparationModalVisible, setPreparationModalVisible] = useState(false);
  const [hearingModalVisible, setHearingModalVisible] = useState(false);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [recordingModalVisible, setRecordingModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calendarMode, setCalendarMode] = useState<'month' | 'year'>('month');
  const [form] = Form.useForm();

  useEffect(() => {
    loadTrialData();
  }, []);

  const loadTrialData = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockCases: TrialCase[] = [
        {
          id: '1',
          caseNumber: 'LIT-2024-001',
          caseId: '(2024)京0105民初1234号',
          debtorName: '王五',
          amount: 100000,
          court: '北京市朝阳区法院',
          lawyer: '李律师',
          judge: '张法官',
          trialType: '开庭审理',
          trialStatus: 'scheduled',
          hearingTime: '2024-02-15 09:30:00',
          courtroom: '第3法庭',
          preparationProgress: 75,
          trialMode: 'offline',
          documents: [
            { id: '1', name: '起诉状', type: 'complaint', status: 'submitted', uploadTime: '2024-02-10 14:30:00' },
            { id: '2', name: '证据清单', type: 'evidence', status: 'submitted', uploadTime: '2024-02-10 15:00:00' },
            { id: '3', name: '代理词', type: 'summary', status: 'prepared', uploadTime: '2024-02-12 10:20:00' }
          ],
          participants: [
            { id: '1', name: '李律师', role: 'plaintiff_lawyer', contact: '13800138001', attendance: 'confirmed', reminders: 0 },
            { id: '2', name: '王五', role: 'defendant', contact: '13800138002', attendance: 'pending', reminders: 2 }
          ],
          notifications: [
            { 
              id: '1', 
              type: 'hearing_notice', 
              title: '开庭通知', 
              content: '您的案件将于2024年2月15日上午9:30在第3法庭开庭',
              sendTime: '2024-02-08 16:00:00',
              recipients: ['李律师', '王五'],
              status: 'delivered'
            }
          ]
        },
        {
          id: '2',
          caseNumber: 'LIT-2024-002',
          caseId: '(2024)京0108民初5678号',
          debtorName: '赵六',
          amount: 80000,
          court: '北京市海淀区法院',
          lawyer: '张律师',
          trialType: '证据交换',
          trialStatus: 'prepared',
          hearingTime: '2024-02-18 14:00:00',
          courtroom: '第2法庭',
          preparationProgress: 90,
          trialMode: 'online',
          documents: [
            { id: '4', name: '补充证据', type: 'evidence', status: 'admitted', uploadTime: '2024-02-14 11:15:00' },
            { id: '5', name: '质证意见', type: 'rebuttal', status: 'prepared' }
          ],
          participants: [
            { id: '3', name: '张律师', role: 'plaintiff_lawyer', contact: '13800138003', attendance: 'confirmed', reminders: 0 },
            { id: '4', name: '赵六', role: 'defendant', contact: '13800138004', attendance: 'confirmed', reminders: 1 }
          ],
          notifications: []
        }
      ];

      setTrialCases(mockCases);
    } catch (error) {
      console.error('加载庭审数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getTrialStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'scheduled': 'blue',
      'prepared': 'orange',
      'ongoing': 'processing',
      'completed': 'success',
      'postponed': 'warning',
      'cancelled': 'error'
    };
    return colorMap[status] || 'default';
  };

  const getTrialStatusText = (status: string) => {
    const textMap: { [key: string]: string } = {
      'scheduled': '已安排',
      'prepared': '已准备',
      'ongoing': '进行中',
      'completed': '已完成',
      'postponed': '已延期',
      'cancelled': '已取消'
    };
    return textMap[status] || status;
  };

  const getDocumentStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'default',
      'prepared': 'processing',
      'submitted': 'blue',
      'admitted': 'success'
    };
    return colorMap[status] || 'default';
  };

  const getAttendanceColor = (attendance: string) => {
    const colorMap: { [key: string]: string } = {
      'confirmed': 'success',
      'pending': 'warning',
      'declined': 'error',
      'unknown': 'default'
    };
    return colorMap[attendance] || 'default';
  };

  const handlePreparation = (record: TrialCase) => {
    setSelectedCase(record);
    setPreparationModalVisible(true);
    form.setFieldsValue({
      caseNumber: record.caseNumber,
      hearingTime: record.hearingTime ? dayjs(record.hearingTime) : null,
      courtroom: record.courtroom,
      trialMode: record.trialMode
    });
  };

  const handleHearing = (record: TrialCase) => {
    setSelectedCase(record);
    setHearingModalVisible(true);
  };

  const handleDocumentManagement = (record: TrialCase) => {
    setSelectedCase(record);
    setDocumentModalVisible(true);
  };

  const handleSendNotification = (record: TrialCase) => {
    setSelectedCase(record);
    setNotificationModalVisible(true);
  };

  const handleRecording = (record: TrialCase) => {
    setSelectedCase(record);
    setRecordingModalVisible(true);
  };

  const handlePreparationSubmit = async (values: any) => {
    try {
      console.log('更新庭审准备:', values);
      message.success('庭审准备更新成功');
      setPreparationModalVisible(false);
      loadTrialData();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const dateCellRender = (date: dayjs.Dayjs) => {
    const todayHearings = trialCases.filter(case_ => 
      case_.hearingTime && dayjs(case_.hearingTime).isSame(date, 'day')
    );
    
    if (todayHearings.length === 0) return null;

    return (
      <div>
        {todayHearings.map(hearing => (
          <Badge 
            key={hearing.id}
            status={getTrialStatusColor(hearing.trialStatus) as any}
            text={
              <div style={{ fontSize: 10 }}>
                {dayjs(hearing.hearingTime).format('HH:mm')} {hearing.caseNumber}
              </div>
            }
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      title: '案件信息',
      key: 'caseInfo',
      render: (record: TrialCase) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.caseNumber}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.caseId}</Text>
          <Text>{record.debtorName} | ¥{record.amount.toLocaleString()}</Text>
        </Space>
      )
    },
    {
      title: '庭审信息',
      key: 'trialInfo',
      render: (record: TrialCase) => (
        <Space direction="vertical" size="small">
          <Tag color="blue">{record.trialType}</Tag>
          <div>
            <CalendarOutlined /> {record.hearingTime ? dayjs(record.hearingTime).format('MM-DD HH:mm') : '-'}
          </div>
          <div>{record.court} {record.courtroom}</div>
        </Space>
      )
    },
    {
      title: '审理模式',
      dataIndex: 'trialMode',
      key: 'trialMode',
      render: (mode: string) => (
        <Tag color={mode === 'online' ? 'green' : mode === 'offline' ? 'blue' : 'orange'}>
          {mode === 'online' ? '线上审理' : mode === 'offline' ? '线下审理' : '混合模式'}
        </Tag>
      )
    },
    {
      title: '准备进度',
      key: 'preparation',
      render: (record: TrialCase) => (
        <Space direction="vertical" size="small">
          <Progress percent={record.preparationProgress} size="small" />
          <Tag color={getTrialStatusColor(record.trialStatus)}>
            {getTrialStatusText(record.trialStatus)}
          </Tag>
        </Space>
      )
    },
    {
      title: '承办律师',
      dataIndex: 'lawyer',
      key: 'lawyer'
    },
    {
      title: '审判法官',
      dataIndex: 'judge',
      key: 'judge',
      render: (judge: string) => judge || '-'
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: TrialCase) => (
        <Space direction="vertical" size="small">
          <Space>
            <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handlePreparation(record)}>
              准备
            </Button>
            <Button size="small" type="link" icon={<FileTextOutlined />} onClick={() => handleDocumentManagement(record)}>
              材料
            </Button>
          </Space>
          <Space>
            <Button size="small" type="link" icon={<BellOutlined />} onClick={() => handleSendNotification(record)}>
              通知
            </Button>
            <Button size="small" type="link" icon={<PlayCircleOutlined />} onClick={() => handleHearing(record)}>
              开庭
            </Button>
          </Space>
        </Space>
      )
    }
  ];

  const trialStats = {
    total: trialCases.length,
    scheduled: trialCases.filter(c => c.trialStatus === 'scheduled').length,
    prepared: trialCases.filter(c => c.trialStatus === 'prepared').length,
    ongoing: trialCases.filter(c => c.trialStatus === 'ongoing').length,
    completed: trialCases.filter(c => c.trialStatus === 'completed').length,
    online: trialCases.filter(c => c.trialMode === 'online').length,
    offline: trialCases.filter(c => c.trialMode === 'offline').length
  };

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 12 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{trialStats.total}</div>
                <div style={{ color: '#666' }}>庭审总数</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14', marginRight: 12 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{trialStats.scheduled}</div>
                <div style={{ color: '#666' }}>已安排</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginRight: 12 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{trialStats.prepared}</div>
                <div style={{ color: '#666' }}>已准备</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PlayCircleOutlined style={{ fontSize: 24, color: '#722ed1', marginRight: 12 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{trialStats.ongoing}</div>
                <div style={{ color: '#666' }}>进行中</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <GlobalOutlined style={{ fontSize: 24, color: '#13c2c2', marginRight: 12 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{trialStats.online}</div>
                <div style={{ color: '#666' }}>线上审理</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BankOutlined style={{ fontSize: 24, color: '#eb2f96', marginRight: 12 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{trialStats.offline}</div>
                <div style={{ color: '#666' }}>线下审理</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="庭审日历" key="calendar">
            <Alert
              message="庭审日历"
              description="查看庭审安排，支持月视图和年视图切换"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Calendar 
              dateCellRender={dateCellRender}
              mode={calendarMode}
              onPanelChange={(date, mode) => {
                setSelectedDate(date);
                setCalendarMode(mode);
              }}
            />
          </TabPane>

          <TabPane tab="庭审列表" key="list">
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Space>
                  <Select defaultValue="all" style={{ width: 120 }}>
                    <Option value="all">全部状态</Option>
                    <Option value="scheduled">已安排</Option>
                    <Option value="prepared">已准备</Option>
                    <Option value="ongoing">进行中</Option>
                    <Option value="completed">已完成</Option>
                  </Select>
                  <Select defaultValue="all" style={{ width: 120 }}>
                    <Option value="all">全部类型</Option>
                    <Option value="开庭审理">开庭审理</Option>
                    <Option value="证据交换">证据交换</Option>
                    <Option value="调解">调解</Option>
                    <Option value="宣判">宣判</Option>
                  </Select>
                  <RangePicker placeholder={['开始日期', '结束日期']} />
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button type="primary" icon={<PlusOutlined />}>
                    安排庭审
                  </Button>
                  <Button icon={<BellOutlined />}>
                    批量通知
                  </Button>
                  <Button icon={<DownloadOutlined />}>
                    导出安排
                  </Button>
                </Space>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={trialCases}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>

          <TabPane tab="今日庭审" key="today">
            <List
              dataSource={trialCases.filter(case_ => 
                case_.hearingTime && dayjs(case_.hearingTime).isSame(dayjs(), 'day')
              )}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button size="small" type="link" onClick={() => handlePreparation(item)}>
                      准备检查
                    </Button>,
                    <Button size="small" type="primary" onClick={() => handleHearing(item)}>
                      进入庭审
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={getTrialStatusColor(item.trialStatus) as any}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{item.caseNumber}</Text>
                        <Tag>{item.trialType}</Tag>
                        {item.trialMode === 'online' && <GlobalOutlined style={{ color: '#13c2c2' }} />}
                      </Space>
                    }
                    description={
                      <div>
                        <div>{item.debtorName} vs 原告 | ¥{item.amount.toLocaleString()}</div>
                        <div>
                          <CalendarOutlined /> {dayjs(item.hearingTime).format('HH:mm')} | 
                          <BankOutlined /> {item.court} {item.courtroom} | 
                          <UserOutlined /> {item.lawyer}
                        </div>
                        <Progress percent={item.preparationProgress} size="small" />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="庭审记录" key="records">
            <Card title="庭审录音录像管理">
              <List
                dataSource={trialCases.filter(case_ => case_.trialStatus === 'completed')}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button size="small" type="link" icon={<EyeOutlined />}>
                        查看记录
                      </Button>,
                      <Button size="small" type="link" icon={<SoundOutlined />} onClick={() => handleRecording(item)}>
                        录音
                      </Button>,
                      <Button size="small" type="link" icon={<VideoCameraOutlined />}>
                        录像
                      </Button>,
                      <Button size="small" type="link" icon={<DownloadOutlined />}>
                        下载
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={`${item.caseNumber} - ${item.trialType}`}
                      description={
                        <div>
                          <div>开庭时间: {item.hearingTime && dayjs(item.hearingTime).format('YYYY-MM-DD HH:mm')}</div>
                          <div>法庭: {item.court} {item.courtroom}</div>
                          <div>审理模式: {item.trialMode === 'online' ? '线上' : '线下'}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* 庭审准备弹窗 */}
      <Modal
        title="庭审准备"
        open={preparationModalVisible}
        onCancel={() => setPreparationModalVisible(false)}
        onOk={() => form.submit()}
        width={1200}
      >
        <Form form={form} layout="vertical" onFinish={handlePreparationSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="基本信息">
                <Form.Item label="案件编号" name="caseNumber">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="开庭时间" name="hearingTime">
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="法庭" name="courtroom">
                  <Input />
                </Form.Item>
                <Form.Item label="审理模式" name="trialMode">
                  <Radio.Group>
                    <Radio value="offline">线下审理</Radio>
                    <Radio value="online">线上审理</Radio>
                    <Radio value="hybrid">混合模式</Radio>
                  </Radio.Group>
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="准备清单">
                <Checkbox.Group style={{ width: '100%' }}>
                  <Row>
                    <Col span={24}><Checkbox value="complaint">起诉状已准备</Checkbox></Col>
                    <Col span={24}><Checkbox value="evidence">证据材料已整理</Checkbox></Col>
                    <Col span={24}><Checkbox value="witness">证人已联系</Checkbox></Col>
                    <Col span={24}><Checkbox value="summary">代理词已完成</Checkbox></Col>
                    <Col span={24}><Checkbox value="rebuttal">质证意见已准备</Checkbox></Col>
                    <Col span={24}><Checkbox value="equipment">设备已调试（线上）</Checkbox></Col>
                    <Col span={24}><Checkbox value="participants">参与人已通知</Checkbox></Col>
                    <Col span={24}><Checkbox value="backup">备用方案已准备</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Card>
            </Col>
          </Row>

          {selectedCase && (
            <Card size="small" title="参与人员" style={{ marginTop: 16 }}>
              <List
                dataSource={selectedCase.participants}
                renderItem={participant => (
                  <List.Item
                    actions={[
                      <Button size="small" type="link" icon={<PhoneOutlined />}>
                        联系
                      </Button>,
                      <Button size="small" type="link" icon={<BellOutlined />}>
                        提醒
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={participant.name}
                      description={
                        <Space>
                          <Tag>{participant.role}</Tag>
                          <Tag color={getAttendanceColor(participant.attendance)}>
                            {participant.attendance}
                          </Tag>
                          <Text type="secondary">{participant.contact}</Text>
                          {participant.reminders > 0 && (
                            <Text type="secondary">已提醒{participant.reminders}次</Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Form>
      </Modal>

      {/* 庭审进行弹窗 */}
      <Modal
        title="庭审进行中"
        open={hearingModalVisible}
        onCancel={() => setHearingModalVisible(false)}
        width={1400}
        footer={[
          <Button key="pause" type="default">
            暂停记录
          </Button>,
          <Button key="complete" type="primary">
            完成庭审
          </Button>
        ]}
      >
        {selectedCase && (
          <Row gutter={16}>
            <Col span={16}>
              <Card size="small" title={`${selectedCase.caseNumber} - ${selectedCase.trialType}`}>
                <Steps current={2} style={{ marginBottom: 16 }}>
                  <Step title="庭审准备" />
                  <Step title="庭审开始" />
                  <Step title="法庭调查" />
                  <Step title="法庭辩论" />
                  <Step title="最后陈述" />
                  <Step title="庭审结束" />
                </Steps>

                <Card size="small" title="实时记录" style={{ marginTop: 16 }}>
                  <div style={{ height: 300, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 16 }}>
                    <Timeline>
                      <Timeline.Item color="blue" dot={<ClockCircleOutlined />}>
                        <Text strong>09:30</Text> 庭审开始，核实当事人身份
                      </Timeline.Item>
                      <Timeline.Item color="green" dot={<UserOutlined />}>
                        <Text strong>09:35</Text> 原告律师宣读起诉状
                      </Timeline.Item>
                      <Timeline.Item color="orange" dot={<FileTextOutlined />}>
                        <Text strong>09:45</Text> 展示证据材料编号1-15
                      </Timeline.Item>
                      <Timeline.Item dot={<EditOutlined />}>
                        <Input.Group compact style={{ marginTop: 8 }}>
                          <Input 
                            style={{ width: 'calc(100% - 80px)' }} 
                            placeholder="输入庭审记录..." 
                          />
                          <Button type="primary">添加</Button>
                        </Input.Group>
                      </Timeline.Item>
                    </Timeline>
                  </div>
                </Card>
              </Card>
            </Col>
            
            <Col span={8}>
              <Card size="small" title="庭审信息">
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="案件">
                    {selectedCase.caseNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="当事人">
                    {selectedCase.debtorName}
                  </Descriptions.Item>
                  <Descriptions.Item label="争议金额">
                    ¥{selectedCase.amount.toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="开庭时间">
                    {selectedCase.hearingTime && dayjs(selectedCase.hearingTime).format('YYYY-MM-DD HH:mm')}
                  </Descriptions.Item>
                  <Descriptions.Item label="审理模式">
                    <Tag color={selectedCase.trialMode === 'online' ? 'green' : 'blue'}>
                      {selectedCase.trialMode === 'online' ? '线上审理' : '线下审理'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card size="small" title="录音录像" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block icon={<SoundOutlined />} type="primary">
                    开始录音
                  </Button>
                  <Button block icon={<VideoCameraOutlined />}>
                    开始录像
                  </Button>
                  <Button block icon={<CameraOutlined />}>
                    截图存证
                  </Button>
                </Space>
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">录制时长: 00:45:32</Text>
                </div>
              </Card>

              <Card size="small" title="快捷操作" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block icon={<ReconciliationOutlined />}>
                    提议调解
                  </Button>
                  <Button block icon={<FileTextOutlined />}>
                    申请中止
                  </Button>
                  <Button block icon={<AlertOutlined />}>
                    申请延期
                  </Button>
                  <Button block icon={<TrophyOutlined />}>
                    申请宣判
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </Modal>

      {/* 文书管理弹窗 */}
      <Modal
        title="庭审文书管理"
        open={documentModalVisible}
        onCancel={() => setDocumentModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setDocumentModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedCase && (
          <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={5}>{selectedCase.caseNumber} - 庭审文书</Title>
              </Col>
              <Col>
                <Button type="primary" icon={<PlusOutlined />}>
                  上传文书
                </Button>
              </Col>
            </Row>

            <Table
              dataSource={selectedCase.documents}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: '文书名称',
                  dataIndex: 'name',
                  key: 'name'
                },
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                  render: (type: string) => {
                    const typeMap: { [key: string]: string } = {
                      'complaint': '起诉状',
                      'evidence': '证据材料',
                      'witness': '证人证言',
                      'expert': '专家意见',
                      'rebuttal': '质证意见',
                      'summary': '代理词',
                      'other': '其他'
                    };
                    return typeMap[type] || type;
                  }
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={getDocumentStatusColor(status)}>
                      {status === 'pending' ? '待准备' : 
                       status === 'prepared' ? '已准备' : 
                       status === 'submitted' ? '已提交' : '已采纳'}
                    </Tag>
                  )
                },
                {
                  title: '上传时间',
                  dataIndex: 'uploadTime',
                  key: 'uploadTime',
                  render: (time: string) => time ? dayjs(time).format('MM-DD HH:mm') : '-'
                },
                {
                  title: '操作',
                  key: 'actions',
                  render: (record: TrialDocument) => (
                    <Space>
                      <Button size="small" type="link" icon={<EyeOutlined />}>
                        查看
                      </Button>
                      <Button size="small" type="link" icon={<DownloadOutlined />}>
                        下载
                      </Button>
                      <Button size="small" type="link" icon={<EditOutlined />}>
                        编辑
                      </Button>
                    </Space>
                  )
                }
              ]}
            />

            <Card size="small" title="批量上传" style={{ marginTop: 16 }}>
              <Dragger>
                <p className="ant-upload-drag-icon">
                  <FileTextOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                  支持单个或批量上传，支持PDF、DOC、DOCX格式
                </p>
              </Dragger>
            </Card>
          </div>
        )}
      </Modal>

      {/* 通知管理弹窗 */}
      <Modal
        title="发送庭审通知"
        open={notificationModalVisible}
        onCancel={() => setNotificationModalVisible(false)}
        onOk={() => message.success('通知发送成功')}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="通知类型">
            <Select defaultValue="hearing_notice">
              <Option value="hearing_notice">开庭通知</Option>
              <Option value="evidence_deadline">证据提交截止提醒</Option>
              <Option value="preparation_reminder">庭审准备提醒</Option>
              <Option value="postponement">庭审延期通知</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="接收人员">
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={12}><Checkbox value="lawyer">承办律师</Checkbox></Col>
                <Col span={12}><Checkbox value="defendant">被告</Checkbox></Col>
                <Col span={12}><Checkbox value="witness">证人</Checkbox></Col>
                <Col span={12}><Checkbox value="expert">专家</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item label="通知内容">
            <TextArea 
              rows={4} 
              defaultValue="您好，您的案件将于2024年2月15日上午9:30在北京市朝阳区法院第3法庭开庭审理，请准时参加。"
            />
          </Form.Item>

          <Form.Item label="发送方式">
            <Checkbox.Group defaultValue={['sms', 'email']}>
              <Checkbox value="sms">短信通知</Checkbox>
              <Checkbox value="email">邮件通知</Checkbox>
              <Checkbox value="phone">电话通知</Checkbox>
              <Checkbox value="system">系统通知</Checkbox>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* 录音录像弹窗 */}
      <Modal
        title="庭审录音录像"
        open={recordingModalVisible}
        onCancel={() => setRecordingModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setRecordingModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedCase && (
          <div>
            <Card size="small" title="录音管理">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>庭审录音 - {selectedCase.caseNumber}</Text>
                  <Space>
                    <Button icon={<PlayCircleOutlined />} type="primary">
                      播放
                    </Button>
                    <Button icon={<DownloadOutlined />}>
                      下载
                    </Button>
                  </Space>
                </div>
                <Progress percent={100} showInfo={false} />
                <Text type="secondary">录制时长: 01:23:45 | 文件大小: 45.2MB</Text>
              </Space>
            </Card>

            <Card size="small" title="录像管理" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>庭审录像 - {selectedCase.caseNumber}</Text>
                  <Space>
                    <Button icon={<PlayCircleOutlined />} type="primary">
                      播放
                    </Button>
                    <Button icon={<DownloadOutlined />}>
                      下载
                    </Button>
                  </Space>
                </div>
                <Progress percent={100} showInfo={false} />
                <Text type="secondary">录制时长: 01:23:45 | 文件大小: 1.2GB</Text>
              </Space>
            </Card>

            <Card size="small" title="存证截图" style={{ marginTop: 16 }}>
              <List
                grid={{ gutter: 16, column: 4 }}
                dataSource={[1, 2, 3, 4]}
                renderItem={item => (
                  <List.Item>
                    <Card
                      size="small"
                      cover={<div style={{ height: 80, background: '#f0f0f0' }} />}
                      actions={[
                        <EyeOutlined key="view" />,
                        <DownloadOutlined key="download" />
                      ]}
                    >
                      <Card.Meta title={`截图${item}`} description="10:${30 + item * 5}:00" />
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TrialManagement;