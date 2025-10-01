package com.drmp.config;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base Repository Test Class
 * Repository层测试基类，使用H2内存数据库
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("test")
public abstract class BaseRepositoryTest {

    @BeforeEach
    public void setUp() {
        // Repository测试的公共设置
    }
}
