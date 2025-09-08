package com.drmp.security;

import com.drmp.config.RateLimitingConfig.RateLimitService;
import com.drmp.config.RateLimitingConfig.RateLimitInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Rate Limiting Filter
 * API接口限流过滤器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        // Skip rate limiting for excluded paths
        String requestURI = request.getRequestURI();
        if (shouldSkipRateLimit(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Determine rate limit key (user ID or IP address)
        String rateLimitKey = getRateLimitKey(request);
        String endpoint = getEndpointKey(request);

        // Check rate limit
        boolean allowed = rateLimitService.isAllowed(rateLimitKey, endpoint);
        
        if (!allowed) {
            handleRateLimitExceeded(request, response, rateLimitKey, endpoint);
            return;
        }

        // Add rate limit headers to response
        addRateLimitHeaders(response, rateLimitKey, endpoint);

        filterChain.doFilter(request, response);
    }

    private boolean shouldSkipRateLimit(String requestURI) {
        // Skip rate limiting for specific paths
        return requestURI.startsWith("/v1/auth/") ||
               requestURI.startsWith("/v1/public/") ||
               requestURI.startsWith("/actuator/") ||
               requestURI.startsWith("/swagger-ui/") ||
               requestURI.startsWith("/v3/api-docs/") ||
               requestURI.equals("/") ||
               requestURI.matches(".+\\.(css|js|png|jpg|gif|svg|ico|html)$");
    }

    private String getRateLimitKey(HttpServletRequest request) {
        // Try to get authenticated user ID first
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            return "user:" + userPrincipal.getId();
        }

        // Fall back to IP address for unauthenticated requests
        return "ip:" + getClientIpAddress(request);
    }

    private String getEndpointKey(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        
        // Normalize path to remove IDs and make it more generic
        String normalizedPath = normalizePath(path);
        
        return method + ":" + normalizedPath;
    }

    private String normalizePath(String path) {
        // Replace numeric IDs with placeholder to group similar endpoints
        String normalized = path.replaceAll("/\\d+", "/{id}");
        
        // Remove query parameters if any
        int queryIndex = normalized.indexOf('?');
        if (queryIndex > 0) {
            normalized = normalized.substring(0, queryIndex);
        }
        
        return normalized;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    private void addRateLimitHeaders(HttpServletResponse response, String rateLimitKey, String endpoint) {
        try {
            RateLimitInfo info = rateLimitService.getRateLimitInfo(rateLimitKey, endpoint);
            
            response.setHeader("X-RateLimit-Remaining-Minute", String.valueOf(info.getRemainingMinute()));
            response.setHeader("X-RateLimit-Remaining-Hour", String.valueOf(info.getRemainingHour()));
            response.setHeader("X-RateLimit-Reset-Minute", String.valueOf(info.getResetTimeMinute()));
            response.setHeader("X-RateLimit-Reset-Hour", String.valueOf(info.getResetTimeHour()));
            
        } catch (Exception e) {
            log.warn("Failed to add rate limit headers: {}", e.getMessage());
        }
    }

    private void handleRateLimitExceeded(HttpServletRequest request, HttpServletResponse response, 
                                       String rateLimitKey, String endpoint) throws IOException {
        
        log.warn("Rate limit exceeded for key: {} on endpoint: {} from IP: {}", 
            rateLimitKey, endpoint, getClientIpAddress(request));

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        // Add rate limit headers
        addRateLimitHeaders(response, rateLimitKey, endpoint);

        // Return error response
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("code", 429);
        errorResponse.put("message", "请求过于频繁，请稍后再试");
        errorResponse.put("timestamp", System.currentTimeMillis());

        try {
            RateLimitInfo info = rateLimitService.getRateLimitInfo(rateLimitKey, endpoint);
            Map<String, Object> rateLimitDetails = new HashMap<>();
            rateLimitDetails.put("remainingMinute", info.getRemainingMinute());
            rateLimitDetails.put("remainingHour", info.getRemainingHour());
            rateLimitDetails.put("resetTimeMinute", info.getResetTimeMinute());
            rateLimitDetails.put("resetTimeHour", info.getResetTimeHour());
            errorResponse.put("rateLimit", rateLimitDetails);
        } catch (Exception e) {
            log.warn("Failed to get rate limit info for error response: {}", e.getMessage());
        }

        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }
}