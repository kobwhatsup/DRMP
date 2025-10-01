package com.drmp.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

/**
 * ValidationUtils 测试
 */
@DisplayName("ValidationUtils 测试")
class ValidationUtilsTest {

    @Test
    @DisplayName("isValidIdCard - 有效身份证号应返回true")
    void isValidIdCard_ShouldReturnTrue_ForValidIdCard() {
        assertThat(ValidationUtils.isValidIdCard("110101199001011234")).isTrue();
        assertThat(ValidationUtils.isValidIdCard("320106198506061234")).isTrue();
    }

    @Test
    @DisplayName("isValidIdCard - 无效身份证号应返回false")
    void isValidIdCard_ShouldReturnFalse_ForInvalidIdCard() {
        assertThat(ValidationUtils.isValidIdCard(null)).isFalse();
        assertThat(ValidationUtils.isValidIdCard("")).isFalse();
        assertThat(ValidationUtils.isValidIdCard("12345")).isFalse();
        assertThat(ValidationUtils.isValidIdCard("110101170001011234")).isFalse(); // 无效年份(17xx)
    }

    @Test
    @DisplayName("isValidPhone - 有效手机号应返回true")
    void isValidPhone_ShouldReturnTrue_ForValidPhone() {
        assertThat(ValidationUtils.isValidPhone("13800138000")).isTrue();
        assertThat(ValidationUtils.isValidPhone("15912345678")).isTrue();
        assertThat(ValidationUtils.isValidPhone("18912345678")).isTrue();
    }

    @Test
    @DisplayName("isValidPhone - 无效手机号应返回false")
    void isValidPhone_ShouldReturnFalse_ForInvalidPhone() {
        assertThat(ValidationUtils.isValidPhone(null)).isFalse();
        assertThat(ValidationUtils.isValidPhone("")).isFalse();
        assertThat(ValidationUtils.isValidPhone("12800138000")).isFalse(); // 不以1[3-9]开头
        assertThat(ValidationUtils.isValidPhone("138001380")).isFalse(); // 长度不足
    }

    @Test
    @DisplayName("isValidEmail - 有效邮箱应返回true")
    void isValidEmail_ShouldReturnTrue_ForValidEmail() {
        assertThat(ValidationUtils.isValidEmail("test@example.com")).isTrue();
        assertThat(ValidationUtils.isValidEmail("user.name@company.co.cn")).isTrue();
    }

    @Test
    @DisplayName("isValidEmail - 无效邮箱应返回false")
    void isValidEmail_ShouldReturnFalse_ForInvalidEmail() {
        assertThat(ValidationUtils.isValidEmail(null)).isFalse();
        assertThat(ValidationUtils.isValidEmail("")).isFalse();
        assertThat(ValidationUtils.isValidEmail("invalid")).isFalse();
        assertThat(ValidationUtils.isValidEmail("@example.com")).isFalse();
    }

    @Test
    @DisplayName("isValidAmount - 有效金额应返回true")
    void isValidAmount_ShouldReturnTrue_ForValidAmount() {
        assertThat(ValidationUtils.isValidAmount(BigDecimal.ZERO)).isTrue();
        assertThat(ValidationUtils.isValidAmount(new BigDecimal("100.50"))).isTrue();
    }

    @Test
    @DisplayName("isValidAmount - 无效金额应返回false")
    void isValidAmount_ShouldReturnFalse_ForInvalidAmount() {
        assertThat(ValidationUtils.isValidAmount(null)).isFalse();
        assertThat(ValidationUtils.isValidAmount(new BigDecimal("-10"))).isFalse();
    }

    @Test
    @DisplayName("isAmountInRange - 范围内金额应返回true")
    void isAmountInRange_ShouldReturnTrue_ForAmountInRange() {
        BigDecimal amount = new BigDecimal("50");
        BigDecimal min = new BigDecimal("10");
        BigDecimal max = new BigDecimal("100");

        assertThat(ValidationUtils.isAmountInRange(amount, min, max)).isTrue();
        assertThat(ValidationUtils.isAmountInRange(amount, null, max)).isTrue(); // 无下限
        assertThat(ValidationUtils.isAmountInRange(amount, min, null)).isTrue(); // 无上限
    }

    @Test
    @DisplayName("isAmountInRange - 范围外金额应返回false")
    void isAmountInRange_ShouldReturnFalse_ForAmountOutOfRange() {
        BigDecimal min = new BigDecimal("10");
        BigDecimal max = new BigDecimal("100");

        assertThat(ValidationUtils.isAmountInRange(new BigDecimal("5"), min, max)).isFalse();
        assertThat(ValidationUtils.isAmountInRange(new BigDecimal("150"), min, max)).isFalse();
        assertThat(ValidationUtils.isAmountInRange(null, min, max)).isFalse();
    }
}
