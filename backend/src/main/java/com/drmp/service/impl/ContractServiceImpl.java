package com.drmp.service.impl;

import com.drmp.dto.request.ContractCreateRequest;
import com.drmp.dto.request.ContractUpdateRequest;
import com.drmp.dto.response.ContractDetailResponse;
import com.drmp.dto.response.ContractListResponse;
import com.drmp.entity.Contract;
import com.drmp.entity.enums.ContractStatus;
import com.drmp.entity.enums.ContractType;
import com.drmp.exception.BusinessException;
import com.drmp.exception.ErrorCode;
import com.drmp.repository.ContractRepository;
import com.drmp.service.ContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 合同服务实现
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ContractServiceImpl implements ContractService {
    
    private final ContractRepository contractRepository;
    
    @Override
    public ContractDetailResponse createContract(ContractCreateRequest request) {
        log.info("Creating contract with type: {}", request.getContractType());
        
        // 验证合同编号
        if (request.getContractNumber() != null && 
            contractRepository.existsByContractNumber(request.getContractNumber())) {
            throw new BusinessException(ErrorCode.CONTRACT_NUMBER_EXISTS);
        }
        
        Contract contract = new Contract();
        BeanUtils.copyProperties(request, contract);
        
        // 生成合同编号（如果未提供）
        if (contract.getContractNumber() == null || contract.getContractNumber().isEmpty()) {
            contract.setContractNumber(generateContractNumber(request.getContractType()));
        }
        
        // 设置初始状态
        contract.setStatus(ContractStatus.DRAFT);
        contract.setVersion(1);
        
        Contract savedContract = contractRepository.save(contract);
        log.info("Contract created successfully with ID: {}", savedContract.getId());
        
        return convertToDetailResponse(savedContract);
    }
    
    @Override
    public ContractDetailResponse updateContract(Long contractId, ContractUpdateRequest request) {
        log.info("Updating contract with ID: {}", contractId);
        
        Contract contract = getContractEntity(contractId);
        
        // 检查是否可以修改
        if (contract.getStatus().isFinalStatus()) {
            throw new BusinessException(ErrorCode.CONTRACT_CANNOT_BE_MODIFIED);
        }
        
        // 更新字段
        BeanUtils.copyProperties(request, contract, "id", "contractNumber", "status", "version");
        
        Contract savedContract = contractRepository.save(contract);
        log.info("Contract updated successfully: {}", contractId);
        
        return convertToDetailResponse(savedContract);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ContractDetailResponse getContractById(Long contractId) {
        Contract contract = getContractEntity(contractId);
        return convertToDetailResponse(contract);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ContractDetailResponse getContractByNumber(String contractNumber) {
        Contract contract = contractRepository.findByContractNumber(contractNumber)
            .orElseThrow(() -> new BusinessException(ErrorCode.CONTRACT_NOT_FOUND));
        return convertToDetailResponse(contract);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ContractListResponse> getContractList(Pageable pageable) {
        return contractRepository.findAll(pageable)
            .map(this::convertToListResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ContractListResponse> searchContracts(ContractType contractType, ContractStatus status,
                                                    Long partyAId, Long partyBId,
                                                    LocalDate startDate, LocalDate endDate,
                                                    Pageable pageable) {
        return contractRepository.findByConditions(contractType, status, partyAId, partyBId, 
                                                  startDate, endDate, pageable)
            .map(this::convertToListResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ContractListResponse> searchByKeyword(String keyword, Pageable pageable) {
        return contractRepository.searchByKeyword(keyword, pageable)
            .map(this::convertToListResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ContractListResponse> getCasePackageContracts(Long casePackageId) {
        return contractRepository.findByCasePackageId(casePackageId)
            .stream()
            .map(this::convertToListResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ContractListResponse> getCaseContracts(Long caseId) {
        return contractRepository.findByCaseId(caseId)
            .stream()
            .map(this::convertToListResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ContractListResponse> getOrganizationContracts(Long organizationId, Pageable pageable) {
        return contractRepository.findByOrganizationId(organizationId, pageable)
            .map(this::convertToListResponse);
    }
    
    @Override
    public void submitForReview(Long contractId) {
        log.info("Submitting contract for review: {}", contractId);
        
        Contract contract = getContractEntity(contractId);
        
        if (contract.getStatus() != ContractStatus.DRAFT) {
            throw new BusinessException(ErrorCode.INVALID_CONTRACT_STATUS);
        }
        
        contract.setStatus(ContractStatus.PENDING_REVIEW);
        contractRepository.save(contract);
        
        log.info("Contract submitted for review: {}", contractId);
    }
    
    @Override
    public void reviewContract(Long contractId, boolean approved, String comments, 
                             Long reviewerId, String reviewerName) {
        log.info("Reviewing contract {}: approved={}", contractId, approved);
        
        Contract contract = getContractEntity(contractId);
        
        if (contract.getStatus() != ContractStatus.PENDING_REVIEW && 
            contract.getStatus() != ContractStatus.REVIEWING) {
            throw new BusinessException(ErrorCode.INVALID_CONTRACT_STATUS);
        }
        
        contract.setReviewerId(reviewerId);
        contract.setReviewerName(reviewerName);
        contract.setReviewComments(comments);
        contract.setReviewedAt(java.time.LocalDateTime.now());
        
        if (approved) {
            contract.setStatus(ContractStatus.APPROVED);
            log.info("Contract approved: {}", contractId);
        } else {
            contract.setStatus(ContractStatus.REJECTED);
            log.info("Contract rejected: {}", contractId);
        }
        
        contractRepository.save(contract);
    }
    
    @Override
    public void sendForSignature(Long contractId) {
        log.info("Sending contract for signature: {}", contractId);
        
        Contract contract = getContractEntity(contractId);
        
        if (contract.getStatus() != ContractStatus.APPROVED) {
            throw new BusinessException(ErrorCode.INVALID_CONTRACT_STATUS);
        }
        
        contract.setStatus(ContractStatus.PENDING_SIGNATURE);
        contractRepository.save(contract);
        
        log.info("Contract sent for signature: {}", contractId);
    }
    
    @Override
    public void signContract(Long contractId, String partyType, String signerName) {
        log.info("Signing contract {}: party={}, signer={}", contractId, partyType, signerName);
        
        Contract contract = getContractEntity(contractId);
        
        if (!contract.getStatus().needsSignature()) {
            throw new BusinessException(ErrorCode.INVALID_CONTRACT_STATUS);
        }
        
        switch (partyType.toUpperCase()) {
            case "A":
                contract.signByPartyA(signerName);
                break;
            case "B":
                contract.signByPartyB(signerName);
                break;
            case "C":
                if (contract.getPartyCId() == null) {
                    throw new BusinessException(ErrorCode.INVALID_PARTY_FOR_CONTRACT);
                }
                contract.signByPartyC(signerName);
                break;
            default:
                throw new BusinessException(ErrorCode.INVALID_PARTY_TYPE);
        }
        
        contractRepository.save(contract);
        log.info("Contract signed by party {}: {}", partyType, contractId);
    }
    
    @Override
    public void makeContractEffective(Long contractId) {
        log.info("Making contract effective: {}", contractId);
        
        Contract contract = getContractEntity(contractId);
        
        if (!contract.isFullySigned()) {
            throw new BusinessException(ErrorCode.CONTRACT_NOT_FULLY_SIGNED);
        }
        
        contract.makeEffective();
        contractRepository.save(contract);
        
        log.info("Contract made effective: {}", contractId);
    }
    
    @Override
    public void suspendContract(Long contractId) {
        log.info("Suspending contract: {}", contractId);
        
        Contract contract = getContractEntity(contractId);
        contract.suspend();
        contractRepository.save(contract);
        
        log.info("Contract suspended: {}", contractId);
    }
    
    @Override
    public void resumeContract(Long contractId) {
        log.info("Resuming contract: {}", contractId);
        
        Contract contract = getContractEntity(contractId);
        contract.resume();
        contractRepository.save(contract);
        
        log.info("Contract resumed: {}", contractId);
    }
    
    @Override
    public void terminateContract(Long contractId) {
        log.info("Terminating contract: {}", contractId);
        
        Contract contract = getContractEntity(contractId);
        contract.terminate();
        contractRepository.save(contract);
        
        log.info("Contract terminated: {}", contractId);
    }
    
    @Override
    public void cancelContract(Long contractId) {
        log.info("Cancelling contract: {}", contractId);
        
        Contract contract = getContractEntity(contractId);
        
        if (contract.getStatus().isFinalStatus()) {
            throw new BusinessException(ErrorCode.CONTRACT_CANNOT_BE_CANCELLED);
        }
        
        contract.setStatus(ContractStatus.CANCELLED);
        contractRepository.save(contract);
        
        log.info("Contract cancelled: {}", contractId);
    }
    
    @Override
    public ContractDetailResponse renewContract(Long contractId, LocalDate newExpiryDate) {
        log.info("Renewing contract {}: new expiry date={}", contractId, newExpiryDate);
        
        Contract originalContract = getContractEntity(contractId);
        
        if (!originalContract.isEffective()) {
            throw new BusinessException(ErrorCode.CONTRACT_NOT_EFFECTIVE);
        }
        
        // 创建新版本合同
        Contract renewedContract = new Contract();
        BeanUtils.copyProperties(originalContract, renewedContract, "id", "contractNumber", "version");
        
        renewedContract.setContractNumber(generateContractNumber(originalContract.getContractType()));
        renewedContract.setVersion(originalContract.getVersion() + 1);
        renewedContract.setParentContractId(originalContract.getId());
        renewedContract.setExpiryDate(newExpiryDate);
        renewedContract.setStatus(ContractStatus.DRAFT);
        
        // 清除签署信息
        renewedContract.setPartyASignedAt(null);
        renewedContract.setPartyBSignedAt(null);
        renewedContract.setPartyCSignedAt(null);
        renewedContract.setPartyASigner(null);
        renewedContract.setPartyBSigner(null);
        renewedContract.setPartyCSigner(null);
        
        Contract savedContract = contractRepository.save(renewedContract);
        log.info("Contract renewed: original={}, new={}", contractId, savedContract.getId());
        
        return convertToDetailResponse(savedContract);
    }
    
    @Override
    public String generateContractNumber(ContractType contractType) {
        String prefix = getContractTypePrefix(contractType);
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        // 查找当天最大编号
        String pattern = prefix + datePart + "%";
        long count = contractRepository.count(); // 简化实现，实际可能需要更复杂的逻辑
        
        String sequence = String.format("%04d", count + 1);
        return prefix + datePart + sequence;
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isContractNumberAvailable(String contractNumber) {
        return !contractRepository.existsByContractNumber(contractNumber);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ContractListResponse> getExpiringContracts(int days) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(days);
        List<ContractStatus> activeStatuses = Arrays.asList(ContractStatus.EFFECTIVE, ContractStatus.SUSPENDED);
        
        return contractRepository.findExpiringContracts(startDate, endDate, activeStatuses)
            .stream()
            .map(this::convertToListResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ContractListResponse> getExpiredContracts() {
        List<ContractStatus> activeStatuses = Arrays.asList(ContractStatus.EFFECTIVE, ContractStatus.SUSPENDED);
        
        return contractRepository.findExpiredContracts(LocalDate.now(), activeStatuses)
            .stream()
            .map(this::convertToListResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ContractListResponse> getPendingSignatureContracts() {
        return contractRepository.findPendingSignatureContracts()
            .stream()
            .map(this::convertToListResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ContractListResponse> getContractsRequiringReview() {
        return contractRepository.findContractsRequiringReview()
            .stream()
            .map(this::convertToListResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    public void deleteContract(Long contractId) {
        log.info("Deleting contract: {}", contractId);
        
        Contract contract = getContractEntity(contractId);
        
        // 只能删除草稿状态的合同
        if (contract.getStatus() != ContractStatus.DRAFT && contract.getStatus() != ContractStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.CONTRACT_CANNOT_BE_DELETED);
        }
        
        contractRepository.delete(contract);
        log.info("Contract deleted: {}", contractId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ContractStatistics getContractStatistics() {
        List<Object[]> statusCounts = contractRepository.countByStatus();
        
        Long total = contractRepository.count();
        Long draft = 0L, pendingSignature = 0L, effective = 0L, expired = 0L, terminated = 0L;
        
        for (Object[] row : statusCounts) {
            ContractStatus status = (ContractStatus) row[0];
            Long count = (Long) row[1];
            
            switch (status) {
                case DRAFT:
                    draft = count;
                    break;
                case PENDING_SIGNATURE:
                case PARTIALLY_SIGNED:
                    pendingSignature += count;
                    break;
                case EFFECTIVE:
                    effective = count;
                    break;
                case EXPIRED:
                    expired = count;
                    break;
                case TERMINATED:
                    terminated = count;
                    break;
            }
        }
        
        return new ContractStatistics(total, draft, pendingSignature, effective, expired, terminated);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ContractStatistics getOrganizationContractStatistics(Long organizationId) {
        // 简化实现，实际需要更复杂的统计逻辑
        Long totalContracts = contractRepository.countByOrganizationId(organizationId);
        return new ContractStatistics(totalContracts, 0L, 0L, 0L, 0L, 0L);
    }
    
    @Override
    public byte[] exportContracts(List<Long> contractIds) {
        // TODO: 实现导出功能
        throw new BusinessException(ErrorCode.FEATURE_NOT_IMPLEMENTED);
    }
    
    @Override
    public BatchImportResult batchImportContracts(List<ContractCreateRequest> contracts) {
        // TODO: 实现批量导入功能
        throw new BusinessException(ErrorCode.FEATURE_NOT_IMPLEMENTED);
    }
    
    /**
     * 获取合同实体
     */
    private Contract getContractEntity(Long contractId) {
        return contractRepository.findById(contractId)
            .orElseThrow(() -> new BusinessException(ErrorCode.CONTRACT_NOT_FOUND));
    }
    
    /**
     * 获取合同类型前缀
     */
    private String getContractTypePrefix(ContractType contractType) {
        switch (contractType) {
            case DISPOSAL_CONTRACT:
                return "DC";
            case PAYMENT_AGREEMENT:
                return "PA";
            case SETTLEMENT_AGREEMENT:
                return "SA";
            case SERVICE_AGREEMENT:
                return "SV";
            case CONFIDENTIALITY_AGREEMENT:
                return "CA";
            case FRAMEWORK_AGREEMENT:
                return "FA";
            case SUPPLEMENTARY_AGREEMENT:
                return "SU";
            case TERMINATION_AGREEMENT:
                return "TA";
            default:
                return "CT";
        }
    }
    
    /**
     * 转换为详情响应
     */
    private ContractDetailResponse convertToDetailResponse(Contract contract) {
        ContractDetailResponse response = new ContractDetailResponse();
        BeanUtils.copyProperties(contract, response);
        return response;
    }
    
    /**
     * 转换为列表响应
     */
    private ContractListResponse convertToListResponse(Contract contract) {
        ContractListResponse response = new ContractListResponse();
        BeanUtils.copyProperties(contract, response);
        return response;
    }
}