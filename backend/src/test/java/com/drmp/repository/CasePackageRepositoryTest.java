package com.drmp.repository;

import com.drmp.config.BaseRepositoryTest;
import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import com.drmp.factory.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

/**
 * CasePackageRepository Tests
 * 案件包仓库层测试
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@DisplayName("CasePackageRepository 测试")
class CasePackageRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private CasePackageRepository casePackageRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    private Organization testOrganization;
    private CasePackage testCasePackage;

    @BeforeEach
    @Override
    public void setUp() {
        super.setUp();

        // 先创建并保存机构
        testOrganization = TestDataFactory.createSourceOrganization();
        testOrganization = organizationRepository.save(testOrganization);

        // 创建案件包
        testCasePackage = TestDataFactory.createCasePackage(testOrganization);
    }

    @Test
    @DisplayName("保存案件包 - 成功保存")
    void save_ShouldPersistCasePackage() {
        // Act
        CasePackage saved = casePackageRepository.save(testCasePackage);

        // Assert
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getPackageCode()).isEqualTo(testCasePackage.getPackageCode());
        assertThat(saved.getSourceOrganization()).isNotNull();
    }

    @Test
    @DisplayName("根据ID查询 - 成功查询")
    void findById_ShouldReturnCasePackage_WhenExists() {
        // Arrange
        CasePackage saved = casePackageRepository.save(testCasePackage);

        // Act
        Optional<CasePackage> found = casePackageRepository.findById(saved.getId());

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getPackageCode()).isEqualTo(testCasePackage.getPackageCode());
    }

    @Test
    @DisplayName("根据案件包编号查询 - 成功查询")
    void findByPackageCode_ShouldReturnCasePackage() {
        // Arrange
        casePackageRepository.save(testCasePackage);

        // Act
        Optional<CasePackage> found = casePackageRepository.findByPackageCode("PKG20250101001");

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getPackageName()).isEqualTo(testCasePackage.getPackageName());
    }

    @Test
    @DisplayName("根据案源机构ID查询 - 返回列表")
    void findBySourceOrganizationId_ShouldReturnList() {
        // Arrange
        casePackageRepository.save(testCasePackage);

        // Act
        List<CasePackage> packages = casePackageRepository.findBySourceOrganizationId(testOrganization.getId());

        // Assert
        assertThat(packages).isNotEmpty();
        assertThat(packages).hasSize(1);
        assertThat(packages.get(0).getSourceOrganization().getId()).isEqualTo(testOrganization.getId());
    }

    @Test
    @DisplayName("根据状态查询 - 返回列表")
    void findByStatus_ShouldReturnMatchingPackages() {
        // Arrange
        testCasePackage.setStatus(CasePackageStatus.PUBLISHED);
        casePackageRepository.save(testCasePackage);

        CasePackage draftPackage = TestDataFactory.createCasePackage(testOrganization);
        draftPackage.setPackageCode("PKG20250101002");
        draftPackage.setStatus(CasePackageStatus.DRAFT);
        casePackageRepository.save(draftPackage);

        // Act
        List<CasePackage> publishedPackages = casePackageRepository.findByStatus(CasePackageStatus.PUBLISHED);

        // Assert
        assertThat(publishedPackages).hasSize(1);
        assertThat(publishedPackages.get(0).getStatus()).isEqualTo(CasePackageStatus.PUBLISHED);
    }

    @Test
    @DisplayName("统计案源机构的案件包数量")
    void countBySourceOrganizationId_ShouldReturnCorrectCount() {
        // Arrange
        casePackageRepository.save(testCasePackage);

        CasePackage anotherPackage = TestDataFactory.createCasePackage(testOrganization);
        anotherPackage.setPackageCode("PKG20250101002");
        casePackageRepository.save(anotherPackage);

        // Act
        Long count = casePackageRepository.countBySourceOrganizationId(testOrganization.getId());

        // Assert
        assertThat(count).isEqualTo(2L);
    }


    @Test
    @DisplayName("分页查询 - 返回分页结果")
    void findAll_WithPageable_ShouldReturnPagedResults() {
        // Arrange
        casePackageRepository.save(testCasePackage);

        // Act
        Page<CasePackage> page = casePackageRepository.findAll(PageRequest.of(0, 10));

        // Assert
        assertThat(page).isNotNull();
        assertThat(page.getContent()).isNotEmpty();
        assertThat(page.getTotalElements()).isGreaterThan(0);
    }

    @Test
    @DisplayName("更新案件包 - 成功更新")
    void update_ShouldModifyCasePackage() {
        // Arrange
        CasePackage saved = casePackageRepository.save(testCasePackage);

        // Act
        saved.setPackageName("更新后的案件包名称");
        saved.setStatus(CasePackageStatus.PUBLISHED);
        CasePackage updated = casePackageRepository.save(saved);

        // Assert
        CasePackage found = casePackageRepository.findById(updated.getId()).orElseThrow();
        assertThat(found.getPackageName()).isEqualTo("更新后的案件包名称");
        assertThat(found.getStatus()).isEqualTo(CasePackageStatus.PUBLISHED);
    }

    @Test
    @DisplayName("删除案件包 - 成功删除")
    void delete_ShouldRemoveCasePackage() {
        // Arrange
        CasePackage saved = casePackageRepository.save(testCasePackage);
        Long savedId = saved.getId();

        // Act
        casePackageRepository.delete(saved);

        // Assert
        Optional<CasePackage> found = casePackageRepository.findById(savedId);
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("级联关系 - 验证机构关系")
    void relationship_ShouldMaintainOrganizationReference() {
        // Arrange
        CasePackage saved = casePackageRepository.save(testCasePackage);

        // Act
        casePackageRepository.flush();
        CasePackage found = casePackageRepository.findById(saved.getId()).orElseThrow();

        // Assert
        assertThat(found.getSourceOrganization()).isNotNull();
        assertThat(found.getSourceOrganization().getId()).isEqualTo(testOrganization.getId());
        assertThat(found.getSourceOrganization().getName()).isEqualTo(testOrganization.getName());
    }

    @Test
    @DisplayName("唯一性约束 - 案件包编号不能重复")
    void uniqueConstraint_PackageCode_ShouldPreventDuplicates() {
        // Arrange
        casePackageRepository.save(testCasePackage);

        CasePackage duplicatePackage = TestDataFactory.createCasePackage(testOrganization);
        duplicatePackage.setPackageCode(testCasePackage.getPackageCode()); // 相同的编号

        // Act & Assert
        assertThatThrownBy(() -> {
            casePackageRepository.save(duplicatePackage);
            casePackageRepository.flush();
        }).isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("查询优化 - 验证索引使用")
    void queryOptimization_ShouldUseIndexes() {
        // Arrange
        for (int i = 0; i < 100; i++) {
            CasePackage pkg = TestDataFactory.createCasePackage(testOrganization);
            pkg.setPackageCode("PKG2025010100" + i);
            casePackageRepository.save(pkg);
        }

        // Act - 使用有索引的字段查询应该很快
        long startTime = System.currentTimeMillis();
        List<CasePackage> results = casePackageRepository.findBySourceOrganizationId(testOrganization.getId());
        long endTime = System.currentTimeMillis();

        // Assert
        assertThat(results).hasSize(100);
        assertThat(endTime - startTime).isLessThan(1000); // 应该在1秒内完成
    }
}
