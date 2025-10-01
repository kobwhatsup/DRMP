package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.dto.request.CaseTagCreateRequest;
import com.drmp.dto.request.CaseTagUpdateRequest;
import com.drmp.dto.response.CaseTagResponse;
import com.drmp.entity.CaseDetail;
import com.drmp.entity.CaseTag;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.repository.CaseDetailRepository;
import com.drmp.repository.CaseTagRepository;
import com.drmp.service.impl.CaseTagServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * CaseTagService 单元测试
 */
@DisplayName("CaseTagService 测试")
class CaseTagServiceTest extends BaseServiceTest {

    @Mock
    private CaseTagRepository caseTagRepository;

    @Mock
    private CaseDetailRepository caseDetailRepository;

    @InjectMocks
    private CaseTagServiceImpl caseTagService;

    private CaseDetail testCaseDetail;
    private CaseTag testCaseTag;

    @BeforeEach
    void setUp() {
        testCaseDetail = new CaseDetail();
        testCaseDetail.setId(1L);
        testCaseDetail.setCaseNumber("CASE-001");

        testCaseTag = new CaseTag();
        testCaseTag.setId(1L);
        testCaseTag.setCaseDetail(testCaseDetail);
        testCaseTag.setTagName("重点案件");
        testCaseTag.setTagCategory(CaseTag.TagCategory.PRIORITY);
        testCaseTag.setTagColor("#FF6B6B");
        testCaseTag.setIsSystemTag(false);
        testCaseTag.setUsageCount(1);
        testCaseTag.setOrganizationId(1L);
    }

    @Test
    @DisplayName("创建案件标签 - 成功")
    void createCaseTag_ShouldCreateSuccessfully() {
        CaseTagCreateRequest request = new CaseTagCreateRequest();
        request.setCaseId(1L);
        request.setTagName("重点案件");
        request.setTagCategory(CaseTag.TagCategory.PRIORITY);
        request.setTagColor("#FF6B6B");

        when(caseDetailRepository.findById(1L)).thenReturn(Optional.of(testCaseDetail));
        when(caseTagRepository.save(any(CaseTag.class))).thenAnswer(invocation -> {
            CaseTag tag = invocation.getArgument(0);
            tag.setId(1L);
            return tag;
        });

        CaseTagResponse result = caseTagService.createCaseTag(request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(caseTagRepository).save(any(CaseTag.class));
    }

    @Test
    @DisplayName("创建案件标签 - 案件不存在")
    void createCaseTag_WhenCaseNotFound_ShouldThrowException() {
        CaseTagCreateRequest request = new CaseTagCreateRequest();
        request.setCaseId(999L);
        request.setTagName("重点案件");

        when(caseDetailRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> caseTagService.createCaseTag(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("案件不存在");
    }

    @Test
    @DisplayName("更新案件标签 - 成功")
    void updateCaseTag_ShouldUpdateSuccessfully() {
        CaseTagUpdateRequest request = new CaseTagUpdateRequest();
        request.setTagName("高优先级");
        request.setTagColor("#00FF00");

        when(caseTagRepository.findById(1L)).thenReturn(Optional.of(testCaseTag));
        when(caseTagRepository.save(any(CaseTag.class))).thenReturn(testCaseTag);

        CaseTagResponse result = caseTagService.updateCaseTag(1L, request);

        assertThat(result).isNotNull();
        verify(caseTagRepository).save(any(CaseTag.class));
    }

    @Test
    @DisplayName("更新案件标签 - 标签不存在")
    void updateCaseTag_WhenTagNotFound_ShouldThrowException() {
        CaseTagUpdateRequest request = new CaseTagUpdateRequest();
        request.setTagName("高优先级");

        when(caseTagRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> caseTagService.updateCaseTag(999L, request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("标签不存在");
    }

    @Test
    @DisplayName("删除案件标签 - 成功")
    void deleteCaseTag_ShouldDeleteSuccessfully() {
        when(caseTagRepository.existsById(1L)).thenReturn(true);

        caseTagService.deleteCaseTag(1L);

        verify(caseTagRepository).deleteById(1L);
    }

    @Test
    @DisplayName("删除案件标签 - 标签不存在")
    void deleteCaseTag_WhenTagNotFound_ShouldThrowException() {
        when(caseTagRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> caseTagService.deleteCaseTag(999L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("标签不存在");
    }

    @Test
    @DisplayName("获取案件标签详情")
    void getCaseTag_ShouldReturnTagDetail() {
        when(caseTagRepository.findById(1L)).thenReturn(Optional.of(testCaseTag));

        CaseTagResponse result = caseTagService.getCaseTag(1L);

        assertThat(result).isNotNull();
        assertThat(result.getTagName()).isEqualTo("重点案件");
    }

    @Test
    @DisplayName("获取案件的所有标签")
    void getCaseTags_ShouldReturnTags() {
        when(caseTagRepository.findByCaseDetail_IdOrderByCreatedAtDesc(1L))
            .thenReturn(Arrays.asList(testCaseTag));

        List<CaseTagResponse> result = caseTagService.getCaseTags(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTagName()).isEqualTo("重点案件");
    }

    @Test
    @DisplayName("根据分类获取标签")
    void getTagsByCategory_ShouldReturnTags() {
        when(caseTagRepository.findByTagCategoryOrderByUsageCountDesc(CaseTag.TagCategory.PRIORITY))
            .thenReturn(Arrays.asList(testCaseTag));

        List<CaseTagResponse> result = caseTagService.getTagsByCategory(CaseTag.TagCategory.PRIORITY);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTagCategory()).isEqualTo(CaseTag.TagCategory.PRIORITY);
    }

    @Test
    @DisplayName("获取机构标签")
    void getOrganizationTags_ShouldReturnTags() {
        when(caseTagRepository.findByOrganizationIdOrderByUsageCountDesc(1L))
            .thenReturn(Arrays.asList(testCaseTag));

        List<CaseTagResponse> result = caseTagService.getOrganizationTags(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("获取系统标签")
    void getSystemTags_ShouldReturnSystemTags() {
        testCaseTag.setIsSystemTag(true);
        when(caseTagRepository.findByIsSystemTagTrueOrderByTagCategoryAscTagNameAsc())
            .thenReturn(Arrays.asList(testCaseTag));

        List<CaseTagResponse> result = caseTagService.getSystemTags();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("获取热门标签")
    void getPopularTags_ShouldReturnPopularTags() {
        when(caseTagRepository.findPopularTags(1L))
            .thenReturn(Arrays.asList(testCaseTag));

        List<CaseTagResponse> result = caseTagService.getPopularTags(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("搜索标签 - 有效关键字")
    void searchTags_WithKeyword_ShouldReturnMatchingTags() {
        when(caseTagRepository.searchByTagName("重点", 1L))
            .thenReturn(Arrays.asList(testCaseTag));

        List<CaseTagResponse> result = caseTagService.searchTags("重点", 1L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("搜索标签 - 空关键字")
    void searchTags_WithEmptyKeyword_ShouldReturnEmpty() {
        List<CaseTagResponse> result = caseTagService.searchTags("", 1L);

        assertThat(result).isEmpty();
        verify(caseTagRepository, never()).searchByTagName(anyString(), anyLong());
    }

    @Test
    @DisplayName("批量添加标签到案件")
    void batchAddTagsToCase_ShouldAddTags() {
        List<String> tagNames = Arrays.asList("重点", "紧急");
        when(caseDetailRepository.findById(1L)).thenReturn(Optional.of(testCaseDetail));
        when(caseTagRepository.findByTagNameAndTagCategoryAndOrganizationId(
            anyString(), any(CaseTag.TagCategory.class), anyLong()))
            .thenReturn(Optional.empty());
        when(caseTagRepository.save(any(CaseTag.class))).thenAnswer(invocation -> {
            CaseTag tag = invocation.getArgument(0);
            tag.setId(System.currentTimeMillis());
            return tag;
        });

        List<CaseTagResponse> result = caseTagService.batchAddTagsToCase(1L, tagNames);

        assertThat(result).hasSize(2);
        verify(caseTagRepository, times(2)).save(any(CaseTag.class));
    }

    @Test
    @DisplayName("添加标签到案件 - 新标签")
    void addTagToCase_WithNewTag_ShouldCreateTag() {
        when(caseDetailRepository.findById(1L)).thenReturn(Optional.of(testCaseDetail));
        when(caseTagRepository.findByTagNameAndTagCategoryAndOrganizationId(
            "新标签", CaseTag.TagCategory.CUSTOM, 1L))
            .thenReturn(Optional.empty());
        when(caseTagRepository.save(any(CaseTag.class))).thenAnswer(invocation -> {
            CaseTag tag = invocation.getArgument(0);
            tag.setId(2L);
            return tag;
        });

        CaseTagResponse result = caseTagService.addTagToCase(1L, "新标签", CaseTag.TagCategory.CUSTOM);

        assertThat(result).isNotNull();
        verify(caseTagRepository).save(any(CaseTag.class));
    }

    @Test
    @DisplayName("添加标签到案件 - 已存在标签")
    void addTagToCase_WithExistingTag_ShouldIncrementUsage() {
        when(caseDetailRepository.findById(1L)).thenReturn(Optional.of(testCaseDetail));
        when(caseTagRepository.findByTagNameAndTagCategoryAndOrganizationId(
            "重点案件", CaseTag.TagCategory.PRIORITY, 1L))
            .thenReturn(Optional.of(testCaseTag));
        when(caseTagRepository.save(any(CaseTag.class))).thenReturn(testCaseTag);

        CaseTagResponse result = caseTagService.addTagToCase(1L, "重点案件", CaseTag.TagCategory.PRIORITY);

        assertThat(result).isNotNull();
        verify(caseTagRepository).save(any(CaseTag.class));
    }

    @Test
    @DisplayName("从案件移除标签 - 成功")
    void removeTagFromCase_ShouldRemoveSuccessfully() {
        when(caseTagRepository.findById(1L)).thenReturn(Optional.of(testCaseTag));

        caseTagService.removeTagFromCase(1L, 1L);

        verify(caseTagRepository).deleteById(1L);
    }

    @Test
    @DisplayName("从案件移除标签 - 标签不属于该案件")
    void removeTagFromCase_WhenTagNotBelongsToCase_ShouldThrowException() {
        testCaseTag.getCaseDetail().setId(2L);
        when(caseTagRepository.findById(1L)).thenReturn(Optional.of(testCaseTag));

        assertThatThrownBy(() -> caseTagService.removeTagFromCase(1L, 1L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("标签不属于该案件");
    }

    @Test
    @DisplayName("获取标签统计信息")
    void getTagStatistics_ShouldReturnStatistics() {
        List<Object[]> categoryStats = new ArrayList<>();
        categoryStats.add(new Object[]{CaseTag.TagCategory.PRIORITY, 10L});
        categoryStats.add(new Object[]{CaseTag.TagCategory.CUSTOM, 5L});

        when(caseTagRepository.countByTagCategory(1L)).thenReturn(categoryStats);
        when(caseTagRepository.findPopularTags(1L)).thenReturn(Arrays.asList(testCaseTag));
        when(caseTagRepository.findByIsSystemTagTrueOrderByTagCategoryAscTagNameAsc())
            .thenReturn(new ArrayList<>());
        when(caseTagRepository.findByIsSystemTagFalseAndOrganizationIdOrderByUsageCountDesc(1L))
            .thenReturn(new ArrayList<>());

        Object result = caseTagService.getTagStatistics(1L);

        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(Map.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> statsMap = (Map<String, Object>) result;
        assertThat(statsMap).containsKey("totalTags");
        assertThat(statsMap).containsKey("categoryCounts");
    }
}
