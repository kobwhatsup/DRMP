package com.drmp.service.impl;

import com.drmp.dto.request.CaseBatchImportRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.BatchImportResponse;
import com.drmp.entity.Case;
import com.drmp.entity.CasePackage;
import com.drmp.exception.BusinessException;
import com.drmp.repository.CaseRepository;
import com.drmp.repository.CasePackageRepository;
import com.drmp.service.CaseBatchImportService;
import com.drmp.util.EncryptionUtils;
import com.drmp.util.ValidationUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Collections;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 案件批量导入服务实现
 * 提供Excel文件解析、数据验证、批量插入等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CaseBatchImportServiceImpl implements CaseBatchImportService {

    private final CaseRepository caseRepository;
    private final CasePackageRepository casePackageRepository;
    private final ObjectMapper objectMapper;
    private final EncryptionUtils encryptionUtils;
    private final ValidationUtils validationUtils;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(4);

    // 支持的文件类型
    private static final Set<String> SUPPORTED_FILE_TYPES = Set.of(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv" // .csv
    );

    // 必需字段映射
    private static final Map<String, String> REQUIRED_FIELDS = Map.of(
        "债务人姓名", "debtorName",
        "债务人身份证", "debtorIdCard", 
        "借款合同号", "loanContractNo",
        "借款金额", "loanAmount",
        "剩余金额", "remainingAmount",
        "逾期天数", "overdueDays"
    );

    // 可选字段映射 - Java 11兼容写法
    private static final Map<String, String> OPTIONAL_FIELDS;
    
    static {
        Map<String, String> optFields = new HashMap<>();
        optFields.put("债务人电话", "debtorPhone");
        optFields.put("债务人性别", "debtorGender");
        optFields.put("债务人年龄", "debtorAge");
        optFields.put("债务人省份", "debtorProvince");
        optFields.put("债务人城市", "debtorCity");
        optFields.put("债务人地址", "debtorAddress");
        optFields.put("产品线", "productLine");
        optFields.put("放款日期", "loanDate");
        optFields.put("到期日期", "dueDate");
        optFields.put("委托开始日期", "entrustStartDate");
        optFields.put("委托结束日期", "entrustEndDate");
        optFields.put("资金方", "fundingParty");
        optFields.put("联系人1姓名", "contact1Name");
        optFields.put("联系人1电话", "contact1Phone");
        optFields.put("联系人1关系", "contact1Relation");
        optFields.put("联系人2姓名", "contact2Name");
        optFields.put("联系人2电话", "contact2Phone");
        optFields.put("联系人2关系", "contact2Relation");
        OPTIONAL_FIELDS = Collections.unmodifiableMap(optFields);
    }

    // 数据验证规则
    private static final Pattern ID_CARD_PATTERN = Pattern.compile("^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");
    private static final Pattern GENDER_PATTERN = Pattern.compile("^[男女MF]$");

    @Override
    public BatchImportResponse validateCases(MultipartFile file) {
        return validateImportFile(file, null);
    }

    @Override
    public BatchImportResponse importCases(MultipartFile file, Long casePackageId) {
        return importCasesFromFile(file, casePackageId, false);
    }

    private BatchImportResponse validateImportFile(MultipartFile file, Long casePackageId) {
        log.info("Validating import file: {}, size: {}, package: {}", 
            file.getOriginalFilename(), file.getSize(), casePackageId);

        BatchImportResponse response = new BatchImportResponse();
        response.setStartTime(LocalDateTime.now());

        try {
            // 验证文件基本信息
            validateFileBasics(file);

            // 获取案件包信息
            CasePackage casePackage = getCasePackage(casePackageId);
            response.setCasePackageId(casePackageId);
            response.setCasePackageName(casePackage.getPackageName());

            // 解析Excel文件
            List<Map<String, Object>> rawData = parseExcelFile(file);
            response.setTotalRows(rawData.size());

            // 验证数据
            ValidationResult validationResult = validateData(rawData, casePackage);
            
            response.setValidRows(validationResult.getValidData().size());
            response.setInvalidRows(validationResult.getInvalidData().size());
            response.setDuplicateRows(validationResult.getDuplicateData().size());
            response.setValidationErrors(validationResult.getErrors());
            response.setValidationWarnings(validationResult.getWarnings());
            
            // 计算统计信息
            calculateStatistics(response, validationResult.getValidData());

            response.setSuccess(true);
            response.setMessage("文件验证完成");

        } catch (Exception e) {
            log.error("File validation failed", e);
            response.setSuccess(false);
            response.setMessage("文件验证失败: " + e.getMessage());
        } finally {
            response.setEndTime(LocalDateTime.now());
            response.setDurationMs(
                response.getEndTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() - 
                response.getStartTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
            );
        }

        return response;
    }

    @Transactional
    public BatchImportResponse importCasesFromFile(MultipartFile file, Long casePackageId, boolean skipErrors) {
        log.info("Importing cases from file: {}, package: {}, skipErrors: {}", 
            file.getOriginalFilename(), casePackageId, skipErrors);

        BatchImportResponse response = new BatchImportResponse();
        response.setStartTime(LocalDateTime.now());

        try {
            // 先进行验证
            BatchImportResponse validationResponse = validateImportFile(file, casePackageId);
            if (!validationResponse.getSuccess()) {
                return validationResponse;
            }

            // 如果有错误且不跳过错误，返回验证结果
            if (validationResponse.getInvalidRows() > 0 && !skipErrors) {
                validationResponse.setMessage("存在数据错误，请修复后重新导入，或选择跳过错误");
                return validationResponse;
            }

            // 获取案件包
            CasePackage casePackage = getCasePackage(casePackageId);
            
            // 解析和验证数据
            List<Map<String, Object>> rawData = parseExcelFile(file);
            ValidationResult validationResult = validateData(rawData, casePackage);

            // 批量创建案件
            List<Case> cases = createCasesFromValidData(validationResult.getValidData(), casePackage);
            
            // 分批保存到数据库
            List<Case> savedCases = batchSaveCases(cases);

            // 更新案件包统计
            updateCasePackageStatistics(casePackage, savedCases);

            // 设置响应数据
            response.setCasePackageId(casePackageId);
            response.setCasePackageName(casePackage.getPackageName());
            response.setTotalRows(rawData.size());
            response.setValidRows(savedCases.size());
            response.setInvalidRows(validationResult.getInvalidData().size());
            response.setDuplicateRows(validationResult.getDuplicateData().size());
            response.setImportedRows(savedCases.size());
            response.setValidationErrors(validationResult.getErrors());
            response.setValidationWarnings(validationResult.getWarnings());
            
            calculateStatistics(response, validationResult.getValidData());

            response.setSuccess(true);
            response.setMessage(String.format("成功导入 %d 条案件", savedCases.size()));

            log.info("Successfully imported {} cases for package {}", savedCases.size(), casePackageId);

        } catch (Exception e) {
            log.error("Case import failed", e);
            response.setSuccess(false);
            response.setMessage("导入失败: " + e.getMessage());
            throw new BusinessException("案件导入失败", e);
        } finally {
            response.setEndTime(LocalDateTime.now());
            response.setDurationMs(
                response.getEndTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() - 
                response.getStartTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
            );
        }

        return response;
    }

    @Override
    public byte[] getImportTemplate() {
        
        try {
            // 创建模板工作簿
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("案件导入模板");

            // 创建表头
            Row headerRow = sheet.createRow(0);
            List<String> headers = new ArrayList<>();
            headers.addAll(REQUIRED_FIELDS.keySet());
            headers.addAll(OPTIONAL_FIELDS.keySet());

            CellStyle headerStyle = createHeaderCellStyle(workbook);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
                
                // 设置必需字段为红色
                if (REQUIRED_FIELDS.containsKey(headers.get(i))) {
                    CellStyle requiredStyle = createRequiredHeaderCellStyle(workbook);
                    cell.setCellStyle(requiredStyle);
                }
            }

            // 创建示例数据行
            Row exampleRow = sheet.createRow(1);
            String[] exampleData = {
                "张三", "110101199001011234", "13800138000", "男", "30",
                "北京市", "朝阳区", "朝阳区某某路某某号",
                "LC202401001", "个人消费贷", "100000", "80000", "90",
                "2024-01-01", "2024-12-31", "2024-01-01", "2024-12-31",
                "某银行", "李四", "13900139000", "配偶", "王五", "13700137000", "朋友"
            };
            
            for (int i = 0; i < exampleData.length && i < headers.size(); i++) {
                exampleRow.createCell(i).setCellValue(exampleData[i]);
            }

            // 自动调整列宽
            for (int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            // 创建说明sheet
            createInstructionSheet(workbook);

            // 转换为字节数组
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate import template", e);
            return new byte[0];
        }
    }


    // 私有方法实现

    private void validateFileBasics(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }

        if (!SUPPORTED_FILE_TYPES.contains(file.getContentType())) {
            throw new BusinessException("不支持的文件类型，请使用 .xlsx 或 .xls 格式");
        }

        // 文件大小限制 50MB
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new BusinessException("文件大小不能超过 50MB");
        }
    }

    private CasePackage getCasePackage(Long casePackageId) {
        return casePackageRepository.findById(casePackageId)
            .orElseThrow(() -> new BusinessException("案件包不存在"));
    }

    private List<Map<String, Object>> parseExcelFile(MultipartFile file) throws IOException {
        List<Map<String, Object>> data = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // 读取表头
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new BusinessException("Excel文件表头不能为空");
            }

            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(getCellValue(cell));
            }

            // 验证必需字段
            validateRequiredHeaders(headers);

            // 读取数据行
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) {
                    continue;
                }

                Map<String, Object> rowData = new HashMap<>();
                rowData.put("rowNumber", i + 1);

                for (int j = 0; j < headers.size() && j < row.getLastCellNum(); j++) {
                    Cell cell = row.getCell(j);
                    String header = headers.get(j);
                    String value = getCellValue(cell);
                    
                    if (value != null && !value.trim().isEmpty()) {
                        rowData.put(header, value.trim());
                    }
                }

                data.add(rowData);
            }
        }

        log.info("Parsed {} rows from Excel file", data.size());
        return data;
    }

    private void validateRequiredHeaders(List<String> headers) {
        Set<String> missingHeaders = new HashSet<>(REQUIRED_FIELDS.keySet());
        missingHeaders.removeAll(headers);
        
        if (!missingHeaders.isEmpty()) {
            throw new BusinessException("缺少必需的字段: " + String.join(", ", missingHeaders));
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) {
            return null;
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }

    private boolean isEmptyRow(Row row) {
        for (Cell cell : row) {
            String value = getCellValue(cell);
            if (value != null && !value.trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private ValidationResult validateData(List<Map<String, Object>> rawData, CasePackage casePackage) {
        ValidationResult result = new ValidationResult();
        Set<String> seenContracts = new HashSet<>();
        Set<String> seenIdCards = new HashSet<>();

        for (Map<String, Object> rowData : rawData) {
            int rowNumber = (Integer) rowData.get("rowNumber");
            List<String> rowErrors = new ArrayList<>();
            List<String> rowWarnings = new ArrayList<>();

            try {
                // 验证必需字段
                validateRequiredFields(rowData, rowErrors);

                // 验证数据格式
                validateDataFormats(rowData, rowErrors, rowWarnings);

                // 验证业务规则
                validateBusinessRules(rowData, rowErrors, rowWarnings);

                // 检查重复数据
                checkDuplicates(rowData, seenContracts, seenIdCards, rowErrors);

                if (rowErrors.isEmpty()) {
                    result.getValidData().add(rowData);
                } else {
                    result.getInvalidData().add(rowData);
                    result.getErrors().put(rowNumber, rowErrors);
                }

                if (!rowWarnings.isEmpty()) {
                    result.getWarnings().put(rowNumber, rowWarnings);
                }

            } catch (Exception e) {
                log.error("Error validating row {}", rowNumber, e);
                result.getInvalidData().add(rowData);
                result.getErrors().put(rowNumber, List.of("数据验证异常: " + e.getMessage()));
            }
        }

        log.info("Validation completed: {} valid, {} invalid, {} duplicates", 
            result.getValidData().size(), result.getInvalidData().size(), result.getDuplicateData().size());

        return result;
    }

    private void validateRequiredFields(Map<String, Object> rowData, List<String> errors) {
        for (String chineseField : REQUIRED_FIELDS.keySet()) {
            Object value = rowData.get(chineseField);
            if (value == null || value.toString().trim().isEmpty()) {
                errors.add(chineseField + " 不能为空");
            }
        }
    }

    private void validateDataFormats(Map<String, Object> rowData, List<String> errors, List<String> warnings) {
        // 验证身份证格式
        Object idCard = rowData.get("债务人身份证");
        if (idCard != null && !ValidationUtils.isValidIdCard(idCard.toString())) {
            errors.add("身份证格式不正确");
        }

        // 验证手机号格式
        Object phone = rowData.get("债务人电话");
        if (phone != null && !phone.toString().isEmpty() && !PHONE_PATTERN.matcher(phone.toString()).matches()) {
            warnings.add("手机号格式可能不正确");
        }

        // 验证金额格式
        validateAmountField(rowData, "借款金额", errors);
        validateAmountField(rowData, "剩余金额", errors);

        // 验证逾期天数
        Object overdueDays = rowData.get("逾期天数");
        if (overdueDays != null) {
            try {
                int days = Integer.parseInt(overdueDays.toString());
                if (days < 0) {
                    errors.add("逾期天数不能为负数");
                }
            } catch (NumberFormatException e) {
                errors.add("逾期天数必须为数字");
            }
        }

        // 验证性别
        Object gender = rowData.get("债务人性别");
        if (gender != null && !gender.toString().isEmpty() && !GENDER_PATTERN.matcher(gender.toString()).matches()) {
            warnings.add("性别格式不标准，建议使用'男'或'女'");
        }
    }

    private void validateAmountField(Map<String, Object> rowData, String fieldName, List<String> errors) {
        Object amount = rowData.get(fieldName);
        if (amount != null) {
            try {
                BigDecimal value = new BigDecimal(amount.toString());
                if (value.compareTo(BigDecimal.ZERO) <= 0) {
                    errors.add(fieldName + " 必须大于0");
                }
                if (value.compareTo(new BigDecimal("99999999.99")) > 0) {
                    errors.add(fieldName + " 不能超过99,999,999.99");
                }
            } catch (NumberFormatException e) {
                errors.add(fieldName + " 格式不正确");
            }
        }
    }

    private void validateBusinessRules(Map<String, Object> rowData, List<String> errors, List<String> warnings) {
        // 验证借款金额 >= 剩余金额
        Object loanAmount = rowData.get("借款金额");
        Object remainingAmount = rowData.get("剩余金额");
        
        if (loanAmount != null && remainingAmount != null) {
            try {
                BigDecimal loan = new BigDecimal(loanAmount.toString());
                BigDecimal remaining = new BigDecimal(remainingAmount.toString());
                
                if (remaining.compareTo(loan) > 0) {
                    errors.add("剩余金额不能大于借款金额");
                }
            } catch (NumberFormatException e) {
                // 金额格式验证在其他地方处理
            }
        }

        // 验证日期逻辑
        validateDateLogic(rowData, errors, warnings);
    }

    private void validateDateLogic(Map<String, Object> rowData, List<String> errors, List<String> warnings) {
        try {
            Object loanDate = rowData.get("放款日期");
            Object dueDate = rowData.get("到期日期");
            Object entrustStart = rowData.get("委托开始日期");
            Object entrustEnd = rowData.get("委托结束日期");

            LocalDate loan = loanDate != null ? LocalDate.parse(loanDate.toString()) : null;
            LocalDate due = dueDate != null ? LocalDate.parse(dueDate.toString()) : null;
            LocalDate start = entrustStart != null ? LocalDate.parse(entrustStart.toString()) : null;
            LocalDate end = entrustEnd != null ? LocalDate.parse(entrustEnd.toString()) : null;

            if (loan != null && due != null && loan.isAfter(due)) {
                errors.add("放款日期不能晚于到期日期");
            }

            if (start != null && end != null && start.isAfter(end)) {
                errors.add("委托开始日期不能晚于委托结束日期");
            }

            if (due != null && start != null && due.isAfter(start)) {
                warnings.add("到期日期晚于委托开始日期，请确认是否正确");
            }

        } catch (Exception e) {
            warnings.add("日期格式可能不正确，请使用 YYYY-MM-DD 格式");
        }
    }

    private void checkDuplicates(Map<String, Object> rowData, Set<String> seenContracts, 
                                Set<String> seenIdCards, List<String> errors) {
        Object contractNo = rowData.get("借款合同号");
        Object idCard = rowData.get("债务人身份证");

        if (contractNo != null) {
            String contract = contractNo.toString();
            if (seenContracts.contains(contract)) {
                errors.add("借款合同号重复: " + contract);
            } else {
                seenContracts.add(contract);
            }
        }

        if (idCard != null) {
            String id = idCard.toString();
            if (seenIdCards.contains(id)) {
                errors.add("债务人身份证重复: " + id);
            } else {
                seenIdCards.add(id);
            }
        }
    }

    private List<Case> createCasesFromValidData(List<Map<String, Object>> validData, CasePackage casePackage) {
        return validData.parallelStream().map(rowData -> {
            Case caseEntity = new Case();
            
            // 基本信息
            caseEntity.setCasePackage(casePackage);
            caseEntity.setCaseNo(generateCaseNo(casePackage));
            
            // 债务人信息（加密存储）
            caseEntity.setDebtorNameEncrypted(encryptionUtils.encrypt(rowData.get("债务人姓名").toString()));
            caseEntity.setDebtorIdCardEncrypted(encryptionUtils.encrypt(rowData.get("债务人身份证").toString()));
            
            Object phone = rowData.get("债务人电话");
            if (phone != null) {
                caseEntity.setDebtorPhoneEncrypted(encryptionUtils.encrypt(phone.toString()));
            }
            
            caseEntity.setDebtorGender(getString(rowData, "债务人性别"));
            
            // 借款信息
            caseEntity.setLoanContractNo(rowData.get("借款合同号").toString());
            caseEntity.setLoanProduct(getString(rowData, "产品线"));
            caseEntity.setLoanAmount(getBigDecimal(rowData, "借款金额"));
            caseEntity.setRemainingAmount(getBigDecimal(rowData, "剩余金额"));
            caseEntity.setOverdueDays(getInteger(rowData, "逾期天数"));
            
            // 其他信息存储为JSON
            Map<String, Object> debtorInfo = new HashMap<>();
            debtorInfo.put("age", getInteger(rowData, "债务人年龄"));
            debtorInfo.put("province", getString(rowData, "债务人省份"));
            debtorInfo.put("city", getString(rowData, "债务人城市"));
            debtorInfo.put("address", getString(rowData, "债务人地址"));
            
            Map<String, Object> contactInfo = new HashMap<>();
            contactInfo.put("contact1Name", getString(rowData, "联系人1姓名"));
            contactInfo.put("contact1Phone", getString(rowData, "联系人1电话"));
            contactInfo.put("contact1Relation", getString(rowData, "联系人1关系"));
            contactInfo.put("contact2Name", getString(rowData, "联系人2姓名"));
            contactInfo.put("contact2Phone", getString(rowData, "联系人2电话"));
            contactInfo.put("contact2Relation", getString(rowData, "联系人2关系"));
            
            try {
                caseEntity.setDebtorInfo(objectMapper.writeValueAsString(debtorInfo));
                caseEntity.setContactInfo(objectMapper.writeValueAsString(contactInfo));
            } catch (Exception e) {
                log.error("Failed to serialize case data", e);
            }
            
            // 设置状态和时间
            // Case entity should have a status field of type String
            caseEntity.setStatus(com.drmp.entity.enums.CaseStatus.PENDING.getCode());
            caseEntity.setCreatedAt(LocalDateTime.now());
            caseEntity.setCreatedBy(1L); // TODO: 从安全上下文获取
            
            return caseEntity;
        }).collect(Collectors.toList());
    }

    private List<Case> batchSaveCases(List<Case> cases) {
        List<Case> savedCases = new ArrayList<>();
        int batchSize = 1000;
        
        for (int i = 0; i < cases.size(); i += batchSize) {
            int end = Math.min(i + batchSize, cases.size());
            List<Case> batch = cases.subList(i, end);
            
            List<Case> savedBatch = caseRepository.saveAll(batch);
            savedCases.addAll(savedBatch);
            
            log.info("Saved batch {}-{} of {} cases", i + 1, end, cases.size());
        }
        
        return savedCases;
    }

    private void updateCasePackageStatistics(CasePackage casePackage, List<Case> cases) {
        casePackage.setCaseCount(casePackage.getCaseCount() + cases.size());
        
        BigDecimal totalAmount = cases.stream()
            .map(Case::getRemainingAmount)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        casePackage.setTotalAmount(casePackage.getTotalAmount().add(totalAmount));
        casePackage.setRemainingAmount(casePackage.getRemainingAmount().add(totalAmount));
        
        casePackageRepository.save(casePackage);
    }

    private void calculateStatistics(BatchImportResponse response, List<Map<String, Object>> validData) {
        if (validData.isEmpty()) {
            return;
        }

        BigDecimal totalLoanAmount = BigDecimal.ZERO;
        BigDecimal totalRemainingAmount = BigDecimal.ZERO;
        int totalOverdueDays = 0;

        for (Map<String, Object> data : validData) {
            totalLoanAmount = totalLoanAmount.add(getBigDecimal(data, "借款金额"));
            totalRemainingAmount = totalRemainingAmount.add(getBigDecimal(data, "剩余金额"));
            totalOverdueDays += getInteger(data, "逾期天数");
        }

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalLoanAmount", totalLoanAmount);
        statistics.put("totalRemainingAmount", totalRemainingAmount);
        statistics.put("avgLoanAmount", totalLoanAmount.divide(BigDecimal.valueOf(validData.size()), 2, java.math.RoundingMode.HALF_UP));
        statistics.put("avgRemainingAmount", totalRemainingAmount.divide(BigDecimal.valueOf(validData.size()), 2, java.math.RoundingMode.HALF_UP));
        statistics.put("avgOverdueDays", totalOverdueDays / validData.size());

        response.setStatistics(statistics);
    }

    // 工具方法
    private String generateCaseNo(CasePackage casePackage) {
        return String.format("%s-%06d", casePackage.getPackageCode(), 
            casePackage.getCaseCount() + 1);
    }

    private String getString(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value != null ? value.toString() : null;
    }

    private Integer getInteger(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) return null;
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal getBigDecimal(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) return BigDecimal.ZERO;
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private CellStyle createHeaderCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle createRequiredHeaderCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.RED.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private void createInstructionSheet(Workbook workbook) {
        Sheet instructionSheet = workbook.createSheet("导入说明");
        
        String[] instructions = {
            "案件批量导入说明：",
            "",
            "1. 必填字段（红色标注）：",
            "   - 债务人姓名：债务人真实姓名",
            "   - 债务人身份证：18位身份证号码",
            "   - 借款合同号：唯一的合同编号",
            "   - 借款金额：原始借款金额，单位：元",
            "   - 剩余金额：当前剩余未还金额，单位：元",
            "   - 逾期天数：从逾期日开始计算的天数",
            "",
            "2. 选填字段：",
            "   - 债务人电话：11位手机号码",
            "   - 债务人性别：男/女",
            "   - 债务人年龄：数字",
            "   - 地址信息：省份、城市、详细地址",
            "   - 产品线：贷款产品类型",
            "   - 日期字段：格式为 YYYY-MM-DD",
            "   - 联系人信息：最多2个联系人",
            "",
            "3. 数据验证规则：",
            "   - 身份证号码必须符合18位格式",
            "   - 手机号码为11位数字",
            "   - 金额必须大于0",
            "   - 剩余金额不能大于借款金额",
            "   - 放款日期不能晚于到期日期",
            "   - 同一文件中不能有重复的合同号或身份证",
            "",
            "4. 注意事项：",
            "   - 单次最多导入50,000条记录",
            "   - 文件大小不超过50MB",
            "   - 支持.xlsx和.xls格式",
            "   - 敏感信息将自动加密存储",
            "   - 导入前会进行数据验证",
            "   - 可选择跳过错误数据继续导入"
        };

        for (int i = 0; i < instructions.length; i++) {
            Row row = instructionSheet.createRow(i);
            Cell cell = row.createCell(0);
            cell.setCellValue(instructions[i]);
        }

        instructionSheet.autoSizeColumn(0);
    }

    // 内部类
    private static class ValidationResult {
        private final List<Map<String, Object>> validData = new ArrayList<>();
        private final List<Map<String, Object>> invalidData = new ArrayList<>();
        private final List<Map<String, Object>> duplicateData = new ArrayList<>();
        private final Map<Integer, List<String>> errors = new HashMap<>();
        private final Map<Integer, List<String>> warnings = new HashMap<>();

        // Getters
        public List<Map<String, Object>> getValidData() { return validData; }
        public List<Map<String, Object>> getInvalidData() { return invalidData; }
        public List<Map<String, Object>> getDuplicateData() { return duplicateData; }
        public Map<Integer, List<String>> getErrors() { return errors; }
        public Map<Integer, List<String>> getWarnings() { return warnings; }
    }
}