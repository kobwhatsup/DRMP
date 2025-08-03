package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;

/**
 * 案件联系人实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "case_contacts")
public class CaseContact extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private CaseDetail caseDetail;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_type", nullable = false)
    private ContactType contactType;

    @Column(name = "contact_name", length = 100)
    private String contactName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "relationship", length = 50)
    private String relationship;

    @Column(name = "work_company", length = 200)
    private String workCompany;

    @Column(name = "work_position", length = 100)
    private String workPosition;

    @Column(name = "work_province", length = 50)
    private String workProvince;

    @Column(name = "work_city", length = 50)
    private String workCity;

    @Column(name = "work_address", columnDefinition = "TEXT")
    private String workAddress;

    /**
     * 联系人类型
     */
    public enum ContactType {
        CONTACT1("联系人1"),
        CONTACT2("联系人2"),
        CONTACT3("联系人3"),
        CONTACT4("联系人4"),
        CONTACT5("联系人5");

        private final String description;

        ContactType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}