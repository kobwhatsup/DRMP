package com.drmp.controller;

import com.drmp.dto.request.CaseTagCreateRequest;
import com.drmp.dto.request.CaseTagUpdateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.CaseTagResponse;
import com.drmp.entity.CaseTag;
import com.drmp.service.CaseTagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 案件标签控制器
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Tag(name = "案件标签管理", description = "案件标签的增删改查和管理")
@RestController
@RequestMapping("/api/v1/case-tags")
@RequiredArgsConstructor
public class CaseTagController {

    private final CaseTagService caseTagService;

    @Operation(summary = "创建案件标签", description = "为案件创建新的标签")
    @PostMapping
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<CaseTagResponse> createCaseTag(@Valid @RequestBody CaseTagCreateRequest request) {
        CaseTagResponse response = caseTagService.createCaseTag(request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "更新案件标签", description = "更新指定的案件标签")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<CaseTagResponse> updateCaseTag(
            @PathVariable Long id,
            @Valid @RequestBody CaseTagUpdateRequest request) {
        CaseTagResponse response = caseTagService.updateCaseTag(id, request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "删除案件标签", description = "删除指定的案件标签")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Void> deleteCaseTag(@PathVariable Long id) {
        caseTagService.deleteCaseTag(id);
        return ApiResponse.success();
    }

    @Operation(summary = "获取案件标签详情", description = "根据ID获取案件标签详情")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<CaseTagResponse> getCaseTag(@PathVariable Long id) {
        CaseTagResponse response = caseTagService.getCaseTag(id);
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取案件的所有标签", description = "获取指定案件的所有标签")
    @GetMapping("/case/{caseId}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<CaseTagResponse>> getCaseTags(@PathVariable Long caseId) {
        List<CaseTagResponse> response = caseTagService.getCaseTags(caseId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "根据分类获取标签", description = "根据标签分类获取标签列表")
    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<CaseTagResponse>> getTagsByCategory(@PathVariable CaseTag.TagCategory category) {
        List<CaseTagResponse> response = caseTagService.getTagsByCategory(category);
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取机构标签", description = "获取当前机构的所有标签")
    @GetMapping("/organization")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<CaseTagResponse>> getOrganizationTags() {
        // 从安全上下文获取当前机构ID
        Long orgId = 1L; // TODO: 从SecurityUtils获取
        List<CaseTagResponse> response = caseTagService.getOrganizationTags(orgId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取系统标签", description = "获取所有系统预定义标签")
    @GetMapping("/system")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<CaseTagResponse>> getSystemTags() {
        List<CaseTagResponse> response = caseTagService.getSystemTags();
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取热门标签", description = "获取使用频率最高的标签")
    @GetMapping("/popular")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<CaseTagResponse>> getPopularTags() {
        Long orgId = 1L; // TODO: 从SecurityUtils获取
        List<CaseTagResponse> response = caseTagService.getPopularTags(orgId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "搜索标签", description = "根据关键词搜索标签")
    @GetMapping("/search")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<CaseTagResponse>> searchTags(@RequestParam String keyword) {
        Long orgId = 1L; // TODO: 从SecurityUtils获取
        List<CaseTagResponse> response = caseTagService.searchTags(keyword, orgId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "批量添加标签", description = "批量为案件添加标签")
    @PostMapping("/case/{caseId}/batch")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<CaseTagResponse>> batchAddTagsToCase(
            @PathVariable Long caseId,
            @RequestBody List<String> tagNames) {
        List<CaseTagResponse> response = caseTagService.batchAddTagsToCase(caseId, tagNames);
        return ApiResponse.success(response);
    }

    @Operation(summary = "添加标签到案件", description = "为案件添加单个标签")
    @PostMapping("/case/{caseId}/tag")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<CaseTagResponse> addTagToCase(
            @PathVariable Long caseId,
            @RequestParam String tagName,
            @RequestParam CaseTag.TagCategory category) {
        CaseTagResponse response = caseTagService.addTagToCase(caseId, tagName, category);
        return ApiResponse.success(response);
    }

    @Operation(summary = "从案件移除标签", description = "从案件中移除指定标签")
    @DeleteMapping("/case/{caseId}/tag/{tagId}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Void> removeTagFromCase(
            @PathVariable Long caseId,
            @PathVariable Long tagId) {
        caseTagService.removeTagFromCase(caseId, tagId);
        return ApiResponse.success();
    }

    @Operation(summary = "获取标签统计", description = "获取标签使用统计信息")
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Object> getTagStatistics() {
        Long orgId = 1L; // TODO: 从SecurityUtils获取
        Object response = caseTagService.getTagStatistics(orgId);
        return ApiResponse.success(response);
    }
}