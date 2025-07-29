import React, { useState } from 'react';
import { Upload, Button, Progress, message, Modal, List, Typography, Space, Tag, Alert } from 'antd';
import { 
  UploadOutlined, 
  InboxOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd/es/upload';

const { Dragger } = Upload;
const { Text } = Typography;

// 文件状态
export type FileStatus = 'uploading' | 'done' | 'error' | 'removed';

// 上传文件信息
export interface UploadFileInfo extends UploadFile {
  id?: string;
  url?: string;
  size?: number;
  status?: FileStatus;
  percent?: number;
  error?: string;
}

// 文件上传组件属性
export interface FileUploadProps {
  // 基础配置
  accept?: string;
  multiple?: boolean;
  maxCount?: number;
  maxSize?: number; // MB
  
  // 上传方式
  uploadType?: 'button' | 'dragger';
  
  // 显示方式
  listType?: 'text' | 'picture' | 'picture-card';
  showUploadList?: boolean;
  
  // 文件列表
  fileList?: UploadFileInfo[];
  defaultFileList?: UploadFileInfo[];
  
  // 回调函数
  onChange?: (info: { file: UploadFileInfo; fileList: UploadFileInfo[] }) => void;
  onPreview?: (file: UploadFileInfo) => void;
  onDownload?: (file: UploadFileInfo) => void;
  onRemove?: (file: UploadFileInfo) => void | Promise<boolean>;
  
  // 自定义上传
  customRequest?: (options: any) => void;
  
  // 验证函数
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean>;
  
  // 分片上传配置
  chunkSize?: number; // MB，默认5MB
  enableChunkUpload?: boolean;
  
  // UI配置
  disabled?: boolean;
  placeholder?: string;
  uploadButtonText?: string;
  dragText?: string;
  dragHint?: string;
  
  // 预览模式
  previewMode?: boolean;
}

// 文件大小格式化
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
};

// 获取文件类型图标
const getFileTypeIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const iconStyle = { fontSize: 16, marginRight: 8 };
  
  switch (extension) {
    case 'pdf':
      return <span style={{ ...iconStyle, color: '#ff4d4f' }}>📄</span>;
    case 'doc':
    case 'docx':
      return <span style={{ ...iconStyle, color: '#1890ff' }}>📝</span>;
    case 'xls':
    case 'xlsx':
      return <span style={{ ...iconStyle, color: '#52c41a' }}>📊</span>;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <span style={{ ...iconStyle, color: '#722ed1' }}>🖼️</span>;
    case 'zip':
    case 'rar':
      return <span style={{ ...iconStyle, color: '#faad14' }}>📦</span>;
    default:
      return <span style={{ ...iconStyle, color: '#8c8c8c' }}>📎</span>;
  }
};

const FileUpload: React.FC<FileUploadProps> = ({
  accept = "*",
  multiple = true,
  maxCount = 10,
  maxSize = 100, // 100MB
  uploadType = 'button',
  listType = 'text',
  showUploadList = true,
  fileList,
  defaultFileList = [],
  onChange,
  onPreview,
  onDownload,
  onRemove,
  customRequest,
  beforeUpload,
  chunkSize = 5, // 5MB
  enableChunkUpload = true,
  disabled = false,
  placeholder = "点击或拖拽文件到此区域上传",
  uploadButtonText = "选择文件",
  dragText = "点击或拖拽文件到此区域上传",
  dragHint = "支持单个或批量上传，严禁上传违法文件",
  previewMode = false,
}) => {
  const [internalFileList, setInternalFileList] = useState<UploadFileInfo[]>(defaultFileList);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadFileInfo | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // 获取当前文件列表
  const currentFileList = fileList !== undefined ? fileList : internalFileList;

  // 文件上传前验证
  const handleBeforeUpload = async (file: File, fileList: File[]): Promise<boolean> => {
    // 文件大小验证
    if (file.size > maxSize * 1024 * 1024) {
      message.error(`文件大小不能超过 ${maxSize}MB`);
      return false;
    }

    // 文件数量验证
    if (currentFileList.length + fileList.length > maxCount) {
      message.error(`最多只能上传 ${maxCount} 个文件`);
      return false;
    }

    // 自定义验证
    if (beforeUpload) {
      return await beforeUpload(file, fileList);
    }

    return true;
  };

  // 分片上传实现
  const chunkUpload = async (file: File, options: any) => {
    const { onProgress, onSuccess, onError } = options;
    const chunkSizeBytes = chunkSize * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSizeBytes);
    
    try {
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSizeBytes;
        const end = Math.min(start + chunkSizeBytes, file.size);
        const chunk = file.slice(start, end);
        
        // 创建FormData
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', i.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('fileName', file.name);
        formData.append('fileSize', file.size.toString());
        
        // 上传分片
        const response = await fetch('/api/upload/chunk', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`分片上传失败: ${response.statusText}`);
        }
        
        // 更新进度
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        onProgress({ percent: progress });
      }
      
      // 合并分片
      const mergeResponse = await fetch('/api/upload/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          totalChunks,
        }),
      });
      
      if (!mergeResponse.ok) {
        throw new Error('文件合并失败');
      }
      
      const result = await mergeResponse.json();
      onSuccess(result);
      
    } catch (error) {
      onError(error);
    }
  };

  // 默认上传实现
  const defaultUpload = async (options: any) => {
    const { file, onProgress, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress({ percent });
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onSuccess(response);
        } else {
          onError(new Error(`上传失败: ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        onError(new Error('网络错误'));
      });
      
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
      
    } catch (error) {
      onError(error);
    }
  };

  // 处理上传
  const handleCustomRequest = (options: any) => {
    const { file } = options;
    
    if (customRequest) {
      return customRequest(options);
    }
    
    // 根据文件大小决定是否使用分片上传
    if (enableChunkUpload && file.size > chunkSize * 1024 * 1024) {
      return chunkUpload(file, options);
    } else {
      return defaultUpload(options);
    }
  };

  // 处理文件变化
  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];
    
    // 限制文件数量
    if (newFileList.length > maxCount) {
      newFileList = newFileList.slice(-maxCount);
    }
    
    // 更新文件状态
    newFileList = newFileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    
    // 更新内部状态
    if (fileList === undefined) {
      setInternalFileList(newFileList);
    }
    
    // 调用外部回调
    onChange?.({ file: info.file, fileList: newFileList });
    
    // 处理上传结果
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  };

  // 处理预览
  const handlePreview = (file: UploadFileInfo) => {
    if (onPreview) {
      onPreview(file);
    } else {
      setPreviewFile(file);
      setPreviewVisible(true);
    }
  };

  // 处理下载
  const handleDownload = (file: UploadFileInfo) => {
    if (onDownload) {
      onDownload(file);
    } else if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 渲染上传按钮
  const renderUploadButton = () => {
    if (uploadType === 'dragger') {
      return (
        <Dragger
          accept={accept}
          multiple={multiple}
          beforeUpload={handleBeforeUpload}
          customRequest={handleCustomRequest}
          onChange={handleChange}
          fileList={currentFileList}
          showUploadList={false}
          disabled={disabled || (currentFileList.length >= maxCount)}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{dragText}</p>
          <p className="ant-upload-hint">{dragHint}</p>
        </Dragger>
      );
    }
    
    return (
      <Upload
        accept={accept}
        multiple={multiple}
        beforeUpload={handleBeforeUpload}
        customRequest={handleCustomRequest}
        onChange={handleChange}
        fileList={currentFileList}
        showUploadList={false}
        disabled={disabled || (currentFileList.length >= maxCount)}
      >
        <Button 
          icon={<UploadOutlined />} 
          disabled={disabled || (currentFileList.length >= maxCount)}
        >
          {uploadButtonText}
        </Button>
      </Upload>
    );
  };

  // 渲染文件列表
  const renderFileList = () => {
    if (!showUploadList || currentFileList.length === 0) {
      return null;
    }

    return (
      <List
        dataSource={currentFileList}
        renderItem={(file) => (
          <List.Item
            actions={[
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(file)}
              >
                预览
              </Button>,
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(file)}
              >
                下载
              </Button>,
              <Button
                type="link"
                size="small"
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  const newFileList = currentFileList.filter(f => f.uid !== file.uid);
                  if (fileList === undefined) {
                    setInternalFileList(newFileList);
                  }
                  onChange?.({ file, fileList: newFileList });
                }}
              >
                删除
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={getFileTypeIcon(file.name || '')}
              title={
                <Space>
                  <Text>{file.name}</Text>
                  {file.status === 'uploading' && (
                    <Tag color="blue">上传中</Tag>
                  )}
                  {file.status === 'done' && (
                    <Tag color="green" icon={<CheckCircleOutlined />}>成功</Tag>
                  )}
                  {file.status === 'error' && (
                    <Tag color="red" icon={<CloseCircleOutlined />}>失败</Tag>
                  )}
                </Space>
              }
              description={
                <Space direction="vertical" size={4}>
                  <Text type="secondary">
                    {file.size ? formatFileSize(file.size) : '未知大小'}
                  </Text>
                  {file.status === 'uploading' && file.percent !== undefined && (
                    <Progress percent={file.percent} size="small" />
                  )}
                  {file.status === 'error' && file.error && (
                    <Text type="danger">{file.error}</Text>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  // 渲染使用提示
  const renderUsageTip = () => {
    const tips = [];
    
    if (accept && accept !== '*') {
      tips.push(`支持文件类型：${accept}`);
    }
    
    tips.push(`最大文件大小：${maxSize}MB`);
    tips.push(`最多上传：${maxCount}个文件`);
    
    if (enableChunkUpload) {
      tips.push(`大文件自动分片上传（${chunkSize}MB/片）`);
    }

    return (
      <Alert
        message="上传提示"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  };

  return (
    <div>
      {!previewMode && (
        <>
          {renderUsageTip()}
          {renderUploadButton()}
          <div style={{ marginTop: 16 }}>
            {renderFileList()}
          </div>
        </>
      )}
      
      {previewMode && renderFileList()}
      
      {/* 预览模态框 */}
      <Modal
        open={previewVisible}
        title="文件预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        {previewFile && (
          <div>
            <h4>{previewFile.name}</h4>
            <p>文件大小：{previewFile.size ? formatFileSize(previewFile.size) : '未知'}</p>
            {previewFile.url && (
              <div>
                {previewFile.type?.startsWith('image/') ? (
                  <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: '100%' }} />
                ) : (
                  <p>该文件类型不支持在线预览，请下载后查看。</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FileUpload;