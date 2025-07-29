package com.drmp.entity;

import com.drmp.entity.enums.ContractStatus;
import com.drmp.entity.enums.ContractType;
import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 合同实体
 * 管理案件处置过程中的各种合同和协议
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Entity
@Table(name = "contracts", indexes = {
    @Index(name = "idx_contract_number", columnList = "contract_number"),
    @Index(name = "idx_case_package_id", columnList = "case_package_id"),
    @Index(name = "idx_party_a_id", columnList = "party_a_id"),
    @Index(name = "idx_party_b_id", columnList = "party_b_id"),
    @Index(name = "idx_contract_type", columnList = "contract_type"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_effective_date", columnList = "effective_date")
})
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contract extends BaseEntity {

    /**
     * 合同编号
     */
    @Column(name = "contract_number", unique = true, nullable = false, length = 100)
    private String contractNumber;

    /**
     * 合同标题
     */
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    /**
     * 合同类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", nullable = false, length = 50)
    private ContractType contractType;

    /**
     * 关联的案件包ID
     */
    @Column(name = "case_package_id")
    private Long casePackageId;

    /**
     * 关联的个案ID（可选）
     */
    @Column(name = "case_id")
    private Long caseId;

    /**
     * 甲方ID（案源机构）
     */
    @Column(name = "party_a_id", nullable = false)
    private Long partyAId;

    /**
     * 甲方名称
     */
    @Column(name = "party_a_name", nullable = false, length = 200)
    private String partyAName;

    /**
     * 乙方ID（处置机构或债务人）
     */
    @Column(name = "party_b_id")
    private Long partyBId;

    /**
     * 乙方名称
     */
    @Column(name = "party_b_name", length = 200)
    private String partyBName;

    /**
     * 第三方ID（如有）
     */
    @Column(name = "party_c_id")
    private Long partyCId;

    /**
     * 第三方名称
     */
    @Column(name = "party_c_name", length = 200)
    private String partyCName;

    /**
     * 合同状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private ContractStatus status = ContractStatus.DRAFT;

    /**
     * 合同金额
     */
    @Column(name = "contract_amount", precision = 15, scale = 2)
    private BigDecimal contractAmount;

    /**
     * 币种
     */
    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "CNY";

    /**
     * 签署日期
     */
    @Column(name = "signature_date")
    private LocalDate signatureDate;

    /**
     * 生效日期
     */
    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    /**
     * 到期日期
     */
    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    /**
     * 甲方签署时间
     */
    @Column(name = "party_a_signed_at")
    private LocalDateTime partyASignedAt;

    /**
     * 甲方签署人
     */
    @Column(name = "party_a_signer", length = 100)
    private String partyASigner;

    /**
     * 乙方签署时间
     */
    @Column(name = "party_b_signed_at")
    private LocalDateTime partyBSignedAt;

    /**
     * 乙方签署人
     */
    @Column(name = "party_b_signer", length = 100)
    private String partyBSigner;

    /**
     * 第三方签署时间
     */
    @Column(name = "party_c_signed_at")
    private LocalDateTime partyCSignedAt;

    /**
     * 第三方签署人
     */
    @Column(name = "party_c_signer", length = 100)
    private String partyCSigner;

    /**
     * 合同内容摘要
     */
    @Column(name = "content_summary", length = 2000)
    private String contentSummary;

    /**
     * 主要条款
     */
    @Column(name = "key_terms", columnDefinition = "TEXT")
    private String keyTerms;

    /**
     * 付款条款
     */
    @Column(name = "payment_terms", length = 1000)
    private String paymentTerms;

    /**
     * 履行期限
     */
    @Column(name = "performance_period", length = 500)
    private String performancePeriod;

    /**
     * 违约责任
     */
    @Column(name = "breach_liability", length = 1000)
    private String breachLiability;

    /**
     * 争议解决方式
     */
    @Column(name = "dispute_resolution", length = 500)
    private String disputeResolution;

    /**
     * 合同文件路径
     */
    @Column(name = "file_path", length = 500)
    private String filePath;

    /**
     * 电子签名信息（JSON格式）
     */
    @Column(name = "electronic_signature", columnDefinition = "TEXT")
    private String electronicSignature;

    /**
     * 审核人ID
     */
    @Column(name = "reviewer_id")
    private Long reviewerId;

    /**
     * 审核人姓名
     */
    @Column(name = "reviewer_name", length = 100)
    private String reviewerName;

    /**
     * 审核时间
     */
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    /**
     * 审核意见
     */
    @Column(name = "review_comments", length = 1000)
    private String reviewComments;

    /**
     * 是否自动续约
     */
    @Column(name = "auto_renewal", nullable = false)
    @Builder.Default
    private Boolean autoRenewal = false;

    /**
     * 续约期限（月）
     */
    @Column(name = "renewal_period_months")
    private Integer renewalPeriodMonths;

    /**
     * 提前通知天数
     */
    @Column(name = "notice_days")
    private Integer noticeDays;

    /**
     * 模板ID
     */
    @Column(name = "template_id")
    private Long templateId;

    /**
     * 模板名称
     */
    @Column(name = "template_name", length = 200)
    private String templateName;

    /**
     * 父合同ID（用于补充协议等）
     */
    @Column(name = "parent_contract_id")
    private Long parentContractId;

    /**
     * 合同版本号
     */
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 1;

    /**
     * 是否需要法务审核
     */
    @Column(name = "requires_legal_review", nullable = false)
    @Builder.Default
    private Boolean requiresLegalReview = false;

    /**
     * 风险等级
     */
    @Column(name = "risk_level", length = 20)
    @Builder.Default
    private String riskLevel = "LOW";

    /**
     * 标签（用于分类）
     */
    @Column(name = "tags", length = 500)
    private String tags;

    /**
     * 备注
     */
    @Column(name = "remarks", length = 1000)
    private String remarks;

    /**
     * 扩展属性（JSON格式）
     */
    @Column(name = "extended_properties", columnDefinition = "TEXT")
    private String extendedProperties;

    /**
     * 检查是否所有方都已签署
     */
    public boolean isFullySigned() {
        boolean partyASigned = partyASignedAt != null;
        boolean partyBSigned = partyBSignedAt != null;
        boolean partyCNeeded = partyCId != null;
        boolean partyCSigned = partyCSignedAt != null;

        if (partyCNeeded) {
            return partyASigned && partyBSigned && partyCSigned;
        } else {
            return partyASigned && partyBSigned;
        }
    }

    /**
     * 获取签署进度百分比
     */
    public int getSignatureProgress() {
        int totalParties = partyCId != null ? 3 : 2;
        int signedParties = 0;

        if (partyASignedAt != null) signedParties++;
        if (partyBSignedAt != null) signedParties++;
        if (partyCId != null && partyCSignedAt != null) signedParties++;

        return (signedParties * 100) / totalParties;
    }

    /**
     * 检查合同是否即将到期
     */
    public boolean isExpiringWithin(int days) {
        if (expiryDate == null) return false;
        return expiryDate.isBefore(LocalDate.now().plusDays(days));
    }

    /**
     * 检查合同是否已过期
     */
    public boolean isExpired() {
        if (expiryDate == null) return false;
        return expiryDate.isBefore(LocalDate.now());
    }

    /**
     * 检查合同是否有效
     */
    public boolean isEffective() {
        if (effectiveDate == null) return false;
        LocalDate now = LocalDate.now();
        boolean started = !effectiveDate.isAfter(now);
        boolean notExpired = expiryDate == null || !expiryDate.isBefore(now);
        return started && notExpired && status.isActiveStatus();
    }

    /**
     * 设置甲方签署信息
     */
    public void signByPartyA(String signerName) {
        this.partyASigner = signerName;
        this.partyASignedAt = LocalDateTime.now();
        updateStatusAfterSignature();
    }

    /**
     * 设置乙方签署信息
     */
    public void signByPartyB(String signerName) {
        this.partyBSigner = signerName;
        this.partyBSignedAt = LocalDateTime.now();
        updateStatusAfterSignature();
    }

    /**
     * 设置第三方签署信息
     */
    public void signByPartyC(String signerName) {
        this.partyCSigner = signerName;
        this.partyCSignedAt = LocalDateTime.now();
        updateStatusAfterSignature();
    }

    /**
     * 签署后更新状态
     */
    private void updateStatusAfterSignature() {
        if (isFullySigned()) {
            this.status = ContractStatus.FULLY_SIGNED;
            if (this.signatureDate == null) {
                this.signatureDate = LocalDate.now();
            }
        } else if (getSignatureProgress() > 0) {
            this.status = ContractStatus.PARTIALLY_SIGNED;
        }
    }

    /**
     * 设置合同生效
     */
    public void makeEffective() {
        if (isFullySigned()) {
            this.status = ContractStatus.EFFECTIVE;
            if (this.effectiveDate == null) {
                this.effectiveDate = LocalDate.now();
            }
        }
    }

    /**
     * 暂停合同
     */
    public void suspend() {
        if (status.isActiveStatus()) {
            this.status = ContractStatus.SUSPENDED;
        }
    }

    /**
     * 恢复合同
     */
    public void resume() {
        if (status == ContractStatus.SUSPENDED) {
            this.status = ContractStatus.EFFECTIVE;
        }
    }

    /**
     * 终止合同
     */
    public void terminate() {
        this.status = ContractStatus.TERMINATED;
    }
}