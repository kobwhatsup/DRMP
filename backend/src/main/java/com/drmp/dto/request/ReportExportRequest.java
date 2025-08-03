package com.drmp.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.util.Map;

/**
 * 报表导出请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportExportRequest {

    @NotBlank(message = "报表类型不能为空")
    private String reportType;

    @NotBlank(message = "导出格式不能为空")
    private String format;

    private Boolean async = false;

    @Max(value = 100000, message = "导出行数不能超过100,000")
    @Min(value = 1, message = "导出行数不能小于1")
    private Integer maxRows;

    private Map<String, Object> queryParams;

    private String fileName;

    private Boolean includeHeaders = true;

    private String dateFormat = "yyyy-MM-dd";

    private String numberFormat = "#,##0.00";

    private String encoding = "UTF-8";

    private Long userId;

    // 导出选项
    private ExportOptions options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportOptions {
        private Boolean includeCharts = false;
        private Boolean includeImages = false;
        private String paperSize = "A4";
        private String orientation = "PORTRAIT";
        private Integer fontSize = 12;
        private String fontFamily = "Arial";
        private Boolean includePageNumbers = true;
        private Boolean includeTimestamp = true;
        private String watermark;
    }
}