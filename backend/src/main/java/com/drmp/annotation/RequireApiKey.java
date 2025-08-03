package com.drmp.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 需要API密钥访问的注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireApiKey {
    
    /**
     * 所需的权限
     */
    String[] permissions() default {};
    
    /**
     * 密钥类型限制
     */
    String[] keyTypes() default {};
    
    /**
     * 是否允许过期密钥（用于特殊情况）
     */
    boolean allowExpired() default false;
    
    /**
     * 描述信息
     */
    String description() default "";
}