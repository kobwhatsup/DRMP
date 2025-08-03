package com.drmp.integration.config;

import com.drmp.integration.CircuitBreakerManager;
import com.drmp.integration.ExternalSystemHealthChecker;
import com.drmp.integration.ExternalSystemMetrics;
import com.drmp.integration.WebhookSecurityValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

/**
 * External System Integration Configuration
 * 外部系统集成配置
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Configuration
public class IntegrationConfig {

    @Value("${integration.http.connection-timeout:5000}")
    private int connectionTimeout;

    @Value("${integration.http.read-timeout:30000}")
    private int readTimeout;

    @Value("${integration.http.max-connections:200}")
    private int maxConnections;

    @Value("${integration.http.max-connections-per-route:50}")
    private int maxConnectionsPerRoute;

    @Value("${integration.retry.max-attempts:3}")
    private int maxRetryAttempts;

    @Value("${integration.circuit-breaker.failure-threshold:5}")
    private int circuitBreakerFailureThreshold;

    @Value("${integration.circuit-breaker.timeout:60}")
    private long circuitBreakerTimeoutSeconds;

    @Bean
    public RestTemplate restTemplate() {
        // Configure HTTP client factory
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectionTimeout);
        factory.setReadTimeout(readTimeout);

        RestTemplate restTemplate = new RestTemplate(factory);
        
        // Add custom interceptors (to be implemented)
        // restTemplate.getInterceptors().add(new ExternalSystemLoggingInterceptor());
        // restTemplate.getInterceptors().add(new ExternalSystemRetryInterceptor(maxRetryAttempts));
        
        return restTemplate;
    }

    @Bean
    public ObjectMapper integrationObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        return mapper;
    }

    @Bean
    public CircuitBreakerManager circuitBreakerManager() {
        return new CircuitBreakerManager();
    }

    @Bean
    public ScheduledExecutorService integrationScheduler() {
        return Executors.newScheduledThreadPool(5);
    }

    @Bean
    public ExternalSystemHealthChecker externalSystemHealthChecker(RestTemplate restTemplate) {
        return new ExternalSystemHealthChecker(restTemplate);
    }

    @Bean
    public WebhookSecurityValidator webhookSecurityValidator() {
        return new WebhookSecurityValidator();
    }

    @Bean
    public ExternalSystemMetrics externalSystemMetrics() {
        return new ExternalSystemMetrics();
    }
}