package com.drmp.util;

import com.fasterxml.jackson.core.type.TypeReference;
import lombok.Data;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("JsonUtils 测试")
class JsonUtilsTest {

    @Data
    static class TestObject {
        private String name;
        private Integer age;
    }

    @Test
    @DisplayName("toJsonString - 应正确将对象转为JSON")
    void toJsonString_ShouldConvertObjectToJson() {
        TestObject obj = new TestObject();
        obj.setName("test");
        obj.setAge(25);
        
        String json = JsonUtils.toJsonString(obj);
        assertNotNull(json);
        assertTrue(json.contains("test"));
        assertTrue(json.contains("25"));
    }

    @Test
    @DisplayName("toJsonString - null应返回null")
    void toJsonString_ShouldReturnNullForNull() {
        assertNull(JsonUtils.toJsonString(null));
    }

    @Test
    @DisplayName("fromJsonString - 应正确将JSON转为对象")
    void fromJsonString_ShouldConvertJsonToObject() {
        String json = "{\"name\":\"test\",\"age\":25}";
        TestObject obj = JsonUtils.fromJsonString(json, TestObject.class);
        
        assertNotNull(obj);
        assertEquals("test", obj.getName());
        assertEquals(25, obj.getAge());
    }

    @Test
    @DisplayName("fromJsonString - 空字符串应返回null")
    void fromJsonString_ShouldReturnNullForEmptyString() {
        assertNull(JsonUtils.fromJsonString("", TestObject.class));
        assertNull(JsonUtils.fromJsonString(null, TestObject.class));
    }

    @Test
    @DisplayName("fromJsonStringToList - 应正确转换JSON数组")
    void fromJsonStringToList_ShouldConvertJsonArray() {
        String json = "[{\"name\":\"test1\",\"age\":25},{\"name\":\"test2\",\"age\":30}]";
        List<TestObject> list = JsonUtils.fromJsonStringToList(json, TestObject.class);
        
        assertNotNull(list);
        assertEquals(2, list.size());
        assertEquals("test1", list.get(0).getName());
    }

    @Test
    @DisplayName("fromJsonStringToMap - 应正确转换为Map")
    void fromJsonStringToMap_ShouldConvertToMap() {
        String json = "{\"key1\":\"value1\",\"key2\":123}";
        Map<String, Object> map = JsonUtils.fromJsonStringToMap(json);
        
        assertNotNull(map);
        assertEquals("value1", map.get("key1"));
        assertEquals(123, map.get("key2"));
    }

    @Test
    @DisplayName("objectToMap - 应正确将对象转为Map")
    void objectToMap_ShouldConvertObjectToMap() {
        TestObject obj = new TestObject();
        obj.setName("test");
        obj.setAge(25);
        
        Map<String, Object> map = JsonUtils.objectToMap(obj);
        
        assertNotNull(map);
        assertEquals("test", map.get("name"));
        assertEquals(25, map.get("age"));
    }

    @Test
    @DisplayName("mapToObject - 应正确将Map转为对象")
    void mapToObject_ShouldConvertMapToObject() {
        Map<String, Object> map = new HashMap<>();
        map.put("name", "test");
        map.put("age", 25);
        
        TestObject obj = JsonUtils.mapToObject(map, TestObject.class);
        
        assertNotNull(obj);
        assertEquals("test", obj.getName());
        assertEquals(25, obj.getAge());
    }

    @Test
    @DisplayName("isValidJson - 应正确判断JSON有效性")
    void isValidJson_ShouldValidateJsonString() {
        assertTrue(JsonUtils.isValidJson("{\"key\":\"value\"}"));
        assertTrue(JsonUtils.isValidJson("[1,2,3]"));
        assertFalse(JsonUtils.isValidJson("invalid"));
        assertFalse(JsonUtils.isValidJson(null));
        assertFalse(JsonUtils.isValidJson(""));
    }

    @Test
    @DisplayName("deepCopy - 应正确深拷贝对象")
    void deepCopy_ShouldCopyObjectDeeply() {
        TestObject original = new TestObject();
        original.setName("test");
        original.setAge(25);
        
        TestObject copy = JsonUtils.deepCopy(original, TestObject.class);
        
        assertNotNull(copy);
        assertEquals(original.getName(), copy.getName());
        assertEquals(original.getAge(), copy.getAge());
        assertNotSame(original, copy);
    }

    @Test
    @DisplayName("mergeJson - 应正确合并JSON对象")
    void mergeJson_ShouldMergeTwoJsonObjects() {
        String original = "{\"key1\":\"value1\",\"key2\":\"value2\"}";
        String update = "{\"key2\":\"newValue\",\"key3\":\"value3\"}";
        
        String merged = JsonUtils.mergeJson(original, update);
        
        assertNotNull(merged);
        Map<String, Object> map = JsonUtils.fromJsonStringToMap(merged);
        assertEquals("value1", map.get("key1"));
        assertEquals("newValue", map.get("key2"));
        assertEquals("value3", map.get("key3"));
    }
}
