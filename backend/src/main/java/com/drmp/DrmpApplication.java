package com.drmp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * DRMP Platform Main Application
 * 包含完整的 JPA、MySQL 和持久化功能
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@SpringBootApplication
// @EnableJpaRepositories(basePackages = "com.drmp.repository")  // 暂时注释，让 Spring 使用默认扫描
@EnableJpaAuditing
@EnableTransactionManagement
public class DrmpApplication {

    public static void main(String[] args) {
        SpringApplication.run(DrmpApplication.class, args);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}