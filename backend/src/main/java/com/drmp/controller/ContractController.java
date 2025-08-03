package com.drmp.controller;

import com.drmp.dto.request.ContractCreateRequest;
import com.drmp.dto.request.ContractUpdateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.ContractDetailResponse;
import com.drmp.dto.response.ContractListResponse;
import com.drmp.entity.enums.ContractStatus;
import com.drmp.entity.enums.ContractType;
import com.drmp.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

/**
 * 合同管理控制器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/contracts")
@RequiredArgsConstructor
@Validated
@Tag(name = "合同管理", description = "合同和协议管理相关API")
public class ContractController {
    
    private final ContractService contractService;
    
    @Operation(summary = "创建合同", description = "创建新的合同或协议")
    @PostMapping
    @PreAuthorize("hasRole('CONTRACT_MANAGER') or hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<ContractDetailResponse>> createContract(
            @Valid @RequestBody ContractCreateRequest request) {
        
        log.info("Creating contract with type: {}", request.getContractType());
        
        ContractDetailResponse response = contractService.createContract(request);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @Operation(summary = "更新合同", description = "更新合同信息")
    @PutMapping("/{contractId}")
    @PreAuthorize("hasRole('CONTRACT_MANAGER') or hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<ContractDetailResponse>> updateContract(
            @PathVariable Long contractId,
            @Valid @RequestBody ContractUpdateRequest request) {
        
        log.info("Updating contract: {}", contractId);
        
        ContractDetailResponse response = contractService.updateContract(contractId, request);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @Operation(summary = "获取合同详情", description = "根据ID获取合同详情")
    @GetMapping("/{contractId}")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<ContractDetailResponse>> getContractById(
            @PathVariable Long contractId) {
        
        ContractDetailResponse response = contractService.getContractById(contractId);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @Operation(summary = "根据合同编号获取合同", description = "根据合同编号获取合同详情")
    @GetMapping("/number/{contractNumber}")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<ContractDetailResponse>> getContractByNumber(
            @PathVariable String contractNumber) {
        
        ContractDetailResponse response = contractService.getContractByNumber(contractNumber);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @Operation(summary = "获取合同列表", description = "分页查询合同列表")
    @GetMapping
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Page<ContractListResponse>>> getContractList(
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ContractListResponse> contracts = contractService.getContractList(pageable);
        
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
    
    @Operation(summary = "条件查询合同", description = "根据条件查询合同")
    @GetMapping("/search")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Page<ContractListResponse>>> searchContracts(
            @RequestParam(required = false) ContractType contractType,
            @RequestParam(required = false) ContractStatus status,
            @RequestParam(required = false) Long partyAId,
            @RequestParam(required = false) Long partyBId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ContractListResponse> contracts = contractService.searchContracts(
            contractType, status, partyAId, partyBId, startDate, endDate, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
    
    @Operation(summary = "关键词搜索合同", description = "根据关键词搜索合同")
    @GetMapping("/search/keyword")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Page<ContractListResponse>>> searchByKeyword(
            @RequestParam String keyword,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ContractListResponse> contracts = contractService.searchByKeyword(keyword, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
    
    @Operation(summary = "获取案件包相关合同", description = "获取指定案件包的所有合同")
    @GetMapping("/case-package/{casePackageId}")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CASE_VIEWER')")
    public ResponseEntity<ApiResponse<List<ContractListResponse>>> getCasePackageContracts(
            @PathVariable Long casePackageId) {
        
        List<ContractListResponse> contracts = contractService.getCasePackageContracts(casePackageId);
        
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
    
    @Operation(summary = "获取个案相关合同", description = "获取指定个案的所有合同")
    @GetMapping("/case/{caseId}")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CASE_VIEWER')")
    public ResponseEntity<ApiResponse<List<ContractListResponse>>> getCaseContracts(
            @PathVariable Long caseId) {
        
        List<ContractListResponse> contracts = contractService.getCaseContracts(caseId);
        
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
    
    @Operation(summary = "获取机构相关合同", description = "获取指定机构的所有合同")
    @GetMapping("/organization/{organizationId}")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('ORGANIZATION_MANAGER')")
    public ResponseEntity<ApiResponse<Page<ContractListResponse>>> getOrganizationContracts(
            @PathVariable Long organizationId,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ContractListResponse> contracts = contractService.getOrganizationContracts(organizationId, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
    
    @Operation(summary = "提交合同审核", description = "提交合同进行法务审核")
    @PostMapping("/{contractId}/submit-review")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> submitForReview(@PathVariable Long contractId) {
        
        log.info("Submitting contract for review: {}", contractId);
        
        contractService.submitForReview(contractId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @Operation(summary = "审核合同", description = "法务审核合同")
    @PostMapping("/{contractId}/review")
    @PreAuthorize("hasRole('LEGAL_REVIEWER')")
    public ResponseEntity<ApiResponse<Void>> reviewContract(
            @PathVariable Long contractId,
            @RequestParam boolean approved,
            @RequestParam String comments,
            @RequestParam Long reviewerId,
            @RequestParam String reviewerName) {
        
        log.info("Reviewing contract {}: approved={}", contractId, approved);
        
        contractService.reviewContract(contractId, approved, comments, reviewerId, reviewerName);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @Operation(summary = "发送合同签署", description = "发送合同给各方进行签署")
    @PostMapping("/{contractId}/send-signature")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> sendForSignature(@PathVariable Long contractId) {
        
        log.info("Sending contract for signature: {}", contractId);
        
        contractService.sendForSignature(contractId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @Operation(summary = "签署合同", description = "对合同进行电子签署")
    @PostMapping("/{contractId}/sign")
    @PreAuthorize("hasRole('CONTRACT_SIGNER')")
    public ResponseEntity<ApiResponse<Void>> signContract(
            @PathVariable Long contractId,
            @RequestParam String partyType,
            @RequestParam String signerName) {
        
        log.info("Signing contract {}: party={}, signer={}", contractId, partyType, signerName);
        
        contractService.signContract(contractId, partyType, signerName);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @Operation(summary = "使合同生效", description = "使已签署的合同正式生效")
    @PostMapping("/{contractId}/make-effective")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> makeContractEffective(@PathVariable Long contractId) {
        
        log.info("Making contract effective: {}", contractId);
        
        contractService.makeContractEffective(contractId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @Operation(summary = "暂停合同", description = "暂停合同执行")
    @PostMapping("/{contractId}/suspend")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> suspendContract(@PathVariable Long contractId) {
        
        log.info("Suspending contract: {}", contractId);
        
        contractService.suspendContract(contractId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @Operation(summary = "恢复合同", description = "恢复暂停的合同")
    @PostMapping("/{contractId}/resume")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> resumeContract(@PathVariable Long contractId) {
        
        log.info("Resuming contract: {}", contractId);
        
        contractService.resumeContract(contractId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @Operation(summary = "终止合同", description = "终止合同")
    @PostMapping("/{contractId}/terminate")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> terminateContract(@PathVariable Long contractId) {
        
        log.info("Terminating contract: {}", contractId);
        
        contractService.terminateContract(contractId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @Operation(summary = "取消合同", description = "取消未生效的合同")
    @PostMapping("/{contractId}/cancel")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> cancelContract(@PathVariable Long contractId) {
        
        log.info("Cancelling contract: {}", contractId);
        
        contractService.cancelContract(contractId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @Operation(summary = "续约合同", description = "续约现有合同")
    @PostMapping("/{contractId}/renew")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<ContractDetailResponse>> renewContract(
            @PathVariable Long contractId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newExpiryDate) {
        
        log.info("Renewing contract {}: new expiry date={}", contractId, newExpiryDate);
        
        ContractDetailResponse response = contractService.renewContract(contractId, newExpiryDate);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @Operation(summary = "生成合同编号", description = "根据合同类型生成合同编号")
    @GetMapping("/generate-number")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<String>> generateContractNumber(
            @RequestParam ContractType contractType) {
        
        String contractNumber = contractService.generateContractNumber(contractType);
        
        return ResponseEntity.ok(ApiResponse.<String>success(contractNumber));
    }
    
    @Operation(summary = "检查合同编号可用性", description = "检查合同编号是否可用")
    @GetMapping("/check-number/{contractNumber}")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Boolean>> checkContractNumberAvailability(
            @PathVariable String contractNumber) {
        
        boolean available = contractService.isContractNumberAvailable(contractNumber);
        
        return ResponseEntity.ok(ApiResponse.success(available));
    }
    
    @Operation(summary = "获取即将到期的合同", description = "获取指定天数内即将到期的合同")
    @GetMapping("/expiring")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<List<ContractListResponse>>> getExpiringContracts(
            @Parameter(description = "天数") @RequestParam(defaultValue = "30") int days) {
        
        List<ContractListResponse> contracts = contractService.getExpiringContracts(days);
        
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
    
    @Operation(summary = "获取已过期的合同", description = "获取已过期的合同")
    @GetMapping("/expired")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<List<ContractListResponse>>> getExpiredContracts() {
        
        List<ContractListResponse> contracts = contractService.getExpiredContracts();
        
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
    
    @Operation(summary = "获取待签署的合同", description = "获取待签署的合同")
    @GetMapping("/pending-signature")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<List<ContractListResponse>>> getPendingSignatureContracts() {
        
        List<ContractListResponse> contracts = contractService.getPendingSignatureContracts();
        
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
    
    @Operation(summary = "获取需要审核的合同", description = "获取需要法务审核的合同")
    @GetMapping("/requiring-review")
    @PreAuthorize("hasRole('LEGAL_REVIEWER') or hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<List<ContractListResponse>>> getContractsRequiringReview() {
        
        List<ContractListResponse> contracts = contractService.getContractsRequiringReview();
        
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
    
    @Operation(summary = "删除合同", description = "删除草稿状态的合同")
    @DeleteMapping("/{contractId}")
    @PreAuthorize("hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteContract(@PathVariable Long contractId) {
        
        log.info("Deleting contract: {}", contractId);
        
        contractService.deleteContract(contractId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @Operation(summary = "获取合同统计", description = "获取合同统计信息")
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('CONTRACT_MANAGER')")
    public ResponseEntity<ApiResponse<ContractService.ContractStatistics>> getContractStatistics() {
        
        ContractService.ContractStatistics statistics = contractService.getContractStatistics();
        
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
    
    @Operation(summary = "获取机构合同统计", description = "获取指定机构的合同统计")
    @GetMapping("/statistics/organization/{organizationId}")
    @PreAuthorize("hasRole('CONTRACT_VIEWER') or hasRole('ORGANIZATION_MANAGER')")
    public ResponseEntity<ApiResponse<ContractService.ContractStatistics>> getOrganizationContractStatistics(
            @PathVariable Long organizationId) {
        
        ContractService.ContractStatistics statistics = contractService.getOrganizationContractStatistics(organizationId);
        
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
}