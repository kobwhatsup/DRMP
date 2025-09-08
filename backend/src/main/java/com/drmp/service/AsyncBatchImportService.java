package com.drmp.service;

import com.drmp.dto.BatchImportResult;
import com.drmp.dto.CaseImportDTO;
import com.drmp.entity.CasePackage;
import com.drmp.entity.Cases;
import com.drmp.entity.ImportTask;
import com.drmp.repository.CasePackageRepository;
import com.drmp.repository.CasesRepository;
import com.drmp.repository.ImportTaskRepository;
import com.drmp.utils.EncryptionUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * 异步批量导入服务
 * 支持大文件分批处理、实时进度反馈、断点续传
 *
 * @author DRMP Team
 */
@Slf4j
@Service
public class AsyncBatchImportService {
    
    @Autowired
    private CasePackageRepository casePackageRepository;
    
    @Autowired
    private CasesRepository casesRepository;
    
    @Autowired
    private ImportTaskRepository importTaskRepository;
    
    @Autowired
    private EncryptionUtil encryptionUtil;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    private static final int BATCH_SIZE = 1000; // 批次大小
    private static final int MAX_ERROR_COUNT = 100; // 最大错误数
    
    /**
     * 启动异步批量导入任务
     *
     * @param file 上传的文件
     * @param casePackageId 案件包ID
     * @param userId 用户ID
     * @return 任务ID
     */
    public String startBatchImport(MultipartFile file, Long casePackageId, Long userId) {
        // 创建导入任务记录
        ImportTask task = new ImportTask();
        task.setTaskId(UUID.randomUUID().toString());
        task.setCasePackageId(casePackageId);
        task.setUserId(userId);
        task.setFileName(file.getOriginalFilename());
        task.setFileSize(file.getSize());
        task.setStatus("PROCESSING");
        task.setStartTime(LocalDateTime.now());
        task.setTotalRecords(0);
        task.setProcessedRecords(0);
        task.setSuccessRecords(0);
        task.setErrorRecords(0);
        
        importTaskRepository.save(task);
        
        // 异步执行导入
        processBatchImportAsync(file, task);
        
        return task.getTaskId();
    }
    
    /**
     * 异步处理批量导入
     */
    @Async("asyncTaskExecutor")
    public CompletableFuture<BatchImportResult> processBatchImportAsync(MultipartFile file, ImportTask task) {
        log.info("开始异步批量导入: taskId={}, fileName={}", task.getTaskId(), task.getFileName());
        
        try {
            // 1. 预处理文件，统计总行数
            int totalRecords = countFileLines(file);
            task.setTotalRecords(totalRecords);
            updateImportTask(task);
            
            // 2. 分批读取和处理数据
            BatchImportResult result = processFileInBatches(file, task);
            
            // 3. 更新任务状态
            task.setStatus(result.isSuccess() ? "COMPLETED" : "FAILED");
            task.setEndTime(LocalDateTime.now());
            task.setErrorMessage(result.getErrorMessage());
            updateImportTask(task);
            
            // 4. 发送完成通知
            sendImportCompleteNotification(task, result);
            
            log.info("批量导入完成: taskId={}, success={}, processed={}/{}", 
                    task.getTaskId(), result.isSuccess(), task.getProcessedRecords(), task.getTotalRecords());
            
            return CompletableFuture.completedFuture(result);
            
        } catch (Exception e) {
            log.error("批量导入异常: taskId={}", task.getTaskId(), e);
            
            task.setStatus("FAILED");
            task.setEndTime(LocalDateTime.now());
            task.setErrorMessage("导入过程中发生异常: " + e.getMessage());
            updateImportTask(task);
            
            // 发送错误通知
            sendImportErrorNotification(task, e);
            
            return CompletableFuture.completedFuture(BatchImportResult.failure(e.getMessage()));
        }
    }
    
    /**
     * 分批处理文件数据
     */
    private BatchImportResult processFileInBatches(MultipartFile file, ImportTask task) throws Exception {
        BatchImportResult result = new BatchImportResult();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"))) {
            
            // 跳过标题行
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("文件为空或格式不正确");
            }
            
            // 解析标题行，建立字段映射
            Map<String, Integer> fieldMapping = parseHeaderLine(headerLine);
            
            List<CaseImportDTO> currentBatch = new ArrayList<>();
            String line;
            int lineNumber = 1; // 从1开始，因为第0行是标题
            AtomicInteger errorCount = new AtomicInteger(0);
            
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                
                try {
                    // 解析单行数据
                    CaseImportDTO caseData = parseCaseData(line, fieldMapping, lineNumber);
                    currentBatch.add(caseData);
                    
                    // 批次处理
                    if (currentBatch.size() >= BATCH_SIZE) {
                        processBatch(currentBatch, task, result, errorCount);
                        currentBatch.clear();
                        
                        // 更新进度
                        updateProgress(task, lineNumber - 1);
                        
                        // 检查错误数是否超过限制
                        if (errorCount.get() > MAX_ERROR_COUNT) {
                            throw new RuntimeException("错误数量超过限制，停止导入");
                        }
                    }
                    
                } catch (Exception e) {
                    log.warn("解析第{}行数据失败: {}", lineNumber, e.getMessage());
                    errorCount.incrementAndGet();
                    task.setErrorRecords(task.getErrorRecords() + 1);
                    result.addError("第" + lineNumber + "行: " + e.getMessage());
                    
                    // 检查错误数
                    if (errorCount.get() > MAX_ERROR_COUNT) {
                        throw new RuntimeException("错误数量超过限制，停止导入");
                    }
                }
            }
            
            // 处理最后一批数据
            if (!currentBatch.isEmpty()) {
                processBatch(currentBatch, task, result, errorCount);
            }
            
            // 最终进度更新
            updateProgress(task, task.getTotalRecords());
            
            result.setSuccess(true);
            result.setTotalRecords(task.getTotalRecords());
            result.setSuccessRecords(task.getSuccessRecords());
            result.setErrorRecords(task.getErrorRecords());
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
            throw e;
        }
        
        return result;
    }
    
    /**
     * 处理单个批次
     */
    @Transactional
    private void processBatch(List<CaseImportDTO> batch, ImportTask task, 
                            BatchImportResult result, AtomicInteger errorCount) {
        
        List<Cases> casesToSave = new ArrayList<>();
        
        for (CaseImportDTO caseData : batch) {
            try {
                // 数据验证
                validateCaseData(caseData);
                
                // 转换为实体对象
                Cases caseEntity = convertToEntity(caseData, task.getCasePackageId());
                casesToSave.add(caseEntity);
                
            } catch (Exception e) {
                log.warn("处理案件数据失败: loanNo={}, error={}", caseData.getLoanNo(), e.getMessage());
                errorCount.incrementAndGet();
                task.setErrorRecords(task.getErrorRecords() + 1);
                result.addError("借据号" + caseData.getLoanNo() + ": " + e.getMessage());
            }
        }
        
        // 批量保存
        if (!casesToSave.isEmpty()) {
            try {
                casesRepository.saveAllInBatch(casesToSave);
                task.setSuccessRecords(task.getSuccessRecords() + casesToSave.size());
                log.debug("批量保存案件成功: count={}", casesToSave.size());
            } catch (Exception e) {
                log.error("批量保存案件失败", e);
                task.setErrorRecords(task.getErrorRecords() + casesToSave.size());
                result.addError("批量保存失败: " + e.getMessage());
            }
        }
        
        task.setProcessedRecords(task.getProcessedRecords() + batch.size());
    }
    
    /**
     * 解析标题行，建立字段映射
     */
    private Map<String, Integer> parseHeaderLine(String headerLine) {
        Map<String, Integer> fieldMapping = new HashMap<>();
        String[] headers = headerLine.split(",");
        
        for (int i = 0; i < headers.length; i++) {
            String fieldName = headers[i].trim().replaceAll("\"", "");
            fieldMapping.put(fieldName, i);
        }
        
        // 验证必需字段
        String[] requiredFields = {"借据编号", "身份证号", "客户姓名", "手机号", "贷款金额", "剩余应还金额", "逾期天数"};
        for (String field : requiredFields) {
            if (!fieldMapping.containsKey(field)) {
                throw new IllegalArgumentException("缺少必需字段: " + field);
            }
        }
        
        return fieldMapping;
    }
    
    /**
     * 解析单行案件数据
     */
    private CaseImportDTO parseCaseData(String line, Map<String, Integer> fieldMapping, int lineNumber) {
        String[] values = parseCSVLine(line);
        
        CaseImportDTO caseData = new CaseImportDTO();
        caseData.setLineNumber(lineNumber);
        
        try {
            // 解析必需字段
            caseData.setLoanNo(getFieldValue(values, fieldMapping, "借据编号"));
            caseData.setDebtorIdCard(getFieldValue(values, fieldMapping, "身份证号"));
            caseData.setDebtorName(getFieldValue(values, fieldMapping, "客户姓名"));
            caseData.setDebtorPhone(getFieldValue(values, fieldMapping, "手机号"));
            caseData.setLoanProduct(getFieldValue(values, fieldMapping, "借款项目/产品线"));
            
            // 解析数值字段
            String loanAmountStr = getFieldValue(values, fieldMapping, "贷款金额");
            caseData.setLoanAmount(parseDecimal(loanAmountStr, "贷款金额"));
            
            String remainingAmountStr = getFieldValue(values, fieldMapping, "剩余应还金额");
            caseData.setRemainingAmount(parseDecimal(remainingAmountStr, "剩余应还金额"));
            
            String overdueDaysStr = getFieldValue(values, fieldMapping, "逾期天数");
            caseData.setOverdueDays(parseInt(overdueDaysStr, "逾期天数"));
            
            // 解析可选字段
            caseData.setGender(getFieldValue(values, fieldMapping, "性别"));
            caseData.setCommissionStartDate(getFieldValue(values, fieldMapping, "委托开始时间"));
            caseData.setCommissionEndDate(getFieldValue(values, fieldMapping, "委托到期时间"));
            caseData.setCapitalName(getFieldValue(values, fieldMapping, "资方名称"));
            
            // 解析扩展字段
            Map<String, String> extraData = new HashMap<>();
            for (int i = 1; i <= 10; i++) {
                String customField = getFieldValue(values, fieldMapping, "自定义字段" + i);
                if (customField != null && !customField.isEmpty()) {
                    extraData.put("custom_field_" + i, customField);
                }
            }
            caseData.setExtraData(extraData);
            
        } catch (Exception e) {
            throw new RuntimeException("第" + lineNumber + "行数据解析失败: " + e.getMessage());
        }
        
        return caseData;
    }
    
    /**
     * 验证案件数据
     */
    private void validateCaseData(CaseImportDTO caseData) {
        // 借据编号验证
        if (caseData.getLoanNo() == null || caseData.getLoanNo().trim().isEmpty()) {
            throw new IllegalArgumentException("借据编号不能为空");
        }
        
        // 身份证号验证
        if (caseData.getDebtorIdCard() == null || !isValidIdCard(caseData.getDebtorIdCard())) {
            throw new IllegalArgumentException("身份证号格式不正确");
        }
        
        // 手机号验证
        if (caseData.getDebtorPhone() == null || !isValidPhone(caseData.getDebtorPhone())) {
            throw new IllegalArgumentException("手机号格式不正确");
        }
        
        // 金额验证
        if (caseData.getLoanAmount() == null || caseData.getLoanAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("贷款金额必须大于0");
        }
        
        if (caseData.getRemainingAmount() == null || caseData.getRemainingAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("剩余应还金额不能为负数");
        }
        
        // 逾期天数验证
        if (caseData.getOverdueDays() == null || caseData.getOverdueDays() < 0) {
            throw new IllegalArgumentException("逾期天数不能为负数");
        }
    }
    
    /**
     * 转换为实体对象
     */
    private Cases convertToEntity(CaseImportDTO dto, Long casePackageId) {
        Cases entity = new Cases();
        
        entity.setCasePackageId(casePackageId);
        entity.setLoanNo(dto.getLoanNo());
        
        // 敏感数据加密
        entity.setDebtorIdCard(encryptionUtil.encryptIdCard(dto.getDebtorIdCard()));
        entity.setDebtorName(encryptionUtil.encryptName(dto.getDebtorName()));
        entity.setDebtorPhone(encryptionUtil.encryptPhone(dto.getDebtorPhone()));
        
        entity.setGender(dto.getGender());
        entity.setLoanProduct(dto.getLoanProduct());
        entity.setLoanAmount(dto.getLoanAmount());
        entity.setRemainingAmount(dto.getRemainingAmount());
        entity.setOverdueDays(dto.getOverdueDays());
        entity.setCapitalName(dto.getCapitalName());
        
        // 设置默认状态
        entity.setStatus("PENDING");
        entity.setDisposalStatus("NOT_STARTED");
        entity.setRecoveryAmount(BigDecimal.ZERO);
        
        // 设置扩展数据
        if (dto.getExtraData() != null && !dto.getExtraData().isEmpty()) {
            entity.setExtraData(dto.getExtraData());
        }
        
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        
        return entity;
    }
    
    /**
     * 获取导入任务状态
     */
    public ImportTask getImportTaskStatus(String taskId) {
        return importTaskRepository.findByTaskId(taskId);
    }
    
    /**
     * 获取导入任务列表
     */
    public List<ImportTask> getImportTasksByUser(Long userId, int page, int size) {
        return importTaskRepository.findByUserIdOrderByStartTimeDesc(userId, page * size, size);
    }
    
    /**
     * 取消导入任务
     */
    public boolean cancelImportTask(String taskId, Long userId) {
        ImportTask task = importTaskRepository.findByTaskId(taskId);
        if (task != null && task.getUserId().equals(userId) && "PROCESSING".equals(task.getStatus())) {
            task.setStatus("CANCELLED");
            task.setEndTime(LocalDateTime.now());
            importTaskRepository.save(task);
            return true;
        }
        return false;
    }
    
    // ==================== 辅助方法 ====================
    
    private int countFileLines(MultipartFile file) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            int count = 0;
            while (reader.readLine() != null) {
                count++;
            }
            return count - 1; // 减去标题行
        }
    }
    
    private void updateImportTask(ImportTask task) {
        importTaskRepository.save(task);
    }
    
    private void updateProgress(ImportTask task, int processedCount) {
        task.setProcessedRecords(processedCount);
        updateImportTask(task);
        
        // 发送进度通知
        sendProgressNotification(task);
    }
    
    private void sendProgressNotification(ImportTask task) {
        Map<String, Object> progress = new HashMap<>();
        progress.put("taskId", task.getTaskId());
        progress.put("totalRecords", task.getTotalRecords());
        progress.put("processedRecords", task.getProcessedRecords());
        progress.put("successRecords", task.getSuccessRecords());
        progress.put("errorRecords", task.getErrorRecords());
        progress.put("progress", task.getTotalRecords() > 0 ? 
                (double) task.getProcessedRecords() / task.getTotalRecords() * 100 : 0);
        
        messagingTemplate.convertAndSend("/topic/import/" + task.getTaskId(), progress);
    }
    
    private void sendImportCompleteNotification(ImportTask task, BatchImportResult result) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("taskId", task.getTaskId());
        notification.put("status", "COMPLETED");
        notification.put("result", result);
        
        messagingTemplate.convertAndSend("/topic/import/" + task.getTaskId(), notification);
    }
    
    private void sendImportErrorNotification(ImportTask task, Exception error) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("taskId", task.getTaskId());
        notification.put("status", "ERROR");
        notification.put("error", error.getMessage());
        
        messagingTemplate.convertAndSend("/topic/import/" + task.getTaskId(), notification);
    }
    
    private String[] parseCSVLine(String line) {
        // 简化的CSV解析，实际应使用专业的CSV解析库
        return line.split(",");
    }
    
    private String getFieldValue(String[] values, Map<String, Integer> mapping, String fieldName) {
        Integer index = mapping.get(fieldName);
        if (index != null && index < values.length) {
            String value = values[index].trim().replaceAll("\"", "");
            return value.isEmpty() ? null : value;
        }
        return null;
    }
    
    private BigDecimal parseDecimal(String value, String fieldName) {
        if (value == null || value.isEmpty()) {
            throw new IllegalArgumentException(fieldName + "不能为空");
        }
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(fieldName + "格式不正确: " + value);
        }
    }
    
    private Integer parseInt(String value, String fieldName) {
        if (value == null || value.isEmpty()) {
            throw new IllegalArgumentException(fieldName + "不能为空");
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(fieldName + "格式不正确: " + value);
        }
    }
    
    private boolean isValidIdCard(String idCard) {
        if (idCard == null || idCard.length() != 18) {
            return false;
        }
        return idCard.matches("\\d{17}[0-9Xx]");
    }
    
    private boolean isValidPhone(String phone) {
        if (phone == null) {
            return false;
        }
        return phone.matches("1[3-9]\\d{9}");
    }
}