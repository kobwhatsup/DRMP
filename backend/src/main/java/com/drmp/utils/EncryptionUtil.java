package com.drmp.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * 敏感数据加密工具类
 * 使用AES-256-GCM算法加密敏感数据（身份证号、手机号等）
 *
 * @author DRMP Team
 */
@Component
public class EncryptionUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(EncryptionUtil.class);
    
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 16;
    private static final int KEY_LENGTH = 256;
    
    @Value("${app.security.encryption.secret-key:drmp2024EncryptionSecretKeyForSensitiveDataProtection}")
    private String secretKeyStr;
    
    private SecretKey getSecretKey() {
        // 使用配置的密钥，截取或补齐到32字节（256位）
        byte[] keyBytes = secretKeyStr.getBytes(StandardCharsets.UTF_8);
        byte[] key = new byte[32];
        
        if (keyBytes.length >= 32) {
            System.arraycopy(keyBytes, 0, key, 0, 32);
        } else {
            System.arraycopy(keyBytes, 0, key, 0, keyBytes.length);
            // 补齐剩余位
            for (int i = keyBytes.length; i < 32; i++) {
                key[i] = 0;
            }
        }
        
        return new SecretKeySpec(key, ALGORITHM);
    }
    
    /**
     * 加密字符串
     *
     * @param plaintext 明文
     * @return 加密后的Base64字符串，格式：Base64(IV + EncryptedData)
     */
    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return plaintext;
        }
        
        try {
            SecretKey secretKey = getSecretKey();
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            
            // 生成随机IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom.getInstanceStrong().nextBytes(iv);
            
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);
            
            byte[] encryptedData = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            
            // 将IV和加密数据合并
            byte[] encryptedWithIv = new byte[GCM_IV_LENGTH + encryptedData.length];
            System.arraycopy(iv, 0, encryptedWithIv, 0, GCM_IV_LENGTH);
            System.arraycopy(encryptedData, 0, encryptedWithIv, GCM_IV_LENGTH, encryptedData.length);
            
            return Base64.getEncoder().encodeToString(encryptedWithIv);
            
        } catch (Exception e) {
            logger.error("加密失败: {}", e.getMessage(), e);
            throw new RuntimeException("数据加密失败", e);
        }
    }
    
    /**
     * 解密字符串
     *
     * @param encryptedData 加密的Base64字符串
     * @return 明文
     */
    public String decrypt(String encryptedData) {
        if (encryptedData == null || encryptedData.isEmpty()) {
            return encryptedData;
        }
        
        try {
            SecretKey secretKey = getSecretKey();
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            
            byte[] decodedData = Base64.getDecoder().decode(encryptedData);
            
            // 分离IV和加密数据
            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] encrypted = new byte[decodedData.length - GCM_IV_LENGTH];
            
            System.arraycopy(decodedData, 0, iv, 0, GCM_IV_LENGTH);
            System.arraycopy(decodedData, GCM_IV_LENGTH, encrypted, 0, encrypted.length);
            
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);
            
            byte[] decryptedData = cipher.doFinal(encrypted);
            
            return new String(decryptedData, StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            logger.error("解密失败: {}", e.getMessage(), e);
            throw new RuntimeException("数据解密失败", e);
        }
    }
    
    /**
     * 加密身份证号
     * 保留前4位和后4位，中间部分用*替换用于显示
     *
     * @param idCard 身份证号
     * @return 加密后的身份证号
     */
    public String encryptIdCard(String idCard) {
        return encrypt(idCard);
    }
    
    /**
     * 解密身份证号
     *
     * @param encryptedIdCard 加密的身份证号
     * @return 明文身份证号
     */
    public String decryptIdCard(String encryptedIdCard) {
        return decrypt(encryptedIdCard);
    }
    
    /**
     * 身份证号脱敏显示
     *
     * @param idCard 身份证号（明文）
     * @return 脱敏后的身份证号，如：1234***********5678
     */
    public String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() < 8) {
            return "****";
        }
        
        return idCard.substring(0, 4) + "*".repeat(idCard.length() - 8) + idCard.substring(idCard.length() - 4);
    }
    
    /**
     * 加密手机号
     *
     * @param phone 手机号
     * @return 加密后的手机号
     */
    public String encryptPhone(String phone) {
        return encrypt(phone);
    }
    
    /**
     * 解密手机号
     *
     * @param encryptedPhone 加密的手机号
     * @return 明文手机号
     */
    public String decryptPhone(String encryptedPhone) {
        return decrypt(encryptedPhone);
    }
    
    /**
     * 手机号脱敏显示
     *
     * @param phone 手机号（明文）
     * @return 脱敏后的手机号，如：138****5678
     */
    public String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return "****";
        }
        
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
    
    /**
     * 加密姓名
     *
     * @param name 姓名
     * @return 加密后的姓名
     */
    public String encryptName(String name) {
        return encrypt(name);
    }
    
    /**
     * 解密姓名
     *
     * @param encryptedName 加密的姓名
     * @return 明文姓名
     */
    public String decryptName(String encryptedName) {
        return decrypt(encryptedName);
    }
    
    /**
     * 姓名脱敏显示
     *
     * @param name 姓名（明文）
     * @return 脱敏后的姓名，如：张*三、王**
     */
    public String maskName(String name) {
        if (name == null || name.length() <= 1) {
            return "*";
        }
        
        if (name.length() == 2) {
            return name.substring(0, 1) + "*";
        }
        
        return name.substring(0, 1) + "*".repeat(name.length() - 2) + name.substring(name.length() - 1);
    }
    
    /**
     * 生成新的加密密钥（用于密钥轮换）
     *
     * @return Base64编码的密钥
     */
    public static String generateSecretKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
            keyGenerator.init(KEY_LENGTH);
            SecretKey secretKey = keyGenerator.generateKey();
            return Base64.getEncoder().encodeToString(secretKey.getEncoded());
        } catch (Exception e) {
            throw new RuntimeException("生成密钥失败", e);
        }
    }
    
    /**
     * 验证数据完整性
     *
     * @param originalData 原始数据
     * @param encryptedData 加密数据
     * @return 是否一致
     */
    public boolean verifyIntegrity(String originalData, String encryptedData) {
        try {
            String decryptedData = decrypt(encryptedData);
            return originalData.equals(decryptedData);
        } catch (Exception e) {
            logger.warn("数据完整性验证失败: {}", e.getMessage());
            return false;
        }
    }
}