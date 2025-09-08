package com.drmp.controller;

import com.drmp.dto.request.CasePackageQueryRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.CasePackageListResponse;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.service.CasePackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Case Market Controller
 * 案件市场控制器 - 专门处理案件市场相关的API
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/case-market")
@RequiredArgsConstructor
@Tag(name = "案件市场", description = "案件市场相关API，供处置机构查看和申请案件包")
public class CaseMarketController {

    private final CasePackageService casePackageService;

    @Operation(summary = "获取案件市场列表", description = "获取所有已发布且未分配的案件包，支持多种筛选条件")
    @GetMapping
    @PreAuthorize("hasRole('DISPOSAL_VIEWER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<Page<CasePackageListResponse>>> getMarketCasePackages(
            @Parameter(description = "关键词搜索（包名、包编号）") @RequestParam(required = false) String keyword,
            @Parameter(description = "最小总金额") @RequestParam(required = false) Double minAmount,
            @Parameter(description = "最大总金额") @RequestParam(required = false) Double maxAmount,
            @Parameter(description = "最小逾期天数") @RequestParam(required = false) Integer minOverdueDays,
            @Parameter(description = "最大逾期天数") @RequestParam(required = false) Integer maxOverdueDays,
            @Parameter(description = "案源机构ID") @RequestParam(required = false) Long sourceOrgId,
            @Parameter(description = "地区筛选") @RequestParam(required = false) String region,
            @Parameter(description = "业务类型筛选") @RequestParam(required = false) String businessType,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "排序字段") @RequestParam(defaultValue = "publishedAt") String sortBy,
            @Parameter(description = "排序方向") @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Getting market case packages with filters - keyword: {}, minAmount: {}, maxAmount: {}", 
                 keyword, minAmount, maxAmount);
        
        CasePackageQueryRequest queryRequest = new CasePackageQueryRequest();
        queryRequest.setKeyword(keyword);
        queryRequest.setMinAmount(minAmount);
        queryRequest.setMaxAmount(maxAmount);
        queryRequest.setMinOverdueDays(minOverdueDays);
        queryRequest.setMaxOverdueDays(maxOverdueDays);
        queryRequest.setSourceOrgId(sourceOrgId);
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        Page<CasePackageListResponse> response = casePackageService.getMarketCasePackages(queryRequest, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "申请案件包", description = "处置机构申请承接指定的案件包")
    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<String>> applyForCasePackage(
            @PathVariable Long id,
            @Parameter(description = "申请提案，说明承接能力和方案") @RequestParam String proposal) {
        
        log.info("Disposal organization applying for case package: {} with proposal: {}", id, proposal);
        
        String applicationId = casePackageService.applyCasePackage(id, proposal);
        return ResponseEntity.ok(ApiResponse.success(applicationId, "申请已提交，等待案源机构审核"));
    }

    @Operation(summary = "获取热门案件包", description = "获取最受关注的案件包（按申请数量排序）")
    @GetMapping("/hot")
    @PreAuthorize("hasRole('DISPOSAL_VIEWER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<CasePackageListResponse>>> getHotCasePackages(
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting hot case packages with limit: {}", limit);
        
        CasePackageQueryRequest queryRequest = new CasePackageQueryRequest();
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "publishedAt"));
        
        Page<CasePackageListResponse> page = casePackageService.getMarketCasePackages(queryRequest, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(page.getContent()));
    }

    @Operation(summary = "获取推荐案件包", description = "根据处置机构的历史业绩和能力推荐匹配的案件包")
    @GetMapping("/recommendations")
    @PreAuthorize("hasRole('DISPOSAL_VIEWER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<CasePackageListResponse>>> getRecommendedCasePackages(
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting recommended case packages with limit: {}", limit);
        
        // TODO: 实现基于机构能力的智能推荐算法
        CasePackageQueryRequest queryRequest = new CasePackageQueryRequest();
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalAmount"));
        
        Page<CasePackageListResponse> page = casePackageService.getMarketCasePackages(queryRequest, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(page.getContent()));
    }

    @Operation(summary = "获取案件包竞标统计", description = "获取指定案件包的竞标情况统计")
    @GetMapping("/{id}/bidding-stats")
    @PreAuthorize("hasRole('DISPOSAL_VIEWER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<BiddingStats>> getCasePackageBiddingStats(@PathVariable Long id) {
        
        log.info("Getting bidding stats for case package: {}", id);
        
        // TODO: 实现竞标统计逻辑
        BiddingStats stats = new BiddingStats();
        stats.setCasePackageId(id);
        stats.setTotalBidders(5);
        stats.setAverageBidAmount(500000.0);
        stats.setHighestBidAmount(600000.0);
        stats.setLowestBidAmount(450000.0);
        stats.setBiddingDeadline("2024-02-15 18:00:00");
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @Operation(summary = "获取市场统计数据", description = "获取案件市场的总体统计信息")
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('DISPOSAL_VIEWER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<MarketStatistics>> getMarketStatistics() {
        
        log.info("Getting market statistics");
        
        // TODO: 实现市场统计逻辑
        MarketStatistics stats = new MarketStatistics();
        stats.setTotalAvailablePackages(128L);
        stats.setTotalAvailableAmount(15600000.0);
        stats.setTotalAvailableCases(3500L);
        stats.setAveragePackageAmount(121875.0);
        stats.setTotalActiveDisposalOrgs(45L);
        stats.setDailyNewPackages(8L);
        stats.setWeeklyCompletedPackages(23L);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @Operation(summary = "按地区获取案件包分布", description = "获取不同地区的案件包数量和金额分布")
    @GetMapping("/distribution/by-region")
    @PreAuthorize("hasRole('DISPOSAL_VIEWER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<RegionDistribution>>> getCasePackageDistributionByRegion() {
        
        log.info("Getting case package distribution by region");
        
        // TODO: 实现按地区分布统计
        List<RegionDistribution> distributions = List.of(
            new RegionDistribution("北京", 25L, 3200000.0),
            new RegionDistribution("上海", 22L, 2800000.0),
            new RegionDistribution("广东", 35L, 4500000.0),
            new RegionDistribution("江苏", 18L, 2100000.0),
            new RegionDistribution("浙江", 15L, 1900000.0)
        );
        
        return ResponseEntity.ok(ApiResponse.success(distributions));
    }

    // 内部DTO类
    
    /**
     * 竞标统计信息
     */
    public static class BiddingStats {
        private Long casePackageId;
        private Integer totalBidders;
        private Double averageBidAmount;
        private Double highestBidAmount;
        private Double lowestBidAmount;
        private String biddingDeadline;

        // Getters and Setters
        public Long getCasePackageId() { return casePackageId; }
        public void setCasePackageId(Long casePackageId) { this.casePackageId = casePackageId; }

        public Integer getTotalBidders() { return totalBidders; }
        public void setTotalBidders(Integer totalBidders) { this.totalBidders = totalBidders; }

        public Double getAverageBidAmount() { return averageBidAmount; }
        public void setAverageBidAmount(Double averageBidAmount) { this.averageBidAmount = averageBidAmount; }

        public Double getHighestBidAmount() { return highestBidAmount; }
        public void setHighestBidAmount(Double highestBidAmount) { this.highestBidAmount = highestBidAmount; }

        public Double getLowestBidAmount() { return lowestBidAmount; }
        public void setLowestBidAmount(Double lowestBidAmount) { this.lowestBidAmount = lowestBidAmount; }

        public String getBiddingDeadline() { return biddingDeadline; }
        public void setBiddingDeadline(String biddingDeadline) { this.biddingDeadline = biddingDeadline; }
    }

    /**
     * 市场统计信息
     */
    public static class MarketStatistics {
        private Long totalAvailablePackages;
        private Double totalAvailableAmount;
        private Long totalAvailableCases;
        private Double averagePackageAmount;
        private Long totalActiveDisposalOrgs;
        private Long dailyNewPackages;
        private Long weeklyCompletedPackages;

        // Getters and Setters
        public Long getTotalAvailablePackages() { return totalAvailablePackages; }
        public void setTotalAvailablePackages(Long totalAvailablePackages) { this.totalAvailablePackages = totalAvailablePackages; }

        public Double getTotalAvailableAmount() { return totalAvailableAmount; }
        public void setTotalAvailableAmount(Double totalAvailableAmount) { this.totalAvailableAmount = totalAvailableAmount; }

        public Long getTotalAvailableCases() { return totalAvailableCases; }
        public void setTotalAvailableCases(Long totalAvailableCases) { this.totalAvailableCases = totalAvailableCases; }

        public Double getAveragePackageAmount() { return averagePackageAmount; }
        public void setAveragePackageAmount(Double averagePackageAmount) { this.averagePackageAmount = averagePackageAmount; }

        public Long getTotalActiveDisposalOrgs() { return totalActiveDisposalOrgs; }
        public void setTotalActiveDisposalOrgs(Long totalActiveDisposalOrgs) { this.totalActiveDisposalOrgs = totalActiveDisposalOrgs; }

        public Long getDailyNewPackages() { return dailyNewPackages; }
        public void setDailyNewPackages(Long dailyNewPackages) { this.dailyNewPackages = dailyNewPackages; }

        public Long getWeeklyCompletedPackages() { return weeklyCompletedPackages; }
        public void setWeeklyCompletedPackages(Long weeklyCompletedPackages) { this.weeklyCompletedPackages = weeklyCompletedPackages; }
    }

    /**
     * 地区分布信息
     */
    public static class RegionDistribution {
        private String region;
        private Long packageCount;
        private Double totalAmount;

        public RegionDistribution() {}

        public RegionDistribution(String region, Long packageCount, Double totalAmount) {
            this.region = region;
            this.packageCount = packageCount;
            this.totalAmount = totalAmount;
        }

        // Getters and Setters
        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }

        public Long getPackageCount() { return packageCount; }
        public void setPackageCount(Long packageCount) { this.packageCount = packageCount; }

        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    }
}