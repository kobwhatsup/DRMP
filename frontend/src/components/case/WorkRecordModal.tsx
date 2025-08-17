import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Descriptions,
  Card,
  Row,
  Col,
  Tooltip,
  Empty,
  Badge,
  Timeline,
  Alert,
  Divider
} from 'antd';
import {
  HistoryOutlined,
  PhoneOutlined,
  MessageOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { ColumnsType } from 'antd/es/table';
import './RecordModals.css';

const { Text, Title, Paragraph } = Typography;

interface WorkRecord {
  id: string;
  caseId: string;
  caseNo: string;
  type: 'CONTACT' | 'VISIT' | 'NEGOTIATION' | 'PAYMENT' | 'LEGAL' | 'OTHER';
  title: string;
  description: string;
  result: string;
  contactMethod?: 'PHONE' | 'SMS' | 'EMAIL' | 'VISIT' | 'WECHAT';
  contactResult?: 'SUCCESS' | 'FAILED' | 'NO_ANSWER' | 'BUSY' | 'REFUSED';
  nextAction?: string;
  nextActionTime?: string;
  attachments?: string[];
  handler: string;
  handlerId: string;
  duration?: number; // 分钟
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

interface WorkRecordModalProps {
  visible: boolean;
  onCancel: () => void;
  caseId: string;
  caseNo: string;
  expectedCount?: number; // 期望的记录数量，用于生成对应数量的模拟数据
}

const WorkRecordModal: React.FC<WorkRecordModalProps> = ({
  visible,
  onCancel,
  caseId,
  caseNo,
  expectedCount = 3
}) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WorkRecord | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // 记录类型映射
  const recordTypeMap = {
    'CONTACT': { label: '联系记录', color: 'blue', icon: <PhoneOutlined /> },
    'VISIT': { label: '外访记录', color: 'green', icon: <UserOutlined /> },
    'NEGOTIATION': { label: '协商记录', color: 'orange', icon: <MessageOutlined /> },
    'PAYMENT': { label: '还款记录', color: 'cyan', icon: <CheckCircleOutlined /> },
    'LEGAL': { label: '法律行动', color: 'red', icon: <ExclamationCircleOutlined /> },
    'OTHER': { label: '其他记录', color: 'default', icon: <FileTextOutlined /> }
  };

  // 联系方式映射
  const contactMethodMap = {
    'PHONE': { label: '电话', icon: <PhoneOutlined /> },
    'SMS': { label: '短信', icon: <MessageOutlined /> },
    'EMAIL': { label: '邮件', icon: <FileTextOutlined /> },
    'VISIT': { label: '外访', icon: <UserOutlined /> },
    'WECHAT': { label: '微信', icon: <MessageOutlined /> }
  };

  // 联系结果映射
  const contactResultMap = {
    'SUCCESS': { label: '成功联系', color: 'success' },
    'FAILED': { label: '联系失败', color: 'error' },
    'NO_ANSWER': { label: '无人接听', color: 'warning' },
    'BUSY': { label: '占线', color: 'warning' },
    'REFUSED': { label: '拒接', color: 'error' }
  };

  // 状态映射
  const statusMap = {
    'PENDING': { label: '待处理', color: 'default' },
    'IN_PROGRESS': { label: '进行中', color: 'processing' },
    'COMPLETED': { label: '已完成', color: 'success' },
    'CANCELLED': { label: '已取消', color: 'error' }
  };

  useEffect(() => {
    if (visible) {
      fetchWorkRecords();
    }
  }, [visible, caseId]);

  // 获取作业记录
  const fetchWorkRecords = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 记录模板数据
      const recordTemplates = [
        {
          type: 'CONTACT' as const,
          title: '电话联系债务人',
          description: '拨打债务人手机号码，告知欠款情况，了解还款意愿',
          result: '债务人承认欠款，表示目前资金紧张，希望能分期还款',
          contactMethod: 'PHONE' as const,
          contactResult: 'SUCCESS' as const,
          nextAction: '制定分期还款计划',
          duration: 15
        },
        {
          type: 'NEGOTIATION' as const,
          title: '协商分期还款方案',
          description: '与债务人协商具体的分期还款计划，讨论每月还款金额和期限',
          result: '达成初步协议：每月还款2000元，分12期还清',
          contactMethod: 'PHONE' as const,
          contactResult: 'SUCCESS' as const,
          nextAction: '发送分期还款协议书',
          duration: 25
        },
        {
          type: 'CONTACT' as const,
          title: '跟进协议签署情况',
          description: '联系债务人确认是否收到分期还款协议，督促尽快签署',
          result: '债务人表示已收到协议，正在审阅中',
          contactMethod: 'PHONE' as const,
          contactResult: 'SUCCESS' as const,
          nextAction: '再次跟进协议签署情况',
          duration: 8
        },
        {
          type: 'VISIT' as const,
          title: '上门拜访债务人',
          description: '前往债务人居住地址进行实地拜访，了解实际情况',
          result: '见到债务人本人，确认居住地址真实有效',
          contactMethod: 'VISIT' as const,
          contactResult: 'SUCCESS' as const,
          nextAction: '安排后续沟通计划',
          duration: 120
        },
        {
          type: 'PAYMENT' as const,
          title: '确认还款记录',
          description: '核实债务人提供的银行转账凭证，确认还款金额',
          result: '确认收到首期还款1000元，记录入账',
          nextAction: '发送还款确认函',
          duration: 10
        },
        {
          type: 'CONTACT' as const,
          title: '催收电话联系',
          description: '债务人逾期未还款，进行催收电话联系',
          result: '债务人表示下周内会安排还款',
          contactMethod: 'PHONE' as const,
          contactResult: 'SUCCESS' as const,
          nextAction: '一周后再次跟进',
          duration: 12
        },
        {
          type: 'LEGAL' as const,
          title: '法务部门咨询',
          description: '就该案件的法律风险和后续处理方案咨询法务部门',
          result: '法务建议可继续协商，暂不启动诉讼程序',
          nextAction: '继续协商谈判',
          duration: 30
        },
        {
          type: 'CONTACT' as const,
          title: '短信通知发送',
          description: '向债务人发送还款提醒短信，告知逾期情况',
          result: '短信发送成功，债务人暂无回复',
          contactMethod: 'SMS' as const,
          contactResult: 'SUCCESS' as const,
          nextAction: '等待债务人回复',
          duration: 2
        },
        {
          type: 'NEGOTIATION' as const,
          title: '再次协商还款计划',
          description: '债务人主动联系，希望重新协商还款计划',
          result: '重新制定还款计划：延长至18个月',
          contactMethod: 'PHONE' as const,
          contactResult: 'SUCCESS' as const,
          nextAction: '准备新的还款协议',
          duration: 35
        },
        {
          type: 'CONTACT' as const,
          title: '确认联系方式',
          description: '验证债务人提供的新联系方式是否有效',
          result: '新手机号码有效，已更新联系信息',
          contactMethod: 'PHONE' as const,
          contactResult: 'SUCCESS' as const,
          nextAction: '使用新号码进行后续联系',
          duration: 5
        },
        {
          type: 'OTHER' as const,
          title: '案件资料整理',
          description: '整理和归档该案件的所有相关资料和文档',
          result: '完成资料整理，建立完整档案',
          nextAction: '定期更新案件档案',
          duration: 45
        },
        {
          type: 'VISIT' as const,
          title: '工作地点走访',
          description: '前往债务人工作单位了解其工作状况',
          result: '确认债务人仍在该单位正常工作',
          contactMethod: 'VISIT' as const,
          contactResult: 'SUCCESS' as const,
          nextAction: '制定基于收入的还款方案',
          duration: 90
        },
        {
          type: 'PAYMENT' as const,
          title: '部分还款确认',
          description: '债务人进行了部分还款，需要确认和记录',
          result: '确认收到500元部分还款',
          nextAction: '更新账务记录',
          duration: 8
        },
        {
          type: 'CONTACT' as const,
          title: '节日关怀电话',
          description: '节假日期间向债务人表达关怀，维护良好关系',
          result: '债务人表示感谢，承诺节后主动联系',
          contactMethod: 'PHONE' as const,
          contactResult: 'SUCCESS' as const,
          nextAction: '节后主动跟进',
          duration: 6
        },
        {
          type: 'LEGAL' as const,
          title: '发送律师函',
          description: '经协商无果，向债务人发送律师函',
          result: '律师函已送达，债务人签收',
          nextAction: '等待债务人回应',
          duration: 15
        }
      ];

      // 根据expectedCount生成对应数量的记录
      const mockRecords: WorkRecord[] = [];
      for (let i = 0; i < expectedCount; i++) {
        const template = recordTemplates[i % recordTemplates.length];
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        const status = i < expectedCount - 2 ? 'COMPLETED' : (Math.random() > 0.5 ? 'IN_PROGRESS' : 'PENDING');
        
        mockRecords.push({
          id: `WR${(i + 1).toString().padStart(3, '0')}`,
          caseId,
          caseNo,
          type: template.type,
          title: `${template.title}${i > recordTemplates.length - 1 ? ` (${Math.floor(i / recordTemplates.length) + 1})` : ''}`,
          description: template.description,
          result: template.result,
          contactMethod: template.contactMethod,
          contactResult: template.contactResult,
          nextAction: template.nextAction,
          nextActionTime: status === 'COMPLETED' ? undefined : moment().add(Math.floor(Math.random() * 7) + 1, 'days').toISOString(),
          handler: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
          handlerId: `USER${(Math.floor(Math.random() * 4) + 1).toString().padStart(3, '0')}`,
          duration: template.duration + Math.floor(Math.random() * 10),
          status,
          createdAt: moment().subtract(daysAgo, 'days').subtract(Math.floor(Math.random() * 24), 'hours').toISOString(),
          updatedAt: moment().subtract(Math.floor(daysAgo / 2), 'days').subtract(Math.floor(Math.random() * 12), 'hours').toISOString()
        });
      }

      // 按创建时间倒序排列
      mockRecords.sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());
      
      setRecords(mockRecords);
    } catch (error) {
      console.error('获取作业记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 查看记录详情
  const handleViewDetail = (record: WorkRecord) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  // 表格列定义
  const columns: ColumnsType<WorkRecord> = [
    {
      title: '记录类型',
      dataIndex: 'type',
      key: 'type',
      width: fullscreen ? 140 : 120,
      render: (type: keyof typeof recordTypeMap) => {
        const typeInfo = recordTypeMap[type];
        return (
          <Space>
            {typeInfo.icon}
            <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
          </Space>
        );
      }
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: fullscreen ? 280 : 220,
      ellipsis: {
        showTitle: false,
      },
      render: (title: string, record: WorkRecord) => (
        <Tooltip title={title}>
          <Button 
            type="link" 
            onClick={() => handleViewDetail(record)}
            style={{ padding: 0, height: 'auto', maxWidth: fullscreen ? 260 : 200 }}
          >
            <Text ellipsis>{title}</Text>
          </Button>
        </Tooltip>
      )
    },
    {
      title: '联系方式',
      dataIndex: 'contactMethod',
      key: 'contactMethod',
      width: fullscreen ? 120 : 100,
      render: (method: keyof typeof contactMethodMap) => {
        if (!method) return '-';
        const methodInfo = contactMethodMap[method];
        return (
          <Space>
            {methodInfo.icon}
            <Text>{methodInfo.label}</Text>
          </Space>
        );
      }
    },
    {
      title: '结果',
      dataIndex: 'contactResult',
      key: 'contactResult',
      width: fullscreen ? 120 : 100,
      render: (result: keyof typeof contactResultMap) => {
        if (!result) return '-';
        const resultInfo = contactResultMap[result];
        return <Tag color={resultInfo.color}>{resultInfo.label}</Tag>;
      }
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: fullscreen ? 110 : 100
    },
    {
      title: '用时',
      dataIndex: 'duration',
      key: 'duration',
      width: fullscreen ? 90 : 80,
      render: (duration: number) => duration ? `${duration}分钟` : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: fullscreen ? 110 : 100,
      render: (status: keyof typeof statusMap) => {
        const statusInfo = statusMap[status];
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: fullscreen ? 160 : 150,
      render: (time: string) => moment(time).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: fullscreen ? 100 : 80,
      fixed: fullscreen ? 'right' : false,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      )
    }
  ];

  // 渲染时间线
  const renderTimeline = () => {
    if (records.length === 0) return null;

    const sortedRecords = [...records].sort((a, b) => 
      moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
    );

    return (
      <Timeline>
        {sortedRecords.map(record => {
          const typeInfo = recordTypeMap[record.type];
          return (
            <Timeline.Item
              key={record.id}
              dot={
                <Badge 
                  status={record.status === 'COMPLETED' ? 'success' : 'processing'} 
                  style={{ fontSize: 16 }}
                />
              }
            >
              <Card size="small" style={{ marginBottom: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Space>
                    {typeInfo.icon}
                    <Text strong>{record.title}</Text>
                    <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                    <Text type="secondary">
                      {moment(record.createdAt).format('MM-DD HH:mm')}
                    </Text>
                  </Space>
                  <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                    {record.description}
                  </Paragraph>
                  <Space>
                    <Text type="secondary">处理人：{record.handler}</Text>
                    {record.duration && (
                      <Text type="secondary">用时：{record.duration}分钟</Text>
                    )}
                  </Space>
                </Space>
              </Card>
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  };

  return (
    <>
      {/* 主弹窗 */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>作业记录</span>
            <Tag color="blue">{caseNo}</Tag>
            <Badge count={records.length} showZero />
          </Space>
        }
        visible={visible}
        onCancel={onCancel}
        footer={[
          <Button key="fullscreen" icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? '退出全屏' : '全屏显示'}
          </Button>,
          <Button key="close" onClick={onCancel}>
            关闭
          </Button>
        ]}
        width={fullscreen ? '95vw' : 1500}
        centered
        bodyStyle={{ 
          maxHeight: fullscreen ? 'calc(90vh - 110px)' : 'calc(80vh - 110px)', 
          overflowY: 'auto',
          padding: fullscreen ? '20px 32px' : '16px 24px'
        }}
        style={fullscreen ? { top: 20 } : {}}
        className={`record-modal-responsive ${fullscreen ? 'record-modal-fullscreen' : ''}`}
        wrapClassName={fullscreen ? 'record-modal-fullscreen-overlay' : ''}
      >
        {records.length > 0 ? (
          <Row gutter={fullscreen ? 32 : 24}>
            <Col span={fullscreen ? 18 : 16}>
              <Card title="记录列表" size="small">
                <Table
                  columns={columns}
                  dataSource={records}
                  rowKey="id"
                  loading={loading}
                  size="small"
                  scroll={{ x: fullscreen ? 1300 : 1100 }}
                  pagination={{
                    pageSize: fullscreen ? 15 : 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    pageSizeOptions: ['10', '15', '20', '50']
                  }}
                />
              </Card>
            </Col>
            <Col span={fullscreen ? 6 : 8}>
              <Card title="时间线" size="small">
                {renderTimeline()}
              </Card>
            </Col>
          </Row>
        ) : (
          <Empty 
            description="暂无作业记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Modal>

      {/* 记录详情弹窗 */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>记录详情</span>
          </Space>
        }
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* 基本信息 */}
            <Card title="基本信息" size="small">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="记录类型">
                  <Space>
                    {recordTypeMap[selectedRecord.type].icon}
                    <Tag color={recordTypeMap[selectedRecord.type].color}>
                      {recordTypeMap[selectedRecord.type].label}
                    </Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={statusMap[selectedRecord.status].color}>
                    {statusMap[selectedRecord.status].label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="案件编号">{selectedRecord.caseNo}</Descriptions.Item>
                <Descriptions.Item label="处理人">{selectedRecord.handler}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {moment(selectedRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="用时">
                  {selectedRecord.duration ? `${selectedRecord.duration}分钟` : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 联系信息 */}
            {selectedRecord.contactMethod && (
              <Card title="联系信息" size="small">
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="联系方式">
                    <Space>
                      {contactMethodMap[selectedRecord.contactMethod].icon}
                      {contactMethodMap[selectedRecord.contactMethod].label}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="联系结果">
                    {selectedRecord.contactResult && (
                      <Tag color={contactResultMap[selectedRecord.contactResult].color}>
                        {contactResultMap[selectedRecord.contactResult].label}
                      </Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* 详细内容 */}
            <Card title="详细内容" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>标题：</Text>
                  <Text>{selectedRecord.title}</Text>
                </div>
                <div>
                  <Text strong>描述：</Text>
                  <Paragraph>{selectedRecord.description}</Paragraph>
                </div>
                <div>
                  <Text strong>处理结果：</Text>
                  <Paragraph>{selectedRecord.result}</Paragraph>
                </div>
                {selectedRecord.nextAction && (
                  <div>
                    <Text strong>下一步行动：</Text>
                    <Paragraph>{selectedRecord.nextAction}</Paragraph>
                  </div>
                )}
                {selectedRecord.nextActionTime && (
                  <div>
                    <Text strong>下次行动时间：</Text>
                    <Text>{moment(selectedRecord.nextActionTime).format('YYYY-MM-DD HH:mm')}</Text>
                  </div>
                )}
              </Space>
            </Card>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default WorkRecordModal;