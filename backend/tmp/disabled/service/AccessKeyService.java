package com.drmp.service;

import com.drmp.dto.AccessKeyCreateDTO;
import com.drmp.dto.AccessKeyResponseDTO;
import com.drmp.dto.AccessKeyUpdateDTO;
import com.drmp.dto.KeyUsageStatsDTO;
import com.drmp.entity.AccessKey;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 访问密钥服务接口
 */
public interface AccessKeyService {

    /**
     * 创建访问密钥
     */
    AccessKeyResponseDTO createAccessKey(AccessKeyCreateDTO createDTO);

    /**
     * 更新访问密钥
     */
    AccessKeyResponseDTO updateAccessKey(Long id, AccessKeyUpdateDTO updateDTO);

    /**
     * 根据ID获取访问密钥详情
     */
    AccessKeyResponseDTO getAccessKeyById(Long id);

    /**
     * 根据keyId获取访问密钥
     */
    AccessKey getAccessKeyByKeyId(String keyId);

    /**
     * 分页查询访问密钥
     */
    Page<AccessKeyResponseDTO> getAccessKeys(String ownerType, Long ownerId, String status, 
                                           String keyTypeCode, Pageable pageable);

    /**
     * 吊销访问密钥
     */
    void revokeAccessKey(Long id, String reason);

    /**
     * 暂停访问密钥
     */
    void suspendAccessKey(Long id, String reason);

    /**
     * 激活访问密钥
     */
    void activateAccessKey(Long id);

    /**
     * 重新生成密钥秘钥
     */
    String regenerateKeySecret(Long id, String reason);

    /**
     * 验证密钥
     */
    boolean validateAccessKey(String keyId, String keySecret, String clientIp, String endpoint);

    /**
     * 记录密钥使用
     */
    void logKeyUsage(String keyId, String requestId, String endpoint, String method, 
                    String ipAddress, String userAgent, Integer responseStatus, 
                    Integer responseTime, Long requestSize, Long responseSize, String errorMessage);

    /**
     * 检查访问频率限制
     */
    boolean checkRateLimit(String keyId, String clientIp);

    /**
     * 获取密钥使用统计
     */
    KeyUsageStatsDTO getKeyUsageStats(String keyId, String startDate, String endDate);

    /**
     * 获取即将过期的密钥
     */
    List<AccessKeyResponseDTO> getExpiringKeys(int days);

    /**
     * 自动清理过期密钥
     */
    void cleanupExpiredKeys();

    /**
     * 导出密钥列表
     */
    byte[] exportAccessKeys(String ownerType, Long ownerId, String format);
}