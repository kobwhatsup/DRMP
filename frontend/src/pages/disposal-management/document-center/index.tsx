import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Upload,
  Modal,
  Form,
  Input,
  Select,
  Tree,
  Tabs,
  Tag,
  Progress,
  Statistic,
  Drawer,
  List,
  Avatar,
  Divider,
  Tooltip,
  message
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderAddOutlined,
  FileAddOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  CloudUploadOutlined,
  TeamOutlined,
  HistoryOutlined,
  StarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

interface DocumentInfo {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  size?: number;
  parentId: string | null;
  path: string;
  creator: string;
  createTime: string;
  updateTime: string;
  tags: string[];
  description?: string;
  version: number;
  status: 'draft' | 'reviewing' | 'approved' | 'archived';
  isShared: boolean;
  shareUsers?: string[];
  downloadCount: number;
  isStarred: boolean;
}

interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fileUrl: string;
  useCount: number;
}

interface ShareRecord {
  id: string;
  documentId: string;
  documentName: string;
  sharedTo: string;
  sharedBy: string;
  shareTime: string;
  permissions: string[];
  status: 'active' | 'expired' | 'revoked';
}

const DocumentCenter: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>(['根目录']);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState('documents');
  const [documentStats, setDocumentStats] = useState({
    totalFiles: 2847,
    totalFolders: 156,
    totalSize: '15.6 GB',
    sharedFiles: 423
  });
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [shareRecords, setShareRecords] = useState<ShareRecord[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);

  useEffect(() => {
    loadDocuments();
    loadTemplates();
    loadShareRecords();
  }, []);

  const loadDocuments = async () => {
    // 模拟文档数据
    const mockDocuments: DocumentInfo[] = [
      {
        id: '1',
        name: '诉讼材料',
        type: 'folder',
        parentId: null,
        path: '/诉讼材料',
        creator: '张律师',
        createTime: '2024-01-15 09:00:00',
        updateTime: '2024-01-15 09:00:00',
        tags: ['诉讼', '重要'],
        version: 1,
        status: 'approved',
        isShared: false,
        downloadCount: 0,
        isStarred: true
      },
      {
        id: '2',
        name: '调解协议',
        type: 'folder',
        parentId: null,
        path: '/调解协议',
        creator: '李调解员',
        createTime: '2024-01-15 10:00:00',
        updateTime: '2024-01-15 10:00:00',
        tags: ['调解', '协议'],
        version: 1,
        status: 'approved',
        isShared: true,
        shareUsers: ['王律师', '赵助理'],
        downloadCount: 12,
        isStarred: false
      },
      {
        id: '3',
        name: '起诉书模板.docx',
        type: 'file',
        fileType: 'docx',
        size: 2048000,
        parentId: '1',
        path: '/诉讼材料/起诉书模板.docx',
        creator: '张律师',
        createTime: '2024-01-15 11:00:00',
        updateTime: '2024-01-15 11:00:00',
        tags: ['模板', '起诉书'],
        description: '标准起诉书模板，适用于民事案件',
        version: 3,
        status: 'approved',
        isShared: true,
        shareUsers: ['团队成员'],
        downloadCount: 85,
        isStarred: true
      },
      {
        id: '4',
        name: '案件证据清单.xlsx',
        type: 'file',
        fileType: 'xlsx',
        size: 1024000,
        parentId: '1',
        path: '/诉讼材料/案件证据清单.xlsx',
        creator: '王助理',
        createTime: '2024-01-16 09:30:00',
        updateTime: '2024-01-16 09:30:00',
        tags: ['证据', '清单'],
        description: '标准化证据清单模板',
        version: 1,
        status: 'reviewing',
        isShared: false,
        downloadCount: 23,
        isStarred: false
      }
    ];
    setDocuments(mockDocuments);
  };

  const loadTemplates = async () => {
    const mockTemplates: DocumentTemplate[] = [
      {
        id: '1',
        name: '民事起诉书',
        category: '诉讼文书',
        description: '标准民事起诉书模板',
        fileUrl: '/templates/civil_complaint.docx',
        useCount: 156
      },
      {
        id: '2',
        name: '调解协议书',
        category: '调解文书',
        description: '标准调解协议书模板',
        fileUrl: '/templates/mediation_agreement.docx',
        useCount: 89
      },
      {
        id: '3',
        name: '执行申请书',
        category: '执行文书',
        description: '标准执行申请书模板',
        fileUrl: '/templates/execution_application.docx',
        useCount: 67
      }
    ];
    setTemplates(mockTemplates);
  };

  const loadShareRecords = async () => {
    const mockRecords: ShareRecord[] = [
      {
        id: '1',
        documentId: '3',
        documentName: '起诉书模板.docx',
        sharedTo: '王律师',
        sharedBy: '张律师',
        shareTime: '2024-01-16 14:30:00',
        permissions: ['view', 'download'],
        status: 'active'
      },
      {
        id: '2',
        documentId: '4',
        documentName: '案件证据清单.xlsx',
        sharedTo: '李助理',
        sharedBy: '王助理',
        shareTime: '2024-01-16 15:00:00',
        permissions: ['view', 'edit'],
        status: 'active'
      }
    ];
    setShareRecords(mockRecords);
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'docx':
      case 'doc':
        return <FileWordOutlined style={{ color: '#1890ff' }} />;
      case 'xlsx':
      case 'xls':
        return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'jpg':
      case 'png':
      case 'gif':
        return <FileImageOutlined style={{ color: '#722ed1' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'reviewing': return 'processing';
      case 'approved': return 'success';
      case 'archived': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'reviewing': return '审核中';
      case 'approved': return '已批准';
      case 'archived': return '已归档';
      default: return status;
    }
  };

  const handleUpload = (file: any) => {
    message.success(`${file.name} 上传成功`);
    setUploadModalVisible(false);
    loadDocuments();
  };

  const handleShare = (documentId: string) => {
    setShareModalVisible(true);
  };

  const handleDownload = (document: DocumentInfo) => {
    message.success(`开始下载 ${document.name}`);
  };

  const handleStar = (documentId: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, isStarred: !doc.isStarred }
          : doc
      )
    );
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: DocumentInfo) => (
        <Space>
          {record.type === 'folder' ? (
            <FolderOutlined style={{ color: '#faad14' }} />
          ) : (
            getFileIcon(record.fileType)
          )}
          <span 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDocument(record);
              setDetailDrawerVisible(true);
            }}
          >
            {name}
          </span>
          {record.isStarred && (
            <StarOutlined style={{ color: '#faad14' }} />
          )}
          {record.isShared && (
            <ShareAltOutlined style={{ color: '#1890ff' }} />
          )}
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string, record: DocumentInfo) => {
        if (type === 'folder') return '文件夹';
        return record.fileType?.toUpperCase() || '文件';
      }
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => size ? formatFileSize(size) : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      key: 'creator'
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: DocumentInfo) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedDocument(record);
                setDetailDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button 
              type="text" 
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Tooltip title="分享">
            <Button 
              type="text" 
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(record.id)}
            />
          </Tooltip>
          <Tooltip title={record.isStarred ? '取消收藏' : '收藏'}>
            <Button 
              type="text" 
              icon={<StarOutlined style={{ color: record.isStarred ? '#faad14' : undefined }} />}
              onClick={() => handleStar(record.id)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: `确定要删除 ${record.name} 吗？`,
                  okText: '删除',
                  okType: 'danger',
                  cancelText: '取消',
                  onOk: () => {
                    message.success('删除成功');
                    loadDocuments();
                  }
                });
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const templateColumns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag>{category}</Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '使用次数',
      dataIndex: 'useCount',
      key: 'useCount'
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: DocumentTemplate) => (
        <Space>
          <Button type="primary" size="small">
            使用模板
          </Button>
          <Button size="small">
            预览
          </Button>
          <Button size="small" icon={<DownloadOutlined />}>
            下载
          </Button>
        </Space>
      )
    }
  ];

  const shareColumns = [
    {
      title: '文档名称',
      dataIndex: 'documentName',
      key: 'documentName'
    },
    {
      title: '分享给',
      dataIndex: 'sharedTo',
      key: 'sharedTo'
    },
    {
      title: '分享者',
      dataIndex: 'sharedBy',
      key: 'sharedBy'
    },
    {
      title: '分享时间',
      dataIndex: 'shareTime',
      key: 'shareTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <>
          {permissions.map(perm => (
            <Tag key={perm}>
              {perm === 'view' ? '查看' : perm === 'edit' ? '编辑' : perm === 'download' ? '下载' : perm}
            </Tag>
          ))}
        </>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : status === 'expired' ? 'warning' : 'error'}>
          {status === 'active' ? '有效' : status === 'expired' ? '过期' : '已撤销'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small">查看详情</Button>
          <Button size="small" danger>撤销分享</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <FolderOutlined style={{ marginRight: '8px' }} />
          文档管理中心
        </Title>
        <Text type="secondary">
          统一管理诉讼文档、模板和共享资源
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="文件总数"
              value={documentStats.totalFiles}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="文件夹数量"
              value={documentStats.totalFolders}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="存储空间"
              value={documentStats.totalSize}
              prefix={<CloudUploadOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="共享文件"
              value={documentStats.sharedFiles}
              prefix={<ShareAltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <FolderOutlined />
                我的文档
              </span>
            }
            key="documents"
          >
            {/* 工具栏 */}
            <div style={{ marginBottom: '16px' }}>
              <Row justify="space-between">
                <Col>
                  <Space>
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => setUploadModalVisible(true)}
                    >
                      上传文件
                    </Button>
                    <Button
                      icon={<FolderAddOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: '创建文件夹',
                          content: (
                            <Form>
                              <Form.Item label="文件夹名称" required>
                                <Input placeholder="请输入文件夹名称" />
                              </Form.Item>
                            </Form>
                          ),
                          onOk: () => {
                            message.success('文件夹创建成功');
                            loadDocuments();
                          }
                        });
                      }}
                    >
                      新建文件夹
                    </Button>
                    <Button icon={<FileAddOutlined />}>
                      新建文档
                    </Button>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Input.Search
                      placeholder="搜索文档..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onSearch={() => message.info('搜索功能开发中')}
                      style={{ width: 200 }}
                    />
                    <Button icon={<FilterOutlined />}>
                      筛选
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* 文档列表 */}
            <Table
              columns={columns}
              dataSource={documents}
              rowKey="id"
              rowSelection={{
                selectedRowKeys: selectedDocuments,
                onChange: (selectedRowKeys) => setSelectedDocuments(selectedRowKeys as string[])
              }}
              pagination={{
                total: documents.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个文件`
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                文档模板
              </span>
            }
            key="templates"
          >
            <div style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                onClick={() => setTemplateModalVisible(true)}
              >
                创建模板
              </Button>
            </div>
            <Table
              columns={templateColumns}
              dataSource={templates}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <ShareAltOutlined />
                共享记录
              </span>
            }
            key="shares"
          >
            <Table
              columns={shareColumns}
              dataSource={shareRecords}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <StarOutlined />
                我的收藏
              </span>
            }
            key="favorites"
          >
            <Table
              columns={columns}
              dataSource={documents.filter(doc => doc.isStarred)}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 上传文件模态框 */}
      <Modal
        title="上传文件"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Dragger
          multiple
          action="/api/v1/documents/upload"
          onChange={(info) => {
            const { status } = info.file;
            if (status === 'done') {
              handleUpload(info.file);
            } else if (status === 'error') {
              message.error(`${info.file.name} 上传失败.`);
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个或批量上传。支持的文件格式：PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
          </p>
        </Dragger>
      </Modal>

      {/* 分享模态框 */}
      <Modal
        title="分享文档"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        onOk={() => {
          message.success('分享成功');
          setShareModalVisible(false);
          loadShareRecords();
        }}
      >
        <Form layout="vertical">
          <Form.Item label="分享给" required>
            <Select mode="multiple" placeholder="选择用户或团队">
              <Option value="user1">张律师</Option>
              <Option value="user2">王助理</Option>
              <Option value="team1">诉讼团队</Option>
              <Option value="team2">调解团队</Option>
            </Select>
          </Form.Item>
          <Form.Item label="权限设置" required>
            <Select mode="multiple" defaultValue={['view']}>
              <Option value="view">查看</Option>
              <Option value="download">下载</Option>
              <Option value="edit">编辑</Option>
              <Option value="comment">评论</Option>
            </Select>
          </Form.Item>
          <Form.Item label="有效期">
            <Select defaultValue="never">
              <Option value="1">1天</Option>
              <Option value="7">7天</Option>
              <Option value="30">30天</Option>
              <Option value="never">永久有效</Option>
            </Select>
          </Form.Item>
          <Form.Item label="分享备注">
            <TextArea rows={3} placeholder="添加分享说明..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建模板模态框 */}
      <Modal
        title="创建文档模板"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        onOk={() => {
          message.success('模板创建成功');
          setTemplateModalVisible(false);
          loadTemplates();
        }}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="模板名称" required>
            <Input placeholder="输入模板名称" />
          </Form.Item>
          <Form.Item label="模板类别" required>
            <Select placeholder="选择类别">
              <Option value="诉讼文书">诉讼文书</Option>
              <Option value="调解文书">调解文书</Option>
              <Option value="执行文书">执行文书</Option>
              <Option value="合同协议">合同协议</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item label="模板描述">
            <TextArea rows={3} placeholder="描述模板用途和适用场景..." />
          </Form.Item>
          <Form.Item label="上传模板文件" required>
            <Upload>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 文档详情抽屉 */}
      <Drawer
        title="文档详情"
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        width={500}
      >
        {selectedDocument && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {selectedDocument.type === 'folder' ? (
                  <FolderOutlined style={{ color: '#faad14' }} />
                ) : (
                  getFileIcon(selectedDocument.fileType)
                )}
              </div>
              <Title level={4}>{selectedDocument.name}</Title>
              {selectedDocument.description && (
                <Text type="secondary">{selectedDocument.description}</Text>
              )}
            </div>

            <Divider />

            <div>
              <Title level={5}>基本信息</Title>
              <List size="small">
                <List.Item>
                  <List.Item.Meta
                    title="文件类型"
                    description={selectedDocument.type === 'folder' ? '文件夹' : selectedDocument.fileType?.toUpperCase()}
                  />
                </List.Item>
                {selectedDocument.size && (
                  <List.Item>
                    <List.Item.Meta
                      title="文件大小"
                      description={formatFileSize(selectedDocument.size)}
                    />
                  </List.Item>
                )}
                <List.Item>
                  <List.Item.Meta
                    title="创建者"
                    description={selectedDocument.creator}
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="创建时间"
                    description={dayjs(selectedDocument.createTime).format('YYYY-MM-DD HH:mm:ss')}
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="修改时间"
                    description={dayjs(selectedDocument.updateTime).format('YYYY-MM-DD HH:mm:ss')}
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="版本号"
                    description={`v${selectedDocument.version}`}
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="下载次数"
                    description={selectedDocument.downloadCount}
                  />
                </List.Item>
              </List>
            </div>

            <Divider />

            <div>
              <Title level={5}>标签</Title>
              <div>
                {selectedDocument.tags.map(tag => (
                  <Tag key={tag} style={{ margin: '2px' }}>{tag}</Tag>
                ))}
              </div>
            </div>

            <Divider />

            <div>
              <Title level={5}>操作</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block icon={<EyeOutlined />}>预览</Button>
                <Button block icon={<DownloadOutlined />}>下载</Button>
                <Button block icon={<ShareAltOutlined />}>分享</Button>
                <Button block icon={<EditOutlined />}>编辑</Button>
                <Button block icon={<HistoryOutlined />}>查看历史版本</Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default DocumentCenter;