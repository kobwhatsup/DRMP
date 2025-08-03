import React, { useState, useCallback, useRef } from 'react';
import { Upload, Progress, Button, message, Alert, Space, Typography, Modal } from 'antd';
import { 
  UploadOutlined, 
  PauseCircleOutlined, 
  PlayCircleOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import api from '@/utils/api';

const { Text, Title } = Typography;

interface ChunkUploadProps {
  businessType: string;
  businessId: number;
  category?: string;
  maxFileSize?: number; // MB
  chunkSize?: number; // MB
  allowedTypes?: string[];
  onSuccess?: (fileInfo: any) => void;
  onError?: (error: any) => void;
  multiple?: boolean;
  className?: string;
}

interface UploadSession {
  uploadId: string;
  fileName: string;
  fileSize: number;
  chunkCount: number;
  uploadedChunks: number;
  status: 'uploading' | 'paused' | 'completed' | 'error';
  progress: number;
  startTime: number;
  error?: string;
  file: File;
  md5List: string[];
}

/**
 * 分片上传组件
 * 支持大文件分片上传、断点续传、进度监控
 */
const ChunkUpload: React.FC<ChunkUploadProps> = ({
  businessType,
  businessId,
  category,
  maxFileSize = 500, // 默认500MB
  chunkSize = 5, // 默认5MB per chunk
  allowedTypes = ['*'],
  onSuccess,
  onError,
  multiple = false,
  className
}) => {
  const [uploadSessions, setUploadSessions] = useState<Map<string, UploadSession>>(new Map());
  const [uploading, setUploading] = useState(false);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // 计算文件MD5
  const calculateMD5 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const crypto = window.crypto;
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // 分片文件
  const sliceFile = useCallback((file: File, chunkSizeBytes: number): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;
    
    while (start < file.size) {
      const end = Math.min(start + chunkSizeBytes, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }
    
    return chunks;
  }, []);

  // 初始化上传会话
  const initUpload = useCallback(async (file: File): Promise<UploadSession> => {
    try {
      const response = await api.post('/v1/files/chunk/init', null, {
        params: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          businessType,
          businessId,
          category
        }
      });

      const { uploadId } = response.data;
      const chunkSizeBytes = chunkSize * 1024 * 1024;
      const chunks = sliceFile(file, chunkSizeBytes);

      const session: UploadSession = {
        uploadId,
        fileName: file.name,
        fileSize: file.size,
        chunkCount: chunks.length,
        uploadedChunks: 0,
        status: 'uploading',
        progress: 0,
        startTime: Date.now(),
        file,
        md5List: []
      };

      return session;
    } catch (error) {
      console.error('Failed to init upload:', error);
      throw error;
    }
  }, [businessType, businessId, category, chunkSize, sliceFile]);

  // 上传分片
  const uploadChunk = useCallback(async (
    session: UploadSession,
    chunkIndex: number,
    chunk: Blob,
    abortController: AbortController
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', chunk);
    
    try {
      const response = await api.post('/v1/files/chunk/upload', formData, {
        params: {
          uploadId: session.uploadId,
          chunkNumber: chunkIndex
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        signal: abortController.signal,
        onUploadProgress: (progressEvent) => {
          // 这里可以处理单个分片的上传进度
        }
      });

      return response.data.md5;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Upload cancelled');
      }
      throw error;
    }
  }, []);

  // 完成上传
  const completeUpload = useCallback(async (session: UploadSession): Promise<any> => {
    try {
      const response = await api.post('/v1/files/chunk/complete', session.md5List, {
        params: {
          uploadId: session.uploadId
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to complete upload:', error);
      throw error;
    }
  }, []);

  // 处理文件上传
  const handleUpload = useCallback(async (file: File) => {
    try {
      // 文件大小检查
      if (file.size > maxFileSize * 1024 * 1024) {
        message.error(`文件大小不能超过 ${maxFileSize}MB`);
        return;
      }

      // 文件类型检查
      if (allowedTypes.length > 0 && !allowedTypes.includes('*')) {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!fileExt || !allowedTypes.includes(fileExt)) {
          message.error(`不支持的文件类型，支持的类型：${allowedTypes.join(', ')}`);
          return;
        }
      }

      setUploading(true);

      // 初始化上传会话
      const session = await initUpload(file);
      const sessionId = session.uploadId;

      setUploadSessions(prev => new Map(prev).set(sessionId, session));

      // 创建中止控制器
      const abortController = new AbortController();
      abortControllersRef.current.set(sessionId, abortController);

      // 分片文件
      const chunkSizeBytes = chunkSize * 1024 * 1024;
      const chunks = sliceFile(file, chunkSizeBytes);

      // 并发上传分片
      const concurrency = 3; // 并发数
      const uploadPromises: Promise<void>[] = [];
      
      for (let i = 0; i < chunks.length; i += concurrency) {
        const batch = chunks.slice(i, i + concurrency);
        const batchPromises = batch.map(async (chunk, batchIndex) => {
          const chunkIndex = i + batchIndex;
          
          try {
            const md5 = await uploadChunk(session, chunkIndex, chunk, abortController);
            
            // 更新会话状态
            setUploadSessions(prev => {
              const newSessions = new Map(prev);
              const currentSession = newSessions.get(sessionId);
              if (currentSession) {
                currentSession.uploadedChunks += 1;
                currentSession.progress = (currentSession.uploadedChunks / currentSession.chunkCount) * 100;
                currentSession.md5List[chunkIndex] = md5;
                newSessions.set(sessionId, { ...currentSession });
              }
              return newSessions;
            });
          } catch (error) {
            console.error(`Chunk ${chunkIndex} upload failed:`, error);
            throw error;
          }
        });
        
        uploadPromises.push(...batchPromises);
        
        // 等待当前批次完成再处理下一批次
        await Promise.all(batchPromises);
      }

      await Promise.all(uploadPromises);

      // 完成上传
      const fileInfo = await completeUpload(session);

      // 更新会话状态
      setUploadSessions(prev => {
        const newSessions = new Map(prev);
        const currentSession = newSessions.get(sessionId);
        if (currentSession) {
          currentSession.status = 'completed';
          currentSession.progress = 100;
          newSessions.set(sessionId, { ...currentSession });
        }
        return newSessions;
      });

      message.success(`文件 ${file.name} 上传成功`);
      onSuccess?.(fileInfo);

    } catch (error: any) {
      console.error('Upload failed:', error);
      
      // 更新会话错误状态
      setUploadSessions(prev => {
        const newSessions = new Map(prev);
        const session = Array.from(newSessions.values()).find(s => s.file === file);
        if (session) {
          session.status = 'error';
          session.error = error.message || '上传失败';
          newSessions.set(session.uploadId, { ...session });
        }
        return newSessions;
      });

      message.error(`文件 ${file.name} 上传失败: ${error.message}`);
      onError?.(error);
    } finally {
      setUploading(false);
    }
  }, [maxFileSize, allowedTypes, chunkSize, initUpload, uploadChunk, completeUpload, sliceFile, onSuccess, onError]);

  // 暂停上传
  const pauseUpload = useCallback((sessionId: string) => {
    const abortController = abortControllersRef.current.get(sessionId);
    if (abortController) {
      abortController.abort();
      abortControllersRef.current.delete(sessionId);
    }

    setUploadSessions(prev => {
      const newSessions = new Map(prev);
      const session = newSessions.get(sessionId);
      if (session) {
        session.status = 'paused';
        newSessions.set(sessionId, { ...session });
      }
      return newSessions;
    });
  }, []);

  // 恢复上传
  const resumeUpload = useCallback(async (sessionId: string) => {
    const session = uploadSessions.get(sessionId);
    if (!session) return;

    // 重新开始上传流程
    await handleUpload(session.file);
  }, [uploadSessions, handleUpload]);

  // 取消上传
  const cancelUpload = useCallback(async (sessionId: string) => {
    try {
      await api.delete(`/v1/files/chunk/cancel/${sessionId}`);
      
      const abortController = abortControllersRef.current.get(sessionId);
      if (abortController) {
        abortController.abort();
        abortControllersRef.current.delete(sessionId);
      }

      setUploadSessions(prev => {
        const newSessions = new Map(prev);
        newSessions.delete(sessionId);
        return newSessions;
      });

      message.info('上传已取消');
    } catch (error) {
      console.error('Failed to cancel upload:', error);
      message.error('取消上传失败');
    }
  }, []);

  // 自定义上传函数
  const customRequest = ({ file }: any) => {
    handleUpload(file as File);
    return { abort: () => {} };
  };

  // 渲染上传会话
  const renderUploadSessions = () => {
    const sessions = Array.from(uploadSessions.values());
    
    if (sessions.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Title level={5}>上传进度</Title>
        {sessions.map(session => (
          <div key={session.uploadId} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{session.fileName}</Text>
              <Space>
                {session.status === 'uploading' && (
                  <Button 
                    size="small" 
                    icon={<PauseCircleOutlined />}
                    onClick={() => pauseUpload(session.uploadId)}
                  >
                    暂停
                  </Button>
                )}
                {session.status === 'paused' && (
                  <Button 
                    size="small" 
                    icon={<PlayCircleOutlined />}
                    onClick={() => resumeUpload(session.uploadId)}
                  >
                    继续
                  </Button>
                )}
                <Button 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => cancelUpload(session.uploadId)}
                >
                  取消
                </Button>
              </Space>
            </div>
            
            <Progress 
              percent={Math.round(session.progress)} 
              status={session.status === 'error' ? 'exception' : session.status === 'completed' ? 'success' : 'active'}
              format={(percent) => (
                <span>
                  {percent}% ({session.uploadedChunks}/{session.chunkCount} 分片)
                </span>
              )}
            />
            
            {session.status === 'error' && session.error && (
              <Alert 
                message="上传失败" 
                description={session.error}
                type="error" 
                showIcon 
                style={{ marginTop: 8 }}
              />
            )}
            
            {session.status === 'completed' && (
              <Alert 
                message="上传完成" 
                type="success" 
                showIcon 
                style={{ marginTop: 8 }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={className}>
      <Upload.Dragger
        multiple={multiple}
        customRequest={customRequest}
        showUploadList={false}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持大文件分片上传，最大支持 {maxFileSize}MB
          {allowedTypes.length > 0 && !allowedTypes.includes('*') && (
            <br />
          )}
          {allowedTypes.length > 0 && !allowedTypes.includes('*') && (
            <>支持的文件类型：{allowedTypes.join(', ')}</>
          )}
        </p>
      </Upload.Dragger>
      
      {renderUploadSessions()}
    </div>
  );
};

export default ChunkUpload;