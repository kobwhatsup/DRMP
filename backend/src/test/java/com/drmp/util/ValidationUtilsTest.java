package com.drmp.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ValidationUtils 测试
 */
@DisplayName("ValidationUtils 测试")
class ValidationUtilsTest {

    @Test
    @DisplayName("isValidIdCard - 应正确验证有效身份证号")
    void isValidIdCard_ShouldReturnTrueForValidIdCard() {
        assertTrue(ValidationUtils.isValidIdCard("110101199003071234"));
        assertTrue(ValidationUtils.isValidIdCard("44010219900307123X"));
    }

    @Test
    @DisplayName("isValidIdCard - 应拒绝无效身份证号")
    void isValidIdCard_ShouldReturnFalseForInvalidIdCard() {
        assertFalse(ValidationUtils.isValidIdCard(null));
        assertFalse(ValidationUtils.isValidIdCard(""));
        assertFalse(ValidationUtils.isValidIdCard("   "));
        assertFalse(ValidationUtils.isValidIdCard("123456"));
        assertFalse(ValidationUtils.isValidIdCard("11010119900399123X"));
    }

    @Test
    @DisplayName("isValidPhone - 应正确验证有效手机号")
    void isValidPhone_ShouldReturnTrueForValidPhone() {
        assertTrue(ValidationUtils.isValidPhone("13800138000"));
        assertTrue(ValidationUtils.isValidPhone("15912345678"));
        assertTrue(ValidationUtils.isValidPhone("18888888888"));
    }

    @Test
    @DisplayName("isValidPhone - 应拒绝无效手机号")
    void isValidPhone_ShouldReturnFalseForInvalidPhone() {
        assertFalse(ValidationUtils.isValidPhone(null));
        assertFalse(ValidationUtils.isValidPhone(""));
        assertFalse(ValidationUtils.isValidPhone("1234567890"));
        assertFalse(ValidationUtils.isValidPhone("12345678901"));
        assertFalse(ValidationUtils.isValidPhone("138001380001"));
    }

    @Test
    @DisplayName("isValidEmail - 应正确验证有效邮箱")
    void isValidEmail_ShouldReturnTrueForValidEmail() {
        assertTrue(ValidationUtils.isValidEmail("test@example.com"));
        assertTrue(ValidationUtils.isValidEmail("user.name@company.cn"));
        assertTrue(ValidationUtils.isValidEmail("admin+tag@domain.org"));
    }

    @Test
    @DisplayName("isValidEmail - 应拒绝无效邮箱")
    void isValidEmail_ShouldReturnFalseForInvalidEmail() {
        assertFalse(ValidationUtils.isValidEmail(null));
        assertFalse(ValidationUtils.isValidEmail(""));
        assertFalse(ValidationUtils.isValidEmail("invalid"));
        assertFalse(ValidationUtils.isValidEmail("@example.com"));
        assertFalse(ValidationUtils.isValidEmail("user@"));
    }

    @Test
    @DisplayName("isValidAmount - 应正确验证金额")
    void isValidAmount_ShouldReturnTrueForValidAmount() {
        assertTrue(ValidationUtils.isValidAmount(BigDecimal.ZERO));
        assertTrue(ValidationUtils.isValidAmount(new BigDecimal("100.50")));
        assertTrue(ValidationUtils.isValidAmount(new BigDecimal("1000000")));
    }

    @Test
    @DisplayName("isValidAmount - 应拒绝无效金额")
    void isValidAmount_ShouldReturnFalseForInvalidAmount() {
        assertFalse(ValidationUtils.isValidAmount(null));
        assertFalse(ValidationUtils.isValidAmount(new BigDecimal("-1")));
        assertFalse(ValidationUtils.isValidAmount(new BigDecimal("-100.50")));
    }

    @Test
    @DisplayName("isAmountInRange - 应正确验证金额范围")
    void isAmountInRange_ShouldValidateAmountRange() {
        assertTrue(ValidationUtils.isAmountInRange(new BigDecimal("50"), new BigDecimal("0"), new BigDecimal("100")));
        assertTrue(ValidationUtils.isAmountInRange(new BigDecimal("0"), new BigDecimal("0"), null));
        assertTrue(ValidationUtils.isAmountInRange(new BigDecimal("1000"), null, new BigDecimal("2000")));
        assertFalse(ValidationUtils.isAmountInRange(null, BigDecimal.ZERO, BigDecimal.TEN));
        assertFalse(ValidationUtils.isAmountInRange(new BigDecimal("-1"), BigDecimal.ZERO, BigDecimal.TEN));
        assertFalse(ValidationUtils.isAmountInRange(new BigDecimal("11"), BigDecimal.ZERO, BigDecimal.TEN));
    }

    @Test
    @DisplayName("isValidLength - 应正确验证字符串长度")
    void isValidLength_ShouldValidateStringLength() {
        assertTrue(ValidationUtils.isValidLength("test", 10));
        assertTrue(ValidationUtils.isValidLength("", 0));
        assertFalse(ValidationUtils.isValidLength("too long string", 5));
        assertFalse(ValidationUtils.isValidLength(null, 10));
    }

    @Test
    @DisplayName("isValidLength - 应正确验证字符串长度范围")
    void isValidLength_ShouldValidateStringLengthRange() {
        assertTrue(ValidationUtils.isValidLength("test", 1, 10));
        assertTrue(ValidationUtils.isValidLength("", 0, 10));
        assertTrue(ValidationUtils.isValidLength(null, 0, 10));
        assertFalse(ValidationUtils.isValidLength(null, 1, 10));
        assertFalse(ValidationUtils.isValidLength("short", 10, 20));
        assertFalse(ValidationUtils.isValidLength("too long string", 1, 5));
    }

    @Test
    @DisplayName("isNotEmpty - 应正确验证非空字符串")
    void isNotEmpty_ShouldValidateNonEmptyString() {
        assertTrue(ValidationUtils.isNotEmpty("test"));
        assertTrue(ValidationUtils.isNotEmpty("  test  "));
        assertFalse(ValidationUtils.isNotEmpty(null));
        assertFalse(ValidationUtils.isNotEmpty(""));
        assertFalse(ValidationUtils.isNotEmpty("   "));
    }

    @Test
    @DisplayName("isInRange - 应正确验证数字范围")
    void isInRange_ShouldValidateIntegerRange() {
        assertTrue(ValidationUtils.isInRange(5, 0, 10));
        assertTrue(ValidationUtils.isInRange(0, 0, 10));
        assertTrue(ValidationUtils.isInRange(10, 0, 10));
        assertTrue(ValidationUtils.isInRange(5, null, 10));
        assertTrue(ValidationUtils.isInRange(5, 0, null));
        assertFalse(ValidationUtils.isInRange(null, 0, 10));
        assertFalse(ValidationUtils.isInRange(-1, 0, 10));
        assertFalse(ValidationUtils.isInRange(11, 0, 10));
    }

    @Test
    @DisplayName("isValidOverdueDays - 应正确验证逾期天数")
    void isValidOverdueDays_ShouldValidateOverdueDays() {
        assertTrue(ValidationUtils.isValidOverdueDays(0));
        assertTrue(ValidationUtils.isValidOverdueDays(100));
        assertTrue(ValidationUtils.isValidOverdueDays(10000));
        assertFalse(ValidationUtils.isValidOverdueDays(null));
        assertFalse(ValidationUtils.isValidOverdueDays(-1));
        assertFalse(ValidationUtils.isValidOverdueDays(10001));
    }

    @Test
    @DisplayName("isValidCaseNo - 应正确验证案件编号")
    void isValidCaseNo_ShouldValidateCaseNumber() {
        assertTrue(ValidationUtils.isValidCaseNo("ABC123"));
        assertTrue(ValidationUtils.isValidCaseNo("CASE20250101ABC"));
        assertTrue(ValidationUtils.isValidCaseNo("12345678901234567890"));
        assertFalse(ValidationUtils.isValidCaseNo(null));
        assertFalse(ValidationUtils.isValidCaseNo(""));
        assertFalse(ValidationUtils.isValidCaseNo("ABC"));
        assertFalse(ValidationUtils.isValidCaseNo("CASE-2025-001"));
        assertFalse(ValidationUtils.isValidCaseNo("123456789012345678901"));
    }

    @Test
    @DisplayName("isValidOrgCode - 应正确验证组织机构代码")
    void isValidOrgCode_ShouldValidateOrgCode() {
        assertTrue(ValidationUtils.isValidOrgCode("12345678-X"));
        assertTrue(ValidationUtils.isValidOrgCode("ABCD1234-5"));
        assertTrue(ValidationUtils.isValidOrgCode("91110000600037341L"));
        assertFalse(ValidationUtils.isValidOrgCode(null));
        assertFalse(ValidationUtils.isValidOrgCode(""));
        assertFalse(ValidationUtils.isValidOrgCode("12345678"));
        assertFalse(ValidationUtils.isValidOrgCode("1234567-89"));
    }

    @Test
    @DisplayName("isValidBankCard - 应正确验证银行卡号")
    void isValidBankCard_ShouldValidateBankCard() {
        assertTrue(ValidationUtils.isValidBankCard("6222021234567890"));
        assertTrue(ValidationUtils.isValidBankCard("1234567890123"));
        assertTrue(ValidationUtils.isValidBankCard("1234567890123456789"));
        assertFalse(ValidationUtils.isValidBankCard(null));
        assertFalse(ValidationUtils.isValidBankCard(""));
        assertFalse(ValidationUtils.isValidBankCard("123456789012"));
        assertFalse(ValidationUtils.isValidBankCard("12345678901234567890"));
        assertFalse(ValidationUtils.isValidBankCard("622202123456789A"));
    }

    @Test
    @DisplayName("getGenderFromIdCard - 应正确提取性别")
    void getGenderFromIdCard_ShouldExtractGender() {
        assertEquals("男", ValidationUtils.getGenderFromIdCard("110101199003071231"));
        assertEquals("女", ValidationUtils.getGenderFromIdCard("110101199003071224"));
        assertNull(ValidationUtils.getGenderFromIdCard(null));
        assertNull(ValidationUtils.getGenderFromIdCard("invalid"));
    }

    @Test
    @DisplayName("getBirthDateFromIdCard - 应正确提取出生日期")
    void getBirthDateFromIdCard_ShouldExtractBirthDate() {
        assertEquals("19900307", ValidationUtils.getBirthDateFromIdCard("110101199003071234"));
        assertEquals("20000101", ValidationUtils.getBirthDateFromIdCard("110101200001011234"));
        assertNull(ValidationUtils.getBirthDateFromIdCard(null));
        assertNull(ValidationUtils.getBirthDateFromIdCard("invalid"));
    }
}
