package com.drmp.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.regex.Pattern;

/**
 * 验证工具类
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class ValidationUtils {

    // 身份证号正则表达式
    private static final Pattern ID_CARD_PATTERN = Pattern.compile("^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$");
    
    // 手机号正则表达式
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");
    
    // 邮箱正则表达式
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    /**
     * 验证身份证号格式
     */
    public static boolean isValidIdCard(String idCard) {
        if (idCard == null || idCard.trim().isEmpty()) {
            return false;
        }
        return ID_CARD_PATTERN.matcher(idCard.trim()).matches();
    }

    /**
     * 验证手机号格式
     */
    public static boolean isValidPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone.trim()).matches();
    }

    /**
     * 验证邮箱格式
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    /**
     * 验证金额格式
     */
    public static boolean isValidAmount(BigDecimal amount) {
        return amount != null && amount.compareTo(BigDecimal.ZERO) >= 0;
    }

    /**
     * 验证金额范围
     */
    public static boolean isAmountInRange(BigDecimal amount, BigDecimal min, BigDecimal max) {
        if (amount == null) {
            return false;
        }
        if (min != null && amount.compareTo(min) < 0) {
            return false;
        }
        if (max != null && amount.compareTo(max) > 0) {
            return false;
        }
        return true;
    }

    /**
     * 验证字符串长度
     */
    public static boolean isValidLength(String str, int maxLength) {
        return str != null && str.length() <= maxLength;
    }

    /**
     * 验证字符串长度范围
     */
    public static boolean isValidLength(String str, int minLength, int maxLength) {
        if (str == null) {
            return minLength == 0;
        }
        return str.length() >= minLength && str.length() <= maxLength;
    }

    /**
     * 验证非空字符串
     */
    public static boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }

    /**
     * 验证数字范围
     */
    public static boolean isInRange(Integer value, Integer min, Integer max) {
        if (value == null) {
            return false;
        }
        if (min != null && value < min) {
            return false;
        }
        if (max != null && value > max) {
            return false;
        }
        return true;
    }

    /**
     * 验证逾期天数
     */
    public static boolean isValidOverdueDays(Integer days) {
        return days != null && days >= 0 && days <= 10000; // 最大约27年
    }

    /**
     * 验证案件编号格式
     */
    public static boolean isValidCaseNo(String caseNo) {
        if (!isNotEmpty(caseNo)) {
            return false;
        }
        // 案件编号通常为数字字母组合，长度6-20位
        return caseNo.matches("^[A-Za-z0-9]{6,20}$");
    }

    /**
     * 验证组织机构代码
     */
    public static boolean isValidOrgCode(String orgCode) {
        if (!isNotEmpty(orgCode)) {
            return false;
        }
        // 组织机构代码格式：XXXXXXXX-X 或 18位统一社会信用代码
        return orgCode.matches("^([0-9A-Z]{8}-[0-9A-Z]|[0-9A-Z]{18})$");
    }

    /**
     * 验证银行卡号
     */
    public static boolean isValidBankCard(String bankCard) {
        if (!isNotEmpty(bankCard)) {
            return false;
        }
        // 银行卡号通常为13-19位数字
        return bankCard.matches("^\\d{13,19}$");
    }

    /**
     * 获取身份证中的性别
     */
    public static String getGenderFromIdCard(String idCard) {
        if (!isValidIdCard(idCard)) {
            return null;
        }
        try {
            int genderDigit = Integer.parseInt(idCard.substring(16, 17));
            return genderDigit % 2 == 0 ? "女" : "男";
        } catch (Exception e) {
            log.warn("Failed to extract gender from ID card", e);
            return null;
        }
    }

    /**
     * 获取身份证中的出生日期
     */
    public static String getBirthDateFromIdCard(String idCard) {
        if (!isValidIdCard(idCard)) {
            return null;
        }
        try {
            return idCard.substring(6, 14); // YYYYMMDD
        } catch (Exception e) {
            log.warn("Failed to extract birth date from ID card", e);
            return null;
        }
    }
}