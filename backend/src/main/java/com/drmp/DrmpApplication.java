package com.drmp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * DRMP Platform Main Application
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration.class
})
public class DrmpApplication {

    public static void main(String[] args) {
        SpringApplication.run(DrmpApplication.class, args);
    }
}