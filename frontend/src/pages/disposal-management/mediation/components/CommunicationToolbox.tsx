import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Button,
  Input,
  Select,
  Form,
  List,
  Space,
  Tag,
  Modal,
  Table,
  Typography,
  Row,
  Col,
  Checkbox,
  message,
  Badge,
  Avatar,
  Tooltip,
  Alert
} from 'antd';
import {
  PhoneOutlined,
  MessageOutlined,
  MailOutlined,
  VideoCameraOutlined,
  CopyOutlined,
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface TalkScript {
  id: string;
  title: string;
  scenario: string;
  content: string;
  tags: string[];
  usage: number;
}

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  type: string;
}

interface ContactRecord {
  id: string;
  debtorName: string;
  phone: string;
  time: string;
  duration: string;
  result: string;
}

const CommunicationToolbox: React.FC = () => {
  const [selectedScript, setSelectedScript] = useState<TalkScript | null>(null);
  const [smsModalVisible, setSmsModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectedCallRecipients, setSelectedCallRecipients] = useState<string[]>([]);
  const [editScriptModalVisible, setEditScriptModalVisible] = useState(false);
  const [newScriptModalVisible, setNewScriptModalVisible] = useState(false);
  const [callInProgress, setCallInProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [videoRoomActive, setVideoRoomActive] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [form] = Form.useForm();
  const [scriptForm] = Form.useForm();

  // 话术库数据
  const talkScripts: TalkScript[] = [
    {
      id: '1',
      title: '首次联系开场白',
      scenario: '初次电话联系',
      content: '您好，请问是[债务人姓名]先生/女士吗？我是[调解中心]的调解员[姓名]，关于您在[债权方]的借款事宜，我们希望和您友好协商一个双方都能接受的还款方案...',
      tags: ['开场', '友好', '首次'],
      usage: 156
    },
    {
      id: '2',
      title: '还款意愿引导',
      scenario: '探询还款意愿',
      content: '我理解您目前可能遇到了一些困难，但解决债务问题对您的征信和未来发展都很重要。我们可以根据您的实际情况，制定一个您能承受的还款计划...',
      tags: ['引导', '协商', '理解'],
      usage: 98
    },
    {
      id: '3',
      title: '分期方案介绍',
      scenario: '提出分期方案',
      content: '根据您的情况，我们可以为您申请分期还款，将总金额分成[期数]期，每期只需还款[金额]元，这样可以大大减轻您的还款压力...',
      tags: ['分期', '方案', '减压'],
      usage: 124
    },
    {
      id: '4',
      title: '催促履约话术',
      scenario: '到期提醒',
      content: '[债务人姓名]先生/女士，您好！提醒您本期还款[金额]元将于[日期]到期，请您按时还款以免影响您的信用记录...',
      tags: ['提醒', '催促', '履约'],
      usage: 203
    }
  ];

  // 短信模板数据
  const smsTemplates: SmsTemplate[] = [
    {
      id: '1',
      name: '调解预约通知',
      content: '【调解中心】尊敬的{name}，您的债务调解已安排在{date} {time}，地点：{location}，请准时参加。',
      variables: ['name', 'date', 'time', 'location'],
      type: '通知'
    },
    {
      id: '2',
      name: '还款提醒',
      content: '【调解中心】{name}您好，您本期应还款{amount}元，还款日为{date}，请及时还款。',
      variables: ['name', 'amount', 'date'],
      type: '提醒'
    },
    {
      id: '3',
      name: '调解成功通知',
      content: '【调解中心】恭喜您！调解成功，您的还款方案为：分{periods}期，每期{amount}元，首期还款日{date}。',
      variables: ['periods', 'amount', 'date'],
      type: '通知'
    }
  ];

  // 待联系债务人列表
  const debtorList = [
    { id: '1', name: '张三', phone: '13800138001', selected: false },
    { id: '2', name: '李四', phone: '13800138002', selected: false },
    { id: '3', name: '王五', phone: '13800138003', selected: false }
  ];

  // 通话记录
  const callRecords: ContactRecord[] = [
    {
      id: '1',
      debtorName: '张三',
      phone: '13800138001',
      time: '2024-02-15 10:30',
      duration: '5分23秒',
      result: '同意协商'
    },
    {
      id: '2',
      debtorName: '李四',
      phone: '13800138002',
      time: '2024-02-15 14:20',
      duration: '3分45秒',
      result: '需要考虑'
    }
  ];

  const handleCopyScript = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('话术已复制到剪贴板');
  };

  const handleSendSms = () => {
    if (selectedRecipients.length === 0) {
      message.warning('请选择接收人');
      return;
    }
    if (!selectedTemplate) {
      message.warning('请选择短信模板');
      return;
    }
    
    form.validateFields().then(values => {
      console.log('发送短信:', {
        recipients: selectedRecipients,
        template: selectedTemplate,
        variables: values
      });
      message.success(`已向${selectedRecipients.length}人发送短信`);
      setSmsModalVisible(false);
    });
  };

  const handleEditScript = (script: TalkScript) => {
    setSelectedScript(script);
    scriptForm.setFieldsValue({
      title: script.title,
      scenario: script.scenario,
      content: script.content,
      tags: script.tags.join(', ')
    });
    setEditScriptModalVisible(true);
  };

  const handleSaveScript = () => {
    scriptForm.validateFields().then(values => {
      console.log('保存话术:', values);
      message.success('话术已保存');
      setEditScriptModalVisible(false);
      setNewScriptModalVisible(false);
      scriptForm.resetFields();
    });
  };

  const handleAddScript = () => {
    scriptForm.resetFields();
    setNewScriptModalVisible(true);
  };

  const handleStartBatchCall = () => {
    if (selectedCallRecipients.length === 0) {
      message.warning('请选择呼叫对象');
      return;
    }
    
    setCallInProgress(true);
    message.success(`开始批量外呼，共${selectedCallRecipients.length}人`);
    
    // 模拟呼叫过程
    setTimeout(() => {
      setCallInProgress(false);
      message.success('批量外呼完成');
    }, 5000);
  };

  const handleSearchScript = (value: string) => {
    setSearchTerm(value);
  };

  const handleStartVideoMediation = () => {
    setVideoRoomActive(true);
    message.success('视频调解室已启动');
  };

  const handleEndVideoMediation = () => {
    setVideoRoomActive(false);
    setCameraEnabled(false);
    setScreenSharing(false);
    message.success('视频调解已结束');
  };

  const handleToggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
    message.success(cameraEnabled ? '摄像头已关闭' : '摄像头已开启');
  };

  const handleToggleScreenShare = () => {
    setScreenSharing(!screenSharing);
    message.success(screenSharing ? '屏幕共享已停止' : '屏幕共享已开启');
  };

  const handlePlayRecording = (record: ContactRecord) => {
    message.info(`正在播放${record.debtorName}的通话录音`);
  };

  const handleViewCallDetail = (record: ContactRecord) => {
    message.info(`查看${record.debtorName}的通话详情`);
  };

  // 过滤话术
  const filteredScripts = talkScripts.filter(script =>
    script.title.includes(searchTerm) || 
    script.scenario.includes(searchTerm) ||
    script.tags.some(tag => tag.includes(searchTerm))
  );

  const callColumns = [
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '通话时间',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: '通话时长',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => (
        <Tag color={result === '同意协商' ? 'green' : 'orange'}>{result}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (record: ContactRecord) => (
        <Space>
          <Button type="link" size="small" onClick={() => handlePlayRecording(record)}>
            播放录音
          </Button>
          <Button type="link" size="small" onClick={() => handleViewCallDetail(record)}>
            查看详情
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card>
      <Tabs defaultActiveKey="scripts">
        <TabPane
          tab={
            <span>
              <MessageOutlined />
              话术库
            </span>
          }
          key="scripts"
        >
          <Row gutter={16}>
            <Col span={10}>
              <Row>
                <Col span={18}>
                  <Input.Search
                    placeholder="搜索话术..."
                    style={{ marginBottom: 16 }}
                    prefix={<SearchOutlined />}
                    onSearch={handleSearchScript}
                    onChange={(e) => handleSearchScript(e.target.value)}
                  />
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    style={{ marginBottom: 16 }}
                    onClick={handleAddScript}
                  >
                    新建话术
                  </Button>
                </Col>
              </Row>
              <List
                dataSource={filteredScripts}
                renderItem={script => (
                  <List.Item
                    key={script.id}
                    onClick={() => setSelectedScript(script)}
                    style={{
                      cursor: 'pointer',
                      background: selectedScript?.id === script.id ? '#f0f2f5' : 'white',
                      padding: '12px',
                      borderRadius: '4px',
                      marginBottom: '8px'
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{script.title}</Text>
                          <Badge count={script.usage} style={{ backgroundColor: '#52c41a' }} />
                        </Space>
                      }
                      description={
                        <Space>
                          <Text type="secondary">{script.scenario}</Text>
                          {script.tags.map(tag => (
                            <Tag key={tag} color="blue">{tag}</Tag>
                          ))}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Col>
            
            <Col span={14}>
              {selectedScript ? (
                <Card
                  title={selectedScript.title}
                  extra={
                    <Space>
                      <Button
                        icon={<CopyOutlined />}
                        onClick={() => handleCopyScript(selectedScript.content)}
                      >
                        复制
                      </Button>
                      <Button icon={<EditOutlined />} onClick={() => handleEditScript(selectedScript)}>
                        编辑
                      </Button>
                    </Space>
                  }
                >
                  <Tag color="blue" style={{ marginBottom: 16 }}>{selectedScript.scenario}</Tag>
                  <Paragraph
                    style={{
                      fontSize: '15px',
                      lineHeight: '1.8',
                      background: '#f5f5f5',
                      padding: '16px',
                      borderRadius: '4px'
                    }}
                  >
                    {selectedScript.content}
                  </Paragraph>
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">使用次数：{selectedScript.usage}次</Text>
                  </div>
                </Card>
              ) : (
                <Card style={{ textAlign: 'center', padding: '40px' }}>
                  <Text type="secondary">请选择一个话术查看详情</Text>
                </Card>
              )}
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <PhoneOutlined />
              智能外呼
            </span>
          }
          key="call"
        >
          <Row gutter={16}>
            <Col span={8}>
              <Card title="待呼叫列表" size="small">
                <Checkbox.Group
                  style={{ width: '100%' }}
                  onChange={setSelectedCallRecipients}
                >
                  <List
                    dataSource={debtorList}
                    renderItem={debtor => (
                      <List.Item>
                        <Checkbox value={debtor.id}>
                          {debtor.name} - {debtor.phone}
                        </Checkbox>
                      </List.Item>
                    )}
                  />
                </Checkbox.Group>
                <div style={{ marginTop: 16 }}>
                  <Button 
                    type="primary" 
                    icon={<PhoneOutlined />} 
                    block
                    loading={callInProgress}
                    onClick={handleStartBatchCall}
                  >
                    {callInProgress ? '外呼进行中...' : '开始批量外呼'}
                  </Button>
                </div>
              </Card>
            </Col>
            
            <Col span={16}>
              <Card title="通话记录" size="small">
                <Table
                  columns={callColumns}
                  dataSource={callRecords}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <MessageOutlined />
              短信群发
            </span>
          }
          key="sms"
        >
          <Row gutter={16}>
            <Col span={16}>
              <Card title="短信模板">
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={smsTemplates}
                  renderItem={template => (
                    <List.Item>
                      <Card
                        size="small"
                        hoverable
                        onClick={() => setSelectedTemplate(template)}
                        style={{
                          borderColor: selectedTemplate?.id === template.id ? '#1890ff' : undefined
                        }}
                      >
                        <Card.Meta
                          title={template.name}
                          description={
                            <div>
                              <Paragraph ellipsis={{ rows: 2 }}>
                                {template.content}
                              </Paragraph>
                              <Tag color="blue">{template.type}</Tag>
                            </div>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col span={8}>
              <Card
                title="接收人"
                extra={
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => setSmsModalVisible(true)}
                    disabled={!selectedTemplate || selectedRecipients.length === 0}
                  >
                    发送
                  </Button>
                }
              >
                <Checkbox.Group
                  style={{ width: '100%' }}
                  onChange={setSelectedRecipients}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {debtorList.map(debtor => (
                      <Checkbox key={debtor.id} value={debtor.id}>
                        {debtor.name} - {debtor.phone}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
                
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    已选择 {selectedRecipients.length} 人
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <VideoCameraOutlined />
              在线调解室
            </span>
          }
          key="video"
        >
          <Card>
            <Row gutter={16}>
              <Col span={16}>
                <div
                  style={{
                    background: videoRoomActive ? '#000' : '#f0f0f0',
                    height: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    position: 'relative'
                  }}
                >
                  {videoRoomActive ? (
                    <div style={{ color: 'white', textAlign: 'center' }}>
                      <VideoCameraOutlined style={{ fontSize: 64, color: '#52c41a' }} />
                      <div style={{ marginTop: 16, fontSize: 18 }}>调解进行中...</div>
                      <div style={{ marginTop: 8, color: '#999' }}>
                        {cameraEnabled && '📹 摄像头已开启'} {screenSharing && '🖥️ 屏幕共享中'}
                      </div>
                    </div>
                  ) : (
                    <Space direction="vertical" align="center">
                      <VideoCameraOutlined style={{ fontSize: 48, color: '#999' }} />
                      <Title level={4} type="secondary">视频调解区域</Title>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<VideoCameraOutlined />}
                          onClick={handleStartVideoMediation}
                        >
                          发起视频调解
                        </Button>
                        <Button icon={<TeamOutlined />}>
                          邀请参与方
                        </Button>
                      </Space>
                    </Space>
                  )}
                </div>
              </Col>
              
              <Col span={8}>
                <Card title="调解室功能" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                      icon={<VideoCameraOutlined />} 
                      block
                      type={cameraEnabled ? 'primary' : 'default'}
                      onClick={handleToggleCamera}
                      disabled={!videoRoomActive}
                    >
                      {cameraEnabled ? '关闭摄像头' : '开启摄像头'}
                    </Button>
                    <Button 
                      icon={<MessageOutlined />} 
                      block
                      type={screenSharing ? 'primary' : 'default'}
                      onClick={handleToggleScreenShare}
                      disabled={!videoRoomActive}
                    >
                      {screenSharing ? '停止共享' : '屏幕共享'}
                    </Button>
                    <Button icon={<FileTextOutlined />} block disabled={!videoRoomActive}>
                      文档协作
                    </Button>
                    <Button icon={<EditOutlined />} block disabled={!videoRoomActive}>
                      电子签名
                    </Button>
                    <Button 
                      type="primary" 
                      danger 
                      block 
                      onClick={handleEndVideoMediation}
                      disabled={!videoRoomActive}
                    >
                      结束调解
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* 短信发送确认弹窗 */}
      <Modal
        title="发送短信确认"
        open={smsModalVisible}
        onCancel={() => setSmsModalVisible(false)}
        onOk={handleSendSms}
      >
        {selectedTemplate && (
          <Form form={form} layout="vertical">
            <Alert
              message="短信内容预览"
              description={selectedTemplate.content}
              type="info"
              style={{ marginBottom: 16 }}
            />
            
            {selectedTemplate.variables.map(variable => (
              <Form.Item
                key={variable}
                label={`变量：${variable}`}
                name={variable}
                rules={[{ required: true, message: `请输入${variable}` }]}
              >
                <Input placeholder={`请输入${variable}的值`} />
              </Form.Item>
            ))}
            
            <div>
              <Text type="secondary">
                将发送给 {selectedRecipients.length} 位接收人
              </Text>
            </div>
          </Form>
        )}
      </Modal>

      {/* 编辑话术弹窗 */}
      <Modal
        title="编辑话术"
        open={editScriptModalVisible}
        onCancel={() => setEditScriptModalVisible(false)}
        onOk={handleSaveScript}
        width={800}
      >
        <Form form={scriptForm} layout="vertical">
          <Form.Item
            label="话术标题"
            name="title"
            rules={[{ required: true, message: '请输入话术标题' }]}
          >
            <Input placeholder="请输入话术标题" />
          </Form.Item>
          
          <Form.Item
            label="适用场景"
            name="scenario"
            rules={[{ required: true, message: '请输入适用场景' }]}
          >
            <Input placeholder="请输入适用场景" />
          </Form.Item>
          
          <Form.Item
            label="话术内容"
            name="content"
            rules={[{ required: true, message: '请输入话术内容' }]}
          >
            <TextArea rows={6} placeholder="请输入话术内容" />
          </Form.Item>
          
          <Form.Item
            label="标签"
            name="tags"
            help="多个标签用逗号分隔"
          >
            <Input placeholder="如：开场, 友好, 首次" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新建话术弹窗 */}
      <Modal
        title="新建话术"
        open={newScriptModalVisible}
        onCancel={() => setNewScriptModalVisible(false)}
        onOk={handleSaveScript}
        width={800}
      >
        <Form form={scriptForm} layout="vertical">
          <Form.Item
            label="话术标题"
            name="title"
            rules={[{ required: true, message: '请输入话术标题' }]}
          >
            <Input placeholder="请输入话术标题" />
          </Form.Item>
          
          <Form.Item
            label="适用场景"
            name="scenario"
            rules={[{ required: true, message: '请输入适用场景' }]}
          >
            <Input placeholder="请输入适用场景" />
          </Form.Item>
          
          <Form.Item
            label="话术内容"
            name="content"
            rules={[{ required: true, message: '请输入话术内容' }]}
          >
            <TextArea rows={6} placeholder="请输入话术内容" />
          </Form.Item>
          
          <Form.Item
            label="标签"
            name="tags"
            help="多个标签用逗号分隔"
          >
            <Input placeholder="如：开场, 友好, 首次" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CommunicationToolbox;