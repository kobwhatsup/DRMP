package com.drmp.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * 文件存储服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface FileStorageService {

    /**
     * 上传文件
     */
    String uploadFile(MultipartFile file, String directory);
    
    /**
     * 上传文件流
     */
    String uploadFile(InputStream inputStream, String fileName, String directory);
    
    /**
     * 分片上传
     */
    String uploadFileInChunks(MultipartFile file, String directory, int chunkSize);
    
    /**
     * 下载文件
     */
    byte[] downloadFile(String filePath);
    
    /**
     * 获取文件流
     */
    InputStream getFileStream(String filePath);
    
    /**
     * 删除文件
     */
    boolean deleteFile(String filePath);
    
    /**
     * 批量删除文件
     */
    Map<String, Boolean> deleteFiles(List<String> filePaths);
    
    /**
     * 检查文件是否存在
     */
    boolean fileExists(String filePath);
    
    /**
     * 获取文件大小
     */
    long getFileSize(String filePath);
    
    /**
     * 获取文件信息
     */
    Map<String, Object> getFileInfo(String filePath);
    
    /**
     * 生成文件访问URL
     */
    String generateAccessUrl(String filePath, int expireMinutes);
    
    /**
     * 生成上传签名URL
     */
    String generateUploadUrl(String fileName, String directory, int expireMinutes);
    
    /**
     * 复制文件
     */
    String copyFile(String sourcePath, String targetPath);
    
    /**
     * 移动文件
     */
    String moveFile(String sourcePath, String targetPath);
    
    /**
     * 列出目录下的文件
     */
    List<Map<String, Object>> listFiles(String directory, String prefix);
    
    /**
     * 创建目录
     */
    boolean createDirectory(String directory);
    
    /**
     * 删除目录
     */
    boolean deleteDirectory(String directory);
    
    /**
     * 获取存储统计信息
     */
    Map<String, Object> getStorageStats();
}