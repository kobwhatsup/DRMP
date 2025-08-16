package com.drmp.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * 加密工具类
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class EncryptionUtils {

    private static final String AES_ALGORITHM = "AES";
    private static final String DEFAULT_KEY = "DRMP2024SecretKey";

    /**
     * AES加密
     */
    public static String encryptAES(String plainText, String key) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), AES_ALGORITHM);
            Cipher cipher = Cipher.getInstance(AES_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            log.error("AES encryption failed", e);
            return plainText;
        }
    }

    /**
     * AES解密
     */
    public static String decryptAES(String encryptedText, String key) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), AES_ALGORITHM);
            Cipher cipher = Cipher.getInstance(AES_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("AES decryption failed", e);
            return encryptedText;
        }
    }

    /**
     * 加密身份证号
     */
    public static String encryptIdCard(String idCard) {
        if (idCard == null || idCard.trim().isEmpty()) {
            return idCard;
        }
        return encryptAES(idCard, DEFAULT_KEY);
    }

    /**
     * 解密身份证号
     */
    public static String decryptIdCard(String encryptedIdCard) {
        if (encryptedIdCard == null || encryptedIdCard.trim().isEmpty()) {
            return encryptedIdCard;
        }
        return decryptAES(encryptedIdCard, DEFAULT_KEY);
    }

    /**
     * MD5哈希
     */
    public static String md5Hash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("MD5 hash failed", e);
            return input;
        }
    }

    /**
     * 脱敏显示身份证号
     */
    public static String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() < 8) {
            return idCard;
        }
        return idCard.substring(0, 4) + "****" + idCard.substring(idCard.length() - 4);
    }

    /**
     * 脱敏显示手机号
     */
    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    /**
     * 实例方法加密（用于注入）
     */
    public String encrypt(String plainText) {
        return encryptAES(plainText, DEFAULT_KEY);
    }

    /**
     * 实例方法解密（用于注入）
     */
    public String decrypt(String encryptedText) {
        return decryptAES(encryptedText, DEFAULT_KEY);
    }
}