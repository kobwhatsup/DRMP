package com.drmp.config;

import com.drmp.DrmpApplication;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Base Test Class
 * 所有测试类的基类，提供公共配置
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@SpringBootTest(classes = DrmpApplication.class)
@ActiveProfiles("test")
@Transactional
public abstract class BaseTest {

    @BeforeEach
    public void baseSetUp() {
        // 基础设置，子类可以覆盖
    }
}
