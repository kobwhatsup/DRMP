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
     *
     * @param request 创建请求
     * @return 创建的标签响应
     */
    CaseTagResponse createCaseTag(CaseTagCreateRequest request);

    /**
     * 更新案件标签
     *
     * @param id 标签ID
     * @param request 更新请求
     * @return 更新后的标签响应
     */
    CaseTagResponse updateCaseTag(Long id, CaseTagUpdateRequest request);

    /**
     * 删除案件标签
     *
     * @param id 标签ID
     */
    void deleteCaseTag(Long id);

    /**
     * 获取案件标签详情
     *
     * @param id 标签ID
     * @return 标签响应
     */
    CaseTagResponse getCaseTag(Long id);

    /**
     * 获取案件的所有标签
     *
     * @param caseId 案件ID
     * @return 标签列表
     */
    List<CaseTagResponse> getCaseTags(Long caseId);

    /**
     * 根据分类获取标签
     *
     * @param category 标签分类
     * @return 标签列表
     */
    List<CaseTagResponse> getTagsByCategory(CaseTag.TagCategory category);

    /**
     * 获取机构标签
     *
     * @param orgId 机构ID
     * @return 标签列表
     */
    List<CaseTagResponse> getOrganizationTags(Long orgId);

    /**
     * 获取系统标签
     *
     * @return 系统标签列表
     */
    List<CaseTagResponse> getSystemTags();

    /**
     * 获取热门标签
     *
     * @param orgId 机构ID
     * @return 热门标签列表
     */
    List<CaseTagResponse> getPopularTags(Long orgId);

    /**
     * 搜索标签
     *
     * @param keyword 搜索关键词
     * @param orgId 机构ID
     * @return 匹配的标签列表
     */
    List<CaseTagResponse> searchTags(String keyword, Long orgId);

    /**
     * 批量为案件添加标签
     *
     * @param caseId 案件ID
     * @param tagNames 标签名称列表
     * @return 添加的标签列表
     */
    List<CaseTagResponse> batchAddTagsToCase(Long caseId, List<String> tagNames);

    /**
     * 为案件添加单个标签
     *
     * @param caseId 案件ID
     * @param tagName 标签名称
     * @param category 标签分类
     * @return 添加的标签响应
     */
    CaseTagResponse addTagToCase(Long caseId, String tagName, CaseTag.TagCategory category);

    /**
     * 从案件移除标签
     *
     * @param caseId 案件ID
     * @param tagId 标签ID
     */
    void removeTagFromCase(Long caseId, Long tagId);

    /**
     * 获取标签统计信息
     *
     * @param orgId 机构ID
     * @return 统计信息
     */
    Object getTagStatistics(Long orgId);
}