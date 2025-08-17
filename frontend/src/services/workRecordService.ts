import { request } from '@/utils/request';

export interface WorkRecordCreateRequest {
  caseId: number;
  recordType: string;
  title: string;
  content: string;
  contactDate?: string;
  contactMethod?: string;
  contactResult?: string;
  contactDuration?: number;
  debtorResponse?: string;
  debtorAttitude?: string;
  nextAction?: string;
  nextContactDate?: string;
  followUpRequired?: boolean;
  isImportant?: boolean;
  templateId?: number;
  templateName?: string;
  attachments?: string;
  tags?: string;
  workDuration?: number;
  location?: string;
  weather?: string;
}

export interface WorkRecordResponse {
  id: number;
  caseId: number;
  handlerId: number;
  handlerName: string;
  recordType: string;
  recordTypeDesc: string;
  title: string;
  content: string;
  contactDate?: string;
  contactMethod?: string;
  contactMethodDesc?: string;
  contactResult?: string;
  contactResultDesc?: string;
  contactDuration?: number;
  formattedContactDuration?: string;
  debtorResponse?: string;
  debtorAttitude?: string;
  debtorAttitudeDesc?: string;
  nextAction?: string;
  nextContactDate?: string;
  followUpRequired?: boolean;
  isImportant?: boolean;
  templateId?: number;
  templateName?: string;
  attachments?: string;
  tags?: string;
  tagList?: string[];
  workDuration?: number;
  location?: string;
  weather?: string;
  createdAt: string;
  updatedAt: string;
  needsFollowUp?: boolean;
}

export interface WorkRecordQueryRequest {
  caseId?: number;
  handlerId?: number;
  recordType?: string;
  contactMethod?: string;
  contactResult?: string;
  debtorAttitude?: string;
  followUpRequired?: boolean;
  isImportant?: boolean;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  tags?: string;
}

/**
 * 创建作业记录
 */
export const createWorkRecord = (data: WorkRecordCreateRequest) => {
  return request.post('/api/v1/work-records', data);
};

/**
 * 更新作业记录
 */
export const updateWorkRecord = (id: number, data: Partial<WorkRecordCreateRequest>) => {
  return request.put(`/api/v1/work-records/${id}`, data);
};

/**
 * 删除作业记录
 */
export const deleteWorkRecord = (id: number) => {
  return request.delete(`/api/v1/work-records/${id}`);
};

/**
 * 获取作业记录详情
 */
export const getWorkRecord = (id: number) => {
  return request.get<WorkRecordResponse>(`/api/v1/work-records/${id}`);
};

/**
 * 分页查询作业记录
 */
export const queryWorkRecords = (params: WorkRecordQueryRequest & {
  page?: number;
  size?: number;
}) => {
  return request.get('/api/v1/work-records', { params });
};

/**
 * 获取案件的所有作业记录
 */
export const getCaseWorkRecords = (caseId: number) => {
  return request.get<WorkRecordResponse[]>(`/api/v1/work-records/case/${caseId}`);
};

/**
 * 获取需要跟进的记录
 */
export const getFollowUpRecords = () => {
  return request.get<WorkRecordResponse[]>('/api/v1/work-records/follow-ups');
};

/**
 * 批量创建作业记录
 */
export const batchCreateWorkRecords = (data: WorkRecordCreateRequest[]) => {
  return request.post('/api/v1/work-records/batch', data);
};

/**
 * 获取作业记录统计
 */
export const getWorkRecordStatistics = (caseId?: number, handlerId?: number) => {
  return request.get('/api/v1/work-records/statistics', {
    params: { caseId, handlerId }
  });
};