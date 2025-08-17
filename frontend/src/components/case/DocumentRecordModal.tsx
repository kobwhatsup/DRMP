import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  Empty,
  Badge,
  Upload,
  message,
  Descriptions,
  Divider,
  Progress,
  List,
  Avatar
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  UploadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  LinkOutlined,
  CloudDownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { ColumnsType } from 'antd/es/table';
import './RecordModals.css';

const { Text, Title, Paragraph } = Typography;

interface DocumentRecord {
  id: string;
  caseId: string;
  caseNo: string;
  name: string;
  type: 'AGREEMENT' | 'NOTICE' | 'EVIDENCE' | 'REPORT' | 'LEGAL_DOC' | 'PAYMENT_PROOF' | 'OTHER';
  category: 'GENERATED' | 'UPLOADED' | 'RECEIVED';
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  description?: string;
  templateId?: string;
  templateName?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DELETED';
  version: number;
  tags: string[];
  isPublic: boolean;
  uploadedBy: string;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
  viewCount: number;
}

interface DocumentRecordModalProps {
  visible: boolean;
  onCancel: () => void;
  caseId: string;
  caseNo: string;
  expectedCount?: number; // 期望的文档数量，用于生成对应数量的模拟数据
}

const DocumentRecordModal: React.FC<DocumentRecordModalProps> = ({
  visible,
  onCancel,
  caseId,
  caseNo,
  expectedCount = 4
}) => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // 文档类型映射
  const documentTypeMap = {
    'AGREEMENT': { label: '协议文件', color: 'blue', icon: <FileTextOutlined /> },
    'NOTICE': { label: '通知书', color: 'orange', icon: <FilePdfOutlined /> },
    'EVIDENCE': { label: '证据材料', color: 'red', icon: <FileImageOutlined /> },
    'REPORT': { label: '报告文件', color: 'green', icon: <FileExcelOutlined /> },
    'LEGAL_DOC': { label: '法律文书', color: 'purple', icon: <FileWordOutlined /> },
    'PAYMENT_PROOF': { label: '付款凭证', color: 'cyan', icon: <FileImageOutlined /> },
    'OTHER': { label: '其他文件', color: 'default', icon: <FileUnknownOutlined /> }
  };

  // 文档来源映射
  const categoryMap = {
    'GENERATED': { label: '系统生成', color: 'blue' },
    'UPLOADED': { label: '手动上传', color: 'green' },
    'RECEIVED': { label: '接收文件', color: 'orange' }
  };

  // 状态映射
  const statusMap = {
    'PENDING': { label: '待处理', color: 'default', icon: <ClockCircleOutlined /> },
    'PROCESSING': { label: '处理中', color: 'processing', icon: <ClockCircleOutlined /> },
    'COMPLETED': { label: '已完成', color: 'success', icon: <CheckCircleOutlined /> },
    'FAILED': { label: '失败', color: 'error', icon: <ExclamationCircleOutlined /> },
    'DELETED': { label: '已删除', color: 'default', icon: <DeleteOutlined /> }
  };

  useEffect(() => {
    if (visible) {
      fetchDocuments();
    }
  }, [visible, caseId]);

  // 获取文档记录
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 文档模板数据
      const documentTemplates = [
        {
          name: '分期还款协议书',
          type: 'AGREEMENT' as const,
          category: 'GENERATED' as const,
          fileName: '分期还款协议书.pdf',
          fileType: 'application/pdf',
          description: '与债务人签署的分期还款协议',
          templateId: 'TPL001',
          templateName: '分期还款协议模板',
          tags: ['协议', '分期还款'],
          fileSize: 2048576
        },
        {
          name: '催收函',
          type: 'NOTICE' as const,
          category: 'GENERATED' as const,
          fileName: '催收函.pdf',
          fileType: 'application/pdf',
          description: '首次催收通知书',
          templateId: 'TPL002',
          templateName: '催收函模板',
          tags: ['催收函', '通知'],
          fileSize: 1536000
        },
        {
          name: '身份证复印件',
          type: 'EVIDENCE' as const,
          category: 'UPLOADED' as const,
          fileName: '身份证复印件.jpg',
          fileType: 'image/jpeg',
          description: '债务人身份证复印件',
          tags: ['身份证', '证据'],
          fileSize: 512000
        },
        {
          name: '还款凭证',
          type: 'PAYMENT_PROOF' as const,
          category: 'RECEIVED' as const,
          fileName: '转账凭证.png',
          fileType: 'image/png',
          description: '债务人提供的银行转账凭证',
          tags: ['还款', '转账凭证'],
          fileSize: 256000
        },
        {
          name: '律师函',
          type: 'LEGAL_DOC' as const,
          category: 'GENERATED' as const,
          fileName: '律师函.pdf',
          fileType: 'application/pdf',
          description: '法务部门发出的正式律师函',
          templateId: 'TPL003',
          templateName: '律师函模板',
          tags: ['律师函', '法律文书'],
          fileSize: 1800000
        },
        {
          name: '收入证明',
          type: 'EVIDENCE' as const,
          category: 'UPLOADED' as const,
          fileName: '收入证明.pdf',
          fileType: 'application/pdf',
          description: '债务人工作单位出具的收入证明',
          tags: ['收入证明', '财务状况'],
          fileSize: 890000
        },
        {
          name: '调解协议',
          type: 'AGREEMENT' as const,
          category: 'GENERATED' as const,
          fileName: '调解协议.pdf',
          fileType: 'application/pdf',
          description: '经调解中心调解达成的协议',
          templateId: 'TPL004',
          templateName: '调解协议模板',
          tags: ['调解', '协议'],
          fileSize: 1200000
        },
        {
          name: '银行流水',
          type: 'EVIDENCE' as const,
          category: 'RECEIVED' as const,
          fileName: '银行流水.pdf',
          fileType: 'application/pdf',
          description: '债务人提供的近3个月银行流水',
          tags: ['银行流水', '财务证明'],
          fileSize: 1500000
        },
        {
          name: '和解协议',
          type: 'AGREEMENT' as const,
          category: 'GENERATED' as const,
          fileName: '和解协议.pdf',
          fileType: 'application/pdf',
          description: '双方达成的和解协议书',
          templateId: 'TPL005',
          templateName: '和解协议模板',
          tags: ['和解', '协议'],
          fileSize: 980000
        },
        {
          name: '房产证明',
          type: 'EVIDENCE' as const,
          category: 'UPLOADED' as const,
          fileName: '房产证明.jpg',
          fileType: 'image/jpeg',
          description: '债务人名下房产的证明文件',
          tags: ['房产', '资产证明'],
          fileSize: 650000
        }
      ];

      // 根据expectedCount生成对应数量的文档
      const mockDocuments: DocumentRecord[] = [];
      for (let i = 0; i < expectedCount; i++) {
        const template = documentTemplates[i % documentTemplates.length];
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        const status = Math.random() > 0.1 ? 'COMPLETED' : 'PROCESSING';
        
        mockDocuments.push({
          id: `DOC${(i + 1).toString().padStart(3, '0')}`,
          caseId,
          caseNo,
          name: `${template.name}${i >= documentTemplates.length ? ` (${Math.floor(i / documentTemplates.length) + 1})` : ''}`,
          type: template.type,
          category: template.category,
          fileName: `${template.fileName.split('.')[0]}_${caseNo}${i >= documentTemplates.length ? `_${Math.floor(i / documentTemplates.length) + 1}` : ''}.${template.fileName.split('.')[1]}`,
          fileSize: template.fileSize + Math.floor(Math.random() * 100000),
          fileType: template.fileType,
          fileUrl: `/api/files/doc${(i + 1).toString().padStart(3, '0')}.${template.fileName.split('.')[1]}`,
          description: template.description,
          templateId: template.templateId,
          templateName: template.templateName,
          status,
          version: 1,
          tags: template.tags,
          isPublic: false,
          uploadedBy: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
          uploadedById: `USER${(Math.floor(Math.random() * 4) + 1).toString().padStart(3, '0')}`,
          createdAt: moment().subtract(daysAgo, 'days').subtract(Math.floor(Math.random() * 24), 'hours').toISOString(),
          updatedAt: moment().subtract(Math.floor(daysAgo / 2), 'days').subtract(Math.floor(Math.random() * 12), 'hours').toISOString(),
          downloadCount: Math.floor(Math.random() * 20),
          viewCount: Math.floor(Math.random() * 50) + 5
        });
      }

      // 按创建时间倒序排列
      mockDocuments.sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());
      
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('获取文档记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取文件图标
  const getFileIcon = (fileType: string, size = 16) => {
    if (fileType.includes('pdf')) return <FilePdfOutlined style={{ fontSize: size, color: '#ff4d4f' }} />;
    if (fileType.includes('word') || fileType.includes('msword')) return <FileWordOutlined style={{ fontSize: size, color: '#1890ff' }} />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileExcelOutlined style={{ fontSize: size, color: '#52c41a' }} />;
    if (fileType.includes('image')) return <FileImageOutlined style={{ fontSize: size, color: '#faad14' }} />;
    return <FileUnknownOutlined style={{ fontSize: size, color: '#8c8c8c' }} />;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 查看文档详情
  const handleViewDetail = (document: DocumentRecord) => {
    setSelectedDocument(document);
    setDetailVisible(true);
  };

  // 下载文档
  const handleDownload = (document: DocumentRecord) => {
    message.info(`正在下载文档：${document.name}`);
    // 这里实现实际的下载逻辑
  };

  // 预览文档
  const handlePreview = (document: DocumentRecord) => {
    if (document.fileType.includes('image')) {
      // 图片预览
      const imgWindow = window.open('', '_blank');
      imgWindow?.document.write(`<img src="${document.fileUrl}" style="width: 100%; height: auto;" />`);
    } else {
      // 其他文件类型预览
      window.open(document.fileUrl, '_blank');
    }
  };

  // 删除文档
  const handleDelete = (document: DocumentRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除文档"${document.name}"吗？`,
      onOk: () => {
        message.success('文档删除成功');
        fetchDocuments();
      }
    });
  };

  // 表格列定义
  const columns: ColumnsType<DocumentRecord> = [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      width: fullscreen ? 300 : 250,
      ellipsis: {
        showTitle: false,
      },
      render: (name: string, record: DocumentRecord) => (
        <Space>
          {getFileIcon(record.fileType)}
          <Tooltip title={name}>
            <Button 
              type="link" 
              onClick={() => handleViewDetail(record)}
              style={{ padding: 0, height: 'auto', maxWidth: fullscreen ? 250 : 200 }}
            >
              <Text ellipsis>{name}</Text>
            </Button>
          </Tooltip>
        </Space>
      )
    },
    {
      title: '文档类型',
      dataIndex: 'type',
      key: 'type',
      width: fullscreen ? 140 : 120,
      render: (type: keyof typeof documentTypeMap) => {
        const typeInfo = documentTypeMap[type];
        return (
          <Space>
            {typeInfo.icon}
            <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
          </Space>
        );
      }
    },
    {
      title: '来源',
      dataIndex: 'category',
      key: 'category',
      width: fullscreen ? 110 : 100,
      render: (category: keyof typeof categoryMap) => {
        const categoryInfo = categoryMap[category];
        return <Tag color={categoryInfo.color}>{categoryInfo.label}</Tag>;
      }
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: fullscreen ? 110 : 100,
      render: (size: number) => formatFileSize(size)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: fullscreen ? 120 : 100,
      render: (status: keyof typeof statusMap) => {
        const statusInfo = statusMap[status];
        return (
          <Space>
            {statusInfo.icon}
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
          </Space>
        );
      }
    },
    {
      title: '上传人',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      width: fullscreen ? 110 : 100
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: fullscreen ? 150 : 130,
      render: (time: string) => moment(time).format('MM-DD HH:mm')
    },
    {
      title: '查看/下载',
      key: 'stats',
      width: fullscreen ? 120 : 100,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>查看: {record.viewCount}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>下载: {record.downloadCount}</Text>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: fullscreen ? 140 : 120,
      fixed: fullscreen ? 'right' : false,
      render: (_, record) => (
        <Space>
          <Tooltip title="预览">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button 
              type="link" 
              icon={<DownloadOutlined />} 
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Tooltip title="详情">
            <Button 
              type="link" 
              icon={<FileTextOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 按类型分组显示
  const renderDocumentsByType = () => {
    const groupedDocs = documents.reduce((groups, doc) => {
      const type = doc.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(doc);
      return groups;
    }, {} as Record<string, DocumentRecord[]>);

    return Object.entries(groupedDocs).map(([type, docs]) => {
      const typeInfo = documentTypeMap[type as keyof typeof documentTypeMap];
      return (
        <Card 
          key={type}
          title={
            <Space>
              {typeInfo.icon}
              <span>{typeInfo.label}</span>
              <Badge count={docs.length} />
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <List
            dataSource={docs}
            renderItem={doc => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    icon={<EyeOutlined />} 
                    onClick={() => handlePreview(doc)}
                  >预览</Button>,
                  <Button 
                    type="link" 
                    icon={<DownloadOutlined />} 
                    onClick={() => handleDownload(doc)}
                  >下载</Button>
                ]}
              >
                <List.Item.Meta
                  avatar={getFileIcon(doc.fileType, 24)}
                  title={
                    <Space>
                      <Button 
                        type="link" 
                        onClick={() => handleViewDetail(doc)}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        {doc.name}
                      </Button>
                      <Tag color={categoryMap[doc.category].color}>
                        {categoryMap[doc.category].label}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">{doc.description}</Text>
                      <Space>
                        <Text type="secondary">{formatFileSize(doc.fileSize)}</Text>
                        <Text type="secondary">·</Text>
                        <Text type="secondary">{moment(doc.createdAt).format('MM-DD HH:mm')}</Text>
                        <Text type="secondary">·</Text>
                        <Text type="secondary">{doc.uploadedBy}</Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      );
    });
  };

  return (
    <>
      {/* 主弹窗 */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>文档记录</span>
            <Tag color="blue">{caseNo}</Tag>
            <Badge count={documents.length} showZero />
          </Space>
        }
        visible={visible}
        onCancel={onCancel}
        footer={[
          <Button key="fullscreen" icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? '退出全屏' : '全屏显示'}
          </Button>,
          <Button key="upload" type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
            上传文档
          </Button>,
          <Button key="close" onClick={onCancel}>
            关闭
          </Button>
        ]}
        width={fullscreen ? '95vw' : 1600}
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
        {documents.length > 0 ? (
          <Row gutter={fullscreen ? 32 : 24}>
            <Col span={fullscreen ? 18 : 16}>
              <Card title="文档列表" size="small">
                <Table
                  columns={columns}
                  dataSource={documents}
                  rowKey="id"
                  loading={loading}
                  size="small"
                  scroll={{ x: fullscreen ? 1400 : 1200 }}
                  pagination={{
                    pageSize: fullscreen ? 15 : 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 个文档`,
                    pageSizeOptions: ['10', '15', '20', '50']
                  }}
                />
              </Card>
            </Col>
            <Col span={fullscreen ? 6 : 8}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {renderDocumentsByType()}
              </Space>
            </Col>
          </Row>
        ) : (
          <Empty 
            description="暂无文档记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Modal>

      {/* 文档详情弹窗 */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>文档详情</span>
          </Space>
        }
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="preview" icon={<EyeOutlined />} onClick={() => selectedDocument && handlePreview(selectedDocument)}>
            预览
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => selectedDocument && handleDownload(selectedDocument)}>
            下载
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedDocument && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* 基本信息 */}
            <Card title="基本信息" size="small">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="文档名称" span={2}>
                  <Space>
                    {getFileIcon(selectedDocument.fileType, 20)}
                    <Text strong>{selectedDocument.name}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="文档类型">
                  <Space>
                    {documentTypeMap[selectedDocument.type].icon}
                    <Tag color={documentTypeMap[selectedDocument.type].color}>
                      {documentTypeMap[selectedDocument.type].label}
                    </Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="来源">
                  <Tag color={categoryMap[selectedDocument.category].color}>
                    {categoryMap[selectedDocument.category].label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Space>
                    {statusMap[selectedDocument.status].icon}
                    <Tag color={statusMap[selectedDocument.status].color}>
                      {statusMap[selectedDocument.status].label}
                    </Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="版本">v{selectedDocument.version}</Descriptions.Item>
                <Descriptions.Item label="文件名">{selectedDocument.fileName}</Descriptions.Item>
                <Descriptions.Item label="文件大小">{formatFileSize(selectedDocument.fileSize)}</Descriptions.Item>
                <Descriptions.Item label="上传人">{selectedDocument.uploadedBy}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {moment(selectedDocument.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 统计信息 */}
            <Card title="使用统计" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      <Text type="secondary">查看次数</Text>
                      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{selectedDocument.viewCount}</Text>
                    </Space>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      <Text type="secondary">下载次数</Text>
                      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{selectedDocument.downloadCount}</Text>
                    </Space>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      <Text type="secondary">文档评级</Text>
                      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>★★★★☆</Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* 描述和标签 */}
            <Card title="详细描述" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {selectedDocument.description && (
                  <Paragraph>{selectedDocument.description}</Paragraph>
                )}
                {selectedDocument.tags.length > 0 && (
                  <Space>
                    <Text strong>标签：</Text>
                    {selectedDocument.tags.map(tag => (
                      <Tag key={tag} color="blue">{tag}</Tag>
                    ))}
                  </Space>
                )}
                {selectedDocument.templateName && (
                  <Space>
                    <Text strong>生成模板：</Text>
                    <Text>{selectedDocument.templateName}</Text>
                  </Space>
                )}
              </Space>
            </Card>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default DocumentRecordModal;