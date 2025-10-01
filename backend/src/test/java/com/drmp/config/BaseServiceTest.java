package com.drmp.config;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base Service Test Class
 * Service层测试基类，使用Mockito进行单元测试
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@ExtendWith(MockitoExtension.class)
public abstract class BaseServiceTest {
    // Service测试的公共配置（纯单元测试，不需要Spring上下文）
}
