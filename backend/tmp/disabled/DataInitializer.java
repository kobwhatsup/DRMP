package com.drmp.config;

import com.drmp.entity.Organization;
import com.drmp.entity.Permission;
import com.drmp.entity.User;
import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import com.drmp.entity.enums.UserStatus;
import com.drmp.repository.OrganizationRepository;
import com.drmp.repository.PermissionRepository;
import com.drmp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Data Initializer - Creates initial test data for development
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Initializing test data...");
            initializePermissions();
            initializeOrganizations();
            initializeUsers();
            log.info("Test data initialization completed!");
        } else {
            log.info("Test data already exists, skipping initialization.");
        }
    }

    private void initializePermissions() {
        log.info("Creating permissions...");
        
        String[] permissions = {
            "organization:read", "organization:create", "organization:update", "organization:delete", "organization:approve",
            "user:read", "user:create", "user:update", "user:delete",
            "case:read", "case:create", "case:update", "case:delete", "case:assign",
            "report:read", "report:export",
            "system:admin"
        };

        for (String permName : permissions) {
            if (!permissionRepository.existsByCode(permName)) {
                String[] parts = permName.split(":");
                String resource = parts.length > 0 ? parts[0] : "system";
                String action = parts.length > 1 ? parts[1] : "access";
                
                Permission permission = Permission.builder()
                    .code(permName)
                    .name(permName.replace(":", ""))
                    .resource(resource)
                    .action(action)
                    .description("Permission for " + permName)
                    .build();
                permissionRepository.save(permission);
            }
        }
    }

    private void initializeOrganizations() {
        log.info("Creating organizations...");
        
        // Create some sample organizations
        Organization[] orgs = {
            // 案源机构
            Organization.builder()
                .orgCode("BANK001")
                .orgName("中国工商银行信用卡中心")
                .type(OrganizationType.BANK)
                .status(OrganizationStatus.ACTIVE)
                .contactPerson("张经理")
                .contactPhone("010-88888888")
                .email("zhang@icbc.com.cn")
                .address("北京市西城区复兴门内大街55号")
                .teamSize(50)
                .monthlyCaseCapacity(5000)
                .currentLoadPercentage(75)
                .serviceRegions(createSet("北京", "上海", "广州", "深圳"))
                .businessScopes(createSet("信用卡逾期", "个人贷款", "消费贷款"))
                .approvalStatus("APPROVED")
                .approvalAt(LocalDateTime.now().minusDays(30))
                .build(),
                
            Organization.builder()
                .orgCode("CF001")
                .orgName("招联消费金融有限公司")
                .type(OrganizationType.CONSUMER_FINANCE)
                .status(OrganizationStatus.ACTIVE)
                .contactPerson("李主任")
                .contactPhone("0755-66666666")
                .email("li@zhaolian.com")
                .address("深圳市福田区深南大道1006号")
                .teamSize(30)
                .monthlyCaseCapacity(3000)
                .currentLoadPercentage(60)
                .serviceRegions(createSet("广东", "浙江", "江苏"))
                .businessScopes(createSet("消费贷款", "现金贷", "分期付款"))
                .approvalStatus("APPROVED")
                .approvalAt(LocalDateTime.now().minusDays(20))
                .build(),

            // 处置机构
            Organization.builder()
                .orgCode("MC001")
                .orgName("北京市朝阳区人民调解委员会")
                .type(OrganizationType.MEDIATION_CENTER)
                .status(OrganizationStatus.ACTIVE)
                .contactPerson("王调解员")
                .contactPhone("010-12345678")
                .email("wang@chaoyang.gov.cn")
                .address("北京市朝阳区建国门外大街1号")
                .teamSize(15)
                .monthlyCaseCapacity(800)
                .currentLoadPercentage(45)
                .serviceRegions(createSet("北京"))
                .businessScopes(createSet("债务调解", "消费纠纷", "金融纠纷"))
                .disposalTypes(createSet("调解", "协商"))
                .settlementMethods(createSet("一次性还款", "分期还款"))
                .membershipFee(BigDecimal.valueOf(50000))
                .membershipPaid(true)
                .membershipStatus("PAID")
                .membershipStartDate(LocalDate.now().minusMonths(6))
                .membershipEndDate(LocalDate.now().plusMonths(6))
                .approvalStatus("APPROVED")
                .approvalAt(LocalDateTime.now().minusDays(25))
                .build(),

            Organization.builder()
                .orgCode("LAW001")
                .orgName("金杜律师事务所")
                .type(OrganizationType.LAW_FIRM)
                .status(OrganizationStatus.ACTIVE)
                .contactPerson("赵律师")
                .contactPhone("021-55555555")
                .email("zhao@kingandwood.com")
                .address("上海市浦东新区世纪大道88号")
                .teamSize(25)
                .monthlyCaseCapacity(1200)
                .currentLoadPercentage(80)
                .serviceRegions(createSet("上海", "江苏", "浙江"))
                .businessScopes(createSet("债权诉讼", "执行程序", "破产重整"))
                .disposalTypes(createSet("诉讼", "执行", "谈判"))
                .settlementMethods(createSet("强制执行", "和解协议"))
                .membershipFee(BigDecimal.valueOf(100000))
                .membershipPaid(true)
                .membershipStatus("PAID")
                .membershipStartDate(LocalDate.now().minusMonths(3))
                .membershipEndDate(LocalDate.now().plusMonths(9))
                .approvalStatus("APPROVED")
                .approvalAt(LocalDateTime.now().minusDays(15))
                .build(),

            // 待审核机构
            Organization.builder()
                .orgCode("MC002")
                .orgName("深圳市福田区调解中心")
                .type(OrganizationType.MEDIATION_CENTER)
                .status(OrganizationStatus.PENDING)
                .contactPerson("陈主任")
                .contactPhone("0755-77777777")
                .email("chen@futian.gov.cn")
                .address("深圳市福田区福华一路1号")
                .teamSize(12)
                .monthlyCaseCapacity(600)
                .currentLoadPercentage(0)
                .serviceRegions(createSet("深圳"))
                .businessScopes(createSet("金融纠纷调解", "消费争议"))
                .disposalTypes(createSet("调解"))
                .settlementMethods(createSet("协商还款"))
                .approvalStatus("PENDING")
                .build()
        };

        for (Organization org : orgs) {
            if (!organizationRepository.existsByOrgCode(org.getOrgCode())) {
                organizationRepository.save(org);
            }
        }
    }

    private void initializeUsers() {
        log.info("Creating users...");
        
        // Create admin user
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .email("admin@drmp.com")
                .realName("系统管理员")
                .phone("13800138000")
                .status(UserStatus.ACTIVE)
                .enabled(true)
                .passwordChangedAt(LocalDateTime.now())
                .build();
            userRepository.save(admin);
        }

        // Create organization manager users
        if (!userRepository.existsByUsername("bank_manager")) {
            Organization bank = organizationRepository.findByOrgCode("BANK001").orElse(null);
            if (bank != null) {
                User bankManager = User.builder()
                    .username("bank_manager")
                    .password(passwordEncoder.encode("bank123"))
                    .email("manager@icbc.com.cn")
                    .realName("张经理")
                    .phone("13801138001")
                    .status(UserStatus.ACTIVE)
                    .enabled(true)
                    .organization(bank)
                    .passwordChangedAt(LocalDateTime.now())
                    .build();
                userRepository.save(bankManager);
            }
        }

        if (!userRepository.existsByUsername("mediation_manager")) {
            Organization mediation = organizationRepository.findByOrgCode("MC001").orElse(null);
            if (mediation != null) {
                User mediationManager = User.builder()
                    .username("mediation_manager")
                    .password(passwordEncoder.encode("mediation123"))
                    .email("manager@chaoyang.gov.cn")
                    .realName("王调解员")
                    .phone("13802138002")
                    .status(UserStatus.ACTIVE)
                    .enabled(true)
                    .organization(mediation)
                    .passwordChangedAt(LocalDateTime.now())
                    .build();
                userRepository.save(mediationManager);
            }
        }
    }

    private Set<String> createSet(String... items) {
        Set<String> set = new HashSet<>();
        for (String item : items) {
            set.add(item);
        }
        return set;
    }
}