package com.drmp.auth;

import com.drmp.entity.LoginActivityLog;
import com.drmp.entity.User;
import com.drmp.repository.LoginActivityLogRepository;
import com.drmp.repository.UserRepository;
import com.drmp.security.JwtTokenProvider;
import com.drmp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 统一认证管理器
 * 提供多种认证方式的统一管理，包括JWT、会话、API Key等
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UnifiedAuthenticationManager {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final LoginActivityLogRepository loginActivityLogRepository;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Value("${auth.session.timeout:1800}") // 30分钟
    private long sessionTimeout;

    @Value("${auth.max-concurrent-sessions:3}")
    private int maxConcurrentSessions;

    @Value("${auth.enable-refresh-token:true}")
    private boolean enableRefreshToken;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    // Redis Key前缀
    private static final String SESSION_KEY_PREFIX = "session:";
    private static final String USER_SESSIONS_KEY_PREFIX = "user:sessions:";
    private static final String TOKEN_BLACKLIST_PREFIX = "blacklist:";

    // 活跃会话管理（内存备份，Redis优先）
    private final Map<String, UserSession> activeSessions = new ConcurrentHashMap<>();

    // Token黑名单（内存备份，Redis优先）
    private final Set<String> tokenBlacklist = ConcurrentHashMap.newKeySet();

    /**
     * 用户名密码认证
     */
    public AuthenticationResult authenticate(String username, String password, String clientIp, String userAgent) {
        log.info("Attempting authentication for user: {} from IP: {}", username, clientIp);
        
        try {
            // 1. 查找用户
            User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new BadCredentialsException("用户名或密码错误"));

            // 2. 验证密码
            if (!passwordEncoder.matches(password, user.getPassword())) {
                log.warn("Failed login attempt for user: {} from IP: {}", username, clientIp);
                recordFailedLogin(user.getId(), clientIp, "密码错误");
                throw new BadCredentialsException("用户名或密码错误");
            }

            // 3. 检查用户状态
            validateUserStatus(user);

            // 4. 检查并发会话限制
            enforceSessionLimit(user.getId());

            // 5. 生成认证令牌
            String accessToken = tokenProvider.generateToken(user.getId(), user.getUsername(), false);
            String refreshToken = enableRefreshToken ? tokenProvider.generateRefreshToken(user.getId(), user.getUsername()) : null;

            // 6. 创建用户会话
            UserSession session = createUserSession(user, accessToken, refreshToken, clientIp, userAgent);
            saveSession(session);

            // 7. 更新用户最后登录信息
            updateLastLogin(user, clientIp);

            // 8. 记录成功登录
            recordLoginActivity(user.getId(), user.getUsername(), LoginActivityLog.ActivityType.LOGIN_SUCCESS,
                clientIp, userAgent, session.getSessionId(), null);

            log.info("User {} authenticated successfully from IP: {}", username, clientIp);

            return AuthenticationResult.success(accessToken, refreshToken, session.getSessionId(), user);

        } catch (Exception e) {
            log.error("Authentication failed for user: {} from IP: {}", username, clientIp, e);
            return AuthenticationResult.failure(e.getMessage());
        }
    }

    /**
     * Token认证
     */
    public AuthenticationResult authenticateByToken(String token) {
        if (!StringUtils.hasText(token)) {
            return AuthenticationResult.failure("Token不能为空");
        }

        try {
            // 1. 检查Token黑名单
            if (isTokenBlacklisted(token)) {
                return AuthenticationResult.failure("Token已失效");
            }

            // 2. 验证Token
            if (!tokenProvider.validateToken(token)) {
                return AuthenticationResult.failure("Token无效或已过期");
            }

            // 3. 获取用户信息
            Long userId = tokenProvider.getUserIdFromToken(token);
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("用户不存在"));

            // 4. 检查用户状态
            validateUserStatus(user);

            // 5. 查找对应的会话并更新活动时间
            UserSession session = findSessionByToken(token);
            if (session != null) {
                session.updateLastActivity();
                saveSession(session);
            }

            return AuthenticationResult.success(token, null, session != null ? session.getSessionId() : null, user);

        } catch (Exception e) {
            log.debug("Token authentication failed: {}", e.getMessage());
            return AuthenticationResult.failure(e.getMessage());
        }
    }

    /**
     * 刷新Token
     */
    public AuthenticationResult refreshToken(String refreshToken) {
        if (!enableRefreshToken || !StringUtils.hasText(refreshToken)) {
            return AuthenticationResult.failure("刷新Token功能未启用或Token为空");
        }

        try {
            // 1. 验证刷新Token
            if (!tokenProvider.validateRefreshToken(refreshToken)) {
                return AuthenticationResult.failure("刷新Token无效或已过期");
            }

            // 2. 获取用户信息
            Long userId = tokenProvider.getUserIdFromRefreshToken(refreshToken);
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("用户不存在"));

            // 3. 检查用户状态
            validateUserStatus(user);

            // 4. 生成新的访问令牌
            String newAccessToken = tokenProvider.generateToken(userId, user.getUsername(), false);
            String newRefreshToken = tokenProvider.generateRefreshToken(userId, user.getUsername());

            // 5. 更新会话信息
            UserSession session = findSessionByRefreshToken(refreshToken);
            if (session != null) {
                session.setAccessToken(newAccessToken);
                session.setRefreshToken(newRefreshToken);
                session.updateLastActivity();
                saveSession(session);
            }

            return AuthenticationResult.success(newAccessToken, newRefreshToken, 
                session != null ? session.getSessionId() : null, user);

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return AuthenticationResult.failure(e.getMessage());
        }
    }

    /**
     * 登出
     */
    public void logout(String token, String sessionId) {
        try {
            // 1. 将Token加入黑名单
            if (StringUtils.hasText(token)) {
                addTokenToBlacklist(token);
            }

            // 2. 移除会话
            if (StringUtils.hasText(sessionId)) {
                UserSession session = getSession(sessionId);
                if (session != null) {
                    deleteSession(sessionId, session.getUserId());
                    log.info("User {} logged out, session terminated", session.getUserId());
                }
            }

        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());
        }
    }

    /**
     * 登出指定会话
     */
    public void logoutSession(String sessionId, Long userId) {
        try {
            UserSession session = getSession(sessionId);

            if (session == null) {
                log.warn("Session not found: {}", sessionId);
                return;
            }

            // 验证会话属于该用户
            if (!userId.equals(session.getUserId())) {
                log.warn("User {} attempted to logout session {} belonging to user {}",
                    userId, sessionId, session.getUserId());
                throw new SecurityException("无权限操作此会话");
            }

            // 将Token加入黑名单
            addTokenToBlacklist(session.getAccessToken());
            if (session.getRefreshToken() != null) {
                addTokenToBlacklist(session.getRefreshToken());
            }

            // 删除会话
            deleteSession(sessionId, userId);

            log.info("Session {} terminated by user: {}", sessionId, userId);

        } catch (Exception e) {
            log.error("Logout session failed: {}", sessionId, e);
            throw new RuntimeException("登出会话失败", e);
        }
    }

    /**
     * 登出所有会话
     */
    public void logoutAllSessions(Long userId) {
        try {
            // 1. 找到用户的所有会话
            List<UserSession> userSessions = getUserSessions(userId);

            // 2. 将所有Token加入黑名单并删除会话
            for (UserSession session : userSessions) {
                addTokenToBlacklist(session.getAccessToken());
                if (session.getRefreshToken() != null) {
                    addTokenToBlacklist(session.getRefreshToken());
                }
                deleteSession(session.getSessionId(), userId);
            }

            log.info("All sessions terminated for user: {}, count: {}", userId, userSessions.size());

        } catch (Exception e) {
            log.error("Logout all sessions failed for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * 获取当前认证用户
     */
    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * 获取活跃会话列表
     */
    public List<UserSession> getActiveSessions(Long userId) {
        return getUserSessions(userId).stream()
            .sorted((s1, s2) -> s2.getLastActivity().compareTo(s1.getLastActivity()))
            .toList();
    }

    /**
     * 获取认证统计信息
     */
    public AuthenticationStats getStats() {
        long activeSessionCount = getAllSessions().size();
        long blacklistedTokenCount = redisTemplate != null ?
            redisTemplate.keys(TOKEN_BLACKLIST_PREFIX + "*").size() : tokenBlacklist.size();

        Map<String, Long> sessionsByUserAgent = getAllSessions().stream()
            .collect(Collectors.groupingBy(
                session -> extractBrowser(session.getUserAgent()),
                Collectors.counting()
            ));

        return new AuthenticationStats(
            activeSessionCount,
            blacklistedTokenCount,
            sessionsByUserAgent
        );
    }

    /**
     * 清理过期会话和Token（定时任务调用）
     * 注意：使用Redis时，TTL会自动清理，此方法主要清理内存备份
     */
    public void cleanupExpiredSessions() {
        if (redisTemplate != null) {
            // Redis会自动清理过期数据，这里只清理内存备份
            log.debug("Redis自动清理过期会话和Token");
        } else {
            // 无Redis时，手动清理内存数据
            LocalDateTime cutoff = LocalDateTime.now().minusSeconds(sessionTimeout);

            boolean hasExpiredSessions = activeSessions.entrySet().removeIf(entry ->
                entry.getValue().getLastActivity().isBefore(cutoff)
            );

            // 限制黑名单大小
            if (tokenBlacklist.size() > 10000) {
                log.warn("Token blacklist size exceeded 10000, clearing all");
                tokenBlacklist.clear();
            }

            if (hasExpiredSessions) {
                log.info("Cleaned up expired sessions from memory");
            }
        }
    }

    private void validateUserStatus(User user) {
        if (user.getStatus() == null || !user.getStatus().isActive()) {
            throw new BadCredentialsException("账户已被禁用");
        }
    }

    private void enforceSessionLimit(Long userId) {
        List<UserSession> userSessions = getUserSessions(userId);

        if (userSessions.size() >= maxConcurrentSessions) {
            // 移除最老的会话
            Optional<UserSession> oldestSession = userSessions.stream()
                .min(Comparator.comparing(UserSession::getLastActivity));

            if (oldestSession.isPresent()) {
                UserSession session = oldestSession.get();
                deleteSession(session.getSessionId(), userId);
                addTokenToBlacklist(session.getAccessToken());
                log.info("Removed oldest session for user {} due to session limit", userId);
            }
        }
    }

    private UserSession createUserSession(User user, String accessToken, String refreshToken, 
                                        String clientIp, String userAgent) {
        return UserSession.builder()
            .sessionId(UUID.randomUUID().toString())
            .userId(user.getId())
            .username(user.getUsername())
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .clientIp(clientIp)
            .userAgent(userAgent)
            .createdAt(LocalDateTime.now())
            .lastActivity(LocalDateTime.now())
            .build();
    }

    private void updateLastLogin(User user, String clientIp) {
        try {
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginIp(clientIp);
            userRepository.save(user);
        } catch (Exception e) {
            log.warn("Failed to update last login info for user {}: {}", user.getId(), e.getMessage());
        }
    }

    private void recordFailedLogin(Long userId, String clientIp, String reason) {
        log.warn("Failed login - User: {}, IP: {}, Reason: {}", userId, clientIp, reason);

        try {
            User user = userRepository.findById(userId).orElse(null);
            String username = user != null ? user.getUsername() : "unknown";

            recordLoginActivity(userId, username, LoginActivityLog.ActivityType.LOGIN_FAILED,
                clientIp, null, null, reason);
        } catch (Exception e) {
            log.error("Failed to record login activity", e);
        }
    }

    /**
     * 记录登录活动
     */
    private void recordLoginActivity(Long userId, String username, LoginActivityLog.ActivityType activityType,
                                    String clientIp, String userAgent, String sessionId, String failureReason) {
        try {
            LoginActivityLog log = LoginActivityLog.builder()
                .userId(userId)
                .username(username)
                .activityType(activityType)
                .clientIp(clientIp)
                .userAgent(userAgent)
                .sessionId(sessionId)
                .failureReason(failureReason)
                .build();

            loginActivityLogRepository.save(log);
        } catch (Exception e) {
            this.log.error("Failed to save login activity log", e);
        }
    }

    private UserSession findSessionByToken(String token) {
        return getAllSessions().stream()
            .filter(session -> token.equals(session.getAccessToken()))
            .findFirst()
            .orElse(null);
    }

    private UserSession findSessionByRefreshToken(String refreshToken) {
        return getAllSessions().stream()
            .filter(session -> refreshToken.equals(session.getRefreshToken()))
            .findFirst()
            .orElse(null);
    }

    // ========== Redis辅助方法 ==========

    /**
     * 保存会话到Redis（如果可用）或内存
     */
    private void saveSession(UserSession session) {
        if (redisTemplate != null) {
            try {
                // 保存会话对象
                String sessionKey = SESSION_KEY_PREFIX + session.getSessionId();
                redisTemplate.opsForValue().set(sessionKey, session, sessionTimeout, TimeUnit.SECONDS);

                // 保存用户会话ID列表
                String userSessionsKey = USER_SESSIONS_KEY_PREFIX + session.getUserId();
                redisTemplate.opsForSet().add(userSessionsKey, session.getSessionId());
                redisTemplate.expire(userSessionsKey, sessionTimeout, TimeUnit.SECONDS);

                log.debug("Session saved to Redis: {}", session.getSessionId());
            } catch (Exception e) {
                log.error("Failed to save session to Redis, falling back to memory", e);
                activeSessions.put(session.getSessionId(), session);
            }
        } else {
            activeSessions.put(session.getSessionId(), session);
        }
    }

    /**
     * 获取会话
     */
    private UserSession getSession(String sessionId) {
        if (redisTemplate != null) {
            try {
                String sessionKey = SESSION_KEY_PREFIX + sessionId;
                return (UserSession) redisTemplate.opsForValue().get(sessionKey);
            } catch (Exception e) {
                log.error("Failed to get session from Redis, falling back to memory", e);
                return activeSessions.get(sessionId);
            }
        } else {
            return activeSessions.get(sessionId);
        }
    }

    /**
     * 删除会话
     */
    private void deleteSession(String sessionId, Long userId) {
        if (redisTemplate != null) {
            try {
                String sessionKey = SESSION_KEY_PREFIX + sessionId;
                redisTemplate.delete(sessionKey);

                String userSessionsKey = USER_SESSIONS_KEY_PREFIX + userId;
                redisTemplate.opsForSet().remove(userSessionsKey, sessionId);

                log.debug("Session deleted from Redis: {}", sessionId);
            } catch (Exception e) {
                log.error("Failed to delete session from Redis, falling back to memory", e);
                activeSessions.remove(sessionId);
            }
        } else {
            activeSessions.remove(sessionId);
        }
    }

    /**
     * 获取用户的所有会话
     */
    private List<UserSession> getUserSessions(Long userId) {
        if (redisTemplate != null) {
            try {
                String userSessionsKey = USER_SESSIONS_KEY_PREFIX + userId;
                Set<Object> sessionIds = redisTemplate.opsForSet().members(userSessionsKey);

                if (sessionIds == null || sessionIds.isEmpty()) {
                    return Collections.emptyList();
                }

                return sessionIds.stream()
                    .map(id -> getSession((String) id))
                    .filter(Objects::nonNull)
                    .toList();
            } catch (Exception e) {
                log.error("Failed to get user sessions from Redis, falling back to memory", e);
                return activeSessions.values().stream()
                    .filter(session -> userId.equals(session.getUserId()))
                    .toList();
            }
        } else {
            return activeSessions.values().stream()
                .filter(session -> userId.equals(session.getUserId()))
                .toList();
        }
    }

    /**
     * 获取所有会话（用于统计）
     */
    private List<UserSession> getAllSessions() {
        if (redisTemplate != null) {
            try {
                Set<String> keys = redisTemplate.keys(SESSION_KEY_PREFIX + "*");
                if (keys == null || keys.isEmpty()) {
                    return Collections.emptyList();
                }

                return keys.stream()
                    .map(key -> (UserSession) redisTemplate.opsForValue().get(key))
                    .filter(Objects::nonNull)
                    .toList();
            } catch (Exception e) {
                log.error("Failed to get all sessions from Redis, falling back to memory", e);
                return new ArrayList<>(activeSessions.values());
            }
        } else {
            return new ArrayList<>(activeSessions.values());
        }
    }

    /**
     * 将Token加入黑名单
     */
    private void addTokenToBlacklist(String token) {
        if (redisTemplate != null) {
            try {
                String blacklistKey = TOKEN_BLACKLIST_PREFIX + token;
                // 设置过期时间为Token剩余有效期
                long ttl = jwtExpiration / 1000;
                redisTemplate.opsForValue().set(blacklistKey, "1", ttl, TimeUnit.SECONDS);
                log.debug("Token added to blacklist in Redis");
            } catch (Exception e) {
                log.error("Failed to add token to blacklist in Redis, falling back to memory", e);
                tokenBlacklist.add(token);
            }
        } else {
            tokenBlacklist.add(token);
        }
    }

    /**
     * 检查Token是否在黑名单中
     */
    private boolean isTokenBlacklisted(String token) {
        if (redisTemplate != null) {
            try {
                String blacklistKey = TOKEN_BLACKLIST_PREFIX + token;
                return Boolean.TRUE.equals(redisTemplate.hasKey(blacklistKey));
            } catch (Exception e) {
                log.error("Failed to check token blacklist in Redis, falling back to memory", e);
                return tokenBlacklist.contains(token);
            }
        } else {
            return tokenBlacklist.contains(token);
        }
    }

    private String extractBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";
        
        if (userAgent.contains("Chrome")) return "Chrome";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Safari")) return "Safari";
        if (userAgent.contains("Edge")) return "Edge";
        if (userAgent.contains("Opera")) return "Opera";
        
        return "Other";
    }

    /**
     * 认证结果
     */
    public static class AuthenticationResult {
        private final boolean success;
        private final String accessToken;
        private final String refreshToken;
        private final String sessionId;
        private final User user;
        private final String errorMessage;

        private AuthenticationResult(boolean success, String accessToken, String refreshToken, 
                                   String sessionId, User user, String errorMessage) {
            this.success = success;
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.sessionId = sessionId;
            this.user = user;
            this.errorMessage = errorMessage;
        }

        public static AuthenticationResult success(String accessToken, String refreshToken, 
                                                 String sessionId, User user) {
            return new AuthenticationResult(true, accessToken, refreshToken, sessionId, user, null);
        }

        public static AuthenticationResult failure(String errorMessage) {
            return new AuthenticationResult(false, null, null, null, null, errorMessage);
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public String getSessionId() { return sessionId; }
        public User getUser() { return user; }
        public String getErrorMessage() { return errorMessage; }
    }

    /**
     * 认证统计信息
     */
    public static class AuthenticationStats {
        public final long activeSessionCount;
        public final long blacklistedTokenCount;
        public final Map<String, Long> sessionsByUserAgent;

        public AuthenticationStats(long activeSessionCount, long blacklistedTokenCount, 
                                 Map<String, Long> sessionsByUserAgent) {
            this.activeSessionCount = activeSessionCount;
            this.blacklistedTokenCount = blacklistedTokenCount;
            this.sessionsByUserAgent = sessionsByUserAgent;
        }
    }
}