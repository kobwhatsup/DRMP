package com.drmp.service.impl;

import com.drmp.dto.request.*;
import com.drmp.dto.response.*;
import com.drmp.entity.CasePackage;
import com.drmp.entity.CasePackageBid;
import com.drmp.entity.Case;
import com.drmp.entity.Organization;
import com.drmp.entity.AssignmentRule;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.entity.enums.AssignmentType;
import com.drmp.exception.BusinessException;
import com.drmp.repository.*;
import com.drmp.service.CasePackageService;
import com.drmp.utils.ExcelUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.criteria.Predicate;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.util.stream.Collectors;

/**
 * 案件包服务实现
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CasePackageServiceImpl implements CasePackageService {
    
    private final CasePackageRepository casePackageRepository;
    private final CasePackageBidRepository casePackageBidRepository;
    private final CaseRepository caseRepository;
    private final OrganizationRepository organizationRepository;
    private final AssignmentRuleRepository assignmentRuleRepository;
    
    @Override
    @Transactional
    public CasePackage createCasePackage(CasePackageCreateRequest request) {
        log.info("Creating case package: {}", request.getPackageName());
        
        // 检查案件包名称是否重复
        if (casePackageRepository.existsByPackageName(request.getPackageName())) {
            throw new BusinessException("案件包名称已存在");
        }
        
        CasePackage casePackage = new CasePackage();
        casePackage.setPackageCode(generatePackageCode());
        casePackage.setPackageName(request.getPackageName());
        casePackage.setStatus(CasePackageStatus.DRAFT);
        casePackage.setAssignmentType(request.getAssignmentType());
        casePackage.setSourceOrgId(request.getSourceOrgId());
        casePackage.setEntrustStartDate(request.getEntrustStartDate());
        casePackage.setEntrustEndDate(request.getEntrustEndDate());
        casePackage.setExpectedRecoveryRate(request.getExpectedRecoveryRate());
        casePackage.setExpectedDisposalDays(request.getExpectedDisposalDays());
        casePackage.setPreferredDisposalMethods(request.getPreferredDisposalMethods());
        casePackage.setDescription(request.getDescription());
        
        // 设置竞标相关信息
        if (request.getAssignmentType() == AssignmentType.BIDDING) {
            casePackage.setAllowBidding(true);
            casePackage.setBiddingStartTime(request.getBiddingStartTime());
            casePackage.setBiddingEndTime(request.getBiddingEndTime());
            casePackage.setMinBidAmount(request.getMinBidAmount());
            casePackage.setBidBondAmount(request.getBidBondAmount());
            casePackage.setBiddingRequirements(request.getBiddingRequirements());
        }
        
        // 设置智能分案配置
        if (request.getAssignmentType() == AssignmentType.SMART) {
            casePackage.setSmartAssignConfig(request.getSmartAssignConfig());
        }
        
        casePackage.setCreatedAt(LocalDateTime.now());
        casePackage.setUpdatedAt(LocalDateTime.now());
        
        CasePackage saved = casePackageRepository.save(casePackage);
        
        // 如果请求中包含案件ID，添加案件到案件包
        if (request.getCaseIds() != null && !request.getCaseIds().isEmpty()) {
            addCases(saved.getId(), request.getCaseIds());
        }
        
        // 更新统计信息
        updatePackageStatistics(saved.getId());
        
        return saved;
    }
    
    @Override
    @Transactional
    public CasePackage updateCasePackage(Long id, CasePackageUpdateRequest request) {
        log.info("Updating case package: {}", id);
        
        CasePackage casePackage = casePackageRepository.findById(id)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        // 只有草稿状态可以编辑
        if (casePackage.getStatus() != CasePackageStatus.DRAFT) {
            throw new BusinessException("只有草稿状态的案件包可以编辑");
        }
        
        if (request.getPackageName() != null) {
            casePackage.setPackageName(request.getPackageName());
        }
        if (request.getAssignmentType() != null) {
            casePackage.setAssignmentType(request.getAssignmentType());
        }
        if (request.getEntrustStartDate() != null) {
            casePackage.setEntrustStartDate(request.getEntrustStartDate());
        }
        if (request.getEntrustEndDate() != null) {
            casePackage.setEntrustEndDate(request.getEntrustEndDate());
        }
        if (request.getExpectedRecoveryRate() != null) {
            casePackage.setExpectedRecoveryRate(request.getExpectedRecoveryRate());
        }
        if (request.getExpectedDisposalDays() != null) {
            casePackage.setExpectedDisposalDays(request.getExpectedDisposalDays());
        }
        if (request.getDescription() != null) {
            casePackage.setDescription(request.getDescription());
        }
        
        casePackage.setUpdatedAt(LocalDateTime.now());
        
        return casePackageRepository.save(casePackage);
    }
    
    @Override
    public CasePackageDetailResponse getCasePackageDetail(Long id) {
        log.info("Getting case package detail: {}", id);
        
        CasePackage casePackage = casePackageRepository.findById(id)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        return convertToDetailResponse(casePackage);
    }
    
    @Override
    public Page<CasePackageListResponse> getCasePackageList(CasePackageQueryRequest request, Pageable pageable) {
        log.info("Getting case package list with query: {}", request);
        
        Specification<CasePackage> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
                predicates.add(cb.or(
                    cb.like(root.get("packageName"), "%" + request.getKeyword() + "%"),
                    cb.like(root.get("packageCode"), "%" + request.getKeyword() + "%")
                ));
            }
            
            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }
            
            if (request.getAssignmentType() != null) {
                predicates.add(cb.equal(root.get("assignmentType"), request.getAssignmentType()));
            }
            
            if (request.getSourceOrgId() != null) {
                predicates.add(cb.equal(root.get("sourceOrgId"), request.getSourceOrgId()));
            }
            
            if (request.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), request.getStartDate()));
            }
            
            if (request.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), request.getEndDate()));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        Page<CasePackage> page = casePackageRepository.findAll(spec, pageable);
        
        return page.map(this::convertToListResponse);
    }
    
    @Override
    @Transactional
    public void deleteCasePackage(Long id) {
        log.info("Deleting case package: {}", id);
        
        CasePackage casePackage = casePackageRepository.findById(id)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        // 只有草稿状态可以删除
        if (casePackage.getStatus() != CasePackageStatus.DRAFT) {
            throw new BusinessException("只有草稿状态的案件包可以删除");
        }
        
        // 解除案件关联
        caseRepository.updateCasePackageIdToNull(id);
        
        casePackageRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public CasePackage publishCasePackage(Long id) {
        log.info("Publishing case package: {}", id);
        
        CasePackage casePackage = casePackageRepository.findById(id)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        // 检查状态
        if (casePackage.getStatus() != CasePackageStatus.DRAFT) {
            throw new BusinessException("只有草稿状态的案件包可以发布");
        }
        
        // 检查案件数量
        if (casePackage.getCaseCount() == 0) {
            throw new BusinessException("案件包中没有案件，无法发布");
        }
        
        // 更新状态
        casePackage.setStatus(CasePackageStatus.PUBLISHED);
        casePackage.setPublishedAt(LocalDateTime.now());
        
        // 如果是竞标模式，进入竞标状态
        if (casePackage.getAssignmentType() == AssignmentType.BIDDING) {
            casePackage.setStatus(CasePackageStatus.BIDDING);
        }
        
        casePackage.setUpdatedAt(LocalDateTime.now());
        
        return casePackageRepository.save(casePackage);
    }
    
    @Override
    @Transactional
    public CasePackage withdrawCasePackage(Long id) {
        log.info("Withdrawing case package: {}", id);
        
        CasePackage casePackage = casePackageRepository.findById(id)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        // 检查状态
        if (casePackage.getStatus() == CasePackageStatus.DRAFT) {
            throw new BusinessException("草稿状态的案件包无需撤回");
        }
        
        if (casePackage.getStatus() == CasePackageStatus.ASSIGNED ||
            casePackage.getStatus() == CasePackageStatus.IN_PROGRESS ||
            casePackage.getStatus() == CasePackageStatus.COMPLETED) {
            throw new BusinessException("已分配或处理中的案件包无法撤回");
        }
        
        // 更新状态
        casePackage.setStatus(CasePackageStatus.WITHDRAWN);
        casePackage.setUpdatedAt(LocalDateTime.now());
        
        return casePackageRepository.save(casePackage);
    }
    
    @Override
    @Transactional
    public BatchImportResult importCases(Long packageId, MultipartFile file) {
        log.info("Importing cases for package: {}", packageId);
        
        CasePackage casePackage = casePackageRepository.findById(packageId)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        // 只有草稿状态可以导入案件
        if (casePackage.getStatus() != CasePackageStatus.DRAFT) {
            throw new BusinessException("只有草稿状态的案件包可以导入案件");
        }
        
        BatchImportResult result = new BatchImportResult();
        result.setTaskId(UUID.randomUUID().toString());
        result.setFileName(file.getOriginalFilename());
        result.setFileSize(file.getSize());
        result.setStartTime(LocalDateTime.now());
        
        try {
            // 解析Excel文件
            List<Case> cases = ExcelUtils.parseCaseExcel(file);
            result.setTotalCount(cases.size());
            
            int successCount = 0;
            int failedCount = 0;
            List<ImportError> errors = new ArrayList<>();
            
            for (int i = 0; i < cases.size(); i++) {
                try {
                    Case caseEntity = cases.get(i);
                    caseEntity.setCasePackageId(packageId);
                    caseEntity.setCreatedAt(LocalDateTime.now());
                    caseEntity.setUpdatedAt(LocalDateTime.now());
                    caseRepository.save(caseEntity);
                    successCount++;
                } catch (Exception e) {
                    failedCount++;
                    ImportError error = new ImportError();
                    error.setRowNumber(i + 2); // Excel行号从2开始（第1行是表头）
                    error.setErrorMessage(e.getMessage());
                    errors.add(error);
                }
            }
            
            result.setSuccessCount(successCount);
            result.setFailedCount(failedCount);
            result.setErrors(errors);
            result.setSuccess(failedCount == 0);
            
            // 更新案件包统计信息
            updatePackageStatistics(packageId);
            
        } catch (Exception e) {
            log.error("Failed to import cases", e);
            result.setSuccess(false);
            result.setErrors(Collections.singletonList(
                ImportError.builder()
                    .errorMessage("文件解析失败: " + e.getMessage())
                    .build()
            ));
        }
        
        result.setEndTime(LocalDateTime.now());
        result.setDuration(java.time.Duration.between(result.getStartTime(), result.getEndTime()).toMillis());
        
        return result;
    }
    
    @Override
    public byte[] exportCases(Long packageId, String format) {
        log.info("Exporting cases for package: {} in format: {}", packageId, format);
        
        CasePackage casePackage = casePackageRepository.findById(packageId)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        List<Case> cases = caseRepository.findByCasePackageId(packageId);
        
        if ("excel".equalsIgnoreCase(format)) {
            return ExcelUtils.exportCasesToExcel(cases, casePackage.getPackageName());
        } else if ("csv".equalsIgnoreCase(format)) {
            return ExcelUtils.exportCasesToCsv(cases);
        } else {
            throw new BusinessException("不支持的导出格式: " + format);
        }
    }
    
    @Override
    public CasePackageStatisticsResponse getStatistics(Long orgId) {
        log.info("Getting statistics for org: {}", orgId);
        
        CasePackageStatisticsResponse stats = new CasePackageStatisticsResponse();
        
        // 总数统计
        stats.setTotal(casePackageRepository.count());
        stats.setDraft(casePackageRepository.countByStatus(CasePackageStatus.DRAFT));
        stats.setPublished(casePackageRepository.countByStatus(CasePackageStatus.PUBLISHED));
        stats.setBidding(casePackageRepository.countByStatus(CasePackageStatus.BIDDING));
        stats.setAssigned(casePackageRepository.countByStatus(CasePackageStatus.ASSIGNED));
        stats.setInProgress(casePackageRepository.countByStatus(CasePackageStatus.IN_PROGRESS));
        stats.setCompleted(casePackageRepository.countByStatus(CasePackageStatus.COMPLETED));
        
        // 计算平均回收率
        Double avgRecoveryRate = casePackageRepository.calculateAverageRecoveryRate();
        stats.setAvgRecoveryRate(avgRecoveryRate != null ? avgRecoveryRate : 0.0);
        
        // 总金额
        BigDecimal totalAmount = casePackageRepository.calculateTotalAmount();
        stats.setTotalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO);
        
        // 总案件数
        Long totalCases = casePackageRepository.calculateTotalCases();
        stats.setTotalCases(totalCases != null ? totalCases : 0L);
        
        return stats;
    }
    
    // ========== 竞标相关实现 ==========
    
    @Override
    @Transactional
    public CasePackageBidResponse submitBid(CasePackageBidRequest request) {
        log.info("Submitting bid for package: {}", request.getCasePackageId());
        
        CasePackage casePackage = casePackageRepository.findById(request.getCasePackageId())
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        // 检查案件包状态
        if (casePackage.getStatus() != CasePackageStatus.BIDDING) {
            throw new BusinessException("案件包不在竞标状态");
        }
        
        // 检查竞标时间
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(casePackage.getBiddingStartTime()) || now.isAfter(casePackage.getBiddingEndTime())) {
            throw new BusinessException("不在竞标时间范围内");
        }
        
        // 检查是否已经提交过竞标
        boolean exists = casePackageBidRepository.existsByCasePackageIdAndDisposalOrgId(
            request.getCasePackageId(), request.getDisposalOrgId()
        );
        if (exists) {
            throw new BusinessException("已经提交过竞标");
        }
        
        // 创建竞标记录
        CasePackageBid bid = new CasePackageBid();
        bid.setCasePackageId(request.getCasePackageId());
        bid.setDisposalOrgId(request.getDisposalOrgId());
        bid.setBidAmount(request.getBidAmount());
        bid.setProposedRecoveryRate(request.getProposedRecoveryRate());
        bid.setProposedDisposalDays(request.getProposedDisposalDays());
        bid.setProposal(request.getProposal());
        bid.setDisposalStrategy(request.getDisposalStrategy());
        bid.setTeamIntroduction(request.getTeamIntroduction());
        bid.setPastPerformance(request.getPastPerformance());
        bid.setCommitments(request.getCommitments());
        bid.setStatus("SUBMITTED");
        bid.setSubmittedAt(LocalDateTime.now());
        
        CasePackageBid saved = casePackageBidRepository.save(bid);
        
        return convertToBidResponse(saved);
    }
    
    @Override
    public List<CasePackageBidResponse> getBidList(Long packageId) {
        log.info("Getting bid list for package: {}", packageId);
        
        List<CasePackageBid> bids = casePackageBidRepository.findByCasePackageId(packageId);
        
        return bids.stream()
            .map(this::convertToBidResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    public Page<CasePackageBidResponse> getMyBids(Long orgId, Pageable pageable) {
        log.info("Getting bids for org: {}", orgId);
        
        Page<CasePackageBid> page = casePackageBidRepository.findByDisposalOrgId(orgId, pageable);
        
        return page.map(this::convertToBidResponse);
    }
    
    @Override
    @Transactional
    public CasePackage selectWinner(Long packageId, Long bidId) {
        log.info("Selecting winner for package: {}, bid: {}", packageId, bidId);
        
        CasePackage casePackage = casePackageRepository.findById(packageId)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        CasePackageBid bid = casePackageBidRepository.findById(bidId)
            .orElseThrow(() -> new BusinessException("竞标记录不存在"));
        
        // 检查竞标是否属于该案件包
        if (!bid.getCasePackageId().equals(packageId)) {
            throw new BusinessException("竞标记录与案件包不匹配");
        }
        
        // 更新竞标状态
        bid.setIsWinner(true);
        bid.setStatus("WINNER");
        casePackageBidRepository.save(bid);
        
        // 更新其他竞标为未中标
        casePackageBidRepository.updateOtherBidsAsLost(packageId, bidId);
        
        // 更新案件包状态
        casePackage.setStatus(CasePackageStatus.ASSIGNED);
        casePackage.setDisposalOrgId(bid.getDisposalOrgId());
        casePackage.setWinningBidId(bidId);
        casePackage.setAssignedAt(LocalDateTime.now());
        
        return casePackageRepository.save(casePackage);
    }
    
    @Override
    @Transactional
    public void withdrawBid(Long bidId) {
        log.info("Withdrawing bid: {}", bidId);
        
        CasePackageBid bid = casePackageBidRepository.findById(bidId)
            .orElseThrow(() -> new BusinessException("竞标记录不存在"));
        
        // 检查是否可以撤回
        if ("WINNER".equals(bid.getStatus()) || "WITHDRAWN".equals(bid.getStatus())) {
            throw new BusinessException("该竞标无法撤回");
        }
        
        bid.setStatus("WITHDRAWN");
        casePackageBidRepository.save(bid);
    }
    
    @Override
    public Page<CasePackageListResponse> getMarketPackages(MarketQueryRequest request, Pageable pageable) {
        log.info("Getting market packages with query: {}", request);
        
        Specification<CasePackage> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // 只显示竞标中的案件包
            predicates.add(cb.equal(root.get("status"), CasePackageStatus.BIDDING));
            predicates.add(cb.equal(root.get("allowBidding"), true));
            
            if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
                predicates.add(cb.or(
                    cb.like(root.get("packageName"), "%" + request.getKeyword() + "%"),
                    cb.like(root.get("description"), "%" + request.getKeyword() + "%")
                ));
            }
            
            if (request.getMinAmount() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalAmount"), request.getMinAmount()));
            }
            
            if (request.getMaxAmount() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalAmount"), request.getMaxAmount()));
            }
            
            if (request.getMinCaseCount() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("caseCount"), request.getMinCaseCount()));
            }
            
            if (request.getMaxCaseCount() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("caseCount"), request.getMaxCaseCount()));
            }
            
            // 只显示在竞标时间内的
            LocalDateTime now = LocalDateTime.now();
            predicates.add(cb.lessThanOrEqualTo(root.get("biddingStartTime"), now));
            predicates.add(cb.greaterThanOrEqualTo(root.get("biddingEndTime"), now));
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        Page<CasePackage> page = casePackageRepository.findAll(spec, pageable);
        
        return page.map(this::convertToListResponse);
    }
    
    // ========== 智能分案相关实现 ==========
    
    @Override
    @Transactional
    public SmartAssignResultResponse executeSmartAssignment(SmartAssignRequest request) {
        log.info("Executing smart assignment for package: {}", request.getCasePackageId());
        
        // 预览分案结果
        SmartAssignResultResponse preview = previewSmartAssignment(request);
        
        // 如果不是预览模式，执行实际分配
        if (!request.isPreview()) {
            // 更新案件的处置机构信息
            for (AssignmentDetail detail : preview.getAssignmentDetails()) {
                Case caseEntity = caseRepository.findById(detail.getCaseId())
                    .orElseThrow(() -> new BusinessException("案件不存在"));
                caseEntity.setAssignedOrgId(detail.getOrgId());
                caseEntity.setAssignedAt(LocalDateTime.now());
                caseRepository.save(caseEntity);
            }
            
            // 更新案件包状态
            CasePackage casePackage = casePackageRepository.findById(request.getCasePackageId())
                .orElseThrow(() -> new BusinessException("案件包不存在"));
            casePackage.setStatus(CasePackageStatus.ASSIGNED);
            casePackage.setAssignedAt(LocalDateTime.now());
            casePackageRepository.save(casePackage);
            
            preview.setPreview(false);
        }
        
        return preview;
    }
    
    @Override
    public SmartAssignResultResponse previewSmartAssignment(SmartAssignRequest request) {
        log.info("Previewing smart assignment for package: {}", request.getCasePackageId());
        
        CasePackage casePackage = casePackageRepository.findById(request.getCasePackageId())
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        // 获取案件列表
        List<Case> cases = caseRepository.findByCasePackageId(request.getCasePackageId());
        
        // 获取可用的处置机构
        List<Organization> orgs = organizationRepository.findByType("DISPOSAL");
        
        // 执行智能分配算法
        SmartAssignResultResponse result = new SmartAssignResultResponse();
        result.setAssignmentId(UUID.randomUUID().toString());
        result.setCasePackageId(request.getCasePackageId());
        result.setCasePackageName(casePackage.getPackageName());
        result.setTotalCases(cases.size());
        result.setStrategy(request.getStrategy());
        result.setRuleWeights(request.getRuleWeights());
        result.setPreview(true);
        result.setExecutedAt(LocalDateTime.now());
        
        List<AssignmentDetail> assignmentDetails = new ArrayList<>();
        List<UnassignedCase> unassignedCases = new ArrayList<>();
        Map<Long, OrgAssignmentStat> orgStatsMap = new HashMap<>();
        
        // 简单的分配算法示例（实际应该更复杂）
        for (Case caseEntity : cases) {
            Organization bestOrg = findBestMatchOrg(caseEntity, orgs, request);
            
            if (bestOrg != null) {
                AssignmentDetail detail = new AssignmentDetail();
                detail.setCaseId(caseEntity.getId());
                detail.setCaseNumber(caseEntity.getCaseNumber());
                detail.setCaseAmount(caseEntity.getTotalDebtAmount());
                detail.setOrgId(bestOrg.getId());
                detail.setOrgName(bestOrg.getName());
                detail.setMatchScore(calculateMatchScore(caseEntity, bestOrg, request));
                detail.setMatchReason("基于" + request.getStrategy() + "策略匹配");
                assignmentDetails.add(detail);
                
                // 更新机构统计
                OrgAssignmentStat stat = orgStatsMap.computeIfAbsent(bestOrg.getId(), k -> {
                    OrgAssignmentStat s = new OrgAssignmentStat();
                    s.setOrgId(bestOrg.getId());
                    s.setOrgName(bestOrg.getName());
                    s.setAssignedCount(0);
                    s.setTotalAmount(BigDecimal.ZERO);
                    s.setAvgMatchScore(0.0);
                    return s;
                });
                stat.setAssignedCount(stat.getAssignedCount() + 1);
                stat.setTotalAmount(stat.getTotalAmount().add(caseEntity.getTotalDebtAmount()));
            } else {
                UnassignedCase unassigned = new UnassignedCase();
                unassigned.setCaseId(caseEntity.getId());
                unassigned.setCaseNumber(caseEntity.getCaseNumber());
                unassigned.setCaseAmount(caseEntity.getTotalDebtAmount());
                unassigned.setUnassignedReason("未找到匹配的处置机构");
                unassigned.setSuggestedAction("手动分配或调整匹配规则");
                unassignedCases.add(unassigned);
            }
        }
        
        result.setAssignmentDetails(assignmentDetails);
        result.setUnassignedCases(unassignedCases);
        result.setAssignedCases(assignmentDetails.size());
        result.setUnassignedCount(unassignedCases.size());
        result.setSuccessRate(cases.isEmpty() ? 0 : 
            (assignmentDetails.size() * 100.0 / cases.size()));
        result.setOrgStats(new ArrayList<>(orgStatsMap.values()));
        result.setExecutionTime(100L); // 模拟执行时间
        
        return result;
    }
    
    @Override
    @Transactional
    public void confirmAssignment(String assignmentId) {
        log.info("Confirming assignment: {}", assignmentId);
        // 实际实现中应该根据assignmentId找到对应的分配结果并执行
        // 这里简化处理
    }
    
    @Override
    public List<AssignmentRuleResponse> getAssignmentRules() {
        log.info("Getting assignment rules");
        
        List<AssignmentRule> rules = assignmentRuleRepository.findAll();
        
        return rules.stream()
            .map(this::convertToRuleResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public AssignmentRuleResponse createAssignmentRule(AssignmentRuleRequest request) {
        log.info("Creating assignment rule: {}", request.getRuleName());
        
        AssignmentRule rule = new AssignmentRule();
        rule.setRuleName(request.getRuleName());
        rule.setDescription(request.getDescription());
        rule.setRuleType(request.getRuleType());
        rule.setPriority(request.getPriority());
        rule.setEnabled(request.getEnabled());
        rule.setConditions(request.getConditions());
        rule.setActions(request.getActions());
        rule.setWeights(request.getWeights());
        rule.setCreatedAt(LocalDateTime.now());
        rule.setUpdatedAt(LocalDateTime.now());
        
        AssignmentRule saved = assignmentRuleRepository.save(rule);
        
        return convertToRuleResponse(saved);
    }
    
    @Override
    @Transactional
    public AssignmentRuleResponse updateAssignmentRule(Long id, AssignmentRuleRequest request) {
        log.info("Updating assignment rule: {}", id);
        
        AssignmentRule rule = assignmentRuleRepository.findById(id)
            .orElseThrow(() -> new BusinessException("分案规则不存在"));
        
        rule.setRuleName(request.getRuleName());
        rule.setDescription(request.getDescription());
        rule.setRuleType(request.getRuleType());
        rule.setPriority(request.getPriority());
        rule.setEnabled(request.getEnabled());
        rule.setConditions(request.getConditions());
        rule.setActions(request.getActions());
        rule.setWeights(request.getWeights());
        rule.setUpdatedAt(LocalDateTime.now());
        
        AssignmentRule saved = assignmentRuleRepository.save(rule);
        
        return convertToRuleResponse(saved);
    }
    
    @Override
    @Transactional
    public void deleteAssignmentRule(Long id) {
        log.info("Deleting assignment rule: {}", id);
        assignmentRuleRepository.deleteById(id);
    }
    
    @Override
    public List<RecommendedOrgResponse> getRecommendedOrgs(Long packageId) {
        log.info("Getting recommended orgs for package: {}", packageId);
        
        CasePackage casePackage = casePackageRepository.findById(packageId)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        // 获取所有处置机构
        List<Organization> orgs = organizationRepository.findByType("DISPOSAL");
        
        // 计算推荐分数并排序
        return orgs.stream()
            .map(org -> calculateRecommendation(org, casePackage))
            .sorted((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()))
            .limit(10)
            .collect(Collectors.toList());
    }
    
    // ========== 其他方法实现 ==========
    
    @Override
    @Transactional
    public CasePackage updateStatus(Long id, CasePackageStatus status) {
        log.info("Updating case package {} status to {}", id, status);
        
        CasePackage casePackage = casePackageRepository.findById(id)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        if (!canTransitionTo(id, status)) {
            throw new BusinessException("无法从" + casePackage.getStatus() + "状态转换到" + status);
        }
        
        casePackage.setStatus(status);
        casePackage.setUpdatedAt(LocalDateTime.now());
        
        return casePackageRepository.save(casePackage);
    }
    
    @Override
    @Transactional
    public BatchOperationResult batchUpdateStatus(List<Long> ids, CasePackageStatus status) {
        log.info("Batch updating {} packages to status {}", ids.size(), status);
        
        BatchOperationResult result = new BatchOperationResult();
        result.setTotal(ids.size());
        
        int success = 0;
        int failed = 0;
        
        for (Long id : ids) {
            try {
                updateStatus(id, status);
                success++;
            } catch (Exception e) {
                failed++;
                log.error("Failed to update package {} status", id, e);
            }
        }
        
        result.setSuccess(success);
        result.setFailed(failed);
        
        return result;
    }
    
    @Override
    public boolean canTransitionTo(Long packageId, CasePackageStatus targetStatus) {
        CasePackage casePackage = casePackageRepository.findById(packageId)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        CasePackageStatus currentStatus = casePackage.getStatus();
        
        // 定义状态转换规则
        switch (currentStatus) {
            case DRAFT:
                return targetStatus == CasePackageStatus.PUBLISHED || 
                       targetStatus == CasePackageStatus.BIDDING;
            case PUBLISHED:
                return targetStatus == CasePackageStatus.BIDDING ||
                       targetStatus == CasePackageStatus.ASSIGNING ||
                       targetStatus == CasePackageStatus.WITHDRAWN;
            case BIDDING:
                return targetStatus == CasePackageStatus.ASSIGNED ||
                       targetStatus == CasePackageStatus.WITHDRAWN;
            case ASSIGNING:
                return targetStatus == CasePackageStatus.ASSIGNED;
            case ASSIGNED:
                return targetStatus == CasePackageStatus.IN_PROGRESS;
            case IN_PROGRESS:
                return targetStatus == CasePackageStatus.COMPLETED;
            default:
                return false;
        }
    }
    
    @Override
    @Transactional
    public void addCases(Long packageId, List<Long> caseIds) {
        log.info("Adding {} cases to package {}", caseIds.size(), packageId);
        
        CasePackage casePackage = casePackageRepository.findById(packageId)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        // 更新案件的案件包ID
        caseRepository.updateCasePackageId(caseIds, packageId);
        
        // 更新统计信息
        updatePackageStatistics(packageId);
    }
    
    @Override
    @Transactional
    public void removeCases(Long packageId, List<Long> caseIds) {
        log.info("Removing {} cases from package {}", caseIds.size(), packageId);
        
        // 清除案件的案件包ID
        caseRepository.clearCasePackageId(caseIds);
        
        // 更新统计信息
        updatePackageStatistics(packageId);
    }
    
    @Override
    @Transactional
    public void transferCases(Long sourcePackageId, Long targetPackageId, List<Long> caseIds) {
        log.info("Transferring {} cases from package {} to {}", 
            caseIds.size(), sourcePackageId, targetPackageId);
        
        // 更新案件的案件包ID
        caseRepository.updateCasePackageId(caseIds, targetPackageId);
        
        // 更新两个案件包的统计信息
        updatePackageStatistics(sourcePackageId);
        updatePackageStatistics(targetPackageId);
    }
    
    @Override
    public Page<CaseResponse> getCasesInPackage(Long packageId, Pageable pageable) {
        log.info("Getting cases in package: {}", packageId);
        
        Page<Case> page = caseRepository.findByCasePackageId(packageId, pageable);
        
        return page.map(this::convertToCaseResponse);
    }
    
    @Override
    public byte[] downloadImportTemplate() {
        try {
            // 创建Excel模板文件
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("案件导入模板");
            
            // 创建标题行
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "案件编号", "债务人姓名", "债务人身份证号", "债务人电话", 
                "债务人地址", "借款金额", "剩余本金", "剩余利息", "总债务金额",
                "逾期天数", "逾期阶段", "借款日期", "到期日期", "债务类型",
                "担保方式", "抵押物信息", "风险等级", "委托开始日期", "委托结束日期"
            };
            
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            
            // 自动调整列宽
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();
            
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("生成导入模板失败", e);
        }
    }
    
    @Override
    public boolean checkPackageName(String packageName) {
        return !casePackageRepository.existsByPackageName(packageName);
    }
    
    @Override
    public boolean toggleFavorite(Long packageId, Long userId) {
        // 这里需要一个用户收藏表，暂时返回成功
        // TODO: 实现收藏功能
        return true;
    }
    
    @Override
    public Page<CasePackageListResponse> getFavoritePackages(Long userId) {
        // 这里需要一个用户收藏表，暂时返回空列表
        // TODO: 实现收藏功能
        return Page.empty();
    }
    
    // ========== 辅助方法 ==========
    
    private String generatePackageCode() {
        return "PKG" + System.currentTimeMillis();
    }
    
    private void updatePackageStatistics(Long packageId) {
        CasePackage casePackage = casePackageRepository.findById(packageId)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
        
        // 统计案件信息
        List<Case> cases = caseRepository.findByCasePackageId(packageId);
        casePackage.setCaseCount(cases.size());
        
        BigDecimal totalAmount = cases.stream()
            .map(Case::getTotalDebtAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        casePackage.setTotalAmount(totalAmount);
        
        BigDecimal remainingAmount = cases.stream()
            .map(Case::getRemainingAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        casePackage.setRemainingAmount(remainingAmount);
        
        casePackageRepository.save(casePackage);
    }
    
    private Organization findBestMatchOrg(Case caseEntity, List<Organization> orgs, SmartAssignRequest request) {
        // 简化的匹配算法，实际应该更复杂
        if (orgs.isEmpty()) return null;
        
        // 根据策略选择最佳机构
        return orgs.stream()
            .filter(org -> !request.getExcludeOrgIds().contains(org.getId()))
            .filter(org -> request.getIncludeOrgIds().isEmpty() || 
                          request.getIncludeOrgIds().contains(org.getId()))
            .findFirst()
            .orElse(null);
    }
    
    private Double calculateMatchScore(Case caseEntity, Organization org, SmartAssignRequest request) {
        // 简化的分数计算，实际应该更复杂
        return 80.0 + Math.random() * 20;
    }
    
    private RecommendedOrgResponse calculateRecommendation(Organization org, CasePackage casePackage) {
        RecommendedOrgResponse response = new RecommendedOrgResponse();
        response.setOrgId(org.getId());
        response.setOrgCode(org.getCode());
        response.setOrgName(org.getName());
        response.setOrgType(org.getType());
        response.setRegion(org.getRegion());
        
        // 计算匹配分数（简化版）
        double score = 50 + Math.random() * 50;
        response.setMatchScore(score);
        
        // 推荐理由
        List<String> reasons = new ArrayList<>();
        reasons.add("地域匹配度高");
        reasons.add("历史业绩优秀");
        response.setRecommendReasons(reasons);
        
        return response;
    }
    
    // ========== 转换方法 ==========
    
    private CasePackageDetailResponse convertToDetailResponse(CasePackage entity) {
        CasePackageDetailResponse response = new CasePackageDetailResponse();
        response.setId(entity.getId());
        response.setPackageCode(entity.getPackageCode());
        response.setPackageName(entity.getPackageName());
        response.setStatus(entity.getStatus());
        response.setAssignmentType(entity.getAssignmentType());
        response.setCaseCount(entity.getCaseCount());
        response.setTotalAmount(entity.getTotalAmount());
        response.setRemainingAmount(entity.getRemainingAmount());
        response.setExpectedRecoveryRate(entity.getExpectedRecoveryRate());
        response.setExpectedDisposalDays(entity.getExpectedDisposalDays());
        response.setSourceOrgId(entity.getSourceOrgId());
        response.setDisposalOrgId(entity.getDisposalOrgId());
        response.setEntrustStartDate(entity.getEntrustStartDate());
        response.setEntrustEndDate(entity.getEntrustEndDate());
        response.setDescription(entity.getDescription());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
    
    private CasePackageListResponse convertToListResponse(CasePackage entity) {
        CasePackageListResponse response = new CasePackageListResponse();
        response.setId(entity.getId());
        response.setPackageCode(entity.getPackageCode());
        response.setPackageName(entity.getPackageName());
        response.setStatus(entity.getStatus());
        response.setAssignmentType(entity.getAssignmentType());
        response.setCaseCount(entity.getCaseCount());
        response.setTotalAmount(entity.getTotalAmount());
        response.setExpectedRecoveryRate(entity.getExpectedRecoveryRate());
        response.setSourceOrgName(entity.getSourceOrgName());
        response.setDisposalOrgName(entity.getDisposalOrgName());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
    
    private CasePackageBidResponse convertToBidResponse(CasePackageBid entity) {
        CasePackageBidResponse response = new CasePackageBidResponse();
        response.setId(entity.getId());
        response.setCasePackageId(entity.getCasePackageId());
        response.setCasePackageName(entity.getCasePackageName());
        response.setDisposalOrgId(entity.getDisposalOrgId());
        response.setDisposalOrgName(entity.getDisposalOrgName());
        response.setBidAmount(entity.getBidAmount());
        response.setProposedRecoveryRate(entity.getProposedRecoveryRate());
        response.setProposedDisposalDays(entity.getProposedDisposalDays());
        response.setProposal(entity.getProposal());
        response.setStatus(entity.getStatus());
        response.setIsWinner(entity.getIsWinner());
        response.setSubmittedAt(entity.getSubmittedAt());
        return response;
    }
    
    private CaseResponse convertToCaseResponse(Case entity) {
        CaseResponse response = new CaseResponse();
        response.setId(entity.getId());
        response.setCaseNumber(entity.getCaseNumber());
        response.setCasePackageId(entity.getCasePackageId());
        response.setDebtorName(entity.getDebtorName());
        response.setDebtorIdCard(maskIdCard(entity.getDebtorIdCard()));
        response.setDebtorPhone(maskPhone(entity.getDebtorPhone()));
        response.setTotalDebtAmount(entity.getTotalDebtAmount());
        response.setOverdueDays(entity.getOverdueDays());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
    
    private AssignmentRuleResponse convertToRuleResponse(AssignmentRule entity) {
        AssignmentRuleResponse response = new AssignmentRuleResponse();
        response.setId(entity.getId());
        response.setRuleName(entity.getRuleName());
        response.setDescription(entity.getDescription());
        response.setRuleType(entity.getRuleType());
        response.setPriority(entity.getPriority());
        response.setEnabled(entity.getEnabled());
        response.setConditions(entity.getConditions());
        response.setActions(entity.getActions());
        response.setWeights(entity.getWeights());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
    
    private String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() < 15) return idCard;
        return idCard.substring(0, 3) + "***********" + idCard.substring(idCard.length() - 4);
    }
    
    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) return phone;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
}