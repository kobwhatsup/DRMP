package com.drmp.service.impl;

import com.drmp.dto.request.ReportExportRequest;
import com.drmp.dto.response.ReportExportResponse;
import com.drmp.service.ReportExportService;
import com.drmp.util.ExcelUtils;
import com.drmp.util.PDFUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * 报表导出服务实现
 * 提供多格式报表导出、异步导出、缓存优化等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportExportServiceImpl implements ReportExportService {

    private final ObjectMapper objectMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ExcelUtils excelUtils;
    private final PDFUtils pdfUtils;
    
    private final ExecutorService exportExecutor = Executors.newFixedThreadPool(4);

    // 支持的导出格式
    private static final Set<String> SUPPORTED_FORMATS = Set.of("excel", "pdf", "csv", "json");
    
    // 缓存配置
    private static final String EXPORT_CACHE_PREFIX = "report_export:";
    private static final long CACHE_EXPIRE_SECONDS = 3600; // 1小时

    @Override
    public ReportExportResponse exportReport(ReportExportRequest request) {
        log.info("Starting report export: type={}, format={}, async={}", 
            request.getReportType(), request.getFormat(), request.getAsync());

        // 验证请求参数
        validateExportRequest(request);

        // 生成导出任务ID
        String taskId = generateTaskId(request);

        if (request.getAsync()) {
            // 异步导出
            return startAsyncExport(request, taskId);
        } else {
            // 同步导出
            return executeExport(request, taskId);
        }
    }

    @Override
    public ReportExportResponse getExportStatus(String taskId) {
        log.info("Getting export status for task: {}", taskId);
        
        String cacheKey = EXPORT_CACHE_PREFIX + "status:" + taskId;
        ReportExportResponse response = (ReportExportResponse) redisTemplate.opsForValue().get(cacheKey);
        
        if (response == null) {
            response = ReportExportResponse.builder()
                .taskId(taskId)
                .status("NOT_FOUND")
                .message("导出任务不存在或已过期")
                .build();
        }
        
        return response;
    }

    @Override
    public byte[] downloadExportFile(String taskId) {
        log.info("Downloading export file for task: {}", taskId);
        
        String cacheKey = EXPORT_CACHE_PREFIX + "file:" + taskId;
        byte[] fileData = (byte[]) redisTemplate.opsForValue().get(cacheKey);
        
        if (fileData == null) {
            throw new RuntimeException("导出文件不存在或已过期");
        }
        
        return fileData;
    }

    @Override
    public List<ReportExportResponse> getUserExportHistory(Long userId, int days) {
        log.info("Getting export history for user: {}, days: {}", userId, days);
        
        String pattern = EXPORT_CACHE_PREFIX + "history:" + userId + ":*";
        Set<String> keys = redisTemplate.keys(pattern);
        
        List<ReportExportResponse> history = new ArrayList<>();
        if (keys != null) {
            for (String key : keys) {
                ReportExportResponse response = (ReportExportResponse) redisTemplate.opsForValue().get(key);
                if (response != null) {
                    history.add(response);
                }
            }
        }
        
        // 按创建时间降序排序
        history.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        return history;
    }

    @Override
    public void cleanupExpiredExports() {
        log.info("Cleaning up expired export files");
        
        String pattern = EXPORT_CACHE_PREFIX + "*";
        Set<String> keys = redisTemplate.keys(pattern);
        
        if (keys != null) {
            int cleanedCount = 0;
            for (String key : keys) {
                Long expire = redisTemplate.getExpire(key);
                if (expire != null && expire <= 0) {
                    redisTemplate.delete(key);
                    cleanedCount++;
                }
            }
            log.info("Cleaned up {} expired export cache entries", cleanedCount);
        }
    }

    // 私有方法实现

    private void validateExportRequest(ReportExportRequest request) {
        if (request.getReportType() == null || request.getReportType().trim().isEmpty()) {
            throw new IllegalArgumentException("报表类型不能为空");
        }
        
        if (request.getFormat() == null || !SUPPORTED_FORMATS.contains(request.getFormat().toLowerCase())) {
            throw new IllegalArgumentException("不支持的导出格式: " + request.getFormat());
        }
        
        if (request.getMaxRows() != null && request.getMaxRows() > 100000) {
            throw new IllegalArgumentException("导出行数不能超过100,000行");
        }
    }

    private String generateTaskId(ReportExportRequest request) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String hash = String.valueOf(Objects.hash(
            request.getReportType(), 
            request.getFormat(), 
            request.getQueryParams(),
            timestamp
        ));
        return request.getReportType() + "_" + timestamp + "_" + Math.abs(hash.hashCode());
    }

    private ReportExportResponse startAsyncExport(ReportExportRequest request, String taskId) {
        ReportExportResponse response = ReportExportResponse.builder()
            .taskId(taskId)
            .status("PENDING")
            .message("导出任务已提交，正在处理中...")
            .reportType(request.getReportType())
            .format(request.getFormat())
            .async(true)
            .createdAt(LocalDateTime.now())
            .userId(request.getUserId())
            .build();

        // 缓存任务状态
        String statusKey = EXPORT_CACHE_PREFIX + "status:" + taskId;
        redisTemplate.opsForValue().set(statusKey, response, CACHE_EXPIRE_SECONDS, TimeUnit.SECONDS);

        // 异步执行导出
        CompletableFuture.runAsync(() -> {
            try {
                executeAsyncExport(request, taskId);
            } catch (Exception e) {
                log.error("Async export failed for task: " + taskId, e);
                updateExportStatus(taskId, "FAILED", "导出失败: " + e.getMessage(), null, null);
            }
        }, exportExecutor);

        return response;
    }

    private ReportExportResponse executeExport(ReportExportRequest request, String taskId) {
        try {
            updateExportStatus(taskId, "PROCESSING", "正在生成报表数据...", null, null);

            // 获取报表数据
            List<Map<String, Object>> reportData = fetchReportData(request);
            
            updateExportStatus(taskId, "PROCESSING", "正在导出文件...", null, reportData.size());

            // 生成导出文件
            byte[] fileData = generateExportFile(request, reportData);
            
            // 缓存文件数据
            String fileKey = EXPORT_CACHE_PREFIX + "file:" + taskId;
            redisTemplate.opsForValue().set(fileKey, fileData, CACHE_EXPIRE_SECONDS, TimeUnit.SECONDS);

            // 生成下载URL
            String downloadUrl = "/api/v1/reports/export/download/" + taskId;

            ReportExportResponse response = ReportExportResponse.builder()
                .taskId(taskId)
                .status("COMPLETED")
                .message("导出完成")
                .reportType(request.getReportType())
                .format(request.getFormat())
                .async(request.getAsync())
                .downloadUrl(downloadUrl)
                .fileSize(Long.valueOf(fileData.length))
                .recordCount(reportData.size())
                .createdAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .userId(request.getUserId())
                .build();

            // 更新状态缓存
            updateExportStatus(taskId, response);

            // 保存到用户导出历史
            saveToUserHistory(request.getUserId(), response);

            return response;

        } catch (Exception e) {
            log.error("Export failed for task: " + taskId, e);
            
            ReportExportResponse errorResponse = ReportExportResponse.builder()
                .taskId(taskId)
                .status("FAILED")
                .message("导出失败: " + e.getMessage())
                .reportType(request.getReportType())
                .format(request.getFormat())
                .async(request.getAsync())
                .createdAt(LocalDateTime.now())
                .userId(request.getUserId())
                .build();

            updateExportStatus(taskId, errorResponse);
            return errorResponse;
        }
    }

    private void executeAsyncExport(ReportExportRequest request, String taskId) {
        try {
            updateExportStatus(taskId, "PROCESSING", "正在生成报表数据...", null, null);

            // 获取报表数据
            List<Map<String, Object>> reportData = fetchReportData(request);
            
            updateExportStatus(taskId, "PROCESSING", "正在导出文件...", null, reportData.size());

            // 生成导出文件
            byte[] fileData = generateExportFile(request, reportData);
            
            // 缓存文件数据
            String fileKey = EXPORT_CACHE_PREFIX + "file:" + taskId;
            redisTemplate.opsForValue().set(fileKey, fileData, CACHE_EXPIRE_SECONDS, TimeUnit.SECONDS);

            // 生成下载URL
            String downloadUrl = "/api/v1/reports/export/download/" + taskId;

            // 更新完成状态
            updateExportStatus(taskId, "COMPLETED", "导出完成", downloadUrl, reportData.size());
            updateExportFileInfo(taskId, Long.valueOf(fileData.length), LocalDateTime.now());

            // 保存到用户导出历史
            ReportExportResponse completedResponse = ReportExportResponse.builder()
                .taskId(taskId)
                .status("COMPLETED")
                .message("导出完成")
                .reportType(request.getReportType())
                .format(request.getFormat())
                .async(true)
                .downloadUrl(downloadUrl)
                .fileSize(Long.valueOf(fileData.length))
                .recordCount(reportData.size())
                .createdAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .userId(request.getUserId())
                .build();

            saveToUserHistory(request.getUserId(), completedResponse);

            log.info("Async export completed for task: {}, records: {}, size: {} bytes", 
                taskId, reportData.size(), fileData.length);

        } catch (Exception e) {
            log.error("Async export failed for task: " + taskId, e);
            updateExportStatus(taskId, "FAILED", "导出失败: " + e.getMessage(), null, null);
        }
    }

    private List<Map<String, Object>> fetchReportData(ReportExportRequest request) {
        // TODO: 根据报表类型获取数据
        // 这里应该调用相应的报表数据服务
        log.info("Fetching report data for type: {}", request.getReportType());
        
        // 模拟数据获取
        List<Map<String, Object>> data = new ArrayList<>();
        
        // 示例：根据不同报表类型获取不同数据
        switch (request.getReportType()) {
            case "case_disposal_report":
                data = fetchCaseDisposalData(request);
                break;
            case "organization_performance_report":
                data = fetchOrganizationPerformanceData(request);
                break;
            case "recovery_analysis_report":
                data = fetchRecoveryAnalysisData(request);
                break;
            case "reconciliation_report":
                data = fetchReconciliationData(request);
                break;
            default:
                throw new IllegalArgumentException("不支持的报表类型: " + request.getReportType());
        }
        
        // 应用数据限制
        if (request.getMaxRows() != null && data.size() > request.getMaxRows()) {
            data = data.subList(0, request.getMaxRows());
        }
        
        return data;
    }

    private byte[] generateExportFile(ReportExportRequest request, List<Map<String, Object>> data) throws IOException {
        String format = request.getFormat().toLowerCase();
        
        switch (format) {
            case "excel":
                return generateExcelFile(request, data);
            case "pdf":
                return generatePDFFile(request, data);
            case "csv":
                return generateCSVFile(request, data);
            case "json":
                return generateJSONFile(request, data);
            default:
                throw new IllegalArgumentException("不支持的导出格式: " + format);
        }
    }

    private byte[] generateExcelFile(ReportExportRequest request, List<Map<String, Object>> data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet(getReportTitle(request.getReportType()));
            
            // 创建标题样式
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            // 创建表头
            if (!data.isEmpty()) {
                Row headerRow = sheet.createRow(0);
                Map<String, Object> firstRow = data.get(0);
                int colIndex = 0;
                
                for (String key : firstRow.keySet()) {
                    Cell cell = headerRow.createCell(colIndex++);
                    cell.setCellValue(getColumnDisplayName(key));
                    cell.setCellStyle(headerStyle);
                }
                
                // 创建数据行
                for (int i = 0; i < data.size(); i++) {
                    Row dataRow = sheet.createRow(i + 1);
                    Map<String, Object> rowData = data.get(i);
                    colIndex = 0;
                    
                    for (String key : firstRow.keySet()) {
                        Cell cell = dataRow.createCell(colIndex++);
                        Object value = rowData.get(key);
                        setCellValue(cell, value);
                        cell.setCellStyle(dataStyle);
                    }
                }
                
                // 自动调整列宽
                for (int i = 0; i < firstRow.size(); i++) {
                    sheet.autoSizeColumn(i);
                }
            }
            
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private byte[] generatePDFFile(ReportExportRequest request, List<Map<String, Object>> data) {
        // TODO: 实现PDF导出
        // 使用PDFUtils生成PDF文件
        return pdfUtils.generateReportPDF(request.getReportType(), data);
    }

    private byte[] generateCSVFile(ReportExportRequest request, List<Map<String, Object>> data) {
        StringBuilder csv = new StringBuilder();
        
        if (!data.isEmpty()) {
            Map<String, Object> firstRow = data.get(0);
            
            // 创建表头
            String header = String.join(",", firstRow.keySet().stream()
                .map(this::getColumnDisplayName)
                .toArray(String[]::new));
            csv.append(header).append("\n");
            
            // 创建数据行
            for (Map<String, Object> row : data) {
                String dataRow = String.join(",", firstRow.keySet().stream()
                    .map(key -> formatCSVValue(row.get(key)))
                    .toArray(String[]::new));
                csv.append(dataRow).append("\n");
            }
        }
        
        return csv.toString().getBytes();
    }

    private byte[] generateJSONFile(ReportExportRequest request, List<Map<String, Object>> data) throws IOException {
        Map<String, Object> result = new HashMap<>();
        result.put("reportType", request.getReportType());
        result.put("generatedAt", LocalDateTime.now());
        result.put("recordCount", data.size());
        result.put("data", data);
        
        return objectMapper.writeValueAsBytes(result);
    }

    // 辅助方法

    private void updateExportStatus(String taskId, String status, String message, String downloadUrl, Integer recordCount) {
        String statusKey = EXPORT_CACHE_PREFIX + "status:" + taskId;
        ReportExportResponse response = (ReportExportResponse) redisTemplate.opsForValue().get(statusKey);
        
        if (response != null) {
            response.setStatus(status);
            response.setMessage(message);
            if (downloadUrl != null) response.setDownloadUrl(downloadUrl);
            if (recordCount != null) response.setRecordCount(recordCount);
            if ("COMPLETED".equals(status)) response.setCompletedAt(LocalDateTime.now());
            
            redisTemplate.opsForValue().set(statusKey, response, CACHE_EXPIRE_SECONDS, TimeUnit.SECONDS);
        }
    }

    private void updateExportStatus(String taskId, ReportExportResponse response) {
        String statusKey = EXPORT_CACHE_PREFIX + "status:" + taskId;
        redisTemplate.opsForValue().set(statusKey, response, CACHE_EXPIRE_SECONDS, TimeUnit.SECONDS);
    }

    private void updateExportFileInfo(String taskId, Long fileSize, LocalDateTime completedAt) {
        String statusKey = EXPORT_CACHE_PREFIX + "status:" + taskId;
        ReportExportResponse response = (ReportExportResponse) redisTemplate.opsForValue().get(statusKey);
        
        if (response != null) {
            response.setFileSize(fileSize);
            response.setCompletedAt(completedAt);
            redisTemplate.opsForValue().set(statusKey, response, CACHE_EXPIRE_SECONDS, TimeUnit.SECONDS);
        }
    }

    private void saveToUserHistory(Long userId, ReportExportResponse response) {
        String historyKey = EXPORT_CACHE_PREFIX + "history:" + userId + ":" + response.getTaskId();
        redisTemplate.opsForValue().set(historyKey, response, 7 * 24 * 3600, TimeUnit.SECONDS); // 保存7天
    }

    private String getReportTitle(String reportType) {
        Map<String, String> titleMap = Map.of(
            "case_disposal_report", "案件处置报表",
            "organization_performance_report", "机构业绩报表", 
            "recovery_analysis_report", "回款分析报表",
            "reconciliation_report", "对账单报表"
        );
        return titleMap.getOrDefault(reportType, "报表");
    }

    private String getColumnDisplayName(String columnKey) {
        // TODO: 实现字段显示名称映射
        return columnKey.replaceAll("([A-Z])", " $1").trim();
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else if (value instanceof LocalDateTime) {
            cell.setCellValue(((LocalDateTime) value).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        } else {
            cell.setCellValue(value.toString());
        }
    }

    private String formatCSVValue(Object value) {
        if (value == null) return "";
        String str = value.toString();
        if (str.contains(",") || str.contains("\"") || str.contains("\n")) {
            return "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }

    // 模拟数据获取方法 - 实际项目中应该调用相应的服务
    private List<Map<String, Object>> fetchCaseDisposalData(ReportExportRequest request) {
        // TODO: 实现案件处置数据获取
        return generateSampleData("case_disposal", 1000);
    }

    private List<Map<String, Object>> fetchOrganizationPerformanceData(ReportExportRequest request) {
        // TODO: 实现机构业绩数据获取
        return generateSampleData("org_performance", 500);
    }

    private List<Map<String, Object>> fetchRecoveryAnalysisData(ReportExportRequest request) {
        // TODO: 实现回款分析数据获取
        return generateSampleData("recovery_analysis", 800);
    }

    private List<Map<String, Object>> fetchReconciliationData(ReportExportRequest request) {
        // TODO: 实现对账单数据获取
        return generateSampleData("reconciliation", 300);
    }

    private List<Map<String, Object>> generateSampleData(String type, int count) {
        List<Map<String, Object>> data = new ArrayList<>();
        for (int i = 0; i < Math.min(count, 1000); i++) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", i + 1);
            row.put("name", "示例数据 " + (i + 1));
            row.put("amount", Math.random() * 100000);
            row.put("createdAt", LocalDateTime.now().minusDays((long) (Math.random() * 30)));
            data.add(row);
        }
        return data;
    }
}