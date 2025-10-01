package com.drmp.config;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base Repository Test Class
 * Repository层测试基类，使用H2内存数据库
 *
 * 注意: 移除了@ContextConfiguration(classes = DrmpApplication.class)
 * 让@DataJpaTest自动配置,只加载JPA相关组件,避免加载完整Spring上下文
 * 这样可以大幅提升测试启动速度,从120秒+降至1-2秒
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
