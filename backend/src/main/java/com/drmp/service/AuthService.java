package com.drmp.service;

import com.drmp.dto.LoginRequest;
import com.drmp.dto.LoginResponse;

/**
 * Authentication Service Interface
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface AuthService {

    /**
     * User login
     * 
     * @param request login request
     * @param clientIp client IP address
     * @return login response with tokens
     */
    LoginResponse login(LoginRequest request, String clientIp);

    /**
     * Refresh access token
     * 
     * @param refreshToken refresh token
     * @return new tokens
     */
    LoginResponse refreshToken(String refreshToken);

    /**
     * User logout
     * 
     * @param accessToken access token to invalidate
     */
    void logout(String accessToken);
}