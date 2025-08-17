package com.drmp.service;

import com.drmp.dto.request.CaseTagCreateRequest;
import com.drmp.dto.request.CaseTagUpdateRequest;
import com.drmp.dto.response.CaseTagResponse;
import com.drmp.entity.CaseTag;

import java.util.List;

/**
 * 案件标签服务接口
 *
 * @author DRMP Team
 * @since 1.0.0
 */
public interface CaseTagService {

    /**
     * 创建案件标签
     */
    CaseTagResponse createCaseTag(CaseTagCreateRequest request);

    /**
     * 更新案件标签
     */
    CaseTagResponse updateCaseTag(Long id, CaseTagUpdateRequest request);

    /**
     * 删除案件标签
     */
    void deleteCaseTag(Long id);

    /**
     * 获取案件标签详情
     */
    CaseTagResponse getCaseTag(Long id);

    /**
     * 获取案件的所有标签
     */
    List<CaseTagResponse> getCaseTags(Long caseId);

    /**
     * 根据标签分类获取标签
     */
    List<CaseTagResponse> getTagsByCategory(CaseTag.TagCategory category);

    /**
     * 获取机构的所有标签
     */
    List<CaseTagResponse> getOrganizationTags(Long organizationId);

    /**
     * 获取系统标签
     */
    List<CaseTagResponse> getSystemTags();

    /**
     * 获取热门标签
     */
    List<CaseTagResponse> getPopularTags(Long organizationId);

    /**
     * 搜索标签
     */
    List<CaseTagResponse> searchTags(String keyword, Long organizationId);

    /**
     * 批量添加标签到案件
     */
    List<CaseTagResponse> batchAddTagsToCase(Long caseId, List<String> tagNames);

    /**
     * 为案件添加标签
     */
    CaseTagResponse addTagToCase(Long caseId, String tagName, CaseTag.TagCategory category);

    /**
     * 从案件移除标签
     */
    void removeTagFromCase(Long caseId, Long tagId);

    /**
     * 获取标签统计信息
     */
    Object getTagStatistics(Long organizationId);
}