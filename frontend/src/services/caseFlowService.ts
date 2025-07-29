import apiService from './api';

export interface CaseFlowRecord {
  id: number;
  casePackageId?: number;
  caseId?: number;
  eventType: string;
  eventDescription: string;
  beforeStatus?: string;
  afterStatus?: string;
  operatorId?: number;
  operatorName?: string;
  operatorOrgId?: number;
  amount?: number;
  eventTime: string;
  severity?: string;
  isSystemEvent: boolean;
  metadata?: Record<string, any>;
  tags?: string;
}

export interface CaseFlowStats {
  totalEvents: number;
  todayEvents: number;
  avgProcessingDays?: number;
  eventTypeDistribution: Array<{
    eventType: string;
    count: number;
  }>;
  dailyStats: Array<{
    date: string;
    count: number;
  }>;
}

export interface TimelineItem {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  type: 'success' | 'processing' | 'error' | 'default' | 'warning';
  icon?: string;
  metadata?: Record<string, any>;
}

class CaseFlowService {
  // 获取案件包流转记录
  async getCasePackageFlowRecords(
    casePackageId: number,
    page = 0,
    size = 20
  ): Promise<{
    content: CaseFlowRecord[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return apiService.get(`/case-flow/case-packages/${casePackageId}/records`, {
      page, size
    });
  }

  // 获取个案流转记录
  async getCaseFlowRecords(
    caseId: number,
    page = 0,
    size = 20
  ): Promise<{
    content: CaseFlowRecord[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return apiService.get(`/case-flow/cases/${caseId}/records`, {
      page, size
    });
  }

  // 获取案件包时间线
  async getCasePackageTimeline(casePackageId: number): Promise<TimelineItem[]> {
    return apiService.get(`/case-flow/case-packages/${casePackageId}/timeline`);
  }

  // 创建流转记录
  async createFlowRecord(record: {
    casePackageId?: number;
    caseId?: number;
    eventType: string;
    eventDescription: string;
    beforeStatus?: string;
    afterStatus?: string;
    amount?: number;
    severity?: string;
    metadata?: Record<string, any>;
    tags?: string;
  }): Promise<CaseFlowRecord> {
    return apiService.post('/case-flow/records', record);
  }

  // 批量创建流转记录
  async batchCreateFlowRecords(records: Array<{
    casePackageId?: number;
    caseId?: number;
    eventType: string;
    eventDescription: string;
    beforeStatus?: string;
    afterStatus?: string;
    amount?: number;
    severity?: string;
    metadata?: Record<string, any>;
    tags?: string;
  }>): Promise<CaseFlowRecord[]> {
    return apiService.post('/case-flow/records/batch', records);
  }

  // 获取流转统计数据
  async getFlowStatistics(
    organizationId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<CaseFlowStats> {
    return apiService.get('/case-flow/statistics', {
      organizationId, startDate, endDate
    });
  }

  // 按事件类型查询流转记录
  async getFlowRecordsByEventType(
    eventTypes: string[],
    startTime: string,
    endTime: string,
    page = 0,
    size = 20
  ): Promise<{
    content: CaseFlowRecord[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return apiService.get('/case-flow/records/by-event-type', {
      eventTypes: eventTypes.join(','), startTime, endTime, page, size
    });
  }

  // 按机构查询流转记录
  async getFlowRecordsByOrganization(
    organizationId: number,
    startTime: string,
    endTime: string,
    eventTypes?: string[],
    page = 0,
    size = 20
  ): Promise<{
    content: CaseFlowRecord[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return apiService.get('/case-flow/records/by-organization', {
      organizationId, 
      startTime, 
      endTime, 
      eventTypes: eventTypes?.join(','),
      page, 
      size
    });
  }

  // 获取系统事件
  async getSystemEvents(
    startTime: string,
    endTime: string,
    page = 0,
    size = 20
  ): Promise<{
    content: CaseFlowRecord[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return apiService.get('/case-flow/records/system-events', {
      startTime, endTime, page, size
    });
  }

  // 按严重程度查询事件
  async getEventsBySeverity(
    severity: string,
    startTime: string,
    endTime: string,
    page = 0,
    size = 20
  ): Promise<{
    content: CaseFlowRecord[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return apiService.get('/case-flow/records/by-severity', {
      severity, startTime, endTime, page, size
    });
  }

  // 按标签查询事件
  async getEventsByTag(
    tag: string,
    startTime: string,
    endTime: string,
    page = 0,
    size = 20
  ): Promise<{
    content: CaseFlowRecord[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return apiService.get('/case-flow/records/by-tag', {
      tag, startTime, endTime, page, size
    });
  }

  // 获取财务相关事件
  async getFinancialEvents(casePackageId: number): Promise<CaseFlowRecord[]> {
    return apiService.get(`/case-flow/case-packages/${casePackageId}/financial-events`);
  }

  // 获取最近流转记录
  async getRecentRecords(
    hours = 24,
    limit = 50
  ): Promise<CaseFlowRecord[]> {
    return apiService.get('/case-flow/records/recent', {
      hours, limit
    });
  }

  // 计算平均处理天数
  async getAverageProcessingDays(
    startTime: string,
    endTime: string
  ): Promise<number> {
    return apiService.get('/case-flow/statistics/avg-processing-days', {
      startTime, endTime
    });
  }

  // 获取事件类型统计
  async getEventTypeStats(
    organizationId?: number,
    startTime?: string,
    endTime?: string
  ): Promise<Array<{
    eventType: string;
    count: number;
    percentage: number;
  }>> {
    return apiService.get('/case-flow/statistics/event-types', {
      organizationId, startTime, endTime
    });
  }

  // 获取按日期分组的统计
  async getDailyStats(
    startTime: string,
    endTime: string
  ): Promise<Array<{
    date: string;
    count: number;
  }>> {
    return apiService.get('/case-flow/statistics/daily', {
      startTime, endTime
    });
  }

  // 获取操作人统计
  async getOperatorStats(
    organizationId: number,
    startTime: string,
    endTime: string
  ): Promise<Array<{
    operatorName: string;
    count: number;
  }>> {
    return apiService.get('/case-flow/statistics/operators', {
      organizationId, startTime, endTime
    });
  }
}

export default new CaseFlowService();