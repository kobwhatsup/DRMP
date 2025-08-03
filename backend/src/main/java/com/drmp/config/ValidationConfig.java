package com.drmp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import javax.validation.Validation;

/**
 * Validation Configuration
 * 数据验证配置
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Configuration
public class ValidationConfig {

    @Bean
    public Validator validator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        return factory.getValidator();
    }
}