package com.drmp.dto.request;

import com.drmp.entity.enums.OrganizationType;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Organization Create Request DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class OrganizationCreateRequest {

    @NotBlank(message = "机构代码不能为空")
    @Size(max = 50, message = "机构代码长度不能超过50字符")
    private String orgCode;

    @NotBlank(message = "机构名称不能为空")
    @Size(max = 200, message = "机构名称长度不能超过200字符")
    private String orgName;

    @NotNull(message = "机构类型不能为空")
    private OrganizationType type;

    @NotBlank(message = "联系人不能为空")
    @Size(max = 50, message = "联系人长度不能超过50字符")
    private String contactPerson;

    @NotBlank(message = "联系电话不能为空")
    @Size(max = 20, message = "联系电话长度不能超过20字符")
    private String contactPhone;

    @Email(message = "邮箱格式不正确")
    @Size(max = 100, message = "邮箱长度不能超过100字符")
    private String email;

    @Size(max = 500, message = "地址长度不能超过500字符")
    private String address;

    @Size(max = 500, message = "营业执照长度不能超过500字符")
    private String businessLicense;

    private Integer teamSize;

    private Integer monthlyCaseCapacity;

    private Set<String> serviceRegions;

    private Set<String> businessScopes;

    private Set<String> disposalTypes;

    private Set<String> settlementMethods;

    private String cooperationCases;

    private String description;

    private String registrationType; // ONLINE, OFFLINE

    @Size(max = 100, message = "法定代表人长度不能超过100字符")
    private String legalRepresentative;

    private Double registeredCapital;

    private LocalDateTime registrationDate;

    private String qualificationDocuments;

    @Size(max = 100, message = "银行账号长度不能超过100字符")
    private String bankAccount;

    @Size(max = 200, message = "银行名称长度不能超过200字符")
    private String bankName;
}