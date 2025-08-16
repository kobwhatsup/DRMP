package com.drmp.validation.validator;

import com.drmp.validation.annotation.ValidPhoneNumber;
import org.springframework.util.StringUtils;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

/**
 * 手机号码验证器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    private boolean nullable;
    
    // 中国大陆手机号码正则表达式
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^1[3-9]\\d{9}$"
    );

    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
        this.nullable = constraintAnnotation.nullable();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // 允许空值且值为空时，验证通过
        if (nullable && !StringUtils.hasText(value)) {
            return true;
        }
        
        // 不允许空值但值为空时，验证失败
        if (!StringUtils.hasText(value)) {
            return false;
        }

        // 验证手机号码格式
        return PHONE_PATTERN.matcher(value).matches();
    }
}