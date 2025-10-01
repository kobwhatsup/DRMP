package com.drmp.config;

import com.drmp.security.JwtTokenProvider;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Test Security Configuration
 * 测试安全配置 - 提供Mock的安全组件
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@TestConfiguration
public class TestSecurityConfig {

    /**
     * Mock JwtTokenProvider for testing
     */
    @Bean
    @Primary
    public JwtTokenProvider mockJwtTokenProvider() {
        return Mockito.mock(JwtTokenProvider.class);
    }

    /**
     * Provide real PasswordEncoder for testing
     * (某些测试可能需要真实的密码编码器)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
