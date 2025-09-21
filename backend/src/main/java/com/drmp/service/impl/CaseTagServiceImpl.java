package com.drmp.service.impl;

import com.drmp.dto.request.CaseTagCreateRequest;
import com.drmp.dto.request.CaseTagUpdateRequest;
import com.drmp.dto.response.CaseTagResponse;
import com.drmp.entity.CaseDetail;
import com.drmp.entity.CaseTag;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.repository.CaseDetailRepository;
import com.drmp.repository.CaseTagRepository;
import com.drmp.service.CaseTagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 案件标签服务实现
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CaseTagServiceImpl implements CaseTagService {

    private final CaseTagRepository caseTagRepository;
    private final CaseDetailRepository caseDetailRepository;

    @Override
    @Transactional
    public CaseTagResponse createCaseTag(CaseTagCreateRequest request) {
        log.info("Creating case tag for case ID: {}, tag name: {}", request.getCaseId(), request.getTagName());

        // 查找案件
        CaseDetail caseDetail = caseDetailRepository.findById(request.getCaseId())
                .orElseThrow(() -> new ResourceNotFoundException("案件不存在: " + request.getCaseId()));

        // 创建标签
        CaseTag caseTag = new CaseTag();
        caseTag.setCaseDetail(caseDetail);
        caseTag.setTagName(request.getTagName());
        caseTag.setTagCategory(request.getTagCategory());
        caseTag.setTagColor(request.getTagColor() != null ? request.getTagColor() : generateTagColor());
        caseTag.setTagDescription(request.getTagDescription());
        caseTag.setIsSystemTag(request.getIsSystemTag());
        caseTag.setUsageCount(1);
        caseTag.setLastUsedAt(LocalDateTime.now());
        caseTag.setCreatedBy(getCurrentUserId());
        caseTag.setOrganizationId(getCurrentOrganizationId());

        CaseTag saved = caseTagRepository.save(caseTag);
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public CaseTagResponse updateCaseTag(Long id, CaseTagUpdateRequest request) {
        log.info("Updating case tag ID: {}", id);

        CaseTag caseTag = caseTagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("标签不存在: " + id));

        // 更新字段
        if (request.getTagName() != null) {
            caseTag.setTagName(request.getTagName());
        }
        if (request.getTagCategory() != null) {
            caseTag.setTagCategory(request.getTagCategory());
        }
        if (request.getTagColor() != null) {
            caseTag.setTagColor(request.getTagColor());
        }
        if (request.getTagDescription() != null) {
            caseTag.setTagDescription(request.getTagDescription());
        }

        CaseTag updated = caseTagRepository.save(caseTag);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCaseTag(Long id) {
        log.info("Deleting case tag ID: {}", id);

        if (!caseTagRepository.existsById(id)) {
            throw new ResourceNotFoundException("标签不存在: " + id);
        }

        caseTagRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CaseTagResponse getCaseTag(Long id) {
        log.debug("Getting case tag ID: {}", id);

        CaseTag caseTag = caseTagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("标签不存在: " + id));

        return convertToResponse(caseTag);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CaseTagResponse> getCaseTags(Long caseId) {
        log.debug("Getting tags for case ID: {}", caseId);

        List<CaseTag> tags = caseTagRepository.findByCaseDetail_IdOrderByCreatedAtDesc(caseId);
        return tags.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CaseTagResponse> getTagsByCategory(CaseTag.TagCategory category) {
        log.debug("Getting tags by category: {}", category);

        List<CaseTag> tags = caseTagRepository.findByTagCategoryOrderByUsageCountDesc(category);
        return tags.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CaseTagResponse> getOrganizationTags(Long orgId) {
        log.debug("Getting tags for organization ID: {}", orgId);

        List<CaseTag> tags = caseTagRepository.findByOrganizationIdOrderByUsageCountDesc(orgId);
        return tags.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CaseTagResponse> getSystemTags() {
        log.debug("Getting system tags");

        List<CaseTag> tags = caseTagRepository.findByIsSystemTagTrueOrderByTagCategoryAscTagNameAsc();
        return tags.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CaseTagResponse> getPopularTags(Long orgId) {
        log.debug("Getting popular tags for organization ID: {}", orgId);

        List<CaseTag> tags = caseTagRepository.findPopularTags(orgId);
        // 限制返回前20个热门标签
        return tags.stream()
                .limit(20)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CaseTagResponse> searchTags(String keyword, Long orgId) {
        log.debug("Searching tags with keyword: {}, org ID: {}", keyword, orgId);

        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<CaseTag> tags = caseTagRepository.searchByTagName(keyword.trim(), orgId);
        return tags.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<CaseTagResponse> batchAddTagsToCase(Long caseId, List<String> tagNames) {
        log.info("Batch adding {} tags to case ID: {}", tagNames.size(), caseId);

        CaseDetail caseDetail = caseDetailRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("案件不存在: " + caseId));

        List<CaseTagResponse> responses = new ArrayList<>();
        Long orgId = getCurrentOrganizationId();
        Long userId = getCurrentUserId();

        for (String tagName : tagNames) {
            if (tagName == null || tagName.trim().isEmpty()) {
                continue;
            }

            // 检查是否已存在相同标签
            Optional<CaseTag> existingTag = caseTagRepository
                    .findByTagNameAndTagCategoryAndOrganizationId(
                            tagName.trim(),
                            CaseTag.TagCategory.CUSTOM,
                            orgId
                    );

            CaseTag tag;
            if (existingTag.isPresent()) {
                tag = existingTag.get();
                tag.incrementUsageCount();
            } else {
                tag = new CaseTag();
                tag.setCaseDetail(caseDetail);
                tag.setTagName(tagName.trim());
                tag.setTagCategory(CaseTag.TagCategory.CUSTOM);
                tag.setTagColor(generateTagColor());
                tag.setIsSystemTag(false);
                tag.setUsageCount(1);
                tag.setLastUsedAt(LocalDateTime.now());
                tag.setCreatedBy(userId);
                tag.setOrganizationId(orgId);
            }

            CaseTag saved = caseTagRepository.save(tag);
            responses.add(convertToResponse(saved));
        }

        return responses;
    }

    @Override
    @Transactional
    public CaseTagResponse addTagToCase(Long caseId, String tagName, CaseTag.TagCategory category) {
        log.info("Adding tag '{}' to case ID: {}", tagName, caseId);

        CaseDetail caseDetail = caseDetailRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("案件不存在: " + caseId));

        Long orgId = getCurrentOrganizationId();

        // 检查是否已存在相同标签
        Optional<CaseTag> existingTag = caseTagRepository
                .findByTagNameAndTagCategoryAndOrganizationId(tagName, category, orgId);

        CaseTag tag;
        if (existingTag.isPresent()) {
            tag = existingTag.get();
            tag.incrementUsageCount();
        } else {
            tag = new CaseTag();
            tag.setCaseDetail(caseDetail);
            tag.setTagName(tagName);
            tag.setTagCategory(category);
            tag.setTagColor(generateTagColor());
            tag.setIsSystemTag(false);
            tag.setUsageCount(1);
            tag.setLastUsedAt(LocalDateTime.now());
            tag.setCreatedBy(getCurrentUserId());
            tag.setOrganizationId(orgId);
        }

        CaseTag saved = caseTagRepository.save(tag);
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public void removeTagFromCase(Long caseId, Long tagId) {
        log.info("Removing tag ID: {} from case ID: {}", tagId, caseId);

        CaseTag tag = caseTagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("标签不存在: " + tagId));

        // 验证标签属于该案件
        if (!tag.getCaseDetail().getId().equals(caseId)) {
            throw new IllegalArgumentException("标签不属于该案件");
        }

        caseTagRepository.deleteById(tagId);
    }

    @Override
    @Transactional(readOnly = true)
    public Object getTagStatistics(Long orgId) {
        log.debug("Getting tag statistics for organization ID: {}", orgId);

        List<Object[]> categoryStats = caseTagRepository.countByTagCategory(orgId);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("organizationId", orgId);
        statistics.put("generatedAt", LocalDateTime.now());

        // 分类统计
        Map<String, Long> categoryMap = new HashMap<>();
        for (Object[] stat : categoryStats) {
            CaseTag.TagCategory category = (CaseTag.TagCategory) stat[0];
            Long count = (Long) stat[1];
            categoryMap.put(category.name(), count);
        }
        statistics.put("categoryCounts", categoryMap);

        // 总标签数
        long totalTags = categoryMap.values().stream().mapToLong(Long::longValue).sum();
        statistics.put("totalTags", totalTags);

        // 热门标签
        List<CaseTag> popularTags = caseTagRepository.findPopularTags(orgId);
        List<Map<String, Object>> popularTagList = new ArrayList<>();
        for (int i = 0; i < Math.min(10, popularTags.size()); i++) {
            CaseTag tag = popularTags.get(i);
            Map<String, Object> tagInfo = new HashMap<>();
            tagInfo.put("id", tag.getId());
            tagInfo.put("name", tag.getTagName());
            tagInfo.put("category", tag.getTagCategory().name());
            tagInfo.put("usageCount", tag.getUsageCount());
            tagInfo.put("lastUsedAt", tag.getLastUsedAt());
            popularTagList.add(tagInfo);
        }
        statistics.put("topTags", popularTagList);

        // 系统标签数
        List<CaseTag> systemTags = caseTagRepository.findByIsSystemTagTrueOrderByTagCategoryAscTagNameAsc();
        statistics.put("systemTagCount", systemTags.size());

        // 自定义标签数
        List<CaseTag> customTags = caseTagRepository.findByIsSystemTagFalseAndOrganizationIdOrderByUsageCountDesc(orgId);
        statistics.put("customTagCount", customTags.size());

        return statistics;
    }

    /**
     * 转换实体为响应DTO
     */
    private CaseTagResponse convertToResponse(CaseTag caseTag) {
        CaseTagResponse response = new CaseTagResponse();
        BeanUtils.copyProperties(caseTag, response);

        // 设置额外字段
        if (caseTag.getCaseDetail() != null) {
            response.setCaseId(caseTag.getCaseDetail().getId());
        }
        response.setTagCategory(caseTag.getTagCategory());
        response.setDisplayName(caseTag.getDisplayName());

        return response;
    }

    /**
     * 生成随机标签颜色
     */
    private String generateTagColor() {
        String[] colors = {
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
            "#DDA0DD", "#98D8C8", "#FFB6C1", "#87CEEB", "#FFE4B5",
            "#F4A460", "#D8BFD8", "#B0E0E6", "#F0E68C", "#FFA07A"
        };
        Random random = new Random();
        return colors[random.nextInt(colors.length)];
    }

    /**
     * 获取当前用户ID（实际应从安全上下文获取）
     */
    private Long getCurrentUserId() {
        // TODO: 从SecurityContextHolder获取当前用户ID
        // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
        //     return ((CustomUserDetails) authentication.getPrincipal()).getId();
        // }
        return 1L; // 模拟数据
    }

    /**
     * 获取当前用户所属机构ID（实际应从安全上下文获取）
     */
    private Long getCurrentOrganizationId() {
        // TODO: 从SecurityContextHolder获取当前用户的机构ID
        // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
        //     return ((CustomUserDetails) authentication.getPrincipal()).getOrganizationId();
        // }
        return 1L; // 模拟数据
    }
}