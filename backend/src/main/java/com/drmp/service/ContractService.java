package com.drmp.service;

import com.drmp.dto.request.ContractCreateRequest;
import com.drmp.dto.request.ContractUpdateRequest;
import com.drmp.dto.response.ContractDetailResponse;
import com.drmp.dto.response.ContractListResponse;
import com.drmp.entity.Contract;
import com.drmp.entity.enums.ContractStatus;
import com.drmp.entity.enums.ContractType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * 合同服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface ContractService {
    
    /**
     * 创建合同
     */
    ContractDetailResponse createContract(ContractCreateRequest request);
    
    /**
     * 更新合同
     */
    ContractDetailResponse updateContract(Long contractId, ContractUpdateRequest request);
    
    /**
     * 根据ID获取合同详情
     */
    ContractDetailResponse getContractById(Long contractId);
    
    /**
     * 根据合同编号获取合同详情
     */
    ContractDetailResponse getContractByNumber(String contractNumber);
    
    /**
     * 分页查询合同列表
     */
    Page<ContractListResponse> getContractList(Pageable pageable);
    
    /**
     * 根据条件查询合同
     */
    Page<ContractListResponse> searchContracts(ContractType contractType, ContractStatus status,
                                             Long partyAId, Long partyBId, 
                                             LocalDate startDate, LocalDate endDate,
                                             Pageable pageable);
    
    /**
     * 根据关键词搜索合同
     */
    Page<ContractListResponse> searchByKeyword(String keyword, Pageable pageable);
    
    /**
     * 获取案件包相关合同
     */
    List<ContractListResponse> getCasePackageContracts(Long casePackageId);
    
    /**
     * 获取个案相关合同
     */
    List<ContractListResponse> getCaseContracts(Long caseId);
    
    /**
     * 获取机构相关合同
     */
    Page<ContractListResponse> getOrganizationContracts(Long organizationId, Pageable pageable);
    
    /**
     * 提交合同审核
     */
    void submitForReview(Long contractId);
    
    /**
     * 审核合同
     */
    void reviewContract(Long contractId, boolean approved, String comments, Long reviewerId, String reviewerName);
    
    /**
     * 发送合同签署
     */
    void sendForSignature(Long contractId);
    
    /**
     * 签署合同
     */
    void signContract(Long contractId, String partyType, String signerName);
    
    /**
     * 使合同生效
     */
    void makeContractEffective(Long contractId);
    
    /**
     * 暂停合同
     */
    void suspendContract(Long contractId);
    
    /**
     * 恢复合同
     */
    void resumeContract(Long contractId);
    
    /**
     * 终止合同
     */
    void terminateContract(Long contractId);
    
    /**
     * 取消合同
     */
    void cancelContract(Long contractId);
    
    /**
     * 续约合同
     */
    ContractDetailResponse renewContract(Long contractId, LocalDate newExpiryDate);
    
    /**
     * 生成合同编号
     */
    String generateContractNumber(ContractType contractType);
    
    /**
     * 检查合同编号是否可用
     */
    boolean isContractNumberAvailable(String contractNumber);
    
    /**
     * 获取即将到期的合同
     */
    List<ContractListResponse> getExpiringContracts(int days);
    
    /**
     * 获取已过期的合同
     */
    List<ContractListResponse> getExpiredContracts();
    
    /**
     * 获取待签署的合同
     */
    List<ContractListResponse> getPendingSignatureContracts();
    
    /**
     * 获取需要审核的合同
     */
    List<ContractListResponse> getContractsRequiringReview();
    
    /**
     * 删除合同
     */
    void deleteContract(Long contractId);
    
    /**
     * 获取合同统计信息
     */
    ContractStatistics getContractStatistics();
    
    /**
     * 获取机构合同统计
     */
    ContractStatistics getOrganizationContractStatistics(Long organizationId);
    
    /**
     * 导出合同数据
     */
    byte[] exportContracts(List<Long> contractIds);
    
    /**
     * 批量导入合同
     */
    BatchImportResult batchImportContracts(List<ContractCreateRequest> contracts);
    
    /**
     * 合同统计信息
     */
    class ContractStatistics {
        private Long totalContracts;
        private Long draftContracts;
        private Long pendingSignature;
        private Long effectiveContracts;
        private Long expiredContracts;
        private Long terminatedContracts;
        
        // 构造函数、getter、setter
        public ContractStatistics() {}
        
        public ContractStatistics(Long totalContracts, Long draftContracts, Long pendingSignature,
                                Long effectiveContracts, Long expiredContracts, Long terminatedContracts) {
            this.totalContracts = totalContracts;
            this.draftContracts = draftContracts;
            this.pendingSignature = pendingSignature;
            this.effectiveContracts = effectiveContracts;
            this.expiredContracts = expiredContracts;
            this.terminatedContracts = terminatedContracts;
        }
        
        public Long getTotalContracts() { return totalContracts; }
        public void setTotalContracts(Long totalContracts) { this.totalContracts = totalContracts; }
        
        public Long getDraftContracts() { return draftContracts; }
        public void setDraftContracts(Long draftContracts) { this.draftContracts = draftContracts; }
        
        public Long getPendingSignature() { return pendingSignature; }
        public void setPendingSignature(Long pendingSignature) { this.pendingSignature = pendingSignature; }
        
        public Long getEffectiveContracts() { return effectiveContracts; }
        public void setEffectiveContracts(Long effectiveContracts) { this.effectiveContracts = effectiveContracts; }
        
        public Long getExpiredContracts() { return expiredContracts; }
        public void setExpiredContracts(Long expiredContracts) { this.expiredContracts = expiredContracts; }
        
        public Long getTerminatedContracts() { return terminatedContracts; }
        public void setTerminatedContracts(Long terminatedContracts) { this.terminatedContracts = terminatedContracts; }
    }
    
    /**
     * 批量导入结果
     */
    class BatchImportResult {
        private int totalCount;
        private int successCount;
        private int failureCount;
        private List<String> errors;
        
        public BatchImportResult(int totalCount, int successCount, int failureCount, List<String> errors) {
            this.totalCount = totalCount;
            this.successCount = successCount;
            this.failureCount = failureCount;
            this.errors = errors;
        }
        
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
        
        public int getSuccessCount() { return successCount; }
        public void setSuccessCount(int successCount) { this.successCount = successCount; }
        
        public int getFailureCount() { return failureCount; }
        public void setFailureCount(int failureCount) { this.failureCount = failureCount; }
        
        public List<String> getErrors() { return errors; }
        public void setErrors(List<String> errors) { this.errors = errors; }
    }
}