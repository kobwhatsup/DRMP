package com.drmp.service.impl;

import com.drmp.config.FileSecurityConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * 文件安全服务
 * 负责文件安全验证、病毒扫描、内容检测等
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileSecurityService {

    private final FileSecurityConfig fileSecurityConfig;

    // 恶意文件签名（简化版，实际应用中应使用专业病毒库）
    private static final Set<String> MALICIOUS_SIGNATURES = Set.of(
        "4d5a",  // PE头
        "504b0304",  // ZIP头（可能包含恶意脚本）
        "255044462d",  // PDF头
        "d0cf11e0a1b11ae1"  // DOC头
    );

    // 可执行文件魔数
    private static final Set<String> EXECUTABLE_SIGNATURES = Set.of(
        "4d5a",  // PE (.exe, .dll)
        "7f454c46",  // ELF (Linux可执行文件)
        "cafebabe",  // Java .class
        "feedface", "feedfacf",  // Mach-O (macOS)
        "213c617263683e"  // .deb包
    );

    /**
     * 验证文件安全性
     */
    public SecurityValidationResult validateFile(MultipartFile file) {
        SecurityValidationResult result = new SecurityValidationResult();

        try {
            // 1. 基础验证
            if (!validateBasicProperties(file, result)) {
                return result;
            }

            // 2. 文件名安全验证
            if (!validateFileName(file.getOriginalFilename(), result)) {
                return result;
            }

            // 3. 文件扩展名验证
            if (!validateFileExtension(file.getOriginalFilename(), result)) {
                return result;
            }

            // 4. MIME类型验证
            if (!validateMimeType(file.getContentType(), result)) {
                return result;
            }

            // 5. 文件大小验证
            if (!validateFileSize(file.getSize(), result)) {
                return result;
            }

            // 6. 文件内容验证
            if (fileSecurityConfig.isEnableContentValidation()) {
                if (!validateFileContent(file, result)) {
                    return result;
                }
            }

            // 7. 病毒扫描
            if (fileSecurityConfig.isEnableVirusScan()) {
                if (!performVirusScan(file, result)) {
                    return result;
                }
            }

            result.setValid(true);
            result.setMessage("文件验证通过");

        } catch (Exception e) {
            log.error("文件安全验证失败", e);
            result.setValid(false);
            result.setMessage("文件验证过程中发生错误");
        }

        return result;
    }

    /**
     * 基础属性验证
     */
    private boolean validateBasicProperties(MultipartFile file, SecurityValidationResult result) {
        if (file == null || file.isEmpty()) {
            result.setValid(false);
            result.setMessage("文件为空");
            return false;
        }

        if (file.getOriginalFilename() == null || file.getOriginalFilename().trim().isEmpty()) {
            result.setValid(false);
            result.setMessage("文件名为空");
            return false;
        }

        return true;
    }

    /**
     * 文件名安全验证
     */
    private boolean validateFileName(String fileName, SecurityValidationResult result) {
        if (fileName == null) {
            result.setValid(false);
            result.setMessage("文件名为空");
            return false;
        }

        // 检查危险文件名模式
        for (String pattern : fileSecurityConfig.getDangerousFileNamePatterns()) {
            if (Pattern.matches(pattern, fileName)) {
                result.setValid(false);
                result.setMessage("文件名包含危险字符或模式");
                log.warn("检测到危险文件名: {}", fileName);
                return false;
            }
        }

        // 检查文件名长度
        if (fileName.length() > 255) {
            result.setValid(false);
            result.setMessage("文件名过长");
            return false;
        }

        // 检查隐藏文件
        if (fileName.startsWith(".")) {
            result.setValid(false);
            result.setMessage("不允许上传隐藏文件");
            return false;
        }

        return true;
    }

    /**
     * 文件扩展名验证
     */
    private boolean validateFileExtension(String fileName, SecurityValidationResult result) {
        String extension = getFileExtension(fileName).toLowerCase();

        // 检查是否在禁止列表中
        if (fileSecurityConfig.getBlockedExtensions().contains(extension)) {
            result.setValid(false);
            result.setMessage("文件类型被禁止: " + extension);
            return false;
        }

        // 检查是否在允许列表中
        if (!fileSecurityConfig.getAllowedExtensions().contains(extension)) {
            result.setValid(false);
            result.setMessage("不支持的文件类型: " + extension);
            return false;
        }

        return true;
    }

    /**
     * MIME类型验证
     */
    private boolean validateMimeType(String mimeType, SecurityValidationResult result) {
        if (mimeType == null || mimeType.trim().isEmpty()) {
            result.setValid(false);
            result.setMessage("无法识别文件类型");
            return false;
        }

        // 标准化MIME类型
        String normalizedMimeType = mimeType.toLowerCase().split(";")[0].trim();

        if (!fileSecurityConfig.getAllowedMimeTypes().contains(normalizedMimeType)) {
            result.setValid(false);
            result.setMessage("不支持的文件MIME类型: " + normalizedMimeType);
            return false;
        }

        return true;
    }

    /**
     * 文件大小验证
     */
    private boolean validateFileSize(long fileSize, SecurityValidationResult result) {
        if (fileSize <= 0) {
            result.setValid(false);
            result.setMessage("文件大小无效");
            return false;
        }

        if (fileSize > fileSecurityConfig.getMaxFileSize()) {
            result.setValid(false);
            result.setMessage("文件过大，最大允许: " + formatFileSize(fileSecurityConfig.getMaxFileSize()));
            return false;
        }

        return true;
    }

    /**
     * 文件内容验证
     */
    private boolean validateFileContent(MultipartFile file, SecurityValidationResult result) {
        try (InputStream inputStream = file.getInputStream()) {
            // 读取文件头部字节
            byte[] header = new byte[32];
            int bytesRead = inputStream.read(header);
            
            if (bytesRead > 0) {
                String hexHeader = HexFormat.of().formatHex(Arrays.copyOf(header, bytesRead)).toLowerCase();
                
                // 检查是否为可执行文件
                for (String signature : EXECUTABLE_SIGNATURES) {
                    if (hexHeader.startsWith(signature)) {
                        result.setValid(false);
                        result.setMessage("检测到可执行文件，禁止上传");
                        log.warn("检测到可执行文件上传尝试: {}, 签名: {}", 
                            file.getOriginalFilename(), signature);
                        return false;
                    }
                }

                // 验证文件头与扩展名是否匹配
                if (!validateFileHeaderMatch(hexHeader, getFileExtension(file.getOriginalFilename()), result)) {
                    return false;
                }
            }

        } catch (IOException e) {
            log.error("读取文件内容失败", e);
            result.setValid(false);
            result.setMessage("无法读取文件内容");
            return false;
        }

        return true;
    }

    /**
     * 验证文件头与扩展名匹配
     */
    private boolean validateFileHeaderMatch(String hexHeader, String extension, SecurityValidationResult result) {
        switch (extension.toLowerCase()) {
            case "jpg":
            case "jpeg":
                if (!hexHeader.startsWith("ffd8")) {
                    result.setValid(false);
                    result.setMessage("文件内容与扩展名不匹配");
                    return false;
                }
                break;
            case "png":
                if (!hexHeader.startsWith("89504e47")) {
                    result.setValid(false);
                    result.setMessage("文件内容与扩展名不匹配");
                    return false;
                }
                break;
            case "pdf":
                if (!hexHeader.startsWith("255044462d")) {
                    result.setValid(false);
                    result.setMessage("文件内容与扩展名不匹配");
                    return false;
                }
                break;
            case "zip":
                if (!hexHeader.startsWith("504b0304") && !hexHeader.startsWith("504b0506") && !hexHeader.startsWith("504b0708")) {
                    result.setValid(false);
                    result.setMessage("文件内容与扩展名不匹配");
                    return false;
                }
                break;
        }
        return true;
    }

    /**
     * 简化的病毒扫描（实际应用中应集成专业反病毒引擎）
     */
    private boolean performVirusScan(MultipartFile file, SecurityValidationResult result) {
        try (InputStream inputStream = file.getInputStream()) {
            // 计算文件MD5
            MessageDigest md5 = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[8192];
            int bytesRead;
            
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                md5.update(buffer, 0, bytesRead);
            }
            
            String fileMd5 = HexFormat.of().formatHex(md5.digest());
            
            // 这里应该与病毒库进行比对，此处仅做示例
            // 实际应用中应集成ClamAV或其他专业反病毒引擎
            if (isKnownMaliciousMd5(fileMd5)) {
                result.setValid(false);
                result.setMessage("检测到恶意文件");
                log.warn("检测到恶意文件: {}, MD5: {}", file.getOriginalFilename(), fileMd5);
                return false;
            }

            result.setFileMd5(fileMd5);
            
        } catch (IOException | NoSuchAlgorithmException e) {
            log.error("病毒扫描失败", e);
            result.setValid(false);
            result.setMessage("病毒扫描过程中发生错误");
            return false;
        }

        return true;
    }

    /**
     * 检查是否为已知恶意文件MD5（示例实现）
     */
    private boolean isKnownMaliciousMd5(String md5) {
        // 这里应该查询恶意文件MD5数据库
        // 此处仅为示例
        Set<String> knownMaliciousMd5s = Set.of(
            "d41d8cd98f00b204e9800998ecf8427e"  // 示例恶意文件MD5
        );
        return knownMaliciousMd5s.contains(md5.toLowerCase());
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1);
    }

    /**
     * 格式化文件大小
     */
    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024) + " KB";
        if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024) + " MB";
        return (bytes / 1024 / 1024 / 1024) + " GB";
    }

    /**
     * 创建隔离文件
     */
    public void quarantineFile(MultipartFile file, String reason) {
        try {
            Path quarantinePath = Paths.get(fileSecurityConfig.getQuarantineDir());
            Files.createDirectories(quarantinePath);
            
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path targetPath = quarantinePath.resolve(fileName);
            
            Files.copy(file.getInputStream(), targetPath);
            
            // 记录隔离日志
            log.warn("文件已被隔离: {} -> {}, 原因: {}", 
                file.getOriginalFilename(), targetPath, reason);
                
        } catch (IOException e) {
            log.error("隔离文件失败: " + file.getOriginalFilename(), e);
        }
    }

    /**
     * 安全验证结果
     */
    public static class SecurityValidationResult {
        private boolean valid;
        private String message;
        private String fileMd5;

        // Getters and Setters
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getFileMd5() { return fileMd5; }
        public void setFileMd5(String fileMd5) { this.fileMd5 = fileMd5; }
    }
}