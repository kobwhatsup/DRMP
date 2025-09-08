package com.drmp.service;

import com.drmp.dto.request.ReportExportRequest;
import com.drmp.dto.response.ReportExportResponse;

import java.util.List;

/**
 * 报表导出服务接口
 * 提供多格式报表导出、异步导出、缓存优化等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface ReportExportService {

    /**
     * 导出报表
     * 
     * @param request 导出请求
     * @return 导出响应
     */
    ReportExportResponse exportReport(ReportExportRequest request);

    /**
     * 获取导出状态
     * 
     * @param taskId 任务ID
     * @return 导出响应
     */
    ReportExportResponse getExportStatus(String taskId);

    /**
     * 下载导出文件
     * 
     * @param taskId 任务ID
     * @return 文件字节数据
     */
    byte[] downloadExportFile(String taskId);

    /**
     * 获取用户导出历史
     * 
     * @param userId 用户ID
     * @param days 查询天数
     * @return 导出历史列表
     */
    List<ReportExportResponse> getUserExportHistory(Long userId, int days);

    /**
     * 清理过期导出文件
     */
    void cleanupExpiredExports();
}