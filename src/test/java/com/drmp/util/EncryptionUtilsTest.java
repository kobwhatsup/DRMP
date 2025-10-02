package com.drmp.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("EncryptionUtils 测试")
class EncryptionUtilsTest {

    private static final String TEST_KEY = "1234567890123456";

    @Test
    @DisplayName("encryptAES - 应正确加密文本")
    void encryptAES_ShouldEncryptText() {
        String plainText = "sensitive data";
        String encrypted = EncryptionUtils.encryptAES(plainText, TEST_KEY);
        
        assertNotNull(encrypted);
        assertNotEquals(plainText, encrypted);
    }

    @Test
    @DisplayName("decryptAES - 应正确解密文本")
    void decryptAES_ShouldDecryptText() {
        String plainText = "sensitive data";
        String encrypted = EncryptionUtils.encryptAES(plainText, TEST_KEY);
        String decrypted = EncryptionUtils.decryptAES(encrypted, TEST_KEY);
        
        assertEquals(plainText, decrypted);
    }

    @Test
    @DisplayName("encryptIdCard - 应正确加密身份证号")
    void encryptIdCard_ShouldEncryptIdCard() {
        String idCard = "110101199003071234";
        String encrypted = EncryptionUtils.encryptIdCard(idCard);
        
        assertNotNull(encrypted);
        assertNotEquals(idCard, encrypted);
    }

    @Test
    @DisplayName("encryptIdCard - 空字符串应直接返回")
    void encryptIdCard_ShouldReturnEmptyForEmpty() {
        assertEquals("", EncryptionUtils.encryptIdCard(""));
        assertNull(EncryptionUtils.encryptIdCard(null));
    }

    @Test
    @DisplayName("decryptIdCard - 应正确解密身份证号")
    void decryptIdCard_ShouldDecryptIdCard() {
        String idCard = "110101199003071234";
        String encrypted = EncryptionUtils.encryptIdCard(idCard);
        String decrypted = EncryptionUtils.decryptIdCard(encrypted);
        
        assertEquals(idCard, decrypted);
    }

    @Test
    @DisplayName("md5Hash - 应生成MD5哈希")
    void md5Hash_ShouldGenerateMd5() {
        String input = "password123";
        String hash = EncryptionUtils.md5Hash(input);
        
        assertNotNull(hash);
        assertEquals(32, hash.length());
        assertNotEquals(input, hash);
        
        String hash2 = EncryptionUtils.md5Hash(input);
        assertEquals(hash, hash2);
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

    @Test
    @DisplayName("实例方法 - encrypt/decrypt应正常工作")
    void instanceMethods_ShouldWork() {
        EncryptionUtils utils = new EncryptionUtils();
        String plainText = "test data";
        
        String encrypted = utils.encrypt(plainText);
        assertNotEquals(plainText, encrypted);
        
        String decrypted = utils.decrypt(encrypted);
        assertEquals(plainText, decrypted);
    }
}
