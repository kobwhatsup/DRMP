package com.drmp.dto.response.system;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户响应DTO
 */
@Data
@Builder
public class UserResponse {

    private Long id;

    private String username;

    private String email;

    private String phone;

    private String realName;

    private String avatarUrl;

    private Long organizationId;

    private String organizationName;

    private String userType;

    private String userTypeDesc;

    private String status;

    private String statusDesc;

    private LocalDateTime lastLoginTime;

    private String lastLoginIp;

    private Integer loginFailureCount;

    private Boolean emailVerified;

    private Boolean phoneVerified;

    private Boolean twoFactorEnabled;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdByName;

    private String updatedByName;

    private List<RoleResponse> roles;

    @Data
    @Builder
    public static class RoleResponse {
        private Long id;
        private String roleCode;
        private String roleName;
        private String description;
        private String roleType;
        private String status;
    }
}