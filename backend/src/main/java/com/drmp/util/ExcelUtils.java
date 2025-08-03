package com.drmp.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Excel工具类
 * 提供Excel文件生成、样式设置等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class ExcelUtils {

    /**
     * 生成Excel文件
     * 
     * @param sheetName 工作表名称
     * @param headers 表头
     * @param data 数据
     * @return Excel文件字节数组
     * @throws IOException IO异常
     */
    public byte[] generateExcel(String sheetName, List<String> headers, List<List<Object>> data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet(sheetName);
            
            // 创建样式
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            // 创建表头
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
            }
            
            // 创建数据行
            for (int i = 0; i < data.size(); i++) {
                Row dataRow = sheet.createRow(i + 1);
                List<Object> rowData = data.get(i);
                
                for (int j = 0; j < rowData.size() && j < headers.size(); j++) {
                    Cell cell = dataRow.createCell(j);
                    setCellValue(cell, rowData.get(j));
                    cell.setCellStyle(dataStyle);
                }
            }
            
            // 自动调整列宽
            for (int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
                // 设置最大列宽，防止列宽过大
                if (sheet.getColumnWidth(i) > 15000) {
                    sheet.setColumnWidth(i, 15000);
                }
            }
            
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    /**
     * 生成带Map数据的Excel文件
     * 
     * @param sheetName 工作表名称
     * @param data Map格式数据
     * @return Excel文件字节数组
     * @throws IOException IO异常
     */
    public byte[] generateExcelFromMap(String sheetName, List<Map<String, Object>> data) throws IOException {
        if (data.isEmpty()) {
            return generateEmptyExcel(sheetName);
        }
        
        // 获取表头
        Map<String, Object> firstRow = data.get(0);
        List<String> headers = List.copyOf(firstRow.keySet());
        
        // 转换数据格式
        List<List<Object>> tableData = data.stream()
            .map(row -> headers.stream()
                .map(row::get)
                .toList())
            .toList();
        
        return generateExcel(sheetName, headers, tableData);
    }

    /**
     * 生成空Excel文件
     * 
     * @param sheetName 工作表名称
     * @return Excel文件字节数组
     * @throws IOException IO异常
     */
    public byte[] generateEmptyExcel(String sheetName) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(sheetName);
            
            // 创建一个空行提示
            Row row = sheet.createRow(0);
            Cell cell = row.createCell(0);
            cell.setCellValue("暂无数据");
            
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    /**
     * 创建表头样式
     */
    public CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        
        // 字体设置
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 12);
        
        style.setFont(font);
        
        // 背景色
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        // 边框
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        
        // 对齐
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }

    /**
     * 创建数据样式
     */
    public CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        // 边框
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        
        // 对齐
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }

    /**
     * 创建数字样式
     */
    public CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    /**
     * 创建日期样式
     */
    public CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));
        return style;
    }

    /**
     * 设置单元格值
     */
    public void setCellValue(Cell cell, Object value) {
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

    /**
     * 验证Excel格式
     * 
     * @param fileName 文件名
     * @return 是否为Excel格式
     */
    public boolean isExcelFile(String fileName) {
        if (fileName == null) return false;
        String lowerCaseName = fileName.toLowerCase();
        return lowerCaseName.endsWith(".xls") || lowerCaseName.endsWith(".xlsx");
    }

    /**
     * 获取Excel文件扩展名
     * 
     * @param version Excel版本 (2003/2007)
     * @return 文件扩展名
     */
    public String getExcelExtension(String version) {
        return "2003".equals(version) ? ".xls" : ".xlsx";
    }
}