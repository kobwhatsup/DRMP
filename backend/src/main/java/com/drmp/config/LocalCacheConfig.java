package com.drmp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

/**
 * Local Cache Configuration for development without Redis
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Configuration
@Profile("local")
public class LocalCacheConfig {

    @Bean("localCache")
    public Map<String, Object> localCache() {
        return new ConcurrentHashMap<>();
    }
}