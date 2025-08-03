package com.drmp.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;

/**
 * JSON工具类
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
public class JsonUtils {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    static {
        // 设置日期格式
        OBJECT_MAPPER.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
        
        // 注册JavaTimeModule以支持Java 8时间类型
        OBJECT_MAPPER.registerModule(new JavaTimeModule());
        
        // 禁用将日期写为时间戳
        OBJECT_MAPPER.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // 忽略未知属性
        OBJECT_MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        
        // 忽略空对象转json的错误
        OBJECT_MAPPER.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        
        // 允许属性名称没有引号
        OBJECT_MAPPER.configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
        
        // 允许单引号
        OBJECT_MAPPER.configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
    }

    /**
     * 对象转JSON字符串
     */
    public static String toJsonString(Object object) {
        if (object == null) {
            return null;
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.error("对象转JSON失败", e);
            return null;
        }
    }

    /**
     * 对象转JSON字符串（格式化）
     */
    public static String toJsonStringPretty(Object object) {
        if (object == null) {
            return null;
        }
        try {
            return OBJECT_MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.error("对象转JSON失败", e);
            return null;
        }
    }

    /**
     * JSON字符串转对象
     */
    public static <T> T fromJsonString(String json, Class<T> clazz) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(json, clazz);
        } catch (IOException e) {
            log.error("JSON转对象失败", e);
            return null;
        }
    }

    /**
     * JSON字符串转对象（使用TypeReference）
     */
    public static <T> T fromJsonString(String json, TypeReference<T> typeReference) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(json, typeReference);
        } catch (IOException e) {
            log.error("JSON转对象失败", e);
            return null;
        }
    }

    /**
     * JSON字符串转List
     */
    public static <T> List<T> fromJsonStringToList(String json, Class<T> clazz) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(json, 
                OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, clazz));
        } catch (IOException e) {
            log.error("JSON转List失败", e);
            return null;
        }
    }

    /**
     * JSON字符串转Map
     */
    public static Map<String, Object> fromJsonStringToMap(String json) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (IOException e) {
            log.error("JSON转Map失败", e);
            return null;
        }
    }

    /**
     * 对象转Map
     */
    public static Map<String, Object> objectToMap(Object object) {
        if (object == null) {
            return null;
        }
        try {
            return OBJECT_MAPPER.convertValue(object, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("对象转Map失败", e);
            return null;
        }
    }

    /**
     * Map转对象
     */
    public static <T> T mapToObject(Map<String, Object> map, Class<T> clazz) {
        if (map == null) {
            return null;
        }
        try {
            return OBJECT_MAPPER.convertValue(map, clazz);
        } catch (Exception e) {
            log.error("Map转对象失败", e);
            return null;
        }
    }

    /**
     * 深拷贝
     */
    public static <T> T deepCopy(T object, Class<T> clazz) {
        if (object == null) {
            return null;
        }
        try {
            String json = OBJECT_MAPPER.writeValueAsString(object);
            return OBJECT_MAPPER.readValue(json, clazz);
        } catch (Exception e) {
            log.error("深拷贝失败", e);
            return null;
        }
    }

    /**
     * 判断字符串是否为有效的JSON
     */
    public static boolean isValidJson(String json) {
        if (json == null || json.trim().isEmpty()) {
            return false;
        }
        try {
            OBJECT_MAPPER.readTree(json);
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * 获取ObjectMapper实例
     */
    public static ObjectMapper getObjectMapper() {
        return OBJECT_MAPPER;
    }

    /**
     * 合并两个JSON对象
     */
    public static String mergeJson(String originalJson, String updateJson) {
        try {
            Map<String, Object> originalMap = fromJsonStringToMap(originalJson);
            Map<String, Object> updateMap = fromJsonStringToMap(updateJson);
            
            if (originalMap == null) {
                return updateJson;
            }
            if (updateMap == null) {
                return originalJson;
            }
            
            originalMap.putAll(updateMap);
            return toJsonString(originalMap);
        } catch (Exception e) {
            log.error("合并JSON失败", e);
            return originalJson;
        }
    }
}