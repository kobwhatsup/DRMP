package com.drmp.entity.system;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 系统操作日志实体
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@Entity
@Table(name = "sys_operation_logs")
public class SysOperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", length = 50)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type")
    private OperationType operationType;

    @Column(name = "module_name", length = 50)
    private String moduleName;

    @Column(name = "business_type", length = 50)
    private String businessType;

    @Column(name = "method_name", length = 200)
    private String methodName;

    @Column(name = "request_method", length = 10)
    private String requestMethod;

    @Column(name = "request_url", length = 500)
    private String requestUrl;

    @Column(name = "request_params", columnDefinition = "TEXT")
    private String requestParams;

    @Column(name = "response_result", columnDefinition = "TEXT")
    private String responseResult;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "operation_ip", length = 45)
    private String operationIp;

    @Column(name = "operation_location", length = 100)
    private String operationLocation;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "execution_time")
    private Long executionTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_status")
    private OperationStatus operationStatus = OperationStatus.SUCCESS;

    @Column(name = "operated_at")
    private LocalDateTime operatedAt;

    // 操作类型枚举
    public enum OperationType {
        CREATE("创建"),
        UPDATE("更新"),
        DELETE("删除"),
        QUERY("查询"),
        LOGIN("登录"),
        LOGOUT("登出"),
        EXPORT("导出"),
        IMPORT("导入");

        private final String description;

        OperationType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // 操作状态枚举
    public enum OperationStatus {
        SUCCESS("成功"),
        FAILURE("失败");

        private final String description;

        OperationStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    @PrePersist
    protected void onCreate() {
        operatedAt = LocalDateTime.now();
    }
}