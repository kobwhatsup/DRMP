package com.drmp.dto.response;

import com.drmp.entity.CaseImportRecord;
import com.drmp.entity.enums.ImportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 案件导入响应
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseImportResponse {

    /**
     * 导入记录ID
     */
    private Long id;

    /**
     * 导入批次ID
     */
    private String importBatchId;

    /**
     * 关联的案件包ID
     */
    private Long casePackageId;

    /**
     * 案件包名称
     */
    private String casePackageName;

    /**
     * 导入文件名
     */
    private String fileName;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件大小（可读格式）
     */
    private String fileSizeReadable;

    /**
     * 总行数
     */
    private Integer totalRows;

    /**
     * 成功行数
     */
    private Integer successRows;

    /**
     * 失败行数
     */
    private Integer failedRows;

    /**
     * 重复行数
     */
    private Integer duplicateRows;

    /**
     * 导入状态
     */
    private ImportStatus importStatus;

    /**
     * 导入状态描述
     */
    private String importStatusDesc;

    /**
     * 导入进度百分比
     */
    private Integer progressPercentage;

    /**
     * 成功率
     */
    private Double successRate;

    /**
     * 错误汇总
     */
    private String errorSummary;

    /**
     * 详细错误报告文件路径
     */
    private String errorDetailFile;

    /**
     * 开始时间
     */
    private LocalDateTime startedAt;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 耗时（秒）
     */
    private Long durationSeconds;

    /**
     * 耗时（可读格式）
     */
    private String durationReadable;

    /**
     * 导入人ID
     */
    private Long importedBy;

    /**
     * 导入人姓名
     */
    private String importedByName;

    /**
     * 从实体转换为响应对象
     */
    public static CaseImportResponse fromEntity(CaseImportRecord entity) {
        if (entity == null) {
            return null;
        }

        CaseImportResponseBuilder builder = CaseImportResponse.builder()
                .id(entity.getId())
                .importBatchId(entity.getImportBatchId())
                .fileName(entity.getFileName())
                .fileSize(entity.getFileSize())
                .fileSizeReadable(formatFileSize(entity.getFileSize()))
                .totalRows(entity.getTotalRows())
                .successRows(entity.getSuccessRows())
                .failedRows(entity.getFailedRows())
                .duplicateRows(entity.getDuplicateRows())
                .importStatus(entity.getImportStatus())
                .importStatusDesc(entity.getImportStatus() != null ? entity.getImportStatus().getDescription() : null)
                .progressPercentage(entity.getProgressPercentage())
                .successRate(entity.getSuccessRate())
                .errorSummary(entity.getErrorSummary())
                .errorDetailFile(entity.getErrorDetailFile())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                .durationSeconds(entity.getDurationSeconds())
                .durationReadable(formatDuration(entity.getDurationSeconds()))
                .importedBy(entity.getImportedBy());

        // 设置案件包信息
        if (entity.getCasePackage() != null) {
            builder.casePackageId(entity.getCasePackage().getId())
                   .casePackageName(entity.getCasePackage().getPackageName());
        }

        return builder.build();
    }

    /**
     * 格式化文件大小
     */
    private static String formatFileSize(Long fileSize) {
        if (fileSize == null || fileSize == 0) {
            return "0 B";
        }

        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double size = fileSize.doubleValue();

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return String.format("%.2f %s", size, units[unitIndex]);
    }

    /**
     * 格式化耗时
     */
    private static String formatDuration(Long durationSeconds) {
        if (durationSeconds == null || durationSeconds == 0) {
            return "0秒";
        }

        long hours = durationSeconds / 3600;
        long minutes = (durationSeconds % 3600) / 60;
        long seconds = durationSeconds % 60;

        StringBuilder sb = new StringBuilder();
        if (hours > 0) {
            sb.append(hours).append("小时");
        }
        if (minutes > 0) {
            sb.append(minutes).append("分钟");
        }
        if (seconds > 0 || sb.length() == 0) {
            sb.append(seconds).append("秒");
        }

        return sb.toString();
    }
}