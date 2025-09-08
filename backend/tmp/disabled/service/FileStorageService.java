package com.drmp.service;

import com.drmp.dto.response.FileUploadResponse;
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
     * 安全上传文件（主要方法）
     */
    FileUploadResponse uploadFile(MultipartFile file, String businessType, Long businessId, 
                                String category, Long userId);

    /**
     * 初始化分片上传
     */
    Map<String, Object> initChunkUpload(String fileName, Long fileSize, String fileType,
                                      String businessType, Long businessId, Long userId);

    /**
     * 上传文件分片
     */
    Map<String, Object> uploadChunk(String uploadId, Integer chunkNumber, MultipartFile chunk);

    /**
     * 完成分片上传
     */
    FileUploadResponse completeChunkUpload(String uploadId, List<String> chunkMd5List);

    /**
     * 批量上传文件
     */
    Map<String, Object> batchUploadFiles(MultipartFile[] files, String businessType, 
                                       Long businessId, String category, Long userId);

    /**
     * 获取上传进度
     */
    Map<String, Object> getUploadProgress(String uploadId);

    /**
     * 取消上传
     */
    void cancelUpload(String uploadId);

    /**
     * 删除文件
     */
    void deleteFile(Long fileId, Long userId);

    /**
     * 获取下载链接
     */
    String getDownloadUrl(Long fileId, Integer expireSeconds);

    /**
     * 获取文件列表
     */
    List<FileUploadResponse> getFileList(String businessType, Long businessId, String category);

    /**
     * 获取存储统计
     */
    Map<String, Object> getStorageStatistics(Long organizationId, String startDate, String endDate);

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