package com.drmp.validation.validator;

import com.drmp.validation.annotation.ValidAmount;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 金额验证器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public class AmountValidator implements ConstraintValidator<ValidAmount, BigDecimal> {

    private double min;
    private double max;
    private int scale;
    private boolean allowNegative;
    private boolean nullable;

    @Override
    public void initialize(ValidAmount constraintAnnotation) {
        this.min = constraintAnnotation.min();
        this.max = constraintAnnotation.max();
        this.scale = constraintAnnotation.scale();
        this.allowNegative = constraintAnnotation.allowNegative();
        this.nullable = constraintAnnotation.nullable();
    }

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        // 允许空值且值为空时，验证通过
        if (nullable && value == null) {
            return true;
        }
        
        // 不允许空值但值为空时，验证失败
        if (value == null) {
            return false;
        }

        // 检查是否允许负数
        if (!allowNegative && value.compareTo(BigDecimal.ZERO) < 0) {
            setErrorMessage(context, "不允许负数");
            return false;
        }

        // 检查最小值
        if (value.compareTo(BigDecimal.valueOf(min)) < 0) {
            setErrorMessage(context, "金额不能小于 " + min);
            return false;
        }

        // 检查最大值
        if (value.compareTo(BigDecimal.valueOf(max)) > 0) {
            setErrorMessage(context, "金额不能大于 " + max);
            return false;
        }

        // 检查小数位数
        if (value.scale() > scale) {
            setErrorMessage(context, "小数位数不能超过 " + scale + " 位");
            return false;
        }

        return true;
    }

    private void setErrorMessage(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message)
               .addConstraintViolation();
    }
}