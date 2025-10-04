#!/bin/bash

# 设置数据库环境变量
export DB_HOST=pgm-7xvt20kg6zu6e1mmfo.pg.rds.aliyuncs.com
export DB_PORT=5432
export DB_NAME=drmp
export DB_USERNAME=drmp_admin
export DB_PASSWORD=Kob7758258

# 设置JWT密钥
export JWT_SECRET=${JWT_SECRET:-drmp-secret-key-2024-very-long-secret-key-for-jwt-token-generation}
export JWT_EXPIRATION=${JWT_EXPIRATION:-7200000}
export JWT_REFRESH_EXPIRATION=${JWT_REFRESH_EXPIRATION:-604800000}

# 设置加密密钥
export ENCRYPTION_SECRET_KEY=${ENCRYPTION_SECRET_KEY:-drmp-encryption-key-2024-32-bytes-long-key}

# 进入backend目录
cd /Users/apple/Desktop/DRMP/backend

# 启动后端服务
mvn spring-boot:run
