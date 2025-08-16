package com.drmp.service.impl;

import com.drmp.dto.request.CasePackageCreateRequest;
import com.drmp.dto.request.CasePackageQueryRequest;
import com.drmp.dto.request.CasePackageUpdateRequest;
import com.drmp.dto.response.CasePackageDetailResponse;
import com.drmp.dto.response.CasePackageListResponse;
import com.drmp.dto.response.CasePackageStatisticsResponse;
import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.exception.BusinessException;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.repository.CasePackageRepository;
import com.drmp.repository.OrganizationRepository;
import com.drmp.service.CasePackageService;
import com.drmp.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Case Package Service Implementation
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CasePackageServiceImpl implements CasePackageService {

    private final CasePackageRepository casePackageRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public CasePackageDetailResponse createCasePackage(CasePackageCreateRequest request) {
        log.info("Creating case package: {}", request.getPackageName());
        
        // 验证当前用户权限
        Long currentOrgId = SecurityUtils.getCurrentUserOrganizationId();
        if (currentOrgId == null) {
            throw new BusinessException("用户未绑定机构");
        }
        
        Organization sourceOrg = organizationRepository.findById(currentOrgId)
            .orElseThrow(() -> new ResourceNotFoundException("机构不存在"));
            
        // 验证包编号唯一性
        if (casePackageRepository.existsByPackageCode(request.getPackageCode())) {
            throw new BusinessException("案件包编号已存在");
        }
        
        // 创建案件包
        CasePackage casePackage = CasePackage.builder()
            .packageCode(request.getPackageCode())
            .packageName(request.getPackageName())
            .sourceOrganization(sourceOrg)
            .status(CasePackageStatus.DRAFT)
            .caseCount(request.getCaseCount())
            .totalAmount(request.getTotalAmount())
            .remainingAmount(request.getTotalAmount())
            .expectedRecoveryRate(request.getExpectedRecoveryRate())
            .expectedDisposalDays(request.getExpectedDisposalDays())
            .preferredDisposalMethods(request.getPreferredDisposalMethods())
            .assignmentStrategy(request.getAssignmentStrategy())
            .assignmentRules(request.getAssignmentRules())
            .entrustStartDate(request.getEntrustStartDate())
            .entrustEndDate(request.getEntrustEndDate())
            .description(request.getDescription())
            .build();
            
        casePackage = casePackageRepository.save(casePackage);
        
        log.info("Case package created successfully: {}", casePackage.getId());
        return convertToDetailResponse(casePackage);
    }

    @Override
    public CasePackageDetailResponse updateCasePackage(Long id, CasePackageUpdateRequest request) {
        log.info("Updating case package: {}", id);
        
        CasePackage casePackage = getCasePackageEntity(id);
        
        // 验证权限
        validateOrganizationPermission(casePackage.getSourceOrganization().getId());
        
        // 验证状态
        if (casePackage.getStatus() != CasePackageStatus.DRAFT) {
            throw new BusinessException("只能修改草稿状态的案件包");
        }
        
        // 更新字段
        if (request.getPackageName() != null) {
            casePackage.setPackageName(request.getPackageName());
        }
        if (request.getExpectedRecoveryRate() != null) {
            casePackage.setExpectedRecoveryRate(request.getExpectedRecoveryRate());
        }
        if (request.getExpectedDisposalDays() != null) {
            casePackage.setExpectedDisposalDays(request.getExpectedDisposalDays());
        }
        if (request.getPreferredDisposalMethods() != null) {
            casePackage.setPreferredDisposalMethods(request.getPreferredDisposalMethods());
        }
        if (request.getAssignmentStrategy() != null) {
            casePackage.setAssignmentStrategy(request.getAssignmentStrategy());
        }
        if (request.getAssignmentRules() != null) {
            casePackage.setAssignmentRules(request.getAssignmentRules());
        }
        if (request.getDescription() != null) {
            casePackage.setDescription(request.getDescription());
        }
        
        casePackage = casePackageRepository.save(casePackage);
        
        log.info("Case package updated successfully: {}", id);
        return convertToDetailResponse(casePackage);
    }

    @Override
    public void deleteCasePackage(Long id) {
        log.info("Deleting case package: {}", id);
        
        CasePackage casePackage = getCasePackageEntity(id);
        
        // 验证权限
        validateOrganizationPermission(casePackage.getSourceOrganization().getId());
        
        // 验证状态
        if (casePackage.getStatus() != CasePackageStatus.DRAFT) {
            throw new BusinessException("只能删除草稿状态的案件包");
        }
        
        casePackageRepository.delete(casePackage);
        
        log.info("Case package deleted successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public CasePackageDetailResponse getCasePackageDetail(Long id) {
        CasePackage casePackage = getCasePackageEntity(id);
        return convertToDetailResponse(casePackage);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CasePackageListResponse> getCasePackageList(CasePackageQueryRequest request, Pageable pageable) {
        Page<CasePackage> casePackages = casePackageRepository.findWithFilters(
            request.getKeyword(),
            request.getStatus(),
            request.getSourceOrgId(),
            request.getDisposalOrgId(),
            pageable
        );
        
        return casePackages.map(this::convertToListResponse);
    }

    @Override
    public CasePackageDetailResponse publishCasePackage(Long id) {
        log.info("Publishing case package: {}", id);
        
        CasePackage casePackage = getCasePackageEntity(id);
        
        // 验证权限
        validateOrganizationPermission(casePackage.getSourceOrganization().getId());
        
        // 验证状态
        if (casePackage.getStatus() != CasePackageStatus.DRAFT) {
            throw new BusinessException("只能发布草稿状态的案件包");
        }
        
        // 验证必要信息
        if (casePackage.getCaseCount() == null || casePackage.getCaseCount() <= 0) {
            throw new BusinessException("案件包必须包含案件");
        }
        
        casePackage.setStatus(CasePackageStatus.PUBLISHED);
        casePackage.setPublishedAt(LocalDateTime.now());
        
        casePackage = casePackageRepository.save(casePackage);
        
        log.info("Case package published successfully: {}", id);
        return convertToDetailResponse(casePackage);
    }

    @Override
    public CasePackageDetailResponse withdrawCasePackage(Long id) {
        log.info("Withdrawing case package: {}", id);
        
        CasePackage casePackage = getCasePackageEntity(id);
        
        // 验证权限
        validateOrganizationPermission(casePackage.getSourceOrganization().getId());
        
        // 验证状态
        if (casePackage.getStatus() != CasePackageStatus.PUBLISHED) {
            throw new BusinessException("只能撤回已发布的案件包");
        }
        
        casePackage.setStatus(CasePackageStatus.WITHDRAWN);
        
        casePackage = casePackageRepository.save(casePackage);
        
        log.info("Case package withdrawn successfully: {}", id);
        return convertToDetailResponse(casePackage);
    }

    @Override
    public CasePackageDetailResponse assignCasePackage(Long id, Long disposalOrgId) {
        log.info("Assigning case package {} to organization {}", id, disposalOrgId);
        
        CasePackage casePackage = getCasePackageEntity(id);
        
        // 验证权限
        validateOrganizationPermission(casePackage.getSourceOrganization().getId());
        
        // 验证状态
        if (casePackage.getStatus() != CasePackageStatus.PUBLISHED) {
            throw new BusinessException("只能分配已发布的案件包");
        }
        
        Organization disposalOrg = organizationRepository.findById(disposalOrgId)
            .orElseThrow(() -> new ResourceNotFoundException("处置机构不存在"));
            
        casePackage.setDisposalOrganization(disposalOrg);
        casePackage.setStatus(CasePackageStatus.ASSIGNED);
        casePackage.setAssignedAt(LocalDateTime.now());
        
        casePackage = casePackageRepository.save(casePackage);
        
        log.info("Case package assigned successfully: {}", id);
        return convertToDetailResponse(casePackage);
    }

    @Override
    public CasePackageDetailResponse acceptCasePackage(Long id) {
        log.info("Accepting case package: {}", id);
        
        CasePackage casePackage = getCasePackageEntity(id);
        
        // 验证权限（处置机构）
        if (casePackage.getDisposalOrganization() == null) {
            throw new BusinessException("案件包未分配");
        }
        validateOrganizationPermission(casePackage.getDisposalOrganization().getId());
        
        // 验证状态
        if (casePackage.getStatus() != CasePackageStatus.ASSIGNED) {
            throw new BusinessException("只能接受已分配的案件包");
        }
        
        casePackage.setStatus(CasePackageStatus.IN_PROGRESS);
        casePackage.setAcceptedAt(LocalDateTime.now());
        
        casePackage = casePackageRepository.save(casePackage);
        
        log.info("Case package accepted successfully: {}", id);
        return convertToDetailResponse(casePackage);
    }

    @Override
    public CasePackageDetailResponse rejectCasePackage(Long id, String reason) {
        log.info("Rejecting case package: {} with reason: {}", id, reason);
        
        CasePackage casePackage = getCasePackageEntity(id);
        
        // 验证权限（处置机构）
        if (casePackage.getDisposalOrganization() == null) {
            throw new BusinessException("案件包未分配");
        }
        validateOrganizationPermission(casePackage.getDisposalOrganization().getId());
        
        // 验证状态
        if (casePackage.getStatus() != CasePackageStatus.ASSIGNED) {
            throw new BusinessException("只能拒绝已分配的案件包");
        }
        
        casePackage.setDisposalOrganization(null);
        casePackage.setStatus(CasePackageStatus.PUBLISHED);
        casePackage.setAssignedAt(null);
        
        casePackage = casePackageRepository.save(casePackage);
        
        log.info("Case package rejected successfully: {}", id);
        return convertToDetailResponse(casePackage);
    }

    @Override
    public CasePackageDetailResponse completeCasePackage(Long id) {
        log.info("Completing case package: {}", id);
        
        CasePackage casePackage = getCasePackageEntity(id);
        
        // 验证权限
        if (casePackage.getDisposalOrganization() != null) {
            validateOrganizationPermission(casePackage.getDisposalOrganization().getId());
        } else {
            validateOrganizationPermission(casePackage.getSourceOrganization().getId());
        }
        
        // 验证状态
        if (casePackage.getStatus() != CasePackageStatus.IN_PROGRESS) {
            throw new BusinessException("只能完成进行中的案件包");
        }
        
        casePackage.setStatus(CasePackageStatus.COMPLETED);
        casePackage.setClosedAt(LocalDateTime.now());
        
        casePackage = casePackageRepository.save(casePackage);
        
        log.info("Case package completed successfully: {}", id);
        return convertToDetailResponse(casePackage);
    }

    @Override
    @Async
    public CompletableFuture<BatchImportResult> batchImportCases(Long casePackageId, MultipartFile file) {
        log.info("Starting batch import for case package: {}", casePackageId);
        
        try {
            CasePackage casePackage = getCasePackageEntity(casePackageId);
            
            // 验证权限
            validateOrganizationPermission(casePackage.getSourceOrganization().getId());
            
            // 验证状态
            if (casePackage.getStatus() != CasePackageStatus.DRAFT) {
                throw new BusinessException("只能向草稿状态的案件包导入案件");
            }
            
            // 生成任务ID
            String taskId = UUID.randomUUID().toString();
            
            // TODO: 实现Excel/CSV文件解析和批量导入逻辑
            // 这里暂时返回模拟结果
            Thread.sleep(2000); // 模拟处理时间
            
            BatchImportResult result = new BatchImportResult(
                true, 100, 98, 2, 
                List.of("第10行：身份证格式错误", "第50行：金额字段为空"),
                taskId
            );
            
            log.info("Batch import completed for case package: {}", casePackageId);
            return CompletableFuture.completedFuture(result);
            
        } catch (Exception e) {
            log.error("Batch import failed for case package: {}", casePackageId, e);
            BatchImportResult result = new BatchImportResult(
                false, 0, 0, 0,
                List.of("导入失败：" + e.getMessage()),
                UUID.randomUUID().toString()
            );
            return CompletableFuture.completedFuture(result);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CasePackageStatisticsResponse getCasePackageStatistics(Long organizationId) {
        // TODO: 实现统计信息查询
        return new CasePackageStatisticsResponse();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CasePackageListResponse> getMarketCasePackages(CasePackageQueryRequest request, Pageable pageable) {
        Page<CasePackage> casePackages = casePackageRepository.findMarketPackages(
            request.getMinAmount(),
            request.getMaxAmount(),
            request.getMinOverdueDays(),
            request.getMaxOverdueDays(),
            pageable
        );
        
        return casePackages.map(this::convertToListResponse);
    }

    @Override
    public String applyCasePackage(Long id, String proposal) {
        log.info("Applying for case package: {} with proposal: {}", id, proposal);
        
        CasePackage casePackage = getCasePackageEntity(id);
        
        // 验证状态
        if (casePackage.getStatus() != CasePackageStatus.PUBLISHED) {
            throw new BusinessException("只能申请已发布的案件包");
        }
        
        if (casePackage.getDisposalOrganization() != null) {
            throw new BusinessException("案件包已被分配");
        }
        
        // TODO: 实现申请逻辑，创建申请记录
        String applicationId = UUID.randomUUID().toString();
        
        log.info("Case package application submitted: {}", applicationId);
        return applicationId;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CasePackageListResponse> getOrganizationCasePackageHistory(Long organizationId, 
                                                                           CasePackageStatus status, 
                                                                           Pageable pageable) {
        Page<CasePackage> casePackages;
        
        if (status != null) {
            casePackages = casePackageRepository.findBySourceOrganizationIdAndStatus(organizationId, status, pageable);
        } else {
            casePackages = casePackageRepository.findBySourceOrganizationId(organizationId, pageable);
        }
        
        return casePackages.map(this::convertToListResponse);
    }

    @Override
    public List<String> smartAssignCasePackage(Long id) {
        log.info("Smart assigning case package: {}", id);
        
        CasePackage casePackage = getCasePackageEntity(id);
        
        // 验证权限
        validateOrganizationPermission(casePackage.getSourceOrganization().getId());
        
        // TODO: 实现智能分案逻辑
        List<String> recommendations = new ArrayList<>();
        recommendations.add("推荐机构1：匹配度95%");
        recommendations.add("推荐机构2：匹配度88%");
        recommendations.add("推荐机构3：匹配度82%");
        
        log.info("Smart assignment completed for case package: {}", id);
        return recommendations;
    }

    @Override
    public BatchOperationResult batchOperateCasePackages(List<Long> ids, String action) {
        log.info("Batch operating case packages: {} with action: {}", ids, action);
        
        if (ids == null || ids.isEmpty()) {
            return new BatchOperationResult(true, 0, 0, 0, new ArrayList<>());
        }
        
        int totalCount = ids.size();
        List<String> errors = new ArrayList<>();
        
        try {
            // 批量预加载所有案件包，避免N+1查询
            List<CasePackage> casePackages = casePackageRepository.findAllWithOrganizations(ids);
            Map<Long, CasePackage> casePackageMap = casePackages.stream()
                    .collect(Collectors.toMap(CasePackage::getId, Function.identity()));
            
            // 获取当前用户的机构ID进行权限验证
            Long currentOrgId = SecurityUtils.getCurrentUserOrganizationId();
            
            List<CasePackage> updatedPackages = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();
            
            for (Long id : ids) {
                try {
                    CasePackage casePackage = casePackageMap.get(id);
                    if (casePackage == null) {
                        errors.add("案件包 " + id + "：不存在");
                        continue;
                    }
                    
                    // 权限验证
                    if (currentOrgId == null || !currentOrgId.equals(casePackage.getSourceOrganization().getId())) {
                        errors.add("案件包 " + id + "：无权限操作");
                        continue;
                    }
                    
                    // 执行批量操作
                    boolean shouldUpdate = false;
                    switch (action.toLowerCase()) {
                        case "publish":
                            if (casePackage.getStatus() != CasePackageStatus.DRAFT) {
                                errors.add("案件包 " + id + "：只能发布草稿状态的案件包");
                                continue;
                            }
                            if (casePackage.getCaseCount() == null || casePackage.getCaseCount() <= 0) {
                                errors.add("案件包 " + id + "：案件包必须包含案件");
                                continue;
                            }
                            casePackage.setStatus(CasePackageStatus.PUBLISHED);
                            casePackage.setPublishedAt(now);
                            shouldUpdate = true;
                            break;
                            
                        case "withdraw":
                            if (casePackage.getStatus() != CasePackageStatus.PUBLISHED) {
                                errors.add("案件包 " + id + "：只能撤回已发布的案件包");
                                continue;
                            }
                            casePackage.setStatus(CasePackageStatus.WITHDRAWN);
                            shouldUpdate = true;
                            break;
                            
                        case "delete":
                            if (casePackage.getStatus() != CasePackageStatus.DRAFT) {
                                errors.add("案件包 " + id + "：只能删除草稿状态的案件包");
                                continue;
                            }
                            // 删除操作单独处理，不加入更新列表
                            casePackageRepository.delete(casePackage);
                            break;
                            
                        default:
                            errors.add("案件包 " + id + "：不支持的操作类型 " + action);
                            continue;
                    }
                    
                    if (shouldUpdate) {
                        updatedPackages.add(casePackage);
                    }
                    
                } catch (Exception e) {
                    log.error("Error processing case package {}: {}", id, e.getMessage(), e);
                    errors.add("案件包 " + id + "：" + e.getMessage());
                }
            }
            
            // 批量保存更新的案件包，提高数据库操作效率
            if (!updatedPackages.isEmpty()) {
                casePackageRepository.saveAll(updatedPackages);
                log.info("Batch saved {} updated case packages", updatedPackages.size());
            }
            
            int successCount = totalCount - errors.size();
            int failedCount = errors.size();
            boolean success = successCount == totalCount;
            
            log.info("Batch operation completed: {}/{} successful", successCount, totalCount);
            return new BatchOperationResult(success, totalCount, successCount, failedCount, errors);
            
        } catch (Exception e) {
            log.error("Batch operation failed completely", e);
            errors.add("批量操作失败：" + e.getMessage());
            return new BatchOperationResult(false, totalCount, 0, totalCount, errors);
        }
    }

    // 私有方法

    private CasePackage getCasePackageEntity(Long id) {
        return casePackageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("案件包不存在"));
    }

    private void validateOrganizationPermission(Long organizationId) {
        Long currentOrgId = SecurityUtils.getCurrentUserOrganizationId();
        if (currentOrgId == null || !currentOrgId.equals(organizationId)) {
            throw new BusinessException("无权限操作该案件包");
        }
    }

    private CasePackageDetailResponse convertToDetailResponse(CasePackage casePackage) {
        CasePackageDetailResponse response = new CasePackageDetailResponse();
        response.setId(casePackage.getId());
        response.setPackageCode(casePackage.getPackageCode());
        response.setPackageName(casePackage.getPackageName());
        response.setStatus(casePackage.getStatus());
        response.setCaseCount(casePackage.getCaseCount());
        response.setTotalAmount(casePackage.getTotalAmount());
        response.setRemainingAmount(casePackage.getRemainingAmount());
        response.setExpectedRecoveryRate(casePackage.getExpectedRecoveryRate());
        response.setExpectedDisposalDays(casePackage.getExpectedDisposalDays());
        response.setPreferredDisposalMethods(casePackage.getPreferredDisposalMethods());
        response.setAssignmentStrategy(casePackage.getAssignmentStrategy());
        response.setAssignmentRules(casePackage.getAssignmentRules());
        response.setPublishedAt(casePackage.getPublishedAt());
        response.setAssignedAt(casePackage.getAssignedAt());
        response.setAcceptedAt(casePackage.getAcceptedAt());
        response.setClosedAt(casePackage.getClosedAt());
        response.setEntrustStartDate(casePackage.getEntrustStartDate());
        response.setEntrustEndDate(casePackage.getEntrustEndDate());
        response.setDescription(casePackage.getDescription());
        response.setCreatedAt(casePackage.getCreatedAt());
        response.setUpdatedAt(casePackage.getUpdatedAt());
        
        if (casePackage.getSourceOrganization() != null) {
            response.setSourceOrgId(casePackage.getSourceOrganization().getId());
            response.setSourceOrgName(casePackage.getSourceOrganization().getName());
        }
        
        if (casePackage.getDisposalOrganization() != null) {
            response.setDisposalOrgId(casePackage.getDisposalOrganization().getId());
            response.setDisposalOrgName(casePackage.getDisposalOrganization().getName());
        }
        
        return response;
    }

    private CasePackageListResponse convertToListResponse(CasePackage casePackage) {
        CasePackageListResponse response = new CasePackageListResponse();
        response.setId(casePackage.getId());
        response.setPackageCode(casePackage.getPackageCode());
        response.setPackageName(casePackage.getPackageName());
        response.setStatus(casePackage.getStatus());
        response.setCaseCount(casePackage.getCaseCount());
        response.setTotalAmount(casePackage.getTotalAmount());
        response.setRemainingAmount(casePackage.getRemainingAmount());
        response.setExpectedRecoveryRate(casePackage.getExpectedRecoveryRate());
        response.setPublishedAt(casePackage.getPublishedAt());
        response.setCreatedAt(casePackage.getCreatedAt());
        
        if (casePackage.getSourceOrganization() != null) {
            response.setSourceOrgName(casePackage.getSourceOrganization().getName());
        }
        
        if (casePackage.getDisposalOrganization() != null) {
            response.setDisposalOrgName(casePackage.getDisposalOrganization().getName());
        }
        
        return response;
    }
}