package com.drmp.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("EncryptionUtils 测试")
class EncryptionUtilsTest {

    @Test
    @DisplayName("md5Hash - 应生成32位MD5哈希")
    void md5Hash_ShouldGenerateMd5() {
        String input = "password123";
        String hash = EncryptionUtils.md5Hash(input);

        assertNotNull(hash);
        assertEquals(32, hash.length());
        assertTrue(hash.matches("[0-9a-f]{32}"));
    }

    @Test
    @DisplayName("md5Hash - 相同输入应生成相同哈希")
    void md5Hash_ShouldGenerateConsistentHash() {
        String input = "password123";
        String hash1 = EncryptionUtils.md5Hash(input);
        String hash2 = EncryptionUtils.md5Hash(input);

        assertEquals(hash1, hash2);
    }

    @Test
    @DisplayName("maskIdCard - 应正确脱敏身份证号")
    void maskIdCard_ShouldMaskIdCard() {
        String idCard = "110101199003071234";
        String masked = EncryptionUtils.maskIdCard(idCard);

        assertEquals("1101****1234", masked);
        assertTrue(masked.contains("****"));
    }

    @Test
    @DisplayName("maskIdCard - 短字符串应直接返回")
    void maskIdCard_ShouldReturnShortStringAsIs() {
        assertEquals("123", EncryptionUtils.maskIdCard("123"));
        assertNull(EncryptionUtils.maskIdCard(null));
    }

    @Test
    @DisplayName("maskPhone - 应正确脱敏手机号")
    void maskPhone_ShouldMaskPhone() {
        String phone = "13800138000";
        String masked = EncryptionUtils.maskPhone(phone);

        assertEquals("138****8000", masked);
        assertTrue(masked.contains("****"));
    }

    @Test
    @DisplayName("maskPhone - 短字符串应直接返回")
    void maskPhone_ShouldReturnShortStringAsIs() {
        assertEquals("123", EncryptionUtils.maskPhone("123"));
        assertNull(EncryptionUtils.maskPhone(null));
    }
}
