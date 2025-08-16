package com.drmp.validation.annotation;

import com.drmp.validation.validator.IdCardValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

/**
 * 身份证号码验证注解
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = IdCardValidator.class)
public @interface ValidIdCard {
    
    String message() default "身份证号码格式不正确";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * 是否允许空值
     */
    boolean nullable() default false;
}