package com.drmp.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 环境变量验证器
 * 在应用启动时验证必需的环境变量是否已配置
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class EnvironmentValidator implements ApplicationListener<ApplicationReadyEvent> {

    @Value("${JWT_SECRET:}")
    private String jwtSecret;

    @Value("${ENCRYPTION_SECRET_KEY:}")
    private String encryptionKey;

    @Value("${DB_PASSWORD:}")
    private String dbPassword;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("========== 环境变量验证开始 ==========");

        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // 验证JWT密钥
        if (StringUtils.isBlank(jwtSecret)) {
            errors.add("❌ JWT_SECRET 未配置");
        } else if (jwtSecret.length() < 32) {
            warnings.add("⚠️  JWT_SECRET 长度应至少为32个字符");
        } else {
            log.info("✅ JWT_SECRET 已配置 (长度: {})", jwtSecret.length());
        }

        // 验证加密密钥
        if (StringUtils.isBlank(encryptionKey)) {
            errors.add("❌ ENCRYPTION_SECRET_KEY 未配置");
        } else if (encryptionKey.length() < 32) {
            warnings.add("⚠️  ENCRYPTION_SECRET_KEY 长度应至少为32个字符");
        } else {
            log.info("✅ ENCRYPTION_SECRET_KEY 已配置 (长度: {})", encryptionKey.length());
        }

        // 验证数据库密码
        if (StringUtils.isBlank(dbPassword)) {
            errors.add("❌ DB_PASSWORD 未配置");
        } else {
            log.info("✅ DB_PASSWORD 已配置");
        }

        // 生产环境额外检查
        if ("prod".equals(activeProfile) || "production".equals(activeProfile)) {
            log.info("🔒 检测到生产环境，执行额外安全检查...");

            // 检查是否使用了默认密钥
            if (jwtSecret.contains("drmp2024") || jwtSecret.contains("change_this")) {
                errors.add("❌ 生产环境禁止使用默认JWT密钥");
            }

            if (encryptionKey.contains("drmp2024") || encryptionKey.contains("change_this")) {
                errors.add("❌ 生产环境禁止使用默认加密密钥");
            }

            if ("drmp123456".equals(dbPassword) || "123456".equals(dbPassword)) {
                errors.add("❌ 生产环境禁止使用弱数据库密码");
            }
        }

        // 输出警告
        if (!warnings.isEmpty()) {
            log.warn("========== 环境变量警告 ==========");
            warnings.forEach(log::warn);
        }

        // 输出错误并终止应用
        if (!errors.isEmpty()) {
            log.error("========== 环境变量验证失败 ==========");
            errors.forEach(log::error);
            log.error("==========================================");
            log.error("请在 .env 文件中配置缺失的环境变量");
            log.error("参考文件: backend/.env.example");
            throw new IllegalStateException("必需的环境变量未配置，应用无法启动");
        }

        log.info("========== 环境变量验证通过 ==========");
    }
}
