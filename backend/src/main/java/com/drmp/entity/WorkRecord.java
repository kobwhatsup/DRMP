package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 作业记录实体
 * 记录处置人员对案件的所有操作和沟通记录
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "work_records", indexes = {
    @Index(name = "idx_case_id", columnList = "case_id"),
    @Index(name = "idx_handler_id", columnList = "handler_id"),
    @Index(name = "idx_record_type", columnList = "record_type"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_contact_date", columnList = "contact_date")
})
public class WorkRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private CaseDetail caseDetail;

    @Column(name = "handler_id", nullable = false)
    private Long handlerId;

    @Column(name = "handler_name", length = 100)
    private String handlerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false, length = 30)
    private RecordType recordType;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "contact_date")
    private LocalDateTime contactDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_method", length = 20)
    private ContactMethod contactMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_result", length = 30)
    private ContactResult contactResult;

    @Column(name = "contact_duration")
    private Integer contactDuration;

    @Column(name = "debtor_response", columnDefinition = "TEXT")
    private String debtorResponse;

    @Enumerated(EnumType.STRING)
    @Column(name = "debtor_attitude", length = 20)
    private DebtorAttitude debtorAttitude;

    @Column(name = "next_action", length = 500)
    private String nextAction;

    @Column(name = "next_contact_date")
    private LocalDateTime nextContactDate;

    @Column(name = "follow_up_required")
    private Boolean followUpRequired = false;

    @Column(name = "is_important")
    private Boolean isImportant = false;

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "template_name", length = 100)
    private String templateName;

    @Column(name = "attachments", columnDefinition = "TEXT")
    private String attachments;

    @Column(name = "tags", length = 500)
    private String tags;

    @Column(name = "work_duration")
    private Integer workDuration;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "weather", length = 50)
    private String weather;

    /**
     * 记录类型枚举
     */
    public enum RecordType {
        CONTACT("联系记录"),
        NEGOTIATION("协商记录"),
        VISIT("上门拜访"),
        LEGAL_ACTION("法律行动"),
        PAYMENT("还款记录"),
        DOCUMENT("文档处理"),
        INTERNAL_NOTE("内部备注"),
        SYSTEM_AUTO("系统自动");

        private final String description;

        RecordType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 联系方式枚举
     */
    public enum ContactMethod {
        PHONE("电话"),
        SMS("短信"),
        EMAIL("邮件"),
        WECHAT("微信"),
        VISIT("上门"),
        LETTER("信函"),
        LEGAL_NOTICE("法律通知"),
        OTHER("其他");

        private final String description;

        ContactMethod(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 债务人态度枚举
     */
    public enum DebtorAttitude {
        COOPERATIVE("配合"),
        RESISTANT("抵触"),
        EVASIVE("逃避"),
        AGGRESSIVE("激进"),
        NEUTRAL("中性"),
        CONFUSED("困惑"),
        DESPERATE("绝望"),
        HOPEFUL("有希望"),
        DISHONEST("不诚实"),
        SINCERE("真诚");

        private final String description;

        DebtorAttitude(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 联系结果枚举
     */
    public enum ContactResult {
        CONNECTED("接通"),
        NO_ANSWER("未接听"),
        BUSY("忙线"),
        SWITCHED_OFF("关机"),
        WRONG_NUMBER("空号"),
        ANSWERED_BY_FAMILY("家人接听"),
        VOICEMAIL("语音信箱"),
        REFUSED("拒接"),
        BLOCKED("被拉黑"),
        SMS_SENT("短信已发送"),
        SMS_DELIVERED("短信已送达"),
        SMS_READ("短信已读"),
        EMAIL_SENT("邮件已发送"),
        EMAIL_OPENED("邮件已打开"),
        VISIT_SUCCESSFUL("上门成功"),
        VISIT_FAILED("上门失败"),
        AGREEMENT_REACHED("达成协议"),
        PARTIAL_AGREEMENT("部分协议"),
        NO_AGREEMENT("未达成协议"),
        PAYMENT_PROMISED("承诺还款"),
        PAYMENT_RECEIVED("收到还款"),
        DISPUTE_RAISED("提出异议"),
        LAWYER_INVOLVED("律师介入"),
        OTHER("其他");

        private final String description;

        ContactResult(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 获取格式化的联系时长
     */
    public String getFormattedContactDuration() {
        if (contactDuration == null || contactDuration == 0) {
            return "未记录";
        }
        if (contactDuration < 60) {
            return contactDuration + "分钟";
        } else {
            int hours = contactDuration / 60;
            int minutes = contactDuration % 60;
            return hours + "小时" + (minutes > 0 ? minutes + "分钟" : "");
        }
    }

    /**
     * 检查是否需要跟进
     */
    public boolean needsFollowUp() {
        return Boolean.TRUE.equals(followUpRequired) && 
               nextContactDate != null && 
               LocalDateTime.now().isAfter(nextContactDate);
    }

    /**
     * 获取标签列表
     */
    public String[] getTagList() {
        if (tags == null || tags.trim().isEmpty()) {
            return new String[0];
        }
        return tags.split(",");
    }

    /**
     * 设置标签列表
     */
    public void setTagList(String[] tagList) {
        if (tagList == null || tagList.length == 0) {
            this.tags = null;
        } else {
            this.tags = String.join(",", tagList);
        }
    }
}