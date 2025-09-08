package com.drmp.annotation;

import java.lang.annotation.*;

/**
 * API文档注解
 * 用于标记需要生成API文档的类或方法
 *
 * @author DRMP Team
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ApiDocumentation {

    /**
     * API名称
     */
    String value() default "";

    /**
     * API描述
     */
    String description() default "";

    /**
     * 是否废弃
     */
    boolean deprecated() default false;

    /**
     * 版本信息
     */
    String version() default "1.0";

    /**
     * 作者
     */
    String author() default "";

    /**
     * 标签
     */
    String[] tags() default {};

    /**
     * 示例代码
     */
    String example() default "";
}