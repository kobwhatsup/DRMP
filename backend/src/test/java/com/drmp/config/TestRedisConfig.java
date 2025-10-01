package com.drmp.config;

import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;

/**
 * Test Redis Configuration
 * 为测试环境提供Mock的RedisTemplate,避免依赖真实Redis服务
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@TestConfiguration
@Profile("test")
public class TestRedisConfig {

    /**
     * 创建Mock的RedisTemplate Bean
     * 使用@Primary确保优先于真实的RedisTemplate被注入
     */
    @Bean
    @Primary
    @SuppressWarnings("unchecked")
    public RedisTemplate<String, Object> mockRedisTemplate() {
        RedisTemplate<String, Object> template = Mockito.mock(RedisTemplate.class);
        ValueOperations<String, Object> valueOps = Mockito.mock(ValueOperations.class);

        // 配置基本的mock行为,使用lenient()避免不必要的stubbing警告
        lenient().when(template.opsForValue()).thenReturn(valueOps);
        lenient().when(template.hasKey(anyString())).thenReturn(false);
        lenient().when(template.delete(anyString())).thenReturn(Boolean.TRUE);

        // Mock ValueOperations的常用方法
        lenient().when(valueOps.get(anyString())).thenReturn(null);
        lenient().doNothing().when(valueOps).set(anyString(), any());
        lenient().doNothing().when(valueOps).set(anyString(), any(), anyLong(), any());

        return template;
    }
}
