package com.drmp.security;

import com.drmp.entity.AccessKey;
import com.drmp.service.AccessKeyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 访问密钥认证过滤器
 */
@Slf4j
public class AccessKeyAuthenticationFilter extends OncePerRequestFilter {

    private final AccessKeyService accessKeyService;
    private final ObjectMapper objectMapper;

    // API密钥请求头名称
    private static final String API_KEY_HEADER = "X-API-Key";
    private static final String API_SECRET_HEADER = "X-API-Secret";
    
    // 或者使用Authorization头
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String API_KEY_PREFIX = "ApiKey ";

    public AccessKeyAuthenticationFilter(AccessKeyService accessKeyService, ObjectMapper objectMapper) {
        this.accessKeyService = accessKeyService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String requestId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        
        try {
            // 提取密钥信息
            KeyCredentials credentials = extractCredentials(request);
            
            if (credentials != null) {
                // 验证密钥
                String clientIp = getClientIpAddress(request);
                String endpoint = request.getRequestURI();
                
                boolean isValid = accessKeyService.validateAccessKey(
                    credentials.getKeyId(), 
                    credentials.getKeySecret(), 
                    clientIp, 
                    endpoint
                );
                
                if (isValid) {
                    // 获取密钥详情
                    AccessKey accessKey = accessKeyService.getAccessKeyByKeyId(credentials.getKeyId());
                    
                    if (accessKey != null) {
                        // 检查权限
                        if (hasPermission(accessKey, request)) {
                            // 创建认证对象
                            List<SimpleGrantedAuthority> authorities = extractAuthorities(accessKey);
                            UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(
                                    new AccessKeyPrincipal(accessKey), 
                                    null, 
                                    authorities
                                );
                            
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            
                            // 设置请求属性
                            request.setAttribute("ACCESS_KEY_ID", accessKey.getKeyId());
                            request.setAttribute("REQUEST_ID", requestId);
                            
                            log.debug("API密钥认证成功: keyId={}, endpoint={}", 
                                    credentials.getKeyId(), endpoint);
                        } else {
                            log.warn("API密钥权限不足: keyId={}, endpoint={}", 
                                    credentials.getKeyId(), endpoint);
                            sendUnauthorizedResponse(response, "权限不足");
                            return;
                        }
                    }
                } else {
                    log.warn("API密钥验证失败: keyId={}, ip={}, endpoint={}", 
                            credentials.getKeyId(), clientIp, endpoint);
                    sendUnauthorizedResponse(response, "密钥验证失败");
                    return;
                }
            }
            
            // 继续处理请求
            filterChain.doFilter(request, response);
            
        } catch (Exception e) {
            log.error("API密钥认证过程中发生错误: {}", e.getMessage(), e);
            sendErrorResponse(response, "认证过程中发生错误");
            return;
        } finally {
            // 记录使用日志
            recordUsageLog(request, response, requestId, startTime);
        }
    }

    /**
     * 提取密钥凭据
     */
    private KeyCredentials extractCredentials(HttpServletRequest request) {
        // 方式1: 使用专用请求头
        String keyId = request.getHeader(API_KEY_HEADER);
        String keySecret = request.getHeader(API_SECRET_HEADER);
        
        if (StringUtils.hasText(keyId) && StringUtils.hasText(keySecret)) {
            return new KeyCredentials(keyId, keySecret);
        }
        
        // 方式2: 使用Authorization头
        String authorization = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(authorization)) {
            if (authorization.startsWith(API_KEY_PREFIX)) {
                String credentials = authorization.substring(API_KEY_PREFIX.length());
                String[] parts = credentials.split(":");
                if (parts.length == 2) {
                    return new KeyCredentials(parts[0], parts[1]);
                }
            }
        }
        
        return null;
    }

    /**
     * 检查权限
     */
    private boolean hasPermission(AccessKey accessKey, HttpServletRequest request) {
        String permissions = accessKey.getPermissions();
        if (!StringUtils.hasText(permissions)) {
            return true; // 没有权限配置，默认允许
        }
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> permissionMap = objectMapper.readValue(permissions, Map.class);
            
            // 检查端点权限
            @SuppressWarnings("unchecked")
            List<String> allowedEndpoints = (List<String>) permissionMap.get("endpoints");
            if (allowedEndpoints != null && !allowedEndpoints.isEmpty()) {
                String requestUri = request.getRequestURI();
                String method = request.getMethod();
                String fullEndpoint = method + ":" + requestUri;
                
                boolean hasEndpointPermission = allowedEndpoints.stream()
                    .anyMatch(pattern -> matchesPattern(fullEndpoint, pattern));
                
                if (!hasEndpointPermission) {
                    return false;
                }
            }
            
            // 检查操作权限
            @SuppressWarnings("unchecked")
            List<String> allowedOperations = (List<String>) permissionMap.get("operations");
            if (allowedOperations != null && !allowedOperations.isEmpty()) {
                String method = request.getMethod().toLowerCase();
                String operation = mapMethodToOperation(method);
                
                if (!allowedOperations.contains(operation)) {
                    return false;
                }
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("解析权限配置失败: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 模式匹配
     */
    private boolean matchesPattern(String endpoint, String pattern) {
        if ("*".equals(pattern)) {
            return true;
        }
        
        if (pattern.contains("*")) {
            String regex = pattern.replace("*", ".*");
            return endpoint.matches(regex);
        }
        
        return endpoint.equals(pattern);
    }

    /**
     * HTTP方法映射到操作类型
     */
    private String mapMethodToOperation(String method) {
        switch (method.toLowerCase()) {
            case "get":
                return "read";
            case "post":
                return "create";
            case "put":
            case "patch":
                return "update";
            case "delete":
                return "delete";
            default:
                return "unknown";
        }
    }

    /**
     * 提取权限列表
     */
    private List<SimpleGrantedAuthority> extractAuthorities(AccessKey accessKey) {
        // 根据密钥类型分配基础权限
        String keyTypeCode = accessKey.getKeyType().getCode();
        switch (keyTypeCode) {
            case "API_ACCESS":
                return Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_API_USER"),
                    new SimpleGrantedAuthority("API_READ"),
                    new SimpleGrantedAuthority("API_WRITE")
                );
            case "SYSTEM_INTEGRATION":
                return Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_SYSTEM"),
                    new SimpleGrantedAuthority("SYSTEM_INTEGRATION")
                );
            case "DATA_EXPORT":
                return Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_EXPORTER"),
                    new SimpleGrantedAuthority("DATA_EXPORT")
                );
            default:
                return Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
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
     * 记录使用日志
     */
    private void recordUsageLog(HttpServletRequest request, HttpServletResponse response, 
                               String requestId, long startTime) {
        String keyId = (String) request.getAttribute("ACCESS_KEY_ID");
        if (keyId != null) {
            long responseTime = System.currentTimeMillis() - startTime;
            
            accessKeyService.logKeyUsage(
                keyId,
                requestId,
                request.getRequestURI(),
                request.getMethod(),
                getClientIpAddress(request),
                request.getHeader("User-Agent"),
                response.getStatus(),
                (int) responseTime,
                getRequestSize(request),
                getResponseSize(response),
                null
            );
        }
    }

    /**
     * 获取请求大小
     */
    private Long getRequestSize(HttpServletRequest request) {
        String contentLength = request.getHeader("Content-Length");
        if (StringUtils.hasText(contentLength)) {
            try {
                return Long.parseLong(contentLength);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * 获取响应大小
     */
    private Long getResponseSize(HttpServletResponse response) {
        // 这里需要通过ResponseWrapper来获取响应大小
        // 简化实现，返回null
        return null;
    }

    /**
     * 发送未授权响应
     */
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        String jsonResponse = objectMapper.writeValueAsString(Map.of(
            "code", 401,
            "message", message,
            "timestamp", System.currentTimeMillis()
        ));
        
        response.getWriter().write(jsonResponse);
    }

    /**
     * 发送错误响应
     */
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        response.setContentType("application/json;charset=UTF-8");
        
        String jsonResponse = objectMapper.writeValueAsString(Map.of(
            "code", 500,
            "message", message,
            "timestamp", System.currentTimeMillis()
        ));
        
        response.getWriter().write(jsonResponse);
    }

    /**
     * 密钥凭据
     */
    private static class KeyCredentials {
        private final String keyId;
        private final String keySecret;
        
        public KeyCredentials(String keyId, String keySecret) {
            this.keyId = keyId;
            this.keySecret = keySecret;
        }
        
        public String getKeyId() {
            return keyId;
        }
        
        public String getKeySecret() {
            return keySecret;
        }
    }
}