package com.drmp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Login Response DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;
    
    private String refreshToken;
    
    private String tokenType = "Bearer";
    
    private Long expiresIn;
    
    private UserInfo userInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
        private String realName;
        private String phone;
        private String avatar;
        private Long organizationId;
        private String organizationName;
        private String organizationType;
        private Set<String> roles;
        private Set<String> permissions;
    }
}