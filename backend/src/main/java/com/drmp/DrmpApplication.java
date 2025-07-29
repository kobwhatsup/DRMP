package com.drmp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * DRMP Platform Main Application
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableTransactionManagement
@EnableAsync
@EnableScheduling
public class DrmpApplication {

    public static void main(String[] args) {
        SpringApplication.run(DrmpApplication.class, args);
    }
}