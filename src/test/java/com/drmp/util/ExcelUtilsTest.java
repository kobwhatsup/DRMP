package com.drmp.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("ExcelUtils 测试")
class ExcelUtilsTest {

    private ExcelUtils excelUtils = new ExcelUtils();

    @Test
    @DisplayName("generateExcel - 应成功生成Excel文件")
    void generateExcel_ShouldGenerateFile() throws IOException {
        List<String> headers = Arrays.asList("姓名", "年龄", "城市");
        List<List<Object>> data = new ArrayList<>();
        data.add(Arrays.asList("张三", 25, "北京"));
        data.add(Arrays.asList("李四", 30, "上海"));
        
        byte[] excelBytes = excelUtils.generateExcel("测试表", headers, data);
        
        assertNotNull(excelBytes);
        assertTrue(excelBytes.length > 0);
    }

    @Test
    @DisplayName("generateExcel - 空数据应生成空Excel")
    void generateExcel_ShouldHandleEmptyData() throws IOException {
        List<String> headers = Arrays.asList("列1", "列2");
        List<List<Object>> data = new ArrayList<>();
        
        byte[] excelBytes = excelUtils.generateExcel("空表", headers, data);
        
        assertNotNull(excelBytes);
        assertTrue(excelBytes.length > 0);
    }
}
