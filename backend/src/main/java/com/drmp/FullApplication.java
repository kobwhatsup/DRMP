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
 * Full DRMP Application with Database Support
 * This application includes JPA, MySQL, and all persistence features
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.drmp.repository")
@EnableJpaAuditing
@EnableTransactionManagement
public class FullApplication {

    public static void main(String[] args) {
        SpringApplication.run(FullApplication.class, args);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}