package com.drmp.annotation;

import com.drmp.entity.system.SysOperationLog;

import java.lang.annotation.*;

/**
 * 操作日志注解
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperationLog {

    /**
     * 业务模块名称
     */
    String module() default "";

    /**
     * 操作类型
     */
    SysOperationLog.OperationType operationType() default SysOperationLog.OperationType.QUERY;

    /**
     * 业务类型
     */
    String businessType() default "";

    /**
     * 操作描述
     */
    String description() default "";

    /**
     * 是否记录请求参数
     */
    boolean includeArgs() default true;

    /**
     * 是否记录响应结果
     */
    boolean includeResult() default false;

    /**
     * 是否异步保存日志
     */
    boolean async() default true;

    /**
     * 是否忽略异常（即使操作失败也记录为成功）
     */
    boolean ignoreException() default false;
}