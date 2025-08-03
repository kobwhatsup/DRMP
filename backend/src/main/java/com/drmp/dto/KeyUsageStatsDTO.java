package com.drmp.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 密钥使用统计DTO
 */
@Data
public class KeyUsageStatsDTO {

    private String keyId;

    private String keyName;

    private LocalDateTime statsPeriodStart;

    private LocalDateTime statsPeriodEnd;

    // 基础统计
    private Long totalRequests;

    private Long successfulRequests;

    private Long failedRequests;

    private Double successRate;

    private Double avgResponseTime;

    private Long totalDataTransfer; // 总数据传输量（字节）

    // 时间维度统计
    private List<HourlyStats> hourlyStats;

    private List<DailyStats> dailyStats;

    // 端点统计
    private List<EndpointStats> topEndpoints;

    // IP统计
    private List<IpStats> topIpAddresses;

    // 错误统计
    private Map<String, Long> errorCounts;

    /**
     * 小时统计
     */
    @Data
    public static class HourlyStats {
        private String hour; // 格式: 2024-01-01 14:00
        private Long requests;
        private Long errors;
        private Double avgResponseTime;
    }

    /**
     * 日统计
     */
    @Data
    public static class DailyStats {
        private String date; // 格式: 2024-01-01
        private Long requests;
        private Long errors;
        private Double avgResponseTime;
        private Long dataTransfer;
    }

    /**
     * 端点统计
     */
    @Data
    public static class EndpointStats {
        private String endpoint;
        private String method;
        private Long requests;
        private Double avgResponseTime;
        private Long errors;
    }

    /**
     * IP统计
     */
    @Data
    public static class IpStats {
        private String ipAddress;
        private Long requests;
        private Long errors;
        private LocalDateTime lastAccess;
    }
}