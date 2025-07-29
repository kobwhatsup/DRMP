import apiService from './api';

export interface Contract {
  id: number;
  contractNumber: string;
  contractType: 'ENTRUSTMENT' | 'SERVICE' | 'SETTLEMENT' | 'FRAMEWORK';
  title: string;
  description?: string;
  content?: string;
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'PARTIALLY_SIGNED' | 'FULLY_SIGNED' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED';
  partyAId: number;
  partyAName: string;
  partyAType: 'SOURCE' | 'DISPOSAL';
  partyBId: number;
  partyBName: string;
  partyBType: 'SOURCE' | 'DISPOSAL';
  partyCId?: number;
  partyCName?: string;
  partyCType?: 'SOURCE' | 'DISPOSAL';
  partyASignedAt?: string;
  partyBSignedAt?: string;
  partyCSignedAt?: string;
  contractAmount?: number;
  commissionRate?: number;
  startDate?: string;
  endDate?: string;
  autoRenewal: boolean;
  renewalPeriod?: number;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  createdByName: string;
  metadata?: Record<string, any>;
}

export interface ContractTemplate {
  id: number;
  name: string;
  description?: string;
  contractType: 'ENTRUSTMENT' | 'SERVICE' | 'SETTLEMENT' | 'FRAMEWORK';
  content: string;
  variables: Array<{
    name: string;
    label: string;
    type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT';
    required: boolean;
    defaultValue?: any;
    options?: string[];
  }>;
  isActive: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignatureRequest {
  contractId: number;
  signerType: 'PARTY_A' | 'PARTY_B' | 'PARTY_C';
  signatureMethod: 'ELECTRONIC' | 'MANUAL' | 'CA';
  signatureData?: string;
  remarks?: string;
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  pendingSignature: number;
  expiringSoon: number;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  typeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  monthlyStats: Array<{
    month: string;
    created: number;
    signed: number;
    terminated: number;
  }>;
}

class ContractService {
  // 获取合同列表
  async getContracts(params: {
    page?: number;
    size?: number;
    contractType?: string;
    status?: string;
    partyName?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  } = {}): Promise<{
    content: Contract[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return apiService.get('/contracts', params);
  }

  // 获取合同详情
  async getContract(id: number): Promise<Contract> {
    return apiService.get(`/contracts/${id}`);
  }

  // 创建合同
  async createContract(contract: {
    contractType: string;
    title: string;
    description?: string;
    content?: string;
    partyAId: number;
    partyBId: number;
    partyCId?: number;
    contractAmount?: number;
    commissionRate?: number;
    startDate?: string;
    endDate?: string;
    autoRenewal?: boolean;
    renewalPeriod?: number;
    metadata?: Record<string, any>;
  }): Promise<Contract> {
    return apiService.post('/contracts', contract);
  }

  // 更新合同
  async updateContract(id: number, contract: Partial<Contract>): Promise<Contract> {
    return apiService.put(`/contracts/${id}`, contract);
  }

  // 删除合同
  async deleteContract(id: number): Promise<void> {
    return apiService.delete(`/contracts/${id}`);
  }

  // 签署合同
  async signContract(signatureRequest: SignatureRequest): Promise<Contract> {
    return apiService.post(`/contracts/${signatureRequest.contractId}/sign`, signatureRequest);
  }

  // 批量签署合同
  async batchSignContracts(requests: SignatureRequest[]): Promise<Contract[]> {
    return apiService.post('/contracts/batch-sign', requests);
  }

  // 激活合同
  async activateContract(id: number): Promise<Contract> {
    return apiService.post(`/contracts/${id}/activate`);
  }

  // 暂停合同
  async suspendContract(id: number, reason?: string): Promise<Contract> {
    return apiService.post(`/contracts/${id}/suspend`, { reason });
  }

  // 终止合同
  async terminateContract(id: number, reason?: string): Promise<Contract> {
    return apiService.post(`/contracts/${id}/terminate`, { reason });
  }

  // 续签合同
  async renewContract(id: number, params: {
    newEndDate: string;
    autoRenewal?: boolean;
    renewalPeriod?: number;
    contractAmount?: number;
    commissionRate?: number;
  }): Promise<Contract> {
    return apiService.post(`/contracts/${id}/renew`, params);
  }

  // 获取合同模板列表
  async getContractTemplates(params: {
    page?: number;
    size?: number;
    contractType?: string;
    keyword?: string;
  } = {}): Promise<{
    content: ContractTemplate[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return apiService.get('/contracts/templates', params);
  }

  // 获取合同模板详情
  async getContractTemplate(id: number): Promise<ContractTemplate> {
    return apiService.get(`/contracts/templates/${id}`);
  }

  // 创建合同模板
  async createContractTemplate(template: {
    name: string;
    description?: string;
    contractType: string;
    content: string;
    variables: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
      defaultValue?: any;
      options?: string[];
    }>;
  }): Promise<ContractTemplate> {
    return apiService.post('/contracts/templates', template);
  }

  // 更新合同模板
  async updateContractTemplate(id: number, template: Partial<ContractTemplate>): Promise<ContractTemplate> {
    return apiService.put(`/contracts/templates/${id}`, template);
  }

  // 删除合同模板
  async deleteContractTemplate(id: number): Promise<void> {
    return apiService.delete(`/contracts/templates/${id}`);
  }

  // 从模板创建合同
  async createContractFromTemplate(templateId: number, params: {
    partyAId: number;
    partyBId: number;
    partyCId?: number;
    variables: Record<string, any>;
    contractAmount?: number;
    commissionRate?: number;
    startDate?: string;
    endDate?: string;
    autoRenewal?: boolean;
    renewalPeriod?: number;
  }): Promise<Contract> {
    return apiService.post(`/contracts/templates/${templateId}/create-contract`, params);
  }

  // 预览合同内容
  async previewContract(templateId: number, variables: Record<string, any>): Promise<string> {
    return apiService.post(`/contracts/templates/${templateId}/preview`, { variables });
  }

  // 获取合同统计信息
  async getContractStatistics(params: {
    organizationId?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ContractStats> {
    return apiService.get('/contracts/statistics', params);
  }

  // 获取即将到期的合同
  async getExpiringContracts(days = 30): Promise<Contract[]> {
    return apiService.get('/contracts/expiring', {
      days
    });
  }

  // 获取待签署的合同
  async getPendingSignatureContracts(organizationId?: number): Promise<Contract[]> {
    return apiService.get('/contracts/pending-signature', {
      organizationId
    });
  }

  // 导出合同
  async exportContract(id: number, format: 'PDF' | 'WORD' | 'HTML' = 'PDF'): Promise<Blob> {
    const response = await apiService.getRawApi().get(`/contracts/${id}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  // 批量导出合同
  async batchExportContracts(ids: number[], format: 'PDF' | 'WORD' | 'ZIP' = 'ZIP'): Promise<Blob> {
    const response = await apiService.getRawApi().post('/contracts/batch-export', 
      { contractIds: ids, format },
      { responseType: 'blob' }
    );
    return response.data;
  }

  // 上传合同文件
  async uploadContractFile(contractId: number, file: File, fileType: 'SIGNED_COPY' | 'ATTACHMENT' = 'ATTACHMENT'): Promise<{
    id: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadedAt: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    
    return apiService.upload(`/contracts/${contractId}/files`, formData);
  }

  // 获取合同文件列表
  async getContractFiles(contractId: number): Promise<Array<{
    id: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedByName: string;
  }>> {
    return apiService.get(`/contracts/${contractId}/files`);
  }

  // 删除合同文件
  async deleteContractFile(contractId: number, fileId: number): Promise<void> {
    return apiService.delete(`/contracts/${contractId}/files/${fileId}`);
  }

  // 下载合同文件
  async downloadContractFile(contractId: number, fileId: number): Promise<Blob> {
    const response = await apiService.getRawApi().get(`/contracts/${contractId}/files/${fileId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // 获取合同变更历史
  async getContractHistory(contractId: number): Promise<Array<{
    id: number;
    changeType: string;
    changeDescription: string;
    beforeValue?: any;
    afterValue?: any;
    changedAt: string;
    changedByName: string;
  }>> {
    return apiService.get(`/contracts/${contractId}/history`);
  }

  // 验证合同签名
  async verifyContractSignature(contractId: number): Promise<{
    isValid: boolean;
    signaturesVerified: Array<{
      signerType: string;
      signerName: string;
      isValid: boolean;
      verifiedAt: string;
      certificateInfo?: any;
    }>;
  }> {
    return apiService.post(`/contracts/${contractId}/verify-signature`);
  }
}

export default new ContractService();