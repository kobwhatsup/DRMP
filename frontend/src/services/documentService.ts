import { request } from '@/utils/request';

export interface DocumentTemplateCreateRequest {
  templateName: string;
  templateType: string;
  category: string;
  templateContent: string;
  templateVariables?: Record<string, any>;
  outputFormat?: string;
  pageSize?: string;
  pageOrientation?: string;
  fontFamily?: string;
  fontSize?: number;
  isSystemTemplate?: boolean;
  isActive?: boolean;
  description?: string;
  tags?: string;
}

export interface DocumentTemplateResponse {
  id: number;
  templateName: string;
  templateType: string;
  templateTypeDesc: string;
  category: string;
  categoryDesc: string;
  templateContent: string;
  templateVariables?: string;
  outputFormat: string;
  pageSize: string;
  pageOrientation: string;
  fontFamily: string;
  fontSize: number;
  isSystemTemplate: boolean;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: string;
  organizationId?: number;
  createdBy: number;
  updatedBy?: number;
  version: number;
  approvalStatus: string;
  approvedBy?: number;
  approvedAt?: string;
  description?: string;
  tags?: string;
  tagList?: string[];
  createdAt: string;
  updatedAt: string;
  displayName: string;
  isAvailable: boolean;
}

export interface DocumentGenerationRequest {
  templateId: number;
  caseIds: string[];
  documentName: string;
  customData?: Record<string, any>;
  expiresAt?: string;
  remarks?: string;
  asyncGeneration?: boolean;
  autoDownload?: boolean;
  outputFormat?: string;
}

export interface DocumentGenerationResponse {
  id: number;
  caseId: number;
  caseNumber?: string;
  templateId: number;
  templateName: string;
  batchOperationId?: number;
  documentName: string;
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;
  formattedFileSize?: string;
  fileMd5?: string;
  status: string;
  statusDesc: string;
  generationData?: string;
  errorMessage?: string;
  generationTime?: number;
  generatedBy: number;
  generatedByName: string;
  generatedAt?: string;
  downloadedCount: number;
  lastDownloadedAt?: string;
  isSigned: boolean;
  signedBy?: number;
  signedAt?: string;
  signatureInfo?: string;
  expiresAt?: string;
  isArchived: boolean;
  archivePath?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  isDownloadable: boolean;
  isExpired: boolean;
}

// 模板管理相关接口
/**
 * 创建文书模板
 */
export const createTemplate = (data: DocumentTemplateCreateRequest) => {
  return request.post<DocumentTemplateResponse>('/api/v1/documents/templates', data);
};

/**
 * 更新文书模板
 */
export const updateTemplate = (templateId: number, data: DocumentTemplateCreateRequest) => {
  return request.put<DocumentTemplateResponse>(`/api/v1/documents/templates/${templateId}`, data);
};

/**
 * 删除文书模板
 */
export const deleteTemplate = (templateId: number) => {
  return request.delete(`/api/v1/documents/templates/${templateId}`);
};

/**
 * 获取模板详情
 */
export const getTemplate = (templateId: number) => {
  return request.get<DocumentTemplateResponse>(`/api/v1/documents/templates/${templateId}`);
};

/**
 * 查询文书模板
 */
export const queryTemplates = (params: {
  templateType?: string;
  category?: string;
  organizationId?: number;
  isActive?: boolean;
  page?: number;
  size?: number;
}) => {
  return request.get('/api/v1/documents/templates', { params });
};

/**
 * 搜索模板
 */
export const searchTemplates = (keyword: string, organizationId?: number) => {
  return request.get<DocumentTemplateResponse[]>('/api/v1/documents/templates/search', {
    params: { keyword, organizationId }
  });
};

/**
 * 获取热门模板
 */
export const getPopularTemplates = (organizationId?: number) => {
  return request.get<DocumentTemplateResponse[]>('/api/v1/documents/templates/popular', {
    params: { organizationId }
  });
};

/**
 * 审批模板
 */
export const approveTemplate = (templateId: number, approvalStatus: string) => {
  return request.post(`/api/v1/documents/templates/${templateId}/approve`, null, {
    params: { approvalStatus }
  });
};

/**
 * 导入模板
 */
export const importTemplate = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<DocumentTemplateResponse>('/api/v1/documents/templates/import', formData);
};

/**
 * 导出模板
 */
export const exportTemplate = (templateId: number) => {
  return request.get(`/api/v1/documents/templates/${templateId}/export`, {
    responseType: 'blob'
  });
};

/**
 * 预览模板
 */
export const previewTemplate = (templateId: number, sampleData: Record<string, any>) => {
  return request.post<string>(`/api/v1/documents/templates/${templateId}/preview`, sampleData);
};

/**
 * 验证模板语法
 */
export const validateTemplate = (templateContent: string) => {
  return request.post<Record<string, any>>('/api/v1/documents/templates/validate', templateContent);
};

// 文档生成相关接口
/**
 * 生成单个文档
 */
export const generateDocument = (templateId: number, caseId: number, data?: Record<string, any>) => {
  return request.post<DocumentGenerationResponse>('/api/v1/documents/generate/single', data, {
    params: { templateId, caseId }
  });
};

/**
 * 批量生成文档
 */
export const batchGenerateDocuments = (data: DocumentGenerationRequest) => {
  return request.post<DocumentGenerationResponse[]>('/api/v1/documents/generate/batch', data);
};

/**
 * 异步批量生成文档
 */
export const batchGenerateDocumentsAsync = (data: DocumentGenerationRequest) => {
  return request.post('/api/v1/documents/generate/batch-async', data);
};

/**
 * 获取生成状态
 */
export const getGenerationStatus = (generationId: number) => {
  return request.get<DocumentGenerationResponse>(`/api/v1/documents/generations/${generationId}/status`);
};

/**
 * 下载文档
 */
export const downloadDocument = (generationId: number) => {
  return request.get(`/api/v1/documents/generations/${generationId}/download`, {
    responseType: 'blob'
  });
};

/**
 * 获取下载链接
 */
export const getDocumentDownloadUrl = (generationId: number) => {
  return request.get<string>(`/api/v1/documents/generations/${generationId}/download-url`);
};

/**
 * 查询文档生成记录
 */
export const queryGenerations = (params: {
  caseId?: number;
  templateId?: number;
  status?: string;
  generatedBy?: number;
  page?: number;
  size?: number;
}) => {
  return request.get('/api/v1/documents/generations', { params });
};

/**
 * 获取案件文档
 */
export const getCaseDocuments = (caseId: number) => {
  return request.get<DocumentGenerationResponse[]>(`/api/v1/documents/case/${caseId}`);
};

/**
 * 重新生成文档
 */
export const regenerateDocument = (generationId: number) => {
  return request.post<DocumentGenerationResponse>(`/api/v1/documents/generations/${generationId}/regenerate`);
};

/**
 * 删除文档
 */
export const deleteGeneration = (generationId: number) => {
  return request.delete(`/api/v1/documents/generations/${generationId}`);
};

/**
 * 签署文档
 */
export const signDocument = (generationId: number, signatureData: string) => {
  return request.post(`/api/v1/documents/generations/${generationId}/sign`, null, {
    params: { signatureData }
  });
};

/**
 * 归档文档
 */
export const archiveDocument = (generationId: number) => {
  return request.post(`/api/v1/documents/generations/${generationId}/archive`);
};

/**
 * 批量归档文档
 */
export const batchArchiveDocuments = (generationIds: number[]) => {
  return request.post('/api/v1/documents/generations/batch-archive', generationIds);
};

/**
 * 获取文档统计
 */
export const getDocumentStatistics = (organizationId?: number) => {
  return request.get('/api/v1/documents/statistics', {
    params: { organizationId }
  });
};