package com.drmp.validation.validator;

import com.drmp.validation.annotation.ValidIdCard;
import org.springframework.util.StringUtils;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

/**
 * 身份证号码验证器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public class IdCardValidator implements ConstraintValidator<ValidIdCard, String> {

    private boolean nullable;
    
    // 身份证号码正则表达式（18位）
    private static final Pattern ID_CARD_PATTERN = Pattern.compile(
        "^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$"
    );
    
    // 校验码
    private static final char[] VERIFY_CODE = {'1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'};
    private static final int[] WEIGHT = {7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2};

    @Override
    public void initialize(ValidIdCard constraintAnnotation) {
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

        // 验证格式
        if (!ID_CARD_PATTERN.matcher(value).matches()) {
            return false;
        }

        // 验证校验码
        return validateCheckCode(value);
    }

    /**
     * 验证身份证校验码
     */
    private boolean validateCheckCode(String idCard) {
        if (idCard.length() != 18) {
            return false;
        }

        try {
            int sum = 0;
            for (int i = 0; i < 17; i++) {
                sum += Character.getNumericValue(idCard.charAt(i)) * WEIGHT[i];
            }
            
            int mod = sum % 11;
            char checkCode = VERIFY_CODE[mod];
            char lastChar = Character.toUpperCase(idCard.charAt(17));
            
            return checkCode == lastChar;
        } catch (Exception e) {
            return false;
        }
    }
}