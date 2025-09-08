package com.drmp.gateway;

import com.drmp.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * API网关过滤器
 * 统一处理API路由、认证、限流和监控
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(1)
public class ApiGatewayFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final ApiGatewayMetrics gatewayMetrics;
    
    @Value("${api.gateway.enabled:true}")
    private boolean gatewayEnabled;
    
    @Value("${api.gateway.version:v1}")
    private String apiVersion;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    
    // 公开路径，不需要认证
    private final List<String> publicPaths = Arrays.asList(
        "/v1/auth/**",
        "/v1/public/**", 
        "/v1/dev/**",
        "/actuator/**",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/error",
        "/favicon.ico",
        "/**/*.css",
        "/**/*.js",
        "/**/*.png",
        "/**/*.jpg",
        "/**/*.gif",
        "/**/*.svg"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        if (!gatewayEnabled) {
            filterChain.doFilter(request, response);
            return;
        }

        long startTime = System.currentTimeMillis();
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        
        try {
            // 1. API版本验证
            if (!validateApiVersion(requestPath)) {
                sendErrorResponse(response, HttpStatus.NOT_FOUND, "API版本不支持");
                return;
            }

            // 2. 路径标准化
            String normalizedPath = normalizePath(requestPath);
            
            // 3. 统一认证检查
            if (!isPublicPath(normalizedPath) && !isAuthenticated(request)) {
                gatewayMetrics.recordUnauthorizedAccess(requestPath, getClientIp(request));
                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "未授权访问");
                return;
            }

            // 4. 请求限流检查
            if (!checkRateLimit(request)) {
                gatewayMetrics.recordRateLimitExceeded(requestPath, getClientIp(request));
                sendErrorResponse(response, HttpStatus.TOO_MANY_REQUESTS, "请求过于频繁");
                return;
            }

            // 5. 添加网关头部信息
            response.setHeader("X-Gateway-Version", "1.0");
            response.setHeader("X-API-Version", apiVersion);
            response.setHeader("X-Request-ID", generateRequestId());

            log.debug("Gateway processing request: {} {}", method, requestPath);
            
            // 6. 继续处理请求
            filterChain.doFilter(request, response);
            
            // 7. 记录成功指标
            long duration = System.currentTimeMillis() - startTime;
            gatewayMetrics.recordSuccessfulRequest(requestPath, method, duration, response.getStatus());
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            gatewayMetrics.recordFailedRequest(requestPath, method, duration, e.getMessage());
            log.error("Gateway error processing request {} {}: {}", method, requestPath, e.getMessage(), e);
            
            if (!response.isCommitted()) {
                sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, "网关内部错误");
            }
        }
    }

    /**
     * 验证API版本
     */
    private boolean validateApiVersion(String path) {
        if (path.startsWith("/v")) {
            String version = path.split("/")[1];
            return apiVersion.equals(version);
        }
        return true; // 非版本化路径允许通过
    }

    /**
     * 路径标准化
     */
    private String normalizePath(String path) {
        // 移除多余的斜杠和标准化路径
        return path.replaceAll("/+", "/").toLowerCase();
    }

    /**
     * 检查是否为公开路径
     */
    private boolean isPublicPath(String path) {
        return publicPaths.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    /**
     * 检查认证状态
     */
    private boolean isAuthenticated(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if (!StringUtils.hasText(token)) {
            return false;
        }
        
        try {
            return tokenProvider.validateToken(token);
        } catch (Exception e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 检查请求限流
     */
    private boolean checkRateLimit(HttpServletRequest request) {
        String clientIp = getClientIp(request);
        String userId = getUserIdFromRequest(request);
        
        // 基于IP和用户的双重限流检查
        return gatewayMetrics.checkRateLimit(clientIp, userId);
    }

    /**
     * 从请求中获取Token
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * 从请求中获取用户ID
     */
    private String getUserIdFromRequest(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if (StringUtils.hasText(token)) {
            try {
                Long userId = tokenProvider.getUserIdFromToken(token);
                return userId != null ? userId.toString() : null;
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * 生成请求ID
     */
    private String generateRequestId() {
        return "req-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }

    /**
     * 发送错误响应
     */
    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) 
            throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("X-Gateway-Error", "true");
        
        String errorJson = String.format(
            "{\"error\":\"%s\",\"message\":\"%s\",\"timestamp\":\"%s\",\"gateway\":\"DRMP-Gateway-v1.0\"}",
            status.getReasonPhrase(),
            message,
            java.time.Instant.now().toString()
        );
        
        response.getWriter().write(errorJson);
        response.getWriter().flush();
    }
}