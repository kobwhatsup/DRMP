package com.drmp.util;

import com.fasterxml.jackson.core.type.TypeReference;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * JsonUtils 测试
 */
@DisplayName("JsonUtils 测试")
class JsonUtilsTest {

    @Test
    @DisplayName("toJsonString - 应成功将对象转换为JSON字符串")
    void toJsonString_ShouldConvertObjectToJson() {
        // Arrange
        Map<String, Object> testData = new HashMap<>();
        testData.put("name", "测试");
        testData.put("value", 100);

        // Act
        String json = JsonUtils.toJsonString(testData);

        // Assert
        assertThat(json).isNotNull();
        assertThat(json).contains("测试");
        assertThat(json).contains("100");
    }

    @Test
    @DisplayName("toJsonString - null对象应返回null")
    void toJsonString_ShouldReturnNull_ForNullObject() {
        // Act
        String json = JsonUtils.toJsonString(null);

        // Assert
        assertThat(json).isNull();
    }

    @Test
    @DisplayName("toJsonStringPretty - 应成功格式化JSON字符串")
    void toJsonStringPretty_ShouldFormatJson() {
        // Arrange
        Map<String, Object> testData = new HashMap<>();
        testData.put("name", "测试");
        testData.put("value", 100);

        // Act
        String json = JsonUtils.toJsonStringPretty(testData);

        // Assert
        assertThat(json).isNotNull();
        assertThat(json).contains("\n"); // 格式化后应包含换行符
        assertThat(json).contains("测试");
    }

    @Test
    @DisplayName("toJsonStringPretty - null对象应返回null")
    void toJsonStringPretty_ShouldReturnNull_ForNullObject() {
        // Act
        String json = JsonUtils.toJsonStringPretty(null);

        // Assert
        assertThat(json).isNull();
    }

    @Test
    @DisplayName("fromJsonString - 应成功将JSON字符串转换为对象")
    void fromJsonString_ShouldConvertJsonToObject() {
        // Arrange
        String json = "{\"name\":\"测试\",\"value\":100}";

        // Act
        TestData result = JsonUtils.fromJsonString(json, TestData.class);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("测试");
        assertThat(result.getValue()).isEqualTo(100);
    }

    @Test
    @DisplayName("fromJsonString - null字符串应返回null")
    void fromJsonString_ShouldReturnNull_ForNullString() {
        // Act
        TestData result = JsonUtils.fromJsonString(null, TestData.class);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("fromJsonString - 空字符串应返回null")
    void fromJsonString_ShouldReturnNull_ForEmptyString() {
        // Act
        TestData result = JsonUtils.fromJsonString("   ", TestData.class);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("fromJsonString with TypeReference - 应成功转换List")
    void fromJsonString_ShouldConvertList_WithTypeReference() {
        // Arrange
        String json = "[{\"name\":\"测试1\",\"value\":100},{\"name\":\"测试2\",\"value\":200}]";

        // Act
        List<TestData> result = JsonUtils.fromJsonString(json, new TypeReference<List<TestData>>() {});

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("测试1");
        assertThat(result.get(1).getValue()).isEqualTo(200);
    }

    @Test
    @DisplayName("fromJsonString with TypeReference - 应成功转换Map")
    void fromJsonString_ShouldConvertMap_WithTypeReference() {
        // Arrange
        String json = "{\"key1\":\"value1\",\"key2\":\"value2\"}";

        // Act
        Map<String, String> result = JsonUtils.fromJsonString(json, new TypeReference<Map<String, String>>() {});

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get("key1")).isEqualTo("value1");
        assertThat(result.get("key2")).isEqualTo("value2");
    }

    @Test
    @DisplayName("objectToMap - 应成功将对象转换为Map")
    void objectToMap_ShouldConvertObjectToMap() {
        // Arrange
        TestData testData = new TestData();
        testData.setName("测试");
        testData.setValue(100);

        // Act
        Map<String, Object> result = JsonUtils.objectToMap(testData);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.get("name")).isEqualTo("测试");
        assertThat(result.get("value")).isEqualTo(100);
    }

    @Test
    @DisplayName("objectToMap - null对象应返回null")
    void objectToMap_ShouldReturnNull_ForNullObject() {
        // Act
        Map<String, Object> result = JsonUtils.objectToMap(null);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("mapToObject - 应成功将Map转换为对象")
    void mapToObject_ShouldConvertMapToObject() {
        // Arrange
        Map<String, Object> map = new HashMap<>();
        map.put("name", "测试");
        map.put("value", 100);

        // Act
        TestData result = JsonUtils.mapToObject(map, TestData.class);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("测试");
        assertThat(result.getValue()).isEqualTo(100);
    }

    @Test
    @DisplayName("mapToObject - null Map应返回null")
    void mapToObject_ShouldReturnNull_ForNullMap() {
        // Act
        TestData result = JsonUtils.mapToObject(null, TestData.class);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("fromJsonStringToList - 应成功转换List")
    void fromJsonStringToList_ShouldConvertJsonToList() {
        // Arrange
        String json = "[{\"name\":\"测试1\",\"value\":100},{\"name\":\"测试2\",\"value\":200}]";

        // Act
        List<TestData> result = JsonUtils.fromJsonStringToList(json, TestData.class);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("测试1");
    }

    @Test
    @DisplayName("fromJsonStringToMap - 应成功转换Map")
    void fromJsonStringToMap_ShouldConvertJsonToMap() {
        // Arrange
        String json = "{\"key1\":\"value1\",\"key2\":\"value2\"}";

        // Act
        Map<String, Object> result = JsonUtils.fromJsonStringToMap(json);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get("key1")).isEqualTo("value1");
    }

    @Test
    @DisplayName("deepCopy - 应成功深拷贝对象")
    void deepCopy_ShouldCopyObject() {
        // Arrange
        TestData original = new TestData("测试", 100);

        // Act
        TestData copy = JsonUtils.deepCopy(original, TestData.class);

        // Assert
        assertThat(copy).isNotNull();
        assertThat(copy).isNotSameAs(original);
        assertThat(copy.getName()).isEqualTo("测试");
        assertThat(copy.getValue()).isEqualTo(100);
    }

    @Test
    @DisplayName("mergeJson - 应成功合并两个JSON")
    void mergeJson_ShouldMergeJsonObjects() {
        // Arrange
        String json1 = "{\"name\":\"测试\",\"value\":100}";
        String json2 = "{\"value\":200,\"extra\":\"新字段\"}";

        // Act
        String merged = JsonUtils.mergeJson(json1, json2);

        // Assert
        assertThat(merged).isNotNull();
        assertThat(merged).contains("测试");
        assertThat(merged).contains("200");
        assertThat(merged).contains("新字段");
    }

    @Test
    @DisplayName("isValidJson - 有效JSON应返回true")
    void isValidJson_ShouldReturnTrue_ForValidJson() {
        // Arrange
        String validJson = "{\"name\":\"测试\",\"value\":100}";

        // Act
        boolean result = JsonUtils.isValidJson(validJson);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("isValidJson - 无效JSON应返回false")
    void isValidJson_ShouldReturnFalse_ForInvalidJson() {
        // Arrange
        String invalidJson = "{name:测试,value:100"; // 缺少引号和闭合括号

        // Act
        boolean result = JsonUtils.isValidJson(invalidJson);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("isValidJson - null字符串应返回false")
    void isValidJson_ShouldReturnFalse_ForNullString() {
        // Act
        boolean result = JsonUtils.isValidJson(null);

        // Assert
        assertThat(result).isFalse();
    }

    /**
     * 测试数据类
     */
    public static class TestData {
        private String name;
        private Integer value;

        public TestData() {}

        public TestData(String name, Integer value) {
            this.name = name;
            this.value = value;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getValue() {
            return value;
        }

        public void setValue(Integer value) {
            this.value = value;
        }
    }
}
