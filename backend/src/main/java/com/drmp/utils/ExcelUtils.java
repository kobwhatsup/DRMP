package com.drmp.utils;

import com.drmp.entity.Case;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Excel Utility Class
 * Excel工具类
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public class ExcelUtils {
    
    /**
     * Parse cases from Excel file
     * 从Excel文件解析案件数据
     */
    public static List<Case> parseCaseExcel(MultipartFile file) throws IOException {
        List<Case> cases = new ArrayList<>();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Skip header row
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                Case caseEntity = new Case();
                
                // Read case data from Excel row
                caseEntity.setCaseNumber(getCellStringValue(row.getCell(0)));
                caseEntity.setDebtorName(getCellStringValue(row.getCell(1)));
                caseEntity.setDebtorIdCard(getCellStringValue(row.getCell(2)));
                caseEntity.setDebtorPhone(getCellStringValue(row.getCell(3)));
                caseEntity.setDebtorAddress(getCellStringValue(row.getCell(4)));
                caseEntity.setLoanAmount(getCellBigDecimalValue(row.getCell(5)));
                caseEntity.setRemainingPrincipal(getCellBigDecimalValue(row.getCell(6)));
                caseEntity.setRemainingInterest(getCellBigDecimalValue(row.getCell(7)));
                caseEntity.setTotalDebtAmount(getCellBigDecimalValue(row.getCell(8)));
                caseEntity.setOverdueDays(getCellIntValue(row.getCell(9)));
                caseEntity.setOverdueStage(getCellStringValue(row.getCell(10)));
                caseEntity.setLoanDate(getCellLocalDateValue(row.getCell(11)));
                caseEntity.setDueDate(getCellLocalDateValue(row.getCell(12)));
                caseEntity.setDebtType(getCellStringValue(row.getCell(13)));
                caseEntity.setGuaranteeMethod(getCellStringValue(row.getCell(14)));
                caseEntity.setCollateralInfo(getCellStringValue(row.getCell(15)));
                caseEntity.setRiskLevel(getCellStringValue(row.getCell(16)));
                caseEntity.setStatus("PENDING");
                caseEntity.setCreatedAt(LocalDateTime.now());
                caseEntity.setUpdatedAt(LocalDateTime.now());
                
                cases.add(caseEntity);
            }
        }
        
        return cases;
    }
    
    /**
     * Export cases to Excel
     * 导出案件到Excel
     */
    public static byte[] exportCasesToExcel(List<Case> cases, String sheetName) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet(sheetName);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "案件编号", "债务人姓名", "身份证号", "手机号", "地址",
                "贷款金额", "剩余本金", "剩余利息", "总欠款", "逾期天数",
                "逾期阶段", "贷款日期", "到期日期", "债务类型", "担保方式",
                "抵押物信息", "风险等级", "状态", "创建时间"
            };
            
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            int rowNum = 1;
            for (Case caseEntity : cases) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(caseEntity.getCaseNumber());
                row.createCell(1).setCellValue(caseEntity.getDebtorName());
                row.createCell(2).setCellValue(maskIdCard(caseEntity.getDebtorIdCard()));
                row.createCell(3).setCellValue(maskPhone(caseEntity.getDebtorPhone()));
                row.createCell(4).setCellValue(caseEntity.getDebtorAddress());
                row.createCell(5).setCellValue(caseEntity.getLoanAmount() != null ? 
                    caseEntity.getLoanAmount().doubleValue() : 0);
                row.createCell(6).setCellValue(caseEntity.getRemainingPrincipal() != null ? 
                    caseEntity.getRemainingPrincipal().doubleValue() : 0);
                row.createCell(7).setCellValue(caseEntity.getRemainingInterest() != null ? 
                    caseEntity.getRemainingInterest().doubleValue() : 0);
                row.createCell(8).setCellValue(caseEntity.getTotalDebtAmount() != null ? 
                    caseEntity.getTotalDebtAmount().doubleValue() : 0);
                row.createCell(9).setCellValue(caseEntity.getOverdueDays() != null ? 
                    caseEntity.getOverdueDays() : 0);
                row.createCell(10).setCellValue(caseEntity.getOverdueStage());
                row.createCell(11).setCellValue(caseEntity.getLoanDate() != null ? 
                    caseEntity.getLoanDate().toString() : "");
                row.createCell(12).setCellValue(caseEntity.getDueDate() != null ? 
                    caseEntity.getDueDate().toString() : "");
                row.createCell(13).setCellValue(caseEntity.getDebtType());
                row.createCell(14).setCellValue(caseEntity.getGuaranteeMethod());
                row.createCell(15).setCellValue(caseEntity.getCollateralInfo());
                row.createCell(16).setCellValue(caseEntity.getRiskLevel());
                row.createCell(17).setCellValue(caseEntity.getStatus());
                row.createCell(18).setCellValue(caseEntity.getCreatedAt() != null ? 
                    caseEntity.getCreatedAt().toString() : "");
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to export Excel", e);
        }
    }
    
    /**
     * Export cases to CSV
     * 导出案件到CSV
     */
    public static byte[] exportCasesToCsv(List<Case> cases) {
        StringBuilder sb = new StringBuilder();
        
        // Header
        sb.append("案件编号,债务人姓名,身份证号,手机号,地址,贷款金额,剩余本金,剩余利息,总欠款,逾期天数,逾期阶段,贷款日期,到期日期,债务类型,担保方式,抵押物信息,风险等级,状态,创建时间\n");
        
        // Data rows
        for (Case caseEntity : cases) {
            sb.append(caseEntity.getCaseNumber()).append(",");
            sb.append(caseEntity.getDebtorName()).append(",");
            sb.append(maskIdCard(caseEntity.getDebtorIdCard())).append(",");
            sb.append(maskPhone(caseEntity.getDebtorPhone())).append(",");
            sb.append(caseEntity.getDebtorAddress()).append(",");
            sb.append(caseEntity.getLoanAmount()).append(",");
            sb.append(caseEntity.getRemainingPrincipal()).append(",");
            sb.append(caseEntity.getRemainingInterest()).append(",");
            sb.append(caseEntity.getTotalDebtAmount()).append(",");
            sb.append(caseEntity.getOverdueDays()).append(",");
            sb.append(caseEntity.getOverdueStage()).append(",");
            sb.append(caseEntity.getLoanDate()).append(",");
            sb.append(caseEntity.getDueDate()).append(",");
            sb.append(caseEntity.getDebtType()).append(",");
            sb.append(caseEntity.getGuaranteeMethod()).append(",");
            sb.append(caseEntity.getCollateralInfo()).append(",");
            sb.append(caseEntity.getRiskLevel()).append(",");
            sb.append(caseEntity.getStatus()).append(",");
            sb.append(caseEntity.getCreatedAt()).append("\n");
        }
        
        return sb.toString().getBytes();
    }
    
    // Helper methods
    
    private static String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }
    
    private static BigDecimal getCellBigDecimalValue(Cell cell) {
        if (cell == null) return BigDecimal.ZERO;
        
        switch (cell.getCellType()) {
            case NUMERIC:
                return BigDecimal.valueOf(cell.getNumericCellValue());
            case STRING:
                try {
                    return new BigDecimal(cell.getStringCellValue());
                } catch (NumberFormatException e) {
                    return BigDecimal.ZERO;
                }
            default:
                return BigDecimal.ZERO;
        }
    }
    
    private static Integer getCellIntValue(Cell cell) {
        if (cell == null) return 0;
        
        switch (cell.getCellType()) {
            case NUMERIC:
                return (int) cell.getNumericCellValue();
            case STRING:
                try {
                    return Integer.parseInt(cell.getStringCellValue());
                } catch (NumberFormatException e) {
                    return 0;
                }
            default:
                return 0;
        }
    }
    
    private static LocalDate getCellLocalDateValue(Cell cell) {
        if (cell == null) return null;
        
        if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return LocalDate.parse(cell.getStringCellValue());
            } catch (Exception e) {
                return null;
            }
        }
        
        return null;
    }
    
    private static String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() < 15) return idCard;
        return idCard.substring(0, 3) + "***********" + idCard.substring(idCard.length() - 4);
    }
    
    private static String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) return phone;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
}