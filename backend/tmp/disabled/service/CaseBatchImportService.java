package com.drmp.service;

import com.drmp.dto.response.BatchImportResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * 案件批量导入服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface CaseBatchImportService {

    /**
     * 导入案件文件
     * 
     * @param file Excel文件
     * @param casePackageId 案件包ID
     * @return 导入结果
     */
    BatchImportResponse importCases(MultipartFile file, Long casePackageId);

    /**
     * 验证案件文件
     * 
     * @param file Excel文件
     * @return 验证结果
     */
    BatchImportResponse validateCases(MultipartFile file);

    /**
     * 获取导入模板
     * 
     * @return 模板字节数组
     */
    byte[] getImportTemplate();
}