package com.drmp.config;

import com.drmp.security.AccessKeyAuthenticationFilter;
import com.drmp.service.AccessKeyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * 访问密钥安全配置
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
@Order(100)
public class AccessKeySecurityConfig {

    @Autowired
    private AccessKeyService accessKeyService;

    @Autowired
    private ObjectMapper objectMapper;

    @Bean
    public AccessKeyAuthenticationFilter accessKeyAuthenticationFilter() {
        return new AccessKeyAuthenticationFilter(accessKeyService, objectMapper);
    }

    @Bean
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            // 请求匹配器：只对API路径应用此配置
            .antMatcher("/api/**")
            .authorizeRequests(authorize -> authorize
                // 公开端点
                .antMatchers("/api/v1/access-keys/validate").permitAll()
                .antMatchers("/api/v1/health").permitAll()
                .antMatchers("/api/v1/docs/**").permitAll()
                
                // API访问权限
                .antMatchers("/api/v1/cases/**").hasAnyAuthority("API_READ", "API_WRITE", "ADMIN")
                .antMatchers("/api/v1/case-packages/**").hasAnyAuthority("API_READ", "API_WRITE", "ADMIN")
                .antMatchers("/api/v1/organizations/**").hasAnyAuthority("API_READ", "API_WRITE", "ADMIN")
                
                // 系统集成权限
                .antMatchers("/api/v1/integration/**").hasAuthority("SYSTEM_INTEGRATION")
                .antMatchers("/api/v1/webhooks/**").hasAuthority("SYSTEM_INTEGRATION")
                
                // 数据导出权限
                .antMatchers("/api/v1/export/**").hasAuthority("DATA_EXPORT")
                .antMatchers("/api/v1/reports/**").hasAuthority("DATA_EXPORT")
                
                // 密钥管理权限
                .antMatchers("/api/v1/access-keys/**").hasAnyAuthority("KEY_MANAGE", "ADMIN")
                
                // 其他API需要认证
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .csrf().disable()
            .cors().disable()
            .headers(headers -> headers
                .frameOptions().deny()
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                )
            )
            .addFilterBefore(accessKeyAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}