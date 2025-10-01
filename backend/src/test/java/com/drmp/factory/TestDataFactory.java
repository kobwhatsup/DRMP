package com.drmp.factory;

import com.drmp.entity.*;
import com.drmp.entity.enums.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;

/**
 * Test Data Factory
 * 测试数据工厂，用于创建测试所需的实体对象
 *
 * @author DRMP Team
 * @since 1.0.0
 */
public class TestDataFactory {

    /**
     * 创建测试用的案源机构
     */
    public static Organization createSourceOrganization() {
        return Organization.builder()
                .orgCode("ORG001")
                .name("测试银行")
                .type(OrganizationType.BANK)
                .status(OrganizationStatus.ACTIVE)
                .contactPerson("张三")
                .contactPhone("13800138000")
                .email("test@bank.com")
                .address("北京市朝阳区测试大街1号")
                .membershipPaid(true)
                .membershipStatus("PAID")
                .build();
    }

    /**
     * 创建测试用的处置机构
     */
    public static Organization createDisposalOrganization() {
        return Organization.builder()
                .orgCode("ORG002")
                .name("测试律所")
                .type(OrganizationType.LAW_FIRM)
                .status(OrganizationStatus.ACTIVE)
                .contactPerson("李四")
                .contactPhone("13900139000")
                .email("test@lawfirm.com")
                .address("上海市浦东新区测试路2号")
                .teamSize(50)
                .monthlyCaseCapacity(1000)
                .currentLoadPercentage(60)
                .membershipPaid(true)
                .membershipStatus("PAID")
                .build();
    }

    /**
     * 创建测试用的案件包
     */
    public static CasePackage createCasePackage() {
        return createCasePackage(createSourceOrganization());
    }

    /**
     * 创建测试用的案件包（指定案源机构）
     */
    public static CasePackage createCasePackage(Organization sourceOrg) {
        return CasePackage.builder()
                .packageCode("PKG20250101001")
                .packageName("2025年1月批次案件包")
                .sourceOrganization(sourceOrg)
                .status(CasePackageStatus.DRAFT)
                .caseCount(100)
                .totalAmount(new BigDecimal("10000000.00"))
                .remainingAmount(new BigDecimal("10000000.00"))
                .expectedRecoveryRate(new BigDecimal("30.00"))
                .expectedDisposalDays(180)
                .entrustStartDate(LocalDate.now())
                .entrustEndDate(LocalDate.now().plusMonths(6))
                .assignmentType(AssignmentType.MANUAL)
                .allowBidding(false)
                .cases(new ArrayList<>())
                .assignments(new ArrayList<>())
                .build();
    }

    /**
     * 创建测试用的案件
     */
    public static Case createCase() {
        return createCase(createCasePackage());
    }

    /**
     * 创建测试用的案件（指定案件包）
     */
    public static Case createCase(CasePackage casePackage) {
        Case c = Case.builder()
                .casePackage(casePackage)
                .caseNo("CASE20250101001")
                .debtorNameEncrypted("enc_王五")
                .debtorIdCardEncrypted("enc_110101199001011234")
                .debtorPhoneEncrypted("enc_13700137000")
                .loanAmount(new BigDecimal("100000.00"))
                .remainingAmount(new BigDecimal("105000.00"))
                .overdueDays(365)
                .overdueDate(LocalDate.now().minusYears(1))
                .build();
        return c;
    }

    /**
     * 创建测试用的用户
     */
    public static User createUser() {
        return createUser(createSourceOrganization());
    }

    /**
     * 创建测试用的用户（指定机构）
     */
    public static User createUser(Organization organization) {
        return User.builder()
                .username("testuser")
                .password("$2a$10$test.hashed.password")
                .realName("测试用户")
                .email("testuser@example.com")
                .phone("13600136000")
                .organization(organization)
                .status(UserStatus.ACTIVE)
                .build();
    }

    /**
     * 创建测试用的案件包分配记录
     */
    public static CasePackageAssignment createAssignment() {
        return createAssignment(createCasePackage(), createDisposalOrganization());
    }

    /**
     * 创建测试用的案件包分配记录（指定案件包和处置机构）
     */
    public static CasePackageAssignment createAssignment(CasePackage casePackage, Organization disposalOrg) {
        Organization sourceOrg = casePackage.getSourceOrganization();
        return CasePackageAssignment.builder()
                .casePackage(casePackage)
                .sourceOrg(sourceOrg)
                .disposalOrg(disposalOrg)
                .assignmentType("MANUAL")
                .assignmentStrategy("REGION_BASED")
                .assignmentReason("测试分配")
                .status("PENDING")
                .build();
    }
}
