package com.drmp.validation.annotation;

import com.drmp.validation.validator.AmountValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

/**
 * 金额验证注解
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = AmountValidator.class)
public @interface ValidAmount {
    
    String message() default "金额格式不正确";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * 最小值
     */
    double min() default 0.0;
    
    /**
     * 最大值
     */
    double max() default Double.MAX_VALUE;
    
    /**
     * 小数位数
     */
    int scale() default 2;
    
    /**
     * 是否允许负数
     */
    boolean allowNegative() default false;
    
    /**
     * 是否允许空值
     */
    boolean nullable() default false;
}