package com.drmp.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Set;

/**
 * 文件安全配置
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app.file.security")
public class FileSecurityConfig {

    /**
     * 允许的文件扩展名
     */
    private Set<String> allowedExtensions = Set.of(
        "jpg", "jpeg", "png", "gif", "bmp", "webp",  // 图片
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",  // 文档
        "txt", "rtf", "csv",  // 文本
        "zip", "rar", "7z"  // 压缩包
    );

    /**
     * 禁止的文件扩展名
     */
    private Set<String> blockedExtensions = Set.of(
        "exe", "bat", "cmd", "com", "pif", "scr", "vbs", "js", "jar",
        "sh", "py", "php", "asp", "jsp", "html", "htm", "xml"
    );

    /**
     * 允许的MIME类型
     */
    private Set<String> allowedMimeTypes = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp",
        "application/pdf",
        "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain", "text/csv", "application/rtf",
        "application/zip", "application/x-rar-compressed", "application/x-7z-compressed"
    );

    /**
     * 文件大小限制（字节）
     */
    private long maxFileSize = 100 * 1024 * 1024; // 100MB

    /**
     * 单次上传文件数量限制
     */
    private int maxFileCount = 10;

    /**
     * 是否启用病毒扫描
     */
    private boolean enableVirusScan = true;

    /**
     * 是否启用内容检测
     */
    private boolean enableContentValidation = true;

    /**
     * 隔离目录
     */
    private String quarantineDir = "./quarantine";

    /**
     * 临时目录
     */
    private String tempDir = "./temp";

    /**
     * 存储目录
     */
    private String storageDir = "./storage";

    /**
     * 是否启用文件加密存储
     */
    private boolean enableEncryption = false;

    /**
     * 访问URL有效期（秒）
     */
    private int accessUrlExpireSeconds = 3600;

    /**
     * 危险文件名模式
     */
    private List<String> dangerousFileNamePatterns = List.of(
        ".*\\.\\.",  // 包含..的路径
        ".*[<>:\"|?*].*",  // 包含特殊字符
        "^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$",  // Windows保留名
        ".*\\\\.*",  // 包含反斜杠
        ".*/.*"  // 包含正斜杠
    );
}