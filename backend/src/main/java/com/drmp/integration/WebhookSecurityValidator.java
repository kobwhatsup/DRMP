package com.drmp.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Webhook安全验证器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class WebhookSecurityValidator {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String HMAC_SHA1 = "HmacSHA1";
    private static final int DEFAULT_TOLERANCE_SECONDS = 300; // 5分钟
    
    // 存储已处理的请求ID，防止重放攻击
    private final Map<String, LocalDateTime> processedRequests = new ConcurrentHashMap<>();

    /**
     * 验证HMAC签名（SHA256）
     */
    public boolean validateHmacSha256(String payload, String signature, String secret) {
        return validateHmac(payload, signature, secret, HMAC_SHA256);
    }

    /**
     * 验证HMAC签名（SHA1）
     */
    public boolean validateHmacSha1(String payload, String signature, String secret) {
        return validateHmac(payload, signature, secret, HMAC_SHA1);
    }

    /**
     * 验证HMAC签名
     */
    private boolean validateHmac(String payload, String signature, String secret, String algorithm) {
        try {
            Mac mac = Mac.getInstance(algorithm);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), algorithm);
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = Base64.getEncoder().encodeToString(hash);
            
            // 支持多种签名格式
            String normalizedSignature = normalizeSignature(signature);
            String normalizedExpected = normalizeSignature(expectedSignature);
            
            boolean isValid = secureEquals(normalizedSignature, normalizedExpected);
            
            log.debug("HMAC validation result: {}, algorithm: {}", isValid, algorithm);
            return isValid;
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error validating HMAC signature: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 验证GitHub风格的签名
     */
    public boolean validateGitHubSignature(String payload, String signature, String secret) {
        if (signature == null || !signature.startsWith("sha256=")) {
            return false;
        }
        
        String actualSignature = signature.substring(7); // 移除 "sha256=" 前缀
        String expectedSignature = generateHmacSha256Hex(payload, secret);
        
        return secureEquals(actualSignature, expectedSignature);
    }

    /**
     * 验证时间戳，防止重放攻击
     */
    public boolean validateTimestamp(long timestamp) {
        return validateTimestamp(timestamp, DEFAULT_TOLERANCE_SECONDS);
    }

    /**
     * 验证时间戳，防止重放攻击
     */
    public boolean validateTimestamp(long timestamp, int toleranceSeconds) {
        long currentTimestamp = Instant.now().getEpochSecond();
        long difference = Math.abs(currentTimestamp - timestamp);
        
        boolean isValid = difference <= toleranceSeconds;
        log.debug("Timestamp validation result: {}, difference: {}s, tolerance: {}s", 
                 isValid, difference, toleranceSeconds);
        
        return isValid;
    }

    /**
     * 验证请求唯一性，防止重放攻击
     */
    public boolean validateRequestUniqueness(String requestId) {
        LocalDateTime now = LocalDateTime.now();
        
        // 清理过期的请求记录
        cleanupExpiredRequests();
        
        // 检查是否已处理过
        if (processedRequests.containsKey(requestId)) {
            log.warn("Duplicate request detected: {}", requestId);
            return false;
        }
        
        // 记录请求
        processedRequests.put(requestId, now);
        return true;
    }

    /**
     * 综合验证Webhook请求
     */
    public WebhookValidationResult validateWebhookRequest(WebhookRequest request) {
        WebhookValidationResult result = new WebhookValidationResult();
        
        // 验证签名
        boolean signatureValid = false;
        if (request.getSignature() != null && request.getSecret() != null) {
            if (request.getSignature().startsWith("sha256=")) {
                signatureValid = validateGitHubSignature(request.getPayload(), request.getSignature(), request.getSecret());
            } else {
                signatureValid = validateHmacSha256(request.getPayload(), request.getSignature(), request.getSecret());
            }
        }
        result.setSignatureValid(signatureValid);
        
        // 验证时间戳
        boolean timestampValid = request.getTimestamp() != null && validateTimestamp(request.getTimestamp());
        result.setTimestampValid(timestampValid);
        
        // 验证请求唯一性
        boolean uniquenessValid = request.getRequestId() != null && validateRequestUniqueness(request.getRequestId());
        result.setUniquenessValid(uniquenessValid);
        
        // 整体验证结果
        result.setValid(signatureValid && timestampValid && uniquenessValid);
        
        log.info("Webhook validation completed: signature={}, timestamp={}, uniqueness={}, overall={}", 
                signatureValid, timestampValid, uniquenessValid, result.isValid());
        
        return result;
    }

    /**
     * 生成HMAC SHA256十六进制签名
     */
    private String generateHmacSha256Hex(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error generating HMAC SHA256 hex: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 标准化签名格式
     */
    private String normalizeSignature(String signature) {
        if (signature == null) {
            return "";
        }
        return signature.toLowerCase().trim();
    }

    /**
     * 安全的字符串比较，防止时序攻击
     */
    private boolean secureEquals(String a, String b) {
        if (a == null || b == null) {
            return a == b;
        }
        
        if (a.length() != b.length()) {
            return false;
        }
        
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        
        return result == 0;
    }

    /**
     * 清理过期的请求记录
     */
    private void cleanupExpiredRequests() {
        LocalDateTime expireTime = LocalDateTime.now().minusMinutes(10); // 保留10分钟内的记录
        processedRequests.entrySet().removeIf(entry -> entry.getValue().isBefore(expireTime));
    }

    /**
     * Webhook请求数据
     */
    public static class WebhookRequest {
        private String payload;
        private String signature;
        private String secret;
        private Long timestamp;
        private String requestId;

        // Constructors
        public WebhookRequest() {}

        public WebhookRequest(String payload, String signature, String secret, Long timestamp, String requestId) {
            this.payload = payload;
            this.signature = signature;
            this.secret = secret;
            this.timestamp = timestamp;
            this.requestId = requestId;
        }

        // Getters and setters
        public String getPayload() { return payload; }
        public void setPayload(String payload) { this.payload = payload; }
        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
        public Long getTimestamp() { return timestamp; }
        public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
        public String getRequestId() { return requestId; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
    }

    /**
     * Webhook验证结果
     */
    public static class WebhookValidationResult {
        private boolean valid;
        private boolean signatureValid;
        private boolean timestampValid;
        private boolean uniquenessValid;
        private String message;

        // Getters and setters
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public boolean isSignatureValid() { return signatureValid; }
        public void setSignatureValid(boolean signatureValid) { this.signatureValid = signatureValid; }
        public boolean isTimestampValid() { return timestampValid; }
        public void setTimestampValid(boolean timestampValid) { this.timestampValid = timestampValid; }
        public boolean isUniquenessValid() { return uniquenessValid; }
        public void setUniquenessValid(boolean uniquenessValid) { this.uniquenessValid = uniquenessValid; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}