package com.drmp.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PDFUtils 测试")
class PDFUtilsTest {

    private PDFUtils pdfUtils;

    @BeforeEach
    void setUp() {
        pdfUtils = new PDFUtils();
    }

    @Test
    @DisplayName("generateReportPDF - 应成功生成PDF文件")
    void generateReportPDF_ShouldGeneratePDF() {
        List<Map<String, Object>> data = new ArrayList<>();
        Map<String, Object> row = new HashMap<>();
        row.put("name", "测试数据");
        row.put("value", 100);
        data.add(row);

        byte[] pdfBytes = pdfUtils.generateReportPDF("销售报表", data);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    @DisplayName("generateReportPDF - 空数据应生成空PDF")
    void generateReportPDF_ShouldGenerateEmptyPDFForEmptyData() {
        List<Map<String, Object>> data = new ArrayList<>();

        byte[] pdfBytes = pdfUtils.generateReportPDF("空报表", data);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    @DisplayName("generateReportPDF - 应包含PDF标识符")
    void generateReportPDF_ShouldContainPDFIdentifier() {
        List<Map<String, Object>> data = new ArrayList<>();
        data.add(Map.of("key", "value"));

        byte[] pdfBytes = pdfUtils.generateReportPDF("测试", data);

        String content = new String(pdfBytes);
        assertTrue(content.startsWith("%PDF"), "PDF应该以%PDF开头");
    }

    @Test
    @DisplayName("generateReportPDF - 应处理中文内容")
    void generateReportPDF_ShouldHandleChineseContent() {
        List<Map<String, Object>> data = new ArrayList<>();
        Map<String, Object> row = new HashMap<>();
        row.put("姓名", "张三");
        row.put("部门", "技术部");
        data.add(row);

        byte[] pdfBytes = pdfUtils.generateReportPDF("员工报表", data);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    @DisplayName("generateReportPDF - 应处理多行数据")
    void generateReportPDF_ShouldHandleMultipleRows() {
        List<Map<String, Object>> data = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", i);
            row.put("name", "数据" + i);
            data.add(row);
        }

        byte[] pdfBytes = pdfUtils.generateReportPDF("多行测试", data);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    @DisplayName("generateReportPDF - 不同报表类型应正常生成")
    void generateReportPDF_ShouldHandleDifferentReportTypes() {
        List<Map<String, Object>> data = List.of(Map.of("test", "data"));

        String[] reportTypes = {"销售报表", "财务报表", "统计报表", "分析报表"};

        for (String type : reportTypes) {
            byte[] pdfBytes = pdfUtils.generateReportPDF(type, data);
            assertNotNull(pdfBytes, "报表类型 " + type + " 应该生成PDF");
            assertTrue(pdfBytes.length > 0, "报表类型 " + type + " PDF应有内容");
        }
    }
}
